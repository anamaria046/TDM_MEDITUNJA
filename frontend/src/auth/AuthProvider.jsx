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

function crearSesion(respuesta) {
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
        usuario: respuesta.usuario,
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
                    sesionActual = { ...existente, usuario };
                } catch (error) {
                    if (!(error instanceof ApiError &&
                        error.status === 401 &&
                        error.code === "token_expirado")) {
                        throw error;
                    }
                    sesionActual = crearSesion(
                        await renovarSesion(existente.refreshToken),
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
                const renovada = crearSesion(await renovarSesion(sesion.refreshToken));
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
            body: JSON.stringify(datos),
        });
        const nuevaSesion = crearSesion(respuesta);
        guardarSesion(nuevaSesion);
        setSesion(nuevaSesion);
        setErrorInicial("");
        return respuesta;
    }, []);

    const cerrarSesion = useCallback(async () => {
        if (sesion?.refreshToken) {
            await apiRequest("/tunja/auth/logout", {
                method: "POST",
                body: JSON.stringify({ refresco: sesion.refreshToken }),
            });
        }

        borrarSesionGuardada();
        setSesion(null);
        setErrorInicial("");
    }, [sesion]);

    const valor = useMemo(
        () => ({ sesion, cargando, errorInicial, iniciarSesion, registrar, cerrarSesion }),
        [sesion, cargando, errorInicial, iniciarSesion, registrar, cerrarSesion],
    );

    return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
