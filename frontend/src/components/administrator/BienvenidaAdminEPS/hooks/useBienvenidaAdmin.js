// Hook personalizado para el módulo de Bienvenida Admin EPS
// Manejo de estado, navegación y utilidades de la vista administrativa

import { useEffect, useState } from "react";
import { useAdminAuth } from "../../../../auth/useAdminAuth.js";
import { apiRequest, mensajeError } from "../../../../auth/api.js";
import { INFO_PANEL, MENU_ITEMS_SIDEBAR } from "../data/bienvenidaData.js";

export function useBienvenidaAdmin() {
  const { token, usuario } = useAdminAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [metricas, setMetricas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    apiRequest("/admin/resumen", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(({ data }) => {
      if (!activo) return;
      setMetricas([
        {
          id: "afiliados",
          valor: data.afiliadosActivos.toLocaleString("es-CO"),
          etiqueta: "Afiliados activos",
        },
        {
          id: "citas",
          valor: data.citasEsteMes.toLocaleString("es-CO"),
          etiqueta: "Citas confirmadas este mes",
        },
        {
          id: "resultados",
          valor: data.resultadosPendientes.toLocaleString("es-CO"),
          etiqueta: "Resultados pendientes",
        },
      ]);
    }).catch((errorSolicitud) => {
      if (activo) setError(mensajeError(errorSolicitud));
    }).finally(() => {
      if (activo) setCargando(false);
    });

    return () => {
      activo = false;
    };
  }, [token]);

  const nombreEps = usuario?.eps || INFO_PANEL.epsPredeterminada;

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
    cargando,
    error,
    darkMode,
    handleToggleDarkMode,
    handleAyuda
  };
}
