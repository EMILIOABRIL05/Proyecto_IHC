import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpException, Logger, NotFoundException, type ArgumentsHost } from '@nestjs/common';
import { DomainError } from './domain-error.js';
import { HttpExceptionFilter } from './http-exception.filter.js';

function crearHost() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({ getResponse: () => ({ status }) }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('HttpExceptionFilter', () => {
  const filtro = new HttpExceptionFilter();

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  it('responde un DomainError con el formato { code, message, details }', () => {
    const { host, status, json } = crearHost();

    filtro.catch(new DomainError('QUOTA_FULL', 'Cupo lleno.', { cupo: 8 }), host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({
      code: 'QUOTA_FULL',
      message: 'Cupo lleno.',
      details: { cupo: 8 },
    });
  });

  it('traduce una ruta inexistente a NOT_FOUND', () => {
    const { host, status, json } = crearHost();

    filtro.catch(new NotFoundException(), host);

    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'NOT_FOUND' }));
  });

  it('traduce un 400 de Nest a VALIDATION_ERROR', () => {
    const { host, status, json } = crearHost();

    filtro.catch(new HttpException('JSON inválido', 400), host);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: 'VALIDATION_ERROR' }));
  });

  it('oculta el detalle técnico de un error no controlado y lo registra en el log', () => {
    const { host, status, json } = crearHost();

    filtro.catch(new Error('password authentication failed for user utd'), host);

    expect(status).toHaveBeenCalledWith(500);
    const cuerpo = json.mock.calls[0]?.[0] as { code: string; message: string; details?: unknown };
    expect(cuerpo.code).toBe('INTERNAL_ERROR');
    expect(cuerpo.message).not.toContain('password');
    expect(cuerpo.details).toBeUndefined();
    expect(Logger.prototype.error).toHaveBeenCalled();
  });
});
