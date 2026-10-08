import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

// En desarrollo el .env vive en la raíz del monorepo; la API puede arrancar desde apps/api.
export function loadEnvFile(): void {
  for (const ruta of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')]) {
    if (existsSync(ruta)) {
      process.loadEnvFile(ruta);
      return;
    }
  }
}
