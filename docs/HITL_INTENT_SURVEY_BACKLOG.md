# HITL intent survey (clarification queue)

**Status:** **Implemented** as the **clarification queue** (SQLite table `clarification_requests`), **not** as an extension of `POST /api/survey`. **Distinct** from the shipped **Sync Session** form (`POST /api/survey`, [`src/components/SyncSessionForm/`](../src/components/SyncSessionForm/), [`useSyncSessionForm`](../src/lib/hooks/useSyncSessionForm.ts)).

## Purpose

Surface **questions on intent and context** that an **AI** can publish for a **human to resolve asynchronously** (human-in-the-loop / async handoff). This is **alignment and operator workflow** data, not the legacy attendee/survey schema.

## Storage decision

- **Chosen:** Dedicated table **`clarification_requests`** (see [`src/db/schema.ts`](../src/db/schema.ts)) — avoids overloading alignment-context semantics and keeps dynamic `question_spec` JSON explicit.
- **Do not overload** `POST /api/survey` without an explicit migration plan (fixed enum mapping in [`mapAnswersToSurveyResponse`](../src/lib/survey/mapAnswersToSurveyResponse.ts)).

## API and UI

- **Normative HTTP:** [`docs/agent/CLARIFICATION_QUEUE_API.md`](./agent/CLARIFICATION_QUEUE_API.md)
- **No HTTP DELETE:** supersede via `PATCH`; see **DELETE policy** in that doc.
- **Operator inbox:** `/admin/clarification-queue`
- **Reads / PII:** Treat resolutions like other operator-visible content; production survey read gates are documented in [`AGENT_INTEGRATION.md`](./AGENT_INTEGRATION.md) for **survey** endpoints — apply the same care when exposing clarification data beyond the admin session.

## Related

- [`AGENT_INTEGRATION.md`](./AGENT_INTEGRATION.md) — agent entry and env vars.
- [`docs/agent/SYNC_SESSION_HANDOFF.md`](./agent/SYNC_SESSION_HANDOFF.md) — correlation IDs from `POST /api/survey` vs clarification queue (two planes).
- [`docs/engineering/ADR-2026-03-31-session-types-questionnaires.md`](./engineering/ADR-2026-03-31-session-types-questionnaires.md) — future **session types** / versioned questionnaires (ADR only; no schema change yet).
- [`docs/engineering/OPERATIONAL_TRADEOFFS.md`](./engineering/OPERATIONAL_TRADEOFFS.md) — rate limits, operator model, discovery tradeoffs.
