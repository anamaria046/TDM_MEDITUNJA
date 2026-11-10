import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";
import HeroUser from "../../components/Hero/Hero.jsx";

function MyAppoitmentModule (){
    return(
        <div>
            <NavbarUser />
            <HeroUser
                label="Nueva cita"
                title="Agenda tu próxima consulta"
                description="Completa la información para reservar tu atención médica." 
            />

        </div>
    );
}

export default MyAppoitmentModule