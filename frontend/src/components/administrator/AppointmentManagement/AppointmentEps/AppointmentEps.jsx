import { useState } from "react";
import ModifyAppointment from "../ModifyAppointment/ModifyAppointment.jsx";
import CancelAppointment from "../CancelAppointment/CancelAppointment.jsx";
import styles from "./AppointmentEps.module.css";

const citasEjemplo = [
    {
        id: 1,
        paciente: "María Pérez",
        documento: "C.C. 1.049.284.301",
        correo: "maria@gmail.com",
        especialidad: "Medicina general",
        ips: "IPS Central",
        fecha: "12 nov. 2026",
        hora: "08:00 a. m.",
        estado: "Confirmada"
    }
];

function AppointmentEps({ citas = citasEjemplo }) {
    const [modalActivo, setModalActivo] = useState(null);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);

    const abrirModal = (tipo, cita) => {
        setCitaSeleccionada(cita);
        setModalActivo(tipo);
    };

    const cerrarModal = () => {
        setModalActivo(null);
        setCitaSeleccionada(null);
    };

    return (
        <section className={styles.container}>
            <div className={styles.list}>
                {citas.map((cita) => (
                    <article className={styles.Appointment} key={cita.id}>
                        <div className={styles.patient}>
                            <h3>{cita.paciente}</h3>
                        </div>

                        <div className={styles.document}>
                            <span>{cita.documento}</span>
                        </div>

                        <div className={styles.email}>
                            <span>{cita.correo}</span>
                        </div>

                        <div className={styles.details}>
                            <span>{cita.especialidad}</span>
                            <span>{cita.ips}</span>
                        </div>

                        <div className={styles.schedule}>
                            <span>{cita.fecha}</span>
                            <span>{cita.hora}</span>
                        </div>

                        <span className={`${styles.status} ${
                            styles[cita.estado.toLowerCase()]
                        }`}>
                            {cita.estado}
                        </span>

                        <button
                            type="button"
                            className={styles.Modify}
                            onClick={() => abrirModal("modificar", cita)}
                        >
                            Modificar
                        </button>
                        <button
                            type="button"
                            className={styles.cancel}
                            onClick={() => abrirModal("cancelar", cita)}
                        >
                            Cancelar
                        </button>
                    </article>
                ))}
            </div>

            {modalActivo === "modificar" && (
                <ModifyAppointment
                    cita={citaSeleccionada}
                    onClose={cerrarModal}
                />
            )}

            {modalActivo === "cancelar" && (
                <CancelAppointment
                    cita={citaSeleccionada}
                    onClose={cerrarModal}
                />
            )}
        </section>
    );
}

export default AppointmentEps;