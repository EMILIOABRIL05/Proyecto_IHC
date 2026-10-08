import { defineConfig, devices } from '@playwright/test';

// Los flujos T1–T5 (docs/TESTING.md §4) se agregan en e2e/ a medida que existen las pantallas.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:5173', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
