import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, mensajeError } from "../../../auth/api.js";
import { useAdminAuth } from "../../../auth/useAdminAuth.js";

const etiquetasEstado = {
    pendiente: "Pendiente",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
};

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return "—";
    const hoy = new Date();
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    if (Number.isNaN(nacimiento.getTime())) return "—";
    let edad = hoy.getFullYear() - nacimiento.getFullYear();

    if (
        hoy.getMonth() < nacimiento.getMonth() ||
        (hoy.getMonth() === nacimiento.getMonth() &&
            hoy.getDate() < nacimiento.getDate())
    ) {
        edad -= 1;
    }

    return edad;
}

function UserGestor() {
    const { token, usuario } = useAdminAuth();
    const [usuarios, setUsuarios] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [errorCarga, setErrorCarga] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [sexoFiltro, setSexoFiltro] = useState("todos");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [edadMinima, setEdadMinima] = useState("");
    const [edadMaxima, setEdadMaxima] = useState("");
    const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        let activo = true;
        apiRequest("/admin/afiliados", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((respuesta) => {
                if (activo) setUsuarios(respuesta.data);
            })
            .catch((error) => {
                if (activo) setErrorCarga(mensajeError(error));
            })
            .finally(() => {
                if (activo) setCargando(false);
            });

        return () => {
            activo = false;
        };
    }, [token]);

    const usuariosVisibles = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase("es");
        const minimo = edadMinima === "" ? null : Number(edadMinima);
        const maximo = edadMaxima === "" ? null : Number(edadMaxima);

        return usuarios.filter((afiliado) => {
            const edad = calcularEdad(afiliado.fechaNacimiento);
            const nombreCompleto = `${afiliado.nombres} ${afiliado.apellidos}`;
            const coincideBusqueda =
                !termino ||
                nombreCompleto.toLocaleLowerCase("es").includes(termino) ||
                afiliado.numeroDocumento.toLocaleLowerCase("es").includes(termino);

            return (
                coincideBusqueda &&
                (sexoFiltro === "todos" || afiliado.sexo === sexoFiltro) &&
                (estadoFiltro === "todos" || afiliado.estado === estadoFiltro) &&
                (minimo === null || edad >= minimo) &&
                (maximo === null || edad <= maximo)
            );
        });
    }, [usuarios, busqueda, sexoFiltro, estadoFiltro, edadMinima, edadMaxima]);

    async function actualizarEstado(id, estado) {
        setMensaje("");
        try {
            await apiRequest(`/admin/afiliados/${id}/estado`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ estado }),
            });
            setUsuarios((actuales) =>
                actuales.map((afiliado) =>
                    afiliado.id === id ? { ...afiliado, estado } : afiliado,
                ),
            );
            setMensaje(`Solicitud ${etiquetasEstado[estado].toLocaleLowerCase("es")}.`);
        } catch (error) {
            setMensaje(mensajeError(error));
        }
    }

    async function guardarCambios(event) {
        event.preventDefault();
        const datos = new FormData(event.currentTarget);
        const afiliadoActualizado = {
            nombres: datos.get("nombres").trim(),
            apellidos: datos.get("apellidos").trim(),
            tipoDocumento: datos.get("tipoDocumento"),
            numeroDocumento: datos.get("numeroDocumento").trim(),
            email: datos.get("email").trim(),
            telefono: datos.get("telefono").trim(),
            fechaNacimiento: datos.get("fechaNacimiento"),
            sexo: datos.get("sexo"),
        };

        setMensaje("");
        try {
            await apiRequest(`/admin/afiliados/${usuarioEnEdicion.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify(afiliadoActualizado),
            });
            setUsuarios((actuales) =>
                actuales.map((afiliado) =>
                    afiliado.id === usuarioEnEdicion.id
                        ? { ...afiliado, ...afiliadoActualizado }
                        : afiliado,
                ),
            );
            setUsuarioEnEdicion(null);
            setMensaje("Datos del afiliado guardados.");
        } catch (error) {
            setMensaje(mensajeError(error));
        }
    }

    return (
        <main className="user-gestor">
            <header className="user-gestor__header">
                <Link to="/perfilAdministrador">Volver al perfil de administrador</Link>
                <p className="user-gestor__eyebrow">MediTunja · Administración</p>
                <h1>Gestión de afiliados</h1>
                <p>Administra las solicitudes y datos de afiliados de {usuario.eps}.</p>
            </header>

            <aside className="user-gestor__notice">
                Los cambios se guardan en la base de datos y se limitan a la EPS asignada
                a tu cuenta.
            </aside>

            <section className="user-gestor__panel" aria-labelledby="titulo-filtros">
                <h2 id="titulo-filtros">Buscar y filtrar afiliados</h2>
                <div className="user-gestor__filters">
                    <div className="user-gestor__field user-gestor__field--wide">
                        <label htmlFor="busqueda-usuario">Nombre o número de documento</label>
                        <input
                            id="busqueda-usuario"
                            type="search"
                            value={busqueda}
                            onChange={(event) => setBusqueda(event.target.value)}
                            placeholder="Ej.: Valentina o 1000000001"
                        />
                    </div>
                    <div className="user-gestor__field">
                        <label htmlFor="filtro-sexo">Sexo</label>
                        <select id="filtro-sexo" value={sexoFiltro} onChange={(event) => setSexoFiltro(event.target.value)}>
                            <option value="todos">Todos</option>
                            <option value="F">Femenino</option>
                            <option value="M">Masculino</option>
                            <option value="O">Otro / Prefiere no decir</option>
                        </select>
                    </div>
                    <div className="user-gestor__field">
                        <label htmlFor="filtro-estado">Estado de solicitud</label>
                        <select id="filtro-estado" value={estadoFiltro} onChange={(event) => setEstadoFiltro(event.target.value)}>
                            <option value="todos">Todos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="aprobado">Aprobados</option>
                            <option value="rechazado">Rechazados</option>
                        </select>
                    </div>
                    <div className="user-gestor__field">
                        <label htmlFor="edad-minima">Edad mínima</label>
                        <input id="edad-minima" type="number" min="0" max="120" value={edadMinima} onChange={(event) => setEdadMinima(event.target.value)} placeholder="Sin mínimo" />
                    </div>
                    <div className="user-gestor__field">
                        <label htmlFor="edad-maxima">Edad máxima</label>
                        <input id="edad-maxima" type="number" min="0" max="120" value={edadMaxima} onChange={(event) => setEdadMaxima(event.target.value)} placeholder="Sin máximo" />
                    </div>
                </div>
            </section>

            {mensaje && <p className="user-gestor__message" role="status">{mensaje}</p>}
            {errorCarga && <p role="alert">{errorCarga}</p>}

            <section className="user-gestor__panel" aria-labelledby="titulo-listado">
                <div className="user-gestor__list-heading">
                    <div>
                        <h2 id="titulo-listado">Afiliados de {usuario.eps}</h2>
                        <p>{cargando ? "Cargando afiliados..." : `${usuariosVisibles.length} usuario(s) encontrados`}</p>
                    </div>
                </div>

                {!cargando && !errorCarga && usuariosVisibles.length === 0 ? (
                    <p className="user-gestor__empty">No hay afiliados que coincidan con los filtros seleccionados.</p>
                ) : (
                    <div className="user-gestor__table-wrap">
                        <table className="user-gestor__table">
                            <thead>
                                <tr>
                                    <th scope="col">Usuario</th>
                                    <th scope="col">Documento</th>
                                    <th scope="col">Edad</th>
                                    <th scope="col">Sexo</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuariosVisibles.map((afiliado) => (
                                    <tr key={afiliado.id}>
                                        <td>
                                            <strong>{afiliado.nombres} {afiliado.apellidos}</strong>
                                            <span className="user-gestor__secondary">{afiliado.email}</span>
                                        </td>
                                        <td>{afiliado.tipoDocumento} {afiliado.numeroDocumento}</td>
                                        <td>{calcularEdad(afiliado.fechaNacimiento)}</td>
                                        <td>{afiliado.sexo === "F" ? "Femenino" : afiliado.sexo === "M" ? "Masculino" : "Otro / Prefiere no decir"}</td>
                                        <td>
                                            <span className={`user-gestor__status user-gestor__status--${afiliado.estado}`}>
                                                {etiquetasEstado[afiliado.estado]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="user-gestor__actions">
                                                <button type="button" className="user-gestor__button user-gestor__button--secondary" onClick={() => { setUsuarioEnEdicion(afiliado); setMensaje(""); }}>
                                                    Editar datos
                                                </button>
                                                {afiliado.estado === "pendiente" && (
                                                    <>
                                                        <button type="button" className="user-gestor__button user-gestor__button--approve" onClick={() => actualizarEstado(afiliado.id, "aprobado")}>
                                                            Aprobar
                                                        </button>
                                                        <button type="button" className="user-gestor__button user-gestor__button--reject" onClick={() => actualizarEstado(afiliado.id, "rechazado")}>
                                                            Rechazar
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {usuarioEnEdicion && (
                <section className="user-gestor__panel user-gestor__editor" aria-labelledby="titulo-edicion">
                    <h2 id="titulo-edicion">Editar datos de {usuarioEnEdicion.nombres} {usuarioEnEdicion.apellidos}</h2>
                    <p>EPS asignada: <strong>{usuarioEnEdicion.eps}</strong></p>
                    <form className="user-gestor__edit-form" onSubmit={guardarCambios}>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-nombres">Nombres</label>
                            <input id="editar-nombres" name="nombres" defaultValue={usuarioEnEdicion.nombres} maxLength="80" required />
                        </div>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-apellidos">Apellidos</label>
                            <input id="editar-apellidos" name="apellidos" defaultValue={usuarioEnEdicion.apellidos} maxLength="80" required />
                        </div>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-tipo-documento">Tipo de documento</label>
                            <select id="editar-tipo-documento" name="tipoDocumento" defaultValue={usuarioEnEdicion.tipoDocumento}>
                                <option value="CC">Cédula de ciudadanía</option>
                                <option value="TI">Tarjeta de identidad</option>
                                <option value="CE">Cédula de extranjería</option>
                                <option value="PAS">Pasaporte</option>
                            </select>
                        </div>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-numero-documento">Número de documento</label>
                            <input id="editar-numero-documento" name="numeroDocumento" defaultValue={usuarioEnEdicion.numeroDocumento} maxLength="30" required />
                        </div>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-email">Correo electrónico</label>
                            <input id="editar-email" name="email" type="email" defaultValue={usuarioEnEdicion.email} maxLength="254" required />
                        </div>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-telefono">Teléfono</label>
                            <input id="editar-telefono" name="telefono" type="tel" defaultValue={usuarioEnEdicion.telefono || ""} maxLength="30" />
                        </div>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-fecha-nacimiento">Fecha de nacimiento</label>
                            <input id="editar-fecha-nacimiento" name="fechaNacimiento" type="date" defaultValue={usuarioEnEdicion.fechaNacimiento} max={new Date().toISOString().slice(0, 10)} required />
                        </div>
                        <div className="user-gestor__field">
                            <label htmlFor="editar-sexo">Sexo</label>
                            <select id="editar-sexo" name="sexo" defaultValue={usuarioEnEdicion.sexo}>
                                <option value="F">Femenino</option>
                                <option value="M">Masculino</option>
                                <option value="O">Otro / Prefiere no decir</option>
                            </select>
                        </div>
                        <div className="user-gestor__edit-actions">
                            <button type="submit" className="user-gestor__button user-gestor__button--approve">Guardar cambios</button>
                            <button type="button" className="user-gestor__button user-gestor__button--secondary" onClick={() => setUsuarioEnEdicion(null)}>Cancelar</button>
                        </div>
                    </form>
                </section>
            )}
        </main>
    );
}

export default UserGestor;
