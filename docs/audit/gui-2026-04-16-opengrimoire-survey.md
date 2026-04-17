# GUI + agent-native audit — OpenGrimoire System 1 (survey / moderation)

**Date:** 2026-04-16  
**Scope:** Post–OA-FR-1 backlog surfaces: Sync Session (`/operator-intake`, `/survey` redirect), `POST /api/survey`, survey read APIs (`checkSurveyReadGate`), admin moderation APIs + AdminPanel UI, discovery (`GET /api/capabilities`, verify scripts).  
**Repo:** OpenGrimoire (local path varies by clone).

---

## AuditorSpec

- **App / repo:** OpenGrimoire
- **Branch / PR:** ad hoc audit (no single PR)
- **Environment:** local dev (`npm run dev`, default port 3001); E2E via Playwright `webServer`
- **Base URL:** `http://localhost:3001`
- **Critical routes:** `/operator-intake`, `/survey` (redirect), `/login`, `/admin` (moderation), `POST /api/survey`, `GET /api/survey/visualization`, `GET /api/survey/approved-qualities`, `GET /api/admin/moderation-queue`
- **Top 3 human jobs**
  1. Complete Sync Session and submit without dead ends.
  2. Sign in as operator and review / act on moderation queue.
  3. Understand what agents may call vs what requires an operator session (discovery).
- **CI / verify targets**
  - Lint / typecheck: `npm run lint`, `npm run type-check`
  - Unit: `npm run test` (includes `survey-read-gate-logic.test.ts`)
  - E2E: `npm run test:e2e` — `e2e/survey.spec.ts`, `e2e/admin-moderation.spec.ts`, `e2e/capabilities.spec.ts`, `e2e/clarification-queue.spec.ts` (alignment header when secret set)
  - Contract: `npm run verify` (capabilities, openapi, route-index, **`verify:moderation-auth`**)
  - A11y / visual: not run for this audit (gap)
- **Existing audit doc:** this file (first cut)
- **Parity / capability docs:** `src/app/api/capabilities/route.ts`, `docs/ARCHITECTURE_REST_CONTRACT.md`, `docs/plans/OA_FR_1_SYSTEM1_SURVEY_MODERATION.md`, `docs/agent/SYNC_SESSION_HANDOFF.md`
- **Notes:** Playwright sets `ALIGNMENT_CONTEXT_API_SECRET` for clarification + moderation negative tests; moderation routes use **operator session only** (`requireOpenGrimoireAdminRoute`). `checkSurveyReadGate` returns early in non-production before `cookies()` / session verification.

### BrowserReviewSpec (stub — extend before release gate)

| Field | Value |
|-------|--------|
| Base URL | `http://localhost:3001` |
| Auth | Operator: `/login` → placeholder password from `playwright.config.ts` `webServer.env.OPENGRIMOIRE_ADMIN_PASSWORD` (default `e2e-test-password`); survey POST unauthenticated |
| Viewports | Desktop 1280×720 minimum; add tablet when UI changes land |
| Flows | (1) `/operator-intake` full submit to success or error banner (2) `/survey` → redirect to `/operator-intake` (3) `/login` → `/admin` moderation panel with queue |
| Evidence to attach | Playwright HTML report path or `npx playwright test …` log; optional screenshots on failure |
| Stable selectors | Prefer `data-testid` from `SyncSessionForm` / admin tests (`e2e/survey.spec.ts`, `e2e/admin-moderation.spec.ts`) |

---

## Flow evidence (this audit pass)

Commands referenced from the authoring session (re-run before release sign-off):

- `npm run verify` (OpenGrimoire root) — lint, typecheck, Vitest, `verify:capabilities`, `verify:openapi`, `verify:route-index`, **`verify:moderation-auth`** — exit **0**.
- `npx playwright test e2e/survey.spec.ts e2e/admin-moderation.spec.ts e2e/clarification-queue.spec.ts e2e/auth-alignment-constellation.spec.ts e2e/capabilities.spec.ts` — **9 passed**, **2 skipped** (`SURVEY_POST_REQUIRE_TOKEN` gated tests).

---

## Product-scope (requirements / AC snapshot)

**Requirements**

1. Operators complete Sync Session submit; failures are intelligible.
2. Moderation list + PATCH work only with operator session; alignment automation header does **not** authorize moderation.
3. Production survey reads gated; dev avoids unnecessary cookie/session work on hot path.
4. Machine discovery (capabilities + verify) matches route auth behavior.
5. CI blocks moderation auth drift and exercises core API flows.

**Acceptance criteria (checklist)**

