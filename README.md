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

- Registro, inicio/cierre de sesión, renovación y perfil del paciente usan TunjaAPI.
- Disponibilidad, reserva, listado y cancelación de citas persisten en SQLite.
- Los administradores consultan métricas, citas y solicitudes de transporte de su
  EPS, y gestionan afiliados, convenios y resultados desde la API. Pueden aceptar
  o rechazar solicitudes de transporte, sin que eso asigne automáticamente un vehículo.
- No existe un rol de operador en la API; las rutas antiguas de operador están
  deshabilitadas en lugar de mostrar métricas de demostración.
- Las solicitudes de transporte se asocian a una cita confirmada y quedan
  pendientes de confirmación operativa.
- El ACR122U puede vincular una tarjeta al usuario autenticado desde
  **Vinculación de tarjeta NFC**. La lectura se hace en el equipo donde corre el
  backend, mediante PC/SC; consulta los requisitos en `backend/README.md`.

## Pagos y alcance del NFC

No hay pasarela de pago ni servicio de saldo configurado. Por esa razón, las
vistas de pagos y recargas no procesan dinero, no alteran saldos y no generan
comprobantes. Para habilitarlas se debe integrar y configurar un proveedor de
pagos.

El lector registra el UID para vincular una tarjeta; ese identificador por sí
solo no es una credencial criptográfica, no habilita inicio de sesión NFC ni
permite debitar o recargar saldo. TunjaAPI actualmente autentica con correo y
contraseña.

## Pruebas

```powershell
npm --prefix backend test
npm --prefix frontend run lint
npm --prefix frontend run build
```

La base de datos se crea en `backend/data/meditunja.db` o en la ruta definida por
`DB_PATH`. La provisión y alcance de las cuentas administradoras se documentan
en `backend/README.md`.
