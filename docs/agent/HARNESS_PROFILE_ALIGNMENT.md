# Harness profile alignment for external agents

Harness profiles are first-class local objects used to align **external harness behavior** with the operator's selected Sync Session stance.

## Contract summary

- **Schema fields:** `id`, `name`, `purpose`, `question_strategy`, `risk_posture`, `preferred_clarification_modes[]`, `output_style`, `is_default`.
- **Persistence:** SQLite table `harness_profiles` (local-first, same DB as Sync Session/alignment data).
- **Sync Session linkage:** `POST /api/survey` accepts optional `harnessProfileId`; server persists to `survey_responses.harness_profile_id`.

## API surface

- `GET /api/harness-profiles` — list profiles (operator session or alignment key).
- `POST /api/harness-profiles` — create profile (operator session or alignment key).
- `PUT /api/harness-profiles?action=import` — import from local file (operator/alignment auth).
- `PUT /api/harness-profiles?action=export` — export to local file (operator/alignment auth).
- `GET /api/harness-profiles/:id` — profile by id (operator session or alignment key).
- `PATCH /api/harness-profiles/:id` — update profile (operator/alignment auth).
- `DELETE /api/harness-profiles/:id` — delete profile (operator/alignment auth).
- `GET /api/harness-profiles/select` — resolve default/selected profile for Sync Session start.
- `POST /api/harness-profiles/select` — validate explicit selected profile id.
- `GET /api/harness-profiles/openharness` — OpenHarness-oriented integration bundle (optionally resolve selected profile by `surveyResponseId`).

## Import/export location

Import/export uses the local data directory:

- Base directory: `data/harness-profiles/`
- Default file: `data/harness-profiles/profiles.json`

This path is under repo-local `/data` (gitignored), so operators can maintain private profile packs without committing them.

## External harness behavior mapping

When a harness pulls Sync Session artifacts (for example by `surveyResponseId`), use the linked profile to shape runtime behavior:

1. `purpose` → set mission prompt preamble.
2. `question_strategy` → choose follow-up cadence and depth.
3. `risk_posture` → set refusal/escalation thresholds.
4. `preferred_clarification_modes` → choose question UI/format (`yes_no`, `checklist`, etc.).
5. `output_style` → render answers in expected style for operator workflows.

If `harness_profile_id` is null or stale, fallback to `GET /api/harness-profiles/select` default and record fallback in run logs.

For direct OpenHarness integration, call:

- `GET /api/harness-profiles/openharness` for catalog + mapping hints.
- `GET /api/harness-profiles/openharness?surveyResponseId=<uuid>` to resolve the profile chosen during Sync Session capture.

## Notes

- Profiles are **guidance contracts**, not security boundaries.
- Keep enforcement in harness policy + tool safeguards, not only prompt text.
