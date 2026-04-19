# OA-FR-1 — System 1 Survey & moderation

**Harness ID:** OA-FR-1  
**Charter:** [SCOPE_OPENGRIMOIRE_FULL_REVIEW.md](./SCOPE_OPENGRIMOIRE_FULL_REVIEW.md) — System 1  
**Status:** Matrix + gaps + smoke (this document).  
**Normative contracts:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) · [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) · [SYNC_SESSION_HANDOFF.md](../agent/SYNC_SESSION_HANDOFF.md) · [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md)

---

## 1. Scope and surfaces

| Surface | Path / artifact | Role |
|---------|-----------------|------|
| Sync Session UI | [`src/app/operator-intake`](../../src/app/operator-intake) | Multi-step form; submits to `POST /api/survey` (see [e2e/survey.spec.ts](../../e2e/survey.spec.ts)). |
| Legacy URL | `/survey` | **308 → `/operator-intake`** via [`next.config.js`](../../next.config.js) `redirects`; internal links use `/operator-intake`. |
| Survey POST | [`src/app/api/survey/route.ts`](../../src/app/api/survey/route.ts) | Create attendee + survey response; public intake. |
| Bootstrap token | [`src/app/api/survey/bootstrap-token/route.ts`](../../src/app/api/survey/bootstrap-token/route.ts) | JWT for `x-survey-post-token` when `SURVEY_POST_REQUIRE_TOKEN` is on. |
| Visualization | [`src/app/api/survey/visualization/route.ts`](../../src/app/api/survey/visualization/route.ts) | PII-capable JSON; gated in production ([survey-read-gate.ts](../../src/lib/survey/survey-read-gate.ts)). |
| Approved qualities | [`src/app/api/survey/approved-qualities/route.ts`](../../src/app/api/survey/approved-qualities/route.ts) | Same read gate as visualization. |
| Admin moderation queue | [`src/app/api/admin/moderation-queue/route.ts`](../../src/app/api/admin/moderation-queue/route.ts) | `GET` — operator session only. |
| Admin moderation patch | `src/app/api/admin/moderation/[responseId]/route.ts` | `PATCH` — status `approved` \| `rejected` \| `pending`. |
| Admin debug survey | [`src/app/api/admin/debug-survey/route.ts`](../../src/app/api/admin/debug-survey/route.ts) | `GET` — operator session only; debug payload. |
| Operator login | `/login`, `POST /api/auth/login` | Issues signed session cookie (`opengrimoire_session`); see [OPENGRIMOIRE_ADMIN_ROLE.md](../admin/OPENGRIMOIRE_ADMIN_ROLE.md). |
| Admin UI | `/admin/*` | Moderation queue surfaced in admin panel (refetch on focus per ARCHITECTURE). |

**Body schema (POST):** [`src/lib/survey/schemas.ts`](../../src/lib/survey/schemas.ts) — `surveyPostBodySchema` (strict camelCase). **Questionnaire mapping:** [`src/lib/survey/mapAnswersToSurveyResponse.ts`](../../src/lib/survey/mapAnswersToSurveyResponse.ts) — today **`sessionType=profile`**, **`questionnaireVersion=v1`** with known `questionId` set (e.g. `tenure_years`, `learning_style`, intent categories).

---

## 2. Authorization and “RLS intent”

**Current product:** Survey and moderation data live in **local SQLite** (`OPENGRIMOIRE_DB_PATH`). There is **no Postgres row-level security (RLS)** in the supported path.

| Layer | What enforces access |
|-------|----------------------|
| **DB** | SQLite file permissions + backup discipline; **no RLS** — [PUBLIC_SURFACE_AUDIT.md](../security/PUBLIC_SURFACE_AUDIT.md) § Summary / Operator checklist item 3. |
| **Route handlers** | Survey POST: optional bootstrap token + Turnstile + Zod + rate limit ([OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md)). Survey reads: `checkSurveyReadGate`. Admin moderation + debug: `requireOpenGrimoireAdminRoute()` ([admin-auth.ts](../../src/lib/alignment-context/admin-auth.ts)). |

**Intent for “RLS” in backlog language:** Treat **RLS** as *database-enforced* row policies. Until a migration to Postgres (or another store with RLS) is an explicit product decision, **authorization intent** is **app-layer only** and must stay documented in ARCHITECTURE + this matrix. If Postgres is adopted later, add an ADR: which tables get RLS, how service vs operator sessions map, and how route handlers shrink.

---

## 3. Requirements and acceptance criteria

### REQ-S1.1 — Sync Session submit (`POST /api/survey`)

