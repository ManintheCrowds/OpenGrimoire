import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/types';
import { isOpenAtlasAdminUser } from '@/lib/openatlas-admin';

export type RequireAdminResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/**
 * Require a logged-in Supabase user with admin role (see `isOpenAtlasAdminUser`).
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

  if (!isOpenAtlasAdminUser(user)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  return { ok: true, user };
}
