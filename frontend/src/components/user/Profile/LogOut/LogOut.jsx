import { useNavigate } from "react-router-dom";

function LogOut() {
    const navigate = useNavigate();

    return (
        <section>
            <button type="button" onClick={() => navigate("/citas", { replace: true })}>
                Volver a citas
            </button>
        </section>
    );
}

export default LogOut