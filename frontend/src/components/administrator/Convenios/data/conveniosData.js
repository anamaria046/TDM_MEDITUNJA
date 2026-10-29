// Datos constantes y configuración para el Módulo de Convenios
// MediTunja - Gestión Administrativa EPS y Red de Salud de Tunja

// 1. Catálogo de Instituciones Prestadoras de Salud (IPS) en Tunja
const SERVICIOS_HOSPITAL_SAN_RAFAEL = [
  "srv-med-gen", "srv-med-interna", "srv-pediatria", "srv-ginecologia",
  "srv-obstetricia", "srv-dermatologia", "srv-cirugia-general",
  "srv-anestesiologia", "srv-neurologia", "srv-oftalmologia", "srv-ortopedia",
  "srv-otorrinolaringologia", "srv-oncologia", "srv-psiquiatria", "srv-nefrologia",
  "srv-cardiologia", "srv-laboratorio-basico", "srv-rayos-x", "srv-gastroenterologia",
  "srv-patologia"
];

export const IPS_CATALOGO = [
  {
    id: "san-rafael",
    nombre: "Hospital San Rafael de Tunja",
    sede: "Sede Principal",
    direccion: "Carrera 11 # 27-27, Tunja",
    servicios: SERVICIOS_HOSPITAL_SAN_RAFAEL
  },
  {
    id: "san-rafael-colon",
    nombre: "Hospital San Rafael de Tunja",
    sede: "Sede Edificio Colón",
    direccion: "Avenida Colón # 27-87, Tunja",
    servicios: SERVICIOS_HOSPITAL_SAN_RAFAEL
  },
  {
    id: "san-rafael-materno",
    nombre: "Hospital San Rafael de Tunja",
    sede: "Sede Materno Infantil",
    direccion: "Avenida Universitaria (María Josefa Canelones), Tunja",
    servicios: SERVICIOS_HOSPITAL_SAN_RAFAEL
  },
  {
    id: "ese-san-antonio",
    nombre: "E.S.E Santiago de Tunja (Hospital Metropolitano)",
    sede: "Barrio San Antonio",
    direccion: "Calle 8 # 2A-57 (Barrio San Antonio), Tunja",
    servicios: [
      "srv-med-interna", "srv-med-familiar", "srv-med-gen",
      "srv-ortopedia", "srv-ginecologia", "srv-obstetricia", "srv-pediatria",
      "srv-urgenciologia", "srv-psicologia"
    ]
  },
  {
    id: "medilaser",
    nombre: "Clínica Medilaser",
    sede: "Edificio Davinci (Barrio Las Quintas)",
    direccion: "Carrera 1F # 39-76 (Barrio Las Quintas, Edificio Davinci), Tunja",
    servicios: [
      "srv-endocrinologia", "srv-gineco-obstetricia", "srv-neumologia",
      "srv-neurocirugia", "srv-reumatologia", "srv-urologia", "srv-fisiatria",
      "srv-infectologia-pediatrica", "srv-med-interna", "srv-cardiologia",
      "srv-geriatria", "srv-dermatologia", "srv-med-materno-fetal",
      "srv-neuropediatria", "srv-nefrologia", "srv-oftalmologia-retina",
      "srv-otorrinolaringologia", "srv-pediatria", "srv-gastroenterologia"
    ]
  },
  {
    id: "los-andes",
    nombre: "Clínica Los Andes",
    sede: "Sede Principal",
    direccion: "Transversal 11 # 30-61, Tunja",
    servicios: [
      "srv-med-interna", "srv-med-gen", "srv-cardiologia", "srv-pediatria",
      "srv-gineco-obstetricia", "srv-ortopedia", "srv-cirugia-general",
      "srv-neurocirugia", "srv-urologia", "srv-oftalmologia",
      "srv-otorrinolaringologia", "srv-cirugia-plastica", "srv-cirugia-vascular",
      "srv-anestesiologia"
    ]
  },
  {
    id: "clinica-chia",
    nombre: "Clínica de Chía S.A. (Sede Tunja)",
    sede: "Sector Pozo Donato / Las Quintas",
    direccion: "Carrera 6 # 44-22 (Sector Pozo Donato / Las Quintas), Tunja",
    servicios: [
      "srv-med-gen", "srv-laboratorio-basico", "srv-ortopedia",
      "srv-med-interna", "srv-gineco-obstetricia", "srv-pediatria",
      "srv-dermatologia", "srv-neumologia", "srv-neurologia", "srv-nefrologia",
      "srv-psiquiatria", "srv-psicologia", "srv-nutricion",
      "srv-rehabilitacion", "srv-odontologia", "srv-endodoncia",
      "srv-cirugia-oral", "srv-enfermeria", "srv-vacunacion"
    ]
  }
];

