import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sqlite3 from 'sqlite3';
import test from 'node:test';

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'meditunja-migration-'));
const rutaBaseDatos = path.join(carpetaTemporal, 'legacy.db');
process.env.DB_PATH = rutaBaseDatos;

function ejecutar(db, metodo, sql, parametros = []) {
  return new Promise((resolve, reject) => {
    if (metodo === 'exec') {
      db.exec(sql, (error) => error ? reject(error) : resolve(null));
      return;
    }
    db[metodo](sql, parametros, function (error, resultado) {
      if (error) {
        reject(error);
        return;
      }
      resolve(metodo === 'run' ? { lastID: this.lastID } : resultado);
    });
  });
}

test('la migración agrega NIT y conserva usuarios y sesiones existentes', async () => {
  let baseAnterior;
  let baseMigrada;
  try {
    const rutaEsquema = fileURLToPath(new URL('../src/config/db.sql', import.meta.url));
    const esquemaAnterior = fs.readFileSync(rutaEsquema, 'utf8')
      .replace("('CC', 'TI', 'CE', 'PAS', 'NIT')", "('CC', 'TI', 'CE', 'PAS')")
      .replace(
        /CREATE TABLE IF NOT EXISTS usuarios_tunja \([\s\S]*?\);/,
        `CREATE TABLE IF NOT EXISTS usuarios_tunja (
          tipo_documento VARCHAR(10) NOT NULL,
          numero_documento VARCHAR(30) NOT NULL,
          email VARCHAR(254) NOT NULL,
          fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (tipo_documento, numero_documento)
        );`
      );

    baseAnterior = new sqlite3.Database(rutaBaseDatos);
    await ejecutar(baseAnterior, 'exec', esquemaAnterior);
    const usuario = await ejecutar(
      baseAnterior,
      'run',
      `INSERT INTO usuarios (
        tipo_documento, numero_documento, nombres, apellidos, email, password_hash,
        estado_registro
      ) VALUES ('CC', '12345678', 'Ana', 'Prueba', 'ana@example.test', ?, 'aprobado')`,
      [`${'a'.repeat(32)}:${'b'.repeat(128)}`]
    );
    await ejecutar(
      baseAnterior,
      'run',
      `INSERT INTO sesiones (id_usuario, token_hash, creada_en, ultima_actividad, expira_en)
       VALUES (?, 'token-hash', 1, 1, 9999999999999)`,
      [usuario.lastID]
    );
    await new Promise((resolve, reject) => {
      baseAnterior.close((error) => error ? reject(error) : resolve());
    });
    baseAnterior = null;

    const { db, ready } = await import('../src/config/db.js');
    await ready;
    baseMigrada = db;

    const guardado = await ejecutar(
      baseMigrada,
      'get',
      'SELECT tipo_documento, numero_documento FROM usuarios WHERE id_usuario = ?',
      [usuario.lastID]
    );
    assert.deepEqual(guardado, { tipo_documento: 'CC', numero_documento: '12345678' });

    const sesion = await ejecutar(
      baseMigrada,
      'get',
      'SELECT id_usuario FROM sesiones WHERE token_hash = ?',
      ['token-hash']
    );
    assert.equal(sesion.id_usuario, usuario.lastID);

    await ejecutar(
      baseMigrada,
      'run',
      `INSERT INTO usuarios (
        tipo_documento, numero_documento, nombres, apellidos, email, password_hash,
        rol, eps, estado_registro
      ) VALUES ('NIT', '900156264-2', 'Nueva EPS', 'Administración',
        'admin@meditunja.invalid', ?, 'administrador', 'Nueva EPS', 'aprobado')`,
      [`${'c'.repeat(32)}:${'d'.repeat(128)}`]
    );
    const violaciones = await ejecutar(baseMigrada, 'all', 'PRAGMA foreign_key_check');
    assert.deepEqual(violaciones, []);
    const columnasSolicitud = await ejecutar(baseMigrada, 'all', 'PRAGMA table_info(usuarios_tunja)');
    assert.ok(columnasSolicitud.some(({ name }) => name === 'estado_afiliacion'));
    assert.ok(columnasSolicitud.some(({ name }) => name === 'telefono'));
    assert.ok(columnasSolicitud.some(({ name }) => name === 'comprobante_archivo'));
  } finally {
    if (baseAnterior) {
      await new Promise((resolve) => baseAnterior.close(resolve));
    }
    if (baseMigrada) {
      await new Promise((resolve) => baseMigrada.close(resolve));
    }
    fs.rmSync(carpetaTemporal, { recursive: true, force: true });
  }
});
