import { ejecutar } from '../repositories/sqlite.js';

const discapacidadesPermitidas = new Set([
  'motora-silla-ruedas',
  'motora-andador',
  'visual',
  'auditiva',
  'cognitiva',
  'multiple',
  'adulto-mayor',
  'dialisis-oncologia'
]);
const requerimientosPermitidos = new Set([
  'rampa',
  'anclaje',
  'piso-bajo',
  'oxigeno',
  'perro-guia',
  'camilla'
]);
const modalidadesPermitidas = new Set(['ida-y-regreso', 'solo-ida', 'solo-regreso']);

function responderError(res, status, error, mensaje) {
  return res.status(status).json({ error, mensaje });
}

function textoValido(valor, minimo, maximo) {
  return typeof valor === 'string' &&
    valor.trim().length >= minimo &&
    valor.trim().length <= maximo;
}

export async function listarSolicitudesTransporte(req, res) {
  try {
    const data = await ejecutar(
      'all',
      `SELECT t.id_solicitud AS id, t.cita_id, t.estado, t.creada_en,
              c.codigo_cita, c.ips, c.especialidad, c.fecha, c.hora
       FROM solicitudes_transporte t
       JOIN citas c ON c.id_cita = t.cita_id
       WHERE t.usuario_id = ?
       ORDER BY t.creada_en DESC`,
      [req.usuarioCitas.id]
    );
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar solicitudes de transporte:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar tus solicitudes de transporte.');
  }
}