- [ ] Unauthenticated `PATCH /api/admin/moderation/:id` → **401** (E2E).
- [ ] Valid `x-alignment-context-key`, no session → moderation `PATCH` **401** (E2E with secret set).
- [ ] Authenticated `GET /api/admin/moderation-queue` → **200**, `items` contains seeded response with non-empty `unique_quality` (E2E).
- [ ] Non-production: `checkSurveyReadGate` does not call `cookies()` / `verifyAdminSessionToken` (implementation review: early `NODE_ENV !== 'production'` return before cookie read in `src/lib/survey/survey-read-gate.ts`).
- [ ] `npm run verify` includes passing **`verify:moderation-auth`**.
- [ ] `GET /api/capabilities` moderation routes include `operator_session_only_no_alignment_key` (E2E assertion in `e2e/capabilities.spec.ts`).

**Evidence map (AC → artifact)**

| AC | Primary evidence |
|----|-------------------|
| Moderation 401 unauth / alignment-only | `e2e/admin-moderation.spec.ts` (`patchNoCookie`, `patchAlignmentOnly`) |
| Moderation 200 queue + PATCH | Same file + `src/app/api/admin/moderation-queue/route.ts`, `src/app/api/admin/moderation/[responseId]/route.ts` |
| Read gate dev short-circuit | `src/lib/survey/survey-read-gate.ts` (early return); logic matrix `src/lib/survey/survey-read-gate-logic.test.ts` |
| verify hook | `package.json` scripts `verify`, `verify:moderation-auth`; implementation `scripts/verify-moderation-auth-purity.mjs` |
| Capabilities substring | `e2e/capabilities.spec.ts`; strings `src/app/api/capabilities/route.ts` |

---

## Dimension matrix

| # | Dimension | Status | Evidence |
|---|-------------|--------|----------|
| 1 | Task success | **PARTIAL** | Multi-step survey E2E + admin-moderation **API** E2E; **no** dedicated Playwright for moderation **UI** table after login in this audit cycle |
| 2 | Cognitive load | **PARTIAL** | Primary flows exist; operator-intake error copy for 401/429/503 / token gate not systematically reviewed |
| 3 | Accessibility | **PARTIAL** | **PASS** when axe (or equivalent) run attached with ≤ agreed violation budget; **FAIL** if critical violations; today: not executed — evidence gap |
| 4 | Visual system | **PARTIAL** | No Percy/Chromatic baseline or recorded visual review this pass; waive only with owner + date (none here) |
| 5 | A2UI / catalog | **PARTIAL (N/A product today)** | No A2UI catalog required until agent-rendered admin exists; **monitor:** new admin components must avoid appearance-only names and gain catalog rows if A2UI ships |
| 6 | Agent parity | **PARTIAL** | Strong: `capabilities` + `verify:moderation-auth`; moderation intentionally **excludes** alignment-key bypass — document clearly for harness authors |

---

## Automation vs gaps

| Layer | Present | Gap |
|-------|---------|-----|
| Static | ESLint, `tsc` | — |
| Contract | capabilities + openapi + route-index + moderation-auth script | Read-gate **detail** strings duplicated vs docs (drift risk) |
| Unit | `survey-read-gate-logic.test.ts` | No unit test for **impure** wrapper JSON shape (optional) |
| E2E | Survey flow, admin moderation API, capabilities, clarification | No **production** `NODE_ENV` survey-read E2E; optional `SURVEY_POST_REQUIRE_TOKEN` matrix off by default |
| A11y | — | Add axe-playwright on `/operator-intake`, `/admin` |
| Visual | — | Optional baselines if marketing polish |

---

## Architecture notes (external review)

- **Layering:** Public survey POST vs production read gate vs cookie-only moderation is coherent; capabilities document `operator_session_only_no_alignment_key` for moderation paths.
- **Risks:** E2E default secrets duplicated (`playwright.config.ts` vs `e2e/helpers/e2e-secrets.ts`); grep-based `verify-moderation-auth-purity.mjs` is fast but not AST-deep; SQLite + per-process limits bound horizontal scale until shared limiter + DB port.
- **Trajectory:** Storage port before Postgres/RLS; export APIs behind same read-gate family; keep capabilities/OpenAPI aligned in same PR families.

---

## Dimension action items

### 1 Task success

- [ ] Add Playwright: `loginAsAdmin` → `/admin` → wait for moderation **fetch** 200 (or visible table region) → assert at least one row when `GET /api/admin/moderation-queue` returns non-empty `items` (use stable `data-testid` if present on row container; otherwise assert heading + network idle contract documented in spec).

### 2 Cognitive load

- [ ] Copy audit on Sync Session form: network failure, rate limit (**429**), optional survey post token (**401**) — user-facing strings and recovery hints.

### 3 Accessibility

- [ ] Run axe-playwright (or BrowserStack accessibility MCP) on `/operator-intake` and `/admin`; ticket violations.

### 4 Visual system

- [ ] If UI changes land on intake or admin table, add or update visual regression baselines (Chromatic/Percy) in CI.

### 5 A2UI / catalog

