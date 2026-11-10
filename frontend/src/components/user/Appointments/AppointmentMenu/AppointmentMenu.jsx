import { NavLink } from "react-router-dom";
import styles from "./AppointmentMenu.module.css";

function AppointmentMenu({ cantidadCitas = 3 }) {
    return (
        <nav className={styles.menu}>

            <NavLink
                to="/citas"
                className={({ isActive }) =>
                    `${styles.menuButton} ${isActive ? styles.active : ""}`
                }
            >
                Agendar nueva cita
            </NavLink>

            <NavLink
                to="/mis-citas"
                className={({ isActive }) =>
                    `${styles.menuButton} ${isActive ? styles.active : ""}`
                }
            >
                Mis citas

                <span className={styles.badge}>
                    {cantidadCitas}
                </span>
            </NavLink>

        </nav>
    );
}

export default AppointmentMenu;