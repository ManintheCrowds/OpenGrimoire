import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export const ALIGNMENT_CONTEXT_SELECT =
  'id,title,body,tags,priority,status,linked_node_id,attendee_id,source,created_by,created_at,updated_at';

export type AlignmentAdminClient = SupabaseClient<Database>;

export async function listAlignmentContextItems(
  admin: AlignmentAdminClient,
  options: { statusFilter: string | null; limit: number }
) {
  let q = admin
    .from('alignment_context_items')
    .select(ALIGNMENT_CONTEXT_SELECT)
    .order('created_at', { ascending: false })
    .limit(options.limit);

  if (
    options.statusFilter &&
    ['draft', 'active', 'archived'].includes(options.statusFilter)
  ) {
    q = q.eq('status', options.statusFilter);
  }

  return q;
}
