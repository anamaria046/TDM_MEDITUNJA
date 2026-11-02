export function exigirAdministrador(req, res, next) {
  if (req.usuario?.rol !== 'administrador') {
    return res.status(403).json({
      error: 'Acceso denegado',
      mensaje: 'Se requieren permisos de administrador.'
    });
  }

  if (typeof req.usuario.eps !== 'string' || !req.usuario.eps.trim()) {
    return res.status(403).json({
      error: 'EPS no asignada',
      mensaje: 'La cuenta administradora debe tener una EPS asignada.'
    });
  }

  return next();
}
