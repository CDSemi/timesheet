/**
 * The colour theme choice (WP5-UX2-T01). Two states only, light and dark. Until the first press there
 * is no stored value and the page follows the device (the CSS media query); the first press stores the
 * opposite of the effective theme in this browser's local storage under `timesheet.theme`. The choice is
 * a per-device display preference, not business data: it never reaches the server.
 */

export type Theme = 'light' | 'dark';

/** The local-storage key; src/client/public/theme-init.js reads the same key before the first paint. */
export const THEME_KEY = 'timesheet.theme';

/** The part of `Storage` the model uses; a test passes a stand-in. */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/** A stored value as a theme; anything else (absent, empty, a stale or foreign value) is no choice. */
export function parseStoredTheme(value: string | null | undefined): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

/** The theme in effect: the person's choice when there is one, else the device's. */
export function effectiveTheme(stored: Theme | null, deviceIsDark: boolean): Theme {
  return stored ?? (deviceIsDark ? 'dark' : 'light');
}

/** What a press switches to. */
export function nextTheme(current: Theme): Theme {
  return current === 'dark' ? 'light' : 'dark';
}

/** The stored choice, or null when none is stored or the storage cannot be read (blocked, private mode). */
export function readStoredTheme(storage: ThemeStorage | null): Theme | null {
  if (storage === null) return null;
  try {
    return parseStoredTheme(storage.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

/** Stores the choice; false when the storage refused it (the choice then lasts for the page only). */
export function writeStoredTheme(storage: ThemeStorage | null, theme: Theme): boolean {
  if (storage === null) return false;
  try {
    storage.setItem(THEME_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
