import * as tarjetas from '../repositories/tarjetasNfc.js';

export async function exigirTarjetaVinculada(req, res, next) {
  try {
    const tarjeta = await tarjetas.buscarPorUsuario(req.usuarioCitas.id);
    if (!tarjeta) {
      return res.status(403).json({
        error: 'tarjeta_no_vinculada',
        mensaje: 'Vincula una tarjeta NFC para consultar o usar el saldo de tu billetera.'
      });
    }
    return next();
  } catch (error) {
    console.error('Error al verificar tarjeta vinculada:', error.code || 'ERROR_INTERNO');
    return res.status(500).json({
      error: 'error_interno',
      mensaje: 'No fue posible verificar si tienes una tarjeta vinculada.'
    });
  }
}
