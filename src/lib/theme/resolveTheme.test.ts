import { describe, expect, it, vi } from 'vitest';

import {
  THEME_STORAGE_KEY,
  readStoredThemeValue,
  writeStoredThemePreference,
} from './resolveTheme';

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
});
