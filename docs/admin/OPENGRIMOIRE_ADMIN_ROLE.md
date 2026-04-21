# OpenGrimoire admin (local operator session)

Admin UI (`/admin`, `/admin/alignment`, moderation, etc.) is gated by a **signed HTTP-only cookie** (`opengrimoire_session`) after operator login — not third-party hosted auth.

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

## Historical note

Older documentation referred to JWT / hosted-DB admin roles. The **only** supported model now is **env-based operator password** + **`opengrimoire_session`** cookie after `/login`.

## Backup

Survey and alignment data live in **`OPENGRIMOIRE_DB_PATH`** (default `data/opengrimoire.sqlite`). Back up that file with your operator credentials; it is gitignored by default.

## Survey visualization reads (production PII)

Admin session satisfies **`GET /api/survey/visualization`** and **`GET /api/survey/approved-qualities`** in production. If you also grant **machine** access (headers, public demo, or alignment-key escape hatch), follow [SURVEY_READ_GATING_RUNBOOK.md](./SURVEY_READ_GATING_RUNBOOK.md) so automation keys do not widen PII exposure beyond intent.
