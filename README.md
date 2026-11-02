# MediTunja

## Desarrollo local

Requisitos: Node.js 22.9 o superior y npm.

1. Instala las dependencias de cada aplicación la primera vez:

   ```powershell
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

2. Verifica que `backend/.env` tenga la configuración local de TunjaAPI. No compartas ni subas ese archivo al repositorio.
3. Desde la raíz del proyecto, inicia frontend y backend juntos:

   ```powershell
   npm run dev
   ```

Vite muestra la dirección del frontend (normalmente `http://localhost:5173`) y el backend escucha en `http://localhost:3001`. El frontend reenvía `/api` al backend; no hace falta configurar CORS para el desarrollo local. Presiona `Ctrl+C` para detener ambos procesos.
