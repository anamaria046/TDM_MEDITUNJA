function AppointmentFilter() {
    return (
        <section>
            <h3>Búsqueda de Citas de Afiliados</h3>

            <form>
                <div>
                    <label htmlFor="admin-eps-fija">Entidad Gestora (Fija):</label>
                    <br />
                    <input 
                        type="text" 
                        id="admin-eps-fija" 
                        value="EPS Sura" 
                        disabled 
                    />
                </div>

                <div>
                    <label htmlFor="filtro-doc">Doc. del Afiliado:</label>
                    <br />
                    <input type="text" id="filtro-doc" name="doc" placeholder="Ej: 1020304050" />
                </div>

                <div>
                    <label htmlFor="filtro-ips">IPS en Convenio (Red Sura):</label>
                    <br />
                    <select id="filtro-ips" name="ips">
                        <option value="">Todas las IPS en convenio</option>
                        <option value="">IPS</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="filtro-estado">Estado de la Cita:</label>
                    <br />
                    <select id="filtro-estado" name="estado">
                        <option value="">Todos los estados</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="pendiente">Pendiente por Autorización</option>
                        <option value="cancelada">Cancelada</option>
                    </select>
                </div>

                <div>
                    <button type="submit" >
                        Filtrar
                    </button>
                </div>
            </form>
        </section>
    );
}

export default AppointmentFilter