// Subcomponente de Listado de Convenios Formalizados
// MediTunja - Módulo de Convenios (Gestión Administrativa)
// Maquetación limpia en HTML semántico dentro de JSX

import styles from "./Convenios.module.css";

function ListaConvenios({ convenios, onEliminarConvenio }) {
  return (
    <section className={styles.seccionListado}>
      <h3 className={styles.tituloSeccion}>
        <span>📋</span> Convenios Formalizados en la Red Tunja
      </h3>
      <p className={styles.descripcionSeccion}>
        Convenios institucionales activos y en revisión entre las entidades promotoras (EPS) y los prestadores de salud (IPS) de Tunja.
      </p>

      <div className={styles.tablaContenedor}>
        <table className={styles.tablaConvenios} aria-label="Tabla de convenios vigentes">
          <thead>
            <tr>
              <th>Código</th>
              <th>EPS Gestora</th>
              <th>Prestador (IPS)</th>
              <th>Sede y Dirección IPS</th>
              <th>Portafolio Pactado</th>
              <th>Servicios</th>
              <th>Transporte Preferencial</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {convenios.length === 0 ? (
              <tr>
                <td colSpan="10" className={styles.mensajeVacio}>
                  No hay convenios registrados actualmente.
                </td>
              </tr>
            ) : (
              convenios.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.id}</strong></td>
                  <td>
                    <strong>{c.epsNombre || "EPS Tunja"}</strong>
                    {c.epsSede && (
                      <>
                        <br />
                        <small style={{ color: "#718096" }}>{c.epsSede}</small>
                      </>
                    )}
                  </td>
                  <td>{c.ipsNombre}</td>
                  <td>
                    <strong>{c.ipsSede || "Sede no especificada"}</strong>
                    <br />
                    <small style={{ color: "#718096" }}>{c.ipsDireccion || "Dirección no disponible"}</small>
                  </td>
                  <td>{c.portafolioNombre}</td>
                  <td>
                    <span>{c.serviciosSeleccionados.length} autorizados</span>
                  </td>
                  <td>
                    {c.clausulaTransporte ? (
                      <span className={styles.badgeTransporteSi}>
                        ♿ 🚐 Cobertura Activa
                      </span>
                    ) : (
                      <span className={styles.badgeTransporteNo}>
                        Sin Transporte
                      </span>
                    )}
                  </td>
                  <td>
                    <span
                      className={
                        c.estado === "Activo"
                          ? styles.badgeEstadoActivo
                          : styles.badgeEstadoRevision
                      }
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td>{c.fechaCreacion}</td>
                  <td>
                    <button
                      type="button"
                      className={styles.btnDesactivar}
                      onClick={() => onEliminarConvenio(c.id)}
                      title="Desactivar convenio"
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default ListaConvenios;
