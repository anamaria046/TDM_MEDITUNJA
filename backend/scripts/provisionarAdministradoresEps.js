import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { administradoresEps } from '../src/config/administradoresEps.js';
import { ready } from '../src/config/db.js';
import { ejecutar } from '../src/repositories/sqlite.js';
import { tunjaRequest } from '../src/services/tunjaApi.js';
import { listarUsuariosTunja } from '../src/services/tunjaUsuarios.js';

const scrypt = promisify(crypto.scrypt);

async function crearHash(contrasena) {
  const sal = crypto.randomBytes(16).toString('hex');
  const derivada = await scrypt(contrasena, sal, 64);
  return `${sal}:${derivada.toString('hex')}`;
}

function slugEps(eps) {
  return eps.toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
}

async function sincronizarCuentaTunja(eps, nit, contrasena) {
  const email = `admin.${slugEps(eps)}@meditunja.com`;
  const cuentas = await listarUsuariosTunja();
  const documentoSinSeparador = nit.replace('-', '');
  const coincidencias = cuentas.filter((cuenta) =>
    cuenta?.email?.trim().toLowerCase() === email ||
    [nit, documentoSinSeparador].includes(cuenta?.documento || cuenta?.numero_documento)
  );
  const coincidencia = coincidencias.find((cuenta) =>
    cuenta?.email?.trim().toLowerCase() === email &&
    [nit, documentoSinSeparador].includes(cuenta?.documento || cuenta?.numero_documento)
  );

  if (coincidencias.length > 0) {
    if (!coincidencia || coincidencia.activo !== true ||
        !Number.isSafeInteger(coincidencia.id)) {
      throw new Error(`TunjaAPI tiene una cuenta incompatible o inactiva para ${eps}; no se modificó esa cuenta.`);
    }
    return { email, id: coincidencia.id };
  }

  const registro = await tunjaRequest('/auth/register', {
    method: 'POST',
    requiresKey: true,
    body: {
      email,
      contrasena,
      nombre: `Administrador ${eps}`,
      documento: nit,
      tipo_documento: 'NIT',
      numero_documento: nit,
      perfil: 'general',
      descuento: 0
    }
  });
  const id = registro.usuario?.id || registro.id;
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error(`TunjaAPI no confirmó la cuenta administradora de ${eps}.`);
  }
  return { email, id };
}

