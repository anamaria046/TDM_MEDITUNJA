import NavbarAdminEPS from "../../components/administrator/NavbarAdminEPS/NavbarAdminEPS.jsx";
import HeaderAdmin from "../../components/administrator/HeaderAdmin/HeaderAdmin.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import Filter from "../../components/Filter/Filter.jsx";
import AppointmentEps from "../../components/administrator/AppointmentManagement/AppointmentEps/AppointmentEps.jsx";

import styles from "./AppointmentM.module.css";

function AppointmentManagementModule (){
    return (
        <div className={styles.pageLayout}>
            <NavbarAdminEPS />
            <div className={styles.pageContent}>
                <HeaderAdmin />
                <Hero 
                    label="Administración"
                    title="Gestión de citas"
                    description="Modifica, reprograma o cancela citas"
                />
                <Filter />
                <AppointmentEps />
            </div>
            
        </div>
    );
}

export default AppointmentManagementModule