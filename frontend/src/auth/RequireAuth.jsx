import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth.js";

function RequireAuth() {
    const { sesion, cargando, errorInicial } = useAuth();
    const location = useLocation();

    if (cargando) {
        return <p role="status">Comprobando sesión...</p>;
    }

    if (errorInicial) {
        return (
            <main>
                <p role="alert">{errorInicial}</p>
                <button type="button" onClick={() => window.location.reload()}>
                    Reintentar
                </button>
            </main>
        );
    }

    if (!sesion) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export default RequireAuth;
