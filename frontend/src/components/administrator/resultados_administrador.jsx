import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function ResultadosAdministrador() {
    const [results, setResults] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("todos");
    const [showForm, setShowForm] = useState(false);
    const [message, setMessage] = useState("");

    const visibleResults = useMemo(() => {
        const normalizedSearch = search.trim().toLocaleLowerCase("es");

        return results.filter((result) => {
            const matchesSearch =
                !normalizedSearch ||
                [result.patient, result.document, result.procedure, result.code]
                    .join(" ")
                    .toLocaleLowerCase("es")
                    .includes(normalizedSearch);
            const matchesStatus =
                statusFilter === "todos" || result.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [results, search, statusFilter]);

    function handleSubmit(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const result = {
            id: `${Date.now()}`,
            patient: formData.get("patient").trim(),
            document: formData.get("document").trim(),
            procedure: formData.get("procedure").trim(),
            date: formData.get("date"),
            provider: formData.get("provider").trim(),
            status: formData.get("status"),
            report: formData.get("report").trim(),
        };

        setResults((currentResults) => [result, ...currentResults]);
        setMessage("El resultado se agregó a esta sesión de demostración.");
        event.currentTarget.reset();
        setShowForm(false);
    }

    function removeResult(id) {
        setResults((currentResults) =>
            currentResults.filter((result) => result.id !== id),
        );
        setMessage("El registro se quitó de esta sesión de demostración.");
    }

    return (
        <main>
            <header>
                <Link to="/perfilAdministrador">Volver al perfil de administrador</Link>
                <p>MediTunja · Administración</p>
                <h1>Gestión de resultados de procedimientos</h1>
                <p>
                    Consulta y registra los resultados de procedimientos realizados a los usuarios.
                </p>
            </header>

            <section aria-label="Aviso sobre esta maquetación">
                <p>
                    Maquetación de demostración: los registros se mantienen solo mientras esta
                    página está abierta. No se guardan ni se publican en una base de datos.
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
                        setMessage("");
                    }}
                >
                    {showForm ? "Cancelar registro" : "Registrar resultado"}
                </button>

                {showForm && (
                    <form id="formulario-resultado" onSubmit={handleSubmit}>
                        <fieldset>
                            <legend>Datos del usuario</legend>

                            <div>
                                <label htmlFor="nombre-paciente">Nombre completo</label>
                                <input
                                    id="nombre-paciente"
                                    name="patient"
                                    type="text"
                                    autoComplete="name"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="documento-paciente">Número de documento</label>
                                <input
                                    id="documento-paciente"
                                    name="document"
                                    type="text"
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
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="fecha-procedimiento">Fecha de realización</label>
                                <input
                                    id="fecha-procedimiento"
                                    name="date"
                                    type="date"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="ips-procedimiento">IPS prestadora</label>
                                <input
                                    id="ips-procedimiento"
                                    name="provider"
                                    type="text"
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
                                    placeholder="Ingresa la información correspondiente al resultado"
                                    required
                                />
                            </div>
                        </fieldset>

                        <button type="submit">Guardar resultado</button>
                    </form>
                )}
            </section>

            <section aria-labelledby="listado-resultados">
                <h2 id="listado-resultados">Resultados registrados</h2>

                <div>
                    <label htmlFor="buscar-resultado">Buscar por usuario, documento o procedimiento</label>
                    <input
                        id="buscar-resultado"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="filtrar-estado">Filtrar por estado</label>
                    <select
                        id="filtrar-estado"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="En proceso">En proceso</option>
                        <option value="Disponible">Disponible</option>
                    </select>
                </div>

                {message && <p role="status">{message}</p>}

                {visibleResults.length > 0 ? (
                    <div>
                        <table>
                            <caption>Resultados agregados durante esta sesión</caption>
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
                                        <td>{result.document}</td>
                                        <td>{result.procedure}</td>
                                        <td>{result.date}</td>
                                        <td>{result.provider}</td>
                                        <td>{result.status}</td>
                                        <td>{result.report}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => removeResult(result.id)}
                                                aria-label={`Eliminar resultado de ${result.patient}`}
                                            >
                                                Eliminar
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