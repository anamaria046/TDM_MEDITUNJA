import PersonalDataAdministrador from "../../components/administrator/PersonalDataAdministrador/PersonalDataAdministrador.jsx";
import NavbarAdminEPS from "../../components/administrator/NavbarAdminEPS/NavbarAdminEPS.jsx";
import styles from "./ProfileAdministrator.module.css";

function ProfileAdministrador () {
    return (
        <div className={styles.profileLayout}>
            <NavbarAdminEPS />
            <main className={styles.profileContent}>
                <PersonalDataAdministrador />
            </main>
        </div>
    );
}

export default ProfileAdministrador