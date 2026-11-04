import { FileSearch, Info, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Hero from "../Hero/Hero.jsx";
import NavbarUser from "./NavbarUser/NavbarUser.jsx";
import styles from "./ResultadosProcedimientos.module.css";

function ResultadosProcedimientos() {
    return (
        <>
            <NavbarUser />
            <Hero
                label="Mi salud"
                title="Resultados de procedimientos"
                description="Consulta el estado y los informes de tus procedimientos médicos."
            />

            <main className={styles.resultsPage}>
                <Link className={styles.backLink} to="/citas">
                    <MoveLeft size={18} aria-hidden="true" />
                    Volver a mis citas
                </Link>

                <section className={styles.infoNotice} aria-label="Información importante">
                    <span className={styles.infoIcon} aria-hidden="true">
                        <Info size={20} />
                    </span>
                    <p>
                        Los resultados de tus procedimientos aparecerán aquí cuando estén disponibles.
                        Si necesitas información, comunícate con la IPS donde te atendieron.
                    </p>
                </section>

                <section className={styles.resultsSection} aria-labelledby="listado-titulo">
                    <div className={styles.sectionHeading}>
                        <div>
                            <span className={styles.eyebrow}>Tu historial médico</span>
                            <h2 id="listado-titulo">Tus procedimientos</h2>
                        </div>
                        <span className={styles.resultsCount}>0 disponibles</span>
                    </div>

                    <div className={styles.emptyState} role="status">
                        <span className={styles.emptyIcon} aria-hidden="true">
                            <FileSearch size={30} />
                        </span>
                        <h3>Aún no hay resultados disponibles</h3>
                        <p>
                            Cuando la IPS publique los resultados de tus procedimientos, podrás
                            consultarlos en esta sección.
                        </p>
                        <Link className={styles.appointmentsLink} to="/citas">
                            Consultar mis citas
                        </Link>
                    </div>
                </section>
            </main>
        </>
    );
}

export default ResultadosProcedimientos;
