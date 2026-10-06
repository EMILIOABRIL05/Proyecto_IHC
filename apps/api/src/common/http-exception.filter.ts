import {
  Catch,
  HttpException,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiErrorBody } from '@utd/shared';
import { DomainError } from './domain-error.js';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.traducir(exception);
    response.status(status).json(body);
  }

  private traducir(exception: unknown): { status: number; body: ApiErrorBody } {
    if (exception instanceof DomainError) {
      const body: ApiErrorBody = { code: exception.code, message: exception.message };
      if (exception.details) body.details = exception.details;
      return { status: exception.httpStatus, body };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status === 404) {
        return { status, body: { code: 'NOT_FOUND', message: 'No encontramos lo que buscas.' } };
      }
      if (status === 400) {
        return {
          status,
          body: { code: 'VALIDATION_ERROR', message: 'La solicitud no es válida.' },
        };
      }
    }

    // Sin detalles técnicos al cliente; el detalle queda solo en el log (ARCHITECTURE.md §4).
    this.logger.error(
      exception instanceof Error ? (exception.stack ?? exception.message) : String(exception),
    );
    return {
      status: 500,
      body: {
        code: 'INTERNAL_ERROR',
        message: 'Ocurrió un error inesperado. Inténtalo de nuevo en un momento.',
      },
    };
  }
}
