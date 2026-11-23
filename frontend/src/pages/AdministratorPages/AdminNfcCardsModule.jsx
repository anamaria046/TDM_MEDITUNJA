import { useEffect, useMemo, useState } from "react";
import { CreditCard, Nfc } from "lucide-react";
import { apiRequest, mensajeError } from "../../auth/api.js";
import { useAdminAuth } from "../../auth/useAdminAuth.js";
import Filter from "../../components/Filter/Filter.jsx";
import styles from "./AdminNfcCardsModule.module.css";

function AdminNfcCardsModule() {
    const { token, usuario } = useAdminAuth();
    const [afiliados, setAfiliados] = useState([]);
    const [afiliadoId, setAfiliadoId] = useState("");
    const [busquedaAfiliado, setBusquedaAfiliado] = useState("");
    const [filtroTarjeta, setFiltroTarjeta] = useState("todos");
    const [uid, setUid] = useState("");
    const [cargando, setCargando] = useState(true);
    const [procesando, setProcesando] = useState(false);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tarjetaPropia, setTarjetaPropia] = useState(null);
    const [uidPropio, setUidPropio] = useState("");
    const [cargandoTarjetaPropia, setCargandoTarjetaPropia] = useState(true);
    const [procesandoTarjetaPropia, setProcesandoTarjetaPropia] = useState(false);
    const [errorTarjetaPropia, setErrorTarjetaPropia] = useState("");
    const [mensajeTarjetaPropia, setMensajeTarjetaPropia] = useState("");

    useEffect(() => {
        let activa = true;
        apiRequest("/admin/tarjetas-nfc/afiliados", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((respuesta) => {
                if (activa) setAfiliados(respuesta.data);
            })
            .catch((errorSolicitud) => {
                if (activa) setError(mensajeError(errorSolicitud));
            })
            .finally(() => {
                if (activa) setCargando(false);
            });

        apiRequest("/admin/tarjetas-nfc/mi-tarjeta", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((respuesta) => {
                if (activa) setTarjetaPropia(
                    respuesta.data.vinculada ? respuesta.data : null
                );
            })
            .catch((errorSolicitud) => {
                if (activa) setErrorTarjetaPropia(mensajeError(errorSolicitud));
            })
            .finally(() => {
                if (activa) setCargandoTarjetaPropia(false);
            });

        return () => {
            activa = false;
        };
    }, [token]);

    const afiliadoSeleccionado = afiliados.find(
        (afiliado) => String(afiliado.id) === afiliadoId
    );
    const disponibles = afiliados.filter((afiliado) => !afiliado.tarjetaIdentificador);
    const afiliadosVisibles = useMemo(() => {
        const termino = busquedaAfiliado.trim().toLocaleLowerCase("es");
        return afiliados.filter((afiliado) => {
            const coincideBusqueda = !termino || [
                afiliado.nombre,
                afiliado.tipoDocumento,
                afiliado.numeroDocumento,
                afiliado.email,
            ].join(" ").toLocaleLowerCase("es").includes(termino);
            const tieneTarjeta = Boolean(afiliado.tarjetaIdentificador);
            const coincideEstado = filtroTarjeta === "todos" ||
                (filtroTarjeta === "sin-tarjeta" && !tieneTarjeta) ||
                (filtroTarjeta === "con-tarjeta" && tieneTarjeta);
            return coincideBusqueda && coincideEstado;
        });
    }, [afiliados, busquedaAfiliado, filtroTarjeta]);

    async function vincularMiTarjeta(evento) {
        evento.preventDefault();
        setErrorTarjetaPropia("");
        setMensajeTarjetaPropia("");

        if (!/^(?:[A-F0-9]{2}){2,20}$/i.test(uidPropio)) {
            setErrorTarjetaPropia("Ingresa un UID válido de entre 4 y 40 caracteres hexadecimales.");
            return;
        }

        setProcesandoTarjetaPropia(true);
        try {
            const respuesta = await apiRequest("/admin/tarjetas-nfc/mi-tarjeta", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: JSON.stringify({ uid: uidPropio }),
            });
            setTarjetaPropia(respuesta.data);
            setUidPropio("");
            setMensajeTarjetaPropia(
                `Tu tarjeta NFC terminada en ${respuesta.data.identificador} quedó vinculada.`
            );
        } catch (errorSolicitud) {
            setErrorTarjetaPropia(mensajeError(errorSolicitud));
        } finally {
            setProcesandoTarjetaPropia(false);
        }
    }

    async function vincularTarjeta(evento) {
        evento.preventDefault();
        setError("");
        setMensaje("");

        if (!afiliadoSeleccionado || afiliadoSeleccionado.tarjetaIdentificador) {
            setError("Selecciona un afiliado activo y sin tarjeta vinculada.");
            return;
        }
        if (!/^(?:[A-F0-9]{2}){2,20}$/i.test(uid)) {
            setError("Ingresa un UID válido de entre 4 y 40 caracteres hexadecimales.");
            return;
        }

        setProcesando(true);
        try {
            const respuesta = await apiRequest(
                `/admin/tarjetas-nfc/afiliados/${afiliadoSeleccionado.id}/vincular`,
                {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ uid }),
                },
            );
            setAfiliados((actuales) => actuales.map((afiliado) =>
                afiliado.id === afiliadoSeleccionado.id
                    ? { ...afiliado, tarjetaIdentificador: respuesta.data.identificador }
                    : afiliado
            ));
            setAfiliadoId("");
            setUid("");
            setMensaje(`Tarjeta terminada en ${respuesta.data.identificador} vinculada a ${afiliadoSeleccionado.nombre}.`);
        } catch (errorSolicitud) {
            setError(mensajeError(errorSolicitud));
        } finally {
            setProcesando(false);
        }
    }

    return (
        <main className={styles.page}>
            <header className={styles.header}>
                <span>ADMINISTRACIÓN · {usuario?.eps || "EPS"}</span>
                <h1>Vinculación de tarjetas NFC</h1>
                <p>Vincula tu tarjeta administradora y consulta o asigna tarjetas a pacientes de tu EPS.</p>
            </header>

            <section className={styles.panel} aria-labelledby="admin-card-title">
                <div className={styles.panelHeading}>
                    <span className={styles.icon} aria-hidden="true"><Nfc size={24} /></span>
                    <div>
                        <h2 id="admin-card-title">Mi tarjeta de administrador EPS</h2>
                        <p>Asocia una tarjeta NFC a tu propia cuenta administradora de {usuario?.eps || "tu EPS"}.</p>
                    </div>
                </div>

                {cargandoTarjetaPropia && (
                    <p className={styles.notice} role="status">Consultando tu tarjeta administradora...</p>
                )}
                {!cargandoTarjetaPropia && errorTarjetaPropia && (
                    <p className={styles.error} role="alert">{errorTarjetaPropia}</p>
                )}
                {!cargandoTarjetaPropia && tarjetaPropia && (
                    <p className={styles.success} role="status">
                        Tu tarjeta administradora está vinculada: •••• {tarjetaPropia.identificador}.
                    </p>
                )}
                {!cargandoTarjetaPropia && !errorTarjetaPropia && !tarjetaPropia && (
                    <form className={styles.form} onSubmit={vincularMiTarjeta}>
                        <label className={styles.label} htmlFor="uid-tarjeta-administrador">
                            UID de tu tarjeta
                        </label>
                        <div className={styles.inputWithIcon}>
                            <CreditCard size={19} aria-hidden="true" />
                            <input
                                id="uid-tarjeta-administrador"
                                className={styles.input}
                                type="text"
                                value={uidPropio}
                                onChange={(evento) => setUidPropio(
                                    evento.target.value.replace(/[^a-f\d]/gi, "").toUpperCase()
                                )}
                                autoComplete="off"
                                maxLength={40}
                                pattern="([A-Fa-f0-9]{2}){2,20}"
                                placeholder="Ej.: 04A1B2C3D4E5F6"
                                required
                                disabled={procesandoTarjetaPropia}
                            />
                        </div>
                        <p className={styles.readerNotice}>
                            Para leerla con el ACR122U, inicia <code>Lector\Puente.bat</code> en modo normal,
                            haz clic en el campo del UID y acerca la tarjeta.
                        </p>
                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={procesandoTarjetaPropia}
                        >
                            {procesandoTarjetaPropia ? "Vinculando tu tarjeta..." : "Vincular mi tarjeta"}
                        </button>
                    </form>
                )}
                {mensajeTarjetaPropia && (
                    <p className={styles.success} role="status">{mensajeTarjetaPropia}</p>
                )}
            </section>

            <section className={styles.panel} aria-labelledby="nfc-link-title">
                <div className={styles.panelHeading}>
                    <span className={styles.icon} aria-hidden="true"><Nfc size={24} /></span>
                    <div>
                        <h2 id="nfc-link-title">Asignar tarjeta a un afiliado</h2>
                        <p>La tarjeta queda asociada a la cuenta del afiliado en MediTunja y TunjaAPI.</p>
                    </div>
                </div>

                {cargando && <p className={styles.notice} role="status">Consultando afiliados de {usuario?.eps || "la EPS"}...</p>}
                {!cargando && error && <p className={styles.error} role="alert">{error}</p>}
                {!cargando && !error && afiliados.length === 0 && (
                    <p className={styles.notice} role="status">No hay afiliados activos y aprobados de esta EPS disponibles.</p>
                )}

                {!cargando && afiliados.length > 0 && (
                    <>
                        <Filter
                            id="tarjetas-nfc-afiliados"
                            searchValue={busquedaAfiliado}
                            onSearchChange={(valor) => {
                                setBusquedaAfiliado(valor);
                                setAfiliadoId("");
                            }}
                            searchLabel="Buscar afiliado"
                            searchPlaceholder="Nombre, documento o correo"
                            filterValue={filtroTarjeta}
                            onFilterChange={(valor) => {
                                setFiltroTarjeta(valor);
                                setAfiliadoId("");
                            }}
                            filterLabel="Filtrar por tarjeta"
                            filterOptions={[
                                { value: "todos", label: "Todos los afiliados" },
                                { value: "sin-tarjeta", label: "Sin tarjeta vinculada" },
                                { value: "con-tarjeta", label: "Con tarjeta vinculada" },
                            ]}
                            variant="embedded"
                        />
                        {afiliadosVisibles.length === 0 && (
                            <p className={styles.notice} role="status">
                                No hay afiliados que coincidan con la búsqueda o el filtro seleccionados.
                            </p>
                        )}
                        {afiliadosVisibles.length > 0 && (
                            <ul className={styles.affiliateList} aria-label="Afiliados encontrados">
                                {afiliadosVisibles.map((afiliado) => {
                                    const tieneTarjeta = Boolean(afiliado.tarjetaIdentificador);
                                    const seleccionado = String(afiliado.id) === afiliadoId;
                                    return (
                                        <li key={afiliado.id}>
                                            <button
                                                type="button"
                                                className={`${styles.affiliateOption} ${seleccionado ? styles.affiliateOptionSelected : ""}`}
                                                aria-pressed={seleccionado}
                                                disabled={procesando || tieneTarjeta}
                                                onClick={() => {
                                                    setAfiliadoId(String(afiliado.id));
                                                    setError("");
                                                    setMensaje("");
                                                }}
                                            >
                                                <span>
                                                    <strong>{afiliado.nombre}</strong>
                                                    <small>{afiliado.tipoDocumento} {afiliado.numeroDocumento}</small>
                                                </span>
                                                <span className={styles.affiliateStatus}>
                                                    {tieneTarjeta
                                                        ? `Tarjeta vinculada •••• ${afiliado.tarjetaIdentificador}`
                                                        : seleccionado ? "Seleccionado" : "Disponible"}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {disponibles.length > 0 ? (
                            <form className={styles.form} onSubmit={vincularTarjeta}>
                                <label className={styles.label} htmlFor="uid-afiliado-nfc">UID de la tarjeta</label>
                                <div className={styles.inputWithIcon}>
                                    <CreditCard size={19} aria-hidden="true" />
                                    <input
                                        id="uid-afiliado-nfc"
                                        className={styles.input}
                                        type="text"
                                        value={uid}
                                        onChange={(evento) => setUid(
                                            evento.target.value.replace(/[^a-f\d]/gi, "").toUpperCase()
                                        )}
                                        autoComplete="off"
                                        maxLength={40}
                                        pattern="([A-Fa-f0-9]{2}){2,20}"
                                        placeholder="Ej.: 04A1B2C3D4E5F6"
                                        required
                                        disabled={procesando}
                                    />
                                </div>
                                <p className={styles.readerNotice}>
                                    Para leerla con el ACR122U, inicia <code>Lector\Puente.bat</code> en modo normal,
                                    haz clic en el campo del UID y acerca la tarjeta.
                                </p>
                                <button
                                    className={styles.submitButton}
                                    type="submit"
                                    disabled={procesando || !afiliadoSeleccionado || Boolean(afiliadoSeleccionado.tarjetaIdentificador)}
                                >
                                    {procesando ? "Vinculando tarjeta..." : "Vincular tarjeta"}
                                </button>
                            </form>
                        ) : (
                            <p className={styles.notice} role="status">Todos los afiliados disponibles ya tienen una tarjeta vinculada.</p>
                        )}
                    </>
                )}

                {mensaje && <p className={styles.success} role="status">{mensaje}</p>}
                {error && !cargando && afiliados.length > 0 && (
                    <p className={styles.error} role="alert">{error}</p>
                )}
                {afiliadoSeleccionado?.tarjetaIdentificador && (
                    <p className={styles.notice} role="status">
                        El afiliado seleccionado ya tiene una tarjeta vinculada terminada en •••• {afiliadoSeleccionado.tarjetaIdentificador}.
                    </p>
                )}
            </section>
        </main>
    );
}

export default AdminNfcCardsModule;
