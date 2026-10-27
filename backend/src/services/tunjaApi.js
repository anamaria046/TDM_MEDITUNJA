const apiBase = (process.env.TUNJA_API || 'https://nfc.multimediaudeb.com/api/v1')
  .replace(/\/+$/, '');

export class TunjaApiError extends Error {
  constructor(status, payload) {
    super(payload.ayuda || payload.error || 'La API de Tunja no pudo procesar la solicitud.');
    this.name = 'TunjaApiError';
    this.status = status;
    this.code = payload.error || 'tunja_api_error';
    this.payload = payload;
  }
}

export async function tunjaRequest(path, { method = 'GET', body, accessToken, requiresKey = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (requiresKey) {
    if (!process.env.TUNJA_CLAVE) {
      const error = new Error('El servidor no tiene configurada la clave TUNJA_CLAVE.');
      error.code = 'TUNJA_KEY_MISSING';
      throw error;
    }
    headers['X-API-Key'] = process.env.TUNJA_CLAVE;
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    });
  } catch (error) {
    const fallo = new Error('No fue posible conectar con TunjaAPI.');
    fallo.code = 'TUNJA_API_UNAVAILABLE';
    fallo.cause = error;
    throw fallo;
  }

  if (response.status === 204) return null;

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    const fallo = new Error('TunjaAPI devolvió una respuesta no válida.');
    fallo.code = 'TUNJA_API_INVALID_RESPONSE';
    fallo.cause = error;
    throw fallo;
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    const error = new Error('TunjaAPI devolvió una respuesta no válida.');
    error.code = 'TUNJA_API_INVALID_RESPONSE';
    throw error;
  }

  if (!response.ok) {
    throw new TunjaApiError(response.status, payload);
  }

  return payload;
}
