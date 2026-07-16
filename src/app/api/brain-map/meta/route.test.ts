import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const dependencyMocks = vi.hoisted(() => ({
  cookies: vi.fn(),
  logAccessDenied: vi.fn(),
  readBrainMapSourcesConfig: vi.fn(),
  resolveActiveGraphPath: vi.fn(),
  stat: vi.fn(),
  verifyAdminSessionToken: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: dependencyMocks.cookies,
}));

vi.mock('fs/promises', () => ({
  stat: dependencyMocks.stat,
}));

vi.mock('@/lib/auth/session', () => ({
  OPENGRIMOIRE_SESSION_COOKIE: 'opengrimoire_session',
  verifyAdminSessionToken: dependencyMocks.verifyAdminSessionToken,
}));

vi.mock('@/lib/observability/access-denial-log', () => ({
  logAccessDenied: dependencyMocks.logAccessDenied,
}));

vi.mock('@/lib/brain-map/sources-config', () => ({
  readBrainMapSourcesConfig: dependencyMocks.readBrainMapSourcesConfig,
  resolveActiveGraphPath: dependencyMocks.resolveActiveGraphPath,
}));

describe('GET /api/brain-map/meta', () => {
  beforeEach(() => {
    vi.stubEnv('BRAIN_MAP_SECRET', 'brain-map-secret');
    dependencyMocks.cookies.mockReturnValue({ get: () => undefined });
    dependencyMocks.verifyAdminSessionToken.mockResolvedValue(null);
    dependencyMocks.readBrainMapSourcesConfig.mockResolvedValue({
      vaultRoots: ['/private/operator/vault'],
      vaultLabels: ['private'],
      stateDirs: ['/private/operator/state'],
      stateLabels: ['state'],
      updatedAt: '2026-07-16T00:00:00.000Z',
    });
    dependencyMocks.resolveActiveGraphPath.mockReturnValue({
      path: '/workspace/public/brain-map-graph.local.json',
      source: 'local',
    });
    dependencyMocks.stat.mockResolvedValue({
      mtime: new Date('2026-07-16T00:00:00.000Z'),
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('rejects anonymous requests when the graph is protected', async () => {
    const response = await GET(
      new Request('http://localhost/api/brain-map/meta'),
    );

    expect(response.status).toBe(401);
    expect(dependencyMocks.readBrainMapSourcesConfig).not.toHaveBeenCalled();
  });

  it('accepts the same secret header as the graph route', async () => {
    const response = await GET(
      new Request('http://localhost/api/brain-map/meta', {
        headers: { 'x-brain-map-key': 'brain-map-secret' },
      }),
    );

    expect(response.status).toBe(200);
    expect(dependencyMocks.readBrainMapSourcesConfig).toHaveBeenCalledOnce();
  });
});
