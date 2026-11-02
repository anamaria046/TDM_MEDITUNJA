import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import { mensajeError } from "../../auth/api.js";

function RegisterForm() {
    const { sesion, registrar } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    if (sesion) {
        return (
            <Navigate
                to={sesion.usuario?.estado_afiliacion === "aprobado" ? "/citas" : "/perfilUsuario"}
                replace
            />
        );
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
        datos.delete("confirmarContrasena");
        datos.set("nombre", `${datos.get("nombres").trim()} ${datos.get("apellidos").trim()}`);
        datos.set("tipo_documento", datos.get("tipoDocumento"));
        datos.set("numero_documento", datos.get("numeroDocumento").trim());
        datos.delete("tipoDocumento");
        datos.delete("numeroDocumento");

        setEnviando(true);
        try {
            await registrar(datos);
            navigate("/login", {
                replace: true,
                state: { mensaje: "Cuenta creada. Inicia sesión mientras tu EPS valida la afiliación." },
            });
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
                    <label htmlFor="tipo-documento-registro">Tipo de documento</label>
                    <select
                        id="tipo-documento-registro"
                        name="tipoDocumento"
                        defaultValue="CC"
                        required
                    >
                        <option value="CC">Cédula de ciudadanía</option>
                        <option value="TI">Tarjeta de identidad</option>
                        <option value="CE">Cédula de extranjería</option>
                        <option value="PAS">Pasaporte</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="numero-documento-registro">Número de documento</label>
                    <input
                        type="text"
                        id="numero-documento-registro"
                        name="numeroDocumento"
                        autoComplete="off"
                        maxLength="30"
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
                    <label htmlFor="eps-registro">EPS</label>
                    <select id="eps-registro" name="eps" defaultValue="" required>
                        <option value="" disabled>Selecciona tu EPS</option>
                        <option value="Nueva EPS">Nueva EPS</option>
                        <option value="Famisanar">Famisanar</option>
                        <option value="Sanitas">Sanitas</option>
                        <option value="SURA">SURA</option>
                        <option value="Salud Total">Salud Total</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="comprobante-afiliacion">Comprobante de afiliación (PDF, JPG o PNG; máximo 5 MB)</label>
                    <input
                        type="file"
                        id="comprobante-afiliacion"
                        name="comprobante"
                        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                        required
                    />
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
                    <label htmlFor="telefono-registro">Teléfono</label>
                    <input
                        type="tel"
                        id="telefono-registro"
                        name="telefono"
                        autoComplete="tel"
                        maxLength="30"
                        pattern="\+?[0-9\s()-]{7,30}"
                        placeholder="Ej.: 3185777316"
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

export default RegisterForm;
