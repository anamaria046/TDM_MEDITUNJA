import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";
import Hero from "../../components/Hero/Hero.jsx";
import PersonalDataUser from "../../components/user/PersonalDataUser/PersonalDataUser.jsx";


function ProfileUser () {
    return (
        <div>
            <NavbarUser />
            <Hero 
                label="Mi cuenta"
                title="Perfil del paciente"
                description="Administra tus datos personales, contacto y seguridad."
            />
            <PersonalDataUser />
        </div>
    );
}

export default ProfileUser