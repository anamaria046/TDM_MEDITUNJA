import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import corsConfig from './middlewares/corsConfig.js';
import { logger } from './middlewares/logger.js';
import { limpiarEntradas } from './middlewares/validaciones.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errorHandler.js';
import rutasApi from './src/routes/api.js';
import { ready } from './src/config/db.js';

const app = express();

app.use(corsConfig);
app.use(logger);
app.use(express.json({ limit: '7mb' }));
app.use(limpiarEntradas);

app.get('/api/salud', (req, res) => {
  res.json({ ok: true, mensaje: 'Servidor MediTunja funcionando' });
});

app.use('/api', rutasApi);
app.use(rutaNoEncontrada);
app.use(manejarErrores);

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const puerto = Number(process.env.PORT || 3001);
  ready
    .then(() => {
      app.listen(puerto, () => {
        console.log(`Servidor MediTunja activo en http://localhost:${puerto}`);
      });
    })
    .catch((error) => {
      console.error('No se pudo inicializar la base de datos:', error.code || 'ERROR_INTERNO');
      process.exitCode = 1;
    });
}

export default app;