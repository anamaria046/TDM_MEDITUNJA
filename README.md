# MediTunja

Aplicación React/Vite con API Express y base de datos SQLite para afiliación,
agendamiento de citas y administración por EPS.

## Desarrollo local

Requisitos: Node.js 22.9 o superior y npm.

1. Instala las dependencias desde la raíz:

   ```powershell
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Copia `backend/.env.example` a `backend/.env` y configura `TUNJA_API`,
   `TUNJA_CLAVE` y las credenciales de administración que necesites. No subas ni
   compartas `backend/.env`.
3. Inicia el backend y frontend juntos:

   ```powershell
   npm run dev
   ```

El backend escucha en `http://localhost:3001`; Vite suele usar
`http://localhost:5173` y reenvía `/api` al backend. Para otro despliegue, define
`VITE_API_URL` en el frontend. Presiona `Ctrl+C` para detener ambos procesos.

## Flujos conectados

- El registro y el inicio de sesión con documento y contraseña usan TunjaAPI; el
  acceso NFC consulta la tarjeta activa y abre una sesión MediTunja sin contraseña.
- Disponibilidad, reserva, listado y cancelación de citas persisten en SQLite.
- Los administradores consultan métricas, citas y solicitudes de transporte de su
  EPS, y gestionan afiliados, convenios y resultados desde la API. Pueden aceptar
  o rechazar solicitudes de transporte, sin que eso asigne automáticamente un vehículo.
- No existe un rol de operador en la API; las rutas antiguas de operador están
  deshabilitadas en lugar de mostrar métricas de demostración.
- Las solicitudes de transporte se asocian a una cita confirmada y quedan
  pendientes de confirmación operativa.
- El ACR122U se integra mediante el puente local de `nfc-bridge/`. Ejecuta
  `Puente.bat` una vez en el PC del lector; al entrar a **Vinculación de tarjeta
  NFC**, la app solicita automáticamente una lectura y permite confirmar el UID
  antes de enviarlo a la API. El navegador no puede iniciar el `.bat` por sí
  solo; consulta `nfc-bridge/README.md`.

## Saldo y alcance del NFC

El módulo de recarga consulta la billetera de TunjaAPI y acredita saldo mediante
`POST /wallet/topup`. La clave `TUNJA_CLAVE` se usa únicamente desde el backend;
debe configurarse en `backend/.env`. Esta operación acredita saldo directamente:
no cobra una tarjeta bancaria, no procesa PSE y no genera una transacción de pago
externo. Para cobrar fondos reales se debe integrar una pasarela de pago.

La API registra el UID para vincular una tarjeta. Se puede iniciar sesión con
el UID vinculado, como en un torniquete: al acercar una tarjeta activa se abre
una sesión MediTunja de 15 minutos, renovada mientras se usa la aplicación. La
cuenta debe estar aprobada y la tarjeta registrada en TunjaAPI. El UID es una
credencial copiable y no es criptográfico;
bloquea o desvincula tarjetas perdidas inmediatamente. MediTunja registra la
tarjeta en TunjaAPI y verifica su estado allí. La recarga acredita el saldo de
la billetera y no confirma que esté disponible en la tarjeta física.

## Pruebas

```powershell
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

La base de datos se crea en `backend/data/meditunja.db` o en la ruta definida por
`DB_PATH`. La provisión y alcance de las cuentas administradoras se documentan
en `backend/README.md`.
