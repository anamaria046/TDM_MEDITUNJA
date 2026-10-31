import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../../../auth/api.js";

const ipsNombres = {
    "san-rafael": "Hospital San Rafael de Tunja",
    "santiago-tunja": "E.S.E Santiago de Tunja",
    "clinica-medilaser": "Clínica Medilaser",
    "clinica-andes": "Clínica los Andes",
    "clinica-chia": "Clínica de Chía S.A",
};

function esCancelable(cita) {
    const instante = new Date(`${cita.fecha}T${cita.hora}:00-05:00`).getTime();
    return instante - Date.now() > 24 * 60 * 60 * 1000;
}

function MyAppointments() {
    const { sesion } = useAuth();
    const [citas, setCitas] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState("");
    const [cancelando, setCancelando] = useState(null);

    useEffect(() => {
        let activa = true;
        async function cargarCitas() {
            if (!sesion?.accessToken) {
                setCitas([]);
                return;
            }
            setCargando(true);
            setError("");
            try {
                const respuesta = await apiRequest("/citas", {
                    headers: { Authorization: `Bearer ${sesion.accessToken}` },
                });
                if (activa) setCitas(respuesta.data);
            } catch (errorSolicitud) {
                if (activa) setError(mensajeError(errorSolicitud));
            } finally {
                if (activa) setCargando(false);
            }
        }

        cargarCitas();
        window.addEventListener("citas-actualizadas", cargarCitas);
        return () => {
            activa = false;
            window.removeEventListener("citas-actualizadas", cargarCitas);
        };
    }, [sesion]);

    async function cancelar(cita) {
        if (!window.confirm(`¿Deseas cancelar la cita ${cita.codigo_cita}?`)) return;
        setError("");
        setCancelando(cita.id_cita);
        try {
            await apiRequest(`/citas/${cita.id_cita}/cancelar`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${sesion.accessToken}` },
            });
            window.dispatchEvent(new Event("citas-actualizadas"));
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setCancelando(null);
        }
    }

    if (!sesion) {
        return (
            <section>
                <h2>Mis citas</h2>
                <p><Link to="/login">Inicia sesión</Link> para consultar tus citas.</p>
            </section>
        );
    }

    return (
        <section>
            <h2>Mis citas</h2>
            <p>Aquí puedes consultar el estado de tus citas y cancelar las que cumplan el plazo.</p>
            {error && <p role="alert">{error}</p>}
            {cargando && <p role="status">Cargando tus citas...</p>}
            {!cargando && !error && citas.length === 0 && <p>No tienes citas registradas.</p>}
            {citas.length > 0 && (
                <table border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Servicio</th>
                            <th>IPS</th>
                            <th>Fecha y hora</th>
                            <th>Modalidad</th>
                            <th>Costo</th>
                            <th>Descuento</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {citas.map((cita) => {
                            const cancelable = cita.estado === "confirmada" && esCancelable(cita);
                            return (
                                <tr key={cita.id_cita}>
                                    <td>{cita.codigo_cita}</td>
                                    <td>{cita.especialidad}</td>
                                    <td>{ipsNombres[cita.ips] || cita.ips}</td>
                                    <td>{cita.fecha} {cita.hora}</td>
                                    <td>{cita.modalidad === "telemedicina" ? "Telemedicina" : "Presencial"}</td>
                                    <td>{cita.costo.toLocaleString("es-CO")} COP</td>
                                    <td>{cita.descuento_aplicado.toLocaleString("es-CO")} COP</td>
                                    <td>{cita.estado}</td>
                                    <td>
                                        {cancelable ? (
                                            <button
                                                type="button"
                                                onClick={() => cancelar(cita)}
                                                disabled={cancelando === cita.id_cita}
                                            >
                                                {cancelando === cita.id_cita ? "Cancelando..." : "Cancelar"}
                                            </button>
                                        ) : cita.estado === "confirmada" ? (
                                            <small>No cancelable: faltan 24 horas o menos.</small>
                                        ) : (
                                            <span>Sin acciones</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </section>
    );
}

export default MyAppointments;
