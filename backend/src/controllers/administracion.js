import crypto from 'node:crypto';
import * as usuarios from '../repositories/usuarios.js';
import * as usuariosTunja from '../repositories/usuariosTunja.js';
import * as administracion from '../repositories/administracion.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tiposDocumentoPermitidos = new Set(['CC', 'TI', 'CE', 'PAS']);
const sexosPermitidos = new Set(['M', 'F', 'O']);
const responderError = (res, status, error, mensaje) =>
  res.status(status).json({ error, mensaje });
const carpetaComprobantes = path.resolve(
  process.env.DB_PATH
    ? path.join(path.dirname(path.resolve(process.env.DB_PATH)), 'afiliaciones-privadas')
    : path.join(path.dirname(fileURLToPath(import.meta.url)), '../../data/afiliaciones-privadas')
);

function esTexto(valor, maximo) {
  return typeof valor === 'string' && valor.trim().length > 0 &&
    valor.trim().length <= maximo;
}

function normalizarEps(valor) {
  return typeof valor === 'string'
    ? valor.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .replace(/\beps\b/g, '')
      .replace(/[^a-z0-9]/g, '')
    : '';
}

function mismaEps(valor, epsAutenticada) {
  return normalizarEps(valor) !== '' &&
    normalizarEps(valor) === normalizarEps(epsAutenticada);
}

function fechaValida(fecha) {
  return typeof fecha === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    !Number.isNaN(Date.parse(`${fecha}T00:00:00Z`)) &&
    new Date(`${fecha}T00:00:00Z`).toISOString().slice(0, 10) === fecha &&
    fecha <= new Date().toISOString().slice(0, 10);
}

function datosAfiliadoValidos(datos) {
  const tipoDocumento = typeof datos.tipoDocumento === 'string'
    ? datos.tipoDocumento.trim().toUpperCase()
    : '';
  const numeroDocumento = typeof datos.numeroDocumento === 'string'
    ? datos.numeroDocumento.trim()
    : '';
  const email = typeof datos.email === 'string' ? datos.email.trim().toLowerCase() : '';
  const telefono = datos.telefono == null ? '' : datos.telefono;

  if (!esTexto(datos.nombres, 80) || !esTexto(datos.apellidos, 80) ||
      !tiposDocumentoPermitidos.has(tipoDocumento) ||
      !/^[A-Za-z0-9.-]{4,30}$/.test(numeroDocumento) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
      (telefono !== '' && (typeof telefono !== 'string' || telefono.length > 30 ||
        !/^\+?[0-9\s()-]{7,30}$/.test(telefono.trim()))) ||
      !fechaValida(datos.fechaNacimiento) ||
      !sexosPermitidos.has(datos.sexo)) {
    return null;
  }

  return {
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    tipoDocumento,
    numeroDocumento,
    email,
    telefono: typeof telefono === 'string' && telefono.trim() ? telefono.trim() : null,
    fechaNacimiento: datos.fechaNacimiento,
    sexo: datos.sexo
  };
}

export async function listarAfiliados(req, res) {
  try {
    const data = await usuarios.listarAfiliados(req.usuario.eps);
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar afiliados:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible consultar los afiliados.');
  }
}

