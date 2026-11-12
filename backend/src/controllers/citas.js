import crypto from 'node:crypto';
import { ejecutar } from '../repositories/sqlite.js';
import * as usuariosTunja from '../repositories/usuariosTunja.js';
import * as sesionesTarjeta from '../repositories/sesionesTarjeta.js';
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
const duracionSesionTarjetaMs = 15 * 60 * 1000;
const condicionMismaEpsCita = `(
  lower(trim(u.eps)) = lower(trim(?)) OR
  lower(trim(u.eps)) = lower('EPS ' || trim(?)) OR
  lower(trim(replace(lower(u.eps), 'eps ', ''))) =
    lower(trim(replace(lower(?), 'eps ', '')))
)`;

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

function textoValido(valor, maximo) {
  return typeof valor === 'string' && valor.trim().length > 0 &&
    valor.trim().length <= maximo;
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
    email: typeof usuario.email === 'string' ? usuario.email.trim().toLowerCase() : null,
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
    const ahora = Date.now();
    const hashToken = crypto.createHash('sha256').update(coincidencia[1]).digest('hex');
    const sesionTarjeta = await sesionesTarjeta.renovarPorToken(
      hashToken,
      ahora,
      ahora + duracionSesionTarjetaMs
    );
    if (sesionTarjeta) {
      if (sesionTarjeta.estado_afiliacion !== 'aprobado') {
        const rechazado = sesionTarjeta.estado_afiliacion === 'rechazado';
        return responderError(
          res,
          403,
          rechazado ? 'afiliacion_rechazada' : 'afiliacion_pendiente',
          rechazado
            ? 'Tu afiliación fue rechazada. Contacta al administrador de tu EPS.'
            : 'Tu cuenta debe ser activada por el administrador de tu EPS antes de usar este módulo.'
        );
      }

      req.usuarioCitas = {
        id: sesionTarjeta.usuario_id,
        email: sesionTarjeta.email,
        descuento: sesionTarjeta.descuento
      };
      req.sesionTarjeta = true;
      return next();
    }
  } catch (error) {
    console.error('Error al validar sesión local de tarjeta:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible validar la sesión.');
  }

  try {
    const respuesta = await tunjaRequest('/auth/me', { accessToken: coincidencia[1] });
    const perfil = obtenerPerfilTunja(respuesta);
    if (!perfil) {
      console.error('TunjaAPI devolvió un perfil sin identificador o descuento válido.');
      return responderError(res, 502, 'perfil_no_disponible', 'No fue posible verificar el perfil del usuario.');
    }

    const solicitud = perfil.email
      ? await usuariosTunja.buscarPorEmail(perfil.email)
      : perfil.id.includes('@')
        ? await usuariosTunja.buscarPorEmail(perfil.id)
        : null;
    if (solicitud?.estado_afiliacion !== 'aprobado') {
      const rechazado = solicitud?.estado_afiliacion === 'rechazado';
      return responderError(
        res,
        403,
        rechazado ? 'afiliacion_rechazada' : 'afiliacion_pendiente',
        rechazado
          ? 'Tu afiliación fue rechazada. Contacta al administrador de tu EPS.'
          : 'Tu cuenta debe ser activada por el administrador de tu EPS antes de usar este módulo.'
      );
    }

    if (solicitud && perfil.email) {
      await usuariosTunja.asociarIdTunja(perfil.email, perfil.id);
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

export async function listarCitasAdministrador(req, res) {
  try {
    const data = await ejecutar(
      'all',
      `SELECT c.id_cita AS id, c.codigo_cita, c.ips, c.especialidad, c.fecha,
              c.hora, c.estado, c.costo, c.descuento_aplicado,
              u.tipo_documento, u.numero_documento,
              u.email AS correo,
              trim(coalesce(u.nombres, '') || ' ' || coalesce(u.apellidos, '')) AS paciente
       FROM citas c
       JOIN usuarios_tunja u ON u.tunja_usuario_id = c.usuario_id
       WHERE ${condicionMismaEpsCita}
       ORDER BY c.fecha DESC, c.hora DESC, c.id_cita DESC`,
      [req.usuario.eps, req.usuario.eps, req.usuario.eps]
    );
    return res.status(200).json({ data });
  } catch (error) {
    console.error('Error al listar citas administrativas:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar las citas de la EPS.');
  }
}

export async function obtenerResumenAdministrador(req, res) {
  try {
    const afiliados = await ejecutar(
      'get',
      `SELECT count(*) AS total,
              sum(CASE WHEN estado_afiliacion = 'aprobado' THEN 1 ELSE 0 END) AS activos
       FROM usuarios_tunja
       WHERE lower(trim(eps)) = lower(trim(?))
          OR lower(trim(eps)) = lower('EPS ' || trim(?))
          OR lower(trim(replace(lower(eps), 'eps ', ''))) =
             lower(trim(replace(lower(?), 'eps ', '')))`,
      [req.usuario.eps, req.usuario.eps, req.usuario.eps]
    );
    const citas = await ejecutar(
      'get',
      `SELECT count(*) AS total
       FROM citas c
       JOIN usuarios_tunja u ON u.tunja_usuario_id = c.usuario_id
       WHERE ${condicionMismaEpsCita}
         AND c.estado = 'confirmada'
         AND strftime('%Y-%m', c.fecha) = strftime('%Y-%m', 'now', '-5 hours')`,
      [req.usuario.eps, req.usuario.eps, req.usuario.eps]
    );
    const resultados = await ejecutar(
      'get',
      `SELECT count(*) AS total
       FROM resultados_procedimientos r
       JOIN usuarios_tunja u
         ON u.tipo_documento = r.tipo_documento
        AND u.numero_documento = r.numero_documento
       WHERE r.estado = 'En proceso'
         AND u.estado_afiliacion = 'aprobado'
         AND ${condicionMismaEpsCita.replaceAll('u.eps', 'r.eps')}
         AND ${condicionMismaEpsCita}`,
      [
        req.usuario.eps, req.usuario.eps, req.usuario.eps,
        req.usuario.eps, req.usuario.eps, req.usuario.eps
      ]
    );

    return res.status(200).json({
      data: {
        afiliadosActivos: Number(afiliados.activos) || 0,
        afiliadosTotales: Number(afiliados.total) || 0,
        citasEsteMes: Number(citas.total) || 0,
        resultadosPendientes: Number(resultados.total) || 0
      }
    });
  } catch (error) {
    console.error('Error al consultar resumen administrativo:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible consultar el resumen de la EPS.');
  }
}

async function buscarCitaDeEps(idCita, eps) {
  return ejecutar(
    'get',
    `SELECT c.id_cita, c.fecha, c.hora, c.estado, c.ips
     FROM citas c
     JOIN usuarios_tunja u ON u.tunja_usuario_id = c.usuario_id
     WHERE c.id_cita = ? AND ${condicionMismaEpsCita}`,
    [idCita, eps, eps, eps]
  );
}

export async function reprogramarCitaAdministrador(req, res) {
  const idCita = Number(req.params.id);
  const { ips, fecha, hora, motivo } = req.body || {};
  if (!Number.isSafeInteger(idCita) || idCita < 1 ||
      !ipsPermitidas.has(ips) || !fechaValida(fecha) ||
      fecha < fechaHoyColombia() || !horarios.includes(hora) ||
      !textoValido(motivo, 500)) {
    return responderError(res, 400, 'datos_invalidos', 'Revisa la IPS, la fecha, el horario y la justificación.');
  }
  if (instanteCita(fecha, hora) <= Date.now()) {
    return responderError(res, 400, 'horario_vencido', 'Selecciona un horario futuro.');
  }

  try {
    const cita = await buscarCitaDeEps(idCita, req.usuario.eps);
    if (!cita) return responderError(res, 404, 'cita_no_encontrada', 'No se encontró la cita de esta EPS.');
    if (cita.estado !== 'confirmada') {
      return responderError(res, 409, 'cita_no_confirmada', 'No se puede reprogramar una cita cancelada.');
    }

    const resultado = await ejecutar(
      'run',
      `UPDATE citas
       SET ips = ?, fecha = ?, hora = ?, motivo_administrativo = ?, modificada_en = CURRENT_TIMESTAMP
       WHERE id_cita = ? AND estado = 'confirmada'`,
      [ips, fecha, hora, motivo.trim(), idCita]
    );
    if (resultado.changes !== 1) {
      return responderError(res, 409, 'cita_no_confirmada', 'La cita ya no está disponible para modificar.');
    }
    return res.status(200).json({ mensaje: 'Cita reprogramada correctamente.' });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT' &&
        error.message.includes('citas.ips, citas.fecha, citas.hora')) {
      return responderError(res, 409, 'horario_no_disponible', 'Ese horario acaba de ser ocupado. Selecciona otro.');
    }
    console.error('Error al reprogramar cita administrativa:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible reprogramar la cita.');
  }
}

export async function cancelarCitaAdministrador(req, res) {
  const idCita = Number(req.params.id);
  const { motivo } = req.body || {};
  if (!Number.isSafeInteger(idCita) || idCita < 1 || !textoValido(motivo, 500)) {
    return responderError(res, 400, 'datos_invalidos', 'Indica la cita y una justificación válida.');
  }

  try {
    const cita = await buscarCitaDeEps(idCita, req.usuario.eps);
    if (!cita) return responderError(res, 404, 'cita_no_encontrada', 'No se encontró la cita de esta EPS.');
    if (cita.estado !== 'confirmada') {
      return responderError(res, 409, 'cita_no_confirmada', 'La cita ya fue cancelada.');
    }

    const resultado = await ejecutar(
      'run',
      `UPDATE citas
       SET estado = 'cancelada', motivo_administrativo = ?, modificada_en = CURRENT_TIMESTAMP
       WHERE id_cita = ? AND estado = 'confirmada'`,
      [motivo.trim(), idCita]
    );
    if (resultado.changes !== 1) {
      return responderError(res, 409, 'cita_no_confirmada', 'La cita ya fue cancelada.');
    }
    return res.status(200).json({ mensaje: 'Cita cancelada correctamente.' });
  } catch (error) {
    console.error('Error al cancelar cita administrativa:', error.code || 'ERROR_INTERNO');
    return responderError(res, 500, 'error_interno', 'No fue posible cancelar la cita.');
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
