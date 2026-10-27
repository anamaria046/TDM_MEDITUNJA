import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import test from 'node:test';

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'meditunja-auth-'));
process.env.DB_PATH = path.join(carpetaTemporal, 'test.db');
process.env.LOG_PATH = path.join(carpetaTemporal, 'app.log');

const [{ default: app }, { ready }, { ejecutar }] = await Promise.all([
  import('../server.js'),
  import('../src/config/db.js'),
  import('../src/repositories/sqlite.js')
]);

await ready;
const servidor = app.listen(0);
await once(servidor, 'listening');
const baseUrl = `http://127.0.0.1:${servidor.address().port}`;
const contrasena = '  clave privada  ';

async function post(ruta, cuerpo) {
  return fetch(`${baseUrl}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });
}

async function registrar(numeroDocumento, email = `ana${numeroDocumento}@example.com`) {
  return post('/api/registro', {
    tipo_documento: 'CC',
    numero_documento: numeroDocumento,
    nombres: 'Ana María',
    apellidos: 'Pérez Gómez',
    email,
    telefono: '3001234567',
    contrasena
  });
}

test('registro y sesiones cumplen controles de estado y confidencialidad', async () => {
  try {
    const registroInvalido = await post('/api/registro', {});
    assert.equal(registroInvalido.status, 400);

    const registro = await registrar('1020304050');
    assert.equal(registro.status, 201);
    const datosRegistro = await registro.json();
    assert.equal(datosRegistro.data.estado_registro, 'pendiente');
    assert.equal('password_hash' in datosRegistro.data, false);
    assert.equal('contrasena' in datosRegistro.data, false);

    const duplicado = await registrar('1020304050');
    assert.equal(duplicado.status, 409);
    assert.equal((await duplicado.json()).error, 'Documento duplicado');

    const emailDuplicado = await registrar('1020304051', 'ana1020304050@example.com');
    assert.equal(emailDuplicado.status, 409);
    assert.equal((await emailDuplicado.json()).error, 'Correo duplicado');

    const credencialesIncompletas = await post('/api/login', {});
    assert.equal(credencialesIncompletas.status, 400);

    const credenciales = {
      tipo_documento: 'CC',
      numero_documento: '1020304050',
      contrasena
    };
    const credencialesIncorrectas = await post('/api/login', {
      ...credenciales,
      contrasena: 'otra-clave'
    });
    assert.equal(credencialesIncorrectas.status, 401);

    const usuarioInexistente = await post('/api/login', {
      ...credenciales,
      numero_documento: '9999999999'
    });
    assert.equal(usuarioInexistente.status, 401);

    const pendiente = await post('/api/login', credenciales);
    assert.equal(pendiente.status, 403);
    assert.equal((await pendiente.json()).error, 'Cuenta pendiente');

    const usuario = await ejecutar(
      'get',
      'SELECT id_usuario, password_hash FROM usuarios WHERE numero_documento = ?',
      ['1020304050']
    );
    assert.match(usuario.password_hash, /^[a-f0-9]{32}:[a-f0-9]{128}$/i);
    assert.equal(usuario.password_hash.includes(contrasena), false);
    await assert.rejects(
      ejecutar('run', 'UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?', [
        contrasena,
        usuario.id_usuario
      ])
    );

    await ejecutar(
      'run',
      "UPDATE usuarios SET estado_registro = 'aprobado' WHERE id_usuario = ?",
      [usuario.id_usuario]
    );
    const login = await post('/api/login', credenciales);
    assert.equal(login.status, 200);
    const sesion = await login.json();
    assert.equal(sesion.expira_en_segundos, 1800);
    assert.equal(sesion.tipo_token, 'Bearer');
    assert.equal(sesion.data.estado_registro, 'aprobado');

    const tokenPersistido = await ejecutar(
      'get',
      'SELECT token_hash, expira_en, ultima_actividad FROM sesiones WHERE id_usuario = ?',
      [usuario.id_usuario]
    );
    assert.equal(
      tokenPersistido.token_hash,
      crypto.createHash('sha256').update(sesion.token).digest('hex')
    );
    assert.equal(sesion.expira_en, new Date(tokenPersistido.expira_en).toISOString());

    const tokenAusente = await fetch(`${baseUrl}/api/sesion`);
    assert.equal(tokenAusente.status, 401);
    const tokenMalformado = await fetch(`${baseUrl}/api/sesion`, {
      headers: { Authorization: 'Bearer token-invalido' }
    });
    assert.equal(tokenMalformado.status, 401);

    await new Promise((resolve) => setTimeout(resolve, 10));
    const inicioActividad = Date.now();
    const actividad = await fetch(`${baseUrl}/api/sesion`, {
      headers: { Authorization: `Bearer ${sesion.token}` }
    });
    assert.equal(actividad.status, 200);
    const datosActividad = await actividad.json();
    assert.equal(datosActividad.data.id_usuario, usuario.id_usuario);

    const sesionRenovada = await ejecutar(
      'get',
      'SELECT ultima_actividad, expira_en FROM sesiones WHERE id_usuario = ?',
      [usuario.id_usuario]
    );
    assert.ok(sesionRenovada.ultima_actividad >= inicioActividad);
    assert.ok(sesionRenovada.expira_en > tokenPersistido.expira_en);
    assert.ok(sesionRenovada.expira_en <= Date.now() + 1800000);

    const rechazadoRegistro = await registrar('2030405060');
    assert.equal(rechazadoRegistro.status, 201);
    await ejecutar(
      'run',
      "UPDATE usuarios SET estado_registro = 'rechazado' WHERE numero_documento = ?",
      ['2030405060']
    );
    const rechazado = await post('/api/login', {
      ...credenciales,
      numero_documento: '2030405060'
    });
    assert.equal(rechazado.status, 403);
    assert.equal((await rechazado.json()).error, 'Cuenta rechazada');

    await ejecutar(
      'run',
      "UPDATE usuarios SET estado_registro = 'rechazado' WHERE id_usuario = ?",
      [usuario.id_usuario]
    );
    const sesionNoAprobada = await fetch(`${baseUrl}/api/sesion`, {
      headers: { Authorization: `Bearer ${sesion.token}` }
    });
    assert.equal(sesionNoAprobada.status, 401);

    const usuarioRechazado = await ejecutar(
      'get',
      'SELECT password_hash FROM usuarios WHERE numero_documento = ?',
      ['2030405060']
    );
    await ejecutar(
      'run',
      "UPDATE usuarios SET estado_registro = 'aprobado' WHERE numero_documento = ?",
      ['2030405060']
    );
    const loginRechazado = await post('/api/login', {
      tipo_documento: 'CC',
      numero_documento: '2030405060',
      contrasena
    });
    assert.equal(loginRechazado.status, 200);
    const sesionExpirada = await loginRechazado.json();
    const hashTokenExpirado = crypto.createHash('sha256')
      .update(sesionExpirada.token)
      .digest('hex');
    await ejecutar(
      'run',
      'UPDATE sesiones SET expira_en = ? WHERE token_hash = ?',
      [Date.now() - 1, hashTokenExpirado]
    );
    const respuestaSesionExpirada = await fetch(`${baseUrl}/api/sesion`, {
      headers: { Authorization: `Bearer ${sesionExpirada.token}` }
    });
    assert.equal(respuestaSesionExpirada.status, 401);

    const respuestaRutaInexistente = await fetch(`${baseUrl}/no-existe`);
    assert.equal(respuestaRutaInexistente.status, 404);

    const log = fs.readFileSync(process.env.LOG_PATH, 'utf8');
    assert.equal(log.includes(contrasena), false);
    assert.equal(log.includes(sesion.token), false);
    assert.equal(log.includes(sesionExpirada.token), false);
    assert.equal(log.includes(usuarioRechazado.password_hash), false);
  } finally {
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
