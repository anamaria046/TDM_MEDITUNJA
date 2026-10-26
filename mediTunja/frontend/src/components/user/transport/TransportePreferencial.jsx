// Componente Principal de Transporte Preferencial
// MediTunja - Código estructurado en HTML semántico dentro de JSX
// Guiado bajo el patrón modular de Agendamiento de Citas (ScheduleAppointments)
// Integración de secuencia de flujo: Agendamiento -> Transporte -> Pagos -> Mapa

import { Link } from "react-router-dom";
import styles from "./TransportePreferencial.module.css";
import { TIPOS_DISCAPACIDAD, REQUERIMIENTOS_VEHICULO } from "./data/transporteData";
import { useTransporte } from "./hooks/useTransporte";
import ModalConfirmacion from "./ModalConfirmacion";
import ResumenExito from "./ResumenExito";

function TransportePreferencial() {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    datosCita,
    solicitudEnviada,
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
  } = useTransporte();

  return (
    <div className={`${styles.moduloTransporte} ${highContrast ? styles.modoAltoContraste : ""} ${styles[`fuente${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}`] || ""}`}>
      {/* 1. Barra superior de accesibilidad */}
      <aside className={styles.barraAccesibilidad} aria-label="Herramientas de accesibilidad">
        <div className={styles.accesibilidadContenedor}>
          <span className={styles.accesibilidadTitulo}>Herramientas de Accesibilidad:</span>
          <div className={styles.accesibilidadBotones}>
            <button
              type="button"
              className={styles.btnAccesibilidad}
              onClick={() => setHighContrast(!highContrast)}
              aria-pressed={highContrast}
            >
              👁️ {highContrast ? "Contraste Normal" : "Alto Contraste"}
            </button>
            <button
              type="button"
              className={styles.btnAccesibilidad}
              onClick={() => setFontSize(fontSize === "normal" ? "large" : fontSize === "large" ? "xlarge" : "normal")}
            >
              🔍 Texto: {fontSize.toUpperCase()}
            </button>
            <button
              type="button"
              className={`${styles.btnAccesibilidad} ${styles.btnAudio}`}
              onClick={() => alert("Audio-guía activada para personas con discapacidad visual.")}
            >
              🔊 Escuchar Página
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Barra de Secuencia Visual del Flujo de Usuario */}
      <nav className={styles.barraSecuencia} aria-label="Ruta y pasos del proceso">
        <ol className={styles.listaSecuencia}>
          <li className={`${styles.pasoSecuencia} ${styles.pasoCompletado}`}>
            <Link to="/citas" className={styles.enlacePasoSecuencia} title="Paso 1: Agendamiento y consulta de citas. Clic para volver si tienes dudas">
              <span className={styles.iconoPaso}>✓</span>
              <span>Agendamiento y consulta de citas</span>
            </Link>
          </li>
          <li className={`${styles.pasoSecuencia} ${styles.pasoActivo}`} aria-current="step">
            <span className={styles.iconoPaso}>2</span>
            <span>Transporte preferencial</span>
          </li>
          <li className={styles.pasoSecuencia}>
            <Link to="/pagos" className={styles.enlacePasoSecuencia} title="Paso 3: Ir al Módulo de Pagos">
              <span className={styles.iconoPaso}>3</span>
              <span>Módulo de Pagos</span>
            </Link>
          </li>
          <li className={`${styles.pasoSecuencia} ${styles.pasoPendiente}`}>
            <span className={styles.iconoPaso}>4</span>
            <span>Mapa</span>
          </li>
        </ol>
      </nav>

      {/* 3. Cabecera con navegación de retorno */}
      <header className={styles.cabeceraTransporte}>
        <nav aria-label="Navegación secundaria y opciones de ruta" className={styles.navFlujo}>
          <Link to="/citas" className={styles.enlaceVolver}>
            ← Volver a Agendamiento de Citas (Por si tienes alguna duda)
          </Link>
          <Link to="/pagos" className={styles.enlaceSaltarPagos}>
            Omitir Transporte e ir directo a Pagos →
          </Link>
        </nav>
        <div className={styles.encabezadoInfo}>
          <div className={styles.iconoPrincipal} aria-hidden="true">♿ 🚐</div>
          <div>
            <h1>Servicio de Transporte Preferencial Adaptado</h1>
            <p className={styles.descripcionCabecera}>
              Programa de transporte accesible de la EPS para pacientes con discapacidad y movilidad reducida.
              Garantizamos tu traslado seguro, puntual y digno hacia tu IPS de atención médica en Tunja.
            </p>
          </div>
        </div>

        {/* Banner de soporte */}
        <div className={styles.bannerSoporte} role="complementary">
          <span className={styles.iconoSoporte} aria-hidden="true">📞</span>
          <div>
            <strong>¿Necesitas ayuda para completar esta solicitud?</strong>
            <p>
              Llama gratis a la Línea Preferencial EPS Tunja: <a href="tel:018000912345">01 8000 912345</a> o solicita asistencia por WhatsApp al <a href="https://wa.me/573100000000" target="_blank" rel="noreferrer">310 000 0000</a>.
            </p>
          </div>
        </div>
      </header>

      {/* 4. Contenido Principal */}
      <main className={styles.contenidoPrincipal}>
        {solicitudEnviada ? (
          <ResumenExito
            datosCita={datosCita}
            requerimientosSeleccionados={requerimientosSeleccionados}
            catalogoRequerimientos={REQUERIMIENTOS_VEHICULO}
            onNuevaSolicitud={handleNuevaSolicitud}
          />
        ) : (
          <form onSubmit={handleSubmit} className={styles.formularioTransporte}>
            
            {/* SECCIÓN 1: DATOS DEL PACIENTE Y EPS (Bloqueados desde agendamiento de cita) */}
            <fieldset className={styles.seccionFormulario}>
              <legend className={styles.tituloSeccion}>
                <span className={styles.numeroPaso}>1</span> Datos del Paciente y EPS
              </legend>
              <p className={styles.ayudaSeccion}>
                <span className={styles.badgeBloqueado}>🔒 Información precargada</span> Datos verificados automáticamente desde el agendamiento de tu cita médica. No editables para garantizar la trazabilidad de tu servicio.
              </p>

              {/* Botón de duda para devolverse a citas */}
              <div className={styles.cajaDudaCita}>
                <span>¿Tienes alguna duda con estos datos o necesitas modificarlos?</span>
                <Link to="/citas" className={styles.btnDudaCitas}>
                  ← Devolverme a verificar en Agendamiento de Citas
                </Link>
              </div>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="tipoDocumento">Tipo de Documento:</label>
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
                  <label htmlFor="numeroDocumento">Número de Documento:</label>
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
                  <label htmlFor="nombresPaciente">Nombres y Apellidos Completos:</label>
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
                  <label htmlFor="epsPaciente">EPS a la que pertenece:</label>
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
                  <label htmlFor="telefonoPaciente">Teléfono de contacto del Paciente:</label>
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
                  <label htmlFor="telefonoCuidador">Teléfono de Acudiente o Contacto de Emergencia:</label>
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
                <span className={styles.numeroPaso}>2</span> Cita Médica e IPS de Destino en Tunja
              </legend>
              <p className={styles.ayudaSeccion}>
                <span className={styles.badgeBloqueado}>🔒 Información precargada</span> Datos de la cita programada en la IPS. El despacho coordinará la llegada del vehículo adaptado con 40 minutos de anticipación.
              </p>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="ipsDestino">IPS de Atención en Tunja:</label>
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
                  <label htmlFor="tipoAtencion">Servicio o Especialidad Médica:</label>
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
                  <label htmlFor="fechaCita">Fecha de la Cita Médica:</label>
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
                  <label htmlFor="horaCita">Hora Programada de la Cita:</label>
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
                <span className={styles.numeroPaso}>3</span> Condición de Discapacidad y Adaptaciones Requeridas
              </legend>
              <p className={styles.ayudaSeccion}>
                Al elegir tu condición médica, el sistema seleccionará automáticamente las adaptaciones recomendadas para tu traslado. Puedes modificarlas si lo requieres.
              </p>

              <div className={styles.campoFormulario}>
                <label htmlFor="tipoDiscapacidad">
                  Tipo de Discapacidad o Condición Médica: <span className={styles.requerido}>*</span>
                </label>
                <select
                  id="tipoDiscapacidad"
                  name="tipoDiscapacidad"
                  value={tipoDiscapacidad}
                  onChange={handleDiscapacidadChange}
                  required
                >
                  <option value="">-- Selecciona el tipo de condición médica --</option>
                  {TIPOS_DISCAPACIDAD.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
                {tipoDiscapacidad && requerimientosRecomendados.length > 0 && (
                  <small className={styles.alertaRecomendacion}>
                    ✨ Hemos preseleccionado automáticamente las adaptaciones técnicas recomendadas para tu condición.
                  </small>
                )}
              </div>

              {/* Tarjetas de requerimientos adaptados */}
              <div className={styles.campoFormulario}>
                <span className={styles.etiquetaGrupo}>
                  Requerimientos Específicos del Vehículo Adaptado (Selecciona las que apliquen):
                </span>

                <div className={styles.rejillaOpciones} role="group" aria-label="Adaptaciones técnicas del vehículo">
                  {REQUERIMIENTOS_VEHICULO.map((req) => {
                    const isChecked = requerimientosSeleccionados.includes(req.id);
                    const isRecommended = requerimientosRecomendados.includes(req.id);

                    return (
                      <label
                        key={req.id}
                        className={`${styles.opcionTarjeta} ${isChecked ? styles.opcionActiva : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleRequerimiento(req.id);
                        }}
                      >
                        <input
                          type="checkbox"
                          name={`req_${req.id}`}
                          checked={isChecked}
                          onChange={() => {}}
                        />
                        <span className={styles.opcionContenido}>
                          <span className={styles.opcionIcono} aria-hidden="true">{req.icono}</span>
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
                    ¿Viaja con Acompañante o Cuidador?: <span className={styles.requerido}>*</span>
                  </label>
                  <select
                    id="viajaAcompanante"
                    name="viajaAcompanante"
                    value={viajaAcompanante}
                    onChange={(e) => setViajaAcompanante(e.target.value)}
                    required
                  >
                    <option value="no">No, el paciente viajará solo (Requiere asistencia del conductor)</option>
                    <option value="si">Sí, viajará 1 acompañante / cuidador (Recomendado)</option>
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
                <span className={styles.numeroPaso}>4</span> Domicilio de Recogida y Retorno en Tunja
              </legend>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label htmlFor="direccionOrigen">
                    Dirección Exacta de Recogida: <span className={styles.requerido}>*</span>
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
                <label htmlFor="puntosReferencia">Puntos de Referencia y Accesibilidad del Inmueble:</label>
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
                  Modalidad del Traslado: <span className={styles.requerido}>*</span>
                </label>
                <select
                  id="modalidadViaje"
                  name="modalidadViaje"
                  value={modalidadViaje}
                  onChange={(e) => setModalidadViaje(e.target.value)}
                  required
                >
                  <option value="ida-y-regreso">Ida y Regreso (El transporte me lleva a la IPS y me regresa al domicilio)</option>
                  <option value="solo-ida">Solo Ida (Solo necesito el traslado hacia la IPS)</option>
                  <option value="solo-regreso">Solo Regreso (Traslado desde la IPS de regreso a casa)</option>
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
                  Declaro que la información suministrada es verídica y que el servicio es solicitado para facilitar la atención médica prioritaria del paciente con discapacidad en la IPS de Tunja, conforme a las políticas de salud y movilidad accesible.
                </span>
              </label>
            </div>

            {/* Botones de acción del formulario con navegación del flujo */}
            <div className={styles.botonesFormulario}>
              <Link to="/citas" className={styles.btnVolverCitas}>
                ← Volver a Citas
              </Link>
              <button type="button" className={styles.btnLimpiar} onClick={handleSolicitarLimpiar}>
                Limpiar Campos
              </button>
              <Link to="/pagos" className={styles.btnOmitirTransporte}>
                Omitir transporte e ir a Pagos →
              </Link>
              <button type="submit" className={styles.btnSolicitarTransporte}>
                🚐 Confirmar Transporte y Continuar
              </button>
            </div>
          </form>
        )}
      </main>

      {/* 5. Ventana modal de confirmación para desmarcar requerimientos recomendados */}
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
            <div className="modal-icono" aria-hidden="true">🗑️</div>

            <h3 id="modal-limpiar-titulo" className="modal-titulo">
              ¿Estás seguro de que deseas limpiar todos los campos?
            </h3>

            <p id="modal-limpiar-descripcion" className="modal-descripcion">
              Esta acción borrará <strong>toda la información</strong> que hayas ingresado en el formulario de transporte: condición de discapacidad, adaptaciones, datos de recogida y declaración.
            </p>

            <p className="modal-aclaracion">
              Los datos del paciente y de la cita médica <strong>no se verán afectados</strong>, ya que están precargados desde tu agendamiento.
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
                Sí, limpiar campos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Pie de página */}
      <footer className={styles.pieTransporte}>
        <div className={styles.pieContenedor}>
          <p>
            <strong>MediTunja - Transporte Preferencial en Salud</strong> | Proyecto de Usabilidad y Taller de Diseño Multimedia.
          </p>
          <p className={styles.pieAclaracion}>
            Cumple con lineamientos de accesibilidad web (WCAG 2.1) para garantizar que los pacientes con discapacidad de cualquier EPS en Tunja accedan de manera oportuna, eficaz y humana a sus servicios en salud.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default TransportePreferencial;
