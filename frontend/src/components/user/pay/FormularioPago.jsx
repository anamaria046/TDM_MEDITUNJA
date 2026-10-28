// Subcomponente de Formulario de Pago
// MediTunja - Módulo de Pagos (Estructura modular en 4 pasos y maquetación limpia)

import styles from "./pay.module.css";
import {
  PRECIOS_CITA,
  METODOS_PAGO,
  BANCOS_PSE,
  OPCIONES_ASISTENCIA_TRANSPORTE,
  TARIFA_TRANSPORTE,
  formatearMoneda
} from "./data/payData";

function FormularioPago({
  datosCita,
  incluyeTransporte,
  setIncluyeTransporte,
  tipoAsistenciaTransporte,
  setTipoAsistenciaTransporte,
  metodoPago,
  setMetodoPago,
  bancoPse,
  setBancoPse,
  celularNequi,
  setCelularNequi,
  tarjetaNfcLeida,
  onEscanearNFC,
  valorCita,
  valorTransporte,
  totalPagar,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className={styles.formularioPagos}>
      {/* PASO 1: DATOS DE LA CITA MÉDICA A PAGAR */}
      <fieldset className={styles.seccionFormulario}>
        <legend className={styles.tituloSeccion}>
          <span className={styles.numeroPaso}>1</span> Cita Médica a Pagar
        </legend>
        <p className={styles.ayudaSeccion}>
          <span className={styles.insigniaPrecargada}>Información precargada</span>
          Datos verificados automáticamente desde tu agendamiento y transporte. No editables para garantizar la trazabilidad del pago.
        </p>
        <div className={styles.avisoVerificacion}>
          ¿Los datos no son correctos? Vuelve a Agendamiento de Citas (haz clic en el paso 1 en la barra superior).
        </div>

        <div className={styles.filaFormulario}>
          <div className={styles.campoFormulario}>
            <label htmlFor="documentoPaciente">Documento del Paciente:</label>
            <div className={styles.grupoDocumento}>
              <select
                id="tipoDocumento"
                value={datosCita.tipoDocumento}
                disabled
                className={`${styles.selectDocumento} ${styles.selectBloqueado}`}
              >
                <option value="CC">C.C.</option>
                <option value="TI">T.I.</option>
                <option value="CE">C.E.</option>
              </select>
              <input
                type="text"
                id="documentoPaciente"
                value={datosCita.documentoPaciente}
                disabled
                readOnly
                className={styles.inputBloqueado}
              />
            </div>
          </div>

          <div className={styles.campoFormulario}>
            <label htmlFor="nombrePaciente">Nombre del Paciente:</label>
            <input
              type="text"
              id="nombrePaciente"
              value={datosCita.nombrePaciente}
              disabled
              readOnly
              className={styles.inputBloqueado}
            />
          </div>
        </div>

        <div className={styles.filaFormulario}>
          <div className={styles.campoFormulario}>
            <label htmlFor="ipsCita">IPS en Tunja:</label>
            <select
              id="ipsCita"
              value={datosCita.ipsCita}
              disabled
              className={styles.selectBloqueado}
            >
              <option value="Hospital Universitario San Rafael de Tunja">
                Hospital Universitario San Rafael de Tunja
              </option>
              <option value="Clínica Medilaser Tunja">Clínica Medilaser Tunja</option>
              <option value="Clínica de Los Andes">Clínica de Los Andes</option>
              <option value="E.S.E. Santiago de Tunja - Sede San Antonio">
                E.S.E. Santiago de Tunja (San Antonio)
              </option>
              <option value="E.S.E. Santiago de Tunja - Sede El Carmen">
                E.S.E. Santiago de Tunja (El Carmen)
              </option>
            </select>
          </div>

          <div className={styles.campoFormulario}>
            <label htmlFor="tipoCita">Servicio / Tipo de Cita Médica:</label>
            <select
              id="tipoCita"
              value={datosCita.tipoCita}
              disabled
              className={styles.selectBloqueado}
            >
              <option value="general">Consulta Medicina General / Odontología ($4.500 COP)</option>
              <option value="especialista">Consulta Médico Especialista ($18.200 COP)</option>
              <option value="terapias">Terapias y Rehabilitación Física ($12.000 COP)</option>
            </select>
          </div>
        </div>

        <div className={styles.filaFormulario}>
          <div className={styles.campoFormulario}>
            <label htmlFor="fechaCita">Fecha Programada:</label>
            <input
              type="date"
              id="fechaCita"
              value={datosCita.fechaCita}
              disabled
              readOnly
              className={styles.inputBloqueado}
            />
          </div>
          <div className={styles.campoFormulario}>
            <label htmlFor="horaCita">Hora de la Cita:</label>
            <input
              type="time"
              id="horaCita"
              value={datosCita.horaCita}
              disabled
              readOnly
              className={styles.inputBloqueado}
            />
          </div>
        </div>
      </fieldset>

      {/* PASO 2: SERVICIO DE TRANSPORTE PREFERENCIAL ADAPTADO */}
      <fieldset className={styles.seccionFormulario}>
        <legend className={styles.tituloSeccion}>
          <span className={styles.numeroPaso}>2</span> Servicio de Transporte Preferencial Adaptado
        </legend>
        <p className={styles.ayudaSeccion}>
          Verifica si el paciente con discapacidad o movilidad reducida requiere o utilizó el transporte preferencial hacia su IPS en Tunja.
        </p>

        <div className={styles.tarjetaServicioTransporte}>
          <label className={styles.controlTransporteDestacado} htmlFor="checkTransporte">
            <input
              type="checkbox"
              id="checkTransporte"
              className={styles.checkTransporte}
              checked={incluyeTransporte}
              onChange={(e) => setIncluyeTransporte(e.target.checked)}
            />
            <div className={styles.infoTransporteDestacado}>
              <div className={styles.tituloTransporteLinea}>
                <strong>♿ 🚐 Incluir cobro del Servicio de Transporte Preferencial Adaptado</strong>
                <span className={styles.precioEtiquetaTransporte}>
                  {incluyeTransporte ? `+ ${formatearMoneda(TARIFA_TRANSPORTE)} COP` : "No incluido"}
                </span>
              </div>
              <small>
                Vehículo adaptado de MediTunja para traslado puerta a puerta de pacientes en silla de ruedas, camilla o con movilidad reducida en Tunja.
              </small>
            </div>
          </label>

          {incluyeTransporte && (
            <div className={styles.opcionesAdicionalesTransporte}>
              <div className={styles.campoFormulario}>
                <label htmlFor="tipoAsistenciaTransporte">Requerimiento especial del traslado:</label>
                <select
                  id="tipoAsistenciaTransporte"
                  value={tipoAsistenciaTransporte}
                  onChange={(e) => setTipoAsistenciaTransporte(e.target.value)}
                >
                  {OPCIONES_ASISTENCIA_TRANSPORTE.map((opc) => (
                    <option key={opc.value} value={opc.value}>
                      {opc.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </fieldset>

      {/* PASO 3: MÉTODO DE PAGO RÁPIDO */}
      <fieldset className={styles.seccionFormulario}>
        <legend className={styles.tituloSeccion}>
          <span className={styles.numeroPaso}>3</span> Método de Pago
        </legend>
        <p className={styles.ayudaSeccion}>
          Selecciona cómo deseas realizar el pago seguro.
        </p>

        <div className={styles.rejillaMetodosPago} role="radiogroup" aria-label="Métodos de pago">
          {METODOS_PAGO.map((metodo) => (
            <label
              key={metodo.id}
              className={`${styles.opcionTarjetaPago} ${
                metodoPago === metodo.id ? styles.opcionSeleccionada : ""
              }`}
            >
              <input
                type="radio"
                name="metodoPago"
                value={metodo.id}
                checked={metodoPago === metodo.id}
                onChange={(e) => setMetodoPago(e.target.value)}
              />
              <div className={styles.opcionContenidoPago}>
                <span className={styles.iconoMetodo} aria-hidden="true">{metodo.icono}</span>
                <strong>{metodo.titulo}</strong>
                <small>{metodo.descripcion}</small>
              </div>
            </label>
          ))}
        </div>

        {/* Detalle específico según método seleccionado */}
        {metodoPago === "pse" && (
          <div className={styles.detallesMetodoEspecifico}>
            <div className={styles.campoFormulario}>
              <label htmlFor="bancoPse">Banco:</label>
              <select
                id="bancoPse"
                value={bancoPse}
                onChange={(e) => setBancoPse(e.target.value)}
              >
                {BANCOS_PSE.map((banco) => (
                  <option key={banco.id} value={banco.id}>
                    {banco.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {metodoPago === "nequi" && (
          <div className={styles.detallesMetodoEspecifico}>
            <div className={styles.campoFormulario}>
              <label htmlFor="celularNequi">Número de Celular para cobro:</label>
              <input
                type="tel"
                id="celularNequi"
                value={celularNequi}
                onChange={(e) => setCelularNequi(e.target.value)}
                placeholder="Ej: 3123456789"
                required
              />
            </div>
          </div>
        )}

        {metodoPago === "nfc-meditunja" && (
          <div className={styles.detallesMetodoEspecifico}>
            <div className={styles.cajaNfcInteractiva}>
              <span className={styles.iconoNfcOnda} aria-hidden="true">📳</span>
              <div className={styles.infoNfcTarjeta}>
                <strong>Lector de Carné NFC Activo</strong>
                <p>
                  {tarjetaNfcLeida
                    ? "✅ Tarjeta MediTunja leída y validada."
                    : "Aproxima la tarjeta o pulsa el botón."}
                </p>
              </div>
              <button
                type="button"
                className={styles.btnEscanearNfc}
                onClick={onEscanearNFC}
              >
                {tarjetaNfcLeida ? "Tarjeta Lista ✔" : "Escanear NFC"}
              </button>
            </div>
          </div>
        )}
      </fieldset>

      {/* PASO 4: RESUMEN DE COBRO Y LIQUIDACIÓN INMEDIATA */}
      <fieldset className={styles.seccionFormulario}>
        <legend className={styles.tituloSeccion}>
          <span className={styles.numeroPaso}>4</span> Resumen de Pago
        </legend>

        <div className={styles.cajaLiquidacion}>
          <table className={styles.tablaLiquidacion} aria-label="Desglose del pago">
            <tbody>
              <tr>
                <td>Valor Cita Médica ({PRECIOS_CITA[datosCita.tipoCita]?.nombre}):</td>
                <td>{formatearMoneda(valorCita)}</td>
              </tr>
              <tr>
                <td>Servicio de Transporte Preferencial Adaptado:</td>
                <td>
                  {incluyeTransporte
                    ? `+ ${formatearMoneda(valorTransporte)}`
                    : "No requerido ($0)"}
                </td>
              </tr>
              <tr className={styles.filaDestacada}>
                <td>Total a Cancelar:</td>
                <td>
                  <span className={styles.totalPrecio}>{formatearMoneda(totalPagar)}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </fieldset>

      {/* Botón de envío directo */}
      <div className={styles.botonesFormulario}>
        <button type="submit" className={styles.btnPagarSeguro}>
          💳 Confirmar y Pagar {formatearMoneda(totalPagar)}
        </button>
      </div>
    </form>
  );
}

export default FormularioPago;
