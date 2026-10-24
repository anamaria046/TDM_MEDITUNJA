// src/components/catalogo/CatalogoServicios.jsx
import { Link } from 'react-router-dom';

export function CatalogServices() {
  return (
    <div>
        <h2>Catálogo de Servicios Médicos e IPS</h2>

        <section>
            <h3>Filtros de Búsqueda</h3>

            <div>
                <label htmlFor="tipoAtencion">Tipo de Cobertura / Modalidad:</label>
                <select id="tipoAtencion" name="tipoAtencion">
                    <option value="particular">Particular (Sin EPS/Convenio)</option>
                    <option value="eps-sura">EPS Sura</option>
                    <option value="eps-sanitas">EPS Sanitas</option>
                    <option value="poliza-seguros">Póliza / Medicina Prepagada</option>
                </select>
            </div>

            <div>
                <label htmlFor="categoria">Categoría del Servicio:</label>
                <select id="categoria" name="categoria">
                    <option value="">Todas las categorías</option>
                    <option value="medicina-general">Medicina General y Preventiva</option>
                    <option value="especialidades">Especialidades Médicas</option>
                    <option value="odontologia">Odontología y Salud Oral</option>
                    <option value="laboratorio">Laboratorio Clínico e Imágenes</option>
                </select>
            </div>

            <button type="button">Aplicar Filtros</button>
        </section>

        <section>
            <h3>Servicios Disponibles</h3>

            <article>
                <h4>Consulta Médica Especializada - Cardiología</h4>
                <p>
                    <strong>Categoría:</strong> Especialidades Médicas
                </p>

                <div className="info-servicio">
                    <p>
                        <strong>Requisitos:</strong> Requiere orden médica previa y electrocardiograma reciente (si aplica).
                    </p>
                    <p>
                        <strong>Costo Estimado:</strong> $120.000 COP (Particular) | Copago EPS: $4.500 COP
                    </p>
                </div>
                <div className="ips-disponibles">
                    <h5>IPS Prestadoras Disponibles:</h5>
                    <ul>
                        <li>
                            <strong>Clínica Cardiovascular del Norte</strong> - Calle 100 #15-20
                            <br />
                            <small>Horarios: Lunes a Viernes (7:00 AM - 5:00 PM)</small>
                        </li>
                        <li>
                            <strong>Centro Médico San Rafael</strong> - Cra 45 #80-12
                            <br />
                            <small>Horarios: Lunes a Sábados (8:00 AM - 1:00 PM)</small>
                        </li>
                    </ul>
                </div>
                <Link to="/citas/agendar">
                    <button type="button">Seleccionar y Agendar Cita</button>
                </Link>
            </article>

            <article>
                <h4>Limpieza Dental y Profilaxis</h4>
                <p>
                    <strong>Categoría:</strong> Odontología
                </p>
                <div className="info-servicio">
                    <p>
                        <strong>Requisitos:</strong> Ninguno. Apto para mayores de 6 años.
                    </p>
                    <p>
                        <strong>Costo Estimado:</strong> $60.000 COP (Tarifa particular)
                    </p>
                </div>
                <div className="ips-disponibles">
                    <h5>IPS Prestadoras Disponibles:</h5>
                    <ul>
                        <li>
                            <strong>IPS Odontológica DentalPlus Sede Centro</strong> - Calle 34 #12-45
                            <br />
                            <small>Horarios: Lunes a Sábado (8:00 AM - 6:00 PM)</small>
                        </li>
                    </ul>
                </div>
                
                <Link to="/citas/agendar">
                    <button type="button">Seleccionar y Agendar Cita</button>
                </Link>
            </article>
        </section>
    </div>
  );
}