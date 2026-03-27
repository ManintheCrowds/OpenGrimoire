# OpenGrimoire admin (local operator session)

Admin UI (`/admin`, `/admin/alignment`, moderation, etc.) is gated by a **signed HTTP-only cookie** (`opengrimoire_session`), not Supabase or JWT app metadata.

## Configure

1. **`OPENGRIMOIRE_SESSION_SECRET`** — long random string used to sign session tokens (required for production).
2. **Operator password** — one of:
   - **`OPENGRIMOIRE_ADMIN_PASSWORD`** — plaintext (dev only; rotate for anything exposed), or
   - **`OPENGRIMOIRE_ADMIN_PASSWORD_HASH`** — bcrypt hash of the operator password (preferred for production).

See `.env.example` for names and notes.

## Login flow

- User opens **`/login`**, submits password.
- **`POST /api/auth/login`** verifies the password and sets the session cookie.
- **`POST /api/auth/logout`** clears it.
- **`GET /api/auth/session`** returns whether a valid session exists (for client checks).

## Legacy Supabase role model

Older deployments used **`app_metadata.opengrimoire_role === 'admin'`** in Supabase JWTs. That path has been **removed**; use env-based operator auth only.

## Backup

Survey and alignment data live in **`OPENGRIMOIRE_DB_PATH`** (default `data/opengrimoire.sqlite`). Back up that file with your operator credentials; it is gitignored by default.
