import { ejecutar } from './sqlite.js';

export async function buscarPorUsuario(usuarioId) {
  return ejecutar(
    'get',
    `SELECT substr(uid, -4) AS identificador, vinculada_en
     FROM tarjetas_nfc WHERE usuario_id = ?`,
    [usuarioId]
  );
}

export async function buscarPorUid(uid) {
  return ejecutar(
    'get',
    'SELECT usuario_id FROM tarjetas_nfc WHERE uid = ?',
    [uid]
  );
}

export async function vincular(usuarioId, email, uid) {
  return ejecutar(
    'run',
    `INSERT INTO tarjetas_nfc (usuario_id, email, uid)
     VALUES (?, ?, ?)
     ON CONFLICT(usuario_id) DO UPDATE SET
       email = excluded.email,
       uid = excluded.uid,
       vinculada_en = CURRENT_TIMESTAMP`,
    [usuarioId, email, uid]
  );
}

export async function desvincular(usuarioId) {
  return ejecutar(
    'run',
    'DELETE FROM tarjetas_nfc WHERE usuario_id = ?',
    [usuarioId]
  );
}
