function ModifyAppointment() {
    return (
        <section>
            <h3>Modificar Cita de Afiliado (EPS Sura)</h3>
            <p>
                <strong>Cita:</strong>| <strong>Afiliado:</strong> Juan Andrés Pérez | <strong>Convenio:</strong> Plan Contributivo Sura
            </p>

            <form>
                <div>
                    <div>
                        <label htmlFor="admin-ips">Reasignar a IPS en Convenio:</label>
                        <br />
                        <select id="admin-ips" name="ips">
                            <option value="">IPS</option>
                            <option value="IPS"></option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="admin-fecha">Nueva Fecha:</label>
                        <br />
                        <input type="date" id="admin-fecha" name="fecha" defaultValue="2026-11-12" required />
                    </div>

                    <div>
                        <label htmlFor="admin-hora">Horario de Atención:</label><br />
                        <select id="admin-hora" name="hora" defaultValue="09:00">
                            <option value="08:00">08:00 AM</option>
                            <option value="09:00">09:00 AM</option>
                            <option value="10:30">10:30 AM</option>
                        </select>
                    </div>

                </div>

                <div>
                    <label htmlFor="admin-motivo-mod">Justificación Administrativa de EPS:</label>
                    <br />
                    <textarea 
                        id="admin-motivo-mod" 
                        name="motivo" 
                        rows="2" 
                        placeholder="Ej: Cambio de IPS por falta de agenda médica o solicitud de traslado del afiliado"
                    ></textarea>
                </div>

                <div>
                    <button type="submit">Confirmar Cambio por EPS</button>
                </div>
            </form>
        </section>
    );
}

export default ModifyAppointment