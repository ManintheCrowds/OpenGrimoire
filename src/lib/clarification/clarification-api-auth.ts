import { NextResponse } from 'next/server';
import {
  checkAlignmentContextApiGate,
  type AlignmentContextGateResult,
} from '@/lib/alignment-context/api-auth';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';

/**
 * Clarification public API auth:
 * - When `CLARIFICATION_QUEUE_API_SECRET` is set: require `x-clarification-queue-key` to match.
 * - Otherwise: same gate as alignment (`ALIGNMENT_CONTEXT_API_SECRET` + `x-alignment-context-key`).
 */
export function checkClarificationApiGate(request: Request): AlignmentContextGateResult {
  const dedicated = process.env.CLARIFICATION_QUEUE_API_SECRET?.trim() ?? '';
  if (dedicated) {
    const key = request.headers.get('x-clarification-queue-key') ?? '';
    if (!timingSafeEqualString(key, dedicated)) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }
    return { ok: true };
  }
  return checkAlignmentContextApiGate(request);
}
