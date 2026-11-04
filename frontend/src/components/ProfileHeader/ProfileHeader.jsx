import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";
import styles from "./ProfileHeader.module.css";

function ProfileHeader() {
    const { sesion, cerrarSesion } = useAuth();
    const navigate = useNavigate();
    const [cerrandoSesion, setCerrandoSesion] = useState(false);

    const usuario = sesion?.usuario || {};

    const nombrePerfil =
        usuario.nombres ||
        usuario.nombre ||
        "Mi perfil";

    const tipo = {
        paciente: "Paciente MediTunja",
        administrador: "Administrador de EPS",
        admin: "Administrador",
        medico: "Profesional de salud"
    }[usuario.rol] || "Usuario MediTunja";

    const estado =
        usuario.estado_afiliacion ||
        usuario.estado ||
        "pendiente";

    const etiquetaEstado = {
        pendiente: "Afiliación en validación",
        aprobado: "Cuenta activa",
        rechazado: "Afiliación rechazada"
    }[estado] || "Cuenta activa";

    const iniciales = nombrePerfil
        .split(" ")
        .filter(Boolean)
        .map((palabra) => palabra[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    async function salir() {
        setCerrandoSesion(true);

        let notice;

        try {
            await cerrarSesion();
        } catch {
            notice = "Se cerró la sesión en este dispositivo, pero no se pudo confirmar su revocación en el servidor.";
        }

        navigate("/login", {
            replace: true,
            state: notice ? { notice } : undefined,
        });
    }

    return (
        <div className={styles.headerContainer}>
            <div className={styles.initials}>
                {iniciales}
            </div>

            <h2>{nombrePerfil}</h2>

            <p>{tipo}</p>

            <span className={styles.state}>
                <span className={styles.indicator}></span>
                {etiquetaEstado}
            </span>

            <button
                className={styles.logOutButton}
                type="button"
                onClick={salir}
                disabled={cerrandoSesion}
            >
                {cerrandoSesion
                    ? "Cerrando sesión..."
                    : "Cerrar sesión"}
            </button>
        </div>
    );
}

export default ProfileHeader;
