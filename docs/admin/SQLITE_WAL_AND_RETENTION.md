# SQLite WAL, vacuum/backup, and retention policy

## WAL mode + startup checks

OpenGrimoire now enables SQLite WAL mode at startup in `src/db/client.ts` and performs:

- `PRAGMA journal_mode = WAL`
- `PRAGMA quick_check`

If WAL cannot be enabled or quick check is not `ok`, a server warning is logged.

## Vacuum/backup policy

- **Backups:** use `POST /api/admin/db/lifecycle` with `{ "action": "backup" }`.
  - Writes timestamped file under `data/backups/` adjacent to the active DB.
- **Vacuum posture:** WAL + periodic prune keeps free pages bounded; operators should run `VACUUM` during maintenance windows if freelist growth remains high.
- **Health checks:** `GET /api/admin/db/health` returns schema version, WAL journal mode, and freelist/page metrics.

## Retention policies

Default retention windows (override via env):

- `survey_responses`: 365 days (`OPENGRIMOIRE_RETENTION_SURVEY_DAYS`)
- `clarification_requests`: 180 days (`OPENGRIMOIRE_RETENTION_CLARIFICATION_DAYS`)
- `study_reviews`: 365 days (`OPENGRIMOIRE_RETENTION_STUDY_DAYS`)

Pruning endpoint:

- `POST /api/admin/db/lifecycle` with `{ "action": "prune" }`

Exports:

- `GET /api/admin/db/lifecycle?action=export&table=survey_responses`
- `GET /api/admin/db/lifecycle?action=export&table=clarification_requests`
- `GET /api/admin/db/lifecycle?action=export&table=study_reviews`

UI controls for prune/export/backup live in `/admin/controls` under **Data Lifecycle**.
