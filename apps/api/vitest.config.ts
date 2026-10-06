import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Se prueba contra el código fuente de shared, sin necesidad de compilarlo.
    alias: {
      '@utd/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // El cableado (módulos, arranque) lo cubren las pruebas e2e.
      exclude: [
        'src/**/*.spec.ts',
        'src/**/*.module.ts',
        'src/main.ts',
        'src/app.factory.ts',
        'src/config/load-env-file.ts',
        'src/prisma/**',
        'src/generated/**',
      ],
      thresholds: { lines: 70, branches: 70 },
    },
  },
});
