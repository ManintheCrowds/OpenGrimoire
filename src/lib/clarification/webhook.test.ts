import { createHmac } from 'crypto';
import { describe, expect, it } from 'vitest';
import { verifyClarificationWebhookSignature } from './webhook';

describe('verifyClarificationWebhookSignature', () => {
  const secret = 'test-secret';
  const body = '{"id":"x","status":"answered"}';
  const sig = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;

  it('accepts valid sha256 signature', () => {
    expect(verifyClarificationWebhookSignature(body, sig, secret)).toBe(true);
  });

  it('rejects wrong secret', () => {
    expect(verifyClarificationWebhookSignature(body, sig, 'other')).toBe(false);
  });

  it('rejects tampered body', () => {
    expect(verifyClarificationWebhookSignature(body + ' ', sig, secret)).toBe(false);
  });

  it('rejects malformed hex', () => {
    expect(verifyClarificationWebhookSignature(body, 'sha256=zzzz', secret)).toBe(false);
  });

  it('rejects missing header', () => {
    expect(verifyClarificationWebhookSignature(body, null, secret)).toBe(false);
  });
});
