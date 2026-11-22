import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl, apiRequest, mensajeError } from "../../../auth/api.js";
import { useAdminAuth } from "../../../auth/useAdminAuth.js";
import styles from "./UserGestor.module.css";

const etiquetasEstado = {
    pendiente: "Pendiente",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
};
const etiquetasCuenta = {
    activa: "Activa",
    inactiva: "Inactiva",
    sin_coincidencia: "Sin coincidencia",
};
const clasesEstado = {
    pendiente: styles.statusPendiente,
    aprobado: styles.statusAprobado,
    rechazado: styles.statusRechazado,
};

function UserGestor() {
    const { token, usuario } = useAdminAuth();
    const [solicitudesTunja, setSolicitudesTunja] = useState([]);
    const [errorTunja, setErrorTunja] = useState("");
    const [cargandoTunja, setCargandoTunja] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        let activo = true;
        apiRequest("/admin/solicitudes-afiliacion", {
            headers: { Authorization: "Bearer " + token },
        })
            .then((respuesta) => {
                if (activo) setSolicitudesTunja(respuesta.data);
            })
            .catch((error) => {
                if (activo) setErrorTunja(mensajeError(error));
            })
            .finally(() => {
                if (activo) setCargandoTunja(false);
            });

        return () => {
            activo = false;
        };
    }, [token]);

    const solicitudesVisibles = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase("es");
        return solicitudesTunja.filter((solicitud) => {
            const datos = [solicitud.nombres, solicitud.apellidos, solicitud.numero_documento, solicitud.email]
                .filter(Boolean).join(" ").toLocaleLowerCase("es");
            return datos.includes(termino) &&
                (estadoFiltro === "todos" || solicitud.estado_afiliacion === estadoFiltro);
        });
    }, [solicitudesTunja, busqueda, estadoFiltro]);

    async function actualizarEstadoSolicitud(solicitud, estado) {
        setMensaje("");
        const tipo = encodeURIComponent(solicitud.tipo_documento);
        const numero = encodeURIComponent(solicitud.numero_documento);
        try {
            await apiRequest(`/admin/solicitudes-afiliacion/${tipo}/${numero}/estado`, {
                method: "PUT",
                headers: { Authorization: "Bearer " + token },
                body: JSON.stringify({ estado }),
            });
            setSolicitudesTunja((actuales) =>
                actuales.map((actual) =>
                    actual.tipo_documento === solicitud.tipo_documento &&
                    actual.numero_documento === solicitud.numero_documento
                        ? { ...actual, estado_afiliacion: estado }
                        : actual,
                ),
            );
            setMensaje(`Solicitud ${etiquetasEstado[estado].toLocaleLowerCase("es")}.`);
        } catch (error) {
            setMensaje(mensajeError(error));
        }
    }

    async function descargarComprobante(solicitud) {
        setMensaje("");
        const tipo = encodeURIComponent(solicitud.tipo_documento);
        const numero = encodeURIComponent(solicitud.numero_documento);
        try {
            const response = await fetch(
                `${apiBaseUrl}/admin/solicitudes-afiliacion/${tipo}/${numero}/comprobante`,
                { headers: { Authorization: "Bearer " + token } },
            );
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.mensaje || "No fue posible descargar el comprobante.");
            }
            const url = URL.createObjectURL(await response.blob());
            const enlace = document.createElement("a");
            enlace.href = url;
            enlace.download = `comprobante-${solicitud.tipo_documento}-${solicitud.numero_documento}`;
            document.body.append(enlace);
            enlace.click();
            enlace.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            setMensaje(mensajeError(error));
        }
    }

    return (
        <main className={styles.userGestor}>
            <header className={styles.header}>
                <p className={styles.eyebrow}>MediTunja · Administración</p>
                <h1>Gestión de afiliados</h1>
                <p>Administra las solicitudes y datos de afiliados de {usuario.eps}.</p>
            </header>

            <aside className={styles.notice}>
                Los cambios se guardan en la base de datos y se limitan a la EPS asignada
                a tu cuenta.
            </aside>

            <section className={styles.panel} aria-labelledby="titulo-filtros">
                <h2 id="titulo-filtros">Buscar y filtrar afiliados</h2>
                <div className={styles.filters}>
                    <div className={`${styles.field} ${styles.fieldWide}`}>
                        <label htmlFor="busqueda-usuario">Nombre o número de documento</label>
                        <input
                            id="busqueda-usuario"
                            type="search"
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                            placeholder="Ej.: Valentina o 1000000001"
                        />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="filtro-estado">Estado de solicitud</label>
                        <select id="filtro-estado" value={estadoFiltro} onChange={(event) => setEstadoFiltro(event.target.value)}>
                            <option value="todos">Todos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="aprobado">Aprobados</option>
                            <option value="rechazado">Rechazados</option>
                        </select>
                    </div>
                </div>
            </section>

            {mensaje && <p className={styles.message} role="status">{mensaje}</p>}

            <section className={styles.panel} aria-labelledby="titulo-solicitudes-tunja">
                <div className={styles.listHeading}>
                    <div>
                        <h2 id="titulo-solicitudes-tunja">Afiliaciones de {usuario.eps}</h2>
                    </div>
                </div>
                {cargandoTunja ? (
                    <p role="status">Consultando cuentas en TunjaAPI…</p>
                ) : errorTunja ? (
                    <p role="alert">{errorTunja}</p>
                ) : solicitudesVisibles.length === 0 ? (
                    <p className={styles.empty}>No hay solicitudes de afiliación para esta EPS.</p>
                ) : (
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th scope="col">Afiliado</th>
                                    <th scope="col">Documento</th>
                                    <th scope="col">Comprobante</th>
                                    <th scope="col">Estado de afiliación</th>
                                    <th scope="col">Cuenta en TunjaAPI</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {solicitudesVisibles.map((solicitud) => (
                                    <tr key={`${solicitud.tipo_documento}-${solicitud.numero_documento}`}>
                                        <td>
                                            <strong>{solicitud.nombres} {solicitud.apellidos}</strong>
                                            <span className={styles.secondary}>{solicitud.email}</span>
                                        </td>
                                        <td>{solicitud.tipo_documento} {solicitud.numero_documento}</td>
                                        <td>
                                            <button
                                                type="button"
                                                className={`${styles.button} ${styles.buttonSecondary}`}
                                                onClick={() => descargarComprobante(solicitud)}
                                                disabled={!solicitud.comprobante_tipo}
                                            >
                                                Descargar {solicitud.comprobante_tipo?.split("/")[1]?.toUpperCase() || ""}
                                            </button>
                                        </td>
                                        <td>
                                            <span className={`${styles.status} ${clasesEstado[solicitud.estado_afiliacion] || ""}`}>
                                                {etiquetasEstado[solicitud.estado_afiliacion]}
                                            </span>
                                        </td>
                                        <td>{etiquetasCuenta[solicitud.estado_cuenta] || "—"}</td>
                                        <td>
                                            {solicitud.estado_afiliacion === "pendiente" && (
                                                <div className={styles.actions}>
                                                    <button
                                                        type="button"
                                                        className={`${styles.button} ${styles.buttonApprove}`}
                                                        onClick={() => actualizarEstadoSolicitud(solicitud, "aprobado")}
                                                    >
                                                        Aprobar
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`${styles.button} ${styles.buttonReject}`}
                                                        onClick={() => actualizarEstadoSolicitud(solicitud, "rechazado")}
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

        </main>
    );
}

export default UserGestor;
