# Sync Session questionnaire v2

**Canonical route:** `/operator-intake` (alias `/survey`).

## Purpose

Alignment-first intake for human → agent memory. Replaces legacy enterprise survey fields (tenure buckets, Myers-Briggs-style peak performance, etc.).

## Question IDs (POST body)

| questionId | UI step | Storage |
|------------|---------|---------|
| `session_intent` | What are you trying to accomplish? | intent `signals` |
| `session_context` | What should the agent know? | intent `needs` |
| `shaped_by` | What shaped your career journey? | `survey_responses.shaped_by` |
| `working_style` | How you work best | `survey_responses.learning_style` (mapped) |
| `constraints` | Blockers (optional) | intent `constraints` |
| `unique_quality` | Unique perspective | `survey_responses.unique_quality` |

`questionnaireVersion: "v2"` on submit.

## Visualization

Cohort charts still read v1 column semantics. v2 rows appear in moderation; alluvial/chord may omit v2 until a viz migration.

## Bootstrap token

When `SURVEY_POST_REQUIRE_TOKEN` is off, `GET /api/survey/bootstrap-token` returns `{ token: null, required: false }` — submit proceeds without `x-survey-post-token`.
