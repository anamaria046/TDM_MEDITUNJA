import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import HomeUserModule from "./pages/UserPages/HomeUserModule.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PaymentModule from "./pages/UserPages/PaymentModule.jsx";
import TransportModule from "./pages/UserPages/TransportModule.jsx";
import ProcedureResults from "./components/user/resultados_procedimientos.jsx";
import ResultadosAdministrador from "./components/administrator/resultados_administrador.jsx";
import AppointmentModule from "./pages/UserPages/AppointmentModule.jsx";
import ProfileUser from "./pages/UserPages/ProfileUser.jsx";
import ProfileAdministrador from "./pages/AdministratorPages/ProfileAdministrator.jsx";
import AppointmentManagementModule from "./pages/AdministratorPages/AppointmentManagementModule.jsx";
import UserGestor from "./components/administrator/UserGestor/UserGestor.jsx";
import ConveniosModule from "./pages/AdministratorPages/ConveniosModule.jsx";
import BienvenidaAdminModule from "./pages/AdministratorPages/BienvenidaAdminModule.jsx";
import NFCVinculation from "./components/NFCVinculation/NFCVinculation.jsx";
import RequireAdmin from "./auth/RequireAdmin.jsx";
import RequireAuth from "./auth/RequireAuth.jsx";

const Map = lazy(() => import("./components/Map/map.jsx"));

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/admin/login" element={<Navigate to="/login" replace />} />
                <Route element={<RequireAdmin />}>
                    <Route path="/admin" element={<BienvenidaAdminModule />} />
                    <Route path="/inicioAdmin" element={<BienvenidaAdminModule />} />
                    <Route path="/admin/inicio" element={<BienvenidaAdminModule />} />
                    <Route path="/resultados-administrador" element={<ResultadosAdministrador />} />
                    <Route path="/perfilAdministrador" element={<ProfileAdministrador />} />
                    <Route path="/perfilAdiminEPS" element={<Navigate to="/perfilAdministrador" replace />} />
                    <Route path="/gestionCitas" element={<AppointmentManagementModule />} />
                    <Route path="/gestionUsuarios" element={<UserGestor />} />
                    <Route path="/convenios" element={<ConveniosModule />} />
                    <Route path="/gestionConvenios" element={<ConveniosModule />} />
                </Route>
                <Route element={<RequireAuth />}>
                    <Route path="/" element={<HomeUserModule />} />
                    <Route path="/citas" element={<AppointmentModule />} />
                    <Route path="/home" element={<HomeUserModule />} />
                    <Route path="/pagos" element={<PaymentModule />} />
                    <Route path="/transporte" element={<TransportModule />} />
                    <Route path="/perfilUsuario" element={<ProfileUser />} />
                    <Route path="/vinculacionNFC" element={<NFCVinculation />} />
                    <Route path="/mapa" element={<Suspense fallback={<p role="status">Cargando mapa...</p>}><Map /></Suspense>} />
                    <Route path="/resultados-procedimientos" element={<ProcedureResults />} />
                </Route>
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
