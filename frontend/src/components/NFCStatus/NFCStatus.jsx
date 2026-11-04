import { Link } from "react-router-dom";
import styles from "./NFCStatus.module.css";

function obtenerIdentificador(tarjeta) {
    if (typeof tarjeta === "string") return tarjeta;
    return tarjeta?.id || tarjeta?.uid || "Tarjeta registrada";
}

function NfcStatus({ tarjeta }) {
    if (tarjeta) {
        return (
            <section className={`${styles.nfcCard} ${styles.nfcLinked}`}>
                <p className={styles.nfcStatus} role="status">Tarjeta de demostración vinculada</p>
                <p className={styles.nfcDescription}>
                    Identificador de demostración: <strong>{obtenerIdentificador(tarjeta)}</strong>
                </p>
                <Link
                    to="/vinculacionNFC"
                    state={{ origen: "/perfilUsuario" }}
                    className={styles.nfcButton}
                >
                    Administrar tarjeta
                </Link>
            </section>
        );
    }

    return (
        <section>
            <div className={styles.nfcCard}>
                <p className={styles.nfcDescription}>
                    Aún no tienes una tarjeta física asociada a tu cuenta. Vincúlala para
                    iniciar sesión al instante, pagar tu cita con el saldo de tu tarjeta y
                    validar tus citas en taquilla
                </p>
                <Link
                    to="/vinculacionNFC"
                    state={{ origen: "/perfilUsuario" }}
                    className={styles.nfcButton}
                >
                    Vincular tarjeta NFC
                </Link>
            </div>
        </section>
    );
}

export default NfcStatus