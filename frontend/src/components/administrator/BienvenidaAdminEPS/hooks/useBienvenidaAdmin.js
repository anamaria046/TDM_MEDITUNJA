// Hook personalizado para el módulo de Bienvenida Admin EPS
// Manejo de estado, navegación y utilidades de la vista administrativa

import { useState } from "react";
import { useAdminAuth } from "../../../../auth/useAdminAuth.js";
import { INFO_PANEL, MENU_ITEMS_SIDEBAR, METRICAS_OPERACION } from "../data/bienvenidaData.js";

export function useBienvenidaAdmin() {
  const adminAuth = useAdminAuth();
  const usuario = adminAuth?.usuario || null;

  const [darkMode, setDarkMode] = useState(false);
  const [metricas, setMetricas] = useState(METRICAS_OPERACION);

  const nombreEps = usuario?.eps 
    ? `${usuario.eps} · Regional Boyacá` 
    : INFO_PANEL.epsPredeterminada;

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleAyuda = () => {
    window.alert(
      "Centro de Ayuda MediTunja - Administrador EPS\n\nSi necesitas soporte técnico o asistencia en la plataforma, comunícate con la mesa de ayuda de MediTunja."
    );
  };

  return {
    usuario,
    nombreEps,
    infoPanel: INFO_PANEL,
    menuItems: MENU_ITEMS_SIDEBAR,
    metricas,
    setMetricas,
    darkMode,
    handleToggleDarkMode,
    handleAyuda
  };
}
