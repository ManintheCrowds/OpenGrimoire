# OpenGrimoire — full review refresh (since 2026-04-16)

**Harness window:** Product-scope refresh per [SCOPE_OPENGRIMOIRE_FULL_REVIEW.md](./SCOPE_OPENGRIMOIRE_FULL_REVIEW.md) — baseline charter **2026-04-16**; this document captures **delta + reverification** through **2026-04-17**.  
**Repo HEAD (OpenGrimoire):** `18111c9` — *docs(survey): OA scope charter, FR matrices, read-gate, e2e* (child of `31c9ca0` OA-FR-SCOPE charter commit).  
**MiscRepos:** task-state commits after 2026-04-16 (OA-FR rows marked done); no OpenGrimoire code changes required in MiscRepos for this slice.

---

## 1. Delta inventory (code → system mapping)

| Area | Systems | Risk / note |
|------|---------|-------------|
| `src/lib/survey/survey-read-gate-logic.ts` + `.test.ts` | **1** | Pure production read-gate extracted for unit tests; ordering aligned with `checkSurveyReadGate`. |
| `src/lib/survey/survey-read-gate.ts` | **1** | Wires gate to cookies/headers/env. |
| `e2e/survey.spec.ts` (bootstrap token), `e2e/helpers/*`, `playwright.config.ts` | **1**, **X** | E2E coverage for `SURVEY_POST_REQUIRE_TOKEN` negative/positive paths; webServer env defaults for alignment + survey secrets. |
| `scripts/verify-moderation-auth-purity.mjs` | **1**, **4** | CI guard: moderation must not treat alignment header as auth. |
| `src/app/api/capabilities/route.ts` | **3**, **2**, **X** | `workflows[]` documents brain-map, wiki mirror, cohort viz + **refresh semantics** (CustomEvent). |
| `docs/plans/OA_FR_1_*`, `OA_FR_2_*`, `SCOPE_*` tweaks | **X** | Matrices and charter cross-links. |
| `docs/AGENT_INTEGRATION.md`, `docs/AGENT_NATIVE_AUDIT_*` edits | **2**, **6** | Documents survey→viz coordination via `opengrimoire-survey-data-changed`. |
| `e2e/admin-moderation.spec.ts` | **1** | API-first moderation flow + 401 cases. |

**Unchanged in this delta but reverified:** Systems **3** (context-atlas E2E, capabilities `ui_path`), **4** (alignment routes; prior commit history already closed admin PATCH/CLI gaps per harness narrative).

---

## 2. Product-scope — REQ / AC / gaps / verification (delta + spot checks)

### 2.1 System 1 — Survey & moderation (delta)

| ID | Requirement (delta) | Acceptance criteria | Gap | Verification |
|----|---------------------|----------------------|-----|----------------|
| **REQ-S1.RG** | Production survey read decision is testable without Request/cookies. | Vitest covers `decideSurveyReadAccess` for dev bypass, public demo flag, admin session, alignment-key escape hatch, viz secret header, deny path. | None observed. | `npm run test` (includes `survey-read-gate-logic.test.ts`). |
| **REQ-S1.E2E-POST** | Optional strict POST token path is E2E-proven. | With `SURVEY_POST_REQUIRE_TOKEN=true`, missing token → **401**; valid bootstrap token → **200**. | Env must be set in CI/staging deliberately; local default remains off. | `npm run test:e2e` — `Survey POST bootstrap token` describe in `e2e/survey.spec.ts`. |

**80% observer (System 1 delta):** (1) Open `survey-read-gate-logic.test.ts` and confirm denied vs allowed reasons match `.env.example` comments for production survey reads. (2) Run `npm run test:e2e` and confirm the two bootstrap-token tests pass when Playwright starts `npm run dev` via config. (3) Run `npm run verify:moderation-auth` and confirm exit 0 — moderation handlers do not use alignment key as session substitute.

**Spot check (unchanged critical):** REQ-S1.1 submit path still matches [OA_FR_1](./OA_FR_1_SYSTEM1_SURVEY_MODERATION.md) — `npm run test:e2e` Sync Session flow covers multi-step submit.

### 2.2 System 2 — Data visualization (spot + doc alignment)

**Code reality (already on branch, predates narrow git delta):** `useVisualizationData` and `useApprovedQuotes` listen for `OPENGRIMOIRE_SURVEY_DATA_CHANGED` and bump `refreshToken` to refetch — see `src/lib/survey/survey-data-change-event.ts` and [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md).

