import { describe, it, expect } from 'vitest';
import { DomainError } from './domain-error.js';

describe('DomainError', () => {
  it('toma el estado HTTP del catálogo según el código', () => {
    const error = new DomainError('QUOTA_FULL', 'El plan alcanzó su cupo.');

    expect(error.httpStatus).toBe(409);
    expect(error.code).toBe('QUOTA_FULL');
    expect(error.message).toBe('El plan alcanzó su cupo.');
  });

  it('conserva los detalles y permite fijar el estado HTTP', () => {
    const error = new DomainError('NOT_FOUND', 'No existe.', { id: 'x' }, 410);

    expect(error.details).toEqual({ id: 'x' });
    expect(error.httpStatus).toBe(410);
  });
});
