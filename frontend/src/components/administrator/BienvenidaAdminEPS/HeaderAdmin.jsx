// Subcomponente Barra Superior (Header) Admin EPS
// MediTunja - Código estructurado en HTML semántico dentro de JSX

import { Moon } from "lucide-react";
import styles from "./BienvenidaAdminEPS.module.css";

function HeaderAdmin({ rol, nombreEps, darkMode, onToggleDarkMode }) {
  return (
    <header className={styles.headerAdmin} aria-label="Cabecera superior del administrador">
      <div className={styles.infoEntidad}>
        <span className={styles.rolEtiqueta}>{rol}</span>
        <h2 className={styles.nombreEntidad}>{nombreEps}</h2>
      </div>

      <div className={styles.accionesHeader}>
        <button
          type="button"
          className={styles.btnModoOscuro}
          onClick={onToggleDarkMode}
          aria-label={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={darkMode ? "Modo Claro" : "Modo Oscuro"}
        >
          <Moon size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export default HeaderAdmin;
