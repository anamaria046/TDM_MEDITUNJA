import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";
import HeroUser from "../../components/Hero/Hero.jsx";
import AppointmentMenu from "../../components/user/Appointments/AppointmentMenu/AppointmentMenu.jsx";
import MyAppointments from "../../components/user/Appointments/MyAppointments/MyAppointments.jsx";

function MyAppoitmentModule (){
    return(
        <div>
            <NavbarUser />
            <HeroUser
                label="Nueva cita"
                title="Agenda tu próxima consulta"
                description="Completa la información para reservar tu atención médica." 
            />
            <AppointmentMenu />
            <MyAppointments />
        </div>
    );
}

export default MyAppoitmentModule