// Datos constantes y configuración para el Módulo de Pagos
// MediTunja - Usabilidad y Taller de Diseño Multimedia
// Flujo integrado: Agendamiento -> Transporte -> Pagos -> Mapa

// 1. Datos del paciente y cita médica precargados (provenientes de la cita y transporte)
export const DATOS_CITA_PAGO_PRECARGADOS = {
  documentoPaciente: "1049654321",
  tipoDocumento: "CC",
  tipoDocumentoTexto: "Cédula de Ciudadanía (C.C.)",
  nombrePaciente: "María Clemencia Rodríguez Soler",
  ipsCita: "Hospital Universitario San Rafael de Tunja",
  tipoCita: "especialista",
  fechaCita: "2026-10-25",
  horaCita: "09:30"
};

// 2. Catálogo de tarifas de citas médicas en la red de Tunja
export const PRECIOS_CITA = {
  general: {
    nombre: "Consulta de Medicina General / Odontología",
    valor: 4500
  },
  especialista: {
    nombre: "Consulta con Médico Especialista",
    valor: 18200
  },
  terapias: {
    nombre: "Sesión de Terapias y Rehabilitación Física",
    valor: 12000
  }
};

// 3. Tarifa fija y subsidiada para el Servicio de Transporte Preferencial Adaptado
export const TARIFA_TRANSPORTE = 12000;

// 4. Opciones de asistencia para el transporte preferencial adaptado
export const OPCIONES_ASISTENCIA_TRANSPORTE = [
  { value: "rampa-silla", label: "Vehículo con Rampa / Silla de Ruedas" },
  { value: "conductor-apoyo", label: "Vehículo de Piso Bajo y Apoyo de Conductor" },
  { value: "camilla", label: "Traslado con Camilla Asistida" }
];

// 5. Catálogo de métodos de pago disponibles
export const METODOS_PAGO = [
  {
    id: "pse",
    titulo: "PSE Débito",
    descripcion: "Transferencia bancaria en línea.",
    icono: "🏦"
  },
  {
    id: "nequi",
    titulo: "Nequi / Daviplata",
    descripcion: "Pago rápido desde el móvil.",
    icono: "📱"
  },
  {
    id: "tarjeta",
    titulo: "Tarjeta Débito/Crédito",
    descripcion: "Visa, Mastercard y otras franquicias.",
    icono: "💳"
  },
  {
    id: "nfc-meditunja",
    titulo: "Tarjeta NFC MediTunja",
    descripcion: "Carné inteligente sin contacto.",
    icono: "📡"
  }
];

// 6. Bancos disponibles para PSE en Boyacá
export const BANCOS_PSE = [
  { id: "bancolombia", nombre: "Bancolombia" },
  { id: "davivienda", nombre: "Davivienda" },
  { id: "bogota", nombre: "Banco de Bogotá" },
  { id: "agrario", nombre: "Banco Agrario" },
  { id: "coofisam", nombre: "Cooperativas Boyacá" }
];

// Helper para formatear valores en pesos colombianos
export const formatearMoneda = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(val);
};
