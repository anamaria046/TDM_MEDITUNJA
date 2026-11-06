// Hook personalizado para el módulo de Bienvenida del Operador General del Sistema
// Manejo de estado, tema visual y acciones operativas de la plataforma

import { useState } from "react";
import {
  INFO_PANEL_OPERADOR,
  MENU_ITEMS_OPERADOR,
  METRICAS_OPERADOR_GENERAL
} from "../data/bienvenidaOperadorData.js";

export function useBienvenidaOperador() {
  const [darkMode, setDarkMode] = useState(false);
  const [metricas, setMetricas] = useState(METRICAS_OPERADOR_GENERAL);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const handleAyuda = () => {
    window.alert(
      "Centro de Soporte Operativo MediTunja\n\nLínea técnica de despacho y coordinación para operadores generales del sistema."
    );
  };

  return {
    infoPanel: INFO_PANEL_OPERADOR,
    menuItems: MENU_ITEMS_OPERADOR,
    metricas,
    setMetricas,
    darkMode,
    handleToggleDarkMode,
    handleAyuda
  };
}
