import PersonalData from "../../components/administrator/Profile/PersonalData/PersonalData.jsx";
import NfcStatus from "../../components/administrator/Profile/NFCStatus/NfcStatus.jsx";
import LogOut from "../../components/administrator/Profile/LogOut/LogOut.jsx";

function ProfileAdministrador () {
    return (
        <div>
            <PersonalData />
            <NfcStatus />
            <LogOut />
        </div>
    );
}

export default ProfileAdministrador