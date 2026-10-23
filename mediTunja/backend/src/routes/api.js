import { Router } from 'express';
import { iniciarSesion } from '../controllers/login.js';
import { registrarUsuario } from '../controllers/registro.js';
import { autenticarSesion } from '../middleware/autenticarSesion.js';

const router = Router();

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);

router.use(autenticarSesion);
router.get('/sesion', (req, res) => {
  res.status(200).json({
    mensaje: 'Sesión activa y renovada por actividad.',
    expira_en: new Date(req.sesionExpiraEn).toISOString(),
    data: req.usuario
  });
});

export default router;
