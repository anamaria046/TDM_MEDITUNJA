import styles from "./Convenios.module.css";
import { direccionIpsComoEnMapa, nombreIpsComoEnMapa } from "./ipsNombresMapa.js";

function ListaConvenios({ convenios, onEliminarConvenio, onEditarConvenio, convenioEditandoId }) {
  const conveniosOrdenados = [...convenios].sort((a, b) =>
    nombreIpsComoEnMapa({ id: a.ipsId, nombre: a.ipsNombre, sede: a.ipsSede })
      .localeCompare(
        nombreIpsComoEnMapa({ id: b.ipsId, nombre: b.ipsNombre, sede: b.ipsSede }),
        "es",
        { sensitivity: "base" }
      )
  );

  return (
    <section className={styles.seccionListado}>
      <h3 className={styles.tituloSeccion}>
        Convenios Formalizados en la Red Tunja
      </h3>
      <p className={styles.descripcionSeccion}>
        Convenios institucionales activos y en revisión entre las entidades promotoras (EPS) y los prestadores de salud (IPS) de Tunja.
      </p>

      <div className={styles.tablaContenedor}>
        <table className={styles.tablaConvenios} aria-label="Tabla de convenios vigentes">
          <thead>
            <tr>
              <th>Prestador (IPS)</th>
              <th>Dirección IPS</th>
              <th>Servicios</th>
              <th>Transporte Preferencial</th>
              <th>Estado</th>
              <th>Fecha Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {conveniosOrdenados.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.mensajeVacio}>
                  No hay convenios registrados actualmente.
                </td>
              </tr>
            ) : (
              conveniosOrdenados.map((c) => (
                <tr key={c.id}>
                  <td>{nombreIpsComoEnMapa({ id: c.ipsId, nombre: c.ipsNombre, sede: c.ipsSede })}</td>
                  <td>
                    <small style={{ color: "#718096" }}>{direccionIpsComoEnMapa({ id: c.ipsId, direccion: c.ipsDireccion })}</small>
                  </td>
                  <td>
                    <span>{c.serviciosSeleccionados.length} autorizados</span>
                  </td>
                  <td>
                    {c.clausulaTransporte ? (
                      <span className={styles.badgeTransporteSi}>
                        Cobertura Activa
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
                    <div className={styles.accionesConvenio}>
                      <button
                        type="button"
                        className={styles.btnEditar}
                        onClick={() => onEditarConvenio(c)}
                        aria-pressed={convenioEditandoId === c.id}
                      >
                        Editar
                      </button>
                      {c.estado === "Activo" ? (
                        <button
                          type="button"
                          className={styles.btnDesactivar}
                          onClick={() => onEliminarConvenio(c.id)}
                          title="Desactivar convenio"
                        >
                          Desactivar
                        </button>
                      ) : <span>Desactivado</span>}
                    </div>
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
