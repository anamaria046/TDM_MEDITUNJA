import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import test from 'node:test';

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'meditunja-admin-'));
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
const contrasena = 'clave administrativa segura';

async function post(ruta, cuerpo) {
  return fetch(`${baseUrl}${ruta}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo)
  });
}

async function registrar(numeroDocumento, eps, email) {
  const respuesta = await post('/api/registro', {
    tipo_documento: 'CC',
    numero_documento: numeroDocumento,
    nombres: 'Nombre de prueba',
    apellidos: 'Apellido de prueba',
    email,
    telefono: '3001234567',
    fecha_nacimiento: '1995-08-14',
    sexo: 'F',
    eps,
    contrasena
  });
  assert.equal(respuesta.status, 201);
}

async function iniciarSesion(ruta, numeroDocumento) {
  const respuesta = await post(ruta, {
    tipo_documento: 'CC',
    numero_documento: numeroDocumento,
    contrasena
  });
  return { respuesta, datos: await respuesta.json() };
}

test('gestión administrativa autentica roles y persiste datos aislados por EPS', async () => {
  try {
    await registrar('5000000001', 'EPS Sura', 'admin-sura@example.test');
    await registrar('5000000002', 'Sura', 'afiliado-sura@example.test');
    await registrar('5000000003', 'Nueva EPS', 'afiliado-nueva@example.test');
    await ejecutar(
      'run',
      `UPDATE usuarios SET estado_registro = 'aprobado',
         rol = CASE WHEN numero_documento = ? THEN 'administrador' ELSE 'afiliado' END
       WHERE numero_documento IN (?, ?, ?)`,
      ['5000000001', '5000000001', '5000000002', '5000000003']
    );

    const sinToken = await fetch(`${baseUrl}/api/admin/afiliados`);
    assert.equal(sinToken.status, 401);

    const loginAfiliado = await iniciarSesion('/api/admin/login', '5000000002');
    assert.equal(loginAfiliado.respuesta.status, 403);

    const { respuesta: respuestaLogin, datos: sesionAdmin } =
      await iniciarSesion('/api/admin/login', '5000000001');
    assert.equal(respuestaLogin.status, 200);
    assert.equal(sesionAdmin.data.rol, 'administrador');
    assert.equal(sesionAdmin.data.eps, 'EPS Sura');
    const authorization = { Authorization: `Bearer ${sesionAdmin.token}` };

    const afiliados = await fetch(`${baseUrl}/api/admin/afiliados`, { headers: authorization });
    assert.equal(afiliados.status, 200);
    const resultadoAfiliados = await afiliados.json();
    assert.equal(resultadoAfiliados.data.length, 1);
    assert.equal(resultadoAfiliados.data[0].numeroDocumento, '5000000002');
    assert.equal('password_hash' in resultadoAfiliados.data[0], false);

    const estado = await fetch(`${baseUrl}/api/admin/afiliados/${resultadoAfiliados.data[0].id}/estado`, {
      method: 'PUT',
      headers: { ...authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'aprobado' })
    });
    assert.equal(estado.status, 200);

    const edicion = await fetch(`${baseUrl}/api/admin/afiliados/${resultadoAfiliados.data[0].id}`, {
      method: 'PUT',
      headers: { ...authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombres: 'Ana María',
        apellidos: 'Actualizada',
        tipoDocumento: 'CC',
        numeroDocumento: '5000000002',
        email: 'afiliado-sura@example.test',
        telefono: '3001234567',
        fechaNacimiento: '1995-08-14',
        sexo: 'F'
      })
    });
    assert.equal(edicion.status, 200);

    const convenio = await fetch(`${baseUrl}/api/admin/convenios`, {
      method: 'POST',
      headers: { ...authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({
      epsId: 'sura',
      epsNombre: 'SURA',
      epsSede: 'Sede Tunja',
      epsDireccion: 'Dirección EPS',
      ipsId: 'san-rafael',
      ipsNombre: 'Hospital San Rafael',
      ipsSede: 'Principal',
      ipsDireccion: 'Dirección IPS',
      portafolioId: 'integral',
      portafolioNombre: 'Atención integral',
      serviciosSeleccionados: ['srv-med-gen'],
      clausulaTransporte: true
      })
    });
    assert.equal(convenio.status, 201);
    const convenioCreado = (await convenio.json()).data;
    assert.equal(convenioCreado.epsNombre, 'EPS Sura');

    const conveniosPersistidos = await fetch(`${baseUrl}/api/admin/convenios`, {
      headers: authorization
    });
    assert.equal(conveniosPersistidos.status, 200);
    const listado = await conveniosPersistidos.json();
    assert.equal(listado.data.length, 1);
    assert.deepEqual(listado.data[0].serviciosSeleccionados, ['srv-med-gen']);
    assert.equal(listado.data[0].clausulaTransporte, true);

    const epsNoAutorizada = await fetch(`${baseUrl}/api/admin/convenios`, {
      method: 'POST',
      headers: { ...authorization, 'Content-Type': 'application/json' },
      body: JSON.stringify({ epsNombre: 'Nueva EPS' })
    });
    assert.equal(epsNoAutorizada.status, 403);

    await registrar('5000000004', 'Nueva EPS', 'admin-nueva@example.test');
    await ejecutar(
      'run',
      "UPDATE usuarios SET estado_registro = 'aprobado', rol = 'administrador' WHERE numero_documento = ?",
      ['5000000004']
    );
    const { datos: sesionOtraEps } = await iniciarSesion('/api/admin/login', '5000000004');
    const afiliadosOtraEps = await fetch(`${baseUrl}/api/admin/afiliados`, {
      headers: { Authorization: `Bearer ${sesionOtraEps.token}` }
    });
    assert.equal((await afiliadosOtraEps.json()).data.length, 1);
    const conveniosOtraEps = await fetch(`${baseUrl}/api/admin/convenios`, {
      headers: { Authorization: `Bearer ${sesionOtraEps.token}` }
    });
    assert.equal((await conveniosOtraEps.json()).data.length, 0);

    const convenioAjeno = await fetch(
      `${baseUrl}/api/admin/convenios/${encodeURIComponent(convenioCreado.id)}/desactivar`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sesionOtraEps.token}` }
      }
    );
    assert.equal(convenioAjeno.status, 404);

    const desactivar = await fetch(
      `${baseUrl}/api/admin/convenios/${encodeURIComponent(convenioCreado.id)}/desactivar`,
      { method: 'PUT', headers: authorization }
    );
    assert.equal(desactivar.status, 200);
    const guardado = await ejecutar('get', 'SELECT estado FROM convenios WHERE id = ?', [convenioCreado.id]);
    assert.equal(guardado.estado, 'Inactivo');

    const cierre = await fetch(`${baseUrl}/api/logout`, {
      method: 'POST',
      headers: authorization
    });
    assert.equal(cierre.status, 200);
    const sesionCerrada = await fetch(`${baseUrl}/api/admin/sesion`, { headers: authorization });
    assert.equal(sesionCerrada.status, 401);
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
