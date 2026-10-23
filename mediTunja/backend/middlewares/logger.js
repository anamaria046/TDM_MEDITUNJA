import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const carpeta = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'logs');
const archivo = process.env.LOG_PATH || path.join(carpeta, 'app.log');

export function escribirLog(usuario, accion, resultado) {
  if (!fs.existsSync(carpeta)) {
    fs.mkdirSync(carpeta, { recursive: true });
  }
  const linea = new Date().toISOString() + ' | ' + usuario + ' | ' + accion + ' | ' + resultado + '\n';
  fs.appendFileSync(archivo, linea);
}

export function logger(req, res, next) {
  res.on('finish', () => {
    const usuario = req.usuario && req.usuario.id_usuario ? req.usuario.id_usuario : 'anonimo';
    const accion = req.method + ' ' + new URL(req.originalUrl, 'http://localhost').pathname;
    const resultado = (res.statusCode >= 400 ? 'fallido ' : 'exitoso ') + res.statusCode;
    escribirLog(usuario, accion, resultado);
  });
  next();
}