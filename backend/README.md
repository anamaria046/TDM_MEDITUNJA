# Administración de EPS

Las rutas de administración usan la base SQLite del backend, requieren una sesión local y solo permiten operar sobre datos de la EPS asignada al administrador. La base se inicializa y migra automáticamente al iniciar el servidor.

## Integraciones de la aplicación

- Registro, inicio/cierre de sesión, renovación y consulta del perfil de paciente se realizan mediante TunjaAPI.
- Citas: `GET /api/citas/disponibilidad`, `GET/POST /api/citas` y `PUT /api/citas/:id/cancelar`.
- Solicitudes de transporte: `GET/POST /api/transporte`; deben corresponder a una cita confirmada del usuario. La respuesta queda en estado `solicitada`. El administrador de la EPS puede consultar y aceptar/rechazar solicitudes mediante `GET /api/admin/transporte` y `PUT /api/admin/transporte/:id/estado`; la aceptación no asigna automáticamente un vehículo.
- Administración de citas: `GET /api/admin/resumen`, `GET /api/admin/citas`, `PUT /api/admin/citas/:id/reprogramar` y `PUT /api/admin/citas/:id/cancelar`. Las operaciones comprueban la EPS del afiliado y guardan el motivo administrativo.
- Administración de afiliados, convenios y resultados usa rutas `/api/admin/*` y verifica el rol y la EPS en el servidor.

## Lector ACR122U

La vinculación de tarjeta usa `nfc-pcsc` y PC/SC para leer el UID de una tarjeta con el ACR122U. El lector debe estar conectado al mismo equipo que ejecuta el backend; no se comunica directamente con el navegador. Las rutas `/api/nfc/tarjeta` requieren un usuario autenticado y con afiliación aprobada.

`nfc-pcsc` es una dependencia opcional porque necesita compilar un módulo nativo. En Windows, instala Python y Visual Studio Build Tools con la carga de trabajo de C++ antes de instalar las dependencias del backend para activar el lector. Si el módulo o el lector no están disponibles, la API devuelve un error y no finge una lectura.

El UID solo se usa para vincular la tarjeta al perfil. No es una prueba criptográfica de identidad y no debe usarse por sí solo para iniciar sesión, autorizar pagos o acceder a información médica.

## Pagos y recargas

No hay un proveedor de pagos ni un servicio de saldo conectado. La interfaz mantiene deshabilitados los cobros y las recargas: no se almacena saldo ficticio ni se crean recibos de éxito. Para activar esas operaciones debe integrarse una pasarela y definir su configuración y flujo de confirmación/webhooks.

## Cuentas administradoras de EPS

Los NIT se configuran mediante `ADMIN_NUEVA_EPS_NIT`, `ADMIN_FAMISANAR_NIT`, `ADMIN_SANITAS_NIT`, `ADMIN_SURA_NIT` y `ADMIN_SALUD_TOTAL_NIT` en `backend/.env`. Define también una contraseña distinta para cada EPS con las variables `ADMIN_NUEVA_EPS_PASSWORD`, `ADMIN_FAMISANAR_PASSWORD`, `ADMIN_SANITAS_PASSWORD`, `ADMIN_SURA_PASSWORD` y `ADMIN_SALUD_TOTAL_PASSWORD`. No compartas ni subas ese archivo al repositorio.

Luego, para crear o activar las cuentas de Nueva EPS, Famisanar, Sanitas, SURA y Salud Total, así como la cuenta de prueba definida por `TEST_USER_DOCUMENT_TYPE`, `TEST_USER_DOCUMENT_NUMBER`, `TEST_USER_PASSWORD`, `TEST_USER_NAME`, `TEST_USER_EMAIL` y `TEST_USER_EPS`, ejecuta desde `backend/`:

```sh
npm run provision:admins
```

El comando crea cada usuario con tipo de documento NIT y el nombre de la EPS, y guarda únicamente el hash de la contraseña. También activa las cuentas existentes cuando sus datos identificadores coinciden con la configuración; no cambia sus contraseñas ni sobrescribe otros datos. Si una identificación ya pertenece a una cuenta incompatible, el comando se detiene sin modificarla. La base está en `backend/data/meditunja.db` o en la ruta definida por `DB_PATH`.

Ingresa por `/admin/login` con tipo NIT, el número en formato `XXXXXXXXX-DV` y la contraseña asignada. No guardes las contraseñas iniciales en el repositorio ni en logs.

El panel permite aprobar/rechazar solicitudes, actualizar datos de afiliados y crear/desactivar convenios. Los cambios se guardan en SQLite; cada petición vuelve a comprobar rol y EPS en el servidor.

## Resultados de procedimientos

Los administradores de EPS pueden registrar y eliminar resultados desde `/resultados-administrador`; solo pueden operar sobre afiliados aprobados de su propia EPS. El paciente autenticado consulta sus resultados en `/resultados-procedimientos`. Los informes en estado «En proceso» no se entregan al paciente.

El registro es manual y se guarda en la tabla `resultados_procedimientos` de SQLite. No existe una integración automática con los sistemas de las IPS, por lo que se debe verificar la información antes de publicarla.

El registro público crea la cuenta en TunjaAPI y guarda localmente la solicitud de afiliación, EPS, teléfono, estado y relación entre documento y correo. Se exige un comprobante PDF, JPG o PNG de hasta 5 MB; los archivos se almacenan en `backend/data/afiliaciones-privadas` (o junto a la base indicada por `DB_PATH`) y no se sirven como contenido estático. Solo el administrador autenticado de la EPS correspondiente puede consultarlo desde Gestión de afiliados; al aprobar la solicitud se elimina el archivo y sus metadatos.

Las nuevas cuentas pueden iniciar sesión mientras la solicitud está pendiente, pero solo pueden consultar su perfil y cerrar sesión. La administración puede aprobar o rechazar solicitudes; únicamente las cuentas aprobadas acceden a citas y a los demás módulos. Las cuentas anteriores que no tengan una solicitud local permanecen restringidas hasta completar el proceso de afiliación.

TunjaAPI autentica actualmente con correo. La aplicación conserva localmente la relación entre tipo/número de documento y correo para permitir que el inicio de sesión público siga solicitando el documento.
