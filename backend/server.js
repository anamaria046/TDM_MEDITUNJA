import express from 'express';
import corsConfig from './middlewares/corsConfig.js';
import { logger } from './middlewares/logger.js';
import { limpiarEntradas } from './middlewares/validaciones.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errorHandler.js';

const app = express();
const puerto = 3001;

app.use(corsConfig);
app.use(logger);
app.use(express.json());
app.use(limpiarEntradas);

app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor MediTunja funcionando' });
});

app.use(rutaNoEncontrada);
app.use(manejarErrores);

app.listen(puerto, () => {
  console.log('Servidor corriendo en http://localhost:' + puerto);
});