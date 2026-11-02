import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, apiRequest } from "./api.js";
import { AdminAuthContext } from "./AdminAuthContext.js";

const claveToken = "meditunja_admin_token";

function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(null);
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(
        () => Boolean(window.localStorage.getItem(claveToken)),
    );

    useEffect(() => {
        let activo = true;
        const tokenGuardado = window.localStorage.getItem(claveToken);
        if (!tokenGuardado) return undefined;

        apiRequest("/admin/sesion", {
            headers: { Authorization: `Bearer ${tokenGuardado}` },
        }).then((respuesta) => {
            if (!activo) return;
            setToken(tokenGuardado);
            setUsuario(respuesta.data);
        }).catch((error) => {
            if (!activo) return;
            if (error instanceof ApiError && error.status === 401) {
                window.localStorage.removeItem(claveToken);
            } else {
                console.error("No se pudo validar la sesión administrativa:", error);
            }
        }).finally(() => {
            if (activo) setCargando(false);
        });

        return () => {
            activo = false;
        };
    }, []);

    const iniciarSesion = useCallback(async (credenciales) => {
        const respuesta = await apiRequest("/admin/login", {
            method: "POST",
            body: JSON.stringify(credenciales),
        });
        window.localStorage.setItem(claveToken, respuesta.token);
        setToken(respuesta.token);
        setUsuario(respuesta.data);
        return respuesta;
    }, []);

    const cerrarSesion = useCallback(async () => {
        window.localStorage.removeItem(claveToken);
        setToken(null);
        setUsuario(null);

        try {
            if (token) {
                await apiRequest("/logout", {
                    method: "POST",
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
        } finally {
            window.localStorage.removeItem(claveToken);
            setToken(null);
            setUsuario(null);
        }
    }, [token]);

    const valor = useMemo(
        () => ({ token, usuario, cargando, iniciarSesion, cerrarSesion }),
        [token, usuario, cargando, iniciarSesion, cerrarSesion],
    );

    return (
        <AdminAuthContext.Provider value={valor}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export default AdminAuthProvider;
