import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, MoveLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../auth/api.js";
import Nfcimage from "../../assets/NfcVinculation.svg";
import Hero from "../Hero/Hero.jsx";
import NavbarUser from "../user/NavbarUser/NavbarUser.jsx";
import styles from "./NFCVinculation.module.css";

const PUENTE_NFC_URL = "http://127.0.0.1:8765";

function NFCVinculation() {
    const { sesion } = useAuth();
    const [tarjeta, setTarjeta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [leyendo, setLeyendo] = useState(false);
    const [uid, setUid] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    const leerTarjeta = useCallback(async (signal) => {
        setError("");
        setMensaje("");
        setUid("");
        setLeyendo(true);
        try {
            const estado = await fetch(`${PUENTE_NFC_URL}/health`, { signal });
            if (!estado.ok) {
                throw new Error("El puente NFC no está disponible. Abre nfc-bridge/Puente.bat e inténtalo de nuevo.");
            }

            const respuesta = await fetch(`${PUENTE_NFC_URL}/scan`, {
                signal: signal || AbortSignal.timeout(35000),
            });
            const datos = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(datos.error || "No fue posible leer la tarjeta NFC.");
            }
            if (typeof datos.uid !== "string" || !/^(?:[A-F0-9]{2}){2,20}$/i.test(datos.uid)) {
                throw new Error("El puente devolvió un identificador NFC inválido.");
            }
            setUid(datos.uid.toUpperCase());
            setMensaje("Tarjeta leída. Confirma la vinculación.");
        } catch (errorLectura) {
            if (errorLectura.name === "AbortError") return;
            if (errorLectura instanceof TypeError) {
                setError("No se pudo conectar al puente NFC. Abre nfc-bridge/Puente.bat en este equipo.");
            } else if (errorLectura.name === "TimeoutError") {
                setError("La lectura tardó demasiado. Acerca la tarjeta e inténtalo de nuevo.");
            } else {
                setError(errorLectura instanceof Error ? errorLectura.message : "No fue posible leer la tarjeta NFC.");
            }
        } finally {
            if (!signal?.aborted) setLeyendo(false);
        }
    }, []);

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

    useEffect(() => {
        const controlador = new AbortController();
        const temporizador = window.setTimeout(() => leerTarjeta(controlador.signal), 0);
        return () => {
            window.clearTimeout(temporizador);
            controlador.abort();
        };
    }, [leerTarjeta]);

    async function vincularTarjeta(event) {
        event.preventDefault();
        if (procesando || leyendo || cargando || !uid) return;
        setMensaje("");
        setError("");
        setProcesando(true);
        try {
            const respuesta = await apiRequest("/nfc/tarjeta", {
                method: "POST",
                headers: { Authorization: `Bearer ${sesion.accessToken}` },
                body: JSON.stringify({ uid }),
            });
            setTarjeta(respuesta.data);
            setUid("");
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
                        El lector ACR122U debe estar conectado a este equipo y el puente NFC
                        iniciado. Al entrar aquí se solicita automáticamente una lectura; el
                        UID aparecerá en el campo para que confirmes la vinculación. El UID no
                        permite iniciar sesión si no está activo y asociado a tu cuenta en TunjaAPI.
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
                                <p className={tarjeta.habilitada === false ? styles.unlinkedStatus : styles.linkedStatus} role="status">
                                    {tarjeta.habilitada === false
                                        ? "Tarjeta localmente vinculada, pero no habilitada en TunjaAPI"
                                        : "Tarjeta vinculada y activa"}
                                </p>
                                <p className={styles.cardId}>
                                    Identificador terminado en: <strong>{tarjeta.identificador}</strong>
                                </p>
                                {tarjeta.habilitada === false && (
                                    <p className={styles.errorMessage} role="note">
                                        {tarjeta.estado === "asociacion_inconsistente"
                                            ? "TunjaAPI asocia esta tarjeta a otra cuenta. Pide al administrador de TunjaAPI que corrija la asociación o vincula otra tarjeta disponible."
                                            : "TunjaAPI no encuentra esta tarjeta activa. Revisa su estado o vincula otra tarjeta disponible."}
                                    </p>
                                )}
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
                    <div className={styles.nfcIcon}>
                        <img src={Nfcimage}  />
                    </div>
                    <p className={styles.description}>
                        {leyendo
                            ? "Acerca la tarjeta al lector ACR122U..."
                            : "Acerca la tarjeta al lector y confirma el UID para vincularla."}
                    </p>

                    <form className={styles.form} onSubmit={vincularTarjeta}>
                        <label htmlFor="uid-tarjeta">Identificador de la tarjeta (UID)</label>
                        <input
                            id="uid-tarjeta"
                            name="uid"
                            type="text"
                            value={uid}
                            onChange={(event) => setUid(event.target.value.replace(/[^a-f\d]/gi, "").toUpperCase())}
                            autoComplete="off"
                            maxLength={40}
                            pattern="([A-Fa-f0-9]{2}){2,20}"
                            placeholder="Ej.: 04A1B2C3D4E5F6"
                            aria-describedby="ayuda-uid-tarjeta"
                            required
                        />
                        <small id="ayuda-uid-tarjeta">
                            El UID leído aparecerá aquí. También puedes ingresarlo manualmente.
                        </small>
                        <button className={styles.primaryButton} type="submit" disabled={procesando || leyendo || cargando || !uid}>
                            {procesando ? "Vinculando..." : tarjeta ? "Vincular y cambiar tarjeta" : "Vincular tarjeta"}
                        </button>
                    </form>

                    <button className={styles.secondaryButton} type="button" onClick={leerTarjeta} disabled={leyendo || procesando || cargando}>
                        {leyendo ? "Leyendo tarjeta..." : "Leer tarjeta nuevamente"}
                    </button>

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
