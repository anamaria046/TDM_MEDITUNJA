import styles from "./ProfileHeader.module.css";

function ProfileHeader({ nombre = "Mi perfil", tipo = "Paciente MediTunja" }) {
    const iniciales = nombre
        .split(" ")
        .map((palabra) => palabra[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    return (
        <div className={styles.headerContainer}>
            <div className={styles.initials}>
                {iniciales}
            </div>
            <h2>{nombre}</h2>
            <p>{tipo}</p>
            <span className={styles.state}>
                <span className={styles.indicator}></span>
                Cuenta activa
            </span>
            <button className={styles.logOutButton}>Cerrar sesion</button>
        </div>
    );
}

export default ProfileHeader;