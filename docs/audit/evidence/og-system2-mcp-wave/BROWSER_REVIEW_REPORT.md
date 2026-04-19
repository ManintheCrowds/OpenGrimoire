# BrowserReviewReport — OpenGrimoire System 2 (MCP hardening wave)

**Date:** 2026-04-18  
**Spec:** [gui-2026-04-16-opengrimoire-data-viz.md](../../gui-2026-04-16-opengrimoire-data-viz.md) § **BrowserReviewSpec**  
**Protocol:** MiscRepos `.cursor/skills/browser-review-protocol` (BrowserReviewReport shape)

## Flow results

| Flow | Result | Notes |
|------|--------|-------|
| 1. `/visualization` first paint | **PASS (CI substitute)** | Covered by `e2e/visualization.spec.ts`; run locally when dev server on `:3001`. |
| 2. `/constellation` vs `all=0` semantics | **PASS (CI substitute)** | Same suite + architecture notes in audit doc; explicit cross-route network assertion remains **OGAN-16**. |
| 3. `/test-chord` dev / prod gate | **PASS (contract)** | Middleware + `OPENGRIMOIRE_ALLOW_TEST_ROUTES` documented in OA-FR-2 / `middleware.ts`; no live prod URL exercised here. |

## Evidence

- **Playwright (executed 2026-04-18):** `npx playwright test e2e/visualization.spec.ts e2e/test-routes.spec.ts` — **7 passed** (Chromium, dev `webServer`).
- **Desk:** Audit matrix in `gui-2026-04-16-opengrimoire-data-viz.md` unchanged except BrowserReviewSpec + this report.

## Console

- **Not sampled live** in automation wave. When executing manually: use browser devtools or Playwright trace; treat unexpected errors on `/visualization` or `/constellation` as **FAIL** for that flow.

## Failed network

- None recorded (no live session). If `npm run dev` is down, flows are **BLOCKED** until server is up.

## Blockers

- None for documentation closure. **Harness:** ensure MiscRepos is workspace root so `${workspaceFolder}` MCP paths resolve ([MCP_SERVERS.md](../../../../../MiscRepos/local-proto/docs/MCP_SERVERS.md)).

## Backlog cross-links

- **OGAN-15** — axe on `/visualization` + `/constellation`  
- **OGAN-16** — E2E assert differing query shapes vs `/visualization`  
- **OG-GUI-AUDIT-03** — keep `npm run verify` before merge (process)  
- **OG-DV-UI-02** — A2UI on constellation shell  

Source table: [MiscRepos `.cursor/state/pending_tasks.md`](../../../../../MiscRepos/.cursor/state/pending_tasks.md) § PENDING_AGENT_NATIVE / PENDING_OPENGRIMOIRE_GUI_AUDIT_FOLLOWUPS.
