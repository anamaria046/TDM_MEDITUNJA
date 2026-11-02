import styles from "./nfcStatus.module.css";

function NfcStatus() {
    return (
        <section>
        {/*Caso de que no este vincualada*/}
            <div className={styles.nfcCard}>
                <div className={styles.nfcHeader}>
                    <span className={styles.nfcStatus}>Tarjeta NFC No Vinculada</span>
                </div>
                <p className={styles.nfcDescription}>
                    <small>Aún no tienes una tarjeta física asociada a tu cuenta. Vincúlala para iniciar sesión al instante y validar tus citas en taquilla.</small>
                </p>
                <button type="button" className={styles.nfcButton}>
                    Ir a Vincular Tarjeta NFC (Vincular modulo NFC)
                </button>
            </div>

            {/*Caso de que este vinculada*/}
            <div className={`${styles.nfcCard} ${styles.nfcLinked}`}>
                <div className={styles.nfcDescription}>
                    <span className={styles.nfcStatus}>Tarjeta NFC Vinculada</span>
                </div>
                <p className={styles.nfcDescription}>
                    ID de Tarjeta: <strong>NFC-99482-COL</strong>
                    <span className={styles.nfcSeparator}> | </span>
                    Registrada el: 2026-10-15
                </p>
            </div>
        </section>
    );
}

export default NfcStatus