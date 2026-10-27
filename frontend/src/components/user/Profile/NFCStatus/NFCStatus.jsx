export function NfcStatus() {
    return (
        <section>
        <h3>Tarjeta NFC para Acceso Rápido</h3>

        {/*Caso de que no este vincualada*/}
        <div>
            <p>
                <strong>Estado:</strong> <span>Tarjeta NFC No Vinculada</span>
            </p>
            <p>
                <small>Aún no tienes una tarjeta física asociada a tu cuenta. Vincúlala para iniciar sesión al instante y validar tus citas en taquilla.</small>
            </p>
            <button type="button">
                Ir a Vincular Tarjeta NFC (Vincular modulo NFC)
            </button>
        </div>

        {/*Caso de que este vinculada*/}
        <div>
            <p><strong>Vista previa cuando esté activa:</strong></p>
            <p><span>Tarjeta NFC Vinculada</span></p>
            <p>
                <small>ID de Tarjeta: <strong>NFC-99482-COL</strong> | Registrada el: 2026-10-15</small>
            </p>
        </div>
        </section>
    );
}

export default NfcStatus