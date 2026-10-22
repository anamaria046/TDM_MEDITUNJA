import Link from "react-router-dom";

function Register () {
    return (
        <div>
            <h2>Registrate</h2>
            <form>

                <div>
                    <label htmlFor="fullName">Nombres y Apellidos:</label>
                    <input 
                        type="text" 
                        id="fullName" 
                        name="fullName" 
                        placeholder="Ej: Juan Andrés Pérez Gómez" 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="birthDate">Fecha de Nacimiento:</label>
                    <input 
                        type="date" 
                        id="birthDate" 
                        name="birthDate" 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="gender">Sexo:</label>
                    <select id="gender" name="gender" required>
                        <option value="">Seleccione una opción</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="otro">Otro / Prefiero no decir</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="docType">Tipo de Documento:</label>
                    <select id="docType" name="docType" required>
                        <option value="">Seleccione un tipo</option>
                        <option value="CC">Cédula de Ciudadanía (C.C.)</option>
                        <option value="CE">Cédula de Extranjería (C.E.)</option>
                        <option value="TI">Tarjeta de Identidad (T.I.)</option>
                        <option value="PAS">Pasaporte</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="docNumber">Número de Documento:</label>
                    <input 
                        type="text" 
                        id="docNumber" 
                        name="docNumber" 
                        placeholder="Ej: 1020304050" 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="email">Correo Electrónico:</label>
                    <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        placeholder="ejemplo@correo.com" 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="phone">Teléfono / Celular:</label>
                    <input 
                        type="tel" 
                        id="phone" 
                        name="phone" 
                        placeholder="Ej: 3001234567" 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="password">Contraseña:</label>
                    <input 
                        type="password" 
                        id="password" 
                        name="password" 
                        placeholder="Crea una contraseña segura" 
                        required 
                    />
                    <button type="button">Mostrar</button>
                </div>

                <div>
                    <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        placeholder="Repite tu contraseña" 
                        required 
                    />
                    <button type="button">Mostrar</button>
                </div>

                <button type="submit">Registrarse</button>
            </form>

            <p>
                ¿Ya tienes cuenta? <link to="/Login">Inicia sesión aquí
            </p>
        </div>
    )
}

export default Register