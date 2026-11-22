// Componente Principal de Transporte Preferencial
// MediTunja - Código estructurado en HTML semántico dentro de JSX
// Guiado bajo el patrón modular de Agendamiento de Citas (ScheduleAppointments)
// Integración de secuencia de flujo: Agendamiento -> Transporte -> Pagos -> Mapa

import { Link } from "react-router-dom";
import { Accessibility, Ambulance, Dog, DoorOpen, ShieldCheck, Wind } from "lucide-react";
import ThemeToggle from "../../ThemeToggle/ThemeToggle.jsx";
import styles from "./TransportePreferencial.module.css";
import { TIPOS_DISCAPACIDAD, REQUERIMIENTOS_VEHICULO } from "./data/transporteData";
import { useTransporte } from "./hooks/useTransporte";
import ModalConfirmacion from "./ModalConfirmacion";
import ResumenExito from "./ResumenExito";

const ICONOS_REQUERIMIENTO = {
  rampa: Accessibility,
  anclaje: ShieldCheck,
  "piso-bajo": DoorOpen,
  oxigeno: Wind,
  "perro-guia": Dog,
  camilla: Ambulance,
};

function TransportePreferencial({ citaId }) {
  const {
    datosCita,
    citaCargando,
    errorCita,
    solicitudEnviada,
    solicitudId,
    estadoSolicitud,
    enviando,
    errorSolicitud,
    handleSubmit,
    handleNuevaSolicitud,
    tipoDiscapacidad,
    handleDiscapacidadChange,
    requerimientosSeleccionados,
    requerimientosRecomendados,
    handleToggleRequerimiento,
    modalConfirmacion,
    confirmarQuitarRequerimiento,
    cancelarQuitarRequerimiento,
    modalLimpiar,
    handleSolicitarLimpiar,
    confirmarLimpiar,
    cancelarLimpiar,
    viajaAcompanante,
    setViajaAcompanante,
    nombreAcompanante,
    setNombreAcompanante,
    direccionOrigen,
    setDireccionOrigen,
    barrioSector,
    setBarrioSector,
    puntosReferencia,
    setPuntosReferencia,
    modalidadViaje,
    setModalidadViaje,
    declaracionVeracidad,
    setDeclaracionVeracidad
  } = useTransporte(citaId);
  const idPago = datosCita?.citaId || citaId;
  const rutaPagos = idPago ? `/pagos?cita=${encodeURIComponent(idPago)}` : "/pagos";

  return (
    <div className={styles.moduloTransporte}>
      {/* 1. Barra de Secuencia Visual del Flujo de Usuario */}
      <nav className={styles.barraSecuencia} aria-label="Pasos de tu cita">
        <ol className={styles.listaSecuencia}>
          <li className={`${styles.pasoSecuencia} ${styles.pasoCompletado}`}>
            <Link to="/mis-citas" className={styles.enlacePasoSecuencia}>
              <span className={styles.iconoPaso} aria-hidden="true">1</span>
              <span>Cita</span>
            </Link>
          </li>
          <li className={`${styles.pasoSecuencia} ${styles.pasoActivo}`} aria-current="step">
            <span className={styles.iconoPaso} aria-hidden="true">2</span>
            <span>Transporte</span>
          </li>
          <li className={styles.pasoSecuencia}>
            <Link to={rutaPagos} className={styles.enlacePasoSecuencia}>
              <span className={styles.iconoPaso} aria-hidden="true">3</span>
              <span>Pagos</span>
            </Link>
          </li>
        </ol>
      </nav>

      {/* 2. Cabecera con navegación de retorno */}
      <header className={styles.cabeceraTransporte}>
        <div className={styles.cabeceraTitulo}>
          <h1>Transporte preferencial</h1>
          <ThemeToggle className={styles.botonTema} />
        </div>
        <p className={styles.descripcionCabecera}>
          Solicita un traslado accesible para tu cita. La EPS te confirmará si hay transporte disponible.
        </p>
        <nav aria-label="Opciones de la cita" className={styles.navFlujo}>
          <Link to="/mis-citas" className={styles.enlaceVolver}>Ver mis citas</Link>
          <Link to={rutaPagos} className={styles.enlaceSaltarPagos}> Ir a pagos sin transporte</Link>
        </nav>
      </header>

      {/* 3. Contenido Principal */}
      <main className={styles.contenidoPrincipal}>
        {citaId && datosCita && <p className={styles.estadoCita} role="status">Cita confirmada · {datosCita.codigoCita}</p>}
        {citaCargando ? (
          <p role="status">Consultando tus citas confirmadas...</p>
        ) : !datosCita ? (
          <section role="alert">
            <h2>No hay una cita disponible para transporte</h2>
            <p>{errorCita}</p>
            <Link to="/citas">Consultar o agendar una cita</Link>
          </section>
        ) : solicitudEnviada ? (
          <ResumenExito
            rutaPagos={rutaPagos}
            datosCita={datosCita}
            solicitudId={solicitudId}
            estadoSolicitud={estadoSolicitud}
            requerimientosSeleccionados={requerimientosSeleccionados}
            catalogoRequerimientos={REQUERIMIENTOS_VEHICULO}
            onNuevaSolicitud={handleNuevaSolicitud}
          />
        ) : (
          <form onSubmit={handleSubmit} className={styles.formularioTransporte}>
            
            {/* SECCIÓN 1: DATOS DEL PACIENTE Y EPS (Bloqueados desde agendamiento de cita) */}
            <fieldset className={styles.seccionFormulario}>
              <legend className={styles.tituloSeccion}>
                <span className={styles.numeroSeccion}>1</span> Datos del paciente
              </legend>
              <p className={styles.ayudaSeccion}>
                Estos datos vienen de tu perfil.
              </p>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="tipoDocumento">Tipo de documento</label>
                  <input
                    type="text"
                    id="tipoDocumento"
                    name="tipoDocumento"
                    value={datosCita.tipoDocumentoTexto}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label htmlFor="numeroDocumento">Número de documento</label>
                  <input
                    type="text"
                    id="numeroDocumento"
                    name="numeroDocumento"
                    value={datosCita.numeroDocumento}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                  <small className={styles.textoAyuda}>Dato verificado del documento de identidad.</small>
                </div>
              </div>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="nombresPaciente">Nombre completo</label>
                  <input
                    type="text"
                    id="nombresPaciente"
                    name="nombresPaciente"
                    value={datosCita.nombresPaciente}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label htmlFor="epsPaciente">EPS</label>
                  <input
                    type="text"
                    id="epsPaciente"
                    name="epsPaciente"
                    value={datosCita.epsPacienteTexto}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                </div>
              </div>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="telefonoPaciente">Teléfono del paciente</label>
                  <input
                    type="tel"
                    id="telefonoPaciente"
                    name="telefonoPaciente"
                    value={datosCita.telefonoPaciente}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label htmlFor="telefonoCuidador">Teléfono de emergencia</label>
                  <input
                    type="tel"
                    id="telefonoCuidador"
                    name="telefonoCuidador"
                    value={datosCita.telefonoCuidador}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                  <small className={styles.textoAyuda}>Persona a quien el conductor llamará en caso de necesidad.</small>
                </div>
              </div>
            </fieldset>

            {/* SECCIÓN 2: CITA MÉDICA E IPS DE DESTINO (Numeral 2; sin número de autorización) */}
            <fieldset className={styles.seccionFormulario}>
              <legend className={styles.tituloSeccion}>
                <span className={styles.numeroSeccion}>2</span> Datos de la cita
              </legend>
              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="ipsDestino">IPS de destino</label>
                  <input
                    type="text"
                    id="ipsDestino"
                    name="ipsDestino"
                    value={datosCita.ipsDestinoTexto}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label htmlFor="tipoAtencion">Servicio o especialidad</label>
                  <input
                    type="text"
                    id="tipoAtencion"
                    name="tipoAtencion"
                    value={datosCita.tipoAtencion}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                </div>
              </div>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="fechaCita">Fecha de la cita</label>
                  <input
                    type="date"
                    id="fechaCita"
                    name="fechaCita"
                    value={datosCita.fechaCita}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label htmlFor="horaCita">Hora de la cita</label>
                  <input
                    type="time"
                    id="horaCita"
                    name="horaCita"
                    value={datosCita.horaCita}
                    disabled
                    readOnly
                    className={styles.campoBloqueado}
                  />
                  <small className={styles.textoAyuda}>El vehículo llegará entre 40 y 50 minutos antes a tu domicilio.</small>
                </div>
              </div>
            </fieldset>

            {/* SECCIÓN 3: CONDICIÓN DE DISCAPACIDAD Y ADAPTACIONES REQUERIDAS */}
            <fieldset className={styles.seccionFormulario}>
              <legend className={styles.tituloSeccion}>
                <span className={styles.numeroSeccion}>3</span> Apoyos para el traslado
              </legend>
              <p className={styles.ayudaSeccion}>
                Elige tu condición y ajusta las adaptaciones sugeridas.
              </p>

              <div className={styles.campoFormulario}>
                <label htmlFor="tipoDiscapacidad">
                  Discapacidad o condición médica <span className={styles.requerido}>*</span>
                </label>
                <select
                  id="tipoDiscapacidad"
                  name="tipoDiscapacidad"
                  value={tipoDiscapacidad}
                  onChange={handleDiscapacidadChange}
                  required
                >
                  <option value="">Selecciona una opción</option>
                  {TIPOS_DISCAPACIDAD.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {tipoDiscapacidad && requerimientosRecomendados.length > 0 && (
                  <small className={styles.alertaRecomendacion}>
                    Revisa las adaptaciones recomendadas para tu traslado.
                  </small>
                )}
              </div>

              {/* Tarjetas de requerimientos adaptados */}
              <div className={styles.campoFormulario}>
                <span className={styles.etiquetaGrupo}>
                  Adaptaciones del vehículo
                </span>

                <div className={styles.rejillaOpciones} role="group" aria-label="Adaptaciones técnicas del vehículo">
                  {REQUERIMIENTOS_VEHICULO.map((req) => {
                    const isChecked = requerimientosSeleccionados.includes(req.id);
                    const isRecommended = requerimientosRecomendados.includes(req.id);
                    const Icono = ICONOS_REQUERIMIENTO[req.id];

                    return (
                      <label
                        key={req.id}
                        className={`${styles.opcionTarjeta} ${isChecked ? styles.opcionActiva : ""}`}
                      >
                        <input
                          type="checkbox"
                          name={`req_${req.id}`}
                          checked={isChecked}
                          onChange={() => handleToggleRequerimiento(req.id)}
                        />
                        <span className={styles.opcionContenido}>
                          <span className={styles.iconoAdaptacion} aria-hidden="true">
                            <Icono size={20} strokeWidth={2} />
                          </span>
                          <span>
                            <strong>
                              {req.titulo}{" "}
                              {isRecommended && (
                                <span className={styles.badgeRecomendado}>Recomendado</span>
                              )}
                            </strong>
                            <small>{req.descripcion}</small>
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ¿Viaja con Acompañante?: Solo muestra y exige el nombre si se elige "si" */}
              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="viajaAcompanante">
                    ¿Viajas con acompañante? <span className={styles.requerido}>*</span>
                  </label>
                  <select
                    id="viajaAcompanante"
                    name="viajaAcompanante"
                    value={viajaAcompanante}
                    onChange={(e) => setViajaAcompanante(e.target.value)}
                    required
                  >
                    <option value="no">No, viajo solo</option>
                    <option value="si">Sí, viajo con un acompañante</option>
                  </select>
                </div>

                {viajaAcompanante === "si" && (
                  <div className={styles.campoFormulario}>
                    <label htmlFor="nombreAcompanante">
                      Nombre del Acompañante: <span className={styles.requerido}>*</span>
                    </label>
                    <input
                      type="text"
                      id="nombreAcompanante"
                      name="nombreAcompanante"
                      value={nombreAcompanante}
                      onChange={(e) => setNombreAcompanante(e.target.value)}
                      placeholder="Nombre completo y parentesco"
                      required
                    />
                  </div>
                )}
              </div>
            </fieldset>

            {/* SECCIÓN 4: LOGÍSTICA DE RECOGIDA Y RETORNO */}
            <fieldset className={styles.seccionFormulario}>
              <legend className={styles.tituloSeccion}>
                <span className={styles.numeroSeccion}>4</span> Recogida y regreso
              </legend>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="direccionOrigen">
                  Dirección de recogida <span className={styles.requerido}>*</span>
                  </label>
                  <input
                    type="text"
                    id="direccionOrigen"
                    name="direccionOrigen"
                    value={direccionOrigen}
                    onChange={(e) => setDireccionOrigen(e.target.value)}
                    placeholder="Ej: Carrera 2 Este # 18-45, Barrio Santa Inés"
                    required
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label htmlFor="barrioSector">
                    Barrio o Sector: <span className={styles.requerido}>*</span>
                  </label>
                  <input
                    type="text"
                    id="barrioSector"
                    name="barrioSector"
                    value={barrioSector}
                    onChange={(e) => setBarrioSector(e.target.value)}
                    placeholder="Ej: Barrio Los Muiscas / Cooservicios"
                    required
                  />
                </div>
              </div>

              <div className={styles.campoFormulario}>
                <label htmlFor="puntosReferencia">Referencias de acceso (opcional)</label>
                <textarea
                  id="puntosReferencia"
                  name="puntosReferencia"
                  rows={3}
                  value={puntosReferencia}
                  onChange={(e) => setPuntosReferencia(e.target.value)}
                  placeholder="Ej: Casa esquinera frente al parqueadero. Hay rampa en la entrada. El paciente requiere apoyo para bajar dos escalones."
                />
                <small className={styles.textoAyuda}>Indica si hay escaleras, si la calle es empinada o si el vehículo puede estacionar al frente.</small>
              </div>

              <div className={styles.campoFormulario}>
                <label htmlFor="modalidadViaje">
                  Tipo de viaje <span className={styles.requerido}>*</span>
                </label>
                <select
                  id="modalidadViaje"
                  name="modalidadViaje"
                  value={modalidadViaje}
                  onChange={(e) => setModalidadViaje(e.target.value)}
                  required
                >
                  <option value="ida-y-regreso">Ida y regreso</option>
                  <option value="solo-ida">Solo ida a la IPS</option>
                  <option value="solo-regreso">Solo regreso a casa</option>
                </select>
              </div>
            </fieldset>

            {/* Declaración de veracidad */}
            <div className={styles.declaracionPaciente}>
              <label className={styles.checkboxDeclaracion}>
                <input
                  type="checkbox"
                  id="declaracionVeracidad"
                  name="declaracionVeracidad"
                  checked={declaracionVeracidad}
                  onChange={(e) => setDeclaracionVeracidad(e.target.checked)}
                  required
                />
                <span>
                  Confirmo que los datos ingresados son correctos y que solicito el traslado para asistir a esta cita.
                </span>
              </label>
            </div>

            {/* Botones de acción del formulario con navegación del flujo */}
            <div className={styles.botonesFormulario}>
              <button type="button" className={styles.btnLimpiar} onClick={handleSolicitarLimpiar}>
                Limpiar formulario
              </button>
              <Link to={rutaPagos} className={styles.btnOmitirTransporte}>
                Ir a pagos sin transporte
              </Link>
              {errorSolicitud && <p role="alert">{errorSolicitud}</p>}
              <button type="submit" className={styles.btnSolicitarTransporte} disabled={enviando}>
                {enviando ? "Enviando solicitud…" : "Solicitar transporte"}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* 4. Ventana modal de confirmación para desmarcar requerimientos recomendados */}
      <ModalConfirmacion
        isOpen={modalConfirmacion.isOpen}
        reqTitulo={modalConfirmacion.reqTitulo}
        onConfirm={confirmarQuitarRequerimiento}
        onCancel={cancelarQuitarRequerimiento}
      />

      {/* 5b. Ventana modal de confirmación para limpiar todos los campos */}
      {modalLimpiar && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-limpiar-titulo"
          aria-describedby="modal-limpiar-descripcion"
        >
          <div className="modal-contenido">

            <h3 id="modal-limpiar-titulo" className="modal-titulo">
              ¿Limpiar el formulario?
            </h3>

            <p id="modal-limpiar-descripcion" className="modal-descripcion">
              Se borrarán los datos que ingresaste para solicitar el traslado.
            </p>

            <div className="modal-acciones">
              <button
                type="button"
                className="btn-modal-cancelar"
                onClick={cancelarLimpiar}
                autoFocus
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-confirmar"
                onClick={confirmarLimpiar}
              >
                Limpiar formulario
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default TransportePreferencial;
