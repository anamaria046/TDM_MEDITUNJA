import { ejecutar } from './sqlite.js';

export async function buscarPorDocumento(tipoDocumento, numeroDocumento) {
  return ejecutar(
    'get',
    `SELECT email, tipo_documento, numero_documento, nombres, apellidos, telefono, eps,
            estado_afiliacion
     FROM usuarios_tunja
     WHERE tipo_documento = ? AND numero_documento = ?`,
    [tipoDocumento, numeroDocumento]
  );
}

export async function buscarPorEmail(email) {
  return ejecutar(
    'get',
    `SELECT email, tipo_documento, numero_documento, nombres, apellidos, telefono, eps,
            estado_afiliacion
     FROM usuarios_tunja
     WHERE lower(email) = lower(?)`,
    [email]
  );
}

export async function registrar(datos) {
  const existente = await buscarPorDocumento(datos.tipo_documento, datos.numero_documento);
  if (existente) {
    if (existente.email.toLowerCase() !== datos.email.toLowerCase()) {
      const error = new Error('El documento ya está asociado a otro correo.');
      error.code = 'TUNJA_DOCUMENTO_DUPLICADO';
      throw error;
    }
    return;
  }

  await ejecutar(
    'run',
    `INSERT INTO usuarios_tunja (
       tipo_documento, numero_documento, email, nombres, apellidos, telefono, eps,
       estado_afiliacion, comprobante_archivo, comprobante_tipo, comprobante_nombre
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?, ?)`,
    [
      datos.tipo_documento,
      datos.numero_documento,
      datos.email.toLowerCase(),
      datos.nombres,
      datos.apellidos,
      datos.telefono,
      datos.eps,
      datos.comprobante_archivo,
      datos.comprobante_tipo,
      datos.comprobante_nombre
    ]
  );
}

export async function listarSolicitudesPorEps(eps) {
  return ejecutar(
    'all',
    `SELECT tipo_documento, numero_documento, email, nombres, apellidos, telefono, eps,
            estado_afiliacion, comprobante_tipo, comprobante_nombre, fecha_registro
     FROM usuarios_tunja
     WHERE lower(eps) = lower(?)
     ORDER BY CASE estado_afiliacion WHEN 'pendiente' THEN 0 ELSE 1 END,
              fecha_registro DESC`,
    [eps]
  );
}

export async function buscarSolicitud(tipoDocumento, numeroDocumento, eps) {
  return ejecutar(
    'get',
    `SELECT tipo_documento, numero_documento, email, nombres, apellidos, eps,
            estado_afiliacion, comprobante_archivo, comprobante_tipo,
            comprobante_nombre
     FROM usuarios_tunja
     WHERE tipo_documento = ? AND numero_documento = ? AND lower(eps) = lower(?)`,
    [tipoDocumento, numeroDocumento, eps]
  );
}

export async function actualizarEstadoSolicitud(tipoDocumento, numeroDocumento, eps, estado) {
  return ejecutar(
    'run',
    `UPDATE usuarios_tunja
     SET estado_afiliacion = ?,
         comprobante_archivo = CASE WHEN ? = 'aprobado' THEN NULL ELSE comprobante_archivo END,
         comprobante_tipo = CASE WHEN ? = 'aprobado' THEN NULL ELSE comprobante_tipo END,
         comprobante_nombre = CASE WHEN ? = 'aprobado' THEN NULL ELSE comprobante_nombre END
     WHERE tipo_documento = ? AND numero_documento = ? AND lower(eps) = lower(?)`,
    [estado, estado, estado, estado, tipoDocumento, numeroDocumento, eps]
  );
}
