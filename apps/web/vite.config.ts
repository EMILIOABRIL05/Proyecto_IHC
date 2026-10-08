import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // En desarrollo y pruebas se usa el código fuente de shared (sin compilarlo).
      '@utd/shared': fileURLToPath(new URL('../../packages/shared/src/index.ts', import.meta.url)),
    },
  },
  server: { port: 5173, strictPort: true },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/test/**', 'src/components/ui/**'],
      thresholds: { lines: 70, branches: 70 },
    },
  },
});
