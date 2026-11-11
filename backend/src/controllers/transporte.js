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
