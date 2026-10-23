import { useState } from "react";
import { Link } from "react-router-dom";
import "./TransportePreferencial.module.css";

function TransportePreferencial() {
    // Estado para accesibilidad (tamaño de texto y alto contraste)
    const [fontSize, setFontSize] = useState("normal"); // 'normal', 'large', 'xlarge'
    const [highContrast, setHighContrast] = useState(false);
    
    // Estado para simulación de confirmación
    const [solicitudEnviada, setSolicitudEnviada] = useState(false);
    const [viajeConAcompanante, setViajeConAcompanante] = useState("si");

    // Manejador del envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        setSolicitudEnviada(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className={`modulo-transporte ${highContrast ? "modo-alto-contraste" : ""} fuente-${fontSize}`}>
            {/* Barra superior de herramientas de accesibilidad universal */}
            <aside className="barra-accesibilidad" aria-label="Herramientas de accesibilidad para personas con discapacidad">
                <div className="accesibilidad-contenedor">
                    <span className="accesibilidad-titulo">Herramientas de Accesibilidad:</span>
                    <div className="accesibilidad-botones">
                        <button 
                            type="button" 
                            className="btn-accesibilidad"
                            onClick={() => setHighContrast(!highContrast)}
                            aria-pressed={highContrast}
                            aria-label="Alternar modo de alto contraste para personas con baja visión"
                        >
                            👁️ {highContrast ? "Contraste Normal" : "Alto Contraste"}
                        </button>
                        <button 
                            type="button" 
                            className="btn-accesibilidad"
                            onClick={() => setFontSize(fontSize === "normal" ? "large" : fontSize === "large" ? "xlarge" : "normal")}
                            aria-label="Aumentar o restablecer tamaño de texto para facilitar la lectura"
                        >
                            🔍 Texto: {fontSize.toUpperCase()}
                        </button>
                        <button 
                            type="button" 
                            className="btn-accesibilidad btn-audio"
                            onClick={() => alert("Función de audio-guía activada. MediTunja leerá los campos en voz alta para personas con discapacidad visual.")}
                            aria-label="Escuchar lectura en voz alta de esta página"
                        >
                            🔊 Escuchar Página
                        </button>
                    </div>
                </div>
            </aside>

            {/* Cabecera del módulo */}
            <header className="cabecera-transporte">
                <nav aria-label="Navegación secundaria">
                    <Link to="/login" className="enlace-volver" aria-label="Volver a la pantalla de inicio o sesión">
                        ← Volver al inicio
                    </Link>
                </nav>
                <div className="encabezado-info">
                    <div className="icono-principal" aria-hidden="true">♿ 🚐</div>
                    <div>
                        <h1>Servicio de Transporte Preferencial Adaptado</h1>
                        <p className="descripcion-cabecera">
                            Programa de transporte accesible de la EPS para pacientes con discapacidad y movilidad reducida.
                            Garantizamos tu traslado seguro, puntual y digno hacia tu IPS de atención médica en Tunja.
                        </p>
                    </div>
                </div>
                
                {/* Banner de asistencia telefónica prioritaria */}
                <div className="banner-soporte" role="complementary" aria-label="Canal telefónico de atención prioritaria">
                    <span className="icono-soporte" aria-hidden="true">📞</span>
                    <div>
                        <strong>¿Necesitas ayuda para completar esta solicitud?</strong>
                        <p>Llama gratis a la Línea Preferencial EPS Tunja: <a href="tel:018000912345">01 8000 912345</a> o solicita asistencia por WhatsApp al <a href="https://wa.me/573100000000" target="_blank" rel="noreferrer">310 000 0000</a>.</p>
                    </div>
                </div>
            </header>

            <main className="contenido-principal">
                {solicitudEnviada ? (
                    /* Tarjeta de Confirmación y Seguimiento */
                    <section className="tarjeta-confirmacion" aria-live="polite" role="status">
                        <div className="icono-exito" aria-hidden="true">✅</div>
                        <h2>¡Solicitud de Transporte Preferencial Registrada con Éxito!</h2>
                        <p className="resumen-exito">
                            Tu solicitud ha sido transmitida a la central de despacho de transporte adaptado de tu EPS.
                            Nos coordinaremos con tu IPS en Tunja para asegurar que llegues a tiempo a tu atención médica.
                        </p>

                        <div className="detalles-resumen">
                            <h3>Resumen del Servicio Asignado</h3>
                            <ul>
                                <li><strong>Código de Solicitud:</strong> TRP-TUN-2026-8942</li>
                                <li><strong>Estado:</strong> <span className="etiqueta-estado">Vehículo Asignado y Programado</span></li>
                                <li><strong>Tipo de Vehículo:</strong> Furgoneta Adaptada con Rampa Hidráulica y Anclaje para Silla de Ruedas</li>
                                <li><strong>Conductor Capacitado:</strong> Carlos Arturo Ramírez (Certificado en Primeros Auxilios y Trato Digno a Pacientes)</li>
                                <li><strong>Placa del Vehículo:</strong> TUN-458</li>
                                <li><strong>Punto de Recogida:</strong> Dirección confirmada del paciente</li>
                                <li><strong>IPS de Destino:</strong> Hospital Universitario San Rafael de Tunja - Consulta Externa</li>
                                <li><strong>Hora sugerida de salida:</strong> 40 minutos antes de la hora de tu cita médica</li>
                            </ul>
                        </div>

                        <div className="acciones-confirmacion">
                            <button 
                                type="button" 
                                className="btn-accion-principal"
                                onClick={() => setSolicitudEnviada(false)}
                            >
                                Registrar otra solicitud de transporte
                            </button>
                            <Link to="/login" className="btn-accion-secundario">
                                Ir al Menú Principal
                            </Link>
                        </div>
                    </section>
                ) : (
                    /* Formulario accesible de Solicitud */
                    <form onSubmit={handleSubmit} className="formulario-transporte" noValidate={false}>
                        
                        {/* SECCIÓN 1: DATOS DEL PACIENTE BENEFICIARIO */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">1</span> Datos del Paciente y EPS
                            </legend>
                            <p className="ayuda-seccion">
                                Identificación del usuario afiliado que requiere el transporte preferencial para acudir a su atención en salud.
                            </p>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="tipoDocumento">
                                        Tipo de Documento: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <select id="tipoDocumento" name="tipoDocumento" required>
                                        <option value="CC">Cédula de Ciudadanía (C.C.)</option>
                                        <option value="TI">Tarjeta de Identidad (T.I.)</option>
                                        <option value="RC">Registro Civil (R.C.)</option>
                                        <option value="CE">Cédula de Extranjería (C.E.)</option>
                                        <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                                    </select>
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="numeroDocumento">
                                        Número de Documento: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="numeroDocumento" 
                                        name="numeroDocumento" 
                                        placeholder="Ej: 1049654321" 
                                        required 
                                        aria-describedby="ayudaDoc"
                                    />
                                    <small id="ayudaDoc" className="texto-ayuda">Ingresa el número sin puntos ni comas.</small>
                                </div>
                            </div>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="nombresPaciente">
                                        Nombres y Apellidos Completos: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="nombresPaciente" 
                                        name="nombresPaciente" 
                                        placeholder="Ej: María Clemencia Rodríguez Soler" 
                                        required 
                                    />
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="epsPaciente">
                                        EPS a la que pertenece: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <select id="epsPaciente" name="epsPaciente" required>
                                        <option value="">-- Selecciona tu EPS --</option>
                                        <option value="nueva-eps">Nueva EPS</option>
                                        <option value="sanitas">EPS Sanitas</option>
                                        <option value="salud-total">Salud Total EPS</option>
                                        <option value="famisanar">Famisanar EPS</option>
                                        <option value="coosalud">Coosalud EPS</option>
                                        <option value="asmet-salud">Asmet Salud EPS</option>
                                        <option value="compensar">Compensar EPS</option>
                                        <option value="otra">Otra EPS con convenio en Tunja</option>
                                    </select>
                                </div>
                            </div>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="telefonoPaciente">
                                        Teléfono de contacto del Paciente: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        id="telefonoPaciente" 
                                        name="telefonoPaciente" 
                                        placeholder="Ej: 3123456789" 
                                        required 
                                    />
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="telefonoCuidador">
                                        Teléfono de Acudiente, Cuidador o Contacto de Emergencia: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="tel" 
                                        id="telefonoCuidador" 
                                        name="telefonoCuidador" 
                                        placeholder="Ej: 3209876543 (Nombre y número)" 
                                        required 
                                        aria-describedby="ayudaCuidador"
                                    />
                                    <small id="ayudaCuidador" className="texto-ayuda">Persona a quien el conductor llamará en caso de necesidad.</small>
                                </div>
                            </div>
                        </fieldset>

                        {/* SECCIÓN 2: TIPO DE DISCAPACIDAD Y CONDICIÓN DE MOVILIDAD */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">2</span> Condición de Discapacidad y Adaptaciones Requeridas
                            </legend>
                            <p className="ayuda-seccion">
                                Esta información nos permite asignar el vehículo preferencial correctamente equipado para garantizar tu comodidad y seguridad.
                            </p>

                            <div className="campo-formulario">
                                <label htmlFor="tipoDiscapacidad">
                                    Tipo de Discapacidad o Condición Médica: <span className="requerido" aria-label="obligatorio">*</span>
                                </label>
                                <select id="tipoDiscapacidad" name="tipoDiscapacidad" required>
                                    <option value="">-- Selecciona el tipo de condición --</option>
                                    <option value="motora-silla-ruedas">Discapacidad Motora / Movilidad Reducida (Usuario de silla de ruedas)</option>
                                    <option value="motora-andador">Discapacidad Motora (Uso de caminador, andador o muletas)</option>
                                    <option value="visual">Discapacidad Visual (Ceguera o baja visión severa)</option>
                                    <option value="auditiva">Discapacidad Auditiva / Persona Sorda</option>
                                    <option value="cognitiva">Discapacidad Cognitiva, Intelectual o del Neurodesarrollo</option>
                                    <option value="multiple">Discapacidad Múltiple</option>
                                    <option value="adulto-mayor">Adulto Mayor con dependencia funcional</option>
                                    <option value="dialisis-oncologia">Paciente en tratamiento de Diálisis / Oncología / Postquirúrgico</option>
                                </select>
                            </div>

                            <div className="campo-formulario">
                                <span className="etiqueta-grupo">Requerimientos Específicos del Vehículo Adaptado (Selecciona las que apliquen):</span>
                                <div className="rejilla-opciones" role="group" aria-label="Opciones de adaptación del vehículo">
                                    <label className="opcion-tarjeta">
                                        <input type="checkbox" name="reqRampa" value="rampa" />
                                        <span className="opcion-contenido">
                                            <span className="opcion-icono" aria-hidden="true">🦼</span>
                                            <span>
                                                <strong>Rampa o elevador hidráulico</strong>
                                                <small>Para subir al vehículo sin bajarse de la silla de ruedas.</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label className="opcion-tarjeta">
                                        <input type="checkbox" name="reqAnclaje" value="anclaje" />
                                        <span className="opcion-contenido">
                                            <span className="opcion-icono" aria-hidden="true">🔒</span>
                                            <span>
                                                <strong>Anclaje y cinturón de 4 puntos</strong>
                                                <small>Fijación segura de la silla dentro de la cabina.</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label className="opcion-tarjeta">
                                        <input type="checkbox" name="reqPisoBajo" value="piso-bajo" />
                                        <span className="opcion-contenido">
                                            <span className="opcion-icono" aria-hidden="true">🚪</span>
                                            <span>
                                                <strong>Vehículo de piso bajo o estribo abatible</strong>
                                                <small>Fácil abordaje sin escalones altos.</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label className="opcion-tarjeta">
                                        <input type="checkbox" name="reqOxigeno" value="oxigeno" />
                                        <span className="opcion-contenido">
                                            <span className="opcion-icono" aria-hidden="true">🫁</span>
                                            <span>
                                                <strong>Soporte para bala de oxígeno</strong>
                                                <small>Espacio seguro para equipo respiratorio portátil.</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label className="opcion-tarjeta">
                                        <input type="checkbox" name="reqPerroGuia" value="perro-guia" />
                                        <span className="opcion-contenido">
                                            <span className="opcion-icono" aria-hidden="true">🦮</span>
                                            <span>
                                                <strong>Perro guía o de asistencia</strong>
                                                <small>Viaja con animal de compañía certificado.</small>
                                            </span>
                                        </span>
                                    </label>

                                    <label className="opcion-tarjeta">
                                        <input type="checkbox" name="reqCamilla" value="camilla" />
                                        <span className="opcion-contenido">
                                            <span className="opcion-icono" aria-hidden="true">🚑</span>
                                            <span>
                                                <strong>Traslado en camilla / TAB</strong>
                                                <small>Traslado asistencial básico con camillero.</small>
                                            </span>
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="viajaAcompanante">
                                        ¿Viaja con Acompañante o Cuidador?: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <select 
                                        id="viajaAcompanante" 
                                        name="viajaAcompanante" 
                                        value={viajeConAcompanante}
                                        onChange={(e) => setViajeConAcompanante(e.target.value)}
                                        required
                                    >
                                        <option value="si">Sí, viajará 1 acompañante / cuidador (Recomendado)</option>
                                        <option value="no">No, el paciente viaja solo (Requiere asistencia del conductor)</option>
                                    </select>
                                </div>

                                {viajeConAcompanante === "si" && (
                                    <div className="campo-formulario">
                                        <label htmlFor="nombreAcompanante">
                                            Nombre del Acompañante: <span className="requerido" aria-label="obligatorio">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            id="nombreAcompanante" 
                                            name="nombreAcompanante" 
                                            placeholder="Nombre completo y parentesco" 
                                            required 
                                        />
                                    </div>
                                )}
                            </div>
                        </fieldset>

                        {/* SECCIÓN 3: DATOS DE LA CITA MÉDICA Y LA IPS DE DESTINO */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">3</span> Cita Médica e IPS de Destino en Tunja
                            </legend>
                            <p className="ayuda-seccion">
                                Ingresa la información de tu atención médica para coordinar la hora exacta de llegada a la Institución Prestadora de Salud (IPS).
                            </p>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="ipsDestino">
                                        IPS de Atención en Tunja: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <select id="ipsDestino" name="ipsDestino" required>
                                        <option value="">-- Selecciona la IPS de destino --</option>
                                        <option value="hospital-san-rafael">Hospital Universitario San Rafael de Tunja (Sede Central)</option>
                                        <option value="clinica-medilaser">Clínica Medilaser Tunja</option>
                                        <option value="clinica-los-andes">Clínica de Los Andes</option>
                                        <option value="ese-santiago-san-antonio">E.S.E. Santiago de Tunja - Sede San Antonio</option>
                                        <option value="ese-santiago-el-carmen">E.S.E. Santiago de Tunja - Centro de Salud El Carmen</option>
                                        <option value="ese-santiago-libertador">E.S.E. Santiago de Tunja - Centro de Salud Libertador</option>
                                        <option value="centro-rehabilitacion">Centro de Rehabilitación Física y Terapias Tunja</option>
                                        <option value="otra-ips">Otra sede / Centro médico especializado en Tunja</option>
                                    </select>
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="tipoAtencion">
                                        Servicio o Especialidad Médica: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="tipoAtencion" 
                                        name="tipoAtencion" 
                                        placeholder="Ej: Fisioterapia, Diálisis, Ortopedia, Neurología, Consulta Externa" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="fechaCita">
                                        Fecha de la Cita Médica: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="date" 
                                        id="fechaCita" 
                                        name="fechaCita" 
                                        required 
                                    />
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="horaCita">
                                        Hora Programada de la Cita: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="time" 
                                        id="horaCita" 
                                        name="horaCita" 
                                        required 
                                        aria-describedby="ayudaHora"
                                    />
                                    <small id="ayudaHora" className="texto-ayuda">El vehículo llegará entre 40 y 50 minutos antes a tu domicilio.</small>
                                </div>
                            </div>

                            <div className="campo-formulario">
                                <label htmlFor="autorizacionEps">
                                    Número de Autorización de la EPS (Si la tienes a mano):
                                </label>
                                <input 
                                    type="text" 
                                    id="autorizacionEps" 
                                    name="autorizacionEps" 
                                    placeholder="Ej: AUT-EPS-982143 (Opcional)" 
                                />
                            </div>
                        </fieldset>

                        {/* SECCIÓN 4: LOGÍSTICA DE RECOGIDA Y RETORNO */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">4</span> Domicilio de Recogida y Retorno
                            </legend>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="direccionOrigen">
                                        Dirección Exacta de Recogida en Tunja: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="direccionOrigen" 
                                        name="direccionOrigen" 
                                        placeholder="Ej: Carrera 2 Este # 18-45, Barrio Santa Inés" 
                                        required 
                                    />
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="barrioSector">
                                        Barrio o Sector: <span className="requerido" aria-label="obligatorio">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        id="barrioSector" 
                                        name="barrioSector" 
                                        placeholder="Ej: Barrio Los Muiscas / Cooservicios" 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="campo-formulario">
                                <label htmlFor="puntosReferencia">
                                    Puntos de Referencia y Accesibilidad del Inmueble:
                                </label>
                                <textarea 
                                    id="puntosReferencia" 
                                    name="puntosReferencia" 
                                    rows={3}
                                    placeholder="Ej: Casa esquinera frente al parqueadero. Hay rampa en la entrada. El paciente requiere apoyo para bajar dos escalones."
                                    aria-describedby="ayudaReferencia"
                                />
                                <small id="ayudaReferencia" className="texto-ayuda">Indica si hay escaleras, si la calle es empinada o si el vehículo puede estacionar al frente.</small>
                            </div>

                            <div className="campo-formulario">
                                <label htmlFor="modalidadViaje">
                                    Modalidad del Traslado: <span className="requerido" aria-label="obligatorio">*</span>
                                </label>
                                <select id="modalidadViaje" name="modalidadViaje" required>
                                    <option value="ida-y-regreso">Ida y Regreso (El transporte me lleva a la IPS y me regresa al domicilio)</option>
                                    <option value="solo-ida">Solo Ida (Solo necesito el traslado hacia la IPS)</option>
                                    <option value="solo-regreso">Solo Regreso (Traslado desde la IPS de regreso a casa)</option>
                                </select>
                            </div>
                        </fieldset>

                        {/* SECCIÓN 5: DECLARACIÓN Y CONFIRMACIÓN */}
                        <div className="declaracion-paciente">
                            <label className="checkbox-declaracion">
                                <input type="checkbox" id="declaracionVeracidad" name="declaracionVeracidad" required />
                                <span>
                                    Declaro que la información suministrada es verídica y que el servicio es solicitado para facilitar la atención médica prioritaria del paciente con discapacidad en la IPS de Tunja, conforme a las políticas de salud y movilidad accesible.
                                </span>
                            </label>
                        </div>

                        {/* Botón de envío principal accesible */}
                        <div className="botones-formulario">
                            <button type="submit" className="btn-solicitar-transporte">
                                🚐 Solicitar Transporte Preferencial Adaptado
                            </button>
                            <button type="reset" className="btn-limpiar">
                                Limpiar Formulario
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {/* Pie de página informativo con enlaces de apoyo */}
            <footer className="pie-transporte">
                <div className="pie-contenedor">
                    <p>
                        <strong>MediTunja - Transporte Preferencial en Salud</strong> | Proyecto de Usabilidad y Taller de Diseño Multimedia.
                    </p>
                    <p className="pie-aclaracion">
                        Cumple con lineamientos de accesibilidad web (WCAG 2.1) para garantizar que los pacientes con discapacidad de cualquier EPS en Tunja accedan de manera oportuna, eficaz y humana a sus servicios en salud.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default TransportePreferencial;
