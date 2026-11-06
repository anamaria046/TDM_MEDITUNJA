// Componente Principal de Bienvenida del Operador General del Sistema
// MediTunja - Maquetación y estructura HTML semántica en JSX
// Guiado bajo el patrón modular del Módulo de Pagos (separación en data, hooks y subcomponentes)

import styles from "./BienvenidaOperadorGeneral.module.css";
import { useBienvenidaOperador } from "./hooks/useBienvenidaOperador.js";
import SidebarOperador from "./SidebarOperador.jsx";
import HeaderOperador from "./HeaderOperador.jsx";
import MetricasOperador from "./MetricasOperador.jsx";

function BienvenidaOperadorGeneral() {
  const {
    infoPanel,
    menuItems,
    metricas,
    darkMode,
    handleToggleDarkMode,
    handleAyuda
  } = useBienvenidaOperador();

  return (
    <div
      className={`${styles.moduloBienvenidaOperador} ${
        darkMode ? styles.modoOscuro : ""
      }`}
    >
      {/* 1. Barra Lateral de Navegación Operativa (Sidebar) */}
      <SidebarOperador menuItems={menuItems} />

      {/* 2. Área Central / Contenedor de la Vista Operativa */}
      <div className={styles.contenedorAreaTrabajo}>
        {/* Cabecera Superior */}
        <HeaderOperador
          rol={infoPanel.rol}
          sedeOperativa={infoPanel.sedeOperativa}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

        {/* Contenido Principal con Métricas Operativas */}
        <main className={styles.contenidoPrincipal}>
          <MetricasOperador
            badge={infoPanel.badgeSeccion}
            titulo={infoPanel.tituloPrincipal}
            subtitulo={infoPanel.subtitulo}
            metricas={metricas}
          />
        </main>

        {/* Botón Flotante de Soporte y Ayuda */}
        <button
          type="button"
          className={styles.btnAyudaFlotante}
          onClick={handleAyuda}
          aria-label="Abrir centro de soporte técnico operativo"
          title="Soporte y Ayuda Operativa"
        >
          ?
        </button>
      </div>
    </div>
  );
}

export default BienvenidaOperadorGeneral;
