import type { PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';
import { DomainError } from './domain-error.js';

// Uso: @Body(new ZodValidationPipe(PlanCreateInput)). El esquema viene de @utd/shared (ADR-0005).
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const resultado = this.schema.safeParse(value);
    if (resultado.success) return resultado.data;

    const fields: Record<string, string> = {};
    for (const issue of resultado.error.issues) {
      const campo = issue.path.length > 0 ? issue.path.join('.') : '_form';
      fields[campo] ??= issue.message;
    }
    throw new DomainError('VALIDATION_ERROR', 'Revisa los campos marcados.', { fields });
  }
}
