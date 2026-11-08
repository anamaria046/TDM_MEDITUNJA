import { useEffect, useMemo, useState } from "react";
import { apiRequest, mensajeError } from "../../../auth/api.js";
import { useAdminAuth } from "../../../auth/useAdminAuth.js";
import styles from "./TransportRequests.module.css";

const etiquetas = {
    discapacidad: {
        "motora-silla-ruedas": "Movilidad reducida / silla de ruedas",
        "motora-andador": "Uso de caminador, andador o muletas",
        visual: "Discapacidad visual",
        auditiva: "Discapacidad auditiva",
        cognitiva: "Discapacidad cognitiva",
        multiple: "Discapacidad múltiple",
        "adulto-mayor": "Adulto mayor con dependencia funcional",
        "dialisis-oncologia": "Diálisis, oncología o postquirúrgico"
    },
    requerimientos: {
        rampa: "Rampa o elevador",
        anclaje: "Anclaje para silla de ruedas",
        "piso-bajo": "Vehículo de piso bajo",
        oxigeno: "Soporte para oxígeno",
        "perro-guia": "Perro guía",
        camilla: "Traslado en camilla"
    },
    modalidad: {
        "ida-y-regreso": "Ida y regreso",
        "solo-ida": "Solo ida",
        "solo-regreso": "Solo regreso"
    },
    estado: {
        solicitada: "Pendiente",
        aceptada: "Aceptada",
        rechazada: "Rechazada"
    }
};

function TransportRequests() {
    const { token } = useAdminAuth();
    const [solicitudes, setSolicitudes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [errorOperacion, setErrorOperacion] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [procesandoId, setProcesandoId] = useState(null);

    useEffect(() => {
        let activa = true;
        apiRequest("/admin/transporte", {
            headers: { Authorization: `Bearer ${token}` },
        }).then((respuesta) => {
            if (activa) setSolicitudes(respuesta.data);
        }).catch((errorSolicitud) => {
            if (activa) setError(mensajeError(errorSolicitud));
        }).finally(() => {
            if (activa) setCargando(false);
        });
        return () => {
            activa = false;
        };
    }, [token]);

    const solicitudesVisibles = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase("es");
        return solicitudes.filter((solicitud) =>
            !termino || [
                solicitud.paciente,
                solicitud.tipo_documento,
                solicitud.numero_documento,
                solicitud.codigo_cita,
                solicitud.id
            ].join(" ").toLocaleLowerCase("es").includes(termino)
        );
    }, [solicitudes, busqueda]);

    async function actualizarEstado(solicitud, estado) {
        setProcesandoId(solicitud.id);
        setErrorOperacion("");
        setMensaje("");
        try {
            const respuesta = await apiRequest(`/admin/transporte/${solicitud.id}/estado`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ estado })
            });
            setSolicitudes((actuales) => actuales.map((actual) =>
                actual.id === solicitud.id ? { ...actual, estado: respuesta.data.estado } : actual
            ));
            setMensaje(respuesta.mensaje);
        } catch (errorSolicitud) {
            setErrorOperacion(mensajeError(errorSolicitud));
        } finally {
            setProcesandoId(null);
        }
    }

    return (
        <section className={styles.container}>
            <label htmlFor="buscar-transporte">Buscar por afiliado, documento, cita o número de solicitud</label>
            <input
                id="buscar-transporte"
                type="search"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
            />
            {error && <p role="alert">{error}</p>}
            {errorOperacion && <p role="alert">{errorOperacion}</p>}
            {mensaje && <p role="status">{mensaje}</p>}
            <p className={styles.note}>
                Aceptar una solicitud confirma la disponibilidad operativa de la EPS; no asigna automáticamente un vehículo.
            </p>
            {cargando && <p role="status">Cargando solicitudes de transporte...</p>}
            {!cargando && !error && solicitudesVisibles.length === 0 && (
                <p>No hay solicitudes que coincidan con la búsqueda.</p>
            )}
            <div className={styles.list}>
                {solicitudesVisibles.map((solicitud) => {
                    const requerimientos = JSON.parse(solicitud.requerimientos);
                    return (
                        <article className={styles.card} key={solicitud.id}>
                            <header className={styles.cardHeader}>
                                <div>
                                    <h2>{solicitud.paciente || "Afiliado"}</h2>
                                    <p>Solicitud #{solicitud.id} · Cita {solicitud.codigo_cita}</p>
                                </div>
                                <span className={`${styles.status} ${styles[solicitud.estado]}`}>
                                    {etiquetas.estado[solicitud.estado] || solicitud.estado}
                                </span>
                            </header>
                            <dl className={styles.details}>
                                <div><dt>Documento</dt><dd>{solicitud.tipo_documento} {solicitud.numero_documento}</dd></div>
                                <div><dt>Contacto</dt><dd>{solicitud.email}</dd></div>
                                <div><dt>Cita</dt><dd>{solicitud.especialidad} · {solicitud.fecha} {solicitud.hora}</dd></div>
                                <div><dt>IPS</dt><dd>{solicitud.ips}</dd></div>
                                <div><dt>Necesidad de transporte</dt><dd>{etiquetas.discapacidad[solicitud.tipo_discapacidad] || solicitud.tipo_discapacidad}</dd></div>
                                <div><dt>Modalidad</dt><dd>{etiquetas.modalidad[solicitud.modalidad_viaje] || solicitud.modalidad_viaje}</dd></div>
                                <div><dt>Origen</dt><dd>{solicitud.direccion_origen}, {solicitud.barrio_sector}</dd></div>
                                <div><dt>Referencias</dt><dd>{solicitud.puntos_referencia || "Sin referencias adicionales"}</dd></div>
                                <div><dt>Acompañante</dt><dd>{solicitud.viaja_acompanante ? solicitud.nombre_acompanante : "No"}</dd></div>
                                <div className={styles.wide}><dt>Adaptaciones solicitadas</dt><dd>
                                    {requerimientos.length
                                        ? requerimientos.map((id) => etiquetas.requerimientos[id] || id).join(", ")
                                        : "Sin adaptaciones adicionales"}
                                </dd></div>
                            </dl>
                            {solicitud.estado === "solicitada" && (
                                <div className={styles.actions}>
                                    <button
                                        type="button"
                                        className={styles.accept}
                                        onClick={() => actualizarEstado(solicitud, "aceptada")}
                                        disabled={procesandoId !== null}
                                    >
                                        {procesandoId === solicitud.id ? "Guardando..." : "Aceptar solicitud"}
                                    </button>
                                    <button
                                        type="button"
                                        className={styles.reject}
                                        onClick={() => actualizarEstado(solicitud, "rechazada")}
                                        disabled={procesandoId !== null}
                                    >
                                        Rechazar solicitud
                                    </button>
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default TransportRequests;
