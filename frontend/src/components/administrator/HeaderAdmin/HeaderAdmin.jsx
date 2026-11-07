import styles from "./HeaderAdmin.module.css";

function HeaderAdmin(){
    return(
        <header className={styles.header}>
            <h5 className={styles.rol}>Administrador</h5>
            <span className={styles.title}>EPS</span>
        </header>
    );
}

export default HeaderAdmin