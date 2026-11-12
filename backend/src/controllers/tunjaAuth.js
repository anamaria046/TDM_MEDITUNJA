import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { administradoresEps } from '../config/administradoresEps.js';
import { tunjaRequest } from '../services/tunjaApi.js';
import * as usuariosTunja from '../repositories/usuariosTunja.js';
import * as tarjetasNfc from '../repositories/tarjetasNfc.js';
import * as sesionesTarjeta from '../repositories/sesionesTarjeta.js';

const perfilesPermitidos = new Set(['general', 'estudiante', 'adulto_mayor', 'empleado']);
const tiposDocumentoPermitidos = new Set(['CC', 'TI', 'CE', 'PAS']);
const epsPermitidas = administradoresEps.map(({ eps }) => eps);
const carpetaComprobantes = path.resolve(
  process.env.DB_PATH
    ? path.join(path.dirname(path.resolve(process.env.DB_PATH)), 'afiliaciones-privadas')
    : path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/afiliaciones-privadas')
);
const duracionSesionTarjetaMs = 15 * 60 * 1000;
const responderError = (res, status, error, mensaje) =>
  res.status(status).json({ error, mensaje });

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function crearUsuarioSesionTarjeta(sesion) {
  return {
    id: /^\d+$/.test(sesion.usuario_id) ? Number(sesion.usuario_id) : sesion.usuario_id,
    email: sesion.email,
    nombre: [sesion.nombres, sesion.apellidos].filter(Boolean).join(' ') || sesion.email,
    nombres: sesion.nombres,
    apellidos: sesion.apellidos,
    tipo_documento: sesion.tipo_documento,
    numero_documento: sesion.numero_documento,
    telefono: sesion.telefono,
    eps: sesion.eps,
    estado_afiliacion: sesion.estado_afiliacion || 'pendiente',
    perfil: sesion.perfil,
    descuento: sesion.descuento
  };
}

function crearTokensSesionTarjeta() {
  return {
    acceso: crypto.randomBytes(32).toString('hex'),
    refresco: crypto.randomBytes(32).toString('hex')
  };
}

function responderSesionTarjeta(res, usuario, tokens) {
  return res.status(200).json({
    usuario: crearUsuarioSesionTarjeta(usuario),
    acceso: tokens.acceso,
    refresco: tokens.refresco,
    expira_en: duracionSesionTarjetaMs / 1000
  });
}

