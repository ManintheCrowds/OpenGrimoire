import { stat } from 'node:fs/promises';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  cookieValue: undefined as string | undefined,
  logAccessDenied: vi.fn(),
  readBrainMapSourcesConfig: vi.fn(),
  resolveActiveGraphPath: vi.fn(),
  verifyAdminSessionToken: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({
    get: () => (mocks.cookieValue ? { value: mocks.cookieValue } : undefined),
  }),
}));

vi.mock('node:fs/promises', () => ({
  stat: vi.fn(),
}));

vi.mock('@/lib/auth/session', () => ({
  OPENGRIMOIRE_SESSION_COOKIE: 'opengrimoire_session',
  verifyAdminSessionToken: mocks.verifyAdminSessionToken,
}));

vi.mock('@/lib/brain-map/sources-config', () => ({
  readBrainMapSourcesConfig: mocks.readBrainMapSourcesConfig,
  resolveActiveGraphPath: mocks.resolveActiveGraphPath,
}));

vi.mock('@/lib/observability/access-denial-log', () => ({
  logAccessDenied: mocks.logAccessDenied,
}));

import { GET } from './route';

describe('GET /api/brain-map/meta', () => {
  beforeEach(() => {
    delete process.env.BRAIN_MAP_SECRET;
    mocks.cookieValue = undefined;
    vi.clearAllMocks();
    mocks.readBrainMapSourcesConfig.mockResolvedValue({
      vaultRoots: ['/private/vault'],
      vaultLabels: [],
      stateDirs: ['/private/state'],
      stateLabels: [],
      updatedAt: '2026-07-13T00:00:00.000Z',
    });
    mocks.resolveActiveGraphPath.mockReturnValue({
      path: '/workspace/public/brain-map-graph.local.json',
      source: 'local',
    });
    vi.mocked(stat).mockResolvedValue({ mtime: new Date('2026-07-13T00:00:00.000Z') } as never);
    mocks.verifyAdminSessionToken.mockResolvedValue(null);
  });

  it('stays public when BRAIN_MAP_SECRET is not configured', async () => {
    const response = await GET(new Request('http://localhost/api/brain-map/meta'));

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      sources: {
        vaultRoots: ['/private/vault'],
        stateDirs: ['/private/state'],
      },
      graph: {
        variant: 'local',
        mtime: '2026-07-13T00:00:00.000Z',
      },
    });
  });

  it('rejects anonymous metadata reads when BRAIN_MAP_SECRET is configured', async () => {
    process.env.BRAIN_MAP_SECRET = 'brain-map-secret';

    const response = await GET(new Request('http://localhost/api/brain-map/meta'));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
    expect(mocks.readBrainMapSourcesConfig).not.toHaveBeenCalled();
  });

  it('allows metadata reads with the configured brain-map header secret', async () => {
    process.env.BRAIN_MAP_SECRET = 'brain-map-secret';

    const response = await GET(
      new Request('http://localhost/api/brain-map/meta', {
        headers: { 'x-brain-map-key': 'brain-map-secret' },
      })
    );

    expect(response.status).toBe(200);
    expect(mocks.readBrainMapSourcesConfig).toHaveBeenCalledTimes(1);
  });

  it('allows metadata reads with a valid operator session cookie', async () => {
    process.env.BRAIN_MAP_SECRET = 'brain-map-secret';
    mocks.cookieValue = 'valid-session';
    mocks.verifyAdminSessionToken.mockResolvedValue({ sub: 'opengrimoire-admin' });

    const response = await GET(new Request('http://localhost/api/brain-map/meta'));

    expect(response.status).toBe(200);
    expect(mocks.verifyAdminSessionToken).toHaveBeenCalledWith('valid-session');
  });
});
