# Administración de EPS

Las rutas de administración usan la base SQLite del backend, requieren una sesión local y solo permiten operar sobre datos de la EPS asignada al administrador. La base se inicializa y migra automáticamente al iniciar el servidor.

## Integraciones de la aplicación

- El registro y el inicio de sesión con documento y contraseña se realizan mediante TunjaAPI. El acceso con tarjeta consulta TunjaAPI y crea una sesión MediTunja.
- Citas: `GET /api/citas/disponibilidad`, `GET/POST /api/citas` y `PUT /api/citas/:id/cancelar`.
- Solicitudes de transporte: `GET/POST /api/transporte`; deben corresponder a una cita confirmada del usuario. La respuesta queda en estado `solicitada`. No existe gestión administrativa de estas solicitudes.
- Administración de citas: `GET /api/admin/resumen`, `GET /api/admin/citas`, `PUT /api/admin/citas/:id/reprogramar` y `PUT /api/admin/citas/:id/cancelar`. Las operaciones comprueban la EPS del afiliado y guardan el motivo administrativo.
- Administración de afiliados, convenios y resultados usa rutas `/api/admin/*` y verifica el rol y la EPS en el servidor.
- Recargas administrativas: `GET /api/admin/recargas/afiliados` lista las afiliaciones aprobadas de la EPS que están activas en TunjaAPI y tienen una tarjeta NFC vinculada; `POST /api/admin/recargas/afiliados/:id` acredita una recarga en ventanilla usando `POST /users/:id/wallet/topup` de TunjaAPI. El administrador debe enviar un `monto` entero entre 100 y 500.000 y uno de los medios simulados (`nequi`, `daviplata`, `tarjeta`, `pse`). La clave de TunjaAPI solo se usa desde el backend y cada recarga vuelve a validar la afiliación, la EPS y la tarjeta vinculada.

## Vinculación de tarjeta NFC

En `/vinculacionNFC`, la interfaz solicita el UID al puente local de Windows (`nfc-bridge/Puente.bat`) y permite confirmar la vinculación mediante `POST /api/nfc/tarjeta`. La ruta registra la tarjeta tanto en la tabla local como en TunjaAPI mediante `POST /cards`, con la clave conservada en el backend. El ACR122U debe estar conectado al mismo PC que tiene abierto el navegador y el puente debe estar en ejecución; el navegador no puede arrancarlo automáticamente.

El inicio de sesión NFC funciona como un torniquete: `POST /api/tunja/auth/card-login` recibe el UID, el servidor consulta `GET /cards/:uid` en TunjaAPI y comprueba que la tarjeta esté activa, asociada al mismo usuario que la vinculación local y que la afiliación esté habilitada. Si pasa esas comprobaciones, MediTunja crea una sesión local de 15 minutos, sin contraseña; se renueva durante el uso, y el cierre la revoca. La billetera usa las rutas `/users/:id/wallet` con la clave del servidor; nunca se expone la clave al navegador. El UID es copiable y no es una prueba criptográfica de identidad; bloquea o desvincula tarjetas perdidas. Las rutas `/api/nfc/tarjeta` requieren autenticación; la vinculación requiere afiliación aprobada.

## Pagos y recargas

El saldo solo se consulta o recarga mediante `GET /wallet` y `POST /wallet/topup` cuando el afiliado tiene una tarjeta NFC vinculada en MediTunja; el backend vuelve a verificar esa condición. La clave de API se conserva en el backend; no se envía al navegador. Reservar citas y solicitar transporte también requiere tarjeta vinculada.

Nequi, Daviplata, tarjeta débito o crédito y PSE son opciones simuladas en la interfaz: no se conecta una pasarela ni se cobran esos medios. Al confirmar la simulación, el backend solicita a TunjaAPI la acreditación del saldo. La tarjeta NFC vinculada en MediTunja no sincroniza su UID con las tarjetas de TunjaAPI; el saldo acreditado pertenece a la billetera del usuario.

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

TunjaAPI autentica con correo y contraseña para el inicio de sesión tradicional. En el acceso por tarjeta no se envía contraseña: la aplicación verifica el UID activo contra TunjaAPI y emite una sesión propia de MediTunja. La tarjeta debe estar vinculada tanto localmente como en TunjaAPI.
