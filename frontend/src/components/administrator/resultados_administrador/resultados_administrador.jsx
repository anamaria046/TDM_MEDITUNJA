import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest, mensajeError } from "../../../auth/api.js";
import { useAdminAuth } from "../../../auth/useAdminAuth.js";
import Filter from "../../Filter/Filter.jsx";
import { descargarArchivo } from "../../../auth/descargarArchivo.js";
import styles from "./ResultadosAdministrador.module.css";

function ResultadosAdministrador() {
    const { token } = useAdminAuth();
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [showForm, setShowForm] = useState(false);
    const [afiliados, setAfiliados] = useState(null);
    const [ipsDisponibles, setIpsDisponibles] = useState([]);
    const [errorAfiliados, setErrorAfiliados] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [publishingId, setPublishingId] = useState(null);

    const loadResults = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const respuesta = await apiRequest("/admin/resultados", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setResults(respuesta.data);
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!showForm) return undefined;
        const solicitud = new AbortController();
        apiRequest("/admin/resultados/afiliados", { headers: { Authorization: `Bearer ${token}` }, signal: solicitud.signal })
            .then(({ data, ips }) => {
                if (solicitud.signal.aborted) return;
                setAfiliados(data);
                setIpsDisponibles(ips);
            }).catch((fallo) => {
                if (!solicitud.signal.aborted) setErrorAfiliados(mensajeError(fallo));
            });
        return () => solicitud.abort();
    }, [showForm, token]);

    useEffect(() => {
        let active = true;

        async function loadInitialResults() {
            setLoading(true);
            setError("");
            try {
                const respuesta = await apiRequest("/admin/resultados", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (active) setResults(respuesta.data);
            } catch (errorSolicitud) {
                if (active) setError(mensajeError(errorSolicitud));
            } finally {
                if (active) setLoading(false);
            }
        }

        loadInitialResults();
        return () => {
            active = false;
        };
    }, [token]);

    const visibleResults = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("es");

        return results.filter((result) => {
            const matchesSearch =
                !normalizedSearch ||
                [result.patient, result.document, result.procedure]
                    .join(" ")
                    .toLocaleLowerCase("es")
                    .includes(normalizedSearch);
            const matchesStatus =
                statusFilter === "todos" || result.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [results, search, statusFilter]);

    async function handleSubmit(event) {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        const [tipoDocumento, numeroDocumento] = String(formData.get("afiliado") || "").split(":");
        if (!numeroDocumento) return;
        const resultado = {
            tipoDocumento,
            numeroDocumento,
            procedimiento: formData.get("procedure").trim(),
            fecha: formData.get("date"),
            proveedor: formData.get("provider").trim(),
            estado: formData.get("status"),
            informe: formData.get("report").trim(),
        };
        const payload = new FormData();
        for (const [clave, valor] of Object.entries(resultado)) payload.set(clave, valor);
        const adjunto = formData.get("adjunto");
        if (adjunto?.size) payload.set("adjunto", adjunto);

        setSaving(true);
        setMessage("");
        setError("");
        try {
            await apiRequest("/admin/resultados", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: payload,
            });
            form.reset();
            setShowForm(false);
            setMessage("Resultado guardado correctamente.");
            await loadResults();
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setSaving(false);
        }
    }

    async function publicarResultado(result) {
        if (!window.confirm(`¿Publicar el resultado de ${result.patient}? El afiliado podrá ver la nota y descargar el adjunto.`)) return;
        setPublishingId(result.id);
        setMessage("");
        setError("");
        try {
            const { data, mensaje } = await apiRequest(`/admin/resultados/${result.id}/publicar`, {
                method: "PUT", headers: { Authorization: `Bearer ${token}` },
            });
            setResults((actuales) => actuales.map((item) => item.id === data.id ? { ...item, status: data.status } : item));
            setMessage(mensaje);
        } catch (fallo) {
            setError(mensajeError(fallo));
        } finally {
            setPublishingId(null);
        }
    }

    async function removeResult(id, patient) {
        if (!window.confirm(`¿Eliminar el resultado de ${patient}?`)) return;

        setDeletingId(id);
        setMessage("");
        setError("");
        try {
            await apiRequest(`/admin/resultados/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setResults((currentResults) =>
                currentResults.filter((result) => result.id !== id),
            );
            setMessage("Resultado eliminado.");
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <main className={styles.adminResults}>
            <header>
                <p>MediTunja · Administración</p>
                <h1>Gestión de resultados de procedimientos</h1>
                <p>
                    Consulta y registra resultados para afiliados aprobados de tu EPS.
                </p>
            </header>

            <section aria-label="Alcance de los resultados">
                <p>
                    Los resultados se guardan en la base de datos de MediTunja y son ingresados
                    manualmente por un administrador. No se reciben automáticamente de la IPS;
                    verifica la información antes de publicarla.
                </p>
            </section>

            <section aria-labelledby="acciones-resultados">
                <h2 id="acciones-resultados">Administrar resultados</h2>
                <button
                    type="button"
                    aria-expanded={showForm}
                    aria-controls="formulario-resultado"
                    onClick={() => {
                        setShowForm((isVisible) => !isVisible);
                        setAfiliados(null);
                        setErrorAfiliados("");
                        setError("");
                        setMessage("");
                    }}
                >
                    {showForm ? "Cancelar registro" : "Registrar resultado"}
                </button>

                {showForm && (
                    <form id="formulario-resultado" onSubmit={handleSubmit}>
                        <fieldset>
                            <legend>Afiliado</legend>
                            <div className={styles.singleColumnGrid}>
                                <div>
                                    <label htmlFor="afiliado-resultado">Afiliado de la EPS</label>
                                    <select id="afiliado-resultado" name="afiliado" defaultValue="" required disabled={!afiliados?.length}>
                                        <option value="" disabled>Selecciona un afiliado</option>
                                        {afiliados?.map(({ tipoDocumento, numeroDocumento, nombre }) => (
                                            <option key={`${tipoDocumento}:${numeroDocumento}`} value={`${tipoDocumento}:${numeroDocumento}`}>
                                                {nombre} · {tipoDocumento} {numeroDocumento}
                                            </option>
                                        ))}
                                    </select>
                                    {errorAfiliados && <p role="alert">{errorAfiliados}</p>}
                                    {!errorAfiliados && !afiliados && <p role="status">Cargando afiliados…</p>}
                                    {afiliados?.length === 0 && <p>No hay afiliados aprobados en esta EPS.</p>}
                                </div>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Información del procedimiento</legend>
                            <div className={styles.formGrid}>
                                <div>
                                    <label htmlFor="nombre-procedimiento">Procedimiento</label>
                                    <input
                                        id="nombre-procedimiento"
                                        name="procedure"
                                        type="text"
                                        maxLength={120}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="fecha-procedimiento">Fecha de realización</label>
                                    <input
                                        id="fecha-procedimiento"
                                        name="date"
                                        type="date"
                                        max={new Date().toISOString().slice(0, 10)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="ips-procedimiento">IPS prestadora</label>
                                    <select id="ips-procedimiento" name="provider" defaultValue="" required disabled={!ipsDisponibles.length}>
                                        <option value="" disabled>Selecciona una IPS</option>
                                        {ipsDisponibles.map(({ id, nombre, sede }) => (
                                            <option key={id} value={`${nombre}${sede ? ` - ${sede}` : ""}`}>{nombre}{sede ? ` - ${sede}` : ""}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="estado-resultado">Estado del resultado</label>
                                    <select id="estado-resultado" name="status" defaultValue="En proceso">
                                        <option value="En proceso">En proceso</option>
                                        <option value="Disponible">Disponible</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="informe-resultado">Informe o nota del resultado</label>
                                    <textarea
                                        id="informe-resultado"
                                        name="report"
                                        rows="5"
                                        maxLength={10000}
                                        placeholder="Registra el informe proporcionado por la IPS."
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="adjunto-resultado">Archivo adjunto (opcional)</label>
                                    <input id="adjunto-resultado" name="adjunto" type="file" aria-describedby="ayuda-adjunto-resultado" />
                                    <small id="ayuda-adjunto-resultado">Un archivo de hasta 10 MB.</small>
                                </div>
                            </div>
                        </fieldset>
                        <button type="submit" disabled={saving || !afiliados?.length || !ipsDisponibles.length}>
                            {saving ? "Guardando..." : "Guardar resultado"}
                        </button>
                    </form>
                )}
            </section>

            <section aria-labelledby="listado-resultados">
                <h2 id="listado-resultados">Resultados registrados</h2>
                <Filter
                    id="resultados-admin"
                    searchValue={search}
                    onSearchChange={setSearch}
                    searchLabel="Buscar resultados"
                    searchPlaceholder="Usuario, documento o procedimiento"
                    filterValue={statusFilter}
                    onFilterChange={setStatusFilter}
                    filterLabel="Estado"
                    filterOptions={[
                        { value: "todos", label: "Todos los estados" },
                        { value: "En proceso", label: "En proceso" },
                        { value: "Disponible", label: "Disponible" },
                    ]}
                />

                {message && <p role="status">{message}</p>}
                {error && <p role="alert">{error}</p>}

                {loading ? (
                    <p role="status">Cargando resultados...</p>
                ) : visibleResults.length > 0 ? (
                    <div>
                        <table>
                            <caption>Resultados de afiliados aprobados de tu EPS</caption>
                            <thead>
                                <tr>
                                    <th scope="col">Usuario</th>
                                    <th scope="col">Documento</th>
                                    <th scope="col">Procedimiento</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">IPS</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Informe</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleResults.map((result) => (
                                    <tr key={result.id}>
                                        <td>{result.patient}</td>
                                        <td>{result.tipoDocumento} {result.document}</td>
                                        <td>{result.procedure}</td>
                                        <td>{result.date}</td>
                                        <td>{result.provider}</td>
                                        <td>{result.status}</td>
                                        <td>
                                            {result.report}
                                            {result.adjunto && (
                                                <button type="button" onClick={() =>
                                                    descargarArchivo(`/admin/resultados/${result.id}/adjunto`, token, result.adjunto)
                                                        .catch((fallo) => setError(mensajeError(fallo)))
                                                }>Descargar {result.adjunto}</button>
                                            )}
                                        </td>
                                        <td>
                                            {result.status === "En proceso" && (
                                                <button type="button" className={styles.publishResult} onClick={() => publicarResultado(result)}
                                                    disabled={publishingId !== null || deletingId !== null}>
                                                    {publishingId === result.id ? "Publicando…" : "Publicar resultado"}
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeResult(result.id, result.patient)}
                                                disabled={deletingId !== null || publishingId !== null}
                                                aria-label={`Eliminar resultado de ${result.patient}`}
                                            >
                                                {deletingId === result.id ? "Eliminando..." : "Eliminar"}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div role="status">
                        <h3>
                            {results.length === 0
                                ? "Aún no hay resultados registrados"
                                : "No hay resultados que coincidan con la búsqueda"}
                        </h3>
                        <p>
                            {results.length === 0
                                ? "Usa «Registrar resultado» para agregar un registro."
                                : "Prueba con otros términos o cambia el filtro de estado."}
                        </p>
                    </div>
                )}
            </section>
        </main>
    );
}

export default ResultadosAdministrador;
