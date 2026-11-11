import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../auth/api.js";
import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";
import styles from "./RechargeBalanceModule.module.css";

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

function RechargeBalanceModule() {
    const { sesion } = useAuth();
    const accessToken = sesion?.accessToken;
    const [tarjeta, setTarjeta] = useState(null);
    const [saldo, setSaldo] = useState(null);
    const [monto, setMonto] = useState(20000);
    const [otroMonto, setOtroMonto] = useState("");
    const [metodoPago, setMetodoPago] = useState("nequi");
    const [cargandoTarjeta, setCargandoTarjeta] = useState(true);
    const [cargandoSaldo, setCargandoSaldo] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [errorTarjeta, setErrorTarjeta] = useState("");
    const [errorSaldo, setErrorSaldo] = useState("");
    const [errorRecarga, setErrorRecarga] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        let activa = true;
        const headers = { Authorization: "Bearer " + accessToken };

        apiRequest("/nfc/tarjeta", { headers })
            .then(async (respuestaTarjeta) => {
                if (!activa) return;
                if (!respuestaTarjeta.data.vinculada) {
                    setTarjeta(null);
                    setCargandoTarjeta(false);
                    setCargandoSaldo(false);
                    return;
                }

                setTarjeta(respuestaTarjeta.data);
                setCargandoTarjeta(false);
                try {
                    const respuestaSaldo = await apiRequest("/wallet", { headers });
                    if (activa) setSaldo(respuestaSaldo.data.saldo);
                } catch (errorSolicitud) {
                    if (activa) setErrorSaldo(mensajeError(errorSolicitud));
                }
            })
            .catch((errorSolicitud) => {
                if (activa) setErrorTarjeta(mensajeError(errorSolicitud));
            })
            .finally(() => {
                if (activa) {
                    setCargandoTarjeta(false);
                    setCargandoSaldo(false);
                }
            });

        return () => {
            activa = false;
        };
    }, [accessToken]);

    async function actualizarSaldo() {
        const respuesta = await apiRequest("/wallet", {
            headers: { Authorization: "Bearer " + accessToken },
        });
        setSaldo(respuesta.data.saldo);
    }

    async function enviarRecarga(evento) {
        evento.preventDefault();
        if (!tarjeta) {
            setErrorRecarga("Vincula una tarjeta NFC antes de recargar saldo.");
            setMensaje("");
            return;
        }
        const montoFinal = otroMonto === "" ? monto : Number(otroMonto);
        if (!Number.isSafeInteger(montoFinal) || montoFinal < 100 || montoFinal > 500000) {
            setErrorRecarga("Ingresa un monto entero entre $100 y $500.000.");
            setMensaje("");
            return;
        }

        setProcesando(true);
        setErrorRecarga("");
        setMensaje("");
        try {
            const respuesta = await apiRequest("/wallet/topup", {
                method: "POST",
                headers: { Authorization: "Bearer " + accessToken },
                body: JSON.stringify({ monto: montoFinal }),
            });
            const metodoSeleccionado = metodosPago.find(({ id }) => id === metodoPago);
            setMensaje(
                `Simulación de pago con ${metodoSeleccionado.nombre} aprobada. ${respuesta.mensaje}`
            );
            try {
                await actualizarSaldo();
                setErrorSaldo("");
            } catch (errorSolicitud) {
                setErrorSaldo(
                    `La recarga fue acreditada, pero no se pudo actualizar el saldo mostrado: ${mensajeError(errorSolicitud)}`
                );
            }
        } catch (errorSolicitud) {
            setErrorRecarga(
                `${mensajeError(errorSolicitud)} Si no estás seguro del resultado, consulta tu saldo antes de volver a intentarlo.`
            );
        } finally {
            setProcesando(false);
        }
    }

    return (
        <>
            <NavbarUser />
            <main className={styles.page}>
                <header className={styles.header}>
                    <span>BILLETERA MEDITUNJA</span>
                    <h1>Recarga de saldo</h1>
                    <p>
                        Consulta tu billetera TunjaAPI y recarga saldo para utilizarlo en
                        citas y transporte.
                    </p>
                </header>

                <section className={styles.walletPanel} aria-label="Resumen de billetera">
                    <div className={styles.walletSummary}>
                        <div>
                            <span>Saldo de billetera</span>
                            {cargandoTarjeta || cargandoSaldo ? (
                                <strong role="status">Consultando saldo...</strong>
                            ) : tarjeta && saldo !== null ? (
                                <strong className={styles.balance}>{formatoPesos.format(saldo)}</strong>
                            ) : tarjeta && (
                                <p className={styles.error} role="alert">{errorSaldo}</p>
                            )}
                        </div>
                        <div>
                            <span>Tarjeta NFC vinculada</span>
                            {cargandoTarjeta ? (
                                <strong role="status">Consultando tarjeta...</strong>
                            ) : tarjeta ? (
                                <strong>•••• {tarjeta.identificador}</strong>
                            ) : errorTarjeta ? (
                                <p className={styles.error} role="alert">{errorTarjeta}</p>
                            ) : (
                                <strong>No tienes una tarjeta vinculada</strong>
                            )}
                            <Link className={styles.cardLink} to="/vinculacionNFC">
                                Administrar tarjeta NFC
                            </Link>
                        </div>
                    </div>
                    {errorSaldo && saldo !== null && (
                        <p className={styles.error} role="alert">{errorSaldo}</p>
                    )}
                    {!cargandoTarjeta && !errorTarjeta && !tarjeta && (
                        <p className={styles.notice} role="status">
                            Vincula una tarjeta NFC para consultar o utilizar el saldo de tu billetera.
                        </p>
                    )}
                    {errorTarjeta && (
                        <p className={styles.error} role="alert">{errorTarjeta}</p>
                    )}
                </section>

                <section className={styles.rechargePanel} aria-labelledby="recharge-title">
                    <h2 id="recharge-title">Acreditar saldo</h2>
                    {cargandoTarjeta && (
                        <p className={styles.notice} role="status">Verificando tarjeta NFC...</p>
                    )}
                    {!cargandoTarjeta && !errorTarjeta && !tarjeta && (
                        <p className={styles.notice}>
                            Para recargar saldo, primero vincula una tarjeta NFC.
                            <Link to="/vinculacionNFC"> Vincular tarjeta</Link>
                        </p>
                    )}
                    <p className={styles.panelDescription}>
                        Selecciona un monto. El mínimo es $100 y el máximo por recarga es $500.000.
                    </p>
                    {tarjeta && <form onSubmit={enviarRecarga}>
                        <fieldset className={styles.fieldset}>
                            <legend>Medio de pago (simulado)</legend>
                            <div className={styles.options}>
                                {metodosPago.map(({ id, nombre }) => (
                                    <label key={id} className={styles.option}>
                                        <input
                                            type="radio"
                                            name="metodo-pago"
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
                            bancarios ni se realiza un cobro. Al confirmar, se solicitará a
                            TunjaAPI la acreditación del monto; el saldo cambiará si la API
                            confirma la operación.
                        </p>
                        <fieldset className={styles.fieldset}>
                            <legend>Montos sugeridos</legend>
                            <div className={styles.options}>
                                {montosSugeridos.map((montoSugerido) => (
                                    <label key={montoSugerido} className={styles.option}>
                                        <input
                                            type="radio"
                                            name="monto-recarga"
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

                        <div className={styles.customAmountGroup}>
                            <label htmlFor="otro-monto">Otro monto</label>
                            <input
                                className={styles.customAmount}
                                id="otro-monto"
                                type="number"
                                min="100"
                                max="500000"
                                step="1"
                                value={otroMonto}
                                onChange={(evento) => setOtroMonto(evento.target.value)}
                                placeholder="Ingresa un monto en pesos"
                            />
                        </div>

                        <p className={styles.amountTotal}>
                            <span>Monto a acreditar</span>
                            <strong>
                                {formatoPesos.format(otroMonto === "" ? monto : Number(otroMonto) || 0)}
                            </strong>
                        </p>
                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={procesando || cargandoSaldo || saldo === null}
                        >
                            {procesando ? "Confirmando recarga..." : "Simular pago y recargar"}
                        </button>
                        {mensaje && <p className={styles.success} role="status">{mensaje}</p>}
                        {errorRecarga && <p className={styles.error} role="alert">{errorRecarga}</p>}
                    </form>}
                </section>

                <aside className={styles.importantPanel}>
                    <h2>Importante</h2>
                    <p>
                        Nequi, Daviplata, tarjeta débito o crédito y PSE solo simulan el
                        pago; no hay una pasarela conectada ni se cobra a esos medios.
                        La acreditación del saldo de la billetera se solicita mediante
                        TunjaAPI y depende de la confirmación de esa API.
                    </p>
                    <p>
                        La tarjeta NFC mostrada se administra en MediTunja; su UID no está
                        sincronizado con las tarjetas de TunjaAPI. La recarga acredita el
                        saldo de la billetera de tu cuenta.
                    </p>
                </aside>
            </main>
        </>
    );
}

export default RechargeBalanceModule;
