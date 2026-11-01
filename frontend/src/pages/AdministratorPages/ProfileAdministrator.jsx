import { Link } from "react-router-dom";
import PersonalDataAdministrador from "../../components/administrator/PersonalDataAdministrador/PersonalDataAdministrador.jsx";

function ProfileAdministrador () {
    return (
        <div>
            <section>
                <h2>Administración de usuarios</h2>
                <p>Revisa solicitudes de registro y administra los datos de afiliados.</p>
                <Link to="/gestionUsuarios">Ir a Gestión de usuarios</Link>
            </section>
            <PersonalDataAdministrador />

        </div>
    );
}

export default ProfileAdministrador