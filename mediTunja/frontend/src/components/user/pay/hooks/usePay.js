// Hook personalizado con la lógica de negocio del Módulo de Pagos
// MediTunja - Separación de Lógica (JS) y Vista (JSX)
// Patrón espejo de useTransporte.js

import { useState } from "react";
import {
  DATOS_PACIENTE_PRECARGADOS,
  PRECIOS_CITA,
  TARIFA_TRANSPORTE,
} from "../data/payData";

export function usePay() {
  // 1. Accesibilidad (tamaño de texto y alto contraste)
  const [fontSize, setFontSize] = useState("normal"); // 'normal' | 'large' | 'xlarge'
  const [highContrast, setHighContrast] = useState(false);

  // 2. Estado del flujo de pago
  const [pagoExitoso, setPagoExitoso] = useState(false);

  // 3. Datos precargados del paciente y la cita (bloqueados, provenientes de agendamiento)
  const [documentoPaciente] = useState(DATOS_PACIENTE_PRECARGADOS.documentoPaciente);
  const [tipoDocumento]     = useState(DATOS_PACIENTE_PRECARGADOS.tipoDocumento);
  const [nombrePaciente]    = useState(DATOS_PACIENTE_PRECARGADOS.nombrePaciente);
  const [ipsCita]           = useState(DATOS_PACIENTE_PRECARGADOS.ipsCita);
  const [tipoCita]          = useState(DATOS_PACIENTE_PRECARGADOS.tipoCita);
  const [fechaCita]         = useState(DATOS_PACIENTE_PRECARGADOS.fechaCita);
  const [horaCita]          = useState(DATOS_PACIENTE_PRECARGADOS.horaCita);

  // 4. Servicio de Transporte Preferencial Adaptado
  const [incluyeTransporte, setIncluyeTransporte]               = useState(true);
  const [tipoAsistenciaTransporte, setTipoAsistenciaTransporte] = useState("rampa-silla");

  // 5. Método de pago
  const [metodoPago, setMetodoPago]       = useState("pse");
  const [bancoPse, setBancoPse]           = useState("bancolombia");
  const [celularNequi, setCelularNequi]   = useState("3123456789");
  const [tarjetaNfcLeida, setTarjetaNfcLeida] = useState(false);

  // 6. Datos generados al completar la transacción
  const [codigoTransaccion, setCodigoTransaccion] = useState("");
  const [fechaTransaccion, setFechaTransaccion]   = useState("");

  // Cálculo de tarifas
  const valorCita       = PRECIOS_CITA[tipoCita]?.valor || 4500;
  const valorTransporte = incluyeTransporte ? TARIFA_TRANSPORTE : 0;
  const totalPagar      = valorCita + valorTransporte;

  // Formateador de moneda en pesos colombianos
  const formatearMoneda = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  // Simular escaneo de tarjeta NFC MediTunja
  const handleEscanearNFC = () => {
    setTarjetaNfcLeida(true);
    alert("¡Tarjeta Inteligente NFC MediTunja detectada con saldo suficiente para el pago!");
  };

  // Procesar el pago al enviar el formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (metodoPago === "nfc-meditunja" && !tarjetaNfcLeida) {
      alert("Por favor aproxima tu tarjeta NFC MediTunja o pulsa 'Escanear Tarjeta NFC' para completar el pago.");
      return;
    }

    const codigo = `TXN-MED-${Math.floor(1000 + Math.random() * 9000)}`;
    const ahora = new Date().toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    setCodigoTransaccion(codigo);
    setFechaTransaccion(ahora);
    setPagoExitoso(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Audio-guía accesible con resumen del pago
  const handleAudioGuia = () => {
    alert(
      "Audio-guía de Pago MediTunja:\n" +
        `Estás pagando la ${PRECIOS_CITA[tipoCita].nombre} por valor de ${formatearMoneda(valorCita)}.\n` +
        (incluyeTransporte
          ? `Tienes activado el servicio de Transporte Preferencial Adaptado por ${formatearMoneda(TARIFA_TRANSPORTE)}.\n`
          : "No tienes seleccionado transporte adaptado.\n") +
        `Total a pagar: ${formatearMoneda(totalPagar)}.`
    );
  };

  // Descargar / mostrar comprobante de pago
  const handleDescargarRecibo = () => {
    alert(
      `Comprobante de Pago Generado:\n` +
        `Código: ${codigoTransaccion}\n` +
        `Paciente: ${nombrePaciente}\n` +
        `Cita Médica: ${PRECIOS_CITA[tipoCita].nombre} (${formatearMoneda(valorCita)})\n` +
        `Transporte Adaptado: ${incluyeTransporte ? `Incluido (${formatearMoneda(valorTransporte)})` : "No requerido"}\n` +
        `Total Pagado: ${formatearMoneda(totalPagar)}\n` +
        `¡El recibo ha sido descargado y registrado en la admisión de la IPS!`
    );
  };

  // Volver al formulario para realizar otro pago
  const handleOtroPago = () => {
    setPagoExitoso(false);
    setTarjetaNfcLeida(false);
  };

  return {
    // Accesibilidad
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,

    // Flujo de pago
    pagoExitoso,

    // Datos precargados (bloqueados)
    documentoPaciente,
    tipoDocumento,
    nombrePaciente,
    ipsCita,
    tipoCita,
    fechaCita,
    horaCita,

    // Transporte
    incluyeTransporte,
    setIncluyeTransporte,
    tipoAsistenciaTransporte,
    setTipoAsistenciaTransporte,

    // Método de pago
    metodoPago,
    setMetodoPago,
    bancoPse,
    setBancoPse,
    celularNequi,
    setCelularNequi,
    tarjetaNfcLeida,

    // Transacción generada
    codigoTransaccion,
    fechaTransaccion,

    // Cálculos de tarifas
    valorCita,
    valorTransporte,
    totalPagar,

    // Funciones / handlers
    formatearMoneda,
    handleEscanearNFC,
    handleSubmit,
    handleAudioGuia,
    handleDescargarRecibo,
    handleOtroPago,
  };
}
