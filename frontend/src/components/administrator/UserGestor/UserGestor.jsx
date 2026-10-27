import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const cuentasAdministradorDemo = [
    { id: "admin-sura", nombre: "Administración EPS Sura", eps: "EPS Sura" },
    { id: "admin-nueva-eps", nombre: "Administración Nueva EPS", eps: "Nueva EPS" },
    { id: "admin-sanitas", nombre: "Administración EPS Sanitas", eps: "EPS Sanitas" },
];

const usuariosIniciales = [
    {
        id: 1,
        nombres: "Valentina",
        apellidos: "Rojas Demo",
        tipoDocumento: "CC",
        numeroDocumento: "1000000001",
        email: "valentina.rojas@example.test",
        telefono: "3000000001",
        fechaNacimiento: "1998-04-12",
        sexo: "F",
        eps: "EPS Sura",
        estado: "pendiente",
    },
    {
        id: 2,
        nombres: "Samuel",
        apellidos: "Pérez Demo",
        tipoDocumento: "TI",
        numeroDocumento: "1000000002",
        email: "samuel.perez@example.test",
        telefono: "3000000002",
        fechaNacimiento: "2008-09-23",
        sexo: "M",
        eps: "EPS Sura",
        estado: "pendiente",
    },
    {
        id: 3,
        nombres: "Alex",
        apellidos: "Torres Demo",
        tipoDocumento: "CC",
        numeroDocumento: "1000000003",
        email: "alex.torres@example.test",
        telefono: "3000000003",
        fechaNacimiento: "1985-01-30",
        sexo: "O",
        eps: "EPS Sura",
        estado: "aprobado",
    },
    {
        id: 4,
        nombres: "Camila",
        apellidos: "Gómez Demo",
        tipoDocumento: "CC",
        numeroDocumento: "1000000004",
        email: "camila.gomez@example.test",
        telefono: "3000000004",
        fechaNacimiento: "1972-06-08",
        sexo: "F",
        eps: "Nueva EPS",
        estado: "pendiente",
    },
    {
        id: 5,
        nombres: "Mateo",
        apellidos: "Díaz Demo",
        tipoDocumento: "CC",
        numeroDocumento: "1000000005",
        email: "mateo.diaz@example.test",
        telefono: "3000000005",
        fechaNacimiento: "1992-11-17",
        sexo: "M",
        eps: "Nueva EPS",
        estado: "rechazado",
    },
    {
        id: 6,
        nombres: "Noa",
        apellidos: "Vargas Demo",
        tipoDocumento: "CC",
        numeroDocumento: "1000000006",
        email: "noa.vargas@example.test",
        telefono: "3000000006",
        fechaNacimiento: "2001-02-05",
        sexo: "O",
        eps: "EPS Sanitas",
        estado: "pendiente",
    },
];

const etiquetasEstado = {
    pendiente: "Pendiente",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
};

