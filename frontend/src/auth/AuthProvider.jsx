import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, apiRequest } from "./api.js";
import { AuthContext } from "./AuthContext.js";

const claveSesion = "meditunja_tunja_session";
let renovacionEnCurso;

function guardarSesion(sesion) {
    window.localStorage.setItem(claveSesion, JSON.stringify(sesion));
}

function borrarSesionGuardada() {
    window.localStorage.removeItem(claveSesion);
}

function combinarUsuario(usuarioAnterior, usuarioActualizado) {
    const combinado = { ...usuarioAnterior, ...usuarioActualizado };
    for (const campo of [
        "estado_afiliacion",
        "eps",
        "telefono",
        "nombres",
        "apellidos",
        "tipo_documento",
        "numero_documento",
        "email",
    ]) {
        if (usuarioActualizado?.[campo] == null || usuarioActualizado[campo] === "") {
            combinado[campo] = usuarioAnterior?.[campo] ?? usuarioActualizado?.[campo];
        }
    }
    delete combinado.tarjetaNfc;
    delete combinado.tarjeta_nfc;
    return combinado;
}

function renovarSesion(refresco) {
    if (!renovacionEnCurso) {
        renovacionEnCurso = apiRequest("/tunja/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refresco }),
        }).finally(() => {
            renovacionEnCurso = null;
        });
    }
    return renovacionEnCurso;
}

function crearSesion(respuesta, usuarioAnterior) {
    if (
        typeof respuesta?.acceso !== "string" ||
        typeof respuesta?.refresco !== "string" ||
        !respuesta.usuario
    ) {
        throw new Error("TunjaAPI devolvió una respuesta de autenticación incompleta.");
    }
    return {
        accessToken: respuesta.acceso,
        refreshToken: respuesta.refresco,
        expiresAt: Date.now() + (Number(respuesta.expira_en) || 900) * 1000,
        usuario: combinarUsuario(usuarioAnterior || {}, respuesta.usuario),
    };
}

function AuthProvider({ children }) {
    const [sesion, setSesion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [errorInicial, setErrorInicial] = useState("");

    useEffect(() => {
        let activa = true;

        async function validarSesionGuardada() {
            const sesionGuardada = window.localStorage.getItem(claveSesion);
            if (!sesionGuardada) {
                if (activa) setCargando(false);
                return;
            }

            try {
                let existente;
                try {
                    existente = JSON.parse(sesionGuardada);
                } catch {
                    borrarSesionGuardada();
                    return;
                }

                if (
                    typeof existente?.accessToken !== "string" ||
                    typeof existente?.refreshToken !== "string"
                ) {
                    borrarSesionGuardada();
                    return;
                }

                let sesionActual = existente;
                try {
                    const usuario = await apiRequest("/tunja/auth/me", {
                        headers: { Authorization: `Bearer ${existente.accessToken}` },
                    });
                    sesionActual = {
                        ...existente,
                        usuario: combinarUsuario(existente.usuario, usuario),
                    };
                } catch (error) {
                    if (!(error instanceof ApiError &&
                        error.status === 401 &&
                        error.code === "token_expirado")) {
                        throw error;
                    }
                    sesionActual = crearSesion(
                        await renovarSesion(existente.refreshToken),
                        existente.usuario,
                    );
                }

                if (activa) {
                    guardarSesion(sesionActual);
                    setSesion(sesionActual);
                    setErrorInicial("");
                }
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                    borrarSesionGuardada();
                } else if (activa) {
                    setErrorInicial(
                        error instanceof Error
                            ? error.message
                            : "No se pudo validar la sesión guardada.",
                    );
                }
            } finally {
                if (activa) setCargando(false);
            }
        }

        validarSesionGuardada();
        return () => {
            activa = false;
        };
    }, []);

    useEffect(() => {
        if (!sesion?.refreshToken || !sesion.expiresAt) return undefined;

        const espera = Math.max(sesion.expiresAt - Date.now() - 30000, 0);
        const temporizador = window.setTimeout(async () => {
            try {
                const renovada = crearSesion(
                    await renovarSesion(sesion.refreshToken),
                    sesion.usuario,
                );
                guardarSesion(renovada);
                setSesion(renovada);
                setErrorInicial("");
            } catch (error) {
                if (error instanceof ApiError && error.status === 401) {
                    borrarSesionGuardada();
                    setSesion(null);
                } else {
                    setErrorInicial(
                        error instanceof Error
                            ? error.message
                            : "No se pudo renovar la sesión.",
                    );
                }
            }
        }, espera);

        return () => window.clearTimeout(temporizador);
    }, [sesion]);

    const iniciarSesion = useCallback(async (credenciales) => {
        const respuesta = await apiRequest("/tunja/auth/login", {
            method: "POST",
            body: JSON.stringify(credenciales),
        });
        const nuevaSesion = crearSesion(respuesta);
        guardarSesion(nuevaSesion);
        setSesion(nuevaSesion);
        setErrorInicial("");
        return respuesta;
    }, []);

    const registrar = useCallback(async (datos) => {
        const respuesta = await apiRequest("/tunja/auth/register", {
            method: "POST",
            body: datos,
        });
        return respuesta;
    }, []);

    const actualizarUsuario = useCallback(async () => {
        const accessToken = sesion?.accessToken;
        if (!accessToken) {
            throw new Error("Inicia sesión para consultar el estado de tu afiliación.");
        }
        const usuario = await apiRequest("/tunja/auth/me", {
            headers: { Authorization: "Bearer " + accessToken },
        });
        setSesion((actual) => {
            if (actual?.accessToken !== accessToken) return actual;
            const sesionActualizada = {
                ...actual,
                usuario: combinarUsuario(actual.usuario, usuario),
            };
            guardarSesion(sesionActualizada);
            return sesionActualizada;
        });
        return usuario;
    }, [sesion?.accessToken]);

    const cerrarSesion = useCallback(async () => {
        const refresco = sesion?.refreshToken;
        borrarSesionGuardada();
        setSesion(null);
        setErrorInicial("");

        if (refresco) {
            await apiRequest("/tunja/auth/logout", {
                method: "POST",
                body: JSON.stringify({ refresco }),
            });
        }
    }, [sesion]);

    const valor = useMemo(
        () => ({
            sesion,
            cargando,
            errorInicial,
            iniciarSesion,
            registrar,
            actualizarUsuario,
            cerrarSesion,
        }),
        [sesion, cargando, errorInicial, iniciarSesion, registrar, actualizarUsuario, cerrarSesion],
    );

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
