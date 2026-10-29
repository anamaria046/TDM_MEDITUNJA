import { Link } from "react-router-dom";

function CardLinking() {
    return (
        <section>
            <h2>Vinculación de Tarjeta NFC</h2>
            <p>Asocia tu tarjeta NFC a tu cuenta para ingresar y pagar tus citas de forma rápida.</p>
            <p><small>Los datos de este módulo son simulados.</small></p>

            <div>
                <h3>Estado de tu tarjeta</h3>
                <p>
                    <strong>Estado:</strong> <span>Tarjeta NFC No Vinculada</span>
                </p>
            </div>

            <form>
                <h3>Vincular nueva tarjeta</h3>

                <div>
                    <p>Acerca tu tarjeta NFC al lector de tu dispositivo.</p>
                    <button type="button">Leer tarjeta NFC</button>
                </div>

                <div>
                    <label htmlFor="tarjeta-id"><strong>ID de la tarjeta:</strong></label>
                    <br />
                    <input
                        type="text"
                        id="tarjeta-id"
                        name="idTarjeta"
                        placeholder="Ej: NFC-99482-COL"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="tarjeta-password"><strong>Confirma tu contraseña:</strong></label>
                    <br />
                    <input
                        type="password"
                        id="tarjeta-password"
                        name="password"
                        required
                    />
                </div>

                <button type="submit">Vincular tarjeta</button>
            </form>

            <div>
                <h3>Mi tarjeta vinculada</h3>
                <p>
                    ID de Tarjeta: <strong>NFC-99482-COL</strong> | Registrada el: 2026-10-15
                </p>
                <button type="button">Desvincular tarjeta</button>
            </div>

            <nav>
                <Link to="/perfilUsuario">Volver al perfil</Link>
            </nav>
        </section>
    );
}

export default CardLinking