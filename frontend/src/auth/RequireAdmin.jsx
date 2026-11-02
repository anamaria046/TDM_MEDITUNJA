import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "./useAdminAuth.js";

function RequireAdmin({ children }) {
    const { usuario, cargando } = useAdminAuth();
    const location = useLocation();

    if (cargando) return <p role="status">Validando acceso administrativo...</p>;
    if (usuario?.rol !== "administrador") {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children || <Outlet />;
}

export default RequireAdmin;
