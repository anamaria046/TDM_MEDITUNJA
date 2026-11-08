import { SquarePen } from "lucide-react";
import styles from "./modifyAppointment.module.css";

const ipsDisponibles = [
    ["san-rafael", "Hospital San Rafael de Tunja"],
    ["santiago-tunja", "E.S.E. Santiago de Tunja"],
    ["clinica-medilaser", "Clínica Medilaser"],
    ["clinica-andes", "Clínica Los Andes"],
    ["clinica-chia", "Clínica de Chía"],
];

const horarios = ["08:00", "09:30", "11:00"];

function fechaHoyColombia() {
    return new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

function ModifyAppointment({ cita, enviando, error, onSubmit, onClose }) {
    function enviar(event) {
        event.preventDefault();
        const datos = new FormData(event.currentTarget);
        onSubmit({
            ips: datos.get("ips"),
            fecha: datos.get("fecha"),
            hora: datos.get("hora"),
            motivo: datos.get("motivo").trim(),
        });
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modifyForm} role="dialog" aria-modal="true" aria-labelledby="modify-appointment-title">
                <div className={styles.iconContainer}>
                    <SquarePen className={styles.icon} size={20} />
                </div>

                <h3 id="modify-appointment-title">Modificar Cita</h3>
                <p>
                    <strong>Cita: </strong> {cita?.codigo_cita} | <strong> Afiliado: </strong> {cita?.paciente}
                </p>

                <form onSubmit={enviar}>
                    <div className={styles.group}>
                        <label htmlFor="admin-ips">Reasignar a IPS en Convenio:</label>
                        <select id="admin-ips" name="ips" defaultValue={cita?.ips} required>
                            {ipsDisponibles.map(([id, nombre]) => (
                                <option key={id} value={id}>{nombre}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="admin-fecha">Nueva Fecha:</label>
                        <input type="date" id="admin-fecha" name="fecha" defaultValue={cita?.fecha} min={fechaHoyColombia()} required />
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="admin-hora">Horario de Atención:</label>
                        <select id="admin-hora" name="hora" defaultValue={cita?.hora} required>
                            {horarios.map((hora) => <option key={hora} value={hora}>{hora}</option>)}
                        </select>
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="admin-motivo-mod">Justificación Administrativa de EPS:</label>
                        <br />
                        <textarea
                            id="admin-motivo-mod"
                            name="motivo"
                            rows="2"
                            placeholder="Ej: Cambio de IPS por falta de agenda médica o solicitud de traslado del afiliado"
                            maxLength={500}
                            required
                        ></textarea>
                    </div>

                    {error && <p role="alert">{error}</p>}
                    <div className={styles.actions}>
                        <button className={styles.modify} type="submit" disabled={enviando}>{enviando ? "Guardando..." : "Confirmar Cambio"}</button>
                        <button className={styles.discard} onClick={onClose} type="button" disabled={enviando}>Descartar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModifyAppointment