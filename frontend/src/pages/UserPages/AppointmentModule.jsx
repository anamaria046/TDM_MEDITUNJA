import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx"
import Hero from "../../components/Hero/Hero.jsx"
import CatalogServices from "../../components/user/Catalog/CatologServices.jsx"
import ScheduleAppointment from "../../components/user/Appointments/ScheduleAppointments/ScheduleAppointments.jsx"
import MyAppointments from "../../components/user/Appointments/MyAppointments/MyAppointments.jsx"

function AppointmentModule() {
    return (
        <div>
            <NavbarUser />
            <Hero 
                label="Nueva cita"
                title="Agenda tu próxima consulta"
                description="Completa la información para reservar tu atención médica."
            />
            <CatalogServices />
            <ScheduleAppointment />
            <MyAppointments />
        </div>
    );
}

export default AppointmentModule