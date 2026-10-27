function CancelAppointment() {
    return (
        <section>
            <h3>Cancelación Administrativa de Cita</h3>
            <p>Estás a punto de anular la cita de <em>María Camila López</em>.</p>

            <form>
                <div>
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

                <div>
                    <label htmlFor="detalle-cancelacion">Observaciones adicionales:</label>
                    <br />
                    <textarea 
                        id="detalle-cancelacion" 
                        name="detalle" 
                        rows="3" 
                        placeholder="Escriba aquí detalles para el registro de auditoría..."
                    ></textarea>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <input type="checkbox" id="reembolso" name="reembolso" defaultChecked />
                    <label htmlFor="reembolso"> Autorizar devolución o crédito de copago / tarifa particular al usuario</label>
                </div>

                <button type="submit">Confirmar Cancelación Definitiva</button>
                <button type="button">Descartar</button>
            </form>
        </section>
    );
}

export default CancelAppointment