// 2. Catálogo de Entidades Promotoras de Salud (EPS - Oficinas de Atención en Tunja)
export const EPS_CATALOGO = [
  {
    id: "nueva-eps-principal",
    nombre: "Nueva EPS",
    sede: "Oficina de Atención Principal (Centro)",
    direccion: "Carrera 9 # 24-81 (Centro), Tunja"
  },
  {
    id: "nueva-eps-alterna",
    nombre: "Nueva EPS",
    sede: "Sede Alterna (Contributivo/Subsidiado)",
    direccion: "Carrera 7 # 44-57, Tunja"
  },
  {
    id: "famisanar",
    nombre: "Famisanar",
    sede: "Oficina de Atención Tunja",
    direccion: "Calle 28 # 11-46 (Cerca al Hospital San Rafael), Tunja"
  },
  {
    id: "sanitas",
    nombre: "Sanitas",
    sede: "Edificio Cooservicios, Bloque B",
    direccion: "Carrera 1F # 40-149 (Edificio Cooservicios, Bloque B), Tunja"
  },
  {
    id: "sura",
    nombre: "SURA",
    sede: "Alianza Ambulatoria con Clínica de Chía",
    direccion: "Carrera 6 # 44-22 (Funciona en alianza de atención médica ambulatoria con la Clínica de Chía), Tunja"
  },
  {
    id: "salud-total",
    nombre: "Salud Total",
    sede: "Boulevard Shopping (Local 119)",
    direccion: "Avenida Universitaria # 45-124 (Centro Comercial Boulevard Shopping, Local 119), Tunja"
  }
];

// 3. Portafolios Asistenciales Pactados
export const PORTAFOLIOS_ASISTENCIALES = [
  { id: "integral", nombre: "Atención Integral (Consulta, Hospitalización y Terapias)" },
  { id: "ambulatorio", nombre: "Atención Ambulatoria y Consulta Externa Especializada" },
  { id: "rehabilitacion", nombre: "Rehabilitación Integral, Fisioterapia y Discapacidad" },
  { id: "quirurgico", nombre: "Procedimientos Quirúrgicos y Apoyo Diagnóstico" },
  { id: "prioritario", nombre: "Atención Prioritaria y Traslado Asistencial Preferencial" }
];

// 3. Categorías de servicios médicos
export const CATEGORIAS_SERVICIOS = [
  { id: "todas", nombre: "Todas las Categorías" },
  { id: "consultas", nombre: "Consultas Médicas y Especialidades" },
  { id: "terapias", nombre: "Terapias y Rehabilitación" },
  { id: "diagnostico", nombre: "Apoyo Diagnóstico y Laboratorio" },
  { id: "hospitalizacion", nombre: "Hospitalización y Procedimientos" }
];

