// Ventana modal de confirmación accesible para retirar adaptaciones recomendadas
// MediTunja - Transporte Preferencial

function ModalConfirmacion({ isOpen, reqTitulo, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="modal-titulo"
      aria-describedby="modal-descripcion"
    >
      <div className="modal-contenido">
        <div className="modal-icono" aria-hidden="true">⚠️</div>
        
        <h3 id="modal-titulo" className="modal-titulo">
          ¿Deseas retirar este requerimiento recomendado?
        </h3>
        
        <p id="modal-descripcion" className="modal-descripcion">
          El requerimiento <strong>"{reqTitulo}"</strong> fue seleccionado automáticamente
          de acuerdo con tu condición médica para garantizar un traslado seguro y confortable.
        </p>

        <p className="modal-aclaracion">
          Si decides retirarlo, el vehículo asignado podría no contar con esta adaptación técnica.
        </p>

        <div className="modal-acciones">
          <button 
            type="button" 
            className="btn-modal-cancelar"
            onClick={onCancel}
            autoFocus
          >
            Mantener requerimiento
          </button>
          <button 
            type="button" 
            className="btn-modal-confirmar"
            onClick={onConfirm}
          >
            Sí, quitar requerimiento
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalConfirmacion;
