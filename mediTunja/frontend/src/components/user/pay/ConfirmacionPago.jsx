// Componente de Confirmación / Recibo de Pago Exitoso
// MediTunja - Módulo de Pagos
// Se muestra al usuario después de completar el pago correctamente

import { Link } from "react-router-dom";
import { PRECIOS_CITA } from "./data/payData";

function ConfirmacionPago({
  codigoTransaccion,
  fechaTransaccion,
  nombrePaciente,
  tipoDocumento,
  documentoPaciente,
  ipsCita,
  tipoCita,
  fechaCita,
  horaCita,
  incluyeTransporte,
  tipoAsistenciaTransporte,
  metodoPago,
  valorCita,
  valorTransporte,
  totalPagar,
  formatearMoneda,
  onOtroPago,
  onDescargarRecibo,
}) {
  const etiquetaTransporte = () => {
    if (!incluyeTransporte) return "No solicitado (El paciente llega por sus propios medios)";
    const tipo =
      tipoAsistenciaTransporte === "rampa-silla"
        ? "Rampa / Silla de ruedas"
        : tipoAsistenciaTransporte === "camilla"
        ? "Camilla Asistida"
        : "Soporte de Conductor";
    return `🚐 Adaptado (${tipo}) — ${formatearMoneda(valorTransporte)}`;
  };

  const etiquetaMetodoPago = () => {
    switch (metodoPago) {
      case "pse":           return "PSE Débito Bancario";
      case "nequi":         return "Billetera Digital Nequi / Daviplata";
      case "tarjeta":       return "Tarjeta Débito / Crédito";
      case "nfc-meditunja": return "Tarjeta Inteligente NFC MediTunja";
      default:              return "Pago en Efectivo / Taquilla IPS";
    }
  };

  return (
    <section className="tarjeta-confirmacion" aria-live="polite" role="status">
      <div className="icono-exito" aria-hidden="true">✅</div>
      <h2>¡Pago Procesado y Cita Confirmada!</h2>
      <p className="resumen-exito">
        El pago de tu atención médica ha sido recibido. Se ha notificado al centro de salud y a la unidad
        de transporte en Tunja.
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
          <li>
            <strong>Servicio Médico:</strong> {PRECIOS_CITA[tipoCita].nombre} —{" "}
            <strong>{formatearMoneda(valorCita)}</strong>
          </li>
          <li><strong>Fecha y Hora de la Cita:</strong> {fechaCita} a las {horaCita}</li>
          <li>
            <strong>Servicio de Transporte Preferencial:</strong>{" "}
            {incluyeTransporte ? (
              <span className="etiqueta-estado" style={{ backgroundColor: "#e2e8f0", color: "#2d3748" }}>
                {etiquetaTransporte()}
              </span>
            ) : (
              etiquetaTransporte()
            )}
          </li>
          <li>
            <strong>Método Utilizado:</strong> {etiquetaMetodoPago()}
          </li>
          <li style={{ borderTop: "2px solid #e2e8f0", paddingTop: "0.75rem", fontSize: "1.1em" }}>
            <strong>Total Pagado:</strong>{" "}
            <span className="total-precio">{formatearMoneda(totalPagar)}</span>
          </li>
        </ul>
      </div>

      <div className="acciones-confirmacion">
        <button type="button" className="btn-accion-descargar" onClick={onDescargarRecibo}>
          📥 Descargar Comprobante (PDF)
        </button>
        <button type="button" className="btn-accion-principal" onClick={onOtroPago}>
          💳 Realizar otro Pago
        </button>
        <Link to="/login" className="btn-accion-secundario">
          Ir al Inicio
        </Link>
      </div>
    </section>
  );
}

export default ConfirmacionPago;
