import { useEffect, useMemo, useState } from "react";
import { apiRequest, mensajeError } from "../../auth/api.js";
import { useAdminAuth } from "../../auth/useAdminAuth.js";
import Filter from "../../components/Filter/Filter.jsx";
import styles from "./AdminRechargeModule.module.css";

const montosSugeridos = [10000, 20000, 50000, 100000];
const metodosPago = [
    { id: "nequi", nombre: "Nequi" },
    { id: "daviplata", nombre: "Daviplata" },
    { id: "tarjeta", nombre: "Tarjeta débito o crédito" },
    { id: "pse", nombre: "PSE" },
];
const formatoPesos = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

function AdminRechargeModule() {
    const { token, usuario } = useAdminAuth();
    const [afiliados, setAfiliados] = useState([]);
    const [afiliadoId, setAfiliadoId] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [filtroSaldo, setFiltroSaldo] = useState("todos");
    const [monto, setMonto] = useState(20000);
    const [otroMonto, setOtroMonto] = useState("");
    const [metodoPago, setMetodoPago] = useState("nequi");
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [errorCarga, setErrorCarga] = useState("");
    const [errorRecarga, setErrorRecarga] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        let activa = true;
        apiRequest("/admin/recargas/afiliados", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((respuesta) => {
                if (!activa) return;
                setAfiliados(respuesta.data);
                setAfiliadoId(respuesta.data.length ? String(respuesta.data[0].id) : "");
            })
            .catch((errorSolicitud) => {
                if (activa) setErrorCarga(mensajeError(errorSolicitud));
            })
            .finally(() => {
                if (activa) setCargando(false);
            });

        return () => {
            activa = false;
        };
    }, [token]);

    const afiliadosVisibles = useMemo(() => {
        const termino = busqueda.trim().toLocaleLowerCase("es");
        return afiliados.filter((afiliado) => {
            const coincideBusqueda = !termino || [
                afiliado.nombre,
                afiliado.tipoDocumento,
                afiliado.numeroDocumento,
                afiliado.email,
            ].join(" ").toLocaleLowerCase("es").includes(termino);
            const coincideSaldo = filtroSaldo === "todos" ||
                (filtroSaldo === "con-saldo" && afiliado.saldo > 0) ||
                (filtroSaldo === "sin-saldo" && afiliado.saldo === 0);
            return coincideBusqueda && coincideSaldo;
        });
    }, [afiliados, busqueda, filtroSaldo]);

    const afiliadoSeleccionado = afiliados.find(
        (afiliado) => String(afiliado.id) === afiliadoId
    );

    function seleccionarAfiliado(id) {
        setAfiliadoId(String(id));
        setErrorRecarga("");
        setMensaje("");
    }

    async function enviarRecarga(evento) {
        evento.preventDefault();
        const montoFinal = otroMonto === "" ? monto : Number(otroMonto);
        if (!afiliadoSeleccionado) {
            setErrorRecarga("Selecciona un afiliado activo de tu EPS.");
            setMensaje("");
            return;
        }
        if (!Number.isSafeInteger(montoFinal) || montoFinal < 100 || montoFinal > 500000) {
            setErrorRecarga("Ingresa un monto entero entre $100 y $500.000.");
            setMensaje("");
            return;
        }

        setProcesando(true);
        setErrorRecarga("");
        setMensaje("");
        try {
            const respuesta = await apiRequest(
                `/admin/recargas/afiliados/${afiliadoSeleccionado.id}`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ monto: montoFinal, metodoPago }),
                },
            );
            setAfiliados((actuales) => actuales.map((afiliado) =>
                afiliado.id === afiliadoSeleccionado.id
                    ? { ...afiliado, saldo: respuesta.data.saldo }
                    : afiliado
            ));
            setMensaje(
                `Simulación de pago con ${
                    metodosPago.find(({ id }) => id === metodoPago).nombre
                } aprobada. Se acreditaron ${formatoPesos.format(montoFinal)} a la billetera de ${
                    afiliadoSeleccionado.nombre
                }.`,
            );
        } catch (errorSolicitud) {
            setErrorRecarga(
                `${mensajeError(errorSolicitud)} Si no estás seguro del resultado, verifica el saldo antes de intentarlo de nuevo.`
            );
        } finally {
            setProcesando(false);
        }
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <span>ADMINISTRACIÓN · {usuario?.eps || "EPS"}</span>
                <h1>Recarga de saldo</h1>
                <p>
                    Recarga las billeteras de afiliados aprobados de tu EPS. Selecciona
                    una persona para consultar el saldo y registrar la recarga.
                </p>
            </header>

            <section className={styles.panelAfiliados} aria-labelledby="afiliados-title">
                <div className={styles.panelHeading}>
                    <div>
                        <h2 id="afiliados-title">Afiliados activos</h2>
                        <p>Solo aparecen cuentas activas y afiliaciones aprobadas de tu EPS.</p>
                    </div>
                    <span className={styles.count}>{afiliadosVisibles.length} afiliados</span>
                </div>

                <Filter
                    id="recarga-admin"
                    searchValue={busqueda}
                    onSearchChange={setBusqueda}
                    searchLabel="Buscar afiliado"
                    searchPlaceholder="Nombre, documento o correo"
                    filterValue={filtroSaldo}
                    onFilterChange={setFiltroSaldo}
                    filterLabel="Filtrar por saldo"
                    filterOptions={[
                        { value: "todos", label: "Todos los saldos" },
                        { value: "con-saldo", label: "Con saldo" },
                        { value: "sin-saldo", label: "Sin saldo" },
                    ]}
                />

                {cargando && <p className={styles.notice} role="status">Consultando afiliados activos...</p>}
                {errorCarga && <p className={styles.error} role="alert">{errorCarga}</p>}
                {!cargando && !errorCarga && afiliados.length === 0 && (
                    <p className={styles.notice} role="status">
                        No hay afiliados aprobados, activos y con tarjeta NFC vinculada disponibles para recarga.
                    </p>
                )}
                {!cargando && !errorCarga && afiliados.length > 0 && afiliadosVisibles.length === 0 && (
                    <p className={styles.notice} role="status">
                        No hay afiliados que coincidan con los filtros seleccionados.
                    </p>
                )}

                {afiliadosVisibles.length > 0 && (
                    <ul className={styles.affiliateList} aria-label="Afiliados disponibles para recarga">
                        {afiliadosVisibles.map((afiliado) => (
                            <li key={afiliado.id}>
                                <button
                                    type="button"
                                    className={`${styles.affiliate} ${
                                        String(afiliado.id) === afiliadoId ? styles.selected : ""
                                    }`}
                                    aria-pressed={String(afiliado.id) === afiliadoId}
                                    onClick={() => seleccionarAfiliado(afiliado.id)}
                                >
                                    <span className={styles.affiliateInfo}>
                                        <strong>{afiliado.nombre}</strong>
                                        <span>{afiliado.tipoDocumento} {afiliado.numeroDocumento}</span>
                                        <span>{afiliado.email}</span>
                                    </span>
                                    <span className={styles.affiliateBalance}>
                                        {formatoPesos.format(afiliado.saldo)}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className={styles.rechargePanel} aria-labelledby="recharge-title">
                <h2 id="recharge-title">Datos de la recarga</h2>
                {afiliadoSeleccionado ? (
                    <>
                        <div className={styles.walletSummary}>
                            <div>
                                <span>Afiliado seleccionado</span>
                                <strong>{afiliadoSeleccionado.nombre}</strong>
                            </div>
                            <div>
                                <span>Saldo actual</span>
                                <strong>{formatoPesos.format(afiliadoSeleccionado.saldo)}</strong>
                            </div>
                        </div>

                        <form onSubmit={enviarRecarga}>
                            <fieldset className={styles.fieldset}>
                                <legend>Medio de pago (simulado)</legend>
                                <div className={styles.methodOptions}>
                                    {metodosPago.map(({ id, nombre }) => (
                                        <label key={id} className={styles.methodOption}>
                                            <input
                                                type="radio"
                                                name="metodo-pago-admin"
                                                value={id}
                                                checked={metodoPago === id}
                                                onChange={() => setMetodoPago(id)}
                                            />
                                            {nombre}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <p className={styles.simulationNotice}>
                                El pago con estos medios es simulado: no se solicitan datos
                                bancarios ni se realiza un cobro. Al confirmar, TunjaAPI
                                acreditará el monto en la billetera del afiliado.
                            </p>

                            <fieldset className={styles.fieldset}>
                                <legend>Montos sugeridos</legend>
                                <div className={styles.amountOptions}>
                                    {montosSugeridos.map((montoSugerido) => (
                                        <label key={montoSugerido} className={styles.amountOption}>
                                            <input
                                                type="radio"
                                                name="monto-recarga-admin"
                                                value={montoSugerido}
                                                checked={otroMonto === "" && monto === montoSugerido}
                                                onChange={() => {
                                                    setMonto(montoSugerido);
                                                    setOtroMonto("");
                                                }}
                                            />
                                            {formatoPesos.format(montoSugerido)}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>

                            <label className={styles.customAmountLabel} htmlFor="otro-monto-admin">
                                Otro monto
                            </label>
                            <input
                                className={styles.customAmount}
                                id="otro-monto-admin"
                                type="number"
                                min="100"
                                max="500000"
                                step="1"
                                value={otroMonto}
                                onChange={(evento) => setOtroMonto(evento.target.value)}
                                placeholder="Ingresa un monto en pesos"
                            />

                            <p className={styles.amountTotal}>
                                Monto a acreditar:{" "}
                                <strong>
                                    {formatoPesos.format(otroMonto === "" ? monto : Number(otroMonto) || 0)}
                                </strong>
                            </p>
                            <button
                                className={styles.submitButton}
                                type="submit"
                                disabled={procesando || cargando}
                            >
                                {procesando ? "Procesando recarga..." : "Simular pago y recargar"}
                            </button>
                            {mensaje && <p className={styles.success} role="status">{mensaje}</p>}
                            {errorRecarga && <p className={styles.error} role="alert">{errorRecarga}</p>}
                        </form>
                    </>
                ) : (
                    <p className={styles.notice}>
                        Selecciona un afiliado de la lista para consultar su saldo y recargar.
                    </p>
                )}
            </section>
        </main>
    );
}

export default AdminRechargeModule;
