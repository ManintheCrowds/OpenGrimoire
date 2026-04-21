# Sync Session — operator interview, model elicitation, and harness handoff

**Audience:** Operators and Cursor agents using **OpenGrimoire** for intent elicitation plus the **MiscRepos** harness (handoff, session snapshot, vault export).

**SSOT:** This file is the canonical **Sync Session** and **interviewing** guide for the OpenGrimoire + harness workflow. MiscRepos documents **bridge, env, and vault paths** in [`INTENT_ELICITATION_AND_OG.md`](../../../MiscRepos/docs/agent/INTENT_ELICITATION_AND_OG.md); defer the full ritual here.

**Clone layout:** Links to MiscRepos use `../../../MiscRepos/...` from this repo. That assumes **OpenGrimoire** and **MiscRepos** are sibling folders under the same parent (e.g. `GitHub/OpenGrimoire` and `GitHub/MiscRepos`). If your layout differs, open the linked paths from your harness checkout.

**Related:** [INTEGRATION_PATHS.md](./INTEGRATION_PATHS.md) (HTTP parity, intent ledger) · [INTENT_LEDGER_API.md](./INTENT_LEDGER_API.md) · [ELICITATION_EXPORT_CONTRACT.md](./ELICITATION_EXPORT_CONTRACT.md) · [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) · [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) (survey rows) · [engineering/OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md) · MiscRepos [SESSION_SNAPSHOT_TEMPLATE.md](../../../MiscRepos/docs/agent/SESSION_SNAPSHOT_TEMPLATE.md) · [HANDOFF_FLOW.md](../../../MiscRepos/.cursor/HANDOFF_FLOW.md)

**Normative split:** **This doc** = Sync Session *meaning*, interviewing ritual, **OG-owned IDs and survey POST behavior**, and harness correlation. **OPERATIONAL_TRADEOFFS** = implementation tradeoffs and handler order. **ARCHITECTURE_REST_CONTRACT** = entity × route × auth matrix.

---

## 1. What a Sync Session is

A **Sync Session** is a time-boxed alignment pass that reduces drift between:

- **Model / chat state** — what the assistant assumes vs what is still true in the thread or repo.
- **Time** — deadlines, “today,” knowledge cutoff vs wall clock.
- **External context** — facts that need a live check (docs, API, web) vs transcript-only.
- **User intent** — definition of done, scope, non-goals.
- **Operator context** — rhythms, constraints, risk tolerance (often captured in OpenGrimoire over time).

It has **two tracks** in one conversation (or back-to-back): **Track A** interviews the **operator**; **Track B** elicits **testable claims** from the **model** (epistemic self-report, not “what do you believe”).

---

## 2. When to run it

| Cadence | Time | Use |
|---------|------|-----|
| **Session start** | 2–5 min | Goal, constraints, environment, definition of done; optional OG pointer block. |
| **Mid-session** | 2–4 min | When task frame, repo, or goal type changes; or every ~20–40 min in long threads. |
| **Session end** | 3–7 min | Decisions, open questions, verified vs speculative facts, snapshot/handoff updates. |
| **Weekly** | 5–15 min | Governance ritual: micro-elicitation in OG + skim vault `Interview-Archive/`; optional full Sync script below. |

Initial **big interview** in OpenGrimoire UI remains separate (often **45+** minutes of focused elicitation); see MiscRepos INTENT doc § five layers.

---

## 3. Five elicitation layers (Track A — operator)

Map questions to the same layers used in OG survey design (full storage contract in MiscRepos INTENT):

1. **Operating rhythms** — Real daily / weekly cadence; what “this week” means for you.
2. **Recurring decisions** — Easy vs hard judgment calls relevant to the current goal.
3. **Inputs and data sources** — What you trust (dashboards, repos, tickets); what needs a fresh fetch.
4. **Dependencies** — Who or what must sign off; what “done” means per handoff.
5. **Friction points** — Where agents or tools usually misalign with you.

**Add for this session:** **Time** (deadlines, time zones), **external checks** (what must be verified outside the thread), **definition of done** and **explicit non-goals**.

---

## 4. Track B — “interviewing” the model (epistemic)

Treat the assistant as a **policy over text**, not a teammate with private mental states. Elicit **claims you can verify**.

1. **Assumptions** — List; tag each: `transcript` | `file` | `general` | `guess`.
2. **Unknowns** — List; for each, name the **smallest verification** (command, URL, file read).
3. **External claims** — Separate **tool-grounded this session** vs **speculative**.
4. **Optional pre-mortem** — “It is [date] and this effort failed. Most plausible causes given our current plan?”
5. **Disagreement** — If intent diverges, state one **testable** disagreement and how to falsify it.

**Anti-patterns:** Leading questions (“So X is the root cause, right?”); declaring alignment without a written brief; skipping unknowns.

