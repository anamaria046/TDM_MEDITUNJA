import styles from "./Convenios.module.css";
import { nombreIpsComoEnMapa } from "./ipsNombresMapa.js";

function FormularioConvenio({
  epsId,
  epsCatalogo,
  setEpsId,
  ipsId,
  setIpsId,
  ipsActual,
  ipsDisponibles,
  categorias,
  categoriaFiltro,
  setCategoriaFiltro,
  serviciosSeleccionados,
  serviciosFiltrados,
  convenioEditando,
  onToggleServicio,
  onSeleccionarTodosCategoria,
  onDeseleccionarCategoria,
  onRestablecer,
  onCancelarEdicion,
  onSubmit
}) {
  return (
    <form id="formulario-convenio" onSubmit={onSubmit} className={styles.formularioConvenios}>
      {/* 1. Identificación de Instituciones (IPS Prestadora y EPS Gestora en Tunja) */}
      <fieldset className={styles.seccionConvenio}>
        <legend className={styles.tituloSeccion}>
          <span className={styles.numeroPaso}>1</span> Institución Prestadora de Salud (IPS)
        </legend>
        <p className={styles.descripcionSeccion}>
          Seleccione la entidad prestadora en la ciudad de Tunja con la que se formalizará el convenio.
        </p>

        {/* Selector de IPS Prestadora */}
        <div className={styles.filaFormulario}>
          <div className={styles.campoFormulario}>
            <label htmlFor="ipsSelect">Entidad Prestadora / IPS:</label>
            <select
              id="ipsSelect"
              value={ipsId}
              onChange={(e) => setIpsId(e.target.value)}
            >
              {ipsDisponibles.map((ips) => (
                <option key={ips.id} value={ips.id}>
                  {nombreIpsComoEnMapa(ips)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de EPS Gestora */}
        {epsId && setEpsId && epsCatalogo.length > 0 ? (
          <div className={styles.filaFormulario} style={{ marginTop: "1.25rem" }}>
            <div className={styles.campoFormulario}>
              <label htmlFor="epsSelect">Entidad Promotora de Salud (EPS Gestora):</label>
              <select
                id="epsSelect"
                value={epsId}
                onChange={(e) => setEpsId(e.target.value)}
              >
                {epsCatalogo.map((eps) => (
                  <option key={eps.id} value={eps.id}>
                    {eps.nombre} — {eps.sede}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <p role="alert">La EPS asignada a esta cuenta no está en el catálogo disponible.</p>
        )}
      </fieldset>

      {/* 2. Alcance de Servicios y Cobertura (con servicios filtrados por categorías y cláusula de transporte) */}
      <fieldset className={styles.seccionConvenio}>
        <legend className={styles.tituloSeccion}>
          <span className={styles.numeroPaso}>2</span> Alcance de Servicios y Cobertura
        </legend>
        <p className={styles.descripcionSeccion}>
          Servicios de referencia para {nombreIpsComoEnMapa(ipsActual)}. Confirma disponibilidad y códigos con la IPS antes de formalizar.
        </p>

        {/* Servicios Filtrados por Categorías */}
        <div className={styles.contenedorFiltroServicios}>
          <label><strong>Servicios de Salud Autorizados (Filtrados por Categoría):</strong></label>
          
          {/* Pestañas de categorías */}
          <div className={styles.barraFiltroCategorias} role="tablist" aria-label="Categorías de servicios">
            {categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={categoriaFiltro === cat.id}
                className={`${styles.pestanaCategoria} ${
                  categoriaFiltro === cat.id ? styles.pestanaActiva : ""
                }`}
                onClick={() => setCategoriaFiltro(cat.id)}
              >
                {cat.nombre}
              </button>
            ))}
          </div>

          {/* Acciones de selección rápida y conteo */}
          <div className={styles.barraAccionesFiltro}>
            <span>
              Mostrando {serviciosFiltrados.length} servicios |{" "}
              <strong>{serviciosSeleccionados.length} autorizados</strong> en total
            </span>
            <div className={styles.botonesSeleccionRapida}>
              <button
                type="button"
                className={styles.btnAccionFiltro}
                onClick={onSeleccionarTodosCategoria}
              >
                + Marcar todos de esta categoría
              </button>
              <button
                type="button"
                className={styles.btnAccionFiltro}
                onClick={onDeseleccionarCategoria}
              >
                - Desmarcar categoría
              </button>
            </div>
          </div>

          {/* Rejilla interactiva de servicios con checkboxes */}
          <div className={styles.rejillaServicios} role="group" aria-label="Servicios médicos disponibles">
            {serviciosFiltrados.map((srv) => {
              const estaSeleccionado = serviciosSeleccionados.includes(srv.id);
              return (
                <label
                  key={srv.id}
                  className={`${styles.tarjetaServicio} ${
                    estaSeleccionado ? styles.servicioSeleccionado : ""
                  }`}
                  htmlFor={`srv-${srv.id}`}
                >
                  <input
                    type="checkbox"
                    id={`srv-${srv.id}`}
                    className={styles.checkServicio}
                    checked={estaSeleccionado}
                    onChange={() => onToggleServicio(srv.id)}
                  />
                  <div className={styles.infoServicio}>
                    <span className={styles.nombreServicio}>{srv.nombre}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Cláusula Obligatoria de Transporte Preferencial Adaptado */}
        <div className={styles.cajaClausulaTransporte}>
          <label className={styles.controlClausula} htmlFor="checkClausulaTransporte">
            <input
              type="checkbox"
              id="checkClausulaTransporte"
              className={styles.checkClausula}
              checked
              disabled
            />
            <div className={styles.contenidoClausula}>
              <div className={styles.encabezadoClausula}>
                <span className={styles.tituloClausula}>
                  Cláusula Obligatoria de Transporte Preferencial Adaptado
                </span>
                <span
                  className={`${styles.badgeClausula} ${styles.badgeIncluido}`}
                >
                  Siempre activa
                </span>
              </div>
              <p className={styles.descripcionClausula}>
                Garantiza que los pacientes con discapacidad física, movilidad reducida o usuarios en silla de ruedas de Tunja cuenten con cobertura de traslado puerta a puerta hacia este IPS.
              </p>
            </div>
          </label>
        </div>
      </fieldset>

      {/* Botones de acción */}
      <div className={styles.barraBotonesAccion}>
        <button
          type="button"
          className={styles.btnRestablecer}
          onClick={onRestablecer}
        >
          Restablecer
        </button>
        {convenioEditando && (
          <button type="button" className={styles.btnRestablecer} onClick={onCancelarEdicion}>
            Cancelar edición
          </button>
        )}
        <button type="submit" className={styles.btnFormalizar}>
          {convenioEditando ? "Guardar cambios" : "Actualizar convenio"}
        </button>
      </div>
    </form>
  );
}

export default FormularioConvenio;