export async function actualizarAfiliado(req, res) {
  const id = Number(req.params.id);
  const datos = datosAfiliadoValidos(req.body || {});
  if (!Number.isSafeInteger(id) || id < 1 || !datos) {
    return responderError(res, 400, 'Datos inválidos', 'Revisa los datos del afiliado.');
  }

  try {
    const resultado = await usuarios.actualizarAfiliado(req.usuario.eps, id, datos);
    if (resultado.changes === 0) {
      return responderError(res, 404, 'Afiliado no encontrado', 'No se encontró el afiliado de esta EPS.');
    }
    return res.status(200).json({ mensaje: 'Datos del afiliado actualizados.' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        (error.code === 'SQLITE_CONSTRAINT' && /UNIQUE constraint failed/.test(error.message))) {
      return responderError(res, 409, 'Registro duplicado', 'El documento o correo ya está asociado a otro usuario.');
    }
    console.error('Error al actualizar afiliado:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible actualizar el afiliado.');
  }
}

export async function actualizarEstadoAfiliado(req, res) {
  const id = Number(req.params.id);
  const { estado } = req.body || {};
  if (!Number.isSafeInteger(id) || id < 1 ||
      !['pendiente', 'aprobado', 'rechazado'].includes(estado)) {
    return responderError(res, 400, 'Datos inválidos', 'Indica un estado válido para el afiliado.');
  }

  try {
    const resultado = await usuarios.actualizarEstadoAfiliado(req.usuario.eps, id, estado);
    if (resultado.changes === 0) {
      return responderError(res, 404, 'Afiliado no encontrado', 'No se encontró el afiliado de esta EPS.');
    }
    return res.status(200).json({ mensaje: `Solicitud ${estado}.` });
  } catch (error) {
    console.error('Error al actualizar estado del afiliado:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible actualizar el estado.');
  }
}

export async function listarSolicitudesAfiliacion(req, res) {
  try {
    const data = await usuariosTunja.listarSolicitudesPorEps(req.usuario.eps);
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar solicitudes de afiliación:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible consultar las solicitudes.');
  }
}

export async function actualizarEstadoSolicitudAfiliacion(req, res) {
  const { tipoDocumento, numeroDocumento } = req.params;
  const { estado } = req.body || {};
  if (!['CC', 'TI', 'CE', 'PAS'].includes(tipoDocumento) ||
      !/^[A-Za-z0-9.-]{4,30}$/.test(numeroDocumento) ||
      !['aprobado', 'rechazado'].includes(estado)) {
    return responderError(res, 400, 'Datos inválidos', 'Indica un estado válido para la solicitud.');
  }

  try {
    const solicitud = await usuariosTunja.buscarSolicitud(
      tipoDocumento,
      numeroDocumento,
      req.usuario.eps
    );
    if (!solicitud) {
      return responderError(res, 404, 'Solicitud no encontrada', 'No se encontró la solicitud de esta EPS.');
    }

    if (estado === 'aprobado' &&
        /^[\da-f-]{36}\.(pdf|jpg|png)$/i.test(solicitud.comprobante_archivo || '')) {
      try {
        await fs.unlink(path.join(carpetaComprobantes, solicitud.comprobante_archivo));
      } catch (errorArchivo) {
        if (errorArchivo.code !== 'ENOENT') throw errorArchivo;
      }
    }

    const resultado = await usuariosTunja.actualizarEstadoSolicitud(
      tipoDocumento,
      numeroDocumento,
      req.usuario.eps,
      estado
    );
    if (resultado.changes === 0) {
      return responderError(res, 404, 'Solicitud no encontrada', 'No se encontró la solicitud de esta EPS.');
    }
    return res.status(200).json({ mensaje: `Solicitud ${estado}.` });
  } catch (error) {
    console.error('Error al actualizar solicitud de afiliación:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible actualizar la solicitud.');
  }
}

export async function descargarComprobanteAfiliacion(req, res) {
  const { tipoDocumento, numeroDocumento } = req.params;
  if (!['CC', 'TI', 'CE', 'PAS'].includes(tipoDocumento) ||
      !/^[A-Za-z0-9.-]{4,30}$/.test(numeroDocumento)) {
    return responderError(res, 400, 'Datos inválidos', 'Indica una solicitud válida.');
  }

  try {
    const solicitud = await usuariosTunja.buscarSolicitud(
      tipoDocumento,
      numeroDocumento,
      req.usuario.eps
    );
    if (!solicitud) {
      return responderError(res, 404, 'Solicitud no encontrada', 'No se encontró la solicitud de esta EPS.');
    }
    if (!/^[\da-f-]{36}\.(pdf|jpg|png)$/i.test(solicitud.comprobante_archivo || '')) {
      return responderError(res, 404, 'Comprobante no disponible', 'La solicitud no tiene un comprobante disponible.');
    }

    const archivo = await fs.readFile(path.join(carpetaComprobantes, solicitud.comprobante_archivo));
    res.setHeader('Content-Type', solicitud.comprobante_tipo);
    res.setHeader('Content-Disposition', `attachment; filename="comprobante-${tipoDocumento}-${numeroDocumento}.${solicitud.comprobante_archivo.split('.').pop()}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(archivo);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return responderError(res, 404, 'Comprobante no disponible', 'No se encontró el archivo del comprobante.');
    }
    console.error('Error al descargar comprobante de afiliación:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible descargar el comprobante.');
  }
}

export async function listarConvenios(req, res) {
  try {
    const data = await administracion.listarConvenios(req.usuario.eps);
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar convenios:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible consultar los convenios.');
  }
}

export async function crearConvenio(req, res) {
  const datos = req.body || {};
  const servicios = datos.serviciosSeleccionados;
  if (!esTexto(datos.epsNombre, 100) || !mismaEps(datos.epsNombre, req.usuario.eps)) {
    return responderError(res, 403, 'EPS no autorizada', 'Solo puedes crear convenios para la EPS asignada a tu cuenta.');
  }
  if (!esTexto(datos.epsId, 100) || !esTexto(datos.epsSede, 160) ||
      !esTexto(datos.epsDireccion, 240) || !esTexto(datos.ipsId, 100) ||
      !esTexto(datos.ipsNombre, 160) || !esTexto(datos.ipsSede, 160) ||
      !esTexto(datos.ipsDireccion, 240) || !esTexto(datos.portafolioId, 100) ||
      !esTexto(datos.portafolioNombre, 200) ||
      !Array.isArray(servicios) || servicios.length < 1 || servicios.length > 100 ||
      !servicios.every((servicio) => esTexto(servicio, 100)) ||
      typeof datos.clausulaTransporte !== 'boolean') {
    return responderError(res, 400, 'Datos inválidos', 'Revisa la información del convenio y sus servicios.');
  }

  const convenio = {
    id: `CNV-TUN-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
    epsId: datos.epsId.trim(),
    epsNombre: req.usuario.eps.trim(),
    epsSede: datos.epsSede.trim(),
    epsDireccion: datos.epsDireccion.trim(),
    ipsId: datos.ipsId.trim(),
    ipsNombre: datos.ipsNombre.trim(),
    ipsSede: datos.ipsSede.trim(),
    ipsDireccion: datos.ipsDireccion.trim(),
    portafolioId: datos.portafolioId.trim(),
    portafolioNombre: datos.portafolioNombre.trim(),
    serviciosSeleccionados: [...new Set(servicios.map((servicio) => servicio.trim()))],
    clausulaTransporte: datos.clausulaTransporte,
    fechaCreacion: new Date().toISOString().slice(0, 10)
  };

  try {
    await administracion.crearConvenio(convenio);
    return res.status(201).json({ mensaje: 'Convenio formalizado y guardado.', data: convenio });
  } catch (error) {
    console.error('Error al crear convenio:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible guardar el convenio.');
  }
}

export async function desactivarConvenio(req, res) {
  const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
  if (!id || id.length > 80) {
    return responderError(res, 400, 'Datos inválidos', 'Indica un código de convenio válido.');
  }

  try {
    const resultado = await administracion.desactivarConvenio(req.usuario.eps, id);
    if (resultado.changes === 0) {
      return responderError(res, 404, 'Convenio no encontrado', 'No se encontró el convenio activo de esta EPS.');
    }
    return res.status(200).json({ mensaje: 'Convenio desactivado.' });
  } catch (error) {
    console.error('Error al desactivar convenio:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'No fue posible desactivar el convenio.');
  }
}
