import Link from "react-router-dom";

function Login() {
    return (
        <div>
            <h2>Inicia Sesión</h2>
            <form action="">
                <div>
                    <label>Tipo de Documento:</label>
                    <select id="docType" name="docType">
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PAS">Pasaporte</option>
                    </select>
                </div>

                <div>
                    <label>Número de Documento:</label>
                        <input 
                            type="text" 
                            id="docNumber" 
                            name="docNumber" 
                            placeholder="Ej: 1020304050" 
                        />
                </div>

                <div>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Ingresa tu contraseña" 
                    />
                    <button type="button">Mostrar</button>
                </div>

                <button type="submit">Ingresar</button>
            </form>
      
            {/* Sección Tarjeta NFC */}
            <div>
                <h3>Acceso con NFC</h3>

                <button type="button" disabled>Iniciar sesión con tarjeta NFC</button>
                <p> 
                    Esta función no está disponible. Debes iniciar sesión con tus credenciales y vincular tu tarjeta NFC primero.
                </p>
            </div>

            <p>
                ¿No tienes cuenta? <Link to="/Register">Regístrate aquí
            </p>
        </div>

    )
}

export default Login