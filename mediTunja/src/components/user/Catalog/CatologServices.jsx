function CatalogServices() {
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
                    <option value="eps-nuevaeps">EPS Nueva EPS</option>
                    <option value="eps-famisanar">EPS FAMISANAR</option>
                    <option value="eps-saludtotal">EPS Salud total</option>
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

                <div>
                    <p>
                        <strong>Requisitos:</strong> Requiere orden médica previa y electrocardiograma reciente (si aplica).
                    </p>
                    <p>
                        <strong>Costo Estimado:</strong> $120.000 COP (Particular) | Copago EPS: $4.500 COP
                    </p>
                </div>
                <div>
                    <h5>IPS Prestadoras Disponibles:</h5>
                    <ul>
                        <li>
                            <strong>Hospital San Rafael</strong>
                            <br />
                            <small>Horarios: Lunes a Viernes (7:00 AM - 5:00 PM)</small>
                        </li>
                        <li>
                            <strong>Clínica Medilaser</strong>
                            <br />
                            <small>Horarios: Lunes a Sábados (8:00 AM - 1:00 PM)</small>
                        </li>
                    </ul>
                </div>
            </article>

            <article>
                <h4>Limpieza Dental y Profilaxis</h4>
                <p>
                    <strong>Categoría:</strong> Odontología
                </p>
                <div>
                    <p>
                        <strong>Requisitos:</strong> Ninguno. Apto para mayores de 6 años.
                    </p>
                    <p>
                        <strong>Costo Estimado:</strong> $60.000 COP (Tarifa particular)
                    </p>
                </div>
                <div>
                    <h5>IPS Prestadoras Disponibles:</h5>
                    <ul>
                        <li>
                            <strong>Clínica de Chía S.A</strong> 
                            <br />
                            <small>Horarios: Lunes a Sábado (8:00 AM - 6:00 PM)</small>
                        </li>
                    </ul>
                </div>
            </article>
        </section>
    </div>
  );
}

export default CatalogServices