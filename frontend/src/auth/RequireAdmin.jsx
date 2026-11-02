import { Navigate } from "react-router-dom";
import { useAdminAuth } from "./useAdminAuth.js";

function RequireAdmin({ children }) {
    const { usuario, cargando } = useAdminAuth();

    if (cargando) return <p role="status">Validando acceso administrativo...</p>;
    if (usuario?.rol !== "administrador") {
        return <Navigate to="/admin/login" replace />;
    }
    return children;
}

export default RequireAdmin;
