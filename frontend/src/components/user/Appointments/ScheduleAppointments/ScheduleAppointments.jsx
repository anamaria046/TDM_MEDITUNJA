import { useState } from "react";
import styles from "./ScheduleAppointment.module.css";

function ScheduleAppointment() {
    const [selectTime, setSelectTime] = useState("");

    const schedules = [
        "08:00 AM",
        "08:30 AM",
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM"
    ];

    return (
        <div className={styles.appointmentContainer}>
            <section className={styles.form}>
                <form>
                    <fieldset>
                        <h3><span className={styles.Number}>1</span>Datos del paciente</h3>
                        <div className={styles.formGrid}> 
                            <div className={styles.formGroup}>
                                <label htmlFor="TipoDocumento">Tipo de documento</label>
                                <select id="TipoDocumento" name="TipoDocumento">
                                    <option>Cédula Ciudadana</option>
                                    <option>Cédula de Extranjeria</option>
                                    <option>Pasaporte</option>
                                    <option>Tarjeta de Identidad</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="NumeroDocumento">Número de documento</label>
                                <input type="number" id="NumeroDocumento" name="NumeroDocumento" />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="CorreoElectronico">Correo Electrónico</label>
                                <input type="email" id="CorreoElectronico" name="CorreoElectronico" />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="Telefono">Teléfono</label>
                                <input type="number" id="Telefono" name="Telefono" />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <h3><span className={styles.Number}>2</span>Información de la cita</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label htmlFor="especialidad">Especialidad</label>
                                <select id="especialidad" name="especialidad">
                                    <option>Cardiología</option>
                                    <option>Medicina General</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="TipoConsulta">Tipo de consulta</label>
                                <select id="TipoConsulta" name="TipoConsulta">
                                    <option>Primera vez</option>
                                    <option>Consulta</option>
                                    <option>Lectura de resultados</option>
                                    <option>Procedimiento</option> 
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="IPS">IPS</label>
                                <select id="IPS" name="IPS">
                                    <option>Hospital San Rafael de Tunja</option>
                                    <option>E.S.E Santiago de Tunja</option>
                                    <option>Clínica Medilaser</option>
                                    <option>Clínica los Andes</option> 
                                    <option>Clínica de Chía S.A</option>
                                </select>
                            </div >
                            <div className={styles.formGroup}>
                                <label htmlFor="fecha">Fecha</label>
                                <input type="date" id="fecha" name="fecha" />
                            </div>
                            <div className={styles.formGroup}>
                                <label htmlFor="entidad">Entidad</label>
                                <select id="entidad" name="entidad">
                                    <option>EPS</option>
                                    <option>Particular</option>
                                </select>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <h3><span className={styles.Number}>3</span> Horario</h3>
                        <div className={styles.formGrid}>
                            <div className={styles.gridHours}>

                                {schedules.map((hour) => (
                                    <button
                                        key={hour}
                                        type="button"
                                        className={
                                            selectTime === hour
                                                ? styles.select
                                                : styles.hour
                                        }
                                        onClick={() => setSelectTime(hour)}
                                    >
                                        {hour}
                                    </button>
                                ))}

                            </div>
                        </div>
                    </fieldset>
                </form>
            </section>

            <section className={styles.summary}>
                <div className={styles.summaryContainer}>
                    <h4>Resumen de tu cita</h4>
                    <span>Especialidad</span>
                    <hr className={styles.divider}></hr>
                    <div className={styles.summaryDetails}>
                        <div>
                            <span>IPS</span>
                            <strong>Hola</strong>
                        </div>

                        <div>
                            <span>Fecha</span>
                            <strong>Hola</strong>
                        </div>

                        <div>
                            <span>Hora</span>
                            <strong>Hola</strong>
                        </div>
                    </div>

                    <button type="button">
                        Confirmar cita
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ScheduleAppointment;
