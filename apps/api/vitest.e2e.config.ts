import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@utd/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['test/**/*.e2e-spec.ts'],
    // Las pruebas comparten la BD de pruebas: se ejecutan una a la vez.
    fileParallelism: false,
    testTimeout: 30000,
  },
});
