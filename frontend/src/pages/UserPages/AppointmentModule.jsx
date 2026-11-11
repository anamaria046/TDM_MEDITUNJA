import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx"
import Hero from "../../components/Hero/Hero.jsx"
import AppointmentMenu from "../../components/user/Appointments/AppointmentMenu/AppointmentMenu.jsx"
import ScheduleAppointment from "../../components/user/Appointments/ScheduleAppointments/ScheduleAppointments.jsx"

function AppointmentModule() {
    return (
        <div>
            <NavbarUser />
            <Hero 
                label="Nueva cita"
                title="Agenda tu próxima consulta"
                description="Completa la información para reservar tu atención médica."
            />
            <AppointmentMenu />
            <ScheduleAppointment />
        </div>
    );
}

export default AppointmentModule