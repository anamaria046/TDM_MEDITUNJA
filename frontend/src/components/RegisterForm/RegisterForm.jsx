import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../auth/useAuth.js";
import { mensajeError } from "../../auth/api.js";
import styles from "./RegisterForm.module.css";

function RegisterForm() {
    const { sesion, registrar } = useAuth();
    const navigate = useNavigate();
    const [paso, setPaso] = useState(1);
    const [error, setError] = useState("");
    const [enviando, setEnviando] = useState(false);
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const pasos = ["Identificación", "Afiliación", "Acceso"];

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

        if (paso < pasos.length) {
            setPaso((actual) => actual + 1);
            return;
        }

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
        <main className={styles.register}>
            <h4 className={styles.subtitle}>Registro del paciente</h4>
            <h1 className={styles.title}>Crear cuenta</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.progress} aria-label={`Paso ${paso} de ${pasos.length}`}>
                    <div className={styles.progressTrack} role="progressbar"
                        aria-valuemin="1" aria-valuemax={pasos.length} aria-valuenow={paso}
                        aria-valuetext={`Paso ${paso} de ${pasos.length}: ${pasos[paso - 1]}`}>
                        <span
                            className={styles.progressFill}
                            style={{ width: `${((paso - 1) / (pasos.length - 1)) * 100}%` }}
                        />
                    </div>
                    <ol className={styles.steps}>
                        {pasos.map((nombre, indice) => (
                            <li
                                className={paso >= indice + 1 ? styles.activeStep : ""}
                                aria-current={paso === indice + 1 ? "step" : undefined}
                                key={nombre}
                            >
                                <span className={styles.stepNumber}>{indice + 1}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                <section className={styles.fields} hidden={paso !== 1}>
                    <div className={styles.field}>
                        <label htmlFor="nombres">Nombres</label>
                        <input type="text" id="nombres" name="nombres" autoComplete="given-name" maxLength="50" required={paso === 1} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="apellidos">Apellidos</label>
                        <input type="text" id="apellidos" name="apellidos" autoComplete="family-name" maxLength="50" required={paso === 1} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="tipo-documento-registro">Tipo de documento</label>
                        <select id="tipo-documento-registro" name="tipoDocumento" defaultValue="CC" required={paso === 1}>
                            <option value="CC">Cédula de ciudadanía</option>
                            <option value="TI">Tarjeta de identidad</option>
                            <option value="CE">Cédula de extranjería</option>
                            <option value="PAS">Pasaporte</option>
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="numero-documento-registro">Número de documento</label>
                        <input type="text" id="numero-documento-registro" name="numeroDocumento" autoComplete="off" maxLength="30" required={paso === 1} />
                    </div>
                </section>

                <section className={styles.fields} hidden={paso !== 2}>
                    <div className={styles.field}>
                        <label htmlFor="perfil">Perfil</label>
                        <select id="perfil" name="perfil" defaultValue="general" required={paso === 2}>
                            <option value="general">General</option>
                            <option value="estudiante">Estudiante</option>
                            <option value="adulto_mayor">Adulto mayor</option>
                            <option value="empleado">Empleado</option>
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="eps-registro">EPS</label>
                        <select id="eps-registro" name="eps" defaultValue="" required={paso === 2}>
                            <option value="" disabled>Selecciona tu EPS</option>
                            <option value="Nueva EPS">Nueva EPS</option>
                            <option value="Famisanar">Famisanar</option>
                            <option value="Sanitas">Sanitas</option>
                            <option value="SURA">SURA</option>
                            <option value="Salud Total">Salud Total</option>
                        </select>
                    </div>
                    <div className={`${styles.field} ${styles.fullWidth}`}>
                        <label htmlFor="comprobante-afiliacion">Comprobante de afiliación (PDF, JPG o PNG; máximo 5 MB)</label>
                        <input type="file" id="comprobante-afiliacion" name="comprobante" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required={paso === 2} />
                    </div>
                </section>

                <section className={styles.fields} hidden={paso !== 3}>
                    <div className={styles.field}>
                        <label htmlFor="email-registro">Correo electrónico</label>
                        <input type="email" id="email-registro" name="email" autoComplete="email" maxLength="254" required={paso === 3} />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="telefono-registro">Teléfono</label>
                        <input type="tel" id="telefono-registro" name="telefono" autoComplete="tel" maxLength="30" pattern="\+?[0-9\s()-]{7,30}" placeholder="Ej.: 3185777316" />
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="contrasena-registro">Contraseña</label>
                        <div className={styles.passwordWrapper}>
                            <input type={mostrarContrasena ? "text" : "password"} id="contrasena-registro" name="contrasena" autoComplete="new-password" minLength="8" maxLength="128" required={paso === 3} placeholder="Minimo 8 caracteres"/>
                            <button 
                                className={styles.passwordToggle}
                                type="button" 
                                aria-pressed={mostrarContrasena} 
                                onClick={() => setMostrarContrasena((actual) => !actual)}
                            >
                                {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="confirmar-contrasena">Confirmar contraseña</label>
                        <div className={styles.passwordWrapper}>
                            <input type={mostrarConfirmacion ? "text" : "password"} id="confirmar-contrasena" name="confirmarContrasena" autoComplete="new-password" minLength="8" maxLength="128" required={paso === 3} />
                            <button 
                                className={styles.passwordToggle}
                                type="button" 
                                aria-pressed={mostrarConfirmacion} 
                                onClick={() => setMostrarConfirmacion((actual) => !actual)}
                            >
                                {mostrarConfirmacion ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </section>

                {error && <p className={styles.error} role="alert">{error}</p>}

                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.backButton}
                        onClick={() => {
                            setError("");
                            setPaso((actual) => actual - 1);
                        }}
                        disabled={paso === 1 || enviando}
                    >
                        Anterior
                    </button>
                    <button className={styles.nextButton} type="submit" disabled={enviando}>
                        {enviando ? "Creando cuenta..." : paso < pasos.length ? "Siguiente" : "Crear cuenta"}
                    </button>
                </div>
            </form>
            <p className={styles.loginLink}>
                ¿Ya tienes cuenta? <Link to="/login" className={styles.loginLinkAnchor}>Inicia sesión aquí</Link>
            </p>
        </main>
    );
}

export default RegisterForm;