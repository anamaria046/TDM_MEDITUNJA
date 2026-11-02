import { Router } from 'express';
import { iniciarSesion, iniciarSesionAdministrador } from '../controllers/login.js';
import { registrarUsuario } from '../controllers/registro.js';
import { autenticarSesion } from '../middleware/autenticarSesion.js';
import { exigirAdministrador } from '../middleware/exigirAdministrador.js';
import {
  actualizarAfiliado,
  actualizarEstadoAfiliado,
  actualizarEstadoSolicitudAfiliacion,
  crearConvenio,
  descargarComprobanteAfiliacion,
  desactivarConvenio,
  listarAfiliados,
  listarSolicitudesAfiliacion,
  listarConvenios
} from '../controllers/administracion.js';
import {
  autenticarUsuarioTunja,
  cancelarCita,
  crearCita,
  listarCitas,
  obtenerDisponibilidad
} from '../controllers/citas.js';
import * as sesiones from '../repositories/sesiones.js';
import {
  cerrarSesionTunja,
  iniciarSesionTunja,
  obtenerUsuarioTunja,
  registrarEnTunja,
  renovarSesionTunja
} from '../controllers/tunjaAuth.js';
import { recibirComprobante } from '../middleware/recibirComprobante.js';

const router = Router();

router.post('/tunja/auth/register', recibirComprobante, registrarEnTunja);
router.post('/tunja/auth/login', iniciarSesionTunja);
router.post('/tunja/auth/refresh', renovarSesionTunja);
router.post('/tunja/auth/logout', cerrarSesionTunja);
router.get('/tunja/auth/me', obtenerUsuarioTunja);

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);
router.post('/admin/login', iniciarSesionAdministrador);

router.get('/citas/disponibilidad', autenticarUsuarioTunja, obtenerDisponibilidad);
router.get('/citas', autenticarUsuarioTunja, listarCitas);
router.post('/citas', autenticarUsuarioTunja, crearCita);
router.put('/citas/:id/cancelar', autenticarUsuarioTunja, cancelarCita);

router.use(autenticarSesion);
router.get('/sesion', (req, res) => {
  res.status(200).json({
    mensaje: 'Sesión activa y renovada por actividad.',
    expira_en: new Date(req.sesionExpiraEn).toISOString(),
    data: req.usuario
  });
});
router.get('/admin/sesion', exigirAdministrador, (req, res) => {
  res.status(200).json({ data: req.usuario });
});
router.get('/admin/afiliados', exigirAdministrador, listarAfiliados);
router.get('/admin/solicitudes-afiliacion', exigirAdministrador, listarSolicitudesAfiliacion);
router.get(
  '/admin/solicitudes-afiliacion/:tipoDocumento/:numeroDocumento/comprobante',
  exigirAdministrador,
  descargarComprobanteAfiliacion
);
router.put(
  '/admin/solicitudes-afiliacion/:tipoDocumento/:numeroDocumento/estado',
  exigirAdministrador,
  actualizarEstadoSolicitudAfiliacion
);
router.put('/admin/afiliados/:id', exigirAdministrador, actualizarAfiliado);
router.put('/admin/afiliados/:id/estado', exigirAdministrador, actualizarEstadoAfiliado);
router.get('/admin/convenios', exigirAdministrador, listarConvenios);
router.post('/admin/convenios', exigirAdministrador, crearConvenio);
router.put('/admin/convenios/:id/desactivar', exigirAdministrador, desactivarConvenio);
router.post('/logout', async (req, res, next) => {
  try {
    await sesiones.revocar(req.sesionTokenHash, Date.now());
    return res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
  } catch (error) {
    return next(error);
  }
});

export default router;
