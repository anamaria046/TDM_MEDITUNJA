import { Link } from "react-router-dom";

function ResultadosProcedimientos() {
    return (
        <main>
            <header>
                <Link to="/citas">← Volver a mis citas</Link>
                <p>MediTunja · Mi salud</p>
                <h1>Resultados de procedimientos</h1>
                <p>Consulta el estado y los informes de tus procedimientos médicos.</p>
            </header>

            <section aria-label="Información importante">
                <p>
                    Los resultados de tus procedimientos aparecerán aquí cuando estén disponibles.
                    Si necesitas información, comunícate con la IPS donde te atendieron.
                </p>
            </section>

            <section aria-labelledby="listado-titulo">
                <h2 id="listado-titulo">Tus procedimientos</h2>
                <div role="status">
                    <h3>Aún no hay resultados disponibles</h3>
                    <p>
                        Cuando la IPS publique los resultados de tus procedimientos, podrás consultarlos en esta sección.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default ResultadosProcedimientos;
