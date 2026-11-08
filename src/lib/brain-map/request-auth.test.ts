import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authorizeBrainMapRequest } from './request-auth';

const mocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  logAccessDenied: vi.fn(),
  verifyAdminSessionToken: vi.fn(),
}));

vi.mock('next/headers', () => ({ cookies: mocks.cookies }));
vi.mock('@/lib/auth/session', () => ({
  OPENGRIMOIRE_SESSION_COOKIE: 'opengrimoire_session',
  verifyAdminSessionToken: mocks.verifyAdminSessionToken,
}));
vi.mock('@/lib/observability/access-denial-log', () => ({ logAccessDenied: mocks.logAccessDenied }));

const req = (headers: Record<string, string> = {}) =>
  new Request('http://localhost/api/brain-map/graph', { headers });

describe('authorizeBrainMapRequest', () => {
  beforeEach(() => {
    mocks.cookies.mockResolvedValue({ get: () => undefined });
    mocks.verifyAdminSessionToken.mockResolvedValue(null);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('fails closed with 503 in production when BRAIN_MAP_SECRET is unset', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BRAIN_MAP_SECRET', '');
    const result = await authorizeBrainMapRequest(req());
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(503);
      const body = await result.response.json();
      expect(body.error).toMatch(/BRAIN_MAP_SECRET/);
    }
    expect(mocks.logAccessDenied).toHaveBeenCalledWith(
      expect.objectContaining({ gate: 'brain_map', reason: 'misconfigured', status: 503 }),
    );
  });

  it('keeps the open local default outside production when the secret is unset', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('BRAIN_MAP_SECRET', '');
    expect((await authorizeBrainMapRequest(req())).ok).toBe(true);
  });

  it('in production with a secret, accepts the matching header and rejects anonymous', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('BRAIN_MAP_SECRET', 'brain-map-secret');
    expect((await authorizeBrainMapRequest(req({ 'x-brain-map-key': 'brain-map-secret' }))).ok).toBe(true);
    const anon = await authorizeBrainMapRequest(req());
    expect(anon.ok).toBe(false);
    if (!anon.ok) expect(anon.response.status).toBe(401);
  });
});
