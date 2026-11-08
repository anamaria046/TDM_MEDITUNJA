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
