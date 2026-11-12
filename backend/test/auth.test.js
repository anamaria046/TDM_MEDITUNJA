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
process.env.TUNJA_API = 'https://tunja-api.test/api/v1';
process.env.TUNJA_CLAVE = 'clave-de-prueba';

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
const fetchLocal = globalThis.fetch;

async function post(ruta, cuerpo) {
  return fetchLocal(`${baseUrl}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });
}

async function postRegistroTunja(
  datos,
  contenido = '%PDF-1.7\ncomprobante de prueba',
  mime = 'application/pdf'
) {
  const formulario = new FormData();
  for (const [nombre, valor] of Object.entries(datos)) {
    formulario.append(nombre, valor);
  }
  formulario.append(
    'comprobante',
    new Blob([contenido], { type: mime }),
    'comprobante.pdf'
  );
  return fetchLocal(`${baseUrl}/api/tunja/auth/register`, {
    method: 'POST',
    body: formulario
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
    fecha_nacimiento: '1995-08-14',
    sexo: 'F',
    eps: 'EPS Sura',
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
    const datosAfiliacion = await ejecutar(
      'get',
      'SELECT fecha_nacimiento, sexo, eps FROM usuarios WHERE numero_documento = ?',
      ['1020304050']
    );
    assert.deepEqual(datosAfiliacion, {
      fecha_nacimiento: '1995-08-14',
      sexo: 'F',
      eps: 'EPS Sura'
    });

    const fechaInvalida = await post('/api/registro', {
      tipo_documento: 'CC',
      numero_documento: '1020304052',
      nombres: 'Ana',
      apellidos: 'Pérez',
      email: 'fecha-invalida@example.com',
      contrasena,
      fecha_nacimiento: '2026-02-31',
      sexo: 'F',
      eps: 'EPS Sura'
    });
    assert.equal(fechaInvalida.status, 400);

    const sexoInvalido = await post('/api/registro', {
      tipo_documento: 'CC',
      numero_documento: '1020304053',
      nombres: 'Ana',
      apellidos: 'Pérez',
      email: 'sexo-invalido@example.com',
      contrasena,
      fecha_nacimiento: '1995-08-14',
      sexo: 'X',
      eps: 'EPS Sura'
    });
    assert.equal(sexoInvalido.status, 400);

    for (const [tipo_documento, numero_documento] of [
      ['CC', '1234AB'],
      ['TI', '12345678901'],
      ['PAS', 'A1234567']
    ]) {
      const documentoInvalido = await post('/api/registro', {
        tipo_documento,
        numero_documento,
        nombres: 'Ana',
        apellidos: 'Pérez',
        email: `${tipo_documento}-${numero_documento}@example.com`,
        contrasena,
        eps: 'EPS Sura'
      });
      assert.equal(documentoInvalido.status, 400);
    }

    const pasaporteValido = await post('/api/registro', {
      tipo_documento: 'PAS',
      numero_documento: 'ab123456',
      nombres: 'Ana',
      apellidos: 'Pérez',
      email: 'pasaporte@example.com',
      contrasena,
      eps: 'EPS Sura'
    });
    assert.equal(pasaporteValido.status, 201);

    const duplicado = await registrar('1020304050');
    assert.equal(duplicado.status, 409);
    assert.equal((await duplicado.json()).error, 'Documento duplicado');

    const emailDuplicado = await registrar('1020304051', 'ana1020304050@example.com');
    assert.equal(emailDuplicado.status, 409);
    assert.equal((await emailDuplicado.json()).error, 'Correo duplicado');

    const credencialesIncompletas = await post('/api/login', {});
    assert.equal(credencialesIncompletas.status, 400);
    const nitEnLoginDeAfiliados = await post('/api/login', {
      tipo_documento: 'NIT',
      numero_documento: '900156264-2',
      contrasena
    });
    assert.equal(nitEnLoginDeAfiliados.status, 400);
    for (const [tipo_documento, numero_documento] of [
      ['CC', '1234AB'],
      ['TI', '12345678901'],
      ['PAS', 'A1234567']
    ]) {
      const documentoInvalido = await post('/api/login', {
        tipo_documento,
        numero_documento,
        contrasena
      });
      assert.equal(documentoInvalido.status, 400);
    }

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

    const tokenAusente = await fetchLocal(`${baseUrl}/api/sesion`);
    assert.equal(tokenAusente.status, 401);
    const tokenMalformado = await fetchLocal(`${baseUrl}/api/sesion`, {
      headers: { Authorization: 'Bearer token-invalido' }
    });
    assert.equal(tokenMalformado.status, 401);

    await new Promise((resolve) => setTimeout(resolve, 10));
    const inicioActividad = Date.now();
    const actividad = await fetchLocal(`${baseUrl}/api/sesion`, {
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
    const sesionNoAprobada = await fetchLocal(`${baseUrl}/api/sesion`, {
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
    const respuestaSesionExpirada = await fetchLocal(`${baseUrl}/api/sesion`, {
      headers: { Authorization: `Bearer ${sesionExpirada.token}` }
    });
    assert.equal(respuestaSesionExpirada.status, 401);

    const ultimoRegistro = await registrar('3040506070');
    assert.equal(ultimoRegistro.status, 201);
    await ejecutar(
      'run',
      "UPDATE usuarios SET estado_registro = 'aprobado' WHERE numero_documento = ?",
      ['3040506070']
    );
    const ultimoLogin = await post('/api/login', {
      tipo_documento: 'CC',
      numero_documento: '3040506070',
      contrasena
    });
    assert.equal(ultimoLogin.status, 200);
    const sesionParaCerrar = await ultimoLogin.json();
    const cierreSesion = await fetchLocal(`${baseUrl}/api/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sesionParaCerrar.token}` }
    });
    assert.equal(cierreSesion.status, 200);
    const tokenRevocado = await fetchLocal(`${baseUrl}/api/sesion`, {
      headers: { Authorization: `Bearer ${sesionParaCerrar.token}` }
    });
    assert.equal(tokenRevocado.status, 401);

    const respuestaRutaInexistente = await fetchLocal(`${baseUrl}/no-existe`);
    assert.equal(respuestaRutaInexistente.status, 404);

    const fetchTunjaOriginal = globalThis.fetch;
    const peticionesTunja = [];
    let tarjetaNuevaRegistrada = false;
    let tarjetaNuevaActiva = true;
    let usuarioTarjetaIdTunja = 99;
    let correoTarjetaTunja = 'ana@example.com';
    globalThis.fetch = async (url, opciones) => {
      peticionesTunja.push({ url, opciones });
      if (url.endsWith('/auth/logout')) return new Response(null, { status: 204 });
      if (url.endsWith('/auth/me') &&
          !['Bearer tunja-access-token', 'Bearer otro-usuario-token']
            .includes(opciones.headers?.Authorization)) {
        return new Response(JSON.stringify({ error: 'token_expirado' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (url.endsWith('/cards/AABBCCDDEEFF') &&
          opciones.method === 'DELETE') {
        return new Response(null, { status: 204 });
      }
      if (url.endsWith('/cards/AABBCCDDEEFF') &&
          opciones.method !== 'POST' &&
          !tarjetaNuevaRegistrada) {
        return new Response(JSON.stringify({ error: 'tarjeta_no_encontrada' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (url.endsWith('/cards') && opciones.method === 'POST') {
        tarjetaNuevaRegistrada = true;
        const tarjeta = JSON.parse(opciones.body);
        return new Response(JSON.stringify({
          uid: tarjeta.uid,
          activa: true,
          usuario: {
            id: usuarioTarjetaIdTunja,
            email: correoTarjetaTunja,
            perfil: 'estudiante',
            descuento: 10
          }
        }), { status: 201, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.endsWith('/cards/04A1B2C3D4E5F6') ||
          url.endsWith('/cards/AABBCCDDEEFF')) {
        return new Response(JSON.stringify({
          uid: url.endsWith('/cards/04A1B2C3D4E5F6') ? '04A1B2C3D4E5F6' : 'AABBCCDDEEFF',
          activa: tarjetaNuevaActiva,
          usuario: {
            id: usuarioTarjetaIdTunja,
            email: correoTarjetaTunja,
            perfil: 'estudiante',
            descuento: 10
          }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.endsWith('/users/99/wallet')) {
        return new Response(JSON.stringify({ usuario_id: 99, saldo: 42000, moneda: 'COP' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (url.endsWith('/users/99/wallet/topup')) {
        return new Response(JSON.stringify({ operacion: 'recarga', monto: 1000, saldo: 43000 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const esOtroUsuario = opciones.headers?.Authorization === 'Bearer otro-usuario-token';
      const resultado = {
        usuario: {
          id: esOtroUsuario ? 100 : 99,
          nombre: esOtroUsuario ? 'Otra Persona' : 'Ana Pérez',
          perfil: 'general',
          activo: true,
          email: esOtroUsuario ? 'otra@example.com' : 'ana@example.com',
          documento: esOtroUsuario ? '8888888888' : '3040506071'
        },
        acceso: 'tunja-access-token',
        refresco: 'tunja-refresh-token',
        expira_en: 900
      };
      return new Response(JSON.stringify(resultado), {
        status: url.endsWith('/auth/register') ? 201 : 200,
        headers: { 'Content-Type': 'application/json' }
      });
    };

    try {
      const comprobanteInvalido = await postRegistroTunja({
        email: 'falso@example.com',
        contrasena: 'clave Tunja segura',
        nombre: 'Persona Prueba',
        nombres: 'Persona',
        apellidos: 'Prueba',
        tipo_documento: 'CC',
        numero_documento: '3040506070',
        eps: 'Nueva EPS',
        perfil: 'general'
      }, 'no es un PDF');
      assert.equal(comprobanteInvalido.status, 400);

      const llamadasAntesDeDocumentosInvalidos = peticionesTunja.length;
      for (const [tipo_documento, numero_documento] of [
        ['CC', '1234AB'],
        ['CE', '12345678901'],
        ['PAS', 'A1234567']
      ]) {
        const documentoInvalido = await postRegistroTunja({
          email: `${tipo_documento}-${numero_documento}@example.com`,
          contrasena: 'clave Tunja segura',
          nombre: 'Persona Prueba',
          nombres: 'Persona',
          apellidos: 'Prueba',
          tipo_documento,
          numero_documento,
          eps: 'Nueva EPS',
          perfil: 'general'
        });
        assert.equal(documentoInvalido.status, 400);
      }
      assert.equal(peticionesTunja.length, llamadasAntesDeDocumentosInvalidos);

      const pasaporteValido = await postRegistroTunja({
        email: 'pasaporte@example.com',
        contrasena: 'clave Tunja segura',
        nombre: 'Persona Pasaporte',
        nombres: 'Persona',
        apellidos: 'Pasaporte',
        tipo_documento: 'PAS',
        numero_documento: 'ab123456',
        eps: 'Nueva EPS',
        perfil: 'general'
      });
      assert.equal(pasaporteValido.status, 201);
      assert.equal(JSON.parse(peticionesTunja.at(-1).opciones.body).numero_documento, 'AB123456');

      const tunjaRegistro = await postRegistroTunja({
        email: 'ANA@example.com',
        contrasena: 'clave Tunja segura',
        nombre: 'Ana Pérez',
        nombres: 'Ana',
        apellidos: 'Pérez',
        telefono: '3185777316',
        tipo_documento: 'CC',
        numero_documento: '3040506071',
        eps: 'Nueva EPS',
        perfil: 'general',
      });
      assert.equal(tunjaRegistro.status, 201);
      assert.equal((await tunjaRegistro.json()).estado_afiliacion, 'pendiente');
      const solicitudLocal = await ejecutar(
        'get',
        `SELECT telefono, eps FROM usuarios_tunja WHERE numero_documento = ?`,
        ['3040506071']
      );
      assert.deepEqual(solicitudLocal, { telefono: '3185777316', eps: 'Nueva EPS' });
      const peticionRegistro = peticionesTunja.at(-1);
      assert.equal(peticionRegistro.url, 'https://tunja-api.test/api/v1/auth/register');
      assert.equal(peticionRegistro.opciones.headers['X-API-Key'], process.env.TUNJA_CLAVE);
      assert.deepEqual(JSON.parse(peticionRegistro.opciones.body), {
        email: 'ana@example.com',
        contrasena: 'clave Tunja segura',
        nombre: 'Ana Pérez',
        documento: '3040506071',
        tipo_documento: 'CC',
        numero_documento: '3040506071',
        perfil: 'general',
        descuento: 0
      });

      const registroConTipoDocumento = await postRegistroTunja({
        email: 'persona@example.com',
        contrasena: 'clave Tunja segura',
        nombre: 'Persona Prueba',
        nombres: 'Persona',
        apellidos: 'Prueba',
        telefono: '3185777316',
        tipo_documento: 'TI',
        numero_documento: '12345678',
        eps: 'Sanitas',
        perfil: 'general',
      });
      assert.equal(registroConTipoDocumento.status, 201);
      assert.deepEqual(JSON.parse(peticionesTunja.at(-1).opciones.body), {
        email: 'persona@example.com',
        contrasena: 'clave Tunja segura',
        nombre: 'Persona Prueba',
        documento: '12345678',
        tipo_documento: 'TI',
        numero_documento: '12345678',
        perfil: 'general',
        descuento: 0
      });

      const tunjaLogin = await post('/api/tunja/auth/login', {
        tipo_documento: 'TI',
        numero_documento: '12345678',
        contrasena: 'clave Tunja segura'
      });
      assert.equal(tunjaLogin.status, 200);
      const respuestaLoginTunja = await tunjaLogin.json();
      assert.equal(respuestaLoginTunja.acceso, 'tunja-access-token');
      assert.equal(respuestaLoginTunja.usuario.estado_afiliacion, 'pendiente');
      assert.equal(respuestaLoginTunja.usuario.telefono, '3185777316');
      const peticionLogin = peticionesTunja.at(-1);
      assert.equal(peticionLogin.opciones.headers['X-API-Key'], undefined);
      assert.deepEqual(JSON.parse(peticionLogin.opciones.body), {
        email: 'persona@example.com',
        contrasena: 'clave Tunja segura'
      });

      const loginSinDocumento = await post('/api/tunja/auth/login', {
        email: 'ana@example.com',
        contrasena: 'clave Tunja segura'
      });
      assert.equal(loginSinDocumento.status, 400);
      const llamadasAntesDeLoginInvalido = peticionesTunja.length;
      for (const [tipo_documento, numero_documento] of [
        ['CC', '1234AB'],
        ['TI', '12345678901'],
        ['PAS', 'A1234567']
      ]) {
        const documentoInvalido = await post('/api/tunja/auth/login', {
          tipo_documento,
          numero_documento,
          contrasena: 'clave Tunja segura'
        });
        assert.equal(documentoInvalido.status, 400);
      }
      assert.equal(peticionesTunja.length, llamadasAntesDeLoginInvalido);

      const tunjaMe = await fetchLocal(`${baseUrl}/api/tunja/auth/me`, {
        headers: { Authorization: 'Bearer tunja-access-token' }
      });
      assert.equal(tunjaMe.status, 200);
      assert.equal((await tunjaMe.json()).usuario.telefono, '3185777316');
      assert.equal(peticionesTunja.at(-1).opciones.headers.Authorization, 'Bearer tunja-access-token');

      await ejecutar(
        'run',
        "UPDATE usuarios_tunja SET estado_afiliacion = 'aprobado' WHERE lower(email) = lower(?)",
        ['ana@example.com']
      );
      const uidInvalido = await fetchLocal(`${baseUrl}/api/nfc/tarjeta`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer tunja-access-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: 'not-a-uid' })
      });
      assert.equal(uidInvalido.status, 400);

      const vinculacionNfc = await fetchLocal(`${baseUrl}/api/nfc/tarjeta`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer tunja-access-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: '04a1b2c3d4e5f6' })
      });
      assert.equal(vinculacionNfc.status, 200);
      assert.deepEqual((await vinculacionNfc.json()).data, {
        vinculada: true,
        identificador: 'E5F6'
      });
      const uidPersistido = await ejecutar(
        'get',
        'SELECT uid FROM tarjetas_nfc WHERE email = ?',
        ['ana@example.com']
      );
      assert.equal(uidPersistido.uid, '04A1B2C3D4E5F6');

      const loginConTarjeta = await post('/api/tunja/auth/card-login', {
        uid: '04a1b2c3d4e5f6'
      });
      assert.equal(loginConTarjeta.status, 200);
      const sesionTarjeta = await loginConTarjeta.json();
      assert.equal(sesionTarjeta.usuario.email, 'ana@example.com');
      assert.equal(sesionTarjeta.usuario.id, 99);
      assert.equal(sesionTarjeta.usuario.estado_afiliacion, 'aprobado');
      assert.equal(sesionTarjeta.expira_en, 900);
      assert.equal(peticionesTunja.at(-1).url, 'https://tunja-api.test/api/v1/cards/04A1B2C3D4E5F6');
      assert.equal(peticionesTunja.at(-1).opciones.headers['X-API-Key'], process.env.TUNJA_CLAVE);

      const estadoTarjetaVinculada = await fetchLocal(`${baseUrl}/api/nfc/tarjeta`, {
        headers: { Authorization: 'Bearer tunja-access-token' }
      });
      assert.equal(estadoTarjetaVinculada.status, 200);
      const datosTarjetaVinculada = await estadoTarjetaVinculada.json();
      const datosTarjetaLocal = await ejecutar(
        'get',
        'SELECT usuario_id, email FROM tarjetas_nfc WHERE uid = ?',
        ['04A1B2C3D4E5F6']
      );
      assert.equal(datosTarjetaVinculada.data.habilitada, true, JSON.stringify({
        respuesta: datosTarjetaVinculada,
        local: datosTarjetaLocal,
        tunja: { id: usuarioTarjetaIdTunja, email: correoTarjetaTunja }
      }));

      usuarioTarjetaIdTunja = 100;
      correoTarjetaTunja = 'otra@example.com';
      const estadoTarjetaInconsistente = await fetchLocal(`${baseUrl}/api/nfc/tarjeta`, {
        headers: { Authorization: 'Bearer tunja-access-token' }
      });
      assert.equal(estadoTarjetaInconsistente.status, 200);
      const datosTarjetaInconsistente = (await estadoTarjetaInconsistente.json()).data;
      assert.equal(datosTarjetaInconsistente.vinculada, true);
      assert.equal(datosTarjetaInconsistente.habilitada, false);
      assert.equal(datosTarjetaInconsistente.estado, 'asociacion_inconsistente');

      const loginTarjetaInconsistente = await post('/api/tunja/auth/card-login', {
        uid: '04A1B2C3D4E5F6'
      });
      assert.equal(loginTarjetaInconsistente.status, 401);
      assert.equal((await loginTarjetaInconsistente.json()).error, 'tarjeta_asociacion_inconsistente');
      usuarioTarjetaIdTunja = 99;
      correoTarjetaTunja = 'ana@example.com';

      const usuarioSesionTarjeta = await fetchLocal(`${baseUrl}/api/tunja/auth/me`, {
        headers: { Authorization: `Bearer ${sesionTarjeta.acceso}` }
      });
      assert.equal(usuarioSesionTarjeta.status, 200);
      assert.equal((await usuarioSesionTarjeta.json()).email, 'ana@example.com');

      const saldoSesionTarjeta = await fetchLocal(`${baseUrl}/api/wallet`, {
        headers: { Authorization: `Bearer ${sesionTarjeta.acceso}` }
      });
      assert.equal(saldoSesionTarjeta.status, 200);
      assert.equal((await saldoSesionTarjeta.json()).data.saldo, 42000);
      assert.equal(peticionesTunja.at(-1).url, 'https://tunja-api.test/api/v1/users/99/wallet');
      assert.equal(peticionesTunja.at(-1).opciones.headers['X-API-Key'], process.env.TUNJA_CLAVE);

      const refrescoTarjeta = await post('/api/tunja/auth/refresh', {
        refresco: sesionTarjeta.refresco
      });
      assert.equal(refrescoTarjeta.status, 200);
      const sesionTarjetaRenovada = await refrescoTarjeta.json();
      assert.notEqual(sesionTarjetaRenovada.acceso, sesionTarjeta.acceso);

      const cierreTarjeta = await post('/api/tunja/auth/logout', {
        refresco: sesionTarjetaRenovada.refresco
      });
      assert.equal(cierreTarjeta.status, 204);
      const tokenTarjetaRevocado = await fetchLocal(`${baseUrl}/api/tunja/auth/me`, {
        headers: { Authorization: `Bearer ${sesionTarjetaRenovada.acceso}` }
      });
      assert.equal(tokenTarjetaRevocado.status, 401);

      const llamadasAntesDeUidDesconocido = peticionesTunja.length;
      const uidDesconocido = await post('/api/tunja/auth/card-login', {
        uid: 'AABBCCDDEEFF'
      });
      assert.equal(uidDesconocido.status, 401);
      assert.equal(peticionesTunja.length, llamadasAntesDeUidDesconocido);

      const uidLoginInvalido = await post('/api/tunja/auth/card-login', {
        uid: 'uid-invalido'
      });
      assert.equal(uidLoginInvalido.status, 400);

      await ejecutar(
        'run',
        `INSERT INTO usuarios_tunja (
          tipo_documento, numero_documento, email, estado_afiliacion
        ) VALUES ('CC', '8888888888', 'otra@example.com', 'aprobado')`
      );
      const uidDuplicado = await fetchLocal(`${baseUrl}/api/nfc/tarjeta`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer otro-usuario-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: '04A1B2C3D4E5F6' })
      });
      assert.equal(uidDuplicado.status, 409, await uidDuplicado.clone().text());
      assert.equal((await uidDuplicado.json()).error, 'tarjeta_ya_vinculada');
      const tarjetaSinCambios = await ejecutar(
        'get',
        'SELECT usuario_id FROM tarjetas_nfc WHERE uid = ?',
        ['04A1B2C3D4E5F6']
      );
      assert.equal(tarjetaSinCambios.usuario_id, '99');

      const loginTarjetaAntesDeReemplazo = await post('/api/tunja/auth/card-login', {
        uid: '04A1B2C3D4E5F6'
      });
      assert.equal(loginTarjetaAntesDeReemplazo.status, 200);
      const vinculacionTarjetaNueva = await fetchLocal(`${baseUrl}/api/nfc/tarjeta`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer tunja-access-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid: 'AABBCCDDEEFF' })
      });
      assert.equal(vinculacionTarjetaNueva.status, 200);
      const sesionTarjetaAnterior = await fetchLocal(`${baseUrl}/api/tunja/auth/me`, {
        headers: { Authorization: `Bearer ${(await loginTarjetaAntesDeReemplazo.json()).acceso}` }
      });
      assert.equal(sesionTarjetaAnterior.status, 401);
      const peticionCrearTarjeta = peticionesTunja.find(({ url, opciones }) =>
        url.endsWith('/cards') && opciones.method === 'POST'
      );
      assert.deepEqual(JSON.parse(peticionCrearTarjeta.opciones.body), {
        uid: 'AABBCCDDEEFF',
        usuario_id: 99
      });

      const loginTarjetaNueva = await post('/api/tunja/auth/card-login', {
        uid: 'AABBCCDDEEFF'
      });
      assert.equal(loginTarjetaNueva.status, 200);
      const datosSesionTarjetaNueva = await loginTarjetaNueva.json();
      tarjetaNuevaActiva = false;
      const loginTarjetaDesactivada = await post('/api/tunja/auth/card-login', {
        uid: 'AABBCCDDEEFF'
      });
      assert.equal(loginTarjetaDesactivada.status, 401);
      tarjetaNuevaActiva = true;

      const desvinculacionTarjeta = await fetchLocal(`${baseUrl}/api/nfc/tarjeta`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${datosSesionTarjetaNueva.acceso}` }
      });
      assert.equal(desvinculacionTarjeta.status, 200);
      const sesionTrasDesvinculacion = await fetchLocal(`${baseUrl}/api/tunja/auth/me`, {
        headers: { Authorization: `Bearer ${datosSesionTarjetaNueva.acceso}` }
      });
      assert.equal(sesionTrasDesvinculacion.status, 401);

      const tunjaRefresh = await post('/api/tunja/auth/refresh', {
        refresco: 'tunja-refresh-token'
      });
      assert.equal(tunjaRefresh.status, 200);
      assert.equal((await tunjaRefresh.json()).acceso, 'tunja-access-token');
      assert.deepEqual(JSON.parse(peticionesTunja.at(-1).opciones.body), {
        refresco: 'tunja-refresh-token'
      });

      const tunjaLogout = await post('/api/tunja/auth/logout', {
        refresco: 'tunja-refresh-token'
      });
      assert.equal(tunjaLogout.status, 204);
      assert.deepEqual(JSON.parse(peticionesTunja.at(-1).opciones.body), {
        refresco: 'tunja-refresh-token'
      });
    } finally {
      globalThis.fetch = fetchTunjaOriginal;
    }

    const claveTunjaOriginal = process.env.TUNJA_CLAVE;
    delete process.env.TUNJA_CLAVE;
    const registroSinClave = await postRegistroTunja({
      email: 'sin-clave@example.com',
      contrasena: 'clave Tunja segura',
      nombre: 'Persona Prueba',
      nombres: 'Persona',
      apellidos: 'Prueba',
      tipo_documento: 'CC',
      numero_documento: '3040506072',
      eps: 'Nueva EPS'
    });
    assert.equal(registroSinClave.status, 503);
    process.env.TUNJA_CLAVE = claveTunjaOriginal;

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
