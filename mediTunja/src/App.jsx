import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import Pay from "./components/user/pay/pay.jsx";
import TransportePreferencial from "./components/user/transport/TransportePreferencial.jsx";
import AppointmentModule from "./pages/UserPages/AppointmentModule.jsx";
import ProfileUser from "./pages/UserPages/ProfileUser.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/pagos" element={<Pay />} />
                <Route path="/transporte" element={<TransportePreferencial />} />
                <Route path="/citas" element={<AppointmentModule />}></Route>
                <Route path="/perfilUsuario" element={<ProfileUser />}></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
