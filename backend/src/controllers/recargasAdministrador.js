import * as usuariosTunja from '../repositories/usuariosTunja.js';
import { responderFalloTunja } from './wallet.js';
import { tunjaRequest } from '../services/tunjaApi.js';

const limiteUsuarios = 200;
const montoMinimo = 100;
const montoMaximo = 500000;
const metodosPago = new Set(['nequi', 'daviplata', 'tarjeta', 'pse']);

function responderError(res, status, error, mensaje) {
  return res.status(status).json({ error, mensaje });
}

function normalizarEmail(email) {
  return typeof email === 'string'
    ? email.trim().toLocaleLowerCase('es')
    : '';
}

async function listarUsuariosTunjaActivos() {
  const usuarios = [];
  let total = null;
  for (let desde = 0; total === null || desde < total; desde += limiteUsuarios) {
    const respuesta = await tunjaRequest(
      `/users?limite=${limiteUsuarios}&desde=${desde}`,
      { requiresKey: true }
    );
    if (!Array.isArray(respuesta?.usuarios) ||
        !Number.isSafeInteger(respuesta.total) || respuesta.total < 0) {
      const error = new Error('TunjaAPI devolvió una lista de usuarios no válida.');
      error.code = 'TUNJA_API_INVALID_RESPONSE';
      throw error;
    }
    if (total !== null && respuesta.total !== total) {
      const error = new Error('TunjaAPI cambió la paginación durante la consulta.');
      error.code = 'TUNJA_API_INVALID_RESPONSE';
      throw error;
    }
    total = respuesta.total;
    usuarios.push(...respuesta.usuarios);
    if (respuesta.usuarios.length === 0 && desde < total) {
      const error = new Error('TunjaAPI devolvió una página vacía antes de completar la lista.');
      error.code = 'TUNJA_API_INVALID_RESPONSE';
      throw error;
    }
  }
  return usuarios;
}

export async function listarAfiliadosParaRecarga(req, res) {
  try {
    const [afiliados, usuariosApi] = await Promise.all([
      usuariosTunja.listarAprobadosPorEps(req.usuario.eps),
      listarUsuariosTunjaActivos()
    ]);
    const usuariosPorEmail = new Map(
      usuariosApi
        .filter((usuario) => usuario?.activo === true)
        .map((usuario) => [normalizarEmail(usuario.email), usuario])
        .filter(([email]) => email)
    );
    const data = afiliados.flatMap((afiliado) => {
      const usuarioApi = usuariosPorEmail.get(normalizarEmail(afiliado.email));
      if (!usuarioApi || !Number.isSafeInteger(usuarioApi.id) ||
          !Number.isSafeInteger(usuarioApi.saldo) || usuarioApi.saldo < 0) {
        return [];
      }
      return [{
        id: usuarioApi.id,
        nombre: [afiliado.nombres, afiliado.apellidos].filter(Boolean).join(' ') ||
          usuarioApi.nombre,
        tipoDocumento: afiliado.tipo_documento,
        numeroDocumento: afiliado.numero_documento,
        email: afiliado.email,
        saldo: usuarioApi.saldo
      }];
    });

    return res.status(200).json({ data });
  } catch (error) {
    if (error.code === 'TUNJA_API_INVALID_RESPONSE') {
      console.error('TunjaAPI devolvió una lista inválida para recargas administrativas.');
    }
    return responderFalloTunja(res, error);
  }
}

export async function recargarAfiliado(req, res) {
  const id = Number(req.params.id);
  const { monto, metodoPago } = req.body || {};
  if (!Number.isSafeInteger(id) || id < 1 ||
      !Number.isSafeInteger(monto) || monto < montoMinimo || monto > montoMaximo ||
      !metodosPago.has(metodoPago)) {
    return responderError(
      res,
      400,
      'datos_invalidos',
      'Selecciona un afiliado, un medio de pago válido y un monto entero entre 100 y 500.000 pesos.'
    );
  }

  try {
    const usuarioApi = await tunjaRequest(`/users/${id}`, { requiresKey: true });
    const email = typeof usuarioApi?.email === 'string'
      ? usuarioApi.email.trim()
      : '';
    const afiliado = email
      ? await usuariosTunja.buscarAprobadoPorEmail(req.usuario.eps, email)
      : null;
    if (!usuarioApi || usuarioApi.id !== id || usuarioApi.activo !== true ||
        !afiliado) {
      return responderError(
        res,
        404,
        'afiliado_no_disponible',
        'El afiliado no está activo o no pertenece a la EPS administrada.'
      );
    }

    const movimiento = await tunjaRequest(`/users/${id}/wallet/topup`, {
      method: 'POST',
      requiresKey: true,
      body: {
        monto,
        concepto: `Recarga MediTunja (pago simulado: ${metodoPago})`
      }
    });
    if (movimiento?.usuario_id !== id ||
        !Number.isSafeInteger(movimiento.saldo) || movimiento.saldo < 0) {
      console.error('TunjaAPI devolvió una recarga administrativa sin datos válidos.');
      return responderError(
        res,
        502,
        'respuesta_recarga_invalida',
        'TunjaAPI no confirmó una recarga válida.'
      );
    }

    return res.status(200).json({
      mensaje: 'La recarga fue acreditada en la billetera del afiliado.',
      data: movimiento
    });
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}
