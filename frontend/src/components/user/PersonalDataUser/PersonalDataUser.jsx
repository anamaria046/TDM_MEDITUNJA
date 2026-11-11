import ProfileHeader from "../../ProfileHeader/ProfileHeader.jsx";
import NfcStatus from "../../NFCStatus/NFCStatus.jsx";

import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/useAuth.js";
import { apiRequest, mensajeError } from "../../../auth/api.js";
import styles from "./personalDataUser.module.css";

function PersonalDataUser() {
    const { sesion, actualizarUsuario } = useAuth();
    const [actualizandoEstado, setActualizandoEstado] = useState(false);
    const [errorEstado, setErrorEstado] = useState("");
    const [tarjeta, setTarjeta] = useState(null);
    const [errorTarjeta, setErrorTarjeta] = useState("");
    const usuario = sesion?.usuario || {};
    const estado = usuario.estado_afiliacion || "pendiente";
    const nombre = (usuario.nombres || usuario.nombre || "").trim();
    const partesNombre = nombre.split(/\s+/);
    const nombresPerfil = usuario.nombres || partesNombre.slice(0, -2).join(" ") || partesNombre[0] || "—";
    const apellidosPerfil = usuario.apellidos || (
        partesNombre.length > 2
            ? partesNombre.slice(-2).join(" ")
            : partesNombre.slice(-1).join(" ")
    ) || "—";
    const estadoTexto = {
        pendiente: "En validación",
        aprobado: "Activada",
        rechazado: "Rechazada",
    }[estado] || "En validación";

    useEffect(() => {
        actualizarUsuario().catch((error) => {
            setErrorEstado(error instanceof Error ? error.message : "No se pudo actualizar el perfil.");
        });
    }, [actualizarUsuario]);

    useEffect(() => {
        let activa = true;
        apiRequest("/nfc/tarjeta", {
            headers: { Authorization: `Bearer ${sesion.accessToken}` },
        }).then((respuesta) => {
            if (activa) setTarjeta(respuesta.data.vinculada ? respuesta.data : null);
        }).catch((error) => {
            if (activa) setErrorTarjeta(mensajeError(error));
        });
        return () => {
            activa = false;
        };
    }, [sesion.accessToken]);

    async function consultarEstado() {
        setActualizandoEstado(true);
        setErrorEstado("");
        try {
            await actualizarUsuario();
        } catch (error) {
            setErrorEstado(error instanceof Error ? error.message : "No se pudo consultar el estado.");
        } finally {
            setActualizandoEstado(false);
        }
    }

    return (
        <div className={styles.profileContainer}>
            <section className={styles.profileSidebar}>
                <ProfileHeader
                    nombre={nombre || undefined}
                    className={styles.profileHeader}
                />
            </section>
            <section className={styles.profileContent}>
                {estado !== "aprobado" && (
                    <div className={styles.affiliationNotice} role="status">
                        <strong>Afiliación: {estadoTexto}</strong>
                        <p>
                            {estado === "rechazado"
                                ? "La EPS rechazó la solicitud. Comunícate con su administrador para conocer los pasos a seguir."
                                : "Puedes iniciar sesión y consultar este estado. Cuando el administrador de tu EPS valide el comprobante, actualiza el estado para habilitar los demás módulos."}
                        </p>
                        <button
                            type="button"
                            onClick={consultarEstado}
                            disabled={actualizandoEstado}
                        >
                            {actualizandoEstado ? "Consultando..." : "Actualizar estado"}
                        </button>
                        {errorEstado && <p role="alert">{errorEstado}</p>}
                    </div>
                )}
                <fieldset>
                    <h3>Información del paciente</h3>
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
                            <p>{usuario.tipo_documento || "—"}</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>Número de documento</label>
                            <p>{usuario.numero_documento || usuario.documento || "—"}</p>
                        </div>

                        <div className={styles.dataGroup}>
                            <label>EPS</label>
                            <p>{usuario.eps || "EPS no registrada"}</p>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <h3>Datos de contacto</h3>
                    <div className={styles.profileGrid}>
                        <div className={styles.dataGroup}>
                            <label>Correo Electrónico</label>
                            <p>{usuario.email || "—"}</p>
                        </div>
                        <div className={styles.dataGroup}>
                            <label>Teléfono</label>
                            <p>{usuario.telefono || "—"}</p>
                        </div>
                    </div>
                </fieldset>

                {estado === "aprobado" && (
                    <fieldset>
                        <div>
                            <h3>Tarjeta NFC</h3>
                            <div>
                                <NfcStatus tarjeta={tarjeta} />
                                {errorTarjeta && <p role="alert">{errorTarjeta}</p>}
                            </div>
                        </div>
                    </fieldset>
                )}
            </section>
        </div>
    );
}

export default PersonalDataUser