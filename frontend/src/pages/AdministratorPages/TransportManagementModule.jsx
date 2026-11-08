import NavbarAdminEPS from "../../components/administrator/NavbarAdminEPS/NavbarAdminEPS.jsx";
import HeaderAdmin from "../../components/administrator/HeaderAdmin/HeaderAdmin.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import TransportRequests from "../../components/administrator/TransportManagement/TransportRequests.jsx";
import styles from "./AppointmentM.module.css";

function TransportManagementModule() {
    return (
        <div className={styles.pageLayout}>
            <NavbarAdminEPS />
            <div className={styles.pageContent}>
                <HeaderAdmin />
                <Hero
                    label="Administración"
                    title="Solicitudes de transporte"
                    description="Consulta y gestiona las solicitudes de transporte de los afiliados de tu EPS."
                />
                <TransportRequests />
            </div>
        </div>
    );
}

export default TransportManagementModule;
