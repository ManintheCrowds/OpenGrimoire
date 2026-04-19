/**
 * Single source of truth for Playwright `webServer.env` default secrets.
 * `playwright.config.ts` uses `buildPlaywrightWebServerEnv()`; tests use the getters / `E2E_*` exports.
 */

export const E2E_DEFAULT_WEB_ENV = {
  ALIGNMENT_CONTEXT_API_SECRET: 'e2e-playwright-alignment-secret',
  SURVEY_POST_BOOTSTRAP_SECRET: 'e2e-survey-post-bootstrap-secret',
  OPENGRIMOIRE_SESSION_SECRET: 'e2e-opengrimoire-session-secret',
  OPENGRIMOIRE_ADMIN_PASSWORD: 'e2e-test-password',
  OPERATOR_PROBE_INGEST_SECRET: 'e2e-operator-probe-ingest-secret',
} as const;

/** Operator login password for E2E (matches webServer default). */
export function e2eOpenGrimoireAdminPassword(): string {
  return process.env.OPENGRIMOIRE_ADMIN_PASSWORD ?? E2E_DEFAULT_WEB_ENV.OPENGRIMOIRE_ADMIN_PASSWORD;
}

/** Alignment header value for API requests in E2E (matches webServer default). */
export const E2E_ALIGNMENT_CONTEXT_API_SECRET =
  process.env.ALIGNMENT_CONTEXT_API_SECRET ?? E2E_DEFAULT_WEB_ENV.ALIGNMENT_CONTEXT_API_SECRET;

/** Header value for POST /api/operator-probes/ingest in E2E (matches webServer default). */
export const E2E_OPERATOR_PROBE_INGEST_SECRET =
  process.env.OPERATOR_PROBE_INGEST_SECRET ?? E2E_DEFAULT_WEB_ENV.OPERATOR_PROBE_INGEST_SECRET;

/** Env object for `playwright.config.ts` `webServer.env` (CI overrides via `process.env`). */
export function buildPlaywrightWebServerEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const key of Object.keys(process.env)) {
    const v = process.env[key];
    if (v !== undefined) env[key] = v;
  }
  env.ALIGNMENT_CONTEXT_API_SECRET =
    process.env.ALIGNMENT_CONTEXT_API_SECRET ?? E2E_DEFAULT_WEB_ENV.ALIGNMENT_CONTEXT_API_SECRET;
  env.ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL = 'true';
  env.SURVEY_POST_BOOTSTRAP_SECRET =
    process.env.SURVEY_POST_BOOTSTRAP_SECRET ?? E2E_DEFAULT_WEB_ENV.SURVEY_POST_BOOTSTRAP_SECRET;
  env.OPENGRIMOIRE_SESSION_SECRET =
    process.env.OPENGRIMOIRE_SESSION_SECRET ?? E2E_DEFAULT_WEB_ENV.OPENGRIMOIRE_SESSION_SECRET;
  env.OPENGRIMOIRE_ADMIN_PASSWORD =
    process.env.OPENGRIMOIRE_ADMIN_PASSWORD ?? E2E_DEFAULT_WEB_ENV.OPENGRIMOIRE_ADMIN_PASSWORD;
  env.OPERATOR_PROBE_INGEST_SECRET =
    process.env.OPERATOR_PROBE_INGEST_SECRET ?? E2E_DEFAULT_WEB_ENV.OPERATOR_PROBE_INGEST_SECRET;
  return env;
}
