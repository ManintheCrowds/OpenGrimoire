import { describe, expect, it } from 'vitest';
import { resolveBootstrapTokenPayload } from './useSyncSessionForm';

describe('resolveBootstrapTokenPayload', () => {
  it('treats a null token as a successful token-off bootstrap', () => {
    expect(resolveBootstrapTokenPayload({ token: null })).toEqual({ status: 'ok', token: null });
  });

  it('returns a received bootstrap token for token-gated submissions', () => {
    expect(resolveBootstrapTokenPayload({ token: 'signed-token' })).toEqual({
      status: 'ok',
      token: 'signed-token',
    });
  });
});
