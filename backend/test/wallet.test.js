import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, test } from 'node:test';
import { once } from 'node:events';

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'meditunja-wallet-'));
process.env.DB_PATH = path.join(carpetaTemporal, 'test.db');
process.env.LOG_PATH = path.join(carpetaTemporal, 'app.log');
process.env.TUNJA_API = 'https://tunja-api.test/api/v1';
process.env.TUNJA_CLAVE = 'clave-de-prueba';

const [{ default: app }, { ready, db }, { ejecutar }] = await Promise.all([
  import('../server.js'),
  import('../src/config/db.js'),
  import('../src/repositories/sqlite.js')
]);

await ready;
await ejecutar(
  'run',
  `INSERT INTO usuarios_tunja (
    tipo_documento, numero_documento, email, estado_afiliacion
  ) VALUES
    ('CC', '1234567890', 'wallet@example.com', 'aprobado'),
    ('CC', '1234567891', 'wallet-sin-tarjeta@example.com', 'aprobado')`
);
await ejecutar(
  'run',
  `INSERT INTO tarjetas_nfc (usuario_id, email, uid)
   VALUES ('17', 'wallet@example.com', 'AABBCCDD')`
);

const llamadasTunja = [];
const fetchOriginal = globalThis.fetch;
globalThis.fetch = async (input, opciones = {}) => {
  const url = new URL(input);
  if (url.origin !== 'https://tunja-api.test') {
    return fetchOriginal(input, opciones);
  }

  const headers = new Headers(opciones.headers);
  llamadasTunja.push({
    method: opciones.method || 'GET',
    path: url.pathname,
    headers,
    body: opciones.body
  });

  if (url.pathname === '/api/v1/auth/me') {
    if (headers.get('authorization') === 'Bearer wallet-sin-tarjeta') {
      return Response.json({
        usuario: {
          id: 18,
          email: 'wallet-sin-tarjeta@example.com',
          descuento: 0
        }
      });
    }
    return Response.json({
      usuario: {
        id: 17,
        email: 'wallet@example.com',
        descuento: 0
      }
    });
  }
  if (url.pathname === '/api/v1/wallet' && (!opciones.method || opciones.method === 'GET')) {
    return Response.json({ saldo: 25000 });
  }
  if (url.pathname === '/api/v1/wallet/topup' && opciones.method === 'POST') {
    return Response.json({
      id: 901,
      monto: JSON.parse(opciones.body).monto,
      saldo: 45000
    });
  }
  return Response.json({ error: 'ruta_desconocida' }, { status: 404 });
};

const servidor = app.listen(0);
await once(servidor, 'listening');
const baseUrl = `http://127.0.0.1:${servidor.address().port}`;
const token = 'token-de-prueba';

after(async () => {
  globalThis.fetch = fetchOriginal;
  await new Promise((resolve, reject) => {
    servidor.close((error) => error ? reject(error) : resolve());
  });
  await new Promise((resolve, reject) => {
    db.close((error) => error ? reject(error) : resolve());
  });
  fs.rmSync(carpetaTemporal, { recursive: true, force: true });
});

test('consulta saldo y acredita recargas usando la clave solo en el backend', async () => {
  const autorizacion = { Authorization: `Bearer ${token}` };
  const consulta = await fetchOriginal(`${baseUrl}/api/wallet`, {
    headers: autorizacion
  });
  assert.equal(consulta.status, 200);
  assert.deepEqual(await consulta.json(), { data: { saldo: 25000 } });

  const recarga = await fetchOriginal(`${baseUrl}/api/wallet/topup`, {
    method: 'POST',
    headers: {
      ...autorizacion,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ monto: 20000 })
  });
  assert.equal(recarga.status, 200);
  assert.deepEqual(await recarga.json(), {
    mensaje: 'El saldo fue acreditado en tu billetera TunjaAPI.',
    data: { id: 901, monto: 20000, saldo: 45000 },
    saldo: 45000
  });

  const solicitudTopup = llamadasTunja.find((llamada) =>
    llamada.path === '/api/v1/wallet/topup'
  );
  assert.ok(solicitudTopup);
  assert.equal(solicitudTopup.headers.get('x-api-key'), 'clave-de-prueba');
  assert.equal(solicitudTopup.headers.get('authorization'), `Bearer ${token}`);
  assert.deepEqual(JSON.parse(solicitudTopup.body), {
    monto: 20000,
    concepto: 'Recarga de saldo MediTunja'
  });
});

test('rechaza montos fuera de rango antes de llamar a TunjaAPI', async () => {
  const llamadasAntes = llamadasTunja.filter((llamada) =>
    llamada.path === '/api/v1/wallet/topup'
  ).length;
  const respuesta = await fetchOriginal(`${baseUrl}/api/wallet/topup`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ monto: 99 })
  });

  assert.equal(respuesta.status, 400);
  assert.equal((await respuesta.json()).error, 'monto_fuera_de_rango');
  assert.equal(
    llamadasTunja.filter((llamada) => llamada.path === '/api/v1/wallet/topup').length,
    llamadasAntes
  );
});

test('no consulta ni recarga saldo si el usuario no tiene tarjeta vinculada', async () => {
  const llamadasSaldoAntes = llamadasTunja.filter((llamada) =>
    llamada.path === '/api/v1/wallet' ||
    llamada.path === '/api/v1/wallet/topup'
  ).length;
  const autorizacion = { Authorization: 'Bearer wallet-sin-tarjeta' };

  const consulta = await fetchOriginal(`${baseUrl}/api/wallet`, {
    headers: autorizacion
  });
  assert.equal(consulta.status, 403);
  assert.equal((await consulta.json()).error, 'tarjeta_no_vinculada');

  const recarga = await fetchOriginal(`${baseUrl}/api/wallet/topup`, {
    method: 'POST',
    headers: {
      ...autorizacion,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ monto: 20000 })
  });
  assert.equal(recarga.status, 403);
  assert.equal((await recarga.json()).error, 'tarjeta_no_vinculada');
  assert.equal(
    llamadasTunja.filter((llamada) =>
      llamada.path === '/api/v1/wallet' ||
      llamada.path === '/api/v1/wallet/topup'
    ).length,
    llamadasSaldoAntes
  );
});
