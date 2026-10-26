// Datos estáticos del Módulo de Pagos - MediTunja
// Guiado bajo el patrón modular de Transporte Preferencial

// Datos precargados del paciente y la cita (provenientes de agendamiento y transporte)
export const DATOS_PACIENTE_PRECARGADOS = {
  documentoPaciente: "1049654321",
  tipoDocumento: "CC",
  nombrePaciente: "María Clemencia Rodríguez Soler",
  ipsCita: "Hospital Universitario San Rafael de Tunja",
  tipoCita: "especialista",
  fechaCita: "2026-10-25",
  horaCita: "09:30",
};

// Tarifas de la Cita Médica (en pesos colombianos)
export const PRECIOS_CITA = {
  general: { nombre: "Consulta de Medicina General / Odontología", valor: 4500 },
  especialista: { nombre: "Consulta con Médico Especialista", valor: 18200 },
  terapias: { nombre: "Sesión de Terapias y Rehabilitación Física", valor: 12000 },
};

// Tarifa fija y subsidiada para el Transporte Preferencial Adaptado en Tunja
export const TARIFA_TRANSPORTE = 12000;

// Opciones de IPS disponibles en Tunja
export const IPS_TUNJA = [
  { value: "Hospital Universitario San Rafael de Tunja", label: "Hospital Universitario San Rafael de Tunja" },
  { value: "Clínica Medilaser Tunja",                   label: "Clínica Medilaser Tunja" },
  { value: "Clínica de Los Andes",                      label: "Clínica de Los Andes" },
  { value: "E.S.E. Santiago de Tunja - Sede San Antonio", label: "E.S.E. Santiago de Tunja (San Antonio)" },
  { value: "E.S.E. Santiago de Tunja - Sede El Carmen",   label: "E.S.E. Santiago de Tunja (El Carmen)" },
];

// Opciones de tipos de asistencia de transporte
export const TIPOS_ASISTENCIA_TRANSPORTE = [
  { value: "rampa-silla",    label: "Vehículo con Rampa / Silla de Ruedas" },
  { value: "conductor-apoyo", label: "Vehículo de Piso Bajo y Apoyo de Conductor" },
  { value: "camilla",         label: "Traslado con Camilla Asistida" },
];

// Opciones de bancos para PSE
export const BANCOS_PSE = [
  { value: "bancolombia", label: "Bancolombia" },
  { value: "davivienda",  label: "Davivienda" },
  { value: "bogota",      label: "Banco de Bogotá" },
  { value: "agrario",     label: "Banco Agrario" },
  { value: "coofisam",    label: "Cooperativas Boyacá" },
];
