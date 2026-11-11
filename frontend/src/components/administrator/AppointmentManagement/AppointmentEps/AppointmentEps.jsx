import { useEffect, useMemo, useState } from "react";
import { apiRequest, mensajeError } from "../../../../auth/api.js";
import { useAdminAuth } from "../../../../auth/useAdminAuth.js";
import Filter from "../../../Filter/Filter.jsx";
import ModifyAppointment from "../ModifyAppointment/ModifyAppointment.jsx";
import CancelAppointment from "../CancelAppointment/CancelAppointment.jsx";
import styles from "./AppointmentEps.module.css";

const nombresIps = {
    "san-rafael": "Hospital San Rafael de Tunja",
    "santiago-tunja": "E.S.E. Santiago de Tunja",
    "clinica-medilaser": "Clínica Medilaser",
    "clinica-andes": "Clínica Los Andes",
    "clinica-chia": "Clínica de Chía",
};

function AppointmentEps() {
    const { token } = useAdminAuth();
    const [citas, setCitas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [modalActivo, setModalActivo] = useState(null);
    const [citaSeleccionada, setCitaSeleccionada] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [errorOperacion, setErrorOperacion] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        let activa = true;
        apiRequest("/admin/citas", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((respuesta) => {
            if (activa) setCitas(respuesta.data);
        }).catch((errorSolicitud) => {
            if (activa) setError(mensajeError(errorSolicitud));
        }).finally(() => {
            if (activa) setCargando(false);
        });
        return () => {
            activa = false;
        };
    }, [token]);

    const citasVisibles = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase("es");
        return citas.filter((cita) => {
            const coincideBusqueda = !termino || [
                cita.paciente,
                cita.tipo_documento,
                cita.numero_documento,
                cita.correo,
                cita.codigo_cita,
                cita.especialidad,
                cita.ips,
            ].join(" ").toLocaleLowerCase("es").includes(termino);
            const coincideEstado = estadoFiltro === "todos" || cita.estado === estadoFiltro;
            return coincideBusqueda && coincideEstado;
        });
    }, [citas, busqueda, estadoFiltro]);

    function abrirModal(tipo, cita) {
        setCitaSeleccionada(cita);
        setModalActivo(tipo);
        setErrorOperacion("");
        setMensaje("");
    }

    function cerrarModal() {
        if (guardando) return;
        setModalActivo(null);
        setCitaSeleccionada(null);
        setErrorOperacion("");
    }

    async function ejecutarAccion(ruta, metodo, cuerpo, mensajeExito, actualizar) {
        setGuardando(true);
        setErrorOperacion("");
        try {
            await apiRequest(ruta, {
                method: metodo,
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(cuerpo),
            });
            setCitas((actuales) => actuales.map((cita) =>
                cita.id === citaSeleccionada.id ? actualizar(cita) : cita
            ));
            setMensaje(mensajeExito);
            setModalActivo(null);
            setCitaSeleccionada(null);
        } catch (errorSolicitud) {
            setErrorOperacion(mensajeError(errorSolicitud));
        } finally {
            setGuardando(false);
        }
    }

    function reprogramar(datos) {
        return ejecutarAccion(
            `/admin/citas/${citaSeleccionada.id}/reprogramar`,
            "PUT",
            datos,
            "Cita reprogramada correctamente.",
            (cita) => ({ ...cita, ips: datos.ips, fecha: datos.fecha, hora: datos.hora })
        );
    }

    function cancelar(datos) {
        return ejecutarAccion(
            `/admin/citas/${citaSeleccionada.id}/cancelar`,
            "PUT",
            datos,
            "Cita cancelada correctamente.",
            (cita) => ({ ...cita, estado: "cancelada" })
        );
    }

    return (
        <section className={styles.container}>
            <Filter
                id="citas-admin"
                searchValue={busqueda}
                onSearchChange={setBusqueda}
                searchLabel="Buscar citas"
                searchPlaceholder="Afiliado, documento, correo, código, IPS o especialidad"
                filterValue={estadoFiltro}
                onFilterChange={setEstadoFiltro}
                filterLabel="Estado"
                filterOptions={[
                    { value: "todos", label: "Todos los estados" },
                    { value: "confirmada", label: "Confirmadas" },
                    { value: "cancelada", label: "Canceladas" },
                ]}
            />
            {error && <p role="alert">{error}</p>}
            {mensaje && <p role="status">{mensaje}</p>}
            {cargando && <p role="status">Cargando citas de la EPS...</p>}
            {!cargando && !error && citasVisibles.length === 0 && (
                <p>No hay citas que coincidan con la búsqueda.</p>
            )}
            <div className={styles.list}>
                {citasVisibles.length > 0 && (
                    <div className={styles.listHeader}>
                        <span>Afiliado</span>
                        <span>Detalle de la cita</span>
                        <span>Fecha y hora</span>
                        <span>Estado</span>
                        <span>Acciones</span>
                    </div>
                )}
                {citasVisibles.map((cita) => (
                    <article className={styles.Appointment} key={cita.id}>
                        <div className={styles.patient}>
                            <h3>{cita.paciente || "Afiliado"}</h3>
                            <span className={styles.patientMeta}>
                                {cita.tipo_documento} {cita.numero_documento}
                            </span>
                            <span className={styles.patientMeta}>{cita.correo}</span>
                        </div>
                        <div className={styles.details}>
                            <span>{cita.especialidad}</span>
                            <span>{nombresIps[cita.ips] || cita.ips}</span>
                            <span className={styles.patientMeta}>Código: {cita.codigo_cita}</span>
                        </div>
                        <div className={styles.schedule}>
                            <span>{cita.fecha}</span>
                            <span>{cita.hora}</span>
                        </div>
                        <span className={`${styles.status} ${styles[cita.estado] || ""}`}>
                            {cita.estado === "confirmada" ? "Confirmada" : "Cancelada"}
                        </span>
                        <div className={styles.actions}>
                            {cita.estado === "confirmada" ? (
                                <>
                                <button type="button" className={styles.Modify} onClick={() => abrirModal("modificar", cita)}>
                                    Reprogramar
                                </button>
                                <button type="button" className={styles.cancel} onClick={() => abrirModal("cancelar", cita)}>
                                    Cancelar
                                </button>
                                </>
                            ) : <span>Sin acciones</span>}
                        </div>
                    </article>
                ))}
            </div>

            {modalActivo === "modificar" && (
                <ModifyAppointment
                    cita={citaSeleccionada}
                    enviando={guardando}
                    error={errorOperacion}
                    onSubmit={reprogramar}
                    onClose={cerrarModal}
                />
            )}
            {modalActivo === "cancelar" && (
                <CancelAppointment
                    cita={citaSeleccionada}
                    enviando={guardando}
                    error={errorOperacion}
                    onSubmit={cancelar}
                    onClose={cerrarModal}
                />
            )}
        </section>
    );
}

export default AppointmentEps;
