import Hero from "../../components/Hero/Hero.jsx";
import AppointmentEps from "../../components/administrator/AppointmentManagement/AppointmentEps/AppointmentEps.jsx";

import styles from "./AppointmentM.module.css";

function AppointmentManagementModule (){
    return (
        <div className={styles.pageLayout}>
            <div className={styles.pageContent}>
                <Hero 
                    label="Administración"
                    title="Gestión de citas"
                    description="Modifica, reprograma o cancela citas"
                />
                <AppointmentEps />
            </div>
            
        </div>
    );
}

export default AppointmentManagementModule