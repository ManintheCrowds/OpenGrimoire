import { defineConfig, devices } from '@playwright/test';

import { buildPlaywrightWebServerEnv } from './e2e/helpers/e2e-secrets';

export default defineConfig({
  testDir: 'e2e/',
  /** OG-GUI-06: Percy snapshots only under `npm run test:e2e:visual` (see package.json). */
  testIgnore: process.env.PLAYWRIGHT_VISUAL_BASELINES
    ? []
    : ['**/visual-baselines-og-gui-06.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  timeout: 60000,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev -- -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    /** Defaults live in `e2e/helpers/e2e-secrets.ts` (`buildPlaywrightWebServerEnv`). */
    env: buildPlaywrightWebServerEnv(),
  },
});
