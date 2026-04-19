import { describe, expect, it } from 'vitest';

import { ALLOWED_OPERATOR_PROBE_TARGET_HOSTS, isAllowedOperatorProbeTargetHost } from './allowlist';

describe('operator probe target allowlist', () => {
  it('allows api.cursor.com case-insensitively', () => {
    expect(isAllowedOperatorProbeTargetHost('api.cursor.com')).toBe(true);
    expect(isAllowedOperatorProbeTargetHost('API.CURSOR.COM')).toBe(true);
    expect(isAllowedOperatorProbeTargetHost(' api.cursor.com ')).toBe(true);
  });

  it('rejects arbitrary hosts', () => {
    expect(isAllowedOperatorProbeTargetHost('169.254.169.254')).toBe(false);
    expect(isAllowedOperatorProbeTargetHost('metadata.google.internal')).toBe(false);
    expect(isAllowedOperatorProbeTargetHost('evil.com')).toBe(false);
  });

  it('documents allowlist is small and intentional', () => {
    expect(ALLOWED_OPERATOR_PROBE_TARGET_HOSTS).toEqual(['api.cursor.com']);
  });
});
