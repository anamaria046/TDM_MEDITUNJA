import ProfileHeader from "../../ProfileHeader/ProfileHeader.jsx";
import NfcStatus from "../../NFCStatus/NFCStatus.jsx";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import styles from "./personalDataUser.module.css";

function PersonalDataUser() {
    const [mostrarContrasena, setMostrarContrasena] = useState(false);
    
    return (
        <div className={styles.profileContainer}>
            <section className={styles.profileSidebar}>
                <ProfileHeader />
            </section>
            <section className={styles.profileContent}>
                <fieldset>
                    <h3>Información del paciente</h3>
                    <div className={styles.profileGrid}> 
                        <div className={styles.dataGroup}>
                            <label>Nombres</label>
                            <p>Mi nombre</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Apellidos</label>
                            <p>Mis apellidos</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Fecha de Nacimiento</label>
                            <p>01/01/1990</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Sexo</label>
                            <p>Femenino</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Tipo de Documento</label>
                            <p>Cédula de Ciudadanía</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Numero de documento</label>
                            <p>123456789</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Contraseña</label>
                            <div className={styles.passwordWrapper}>
                                <p>••••••••••</p>
                                <button
                                    className={styles.passwordToggle}
                                    type="button"
                                    aria-label={
                                    mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"
                                    }
                                    aria-pressed={mostrarContrasena}
                                    onClick={() => setMostrarContrasena((actual) => !actual)}
                                >
                                {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Entidad de salud</label>
                            <p>Nueva EPS</p>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <h3>Datos de contacto</h3>
                    <div className={styles.profileGrid}>
                        <div className={styles.dataGroup}>
                            <label>Correo Electrónico</label>
                            <p>juan.perez@correo.com</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Telefono</label>
                            <p>3001234567</p>
                            </div>
                        </div>
                </fieldset>

                <fieldset>
                    <div>
                        <h3>Tarjeta NFC</h3>
                        <div>
                            <NfcStatus />
                        </div>
                    </div>
                </fieldset>
            </section>
        </div>
    );
}

export default PersonalDataUser