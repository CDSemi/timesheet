import { useSyncExternalStore } from 'react';

/** True while a media query matches (`SHELL_QUERY`, `SHEET_QUERY`); the layouts that depend on it are chosen with it, never both at once. */
export function useMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', notify);
      return () => list.removeEventListener('change', notify);
    },
    () => window.matchMedia(query).matches,
  );
}
