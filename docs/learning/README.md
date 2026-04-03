# Learning / spaced repetition (OpenGrimoire)

## Canonical references (sibling MiscRepos)

Flashcard quality rules, Anki CSV import notes, and the shared `validate_flashcards.py` validator are documented here:

- [`../../MiscRepos/portable-skills/docs/SPACED_REPETITION_REFERENCES.md`](../../MiscRepos/portable-skills/docs/SPACED_REPETITION_REFERENCES.md)

Paths assume **sibling repos** (e.g. `Documents/GitHub/{OpenGrimoire,MiscRepos}`).

## OpenGrimoire persistence

Study decks and cards are stored in the same SQLite database as alignment and survey data (`OPENGRIMOIRE_DB_PATH`). HTTP surface:

- **`GET /api/study/decks`** — list decks
- **`POST /api/study/decks`** — create deck
- **`GET /api/study/decks/:deckId/cards`** — list cards (optional `due=1` for due-only)
- **`POST /api/study/decks/:deckId/cards`** — add card
- **`POST /api/study/cards/:cardId/review`** — submit review (`again` | `hard` | `good` | `easy`)

Auth: **operator session cookie** (same-origin) or **`x-alignment-context-key`** when `ALIGNMENT_CONTEXT_API_SECRET` is set (same gate as alignment API).

Export validated CSV for Anki (File → Import):

```bash
npm run study:export -- --output ./opengrimoire-study-export.csv
```

Requires local DB path and optional alignment secret per [`AGENT_INTEGRATION.md`](../AGENT_INTEGRATION.md).
