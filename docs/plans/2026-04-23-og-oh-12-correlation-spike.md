# OG-OH-12 — Correlation spike (probe runs ↔ denials / health)

**Status:** Timeboxed research artifact (2026-04-23). **Does not** mandate schema or API changes until a follow-up backlog item explicitly ships persistence or export.

**Audience:** Operators and implementers asking whether `operator_probe_runs` can be joined to `access_denied` in SQLite or the admin UI today.

---

## Current data reality

| Signal | Where it lives | Join key in SQLite today |
|--------|----------------|---------------------------|
| **Probe runs** | Table `operator_probe_runs` (see contract § operator probes) | `id`, timestamps, `target_host`, ingest metadata |
| **`access_denied`** | Structured **JSON lines** to **stdout** / log sink ([`OPERATOR_LOG_FIELDS.md`](../engineering/OPERATOR_LOG_FIELDS.md)) | **Not** a first-class SQLite row set in this repo |

Therefore a **native SQL join** between `operator_probe_runs` and `access_denied` **does not exist** in the application database. Any “correlation spike” must choose one of: **offline** correlation (export + script), **log pipeline** correlation (same `request_id` / time window in your log store), or a **future** persisted event table (ADR + migration).

---

## Timebox (suggested: 2–4 hours)

1. **Confirm fields** — List JSON keys emitted on `access_denied` vs columns on `operator_probe_runs` (and whether ingest or admin paths log a shared `request_id`).
2. **Pick one path** — Document the chosen approach below under *Outcomes*; do not expand scope into a SIEM.
3. **Stop** — Hand off to a named implementation item if product wants SQLite or API exposure.

---

## Spike options (pick one per experiment)

### A — Offline correlation (zero schema change)

- Export probe rows (CSV or `sqlite3` query) for a window.
- Grep or `jq` log lines for `event":"access_denied"` in the same wall-clock window (and optional IP / route filters).
- **Match heuristic:** time ±N seconds + `client_ip` / `path` if present in both streams.

### B — Log-store correlation (ops-owned)

- If logs are centralized, define a saved query: `operator_probe_ingest` success/fail **near** `access_denied` lines sharing **timestamp bucket** or **`request_id`** when both loggers include it.

### C — Future in-app read model (backlog-gated)

- **Option C1:** Append-only `access_denial_events` table (sampled or full) + ADR for retention/Pii — enables SQL joins later.
- **Option C2:** Read-only API that merges **in-memory** recent denials with DB probes (only viable for single-node debug; not a production SIEM substitute).

---

## Outcomes (fill when you run the spike)

| Question | Answer |
|----------|--------|
| Do we have a stable shared key (`request_id`, trace id) on **both** probe ingest logs and `access_denied`? | |
| Is time-window correlation good enough for the operator question we care about? | |
| Recommended next backlog ID (if any): | |

---

## Related

- [Internal monitoring hub charter](./2026-04-23-opengrimoire-internal-monitoring-hub-charter.md) — pillar 3 (AI ops / correlation intent).
- [ARCHITECTURE_REST_CONTRACT.md](../ARCHITECTURE_REST_CONTRACT.md) — operator probes + auth matrix.
- Harness **OG-OH-11** … **OG-OH-13** (MiscRepos `.cursor/state/`).
