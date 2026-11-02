import { ejecutar } from './sqlite.js';

export async function buscarPorDocumento(tipoDocumento, numeroDocumento) {
  return ejecutar(
    'get',
    `SELECT id_usuario FROM usuarios
     WHERE tipo_documento = ? AND numero_documento = ?`,
    [tipoDocumento, numeroDocumento]
  );
}
export async function buscarPorEmail(email) {
  return ejecutar(
    'get',
    'SELECT id_usuario FROM usuarios WHERE email = ?',
    [email]
  );
}

export async function buscarCredenciales(tipoDocumento, numeroDocumento) {
  return ejecutar(
    'get',
    `SELECT id_usuario, nombres, apellidos, tipo_documento, numero_documento,
            password_hash, estado_registro, rol, eps
     FROM usuarios
     WHERE tipo_documento = ? AND numero_documento = ?`,
    [tipoDocumento, numeroDocumento]
  );
}

const condicionMismaEps = `(
  lower(trim(eps)) = lower(trim(?)) OR
  lower(trim(eps)) = lower('EPS ' || trim(?)) OR
  lower(trim(eps)) = lower(trim(replace(lower(?), 'eps ', '')))
)`;

export async function listarAfiliados(eps) {
  return ejecutar(
    'all',
    `SELECT id_usuario AS id, nombres, apellidos, tipo_documento AS tipoDocumento,
            numero_documento AS numeroDocumento, email, telefono,
            fecha_nacimiento AS fechaNacimiento, sexo, eps,
            estado_registro AS estado
     FROM usuarios
     WHERE rol = 'afiliado' AND ${condicionMismaEps}
     ORDER BY fecha_registro DESC, id_usuario DESC`,
    [eps, eps, eps]
  );
}

export async function actualizarAfiliado(eps, id, datos) {
  return ejecutar(
    'run',
    `UPDATE usuarios
     SET nombres = ?, apellidos = ?, tipo_documento = ?, numero_documento = ?,
         email = ?, telefono = ?, fecha_nacimiento = ?, sexo = ?
     WHERE id_usuario = ? AND rol = 'afiliado' AND ${condicionMismaEps}`,
    [
      datos.nombres,
      datos.apellidos,
      datos.tipoDocumento,
      datos.numeroDocumento,
      datos.email,
      datos.telefono,
      datos.fechaNacimiento,
      datos.sexo,
      id,
      eps,
      eps,
      eps
    ]
  );
}

export async function actualizarEstadoAfiliado(eps, id, estado) {
  return ejecutar(
    'run',
    `UPDATE usuarios
     SET estado_registro = ?
     WHERE id_usuario = ? AND rol = 'afiliado' AND ${condicionMismaEps}`,
    [estado, id, eps, eps, eps]
  );
}

export async function crearPendiente(datos) {
  const { lastID } = await ejecutar(
    'run',
    `INSERT INTO usuarios (
       tipo_documento, numero_documento, nombres, apellidos, email, telefono,
       fecha_nacimiento, sexo, eps, password_hash, estado_registro
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [
      datos.tipo_documento,
      datos.numero_documento,
      datos.nombres,
      datos.apellidos,
      datos.email,
      datos.telefono,
      datos.fecha_nacimiento,
      datos.sexo,
      datos.eps,
      datos.password_hash
    ]
  );

  return { id_usuario: lastID, estado_registro: 'pendiente' };
}
