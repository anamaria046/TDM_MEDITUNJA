import { useContext } from "react";
import { AdminAuthContext } from "./AdminAuthContext.js";

export function useAdminAuth() {
    const contexto = useContext(AdminAuthContext);
    if (!contexto) {
        throw new Error("useAdminAuth debe usarse dentro de AdminAuthProvider.");
    }
    return contexto;
}
