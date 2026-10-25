import PersonalData from "../components/user/Profile/PersonalData/PersonalData.jsx";
import NfcStatus from "../components/user/Profile/NFCStatus/NFCStatus.jsx";
import LogOut from "../components/user/Profile/LogOut/LogOut";

function ProfileUser () {
    return (
        <div>
            <PersonalData />
            <NfcStatus />
            <LogOut />
        </div>
    );
}

export default ProfileUser