import { db, ready } from '../config/db.js';

export async function ejecutar(metodo, sql, parametros = []) {
  await ready;
  return new Promise((resolve, reject) => {
    db[metodo](sql, parametros, function (error, resultado) {
      if (error) {
        reject(error);
        return;
      }
      resolve(metodo === 'run'
        ? { changes: this.changes, lastID: this.lastID }
        : resultado);
    });
  });
}
