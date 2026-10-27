import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Pay from "./components/user/pay/pay.jsx";
import TransportePreferencial from "./components/user/transport/TransportePreferencial.jsx";
import Map from "./components/Map/map.jsx";
import ProcedureResults from "./components/user/resultados_procedimientos.jsx";
import ResultadosAdministrador from "./components/administrator/resultados_administrador.jsx";
import AppointmentModule from "./pages/UserPages/AppointmentModule.jsx";
import ProfileUser from "./pages/UserPages/ProfileUser.jsx";
import ProfileAdministrador from "./pages/AdministratorPages/ProfileAdministrator.jsx";
import AppointmentManagementModule from "./pages/AdministratorPages/AppointmentManagementModule.jsx";
import UserGestor from "./components/administrator/UserGestor/UserGestor.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/citas" replace />} />
                {/* TunjaAPI login/registration stay implemented but inactive until the API key is configured. */}
                <Route path="/login" element={<Navigate to="/citas" replace />} />
                <Route path="/registro" element={<Navigate to="/citas" replace />} />
                <Route path="/pagos" element={<Pay />} />
                <Route path="/transporte" element={<TransportePreferencial />} />
                <Route path="/mapa" element={<Map />} />
                <Route path="/resultados-procedimientos" element={<ProcedureResults />} />
                <Route path="/resultados-administrador" element={<ResultadosAdministrador />} />
                <Route path="/citas" element={<AppointmentModule />} />
                <Route path="/perfilUsuario" element={<ProfileUser />} />
                <Route path="/perfilAdministrador" element={<ProfileAdministrador />} />
                <Route path="/gestionCitas" element={<AppointmentManagementModule />} />
                <Route path="/gestionUsuarios" element={<UserGestor />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
