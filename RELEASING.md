# Releasing OpenGrimoire

## Before tagging a release

1. **`npm run verify`** — lint, type-check, and unit tests (`package.json`).
2. **`npm run test:e2e`** — Playwright suite (dev server on port 3001 per `playwright.config.ts`).
3. **Maestro (optional)** — If [Maestro](https://maestro.mobile.dev/) is installed and you ship mobile web checks, run:

   ```bash
   npm run test:maestro
   ```

   Flows live under `e2e/maestro/` (e.g. `smoke_web.yaml`). This is **not** required for every merge if Maestro is absent on the machine; document in the release notes when it was run.

4. **GUI audit** — Keep [`docs/audit/gui-2026-03-26.md`](docs/audit/gui-2026-03-26.md) aligned with E2E coverage. From a sibling **MiscRepos** clone: `python .cursor/scripts/weekly_gui_wave_prompt.py --config docs/audit/gui_wave_rollout_openatlas.yaml` (see [MiscRepos `GUI_WAVE_TWO_LAYER_CONTRACT.md`](../MiscRepos/docs/audit/GUI_WAVE_TWO_LAYER_CONTRACT.md)).

## Portfolio SSOT

OpenGrimoire waves and OA-* IDs: [`../MiscRepos/docs/audit/gui_wave_rollout_openatlas.yaml`](../MiscRepos/docs/audit/gui_wave_rollout_openatlas.yaml) (typical sibling clone layout).
