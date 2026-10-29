// Hook personalizado con la lógica de negocio del Módulo de Convenios
// MediTunja - Separación de Lógica y Vista

import { useState, useMemo } from "react";
import {
  EPS_CATALOGO,
  IPS_CATALOGO,
  PORTAFOLIOS_ASISTENCIALES,
  SERVICIOS_POR_CATEGORIA,
  CONVENIOS_INICIALES
} from "../data/conveniosData";

export function useConvenios() {
  // Lista de convenios registrados
  const [convenios, setConvenios] = useState(CONVENIOS_INICIALES);

  // Estados del formulario de convenio: EPS Gestora e IPS Prestadora
  const [epsId, setEpsId] = useState(EPS_CATALOGO[0].id);
  const [ipsId, setIpsId] = useState(IPS_CATALOGO[0].id);
  const [portafolioId, setPortafolioId] = useState("integral");
  const [categoriaFiltro, setCategoriaFiltro] = useState("todas");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([
    "srv-med-gen",
    "srv-cardiologia",
    "srv-neurologia"
  ]);
  const [clausulaTransporte, setClausulaTransporte] = useState(true);

  // Mensaje de retroalimentación
  const [notificacion, setNotificacion] = useState("");

  // Obtener datos de la EPS seleccionada actualmente
  const epsActual = useMemo(() => {
    return EPS_CATALOGO.find((eps) => eps.id === epsId) || EPS_CATALOGO[0];
  }, [epsId]);

  // Obtener datos de la IPS seleccionada actualmente
  const ipsActual = useMemo(() => {
    return IPS_CATALOGO.find((ips) => ips.id === ipsId) || IPS_CATALOGO[0];
  }, [ipsId]);

  // Servicios filtrados según la categoría activa y la IPS seleccionada
  const serviciosFiltrados = useMemo(() => {
    const serviciosIps = Array.isArray(ipsActual?.servicios) ? ipsActual.servicios : [];
    return SERVICIOS_POR_CATEGORIA.filter(
      (srv) =>
        (serviciosIps.length === 0 || serviciosIps.includes(srv.id)) &&
        (categoriaFiltro === "todas" || srv.categoria === categoriaFiltro)
    );
  }, [categoriaFiltro, ipsActual]);

  // Cambiar EPS
  const handleCambiarEps = (valor) => {
    const id = valor && typeof valor === "object" && valor.target ? valor.target.value : valor;
    if (!id) return;
    setEpsId(id);
  };

  // Cambiar IPS Prestadora y sincronizar servicios
  const handleCambiarIps = (valor) => {
    const id = valor && typeof valor === "object" && valor.target ? valor.target.value : valor;
    if (!id) return;

    const nuevaIps = IPS_CATALOGO.find((ips) => ips.id === id);
    if (!nuevaIps) return;

    setIpsId(id);
    setCategoriaFiltro("todas");
    const listaServicios = Array.isArray(nuevaIps.servicios) ? nuevaIps.servicios : [];
    setServiciosSeleccionados(listaServicios.slice(0, 3));
  };

  // Conmutar selección de un servicio individual
  const handleToggleServicio = (servicioId) => {
    setServiciosSeleccionados((prev) => {
      if (prev.includes(servicioId)) {
        return prev.filter((id) => id !== servicioId);
      } else {
        return [...prev, servicioId];
      }
    });
  };

  // Seleccionar todos los servicios de la categoría actual
  const handleSeleccionarTodosCategoria = () => {
    const idsCategoria = serviciosFiltrados.map((s) => s.id);
    setServiciosSeleccionados((prev) => {
      const nuevoSet = new Set([...prev, ...idsCategoria]);
      return Array.from(nuevoSet);
    });
  };

  // Desmarcar todos los servicios de la categoría actual
  const handleDeseleccionarCategoria = () => {
    const idsCategoria = new Set(serviciosFiltrados.map((s) => s.id));
    setServiciosSeleccionados((prev) => prev.filter((id) => !idsCategoria.has(id)));
  };

  // Restablecer el formulario
  const handleRestablecer = () => {
    setEpsId(EPS_CATALOGO[0].id);
    setIpsId(IPS_CATALOGO[0].id);
    setPortafolioId("integral");
    setCategoriaFiltro("todas");
    const primeraIps = IPS_CATALOGO[0];
    const serviciosDefecto = Array.isArray(primeraIps.servicios) ? primeraIps.servicios.slice(0, 3) : [];
    setServiciosSeleccionados(serviciosDefecto);
    setClausulaTransporte(true);
    setNotificacion("");
  };

  // Enviar y formalizar convenio
  const handleSubmit = (e) => {
    e.preventDefault();

    if (serviciosSeleccionados.length === 0) {
      alert("Por favor selecciona al menos un servicio médico para autorizar en el convenio.");
      return;
    }

    const portafolioObj = PORTAFOLIOS_ASISTENCIALES.find((p) => p.id === portafolioId);

    const nuevoConvenio = {
      id: `CNV-TUN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      epsId: epsActual.id,
      epsNombre: epsActual.nombre,
      epsSede: epsActual.sede,
      epsDireccion: epsActual.direccion,
      ipsId: ipsActual.id,
      ipsNombre: ipsActual.nombre,
      ipsSede: ipsActual.sede,
      ipsDireccion: ipsActual.direccion,
      portafolioId: portafolioId,
      portafolioNombre: portafolioObj ? portafolioObj.nombre : portafolioId,
      serviciosSeleccionados: [...serviciosSeleccionados],
      clausulaTransporte: clausulaTransporte,
      estado: "Activo",
      fechaCreacion: new Date().toISOString().split("T")[0]
    };

    setConvenios((prev) => [nuevoConvenio, ...prev]);
    setNotificacion(`¡Convenio formalizado con éxito entre ${epsActual.nombre} y ${ipsActual.nombre}!`);

    // Limpiar notificación tras 4 segundos
    setTimeout(() => {
      setNotificacion("");
    }, 4000);
  };

  // Eliminar o archivar un convenio
  const handleEliminarConvenio = (id) => {
    if (window.confirm("¿Seguro que deseas desactivar este convenio de la red en Tunja?")) {
      setConvenios((prev) => prev.filter((c) => c.id !== id));
    }
  };

  return {
    convenios,
    epsId,
    setEpsId: handleCambiarEps,
    handleCambiarEps,
    epsActual,
    ipsId,
    setIpsId: handleCambiarIps,
    handleCambiarIps,
    ipsActual,
    portafolioId,
    setPortafolioId,
    categoriaFiltro,
    setCategoriaFiltro,
    serviciosSeleccionados,
    serviciosFiltrados,
    clausulaTransporte,
    setClausulaTransporte,
    notificacion,
    handleToggleServicio,
    handleSeleccionarTodosCategoria,
    handleDeseleccionarCategoria,
    handleRestablecer,
    handleSubmit,
    handleEliminarConvenio
  };
}
