import type { Page } from '@playwright/test';

/** Explicit themes used by axe matrix specs (light/dark only). */
export const APP_THEMES_EXPLICIT = ['dark', 'light'] as const;
export type AppThemeExplicit = (typeof APP_THEMES_EXPLICIT)[number];

/** Backward-compatible alias for axe matrix loops. */
export const APP_THEMES = APP_THEMES_EXPLICIT;

export type AppTheme = AppThemeExplicit | 'system';

/** Seed theme before first navigation; inline script + AppContext apply html.dark on load. */
export async function setAppTheme(page: Page, theme: AppTheme): Promise<void> {
  await page.addInitScript((t: string) => {
    window.localStorage.setItem('opengrimoire.theme', t);
  }, theme);
}

/** Clear stored theme so mount resolves via system / unset path. */
export async function clearAppTheme(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.removeItem('opengrimoire.theme');
  });
}
