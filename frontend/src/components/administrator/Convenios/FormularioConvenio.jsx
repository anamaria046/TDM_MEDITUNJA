// Subcomponente de Formulario de Formalización de Convenio
// MediTunja - Módulo de Convenios (Gestión Administrativa)
// Maquetación limpia en HTML semántico dentro de JSX con CSS Modules

import styles from "./Convenios.module.css";
import {
  IPS_CATALOGO,
  EPS_CATALOGO,
  PORTAFOLIOS_ASISTENCIALES,
  CATEGORIAS_SERVICIOS
} from "./data/conveniosData";

function FormularioConvenio({
  epsId,
  setEpsId,
  ipsId,
  setIpsId,
  ipsActual,
  portafolioId,
  setPortafolioId,
  categoriaFiltro,
  setCategoriaFiltro,
  serviciosSeleccionados,
  serviciosFiltrados,
  clausulaTransporte,
  setClausulaTransporte,
  onToggleServicio,
  onSeleccionarTodosCategoria,
  onDeseleccionarCategoria,
  onRestablecer,
  onSubmit
}) {
  const ipsSeleccionada =
    ipsActual ||
    IPS_CATALOGO.find((ips) => ips.id === ipsId) ||
    IPS_CATALOGO[0];

  return (
    <form onSubmit={onSubmit} className={styles.formularioConvenios}>
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
              {IPS_CATALOGO.map((ips) => (
                <option key={ips.id} value={ips.id}>
                  {ips.nombre} — {ips.sede}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector de EPS Gestora */}
        {epsId && setEpsId && (
          <div className={styles.filaFormulario} style={{ marginTop: "1.25rem" }}>
            <div className={styles.campoFormulario}>
              <label htmlFor="epsSelect">Entidad Promotora de Salud (EPS Gestora):</label>
              <select
                id="epsSelect"
                value={epsId}
                onChange={(e) => setEpsId(e.target.value)}
              >
                {EPS_CATALOGO.map((eps) => (
                  <option key={eps.id} value={eps.id}>
                    {eps.nombre} — {eps.sede}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </fieldset>

      {/* 2. Alcance de Servicios y Cobertura (con servicios filtrados por categorías y cláusula de transporte) */}
      <fieldset className={styles.seccionConvenio}>
        <legend className={styles.tituloSeccion}>
          <span className={styles.numeroPaso}>2</span> Alcance de Servicios y Cobertura
        </legend>
        <p className={styles.descripcionSeccion}>
          Servicios de referencia para {ipsSeleccionada.nombre} — {ipsSeleccionada.sede}. Confirma disponibilidad y códigos con la IPS antes de formalizar.
        </p>

        {/* Portafolio Asistencial Pactado */}
        <div className={styles.filaFormulario}>
          <div className={styles.campoFormulario}>
            <label htmlFor="portafolioSelect">Portafolio Asistencial Pactado:</label>
            <select
              id="portafolioSelect"
              value={portafolioId}
              onChange={(e) => setPortafolioId(e.target.value)}
            >
              {PORTAFOLIOS_ASISTENCIALES.map((portafolio) => (
                <option key={portafolio.id} value={portafolio.id}>
                  {portafolio.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Servicios Filtrados por Categorías */}
        <div className={styles.contenedorFiltroServicios}>
          <label><strong>Servicios de Salud Autorizados (Filtrados por Categoría):</strong></label>
          
          {/* Pestañas de categorías */}
          <div className={styles.barraFiltroCategorias} role="tablist" aria-label="Categorías de servicios">
            {CATEGORIAS_SERVICIOS.map((cat) => (
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
                    {srv.codigo && (
                      <span className={styles.codigoServicio}>CUPS: {srv.codigo}</span>
                    )}
                    <span className={styles.nombreServicio}>{srv.nombre}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Cláusula Obligatoria de Transporte Preferencial Adaptado */}
        <div
          className={`${styles.cajaClausulaTransporte} ${
            !clausulaTransporte ? styles.clausulaInactiva : ""
          }`}
        >
          <label className={styles.controlClausula} htmlFor="checkClausulaTransporte">
            <input
              type="checkbox"
              id="checkClausulaTransporte"
              className={styles.checkClausula}
              checked={clausulaTransporte}
              onChange={(e) => setClausulaTransporte(e.target.checked)}
            />
            <div className={styles.contenidoClausula}>
              <div className={styles.encabezadoClausula}>
                <span className={styles.tituloClausula}>
                  <span aria-hidden="true">♿ 🚐</span> Cláusula Obligatoria de Transporte Preferencial Adaptado
                </span>
                <span
                  className={`${styles.badgeClausula} ${
                    clausulaTransporte ? styles.badgeIncluido : styles.badgeExcluido
                  }`}
                >
                  {clausulaTransporte ? "Incluido" : "Excluido"}
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
        <button type="submit" className={styles.btnFormalizar}>
          📄 Formalizar y Activar Convenio
        </button>
      </div>
    </form>
  );
}

export default FormularioConvenio;
