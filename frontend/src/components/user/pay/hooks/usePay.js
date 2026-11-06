// Hook personalizado con la lógica de negocio y estado del Módulo de Pagos
// MediTunja - Separación de Lógica (JS) y Vista (JSX)

import { useState } from "react";
import {
  DATOS_CITA_PAGO_PRECARGADOS,
  PRECIOS_CITA,
  TARIFA_TRANSPORTE,
  formatearMoneda
} from "../data/payData";

export function usePay() {
  // 1. Estado del flujo de pago
  const [pagoExitoso, setPagoExitoso] = useState(false);

  // 2. Datos del paciente y cita médica precargados (bloqueados para trazabilidad)
  const [datosCita] = useState(DATOS_CITA_PAGO_PRECARGADOS);

  // 3. Integración del servicio de Transporte Preferencial Adaptado
  const [incluyeTransporte, setIncluyeTransporte] = useState(true);
  const [tipoAsistenciaTransporte, setTipoAsistenciaTransporte] = useState("rampa-silla");

  // 4. Configuración del método de pago
  const [metodoPago, setMetodoPago] = useState("pse");
  const [bancoPse, setBancoPse] = useState("bancolombia");
  const [celularNequi, setCelularNequi] = useState("3123456789");
  const [tarjetaNfcLeida, setTarjetaNfcLeida] = useState(false);

  // 5. Transacción generada
  const [codigoTransaccion, setCodigoTransaccion] = useState("");
  const [fechaTransaccion, setFechaTransaccion] = useState("");

  // Cálculos de liquidación
  const valorCita = PRECIOS_CITA[datosCita.tipoCita]?.valor || 4500;
  const valorTransporte = incluyeTransporte ? TARIFA_TRANSPORTE : 0;
  const totalPagar = valorCita + valorTransporte;

  // Simular escaneo de tarjeta inteligente NFC MediTunja
  const handleEscanearNFC = () => {
    setTarjetaNfcLeida(true);
    alert("¡Tarjeta Inteligente NFC MediTunja detectada con saldo suficiente para el pago!");
  };

  // Procesar envío del formulario de pago
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

  // Reiniciar flujo para nuevo pago
  const handleNuevoPago = () => {
    setPagoExitoso(false);
    setTarjetaNfcLeida(false);
  };

  // Descarga de recibo comprobante
  const handleDescargarRecibo = () => {
    alert(
      `Comprobante de Pago Generado:\n` +
      `Código: ${codigoTransaccion}\n` +
      `Paciente: ${datosCita.nombrePaciente}\n` +
      `Cita Médica: ${PRECIOS_CITA[datosCita.tipoCita]?.nombre} (${formatearMoneda(valorCita)})\n` +
      `Transporte Adaptado: ${incluyeTransporte ? `Incluido (${formatearMoneda(valorTransporte)})` : "No requerido"}\n` +
      `Total Pagado: ${formatearMoneda(totalPagar)}\n` +
      `¡El recibo ha sido descargado y registrado en la admisión de la IPS!`
    );
  };

  return {
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
    handleDescargarRecibo
  };
}
