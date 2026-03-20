import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/types';

export type RequireAdminResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/**
 * Require a logged-in Supabase user with `user_metadata.role === 'admin'`.
 * Uses auth cookies (same session as `/admin`).
 */
export async function requireOpenAtlasAdminRoute(): Promise<RequireAdminResult> {
  const supabase = createRouteHandlerClient<Database>({ cookies });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  const role = user.user_metadata?.role;
  if (role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, user };
}
