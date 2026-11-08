import { Link } from "react-router-dom";
import styles from "./NFCStatus.module.css";

function obtenerIdentificador(tarjeta) {
    if (typeof tarjeta === "string") return tarjeta;
    return tarjeta?.identificador || tarjeta?.id || tarjeta?.uid || "Tarjeta registrada";
}

function NfcStatus({ tarjeta }) {
    if (tarjeta) {
        return (
            <section className={`${styles.nfcCard} ${styles.nfcLinked}`}>
                <p className={styles.nfcStatus} role="status">Tarjeta vinculada</p>
                <p className={styles.nfcDescription}>
                    Identificador terminado en: <strong>{obtenerIdentificador(tarjeta)}</strong>
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
                    asociarla a tu perfil. El inicio de sesión NFC y los pagos estarán
                    disponibles cuando exista un mecanismo de autenticación y pago habilitado.
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