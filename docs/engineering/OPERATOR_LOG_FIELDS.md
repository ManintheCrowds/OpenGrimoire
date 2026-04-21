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
| `gate` | string | `alignment_context` \| `clarification_queue` \| `brain_map` \| `survey_read` \| `operator_observability_ingest` \| `operator_observability_read` \| `operator_observability_admin`. |
| `route` | string | Request pathname only (from `URL.pathname`). No query string. |
| `reason` | string | `missing_header` \| `invalid_secret` \| `misconfigured` \| `session_required`. |
| `status` | number | HTTP status returned with the response (401 or 503 today for these lines). |

**Privacy:** No header values, secrets, cookies, or request bodies are logged.

## Implementation

[`src/lib/observability/access-denial-log.ts`](../../src/lib/observability/access-denial-log.ts) — wired from alignment context gate, clarification queue gate, brain-map graph route, survey read gate, and operator observability auth.

### Throttling **401** `invalid_secret` noise (OG-OH-09)

Scanners can flood logs with wrong API keys. **`503` misconfigured** responses (e.g. probe ingest when no secret is configured) intentionally **do not** emit `access_denied` where documented.

Optional **in-process** controls (each Node replica has its own counters; not shared across instances):

| Env | Effect |
|-----|--------|
| **`ACCESS_DENIED_INVALID_SECRET_LOG_PROBABILITY`** | Float **0–1**, default **1**. After any per-IP cooldown check, each qualifying line is emitted with this probability (e.g. `0.05` ≈ 5%). |
| **`ACCESS_DENIED_INVALID_SECRET_PER_IP_COOLDOWN_MS`** | Integer **≥ 0**, default **0** (off). Minimum milliseconds between emitted lines for the same **`gate` + `route` + client IP** (IP from `X-Forwarded-For` / `X-Real-IP` only when [`getClientIpFromRequest`](../../src/lib/rate-limit/get-client-ip.ts) trusts forwarded headers — same rules as middleware rate limits). |

Only **`reason: invalid_secret`** with **`status: 401`** is filtered; other denial reasons always log.

## Operator probe ingest success (non-denial)

[`POST /api/operator-probes/ingest`](../../src/app/api/operator-probes/ingest/route.ts) may emit a single JSON line with `event: operator_probe_ingested` (`console.info`). Fields are **metadata only** (`run_id`, `via`, `probe_type`, `target_host`, `request_id`) — **no** `summary`, **no** `raw_blob`, and no request body content. Treat full probe payloads as sensitive unless you have a separate retention policy.