---

## 5. Paste blocks

### 5.1 Minimal (about 3 minutes)

```text
SYNC — quick
Operator: Definition of done in one sentence + one non-goal. Any deadline this week?
Operator: Which of [rhythms | decisions | inputs | dependencies | friction] matters most for the next hour?
Model: List up to 5 assumptions; tag each transcript | file | general | guess. List unknowns + one verification step each.
Exit: Update session snapshot / handoff pointers; ping OG if intent-related (GET /api/capabilities).
```

### 5.2 Full (about 15–20 minutes)

```text
SYNC — full
1) Ground: Paste CURRENT CONTEXT (branch, paths, last command output if relevant). Operator confirms or corrects.
2) Track A — Layers: For each of rhythms, decisions, inputs, dependencies, friction — one sentence or “skip.”
3) Time + external: Deadlines; what must be checked live vs can stay from context?
4) Intent: Definition of done; success violations; autonomy level (draft vs recommend vs act-with-gate).
5) Track B — Model: Assumptions + tags; unknowns + verifiers; speculative vs grounded; optional pre-mortem.
6) Decisions: Top 3 next actions + who verifies + stop condition if checks fail.
7) Exit: Fill harness yaml (see §8); refresh OG excerpt when healthy; no confidential narrative in git.
```

---

## 6. OpenGrimoire-owned identifiers and lifecycle

These definitions stay true **even if MiscRepos or the vault bridge were removed**; harnesses are consumers of the same facts.

### 6.1 `attendeeId` (API) / `attendees.id` (storage)

- **What it is:** Stable UUID for the **person row** created (or reused per app rules) when a survey is submitted.
- **What it is for:** Anchors **all** survey responses for that attendee, **`GET /api/intent-ledger/:attendeeId`**, and merged **intent** read models that combine Sync Session data with clarification and alignment planes ([INTENT_LEDGER_API.md](./INTENT_LEDGER_API.md)).
- **Harness use:** Store in session snapshot / handoff when you need **per-person** continuity across multiple responses or ledger polls.

### 6.2 `surveyResponseId` (API) / `survey_responses.id` (storage)

- **What it is:** Stable UUID for **one completed Sync Session submission** (`POST /api/survey` success).
- **What it is for:** Correlation for **export bridges**, tombstones (`REVOKED-<id>.md`), excerpt refresh, and “this specific interview run” without conflating later responses from the same attendee.
- **Harness use:** Primary key for “which OG snapshot row” in vault exports and git-safe pointers; pairs with `attendeeId` when both are returned.

### 6.3 Survey lifecycle (minimal)

1. **Submit** — `POST /api/survey` creates `attendees` + `survey_responses` (and mapped answer payload). Returns IDs (§7).
2. **Read model** — Intent ledger merges this plane with clarification + alignment events ([INTENT_LEDGER_API.md](./INTENT_LEDGER_API.md) § Canonical intent event shape; `source: sync_session` / profile categories).
3. **Durable alignment artifacts** — **Not** auto-created by survey submit. Promotion to **`/api/alignment-context`** (or CLI) is a **separate** step when you want alignment-context entities ([AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) § Canonical naming).

### 6.4 Revocation and exports

Revoked response ids for tombstones and export contracts: [ELICITATION_EXPORT_CONTRACT.md](./ELICITATION_EXPORT_CONTRACT.md). Harness-side vault naming remains in MiscRepos INTENT (bridge paths).

---

## 7. POST /api/survey (operator and harness contract)

**Route:** `POST /api/survey` — public intake by design (see [OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md) § Survey POST abuse). **Normative auth matrix:** [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) (survey submission row).

### 7.1 Success response (`200`)

JSON body includes at least:

| Field | Type | Meaning |
|-------|------|---------|
| `success` | `true` | Submission persisted. |
| `message` | string | Human-readable confirmation. |
| `attendeeId` | string (UUID) | §6.1 — use for ledger and person-scoped continuity. |
| `surveyResponseId` | string (UUID) | §6.2 — use for per-run export and handoff pointers. |
| `harnessProfileId` | string \| null | When request carried a valid `harnessProfileId`, echoed from stored response; otherwise `null`. |

### 7.2 Client-visible errors (non-exhaustive)

| Status | Typical cause |
|--------|----------------|
| **400** | Invalid JSON, Zod validation (`issues` — includes **`answers` over 64 rows**), answer mapping failure, missing/invalid Turnstile token when captcha enforced. |
| **401** | `SURVEY_POST_REQUIRE_TOKEN=true` but missing/invalid **`x-survey-post-token`** (bootstrap from **`GET /api/survey/bootstrap-token`**). |
| **409** | Unique constraint (e.g. duplicate email path for non-anonymous attendee). |
| **503** | Token required but `SURVEY_POST_BOOTSTRAP_SECRET` unset; or captcha required but `TURNSTILE_SECRET_KEY` unset. |
| **500** | Unexpected server error. |

