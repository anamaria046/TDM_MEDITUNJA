import { useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, MoveLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../../auth/useAuth.js";
import Hero from "../Hero/Hero.jsx";
import NavbarUser from "../user/NavbarUser/NavbarUser.jsx";
import styles from "./NFCVinculation.module.css";

function obtenerIdentificador(tarjeta) {
    if (typeof tarjeta === "string") return tarjeta;
    return tarjeta?.id || tarjeta?.uid || "";
}

function NFCVinculation() {
    const { sesion, actualizarTarjetaNfc } = useAuth();
    const tarjetaActual = sesion?.usuario?.tarjetaNfc || sesion?.usuario?.tarjeta_nfc || null;
    const identificadorActual = obtenerIdentificador(tarjetaActual);
    const [identificador, setIdentificador] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");

    function vincularTarjeta(event) {
        event.preventDefault();
        setMensaje("");
        setError("");

        const nuevoIdentificador = identificador.trim().toUpperCase();
        if (!/^[A-Z0-9][A-Z0-9_-]{3,39}$/.test(nuevoIdentificador)) {
            setError("Ingresa un identificador de 4 a 40 caracteres: letras, números, guiones o guiones bajos.");
            return;
        }

        try {
            actualizarTarjetaNfc(nuevoIdentificador);
            setIdentificador("");
            setMensaje("Tarjeta de demostración vinculada en este navegador.");
        } catch (errorTarjeta) {
            setError(errorTarjeta instanceof Error
                ? errorTarjeta.message
                : "No se pudo guardar la tarjeta de demostración.");
        }
    }

    function desvincularTarjeta() {
        setMensaje("");
        setError("");
        try {
            actualizarTarjetaNfc(null);
            setMensaje("Tarjeta de demostración desvinculada.");
        } catch (errorTarjeta) {
            setError(errorTarjeta instanceof Error
                ? errorTarjeta.message
                : "No se pudo desvincular la tarjeta de demostración.");
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
                        <strong>Modo demostración:</strong> no hay lector NFC conectado. El
                        identificador que ingreses solo se guardará en este navegador y no
                        vincula ni valida una tarjeta física.
                    </p>
                </div>

                <section className={styles.card} aria-labelledby="card-status-heading">
                    <div className={styles.cardIcon} aria-hidden="true">
                        <CreditCard size={26} />
                    </div>
                    <div className={styles.cardDetails}>
                        <h2 id="card-status-heading">Estado de tu tarjeta</h2>
                        {identificadorActual ? (
                            <>
                                <p className={styles.linkedStatus} role="status">Tarjeta de demostración vinculada</p>
                                <p className={styles.cardId}>
                                    Identificador: <strong>{identificadorActual || "Tarjeta registrada"}</strong>
                                </p>
                            </>
                        ) : (
                            <p className={styles.unlinkedStatus} role="status">No tienes una tarjeta vinculada</p>
                        )}
                    </div>
                </section>

                <section className={styles.formCard} aria-labelledby="link-card-heading">
                    <span className={styles.eyebrow}>Sin lector físico</span>
                    <h2 id="link-card-heading">
                        {identificadorActual ? "Cambiar tarjeta de demostración" : "Vincular tarjeta de demostración"}
                    </h2>
                    <p className={styles.description}>
                        Para probar el flujo, escribe un identificador ficticio, por ejemplo
                        <code> NFC-DEMO-1234</code>.
                    </p>

                    <form className={styles.form} onSubmit={vincularTarjeta}>
                        <label htmlFor="nfc-card-id">Identificador de prueba</label>
                        <input
                            id="nfc-card-id"
                            name="identificador"
                            type="text"
                            autoComplete="off"
                            maxLength={40}
                            pattern="[A-Za-z0-9][A-Za-z0-9_-]{3,39}"
                            placeholder="NFC-DEMO-1234"
                            value={identificador}
                            onChange={(event) => {
                                setIdentificador(event.target.value);
                                setError("");
                            }}
                            required
                        />
                        <button className={styles.primaryButton} type="submit">
                            {identificadorActual ? "Guardar identificador de prueba" : "Vincular tarjeta de prueba"}
                        </button>
                    </form>

                    {identificadorActual && (
                        <button className={styles.secondaryButton} type="button" onClick={desvincularTarjeta}>
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
