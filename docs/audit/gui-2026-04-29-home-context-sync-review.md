# OpenGrimoire GUI Review — Home, Context Atlas, Sync Session

## Scope

This review covers the first-run GUI structure visible from the home page, plus the two surfaces called out during review:

- `src/app/page.tsx` — home/base camp labels and card hierarchy.
- `src/components/SharedNavBar.tsx` — global navigation labels.
- `src/components/BrainMap/BrainMapGraph.tsx` — Context Atlas empty/data-source guidance.
- `src/components/SyncSessionForm/index.tsx` and `src/lib/survey/sync-session-submit-user-message.ts` — Sync Session reliability copy.

## Design Direction

Primary labels now stay clear and scannable; supporting copy carries more of the grimoire/forge/memory-atlas voice. The home page should read as an operator base camp, not a generic SaaS launch grid.

## Findings

| Area | Finding | Change made | Beta row |
|---|---|---|---|
| Home IA | The previous card grid gave equal weight to demos, intake, graph, wiki, and controls. | Split into `Primary workflows` and `Supporting surfaces`; made `Sync Session`, `Context Atlas`, and `Operator Cockpit` the main paths. | `OG-BETA-01`, `OG-BETA-02` |
| Labeling | Labels like `Context datasets (D3)`, `LLM Wiki mirror`, and `Global Controls` were technically accurate but not user-shaped. | Rewrote labels to `Data Constellations`, `LLM Wiki`, and `Controls` with clearer supporting copy. | `OG-BETA-02` |
| Admin routing | Global `Admin` label pointed at `/admin/controls`, not the operational admin surface. | Added `Operator Cockpit` for `/admin` and kept `Controls` for `/admin/controls`. | `OG-BETA-03` |
| Context Atlas | The graph UI implied live co-access but the route consumes generated JSON. It also referenced stale `portfolio-harness` wording. | Updated copy to explain generated JSON, `MiscRepos/.cursor/scripts/build_brain_map.py`, `CURSOR_STATE_DIRS`, `BRAIN_MAP_VAULT_ROOTS`, Arc_Forge/ObsidianVault, and archived handoffs. | `OG-BETA-03`, `OG-BETA-04` |
| Data source visibility | Operators could not quickly tell whether state/vault roots were loaded. | Added generated time, node count, edge count, source root count, and detected vault-root count when graph metadata exists. | `OG-BETA-04` |
| Sync Session errors | Errors did not clearly distinguish token/config/server failure paths for operators. | Rewrote 503/5xx/fallback copy and added an operator checklist under form errors. | `OG-BETA-02`, `OG-BETA-04` |

## Remaining Improvement Backlog

| ID | Priority | Recommendation | Why |
|---|---|---|---|
| GUI-REVIEW-01 | P1 | Run the brain-map builder with `BRAIN_MAP_VAULT_ROOTS` pointed at Arc_Forge/ObsidianVault and confirm `/context-atlas` shows vault nodes. | The UI can explain the pipeline, but the product value depends on a populated graph. |
| GUI-REVIEW-02 | P1 | Reproduce the current Sync Session error and classify it as token, SQLite, captcha, rate-limit, or network. | The copy is clearer, but the root cause still needs runtime evidence. |
| GUI-REVIEW-03 | P2 | Add a small operator-only Context Atlas runbook link near the empty-state checklist. | Reduces rebuild friction without making the public UI too verbose. |
| GUI-REVIEW-04 | P2 | Continue replacing old `Event Visualization Platform` copy in legacy docs/components as those surfaces become active. | Keeps the product voice from splitting across old and new names. |
| GUI-REVIEW-05 | P2 | Consider a future live-index design note before connecting Sync Session SQLite rows to Context Atlas. | Avoids conflating survey records with generated archive topology. |

## Verification Checklist

- Home: `/` shows `OpenGrimoire`, `Primary workflows`, `Sync Session`, `Context Atlas`, and `Operator Cockpit`.
- Navigation: top nav routes `Operator Cockpit` to `/admin` and `Controls` to `/admin/controls`.
- Context Atlas: `/context-atlas` explains generated JSON and Arc_Forge vault-root requirements when graph data is empty or placeholder.
- Sync Session: `/operator-intake` keeps the form draft and shows operator diagnostics when submission fails.
- Static/runtime: run `npm run type-check` and focused Vitest for `sync-session-submit-user-message`.

## Beta Gate Notes

This work improves readiness for `OG-BETA-01` through `OG-BETA-04`, but it does not by itself make Beta a Go. The Context Atlas still needs a real generated graph that includes the correct state and vault roots, and Sync Session needs runtime reproduction of the reported error.
