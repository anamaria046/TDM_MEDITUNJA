import { ejecutar } from './sqlite.js';

const consultaSesion = `SELECT s.usuario_id, s.email, s.perfil, s.descuento,
                               u.tipo_documento, u.numero_documento, u.nombres,
                               u.apellidos, u.telefono, u.eps, u.estado_afiliacion
                        FROM sesiones_tarjeta s
                        LEFT JOIN usuarios_tunja u ON lower(u.email) = lower(s.email)`;

export async function crear(usuario, tokenHash, refrescoHash, ahora, expiracion) {
  await ejecutar(
    'run',
    `INSERT INTO sesiones_tarjeta (
       usuario_id, email, perfil, descuento, token_hash, refresco_hash,
       creada_en, ultima_actividad, expira_en
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      usuario.id,
      usuario.email,
      usuario.perfil,
      usuario.descuento,
      tokenHash,
      refrescoHash,
      ahora,
      ahora,
      expiracion
    ]
  );
}

export async function renovarPorToken(tokenHash, ahora, expiracion) {
  const resultado = await ejecutar(
    'run',
    `UPDATE sesiones_tarjeta
     SET ultima_actividad = ?, expira_en = ?
     WHERE token_hash = ? AND revocada_en IS NULL AND expira_en > ?`,
    [ahora, expiracion, tokenHash, ahora]
  );
  if (resultado.changes !== 1) return null;
  return ejecutar('get', `${consultaSesion} WHERE s.token_hash = ?`, [tokenHash]);
}

export async function buscarPorRefresco(refrescoHash, ahora) {
  return ejecutar(
    'get',
    `${consultaSesion}
     WHERE s.refresco_hash = ? AND s.revocada_en IS NULL AND s.expira_en > ?`,
    [refrescoHash, ahora]
  );
}

export async function renovarPorRefresco(
  refrescoHash,
  tokenHash,
  nuevoRefrescoHash,
  ahora,
  expiracion
) {
  const resultado = await ejecutar(
    'run',
    `UPDATE sesiones_tarjeta
     SET token_hash = ?, refresco_hash = ?, ultima_actividad = ?, expira_en = ?
     WHERE refresco_hash = ? AND revocada_en IS NULL AND expira_en > ?`,
    [tokenHash, nuevoRefrescoHash, ahora, expiracion, refrescoHash, ahora]
  );
  if (resultado.changes !== 1) return null;
  return ejecutar('get', `${consultaSesion} WHERE s.token_hash = ?`, [tokenHash]);
}

export async function revocarPorRefresco(refrescoHash, ahora) {
  const resultado = await ejecutar(
    'run',
    `UPDATE sesiones_tarjeta
     SET revocada_en = ?
     WHERE refresco_hash = ? AND revocada_en IS NULL`,
    [ahora, refrescoHash]
  );
  return resultado.changes === 1;
}

export async function revocarPorUsuario(usuarioId, ahora) {
  return ejecutar(
    'run',
    `UPDATE sesiones_tarjeta
     SET revocada_en = ?
     WHERE usuario_id = ? AND revocada_en IS NULL`,
    [ahora, usuarioId]
  );
}