| ID | Requirement | Acceptance criteria (observer) |
|----|-------------|--------------------------------|
| S1.1.1 | Valid body persists one attendee and one survey response. | **200** JSON includes `success: true`, `attendeeId`, `surveyResponseId`, `harnessProfileId` (nullable). See [SYNC_SESSION_HANDOFF.md §7](../agent/SYNC_SESSION_HANDOFF.md). |
| S1.1.2 | Invalid body returns structured errors. | **400** with validation issues; mapping failures return **400** with `message`/`field` per route implementation. |
| S1.1.3 | Abuse controls configurable. | With `SURVEY_POST_REQUIRE_TOKEN=true`, missing/invalid **`x-survey-post-token`** → **401**; Turnstile when enforced → **400**/ **503** per [SYNC_SESSION_HANDOFF §7](../agent/SYNC_SESSION_HANDOFF.md). |
| S1.1.4 | Rate limit applied. | Burst `POST /api/survey` beyond middleware window → **429** + `Retry-After` ([ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) § Survey POST rate limiting). |

### REQ-S1.2 — Survey reads (visualization + approved qualities)

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| S1.2.1 | Production gate for PII endpoints. | In **`NODE_ENV=production`**, unauthenticated `GET` to visualization/approved-qualities is denied unless one of: operator session, `x-survey-visualization-key`, alignment escape hatch, or explicit public demo flag — per ARCHITECTURE § Survey read endpoints. |
| S1.2.2 | Development ergonomics. | Non-production: endpoints usable for local dev without keys (documented risk). |

### REQ-S1.3 — Operator admin auth

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| S1.3.1 | Admin API routes require session. | `GET /api/admin/moderation-queue`, `PATCH /api/admin/moderation/:id`, `GET /api/admin/debug-survey` return **401** without valid `opengrimoire_session` cookie. |
| S1.3.2 | Login throttled. | `POST /api/auth/login` rate limited per ARCHITECTURE (429 semantics). |

### REQ-S1.4 — Moderation queue

| ID | Requirement | Acceptance criteria |
|----|-------------|---------------------|
| S1.4.1 | Operator can list queue. | Authenticated `GET /api/admin/moderation-queue` returns JSON `{ items: [...] }` with `Cache-Control: private, no-store`. |
| S1.4.2 | Operator can update moderation state. | Authenticated `PATCH` with body `{ "status": "approved" \| "rejected" \| "pending", "notes"?: string }` returns `{ moderation: row }` or **4xx/5xx** on failure. |
| S1.4.3 | No public agent header bypass. | `x-alignment-context-key` does **not** authorize moderation routes — [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) § Moderation note. |

---

## 4. Gap list (vs code + public audit)

| Gap ID | Description | Severity | Source |
|--------|-------------|----------|--------|
| G-S1-01 | Client visualization path historically logged survey row samples (PII). | Critical (remediated) | **PUBLIC_SURFACE_AUDIT F1** — verify gated logs: load `/visualization` in dev; no row dumps in default build ([useVisualizationData.ts](../../src/components/DataVisualization/shared/useVisualizationData.ts)). |
| G-S1-02 | Verbose `console.*` in visualization client. | Medium | **F4** — same debug gate as F1. |
| G-S1-03 | `console.error` may log full `Error` objects. | Medium | **F5** — spot-check on forced failures. |
| G-S1-04 | Survey read endpoints require correct production env matrix. | Medium (ops) | **PUBLIC_SURFACE_AUDIT** operator checklist items 5–6; misconfiguration exposes PII or breaks demos. |
| G-S1-05 | `POST /api/survey` rate limit is per-process only. | Medium (scale-out) | **ARCHITECTURE** + OPERATIONAL_TRADEOFFS — multi-instance needs shared limiter or edge/WAF. |
| G-S1-06 | No dedicated Playwright test for **moderation-queue** API (survey UI covered). | Low (closed) | **Code** — covered by [e2e/admin-moderation.spec.ts](../../e2e/admin-moderation.spec.ts) + [e2e/survey.spec.ts](../../e2e/survey.spec.ts) for `/operator-intake`. |

---

## 5. Verification and smoke checklist

### 5.1 Preconditions

