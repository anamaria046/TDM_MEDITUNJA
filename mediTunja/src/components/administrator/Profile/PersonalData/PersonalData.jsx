function PersonalData() {
    return (
        <section>
            <h3>Información Personal</h3>

            <form>
                <div>
                    <label htmlFor="perfil-nombre"><strong>Nombres y Apellidos:</strong></label>
                    <br />
                    <input 
                        type="text" 
                        id="perfil-nombre" 
                        name="nombre" 
                        defaultValue="Juan Andrés Pérez Gómez" 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="perfil-correo"><strong>Correo Electrónico:</strong></label><br />
                    <input 
                        type="email" 
                        id="perfil-correo" 
                        name="correo" 
                        defaultValue="juan.perez@correo.com" 
                        required 
                    />
                </div>

                <div>
                    <label htmlFor="perfil-eps"><strong>EPS administrada: </strong></label>
                    <br />
                    <option value="sura">EPS Sura (Ejemplo)</option>
                </div>

                <div>
                    <label htmlFor="perfil-password"><strong>Contraseña:</strong></label>
                    <br />
                    <div>
                        <input 
                            type="password" 
                            id="perfil-password" 
                            name="password" 
                            defaultValue="password123" 
                        />
                        <button type="button">Mostrar</button>
                    </div>
                </div>
                <button>Guardar Cambios</button>
            </form>
        </section>
    );
}

export default PersonalData