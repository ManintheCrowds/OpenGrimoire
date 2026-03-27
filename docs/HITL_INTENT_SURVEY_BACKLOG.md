# HITL intent survey (backlog)

**Status:** Not implemented. **Distinct** from the shipped multi-step **intake** survey (`POST /api/survey`, [`src/components/SurveyForm/`](../src/components/SurveyForm/), [`useSurveyForm`](../src/lib/hooks/useSurveyForm.ts)).

## Purpose

Surface **questions on intent and context** that an **AI** can publish for a **human to resolve asynchronously** (human-in-the-loop / async handoff). This is a product direction for **alignment and operator workflows**, not a duplicate of the legacy attendee/survey schema.

## Design notes (TBD)

- **Schema and API:** New routes or extensions TBD; do not overload `POST /api/survey` without an explicit migration plan.
- **Reads / PII:** Any visualization or list UI for responses must respect production gates — see [`checkSurveyReadGate`](../src/lib/survey/survey-read-gate.ts) and [`AGENT_INTEGRATION.md`](./AGENT_INTEGRATION.md) (survey read endpoints).
- **Agent parity:** External agents should use the same HTTP contract and secrets as operators; see [`ARCHITECTURE_REST_CONTRACT.md`](./ARCHITECTURE_REST_CONTRACT.md).

## Related

- [`AGENT_INTEGRATION.md`](./AGENT_INTEGRATION.md) — agent entry and env vars.
- [`docs/engineering/OPERATIONAL_TRADEOFFS.md`](./engineering/OPERATIONAL_TRADEOFFS.md) — rate limits, operator model, discovery tradeoffs.
