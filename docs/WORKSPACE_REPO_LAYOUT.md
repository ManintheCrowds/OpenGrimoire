# Workspace repo layout (decision)

**Decision (2026-04-01):** Keep **flat sibling repos** under one parent folder (e.g. `Documents\GitHub\`). Do **not** nest the Next.js app inside MiscRepos, and do **not** duplicate OpenAtlas into a second remote for “simplicity.”

| Option | Verdict |
|--------|---------|
| **Flat siblings** (`OpenAtlas`, `MiscRepos`, `OpenHarness`, optional `OpenCompass`) | **Adopted** — matches interop docs, lowest churn, clear separation (product vs harness vs upstream). |
| **Rename folder** `OpenAtlas` → `OpenGrimoire` locally | **Deferred** — breaks `cd OpenAtlas`, README, and muscle memory; only batch-update if you rename the Git remote too. |
| **Nest `trustgraph-local-repo` under OpenAtlas** | **Rejected for now** — mixes Python interop with the Next app and blurs [OpenHarness `DELINEATION`](../../OpenHarness/docs/DELINEATION.md)-style boundaries. |

**Operator index:** [GitHub `README-WORKSPACE.md`](../../README-WORKSPACE.md) (parent folder of this repo).

**Canonical blueprint:** [OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md](./OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md).
