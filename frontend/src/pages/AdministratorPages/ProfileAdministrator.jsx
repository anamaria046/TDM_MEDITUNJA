import { Link } from "react-router-dom";
import PersonalData from "../../components/administrator/Profile/PersonalData/PersonalData.jsx";
import NfcStatus from "../../components/administrator/Profile/NFCStatus/NfcStatus.jsx";
import LogOut from "../../components/administrator/Profile/LogOut/LogOut.jsx";

function ProfileAdministrador () {
    return (
        <div>
            <section>
                <h2>Administración de usuarios</h2>
                <p>Revisa solicitudes de registro y administra los datos de afiliados.</p>
                <Link to="/gestionUsuarios">Ir a Gestión de usuarios</Link>
            </section>
            <PersonalData />
            <NfcStatus />
            <LogOut />
        </div>
    );
}

export default ProfileAdministrador