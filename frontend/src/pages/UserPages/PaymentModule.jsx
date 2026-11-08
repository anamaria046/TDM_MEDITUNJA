import { Link } from "react-router-dom";
import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";

function PaymentModule() {
    return (
        <>
            <NavbarUser />
            <main>
                <p>MediTunja · Pagos</p>
                <h1>Pagos de citas</h1>
                <section role="status" aria-labelledby="payment-unavailable-title">
                    <h2 id="payment-unavailable-title">Pagos no disponibles</h2>
                    <p>
                        No hay una pasarela de pago configurada. No se procesan cobros,
                        recargas ni pagos con tarjeta NFC; no se generará un comprobante
                        hasta que el proveedor confirme una transacción real.
                    </p>
                </section>
                <Link to="/citas">Volver a mis citas</Link>
            </main>
        </>
    );
}

export default PaymentModule;
