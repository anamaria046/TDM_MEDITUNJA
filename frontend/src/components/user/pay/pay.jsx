// Componente Principal de Pagos
// MediTunja - Código estructurado en HTML semántico dentro de JSX
// Guiado bajo el patrón modular de Transporte Preferencial y Agendamiento de Citas
// Integración de secuencia de flujo: Agendamiento -> Transporte -> Pagos -> Mapa

import { Link } from "react-router-dom";
import styles from "./pay.module.css";
import { usePay } from "./hooks/usePay";
import ResumenPagoExito from "./ResumenPagoExito";
import FormularioPago from "./FormularioPago";

function Pay() {
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    pagoExitoso,
    datosCita,
    incluyeTransporte,
    setIncluyeTransporte,
    tipoAsistenciaTransporte,
    setTipoAsistenciaTransporte,
    metodoPago,
    setMetodoPago,
    bancoPse,
    setBancoPse,
    celularNequi,
    setCelularNequi,
    tarjetaNfcLeida,
    codigoTransaccion,
    fechaTransaccion,
    valorCita,
    valorTransporte,
    totalPagar,
    handleEscanearNFC,
    handleSubmit,
    handleNuevoPago,
    handleAudioGuia,
    handleDescargarRecibo
  } = usePay();

  return (
    <div
      className={`${styles.moduloPagos} ${
        highContrast ? styles.modoAltoContraste : ""
      } ${styles[`fuente${fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}`] || ""}`}
    >
      {/* 1. Barra superior de accesibilidad */}
      <aside className={styles.barraAccesibilidad} aria-label="Herramientas de accesibilidad">
        <div className={styles.accesibilidadContenedor}>
          <span className={styles.accesibilidadTitulo}>Accesibilidad:</span>
          <div className={styles.accesibilidadBotones}>
            <button
              type="button"
              className={styles.btnAccesibilidad}
              onClick={() => setHighContrast(!highContrast)}
              aria-pressed={highContrast}
              aria-label="Alternar modo de alto contraste"
            >
              👁️ {highContrast ? "Contraste Normal" : "Alto Contraste"}
            </button>
            <button
              type="button"
              className={styles.btnAccesibilidad}
              onClick={() =>
                setFontSize(
                  fontSize === "normal"
                    ? "large"
                    : fontSize === "large"
                    ? "xlarge"
                    : "normal"
                )
              }
              aria-label="Ajustar tamaño de texto"
            >
              🔍 Texto: {fontSize.toUpperCase()}
            </button>
            <button
              type="button"
              className={`${styles.btnAccesibilidad} ${styles.btnAudio}`}
              onClick={handleAudioGuia}
              aria-label="Escuchar resumen del pago en voz alta"
            >
              🔊 Escuchar Resumen
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Barra de Secuencia Visual del Flujo de Usuario */}
      <nav className={styles.barraSecuencia} aria-label="Ruta y pasos del proceso">
        <ol className={styles.listaSecuencia}>
          <li className={`${styles.pasoSecuencia} ${styles.pasoCompletado}`}>
            <Link
              to="/citas"
              className={styles.enlacePasoSecuencia}
              title="Paso 1: Agendamiento de citas"
            >
              <span className={styles.iconoPaso}>✓</span>
              <span>Agendamiento de citas</span>
            </Link>
          </li>
          <span className={styles.separadorPaso} aria-hidden="true">→</span>
          <li className={`${styles.pasoSecuencia} ${styles.pasoCompletado}`}>
            <Link
              to="/transporte"
              className={styles.enlacePasoSecuencia}
              title="Paso 2: Transporte Preferencial"
            >
              <span className={styles.iconoPaso}>✓</span>
              <span>Transporte Preferencial</span>
            </Link>
          </li>
          <span className={styles.separadorPaso} aria-hidden="true">→</span>
          <li
            className={`${styles.pasoSecuencia} ${styles.pasoActivo}`}
            aria-current="step"
          >
            <span className={styles.iconoPaso}>3</span>
            <span>Módulo de Pagos</span>
          </li>
          <span className={styles.separadorPaso} aria-hidden="true">→</span>
          <li className={`${styles.pasoSecuencia} ${styles.pasoPendiente}`}>
            <span className={styles.iconoPaso}>4</span>
            <span>Mapa</span>
          </li>
        </ol>
      </nav>

      {/* 3. Cabecera con navegación de retorno */}
      <header className={styles.cabeceraPagos}>
        <nav aria-label="Navegación secundaria" className={styles.navFlujo}>
          <Link to="/citas" className={styles.enlaceVolver}>
            ← Volver a Agendamiento de Citas
          </Link>
        </nav>
        <div className={styles.encabezadoInfo}>
          <div className={styles.iconoPrincipal} aria-hidden="true">💳 🚐 🏥</div>
          <div>
            <h1>Pago de Cita Médica y Transporte Preferencial</h1>
            <p className={styles.descripcionCabecera}>
              Confirma el pago de tu cita médica agendada y verifica si requieres incluir el servicio de transporte adaptado para personas con discapacidad o movilidad reducida en Tunja.
            </p>
          </div>
        </div>
      </header>

      {/* 4. Contenido Principal */}
      <main className={styles.contenidoPrincipal}>
        {pagoExitoso ? (
          <ResumenPagoExito
            codigoTransaccion={codigoTransaccion}
            fechaTransaccion={fechaTransaccion}
            datosCita={datosCita}
            valorCita={valorCita}
            incluyeTransporte={incluyeTransporte}
            tipoAsistenciaTransporte={tipoAsistenciaTransporte}
            valorTransporte={valorTransporte}
            metodoPago={metodoPago}
            totalPagar={totalPagar}
            onDescargarRecibo={handleDescargarRecibo}
            onNuevoPago={handleNuevoPago}
          />
        ) : (
          <FormularioPago
            datosCita={datosCita}
            incluyeTransporte={incluyeTransporte}
            setIncluyeTransporte={setIncluyeTransporte}
            tipoAsistenciaTransporte={tipoAsistenciaTransporte}
            setTipoAsistenciaTransporte={setTipoAsistenciaTransporte}
            metodoPago={metodoPago}
            setMetodoPago={setMetodoPago}
            bancoPse={bancoPse}
            setBancoPse={setBancoPse}
            celularNequi={celularNequi}
            setCelularNequi={setCelularNequi}
            tarjetaNfcLeida={tarjetaNfcLeida}
            onEscanearNFC={handleEscanearNFC}
            valorCita={valorCita}
            valorTransporte={valorTransporte}
            totalPagar={totalPagar}
            onSubmit={handleSubmit}
          />
        )}
      </main>

      {/* 5. Pie de página */}
      <footer className={styles.piePagos}>
        <div className={styles.pieContenedor}>
          <p>
            <strong>MediTunja - Pagos en Salud y Transporte Preferencial</strong> | Usabilidad y Taller de Diseño Multimedia.
          </p>
          <p className={styles.pieAclaracion}>
            Cumple con accesibilidad web WCAG 2.1 para la atención integral y digna de personas con discapacidad en Tunja.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Pay;
