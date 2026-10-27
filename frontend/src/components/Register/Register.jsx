import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { mensajeError } from "../../auth/api.js";

function Register() {
    const { sesion, registrar } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    if (sesion) {
        return <Navigate to="/citas" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        const formulario = event.currentTarget;
        const datos = new FormData(formulario);
        const contrasena = datos.get("contrasena");
        if (contrasena !== datos.get("confirmarContrasena")) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setEnviando(true);
        try {
            await registrar({
                email: datos.get("email").trim(),
                contrasena,
                nombre: `${datos.get("nombres").trim()} ${datos.get("apellidos").trim()}`,
                documento: datos.get("documento").trim(),
                perfil: datos.get("perfil"),
                descuento: 0,
            });
            navigate("/citas", { replace: true });
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main>
            <h1>Crear cuenta</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="nombres">Nombres</label>
                    <input
                        type="text"
                        id="nombres"
                        name="nombres"
                        autoComplete="given-name"
                        maxLength="50"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="apellidos">Apellidos</label>
                    <input
                        type="text"
                        id="apellidos"
                        name="apellidos"
                        autoComplete="family-name"
                        maxLength="50"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="documento">Número de documento</label>
                    <input
                        type="text"
                        id="documento"
                        name="documento"
                        autoComplete="off"
                        maxLength="40"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="perfil">Perfil</label>
                    <select id="perfil" name="perfil" defaultValue="general" required>
                        <option value="general">General</option>
                        <option value="estudiante">Estudiante</option>
                        <option value="adulto_mayor">Adulto mayor</option>
                        <option value="empleado">Empleado</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="email-registro">Correo electrónico</label>
                    <input
                        type="email"
                        id="email-registro"
                        name="email"
                        autoComplete="email"
                        maxLength="254"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="contrasena-registro">Contraseña (mínimo 8 caracteres)</label>
                    <input
                        type={mostrarContrasena ? "text" : "password"}
                        id="contrasena-registro"
                        name="contrasena"
                        autoComplete="new-password"
                        minLength="8"
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

                <div>
                    <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
                    <input
                        type={mostrarConfirmacion ? "text" : "password"}
                        id="confirmar-contrasena"
                        name="confirmarContrasena"
                        autoComplete="new-password"
                        minLength="8"
                        maxLength="128"
                        required
                    />
                    <button
                        type="button"
                        aria-pressed={mostrarConfirmacion}
                        onClick={() => setMostrarConfirmacion((actual) => !actual)}
                    >
                        {mostrarConfirmacion ? "Ocultar" : "Mostrar"}
                    </button>
                </div>

                {error && <p role="alert">{error}</p>}

                <button type="submit" disabled={enviando}>
                    {enviando ? "Creando cuenta..." : "Registrarse"}
                </button>
            </form>

            <p>
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link>
            </p>
        </main>
    );
}

export default Register;
