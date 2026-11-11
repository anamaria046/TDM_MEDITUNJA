import { tunjaRequest } from '../services/tunjaApi.js';

const montoMinimo = 100;
const montoMaximo = 500000;

function responderError(res, status, error, mensaje) {
  return res.status(status).json({ error, mensaje });
}

function obtenerToken(req) {
  const coincidencia = /^Bearer\s+(\S+)$/i.exec(req.get('authorization') || '');
  return coincidencia?.[1];
}

function extraerSaldo(respuesta) {
  const capas = [
    respuesta,
    respuesta?.data,
    respuesta?.wallet,
    respuesta?.data?.wallet,
    respuesta?.usuario,
    respuesta?.data?.usuario
  ];
  const saldo = capas.find((capa) =>
    capa && Number.isSafeInteger(capa.saldo) && capa.saldo >= 0
  )?.saldo;
  return saldo;
}

export function responderFalloTunja(res, error) {
  if (error.code === 'TUNJA_KEY_MISSING') {
    return responderError(
      res,
      503,
      'servicio_no_configurado',
      'El servidor no tiene configurada la clave de TunjaAPI.'
    );
  }
  if (error.code === 'TUNJA_API_UNAVAILABLE' || error.code === 'TUNJA_API_INVALID_RESPONSE') {
    console.error('Error de conexión con TunjaAPI para billetera:', error.code);
    return responderError(res, 502, 'tunja_api_no_disponible', error.message);
  }
  if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({
      error: error.code,
      mensaje: error.message,
      ...(error.payload?.reintentar_en === undefined
        ? {}
        : { reintentar_en: error.payload.reintentar_en })
    });
  }

  console.error('Error inesperado de TunjaAPI para billetera:', error.code || 'ERROR_INTERNO');
  return responderError(
    res,
    502,
    'tunja_api_no_disponible',
    'No fue posible completar la solicitud con TunjaAPI.'
  );
}

export async function obtenerSaldo(req, res) {
  try {
    const respuesta = await tunjaRequest('/wallet', {
      accessToken: obtenerToken(req),
      requiresKey: true
    });
    const saldo = extraerSaldo(respuesta);
    if (saldo === undefined) {
      console.error('TunjaAPI devolvió una billetera sin un saldo válido.');
      return responderError(
        res,
        502,
        'respuesta_billetera_invalida',
        'TunjaAPI no devolvió un saldo válido.'
      );
    }

    return res.status(200).json({ data: { saldo } });
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}

export async function recargarSaldo(req, res) {
  const { monto } = req.body || {};
  if (!Number.isSafeInteger(monto) || monto < montoMinimo || monto > montoMaximo) {
    return responderError(
      res,
      400,
      'monto_fuera_de_rango',
      `El monto debe ser un número entero entre ${montoMinimo} y ${montoMaximo} pesos.`
    );
  }

  try {
    const movimiento = await tunjaRequest('/wallet/topup', {
      method: 'POST',
      accessToken: obtenerToken(req),
      requiresKey: true,
      body: {
        monto,
        concepto: 'Recarga de saldo MediTunja'
      }
    });
    return res.status(200).json({
      mensaje: 'El saldo fue acreditado en tu billetera TunjaAPI.',
      data: movimiento,
      ...(extraerSaldo(movimiento) === undefined
        ? {}
        : { saldo: extraerSaldo(movimiento) })
    });
  } catch (error) {
    return responderFalloTunja(res, error);
  }
}
