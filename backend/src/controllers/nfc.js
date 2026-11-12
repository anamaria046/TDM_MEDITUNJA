import * as tarjetas from '../repositories/tarjetasNfc.js';
import * as sesionesTarjeta from '../repositories/sesionesTarjeta.js';
import { tunjaRequest } from '../services/tunjaApi.js';

function responderError(res, status, error, mensaje) {
  return res.status(status).json({ error, mensaje });
}

function responderFalloTarjeta(res, error) {
  if (error.code === 'SQLITE_CONSTRAINT' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    return responderError(res, 409, 'tarjeta_ya_vinculada', 'Esta tarjeta ya está asociada a otra cuenta.');
  }
  if (error.code === 'TUNJA_KEY_MISSING') {
    return responderError(
      res,
      503,
      'servicio_no_configurado',
      'El servidor no tiene configurada la clave de TunjaAPI.'
    );
  }
  if (error.status === 409) {
    return responderError(res, 409, 'tarjeta_ya_vinculada', 'Esta tarjeta ya está asociada a otra cuenta.');
  }
  if (error.status === 400) {
    return responderError(res, 400, 'tarjeta_rechazada', 'TunjaAPI rechazó los datos de la tarjeta.');
  }
  if (error.status === 401 || error.status === 403) {
    console.error('TunjaAPI rechazó la autorización para gestionar tarjetas:', error.code);
    return responderError(res, 502, 'autorizacion_tunjaapi_rechazada', 'No fue posible autorizar la gestión de la tarjeta.');
  }
  if (error.status === 429) {
    console.error('TunjaAPI limitó la gestión de tarjetas:', error.code);
    return responderError(res, 503, 'tunja_api_limite_alcanzado', 'TunjaAPI está temporalmente limitando las solicitudes.');
  }
  if (error.status === 404) {
    console.error('TunjaAPI no encontró la ruta de gestión de tarjetas:', error.code);
    return responderError(res, 502, 'tunja_api_ruta_no_disponible', 'TunjaAPI no reconoce la operación de tarjetas solicitada.');
  }
  if (error.code === 'TUNJA_API_UNAVAILABLE' ||
      error.code === 'TUNJA_API_INVALID_RESPONSE' ||
      (Number.isInteger(error.status) && error.status >= 500)) {
    console.error('Error de conexión con TunjaAPI para tarjetas:', error.code || error.status);
    return responderError(res, 502, 'tunja_api_no_disponible', 'No fue posible completar la operación con TunjaAPI.');
  }

  console.error('Error interno al gestionar tarjeta NFC:', error.code || 'ERROR_INTERNO');
  return responderError(res, 500, 'error_interno', 'No fue posible completar la operación con la tarjeta.');
}

