// Hook personalizado con la lógica de negocio del Módulo de Transporte Preferencial
// MediTunja - Separación de Lógica (JS) y Vista (JSX)

import { useState } from "react";
import {
  DATOS_CITA_PRECARGADOS,
  RECOMENDACIONES_POR_DISCAPACIDAD,
  REQUERIMIENTOS_VEHICULO
} from "../data/transporteData";

export function useTransporte() {
  // 1. Accesibilidad (tamaño de texto y alto contraste)
  const [fontSize, setFontSize] = useState("normal");
  const [highContrast, setHighContrast] = useState(false);

  // 2. Datos precargados de la cita médica (bloqueados)
  const [datosCita] = useState(DATOS_CITA_PRECARGADOS);

  // 3. Estado de la solicitud
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);

  // 4. Discapacidad y adaptaciones automáticas
  const [tipoDiscapacidad, setTipoDiscapacidad] = useState("");
  const [requerimientosSeleccionados, setRequerimientosSeleccionados] = useState([]);
  const [requerimientosRecomendados, setRequerimientosRecomendados] = useState([]);

  // 5. Modal de confirmación para desmarcar requerimientos recomendados
  const [modalConfirmacion, setModalConfirmacion] = useState({
    isOpen: false,
    reqId: null,
    reqTitulo: ""
  });

  // 5b. Modal de confirmación para limpiar todos los campos
  const [modalLimpiar, setModalLimpiar] = useState(false);

  // 6. Acompañante (por defecto 'no'; solo muestra nombre si se elige 'si')
  const [viajaAcompanante, setViajaAcompanante] = useState("no");
  const [nombreAcompanante, setNombreAcompanante] = useState("");

  // 7. Datos de recogida ingresados por el usuario
  const [direccionOrigen, setDireccionOrigen] = useState("");
  const [barrioSector, setBarrioSector] = useState("");
  const [puntosReferencia, setPuntosReferencia] = useState("");
  const [modalidadViaje, setModalidadViaje] = useState("ida-y-regreso");
  const [declaracionVeracidad, setDeclaracionVeracidad] = useState(false);

  // Manejo de cambio de tipo de discapacidad -> Selecciona automáticamente requerimientos recomendados
  const handleDiscapacidadChange = (e) => {
    const valor = e.target.value;
    setTipoDiscapacidad(valor);

    if (!valor) {
      setRequerimientosRecomendados([]);
      return;
    }

    const recomendados = RECOMENDACIONES_POR_DISCAPACIDAD[valor] || [];
    setRequerimientosRecomendados(recomendados);

    // Agrega los recomendados sin perder los que el usuario haya marcado manualmente
    setRequerimientosSeleccionados((prev) => {
      const nuevoSet = new Set([...prev, ...recomendados]);
      return Array.from(nuevoSet);
    });
  };

  // Manejo de clic en checkbox de requerimiento
  const handleToggleRequerimiento = (reqId) => {
    const yaEstaSeleccionado = requerimientosSeleccionados.includes(reqId);
    const esRecomendado = requerimientosRecomendados.includes(reqId);

    if (yaEstaSeleccionado) {
      // Si el usuario intenta quitar un requerimiento recomendado, pedir confirmación
      if (esRecomendado) {
        const item = REQUERIMIENTOS_VEHICULO.find((r) => r.id === reqId);
        setModalConfirmacion({
          isOpen: true,
          reqId: reqId,
          reqTitulo: item ? item.titulo : reqId
        });
      } else {
        // Si fue agregado manualmente, se retira directamente
        setRequerimientosSeleccionados((prev) => prev.filter((id) => id !== reqId));
      }
    } else {
      // Marcar nuevo requerimiento
      setRequerimientosSeleccionados((prev) => [...prev, reqId]);
    }
  };

  // Confirmar eliminación del requerimiento recomendado desde la ventana modal
  const confirmarQuitarRequerimiento = () => {
    const idAQuitar = modalConfirmacion.reqId;
    if (idAQuitar) {
      setRequerimientosSeleccionados((prev) => prev.filter((id) => id !== idAQuitar));
      setRequerimientosRecomendados((prev) => prev.filter((id) => id !== idAQuitar));
    }
    setModalConfirmacion({ isOpen: false, reqId: null, reqTitulo: "" });
  };

  // Cancelar eliminación (mantener requerimiento)
  const cancelarQuitarRequerimiento = () => {
    setModalConfirmacion({ isOpen: false, reqId: null, reqTitulo: "" });
  };

  // Manejo del envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    setSolicitudEnviada(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Solicitar confirmación antes de limpiar campos
  const handleSolicitarLimpiar = () => {
    setModalLimpiar(true);
  };

  // Confirmar limpieza de campos desde el modal
  const confirmarLimpiar = () => {
    setModalLimpiar(false);
    handleNuevaSolicitud();
  };

  // Cancelar limpieza de campos
  const cancelarLimpiar = () => {
    setModalLimpiar(false);
  };

  // Restablecer formulario
  const handleNuevaSolicitud = () => {
    setSolicitudEnviada(false);
    setTipoDiscapacidad("");
    setRequerimientosSeleccionados([]);
    setRequerimientosRecomendados([]);
    setViajaAcompanante("no");
    setNombreAcompanante("");
    setDireccionOrigen("");
    setBarrioSector("");
    setPuntosReferencia("");
    setDeclaracionVeracidad(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    // Accesibilidad
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,

    // Cita (bloqueados)
    datosCita,

    // Formulario y Envío
    solicitudEnviada,
    handleSubmit,
    handleNuevaSolicitud,

    // Discapacidad y Requerimientos
    tipoDiscapacidad,
    handleDiscapacidadChange,
    requerimientosSeleccionados,
    requerimientosRecomendados,
    handleToggleRequerimiento,

    // Modal de Confirmación (requerimientos)
    modalConfirmacion,
    confirmarQuitarRequerimiento,
    cancelarQuitarRequerimiento,

    // Modal de Confirmación (limpiar campos)
    modalLimpiar,
    handleSolicitarLimpiar,
    confirmarLimpiar,
    cancelarLimpiar,

    // Acompañante
    viajaAcompanante,
    setViajaAcompanante,
    nombreAcompanante,
    setNombreAcompanante,

    // Recogida y Destino
    direccionOrigen,
    setDireccionOrigen,
    barrioSector,
    setBarrioSector,
    puntosReferencia,
    setPuntosReferencia,
    modalidadViaje,
    setModalidadViaje,
    declaracionVeracidad,
    setDeclaracionVeracidad
  };
}
