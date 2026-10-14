import { useSyncExternalStore } from 'react';
import { effectiveTheme, nextTheme, readStoredTheme, THEME_KEY, type Theme, type ThemeStorage, writeStoredTheme } from './themeModel.ts';

/*
 * The "Dark mode" toggle of the main navigation (WP5-UX2-T01). The theme in effect is the person's
 * choice (local storage, per device) or, until the first press, the device's (the media query below).
 * `data-theme` on <html> carries an explicit choice for the stylesheet; with no choice the attribute is
 * absent and the CSS follows the device by itself. Every toggle in the page (the desktop bar and the
 * phone's More panel) reads the same store, and a `storage` event keeps other tabs in step.
 */

const DARK_QUERY = '(prefers-color-scheme: dark)';

function browserStorage(): ThemeStorage | null {
  try {
    return window.localStorage;
  } catch {
    // Reading the property itself throws when storage is blocked.
    return null;
  }
}

/** The choice of this page when the storage refused it: it then lasts until the page is closed. */
let pageChoice: Theme | null = null;
const pressListeners = new Set<() => void>();

function chosenTheme(): Theme | null {
  return pageChoice ?? readStoredTheme(browserStorage());
}

/** Mirrors the choice into the attribute the stylesheet reads; no choice means follow the device. */
function applyChoice(): void {
  const choice = chosenTheme();
  if (choice === null) document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', choice);
}

function chooseTheme(theme: Theme): void {
  pageChoice = writeStoredTheme(browserStorage(), theme) ? null : theme;
  applyChoice();
  for (const listener of pressListeners) listener();
}

function subscribe(notify: () => void): () => void {
  const device = window.matchMedia(DARK_QUERY);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== THEME_KEY) return;
    applyChoice();
    notify();
  };
  applyChoice();
  pressListeners.add(notify);
  device.addEventListener('change', notify);
  window.addEventListener('storage', onStorage);
  return () => {
    pressListeners.delete(notify);
    device.removeEventListener('change', notify);
    window.removeEventListener('storage', onStorage);
  };
}

function currentTheme(): Theme {
  return effectiveTheme(chosenTheme(), window.matchMedia(DARK_QUERY).matches);
}

/**
 * A two-state button: the name stays "Dark mode" and `aria-pressed` tells whether the dark theme is in
 * effect (also when it is the device's). The half-disc glyph is decoration drawn in CSS.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, currentTheme);
  return (
    <button
      type="button"
      className={className === undefined ? 'quiet theme-toggle' : `quiet theme-toggle ${className}`}
      aria-pressed={theme === 'dark'}
      onClick={() => chooseTheme(nextTheme(theme))}
    >
      <span className="theme-glyph" aria-hidden="true" />
      Dark mode
    </button>
  );
}
