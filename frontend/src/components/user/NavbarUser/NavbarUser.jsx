import logo from "../../../assets/logo.png";
import { NavLink } from "react-router-dom";
import { House, CalendarDays, MapPin, FileText, UserRound } from "lucide-react";
import { useAuth } from "../../../auth/useAuth.js";
import styles from "./NavbarUser.module.css";

function NavbarUser() {
    const { sesion } = useAuth();
    const afiliacionAprobada = sesion?.usuario?.estado_afiliacion === "aprobado";

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <img src={logo} alt="Logo de MediTunja" />
                <span>MediTunja</span>
            </div>
            <ul className={styles.links}>
                {afiliacionAprobada && (
                    <>
                        <li>
                            <NavLink to="/home" aria-current="page" className={({ isActive }) => isActive ? styles.active : styles.link}><House className={styles.mobileIcon} size={22} />Inicio</NavLink>
                        </li>
                        <li>
                            <NavLink to="/citas" className={({ isActive }) => isActive ? styles.active : styles.link}><CalendarDays className={styles.mobileIcon} size={22} />Agendar citas</NavLink>
                        </li>
                        <li>
                            <NavLink to="/mapa" className={({ isActive }) => isActive ? styles.active : styles.link}><MapPin className={styles.mobileIcon} size={22} />Mapa</NavLink>
                        </li>
                        <li>
                            <NavLink to="/resultados-procedimientos" className={({ isActive }) => isActive ? styles.active : styles.link}><FileText className={styles.mobileIcon} size={22} />Resultados</NavLink>
                        </li>
                    </>
                )}
                <li>
                    <NavLink to="/perfilUsuario" className={({ isActive }) => isActive ? styles.active : styles.link}><UserRound className={styles.mobileIcon} size={22} />Perfil</NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default NavbarUser;