| ID | Requirement | AC | Gap | Verification |
|----|-------------|----|-----|--------------|
| **REQ-S2.VIZ-REF** | Open `/visualization` picks up new approved rows without full reload when app dispatches survey-data event. | After moderation or successful survey POST, network shows second `GET` to visualization + approved-qualities when event fired (same tab or admin→viz). | External harness writing SQLite directly must **dispatch the same CustomEvent** or call APIs then reload — documented, not automatic. | OA-FR-2 manual step §6 + `npm run test:e2e` smoke on viz mount (diagram present). |

**80% observer (System 2):** (1) With dev server and two tabs (`/admin` + `/visualization`), approve a response and confirm visualization refetches (Network panel). (2) Confirm `data-testid="opengrimoire-viz-mock-data-banner"` appears when API returns empty rows per OA-FR-2. (3) Confirm `GET /api/capabilities` includes `workflows[].id === 'cohort_survey_visualization'` with refresh string referencing the CustomEvent.

### 2.3 System 3 — Brain map / context atlas (spot)

**80% observer:** (1) `GET /api/capabilities` lists workflow `opencompass_brain_map` with `ui_path: /context-atlas`. (2) `npm run test:e2e` passes `e2e/context-atlas.spec.ts` and `e2e/brain-map.spec.ts` (redirect `/brain-map` → `/context-atlas`). (3) Follow [MiscRepos/docs/BRAIN_MAP_HUB.md](../../../MiscRepos/docs/BRAIN_MAP_HUB.md) § System 3 REQ/AC for parser→JSON→API→UI.

### 2.4 System 4 — Alignment & operator APIs (spot)

**80% observer:** (1) `npm run verify:moderation-auth` passes. (2) `GET /api/capabilities` lists alignment routes with `x-alignment-context-key` hint. (3) Follow [OA_FR_4](./OA_FR_4_SYSTEM4_ALIGNMENT_OPERATOR_APIS.md) curl/CLI verification table.

### 2.5 Cross-cutting (OA-FR-X)

| Check | Result (2026-04-17) | Tier |
|-------|---------------------|------|
| `npm run verify` | **PASS** (ESLint warnings only, no errors; Vitest 42/42; capabilities + OpenAPI + route-index + moderation-auth scripts OK) | **Warn** — treat hook-deps warnings as backlog unless CI promotes to error. |
| `npm run test:e2e` (Playwright `webServer` per `playwright.config.ts`) | **34 passed**, **2 skipped** | **Block** for release if skipped tests cover mandatory SKU (document skip reason in spec). |
| Raw `npx playwright test` without `webServer` | **Fails** (`ERR_CONNECTION_REFUSED`) | **Doc** — not CI parity; operators must use `npm run test:e2e` or `npm run verify:e2e`. |

---

## 3. AuditorSpec (gui-human-audit)

| Field | Value |
|-------|--------|
| **App / repo** | OpenGrimoire (Next.js 14 App Router), clone `OpenGrimoire` |
| **Environment** | Local `npm run dev` **port 3001**; E2E uses same via Playwright `webServer` |
| **Base URL** | `http://localhost:3001` |
| **Critical routes** | `/operator-intake`, `/visualization`, `/context-atlas`, `/wiki`, `/login`, `/admin`, `/admin/alignment`, `/admin/clarification-queue` |
| **Top 3 operator jobs** | (1) Submit Sync Session → see cohort viz update. (2) Moderate queue → approved data visible. (3) Context atlas + optional wiki mirror for SSOT orientation. |
| **Verify commands** | `npm run verify`; `npm run test:e2e`; `npm run verify:moderation-auth` |
| **Prior GUI audits** | [gui-2026-04-16-opengrimoire-survey.md](../audit/gui-2026-04-16-opengrimoire-survey.md), [gui-2026-04-16-opengrimoire-data-viz.md](../audit/gui-2026-04-16-opengrimoire-data-viz.md) |

---

## 4. GUI human audit — dimension matrix

| # | Dimension | Status | Evidence |
|---|-----------|--------|----------|
| 1 | Task success | **PARTIAL** | E2E covers smoke + admin paths; mock-data banner for empty API; external DB writers need explicit event. |
| 2 | Cognitive load | **PASS** | Sync Session rename + canonical `/operator-intake`; admin nav grouped. |
| 3 | Accessibility | **PARTIAL** | `e2e/brain-map-a11y-oa6.spec.ts` + `responsive-oa7.spec.ts` pass; full WCAG scan backlog **BM-A11Y** (MiscRepos pending_tasks). |
| 4 | Visual system | **PASS** | Existing token/settings patterns on viz; no new one-off theme in this delta. |
| 5 | A2UI / catalog | **PARTIAL** | `data-region` / `data-testid` preserved; D3/Three surfaces remain code-first, not JSON-catalog components. |
| 6 | Agent parity | **PARTIAL** | Capabilities + OpenAPI verification green; strict action parity for Three/chord still browser-heavy per agent-native audit. |

