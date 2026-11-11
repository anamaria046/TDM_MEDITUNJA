import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";
import HeroUser from "../../components/Hero/Hero.jsx";
import Map from "../../components/Map/map.jsx";
function MapModule () {
    return (
        <div>
            <NavbarUser />
            <HeroUser
                label="Red de salud"
                title="Encuentra tu IPS en Tunja"
                description="Consulta en el mapa las instituciones prestadoras de salud disponibles y sus direcciones."
            />
            <Map />
        </div>
        
    );
}

export default MapModule