import crypto from 'node:crypto';
import { ejecutar } from '../repositories/sqlite.js';
import { tunjaRequest } from '../services/tunjaApi.js';

const horarios = ['08:00', '09:30', '11:00'];
const ipsPermitidas = new Map([
  ['san-rafael', 'Hospital San Rafael de Tunja'],
  ['santiago-tunja', 'E.S.E Santiago de Tunja'],
  ['clinica-medilaser', 'Clínica Medilaser'],
  ['clinica-andes', 'Clínica los Andes'],
  ['clinica-chia', 'Clínica de Chía S.A']
]);
const serviciosPermitidos = new Map([
  ['cardio', { nombre: 'Cardiología', costo: 120000 }],
  ['radio', { nombre: 'Radiología', costo: 120000 }]
]);
const modalidadesPermitidas = new Set(['presencial', 'telemedicina']);

function responderError(res, status, error, mensaje) {
  return res.status(status).json({ error, mensaje });
}

function fechaValida(fecha) {
  if (typeof fecha !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const fechaUTC = new Date(Date.UTC(anio, mes - 1, dia));
  return fechaUTC.getUTCFullYear() === anio &&
    fechaUTC.getUTCMonth() === mes - 1 &&
    fechaUTC.getUTCDate() === dia;
}

function fechaHoyColombia() {
  return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function instanteCita(fecha, hora) {
  return new Date(`${fecha}T${hora}:00-05:00`).getTime();
}

function obtenerPerfilTunja(respuesta) {
  const usuario = respuesta?.usuario && typeof respuesta.usuario === 'object'
    ? respuesta.usuario
    : respuesta;
  if (!usuario || typeof usuario !== 'object' || Array.isArray(usuario)) return null;

  const identificador = usuario.id_usuario ?? usuario.usuario_id ?? usuario.id ??
    usuario.email ?? usuario.documento;
  if ((typeof identificador !== 'string' && typeof identificador !== 'number') ||
      !String(identificador).trim()) {
    return null;
  }

  const descuento = usuario.descuento ?? usuario.porcentaje_descuento ?? 0;
  if (!Number.isInteger(descuento) || descuento < 0 || descuento > 100) return null;

  const id = String(identificador).trim();
  return {
    id: typeof identificador === 'string' && identificador.includes('@')
      ? id.toLowerCase()
      : id,
    descuento
  };
}

export async function autenticarUsuarioTunja(req, res, next) {
  const autorizacion = req.get('authorization') || '';
  const coincidencia = /^Bearer\s+(\S+)$/i.exec(autorizacion);
  if (!coincidencia) {
    return responderError(res, 401, 'token_requerido', 'Inicia sesión para agendar y consultar tus citas.');
  }

  try {
    const respuesta = await tunjaRequest('/auth/me', { accessToken: coincidencia[1] });
    const perfil = obtenerPerfilTunja(respuesta);
    if (!perfil) {
      console.error('TunjaAPI devolvió un perfil sin identificador o descuento válido.');
      return responderError(res, 502, 'perfil_no_disponible', 'No fue posible verificar el perfil del usuario.');
    }

    req.usuarioCitas = perfil;
    return next();
  } catch (error) {
    if (error.status === 401) {
      return responderError(res, 401, 'sesion_invalida', 'Tu sesión expiró. Inicia sesión nuevamente.');
    }
    if (Number.isInteger(error.status) && error.status >= 400 && error.status < 500) {
      return responderError(res, error.status, error.code || 'autenticacion_rechazada', error.message);
    }
    console.error('Error al verificar usuario para citas:', error.code || 'ERROR_INTERNO');
    return responderError(res, 502, 'autenticacion_no_disponible', 'No fue posible verificar la sesión con TunjaAPI.');
  }
}

export async function obtenerDisponibilidad(req, res) {
  const { ips, fecha } = req.query;
  if (!ipsPermitidas.has(ips) || !fechaValida(fecha) || fecha < fechaHoyColombia()) {
    return responderError(res, 400, 'datos_invalidos', 'Selecciona una IPS y una fecha válida a partir de hoy.');
  }

  try {
    const ocupadas = await ejecutar(
      'all',
      `SELECT hora FROM citas
       WHERE ips = ? AND fecha = ? AND estado = 'confirmada'`,
      [ips, fecha]
    );
    const horasOcupadas = new Set(ocupadas.map((cita) => cita.hora));
    const ahora = Date.now();
    const datos = horarios.map((hora) => {
      const disponible = !horasOcupadas.has(hora) && instanteCita(fecha, hora) > ahora;
      return {
        hora,
        disponible,
        estado: horasOcupadas.has(hora) ? 'ocupado' : disponible ? 'disponible' : 'no_disponible'
      };
    });

    return res.status(200).json({ ips, fecha, horarios: datos });
  } catch (error) {
    console.error('Error al consultar disponibilidad de citas:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar la disponibilidad.');
  }
}

export async function listarCitas(req, res) {
  try {
    const citas = await ejecutar(
      'all',
      `SELECT id_cita, codigo_cita, ips, servicio, especialidad, fecha, hora,
              modalidad, costo, descuento_aplicado, estado
       FROM citas WHERE usuario_id = ?
       ORDER BY fecha DESC, hora DESC, id_cita DESC`,
      [req.usuarioCitas.id]
    );
    return res.status(200).json({ data: citas });
  } catch (error) {
    console.error('Error al listar citas:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar tus citas.');
  }
}

export async function crearCita(req, res) {
  const { ips, servicio, fecha, hora, modalidad = 'presencial' } = req.body || {};
  const servicioSeleccionado = serviciosPermitidos.get(servicio);

  if (!ipsPermitidas.has(ips) || !servicioSeleccionado ||
      !fechaValida(fecha) || fecha < fechaHoyColombia() ||
      !horarios.includes(hora) || !modalidadesPermitidas.has(modalidad)) {
    return responderError(res, 400, 'datos_invalidos', 'Revisa la IPS, el servicio, la fecha, el horario y la modalidad.');
  }
  if (instanteCita(fecha, hora) <= Date.now()) {
    return responderError(res, 400, 'horario_vencido', 'Selecciona un horario futuro.');
  }

  const descuentoAplicado = Math.round(
    servicioSeleccionado.costo * req.usuarioCitas.descuento / 100
  );
  const codigoCita = `CITA-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  try {
    const { lastID } = await ejecutar(
      'run',
      `INSERT INTO citas (
         codigo_cita, usuario_id, ips, servicio, especialidad, fecha, hora,
         modalidad, costo, descuento_aplicado, estado
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmada')`,
      [
        codigoCita,
        req.usuarioCitas.id,
        ips,
        servicioSeleccionado.nombre,
        servicioSeleccionado.nombre,
        fecha,
        hora,
        modalidad,
        servicioSeleccionado.costo,
        descuentoAplicado
      ]
    );
    const cita = await ejecutar(
      'get',
      `SELECT id_cita, codigo_cita, ips, servicio, especialidad, fecha, hora,
              modalidad, costo, descuento_aplicado, estado
       FROM citas WHERE id_cita = ?`,
      [lastID]
    );
    return res.status(201).json({
      mensaje: 'Cita confirmada correctamente.',
      porcentaje_descuento: req.usuarioCitas.descuento,
      total_a_pagar: servicioSeleccionado.costo - descuentoAplicado,
      cita
    });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT' &&
        error.message.includes('citas.ips, citas.fecha, citas.hora')) {
      return responderError(res, 409, 'horario_no_disponible', 'Ese horario acaba de ser ocupado. Selecciona otro.');
    }
    console.error('Error al crear cita:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible registrar la cita.');
  }
}

