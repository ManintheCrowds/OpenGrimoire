import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import {
  backupDatabaseFile,
  exportManagedTable,
  getRetentionPolicy,
  pruneManagedTables,
} from '@/lib/storage/repositories/data-lifecycle';

export async function GET(request: Request) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const action = (url.searchParams.get('action') ?? 'policy').toLowerCase();
  const table = url.searchParams.get('table');

  if (action === 'export' && table && ['survey_responses', 'clarification_requests', 'study_reviews'].includes(table)) {
    return NextResponse.json({ table, rows: exportManagedTable(table as never) }, { headers: { 'Cache-Control': 'private, no-store' } });
  }

  return NextResponse.json({ retentionDays: getRetentionPolicy() }, { headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request: Request) {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) return auth.response;

  const body = (await request.json().catch(() => ({}))) as { action?: string };
  const action = (body.action ?? '').toLowerCase();

  if (action === 'prune') {
    const deleted = pruneManagedTables();
    return NextResponse.json({ ok: true, deleted, retentionDays: getRetentionPolicy() });
  }

  if (action === 'backup') {
    const backupPath = backupDatabaseFile();
    return NextResponse.json({ ok: true, backupPath });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
