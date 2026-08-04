import { describe, expect, it, vi } from 'vitest';

import {
  THEME_STORAGE_KEY,
  getSystemPrefersDark,
  getThemeInitScript,
  parseThemePreference,
  readStoredThemeValue,
  resolveIsDark,
  writeStoredThemePreference,
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

describe('theme storage helpers', () => {
  it('falls back to unset when theme storage cannot be read', () => {
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('storage denied');
      }),
    };

    expect(readStoredThemeValue(storage)).toBeNull();
  });

  it('reports failed writes without throwing', () => {
    const storage = {
      setItem: vi.fn(() => {
        throw new Error('storage denied');
      }),
    };

    expect(writeStoredThemePreference('dark', storage)).toBe(false);
    expect(storage.setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, 'dark');
  });

  it('returns a dark fallback when matchMedia throws', () => {
    const globalWithWindow = globalThis as { window?: { matchMedia?: unknown } };
    const previous = globalWithWindow.window;
    globalWithWindow.window = {
      matchMedia: () => {
        throw new Error('matchMedia denied');
      },
    };

    try {
      expect(getSystemPrefersDark()).toBe(true);
    } finally {
      if (previous === undefined) {
        delete globalWithWindow.window;
      } else {
        globalWithWindow.window = previous;
      }
    }
  });
});
