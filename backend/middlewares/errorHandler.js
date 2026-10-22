export function rutaNoEncontrada(req, res, next) {
  res.status(404).json({ ok: false, mensaje: 'La ruta que buscas no existe' });
}

export function manejarErrores(err, req, res, next) {
  let estado = err.status || 500;
  let mensaje = err.message;

  if (err.type === 'entity.parse.failed') {
    estado = 400;
    mensaje = 'El formato de los datos enviados no es válido';
  }

  if (estado === 500) {
    mensaje = 'Ocurrió un error en el servidor, intenta de nuevo más tarde';
  }

  res.locals.error = err.message;
  res.status(estado).json({ ok: false, mensaje: mensaje });
}