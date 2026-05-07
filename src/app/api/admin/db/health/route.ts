import { NextResponse } from 'next/server';
import { requireOpenGrimoireAdminRoute } from '@/lib/alignment-context/admin-auth';
import { getSqlite } from '@/db/client';

const REQUIRED_TABLES = ['survey_responses', 'clarification_requests', 'study_reviews'] as const;

export async function GET() {
  const auth = await requireOpenGrimoireAdminRoute();
  if (!auth.ok) return auth.response;

  const sqlite = getSqlite();
  const pragma = sqlite.pragma('journal_mode', { simple: true });
  const userVersion = sqlite.pragma('user_version', { simple: true });
  const freelistCount = sqlite.pragma('freelist_count', { simple: true });
  const pageCount = sqlite.pragma('page_count', { simple: true });

  const tableChecks = REQUIRED_TABLES.map((table) => {
    const row = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
    return { table, exists: Boolean(row) };
  });

  return NextResponse.json(
    {
      panel: 'sqlite-schema-health',
      schemaVersion: Number(userVersion ?? 0),
      journalMode: String(pragma ?? 'unknown').toUpperCase(),
      tableChecks,
      vacuum: {
        pageCount: Number(pageCount ?? 0),
        freelistCount: Number(freelistCount ?? 0),
      },
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
