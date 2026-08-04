# E2E overlap audit — OpenGrimoire (2026-08-03)

**Purpose:** Inventory Playwright specs for unique vs overlapping coverage; record Phase B dedupe.

## Spec inventory

| Spec | Unique contract | Overlap notes |
|------|-----------------|---------------|
| `smoke.spec.ts` | Minimal `/` + `/brain-map` load | CI smoke only — keep |
| `og-gui-01-browser-review-evidence.spec.ts` | Screenshot + console dump for audit attach | Evidence-only; not nav duplicate of smoke |
| `theme-system.spec.ts` | prefers-color-scheme + storage | Unique |
| `capabilities.spec.ts` / `openapi.spec.ts` | API manifests | Unique |
| `survey.spec.ts` | Sync Session submit / bootstrap errors | Unique product |
| `sync-session-admin-a11y.spec.ts` | Axe × theme on intake + admin + observability | Shared axe helper with viz a11y |
| `visualization-constellation-a11y.spec.ts` | Axe × theme on viz/constellation (canvas excluded) | Shared axe helper |
| `visualization-constellation-keyboard.spec.ts` | Keyboard on constellation | Keep separate from a11y |
| `visualization-constellation-network-shape.spec.ts` | Network shape assertions | Keep separate |
| `visualization.spec.ts` / `visualization-mock-banner.spec.ts` | Viz product behavior | Distinct from a11y |
| `brain-map.spec.ts` / `brain-map-a11y-oa6.spec.ts` / `context-atlas.spec.ts` | Graph load / tab roles / atlas | OA-6 is roles/keyboard, not axe |
| `admin-moderation.spec.ts` / `operator-observability.spec.ts` / `clarification-queue.spec.ts` | Admin CRUD flows | Login via `helpers/admin-login` |
| `auth-alignment-constellation.spec.ts` | Login page render + alignment + constellation smoke | Inline password fill kept for login-page assertion |
| `autoresearch-detail*.spec.ts` | Autoresearch panels | Unique |
| `responsive-oa7.spec.ts` / `test-routes.spec.ts` / `visual-baselines-og-gui-06.spec.ts` | Responsive / test routes / Percy | Unique |

## Phase B changes (this pass)

1. **Extract** `e2e/helpers/axe.ts` — `violationSummary` + `expectNoAxeViolations` (optional `exclude`).
2. **Adopt** helper in `sync-session-admin-a11y.spec.ts` and `visualization-constellation-a11y.spec.ts` (removed duplicated local helpers).
3. **Clarify login:** `clarification-queue.spec.ts` now uses `loginAsAdmin` (was inline fill).
4. **No file merges** of viz constellation suites — intents differ (a11y vs keyboard vs shape).

## Verification (2026-08-03)

- `visualization-constellation-a11y.spec.ts`: 4/4 passed.
- `sync-session-admin-a11y.spec.ts`: 6/8 passed; both theme variants of `/admin/observability/[id]` failed on `POST /api/operator-probes/ingest` **503** (env/misconfig flake; unchanged ingest body vs pre-dedupe). Not introduced by axe helper extraction.
- `clarification-queue.spec.ts`: create API returned non-OK once (pre-login); loginAsAdmin path not reached — env flake, not login helper regression.

## CI script groups

`package.json` `test:e2e:a11y` unchanged (same file paths).
