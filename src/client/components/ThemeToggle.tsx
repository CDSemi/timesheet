import { useId, useSyncExternalStore } from 'react';
import { effectiveTheme, readStoredTheme, THEME_KEY, type Theme, type ThemeStorage, writeStoredTheme } from './themeModel.ts';

/*
 * The theme control of the main navigation (WP5-UX2-T01; a Light/Dark segmented control since WP5-UX2-T07).
 * The theme in effect is the person's choice (local storage, per device) or, until the first choice, the
 * device's (the media query below).
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

/** The two icons: a sun and a moon drawn here (24-unit grid, stroke in the text colour), decoration only. */
function ThemeIcon({ theme }: { theme: Theme }) {
  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {theme === 'light' ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </>
      ) : (
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      )}
    </svg>
  );
}

const OPTIONS: ReadonlyArray<{ theme: Theme; label: string }> = [
  { theme: 'light', label: 'Light' },
  { theme: 'dark', label: 'Dark' },
];

/**
 * A segmented control of two native radios, "Light" (sun) and "Dark" (moon), in a radio group named
 * "Theme". The checked radio is the theme in effect, also before any choice (then it is the device's);
 * choosing the other one stores it. The arrow keys move the choice as they do in any native radio group.
 * The radio itself is invisible and covers its label, so the label paints the segment.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, currentTheme);
  // The bar's control and the More panel's are both in the page (one hidden by the layout): each is its own
  // radio group, or checking a radio of one would uncheck the same-named radio of the other.
  const groupName = `theme-${useId()}`;
  return (
    <div role="radiogroup" aria-label="Theme" className={className === undefined ? 'theme-switch' : `theme-switch ${className}`}>
      {OPTIONS.map((option) => (
        <label key={option.theme} className="theme-option">
          <input type="radio" name={groupName} value={option.theme} checked={theme === option.theme} onChange={() => chooseTheme(option.theme)} />
          <ThemeIcon theme={option.theme} />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
