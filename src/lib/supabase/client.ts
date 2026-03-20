import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use this file as the single source for the Supabase client throughout the app.
// Never log NEXT_PUBLIC_SUPABASE_ANON_KEY (or any key material) — it leaks in CI/build logs.

if (
  process.env.NEXT_PUBLIC_DEBUG_SUPABASE === '1' &&
  process.env.NODE_ENV === 'development'
) {
  console.info('[supabase] client init', {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  });
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
); 