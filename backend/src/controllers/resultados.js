import * as usuariosTunja from '../repositories/usuariosTunja.js';
import * as resultados from '../repositories/resultados.js';

const tiposDocumentoPermitidos = new Set(['CC', 'TI', 'CE', 'PAS']);
const estadosPermitidos = new Set(['En proceso', 'Disponible']);

function responderError(res, status, error, mensaje) {
  return res.status(status).json({ error, mensaje });
}

function mismaEps(valor, epsAutenticada) {
  const normalizar = (eps) => typeof eps === 'string'
    ? eps.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es')
      .replace(/\beps\b/g, '')
      .replace(/[^a-z0-9]/g, '')
    : '';
  return normalizar(valor) !== '' && normalizar(valor) === normalizar(epsAutenticada);
}

function fechaValida(fecha) {
  return typeof fecha === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(fecha) &&
    !Number.isNaN(Date.parse(`${fecha}T00:00:00Z`)) &&
    new Date(`${fecha}T00:00:00Z`).toISOString().slice(0, 10) === fecha &&
    fecha <= new Date().toISOString().slice(0, 10);
}

function textoValido(valor, maximo) {
  return typeof valor === 'string' && valor.trim().length > 0 &&
    valor.trim().length <= maximo;
}

export async function listarResultadosUsuario(req, res) {
  try {
    const solicitud = req.usuarioCitas.email
      ? await usuariosTunja.buscarPorEmail(req.usuarioCitas.email)
      : null;
    if (!solicitud || solicitud.estado_afiliacion !== 'aprobado') {
      return responderError(res, 403, 'afiliacion_no_verificada', 'No fue posible verificar tu afiliación.');
    }

    const data = await resultados.listarPorUsuario(
      solicitud.tipo_documento,
      solicitud.numero_documento,
      solicitud.eps
    );
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar resultados del paciente:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar tus resultados.');
  }
}

export async function listarResultadosAdministrador(req, res) {
  try {
    const data = await resultados.listarPorEps(req.usuario.eps);
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar resultados administrativos:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar los resultados.');
  }
}

export async function crearResultado(req, res) {
  const {
    tipoDocumento,
    numeroDocumento,
    procedimiento,
    fecha,
    proveedor,
    estado,
    informe
  } = req.body || {};
  const tipoNormalizado = typeof tipoDocumento === 'string'
    ? tipoDocumento.trim().toUpperCase()
    : '';
  const documentoNormalizado = typeof numeroDocumento === 'string'
    ? numeroDocumento.trim()
    : '';

  if (!tiposDocumentoPermitidos.has(tipoNormalizado) ||
      !/^[A-Za-z0-9.-]{4,30}$/.test(documentoNormalizado) ||
      !textoValido(procedimiento, 120) ||
      !fechaValida(fecha) ||
      !textoValido(proveedor, 120) ||
      !estadosPermitidos.has(estado) ||
      !textoValido(informe, 10000)) {
    return responderError(res, 400, 'datos_invalidos', 'Revisa el documento, procedimiento, fecha, IPS, estado e informe.');
  }

  try {
    const afiliado = await usuariosTunja.buscarPorDocumento(tipoNormalizado, documentoNormalizado);
    if (!afiliado || afiliado.estado_afiliacion !== 'aprobado' ||
        !mismaEps(afiliado.eps, req.usuario.eps)) {
      return responderError(
        res,
        404,
        'afiliado_no_encontrado',
        'No se encontró un afiliado aprobado de esta EPS con ese documento.'
      );
    }

    const id = await resultados.crear({
      tipoDocumento: tipoNormalizado,
      numeroDocumento: documentoNormalizado,
      eps: afiliado.eps,
      procedimiento: procedimiento.trim(),
      fecha,
      proveedor: proveedor.trim(),
      estado,
      informe: informe.trim(),
      creadoPor: req.usuario.id_usuario
    });
    return res.status(201).json({ mensaje: 'Resultado registrado.', id });
  } catch (error) {
    console.error('Error al registrar resultado:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible registrar el resultado.');
  }
}

export async function eliminarResultado(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return responderError(res, 400, 'id_invalido', 'El identificador del resultado no es válido.');
  }

  try {
    const resultado = await resultados.eliminarPorEps(req.usuario.eps, id);
    if (resultado.changes === 0) {
      return responderError(res, 404, 'resultado_no_encontrado', 'No se encontró el resultado de esta EPS.');
    }
    return res.status(200).json({ mensaje: 'Resultado eliminado.' });
  } catch (error) {
    console.error('Error al eliminar resultado:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible eliminar el resultado.');
  }
}