async function aprovisionar() {
  await ready;
  let creados = 0;
  let activados = 0;
  let existentes = 0;

  for (const { eps, nitEnv, claveEnv } of administradoresEps) {
    const nit = process.env[nitEnv];
    if (typeof nit !== 'string' || !/^\d{9}-\d$/.test(nit)) {
      throw new Error(`Define ${nitEnv} en backend/.env con el NIT y dígito de verificación.`);
    }
    const contrasena = process.env[claveEnv];
    if (typeof contrasena !== 'string' || contrasena.length < 12 || contrasena.length > 128) {
      throw new Error(`Define ${claveEnv} en backend/.env con una contraseña de 12 a 128 caracteres.`);
    }
    const cuentaTunja = await sincronizarCuentaTunja(eps, nit, contrasena);
    const cuentaTunjaVerificada = await tunjaRequest(
      `/users/${cuentaTunja.id}`,
      { requiresKey: true }
    );
    if (cuentaTunjaVerificada.activo !== true ||
        cuentaTunjaVerificada.email?.trim().toLowerCase() !== cuentaTunja.email ||
        ![nit, nit.replace('-', '')].includes(cuentaTunjaVerificada.documento || cuentaTunjaVerificada.numero_documento)) {
      throw new Error(`TunjaAPI no confirmó una cuenta activa compatible para ${eps}.`);
    }

    const usuario = await ejecutar(
      'get',
      `SELECT id_usuario, nombres, email, rol, eps, activo, estado_registro
       FROM usuarios
       WHERE tipo_documento = 'NIT' AND numero_documento = ?`,
      [nit]
    );

    if (usuario) {
      if (
        usuario.nombres !== eps ||
        usuario.rol !== 'administrador' ||
        usuario.eps !== eps
      ) {
        throw new Error(`El NIT de ${eps} ya existe con datos incompatibles; no se modificó esa cuenta.`);
      }
      if (usuario.email !== cuentaTunja.email) {
        await ejecutar(
          'run',
          `UPDATE usuarios SET email = ? WHERE id_usuario = ?`,
          [cuentaTunja.email, usuario.id_usuario]
        );
      }
      if (usuario.activo !== 1 || usuario.estado_registro !== 'aprobado') {
        await ejecutar(
          'run',
          `UPDATE usuarios
           SET activo = 1, estado_registro = 'aprobado'
           WHERE id_usuario = ?`,
          [usuario.id_usuario]
        );
        activados += 1;
        console.log(`Cuenta administradora activada para ${eps}.`);
      } else {
        existentes += 1;
        console.log(`La cuenta administradora de ${eps} ya estaba activa.`);
      }
      continue;
    }

    const passwordHash = await crearHash(contrasena);
    await ejecutar(
      'run',
      `INSERT INTO usuarios (
        tipo_documento, numero_documento, nombres, apellidos, email, eps,
        rol, password_hash, activo, estado_registro
      ) VALUES ('NIT', ?, ?, 'Administración', ?, ?, 'administrador', ?, 1, 'aprobado')`,
      [nit, eps, cuentaTunja.email, eps, passwordHash]
    );
    creados += 1;
    console.log(`Cuenta administradora creada para ${eps}.`);
  }

  const tipoDocumentoPrueba = process.env.TEST_USER_DOCUMENT_TYPE;
  const numeroDocumentoPrueba = process.env.TEST_USER_DOCUMENT_NUMBER;
  const nombrePrueba = process.env.TEST_USER_NAME;
  const emailPrueba = process.env.TEST_USER_EMAIL;
  const epsPrueba = process.env.TEST_USER_EPS;
  if (
    !['CC', 'TI', 'CE', 'PAS'].includes(tipoDocumentoPrueba) ||
    typeof numeroDocumentoPrueba !== 'string' ||
    !/^[A-Za-z0-9.-]{4,30}$/.test(numeroDocumentoPrueba) ||
    typeof nombrePrueba !== 'string' || !nombrePrueba.trim() ||
    typeof emailPrueba !== 'string' || !emailPrueba.trim() ||
    typeof epsPrueba !== 'string' || !epsPrueba.trim()
  ) {
    throw new Error('Define TEST_USER_DOCUMENT_TYPE, TEST_USER_DOCUMENT_NUMBER, TEST_USER_NAME, TEST_USER_EMAIL y TEST_USER_EPS en backend/.env.');
  }

  const usuarioPrueba = await ejecutar(
    'get',
    `SELECT id_usuario, nombres, email, eps, rol, activo, estado_registro
     FROM usuarios
     WHERE tipo_documento = ? AND numero_documento = ?`,
    [tipoDocumentoPrueba, numeroDocumentoPrueba]
  );
  if (usuarioPrueba) {
    if (
      usuarioPrueba.nombres !== nombrePrueba ||
      usuarioPrueba.email !== emailPrueba ||
      usuarioPrueba.eps !== epsPrueba ||
      usuarioPrueba.rol !== 'afiliado'
    ) {
      throw new Error('La identificación de prueba ya existe con datos incompatibles; no se modificó esa cuenta.');
    }
    if (usuarioPrueba.activo !== 1 || usuarioPrueba.estado_registro !== 'aprobado') {
      await ejecutar(
        'run',
        `UPDATE usuarios
         SET activo = 1, estado_registro = 'aprobado'
         WHERE id_usuario = ?`,
        [usuarioPrueba.id_usuario]
      );
      activados += 1;
      console.log('La cuenta de prueba fue activada.');
    } else {
      existentes += 1;
      console.log('La cuenta de prueba ya estaba activa.');
    }
  } else {
    const contrasenaPrueba = process.env.TEST_USER_PASSWORD;
    if (typeof contrasenaPrueba !== 'string' || contrasenaPrueba.length < 12 || contrasenaPrueba.length > 128) {
      throw new Error('Define TEST_USER_PASSWORD en backend/.env con una contraseña de 12 a 128 caracteres.');
    }
    const passwordHash = await crearHash(contrasenaPrueba);
    await ejecutar(
      'run',
      `INSERT INTO usuarios (
        tipo_documento, numero_documento, nombres, apellidos, email, eps,
        rol, password_hash, activo, estado_registro
      ) VALUES (?, ?, ?, 'Prueba', ?, ?, 'afiliado', ?, 1, 'aprobado')`,
      [tipoDocumentoPrueba, numeroDocumentoPrueba, nombrePrueba.trim(), emailPrueba.trim(), epsPrueba.trim(), passwordHash]
    );
    creados += 1;
    console.log('La cuenta de prueba fue creada y activada.');
  }

  console.log(`Aprovisionamiento finalizado: ${creados} creadas, ${activados} activadas, ${existentes} ya activas.`);
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
