import ProfileHeader from "../../ProfileHeader/ProfileHeader.jsx";
import styles from "./PersonalDataAdministrador.module.css";
import { useAdminAuth } from "../../../auth/useAdminAuth.js";

function PersonalDataAdministrador() {
    const { usuario, cerrarSesion } = useAdminAuth();
    const nombresPerfil = usuario.nombres || usuario.nombre || "—";
    const apellidosPerfil = usuario.apellidos || "—";
    const nombreCompleto = `${nombresPerfil} ${apellidosPerfil}`;
    const estado = usuario.estado_registro || "pendiente";

    return (
        <div className={styles.profileContainer}>
            <section className={styles.profileContent}>
                <ProfileHeader
                    usuario={usuario}
                    cerrarSesion={cerrarSesion}
                    nombre={nombreCompleto}
                    tipo="Administrador de EPS"
                    estadoTexto={estado === "aprobado" ? "Cuenta activa" : "Cuenta pendiente"}
                    className={styles.headerAdministrador}
                />
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

            </section>
        </div>
    );
}

export default PersonalDataAdministrador;