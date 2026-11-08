import { useCallback, useEffect, useState } from "react";
import { apiRequest, mensajeError } from "../../../../auth/api.js";
import { useAuth } from "../../../../auth/useAuth.js";
import {
  RECOMENDACIONES_POR_DISCAPACIDAD,
  REQUERIMIENTOS_VEHICULO
} from "../data/transporteData.js";

const nombresDocumento = {
  CC: "Cédula de Ciudadanía (C.C.)",
  TI: "Tarjeta de Identidad (T.I.)",
  CE: "Cédula de Extranjería (C.E.)",
  PAS: "Pasaporte"
};

const nombresIps = {
  "san-rafael": "Hospital San Rafael de Tunja",
  "santiago-tunja": "E.S.E. Santiago de Tunja",
  "clinica-medilaser": "Clínica Medilaser",
  "clinica-andes": "Clínica Los Andes",
  "clinica-chia": "Clínica de Chía"
};

function instanteCita(cita) {
  return new Date(`${cita.fecha}T${cita.hora}:00-05:00`).getTime();
}

function crearDatosCita(usuario, cita) {
  return {
    citaId: cita.id_cita,
    tipoDocumentoTexto: nombresDocumento[usuario.tipo_documento] || usuario.tipo_documento || "—",
    numeroDocumento: usuario.numero_documento || usuario.documento || "—",
    nombresPaciente: [usuario.nombres || usuario.nombre, usuario.apellidos].filter(Boolean).join(" "),
    epsPacienteTexto: usuario.eps || "—",
    telefonoPaciente: usuario.telefono || "No registrado",
    telefonoCuidador: "No registrado",
    ipsDestinoTexto: nombresIps[cita.ips] || cita.ips,
    tipoAtencion: cita.especialidad,
    fechaCita: cita.fecha,
    horaCita: cita.hora
  };
}

