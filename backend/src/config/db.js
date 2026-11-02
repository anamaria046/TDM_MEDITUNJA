import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';

const carpetaModulo = path.dirname(fileURLToPath(import.meta.url));
const rutaBaseDatos = path.resolve(
  process.env.DB_PATH || path.join(carpetaModulo, '../../data/meditunja.db')
);
const rutaEsquema = path.join(carpetaModulo, 'db.sql');

fs.mkdirSync(path.dirname(rutaBaseDatos), { recursive: true });

export const db = new sqlite3.Database(rutaBaseDatos);

function actualizarEsquema() {
  return new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(usuarios)', (error, columnas) => {
      if (error) {
        reject(error);
        return;
      }

      const existentes = new Set(columnas.map((columna) => columna.name));
      const migraciones = [
        ['fecha_nacimiento', 'TEXT'],
        ['sexo', "TEXT CHECK (sexo IS NULL OR sexo IN ('M', 'F', 'O'))"],
        ['eps', 'TEXT'],
        ['rol', "TEXT NOT NULL DEFAULT 'afiliado' CHECK (rol IN ('afiliado', 'administrador'))"]
      ].filter(([nombre]) => !existentes.has(nombre));

      const agregarSiguiente = (indice) => {
        if (indice === migraciones.length) {
          actualizarTipoDocumentoNIT()
            .then(actualizarSolicitudesTunja)
            .then(resolve, reject);
          return;
        }

        const [nombre, definicion] = migraciones[indice];
        db.run(`ALTER TABLE usuarios ADD COLUMN ${nombre} ${definicion}`, (errorMigracion) => {
          if (errorMigracion) {
            reject(errorMigracion);
            return;
          }
          agregarSiguiente(indice + 1);
        });
      };

      agregarSiguiente(0);
    });
  });
}

function actualizarSolicitudesTunja() {
  return new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(usuarios_tunja)', (error, columnas) => {
      if (error) {
        reject(error);
        return;
      }

      const existentes = new Set(columnas.map((columna) => columna.name));
      const migraciones = [
        ['nombres', 'TEXT'],
        ['apellidos', 'TEXT'],
        ['telefono', 'TEXT'],
        ['eps', 'TEXT'],
        ['estado_afiliacion', "TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado_afiliacion IN ('pendiente', 'aprobado', 'rechazado'))"],
        ['comprobante_archivo', 'TEXT'],
        ['comprobante_tipo', 'TEXT'],
        ['comprobante_nombre', 'TEXT']
      ].filter(([nombre]) => !existentes.has(nombre));

      const agregarSiguiente = (indice) => {
        if (indice === migraciones.length) {
          db.run(
            'CREATE INDEX IF NOT EXISTS idx_usuarios_tunja_eps_estado ON usuarios_tunja (eps, estado_afiliacion)',
            (errorIndice) => errorIndice ? reject(errorIndice) : resolve(db)
          );
          return;
        }

        const [nombre, definicion] = migraciones[indice];
        db.run(`ALTER TABLE usuarios_tunja ADD COLUMN ${nombre} ${definicion}`, (errorMigracion) => {
          if (errorMigracion) {
            reject(errorMigracion);
            return;
          }
          agregarSiguiente(indice + 1);
        });
      };

      agregarSiguiente(0);
    });
  });
}

function actualizarTipoDocumentoNIT() {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'usuarios'",
      (error, tabla) => {
        if (error) {
          reject(error);
          return;
        }
        if (/['"]NIT['"]/i.test(tabla?.sql || '')) {
          resolve(db);
          return;
        }

        db.run('PRAGMA foreign_keys = OFF', (errorLlaveForanea) => {
          if (errorLlaveForanea) {
            reject(errorLlaveForanea);
            return;
          }

          db.exec(`
            BEGIN IMMEDIATE;
            CREATE TABLE usuarios_nueva (
              id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
              tipo_documento VARCHAR(10) NOT NULL
                CHECK (tipo_documento IN ('CC', 'TI', 'CE', 'PAS', 'NIT')),
              numero_documento VARCHAR(30) NOT NULL,
              nombres VARCHAR(100) NOT NULL,
              apellidos VARCHAR(100) NOT NULL,
              email VARCHAR(254) NOT NULL UNIQUE,
              telefono VARCHAR(30),
              fecha_nacimiento TEXT,
              sexo TEXT CHECK (sexo IS NULL OR sexo IN ('M', 'F', 'O')),
              eps TEXT,
              rol TEXT NOT NULL DEFAULT 'afiliado'
                CHECK (rol IN ('afiliado', 'administrador')),
              password_hash TEXT NOT NULL CHECK (
                length(password_hash) = 161 AND
                substr(password_hash, 33, 1) = ':' AND
                substr(password_hash, 1, 32) NOT GLOB '*[^a-fA-F0-9]*' AND
                substr(password_hash, 34, 128) NOT GLOB '*[^a-fA-F0-9]*'
              ),
              activo BOOLEAN NOT NULL DEFAULT 0,
              estado_registro VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                CHECK (estado_registro IN ('pendiente', 'aprobado', 'rechazado')),
              fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT uq_usuarios_tipo_numero
                UNIQUE (tipo_documento, numero_documento)
            );
            INSERT INTO usuarios_nueva (
              id_usuario, tipo_documento, numero_documento, nombres, apellidos, email,
              telefono, fecha_nacimiento, sexo, eps, rol, password_hash, activo,
              estado_registro, fecha_registro
            )
            SELECT
              id_usuario, tipo_documento, numero_documento, nombres, apellidos, email,
              telefono, fecha_nacimiento, sexo, eps, rol, password_hash, activo,
              estado_registro, fecha_registro
            FROM usuarios;
            DROP TABLE usuarios;
            ALTER TABLE usuarios_nueva RENAME TO usuarios;
            COMMIT;
          `, (errorMigracion) => {
            if (errorMigracion) {
              db.exec('ROLLBACK', () => {
                db.run('PRAGMA foreign_keys = ON', () => reject(errorMigracion));
              });
              return;
            }

            db.run('PRAGMA foreign_keys = ON', (errorLlaveForanea) => {
              if (errorLlaveForanea) {
                reject(errorLlaveForanea);
                return;
              }
              db.all('PRAGMA foreign_key_check', (errorVerificacion, violaciones) => {
                if (errorVerificacion) {
                  reject(errorVerificacion);
                } else if (violaciones.length > 0) {
                  reject(new Error('La migración de NIT dejó referencias de usuario inválidas.'));
                } else {
                  resolve(db);
                }
              });
            });
          });
        });
      }
    );
  });
}

export const ready = new Promise((resolve, reject) => {
  fs.readFile(rutaEsquema, 'utf8', (errorLectura, esquema) => {
    if (errorLectura) {
      reject(errorLectura);
      return;
    }

    db.exec(esquema, (errorEsquema) => {
      if (errorEsquema) {
        reject(errorEsquema);
        return;
      }
      actualizarEsquema().then(resolve, reject);
    });
  });
});
