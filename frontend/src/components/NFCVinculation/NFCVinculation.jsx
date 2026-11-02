import { Link, Navigate, useLocation } from "react-router-dom";

function NFCVinculation() {
    const location = useLocation();

    if (location.state?.origen !== "/perfilUsuario") {
        return <Navigate to="/perfilUsuario" replace />;
    }

    return (
        <main>
            <nav aria-label="Navegación de la cuenta">
                <Link to="/perfilUsuario">Volver al perfil</Link>
            </nav>

            <header>
                <p>Mi cuenta</p>
                <h1>Vinculación de tarjeta NFC</h1>
                <p>
                    Asocia tu tarjeta física a tu cuenta para iniciar sesión, pagar citas
                    con el saldo de tu tarjeta y validarlas en taquilla.
                </p>
            </header>

            <section aria-labelledby="estado-tarjeta">
                <h2 id="estado-tarjeta">Estado de tu tarjeta</h2>
                <p>Tarjeta NFC no vinculada</p>
            </section>

            <section aria-labelledby="vincular-tarjeta">
                <h2 id="vincular-tarjeta">Vincular una tarjeta</h2>
                <p>
                    Acerca tu tarjeta al lector para vincularla automáticamente a tu cuenta.
                </p>
                <button type="button">Acercar tarjeta al lector</button>
            </section>
        </main>
    );
}

export default NFCVinculation;