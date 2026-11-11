import PersonalDataAdministrador from "../../components/administrator/PersonalDataAdministrador/PersonalDataAdministrador.jsx";
import styles from "./ProfileAdministrator.module.css";

function ProfileAdministrador () {
    return (
        <div className={styles.profileLayout}>
            <main className={styles.profileContent}>
                <PersonalDataAdministrador />
            </main>
        </div>
    );
}

export default ProfileAdministrador