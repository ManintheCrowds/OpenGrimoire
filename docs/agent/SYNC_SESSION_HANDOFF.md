# Sync Session handoff (automation and operators)

**Normative HTTP:** [`POST /api/survey`](../../src/app/api/survey/route.ts) — Sync Session profile capture. **Enum mapping:** [`mapAnswersToSurveyResponse`](../../src/lib/survey/mapAnswersToSurveyResponse.ts).

## Two planes (do not conflate)

| Plane | Purpose | APIs |
|-------|---------|------|
| **Sync Session** | Fixed human profile wizard → `attendees` + `survey_responses` | `POST /api/survey` |
| **Dynamic agent intent** | Async questions for humans to resolve later | [`GET`/`POST` `/api/clarification-requests`](./CLARIFICATION_QUEUE_API.md), [`GET`/`PATCH` `/api/clarification-requests/:id`](./CLARIFICATION_QUEUE_API.md) |

Do **not** overload `POST /api/survey` with ad-hoc `questionId`s without a migration plan (see [`HITL_INTENT_SURVEY_BACKLOG.md`](../HITL_INTENT_SURVEY_BACKLOG.md)).

## Successful submit: correlation IDs

On **200 OK**, the response includes server-issued UUIDs (camelCase):

- **`attendeeId`** — row in `attendees`.
- **`surveyResponseId`** — row in `survey_responses` for this submit.

Treat these as **internal correlation identifiers** (join keys for operators and automation). They are not end-user secrets, but avoid shipping them to third-party analytics or public logs without a policy decision.

Use these in handoffs, run logs, and PRs — not as compiler magic. Example response shape:

```json
{
  "success": true,
  "message": "Survey submitted successfully",
  "attendeeId": "uuid",
  "surveyResponseId": "uuid"
}
```

## Copy-paste handoff template

Replace placeholders after a successful `POST /api/survey`:

```text
OPENGRIMOIRE_BASE_URL=https://your-origin.example
OPENGRIMOIRE_ATTENDEE_ID=<attendeeId from response>
OPENGRIMOIRE_SURVEY_RESPONSE_ID=<surveyResponseId from response>
# Optional human deep link (adjust path if your app exposes one):
# NEXT_PUBLIC_APP_URL=https://your-origin.example
```

For **OpenHarness / agent runs**, store the same `surveyResponseId` (or `attendeeId`) next to the task or trace id so replay joins **harness run ↔ Grimoire row**.

## After profile capture: clarification

If the agent needs **new** structured questions answered asynchronously, create a clarification request (see [CLARIFICATION_QUEUE_API.md](./CLARIFICATION_QUEUE_API.md)). Poll or webhook on resolve — do not reuse MotivationStep for open-ended agent prompts.

## Operational hardening (public hosts)

- **Rate limit:** Per-IP in [`middleware.ts`](../../middleware.ts) for `POST /api/survey`.
- **Bootstrap token:** When `SURVEY_POST_REQUIRE_TOKEN=true`, call `GET /api/survey/bootstrap-token` and send `x-survey-post-token` on POST (same-origin UI fetches once on load). Requires `SURVEY_POST_BOOTSTRAP_SECRET`. Tokens are short-lived (~15 minutes); if `POST /api/survey` returns **401** with an invalid/missing token message, **call `GET /api/survey/bootstrap-token` again** and retry POST with the new header (long sessions may outlive the first JWT).
- **Turnstile:** When captcha is enforced, include `turnstileToken` in the JSON body (widget + `TURNSTILE_SECRET_KEY` on the server). See [`OPERATIONAL_TRADEOFFS.md`](../engineering/OPERATIONAL_TRADEOFFS.md).

## Example script

Minimal **`fetch`** example (no extra dependencies): [`scripts/examples/post-sync-session.mjs`](../../scripts/examples/post-sync-session.mjs). Set `OPENGRIMOIRE_BASE_URL` and, when token enforcement is on, `SURVEY_POST_TOKEN` from the bootstrap endpoint response.

## Related

- [`AGENT_INTEGRATION.md`](../AGENT_INTEGRATION.md) — secrets, survey read gates, capabilities.
- [`GET /api/openapi.json`](../ARCHITECTURE_REST_CONTRACT.md) — partial OpenAPI (includes `POST /api/survey`).
