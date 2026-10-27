import crypto from 'node:crypto';
import { promisify } from 'node:util';
import * as usuarios from '../repositories/usuarios.js';

const scrypt = promisify(crypto.scrypt);
const tiposDocumentoPermitidos = new Set(['CC', 'TI', 'CE', 'PAS']);
const sexosPermitidos = new Set(['M', 'F', 'O']);

const responderError = (res, status, error, mensaje) =>
  res.status(status).json({ error, mensaje });

const esTexto = (valor, maximo) =>
  typeof valor === 'string' && valor.trim().length > 0 && valor.trim().length <= maximo;

async function crearHashContrasena(contrasena) {
  const sal = crypto.randomBytes(16).toString('hex');
  const derivada = await scrypt(contrasena, sal, 64);
  return `${sal}:${derivada.toString('hex')}`;
}

export async function registrarUsuario(req, res) {
  const {
    tipo_documento,
    numero_documento,
    nombres,
    apellidos,
    email,
    telefono,
    fecha_nacimiento,
    sexo,
    eps,
    contrasena
  } = req.body || {};

  if (!esTexto(nombres, 80) || !esTexto(apellidos, 80) ||
      !esTexto(numero_documento, 30) || !esTexto(email, 254) ||
      typeof contrasena !== 'string' || contrasena.length < 8 || contrasena.length > 128) {
    return responderError(res, 400, 'Datos inválidos', 'Revisa los campos obligatorios y sus longitudes.');
  }

  if (telefono !== undefined && telefono !== null &&
      (typeof telefono !== 'string' || telefono.length > 30)) {
    return responderError(res, 400, 'Datos inválidos', 'El teléfono debe ser texto de máximo 30 caracteres.');
  }

  if ((fecha_nacimiento !== undefined && fecha_nacimiento !== null &&
       (typeof fecha_nacimiento !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha_nacimiento) ||
        Number.isNaN(Date.parse(`${fecha_nacimiento}T00:00:00Z`)) ||
        new Date(`${fecha_nacimiento}T00:00:00Z`).toISOString().slice(0, 10) !== fecha_nacimiento ||
        fecha_nacimiento > new Date().toISOString().slice(0, 10))) ||
      (sexo !== undefined && sexo !== null &&
       (typeof sexo !== 'string' || !sexosPermitidos.has(sexo))) ||
      (eps !== undefined && eps !== null && !esTexto(eps, 100))) {
    return responderError(res, 400, 'Datos inválidos', 'Revisa la fecha de nacimiento, el sexo y la EPS.');
  }

  const tipoDocumento = typeof tipo_documento === 'string' ? tipo_documento.trim().toUpperCase() : '';
  const numeroDocumento = numero_documento.trim();
  const correo = email.trim().toLowerCase();
  const telefonoNormalizado = typeof telefono === 'string' ? telefono.trim() : null;

  if (!tiposDocumentoPermitidos.has(tipoDocumento) ||
      !/^[A-Za-z0-9.-]{4,30}$/.test(numeroDocumento) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) ||
      (telefonoNormalizado && !/^\+?[0-9\s()-]{7,30}$/.test(telefonoNormalizado))) {
    return responderError(res, 400, 'Datos inválidos', 'Revisa el tipo y número de documento, correo y teléfono.');
  }

  try {
    if (await usuarios.buscarPorDocumento(tipoDocumento, numeroDocumento)) {
      return responderError(res, 409, 'Documento duplicado', 'Ya existe una solicitud con ese documento.');
    }
    if (await usuarios.buscarPorEmail(correo)) {
      return responderError(res, 409, 'Correo duplicado', 'Ese correo ya está registrado.');
    }

    const nuevoUsuario = await usuarios.crearPendiente({
      tipo_documento: tipoDocumento,
      numero_documento: numeroDocumento,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: correo,
      telefono: telefonoNormalizado || null,
      fecha_nacimiento: fecha_nacimiento || null,
      sexo: sexo || null,
      eps: typeof eps === 'string' ? eps.trim() : null,
      password_hash: await crearHashContrasena(contrasena)
    });

    return res.status(201).json({
      mensaje: 'Solicitud de registro guardada en estado pendiente.',
      data: {
        id_usuario: nuevoUsuario.id_usuario,
        estado_registro: nuevoUsuario.estado_registro
      }
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
        (error.code === 'SQLITE_CONSTRAINT' && /UNIQUE constraint failed/.test(error.message))) {
      return responderError(res, 409, 'Registro duplicado', 'El documento o correo ya está registrado.');
    }
    console.error('Error en POST /api/registro:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'Error interno del servidor', 'Ocurrió un error al procesar la solicitud.');
  }
}
