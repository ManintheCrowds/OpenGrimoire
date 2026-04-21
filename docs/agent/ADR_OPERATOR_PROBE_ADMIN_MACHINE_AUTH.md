# ADR: Operator probe admin — optional machine authentication

**Status:** Accepted (shipped)  
**Scope:** `GET /api/admin/operator-probes`, `GET /api/admin/operator-probes/:id`, `DELETE /api/admin/operator-probes/:id` only.

## Context

Harnesses and CI sometimes need to **list or delete** probe runs without an operator browser session. **`ALIGNMENT_CONTEXT_API_SECRET`** / **`x-alignment-context-key`** must **not** gate these routes (different blast radius; alignment automation is not admin BFF).

## Decision

- Optional env **`OPERATOR_PROBE_ADMIN_SECRET`** and header **`x-operator-probe-admin-key`** (same timing-safe string compare pattern as ingest).
- When the secret is **unset**, auth is **operator session only** (backward compatible).
- When the secret is **set**, callers may use **either** a valid session **or** a matching admin header.
- Implementation: [`src/lib/operator-observability/admin-probe-auth.ts`](../../src/lib/operator-observability/admin-probe-auth.ts) — `requireOperatorProbeAdminRoute`.

## Threat model (concise)

- **Trusted runners / private networks** — same posture as [Operator probe ingest authentication (product posture)](../ARCHITECTURE_REST_CONTRACT.md#operator-probe-ingest-authentication-product-posture): static shared secret, no HMAC/replay window in v1.
- **Leaked admin secret** grants read + delete for probe runs (including optional `raw_blob` on detail). Rotate independently of ingest and alignment secrets.

## Future

Stronger auth (HMAC, nonce, scoped tokens) would be a **separate ADR** with contract and capabilities updates.
