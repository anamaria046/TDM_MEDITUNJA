// Hook personalizado con la lógica de negocio del Módulo de Convenios
// MediTunja - Separación de Lógica y Vista

import { useState, useMemo, useEffect } from "react";
import { apiRequest, mensajeError } from "../../../../auth/api.js";
import { useAdminAuth } from "../../../../auth/useAdminAuth.js";
import {
  EPS_CATALOGO,
  IPS_CATALOGO,
  PORTAFOLIOS_ASISTENCIALES,
  SERVICIOS_POR_CATEGORIA
} from "../data/conveniosData";

function normalizarEps(valor) {
  return valor.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .replace(/\beps\b/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function useConvenios() {
  const { token, usuario } = useAdminAuth();
  const epsDisponibles = useMemo(
    () => EPS_CATALOGO.filter((eps) => normalizarEps(eps.nombre) === normalizarEps(usuario.eps)),
    [usuario.eps]
  );
  const [convenios, setConvenios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estados del formulario de convenio: EPS Gestora e IPS Prestadora
  const [epsId, setEpsId] = useState(() => epsDisponibles[0]?.id || "");
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

  useEffect(() => {
    let activo = true;
    apiRequest("/admin/convenios", {
      headers: { Authorization: `Bearer ${token}` }
    }).then((respuesta) => {
      if (activo) setConvenios(respuesta.data);
    }).catch((error) => {
      if (activo) setNotificacion(mensajeError(error));
    }).finally(() => {
      if (activo) setCargando(false);
    });

    return () => {
      activo = false;
    };
  }, [token]);

  // Obtener datos de la EPS seleccionada actualmente
  const epsActual = useMemo(() => {
    return epsDisponibles.find((eps) => eps.id === epsId) || epsDisponibles[0] || null;
  }, [epsDisponibles, epsId]);

  // Obtener datos de la IPS seleccionada actualmente
  const ipsActual = useMemo(() => {
    return IPS_CATALOGO.find((ips) => ips.id === ipsId) || IPS_CATALOGO[0] || null;
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
    if (!epsDisponibles.some((eps) => eps.id === id)) return;
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
    setEpsId(epsDisponibles[0]?.id || "");
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (serviciosSeleccionados.length === 0) {
      alert("Por favor selecciona al menos un servicio médico para autorizar en el convenio.");
      return;
    }

    if (!epsActual) {
      setNotificacion("La EPS asignada a esta cuenta no coincide con el catálogo de EPS.");
      return;
    }
    const portafolioObj = PORTAFOLIOS_ASISTENCIALES.find((p) => p.id === portafolioId);

    const nuevoConvenio = {
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

    try {
      const respuesta = await apiRequest("/admin/convenios", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(nuevoConvenio)
      });
      setConvenios((prev) => [respuesta.data, ...prev]);
      setNotificacion(`Convenio guardado entre ${epsActual.nombre} y ${ipsActual.nombre}.`);
    } catch (error) {
      setNotificacion(mensajeError(error));
    }
  };

  // Eliminar o archivar un convenio
  const handleEliminarConvenio = async (id) => {
    if (window.confirm("¿Seguro que deseas desactivar este convenio de la red en Tunja?")) {
      try {
        await apiRequest(`/admin/convenios/${encodeURIComponent(id)}/desactivar`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` }
        });
        setConvenios((prev) => prev.map((convenio) =>
          convenio.id === id ? { ...convenio, estado: "Inactivo" } : convenio
        ));
        setNotificacion("Convenio desactivado.");
      } catch (error) {
        setNotificacion(mensajeError(error));
      }
    }
  };

  return {
    convenios,
    epsId,
    epsDisponibles,
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
    cargando,
    handleToggleServicio,
    handleSeleccionarTodosCategoria,
    handleDeseleccionarCategoria,
    handleRestablecer,
    handleSubmit,
    handleEliminarConvenio
  };
}