export async function crearSolicitudTransporte(req, res) {
  const {
    citaId,
    tipoDiscapacidad,
    requerimientos,
    viajaAcompanante,
    nombreAcompanante,
    direccionOrigen,
    barrioSector,
    puntosReferencia,
    modalidadViaje,
    declaracionVeracidad
  } = req.body || {};

  if (!Number.isSafeInteger(citaId) || citaId < 1 ||
      !discapacidadesPermitidas.has(tipoDiscapacidad) ||
      !Array.isArray(requerimientos) || requerimientos.length > requerimientosPermitidos.size ||
      !requerimientos.every((id) => requerimientosPermitidos.has(id)) ||
      new Set(requerimientos).size !== requerimientos.length ||
      typeof viajaAcompanante !== 'boolean' ||
      (viajaAcompanante && !textoValido(nombreAcompanante, 2, 120)) ||
      !textoValido(direccionOrigen, 5, 240) ||
      !textoValido(barrioSector, 2, 120) ||
      (puntosReferencia != null && !textoValido(puntosReferencia, 0, 500)) ||
      !modalidadesPermitidas.has(modalidadViaje) ||
      declaracionVeracidad !== true) {
    return responderError(res, 400, 'datos_invalidos', 'Revisa los datos de transporte y acepta la declaración de veracidad.');
  }

  try {
    const cita = await ejecutar(
      'get',
      `SELECT id_cita FROM citas
       WHERE id_cita = ? AND usuario_id = ? AND estado = 'confirmada'`,
      [citaId, req.usuarioCitas.id]
    );
    if (!cita) {
      return responderError(res, 404, 'cita_no_encontrada', 'Selecciona una cita confirmada de tu cuenta.');
    }

    const { lastID } = await ejecutar(
      'run',
      `INSERT INTO solicitudes_transporte (
         usuario_id, cita_id, tipo_discapacidad, requerimientos,
         viaja_acompanante, nombre_acompanante, direccion_origen,
         barrio_sector, puntos_referencia, modalidad_viaje
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.usuarioCitas.id,
        citaId,
        tipoDiscapacidad,
        JSON.stringify(requerimientos),
        viajaAcompanante ? 1 : 0,
        viajaAcompanante ? nombreAcompanante.trim() : null,
        direccionOrigen.trim(),
        barrioSector.trim(),
        typeof puntosReferencia === 'string' && puntosReferencia.trim()
          ? puntosReferencia.trim()
          : null,
        modalidadViaje
      ]
    );
    return res.status(201).json({
      mensaje: 'Solicitud de transporte registrada. La coordinación debe confirmar su disponibilidad.',
      data: { id: lastID, estado: 'solicitada', citaId }
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        (error.code === 'SQLITE_CONSTRAINT' &&
          /UNIQUE constraint failed: solicitudes_transporte\.cita_id/.test(error.message))) {
      return responderError(res, 409, 'transporte_duplicado', 'Ya existe una solicitud de transporte para esta cita.');
    }
    console.error('Error al crear solicitud de transporte:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible registrar la solicitud de transporte.');
  }
}

export async function listarSolicitudesTransporteAdministrador(req, res) {
  try {
    const data = await ejecutar(
      'all',
      `SELECT t.id_solicitud AS id, t.estado, t.creada_en,
              t.tipo_discapacidad, t.requerimientos, t.viaja_acompanante,
              t.nombre_acompanante, t.direccion_origen, t.barrio_sector,
              t.puntos_referencia, t.modalidad_viaje,
              c.codigo_cita, c.ips, c.especialidad, c.fecha, c.hora,
              u.tipo_documento, u.numero_documento, u.email,
              trim(coalesce(u.nombres, '') || ' ' || coalesce(u.apellidos, '')) AS paciente
       FROM solicitudes_transporte t
       JOIN citas c ON c.id_cita = t.cita_id
       JOIN usuarios_tunja u ON u.tunja_usuario_id = t.usuario_id
       WHERE lower(trim(u.eps)) = lower(trim(?))
          OR lower(trim(u.eps)) = lower('EPS ' || trim(?))
          OR lower(trim(replace(lower(u.eps), 'eps ', ''))) =
             lower(trim(replace(lower(?), 'eps ', '')))
       ORDER BY t.creada_en DESC`,
      [req.usuario.eps, req.usuario.eps, req.usuario.eps]
    );
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar solicitudes administrativas de transporte:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar las solicitudes de transporte.');
  }
}

export async function actualizarEstadoSolicitudTransporteAdministrador(req, res) {
  const id = Number(req.params.id);
  const { estado } = req.body || {};
  if (!Number.isSafeInteger(id) || id < 1 ||
      !['aceptada', 'rechazada'].includes(estado)) {
    return responderError(res, 400, 'datos_invalidos', 'El identificador o estado de la solicitud no es válido.');
  }

  try {
    const solicitud = await ejecutar(
      'get',
      `SELECT t.id_solicitud
       FROM solicitudes_transporte t
       JOIN usuarios_tunja u ON u.tunja_usuario_id = t.usuario_id
       WHERE t.id_solicitud = ?
         AND (
           lower(trim(u.eps)) = lower(trim(?))
           OR lower(trim(u.eps)) = lower('EPS ' || trim(?))
           OR lower(trim(replace(lower(u.eps), 'eps ', ''))) =
              lower(trim(replace(lower(?), 'eps ', '')))
         )`,
      [id, req.usuario.eps, req.usuario.eps, req.usuario.eps]
    );
    if (!solicitud) {
      return responderError(res, 404, 'solicitud_no_encontrada', 'No se encontró la solicitud de transporte para esta EPS.');
    }

    const resultado = await ejecutar(
      'run',
      `UPDATE solicitudes_transporte
       SET estado = ?
       WHERE id_solicitud = ? AND estado = 'solicitada'
         AND EXISTS (
           SELECT 1
           FROM usuarios_tunja u
           WHERE u.tunja_usuario_id = solicitudes_transporte.usuario_id
             AND (
               lower(trim(u.eps)) = lower(trim(?))
               OR lower(trim(u.eps)) = lower('EPS ' || trim(?))
               OR lower(trim(replace(lower(u.eps), 'eps ', ''))) =
                  lower(trim(replace(lower(?), 'eps ', '')))
             )
         )`,
      [estado, id, req.usuario.eps, req.usuario.eps, req.usuario.eps]
    );
    if (resultado.changes !== 1) {
      return responderError(res, 409, 'solicitud_ya_resuelta', 'La solicitud ya fue aceptada o rechazada.');
    }
    return res.status(200).json({
      mensaje: `Solicitud de transporte ${estado}.`,
      data: { id, estado }
    });
  } catch (error) {
    console.error('Error al actualizar solicitud administrativa de transporte:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible actualizar la solicitud de transporte.');
  }
}
