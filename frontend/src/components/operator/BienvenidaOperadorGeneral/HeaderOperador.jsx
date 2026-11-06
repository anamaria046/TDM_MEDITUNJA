// Subcomponente Barra Superior (Header) del Operador General
// MediTunja - Código estructurado en HTML semántico dentro de JSX

import { Moon } from "lucide-react";
import styles from "./BienvenidaOperadorGeneral.module.css";

function HeaderOperador({ rol, sedeOperativa, darkMode, onToggleDarkMode }) {
  return (
    <header className={styles.headerOperador} aria-label="Cabecera superior del operador general">
      <div className={styles.infoEntidad}>
        <span className={styles.rolEtiqueta}>{rol}</span>
        <h2 className={styles.nombreEntidad}>{sedeOperativa}</h2>
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

export default HeaderOperador;
