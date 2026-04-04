# Workspace repo layout (decision)

**Decision (2026-04-01):** Keep **flat sibling repos** under one parent folder (e.g. `Documents\GitHub\`). Do **not** nest the Next.js app inside MiscRepos, and do **not** duplicate OpenGrimoire into a second remote for “simplicity.”

| Option | Verdict |
|--------|---------|
| **Flat siblings** (`OpenGrimoire`, `MiscRepos`, `OpenHarness`, optional `OpenCompass`) | **Adopted** — matches interop docs, lowest churn, clear separation (product vs harness vs upstream). |
| **Local folder name** | **Canonical:** `OpenGrimoire` (matches GitHub `ManintheCrowds/OpenGrimoire`). Legacy checkouts may still use `OpenGrimoire` on disk until renamed ([OPENGRIMOIRE_NAMING_AND_URLS.md](./engineering/OPENGRIMOIRE_NAMING_AND_URLS.md)). |
| **Nest `trustgraph-local-repo` under OpenGrimoire** | **Rejected for now** — mixes Python interop with the Next app and blurs [OpenHarness `DELINEATION`](../../OpenHarness/docs/DELINEATION.md)-style boundaries. |

**Operator index:** [GitHub `README-WORKSPACE.md`](../../README-WORKSPACE.md) (parent folder of this repo).

**Canonical blueprint:** [OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md](./OPEN_GRIMOIRE_LOCAL_FIRST_INTEGRATION.md).
