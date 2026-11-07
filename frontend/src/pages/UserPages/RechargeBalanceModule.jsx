import NavbarUser from "../../components/user/NavbarUser/NavbarUser.jsx";

const montos = ["$10.000", "$20.000", "$50.000", "$100.000"];

function RechargeBalanceModule() {
    return (
        <>
            <NavbarUser />
            <main>
                <header>
                    <span>BILLETERA MEDITUNJA</span>
                    <h1>Recarga tu saldo</h1>
                    <p>
                        Agrega saldo a tu tarjeta MediTunja de forma fácil y segura.
                    </p>
                </header>

                <section aria-label="Resumen de saldo">
                    <div>
                        <span>Saldo disponible</span>
                        <p><strong>$25.000</strong></p>
                        <span>Saldo de muestra</span>
                    </div>
                    <div>
                        <span>Tarjeta vinculada</span>
                        <p><strong>•••• •••• •••• 4829</strong></p>
                        <span>Activa</span>
                    </div>
                </section>

                <div>
                    <section aria-labelledby="recharge-title">
                        <h2 id="recharge-title">1. ¿Cuánto deseas recargar?</h2>
                        <p>Selecciona un valor o ingresa otro monto.</p>

                        <fieldset>
                            <legend>Montos sugeridos</legend>
                            {montos.map((monto, index) => (
                                <label key={monto}>
                                    <input
                                        type="radio"
                                        name="monto-recarga"
                                        value={monto}
                                        defaultChecked={index === 1}
                                    />
                                    {monto}
                                </label>
                            ))}
                        </fieldset>

                        <label htmlFor="otro-monto">Otro monto</label>
                        <div>
                            <span>$</span>
                            <input
                                id="otro-monto"
                                type="number"
                                min="1000"
                                step="1000"
                                placeholder="Ingresa el valor"
                            />
                        </div>

                        <h2>2. Elige tu medio de pago</h2>
                        <p>Selecciona cómo deseas realizar la recarga.</p>

                        <fieldset>
                            <legend>Medio de pago</legend>
                            <label>
                                <input type="radio" name="medio-pago" defaultChecked />
                                <strong>PSE</strong> - Paga desde tu banco
                            </label>
                            <label>
                                <input type="radio" name="medio-pago" />
                                <strong>Billetera digital</strong> - Nequi o Daviplata
                            </label>
                            <label>
                                <input type="radio" name="medio-pago" />
                                <strong>Tarjeta débito o crédito</strong> - Visa o Mastercard
                            </label>
                        </fieldset>

                        <button type="button">
                            Continuar con la recarga
                        </button>

                        <p>
                            Esta es una vista de demostración. No se realizará ningún cobro
                            ni se modificará el saldo.
                        </p>
                    </section>

                    <aside aria-labelledby="summary-title">
                        <h2 id="summary-title">Resumen de recarga</h2>
                        <p>Monto seleccionado: <strong>$20.000</strong></p>
                        <p>Comisión: <strong>$0</strong></p>
                        <p>Total a pagar: <strong>$20.000</strong></p>
                        <p>
                            <strong>Tu información está protegida</strong>
                            <br />
                            Pago seguro y datos cifrados.
                        </p>
                        <p>
                            El saldo se acreditará en tu tarjeta una vez confirmado el pago.
                        </p>
                    </aside>
                </div>
            </main>
        </>
    );
}

export default RechargeBalanceModule;
