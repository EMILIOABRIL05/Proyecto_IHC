import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Misma regla que test/test-database-url.ts (el config no puede importar archivos .ts con extensión).
const TEST_DATABASE_URL =
  process.env.DATABASE_URL_TEST || 'postgresql://utd:utd@localhost:5433/utd_test';

export default defineConfig({
  resolve: {
    alias: {
      '@utd/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    env: { DATABASE_URL: TEST_DATABASE_URL },
    // Las pruebas comparten la BD de pruebas: se ejecutan una a la vez.
    fileParallelism: false,
    testTimeout: 30000,
  },
});
