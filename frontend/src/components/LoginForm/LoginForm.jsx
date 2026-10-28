import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Nfc } from "lucide-react";
import { useAuth } from "../../auth/useAuth.js";
import { mensajeError } from "../../auth/api.js";

import styles from "./Login.module.css";

function LoginForm() {
    const { sesion, iniciarSesion } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);

    if (sesion) {
        return <Navigate to="/citas" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setEnviando(true);

        const datos = new FormData(event.currentTarget);
        try {
            await iniciarSesion({
                email: datos.get("email").trim(),
                contrasena: datos.get("contrasena"),
            });
            navigate(location.state?.from?.pathname || "/citas", { replace: true });
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className={styles.Login}>
            <h4 className={styles.subtitle}>Inicio de sesión</h4>
            <h1 className={styles.title}>Ingresa a tu cuenta</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="username"
                        maxLength="254"
                        placeholder="Ingresa tu correo electrónico"
                        required
                    />
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

                <button type="submit" disabled={enviando} className={styles.btn}>
                    {enviando ? "Iniciando sesión..." : "Iniciar sesión"}
                </button>
            </form>

            <hr className={styles.divider}></hr>

            <button
                type="button"
                className={styles.nfcButton}
                >
                <span className={styles.nfcIcon}>
                    <Nfc size={28} />
                </span>

                <span>
                    <strong>Iniciar sesión con tarjeta NFC</strong>
                    <br />
                    <small>Acerca tu tarjeta al lector</small>
                </span>
            </button>

            <p className={styles.registerLink}>
                ¿No tienes cuenta? <Link to="/registro" className={styles.registerLinkAnchor}>Regístrate aquí</Link>
            </p>
        </main>
    );
}

export default LoginForm;
