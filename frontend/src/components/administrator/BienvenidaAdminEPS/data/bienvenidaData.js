// Datos y configuración para el módulo de Bienvenida Admin EPS
// MediTunja - Arquitectura modular limpia

export const INFO_PANEL = {
  rol: "ADMINISTRADOR EPS",
  epsPredeterminada: "Nueva EPS · Regional Boyacá",
  badgeSeccion: "PANEL ADMINISTRATIVO",
  tituloPrincipal: "Bienvenido de nuevo",
  subtitulo: "Aquí tienes un resumen de la operación de MediTunja."
};

export const MENU_ITEMS_SIDEBAR = [
  {
    id: "inicio",
    label: "Inicio",
    icono: "House",
    ruta: "/admin",
    activo: true
  },
  {
    id: "usuarios",
    label: "Usuarios",
    icono: "UsersRound",
    ruta: "/gestionUsuarios",
    activo: false
  },
  {
    id: "citas",
    label: "Citas",
    icono: "CalendarDays",
    ruta: "/gestionCitas",
    activo: false
  },
  {
    id: "resultados",
    label: "Resultados",
    icono: "FileText",
    ruta: "/resultados-administrador",
    activo: false
  }
];

export const METRICAS_OPERACION = [
  {
    id: "afiliados",
    valor: "1.248",
    etiqueta: "Afiliados activos",
    descripcion: "Pacientes con cobertura vigente en la red Tunja y Boyacá"
  },
  {
    id: "citas",
    valor: "84",
    etiqueta: "Citas este mes",
    descripcion: "Citas médicas gestionadas, agendadas o en trámite"
  },
  {
    id: "resultados",
    valor: "27",
    etiqueta: "Resultados pendientes",
    descripcion: "Procedimientos y análisis clínicos en espera de validación"
  }
];
