import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { TEST_DATABASE_URL } from './test-database-url.js';

// Deja la BD de pruebas (puerto 5433) con el esquema limpio antes de la suite (TESTING.md §2).
export default function setup(): void {
  const prismaCli = createRequire(import.meta.url).resolve('prisma/build/index.js');
  execFileSync(process.execPath, [prismaCli, 'migrate', 'reset', '--force'], {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: 'inherit',
  });
}
