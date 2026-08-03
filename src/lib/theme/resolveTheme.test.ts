import { describe, expect, it } from 'vitest';

import {
  getThemeInitScript,
  parseThemePreference,
  resolveIsDark,
} from './resolveTheme';

describe('parseThemePreference', () => {
  it('returns explicit light, dark, and system', () => {
    expect(parseThemePreference('light')).toBe('light');
    expect(parseThemePreference('dark')).toBe('dark');
    expect(parseThemePreference('system')).toBe('system');
  });

  it('defaults unset and unknown to dark', () => {
    expect(parseThemePreference(null)).toBe('dark');
    expect(parseThemePreference('')).toBe('dark');
    expect(parseThemePreference('auto')).toBe('dark');
  });
});

describe('resolveIsDark', () => {
  it('honors explicit light and dark', () => {
    expect(resolveIsDark('light', true)).toBe(false);
    expect(resolveIsDark('dark', false)).toBe(true);
  });

  it('follows OS only for explicit system', () => {
    expect(resolveIsDark('system', true)).toBe(true);
    expect(resolveIsDark('system', false)).toBe(false);
  });

  it('defaults unset to dark regardless of OS', () => {
    expect(resolveIsDark(null, false)).toBe(true);
    expect(resolveIsDark(null, true)).toBe(true);
  });
});

describe('getThemeInitScript', () => {
  it('embeds system branch and dark default for unset', () => {
    const script = getThemeInitScript();
    expect(script).toContain("s==='system'");
    expect(script).toContain('else{d=true;}');
  });
});
