import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import test from 'node:test';

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'meditunja-admin-citas-'));
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
const contrasena = 'admin-citas-seguro';
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync(contrasena, salt, 64).toString('hex');
const hashContrasena = `${salt}:${hash}`;

async function peticion(ruta, opciones = {}) {
  return fetch(`${baseUrl}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...opciones.headers
    }
  });
}

async function iniciarSesion(numeroDocumento) {
  const respuesta = await peticion('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({
      tipo_documento: 'NIT',
      numero_documento: numeroDocumento,
      contrasena
    })
  });
  assert.equal(respuesta.status, 200);
  return (await respuesta.json()).token;
}

test('gestión de citas y métricas se limita a la EPS autenticada', async () => {
  try {
    await ejecutar(
      'run',
      `INSERT INTO usuarios (
         tipo_documento, numero_documento, nombres, apellidos, email, eps, rol,
         password_hash, activo, estado_registro
       ) VALUES
         ('NIT', '900111111-1', 'Admin', 'Sura', 'admin-sura@example.test', 'SURA',
          'administrador', ?, 1, 'aprobado'),
         ('NIT', '900222222-2', 'Admin', 'Nueva EPS', 'admin-nueva@example.test', 'Nueva EPS',
          'administrador', ?, 1, 'aprobado')`,
      [hashContrasena, hashContrasena]
    );
    await ejecutar(
      'run',
      `INSERT INTO usuarios_tunja (
         tipo_documento, numero_documento, tunja_usuario_id, email, nombres, apellidos,
         eps, estado_afiliacion
       ) VALUES
         ('CC', '7000000001', 'sura-1', 'paciente1@example.test', 'Paciente', 'Uno', 'Sura', 'aprobado'),
         ('CC', '7000000002', 'sura-2', 'paciente2@example.test', 'Paciente', 'Dos', 'EPS Sura', 'aprobado'),
         ('CC', '7000000003', 'nueva-1', 'paciente3@example.test', 'Paciente', 'Tres', 'Nueva EPS', 'aprobado')`
    );
    await ejecutar(
      'run',
      `INSERT INTO citas (
         codigo_cita, usuario_id, ips, servicio, especialidad, fecha, hora,
         modalidad, costo, descuento_aplicado
       ) VALUES
         ('CITA-SURA-1', 'sura-1', 'san-rafael', 'Cardiología', 'Cardiología',
          '2099-12-30', '09:30', 'presencial', 120000, 0),
         ('CITA-SURA-2', 'sura-2', 'san-rafael', 'Radiología', 'Radiología',
          '2099-12-30', '11:00', 'presencial', 120000, 0),
         ('CITA-NUEVA-1', 'nueva-1', 'clinica-chia', 'Cardiología', 'Cardiología',
          '2099-12-30', '09:30', 'presencial', 120000, 0)`
    );
    const sinSesion = await peticion('/api/admin/citas');
    assert.equal(sinSesion.status, 401);

    const tokenSura = await iniciarSesion('900111111-1');
    const tokenNueva = await iniciarSesion('900222222-2');
    const authSura = { Authorization: `Bearer ${tokenSura}` };

    const citas = await peticion('/api/admin/citas', { headers: authSura });
    assert.equal(citas.status, 200);
    const citasSura = (await citas.json()).data;
    assert.equal(citasSura.length, 2);
    assert.ok(citasSura.every((cita) => cita.correo.endsWith('@example.test')));

    const gestionTransporte = await peticion('/api/admin/transporte', {
      headers: authSura
    });
    assert.equal(gestionTransporte.status, 404);

    const actualizarTransporte = await peticion('/api/admin/transporte/1/estado', {
      method: 'PUT',
      headers: authSura,
      body: JSON.stringify({ estado: 'aceptada' })
    });
    assert.equal(actualizarTransporte.status, 404);
    const resumen = await peticion('/api/admin/resumen', { headers: authSura });
    assert.equal(resumen.status, 200);
    const metricas = (await resumen.json()).data;
    assert.equal(metricas.afiliadosActivos, 2);
    assert.equal(metricas.afiliadosTotales, 2);
    assert.equal(typeof metricas.citasEsteMes, 'number');

    const idSura = citasSura.find((cita) => cita.codigo_cita === 'CITA-SURA-1').id;
    const idNueva = (await (await peticion('/api/admin/citas', {
      headers: { Authorization: `Bearer ${tokenNueva}` }
    })).json()).data[0].id;

    const horarioOcupado = await peticion(`/api/admin/citas/${idSura}/reprogramar`, {
      method: 'PUT',
      headers: authSura,
      body: JSON.stringify({
        ips: 'san-rafael',
        fecha: '2099-12-30',
        hora: '11:00',
        motivo: 'Reasignación administrativa de prueba.'
      })
    });
    assert.equal(horarioOcupado.status, 409);

    const reprogramacion = await peticion(`/api/admin/citas/${idSura}/reprogramar`, {
      method: 'PUT',
      headers: authSura,
      body: JSON.stringify({
        ips: 'clinica-andes',
        fecha: '2099-12-31',
        hora: '11:00',
        motivo: 'Reasignación administrativa de prueba.'
      })
    });
    assert.equal(reprogramacion.status, 200);

    const accesoCruzado = await peticion(`/api/admin/citas/${idNueva}/cancelar`, {
      method: 'PUT',
      headers: authSura,
      body: JSON.stringify({ motivo: 'Prueba de aislamiento.' })
    });
    assert.equal(accesoCruzado.status, 404);

    const cancelacion = await peticion(`/api/admin/citas/${idSura}/cancelar`, {
      method: 'PUT',
      headers: authSura,
      body: JSON.stringify({ motivo: 'Cancelada por la EPS a solicitud del paciente.' })
    });
    assert.equal(cancelacion.status, 200);
    const citasActualizadas = (await (await peticion('/api/admin/citas', {
      headers: authSura
    })).json()).data;
    assert.equal(
      citasActualizadas.find((cita) => cita.id === idSura).estado,
      'cancelada'
    );
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
