import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e/',
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
    env: {
      ...process.env,
      /** Matches e2e/helpers/e2e-secrets.ts default; required for clarification + moderation negative tests */
      ALIGNMENT_CONTEXT_API_SECRET:
        process.env.ALIGNMENT_CONTEXT_API_SECRET ?? 'e2e-playwright-alignment-secret',
      ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL: 'true',
      /** Used when SURVEY_POST_REQUIRE_TOKEN=true for optional survey token-gate e2e */
      SURVEY_POST_BOOTSTRAP_SECRET:
        process.env.SURVEY_POST_BOOTSTRAP_SECRET ?? 'e2e-survey-post-bootstrap-secret',
      OPENGRIMOIRE_SESSION_SECRET: process.env.OPENGRIMOIRE_SESSION_SECRET ?? 'e2e-opengrimoire-session-secret',
      OPENGRIMOIRE_ADMIN_PASSWORD: process.env.OPENGRIMOIRE_ADMIN_PASSWORD ?? 'e2e-test-password',
    },
  },
});
