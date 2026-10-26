// Datos constantes y configuración para el Módulo de Transporte Preferencial
// MediTunja - Usabilidad y Taller de Diseño Multimedia

// 1. Datos precargados que provienen de la cita médica agendada previamente
// Estos datos se presentan bloqueados (no editables) en el formulario de transporte
export const DATOS_CITA_PRECARGADOS = {
  // Datos del Paciente
  tipoDocumento: "CC",
  tipoDocumentoTexto: "Cédula de Ciudadanía (C.C.)",
  numeroDocumento: "1049654321",
  nombresPaciente: "María Clemencia Rodríguez Soler",
  epsPaciente: "nueva-eps",
  epsPacienteTexto: "Nueva EPS",
  telefonoPaciente: "3123456789",
  telefonoCuidador: "3209876543 (Carlos Rodríguez)",

  // Datos de la Cita Médica agendada
  ipsDestino: "hospital-san-rafael",
  ipsDestinoTexto: "Hospital Universitario San Rafael de Tunja (Sede Central)",
  tipoAtencion: "Consulta Externa - Cardiología",
  fechaCita: "2026-11-10",
  horaCita: "08:00"
};

// 2. Tipos de condición médica o discapacidad
export const TIPOS_DISCAPACIDAD = [
  { value: "motora-silla-ruedas", label: "Discapacidad Motora / Movilidad Reducida (Usuario de silla de ruedas)" },
  { value: "motora-andador", label: "Discapacidad Motora (Uso de caminador, andador o muletas)" },
  { value: "visual", label: "Discapacidad Visual (Ceguera o baja visión severa)" },
  { value: "auditiva", label: "Discapacidad Auditiva / Persona Sorda" },
  { value: "cognitiva", label: "Discapacidad Cognitiva, Intelectual o del Neurodesarrollo" },
  { value: "multiple", label: "Discapacidad Múltiple" },
  { value: "adulto-mayor", label: "Adulto Mayor con dependencia funcional" },
  { value: "dialisis-oncologia", label: "Paciente en tratamiento de Diálisis / Oncología / Postquirúrgico" }
];

// 3. Catálogo de requerimientos específicos del vehículo adaptado
export const REQUERIMIENTOS_VEHICULO = [
  {
    id: "rampa",
    icono: "🦼",
    titulo: "Rampa o elevador hidráulico",
    descripcion: "Para subir al vehículo sin bajarse de la silla de ruedas."
  },
  {
    id: "anclaje",
    icono: "🔒",
    titulo: "Anclaje y cinturón de 4 puntos",
    descripcion: "Fijación segura de la silla dentro de la cabina."
  },
  {
    id: "piso-bajo",
    icono: "🚪",
    titulo: "Vehículo de piso bajo o estribo abatible",
    descripcion: "Fácil abordaje sin escalones altos."
  },
  {
    id: "oxigeno",
    icono: "🫁",
    titulo: "Soporte para bala de oxígeno",
    descripcion: "Espacio seguro para equipo respiratorio portátil."
  },
  {
    id: "perro-guia",
    icono: "🦮",
    titulo: "Perro guía o de asistencia",
    descripcion: "Viaja con animal de compañía certificado."
  },
  {
    id: "camilla",
    icono: "🚑",
    titulo: "Traslado en camilla / TAB",
    descripcion: "Traslado asistencial básico con camillero."
  }
];

// 4. Mapeo de requerimientos recomendados automáticamente según el tipo de condición médica
export const RECOMENDACIONES_POR_DISCAPACIDAD = {
  "motora-silla-ruedas": ["rampa", "anclaje", "piso-bajo"],
  "motora-andador": ["piso-bajo"],
  "visual": ["piso-bajo", "perro-guia"],
  "auditiva": [],
  "cognitiva": ["piso-bajo"],
  "multiple": ["rampa", "anclaje", "oxigeno"],
  "adulto-mayor": ["piso-bajo"],
  "dialisis-oncologia": ["oxigeno", "piso-bajo"]
};
