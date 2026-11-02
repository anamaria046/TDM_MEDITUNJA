# Administración de EPS

Las rutas de administración usan la base SQLite del backend, requieren una sesión local y solo permiten operar sobre afiliados y convenios de la EPS asignada al administrador.

## Habilitar la primera cuenta administradora

1. Registra una cuenta en `POST /api/registro` usando la EPS correspondiente. El endpoint local guarda la cuenta en `backend/data/meditunja.db` (o en la ruta definida en `DB_PATH`).
2. Desde un acceso controlado a esa base, aprueba y asigna el rol a la cuenta:

```sql
UPDATE usuarios
SET estado_registro = 'aprobado',
    rol = 'administrador',
    eps = 'EPS Sura'
WHERE tipo_documento = 'CC'
  AND numero_documento = '<documento de la cuenta>';
```

Reemplaza el tipo, documento y EPS por los valores de la cuenta. Las cuentas migradas y los nuevos registros tienen el rol `afiliado` por defecto. No asignes este rol desde un formulario público.

3. Ingresa por `/admin/login` con el tipo, número de documento y contraseña de esa cuenta.

El panel permite aprobar/rechazar solicitudes, actualizar datos de afiliados y crear/desactivar convenios. Los cambios se guardan en SQLite; cada petición vuelve a comprobar rol y EPS en el servidor.

El formulario público actual registra usuarios en TunjaAPI; esos registros externos no se copian automáticamente a esta base SQLite. Para que una solicitud aparezca en la gestión administrativa, debe existir también en la base local mediante `POST /api/registro`.
