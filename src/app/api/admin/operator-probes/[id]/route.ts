import { NextResponse } from 'next/server';
import { requireOperatorProbeAdminRoute } from '@/lib/operator-observability/admin-probe-auth';
import {
  deleteOperatorProbeRunById,
  getOperatorProbeRunById,
} from '@/lib/storage/repositories/operator-probes';

type RouteContext = { params: { id: string } };

export async function GET(request: Request, context: RouteContext) {
  const auth = await requireOperatorProbeAdminRoute(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = context.params;
  const row = getOperatorProbeRunById(id);
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  console.info(
    JSON.stringify({
      event: 'operator_probe_viewed',
      run_id: row.id,
      auth_via: auth.via,
    })
  );

  let summary: unknown;
  try {
    summary = JSON.parse(row.summary_json) as unknown;
  } catch {
    summary = null;
  }

  return NextResponse.json(
    {
      id: row.id,
      created_at: row.created_at,
      probe_type: row.probe_type,
      target_host: row.target_host,
      runner_id: row.runner_id,
      runner_type: row.runner_type,
      raw_blob: row.raw_blob,
      ingest_via: row.ingest_via,
      expires_at: row.expires_at,
      summary,
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireOperatorProbeAdminRoute(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = context.params;
  const row = getOperatorProbeRunById(id);
  if (!row) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const deleted = deleteOperatorProbeRunById(id);
  if (!deleted) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  console.info(
    JSON.stringify({
      event: 'operator_probe_deleted',
      run_id: id,
      auth_via: auth.via,
    })
  );

  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
