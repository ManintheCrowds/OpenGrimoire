# Intent ledger API (operator/harness alignment loop)

This read model merges three planes into one per-attendee record:

1. **Fixed Sync Session data** (`attendees` + `survey_responses`).
2. **Clarification queue outcomes** (`clarification_requests`).
3. **Alignment context state** (`alignment_context_items`).

Use this when a harness needs one place to answer: **"what intent gaps are unresolved, what was resolved, and should we escalate?"**

---

## Endpoints

### `GET /api/intent-ledger`

Returns all attendee records in one payload.

**Auth:** same pattern as study APIs — either:
- operator admin session cookie, or
- `x-alignment-context-key` (when `ALIGNMENT_CONTEXT_API_SECRET` is configured).

### `GET /api/intent-ledger/:attendeeId`

Returns one attendee record.

- `400` for invalid UUID
- `404` when attendee is not found

---

## Canonical intent event shape

Every merged record includes `intent_events[]` with the canonical shape:

- `type` — `sync_session_profile | clarification_request | clarification_resolution | alignment_context`
- `category` — `profile | intent_gap | intent_resolution | alignment_context`
- `status` — normalized lifecycle (`pending`, `resolved`, `active`, `archived`, `info`)
- `source` — `sync_session | clarification_queue | alignment_context`
- `confidence` — numeric confidence for inferred linkage / interpretation
- `timestamp` — event ordering key

Additional fields (`title`, `detail`, `reference_id`, `attendee_id`, `session_id`) keep events traceable.

---

## Harness write/read loop

### Write side

1. Create fixed profile baseline via `POST /api/survey` (Sync Session).
2. Publish gaps/questions via `POST /api/clarification-requests`.
3. Resolve gap via `PATCH /api/clarification-requests/:id` (`answered` / `superseded`).
4. Promote durable outcomes via `POST`/`PATCH /api/alignment-context`.

### Read side

1. Poll `GET /api/intent-ledger` (or per attendee endpoint).
2. Route records where `intent_gaps.unresolved > 0` into operator inbox/escalation.
3. Consume `intent_gaps.escalation_prompts[]` as suggested handoff prompts.
4. Keep your own harness checkpoints idempotent by storing seen `intent_events[].id`.

This keeps the app-side domain model thin while giving harnesses a single alignment-oriented read model.
