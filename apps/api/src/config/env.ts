import { z } from 'zod';

// Una variable vacía en .env (por ejemplo GEMINI_API_KEY=) se trata como ausente.
const vacioComoAusente = (valor: unknown) => (valor === '' ? undefined : valor);

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    WEB_ORIGIN: z.url().default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1),
    DATABASE_URL_TEST: z.preprocess(vacioComoAusente, z.string().optional()),
    UPLOAD_DIR: z.string().min(1).default('./uploads'),
    MAX_UPLOAD_MB: z.coerce.number().positive().default(10),
    AI_PROVIDER: z.enum(['mock', 'gemini']).default('mock'),
    GEMINI_API_KEY: z.preprocess(vacioComoAusente, z.string().optional()),
    GEMINI_MODEL: z.string().min(1).default('gemini-3.8-flash'),
    AI_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    AI_GROUP_SIZE: z.coerce.number().int().min(1).default(20),
    AI_PROMPT_VERSION: z.string().min(1).default('v1'),
  })
  .refine((env) => env.AI_PROVIDER !== 'gemini' || env.GEMINI_API_KEY !== undefined, {
    path: ['GEMINI_API_KEY'],
    message: 'es obligatoria cuando AI_PROVIDER=gemini',
  });

export type Env = z.infer<typeof EnvSchema>;

export const ENV = Symbol('ENV');

// Falla al arrancar, nombrando cada variable incorrecta, en lugar de fallar más tarde en medio de una petición.
export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const resultado = EnvSchema.safeParse(source);
  if (resultado.success) return resultado.data;

  const detalle = resultado.error.issues
    .map((issue) => `  - ${issue.path.join('.') || 'configuración'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Configuración inválida. Revisa tu archivo .env (ver .env.example):\n${detalle}`);
}
