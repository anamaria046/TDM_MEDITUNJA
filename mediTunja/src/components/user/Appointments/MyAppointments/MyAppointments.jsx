// src/components/citas/MisCitas.jsx
import { Link } from 'react-router-dom';

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
                    <th>Condición / Acciones</th>
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
                    <td>
                    <button type="button">Reprogramar</button>
                    <button type="button">Cancelar</button>
                    </td>
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

            {/* Cita 3: Cancelada */}
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

        <div>
            <strong>Condiciones de reprogramación y cancelación:</strong>
            <ul>
                <li>Puedes cancelar o reprogramar tu cita hasta con <strong>24 horas de anticipación</strong> sin costo.</li>
                <li>En caso de citas particulares canceladas a tiempo, el reembolso se procesa en 3 días hábiles.</li>
            </ul>
        </div>

        <p>
            <Link to="/ScheduleAppointments/ScheduleAppointments">Agendar una nueva cita</Link> | <Link to="/Catalog">Ver Catálogo de Servicios</Link>
        </p>
        </div>
    );
}

export default MyAppointments