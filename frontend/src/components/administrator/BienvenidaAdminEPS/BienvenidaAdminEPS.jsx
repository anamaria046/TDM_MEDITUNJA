// Componente Principal de Bienvenida Admin EPS
// MediTunja - Maquetación y estructura HTML semántica en JSX
// Guiado bajo el patrón modular del Módulo de Pagos (separación en data, hooks y subcomponentes)

import styles from "./BienvenidaAdminEPS.module.css";
import { useBienvenidaAdmin } from "./hooks/useBienvenidaAdmin.js";
import HeaderAdmin from "./HeaderAdmin.jsx";
import MetricasAdmin from "./MetricasAdmin.jsx";

function BienvenidaAdminEPS() {
  const {
    nombreEps,
    infoPanel,
    metricas,
    cargando,
    error,
    darkMode,
    handleToggleDarkMode,
    handleAyuda
  } = useBienvenidaAdmin();

  return (
    <div
      className={`${styles.moduloBienvenidaAdmin} ${
        darkMode ? styles.modoOscuro : ""
      }`}
    >
      {/* Área de trabajo del panel */}
      <div className={styles.contenedorAreaTrabajo}>
        {/* Cabecera Superior */}
        <HeaderAdmin
          rol={infoPanel.rol}
          nombreEps={nombreEps}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
        />

        {/* Contenido Principal con Métricas */}
        <main className={styles.contenidoPrincipal}>
          <MetricasAdmin
            badge={infoPanel.badgeSeccion}
            titulo={infoPanel.tituloPrincipal}
            subtitulo={infoPanel.subtitulo}
            metricas={metricas}
            cargando={cargando}
            error={error}
          />
        </main>

        {/* Botón Flotante de Ayuda */}
        <button
          type="button"
          className={styles.btnAyudaFlotante}
          onClick={handleAyuda}
          aria-label="Abrir ayuda de la plataforma"
          title="Ayuda y Soporte"
        >
          ?
        </button>
      </div>
    </div>
  );
}

export default BienvenidaAdminEPS;
