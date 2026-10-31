import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import test from 'node:test';

const carpetaTemporal = fs.mkdtempSync(path.join(os.tmpdir(), 'meditunja-citas-'));
process.env.DB_PATH = path.join(carpetaTemporal, 'test.db');
process.env.LOG_PATH = path.join(carpetaTemporal, 'app.log');
process.env.TUNJA_API = 'https://tunja-api.test/api/v1';

const [{ default: app }, { ready }, { ejecutar }] = await Promise.all([
  import('../server.js'),
  import('../src/config/db.js'),
  import('../src/repositories/sqlite.js')
]);

await ready;
const servidor = app.listen(0);
await once(servidor, 'listening');
const baseUrl = `http://127.0.0.1:${servidor.address().port}`;
const fetchOriginal = globalThis.fetch;
globalThis.fetch = async (url, opciones) => {
  const token = opciones.headers.Authorization;
  const usuario = token === 'Bearer usuario-dos'
    ? { id: 2, perfil: 'general', descuento: 0 }
    : { id: 1, perfil: 'estudiante', descuento: 15 };
  return new Response(JSON.stringify(usuario), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};

function fechaEnDias(dias) {
  const fecha = new Date(Date.now() - 5 * 60 * 60 * 1000);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

async function peticion(ruta, token, opciones = {}) {
  return fetchOriginal(`${baseUrl}${ruta}`, {
    ...opciones,
    headers: {
      ...(opciones.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opciones.headers
    }
  });
}

test('reservas validan disponibilidad, descuento, usuario y cancelación', async () => {
  try {
    const sinSesion = await peticion('/api/citas', null);
    assert.equal(sinSesion.status, 401);

    const fecha = fechaEnDias(3);
    const disponibilidad = await peticion(
      `/api/citas/disponibilidad?ips=san-rafael&fecha=${fecha}`,
      'usuario-uno'
    );
    assert.equal(disponibilidad.status, 200);
    assert.deepEqual((await disponibilidad.json()).horarios.map((horario) => horario.hora), [
      '08:00',
      '09:30',
      '11:00'
    ]);

    const datosReserva = {
      ips: 'san-rafael',
      servicio: 'cardio',
      fecha,
      hora: '09:30',
      modalidad: 'presencial'
    };
    const reserva = await peticion('/api/citas', 'usuario-uno', {
      method: 'POST',
      body: JSON.stringify(datosReserva)
    });
    assert.equal(reserva.status, 201);
    const resultadoReserva = await reserva.json();
    assert.equal(resultadoReserva.cita.codigo_cita.startsWith('CITA-'), true);
    assert.equal(resultadoReserva.cita.descuento_aplicado, 18000);
    assert.equal(resultadoReserva.total_a_pagar, 102000);

    const citaDuplicada = await peticion('/api/citas', 'usuario-dos', {
      method: 'POST',
      body: JSON.stringify(datosReserva)
    });
    assert.equal(citaDuplicada.status, 409);

    const ocupada = await peticion(
      `/api/citas/disponibilidad?ips=san-rafael&fecha=${fecha}`,
      'usuario-dos'
    );
    const horariosOcupados = (await ocupada.json()).horarios;
    assert.equal(horariosOcupados.find((horario) => horario.hora === '09:30').disponible, false);

    const citasUsuarioUno = await peticion('/api/citas', 'usuario-uno');
    const listaUsuarioUno = await citasUsuarioUno.json();
    assert.equal(listaUsuarioUno.data.length, 1);
    assert.equal(listaUsuarioUno.data[0].codigo_cita, resultadoReserva.cita.codigo_cita);

    const citasUsuarioDos = await peticion('/api/citas', 'usuario-dos');
    assert.deepEqual((await citasUsuarioDos.json()).data, []);

    const cancelacion = await peticion(
      `/api/citas/${resultadoReserva.cita.id_cita}/cancelar`,
      'usuario-uno',
      { method: 'PUT' }
    );
    assert.equal(cancelacion.status, 200);
    assert.equal((await cancelacion.json()).cita.estado, 'cancelada');

    const reservaHorarioLiberado = await peticion('/api/citas', 'usuario-dos', {
      method: 'POST',
      body: JSON.stringify(datosReserva)
    });
    assert.equal(reservaHorarioLiberado.status, 201);

    const fechaCercana = fechaEnDias(0);
    const instanteCercano = new Date(Date.now() + 2 * 60 * 60 * 1000 - 5 * 60 * 60 * 1000);
    const horaCercana = `${String(instanteCercano.getUTCHours()).padStart(2, '0')}:${String(instanteCercano.getUTCMinutes()).padStart(2, '0')}`;
    const { lastID } = await ejecutar(
      'run',
      `INSERT INTO citas (
         codigo_cita, usuario_id, ips, servicio, especialidad, fecha, hora,
         modalidad, costo, descuento_aplicado
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['CITA-PRUEBA-24H', '1', 'clinica-chia', 'Cardiología', 'Cardiología',
        fechaCercana, horaCercana, 'presencial', 120000, 18000]
    );
    const cancelacionTardia = await peticion(
      `/api/citas/${lastID}/cancelar`,
      'usuario-uno',
      { method: 'PUT' }
    );
    assert.equal(cancelacionTardia.status, 409);
    assert.equal((await cancelacionTardia.json()).error, 'plazo_vencido');
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