function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
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
    const [usuarios, setUsuarios] = useState(usuariosIniciales);
    const [cuentaAdminId, setCuentaAdminId] = useState(cuentasAdministradorDemo[0].id);
    const [busqueda, setBusqueda] = useState("");
    const [sexoFiltro, setSexoFiltro] = useState("todos");
    const [estadoFiltro, setEstadoFiltro] = useState("todos");
    const [edadMinima, setEdadMinima] = useState("");
    const [edadMaxima, setEdadMaxima] = useState("");
    const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null);
    const [mensaje, setMensaje] = useState("");

    const cuentaAdmin = cuentasAdministradorDemo.find(
        (cuenta) => cuenta.id === cuentaAdminId,
    );

    const usuariosVisibles = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase("es");
        const minimo = edadMinima === "" ? null : Number(edadMinima);
        const maximo = edadMaxima === "" ? null : Number(edadMaxima);

        return usuarios.filter((usuario) => {
            const edad = calcularEdad(usuario.fechaNacimiento);
            const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
            const coincideBusqueda =
                !termino ||
                nombreCompleto.toLocaleLowerCase("es").includes(termino) ||
                usuario.numeroDocumento.toLocaleLowerCase("es").includes(termino);

            return (
                usuario.eps === cuentaAdmin.eps &&
                coincideBusqueda &&
                (sexoFiltro === "todos" || usuario.sexo === sexoFiltro) &&
                (estadoFiltro === "todos" || usuario.estado === estadoFiltro) &&
                (minimo === null || edad >= minimo) &&
                (maximo === null || edad <= maximo)
            );
        });
    }, [usuarios, cuentaAdmin.eps, busqueda, sexoFiltro, estadoFiltro, edadMinima, edadMaxima]);

    function actualizarEstado(id, estado) {
        setUsuarios((actuales) =>
            actuales.map((usuario) =>
                usuario.id === id ? { ...usuario, estado } : usuario,
            ),
        );
        setMensaje(`Solicitud ${etiquetasEstado[estado].toLocaleLowerCase("es")}.`);
    }

    function guardarCambios(event) {
        event.preventDefault();
        const datos = new FormData(event.currentTarget);
        const numeroDocumento = datos.get("numeroDocumento").trim();
        const documentoDuplicado = usuarios.some(
            (usuario) =>
                usuario.id !== usuarioEnEdicion.id &&
                usuario.tipoDocumento === datos.get("tipoDocumento") &&
                usuario.numeroDocumento === numeroDocumento,
        );

        if (documentoDuplicado) {
            setMensaje("Ya existe otro usuario con ese tipo y número de documento.");
            return;
        }

        setUsuarios((actuales) =>
            actuales.map((usuario) =>
                usuario.id === usuarioEnEdicion.id
                    ? {
                          ...usuario,
                          nombres: datos.get("nombres").trim(),
                          apellidos: datos.get("apellidos").trim(),
                          tipoDocumento: datos.get("tipoDocumento"),
                          numeroDocumento,
                          email: datos.get("email").trim(),
                          telefono: datos.get("telefono").trim(),
                          fechaNacimiento: datos.get("fechaNacimiento"),
                          sexo: datos.get("sexo"),
                      }
                    : usuario,
            ),
        );
        setUsuarioEnEdicion(null);
        setMensaje("Datos actualizados en esta sesión de demostración.");
    }

    return (
        <main className="user-gestor">
            <header className="user-gestor__header">
                <Link to="/perfilAdministrador">Volver al perfil de administrador</Link>
                <p className="user-gestor__eyebrow">MediTunja · Administración</p>
                <h1>Gestión de usuarios</h1>
                <p>
                    Revisa solicitudes de registro y administra los datos de las personas
                    afiliadas a tu EPS.
                </p>
            </header>

            <aside className="user-gestor__notice" aria-label="Modo demostración">
                <strong>Modo demostración:</strong> los registros son ficticios, los cambios
                solo duran mientras esta página permanezca abierta y el selector de cuenta
                no representa autenticación real.
            </aside>

            <section className="user-gestor__panel" aria-labelledby="titulo-filtros">
                <h2 id="titulo-filtros">Buscar y filtrar usuarios</h2>
                <div className="user-gestor__filters">
                    <div className="user-gestor__field">
                        <label htmlFor="cuenta-admin-demo">Cuenta de administrador (demo)</label>
                        <select
                            id="cuenta-admin-demo"
                            value={cuentaAdminId}
                            onChange={(event) => {
                                setCuentaAdminId(event.target.value);
                                setMensaje("");
                            }}
                        >
                            {cuentasAdministradorDemo.map((cuenta) => (
                                <option key={cuenta.id} value={cuenta.id}>
                                    {cuenta.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
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
                        <select
                            id="filtro-sexo"
                            value={sexoFiltro}
                            onChange={(event) => setSexoFiltro(event.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="F">Femenino</option>
                            <option value="M">Masculino</option>
                            <option value="O">Otro / Prefiere no decir</option>
                        </select>
                    </div>
                    <div className="user-gestor__field">
                        <label htmlFor="filtro-estado">Estado de solicitud</label>
                        <select
                            id="filtro-estado"
                            value={estadoFiltro}
                            onChange={(event) => setEstadoFiltro(event.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="pendiente">Pendientes</option>
                            <option value="aprobado">Aprobados</option>
                            <option value="rechazado">Rechazados</option>
                        </select>
                    </div>
                    <div className="user-gestor__field">
                        <label htmlFor="edad-minima">Edad mínima</label>
                        <input
                            id="edad-minima"
                            type="number"
                            min="0"
                            max="120"
                            value={edadMinima}
                            onChange={(event) => setEdadMinima(event.target.value)}
                            placeholder="Sin mínimo"
                        />
                    </div>
                    <div className="user-gestor__field">
                        <label htmlFor="edad-maxima">Edad máxima</label>
                        <input
                            id="edad-maxima"
                            type="number"
                            min="0"
                            max="120"
                            value={edadMaxima}
                            onChange={(event) => setEdadMaxima(event.target.value)}
                            placeholder="Sin máximo"
                        />
                    </div>
                </div>
            </section>

            {mensaje && (
                <p className="user-gestor__message" role="status">
                    {mensaje}
                </p>
            )}

            <section className="user-gestor__panel" aria-labelledby="titulo-listado">
                <div className="user-gestor__list-heading">
                    <div>
                        <h2 id="titulo-listado">Afiliados de {cuentaAdmin.eps}</h2>
                        <p>{usuariosVisibles.length} usuario(s) encontrados</p>
                    </div>
                </div>

                {usuariosVisibles.length === 0 ? (
                    <p className="user-gestor__empty">
                        No hay usuarios que coincidan con los filtros seleccionados.
                    </p>
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
                                {usuariosVisibles.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>
                                            <strong>{usuario.nombres} {usuario.apellidos}</strong>
                                            <span className="user-gestor__secondary">
                                                {usuario.email}
                                            </span>
                                        </td>
                                        <td>{usuario.tipoDocumento} {usuario.numeroDocumento}</td>
                                        <td>{calcularEdad(usuario.fechaNacimiento)}</td>
                                        <td>
                                            {usuario.sexo === "F"
                                                ? "Femenino"
                                                : usuario.sexo === "M"
                                                  ? "Masculino"
                                                  : "Otro / Prefiere no decir"}
                                        </td>
                                        <td>
                                            <span
                                                className={`user-gestor__status user-gestor__status--${usuario.estado}`}
                                            >
                                                {etiquetasEstado[usuario.estado]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="user-gestor__actions">
                                                <button
                                                    type="button"
                                                    className="user-gestor__button user-gestor__button--secondary"
                                                    onClick={() => {
                                                        setUsuarioEnEdicion(usuario);
                                                        setMensaje("");
                                                    }}
                                                >
                                                    Editar datos
                                                </button>
                                                {usuario.estado === "pendiente" && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            className="user-gestor__button user-gestor__button--approve"
                                                            onClick={() =>
                                                                actualizarEstado(usuario.id, "aprobado")
                                                            }
                                                        >
                                                            Aprobar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="user-gestor__button user-gestor__button--reject"
                                                            onClick={() =>
                                                                actualizarEstado(usuario.id, "rechazado")
                                                            }
                                                        >
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
                <section
                    className="user-gestor__panel user-gestor__editor"
                    aria-labelledby="titulo-edicion"
                >
                    <h2 id="titulo-edicion">
                        Editar datos de {usuarioEnEdicion.nombres} {usuarioEnEdicion.apellidos}
                    </h2>
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
                            <input id="editar-telefono" name="telefono" type="tel" defaultValue={usuarioEnEdicion.telefono} maxLength="30" />
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
                            <button type="submit" className="user-gestor__button user-gestor__button--approve">
                                Guardar cambios
                            </button>
                            <button
                                type="button"
                                className="user-gestor__button user-gestor__button--secondary"
                                onClick={() => setUsuarioEnEdicion(null)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </main>
    );
}

export default UserGestor;