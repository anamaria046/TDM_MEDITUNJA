// Subcomponente de Recibo y Confirmación Exitosa de Pago
// MediTunja - Módulo de Pagos (Estructura modular y maquetación limpia)

import { Link } from "react-router-dom";
import styles from "./pay.module.css";
import { PRECIOS_CITA, formatearMoneda } from "./data/payData";

function ResumenPagoExito({
  codigoTransaccion,
  fechaTransaccion,
  datosCita,
  valorCita,
  incluyeTransporte,
  tipoAsistenciaTransporte,
  valorTransporte,
  metodoPago,
  totalPagar,
  onDescargarRecibo,
  onNuevoPago
}) {
  const getMetodoTexto = (metodo) => {
    switch (metodo) {
      case "pse":
        return "PSE Débito Bancario";
      case "nequi":
        return "Billetera Digital Nequi";
      case "tarjeta":
        return "Tarjeta Débito / Crédito";
      case "nfc-meditunja":
        return "Tarjeta Inteligente NFC MediTunja";
      default:
        return "Pago en Taquilla / Convenio EPS";
    }
  };

  const getAsistenciaTexto = (tipo) => {
    switch (tipo) {
      case "rampa-silla":
        return "Rampa / Silla de Ruedas";
      case "camilla":
        return "Camilla Asistida";
      case "conductor-apoyo":
        return "Vehículo Piso Bajo y Apoyo de Conductor";
      default:
        return "Asistencia Preferencial Estándar";
    }
  };

  return (
    <section className={styles.tarjetaConfirmacion} aria-live="polite" role="status">
      <div className={styles.iconoExito} aria-hidden="true">✅</div>
      <h2>¡Pago Procesado y Cita Confirmada!</h2>
      <p className={styles.resumenExito}>
        El pago de tu atención médica ha sido recibido. Se ha notificado al centro de salud y a la unidad de transporte en Tunja.
      </p>

      <div className={styles.detallesResumen}>
        <div className={styles.cabeceraRecibo}>
          <h3>Recibo Oficial de Pago</h3>
          <span className={styles.etiquetaEstado}>Transacción Aprobada</span>
        </div>
        <ul>
          <li><strong>Código de Transacción:</strong> {codigoTransaccion}</li>
          <li><strong>Fecha y Hora:</strong> {fechaTransaccion}</li>
          <li><strong>Paciente:</strong> {datosCita.nombrePaciente} ({datosCita.tipoDocumento} {datosCita.documentoPaciente})</li>
          <li><strong>IPS de Atención:</strong> {datosCita.ipsCita}</li>
          <li>
            <strong>Servicio Médico:</strong> {PRECIOS_CITA[datosCita.tipoCita]?.nombre} - <strong>{formatearMoneda(valorCita)}</strong>
          </li>
          <li><strong>Fecha y Hora de la Cita:</strong> {datosCita.fechaCita} a las {datosCita.horaCita}</li>
          <li>
            <strong>Servicio de Transporte Preferencial:</strong>{" "}
            {incluyeTransporte ? (
              <span className={styles.etiquetaTransporteRecibo}>
                🚐 Adaptado ({getAsistenciaTexto(tipoAsistenciaTransporte)}) - {formatearMoneda(valorTransporte)}
              </span>
            ) : (
              "No solicitado (El paciente llega por sus propios medios)"
            )}
          </li>
          <li>
            <strong>Método Utilizado:</strong> {getMetodoTexto(metodoPago)}
          </li>
          <li className={styles.filaTotalRecibo}>
            <strong>Total Pagado:</strong> <span className={styles.totalPrecio}>{formatearMoneda(totalPagar)}</span>
          </li>
        </ul>
      </div>

      <div className={styles.accionesConfirmacion}>
        <button
          type="button"
          className={styles.btnAccionDescargar}
          onClick={onDescargarRecibo}
        >
          📥 Descargar Comprobante (PDF)
        </button>
        <button
          type="button"
          className={styles.btnAccionPrincipal}
          onClick={onNuevoPago}
        >
          💳 Realizar otro Pago
        </button>
        <Link to="/mapa" className={styles.btnAccionSecundario}>
          Ver Mapa de Ruta IPS →
        </Link>
      </div>
    </section>
  );
}

export default ResumenPagoExito;
