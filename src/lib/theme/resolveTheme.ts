export const THEME_STORAGE_KEY = 'opengrimoire.theme';

export type ThemePreference = 'light' | 'dark' | 'system';

/** Parse stored localStorage value into a theme preference. */
export function parseThemePreference(stored: string | null): ThemePreference {
  if (stored === 'light' || stored === 'dark') return stored;
  return 'system';
}

/** Resolve whether dark mode is active from preference + OS signal. */
export function resolveIsDark(stored: string | null, prefersDark: boolean): boolean {
  if (stored === 'light') return false;
  if (stored === 'dark') return true;
  // unset or 'system' → follow OS; fallback dark when matchMedia unavailable
  return prefersDark;
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return true;
  if (!window.matchMedia) return true;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function applyDarkClass(isDark: boolean): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', isDark);
}

/**
 * Blocking inline script for root layout — must stay in sync with resolveIsDark().
 * Runs before first paint to prevent theme FOUC.
 */
export function getThemeInitScript(): string {
  const key = THEME_STORAGE_KEY;
  return `(function(){try{var s=localStorage.getItem(${JSON.stringify(key)});var d;if(s==='light')d=false;else if(s==='dark')d=true;else{d=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;}if(typeof d==='undefined')d=true;document.documentElement.classList.toggle('dark',!!d);}catch(e){document.documentElement.classList.add('dark');}})();`;
}
