/**
 * Values must match `playwright.config.ts` `webServer.env` defaults
 * (and any CI overrides passed through `process.env`).
 */
export const E2E_ALIGNMENT_CONTEXT_API_SECRET =
  process.env.ALIGNMENT_CONTEXT_API_SECRET ?? 'e2e-playwright-alignment-secret';
