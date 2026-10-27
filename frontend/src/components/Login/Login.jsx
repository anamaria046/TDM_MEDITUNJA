import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { mensajeError } from "../../auth/api.js";

function Login() {
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
        <main>
            <h1>Inicia sesión</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Correo electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="username"
                        maxLength="254"
                        placeholder="nombre@correo.com"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="contrasena">Contraseña</label>
                    <input
                        type={mostrarContrasena ? "text" : "password"}
                        id="contrasena"
                        name="contrasena"
                        autoComplete="current-password"
                        maxLength="128"
                        required
                    />
                    <button
                        type="button"
                        aria-pressed={mostrarContrasena}
                        onClick={() => setMostrarContrasena((actual) => !actual)}
                    >
                        {mostrarContrasena ? "Ocultar" : "Mostrar"}
                    </button>
                </div>

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={enviando}>
                    {enviando ? "Ingresando..." : "Ingresar"}
                </button>
            </form>

            <p>
                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
            </p>
        </main>
    );
}

export default Login;
