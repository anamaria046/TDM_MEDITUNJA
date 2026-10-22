import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const carpeta = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'logs');
const archivo = path.join(carpeta, 'app.log');

export function escribirLog(usuario, accion, resultado) {
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }
  const linea = new Date().toISOString() + ' | ' + usuario + ' | ' + accion + ' | ' + resultado + '\n';
  fs.appendFileSync(archivo, linea);
}

export function logger(req, res, next) {
  res.on('finish', () => {
    const usuario = req.usuario && req.usuario.id ? req.usuario.id : 'anonimo';
    const accion = req.method + ' ' + req.originalUrl;
    let resultado = 'exitoso ' + res.statusCode;
    if (res.statusCode >= 400) {
      resultado = 'fallido ' + res.statusCode;
      if (res.locals.error) {
        resultado = resultado + ': ' + res.locals.error;
      }
    }
    escribirLog(usuario, accion, resultado);
  });
  next();
}