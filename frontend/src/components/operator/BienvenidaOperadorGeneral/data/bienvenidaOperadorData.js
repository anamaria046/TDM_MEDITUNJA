// Datos y configuración para el módulo de Bienvenida del Operador General del Sistema
// MediTunja - Arquitectura modular limpia

export const INFO_PANEL_OPERADOR = {
  rol: "OPERADOR GENERAL DEL SISTEMA",
  sedeOperativa: "Central de Operaciones · MediTunja Tunja",
  badgeSeccion: "PANEL DE CONTROL OPERATIVO",
  tituloPrincipal: "Bienvenido de nuevo",
  subtitulo: "Aquí tienes un resumen general del estado y la operación en tiempo real de MediTunja."
};

export const MENU_ITEMS_OPERADOR = [
  {
    id: "inicio",
    label: "Inicio",
    icono: "House",
    ruta: "/operador",
    activo: true
  },
  {
    id: "usuarios",
    label: "Usuarios y Afiliados",
    icono: "UsersRound",
    ruta: "/operador/usuarios",
    activo: false
  },
  {
    id: "citas",
    label: "Citas y Atenciones",
    icono: "CalendarDays",
    ruta: "/operador/citas",
    activo: false
  },
  {
    id: "transporte",
    label: "Transporte Preferencial",
    icono: "Ambulance",
    ruta: "/operador/transporte",
    activo: false
  },
  {
    id: "novedades",
    label: "Novedades y Soporte",
    icono: "AlertCircle",
    ruta: "/operador/novedades",
    activo: false
  }
];

export const METRICAS_OPERADOR_GENERAL = [
  {
    id: "usuarios_totales",
    valor: "3.420",
    etiqueta: "Usuarios registrados",
    descripcion: "Total de usuarios y pacientes registrados en la plataforma"
  },
  {
    id: "citas_hoy",
    valor: "142",
    etiqueta: "Citas y turnos hoy",
    descripcion: "Citas médicas programadas y en curso para la jornada actual"
  },
  {
    id: "transporte_activo",
    valor: "18",
    etiqueta: "Móviles en ruta",
    descripcion: "Vehículos adaptados de transporte preferencial en servicio activo"
  },
  {
    id: "alertas_operativas",
    valor: "4",
    etiqueta: "Novedades por atender",
    descripcion: "Solicitudes especiales o incidencias técnicas pendientes de revisión"
  }
];