// 4. Catálogo de servicios médicos asociados a categorías
export const SERVICIOS_POR_CATEGORIA = [
  // Consultas
  { id: "srv-med-gen", categoria: "consultas", codigo: "890201", nombre: "Consulta de Medicina General" },
  { id: "srv-med-interna", categoria: "consultas", nombre: "Medicina Interna" },
  { id: "srv-med-familiar", categoria: "consultas", nombre: "Medicina Familiar" },
  { id: "srv-odontologia", categoria: "consultas", codigo: "890203", nombre: "Consulta de Odontología General" },
  { id: "srv-endodoncia", categoria: "consultas", nombre: "Endodoncia" },
  { id: "srv-cirugia-oral", categoria: "hospitalizacion", nombre: "Cirugía Oral" },
  { id: "srv-cardiologia", categoria: "consultas", codigo: "890302", nombre: "Consulta Especializada en Cardiología" },
  { id: "srv-neurologia", categoria: "consultas", codigo: "890315", nombre: "Consulta Especializada en Neurología" },
  { id: "srv-endocrinologia", categoria: "consultas", nombre: "Endocrinología" },
  { id: "srv-ortopedia", categoria: "consultas", codigo: "890321", nombre: "Consulta Especializada en Ortopedia y Traumatología" },
  { id: "srv-pediatria", categoria: "consultas", codigo: "890325", nombre: "Consulta Especializada en Pediatría" },
  { id: "srv-ginecologia", categoria: "consultas", nombre: "Ginecología" },
  { id: "srv-obstetricia", categoria: "consultas", nombre: "Obstetricia" },
  { id: "srv-gineco-obstetricia", categoria: "consultas", nombre: "Ginecología y Obstetricia" },
  { id: "srv-dermatologia", categoria: "consultas", nombre: "Dermatología" },
  { id: "srv-cirugia-general", categoria: "hospitalizacion", nombre: "Cirugía General" },
  { id: "srv-anestesiologia", categoria: "hospitalizacion", nombre: "Anestesiología" },
  { id: "srv-oftalmologia", categoria: "consultas", nombre: "Oftalmología" },
  { id: "srv-oftalmologia-retina", categoria: "consultas", nombre: "Oftalmología y Retinología" },
  { id: "srv-otorrinolaringologia", categoria: "consultas", nombre: "Otorrinolaringología" },
  { id: "srv-oncologia", categoria: "consultas", nombre: "Oncología" },
  { id: "srv-psiquiatria", categoria: "consultas", nombre: "Psiquiatría" },
  { id: "srv-nefrologia", categoria: "consultas", nombre: "Nefrología" },
  { id: "srv-neumologia", categoria: "consultas", nombre: "Neumología" },
  { id: "srv-neurocirugia", categoria: "hospitalizacion", nombre: "Neurocirugía" },
  { id: "srv-reumatologia", categoria: "consultas", nombre: "Reumatología" },
  { id: "srv-urologia", categoria: "consultas", nombre: "Urología" },
  { id: "srv-fisiatria", categoria: "terapias", nombre: "Fisiatría" },
  { id: "srv-infectologia-pediatrica", categoria: "consultas", nombre: "Infectología Pediátrica" },
  { id: "srv-geriatria", categoria: "consultas", nombre: "Geriatría" },
  { id: "srv-med-materno-fetal", categoria: "consultas", nombre: "Medicina Materno-Fetal" },
  { id: "srv-neuropediatria", categoria: "consultas", nombre: "Neuropediatría" },
  { id: "srv-cirugia-plastica", categoria: "hospitalizacion", nombre: "Cirugía Plástica" },
  { id: "srv-cirugia-vascular", categoria: "hospitalizacion", nombre: "Cirugía Vascular" },
  { id: "srv-urgenciologia", categoria: "hospitalizacion", nombre: "Urgenciología" },
  { id: "srv-psicologia", categoria: "consultas", nombre: "Psicología" },
  { id: "srv-nutricion", categoria: "consultas", nombre: "Nutrición Dietética" },
  { id: "srv-rehabilitacion", categoria: "terapias", nombre: "Medicina Física y Rehabilitación" },
  { id: "srv-enfermeria", categoria: "consultas", nombre: "Enfermería" },
  { id: "srv-vacunacion", categoria: "consultas", nombre: "Vacunación" },
  { id: "srv-gastroenterologia", categoria: "consultas", nombre: "Gastroenterología" },
  { id: "srv-patologia", categoria: "diagnostico", nombre: "Patología" },

  // Terapias y Rehabilitación
  { id: "srv-terapia-fisica", categoria: "terapias", codigo: "931000", nombre: "Fisioterapia y Terapia Física Integral" },
  { id: "srv-terapia-ocupacional", categoria: "terapias", codigo: "938300", nombre: "Terapia Ocupacional para Discapacidad" },
  { id: "srv-fonoaudiologia", categoria: "terapias", codigo: "937000", nombre: "Fonoaudiología y Terapia del Lenguaje" },
  { id: "srv-rehab-cardiopulmonar", categoria: "terapias", codigo: "933600", nombre: "Rehabilitación Cardiopulmonar" },
  { id: "srv-neurorehabilitacion", categoria: "terapias", codigo: "939000", nombre: "Neurorehabilitación para Pacientes con Secuelas Motoras" },

  // Apoyo Diagnóstico
  { id: "srv-laboratorio-basico", categoria: "diagnostico", codigo: "902210", nombre: "Laboratorio Clínico de Rutina y Perfil Bioquímico" },
  { id: "srv-rayos-x", categoria: "diagnostico", codigo: "871010", nombre: "Radiología Convencional y Rayos X Digitales" },
  { id: "srv-ecografia", categoria: "diagnostico", codigo: "881201", nombre: "Ecografía Doppler y Tejidos Blandos" },
  { id: "srv-resonancia", categoria: "diagnostico", codigo: "883101", nombre: "Resonancia Magnética Articular y Cerebral" },
  { id: "srv-electrocardiograma", categoria: "diagnostico", codigo: "895100", nombre: "Electrocardiograma de 12 Derivaciones" },

  // Hospitalización y Procedimientos
  { id: "srv-hosp-general", categoria: "hospitalizacion", codigo: "991001", nombre: "Hospitalización Básica en Sala General" },
  { id: "srv-cirugia-ambulatoria", categoria: "hospitalizacion", codigo: "992002", nombre: "Cirugía Ambulatoria de Mediana Complejidad" },
  { id: "srv-atencion-urgencias", categoria: "hospitalizacion", codigo: "993003", nombre: "Atención Médica en Unidad de Urgencias" }
];

