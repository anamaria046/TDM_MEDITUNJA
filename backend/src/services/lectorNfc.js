let cargaLector;
let lectores = new Set();
let escaneoActivo = null;
let errorLector = null;

function rechazarEscaneo(error) {
  if (!escaneoActivo) return;
  clearTimeout(escaneoActivo.temporizador);
  escaneoActivo.reject(error);
  escaneoActivo = null;
}

function iniciarLector() {
  if (!cargaLector) {
    cargaLector = import('nfc-pcsc')
      .then(({ NFC }) => {
        const nfc = new NFC();
        nfc.on('reader', (lector) => {
          lectores.add(lector);
          errorLector = null;

          lector.on('card', (tarjeta) => {
            const uid = typeof tarjeta.uid === 'string'
              ? tarjeta.uid.replace(/[^a-f\d]/gi, '').toUpperCase()
              : '';
            if (!uid || uid.length < 4 || uid.length > 40) {
              rechazarEscaneo(Object.assign(
                new Error('El lector detectó una tarjeta sin un identificador válido.'),
                { code: 'NFC_UID_INVALID' }
              ));
              return;
            }
            if (escaneoActivo) {
              clearTimeout(escaneoActivo.temporizador);
              escaneoActivo.resolve(uid);
              escaneoActivo = null;
            }
          });

          lector.on('error', (error) => {
            errorLector = error;
            rechazarEscaneo(Object.assign(
              new Error('El lector NFC no pudo leer la tarjeta.'),
              { code: 'NFC_READ_FAILED' }
            ));
          });

          lector.on('end', () => {
            lectores.delete(lector);
            rechazarEscaneo(Object.assign(
              new Error('El lector NFC se desconectó.'),
              { code: 'NFC_READER_DISCONNECTED' }
            ));
          });
        });

        nfc.on('error', (error) => {
          errorLector = error;
          rechazarEscaneo(Object.assign(
            new Error('No fue posible acceder al servicio PC/SC del sistema.'),
            { code: 'NFC_PCSC_UNAVAILABLE' }
          ));
        });
        return nfc;
      })
      .catch((error) => {
        errorLector = error;
        throw Object.assign(
          new Error('No está disponible la integración PC/SC del lector NFC.'),
          { code: 'NFC_DRIVER_UNAVAILABLE', cause: error }
        );
      });
  }
  return cargaLector;
}

export async function leerUid(timeoutMs = 30000) {
  await iniciarLector();
  if (lectores.size === 0) {
    throw Object.assign(
      new Error('Conecta el lector ACR122U e inténtalo de nuevo.'),
      { code: errorLector ? 'NFC_PCSC_UNAVAILABLE' : 'NFC_READER_NOT_FOUND' }
    );
  }
  if (escaneoActivo) {
    throw Object.assign(
      new Error('Ya hay otra lectura NFC en curso.'),
      { code: 'NFC_SCAN_IN_PROGRESS' }
    );
  }

  return new Promise((resolve, reject) => {
    const temporizador = setTimeout(() => {
      escaneoActivo = null;
      reject(Object.assign(
        new Error('No se detectó una tarjeta. Acércala al lector e inténtalo de nuevo.'),
        { code: 'NFC_SCAN_TIMEOUT' }
      ));
    }, timeoutMs);
    escaneoActivo = { resolve, reject, temporizador };
  });
}

export function estadoLector() {
  return {
    disponible: lectores.size > 0,
    lectores: lectores.size,
    error: errorLector ? 'El servicio PC/SC reportó un error.' : null
  };
}
