# Puente NFC para MediTunja

El ACR122U usa PC/SC, interfaz que el navegador no puede consultar. Este puente
local lee el UID con la API Smart Card de Windows y lo entrega al módulo de
vinculación de MediTunja en `http://127.0.0.1:8765`.

## Uso

1. Conecta el ACR122U al PC que tiene abierto MediTunja.
2. Ejecuta `Puente.bat` una vez y deja la ventana abierta.
3. Entra a **Vinculación de tarjeta NFC**. La app pedirá una lectura al puente y
   mostrará el UID en el campo; acerca la tarjeta y confirma la vinculación.
4. Para detener el puente, cierra su ventana o presiona `Ctrl+C`.

No requiere Node, paquetes, compilación ni privilegios de administrador. El
puente escucha solo en la interfaz local y acepta solicitudes de páginas
`localhost`/`127.0.0.1`. Para usar una versión de MediTunja publicada en otro
dominio, configura `MEDITUNJA_NFC_ORIGINS` con el origen exacto antes de abrir
`Puente.bat` (por ejemplo, `https://app.example.edu`). Separa varios orígenes
con comas.

El navegador no permite que una página web ejecute un `.bat` automáticamente.
Por eso el puente se inicia una vez manualmente (o desde el inicio de Windows);
la lectura sí se solicita automáticamente al abrir el módulo. Si no está
iniciado, la app informa que debe abrirse `Puente.bat`.

## Requisitos

- Windows con el servicio **Smart Card** (`SCardSvr`) activo.
- ACR122U conectado y reconocido por Windows.
- MediTunja abierta en `localhost` o `127.0.0.1`.

El UID es un identificador copiable, no una credencial criptográfica. MediTunja
lo utiliza para vincular la tarjeta y abrir una sesión sin contraseña si está
activa en TunjaAPI y asociada a una afiliación aprobada. Quien copie el UID
podría iniciar sesión; bloquea o desvincula de inmediato las tarjetas perdidas.
