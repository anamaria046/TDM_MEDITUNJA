import { useEffect, useState } from "react";
import { FileSearch, Info, MoveLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../auth/api.js";
import { useAuth } from "../../auth/useAuth.js";
import Hero from "../Hero/Hero.jsx";
import NavbarUser from "./NavbarUser/NavbarUser.jsx";
import styles from "./ResultadosProcedimientos.module.css";

function ResultadosProcedimientos() {
    const { sesion } = useAuth();
    const [resultados, setResultados] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarResultados() {
            setCargando(true);
            setError("");
            try {
                const respuesta = await apiRequest("/resultados", {
                    headers: { Authorization: `Bearer ${sesion.accessToken}` },
                });
                if (activo) setResultados(respuesta.data);
            } catch (errorSolicitud) {
                if (activo) {
                    setError(errorSolicitud instanceof Error
                        ? errorSolicitud.message
                        : "No fue posible consultar tus resultados.");
                }
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarResultados();
        return () => {
            activo = false;
        };
    }, [sesion.accessToken]);

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
                        Aquí aparecen los resultados registrados para tu cuenta. Si necesitas
                        aclaraciones sobre un informe, comunícate con la IPS que lo realizó.
                    </p>
                </section>

                <section className={styles.resultsSection} aria-labelledby="listado-titulo">
                    <div className={styles.sectionHeading}>
                        <div>
                            <span className={styles.eyebrow}>Tu historial médico</span>
                            <h2 id="listado-titulo">Tus procedimientos</h2>
                        </div>
                        <span className={styles.resultsCount}>
                            {resultados.length} {resultados.length === 1 ? "registro" : "registros"}
                        </span>
                    </div>

                    {error && <p className={styles.errorMessage} role="alert">{error}</p>}

                    {cargando ? (
                        <p className={styles.loadingState} role="status">Cargando tus resultados...</p>
                    ) : error ? null : resultados.length > 0 ? (
                        <ul className={styles.resultList}>
                            {resultados.map((resultado) => (
                                <li className={styles.resultCard} key={resultado.id}>
                                    <div className={styles.resultHeading}>
                                        <div>
                                            <span className={styles.eyebrow}>Procedimiento</span>
                                            <h3>{resultado.procedimiento}</h3>
                                        </div>
                                        <span className={
                                            resultado.status === "Disponible"
                                                ? styles.availableStatus
                                                : styles.pendingStatus
                                        }>
                                            {resultado.status}
                                        </span>
                                    </div>
                                    <dl className={styles.resultDetails}>
                                        <div>
                                            <dt>Fecha</dt>
                                            <dd>{resultado.fecha}</dd>
                                        </div>
                                        <div>
                                            <dt>IPS</dt>
                                            <dd>{resultado.proveedor}</dd>
                                        </div>
                                    </dl>
                                    {resultado.status === "Disponible" ? (
                                        <div className={styles.report}>
                                            <h4>Informe</h4>
                                            <p>{resultado.informe}</p>
                                        </div>
                                    ) : (
                                        <p className={styles.pendingMessage}>
                                            El informe estará disponible cuando la IPS finalice el proceso.
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className={styles.emptyState} role="status">
                            <span className={styles.emptyIcon} aria-hidden="true">
                                <FileSearch size={30} />
                            </span>
                            <h3>Aún no hay resultados disponibles</h3>
                            <p>
                                Cuando se registre un resultado asociado a tu cuenta, aparecerá
                                en esta sección.
                            </p>
                            <Link className={styles.appointmentsLink} to="/citas">
                                Consultar mis citas
                            </Link>
                        </div>
                    )}
                </section>
            </main>
        </>
    );
}

export default ResultadosProcedimientos;
