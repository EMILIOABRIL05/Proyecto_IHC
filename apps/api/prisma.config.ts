import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 no carga .env por su cuenta; el archivo vive en la raíz del monorepo.
for (const ruta of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
  if (existsSync(ruta)) {
    process.loadEnvFile(ruta);
    break;
  }
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // El valor por defecto es el de docker-compose.yml; así `prisma generate` funciona sin .env (CI).
    url: process.env.DATABASE_URL ?? 'postgresql://utd:utd@localhost:5432/utd',
  },
});
