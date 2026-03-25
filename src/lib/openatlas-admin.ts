import type { User } from '@supabase/supabase-js';

/**
 * Admin access for OpenAtlas admin routes and UI.
 * Prefer `app_metadata.openatlas_role === 'admin'` (set via Supabase Dashboard or service role — not client-writable).
 * Falls back to `user_metadata.role === 'admin'` for legacy installs; migrate off user_metadata when possible.
 */
export function isOpenAtlasAdminUser(user: User | null | undefined): boolean {
  if (!user) return false;
  const app = user.app_metadata as { openatlas_role?: string } | undefined;
  if (app?.openatlas_role === 'admin') return true;
  if (user.user_metadata?.role === 'admin') return true;
  return false;
}
