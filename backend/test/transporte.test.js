import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import test from 'node:test';

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'meditunja-transporte-'));
process.env.DB_PATH = path.join(carpetaTemporal, 'test.db');
process.env.LOG_PATH = path.join(carpetaTemporal, 'app.log');
process.env.TUNJA_API = 'https://tunja-api.test/api/v1';

const [{ default: app }, { ready }, { ejecutar }] = await Promise.all([
  import('../server.js'),
  import('../src/config/db.js'),
  import('../src/repositories/sqlite.js')
]);

await ready;
await ejecutar(
  'run',
  `INSERT INTO usuarios_tunja (
     tipo_documento, numero_documento, email, nombres, apellidos, eps, estado_afiliacion
   ) VALUES ('CC', '8000000001', 'transporte@example.test', 'Usuario', 'Transporte',
     'Nueva EPS', 'aprobado'),
     ('CC', '8000000002', 'sin-tarjeta@example.test', 'Usuario', 'Sin Tarjeta',
     'Nueva EPS', 'aprobado')`
);
await ejecutar(
  'run',
  `INSERT INTO tarjetas_nfc (usuario_id, email, uid)
   VALUES ('101', 'transporte@example.test', 'AABBCC03')`
);
const { lastID: citaId } = await ejecutar(
  'run',
  `INSERT INTO citas (
     codigo_cita, usuario_id, ips, servicio, especialidad, fecha, hora,
     modalidad, costo, descuento_aplicado
   ) VALUES ('CITA-TRANSPORTE-1', '101', 'san-rafael', 'Cardiología',
     'Cardiología', '2099-12-30', '09:30', 'presencial', 120000, 0)`
);
const servidor = app.listen(0);
await once(servidor, 'listening');
const baseUrl = `http://127.0.0.1:${servidor.address().port}`;
const fetchOriginal = globalThis.fetch;
globalThis.fetch = async (url, opciones = {}) => {
  const sinTarjeta = opciones.headers?.Authorization === 'Bearer sin-tarjeta';
  return new Response(JSON.stringify({
    id: sinTarjeta ? 102 : 101,
    email: sinTarjeta ? 'sin-tarjeta@example.test' : 'transporte@example.test',
    perfil: 'general',
    descuento: 0
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

async function peticion(ruta, opciones = {}) {
  return fetchOriginal(`${baseUrl}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: 'Bearer usuario-transporte',
      ...opciones.headers
    }
  });
}

const solicitud = {
  citaId,
  tipoDiscapacidad: 'motora-silla-ruedas',
  requerimientos: ['rampa', 'anclaje'],
  viajaAcompanante: true,
  nombreAcompanante: 'Cuidador de prueba',
  direccionOrigen: 'Carrera 10 # 20-30',
  barrioSector: 'Centro',
  puntosReferencia: '',
  modalidadViaje: 'ida-y-regreso',
  declaracionVeracidad: true
};

test('solicitudes de transporte se guardan ligadas a una cita confirmada del paciente', async () => {
  try {
    const crear = await peticion('/api/transporte', {
      method: 'POST',
      body: JSON.stringify(solicitud)
    });
    assert.equal(crear.status, 201);
    const respuestaCrear = await crear.json();
    assert.equal(respuestaCrear.data.estado, 'solicitada');
    assert.equal(respuestaCrear.data.citaId, citaId);

    const sinTarjeta = await peticion('/api/transporte', {
      method: 'POST',
      body: JSON.stringify(solicitud),
      headers: { Authorization: 'Bearer sin-tarjeta' }
    });
    assert.equal(sinTarjeta.status, 403);
    assert.equal((await sinTarjeta.json()).error, 'tarjeta_no_vinculada');

    const listar = await peticion('/api/transporte');
    assert.equal(listar.status, 200);
    const solicitudes = (await listar.json()).data;
    assert.equal(solicitudes.length, 1);
    assert.equal(solicitudes[0].codigo_cita, 'CITA-TRANSPORTE-1');

    const duplicada = await peticion('/api/transporte', {
      method: 'POST',
      body: JSON.stringify(solicitud)
    });
    assert.equal(duplicada.status, 409);

    const citaAjena = await peticion('/api/transporte', {
      method: 'POST',
      body: JSON.stringify({ ...solicitud, citaId: citaId + 999 })
    });
    assert.equal(citaAjena.status, 404);

    const sinDeclaracion = await peticion('/api/transporte', {
      method: 'POST',
      body: JSON.stringify({ ...solicitud, citaId: citaId + 1000, declaracionVeracidad: false })
    });
    assert.equal(sinDeclaracion.status, 400);
  } finally {
    globalThis.fetch = fetchOriginal;
    await new Promise((resolve, reject) => {
      servidor.close((error) => error ? reject(error) : resolve());
    });
    const { db } = await import('../src/config/db.js');
    await new Promise((resolve, reject) => {
      db.close((error) => error ? reject(error) : resolve());
    });
    fs.rmSync(carpetaTemporal, { recursive: true, force: true });
  }
});