function extensionComprobante(archivo) {
  const { buffer, mimetype } = archivo;
  if (mimetype === 'application/pdf' &&
      buffer.subarray(0, 5).toString('ascii') === '%PDF-') return '.pdf';
  if (mimetype === 'image/png' &&
      buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return '.png';
  if (mimetype === 'image/jpeg' &&
      buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg';
  return null;
}

function respuestaConEstado(respuesta, solicitud) {
  if (!respuesta || typeof respuesta !== 'object') return respuesta;
  const usuarioAnidado = respuesta.usuario && typeof respuesta.usuario === 'object';
  const usuario = usuarioAnidado ? respuesta.usuario : respuesta;
  const usuarioConEstado = {
    ...usuario,
    estado_afiliacion: solicitud?.estado_afiliacion || 'pendiente',
    eps: solicitud?.eps || null,
    telefono: solicitud?.telefono || usuario.telefono || null,
    nombres: solicitud?.nombres || usuario.nombres || null,
    apellidos: solicitud?.apellidos || usuario.apellidos || null,
    tipo_documento: solicitud?.tipo_documento || usuario.tipo_documento || null,
    numero_documento: solicitud?.numero_documento || usuario.numero_documento || null
  };
  return {
    ...respuesta,
    ...(usuarioAnidado ? { usuario: usuarioConEstado } : usuarioConEstado)
  };
}

async function buscarSolicitudDeRespuesta(respuesta) {
  const usuario = respuesta?.usuario && typeof respuesta.usuario === 'object'
    ? respuesta.usuario
    : respuesta;
  if (typeof usuario?.email === 'string') {
    return usuariosTunja.buscarPorEmail(usuario.email);
  }
  if (typeof usuario?.tipo_documento === 'string' &&
      typeof usuario?.numero_documento === 'string') {
    return usuariosTunja.buscarPorDocumento(usuario.tipo_documento, usuario.numero_documento);
  }
  if (typeof usuario?.documento === 'string') {
    return ejecutarSolicitudPorDocumento(usuario.documento);
  }
  return null;
}

async function ejecutarSolicitudPorDocumento(documento) {
  for (const tipoDocumento of tiposDocumentoPermitidos) {
    const solicitud = await usuariosTunja.buscarPorDocumento(tipoDocumento, documento);
    if (solicitud) return solicitud;
  }
  return null;
}

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
  const {
    email,
    contrasena,
    nombre,
    nombres,
    apellidos,
    documento,
    tipo_documento,
    numero_documento,
    perfil = 'general',
    descuento = 0,
    eps,
    telefono
  } = req.body || {};
  const archivo = req.file;
  const tipoDocumento = typeof tipo_documento === 'string'
    ? tipo_documento.trim().toUpperCase()
    : '';
  const registroConTipoDocumento = tipo_documento !== undefined;
  const numeroDocumento = typeof numero_documento === 'string'
    ? numero_documento.trim().toUpperCase()
    : !registroConTipoDocumento && typeof documento === 'string'
      ? documento.trim()
      : '';
  const documentoValido = tipoDocumento === 'PAS'
    ? /^[A-Za-z]{2}\d{6}$/.test(numeroDocumento)
    : /^\d{1,10}$/.test(numeroDocumento);

  if (typeof email !== 'string' || typeof contrasena !== 'string' ||
      typeof nombre !== 'string' ||
      !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      contrasena.length < 8 || contrasena.length > 128 ||
      nombre.trim().length < 2 || nombre.trim().length > 160 ||
      (nombres !== undefined && (typeof nombres !== 'string' || !nombres.trim() || nombres.trim().length > 80)) ||
      (apellidos !== undefined && (typeof apellidos !== 'string' || !apellidos.trim() || apellidos.trim().length > 80)) ||
      (telefono !== undefined && telefono !== '' &&
        (typeof telefono !== 'string' || telefono.length > 30 ||
          !/^\+?[0-9\s()-]{7,30}$/.test(telefono.trim()))) ||
      numeroDocumento.length === 0 || numeroDocumento.length > 40 ||
      (registroConTipoDocumento &&
        (!tiposDocumentoPermitidos.has(tipoDocumento) ||
          !documentoValido)) ||
      !registroConTipoDocumento ||
      !epsPermitidas.some((epsPermitida) =>
        epsPermitida.toLocaleLowerCase('es') ===
        (typeof eps === 'string' ? eps.trim().toLocaleLowerCase('es') : '')) ||
      !archivo ||
      typeof perfil !== 'string' || !perfilesPermitidos.has(perfil) ||
      !Number.isInteger(descuento) || descuento < 0 || descuento > 100) {
    return responderError(res, 400, 'datos_invalidos', 'Revisa los datos, selecciona tu EPS y adjunta un comprobante válido.');
  }

  const extension = extensionComprobante(archivo);
  if (!extension) {
    return responderError(res, 400, 'comprobante_invalido', 'El comprobante debe ser un PDF, JPG o PNG válido.');
  }

  const emailNormalizado = email.trim().toLowerCase();
  const nombreCompleto = nombre.trim().split(/\s+/);
  const apellidosAfiliado = typeof apellidos === 'string'
    ? apellidos.trim()
    : nombreCompleto.length > 1 ? nombreCompleto.pop() : '';
  const nombresAfiliado = typeof nombres === 'string'
    ? nombres.trim()
    : nombreCompleto.join(' ');
  const nombreOriginal = path.basename(archivo.originalname || `comprobante${extension}`)
    .replace(/[^\w.-]/g, '_')
    .slice(-120);
  const nombreArchivo = `${crypto.randomUUID()}${extension}`;

  try {
    const existente = await usuariosTunja.buscarPorDocumento(tipoDocumento, numeroDocumento);
    if (existente) {
      return responderError(res, 409, 'documento_duplicado', 'Ya existe una cuenta registrada con ese documento.');
    }

    const resultado = await tunjaRequest('/auth/register', {
      method: 'POST',
      requiresKey: true,
      body: {
        email: emailNormalizado,
        contrasena,
        nombre: nombre.trim(),
        documento: numeroDocumento,
        ...(registroConTipoDocumento
          ? {
              tipo_documento: tipoDocumento,
              numero_documento: numeroDocumento
            }
          : {}),
        perfil,
        descuento
      }
    });

    const rutaComprobante = path.join(carpetaComprobantes, nombreArchivo);
    try {
      await fs.mkdir(carpetaComprobantes, { recursive: true });
      await fs.writeFile(rutaComprobante, archivo.buffer, { flag: 'wx', mode: 0o600 });
      await usuariosTunja.registrar({
        tipo_documento: tipoDocumento,
        numero_documento: numeroDocumento,
        email: emailNormalizado,
        nombres: nombresAfiliado,
        apellidos: apellidosAfiliado,
        telefono: typeof telefono === 'string' && telefono.trim() ? telefono.trim() : null,
        eps: epsPermitidas.find((epsPermitida) =>
          epsPermitida.toLocaleLowerCase('es') === eps.trim().toLocaleLowerCase('es')),
        comprobante_archivo: nombreArchivo,
        comprobante_tipo: archivo.mimetype,
        comprobante_nombre: nombreOriginal
      });
    } catch (errorLocal) {
      try {
        await fs.rm(rutaComprobante, { force: true });
      } catch (errorLimpieza) {
        console.error('No fue posible limpiar un comprobante incompleto:', errorLimpieza.code || 'ERROR_INTERNO');
      }
      errorLocal.code = 'ERROR_GUARDADO_LOCAL';
      throw errorLocal;
    }

    return res.status(201).json({
      mensaje: 'Cuenta creada. Tu afiliación está pendiente de validación por tu EPS.',
      estado_afiliacion: 'pendiente',
      eps: epsPermitidas.find((epsPermitida) =>
        epsPermitida.toLocaleLowerCase('es') === eps.trim().toLocaleLowerCase('es')),
      usuario: resultado?.usuario
    });
  } catch (error) {
    if (error.code === 'TUNJA_DOCUMENTO_DUPLICADO') {
      return responderError(res, 409, 'documento_duplicado', error.message);
    }
    if (error.code === 'ERROR_GUARDADO_LOCAL') {
      console.error('Error al guardar solicitud de afiliación:', error.code);
      return responderError(res, 500, 'solicitud_no_guardada', 'No fue posible guardar la solicitud. Contacta al soporte antes de volver a registrarte.');
    }
    return responderFalloTunja(res, error);
  }
}

export async function iniciarSesionTarjeta(req, res) {
  const uid = typeof req.body?.uid === 'string'
    ? req.body.uid.trim().toUpperCase()
    : '';
  if (!/^(?:[A-F0-9]{2}){2,20}$/.test(uid)) {
    return responderError(res, 400, 'uid_invalido', 'El UID debe contener entre 4 y 40 caracteres hexadecimales.');
  }

  try {
    const tarjetaLocal = await tarjetasNfc.buscarPorUid(uid);
    if (!tarjetaLocal) {
      return responderError(res, 401, 'tarjeta_no_valida', 'La tarjeta no está vinculada o no está activa.');
    }

    let tarjetaTunja;
    try {
      tarjetaTunja = await tunjaRequest(`/cards/${encodeURIComponent(uid)}`, { requiresKey: true });
    } catch (error) {
      if (error.status === 404) {
        return responderError(res, 401, 'tarjeta_no_valida', 'La tarjeta no está vinculada o no está activa.');
      }
      return responderFalloTunja(res, error);
    }

    const usuarioTarjeta = tarjetaTunja?.usuario;
    if (tarjetaTunja?.activa !== true) {
      return responderError(res, 401, 'tarjeta_inactiva', 'La tarjeta está desactivada en TunjaAPI.');
    }

    const identidadValida = usuarioTarjeta &&
      String(usuarioTarjeta.id) === String(tarjetaLocal.usuario_id) &&
      typeof usuarioTarjeta.email === 'string' &&
      usuarioTarjeta.email.trim().toLowerCase() === tarjetaLocal.email.trim().toLowerCase();
    if (!identidadValida) {
      return responderError(
        res,
        401,
        'tarjeta_asociacion_inconsistente',
        'TunjaAPI tiene esta tarjeta asociada a otra cuenta. Pide al administrador de TunjaAPI que corrija la asociación o vincula otra tarjeta.'
      );
    }

    const solicitud = await usuariosTunja.buscarPorEmail(tarjetaLocal.email);
    if (!solicitud || solicitud.estado_afiliacion === 'rechazado') {
      return responderError(res, 403, 'cuenta_no_disponible', 'La cuenta no está habilitada para iniciar sesión.');
    }

    const descuento = usuarioTarjeta.descuento ?? 0;
    if (!Number.isInteger(descuento) || descuento < 0 || descuento > 100) {
      console.error('TunjaAPI devolvió un descuento inválido al validar la tarjeta.');
      return responderError(res, 502, 'perfil_no_disponible', 'No fue posible verificar el perfil de la cuenta.');
    }

    const tokens = crearTokensSesionTarjeta();
    const ahora = Date.now();
    const usuarioSesion = {
      id: String(tarjetaLocal.usuario_id),
      email: tarjetaLocal.email.trim().toLowerCase(),
      perfil: typeof usuarioTarjeta.perfil === 'string' ? usuarioTarjeta.perfil : 'general',
      descuento
    };
    await sesionesTarjeta.crear(
      usuarioSesion,
      hashToken(tokens.acceso),
      hashToken(tokens.refresco),
      ahora,
      ahora + duracionSesionTarjetaMs
    );
    return responderSesionTarjeta(res, {
      ...usuarioSesion,
      ...solicitud,
      usuario_id: usuarioSesion.id
    }, tokens);
  } catch (error) {
    console.error('Error al iniciar sesión con tarjeta NFC:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible iniciar sesión con la tarjeta.');
  }
}

export async function iniciarSesionTunja(req, res) {
  const { tipo_documento, numero_documento, contrasena } = req.body || {};
  const tipoDocumento = typeof tipo_documento === 'string'
    ? tipo_documento.trim().toUpperCase()
    : '';
  const numeroDocumento = typeof numero_documento === 'string'
    ? numero_documento.trim().toUpperCase()
    : '';
  const documentoValido = tipoDocumento === 'PAS'
    ? /^[A-Z]{2}\d{6}$/.test(numeroDocumento)
    : /^\d{1,10}$/.test(numeroDocumento);
  if (!tiposDocumentoPermitidos.has(tipoDocumento) ||
      !documentoValido ||
      typeof contrasena !== 'string' || !contrasena.length || contrasena.length > 128) {
    return responderError(
      res,
      400,
      'datos_invalidos',
      'Ingresa un tipo y número de documento y una contraseña válidos.'
    );
  }

  try {
    const identidad = await usuariosTunja.buscarPorDocumento(tipoDocumento, numeroDocumento);
    const resultado = await tunjaRequest('/auth/login', {
      method: 'POST',
      body: identidad
        ? { email: identidad.email, contrasena }
        : {
            tipo_documento: tipoDocumento,
            numero_documento: numeroDocumento,
            contrasena
          }
    });
    const solicitud = identidad || await buscarSolicitudDeRespuesta(resultado);
    return res.status(200).json(respuestaConEstado(resultado, solicitud));
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}

export async function renovarSesionTunja(req, res) {
  const { refresco } = req.body || {};
  if (typeof refresco !== 'string' || !refresco) {
    return responderError(res, 400, 'datos_invalidos', 'Se requiere un token de refresco válido.');
  }

  const tokens = crearTokensSesionTarjeta();
  const ahora = Date.now();
  const sesionTarjeta = await sesionesTarjeta.renovarPorRefresco(
    hashToken(refresco),
    hashToken(tokens.acceso),
    hashToken(tokens.refresco),
    ahora,
    ahora + duracionSesionTarjetaMs
  );
  if (sesionTarjeta) return responderSesionTarjeta(res, sesionTarjeta, tokens);

  try {
    const resultado = await tunjaRequest('/auth/refresh', {
      method: 'POST',
      body: { refresco }
    });
    const solicitud = await buscarSolicitudDeRespuesta(resultado);
    return res.status(200).json(respuestaConEstado(resultado, solicitud));
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}

export async function cerrarSesionTunja(req, res) {
  const { refresco } = req.body || {};
  if (typeof refresco !== 'string' || !refresco) {
    return responderError(res, 400, 'datos_invalidos', 'Se requiere un token de refresco válido.');
  }

  const revocada = await sesionesTarjeta.revocarPorRefresco(hashToken(refresco), Date.now());
  if (revocada) return res.status(204).end();

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

  const ahora = Date.now();
  const sesionTarjeta = await sesionesTarjeta.renovarPorToken(
    hashToken(coincidencia[1]),
    ahora,
    ahora + duracionSesionTarjetaMs
  );
  if (sesionTarjeta) {
    return res.status(200).json(crearUsuarioSesionTarjeta(sesionTarjeta));
  }

  try {
    const resultado = await tunjaRequest('/auth/me', { accessToken: coincidencia[1] });
    const solicitud = await buscarSolicitudDeRespuesta(resultado);
    return res.status(200).json(respuestaConEstado(resultado, solicitud));
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}
