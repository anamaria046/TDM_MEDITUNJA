import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, MoveLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../auth/api.js";
import Hero from "../Hero/Hero.jsx";
import NavbarUser from "../user/NavbarUser/NavbarUser.jsx";
import styles from "./NFCVinculation.module.css";

function NFCVinculation() {
    const { sesion } = useAuth();
    const [tarjeta, setTarjeta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [mensaje, setMensaje] = useState("");
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

    async function vincularTarjeta() {
        setMensaje("");
        setError("");
        setProcesando(true);
        try {
            const respuesta = await apiRequest("/nfc/tarjeta", {
                method: "POST",
                headers: { Authorization: `Bearer ${sesion.accessToken}` },
            });
            setTarjeta(respuesta.data);
            setMensaje(respuesta.mensaje);
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setProcesando(false);
        }
    }

    async function desvincularTarjeta() {
        setMensaje("");
        setError("");
        setProcesando(true);
        try {
            await apiRequest("/nfc/tarjeta", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${sesion.accessToken}` },
            });
            setTarjeta(null);
            setMensaje("Tarjeta desvinculada.");
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setProcesando(false);
        }
    }

    return (
        <>
            <NavbarUser />
            <Hero
                label="Mi cuenta"
                title="Vinculación de tarjeta NFC"
                description="Administra la tarjeta asociada a tu perfil."
            />

            <main className={styles.page}>
                <Link className={styles.backLink} to="/perfilUsuario">
                    <MoveLeft size={18} aria-hidden="true" />
                    Volver al perfil
                </Link>

                <div className={styles.demoNotice} role="note">
                    <ShieldCheck size={22} aria-hidden="true" />
                    <p>
                        El lector ACR122U debe estar conectado al equipo donde se ejecuta el
                        backend. La tarjeta se asocia a tu cuenta en el servidor; su UID identifica
                        la tarjeta, pero no es una credencial criptográfica ni habilita pagos.
                    </p>
                </div>

                <section className={styles.card} aria-labelledby="card-status-heading">
                    <div className={styles.cardIcon} aria-hidden="true">
                        <CreditCard size={26} />
                    </div>
                    <div className={styles.cardDetails}>
                        <h2 id="card-status-heading">Estado de tu tarjeta</h2>
                        {cargando ? (
                            <p role="status">Consultando tu tarjeta...</p>
                        ) : tarjeta ? (
                            <>
                                <p className={styles.linkedStatus} role="status">Tarjeta vinculada</p>
                                <p className={styles.cardId}>
                                    Identificador terminado en: <strong>{tarjeta.identificador}</strong>
                                </p>
                            </>
                        ) : (
                            <p className={styles.unlinkedStatus} role="status">No tienes una tarjeta vinculada</p>
                        )}
                    </div>
                </section>

                <section className={styles.formCard} aria-labelledby="link-card-heading">
                    <h2 id="link-card-heading">
                        {tarjeta ? "Cambiar tarjeta vinculada" : "Vincular tarjeta"}
                    </h2>
                    <p className={styles.description}>
                        Acerca la tarjeta al lector ACR122U y espera a que se complete la lectura.
                    </p>

                    <div className={styles.form}>
                        <button className={styles.primaryButton} type="button" onClick={vincularTarjeta} disabled={procesando || cargando}>
                            {procesando ? "Esperando lectura..." : tarjeta ? "Leer y cambiar tarjeta" : "Leer y vincular tarjeta"}
                        </button>
                    </div>

                    {tarjeta && (
                        <button className={styles.secondaryButton} type="button" onClick={desvincularTarjeta} disabled={procesando}>
                            Desvincular tarjeta
                        </button>
                    )}
                    {mensaje && <p className={styles.successMessage} role="status">{mensaje}</p>}
                    {error && <p className={styles.errorMessage} role="alert">{error}</p>}
                </section>
            </main>
        </>
    );
}

export default NFCVinculation;
