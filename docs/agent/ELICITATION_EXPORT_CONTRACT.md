# Elicitation export and revocation — API contract (Phase 2 sketch)

**Status:** Design backlog for OpenGrimoire. MiscRepos operator flow and bridge already document **desired** behavior in [MiscRepos `docs/agent/INTENT_ELICITATION_AND_OG.md`](../../../MiscRepos/docs/agent/INTENT_ELICITATION_AND_OG.md).

## Elicitation metadata (survey / response)

Align field names with MiscRepos [SESSION_SNAPSHOT_TEMPLATE.md](../../../MiscRepos/docs/agent/SESSION_SNAPSHOT_TEMPLATE.md) and handoff conventions.

| Field | Type | Notes |
|-------|------|--------|
| `intent_statement` | string | One short paragraph; safe for non-sensitive excerpt. |
| `elicitation_time_minutes` | number | Minutes spent in focused elicitation. |
| `layers_completed` | string[] | Subset of `rhythms`, `decisions`, `inputs`, `dependencies`, `friction`. |
| `definition_of_done` | string | Verifiable completion criteria (avoid vague “done”). |
| `survey_response_id` | string | Stable id for linkage. |
| `updated_at` | ISO-8601 | For excerpt refresh and tombstone logic. |

## Revoked responses (explicit list)

**Requirement:** Machine-readable list of revoked or redacted response ids so the MiscRepos bridge can write **`REVOKED-<id>.md`** tombstones without guessing.

**Suggested shape (choose one in implementation):**

- `GET /api/survey/revoked-ids` → `{ "ids": ["...", ...] }` with auth consistent with survey read gate, **or**
- Embed `revokedIds: string[]` in an existing authenticated export payload.

**Security:** Same gates as other survey read paths (e.g. `checkSurveyReadGate`); do not expose PII in the list endpoint beyond ids the operator already owns.

## Optional export payload

For vault **`OG-Snapshot-*.md`** generation without scraping the UI:

- `GET /api/survey/export-markdown?responseId=...` authenticated, returns markdown body **or** JSON with `{ title, body_markdown, updated_at }`.

Until this exists, operators may use `OPENGRIMOIRE_EXPORT_JSON` with the MiscRepos bridge (see INTENT doc).

## Validation (Phase 2)

- Reject incomplete **initial interview** submissions when required elicitation fields are missing (product decision: strict vs warn).
- Validate `layers_completed` against allowed enum values.

## Related

- [AGENT_INTEGRATION.md](../AGENT_INTEGRATION.md)
- [openapi-document.ts](../../src/lib/openapi/openapi-document.ts) — extend when routes ship.