**429** may apply when **middleware rate limits** trip (per-process sliding window; production scale-out caveats in OPERATIONAL_TRADEOFFS).

### 7.3 Abuse controls (when configured)

| Mechanism | Role |
|-----------|------|
| **Middleware rate limit** | Baseline throttle on `POST /api/survey` (per IP / process; see OPERATIONAL_TRADEOFFS). |
| **Cloudflare Turnstile** | When enforced (`SURVEY_POST_CAPTCHA_REQUIRED` or production + secret set), body must include a valid **`turnstileToken`**; server site-verifies before DB write. |
| **Bootstrap token** | When `SURVEY_POST_REQUIRE_TOKEN=true`, header **`x-survey-post-token`** must match token from **`GET /api/survey/bootstrap-token`** (same-origin UI typically fetches automatically). **Threat model** (same-origin script vs cross-site vs server automation): [SURVEY_POST_BOOTSTRAP_THREAT_MODEL.md](../security/SURVEY_POST_BOOTSTRAP_THREAT_MODEL.md). |

**Handler order** (401 vs 400 vs mapping errors): see [OPERATIONAL_TRADEOFFS.md](../engineering/OPERATIONAL_TRADEOFFS.md) § Survey POST handler order — agents should **not** treat all 4xx as “validation.”

---

## 8. Harness handoff field mapping

Align with MiscRepos [SESSION_SNAPSHOT_TEMPLATE.md](../../../MiscRepos/docs/agent/SESSION_SNAPSHOT_TEMPLATE.md). These fields support **Sync Session continuity** across chats and machines. They **mirror** OpenGrimoire semantics (§6) for use outside this repo.

| Field | Role |
|--------|------|
| `attendee_id` | Same as **`attendeeId`** from §6.1 when populated from OG. |
| `survey_response_id` | Same as **`surveyResponseId`** from §6.2 when populated from OG. |
| `intent_statement` | One short paragraph; **non-sensitive** only in git-tracked files. |
| `elicitation_time_minutes` | Focused interview minutes this session (or null if waived). |
| `layers_completed` | Subset of `rhythms`, `decisions`, `inputs`, `dependencies`, `friction`. |
| `definition_of_done` | Verifiable completion criteria for this stream. |
| `last_elicitation_utc` | ISO-8601 from OG or operator clock. |
| `og_intent_excerpt_stale` | `true` if last OG health ping failed. |
| `opengrimoire_session_url` | Optional deep link into OG UI. |

**Operational rules:** On intent-related handoff, **ping** `GET /api/capabilities` on `OPENGRIMOIRE_BASE_URL`. Refresh `.cursor/state/og_intent_excerpt.md` when healthy (see INTENT doc). If ping fails, set `og_intent_excerpt_stale: true` and add **STALE / OG_UNAVAILABLE** to handoff **pointers** only.

**Canonical answers** live in **OpenGrimoire**; **vault** `Interview-Archive/` holds immutable exports; **git** holds pointers and protocols — per MiscRepos INTENT storage contract.

---

## 9. Agent-native alignment (short)

- **Action parity:** Operator actions in OG (answer survey, revoke) should have documented **API or UI path**; harness agents use the same HTTP + bridge scripts with **human gates** for production tokens ([INTEGRATION_PATHS.md](./INTEGRATION_PATHS.md)).
- **Tools as primitives:** Prefer ping, export bridge, and snapshot updates as **separate** steps over a single opaque “sync” tool.
- **Shared workspace:** OG SSOT + vault copies + git pointers — no second narrative truth in handoff body for confidential content.
- **Context injection:** Session start loads rules + snapshot + excerpt; Sync output **feeds** what the next session injects.
- **Capability discovery:** After Sync, the operator should know what the agent may do next (tools, gates, off-limits paths).
- **Interviewing the model:** Framed as **structured claims + verification**, not anthropomorphic trust.

---

## 10. Vault and export

After substantive OG updates, run the export bridge (human-gated) per MiscRepos [INTENT_ELICITATION_AND_OG.md § Export bridge](../../../MiscRepos/docs/agent/INTENT_ELICITATION_AND_OG.md#export-bridge). Skim **`Interview-Archive/`** in Obsidian as part of weekly governance.

---

## 11. Changelog

| Date | Change |
|------|--------|
| 2026-04-16 | Initial canon: dual-track script, cadences, harness mapping, agent-native subsection. |
| 2026-04-16 | OG-owned §6 identifiers/lifecycle/ledger; §7 `POST /api/survey` contract; renumber harness mapping to §8. |
