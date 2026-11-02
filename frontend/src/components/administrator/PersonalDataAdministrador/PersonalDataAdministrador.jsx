import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../auth/useAdminAuth.js";
import { mensajeError } from "../../../auth/api.js";

function PersonalDataAdministrador() {
    const { usuario, cerrarSesion } = useAdminAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");

    async function salir() {
        setError("");
        let aviso;
        try {
            await cerrarSesion();
        } catch (errorSolicitud) {
            aviso = `La sesión se cerró en este dispositivo, pero no se pudo confirmar su revocación en el servidor: ${mensajeError(errorSolicitud)}`;
        }
        navigate("/login", {
            replace: true,
            state: aviso ? { notice: aviso } : undefined,
        });
    }

    return (
        <section>
            <h3>Cuenta administradora</h3>
            <dl>
                <dt>Nombres y apellidos</dt>
                <dd>{usuario.nombres} {usuario.apellidos}</dd>
                <dt>Documento</dt>
                <dd>{usuario.tipo_documento} {usuario.numero_documento}</dd>
                <dt>EPS administrada</dt>
                <dd>{usuario.eps}</dd>
            </dl>
            {error && <p role="alert">{error}</p>}
            <button type="button" onClick={salir}>Cerrar sesión administrativa</button>
        </section>
    );
}

export default PersonalDataAdministrador;