---

## 5. Dimension action items (required)

### 1 — Task success

- [x] ~~Add Playwright spec that **dispatches `opengrimoire-survey-data-changed`** (or uses real POST + moderation) and asserts second `GET` to `/api/survey/visualization`**~~ — **Waived (2026-04-23)** — operator doc sign-off; see [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) § *OGAN backlog — closure policy* row **OGAN-01** (harness **AN1** closure).

### 2 — Cognitive load

- [ ] In operator docs, one diagram: **when to use `/wiki` vs vault** (link [WIKI_MIRROR.md](../WIKI_MIRROR.md)) to reduce SSOT confusion.

### 3 — Accessibility

- [ ] Run BrowserStack `accessibilityExpert` on `/context-atlas` + `/visualization` when credentials available; append to [BRAIN_MAP_AUDIT.md](../../../MiscRepos/docs/BRAIN_MAP_AUDIT.md) per **BM-A11Y**.

### 4 — Visual system

- [ ] Track **ESLint `react-hooks/exhaustive-deps` warnings** on Alluvial/Chord as optional Warn-tier gate — fix or suppress with comment per component policy.

### 5 — A2UI / catalog

- [ ] Export stable **selector map** (`vizLayoutIds`, `data-testid` for moderation + viz) into `docs/AGENT_INTEGRATION.md` appendix for harnesses (OGAN-17 alignment).

### 6 — Agent parity

- [ ] Document **“raw `playwright test` is not supported”** in [CONTRIBUTING.md](../../CONTRIBUTING.md) or [docs/engineering/DEPLOY_AND_VERIFY.md](../engineering/DEPLOY_AND_VERIFY.md) — parity with CI command `npm run verify:e2e`.

---

## 6. Frontend A2UI + design (Module C)

- **Semantic naming:** `SyncSessionForm` rename (from SurveyForm) aligns with purpose-driven naming — **good** for A2UI catalog tone.
- **Tokens:** No new hardcoded palette in delta files; viz continues theme via existing settings — **PASS** vs A2UI anti-slop.
- **Module C:** Admin clarification-queue copy/layout unchanged in delta; alignment with existing admin cards — **no regression flagged**.

---

## 7. Agent-native refresh summary (see canonical file)

Detailed numeric refresh is appended to [AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md](../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md) § *Refresh 2026-04-17*.

---

## 8. Critic / debate (integration, docs domain)

**Artifact:** this file. **Protocol:** single-pass self-critic (human `/debate` optional follow-up).

### Critic report JSON (synthetic)

```json
{
  "pass": true,
  "domain": "docs",
  "threshold": "completeness_for_refresh_cycle",
  "dimensions": {
    "completeness": "PASS — delta table, per-system AC, verification tiers, GUI matrix + six dimension todos",
    "accuracy": "PASS — verify + e2e executed; raw playwright footgun documented",
    "traceability": "PASS — links to OA_FR matrices, AGENT_INTEGRATION, BRAIN_MAP_HUB",
    "actionability": "PASS — dimension todos map to OGAN/BM-A11Y or new Playwright work",
    "safety": "PASS — no secrets; env names only"
  },
  "disputes": []
}
```

### Revision log

| Round | Change |
|-------|--------|
| 0 | Initial refresh draft from repo inspection + `npm run verify` / `npm run test:e2e`. |
| 1 | Added cross-cutting note: `npx playwright test` without `webServer` fails; CI parity = `npm run test:e2e`. |

---

## 9. References

- [SCOPE_OPENGRIMOIRE_FULL_REVIEW.md](./SCOPE_OPENGRIMOIRE_FULL_REVIEW.md)  
- [OA_FR_X_CROSS_CUTTING_GO_LIVE.md](./OA_FR_X_CROSS_CUTTING_GO_LIVE.md)  
- [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md)  
- [MiscRepos `.cursor/state/pending_tasks.md`](../../../MiscRepos/.cursor/state/pending_tasks.md) § OPENGRIMOIRE_FULL_REVIEW  
