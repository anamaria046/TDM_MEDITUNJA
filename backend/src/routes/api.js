import { Router } from 'express';
import { iniciarSesion } from '../controllers/login.js';
import { registrarUsuario } from '../controllers/registro.js';
import { autenticarSesion } from '../middleware/autenticarSesion.js';
import * as sesiones from '../repositories/sesiones.js';
import {
  cerrarSesionTunja,
  iniciarSesionTunja,
  obtenerUsuarioTunja,
  registrarEnTunja,
  renovarSesionTunja
} from '../controllers/tunjaAuth.js';

const router = Router();

router.post('/tunja/auth/register', registrarEnTunja);
router.post('/tunja/auth/login', iniciarSesionTunja);
router.post('/tunja/auth/refresh', renovarSesionTunja);
router.post('/tunja/auth/logout', cerrarSesionTunja);
router.get('/tunja/auth/me', obtenerUsuarioTunja);

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);

router.use(autenticarSesion);
router.get('/sesion', (req, res) => {
  res.status(200).json({
    mensaje: 'Sesión activa y renovada por actividad.',
    expira_en: new Date(req.sesionExpiraEn).toISOString(),
    data: req.usuario
  });
  router.post('/logout', async (req, res, next) => {
    try {
      await sesiones.revocar(req.sesionTokenHash, Date.now());
      return res.status(200).json({ mensaje: 'Sesión cerrada correctamente.' });
    } catch (error) {
      return next(error);
    }
  });
});

export default router;
