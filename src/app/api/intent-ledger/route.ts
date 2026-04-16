import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { listIntentLedger } from '@/lib/storage/repositories/intent-ledger';

export async function GET(request: Request) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) {
    return gate.response;
  }

  const { data, error } = listIntentLedger();
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[intent-ledger] list failed:', error.code, error.message);
    } else {
      console.error('[intent-ledger] list failed:', error.code);
    }
    return NextResponse.json({ error: 'Failed to load intent ledger' }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] }, { headers: { 'Cache-Control': 'private, no-store' } });
}
