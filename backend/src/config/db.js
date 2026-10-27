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
        ['eps', 'TEXT']
      ].filter(([nombre]) => !existentes.has(nombre));

      const agregarSiguiente = (indice) => {
        if (indice === migraciones.length) {
          resolve(db);
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
