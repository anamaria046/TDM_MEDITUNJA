import { Link } from "react-router-dom";
import { CalendarPlus, FileText, ShieldCheck } from "lucide-react";
import { useAuth } from "../../../auth/useAuth.js";
import styles from "./HomeDashboard.module.css";

function HomeDashboard() {
    const { sesion } = useAuth();
    const usuario = sesion?.usuario;
    const nombre = [usuario?.nombres || usuario?.nombre, usuario?.apellidos]
        .filter(Boolean)
        .join(" ")
        .trim() || "paciente";

    return (
        <div className={styles.home}>
            <main className={styles.main}>
                <section className={styles.welcome} aria-labelledby="home-title">
                    <div className={styles.welcomeCopy}>
                        <span className={styles.eyebrow}>BIENVENIDO A MEDITUNJA</span>
                        <h1 id="home-title">Hola, {nombre}</h1>
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

export default HomeDashboard;
