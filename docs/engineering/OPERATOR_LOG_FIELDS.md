# Operator log fields — API access denials

**Purpose:** Document structured **access denial** lines emitted by the OpenGrimoire server (Phase **P6.1**). These are **not** a full observability product; there is **no** typed agent event stream (see [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md) § Machine-readable surface and [AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md](../research/AGENT_HARNESS_IMPROVEMENT_PROGRAM_2026-04-03.md) § Phase 2 follow-ups).

## Grepping

```text
grep access_denied
```

Each matching line is a single JSON object written with `console.info` (one line).

## Schema

| Field | Type | Meaning |
|-------|------|---------|
| `event` | string | Always `access_denied`. |
| `gate` | string | `alignment_context` \| `clarification_queue` \| `brain_map` \| `survey_read`. |
| `route` | string | Request pathname only (from `URL.pathname`). No query string. |
| `reason` | string | `missing_header` \| `invalid_secret` \| `misconfigured` \| `session_required`. |
| `status` | number | HTTP status returned with the response (401 or 503 today for these lines). |

**Privacy:** No header values, secrets, cookies, or request bodies are logged.

## Implementation

[`src/lib/observability/access-denial-log.ts`](../../src/lib/observability/access-denial-log.ts) — wired from alignment context gate, clarification queue gate, brain-map graph route, and survey read gate.

## Operator probe ingest success (non-denial)

[`POST /api/operator-probes/ingest`](../../src/app/api/operator-probes/ingest/route.ts) may emit a single JSON line with `event: operator_probe_ingested` (`console.info`). Fields are **metadata only** (`run_id`, `via`, `probe_type`, `target_host`, `request_id`) — **no** `summary`, **no** `raw_blob`, and no request body content. Treat full probe payloads as sensitive unless you have a separate retention policy.