// 5. Convenios iniciales demo registrados en Tunja
export const CONVENIOS_INICIALES = [
  {
    id: "CNV-TUN-2026-001",
    epsId: "nueva-eps-principal",
    epsNombre: "Nueva EPS",
    epsSede: "Oficina de Atención Principal (Centro)",
    epsDireccion: "Carrera 9 # 24-81 (Centro), Tunja",
    ipsId: "san-rafael",
    ipsNombre: "Hospital San Rafael de Tunja",
    ipsSede: "Sede Principal",
    ipsDireccion: "Carrera 11 # 27-27, Tunja",
    portafolioId: "integral",
    portafolioNombre: "Atención Integral (Consulta, Hospitalización y Terapias)",
    serviciosSeleccionados: ["srv-med-gen", "srv-cardiologia", "srv-neurologia", "srv-pediatria"],
    clausulaTransporte: true,
    estado: "Activo",
    fechaCreacion: "2026-01-15"
  },
  {
    id: "CNV-TUN-2026-002",
    epsId: "sanitas",
    epsNombre: "Sanitas",
    epsSede: "Edificio Cooservicios, Bloque B",
    epsDireccion: "Carrera 1F # 40-149 (Edificio Cooservicios, Bloque B), Tunja",
    ipsId: "medilaser",
    ipsNombre: "Clínica Medilaser",
    ipsSede: "Edificio Davinci (Barrio Las Quintas)",
    ipsDireccion: "Carrera 1F # 39-76 (Barrio Las Quintas, Edificio Davinci), Tunja",
    portafolioId: "quirurgico",
    portafolioNombre: "Procedimientos Quirúrgicos y Apoyo Diagnóstico",
    serviciosSeleccionados: ["srv-gineco-obstetricia", "srv-neumologia", "srv-neurocirugia", "srv-cardiologia"],
    clausulaTransporte: true,
    estado: "Activo",
    fechaCreacion: "2026-02-01"
  },
  {
    id: "CNV-TUN-2026-003",
    epsId: "sura",
    epsNombre: "SURA",
    epsSede: "Alianza Ambulatoria con Clínica de Chía",
    epsDireccion: "Carrera 6 # 44-22 (Funciona en alianza de atención médica ambulatoria con la Clínica de Chía), Tunja",
    ipsId: "ese-san-antonio",
    ipsNombre: "E.S.E Santiago de Tunja (Hospital Metropolitano)",
    ipsSede: "Barrio San Antonio",
    ipsDireccion: "Calle 8 # 2A-57 (Barrio San Antonio), Tunja",
    portafolioId: "ambulatorio",
    portafolioNombre: "Atención Ambulatoria y Consulta Externa Especializada",
    serviciosSeleccionados: ["srv-med-gen", "srv-med-familiar", "srv-pediatria"],
    clausulaTransporte: false,
    estado: "En Revisión",
    fechaCreacion: "2026-03-10"
  }
];
