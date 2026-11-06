// Subcomponente de Métricas y Resumen Operativo Admin EPS
// MediTunja - Código estructurado en HTML semántico dentro de JSX

import styles from "./BienvenidaAdminEPS.module.css";

function MetricasAdmin({ badge, titulo, subtitulo, metricas }) {
  return (
    <section className={styles.seccionMetricas} aria-label="Métricas de operación">
      {/* 1. Encabezado de la bienvenida */}
      <div className={styles.encabezadoBienvenida}>
        <span className={styles.badgePanel}>{badge}</span>
        <h1 className={styles.tituloBienvenida}>{titulo}</h1>
        <p className={styles.descripcionBienvenida}>{subtitulo}</p>
      </div>

      {/* 2. Rejilla de tarjetas de métricas */}
      <div className={styles.rejillaMetricas} role="region" aria-label="Tarjetas de estadísticas">
        {metricas.map((metrica) => (
          <article key={metrica.id} className={styles.tarjetaMetrica}>
            <span className={styles.valorMetrica}>{metrica.valor}</span>
            <span className={styles.etiquetaMetrica}>{metrica.etiqueta}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MetricasAdmin;
