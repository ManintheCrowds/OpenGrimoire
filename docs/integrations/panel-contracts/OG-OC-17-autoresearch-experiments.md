# OG-OC-17 Panel Contract — Autoresearch Experiments

## Contract metadata

- **Panel ID:** `OG-OC-17`
- **Panel name:** `Autoresearch Experiments`
- **Owner role:** `Solo Windows developer / OpenGrimoire admin operator`
- **Feature flag:** `OG_AUTORESEARCH_PANEL` (hide tab when `0`)
- **Rollback:** Hide Autoresearch tab; stop calling `/api/admin/cockpit/autoresearch`.

## Surface and route contract

| Field | Value |
|-------|-------|
| UI route(s) | `/admin` (`Autoresearch` tab); `/admin/autoresearch/[experimentId]` detail (Phase 2) |
| API route(s) | `GET /api/admin/cockpit/autoresearch`, `GET /api/admin/cockpit/autoresearch/[experimentId]`, `POST /api/admin/cockpit/autoresearch/events` (alias POST on list route) |
| HTTP methods | `GET`, `POST` (append event) |
| Read vs write | Read primary; POST mirrors harness `Emit-AutoresearchEvent.ps1` |
| Auth role / policy | `requireOpenGrimoireAdminRoute` |

## Data and security contract

| Field | Value |
|-------|-------|
| PII class | `internal` |
| Data sources | Harness `.cursor/state/autoresearch_events.jsonl`, `eval_runs.jsonl`, focus `autoresearch_focus.json`; optional local git via harness root |
| Env | `OPENGRIMOIRE_AUTORESEARCH_EVENTS_LOG`, `OPENGRIMOIRE_EVAL_RUNS_LOG` (optional), `OPENGRIMOIRE_HARNESS_ROOT` (optional), `OPENGRIMOIRE_AUTORESEARCH_FOCUS_JSON`, `AUTORESEARCH_AUTO_MERGE` (OG server process) |
| Least-privilege | No raw diff bodies; line counts + GitHub compare links only; no auto-merge from UI |
| Policy SSOT | [ADR_AUTORESEARCH_POLICY_MERGE.md](../../../../MiscRepos/docs/agent/ADR_AUTORESEARCH_POLICY_MERGE.md) |
| CI JSONL gate | `autoresearch-events-validate.yml` dry-run on PR; `AUTORESEARCH_AUTO_MERGE` allowlist off until green on at least one PR (ADR §5) |

## Verification contract

| Check | Evidence |
|-------|----------|
| Unit tests | `src/lib/autoresearch/events.test.ts`, `src/lib/autoresearch/policy.test.ts` |
| E2E | `admin-right-tab-autoresearch`, `admin-autoresearch-panel`, `admin-autoresearch-detail-predicates` |
| Capabilities | `autoresearch_observability` workflow in `GET /api/capabilities` |

## Detail API (`GET /api/admin/cockpit/autoresearch/[experimentId]`)

Phase 2 fields (display-only; no merge actions):

| Field | Purpose |
|-------|---------|
| `policy_predicates` | Replay ADR predicates: `tier_b_pass`, `critic_pass`, `eval_recorded`, `auto_merge_enabled`, `diff_bounded`, `no_harness_edit`, `ci_green` (external) |
| `all_predicates_pass` | `false` if any non-external predicate fails |
| `kill_switch_blocked` | `true` when `merge_blocked` and only `auto_merge_enabled` failed (`AUTORESEARCH_AUTO_MERGE=0`) |
| `mutable_asset_diff` | SKILL.md-scoped line count vs 150 cap; hybrid git when harness root resolvable |
| `events` | Chronological ascending timeline for experiment |
| `github_compare_url` | Link when local git unavailable |

**Note:** Harness `Invoke-AutoresearchPolicy.ps1` uses full-branch diff for `diff_bounded`; OG detail uses SKILL.md-scoped diff for operator display.

## Notes

- Reuses OG-OC-16 JSONL adapter pattern.
- Kill switch: `AUTORESEARCH_AUTO_MERGE=0` on OG server env; badge on detail when merge blocked on that predicate only.
