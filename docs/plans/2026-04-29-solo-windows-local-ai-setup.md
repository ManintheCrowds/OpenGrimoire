# Solo Windows Local AI Setup and First Workflow

## Purpose

Make OpenGrimoire smooth for a solo Windows developer who wants to host, run, develop, train, and operate local-first AI systems from one cockpit. The first slice proves the local path before adding homelab or team operations.

## User

- Primary user: solo Windows developer running OpenGrimoire locally.
- Environment: Node/Next.js, local SQLite, optional Ollama, optional Docker Desktop.
- Operating posture: local-first by default; no silent cloud execution or spend.

## Requirements

1. The `/admin` cockpit shows a local AI setup surface without changing existing moderation auth or write semantics.
2. The setup surface reports local SQLite path, data directory writability, Ollama reachability, installed Ollama models, optional Docker posture, and verification commands.
3. The workflow surface lists a curated first workflow recipe that is local-only and explicit about required models, commands, artifacts, and verification.
4. The activity surface reads a local JSONL event stream when present and degrades to a bootstrap event when no activity exists yet.
5. All new cockpit APIs are admin-session gated with `requireOpenGrimoireAdminRoute`.
6. New panels are read-only in this slice; workflow execution buttons remain out of scope until CLI/MCP parity exists.
7. The UI exposes stable `data-testid` hooks for Playwright and A2UI monitoring.
8. The implementation preserves the existing `/admin` moderation queue, detail, activity, health, jobs, and ops behavior.

## Acceptance Criteria

- Given a solo Windows developer is signed in as admin, when they open `/admin` and select the Local AI tab, then they can see the SQLite DB path, data directory status, Ollama status, Docker note, and next action.
- Given Ollama is unavailable, when the local AI health endpoint is called, then the endpoint returns a soft `unreachable` status and a next action rather than throwing a 500.
- Given the Recipes tab is opened, when recipe metadata loads, then the first local agent recipe identifies `local_ollama`, `local-default`, required model tags, commands, artifacts, verification, and planned agent parity.
- Given no `data/local-ai-activity.jsonl` exists, when the Activity Log tab is opened, then the UI shows a bootstrap event and explains that no local activity log exists yet.
- Given malformed JSONL lines exist, when the activity adapter reads the log, then valid events still render and malformed lines are counted.
- Given a non-admin request calls any new cockpit endpoint, then the route rejects it with the existing admin auth response.

## Non-Goals

- Running arbitrary local commands from the browser.
- Training or fine-tuning execution in the first slice.
- Docker orchestration from the browser.
- Multi-user/team sync, role assignment, or remote operator access.
- Replacing the existing moderation cockpit with a separate shell.

## Verification

- Unit tests for runtime health, recipe metadata, and JSONL activity parsing.
- Playwright coverage through the existing admin cockpit flow.
- Existing `npm run verify` remains the release gate.
- Human verification checks that the UI explains missing prerequisites clearly on Windows.

## Follow-On Path

1. Add CLI/MCP parity for workflow execution before enabling write buttons.
2. Add project folders for prompts, datasets, artifacts, and local model requirements.
3. Add training/fine-tuning job status once a safe execution lane exists.
4. Promote host checks, backups, and recurring operations for homelab/self-host mode.
5. Evaluate ElectricSQL or PowerSync only when shared/team sync is required.
