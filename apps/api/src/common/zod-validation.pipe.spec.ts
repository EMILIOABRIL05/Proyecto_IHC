import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { DomainError } from './domain-error.js';
import { ZodValidationPipe } from './zod-validation.pipe.js';

const Schema = z.object({
  name: z.string().min(1, 'Escribe un nombre'),
  quota: z.number().int().min(1).max(50),
});

describe('ZodValidationPipe', () => {
  it('devuelve el valor ya validado y tipado', () => {
    const pipe = new ZodValidationPipe(Schema);

    expect(pipe.transform({ name: 'Piloto', quota: 8 })).toEqual({ name: 'Piloto', quota: 8 });
  });

  it('lanza VALIDATION_ERROR con el mensaje por campo en details.fields', () => {
    const pipe = new ZodValidationPipe(Schema);

    let capturado: unknown;
    try {
      pipe.transform({ name: '', quota: 99 });
    } catch (error) {
      capturado = error;
    }

    expect(capturado).toBeInstanceOf(DomainError);
    const error = capturado as DomainError;
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.httpStatus).toBe(400);
    expect(error.details).toEqual({
      fields: { name: 'Escribe un nombre', quota: expect.any(String) },
    });
  });

  it('agrupa los errores sin campo bajo _form', () => {
    const pipe = new ZodValidationPipe(z.string());

    try {
      pipe.transform(123);
      throw new Error('debía fallar');
    } catch (error) {
      expect((error as DomainError).details).toEqual({ fields: { _form: expect.any(String) } });
    }
  });
});
