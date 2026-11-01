import ProfileHeader from "../../ProfileHeader/ProfileHeader.jsx";
import NfcStatus from "../../NFCStatus/NFCStatus.jsx";

function PersonalDataUser() {
    return (
        <div>
            <section>
                <ProfileHeader />
            </section>
            <section>
                <fieldset>
                    <h3>Información del paciente</h3>
                    <div> 
                        <div>
                            <label>Nombres</label>
                            <p>Mi nombre</p>
                        </div>

                        <div>
                            <label>Apellidos</label>
                            <p>Mis apellidos</p>
                        </div>

                        <div>
                            <label>Fecha de Nacimiento</label>
                            <p>01/01/1990</p>
                        </div>

                        <div>
                            <label>Sexo</label>
                            <p>Femenino</p>
                        </div>

                        <div>
                            <label>Tipo de Documento</label>
                            <p>Cédula de Ciudadanía</p>
                        </div>

                        <div>
                            <label>Numero de documento</label>
                            <p>123456789</p>
                        </div>

                        <div>
                            <label>Contraseña</label>
                            <p>•••••••••</p>
                            <button>
                                mostrar/ocultar
                            </button>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <div>
                        <h3>Datos de contacto</h3>
                        <div>
                            <label>Correo Electrónico</label>
                            <p>juan.perez@correo.com</p>
                        </div>

                        <div>
                            <label>Telefono</label>
                            <p>3001234567</p>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <div>
                        <h3>Información médica</h3>
                        <div>
                            <label>Correo Electrónico</label>
                            <p>juan.perez@correo.com</p>
                        </div>

                        <div>
                            <label>Telefono</label>
                            <p>3001234567</p>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <div>
                        <h3>Tarjeta NFC</h3>
                        <div>
                            <NfcStatus />
                        </div>
                    </div>
                </fieldset>
            </section>
        </div>
    );
}

export default PersonalDataUser