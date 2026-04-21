import { NextResponse } from 'next/server';
import { requireOperatorProbeAdminRoute } from '@/lib/operator-observability/admin-probe-auth';
import { listOperatorProbeRuns } from '@/lib/storage/repositories/operator-probes';

export async function GET(request: Request) {
  const auth = await requireOperatorProbeAdminRoute(request);
  if (!auth.ok) {
    return auth.response;
  }

  const items = listOperatorProbeRuns(200).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    probe_type: r.probe_type,
    target_host: r.target_host,
    runner_id: r.runner_id,
    runner_type: r.runner_type,
    ingest_via: r.ingest_via,
    expires_at: r.expires_at,
    summary: safeJsonSummary(r.summary_json),
  }));

  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'private, no-store' } });
}

function safeJsonSummary(summaryJson: string): unknown {
  try {
    return JSON.parse(summaryJson) as unknown;
  } catch {
    return { _parse_error: true };
  }
}
