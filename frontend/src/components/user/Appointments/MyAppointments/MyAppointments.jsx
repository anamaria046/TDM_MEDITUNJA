import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../../../auth/api.js";

import styles from "./MyAppointments.module.css";

const ipsNombres = {
    "san-rafael": "Hospital San Rafael de Tunja",
    "santiago-tunja": "E.S.E Santiago de Tunja",
    "clinica-medilaser": "Clínica Medilaser",
    "clinica-andes": "Clínica los Andes",
    "clinica-chia": "Clínica de Chía S.A",
};

function esCancelable(cita) {
    const instante = new Date(`${cita.fecha}T${cita.hora}:00-05:00`).getTime();
    return instante - Date.now() > 24 * 60 * 60 * 1000;
}

function MyAppointments() {
    const { sesion } = useAuth();
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [cancelando, setCancelando] = useState(null);

    useEffect(() => {
        let activa = true;
        async function cargarCitas() {
            if (!sesion?.accessToken) {
                setCitas([]);
                return;
            }
            setCargando(true);
            setError("");
            try {
                const respuesta = await apiRequest("/citas", {
                    headers: { Authorization: `Bearer ${sesion.accessToken}` },
                });
                if (activa) setCitas(respuesta.data);
            } catch (errorSolicitud) {
                if (activa) setError(mensajeError(errorSolicitud));
            } finally {
                if (activa) setCargando(false);
            }
        }

        cargarCitas();
        window.addEventListener("citas-actualizadas", cargarCitas);
        return () => {
            activa = false;
            window.removeEventListener("citas-actualizadas", cargarCitas);
        };
    }, [sesion]);

    async function cancelar(cita) {
        if (!window.confirm(`¿Deseas cancelar la cita ${cita.codigo_cita}?`)) return;
        setError("");
        setCancelando(cita.id_cita);
        try {
            await apiRequest(`/citas/${cita.id_cita}/cancelar`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${sesion.accessToken}` },
            });
            window.dispatchEvent(new Event("citas-actualizadas"));
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setCancelando(null);
        }
    }

    if (!sesion) {
        return (
            <section>
                <h2>Mis citas</h2>
                <p><Link to="/login">Inicia sesión</Link> para consultar tus citas.</p>
            </section>
        );
    }
    
    return (
        <section className={styles.container}>
            {error && (
                <p className={styles.error} role="alert">
                    {error}
                </p>
            )}

            {cargando && (
                <p className={styles.message} role="status">
                    Cargando tus citas...
                </p>
            )}

            {!cargando && !error && citas.length === 0 && (
                <p className={styles.message}>
                    No tienes citas registradas.
                </p>
            )}

            {!cargando && citas.length > 0 && (
                <div className={styles.appointmentsList}>
                    {citas.map((cita) => {
                        const cancelable =
                            cita.estado === "confirmada" &&
                            esCancelable(cita);
                        return (
                            <article
                                className={styles.appointmentCard}
                                key={cita.id_cita}
                            >
                                <div className={styles.iconContainer}>
                                    <CalendarDays size={25} />
                                </div>

                                <div className={styles.appointmentInfo}>

                                    <div className={styles.titleRow}>
                                        <h3>{cita.especialidad}</h3>

                                        <span className={`${styles.status} ${styles[cita.estado.toLowerCase()] || ""}`}>
                                            {cita.estado}
                                        </span>
                                    </div>

                                    <p className={styles.schedule}>
                                        {cita.codigo_cita} · {cita.fecha} · {cita.hora}
                                    </p>

                                    <p className={styles.ips}>
                                        {ipsNombres[cita.ips] || cita.ips}
                                    </p>

                                    <div className={styles.extraInfo}>
                                        <span>
                                            {cita.modalidad === "telemedicina"
                                                ? "Telemedicina"
                                                : "Presencial"}
                                        </span>

                                        <span>
                                            Costo: {(cita.costo ?? 0).toLocaleString("es-CO")} COP
                                        </span>

                                        <span>
                                            Descuento: {(cita.descuento_aplicado ?? 0).toLocaleString("es-CO")} COP
                                        </span>
                                    </div>

                                </div>

                                <div className={styles.actions}>

                                    {cancelable ? (
                                        <button
                                            type="button"
                                            className={styles.cancel}
                                            onClick={() => cancelar(cita)}
                                            disabled={cancelando === cita.id_cita}
                                        >
                                            {cancelando === cita.id_cita
                                                ? "Cancelando..."
                                                : "Cancelar"}
                                        </button>
                                    ) : cita.estado === "confirmada" ? (
                                        <small className={styles.noCancelable}>
                                            No cancelable: faltan 24 horas o menos.
                                        </small>
                                    ) : (
                                        <span className={styles.noActions}>
                                            Sin acciones
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );

}

export default MyAppointments;
