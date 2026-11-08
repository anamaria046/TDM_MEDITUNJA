import * as tarjetas from '../repositories/tarjetasNfc.js';
import { estadoLector, leerUid } from '../services/lectorNfc.js';

function responderError(res, status, error, mensaje) {
  return res.status(status).json({ error, mensaje });
}

function responderErrorLector(res, error) {
  const estado = {
    NFC_READER_NOT_FOUND: 503,
    NFC_PCSC_UNAVAILABLE: 503,
    NFC_DRIVER_UNAVAILABLE: 503,
    NFC_SCAN_IN_PROGRESS: 409,
    NFC_SCAN_TIMEOUT: 408,
    NFC_READ_FAILED: 502,
    NFC_READER_DISCONNECTED: 503,
    NFC_UID_INVALID: 502
  }[error.code] || 500;
  if (estado >= 500) console.error('Error al leer tarjeta NFC:', error.code || 'ERROR_INTERNO');
  return responderError(res, estado, error.code || 'nfc_no_disponible', error.message);
}

export async function obtenerTarjeta(req, res) {
  try {
    const tarjeta = await tarjetas.buscarPorUsuario(req.usuarioCitas.id);
    return res.status(200).json({
      data: tarjeta
        ? { vinculada: true, identificador: tarjeta.identificador, vinculada_en: tarjeta.vinculada_en }
        : { vinculada: false, identificador: null, vinculada_en: null }
    });
  } catch (error) {
    console.error('Error al consultar tarjeta NFC:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar tu tarjeta.');
  }
}

export async function leerYVincularTarjeta(req, res) {
  try {
    const uid = await leerUid();
    const existente = await tarjetas.buscarPorUid(uid);
    if (existente && existente.usuario_id !== req.usuarioCitas.id) {
      return responderError(res, 409, 'tarjeta_ya_vinculada', 'Esta tarjeta ya está asociada a otra cuenta.');
    }

    await tarjetas.vincular(req.usuarioCitas.id, req.usuarioCitas.email, uid);
    return res.status(200).json({
      mensaje: 'Tarjeta leída y vinculada a tu cuenta.',
      data: { vinculada: true, identificador: uid.slice(-4) }
    });
  } catch (error) {
    if (error.code?.startsWith('NFC_')) return responderErrorLector(res, error);
    if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return responderError(res, 409, 'tarjeta_ya_vinculada', 'Esta tarjeta ya está asociada a otra cuenta.');
    }
    console.error('Error al vincular tarjeta NFC:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible vincular la tarjeta.');
  }
}

export async function desvincularTarjeta(req, res) {
  try {
    const resultado = await tarjetas.desvincular(req.usuarioCitas.id);
    if (resultado.changes === 0) {
      return responderError(res, 404, 'tarjeta_no_encontrada', 'No hay una tarjeta vinculada a esta cuenta.');
    }
    return res.status(200).json({ mensaje: 'Tarjeta desvinculada.' });
  } catch (error) {
    console.error('Error al desvincular tarjeta NFC:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible desvincular la tarjeta.');
  }
}

export function obtenerEstadoLector(req, res) {
  return res.status(200).json({ data: estadoLector() });
}
