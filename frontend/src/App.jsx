import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import Pay from "./components/user/pay/pay.jsx";
import TransportePreferencial from "./components/user/transport/TransportePreferencial.jsx";
import Map from "./components/Map/map.jsx";
import ProcedureResults from "./components/user/resultados_procedimientos.jsx";
import ResultadosAdministrador from "./components/administrator/resultados_administrador.jsx";
import AppointmentModule from "./pages/UserPages/AppointmentModule.jsx";
import ProfileUser from "./pages/UserPages/ProfileUser.jsx";
import ProfileAdministrador from "./pages/AdministratorPages/ProfileAdministraitor.jsx";
import AppointmentManagementModule from "./pages/AdministratorPages/AppointmentManagementModule.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/pagos" element={<Pay />} />
                <Route path="/transporte" element={<TransportePreferencial />} />
                <Route path="/mapa" element={<Map />} />
                <Route path="/resultados-procedimientos" element={<ProcedureResults />} />
                <Route path="/resultados-administrador" element={<ResultadosAdministrador />} />
                <Route path="/citas" element={<AppointmentModule />} />
                <Route path="/perfilUsuario" element={<ProfileUser />} />
                <Route path="/perfilAdministrador" element={<ProfileAdministrador />} />
                <Route path="/gestionCitas" element={<AppointmentManagementModule />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
