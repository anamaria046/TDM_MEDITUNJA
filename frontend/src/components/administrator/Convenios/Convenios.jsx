import styles from "./Convenios.module.css";
import { useConvenios } from "./hooks/useConvenios";
import FormularioConvenio from "./FormularioConvenio";
import ListaConvenios from "./ListaConvenios";

function Convenios() {
  const {
    convenios,
    epsId,
    epsDisponibles,
    handleCambiarEps,
    ipsId,
    handleCambiarIps,
    ipsActual,
    ipsDisponibles,
    categorias,
    categoriaFiltro,
    setCategoriaFiltro,
    serviciosSeleccionados,
    serviciosFiltrados,
    convenioEditando,
    convenioEditandoId,
    notificacion,
    cargando,
    handleToggleServicio,
    handleSeleccionarTodosCategoria,
    handleDeseleccionarCategoria,
    handleRestablecer,
    handleCancelarEdicion,
    handleEditarConvenio,
    handleSubmit,
    handleEliminarConvenio
  } = useConvenios();

  return (
    <div className={styles.moduloConvenios}>
      <div className={styles.contenedorPrincipal}>
        {/* Cabecera del Módulo */}
        <header className={styles.cabeceraConvenios}>
          <h1 className={styles.tituloCabecera}>
            Gestión de Convenios Institucionales EPS - IPS
          </h1>
          <p className={styles.subtituloCabecera}>
            Formalización, alcance de servicios de salud autorizados y garantías de transporte preferencial adaptado en la red de Tunja.
          </p>
        </header>

        {/* Mensaje de notificación */}
        {notificacion && (
          <div className={styles.alertaNotificacion} role="alert">
            {notificacion}
          </div>
        )}
        {cargando && <p role="status">Cargando convenios...</p>}

        {/* Formulario de formalización de convenio */}
        {ipsActual && <FormularioConvenio
          epsId={epsId}
          epsCatalogo={epsDisponibles}
          setEpsId={handleCambiarEps}
          ipsId={ipsId}
          setIpsId={handleCambiarIps}
          ipsActual={ipsActual}
          ipsDisponibles={ipsDisponibles}
          categorias={categorias}
          categoriaFiltro={categoriaFiltro}
          setCategoriaFiltro={setCategoriaFiltro}
          serviciosSeleccionados={serviciosSeleccionados}
          serviciosFiltrados={serviciosFiltrados}
          convenioEditando={convenioEditando}
          onCancelarEdicion={handleCancelarEdicion}
          onToggleServicio={handleToggleServicio}
          onSeleccionarTodosCategoria={handleSeleccionarTodosCategoria}
          onDeseleccionarCategoria={handleDeseleccionarCategoria}
          onRestablecer={handleRestablecer}
          onSubmit={handleSubmit}
        />}

        {/* Listado de convenios vigentes */}
        <ListaConvenios
          convenios={convenios}
          onEliminarConvenio={handleEliminarConvenio}
          onEditarConvenio={handleEditarConvenio}
          convenioEditandoId={convenioEditandoId}
        />
      </div>
    </div>
  );
}

export default Convenios;
