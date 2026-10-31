import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomeModule from "./pages/UserPages/HomeModule.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PaymentModule from "./pages/UserPages/PaymentModule.jsx";
import TransportModule from "./pages/UserPages/TransportModule.jsx";
import Map from "./components/Map/map.jsx";
import ProcedureResults from "./components/user/resultados_procedimientos.jsx";
import ResultadosAdministrador from "./components/administrator/resultados_administrador.jsx";
import AppointmentModule from "./pages/UserPages/AppointmentModule.jsx";
import ProfileUser from "./pages/UserPages/ProfileUser.jsx";
import ProfileAdministrador from "./pages/AdministratorPages/ProfileAdministrator.jsx";
import AppointmentManagementModule from "./pages/AdministratorPages/AppointmentManagementModule.jsx";
import UserGestor from "./components/administrator/UserGestor/UserGestor.jsx";
import ConveniosModule from "./pages/AdministratorPages/ConveniosModule.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomeModule />} />
                <Route path="/home" element={<HomeModule />} />
                {/* TunjaAPI login/registration stay implemented but inactive until the API key is configured. */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/pagos" element={<PaymentModule />} />
                <Route path="/transporte" element={<TransportModule />} />
                <Route path="/mapa" element={<Map />} />
                <Route path="/resultados-procedimientos" element={<ProcedureResults />} />
                <Route path="/resultados-administrador" element={<ResultadosAdministrador />} />
                <Route path="/citas" element={<AppointmentModule />} />
                <Route path="/perfilUsuario" element={<ProfileUser />} />
                <Route path="/perfilAdministrador" element={<ProfileAdministrador />} />
                <Route path="/gestionCitas" element={<AppointmentManagementModule />} />
                <Route path="/gestionUsuarios" element={<UserGestor />} />
                <Route path="/convenios" element={<ConveniosModule />} />
                <Route path="/gestionConvenios" element={<ConveniosModule />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
