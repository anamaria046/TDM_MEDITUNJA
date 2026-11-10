import { useEffect, useState } from "react";
import { apiRequest, mensajeError } from "../../../../auth/api.js";
import { useAuth } from "../../../../auth/useAuth.js";
import styles from "./ScheduleAppointment.module.css";

const ipsDisponibles = [
    { id: "san-rafael", nombre: "Hospital San Rafael de Tunja" },
    { id: "santiago-tunja", nombre: "E.S.E. Santiago de Tunja" },
    { id: "clinica-medilaser", nombre: "Clínica Medilaser" },
    { id: "clinica-andes", nombre: "Clínica Los Andes" },
    { id: "clinica-chia", nombre: "Clínica de Chía" },
];

const serviciosDisponibles = [
    { id: "cardio", nombre: "Cardiología" },
    { id: "radio", nombre: "Radiología" },
];

function fechaHoyColombia() {
    return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function ScheduleAppointment() {
    const { sesion } = useAuth();
    const [ips, setIps] = useState(ipsDisponibles[0].id);
    const [servicio, setServicio] = useState(serviciosDisponibles[0].id);
    const [fecha, setFecha] = useState("");
    const [modalidad, setModalidad] = useState("presencial");
    const [hora, setHora] = useState("");
    const [disponibilidad, setDisponibilidad] = useState({ clave: "", horarios: [], error: "" });
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [actualizacion, setActualizacion] = useState(0);
    const claveDisponibilidad = fecha
        ? `${sesion?.accessToken}|${ips}|${fecha}|${actualizacion}`
        : "";
    const cargandoHorarios = Boolean(claveDisponibilidad) &&
        disponibilidad.clave !== claveDisponibilidad;
    const horarios = disponibilidad.clave === claveDisponibilidad
        ? disponibilidad.horarios
        : [];
    const errorDisponibilidad = disponibilidad.clave === claveDisponibilidad
        ? disponibilidad.error
        : "";

    useEffect(() => {
        let activa = true;
        if (!sesion?.accessToken || !fecha) return undefined;

        apiRequest(`/citas/disponibilidad?ips=${encodeURIComponent(ips)}&fecha=${encodeURIComponent(fecha)}`, {
            headers: { Authorization: `Bearer ${sesion.accessToken}` },
        }).then((respuesta) => {
            if (activa) setDisponibilidad({
                clave: claveDisponibilidad,
                horarios: respuesta.horarios,
                error: "",
            });
        }).catch((errorSolicitud) => {
            if (activa) setDisponibilidad({
                clave: claveDisponibilidad,
                horarios: [],
                error: mensajeError(errorSolicitud),
            });
        });

        return () => {
            activa = false;
        };
    }, [sesion?.accessToken, ips, fecha, actualizacion, claveDisponibilidad]);

    async function confirmarCita(event) {
        event.preventDefault();
        setError("");
        setMensaje("");
        setEnviando(true);

        try {
            const respuesta = await apiRequest("/citas", {
                method: "POST",
                headers: { Authorization: `Bearer ${sesion.accessToken}` },
                body: JSON.stringify({ ips, servicio, fecha, hora, modalidad }),
            });
            setMensaje(`${respuesta.mensaje} Código: ${respuesta.cita.codigo_cita}.`);
            setHora("");
            setActualizacion((valor) => valor + 1);
            window.dispatchEvent(new Event("citas-actualizadas"));
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
            setActualizacion((valor) => valor + 1);
        } finally {
            setEnviando(false);
        }
    }

    const ipsNombre = ipsDisponibles.find((opcion) => opcion.id === ips)?.nombre;
    const servicioNombre = serviciosDisponibles.find((opcion) => opcion.id === servicio)?.nombre;

    return (
        <div className={styles.appointmentContainer}>
            <section className={styles.form}>
                <form onSubmit={confirmarCita}>
                    <fieldset>
                        <h3><span className={styles.Number}>1</span>Información de la cita</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="especialidad">Servicio</label>
                                <select id="especialidad" value={servicio} onChange={(event) => setServicio(event.target.value)} required>
                                    {serviciosDisponibles.map((opcion) => (
                                        <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="ips">IPS</label>
                                <select id="ips" value={ips} onChange={(event) => {
                                    setIps(event.target.value);
                                    setHora("");
                                    setError("");
                                }} required>
                                    {ipsDisponibles.map((opcion) => (
                                        <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="fecha">Fecha</label>
                                <input
                                    type="date"
                                    id="fecha"
                                    value={fecha}
                                    min={fechaHoyColombia()}
                                    onChange={(event) => {
                                        setFecha(event.target.value);
                                        setHora("");
                                        setError("");
                                    }}
                                    required
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="modalidad">Modalidad</label>
                                <select id="modalidad" value={modalidad} onChange={(event) => setModalidad(event.target.value)}>
                                    <option value="presencial">Presencial</option>
                                    <option value="telemedicina">Telemedicina</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <h3><span className={styles.Number}>2</span>Horarios disponibles</h3>
                        {!fecha && <p>Selecciona una fecha para consultar la disponibilidad en tiempo real.</p>}
                        {cargandoHorarios && <p role="status">Consultando disponibilidad...</p>}
                        {errorDisponibilidad && <p role="alert">{errorDisponibilidad}</p>}
                        {!cargandoHorarios && fecha && horarios.length === 0 && !errorDisponibilidad && (
                            <p>No hay horarios disponibles para esta fecha.</p>
                        )}
                        <div className={styles.gridHours}>
                            {horarios.map((opcion) => (
                                <button
                                    key={opcion.hora}
                                    type="button"
                                    disabled={!opcion.disponible || cargandoHorarios}
                                    aria-pressed={hora === opcion.hora}
                                    className={hora === opcion.hora ? styles.select : styles.hour}
                                    onClick={() => setHora(opcion.hora)}
                                >
                                    {opcion.hora}
                                    {!opcion.disponible && <span className={styles.slotStatus}> · No disponible</span>}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                    {error && <p role="alert">{error}</p>}
                    {mensaje && <p role="status">{mensaje}</p>}
                </form>
            </section>

            <section className={styles.summary}>
                <div className={styles.summaryContainer}>
                    <h4>Resumen de tu cita</h4>
                    <span>{servicioNombre}</span>
                    <hr className={styles.divider} />
                    <div className={styles.summaryDetails}>
                        <div><span>IPS</span><strong>{ipsNombre}</strong></div>
                        <div><span>Fecha</span><strong>{fecha || "Selecciona una fecha"}</strong></div>
                        <div><span>Hora</span><strong>{hora || "Selecciona un horario"}</strong></div>
                        <div><span>Modalidad</span><strong>{modalidad === "telemedicina" ? "Telemedicina" : "Presencial"}</strong></div>
                    </div>
                    <button
                        type="button"
                        disabled={!fecha || !hora || cargandoHorarios || enviando}
                        onClick={confirmarCita}
                    >
                        {enviando ? "Agendando..." : "Confirmar cita"}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ScheduleAppointment;
