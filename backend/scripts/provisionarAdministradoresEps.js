import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { administradoresEps } from '../src/config/administradoresEps.js';
import { ready } from '../src/config/db.js';
import { ejecutar } from '../src/repositories/sqlite.js';

const scrypt = promisify(crypto.scrypt);

async function crearHash(contrasena) {
  const sal = crypto.randomBytes(16).toString('hex');
  const derivada = await scrypt(contrasena, sal, 64);
  return `${sal}:${derivada.toString('hex')}`;
}

async function aprovisionar() {
  await ready;
  let creados = 0;
  let existentes = 0;

  for (const { eps, nitEnv, claveEnv } of administradoresEps) {
    const nit = process.env[nitEnv];
    if (typeof nit !== 'string' || !/^\d{9}-\d$/.test(nit)) {
      throw new Error(`Define ${nitEnv} en backend/.env con el NIT y dígito de verificación.`);
    }

    const usuario = await ejecutar(
      'get',
      `SELECT nombres, rol, eps, estado_registro
       FROM usuarios
       WHERE tipo_documento = 'NIT' AND numero_documento = ?`,
      [nit]
    );

    if (usuario) {
      if (
        usuario.nombres !== eps ||
        usuario.rol !== 'administrador' ||
        usuario.eps !== eps ||
        usuario.estado_registro !== 'aprobado'
      ) {
        throw new Error(`El NIT de ${eps} ya existe con datos incompatibles; no se modificó esa cuenta.`);
      }
      console.log(`La cuenta administradora de ${eps} ya existe; se conserva sin cambios.`);
      existentes += 1;
      continue;
    }

    const contrasena = process.env[claveEnv];
    if (typeof contrasena !== 'string' || contrasena.length < 12 || contrasena.length > 128) {
      throw new Error(`Define ${claveEnv} en backend/.env con una contraseña de 12 a 128 caracteres.`);
    }

    const passwordHash = await crearHash(contrasena);
    const correoInterno = `administrador+${nit.replace('-', '')}@meditunja.invalid`;
    await ejecutar(
      'run',
      `INSERT INTO usuarios (
        tipo_documento, numero_documento, nombres, apellidos, email, eps,
        rol, password_hash, activo, estado_registro
      ) VALUES ('NIT', ?, ?, 'Administración', ?, ?, 'administrador', ?, 1, 'aprobado')`,
      [nit, eps, correoInterno, eps, passwordHash]
    );
    creados += 1;
    console.log(`Cuenta administradora creada para ${eps}.`);
  }

  console.log(`Aprovisionamiento finalizado: ${creados} creadas, ${existentes} ya existentes.`);
}

try {
  await aprovisionar();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'No se pudieron crear las cuentas administrativas.');
  process.exitCode = 1;
} finally {
  const { db } = await import('../src/config/db.js');
  await new Promise((resolve) => db.close(resolve));
}
