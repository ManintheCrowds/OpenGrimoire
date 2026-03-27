# `NEXT_PUBLIC_*` variables and brain-map auth

## SQLite and admin session (server-only)

- **Database:** Alignment, survey, and moderation data use **`better-sqlite3`** on the server only (`OPENGRIMOIRE_DB_PATH`, default `data/opengrimoire.sqlite`). Clients never open the DB file.
- **Admin session:** **`OPENGRIMOIRE_SESSION_SECRET`** signs the `opengrimoire_session` cookie. **`OPENGRIMOIRE_ADMIN_PASSWORD`** / **`OPENGRIMOIRE_ADMIN_PASSWORD_HASH`** authenticate `/login`. Never prefix secrets with `NEXT_PUBLIC_`.

SQLite has no row-level security; **authorization is enforced in Route Handlers** (public alignment = optional header gate; admin = valid session cookie).

## Brain map graph (`/api/brain-map/graph`)

The API route compares the `x-brain-map-key` header to **`BRAIN_MAP_SECRET`** (server-only).

**Static bypass:** Files may still exist under `public/` for the server route to read, but **direct** requests to `/brain-map-graph.json` and `/brain-map-graph.local.json` are **blocked** (404) so clients must use `GET /api/brain-map/graph` with your chosen auth posture.

The UI may set that header from **`NEXT_PUBLIC_BRAIN_MAP_SECRET`** so the same value can be configured for static builds. **Important:** any `NEXT_PUBLIC_*` value is readable from the client JavaScript bundle. A motivated user can extract it and call the API with the same header.

**Implications:**

- Treat `NEXT_PUBLIC_BRAIN_MAP_SECRET` as a **shared gate token** or **obfuscation**, not a cryptographic secret.
- For stronger protection, prefer:
  - **Session or HTTP-only cookie** set after server-side login, with the route verifying the session; or
  - **Short-lived signed tokens** issued by a server route; or
  - Serving the graph only on an internal network / VPN without exposing the app to the public internet.

Document the chosen posture in your deployment runbook.

## Debug flags

- **`NEXT_PUBLIC_DEBUG_VISUALIZATION`**: enables verbose visualization hook logging. **Do not set in production** when connected to real survey data.
