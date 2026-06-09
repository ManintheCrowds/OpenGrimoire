import type { Page } from '@playwright/test';

export const APP_THEMES = ['dark', 'light'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

/** Seed theme before first navigation; AppContext applies html.dark on load. */
export async function setAppTheme(page: Page, theme: AppTheme): Promise<void> {
  await page.addInitScript((t: string) => {
    window.localStorage.setItem('opengrimoire.theme', t);
  }, theme);
}
