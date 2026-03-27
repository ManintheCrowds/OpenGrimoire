import { NextResponse } from 'next/server';
import { timingSafeEqualString } from '@/lib/crypto/timing-safe-compare';

/** Result of checking the shared-secret gate for public alignment-context API routes. */
export type AlignmentContextGateResult =
  | { ok: true }
  | { ok: false; response: NextResponse };

/**
 * When `ALIGNMENT_CONTEXT_API_SECRET` is set: require matching `x-alignment-context-key` (401 if wrong).
 * When unset: require `ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true` for open access (local dev only).
 * Never use the insecure flag on public deployments — set a real secret instead.
 */
export function checkAlignmentContextApiGate(request: Request): AlignmentContextGateResult {
  const secretRaw = process.env.ALIGNMENT_CONTEXT_API_SECRET;
  const secret = typeof secretRaw === 'string' ? secretRaw.trim() : '';
  const allowInsecureLocal =
    process.env.ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL === 'true';
  const isProduction = process.env.NODE_ENV === 'production';

  if (secret) {
    const key = request.headers.get('x-alignment-context-key') ?? '';
    if (!timingSafeEqualString(key, secret)) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      };
    }
    return { ok: true };
  }

  if (allowInsecureLocal && !isProduction) {
    return { ok: true };
  }

  if (isProduction) {
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

  return {
    ok: false,
    response: NextResponse.json(
      {
        error: 'Misconfigured',
        detail:
          'Set ALIGNMENT_CONTEXT_API_SECRET (recommended) or ALIGNMENT_CONTEXT_ALLOW_INSECURE_LOCAL=true for trusted local development only. See docs/AGENT_INTEGRATION.md.',
      },
      { status: 503 }
    ),
  };
}
