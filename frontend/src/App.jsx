import { BrowserRouter, Routes, Route } from "react-router-dom";

import HomeUserModule from "./pages/UserPages/HomeUserModule.jsx";
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
import AdminLogin from "./pages/AdminLogin.jsx";
import RequireAdmin from "./auth/RequireAdmin.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppointmentModule />} />
                <Route path="/citas" element={<AppointmentModule />} />
                {/* TunjaAPI login/registration stay implemented but inactive until the API key is configured. */}
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/home" element={<HomeUserModule />} />
                <Route path="/pagos" element={<PaymentModule />} />
                <Route path="/transporte" element={<TransportModule />} />
                <Route path="/mapa" element={<Map />} />
                <Route path="/resultados-procedimientos" element={<ProcedureResults />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/resultados-administrador" element={<RequireAdmin><ResultadosAdministrador /></RequireAdmin>} />
                <Route path="/perfilUsuario" element={<ProfileUser />} />
                <Route path="/perfilAdministrador" element={<RequireAdmin><ProfileAdministrador /></RequireAdmin>} />
                <Route path="/gestionCitas" element={<RequireAdmin><AppointmentManagementModule /></RequireAdmin>} />
                <Route path="/gestionUsuarios" element={<RequireAdmin><UserGestor /></RequireAdmin>} />
                <Route path="/convenios" element={<RequireAdmin><ConveniosModule /></RequireAdmin>} />
                <Route path="/gestionConvenios" element={<RequireAdmin><ConveniosModule /></RequireAdmin>} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
