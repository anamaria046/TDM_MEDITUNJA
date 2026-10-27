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
      resolve(db);
    });
  });
});
