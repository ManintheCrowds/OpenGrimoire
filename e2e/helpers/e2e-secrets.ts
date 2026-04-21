/**
 * Single source of truth for Playwright `webServer.env` default secrets.
 * `playwright.config.ts` uses `buildPlaywrightWebServerEnv()`; tests use the getters / `E2E_*` exports.
 *
 * **Production / staging:** These literals are for **E2E and local test runs only**. Real deployments
 * must set proper env vars — never ship a host that accidentally relies on `process.env.* ?? E2E_DEFAULT_*`
 * fallthrough from this module (the app does not import this file in production routes; the risk is
 * **operators** or **compose files** omitting secrets and assuming “defaults”). See [DEPLOYMENT.md](../../DEPLOYMENT.md) § E2E defaults vs production.
 */

export const E2E_DEFAULT_WEB_ENV = {
  ALIGNMENT_CONTEXT_API_SECRET: 'e2e-playwright-alignment-secret',
  SURVEY_POST_BOOTSTRAP_SECRET: 'e2e-survey-post-bootstrap-secret',
  OPENGRIMOIRE_SESSION_SECRET: 'e2e-opengrimoire-session-secret',
  OPENGRIMOIRE_ADMIN_PASSWORD: 'e2e-test-password',
  OPERATOR_PROBE_INGEST_SECRET: 'e2e-operator-probe-ingest-secret',
  OPERATOR_PROBE_ADMIN_SECRET: 'e2e-operator-probe-admin-secret',
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

/** Header value for GET/DELETE `/api/admin/operator-probes`… in E2E when `OPERATOR_PROBE_ADMIN_SECRET` is set. */
export const E2E_OPERATOR_PROBE_ADMIN_SECRET =
  process.env.OPERATOR_PROBE_ADMIN_SECRET ?? E2E_DEFAULT_WEB_ENV.OPERATOR_PROBE_ADMIN_SECRET;

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
  env.OPERATOR_PROBE_ADMIN_SECRET =
    process.env.OPERATOR_PROBE_ADMIN_SECRET ?? E2E_DEFAULT_WEB_ENV.OPERATOR_PROBE_ADMIN_SECRET;
  return env;
}
