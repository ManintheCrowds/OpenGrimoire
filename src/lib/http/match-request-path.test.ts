import { describe, expect, it } from 'vitest';
import { pathnameTargetsExact, pathnameTargetsPrefix } from './match-request-path';

describe('pathnameTargetsExact', () => {
  it('matches the path and a locale-prefixed form', () => {
    expect(pathnameTargetsExact('/api/survey', '/api/survey')).toBe(true);
    expect(pathnameTargetsExact('/zz/api/survey', '/api/survey')).toBe(true);
    expect(pathnameTargetsExact('/a/b/api/auth/login', '/api/auth/login')).toBe(true);
  });

  it('does not match a longer sibling segment', () => {
    expect(pathnameTargetsExact('/api/surveys', '/api/survey')).toBe(false);
    expect(pathnameTargetsExact('/api/openapi.json', '/api/openapi')).toBe(false);
    expect(pathnameTargetsExact('/api/survey/extra', '/api/survey')).toBe(false);
  });
});

describe('pathnameTargetsPrefix', () => {
  it('matches a dev route and a locale-prefixed form', () => {
    expect(pathnameTargetsPrefix('/test', '/test')).toBe(true);
    expect(pathnameTargetsPrefix('/test/nested', '/test')).toBe(true);
    expect(pathnameTargetsPrefix('/xx/test', '/test')).toBe(true);
    expect(pathnameTargetsPrefix('/a/b/test-sqlite/child', '/test-sqlite')).toBe(true);
  });

  it('does not treat a longer prefix as /test', () => {
    expect(pathnameTargetsPrefix('/test-chord', '/test')).toBe(false);
    expect(pathnameTargetsPrefix('/xx/test-chord', '/test')).toBe(false);
    expect(pathnameTargetsPrefix('/contest', '/test')).toBe(false);
  });
});
