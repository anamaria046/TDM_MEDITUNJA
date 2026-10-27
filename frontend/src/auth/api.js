const apiBaseUrl = import.meta.env.VITE_API_URL || "/api";

export class ApiError extends Error {
    constructor(message, status, code) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

export async function apiRequest(path, { headers, ...options } = {}) {
    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...headers,
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
        );
    }

    return body;
}

export function mensajeError(error) {
    if (error instanceof TypeError) {
        return "No se pudo conectar con el servidor. Verifica que el backend esté iniciado.";
    }
    return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}
