import crypto from 'node:crypto';
import { promisify } from 'node:util';
import * as usuarios from '../repositories/usuarios.js';
import * as sesiones from '../repositories/sesiones.js';

const scrypt = promisify(crypto.scrypt);
const tiposDocumentoPermitidos = new Set(['CC', 'TI', 'CE', 'PAS']);
const duracionSesionMs = 30 * 60 * 1000;

const responderError = (res, status, error, mensaje) =>
  res.status(status).json({ error, mensaje });

async function verificarContrasena(contrasena, passwordHash) {
  if (typeof passwordHash !== 'string') return false;
  const [sal, hashGuardado, ...resto] = passwordHash.split(':');
  if (!sal || !/^[a-f0-9]{32}$/i.test(sal) ||
      !hashGuardado || !/^[a-f0-9]{128}$/i.test(hashGuardado) || resto.length > 0) {
    return false;
  }

  const hashIngresado = await scrypt(contrasena, sal, 64);
  return crypto.timingSafeEqual(hashIngresado, Buffer.from(hashGuardado, 'hex'));
}

export async function iniciarSesion(req, res) {
  const { tipo_documento, numero_documento, contrasena } = req.body || {};
  if (typeof tipo_documento !== 'string' ||
      typeof numero_documento !== 'string' ||
      typeof contrasena !== 'string' ||
      !tipo_documento.trim() ||
      !numero_documento.trim() ||
      !contrasena.length ||
      numero_documento.trim().length > 30 ||
      contrasena.length > 128) {
    return responderError(
      res,
      400,
      'Datos inválidos',
      'Envía tipo_documento, numero_documento y contrasena válidos.'
    );
  }

  const tipoDocumento = tipo_documento.trim().toUpperCase();
  const numeroDocumento = numero_documento.trim();
  if (!tiposDocumentoPermitidos.has(tipoDocumento) ||
      !/^[A-Za-z0-9.-]{4,30}$/.test(numeroDocumento)) {
    return responderError(res, 400, 'Datos inválidos', 'Revisa el tipo y número de documento.');
  }

  try {
    const usuario = await usuarios.buscarCredenciales(tipoDocumento, numeroDocumento);
    if (!usuario || !(await verificarContrasena(contrasena, usuario.password_hash))) {
      return responderError(
        res,
        401,
        'Credenciales incorrectas',
        'El tipo, número de documento o contraseña no son correctos.'
      );
    }

    if (usuario.estado_registro === 'pendiente') {
      return responderError(res, 403, 'Cuenta pendiente', 'Tu solicitud de registro está pendiente de aprobación.');
    }
    if (usuario.estado_registro === 'rechazado') {
      return responderError(
        res,
        403,
        'Cuenta rechazada',
        'Tu solicitud de registro fue rechazada. Contacta al administrador para más información.'
      );
    }
    if (usuario.estado_registro !== 'aprobado') {
      return responderError(res, 403, 'Cuenta no disponible', 'La cuenta no está habilitada para iniciar sesión.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const ahora = Date.now();
    const expiraEn = ahora + duracionSesionMs;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await sesiones.crear(usuario.id_usuario, tokenHash, ahora, expiraEn);

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      tipo_token: 'Bearer',
      expira_en: new Date(expiraEn).toISOString(),
      expira_en_segundos: duracionSesionMs / 1000,
      data: {
        id_usuario: usuario.id_usuario,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        tipo_documento: usuario.tipo_documento,
        numero_documento: usuario.numero_documento,
        estado_registro: usuario.estado_registro
      }
    });
  } catch (error) {
    console.error('Error en POST /api/login:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'Ocurrió un error al iniciar sesión.');
  }
}
