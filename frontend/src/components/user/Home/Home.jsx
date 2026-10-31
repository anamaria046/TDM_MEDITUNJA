import { Link } from "react-router-dom";
import {
    CalendarPlus,
    CirclePlay,
    FileText,
    ShieldCheck,
} from "lucide-react";
import Logo from "../../../assets/Logo.png";
import styles from "./Home.module.css";

function Home() {
    return (
        <div className={styles.home}>
            <header className={styles.header}>
                <Link to="/home" className={styles.brand} aria-label="MediTunja, inicio">
                    <img src={Logo} alt="" />
                    <span>MediTunja</span>
                </Link>

                <nav className={styles.navigation} aria-label="Navegación principal">
                    <Link to="/home" className={styles.activeLink} aria-current="page">Inicio</Link>
                    <Link to="/citas">Agendar citas</Link>
                    <Link to="/mapa">Mapa de ubicaciones</Link>
                    <Link to="/resultados-procedimientos">Resultados</Link>
                    <Link to="/perfilUsuario">Perfil</Link>
                </nav>
            </header>

            <main className={styles.main}>
                <section className={styles.welcome} aria-labelledby="home-title">
                    <div className={styles.welcomeCopy}>
                        <span className={styles.eyebrow}>PÁGINA DE INICIO</span>
                        <h1 id="home-title">Hola, paciente. Bienvenido de nuevo</h1>
                        <p>Gestiona tu salud de forma simple, rápida y segura.</p>
                    </div>
                    <div className={styles.securityBadge}>
                        <span className={styles.securityIcon}><ShieldCheck size={25} /></span>
                        <span>
                            <strong>Cuenta verificada</strong>
                            <small>Datos protegidos</small>
                        </span>
                    </div>
                </section>

                <section className={styles.dashboard} aria-label="Accesos de MediTunja">
                    <article className={styles.tutorialCard}>
                        <span className={styles.tutorialEyebrow}>RECORRIDO POR LA PLATAFORMA</span>
                        <h2>Conoce todo lo que puedes hacer en MediTunja</h2>
                        <p>
                            Aprende a agendar citas, consultar resultados y encontrar
                            nuestras sedes con un recorrido breve.
                        </p>
                        <Link to="/citas" className={styles.tutorialButton}>
                            <span className={styles.playIcon}><CirclePlay size={22} /></span>
                            Iniciar tutorial guiado
                        </Link>
                    </article>

                    <div className={styles.quickLinks}>
                        <Link to="/citas" className={styles.actionCard}>
                            <span className={`${styles.actionIcon} ${styles.purpleIcon}`}>
                                <CalendarPlus size={27} />
                            </span>
                            <span className={styles.actionText}>
                                <strong>Agendar cita</strong>
                                <small>Elige especialidad y horario</small>
                            </span>
                        </Link>

                        <Link to="/resultados-procedimientos" className={styles.actionCard}>
                            <span className={`${styles.actionIcon} ${styles.aquaIcon}`}>
                                <FileText size={27} />
                            </span>
                            <span className={styles.actionText}>
                                <strong>Ver resultados</strong>
                                <small>Consulta tus exámenes</small>
                            </span>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;
