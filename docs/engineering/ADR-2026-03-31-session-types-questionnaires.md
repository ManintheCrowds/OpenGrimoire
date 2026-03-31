# ADR: Session types and versioned questionnaires (future work)

**Status:** Proposed (no schema change in the ADR PR).  
**Date:** 2026-03-31  
**Context:** OpenGrimoire Sync Session today is a single **profile** questionnaire: fixed `questionId` set and enum mapping in [`mapAnswersToSurveyResponse`](../../src/lib/survey/mapAnswersToSurveyResponse.ts). The **clarification queue** covers **dynamic agent intent** separately ([`CLARIFICATION_QUEUE_API.md`](../agent/CLARIFICATION_QUEUE_API.md)).

## Problem

Product may want **multiple questionnaire shapes** (e.g. default profile vs event-specific) without overloading one enum map or stuffing arbitrary `questionId`s into `POST /api/survey` ([`HITL_INTENT_SURVEY_BACKLOG.md`](../HITL_INTENT_SURVEY_BACKLOG.md)).

## Decision (direction only)

1. **Keep Sync Session narrow** for the shipped profile: existing `KNOWN_QUESTION_IDS` and UI steps remain the default **session type** `profile` (or implicit default).
2. **Future session types** (e.g. `event_workshop_v1`) require:
   - A **versioned mapper** (separate module or `questionnaireVersion` dispatch) per type — not ad-hoc new IDs in the same enum switch without a migration.
   - Optional **`session_type` / `questionnaire_version`** column on `survey_responses`, or a parallel table, decided in a follow-up migration PR.
3. **UI:** Same wizard chrome may route by path (`/survey`, `/survey/:type`) or a session-type selector — implementation is a separate epic once requirements exist.
4. **Clarification queue** remains the canonical place for **open-ended / agent-generated** prompts; session types do not replace it.

## Consequences

- **Positive:** Clear separation between fixed profile capture, versioned event forms, and async clarification.
- **Cost:** Migrations, duplicate mapper tests, and UX for type selection.

## Links

- [`docs/agent/SYNC_SESSION_HANDOFF.md`](../agent/SYNC_SESSION_HANDOFF.md)
- [`ARCHITECTURE_REST_CONTRACT.md`](../ARCHITECTURE_REST_CONTRACT.md)
