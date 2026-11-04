import logo from "../../../assets/logo.png";
import { NavLink } from "react-router-dom";
import { House, CalendarDays, FileText, UserRound, UsersRound } from "lucide-react";
import { useAdminAuth } from "../../../auth/useAdminAuth.js";
import styles from "../../user/NavbarUser/NavbarUser.module.css";

function NavbarAdminEPS() {
    const { usuario } = useAdminAuth();

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <img src={logo} alt="Logo de MediTunja" />
                <span>MediTunja</span>
            </div>
            <ul className={styles.links}>
                <li>
                    <NavLink to="/gestionUsuarios" className={({ isActive }) => isActive ? styles.active : styles.link}><House className={styles.mobileIcon} size={22} />Inicio</NavLink>
                </li>
                <li>
                    <NavLink to="/gestionUsuarios" className={({ isActive }) => isActive ? styles.active : styles.link}><UsersRound className={styles.mobileIcon} size={22} />Usuarios</NavLink>
                </li>
                <li>
                    <NavLink to="/gestionCitas" className={({ isActive }) => isActive ? styles.active : styles.link}><CalendarDays className={styles.mobileIcon} size={22} />Citas</NavLink>
                </li>
                <li>
                    <NavLink to="/convenios" className={({ isActive }) => isActive ? styles.active : styles.link}>Convenios</NavLink>
                </li>
                <li>
                    <NavLink to="/resultados-administrador" className={({ isActive }) => isActive ? styles.active : styles.link}><FileText className={styles.mobileIcon} size={22} />Resultados</NavLink>
                </li>
                <li>
                    <NavLink to="/perfilAdministrador" className={({ isActive }) => isActive ? styles.active : styles.link} aria-label={`Perfil de ${usuario?.eps || "administrador"}`}><UserRound className={styles.mobileIcon} size={22} />Perfil</NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default NavbarAdminEPS;