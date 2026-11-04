import ProfileHeader from "../../ProfileHeader/ProfileHeader.jsx";
import NfcStatus from "../../NFCStatus/NFCStatus.jsx";
import styles from "./PersonalDataAdministrador.module.css";
import { useAuth } from "../../../auth/useAdminAuth.js";

function PersonalDataAdministrador() {
    const { sesion } = useAuth();
    const usuario = sesion?.usuario || {};
    const nombresPerfil = usuario.nombres || usuario.nombre || "—";
    const apellidosPerfil = usuario.apellidos || "—";
    const nombreCompleto = `${nombresPerfil} ${apellidosPerfil}`;
    const estado = usuario.estado_afiliacion || "pendiente";

    return (
        <div className={styles.profileContainer}>

            <section className={styles.profileSidebar}>
                <ProfileHeader 
                    nombre={nombreCompleto}
                    tipo="Administrador de EPS"
                    estadoTexto={
                        usuario.estado === "aprobado"
                            ? "Cuenta activa"
                            : "Cuenta pendiente"
                    }
                />
            </section>

            <section className={styles.profileContent}>

                <fieldset>
                    <h3>Información del Administrador de la EPS</h3>

                    <div className={styles.profileGrid}>

                        <div className={styles.dataGroup}>
                            <label>Nombres</label>
                            <p>{nombresPerfil}</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Apellidos</label>
                            <p>{apellidosPerfil}</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Tipo de Documento</label>
                            <p>{usuario?.tipo_documento || "—"}</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Número de documento</label>
                            <p>
                                {usuario?.numero_documento ||
                                 usuario?.documento || "—"}
                            </p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>EPS administrada</label>
                            <p>{usuario?.eps || "EPS no registrada"}</p>
                        </div>

                    </div>
                </fieldset>

                <fieldset>
                    <h3>Datos de contacto</h3>

                    <div className={styles.profileGrid}>
                        <div className={styles.dataGroup}>
                            <label>Correo electrónico</label>
                            <p>{usuario?.email || "—"}</p>
                        </div>
                    </div>
                </fieldset>

                {estado === "aprobado" && (
                    <fieldset>
                        <h3>Tarjeta NFC</h3>

                        <NfcStatus
                            tarjeta={usuario?.tarjetaNfc || usuario?.tarjeta_nfc}
                        />
                    </fieldset>
                )}

            </section>
        </div>
    );
}

export default PersonalDataAdministrador;