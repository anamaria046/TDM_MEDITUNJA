import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Nfc } from "lucide-react";
import { useAuth } from "../../auth/useAuth.js";
import { useAdminAuth } from "../../auth/useAdminAuth.js";
import { mensajeError } from "../../auth/api.js";

import styles from "./Login.module.css";

function LoginForm() {
    const { sesion, iniciarSesion } = useAuth();
    const { usuario, iniciarSesion: iniciarSesionAdmin } = useAdminAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [tipoDocumento, setTipoDocumento] = useState("CC");
    const [numeroDocumento, setNumeroDocumento] = useState("");
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [esperaReintento, setEsperaReintento] = useState(0);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

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
        const credenciales = {
            tipo_documento: tipoDocumento,
            numero_documento: datos.get("numeroDocumento").trim(),
            contrasena: datos.get("contrasena"),
        };
        try {
            if (tipoDocumento === "NIT") {
                await iniciarSesionAdmin(credenciales);
                navigate(location.state?.from?.pathname || "/perfilAdministrador", { replace: true });
            } else {
                await iniciarSesion(credenciales);
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

    return (
        <main className={styles.Login}>
            <h4 className={styles.subtitle}>Inicio de sesión</h4>
            <h1 className={styles.title}>Ingresa a tu cuenta</h1>
            {(location.state?.notice || location.state?.mensaje) && (
                <p role="status">{location.state.notice || location.state.mensaje}</p>
            )}
            <form onSubmit={handleSubmit}>
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

                {error && <p role="alert">{error}</p>}

                <button
                    type="submit"
                    disabled={enviando || esperaReintento > 0}
                    className={styles.btn}
                >
                    {enviando
                        ? "Iniciando sesión..."
                        : esperaReintento > 0
                            ? `Intenta de nuevo en ${esperaReintento} s`
                            : "Iniciar sesión"}
                </button>
            </form>

            <hr className={styles.divider}></hr>

            <button
                type="button"
                className={styles.nfcButton}
                disabled
                title="El inicio de sesión NFC requiere soporte de autenticación de TunjaAPI."
            >
                <span className={styles.nfcIcon}>
                    <Nfc size={28} />
                </span>
                <span>
                    <strong>Inicio de sesión NFC no disponible</strong>
                    <br />
                    <small>TunjaAPI aún no ofrece autenticación con tarjeta</small>
                </span>
            </button>
            <p className={styles.registerLink}>
                ¿No tienes cuenta? <Link to="/registro" className={styles.registerLinkAnchor}>Regístrate aquí</Link>
            </p>
        </main>
    );
}

export default LoginForm;
