import { ERROR_HTTP_STATUS, type ErrorCode } from '@utd/shared';

// Error de negocio: los servicios lo lanzan y el filtro global lo convierte en { code, message, details }.
export class DomainError extends Error {
  readonly httpStatus: number;

  constructor(
    readonly code: ErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    httpStatus?: number,
  ) {
    super(message);
    this.name = 'DomainError';
    this.httpStatus = httpStatus ?? ERROR_HTTP_STATUS[code];
  }
}
