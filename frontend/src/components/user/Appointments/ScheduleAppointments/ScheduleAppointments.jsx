import { Link } from "react-router-dom";

function ScheduleAppointment() {
    return (
        <div>
            <h2>Reserva de Cita Médica</h2>

            <form>
                <fieldset>
                    <legend>1. Servicio e Institución (IPS)</legend>

                    <div>
                        <label htmlFor="ips">1. Seleccione la IPS</label>
                        <select id="ips" name="ips">
                            <option value="san-rafael">Hospital San Rafael de Tunja</option>
                            <option value="santiago-tunja">E.S.E Santiago de Tunja</option>
                            <option value="clinica-medilaser">Clínica Medilaser</option>
                            <option value="clinica-andes">Clínica los Andes</option>
                            <option value="clinica-chia">Clínica de Chía S.A</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="servicio">2. Servicio disponible en esta IPS:</label>
                        <select id="servicio" name="servicio">
                            <option value="cardio">Cardiología</option>
                            <option value="radio">Radiología</option>
                        </select>
                        <small>
                            * Los servicios listados cambian según la IPS elegida arriba.
                        </small>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>2. Fecha y Horario en Agenda</legend>

                    <div>
                        <label htmlFor="fecha">Fecha Deseada:</label>
                        <input type="date" id="fecha" name="fecha" required />
                    </div>

                    <div>
                        <label>Horarios Disponibles en la IPS seleccionada:</label>
                        <div>
                            <input type="radio" name="horario" value="08:00" />
                            <label htmlFor="h1"> 08:00 AM (Cupo Disponible)</label>
                        </div>
                        <div>
                            <input type="radio" name="horario" value="09:30" />
                            <label htmlFor="h2"> 09:30 AM (Cupo Disponible)</label>
                        </div>
                        <div>
                            <input type="radio" name="horario" value="11:00" disabled />
                            <label htmlFor="h3"> 11:00 AM (Agotado / No disponible)</label>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>3. Resumen y Costos Aplicables</legend>
                    <p>
                        <strong>Modalidad:</strong> Particular
                    </p>
                    <p>
                        <strong>Valor del Servicio:</strong> $120.000 COP
                    </p>
                    <p>
                        <strong>Descuento / Cobertura:</strong> $0 COP
                    </p>
                    <hr />
                    <p>
                        <strong>Total a Pagar:</strong> $120.000 COP
                    </p>
                    <small>El pago se gestionará en el siguiente paso o en taquilla de la IPS.</small>
                </fieldset>

                <button type="submit">Confirmar Solicitud de Cita</button>
            </form>

            <section>
                <h4>Estado de la Solicitud (Simulación de Confirmación):</h4>
                <p>
                    <strong>¡Cita Confirmada con Éxito!</strong>
                </p>
                <p>
                    <strong>Código de Cita:</strong> CITA-2026-9812
                </p>
                <p>
                    <strong>Comprobación:</strong> Horario verificado en la agenda sin duplicados.
                </p>
            </section>
        </div>
    );
}

export default ScheduleAppointment