import { NextResponse } from 'next/server';
import { checkAlignmentOrAdminSession } from '@/lib/alignment-context/api-auth';
import { getIntentLedgerByAttendee } from '@/lib/storage/repositories/intent-ledger';

type RouteContext = { params: { attendeeId: string } };

export async function GET(request: Request, context: RouteContext) {
  const gate = await checkAlignmentOrAdminSession(request);
  if (!gate.ok) {
    return gate.response;
  }

  const { attendeeId } = context.params;
  if (!attendeeId || !/^[0-9a-f-]{36}$/i.test(attendeeId)) {
    return NextResponse.json({ error: 'Invalid attendeeId' }, { status: 400 });
  }

  const { data, error } = getIntentLedgerByAttendee(attendeeId);
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[intent-ledger/:attendeeId] get failed:', error.code, error.message);
    } else {
      console.error('[intent-ledger/:attendeeId] get failed:', error.code);
    }
    return NextResponse.json({ error: 'Failed to load intent ledger record' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ item: data }, { headers: { 'Cache-Control': 'private, no-store' } });
}
