import { useState } from "react";
import { Link } from "react-router-dom";
import "./pay.modules.css";

function Pay() {
    // Estado de accesibilidad
    const [fontSize, setFontSize] = useState("normal"); // 'normal', 'large', 'xlarge'
    const [highContrast, setHighContrast] = useState(false);

    // Estado del flujo de pago
    const [pagoExitoso, setPagoExitoso] = useState(false);

    // Datos fundamentales del paciente y la cita a pagar (sin formularios extensos de EPS)
    const [documentoPaciente, setDocumentoPaciente] = useState("1049654321");
    const [tipoDocumento, setTipoDocumento] = useState("CC");
    const [nombrePaciente, setNombrePaciente] = useState("María Clemencia Rodríguez Soler");
    const [ipsCita, setIpsCita] = useState("Hospital Universitario San Rafael de Tunja");
    const [tipoCita, setTipoCita] = useState("especialista");
    const [fechaCita, setFechaCita] = useState("2026-10-25");
    const [horaCita, setHoraCita] = useState("09:30");

    // Integración del servicio de Transporte Preferencial Adaptado (Discapacidad / Movilidad reducida)
    const [incluyeTransporte, setIncluyeTransporte] = useState(true);
    const [tipoAsistenciaTransporte, setTipoAsistenciaTransporte] = useState("rampa-silla");

    // Método de pago
    const [metodoPago, setMetodoPago] = useState("pse");
    const [bancoPse, setBancoPse] = useState("bancolombia");
    const [celularNequi, setCelularNequi] = useState("3123456789");
    const [tarjetaNfcLeida, setTarjetaNfcLeida] = useState(false);

    // Datos generados de la transacción
    const [codigoTransaccion, setCodigoTransaccion] = useState("");
    const [fechaTransaccion, setFechaTransaccion] = useState("");

    // Tarifas de la Cita Médica
    const preciosCita = {
        general: { nombre: "Consulta de Medicina General / Odontología", valor: 4500 },
        especialista: { nombre: "Consulta con Médico Especialista", valor: 18200 },
        terapias: { nombre: "Sesión de Terapias y Rehabilitación Física", valor: 12000 }
    };

    // Tarifa fija y subsidiada para el Transporte Preferencial Adaptado en Tunja
    const TARIFA_TRANSPORTE = 12000;

    const valorCita = preciosCita[tipoCita]?.valor || 4500;
    const valorTransporte = incluyeTransporte ? TARIFA_TRANSPORTE : 0;
    const totalPagar = valorCita + valorTransporte;

    // Formateador de moneda en pesos colombianos
    const formatearMoneda = (val) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }).format(val);
    };

    // Simular escaneo de tarjeta NFC MediTunja
    const handleEscanearNFC = () => {
        setTarjetaNfcLeida(true);
        alert("¡Tarjeta Inteligente NFC MediTunja detectada con saldo suficiente para el pago!");
    };

    // Procesar el pago
    const handleSubmit = (e) => {
        e.preventDefault();

        if (metodoPago === "nfc-meditunja" && !tarjetaNfcLeida) {
            alert("Por favor aproxima tu tarjeta NFC MediTunja o pulsa 'Escanear Tarjeta NFC' para completar el pago.");
            return;
        }

        const codigo = `TXN-MED-${Math.floor(1000 + Math.random() * 9000)}`;
        const ahora = new Date().toLocaleString("es-CO", {
            dateStyle: "medium",
            timeStyle: "short"
        });

        setCodigoTransaccion(codigo);
        setFechaTransaccion(ahora);
        setPagoExitoso(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Audio-guía accesible
    const handleAudioGuia = () => {
        alert(
            "Audio-guía de Pago MediTunja:\n" +
            `Estás pagando la ${preciosCita[tipoCita].nombre} por valor de ${formatearMoneda(valorCita)}.\n` +
            (incluyeTransporte 
                ? `Tienes activado el servicio de Transporte Preferencial Adaptado por ${formatearMoneda(TARIFA_TRANSPORTE)}.\n` 
                : "No tienes seleccionado transporte adaptado.\n") +
            `Total a cancelar: ${formatearMoneda(totalPagar)}.`
        );
    };

    // Descargar comprobante
    const handleDescargarRecibo = () => {
        alert(
            `Comprobante de Pago Generado:\n` +
            `Código: ${codigoTransaccion}\n` +
            `Paciente: ${nombrePaciente}\n` +
            `Cita Médica: ${preciosCita[tipoCita].nombre} (${formatearMoneda(valorCita)})\n` +
            `Transporte Adaptado: ${incluyeTransporte ? `Incluido (${formatearMoneda(valorTransporte)})` : "No requerido"}\n` +
            `Total Pagado: ${formatearMoneda(totalPagar)}\n` +
            `¡El recibo ha sido descargado y registrado en la admisión de la IPS!`
        );
    };

    return (
        <div className={`modulo-pagos ${highContrast ? "modo-alto-contraste" : ""} fuente-${fontSize}`}>
            {/* Estilos integrados para garantizar visualización accesible */}
            <style>{`
                :root {
                    --color-primario: #0056b3;
                    --color-primario-oscuro: #003d82;
                    --color-fondo: #f8f9fa;
                    --color-texto: #333333;
                    --color-borde: #dcdcdc;
                    --color-exito: #28a745;
                    --color-exito-bg: #c6f6d5;
                    --color-exito-texto: #22543d;
                    --color-tarjeta-activa: #ebf8ff;
                    --color-tarjeta-borde-activa: #3182ce;
                }
                .modulo-pagos {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: var(--color-texto);
                    background-color: var(--color-fondo);
                    min-height: 100vh;
                    padding: 1rem 1.5rem 3rem 1.5rem;
                }
                .modulo-pagos.fuente-normal { font-size: 16px; }
                .modulo-pagos.fuente-large { font-size: 19px; }
                .modulo-pagos.fuente-xlarge { font-size: 22px; }
                .modulo-pagos.modo-alto-contraste {
                    background-color: #000000 !important;
                    color: #ffff00 !important;
                }
                .modulo-pagos.modo-alto-contraste * {
                    background-color: #000000 !important;
                    color: #ffff00 !important;
                    border-color: #ffff00 !important;
                }
                .modulo-pagos.modo-alto-contraste a,
                .modulo-pagos.modo-alto-contraste button {
                    color: #00ffff !important;
                    border: 2px solid #00ffff !important;
                }
                .modulo-pagos.modo-alto-contraste input,
                .modulo-pagos.modo-alto-contraste select {
                    border: 2px solid #ffffff !important;
                    color: #ffffff !important;
                }
                .barra-accesibilidad {
                    background-color: #1a202c;
                    color: #ffffff;
                    padding: 0.6rem 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                }
                .accesibilidad-contenedor {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 0.75rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                .accesibilidad-titulo { font-weight: 700; font-size: 0.95em; }
                .accesibilidad-botones { display: flex; gap: 0.5rem; flex-wrap: wrap; }
                .btn-accesibilidad {
                    background-color: #2d3748;
                    color: #ffffff;
                    border: 1px solid #4a5568;
                    padding: 0.4rem 0.85rem;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85em;
                    font-weight: 600;
                }
                .btn-audio { background-color: #2b6cb0; }
                .cabecera-pagos { max-width: 1000px; margin: 0 auto 2rem auto; }
                .enlace-volver {
                    display: inline-block;
                    margin-bottom: 1rem;
                    color: var(--color-primario);
                    text-decoration: none;
                    font-weight: 600;
                }
                .encabezado-info {
                    display: flex;
                    align-items: center;
                    gap: 1.25rem;
                    margin-bottom: 1.25rem;
                }
                .icono-principal { font-size: 3rem; line-height: 1; }
                .encabezado-info h1 {
                    margin: 0 0 0.4rem 0;
                    color: var(--color-primario-oscuro);
                    font-size: 1.85em;
                }
                .descripcion-cabecera { margin: 0; line-height: 1.5; color: #4a5568; }
                .contenido-principal { max-width: 1000px; margin: 0 auto; }
                .formulario-pagos { display: flex; flex-direction: column; gap: 1.75rem; }
                .seccion-formulario {
                    border: 1px solid var(--color-borde);
                    border-radius: 10px;
                    padding: 1.5rem;
                    background-color: #ffffff;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                .titulo-seccion {
                    font-size: 1.2em;
                    font-weight: 700;
                    color: var(--color-primario-oscuro);
                    padding: 0 0.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .numero-paso {
                    background-color: var(--color-primario);
                    color: #ffffff;
                    width: 26px;
                    height: 26px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 0.85em;
                }
                .ayuda-seccion { color: #718096; font-size: 0.9em; margin-top: 0; margin-bottom: 1.25rem; }
                .fila-formulario {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.25rem;
                    margin-bottom: 1rem;
                }
                .campo-formulario { display: flex; flex-direction: column; margin-bottom: 1rem; }
                .campo-formulario label { font-weight: 600; margin-bottom: 0.35rem; font-size: 0.95em; }
                .campo-formulario input,
                .campo-formulario select {
                    padding: 0.65rem 0.8rem;
                    font-size: 1em;
                    border: 1px solid var(--color-borde);
                    border-radius: 6px;
                    font-family: inherit;
                    outline: none;
                }
                .campo-formulario input:focus,
                .campo-formulario select:focus {
                    border-color: var(--color-primario);
                    box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.15);
                }
                .tarjeta-servicio-transporte {
                    border: 2px solid var(--color-tarjeta-borde-activa);
                    background-color: var(--color-tarjeta-activa);
                    border-radius: 10px;
                    padding: 1.25rem;
                    margin-top: 0.5rem;
                }
                .control-transporte-destacado {
                    display: flex;
                    align-items: flex-start;
                    gap: 0.85rem;
                    cursor: pointer;
                }
                .control-transporte-destacado input[type="checkbox"] {
                    width: 22px;
                    height: 22px;
                    margin-top: 0.15rem;
                    cursor: pointer;
                }
                .info-transporte-destacado { flex: 1; }
                .titulo-transporte-linea {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    margin-bottom: 0.35rem;
                }
                .titulo-transporte-linea strong { font-size: 1.05em; color: var(--color-primario-oscuro); }
                .precio-etiqueta-transporte {
                    background-color: #bee3f8;
                    color: #2b6cb0;
                    padding: 0.2rem 0.65rem;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.9em;
                }
                .info-transporte-destacado small { display: block; color: #4a5568; font-size: 0.88em; }
                .opciones-adicionales-transporte {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed #bee3f8;
                }
                .rejilla-metodos-pago {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                    gap: 0.9rem;
                    margin-top: 0.5rem;
                }
                .opcion-tarjeta-pago {
                    border: 2px solid var(--color-borde);
                    border-radius: 10px;
                    padding: 0.9rem;
                    display: flex;
                    align-items: flex-start;
                    gap: 0.75rem;
                    cursor: pointer;
                    background-color: #fafafa;
                    transition: all 0.2s;
                }
                .opcion-tarjeta-pago.seleccionada {
                    background-color: var(--color-tarjeta-activa);
                    border-color: var(--color-tarjeta-borde-activa);
                }
                .icono-metodo { font-size: 1.4rem; }
                .detalles-metodo-especifico {
                    margin-top: 1rem;
                    padding: 1rem;
                    border-radius: 8px;
                    background-color: #f7fafc;
                    border: 1px dashed var(--color-tarjeta-borde-activa);
                }
                .caja-nfc-interactiva {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    background-color: #ebf8ff;
                    border: 1px solid #bee3f8;
                    padding: 1rem;
                    border-radius: 8px;
                }
                .btn-escanear-nfc {
                    background-color: #3182ce;
                    color: #ffffff;
                    border: none;
                    padding: 0.6rem 1.1rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .caja-liquidacion {
                    background-color: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1.25rem 1.5rem;
                }
                .tabla-liquidacion { width: 100%; border-collapse: collapse; }
                .tabla-liquidacion td { padding: 0.6rem 0.5rem; border-bottom: 1px solid #edf2f7; }
                .tabla-liquidacion td:last-child { text-align: right; font-weight: 600; }
                .fila-destacada td {
                    font-size: 1.15em;
                    font-weight: 700;
                    color: var(--color-primario-oscuro);
                    border-top: 2px solid var(--color-primario);
                    border-bottom: none;
                    padding-top: 0.85rem;
                }
                .total-precio { font-size: 1.35em; color: var(--color-primario-oscuro); }
                .botones-formulario { display: flex; justify-content: flex-end; margin-top: 0.5rem; }
                .btn-pagar-seguro {
                    background-color: var(--color-primario);
                    color: #ffffff;
                    border: none;
                    padding: 0.85rem 1.75rem;
                    font-size: 1.05em;
                    font-weight: 700;
                    border-radius: 8px;
                    cursor: pointer;
                }
                .tarjeta-confirmacion {
                    background-color: #ffffff;
                    border: 2px solid var(--color-exito-bg);
                    border-radius: 12px;
                    padding: 2.25rem;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
                    text-align: center;
                }
                .icono-exito { font-size: 3.5rem; margin-bottom: 0.75rem; }
                .detalles-resumen {
                    text-align: left;
                    background-color: #f7fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 1.25rem 1.5rem;
                    margin-bottom: 2rem;
                }
                .detalles-resumen ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem; }
                .etiqueta-estado {
                    background-color: var(--color-exito-bg);
                    color: var(--color-exito-texto);
                    padding: 0.25rem 0.65rem;
                    border-radius: 6px;
                    font-weight: 700;
                    font-size: 0.85em;
                }
                .acciones-confirmacion { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
                .btn-accion-principal {
                    background-color: var(--color-primario);
                    color: #ffffff;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-accion-descargar {
                    background-color: #2b6cb0;
                    color: #ffffff;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-accion-secundario {
                    background-color: #edf2f7;
                    color: #2d3748;
                    text-decoration: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                }
                .pie-pagos {
                    max-width: 1000px;
                    margin: 3rem auto 0 auto;
                    border-top: 1px solid var(--color-borde);
                    padding-top: 1.5rem;
                    text-align: center;
                    font-size: 0.85em;
                    color: #718096;
                }
            `}</style>

            {/* Barra superior de herramientas de accesibilidad */}
            <aside className="barra-accesibilidad" aria-label="Herramientas de accesibilidad">
                <div className="accesibilidad-contenedor">
                    <span className="accesibilidad-titulo">Accesibilidad:</span>
                    <div className="accesibilidad-botones">
                        <button 
                            type="button" 
                            className="btn-accesibilidad"
                            onClick={() => setHighContrast(!highContrast)}
                            aria-pressed={highContrast}
                            aria-label="Alternar modo de alto contraste"
                        >
                            👁️ {highContrast ? "Contraste Normal" : "Alto Contraste"}
                        </button>
                        <button 
                            type="button" 
                            className="btn-accesibilidad"
                            onClick={() => setFontSize(fontSize === "normal" ? "large" : fontSize === "large" ? "xlarge" : "normal")}
                            aria-label="Ajustar tamaño de texto"
                        >
                            🔍 Texto: {fontSize.toUpperCase()}
                        </button>
                        <button 
                            type="button" 
                            className="btn-accesibilidad btn-audio"
                            onClick={handleAudioGuia}
                            aria-label="Escuchar resumen del pago en voz alta"
                        >
                            🔊 Escuchar Resumen
                        </button>
                    </div>
                </div>
            </aside>

            {/* Cabecera */}
            <header className="cabecera-pagos">
                <nav aria-label="Navegación secundaria">
                    <Link to="/login" className="enlace-volver">
                        ← Volver al inicio
                    </Link>
                </nav>
                <div className="encabezado-info">
                    <div className="icono-principal" aria-hidden="true">💳 🚐 🏥</div>
                    <div>
                        <h1>Pago de Cita Médica y Transporte Preferencial</h1>
                        <p className="descripcion-cabecera">
                            Confirma el pago de tu cita médica agendada y verifica si requieres incluir el servicio de transporte adaptado para personas con discapacidad o movilidad reducida.
                        </p>
                    </div>
                </div>
            </header>

            <main className="contenido-principal">
                {pagoExitoso ? (
                    /* Tarjeta de Confirmación / Recibo */
                    <section className="tarjeta-confirmacion" aria-live="polite" role="status">
                        <div className="icono-exito" aria-hidden="true">✅</div>
                        <h2>¡Pago Procesado y Cita Confirmada!</h2>
                        <p className="resumen-exito">
                            El pago de tu atención médica ha sido recibido. Se ha notificado al centro de salud y a la unidad de transporte en Tunja.
                        </p>

                        <div className="detalles-resumen">
                            <h3>
                                <span>Recibo Oficial de Pago</span>
                                <span className="etiqueta-estado">Transacción Aprobada</span>
                            </h3>
                            <ul>
                                <li><strong>Código de Transacción:</strong> {codigoTransaccion}</li>
                                <li><strong>Fecha y Hora:</strong> {fechaTransaccion}</li>
                                <li><strong>Paciente:</strong> {nombrePaciente} ({tipoDocumento} {documentoPaciente})</li>
                                <li><strong>IPS de Atención:</strong> {ipsCita}</li>
                                <li><strong>Servicio Médico:</strong> {preciosCita[tipoCita].nombre} - <strong>{formatearMoneda(valorCita)}</strong></li>
                                <li><strong>Fecha y Hora de la Cita:</strong> {fechaCita} a las {horaCita}</li>
                                <li>
                                    <strong>Servicio de Transporte Preferencial:</strong>{" "}
                                    {incluyeTransporte ? (
                                        <span className="etiqueta-estado" style={{ backgroundColor: "#e2e8f0", color: "#2d3748" }}>
                                            🚐 Adaptado ({tipoAsistenciaTransporte === "rampa-silla" ? "Rampa/Silla de ruedas" : tipoAsistenciaTransporte === "camilla" ? "Camilla Asistida" : "Soporte de Conductor"}) - {formatearMoneda(valorTransporte)}
                                        </span>
                                    ) : (
                                        "No solicitado (El paciente llega por sus propios medios)"
                                    )}
                                </li>
                                <li>
                                    <strong>Método Utilizado:</strong>{" "}
                                    {metodoPago === "pse" ? "PSE Débito Bancario" :
                                     metodoPago === "nequi" ? "Billetera Digital Nequi" :
                                     metodoPago === "tarjeta" ? "Tarjeta Débito / Crédito" :
                                     metodoPago === "nfc-meditunja" ? "Tarjeta Inteligente NFC MediTunja" :
                                     "Pago en Efectivo / Taquilla IPS"}
                                </li>
                                <li style={{ borderTop: "2px solid #e2e8f0", paddingTop: "0.75rem", fontSize: "1.1em" }}>
                                    <strong>Total Pagado:</strong> <span className="total-precio">{formatearMoneda(totalPagar)}</span>
                                </li>
                            </ul>
                        </div>

                        <div className="acciones-confirmacion">
                            <button 
                                type="button" 
                                className="btn-accion-descargar"
                                onClick={handleDescargarRecibo}
                            >
                                📥 Descargar Comprobante (PDF)
                            </button>
                            <button 
                                type="button" 
                                className="btn-accion-principal"
                                onClick={() => {
                                    setPagoExitoso(false);
                                    setTarjetaNfcLeida(false);
                                }}
                            >
                                💳 Realizar otro Pago
                            </button>
                            <Link to="/login" className="btn-accion-secundario">
                                Ir al Inicio
                            </Link>
                        </div>
                    </section>
                ) : (
                    /* Formulario Corto y Fundamental de Pago */
                    <form onSubmit={handleSubmit} className="formulario-pagos">

                        {/* PASO 1: DATOS DE LA CITA MÉDICA A PAGAR */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">1</span> Cita Médica a Cancelar
                            </legend>
                            <p className="ayuda-seccion">
                                Datos fundamentales de la cita médica programada en el sistema.
                            </p>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="documentoPaciente">Documento del Paciente:</label>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <select 
                                            value={tipoDocumento} 
                                            onChange={(e) => setTipoDocumento(e.target.value)}
                                            style={{ width: "90px" }}
                                        >
                                            <option value="CC">C.C.</option>
                                            <option value="TI">T.I.</option>
                                            <option value="CE">C.E.</option>
                                        </select>
                                        <input 
                                            type="text" 
                                            id="documentoPaciente" 
                                            value={documentoPaciente} 
                                            onChange={(e) => setDocumentoPaciente(e.target.value)}
                                            placeholder="Número de documento"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="nombrePaciente">Nombre del Paciente:</label>
                                    <input 
                                        type="text" 
                                        id="nombrePaciente" 
                                        value={nombrePaciente} 
                                        onChange={(e) => setNombrePaciente(e.target.value)}
                                        placeholder="Nombre del paciente"
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="ipsCita">IPS en Tunja:</label>
                                    <select 
                                        id="ipsCita" 
                                        value={ipsCita} 
                                        onChange={(e) => setIpsCita(e.target.value)}
                                        required
                                    >
                                        <option value="Hospital Universitario San Rafael de Tunja">Hospital Universitario San Rafael de Tunja</option>
                                        <option value="Clínica Medilaser Tunja">Clínica Medilaser Tunja</option>
                                        <option value="Clínica de Los Andes">Clínica de Los Andes</option>
                                        <option value="E.S.E. Santiago de Tunja - Sede San Antonio">E.S.E. Santiago de Tunja (San Antonio)</option>
                                        <option value="E.S.E. Santiago de Tunja - Sede El Carmen">E.S.E. Santiago de Tunja (El Carmen)</option>
                                    </select>
                                </div>

                                <div className="campo-formulario">
                                    <label htmlFor="tipoCita">Servicio / Tipo de Cita Médica:</label>
                                    <select 
                                        id="tipoCita" 
                                        value={tipoCita} 
                                        onChange={(e) => setTipoCita(e.target.value)}
                                        required
                                    >
                                        <option value="general">Consulta Medicina General / Odontología ($4.500 COP)</option>
                                        <option value="especialista">Consulta Médico Especialista ($18.200 COP)</option>
                                        <option value="terapias">Terapias y Rehabilitación Física ($12.000 COP)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="fila-formulario">
                                <div className="campo-formulario">
                                    <label htmlFor="fechaCita">Fecha Programada:</label>
                                    <input 
                                        type="date" 
                                        id="fechaCita" 
                                        value={fechaCita} 
                                        onChange={(e) => setFechaCita(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div className="campo-formulario">
                                    <label htmlFor="horaCita">Hora de la Cita:</label>
                                    <input 
                                        type="time" 
                                        id="horaCita" 
                                        value={horaCita} 
                                        onChange={(e) => setHoraCita(e.target.value)} 
                                        required 
                                    />
                                </div>
                            </div>
                        </fieldset>

                        {/* PASO 2: SERVICIO DE TRANSPORTE PREFERENCIAL ADAPTADO (DISCAPACIDAD) */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">2</span> Servicio de Transporte Preferencial Adaptado
                            </legend>
                            <p className="ayuda-seccion">
                                Verifica si el paciente con discapacidad o movilidad reducida requiere o utilizó el transporte preferencial hacia su IPS en Tunja.
                            </p>

                            <div className="tarjeta-servicio-transporte">
                                <label className="control-transporte-destacado">
                                    <input 
                                        type="checkbox" 
                                        id="checkTransporte" 
                                        checked={incluyeTransporte} 
                                        onChange={(e) => setIncluyeTransporte(e.target.checked)}
                                    />
                                    <div className="info-transporte-destacado">
                                        <div className="titulo-transporte-linea">
                                            <strong>♿ 🚐 Incluir cobro del Servicio de Transporte Preferencial Adaptado</strong>
                                            <span className="precio-etiqueta-transporte">
                                                {incluyeTransporte ? `+ ${formatearMoneda(TARIFA_TRANSPORTE)} COP` : "No incluido"}
                                            </span>
                                        </div>
                                        <small>
                                            Vehículo adaptado de MediTunja para traslado puerta a puerta de pacientes en silla de ruedas, camilla o con movilidad reducida en Tunja.
                                        </small>
                                    </div>
                                </label>

                                {incluyeTransporte && (
                                    <div className="opciones-adicionales-transporte">
                                        <div className="campo-formulario" style={{ marginBottom: 0 }}>
                                            <label htmlFor="tipoAsistenciaTransporte">Requerimiento especial del traslado:</label>
                                            <select 
                                                id="tipoAsistenciaTransporte" 
                                                value={tipoAsistenciaTransporte} 
                                                onChange={(e) => setTipoAsistenciaTransporte(e.target.value)}
                                            >
                                                <option value="rampa-silla">Vehículo con Rampa / Silla de Ruedas</option>
                                                <option value="conductor-apoyo">Vehículo de Piso Bajo y Apoyo de Conductor</option>
                                                <option value="camilla">Traslado con Camilla Asistida</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </fieldset>

                        {/* PASO 3: MÉTODO DE PAGO RÁPIDO */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">3</span> Método de Pago
                            </legend>
                            <p className="ayuda-seccion">
                                Selecciona cómo deseas realizar el pago seguro.
                            </p>

                            <div className="rejilla-metodos-pago" role="radiogroup" aria-label="Métodos de pago">
                                
                                {/* Opción PSE */}
                                <label className={`opcion-tarjeta-pago ${metodoPago === "pse" ? "seleccionada" : ""}`}>
                                    <input 
                                        type="radio" 
                                        name="metodoPago" 
                                        value="pse" 
                                        checked={metodoPago === "pse"} 
                                        onChange={(e) => setMetodoPago(e.target.value)}
                                    />
                                    <div className="opcion-contenido-pago">
                                        <span className="icono-metodo" aria-hidden="true">🏦</span>
                                        <strong>PSE Débito</strong>
                                        <small>Transferencia bancaria en línea.</small>
                                    </div>
                                </label>

                                {/* Opción Nequi */}
                                <label className={`opcion-tarjeta-pago ${metodoPago === "nequi" ? "seleccionada" : ""}`}>
                                    <input 
                                        type="radio" 
                                        name="metodoPago" 
                                        value="nequi" 
                                        checked={metodoPago === "nequi"} 
                                        onChange={(e) => setMetodoPago(e.target.value)}
                                    />
                                    <div className="opcion-contenido-pago">
                                        <span className="icono-metodo" aria-hidden="true">📱</span>
                                        <strong>Nequi / Daviplata</strong>
                                        <small>Pago rápido desde el móvil.</small>
                                    </div>
                                </label>

                                {/* Opción Tarjeta */}
                                <label className={`opcion-tarjeta-pago ${metodoPago === "tarjeta" ? "seleccionada" : ""}`}>
                                    <input 
                                        type="radio" 
                                        name="metodoPago" 
                                        value="tarjeta" 
                                        checked={metodoPago === "tarjeta"} 
                                        onChange={(e) => setMetodoPago(e.target.value)}
                                    />
                                    <div className="opcion-contenido-pago">
                                        <span className="icono-metodo" aria-hidden="true">💳</span>
                                        <strong>Tarjeta Débito/Crédito</strong>
                                        <small>Visa, Mastercard y otras franquicias.</small>
                                    </div>
                                </label>

                                {/* Opción Tarjeta NFC MediTunja */}
                                <label className={`opcion-tarjeta-pago ${metodoPago === "nfc-meditunja" ? "seleccionada" : ""}`}>
                                    <input 
                                        type="radio" 
                                        name="metodoPago" 
                                        value="nfc-meditunja" 
                                        checked={metodoPago === "nfc-meditunja"} 
                                        onChange={(e) => setMetodoPago(e.target.value)}
                                    />
                                    <div className="opcion-contenido-pago">
                                        <span className="icono-metodo" aria-hidden="true">📡</span>
                                        <strong>Tarjeta NFC MediTunja</strong>
                                        <small>Carné inteligente sin contacto.</small>
                                    </div>
                                </label>
                            </div>

                            {/* Detalle rápido de método */}
                            {metodoPago === "pse" && (
                                <div className="detalles-metodo-especifico">
                                    <div className="campo-formulario" style={{ marginBottom: 0 }}>
                                        <label htmlFor="bancoPse">Banco:</label>
                                        <select 
                                            id="bancoPse" 
                                            value={bancoPse} 
                                            onChange={(e) => setBancoPse(e.target.value)}
                                        >
                                            <option value="bancolombia">Bancolombia</option>
                                            <option value="davivienda">Davivienda</option>
                                            <option value="bogota">Banco de Bogotá</option>
                                            <option value="agrario">Banco Agrario</option>
                                            <option value="coofisam">Cooperativas Boyacá</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {metodoPago === "nequi" && (
                                <div className="detalles-metodo-especifico">
                                    <div className="campo-formulario" style={{ marginBottom: 0 }}>
                                        <label htmlFor="celularNequi">Número de Celular para cobro:</label>
                                        <input 
                                            type="tel" 
                                            id="celularNequi" 
                                            value={celularNequi} 
                                            onChange={(e) => setCelularNequi(e.target.value)} 
                                            placeholder="Ej: 3123456789" 
                                            required 
                                        />
                                    </div>
                                </div>
                            )}

                            {metodoPago === "nfc-meditunja" && (
                                <div className="detalles-metodo-especifico">
                                    <div className="caja-nfc-interactiva">
                                        <span className="icono-nfc-onda" aria-hidden="true">📳</span>
                                        <div className="info-nfc-tarjeta">
                                            <strong>Lector de Carné NFC Activo</strong>
                                            <p>{tarjetaNfcLeida ? "✅ Tarjeta MediTunja leída y validada." : "Aproxima la tarjeta o pulsa el botón."}</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="btn-escanear-nfc"
                                            onClick={handleEscanearNFC}
                                        >
                                            {tarjetaNfcLeida ? "Tarjeta Lista ✔" : "Escanear NFC"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </fieldset>

                        {/* PASO 4: RESUMEN DE COBRO Y LIQUIDACIÓN INMEDIATA */}
                        <fieldset className="seccion-formulario">
                            <legend className="titulo-seccion">
                                <span className="numero-paso">4</span> Resumen de Pago
                            </legend>

                            <div className="caja-liquidacion">
                                <table className="tabla-liquidacion" aria-label="Desglose del pago">
                                    <tbody>
                                        <tr>
                                            <td>Valor Cita Médica ({preciosCita[tipoCita].nombre}):</td>
                                            <td>{formatearMoneda(valorCita)}</td>
                                        </tr>
                                        <tr>
                                            <td>Servicio de Transporte Preferencial Adaptado:</td>
                                            <td style={{ color: incluyeTransporte ? "var(--color-primario)" : "#718096" }}>
                                                {incluyeTransporte ? `+ ${formatearMoneda(valorTransporte)}` : "No requerido ($0)"}
                                            </td>
                                        </tr>
                                        <tr className="fila-destacada">
                                            <td>Total a Cancelar:</td>
                                            <td><span className="total-precio">{formatearMoneda(totalPagar)}</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </fieldset>

                        {/* Botón de envío directo */}
                        <div className="botones-formulario">
                            <button type="submit" className="btn-pagar-seguro">
                                💳 Confirmar y Pagar {formatearMoneda(totalPagar)}
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {/* Pie de página */}
            <footer className="pie-pagos">
                <div className="pie-contenedor">
                    <p>
                        <strong>MediTunja - Pagos en Salud y Transporte Preferencial</strong> | Usabilidad y Taller de Diseño Multimedia.
                    </p>
                    <p className="pie-aclaracion">
                        Cumple con accesibilidad web WCAG 2.1 para la atención integral y digna de personas con discapacidad en Tunja.
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default Pay;
