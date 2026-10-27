function MyAppointments() {
    return (
        <div>
            <h2>Mis citas</h2>
            <p>Aquí puedes consultar el estado de tus citas, cancelarlas o reprogramarlas.</p>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Cód. Cita</th>
                        <th>Servicio</th>
                        <th>IPS Prestadora</th>
                        <th>Fecha y Hora</th>
                        <th>Modalidad</th>
                        <th>Estado</th>
                        <th>Condición</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>#9812</strong></td>
                        <td>Cardiología</td>
                        <td>Hospital San Rafael</td>
                        <td>2026-11-10 08:00 AM</td>
                        <td>Presencial</td>
                        <td><span>Confirmada</span></td>
                    </tr>

                    <tr>
                        <td><strong>#8745</strong></td>
                        <td>Medicina General</td>
                        <td>Clinica Chia</td>
                        <td>2026-10-25 09:00 AM</td>
                        <td>Telemedicina</td>
                        <td><span>Próxima a iniciar</span></td>
                        <td>
                            <small>No cancelable (Faltan menos de 24h)</small>
                        </td>
                    </tr>

                <tr>
                    <td><strong>#7411</strong></td>
                    <td>Odontología</td>
                    <td>Clinica Chia</td>
                    <td>2026-09-15 14:00 PM</td>
                    <td>Presencial</td>
                    <td><span>Cancelada</span></td>
                    <td>
                        <em>Sin acciones</em>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default MyAppointments