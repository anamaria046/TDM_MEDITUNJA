import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Nfc } from "lucide-react";
import { useAuth } from "../../auth/useAuth.js";
import { useAdminAuth } from "../../auth/useAdminAuth.js";
import { mensajeError } from "../../auth/api.js";

import styles from "./Login.module.css";

const PUENTE_NFC_URL = "http://127.0.0.1:8765";

function LoginForm() {
    const { sesion, iniciarSesion, iniciarSesionTarjeta } = useAuth();
    const { usuario, iniciarSesion: iniciarSesionAdmin } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [tipoDocumento, setTipoDocumento] = useState("CC");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [esperaReintento, setEsperaReintento] = useState(0);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [modoTarjeta, setModoTarjeta] = useState(false);
    const [uidTarjeta, setUidTarjeta] = useState("");
    const [leyendoTarjeta, setLeyendoTarjeta] = useState(false);

    useEffect(() => {
        if (esperaReintento <= 0) return undefined;
        const temporizador = window.setTimeout(
            () => setEsperaReintento((actual) => Math.max(actual - 1, 0)),
            1000,
        );
        return () => window.clearTimeout(temporizador);
    }, [esperaReintento]);

    if (sesion) {
        return (
            <Navigate
                to={sesion.usuario?.estado_afiliacion === "aprobado" ? "/home" : "/perfilUsuario"}
                replace
            />
        );
    }
    if (usuario?.rol === "administrador") {
        return <Navigate to="/perfilAdministrador" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setEnviando(true);

        const datos = new FormData(event.currentTarget);
        try {
            if (modoTarjeta) {
                await iniciarSesionTarjeta(uidTarjeta.trim());
                navigate(location.state?.from?.pathname || "/home", { replace: true });
            } else if (tipoDocumento === "NIT") {
                await iniciarSesionAdmin({
                    tipo_documento: tipoDocumento,
                    numero_documento: datos.get("numeroDocumento").trim(),
                    contrasena: datos.get("contrasena"),
                });
                navigate(location.state?.from?.pathname || "/perfilAdministrador", { replace: true });
            } else {
                await iniciarSesion({
                    tipo_documento: tipoDocumento,
                    numero_documento: datos.get("numeroDocumento").trim(),
                    contrasena: datos.get("contrasena"),
                });
                navigate(location.state?.from?.pathname || "/home", { replace: true });
            }
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
            const segundos = Number(errorSolicitud?.retryAfter);
            if (
                errorSolicitud?.status === 429 &&
                Number.isFinite(segundos) &&
                segundos > 0
            ) {
                setEsperaReintento(Math.ceil(segundos));
            }
        } finally {
            setEnviando(false);
        }
    }

    async function iniciarSesionConUid(uid) {
        setError("");
        setEnviando(true);
        try {
            await iniciarSesionTarjeta(uid);
            navigate(location.state?.from?.pathname || "/home", { replace: true });
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
            const segundos = Number(errorSolicitud?.retryAfter);
            if (errorSolicitud?.status === 429 && Number.isFinite(segundos) && segundos > 0) {
                setEsperaReintento(Math.ceil(segundos));
            }
        } finally {
            setEnviando(false);
        }
    }

    async function leerUidTarjeta() {
        setError("");
        setUidTarjeta("");
        setLeyendoTarjeta(true);
        try {
            const estado = await fetch(`${PUENTE_NFC_URL}/health`);
            if (!estado.ok) {
                throw new Error("El puente NFC no está disponible. Abre nfc-bridge/Puente.bat e inténtalo de nuevo.");
            }
            const respuesta = await fetch(`${PUENTE_NFC_URL}/scan`, {
                signal: AbortSignal.timeout(35000),
            });
            const datos = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(datos.error || "No fue posible leer la tarjeta NFC.");
            }
            if (typeof datos.uid !== "string" || !/^(?:[A-F0-9]{2}){2,20}$/i.test(datos.uid)) {
                throw new Error("El puente devolvió un identificador NFC inválido.");
            }
            const uid = datos.uid.toUpperCase();
            setUidTarjeta(uid);
            setLeyendoTarjeta(false);
            await iniciarSesionConUid(uid);
        } catch (errorLectura) {
            if (errorLectura instanceof TypeError) {
                setError("No se pudo conectar al puente NFC. Abre nfc-bridge/Puente.bat en este equipo.");
            } else if (errorLectura.name === "TimeoutError") {
                setError("La lectura tardó demasiado. Acerca la tarjeta e inténtalo de nuevo.");
            } else {
                setError(errorLectura instanceof Error ? errorLectura.message : "No fue posible leer la tarjeta NFC.");
            }
        } finally {
            setLeyendoTarjeta(false);
        }
    }

    function cambiarModoTarjeta() {
        setError("");
        if (modoTarjeta) {
            setModoTarjeta(false);
            setUidTarjeta("");
            return;
        }
        if (tipoDocumento === "NIT") return;
        setModoTarjeta(true);
        leerUidTarjeta();
    }

    return (
        <main className={styles.Login}>
            <h4 className={styles.subtitle}>Inicio de sesión</h4>
            <h1 className={styles.title}>Ingresa a tu cuenta</h1>
            {(location.state?.notice || location.state?.mensaje) && (
                <p role="status">{location.state.notice || location.state.mensaje}</p>
            )}
            <form onSubmit={handleSubmit}>
                {modoTarjeta ? (
                    <div className={styles.formGroup}>
                        <label htmlFor="uid-tarjeta-login">Identificador de la tarjeta (UID)</label>
                        <input
                            type="text"
                            id="uid-tarjeta-login"
                            name="uid"
                            autoComplete="off"
                            value={uidTarjeta}
                            onChange={(event) => setUidTarjeta(event.target.value.replace(/[^a-f\d]/gi, "").toUpperCase())}
                            maxLength={40}
                            pattern="([A-Fa-f0-9]{2}){2,20}"
                            placeholder="Acerca tu tarjeta o ingresa el UID"
                            aria-describedby="ayuda-uid-tarjeta-login"
                            required
                        />
                        <small className={styles.fieldHint} id="ayuda-uid-tarjeta-login">
                            Acerca una tarjeta activa para ingresar; también puedes escribir el UID.
                        </small>
                        <button
                            type="button"
                            className={styles.readCardButton}
                            onClick={leerUidTarjeta}
                            disabled={leyendoTarjeta || enviando || esperaReintento > 0}
                        >
                            {leyendoTarjeta ? "Acerca la tarjeta al lector..." : "Leer tarjeta NFC"}
                        </button>
                    </div>
                ) : (
                    <div className={styles.documentRow}>
                    <div className={`${styles.formGroup} ${styles.documentType}`}>
                        <label htmlFor="tipo-documento">Tipo de documento</label>
                        <select
                            id="tipo-documento"
                            name="tipoDocumento"
                            value={tipoDocumento}
                            onChange={(event) => {
                                setTipoDocumento(event.target.value);
                                setNumeroDocumento("");
                                setError("");
                            }}
                            required
                        >
                            <option value="CC">C.C.</option>
                            <option value="TI">T.I.</option>
                            <option value="CE">C.E.</option>
                            <option value="PAS">Pasaporte</option>
                            <option value="NIT">NIT</option>
                        </select>
                    </div>

                    <div className={`${styles.formGroup} ${styles.documentNumber}`}>
                        <label htmlFor="numero-documento">Número de documento</label>
                        <input
                            type="text"
                            id="numero-documento"
                            name="numeroDocumento"
                            autoComplete="username"
                            inputMode={tipoDocumento === "PAS" || tipoDocumento === "NIT" ? "text" : "numeric"}
                            maxLength={tipoDocumento === "PAS" ? 8 : tipoDocumento === "NIT" ? 11 : 10}
                            pattern={
                                tipoDocumento === "PAS"
                                    ? "[A-Za-z]{2}[0-9]{6}"
                                    : tipoDocumento === "NIT"
                                        ? "[0-9]{9}-[0-9]"
                                        : "[0-9]{1,10}"
                            }
                            value={numeroDocumento}
                            onChange={(event) => {
                                const valor = event.target.value.toUpperCase();
                                if (tipoDocumento === "PAS") {
                                    const letras = valor.match(/^[A-Z]{0,2}/)?.[0] || "";
                                    const numeros = valor.slice(letras.length).replace(/\D/g, "").slice(0, 6);
                                    setNumeroDocumento(letras + numeros);
                                } else if (tipoDocumento === "NIT") {
                                    const digitos = valor.replace(/\D/g, "").slice(0, 10);
                                    setNumeroDocumento(
                                        digitos.length > 9
                                            ? `${digitos.slice(0, 9)}-${digitos.slice(9)}`
                                            : digitos
                                    );
                                } else {
                                    setNumeroDocumento(valor.replace(/\D/g, "").slice(0, 10));
                                }
                            }}
                            aria-describedby="ayuda-numero-documento-login"
                            required
                        />
                        <small className={styles.fieldHint} id="ayuda-numero-documento-login">
                            {tipoDocumento === "PAS"
                                ? "Dos letras al inicio seguidas de 6 números (ej.: AB123456)."
                                : tipoDocumento === "NIT"
                                    ? "9 números, guion y dígito de verificación (ej.: 900156264-2)."
                                    : "Solo números, máximo 10 dígitos."}
                        </small>
                    </div>
                </div>
                )}

                {!modoTarjeta && (
                    <div className={styles.formGroup}>
                        <label htmlFor="contrasena">Contraseña</label>
                        <div className={styles.passwordWrapper}>
                            <input
                                type={mostrarContrasena ? "text" : "password"}
                                id="contrasena"
                                name="contrasena"
                                autoComplete="current-password"
                                maxLength="128"
                                placeholder="Ingresa tu contraseña"
                                required
                            />
                            <button
                                className={styles.passwordToggle}
                                type="button"
                                aria-label={
                                    mostrarContrasena
                                        ? "Ocultar contraseña"
                                        : "Mostrar contraseña"
                                }
                                aria-pressed={mostrarContrasena}
                                onClick={() => setMostrarContrasena((actual) => !actual)}
                            >
                                {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                )}

                {error && <p role="alert">{error}</p>}

                <button
                    type="submit"
                    disabled={enviando || leyendoTarjeta || esperaReintento > 0}
                    className={styles.btn}
                >
                    {enviando
                        ? "Iniciando sesión..."
                        : esperaReintento > 0
                            ? `Intenta de nuevo en ${esperaReintento} s`
                            : modoTarjeta ? "Ingresar con tarjeta" : "Iniciar sesión"}
                </button>
            </form>

            <hr className={styles.divider}></hr>

            <button
                type="button"
                className={styles.nfcButton}
                onClick={cambiarModoTarjeta}
                disabled={tipoDocumento === "NIT" || enviando}
                aria-pressed={modoTarjeta}
            >
                <span className={styles.nfcIcon}>
                    <Nfc size={28} />
                </span>
                <span>
                    <strong>{modoTarjeta ? "Volver al inicio con documento" : "Ingresar con tarjeta NFC"}</strong>
                    <br />
                    <small>{modoTarjeta ? "Volver al acceso con documento y contraseña" : "Acerca la tarjeta para iniciar sesión sin contraseña"}</small>
                </span>
            </button>
            <p className={styles.registerLink}>
                ¿No tienes cuenta? <Link to="/registro" className={styles.registerLinkAnchor}>Regístrate aquí</Link>
            </p>
        </main>
    );
}

export default LoginForm;
