# OpenAtlas admin role (Supabase)

**Preferred:** `app_metadata.openatlas_role === 'admin'` — set via **Supabase Dashboard → Authentication → Users → user → App metadata** (JSON), or with the **service role** from a trusted backend (users cannot safely self-assign).

**Legacy:** `user_metadata.role === 'admin'` is still accepted in code ([`src/lib/openatlas-admin.ts`](../../src/lib/openatlas-admin.ts)) for existing installs. Migrate to `app_metadata` when possible so roles are not client-writable.

## Example (Dashboard)

```json
{
  "openatlas_role": "admin"
}
```

Place under **App metadata** for the user.

## Example (SQL, service role only)

Run in Supabase SQL editor with appropriate privileges; adjust user id.

```sql
-- Example: promote by email (use Supabase auth helpers in practice)
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || '{"openatlas_role": "admin"}'::jsonb
where email = 'operator@example.com';
```

Confirm your project allows updating `raw_app_meta_data` from SQL; some teams use Edge Functions instead.
