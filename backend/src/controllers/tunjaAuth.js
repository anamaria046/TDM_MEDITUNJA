import { tunjaRequest } from '../services/tunjaApi.js';

const perfilesPermitidos = new Set(['general', 'estudiante', 'adulto_mayor', 'empleado']);
const responderError = (res, status, error, mensaje) =>
  res.status(status).json({ error, mensaje });

function responderFalloTunja(res, error) {
  if (error.code === 'TUNJA_KEY_MISSING') {
    return responderError(
      res,
      503,
      'servicio_no_configurado',
      'El servidor no tiene configurada la clave de TunjaAPI.'
    );
  }
  if (error.code === 'TUNJA_API_UNAVAILABLE' || error.code === 'TUNJA_API_INVALID_RESPONSE') {
    console.error('Error de conexión con TunjaAPI:', error.code);
    return responderError(res, 502, 'tunja_api_no_disponible', error.message);
  }
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({
      error: error.code,
      mensaje: error.message,
      ...(error.payload.reintentar_en === undefined
        ? {}
        : { reintentar_en: error.payload.reintentar_en }),
      ...(error.payload.datos === undefined ? {} : { datos: error.payload.datos })
    });
  }

  console.error('Error inesperado en proxy TunjaAPI:', error.code || 'ERROR_INTERNO');
  return responderError(res, 502, 'tunja_api_no_disponible', 'No fue posible completar la solicitud.');
}

export async function registrarEnTunja(req, res) {
  const { email, contrasena, nombre, documento, perfil = 'general', descuento = 0 } = req.body || {};

  if (typeof email !== 'string' || typeof contrasena !== 'string' ||
      typeof nombre !== 'string' || typeof documento !== 'string' ||
      !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      contrasena.length < 8 || contrasena.length > 128 ||
      nombre.trim().length < 2 || nombre.trim().length > 100 ||
      documento.trim().length === 0 || documento.trim().length > 40 ||
      typeof perfil !== 'string' || !perfilesPermitidos.has(perfil) ||
      !Number.isInteger(descuento) || descuento < 0 || descuento > 100) {
    return responderError(res, 400, 'datos_invalidos', 'Revisa nombre, documento, email, perfil y contraseña.');
  }

  try {
    const resultado = await tunjaRequest('/auth/register', {
      method: 'POST',
      requiresKey: true,
      body: {
        email: email.trim().toLowerCase(),
        contrasena,
        nombre: nombre.trim(),
        documento: documento.trim(),
        perfil,
        descuento
      }
    });
    return res.status(201).json(resultado);
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}

export async function iniciarSesionTunja(req, res) {
  const { email, contrasena } = req.body || {};
  if (typeof email !== 'string' || typeof contrasena !== 'string' ||
      !email.trim() || email.length > 254 || !contrasena.length || contrasena.length > 128) {
    return responderError(res, 400, 'datos_invalidos', 'Ingresa un email y una contraseña válidos.');
  }

  try {
    const resultado = await tunjaRequest('/auth/login', {
      method: 'POST',
      body: { email: email.trim().toLowerCase(), contrasena }
    });
    return res.status(200).json(resultado);
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}

export async function renovarSesionTunja(req, res) {
  const { refresco } = req.body || {};
  if (typeof refresco !== 'string' || !refresco) {
    return responderError(res, 400, 'datos_invalidos', 'Se requiere un token de refresco válido.');
  }

  try {
    const resultado = await tunjaRequest('/auth/refresh', {
      method: 'POST',
      body: { refresco }
    });
    return res.status(200).json(resultado);
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}

export async function cerrarSesionTunja(req, res) {
  const { refresco } = req.body || {};
  if (typeof refresco !== 'string' || !refresco) {
    return responderError(res, 400, 'datos_invalidos', 'Se requiere un token de refresco válido.');
  }

  try {
    await tunjaRequest('/auth/logout', {
      method: 'POST',
      body: { refresco }
    });
    return res.status(204).end();
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}

export async function obtenerUsuarioTunja(req, res) {
  const autorizacion = req.get('authorization') || '';
  const coincidencia = /^Bearer\s+(\S+)$/i.exec(autorizacion);
  if (!coincidencia) {
    return responderError(res, 401, 'token_requerido', 'Inicia sesión para continuar.');
  }

  try {
    const resultado = await tunjaRequest('/auth/me', { accessToken: coincidencia[1] });
    return res.status(200).json(resultado);
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}
