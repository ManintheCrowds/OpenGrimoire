import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { isAllowedOperatorProbeTargetHost } from '@/lib/operator-observability/allowlist';
import { requireOperatorProbeIngestOrAdminSession } from '@/lib/operator-observability/ingest-auth';
import { operatorProbeIngestBodySchema } from '@/lib/operator-observability/schemas';
import { insertOperatorProbeRun } from '@/lib/storage/repositories/operator-probes';

export async function POST(request: Request) {
  const auth = await requireOperatorProbeIngestOrAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = operatorProbeIngestBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', detail: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const body = parsed.data;
  const host = body.target_host.trim().toLowerCase();
  if (!isAllowedOperatorProbeTargetHost(host)) {
    return NextResponse.json(
      { error: 'Invalid target_host', detail: 'Host is not on the operator probe allowlist.' },
      { status: 400 }
    );
  }

  let summaryJson: string;
  try {
    summaryJson = JSON.stringify(body.summary);
  } catch {
    return NextResponse.json({ error: 'summary must be JSON-serializable' }, { status: 400 });
  }

  const row = insertOperatorProbeRun({
    probeType: body.probe_type,
    targetHost: host,
    runnerId: body.runner_id.trim(),
    runnerType: body.runner_type,
    summaryJson,
    rawBlob: body.raw_blob?.length ? body.raw_blob : null,
    ingestVia: auth.via === 'session' ? 'session' : 'ingest_secret',
  });

  console.info(
    JSON.stringify({
      event: 'operator_probe_ingested',
      run_id: row.id,
      via: auth.via,
      probe_type: row.probe_type,
      target_host: row.target_host,
      request_id: randomUUID(),
    })
  );

  return NextResponse.json(
    { id: row.id, expires_at: row.expires_at },
    { status: 201, headers: { 'Cache-Control': 'private, no-store' } }
  );
}