export async function obtenerTarjeta(req, res) {
  try {
    const tarjeta = await tarjetas.buscarPorUsuario(req.usuarioCitas.id);
    if (!tarjeta) {
      return res.status(200).json({
        data: { vinculada: false, identificador: null, vinculada_en: null }
      });
    }

    let tarjetaTunja;
    try {
      tarjetaTunja = await tunjaRequest(`/cards/${encodeURIComponent(tarjeta.uid)}`, {
        requiresKey: true
      });
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    const usuarioTarjeta = tarjetaTunja?.usuario;
    const asociacionValida = tarjetaTunja?.activa === true &&
      usuarioTarjeta &&
      String(usuarioTarjeta.id) === String(tarjeta.usuario_id) &&
      typeof usuarioTarjeta.email === 'string' &&
      usuarioTarjeta.email.trim().toLowerCase() === tarjeta.email.trim().toLowerCase();
    const estado = !tarjetaTunja
      ? 'no_registrada'
      : tarjetaTunja.activa !== true
        ? 'inactiva'
        : asociacionValida
          ? 'activa'
          : 'asociacion_inconsistente';

    return res.status(200).json({
      data: {
        vinculada: true,
        habilitada: estado === 'activa',
        estado,
        identificador: tarjeta.identificador,
        vinculada_en: tarjeta.vinculada_en
      }
    });
  } catch (error) {
    if (error.code === 'TUNJA_KEY_MISSING' ||
        error.code === 'TUNJA_API_UNAVAILABLE' ||
        error.code === 'TUNJA_API_INVALID_RESPONSE' ||
        Number.isInteger(error.status)) {
      return responderFalloTarjeta(res, error);
    }
    console.error('Error al consultar tarjeta NFC:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar tu tarjeta.');
  }
}

export async function vincularTarjeta(req, res) {
  const uid = typeof req.body?.uid === 'string'
    ? req.body.uid.trim().toUpperCase()
    : '';
  if (!/^(?:[A-F0-9]{2}){2,20}$/.test(uid)) {
    return responderError(res, 400, 'uid_invalido', 'El UID debe contener entre 4 y 40 caracteres hexadecimales.');
  }

  try {
    const existente = await tarjetas.buscarPorUid(uid);
    if (existente && existente.usuario_id !== req.usuarioCitas.id) {
      return responderError(res, 409, 'tarjeta_ya_vinculada', 'Esta tarjeta ya está asociada a otra cuenta.');
    }
    const tarjetaActual = await tarjetas.buscarPorUsuario(req.usuarioCitas.id);

    const usuarioIdTunja = Number(req.usuarioCitas.id);
    if (!Number.isSafeInteger(usuarioIdTunja) || usuarioIdTunja <= 0) {
      return responderError(res, 502, 'perfil_no_disponible', 'TunjaAPI no devolvió un identificador de usuario válido.');
    }

    let tarjetaTunja;
    try {
      tarjetaTunja = await tunjaRequest(`/cards/${encodeURIComponent(uid)}`, { requiresKey: true });
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    if (tarjetaTunja) {
      if (String(tarjetaTunja.usuario?.id) !== String(usuarioIdTunja)) {
        return responderError(res, 409, 'tarjeta_ya_vinculada', 'Esta tarjeta ya está asociada a otra cuenta.');
      }
      if (!tarjetaTunja.activa) {
        tarjetaTunja = await tunjaRequest(`/cards/${encodeURIComponent(uid)}`, {
          method: 'PATCH',
          requiresKey: true,
          body: { activa: true }
        });
      }
    } else {
      tarjetaTunja = await tunjaRequest('/cards', {
        method: 'POST',
        requiresKey: true,
        body: { uid, usuario_id: usuarioIdTunja }
      });
    }

    if (String(tarjetaTunja?.usuario?.id) !== String(usuarioIdTunja)) {
      return responderError(res, 502, 'tarjeta_no_verificada', 'TunjaAPI no confirmó la asociación de la tarjeta con tu cuenta.');
    }

    if (tarjetaActual && tarjetaActual.uid !== uid) {
      await sesionesTarjeta.revocarPorUsuario(req.usuarioCitas.id, Date.now());
    }
    await tarjetas.vincular(req.usuarioCitas.id, req.usuarioCitas.email, uid);
    return res.status(200).json({
      mensaje: 'Tarjeta vinculada a tu cuenta.',
      data: { vinculada: true, identificador: uid.slice(-4) }
    });
  } catch (error) {
    return responderFalloTarjeta(res, error);
  }
}

export async function desvincularTarjeta(req, res) {
  try {
    const tarjeta = await tarjetas.buscarPorUsuario(req.usuarioCitas.id);
    if (!tarjeta) {
      return responderError(res, 404, 'tarjeta_no_encontrada', 'No hay una tarjeta vinculada a esta cuenta.');
    }

    try {
      await tunjaRequest(`/cards/${encodeURIComponent(tarjeta.uid)}`, {
        method: 'DELETE',
        requiresKey: true
      });
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    await sesionesTarjeta.revocarPorUsuario(req.usuarioCitas.id, Date.now());
    const resultado = await tarjetas.desvincular(req.usuarioCitas.id);
    if (resultado.changes === 0) {
      return responderError(res, 404, 'tarjeta_no_encontrada', 'No hay una tarjeta vinculada a esta cuenta.');
    }
    return res.status(200).json({ mensaje: 'Tarjeta desvinculada.' });
  } catch (error) {
    return responderFalloTarjeta(res, error);
  }
}
