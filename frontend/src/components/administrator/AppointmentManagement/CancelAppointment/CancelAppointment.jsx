import { Ban } from "lucide-react";
import styles from "./cancelAppointment.module.css";

function CancelAppointment({ cita, onClose }) {
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.cancelform} role="dialog" aria-modal="true" aria-labelledby="cancel-appointment-title">
                <div className={styles.iconContainer}>
                    <Ban className={styles.icon} size={20} />
                </div>

                <h3 id="cancel-appointment-title">Cancelación de Cita</h3>
                <p>Estás a punto de anular la cita de <em>{cita?.paciente || "este afiliado"}</em>.</p>

                <form>
                    <div className={styles.group}>
                        <label htmlFor="motivo-cancelacion"><strong>Causa / Motivo de Cancelación:</strong></label>
                        <br />
                        <select id="motivo-cancelacion" name="motivoCancelacion" required>
                            <option value="">Seleccione el motivo de la cancelación</option>
                            <option value="incapacidad">Incapacidad médica del profesional de salud</option>
                            <option value="falla-sede">Falla técnica o mantenimiento en la sede / IPS</option>
                            <option value="solicitud-paciente">Solicitud directa del paciente vía telefónica/ventanilla</option>
                            <option value="no-disponibilidad">Incompatibilidad de agenda o sobrecupo detectado</option>
                            <option value="otro">Otro motivo administrativo</option>
                        </select>
                    </div>

                    <div className={styles.group}>
                        <label htmlFor="detalle-cancelacion">Observaciones adicionales:</label>
                        <br />
                        <textarea
                            id="detalle-cancelacion"
                            name="detalle"
                            rows="3"
                            placeholder="Escriba aquí detalles para el registro de auditoría..."
                        ></textarea>
                    </div>

                    <div className={styles.checkboxContainer}>
                        <input type="checkbox" id="reembolso" name="reembolso" className={styles.checkbox} defaultChecked />
                        <label htmlFor="reembolso"> Autorizar devolución o crédito de copago / tarifa particular al usuario</label>
                    </div>

                    <div className={styles.actions}>
                        <button className={styles.cancel} type="submit">Confirmar Cancelación</button>
                        <button className={styles.discard} onClick={onClose} type="button">Descartar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CancelAppointment