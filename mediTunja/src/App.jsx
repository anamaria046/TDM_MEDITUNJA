import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login/Login.jsx";
import Register from "./components/Register/Register.jsx";
import Pay from "./components/user/pay/pay.jsx";
import TransportePreferencial from "./components/user/transport/TransportePreferencial.jsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Register />} />
                <Route path="/pay" element={<Pay />} />
                <Route path="/transporte" element={<TransportePreferencial />} />
                <Route path="/transport" element={<TransportePreferencial />} />
                <Route path=""></Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