- From OpenGrimoire repo root: `npm install`, `npm run dev` (default **http://localhost:3001**).
- Optional: `OPENGRIMOIRE_ADMIN_PASSWORD` / session for admin steps (see [playwright.config.ts](../../playwright.config.ts) for CI pattern).

### 5.2 curl / PowerShell (anonymous dev submit)

When **bootstrap token and Turnstile are off** (typical local dev), a **minimal** `profile` / `v1` body must include at least one valid `answers` row with known `questionId`s:

```powershell
$base = "http://localhost:3001"
Invoke-WebRequest -Uri "$base/api/capabilities" -UseBasicParsing | Select-Object StatusCode

$body = @{
  firstName = "Smoke"
  lastName = "Test"
  isAnonymous = $true
  sessionType = "profile"
  questionnaireVersion = "v1"
  answers = @(
    @{ questionId = "tenure_years"; answer = "3" }
    @{ questionId = "learning_style"; answer = "visual" }
  )
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "$base/api/survey" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing
```

Expect **200** and JSON containing `attendeeId` and `surveyResponseId`.

**If `SURVEY_POST_REQUIRE_TOKEN=true`:** `GET $base/api/survey/bootstrap-token` → read `token` → add header `x-survey-post-token: <token>` to `POST`.

**If Turnstile enforced:** UI path or include `turnstileToken` in body per server config ([OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md)).

### 5.3 Survey read smoke (dev vs prod)

- **Development:** `GET http://localhost:3001/api/survey/visualization` may return **200** without cookie (open by design).
- **Production:** same request without gate → **401/403** per `checkSurveyReadGate`; with operator session or `x-survey-visualization-key` → **200** (document exact header in operator runbook — [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md)).

### 5.4 Admin moderation (browser-first)

Moderation routes require **operator session cookie**; easiest smoke:

1. Log in via `/login` in browser.
2. Open DevTools → fetch `/api/admin/moderation-queue` (same origin, credentials included) → **200** + `items`.
3. `PATCH /api/admin/moderation/<surveyResponseId>` with JSON `{ "status": "pending" }` → **200** or documented error if id invalid.

**curl note:** Session cookie is HttpOnly; for scripted checks use Playwright or save cookie jar from login response per operator security practice.

### 5.5 Optional Playwright

- `npm run test:e2e -- e2e/survey.spec.ts` — multi-step `/operator-intake` through submit ([survey.spec.ts](../../e2e/survey.spec.ts)); optional `SURVEY_POST_REQUIRE_TOKEN` matrix exercises bootstrap token tests in the same file.
- `npm run test:e2e -- e2e/admin-moderation.spec.ts` — moderation queue + PATCH + 401 negatives ([admin-moderation.spec.ts](../../e2e/admin-moderation.spec.ts)).
- Full suite: `npm run test:e2e` (requires env from `playwright.config.ts`).

---

## 6. Related

- [OPENGRIMOIRE_SYSTEMS_INVENTORY.md](../OPENGRIMOIRE_SYSTEMS_INVENTORY.md) — persistence + `/operator-intake` row.  
- [MiscRepos pending_tasks — OPENGRIMOIRE_FULL_REVIEW](../../../MiscRepos/.cursor/state/pending_tasks.md) — mark OA-FR-1 **done** when this matrix is accepted.

---

## 7. Changelog

| Date | Change |
|------|--------|
| 2026-04-16 | Initial OA-FR-1 matrix: surfaces, RLS intent, REQ/AC, gaps, smoke. |
| 2026-04-16 | Backlog P1–P5: moderation E2E, verify script, read-gate logic tests, `/survey` redirect, OA §8 closure. |
| 2026-04-18 | **MiscRepos Wave 10 (R1–R3)** revalidated: commands + AC parity logged in [gui-2026-04-16-opengrimoire-survey.md](../audit/gui-2026-04-16-opengrimoire-survey.md) § Flow evidence / § Acceptance criteria; harness row **OG-WAVE10-EXIT** → [completed_tasks.md § PENDING_OG_GUI_RELEASE](../../../MiscRepos/.cursor/state/completed_tasks.md). |

---

## 8. Backlog closure (P1–P5 / R1–R5 / AC1–AC3)

| Track | Done when |
|-------|-----------|
| **R1** `/survey` hygiene | `next.config.js` redirects `/survey` → `/operator-intake`; admin clarification link + docs use canonical `/operator-intake`. |
| **R2** (implicit) survey E2E | [e2e/survey.spec.ts](../../e2e/survey.spec.ts) asserts `POST /api/survey` JSON shape; `/survey` redirect smoke. |
| **R3** moderation E2E | [e2e/admin-moderation.spec.ts](../../e2e/admin-moderation.spec.ts): seed, queue, PATCH, 401 without cookie, 401 with `x-alignment-context-key` only. |
| **R4** read-gate unit matrix | [survey-read-gate-logic.ts](../../src/lib/survey/survey-read-gate-logic.ts) + [survey-read-gate-logic.test.ts](../../src/lib/survey/survey-read-gate-logic.test.ts); `checkSurveyReadGate` delegates to pure helper. |
| **R5** multi-instance POST limits | [OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md) Survey POST row — horizontal replicas / WAF. |
| **AC1** alignment key ≠ moderation auth | E2E negative + `requireOpenGrimoireAdminRoute` only on moderation routes. |
| **AC2** survey POST contract | E2E JSON assertions; optional gated `SURVEY_POST_REQUIRE_TOKEN` tests when enabled on webServer. |
| **AC3** capabilities honesty | `npm run verify:moderation-auth` — [verify-moderation-auth-purity.mjs](../../scripts/verify-moderation-auth-purity.mjs) + capabilities substring `operator_session_only_no_alignment_key`. |
