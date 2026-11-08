import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../auth/api.js";
import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";

function RechargeBalanceModule() {
    const { sesion } = useAuth();
    const [tarjeta, setTarjeta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activa = true;
        apiRequest("/nfc/tarjeta", {
            headers: { Authorization: `Bearer ${sesion.accessToken}` },
        }).then((respuesta) => {
            if (activa) setTarjeta(respuesta.data.vinculada ? respuesta.data : null);
        }).catch((errorSolicitud) => {
            if (activa) setError(mensajeError(errorSolicitud));
        }).finally(() => {
            if (activa) setCargando(false);
        });
        return () => {
            activa = false;
        };
    }, [sesion.accessToken]);

    return (
        <>
            <NavbarUser />
            <main>
                <header>
                    <span>BILLETERA MEDITUNJA</span>
                    <h1>Recarga de tarjeta</h1>
                    <p>Consulta el estado de la tarjeta asociada a tu cuenta.</p>
                </header>

                <section aria-label="Estado de la tarjeta">
                    <h2>Tarjeta NFC</h2>
                    {cargando && <p role="status">Consultando la tarjeta...</p>}
                    {!cargando && !error && (
                        tarjeta
                            ? <p>Vinculada · identificador terminado en {tarjeta.identificador}</p>
                            : <p>No tienes una tarjeta vinculada.</p>
                    )}
                    {error && <p role="alert">{error}</p>}
                    <Link to="/vinculacionNFC">Administrar tarjeta</Link>
                </section>

                <section aria-labelledby="recharge-status-title">
                    <h2 id="recharge-status-title">Recargas no disponibles</h2>
                    <p role="status">
                        Esta aplicación todavía no tiene una pasarela de pago ni un servicio
                        de saldo conectado. No se aceptará un pago ni se modificará el saldo
                        hasta integrar y configurar un proveedor.
                    </p>
                </section>
            </main>
        </>
    );
}

export default RechargeBalanceModule;
