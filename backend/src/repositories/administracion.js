import { ejecutar } from './sqlite.js';

const condicionMismaEps = `(
  lower(trim(eps_nombre)) = lower(trim(?)) OR
  lower(trim(eps_nombre)) = lower('EPS ' || trim(?)) OR
  lower(trim(eps_nombre)) = lower(trim(replace(lower(?), 'eps ', '')))
)`;

export async function listarConvenios(eps) {
  const convenios = await ejecutar(
    'all',
    `SELECT id, eps_id AS epsId, eps_nombre AS epsNombre, eps_sede AS epsSede,
            eps_direccion AS epsDireccion, ips_id AS ipsId, ips_nombre AS ipsNombre,
            ips_sede AS ipsSede, ips_direccion AS ipsDireccion,
            portafolio_id AS portafolioId, portafolio_nombre AS portafolioNombre,
            servicios_seleccionados AS serviciosJson,
            clausula_transporte AS clausulaTransporte, estado,
            fecha_creacion AS fechaCreacion
     FROM convenios
     WHERE ${condicionMismaEps}
     ORDER BY fecha_creacion DESC, id DESC`,
    [eps, eps, eps]
  );

  return convenios.map(({ serviciosJson, clausulaTransporte, ...convenio }) => ({
    ...convenio,
    serviciosSeleccionados: JSON.parse(serviciosJson),
    clausulaTransporte: Boolean(clausulaTransporte)
  }));
}

export async function crearConvenio(convenio) {
  await ejecutar(
    'run',
    `INSERT INTO convenios (
       id, eps_id, eps_nombre, eps_sede, eps_direccion, ips_id, ips_nombre,
       ips_sede, ips_direccion, portafolio_id, portafolio_nombre,
       servicios_seleccionados, clausula_transporte, estado, fecha_creacion
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo', ?)`,
    [
      convenio.id,
      convenio.epsId,
      convenio.epsNombre,
      convenio.epsSede,
      convenio.epsDireccion,
      convenio.ipsId,
      convenio.ipsNombre,
      convenio.ipsSede,
      convenio.ipsDireccion,
      convenio.portafolioId,
      convenio.portafolioNombre,
      JSON.stringify(convenio.serviciosSeleccionados),
      convenio.clausulaTransporte ? 1 : 0,
      convenio.fechaCreacion
    ]
  );
}

export async function desactivarConvenio(eps, id) {
  return ejecutar(
    'run',
    `UPDATE convenios
     SET estado = 'Inactivo'
     WHERE id = ? AND ${condicionMismaEps}`,
    [id, eps, eps, eps]
  );
}
