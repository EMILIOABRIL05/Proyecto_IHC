import { ApiErrorSchema, type ErrorCode } from '@utd/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export type ApiErrorCode = ErrorCode | 'NETWORK_ERROR';

// Error de la API ya interpretado: los formularios leen `fieldErrors`; el resto usa `message`.
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  // details.fields = { campo: mensaje } en los VALIDATION_ERROR de la API.
  get fieldErrors(): Record<string, string> {
    const campos = this.details?.fields;
    if (typeof campos !== 'object' || campos === null) return {};
    return Object.fromEntries(
      Object.entries(campos).filter((par): par is [string, string] => typeof par[1] === 'string'),
    );
  }
}

type ApiRequestInit = Omit<RequestInit, 'body'> & { json?: unknown };

export async function apiFetch<T = unknown>(path: string, init: ApiRequestInit = {}): Promise<T> {
  const { json, headers, ...resto } = init;
  const cabeceras = new Headers(headers);
  if (json !== undefined) cabeceras.set('Content-Type', 'application/json');

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${path}`, {
      ...resto,
      headers: cabeceras,
      body: json === undefined ? undefined : JSON.stringify(json),
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      'No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.',
    );
  }

  if (respuesta.status === 204) return undefined as T;
  if (respuesta.ok) return (await respuesta.json()) as T;

  const cuerpo = ApiErrorSchema.safeParse(await respuesta.json().catch(() => null));
  if (cuerpo.success) {
    const { code, message, details } = cuerpo.data;
    throw new ApiError(respuesta.status, code, message, details);
  }
  throw new ApiError(
    respuesta.status,
    'INTERNAL_ERROR',
    'Ocurrió un error inesperado. Inténtalo de nuevo en un momento.',
  );
}
