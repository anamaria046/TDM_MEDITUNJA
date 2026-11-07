import { SquarePen } from "lucide-react";
import styles from "./modifyAppointment.module.css";

function ModifyAppointment({ cita, onClose }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modifyForm} role="dialog" aria-modal="true" aria-labelledby="modify-appointment-title">
                <div className={styles.iconContainer}>
                    <SquarePen className={styles.icon} size={20} />
                </div>

                <h3 id="modify-appointment-title">Modificar Cita</h3>
                <p>
                    <strong>Cita: </strong> {cita?.id} | <strong> Afiliado: </strong> {cita?.afiliado} | <strong> Convenio: </strong> {cita?.ips}
                </p>

                <form>
                    <div className={styles.group}>
                        <label htmlFor="admin-ips">Reasignar a IPS en Convenio:</label>
                        <br />
                        <select id="admin-ips" name="ips">
                            <option value="">IPS</option>
                            <option value="IPS"></option>
                        </select>
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="admin-fecha">Nueva Fecha:</label>
                        <br />
                        <input type="date" id="admin-fecha" name="fecha" defaultValue="2026-11-12" required />
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="admin-hora">Horario de Atención:</label><br />
                        <select id="admin-hora" name="hora" defaultValue="09:00">
                            <option value="08:00">08:00 AM</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="10:30">10:30 AM</option>
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
                        ></textarea>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.modify} type="submit">Confirmar Cambio</button>
                        <button className={styles.discard} onClick={onClose} type="button">Descartar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ModifyAppointment