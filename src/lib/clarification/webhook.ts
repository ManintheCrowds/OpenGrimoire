import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Fire-and-forget POST to CLARIFICATION_WEBHOOK_URL when a clarification is resolved.
 * Payload: JSON { id, status, item }.
 * Header X-OpenGrimoire-Signature: sha256=<hex> of raw body when CLARIFICATION_WEBHOOK_SECRET is set.
 */
export function notifyClarificationResolved(item: unknown): void {
  const url = process.env.CLARIFICATION_WEBHOOK_URL?.trim();
  if (!url) {
    return;
  }

  const secret = process.env.CLARIFICATION_WEBHOOK_SECRET?.trim() ?? '';
  const body = JSON.stringify(item);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'OpenGrimoire/1.0',
  };
  if (secret) {
    const sig = createHmac('sha256', secret).update(body).digest('hex');
    headers['X-OpenGrimoire-Signature'] = `sha256=${sig}`;
  }

  void fetch(url, { method: 'POST', headers, body }).catch((err) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[clarification-webhook] delivery failed:', err);
    } else {
      console.error('[clarification-webhook] delivery failed');
    }
  });
}

/** Verify signature from webhook receiver tests (optional). */
export function verifyClarificationWebhookSignature(body: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader?.startsWith('sha256=') || !secret) {
    return false;
  }
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  const received = signatureHeader.slice('sha256='.length);
  if (expected.length !== received.length || !/^[0-9a-f]+$/i.test(received)) {
    return false;
  }
  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(expected, 'hex');
    b = Buffer.from(received, 'hex');
  } catch {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
