import { NextResponse } from 'next/server';

/** Result of checking the shared-secret gate for public alignment-context API routes. */
export type AlignmentContextGateResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * Production: require non-empty ALIGNMENT_CONTEXT_API_SECRET (503 if missing).
 * When secret is set: require matching x-alignment-context-key (401 if wrong).
 * Development with no secret: open (use localhost / VPN only).
 */
export function checkAlignmentContextApiGate(request: Request): AlignmentContextGateResult {
  const secretRaw = process.env.ALIGNMENT_CONTEXT_API_SECRET;
  const secret = typeof secretRaw === 'string' ? secretRaw.trim() : '';
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction && !secret) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Misconfigured',
          detail:
            'ALIGNMENT_CONTEXT_API_SECRET is required when NODE_ENV=production. Set it and send header x-alignment-context-key on each request.',
        },
        { status: 503 }
      ),
    };
  }

  if (secret) {
    const key = request.headers.get('x-alignment-context-key');
    if (key !== secret) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }
  }

  return { ok: true };
}
