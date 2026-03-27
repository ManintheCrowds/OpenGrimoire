import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { getModerationQueue } from '@/lib/storage/repositories/survey';

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const queue = getModerationQueue();
    return NextResponse.json(
      { items: queue },
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (e) {
    console.error('[admin/moderation-queue]', e);
    return NextResponse.json({ error: 'Failed to load queue' }, { status: 500 });
  }
}
