export const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
    constructor(message, status, code, retryAfter) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.retryAfter = retryAfter;
    }
}

export async function apiRequest(path, { headers, ...options } = {}) {
    const encabezados = { ...headers };
    const esFormulario = options.body instanceof FormData;
    if (esFormulario) delete encabezados["Content-Type"];

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: {
            ...(esFormulario ? {} : { "Content-Type": "application/json" }),
            ...encabezados,
        },
    });
    if (response.status === 204) return null;

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        throw new Error("El servidor devolvió una respuesta inesperada.");
    }

    const body = await response.json();
    if (!response.ok) {
        throw new ApiError(
            body.mensaje || body.ayuda || body.error || "No fue posible completar la solicitud.",
            response.status,
            body.error,
            body.reintentar_en,
        );
    }

    return body;
}

export function mensajeError(error) {
    if (error instanceof TypeError) {
        return "No se pudo conectar con el servidor. Verifica que el backend esté iniciado.";
    }
    if (error instanceof ApiError && error.status === 429) {
        const espera = Number(error.retryAfter);
        return Number.isFinite(espera) && espera > 0
            ? `Se alcanzó el límite de intentos. Espera ${Math.ceil(espera)} segundos antes de volver a intentarlo.`
            : "Se alcanzó el límite de intentos. Espera un momento antes de volver a intentarlo.";
    }
    return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}
