import { Link } from "react-router-dom";
import styles from "./NFCStatus.module.css";

function NfcStatus({ tarjeta }) {
    if (tarjeta) {
        return (
            <section>
                <p role="status">✓ Tarjeta NFC vinculada</p>
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