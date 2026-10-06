import { z } from 'zod';
import { ERROR_CODES } from '../constants/error-codes';

// Formato único de error de la API; la web lo convierte en ApiError.
export const ApiErrorSchema = z.object({
  code: z.enum(ERROR_CODES),
  message: z.string().min(1),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ApiErrorBody = z.infer<typeof ApiErrorSchema>;