export async function cancelarCita(req, res) {
  const idCita = Number(req.params.id);
  if (!Number.isSafeInteger(idCita) || idCita < 1) {
    return responderError(res, 400, 'id_invalido', 'El identificador de la cita no es válido.');
  }

  try {
    const cita = await ejecutar(
      'get',
      `SELECT id_cita, codigo_cita, fecha, hora, estado FROM citas
       WHERE id_cita = ? AND usuario_id = ?`,
      [idCita, req.usuarioCitas.id]
    );
    if (!cita) {
      return responderError(res, 404, 'cita_no_encontrada', 'No se encontró la cita solicitada.');
    }
    if (cita.estado !== 'confirmada') {
      return responderError(res, 409, 'cita_no_confirmada', 'La cita ya fue cancelada.');
    }
    if (instanteCita(cita.fecha, cita.hora) - Date.now() <= 24 * 60 * 60 * 1000) {
      return responderError(res, 409, 'plazo_vencido', 'Solo puedes cancelar una cita con más de 24 horas de anticipación.');
    }

    const resultado = await ejecutar(
      'run',
      `UPDATE citas SET estado = 'cancelada'
       WHERE id_cita = ? AND usuario_id = ? AND estado = 'confirmada'`,
      [idCita, req.usuarioCitas.id]
    );
    if (resultado.changes !== 1) {
      return responderError(res, 409, 'cita_no_confirmada', 'La cita ya fue cancelada.');
    }
    return res.status(200).json({
      mensaje: 'Cita cancelada correctamente.',
      cita: { ...cita, estado: 'cancelada' }
    });
  } catch (error) {
    console.error('Error al cancelar cita:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible cancelar la cita.');
  }
}
