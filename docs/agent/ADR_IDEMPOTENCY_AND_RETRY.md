# ADR: Idempotency and retry semantics (Sync Session, alignment, clarification)

**Status:** Accepted (Phase 1 harness).  
**Related:** [SYNC_SESSION_HANDOFF.md](./SYNC_SESSION_HANDOFF.md), [CLARIFICATION_QUEUE_API.md](./CLARIFICATION_QUEUE_API.md), [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md).

---

## Context

Agents and operators retry failed HTTP calls. Network failures, **429** rate limits, and **503** responses can look similar to application errors. This ADR states which operations are **safe to retry as-is** and which require **deduplication or human judgment**.

---

## Surfaces

### Sync Session — `POST /api/survey`

- **Not idempotent.** Each successful call creates new `attendees` / `survey_responses` rows (unless the product later adds a server-side idempotency key — not assumed today).
- **Retry policy:** Do **not** blindly retry a full body after an unknown outcome (timeout, connection reset). Prefer **one** explicit resubmit after confirming the server did not accept the prior attempt (e.g. no **200** with `surveyResponseId`), or use operator workflows to dedupe in analytics.
- **429 / Retry-After:** Safe to retry after backoff; **not** the same as duplicate-submission safety.

### Alignment context — `/api/alignment-context`

- **GET:** Safe to retry (read).
- **POST (create):** **Not idempotent** — repeats create **new** rows unless the client implements its own idempotency (e.g. stable client-generated key in a future contract).
- **PATCH / DELETE by id:** **Idempotent in effect** for a given `:id` — repeating the same PATCH with the same body is safe; DELETE on a deleted id may **404** (treat as terminal).

### Clarification queue — `/api/clarification-requests`

- **GET:** Safe to retry.
- **POST (create):** **Not idempotent** — each call creates a **new** UUID item; retries create duplicate questions unless the harness dedupes by fingerprint or state.
- **PATCH:** Updating `status` / `resolution` for a given `id` is **idempotent** for the same intended state transition; repeated PATCH to `answered` with the same resolution is acceptable. Use **`superseded`** to discard mistaken items without DELETE ([CLARIFICATION_QUEUE_API.md](./CLARIFICATION_QUEUE_API.md)).

### Discovery / read-only endpoints

- **`GET /api/capabilities`, `GET /api/openapi`, `GET /api/brain-map/graph` (with valid auth):** Safe to retry.
- **Survey read endpoints (PII):** Safe to retry **only** with the same auth gate; do not log response bodies to untrusted sinks.

---

## Summary table

| Surface | Method | Safe to retry same request? |
|---------|--------|----------------------------|
| Survey | POST | **No** (duplicate rows) |
| Alignment | GET | **Yes** |
| Alignment | POST | **No** (duplicate creates) |
| Alignment | PATCH/DELETE | **Mostly yes** (per-id; handle 404 on delete) |
| Clarification | GET | **Yes** |
| Clarification | POST | **No** (duplicate items) |
| Clarification | PATCH | **Yes** for same transition |
| Capabilities / OpenAPI | GET | **Yes** |

---

## Links from handoff docs

- Sync Session handoff: [SYNC_SESSION_HANDOFF.md](./SYNC_SESSION_HANDOFF.md) — correlation IDs after a **known** successful `POST`.  
- Clarification: [CLARIFICATION_QUEUE_API.md](./CLARIFICATION_QUEUE_API.md) — stable IDs and PATCH-only discard.
