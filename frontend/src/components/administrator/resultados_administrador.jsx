import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, mensajeError } from "../../auth/api.js";
import { useAdminAuth } from "../../auth/useAdminAuth.js";
import Filter from "../Filter/Filter.jsx";

function ResultadosAdministrador() {
    const { token } = useAdminAuth();
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

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
        const resultado = {
            tipoDocumento: formData.get("tipoDocumento"),
            numeroDocumento: formData.get("document").trim(),
            procedimiento: formData.get("procedure").trim(),
            fecha: formData.get("date"),
            proveedor: formData.get("provider").trim(),
            estado: formData.get("status"),
            informe: formData.get("report").trim(),
        };

        setSaving(true);
        setMessage("");
        setError("");
        try {
            await apiRequest("/admin/resultados", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(resultado),
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
        <main>
            <header>
                <Link to="/perfilAdministrador">Volver al perfil de administrador</Link>
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
                            <div>
                                <label htmlFor="tipo-documento-paciente">Tipo de documento</label>
                                <select
                                    id="tipo-documento-paciente"
                                    name="tipoDocumento"
                                    defaultValue="CC"
                                    required
                                >
                                    <option value="CC">Cédula de ciudadanía</option>
                                    <option value="TI">Tarjeta de identidad</option>
                                    <option value="CE">Cédula de extranjería</option>
                                    <option value="PAS">Pasaporte</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="documento-paciente">Número de documento</label>
                                <input
                                    id="documento-paciente"
                                    name="document"
                                    type="text"
                                    maxLength={30}
                                    required
                                />
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend>Información del procedimiento</legend>
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
                                <input
                                    id="ips-procedimiento"
                                    name="provider"
                                    type="text"
                                    maxLength={120}
                                    required
                                />
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
                        </fieldset>
                        <button type="submit" disabled={saving}>
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
                ) : error ? null : visibleResults.length > 0 ? (
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
                                        <td>{result.report}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => removeResult(result.id, result.patient)}
                                                disabled={deletingId === result.id}
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
