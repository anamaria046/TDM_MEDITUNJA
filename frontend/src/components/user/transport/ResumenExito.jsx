import { Link } from "react-router-dom";

function ResumenExito({ datosCita, solicitudId, estadoSolicitud, requerimientosSeleccionados, catalogoRequerimientos }) {
  const requerimientos = requerimientosSeleccionados
    .map((id) => catalogoRequerimientos.find((item) => item.id === id)?.titulo)
    .filter(Boolean);
  const estadoTexto = {
    solicitada: "Solicitada, pendiente de confirmación",
    aceptada: "Aceptada por la EPS; el vehículo aún no está asignado",
    rechazada: "Rechazada por la EPS"
  }[estadoSolicitud] || "Estado no disponible";

  return (
    <section className="tarjeta-confirmacion" aria-live="polite" role="status">
      <h2>Solicitud de transporte registrada</h2>
      <p>
        El estado refleja la decisión de la EPS. La aceptación no asigna automáticamente
        un vehículo ni confirma un cobro.
      </p>
      <div className="detalles-resumen">
        <h3>Resumen de la solicitud</h3>
        <ul>
          <li><strong>Número de solicitud:</strong> {solicitudId}</li>
          <li><strong>Paciente:</strong> {datosCita.nombresPaciente} ({datosCita.numeroDocumento})</li>
          <li><strong>EPS:</strong> {datosCita.epsPacienteTexto}</li>
          <li><strong>IPS:</strong> {datosCita.ipsDestinoTexto}</li>
          <li><strong>Cita:</strong> {datosCita.tipoAtencion} · {datosCita.fechaCita} {datosCita.horaCita}</li>
          <li><strong>Adaptaciones solicitadas:</strong> {requerimientos.length ? requerimientos.join(", ") : "Sin adaptaciones adicionales"}</li>
          <li><strong>Estado:</strong> {estadoTexto}</li>
        </ul>
      </div>
      <div className="acciones-confirmacion">
        <Link to="/citas" className="btn-accion-secundario">Volver a mis citas</Link>
        <Link to="/pagos" className="btn-accion-secundario">Consultar disponibilidad de pagos</Link>
      </div>
    </section>
  );
}

export default ResumenExito;
