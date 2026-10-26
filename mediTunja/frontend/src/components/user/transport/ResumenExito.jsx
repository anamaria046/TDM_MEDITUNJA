// Tarjeta de confirmación y resumen post-envío de la solicitud de transporte
// MediTunja - Transporte Preferencial
// Conexión secuencial hacia el Módulo de Pagos

import { Link } from "react-router-dom";

function ResumenExito({ datosCita, requerimientosSeleccionados, catalogoRequerimientos, onNuevaSolicitud }) {
  const reqsNombres = requerimientosSeleccionados
    .map(id => catalogoRequerimientos.find(r => r.id === id)?.titulo)
    .filter(Boolean);

  return (
    <section className="tarjeta-confirmacion" aria-live="polite" role="status">
      <div className="icono-exito" aria-hidden="true">✅</div>
      <h2>¡Solicitud de Transporte Preferencial Registrada con Éxito!</h2>
      <p className="resumen-exito">
        Tu solicitud ha sido vinculada exitosamente con tu cita médica agendada en Tunja.
        La central de despacho preparará el vehículo con las adaptaciones requeridas.
      </p>

      <div className="detalles-resumen">
        <h3>Resumen del Servicio Asignado</h3>
        <ul>
          <li><strong>Código de Solicitud:</strong> TRP-TUN-2026-8942</li>
          <li><strong>Paciente:</strong> {datosCita.nombresPaciente} ({datosCita.numeroDocumento})</li>
          <li><strong>EPS:</strong> {datosCita.epsPacienteTexto}</li>
          <li><strong>IPS de Destino:</strong> {datosCita.ipsDestinoTexto}</li>
          <li><strong>Cita Médica:</strong> {datosCita.tipoAtencion} - {datosCita.fechaCita} a las {datosCita.horaCita}</li>
          <li>
            <strong>Adaptaciones Asignadas:</strong>{" "}
            {reqsNombres.length > 0 ? reqsNombres.join(", ") : "Transporte estándar preferencial"}
          </li>
          <li><strong>Estado:</strong> <span className="etiqueta-estado">Vehículo Asignado y Programado</span></li>
          <li><strong>Vehículo y Conductor:</strong> Móvil Adaptado #08 - Carlos Arturo Ramírez (Certificado en trato digno y primeros auxilios)</li>
        </ul>
      </div>

      {/* Siguiente paso secuencial según el flujo del sistema: Módulo de Pagos */}
      <div className="bloque-siguiente-paso">
        <p className="texto-siguiente-paso">
          <strong>Paso 3 de 4:</strong> Para finalizar y asegurar tu turno de atención y transporte, continúa al módulo de pagos.
        </p>
        <Link to="/pagos" className="btn-accion-pagos-destacado">
          💳 Continuar al Módulo de Pagos →
        </Link>
      </div>

      <div className="acciones-confirmacion">
        <button 
          type="button" 
          className="btn-accion-secundario"
          onClick={onNuevaSolicitud}
        >
          ✏️ Modificar datos de transporte
        </button>
        <Link to="/citas" className="btn-accion-secundario">
          ← Volver a Agendamiento de Citas
        </Link>
        <Link to="/login" className="btn-accion-secundario">
          Ir al Inicio
        </Link>
      </div>
    </section>
  );
}

export default ResumenExito;
