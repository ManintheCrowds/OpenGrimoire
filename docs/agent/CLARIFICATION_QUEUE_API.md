# Clarification queue API (async agent → human)

**Purpose:** Agents publish **dynamic questions** with stable UUIDs; humans resolve them later via `/admin/clarification-queue` or `PATCH` with the same shared-secret auth as alignment context.

**Distinct from:** Sync Session (`POST /api/survey`, fixed profile wizard) — see [HITL_INTENT_SURVEY_BACKLOG.md](../HITL_INTENT_SURVEY_BACKLOG.md).

## Auth

Same gate as [`/api/alignment-context`](./ALIGNMENT_CONTEXT_API.md): when `ALIGNMENT_CONTEXT_API_SECRET` is set, send header `x-alignment-context-key` on every request. Local dev: `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` (never on public hosts).

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/clarification-requests` | Alignment API key |
| POST | `/api/clarification-requests` | Alignment API key |
| GET | `/api/clarification-requests/:id` | Alignment API key |
| PATCH | `/api/clarification-requests/:id` | Alignment API key |
| GET | `/api/admin/clarification-requests` | Operator session cookie |
| POST | `/api/admin/clarification-requests` | Operator session cookie |
| GET | `/api/admin/clarification-requests/:id` | Operator session cookie |
| PATCH | `/api/admin/clarification-requests/:id` | Operator session cookie |

## Request shapes

- **POST body:** `{ question_spec, agent_metadata?, linked_node_id? }`
- `question_spec` is a discriminated union: `kind` ∈ `single_choice` | `multi_choice` | `text` | `likert` (see Zod: `src/lib/clarification/schemas.ts`).
- **PATCH body:** `{ resolution?, status? }` — for `status: "answered"`, `resolution` is required. For `status: "superseded"`, omit `resolution`.

## DELETE policy

There is **no `DELETE`** on clarification queue routes **by design**:

- Preserves an **audit trail** of what agents asked and how humans resolved (or superseded) items.
- Reduces **destructive surface** for automation keys (alignment/clarification shared-secret pattern).

To discard a mistaken request, use **`PATCH`** with `status: "superseded"` (optional empty resolution). If a future product requires **hard delete**, scope it to **admin session only** and document an ADR; do not expose blind `DELETE` to public API keys without a separate review.

## Webhook (optional)

When **`CLARIFICATION_WEBHOOK_URL`** is set, the server **POSTs** a JSON payload to that URL **after** a successful resolve (`status` `answered` or `superseded`). Delivery is **fire-and-forget** (failures are logged only). If **`CLARIFICATION_WEBHOOK_SECRET`** is set, the raw body is signed with **HMAC-SHA256** and sent as header **`X-OpenGrimoire-Signature: sha256=<hex>`**. Prefer **polling** `GET /api/clarification-requests/:id` for reliability; webhooks are a convenience for harness automation.

## Stable IDs

Created items return `item.id` (UUID). Use in handoffs and harness state as:

`OPENGRIMOIRE_CLARIFICATION_ID=<uuid>`

See the OpenHarness repo: `docs/OPENGRIMOIRE_CLARIFICATION_BRIDGE.md` (handoff and poll conventions).
