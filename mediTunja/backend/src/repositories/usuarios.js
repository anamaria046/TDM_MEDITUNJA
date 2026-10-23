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
            password_hash, estado_registro
     FROM usuarios
     WHERE tipo_documento = ? AND numero_documento = ?`,
    [tipoDocumento, numeroDocumento]
  );
}

export async function crearPendiente(datos) {
  const { lastID } = await ejecutar(
    'run',
    `INSERT INTO usuarios (
       tipo_documento, numero_documento, nombres, apellidos, email, telefono,
       password_hash, estado_registro
     ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente')`,
    [
      datos.tipo_documento,
      datos.numero_documento,
      datos.nombres,
      datos.apellidos,
      datos.email,
      datos.telefono,
      datos.password_hash
    ]
  );

  return { id_usuario: lastID, estado_registro: 'pendiente' };
}
