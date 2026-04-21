# Survey read gating — operator runbook (production)

**Scope:** `GET /api/survey/visualization` and `GET /api/survey/approved-qualities` in **`NODE_ENV=production`**. These routes can return **attendee-linked PII**. Development builds skip the strict gate (open for local work).

## NODE_ENV and staging

[`checkSurveyReadGate`](../../src/lib/survey/survey-read-gate.ts) returns **allow** immediately when **`NODE_ENV` is not `production`** — no cookie or header checks. That matches **local dev** ergonomics but is a **foot-gun** for **staging** (or any internet-facing host) that loads **real** survey PII: the gate is effectively **off** unless you run with **`NODE_ENV=production`**. There is no separate “staging survey gate” env. Use production semantics on those hosts, or accept that visualization GETs are world-readable without the production matrix.

**Normative matrix:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) § Survey read endpoints. **Decision order (code):** [`survey-read-gate-logic.ts`](../../src/lib/survey/survey-read-gate-logic.ts) `decideSurveyReadAccess` — same order as `checkSurveyReadGate`.

## Why this matters

Automation and agents often carry **`x-alignment-context-key`** for **`/api/alignment-context`** and (unless split) **`/api/clarification-requests`**. That key is **high-value**: it mutates alignment data. **Survey visualization reads** are a **separate** blast radius: they expose cohort/quote PII to whoever passes the gate.

## Prefer least privilege (recommended)

| Goal | Prefer | Avoid |
|------|--------|--------|
| Scripts/agents need **read-only** survey viz or approved quotes | **`SURVEY_VISUALIZATION_API_SECRET`** + header **`x-survey-visualization-key`** | Reusing only the alignment key when you could issue a dedicated read secret |
| Public demo with no auth | **`SURVEY_VISUALIZATION_ALLOW_PUBLIC=true`** only on **trusted** hosts | Leaving allow-public on internet-facing production with real PII |

## Escape hatch: `ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ`

When set to **`true`**, a valid **`x-alignment-context-key`** (matching **`ALIGNMENT_CONTEXT_API_SECRET`**) **also** satisfies the production survey read gate—**in addition to** admin session and visualization key paths.

**Blast radius:** Anyone who obtains the **alignment** secret can read **survey PII** through the visualization endpoints **without** a separate visualization secret. **Default:** unset / false.

**Use only when:** One operational key **must** gate both alignment automation and survey reads (legacy or small-team constraint), and you accept that risk **explicitly**.

## Operator checklist (before enabling the escape hatch)

1. **Confirm** automation truly cannot send **`x-survey-visualization-key`** (separate **`SURVEY_VISUALIZATION_API_SECRET`**). If it can, **do not** enable `ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ`.
2. **Document** who holds `ALIGNMENT_CONTEXT_API_SECRET` and rotate it if it may have leaked.
3. **Verify** production gate with `npm run verify:survey-read-prod` ([`scripts/survey-read-gate-prod-smoke.mjs`](../../scripts/survey-read-gate-prod-smoke.mjs)) after any env change.
4. **Re-read** [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) quick reference row *Survey read escape hatch* and [OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md) § Scoped API secrets.

## Evaluation order (production)

1. If **`SURVEY_VISUALIZATION_ALLOW_PUBLIC=true`** → allow (public demo).
2. Else if **operator session** cookie → allow.
3. Else if **`ALIGNMENT_CONTEXT_KEY_ALLOWS_SURVEY_READ=true`** and alignment secret set and **`x-alignment-context-key`** matches → allow (**escape hatch**).
4. Else if **`SURVEY_VISUALIZATION_API_SECRET`** set and **`x-survey-visualization-key`** matches → allow (**preferred** machine path).
5. Else → **401** (deny).

Non-production always allows (development ergonomics); **staging with real PII** must use **`NODE_ENV=production`** if you want this gate — see **§ NODE_ENV and staging** above and [survey-read-gate.ts](../../src/lib/survey/survey-read-gate.ts).

## Related

- [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) — headers and quick reference.
- [`survey-read-gate-public-messages.ts`](../../src/lib/survey/survey-read-gate-public-messages.ts) — SSOT strings for `401` detail and capabilities hints.