export function useTransporte() {
  const { sesion } = useAuth();
  const [datosCita, setDatosCita] = useState(null);
  const [cargandoCita, setCargandoCita] = useState(true);
  const [errorCita, setErrorCita] = useState("");
  const [solicitudEnviada, setSolicitudEnviada] = useState(false);
  const [solicitudId, setSolicitudId] = useState(null);
  const [estadoSolicitud, setEstadoSolicitud] = useState("solicitada");
  const [enviando, setEnviando] = useState(false);
  const [errorSolicitud, setErrorSolicitud] = useState("");
  const [tipoDiscapacidad, setTipoDiscapacidad] = useState("");
  const [requerimientosSeleccionados, setRequerimientosSeleccionados] = useState([]);
  const [requerimientosRecomendados, setRequerimientosRecomendados] = useState([]);
  const [modalConfirmacion, setModalConfirmacion] = useState({
    isOpen: false,
    reqId: null,
    reqTitulo: ""
  });
  const [modalLimpiar, setModalLimpiar] = useState(false);
  const [viajaAcompanante, setViajaAcompanante] = useState("no");
  const [nombreAcompanante, setNombreAcompanante] = useState("");
  const [direccionOrigen, setDireccionOrigen] = useState("");
  const [barrioSector, setBarrioSector] = useState("");
  const [puntosReferencia, setPuntosReferencia] = useState("");
  const [modalidadViaje, setModalidadViaje] = useState("ida-y-regreso");
  const [declaracionVeracidad, setDeclaracionVeracidad] = useState(false);

  useEffect(() => {
    let activa = true;
    const autorizacion = { Authorization: `Bearer ${sesion.accessToken}` };
    Promise.all([
      apiRequest("/citas", { headers: autorizacion }),
      apiRequest("/transporte", { headers: autorizacion })
    ]).then(([respuestaCitas, respuestaSolicitudes]) => {
      if (!activa) return;
      const cita = respuestaCitas.data
        .filter((item) => item.estado === "confirmada" && instanteCita(item) > Date.now())
        .sort((a, b) => instanteCita(a) - instanteCita(b))[0];
      if (!cita) {
        setErrorCita("Agenda una cita confirmada para solicitar transporte.");
        return;
      }

      setDatosCita(crearDatosCita(sesion.usuario, cita));
      const solicitud = respuestaSolicitudes.data.find((item) => item.cita_id === cita.id_cita);
      if (solicitud) {
        setSolicitudId(solicitud.id);
        setEstadoSolicitud(solicitud.estado);
        setSolicitudEnviada(true);
      }
    }).catch((error) => {
      if (activa) setErrorCita(mensajeError(error));
    }).finally(() => {
      if (activa) setCargandoCita(false);
    });

    return () => {
      activa = false;
    };
  }, [sesion.accessToken, sesion.usuario]);

  const handleDiscapacidadChange = (event) => {
    const valor = event.target.value;
    setTipoDiscapacidad(valor);
    const recomendados = RECOMENDACIONES_POR_DISCAPACIDAD[valor] || [];
    setRequerimientosRecomendados(recomendados);
    setRequerimientosSeleccionados((actuales) =>
      Array.from(new Set([...actuales, ...recomendados]))
    );
  };

  const handleToggleRequerimiento = (reqId) => {
    if (requerimientosSeleccionados.includes(reqId)) {
      if (requerimientosRecomendados.includes(reqId)) {
        const item = REQUERIMIENTOS_VEHICULO.find((requerimiento) => requerimiento.id === reqId);
        setModalConfirmacion({
          isOpen: true,
          reqId,
          reqTitulo: item?.titulo || reqId
        });
      } else {
        setRequerimientosSeleccionados((actuales) => actuales.filter((id) => id !== reqId));
      }
    } else {
      setRequerimientosSeleccionados((actuales) => [...actuales, reqId]);
    }
  };

  const confirmarQuitarRequerimiento = () => {
    const id = modalConfirmacion.reqId;
    if (id) {
      setRequerimientosSeleccionados((actuales) => actuales.filter((actual) => actual !== id));
      setRequerimientosRecomendados((actuales) => actuales.filter((actual) => actual !== id));
    }
    setModalConfirmacion({ isOpen: false, reqId: null, reqTitulo: "" });
  };

  const cancelarQuitarRequerimiento = () => {
    setModalConfirmacion({ isOpen: false, reqId: null, reqTitulo: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!datosCita?.citaId) return;
    setErrorSolicitud("");
    setEnviando(true);
    try {
      const respuesta = await apiRequest("/transporte", {
        method: "POST",
        headers: { Authorization: `Bearer ${sesion.accessToken}` },
        body: JSON.stringify({
          citaId: datosCita.citaId,
          tipoDiscapacidad,
          requerimientos: requerimientosSeleccionados,
          viajaAcompanante: viajaAcompanante === "si",
          nombreAcompanante,
          direccionOrigen,
          barrioSector,
          puntosReferencia,
          modalidadViaje,
          declaracionVeracidad
        })
      });
      setSolicitudId(respuesta.data.id);
      setEstadoSolicitud(respuesta.data.estado);
      setSolicitudEnviada(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErrorSolicitud(mensajeError(error));
    } finally {
      setEnviando(false);
    }
  };

  const handleSolicitarLimpiar = () => setModalLimpiar(true);
  const cancelarLimpiar = () => setModalLimpiar(false);

  const handleNuevaSolicitud = useCallback(() => {
    setSolicitudEnviada(false);
    setSolicitudId(null);
    setEstadoSolicitud("solicitada");
    setTipoDiscapacidad("");
    setRequerimientosSeleccionados([]);
    setRequerimientosRecomendados([]);
    setViajaAcompanante("no");
    setNombreAcompanante("");
    setDireccionOrigen("");
    setBarrioSector("");
    setPuntosReferencia("");
    setDeclaracionVeracidad(false);
    setErrorSolicitud("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const confirmarLimpiar = () => {
    setModalLimpiar(false);
    handleNuevaSolicitud();
  };

  return {
    datosCita,
    citaCargando: cargandoCita,
    errorCita,
    solicitudEnviada,
    solicitudId,
    estadoSolicitud,
    enviando,
    errorSolicitud,
    handleSubmit,
    handleNuevaSolicitud,
    tipoDiscapacidad,
    handleDiscapacidadChange,
    requerimientosSeleccionados,
    requerimientosRecomendados,
    handleToggleRequerimiento,
    modalConfirmacion,
    confirmarQuitarRequerimiento,
    cancelarQuitarRequerimiento,
    modalLimpiar,
    handleSolicitarLimpiar,
    confirmarLimpiar,
    cancelarLimpiar,
    viajaAcompanante,
    setViajaAcompanante,
    nombreAcompanante,
    setNombreAcompanante,
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
