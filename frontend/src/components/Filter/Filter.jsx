import styles from "./Filter.module.css";

function Filter() {
    return (
        <section className={styles.container}>
            <form className={styles.formFilter}>
                <input type="text" placeholder="Busca por nombre, documento o correo" />
                <select>
                    <option>Todos</option>
                    <option>Activos</option>
                    <option>Pendientes</option>
                </select>               
            </form>
        </section>
    );
}

export default Filter