import { describe, expect, it } from 'vitest';
import { ApiErrorSchema } from './errors';
import { ERROR_CODES, ERROR_HTTP_STATUS } from '../constants/error-codes';

describe('ApiErrorSchema', () => {
  it('acepta el formato único { code, message, details }', () => {
    const resultado = ApiErrorSchema.safeParse({
      code: 'QUOTA_FULL',
      message: 'El plan ya alcanzó su cupo de participantes.',
      details: { targetParticipants: 8 },
    });

    expect(resultado.success).toBe(true);
  });

  it('acepta un error sin details', () => {
    const resultado = ApiErrorSchema.safeParse({ code: 'NOT_FOUND', message: 'No existe.' });

    expect(resultado.success).toBe(true);
  });

  it('rechaza un código que no está en el catálogo', () => {
    const resultado = ApiErrorSchema.safeParse({ code: 'ALGO_RARO', message: 'x' });

    expect(resultado.success).toBe(false);
  });

  it('rechaza un error sin mensaje para personas', () => {
    const resultado = ApiErrorSchema.safeParse({ code: 'NOT_FOUND' });

    expect(resultado.success).toBe(false);
  });
});

describe('catálogo de códigos de error', () => {
  it('asigna un estado HTTP a cada código', () => {
    for (const code of ERROR_CODES) {
      expect(ERROR_HTTP_STATUS[code]).toBeGreaterThanOrEqual(400);
    }
  });

  it('usa 409 para las reglas de negocio de planes y sesiones (RN-01..05, RN-16)', () => {
    expect(ERROR_HTTP_STATUS.CONSENT_REQUIRED).toBe(409);
    expect(ERROR_HTTP_STATUS.QUOTA_FULL).toBe(409);
    expect(ERROR_HTTP_STATUS.VERSION_CONFLICT).toBe(409);
  });

  it('distingue los errores de archivos (RN-15)', () => {
    expect(ERROR_HTTP_STATUS.FILE_TOO_LARGE).toBe(413);
    expect(ERROR_HTTP_STATUS.INVALID_FILE_TYPE).toBe(415);
  });
});
