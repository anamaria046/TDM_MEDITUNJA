// Subcomponente Sidebar Lateral de Navegación del Operador General
// MediTunja - Código estructurado en HTML semántico dentro de JSX

import { NavLink } from "react-router-dom";
import { House, UsersRound, CalendarDays, Ambulance, AlertCircle } from "lucide-react";
import styles from "./BienvenidaOperadorGeneral.module.css";

function SidebarOperador({ menuItems }) {
  // Mapeo dinámico de iconos de lucide-react
  const renderIcono = (nombreIcono) => {
    switch (nombreIcono) {
      case "House":
        return <House className={styles.iconoMenu} size={20} aria-hidden="true" />;
      case "UsersRound":
        return <UsersRound className={styles.iconoMenu} size={20} aria-hidden="true" />;
      case "CalendarDays":
        return <CalendarDays className={styles.iconoMenu} size={20} aria-hidden="true" />;
      case "Ambulance":
        return <Ambulance className={styles.iconoMenu} size={20} aria-hidden="true" />;
      case "AlertCircle":
        return <AlertCircle className={styles.iconoMenu} size={20} aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <aside className={styles.sidebarOperador} aria-label="Navegación lateral del operador general">
      {/* 1. Cabecera del Brand / Logo */}
      <div className={styles.brandContenedor}>
        <div className={styles.avatarLogo} aria-hidden="true">
          <span>M</span>
        </div>
        <div className={styles.brandTexto}>
          <strong className={styles.nombreMarca}>MediTunja</strong>
          <span className={styles.subtituloMarca}>Operador General</span>
        </div>
      </div>

      {/* 2. Menú de navegación operativa */}
      <nav className={styles.navSidebar} aria-label="Menú principal de operaciones">
        <ul className={styles.listaMenu}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.itemMenu}>
              <NavLink
                to={item.ruta}
                className={({ isActive }) =>
                  `${styles.enlaceMenu} ${
                    isActive || item.activo ? styles.enlaceMenuActivo : ""
                  }`
                }
                title={`Ir a ${item.label}`}
              >
                {renderIcono(item.icono)}
                <span className={styles.textoMenu}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default SidebarOperador;