- [ ] **Trigger for A2UI work:** first admin surface that is **agent-generated or declarative** (A2UI/A2A) — then add catalog semantics + props map per `.cursor/docs/A2UI_FRONTEND_DESIGN_GUIDANCE.md` (MiscRepos harness) or OG equivalent.
- [ ] Until then: PR review checklist item — no new decorative-only component names in `src/components/AdminPanel/` (or successor paths).

### 6 Agent parity

- [ ] When adding routes, update `capabilities/route.ts`, `ROUTE_INDEX`/generator, OpenAPI slice, and extend `verify:moderation-auth` if new admin surfaces must remain alignment-free.

---

## Agent-native condensed scores (desk review)

| Principle | Score | Notes |
|-----------|-------|--------|
| Action parity | ~65% | Agents mirror **API** flows with session or public POST; moderation **by design** rejects alignment header alone. |
| Capability discovery | ~80% | `GET /api/capabilities` + verify scripts; watch string drift across markdown. |
| Shared workspace | High | Same SQLite + HTTP surface for UI and scripts. |
| Other principles (tools/primitives, context injection, prompt-native, etc.) | N/A | No embedded agent runtime in server scope. |

---

## Critic / debate

### Round 1 — adversarial-document-reviewer (domain: `docs`)

Critic JSON (verbatim):

```json
{"intent_alignment":4,"safety":4,"correctness":4,"completeness":2,"minimality":4,"total":18,"pass":true,"issues":["Dimension 5 is marked N/A with a single forward-looking bullet—weak as a audited dimension row versus expecting explicit non-applicability criteria, monitors, and exit triggers.","No BrowserReviewSpec-style block (viewports, auth/session recipe, stable selectors, failure screenshots, artifact links).","Little primary flow evidence: no attached traces, screenshots, Playwright report URLs, or dated command outputs tying claims to runs.","Several behavioral claims (e.g., operator-only moderation, alignment header behavior, survey POST paths) lack consistent file:line or symbol pointers beyond a few citations.","The “Critic / debate” section promises JSON below but the file ends there—unfinished self-reference.","Dimension 4 marked PASS (assumed) without visual baselines or review notes conflicts with a evidence-first human GUI audit bar.","Task success PARTIAL cites missing moderation UI E2E but does not define minimal UI acceptance steps (selectors, loading/empty/error states).","A11y/visual explicitly not executed yet dimensions 2–3 carry PARTIAL status without documenting what evidence would flip them to PASS/FAIL."],"revision_suggestions":["Add a compact BrowserReviewSpec under AuditorSpec: base URL, auth steps, 2–3 viewports, must-hit routes, and where to attach screenshots/traces.","Replace assumed PASS on dimension 4 with FAIL/PARTIAL until baselines or a recorded visual review exists, or document the explicit waiver owner/date.","Expand dimension 5 with N/A justification plus monitoring checks (e.g., what would trigger A2UI work, which components would need catalog rows).","Link each major AC to a concrete evidence artifact (E2E spec + assertion name, or file:line for implementation review items).","Fill or delete the “Critic / debate” section; if keeping JSON, embed the critic output or link to a stable location.","Add a short “flow evidence” subsection listing commands actually run and their timestamps/exit codes, or state explicitly that none were run this pass."]}
```

### Revision log (debate round 1 → doc revise)

| When | Delta | Change |
|------|-------|--------|
| 2026-04-17 | +completeness | Added **BrowserReviewSpec** stub, **Flow evidence** (commands + pass/skip counts), tightened AC pointer to `survey-read-gate.ts`, matrix dims 3–5 aligned to critic (PARTIAL + pass criteria / monitor), expanded dimension-5 todos, embedded critic JSON |

### Round 2 — self-check (structural)

Second pass after edits: completeness raised by adding BrowserReviewSpec + flow evidence + dimension-5 monitor; **no second external critic JSON** (within max 2 rounds per dialectic; marginal gain expected). If promoting to **release gate**, re-run **adversarial-document-reviewer** on this path after substantive UI changes.

**Verdict:** `pass: true` for Round 1 JSON stands for **documentation structure**; **human GUI sign-off** still requires executing BrowserReviewSpec + a11y/visual evidence.

---

## Tracking (harness)

When this repo sits next to **MiscRepos** under a common parent (e.g. `GitHub/`):

- **Labeled todos:** `MiscRepos/.cursor/state/pending_tasks.md` — section **PENDING_OG_GUI_RELEASE** (`OG-GUI-*`, plus **OG-GUI-A2** A2UI monitor).
- **Waved decomposition:** `MiscRepos/local-proto/docs/WAVED_PENDING_TASKS.md` — **Wave 10 — OG GUI release (decomposed)** (R1 → R2 → R3 exit criteria).
- **Portfolio index:** `MiscRepos/docs/audit/GUI_AUDIT_PORTFOLIO_INDEX.md`.
