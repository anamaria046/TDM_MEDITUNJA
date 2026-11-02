# Administración de EPS

Las rutas de administración usan la base SQLite del backend, requieren una sesión local y solo permiten operar sobre afiliados y convenios de la EPS asignada al administrador.

## Cuentas administradoras de EPS

Los NIT se configuran mediante `ADMIN_NUEVA_EPS_NIT`, `ADMIN_FAMISANAR_NIT`, `ADMIN_SANITAS_NIT`, `ADMIN_SURA_NIT` y `ADMIN_SALUD_TOTAL_NIT` en `backend/.env`. Define también una contraseña distinta para cada EPS con las variables `ADMIN_NUEVA_EPS_PASSWORD`, `ADMIN_FAMISANAR_PASSWORD`, `ADMIN_SANITAS_PASSWORD`, `ADMIN_SURA_PASSWORD` y `ADMIN_SALUD_TOTAL_PASSWORD`. No compartas ni subas ese archivo al repositorio.

Luego, para crear las cuentas iniciales de Nueva EPS, Famisanar, Sanitas, SURA y Salud Total, ejecuta desde `backend/`:

```sh
npm run provision:admins
```

El comando crea cada usuario con tipo de documento NIT y el nombre de la EPS, y guarda únicamente el hash de la contraseña. Las cuentas existentes se conservan; si un NIT ya pertenece a un usuario incompatible, el comando se detiene sin modificarlo. La base está en `backend/data/meditunja.db` o en la ruta definida por `DB_PATH`.

Ingresa por `/admin/login` con tipo NIT, el número en formato `XXXXXXXXX-DV` y la contraseña asignada. No guardes las contraseñas iniciales en el repositorio ni en logs.

El panel permite aprobar/rechazar solicitudes, actualizar datos de afiliados y crear/desactivar convenios. Los cambios se guardan en SQLite; cada petición vuelve a comprobar rol y EPS en el servidor.

El registro público crea la cuenta en TunjaAPI y guarda localmente la solicitud de afiliación, EPS, teléfono, estado y relación entre documento y correo. Se exige un comprobante PDF, JPG o PNG de hasta 5 MB; los archivos se almacenan en `backend/data/afiliaciones-privadas` (o junto a la base indicada por `DB_PATH`) y no se sirven como contenido estático. Solo el administrador autenticado de la EPS correspondiente puede consultarlo desde Gestión de afiliados; al aprobar la solicitud se elimina el archivo y sus metadatos.

Las nuevas cuentas pueden iniciar sesión mientras la solicitud está pendiente, pero solo pueden consultar su perfil y cerrar sesión. La administración puede aprobar o rechazar solicitudes; únicamente las cuentas aprobadas acceden a citas y a los demás módulos. Las cuentas anteriores que no tengan una solicitud local permanecen restringidas hasta completar el proceso de afiliación.

TunjaAPI autentica actualmente con correo. La aplicación conserva localmente la relación entre tipo/número de documento y correo para permitir que el inicio de sesión público siga solicitando el documento.
