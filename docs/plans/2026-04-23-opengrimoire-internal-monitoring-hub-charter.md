# OpenGrimoire — internal monitoring hub (product charter)

**Status:** Vision / north star (2026-04-23). **Normative HTTP, auth, and rate limits** remain in [`docs/ARCHITECTURE_REST_CONTRACT.md`](../ARCHITECTURE_REST_CONTRACT.md). **Systems list** in [`docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md`](../OPENGRIMOIRE_SYSTEMS_INVENTORY.md).

**Audience:** Operators, maintainers, and agents planning work around `/admin`, probe ingest, and related signals. This document does **not** replace the REST contract or `GET /api/capabilities`.

---

## Purpose

OpenGrimoire should grow as a **focused internal hub**: trusted **observation** of how operators and harnesses interact with external dependencies, **reflections** surfaced as curated operator UI (not raw log dumps), and **AI operations** context that correlates with what the app and harness already persist—without becoming a general observability platform.

---

## Scope (three pillars)

1. **Observation** — Path/connectivity and environment signals aligned with **operator probe runs** ([`POST /api/operator-probes/ingest`](../AGENT_INTEGRATION.md#operator-probe-ingest), SQLite `operator_probe_runs`), structured **`access_denied`** lines ([`docs/engineering/OPERATOR_LOG_FIELDS.md`](../engineering/OPERATOR_LOG_FIELDS.md)), and future **read-only** aggregates where product explicitly adds them. There is **no** typed agent progress event stream from the server today; agents discover HTTP workflows via **`GET /api/capabilities`** and integration docs.

2. **Reflections** — Operator-facing surfaces under **`/admin`** that summarize risk and health (moderation queue, observability list/detail, alignment/clarification consoles). Content is **curated** for decision-making; bulk raw IDE or harness logs stay **out of scope** for this app ([`docs/AGENT_INTEGRATION.md`](../AGENT_INTEGRATION.md) § Agent transcripts).

3. **AI operations** — Correlation **intent** across tool/API usage and run metadata **where it already exists** (e.g. harness session snapshots, alignment context, probe summaries) or is **explicitly backlog-gated** (e.g. correlation spike **OG-OH-12**). The app does **not** persist arbitrary agent chat transcripts.

---

## Non-goals

- **Not a SIEM** — No generic log search product, no vendor-style ingestion pipeline in this repo.
- **Not unauthenticated wide reads** — Any machine-authenticated list/delete or ingest path stays **narrow**, secret-scoped, and documented (see operator probe ADRs and contract matrix).
- **Not replacing edge controls** — Rate limits and WAF-style protection remain at the boundary where possible ([`docs/engineering/OPERATIONAL_TRADEOFFS.md`](../engineering/OPERATIONAL_TRADEOFFS.md)).

---

## Retention and privacy

- **Default persistence:** Local **SQLite** for domain and probe data; probe TTL via **`OPERATOR_PROBE_RETENTION_DAYS`** (see contract § operator probe runs).
- **PII / survey:** Survey and visualization gates unchanged—[`docs/admin/SURVEY_READ_GATING_RUNBOOK.md`](../admin/SURVEY_READ_GATING_RUNBOOK.md).
- **Structured denials:** `access_denied` logging schema and optional **401 invalid_secret** throttling—[`docs/engineering/OPERATOR_LOG_FIELDS.md`](../engineering/OPERATOR_LOG_FIELDS.md).

---

## Integration points (link, do not duplicate)

| Area | Role for the hub |
|------|------------------|
| **Brain Map** | Graph shows harness/state co-access from configured roots; complements operator consoles. See [`docs/GUI_ACTION_MAP_BRAIN_MAP.md`](../GUI_ACTION_MAP_BRAIN_MAP.md) and inventory § **Relationship to OpenHarness**. |
| **`GET /api/capabilities`** | **Agent-native discovery:** single hand-maintained index of routes, auth env hints, and `workflows[]` (e.g. `operator_observability_probes`). Alignment with shipped HTTP behavior is a standing obligation: run **`npm run verify:capabilities`** and **`npm run verify:openapi`** when changing capabilities or documented routes (**OG-OH-13**, 2026-04-23); dedupe with **OGAN-02** when touching the same surfaces. |
| **Moderation + `access_denied`** | Moderation queue + structured JSON denial lines are **adjacent signals** the hub may grow beside over time; contract and log field docs remain SSOT. |

---

## Agent-native discipline (summary)

- **Discovery:** Agents should prefer **`GET /api/capabilities`** + [`docs/AGENT_INTEGRATION.md`](../AGENT_INTEGRATION.md) before inferring routes.
- **Parity:** Any **new** operator UI capability for this hub should ship with the same **documented** HTTP/agent path (or an explicit ADR gap)—not UI-only shortcuts ([`docs/AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md`](../AGENT_NATIVE_AUDIT_OPENGRIMOIRE.md)).
- **Primitives:** Prefer thin, composable HTTP surfaces and existing log patterns over bundled “observability suite” code until a backlog item justifies it.

---

## Shipped vision slices (2026-04-23)

| ID | Outcome |
|----|---------|
| **OG-OH-11** | **Operations** subnav on every `/admin/*` page (Layout) plus an **Operations hub** callout on `/admin` linking alignment, clarification, observability, and controls. |
| **OG-OH-12** | Timeboxed correlation **spec** — [2026-04-23-og-oh-12-correlation-spike.md](./2026-04-23-og-oh-12-correlation-spike.md) (data reality: `access_denied` is not SQLite; join paths are offline, log-store, or future ADR). |
| **OG-OH-13** | Discovery gates documented here and in [`AGENT_INTEGRATION.md`](../AGENT_INTEGRATION.md) § Machine-readable surface — **`verify:capabilities`** + **`verify:openapi`** (same PR as route/capability changes when possible). |

Further hub work should open **new labeled harness IDs** (do not recycle **OG-OH-11** through **OG-OH-13**).

---

## Related

- [`docs/OPENGRIMOIRE_SYSTEMS_INVENTORY.md`](../OPENGRIMOIRE_SYSTEMS_INVENTORY.md) — application surfaces table.
- Harness **PENDING_OPENGRIMOIRE_OBSERVABILITY_HUB** (MiscRepos `.cursor/state/pending_tasks.md`) — **no open OG-OH-** rows after **OG-OH-13**; archive in `completed_tasks.md`.
