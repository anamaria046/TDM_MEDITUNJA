import logo from "../../../assets/logo.png";
import { NavLink } from "react-router-dom";
import { House, CalendarDays, FileText, UserRound, UsersRound, Handshake, Wallet } from "lucide-react";
import styles from "./NavbarAdminEPS.module.css";

function NavbarAdminEPS() {
    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <img src={logo} alt="Logo de MediTunja" />
                <span>MediTunja</span>
            </div>
            <ul className={styles.links}>
                <li>
                    <NavLink to="/admin" end className={({ isActive }) => isActive ? styles.active : styles.link}>
                        <House className={styles.mobileIcon} size={22} />Inicio
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/gestionUsuarios" className={({ isActive }) => isActive ? styles.active : styles.link}>
                        <UsersRound className={styles.mobileIcon} size={22} />Usuarios
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/gestionCitas" className={({ isActive }) => isActive ? styles.active : styles.link}>
                        <CalendarDays className={styles.mobileIcon} size={22} />Citas
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/resultados-administrador" className={({ isActive }) => isActive ? styles.active : styles.link}>
                        <FileText className={styles.mobileIcon} size={22} />Resultados
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/convenios" className={({ isActive }) => isActive ? styles.active : styles.link}>
                        <Handshake className={styles.mobileIcon} size={22} />Convenios
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/admin/recargas" className={({ isActive }) => isActive ? styles.active : styles.link}>
                        <Wallet className={styles.mobileIcon} size={22} />Recargar saldo
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/perfilAdministrador" className={({ isActive }) => isActive ? styles.active : styles.link}>
                        <UserRound className={styles.mobileIcon} size={22} />Perfil
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default NavbarAdminEPS;