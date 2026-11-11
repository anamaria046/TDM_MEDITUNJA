import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../auth/api.js";
import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";

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
            .then((respuesta) => {
                if (activa) {
                    setTarjeta(respuesta.data.vinculada ? respuesta.data : null);
                }
            })
            .catch((errorSolicitud) => {
                if (activa) setErrorTarjeta(mensajeError(errorSolicitud));
            })
            .finally(() => {
                if (activa) setCargandoTarjeta(false);
            });

        apiRequest("/wallet", { headers })
            .then((respuesta) => {
                if (activa) setSaldo(respuesta.data.saldo);
            })
            .catch((errorSolicitud) => {
                if (activa) setErrorSaldo(mensajeError(errorSolicitud));
            })
            .finally(() => {
                if (activa) setCargandoSaldo(false);
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
            <main>
                <header>
                    <span>BILLETERA MEDITUNJA</span>
                    <h1>Recarga de saldo</h1>
                    <p>
                        Consulta tu billetera TunjaAPI y recarga saldo para utilizarlo en
                        citas y transporte.
                    </p>
                </header>

                <section aria-label="Resumen de billetera">
                    <h2>Saldo de billetera</h2>
                    {cargandoSaldo ? (
                        <p role="status">Consultando saldo...</p>
                    ) : saldo !== null ? (
                        <p><strong>{formatoPesos.format(saldo)}</strong></p>
                    ) : (
                        <p role="alert">{errorSaldo}</p>
                    )}
                    {errorSaldo && saldo !== null && <p role="alert">{errorSaldo}</p>}

                    <h3>Tarjeta NFC vinculada</h3>
                    {cargandoTarjeta ? (
                        <p role="status">Consultando tarjeta...</p>
                    ) : tarjeta ? (
                        <p>Identificador terminado en {tarjeta.identificador}</p>
                    ) : errorTarjeta ? (
                        <p role="alert">{errorTarjeta}</p>
                    ) : (
                        <p>No tienes una tarjeta vinculada.</p>
                    )}
                    <Link to="/vinculacionNFC">Administrar tarjeta NFC</Link>
                </section>

                <form onSubmit={enviarRecarga} aria-labelledby="recharge-title">
                    <h2 id="recharge-title">Acreditar saldo</h2>
                    <p>Selecciona un monto. El mínimo es $100 y el máximo por recarga es $500.000.</p>
                    <fieldset>
                        <legend>Medio de pago (simulado)</legend>
                        {metodosPago.map(({ id, nombre }) => (
                            <label key={id}>
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
                    </fieldset>
                    <p>
                        El pago con estos medios es simulado: no se solicitan datos
                        bancarios ni se realiza un cobro. Al confirmar, se solicitará a
                        TunjaAPI la acreditación del monto; el saldo cambiará si la API
                        confirma la operación.
                    </p>
                    <fieldset>
                        <legend>Montos sugeridos</legend>
                        {montosSugeridos.map((montoSugerido) => (
                            <label key={montoSugerido}>
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
                    </fieldset>

                    <label htmlFor="otro-monto">Otro monto</label>
                    <input
                        id="otro-monto"
                        type="number"
                        min="100"
                        max="500000"
                        step="1"
                        value={otroMonto}
                        onChange={(evento) => setOtroMonto(evento.target.value)}
                        placeholder="Ingresa un monto en pesos"
                    />

                    <p>
                        Monto a acreditar:{" "}
                        <strong>
                            {formatoPesos.format(otroMonto === "" ? monto : Number(otroMonto) || 0)}
                        </strong>
                    </p>
                    <button
                        type="submit"
                        disabled={procesando || cargandoSaldo || saldo === null}
                    >
                        {procesando ? "Confirmando recarga..." : "Simular pago y recargar"}
                    </button>
                    {mensaje && <p role="status">{mensaje}</p>}
                    {errorRecarga && <p role="alert">{errorRecarga}</p>}
                </form>

                <aside>
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
