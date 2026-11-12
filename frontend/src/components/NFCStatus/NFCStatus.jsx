import { Link } from "react-router-dom";
import { Nfc } from "lucide-react";
import styles from "./NFCStatus.module.css";

function obtenerIdentificador(tarjeta) {
    if (typeof tarjeta === "string") return tarjeta;
    return tarjeta?.identificador || tarjeta?.id || tarjeta?.uid || "Tarjeta registrada";
}

function NfcStatus({ tarjeta }) {
    if (tarjeta) {
        const habilitada = tarjeta.habilitada !== false;
        return (
            <section className={`${styles.nfcCard} ${styles.nfcLinked}`}>
                <p className={styles.nfcStatus} role="status">
                    {habilitada ? "Tarjeta vinculada y activa" : "Tarjeta vinculada, pero no habilitada"}
                </p>
                <p className={styles.nfcDescription}>
                    Identificador terminado en: <strong>{obtenerIdentificador(tarjeta)}</strong>
                </p>
                {!habilitada && (
                    <p className={styles.nfcDescription}>
                        TunjaAPI no confirma esta tarjeta para iniciar sesión. Pide al administrador
                        que revise su estado o vincula otra tarjeta disponible.
                    </p>
                )}
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
            <div className={`${styles.nfcCard} ${styles.nfcUnlinked}`}>
                <span className={styles.nfcIcon}>
                    <Nfc size={28} />
                </span>
                <div className={styles.nfcContent}>
                    <p className={styles.nfcDescription}>
                        Aún no tienes una tarjeta física asociada a tu cuenta. Vincúlala para
                        asociarla a tu perfil. Podrás iniciar sesión con ella cuando esté activa
                        y asociada a tu cuenta en TunjaAPI. Vincularla no realiza pagos físicos.
                    </p>
                    <Link
                        to="/vinculacionNFC"
                        state={{ origen: "/perfilUsuario" }}
                        className={styles.nfcButton}
                    >
                        Vincular tarjeta NFC
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default NfcStatus