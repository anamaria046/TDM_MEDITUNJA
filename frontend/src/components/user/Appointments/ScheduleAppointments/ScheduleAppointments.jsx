import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../../../auth/api.js";

const ipsDisponibles = [
    { id: "san-rafael", nombre: "Hospital San Rafael de Tunja" },
    { id: "santiago-tunja", nombre: "E.S.E Santiago de Tunja" },
    { id: "clinica-medilaser", nombre: "Clínica Medilaser" },
    { id: "clinica-andes", nombre: "Clínica los Andes" },
    { id: "clinica-chia", nombre: "Clínica de Chía S.A" },
];

const serviciosDisponibles = [
    { id: "cardio", nombre: "Cardiología", costo: 120000 },
    { id: "radio", nombre: "Radiología", costo: 120000 },
];

function fechaLocal() {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
}

function formatoMoneda(valor) {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
    }).format(valor);
}

function ScheduleAppointment() {
    const { sesion } = useAuth();
    const [ips, setIps] = useState(ipsDisponibles[0].id);
    const [servicio, setServicio] = useState(serviciosDisponibles[0].id);
    const [fecha, setFecha] = useState(fechaLocal);
    const [horarios, setHorarios] = useState([]);
    const [horario, setHorario] = useState("");
    const [cargandoHorarios, setCargandoHorarios] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [confirmacion, setConfirmacion] = useState(null);
    const [actualizacion, setActualizacion] = useState(0);

    const descuentoPerfil = Number.isInteger(sesion?.usuario?.descuento)
        ? sesion.usuario.descuento
        : 0;
    const servicioSeleccionado = serviciosDisponibles.find((opcion) => opcion.id === servicio);
    const valorDescuento = Math.round(servicioSeleccionado.costo * descuentoPerfil / 100);

    useEffect(() => {
        if (!sesion?.accessToken || !fecha) return undefined;

        const controlador = new AbortController();
        async function cargarDisponibilidad() {
            setCargandoHorarios(true);
            setError("");
            setHorario("");
            try {
                const parametros = new URLSearchParams({ ips, fecha });
                const respuesta = await apiRequest(
                    `/citas/disponibilidad?${parametros.toString()}`,
                    {
                        headers: { Authorization: `Bearer ${sesion.accessToken}` },
                        signal: controlador.signal,
                    },
                );
                setHorarios(respuesta.horarios);
            } catch (errorSolicitud) {
                if (errorSolicitud.name !== "AbortError") {
                    setError(mensajeError(errorSolicitud));
                    setHorarios([]);
                }
            } finally {
                if (!controlador.signal.aborted) setCargandoHorarios(false);
            }
        }

        cargarDisponibilidad();
        return () => controlador.abort();
    }, [ips, fecha, sesion?.accessToken, actualizacion]);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setConfirmacion(null);
        setEnviando(true);
        try {
            const respuesta = await apiRequest("/citas", {
                method: "POST",
                headers: { Authorization: `Bearer ${sesion.accessToken}` },
                body: JSON.stringify({
                    ips,
                    servicio,
                    fecha,
                    hora: horario,
                    modalidad: new FormData(event.currentTarget).get("modalidad"),
                }),
            });
            setConfirmacion(respuesta);
            setHorario("");
            setActualizacion((anterior) => anterior + 1);
            window.dispatchEvent(new Event("citas-actualizadas"));
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
            setActualizacion((anterior) => anterior + 1);
        } finally {
            setEnviando(false);
        }
    }

    if (!sesion) {
        return (
            <section>
                <h2>Reserva de Cita Médica</h2>
                <p>Debes <Link to="/login">iniciar sesión</Link> para consultar horarios y reservar una cita.</p>
            </section>
        );
    }

    return (
        <section>
            <h2>Reserva de Cita Médica</h2>
            <form onSubmit={handleSubmit}>
                <fieldset>
                    <legend>1. Servicio e institución (IPS)</legend>
                    <div>
                        <label htmlFor="ips">Seleccione la IPS</label>
                        <select
                            id="ips"
                            name="ips"
                            value={ips}
                            onChange={(event) => setIps(event.target.value)}
                        >
                            {ipsDisponibles.map((opcion) => (
                                <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="servicio">Servicio disponible</label>
                        <select
                            id="servicio"
                            name="servicio"
                            value={servicio}
                            onChange={(event) => setServicio(event.target.value)}
                        >
                            {serviciosDisponibles.map((opcion) => (
                                <option key={opcion.id} value={opcion.id}>{opcion.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="modalidad">Modalidad</label>
                        <select id="modalidad" name="modalidad" defaultValue="presencial">
                            <option value="presencial">Presencial</option>
                            <option value="telemedicina">Telemedicina</option>
                        </select>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>2. Fecha y horario</legend>
                    <div>
                        <label htmlFor="fecha">Fecha deseada</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            min={fechaLocal()}
                            value={fecha}
                            onChange={(event) => setFecha(event.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <p>Horarios disponibles en la IPS seleccionada</p>
                        {cargandoHorarios && <p role="status">Consultando disponibilidad...</p>}
                        {!cargandoHorarios && horarios.length === 0 && !error && (
                            <p>Selecciona una fecha para consultar los horarios.</p>
                        )}
                        {horarios.map((opcion) => (
                            <div key={opcion.hora}>
                                <input
                                    type="radio"
                                    id={`hora-${opcion.hora}`}
                                    name="horario"
                                    value={opcion.hora}
                                    checked={horario === opcion.hora}
                                    disabled={!opcion.disponible || cargandoHorarios}
                                    onChange={(event) => setHorario(event.target.value)}
                                    required={opcion.disponible}
                                />
                                <label htmlFor={`hora-${opcion.hora}`}>
                                    {opcion.hora} — {opcion.estado === "disponible"
                                        ? "Disponible"
                                        : opcion.estado === "ocupado" ? "Ocupado" : "No disponible"}
                                </label>
                            </div>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend>3. Resumen y costos</legend>
                    <p><strong>Valor del servicio:</strong> {formatoMoneda(servicioSeleccionado.costo)}</p>
                    <p>
                        <strong>Descuento de tu perfil ({descuentoPerfil}%):</strong>{" "}
                        {formatoMoneda(valorDescuento)}
                    </p>
                    <p><strong>Total a pagar:</strong> {formatoMoneda(servicioSeleccionado.costo - valorDescuento)}</p>
                    <small>El valor definitivo y el descuento se validan en el servidor al reservar.</small>
                </fieldset>

                {error && <p role="alert">{error}</p>}
                <button
                    type="submit"
                    disabled={enviando || cargandoHorarios || !horario}
                >
                    {enviando ? "Confirmando..." : "Confirmar solicitud de cita"}
                </button>
            </form>

            {confirmacion && (
                <section aria-live="polite">
                    <h3>¡Cita confirmada!</h3>
                    <p><strong>Código de cita:</strong> {confirmacion.cita.codigo_cita}</p>
                    <p>
                        <strong>Descuento aplicado:</strong>{" "}
                        {formatoMoneda(confirmacion.cita.descuento_aplicado)}
                    </p>
                    <p><strong>Total a pagar:</strong> {formatoMoneda(confirmacion.total_a_pagar)}</p>
                </section>
            )}
        </section>
    );
}

export default ScheduleAppointment;
