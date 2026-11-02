import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/useAdminAuth.js";
import { mensajeError } from "../auth/api.js";

function AdminLogin() {
    const { usuario, iniciarSesion } = useAdminAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);

    if (usuario?.rol === "administrador") {
        return <Navigate to="/perfilAdministrador" replace />;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setEnviando(true);
        const datos = new FormData(event.currentTarget);

        try {
            await iniciarSesion({
                tipo_documento: datos.get("tipoDocumento"),
                numero_documento: datos.get("numeroDocumento").trim(),
                contrasena: datos.get("contrasena"),
            });
            navigate("/perfilAdministrador", { replace: true });
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main>
            <h1>Acceso de administración EPS</h1>
            <p>Ingresa con la cuenta administrativa habilitada para tu EPS.</p>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="tipo-documento-admin">Tipo de documento</label>
                    <select id="tipo-documento-admin" name="tipoDocumento" defaultValue="CC">
                        <option value="CC">Cédula de ciudadanía</option>
                        <option value="CE">Cédula de extranjería</option>
                        <option value="PAS">Pasaporte</option>
                        <option value="TI">Tarjeta de identidad</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="documento-admin">Número de documento</label>
                    <input id="documento-admin" name="numeroDocumento" autoComplete="username" required />
                </div>
                <div>
                    <label htmlFor="contrasena-admin">Contraseña</label>
                    <input
                        id="contrasena-admin"
                        name="contrasena"
                        type="password"
                        autoComplete="current-password"
                        maxLength="128"
                        required
                    />
                </div>
                {error && <p role="alert">{error}</p>}
                <button type="submit" disabled={enviando}>
                    {enviando ? "Validando..." : "Ingresar"}
                </button>
            </form>
            <p><Link to="/login">Volver al inicio de sesión</Link></p>
        </main>
    );
}

export default AdminLogin;
