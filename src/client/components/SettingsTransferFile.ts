import { effectiveTheme, readStoredTheme, THEME_KEY, type Theme, writeStoredTheme } from './themeModel.ts';

/*
 * The browser side of the settings file (WP5-UX4-T05): downloading the text of a file, reading a chosen one, and the theme of
 * this device. Nothing here talks to the server; a file is created and read only in the person's browser.
 */

/** The current instant as a UTC instant in whole seconds (`2026-10-20T16:40:00Z`). */
export function utcNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Offers `text` as a download named `name`; the object URL lives only until the click has been handled. */
export function downloadTextFile(name: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.hidden = true;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The theme in effect on this device: the stored choice, else the device's own setting. */
export function deviceTheme(): Theme {
  return effectiveTheme(readStoredTheme(storage()), window.matchMedia('(prefers-color-scheme: dark)').matches);
}

/**
 * Stores a theme choice for this device and shows it: the stylesheet reads `data-theme` on <html>, set here because the theme
 * control may not be on screen; a mounted control listens to `storage` events and re-reads the store, so it follows too. False
 * when the browser refused to store the choice (it then lasts until the page is closed).
 */
export function applyDeviceTheme(theme: Theme): boolean {
  const stored = writeStoredTheme(storage(), theme);
  document.documentElement.setAttribute('data-theme', theme);
  window.dispatchEvent(new StorageEvent('storage', { key: THEME_KEY }));
  return stored;
}

/** "2026-10-20 16:40 UTC" from a UTC instant. */
export function utcText(instant: string): string {
  return `${instant.slice(0, 10)} ${instant.slice(11, 16)} UTC`;
}
