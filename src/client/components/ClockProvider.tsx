import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { api, type CurrentPeriods, type Session, type TimesheetView } from '../api.ts';
import { ClockOutDialog } from './ClockOutDialog.tsx';
import { describeError } from './errors.ts';
import { displayZone } from './format.ts';
import { runningSessionOf } from './periodBarModel.ts';
import { parseSharedHash } from './sharingModel.ts';

/** The documented layout breakpoint: the clock card sits in the Timesheet page from 768px, in the top bar below it. */
export const DESKTOP_QUERY = '(min-width: 768px)';

/** True while a media query matches; the layouts that depend on it are chosen with it, never both at once. */
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

/** Finds the running session in the shown period, else in the current and in-progress periods. */
async function findRunningSession(shown: TimesheetView | null): Promise<Session | undefined> {
  const inShown = shown === null ? undefined : runningSessionOf(shown);
  if (inShown !== undefined) return inShown;
  const known = await api<CurrentPeriods>('GET', '/api/periods/current');
  const payrollDates = [...new Set([known.current.payroll_date, known.in_progress.payroll_date])];
  for (const date of payrollDates) {
    if (date === shown?.period.payroll_date) continue;
    const found = runningSessionOf(await api<TimesheetView>('GET', `/api/timesheets/${date}`));
    if (found !== undefined) return found;
  }
  return undefined;
}

/** A line the clock wants shown as a saved notice by the Timesheet page; `id` changes with every new line. */
export interface ClockNotice {
  id: number;
  text: string;
}

/** The one check in/out state of the person's own screens. */
export interface ClockState {
  /** The running session: undefined until the first check, null when checked out. */
  running: Session | null | undefined;
  /** The zone times are shown in (the browser's, never the saved reporting zone). */
  zone: string;
  /** Raised after every action, so the Timesheet page reloads its period. */
  version: number;
  /** The last failure of an action, or null. */
  error: string | null;
  /** The last confirmation ("Checked out."), or null. */
  notice: ClockNotice | null;
  checkIn: () => Promise<void>;
  /** Looks up the running session and opens the one check-out dialog. */
  openCheckOut: () => Promise<void>;
  /**
   * The Timesheet page reports the period it loaded (it holds the running session when it shows it) and
   * `null` when it goes away. While it is reported the page reloads itself after an action and this
   * provider does not read the periods a second time.
   */
  reportView: (view: TimesheetView | null) => void;
}

const ClockContext = createContext<ClockState | null>(null);

/** The check in/out state, or null where there is none (a shared view: it never acts for the owner, F-Q5). */
export function useClock(): ClockState | null {
  return useContext(ClockContext);
}

/** The hash that shows the Timesheet page, which reports its own period (an empty hash is rewritten to it). */
function onTimesheetPage(): boolean {
  return window.location.hash === '' || window.location.hash === '#/timesheet';
}

/**
 * The state of Check in/out for the person's own screens: the running session, `checkIn()`, the one
 * check-out dialog and a `version` counter. It reads the running session on mount, on every route change
 * (the Timesheet page reports its own period instead), after each action and when the tab becomes
 * visible again: one read of `/api/periods/current` plus at most the two periods' timesheets, as the
 * Timesheet page always did. With `enabled` false (a shared view) it makes no request, shows no dialog
 * and provides no state, so no screen can offer to check in or out for another person.
 *
 * Both the desktop card and the phone's bar read this one state; they are never rendered together.
 */
export function ClockProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const [running, setRunning] = useState<Session | null | undefined>(undefined);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<ClockNotice | null>(null);
  const [dialogSession, setDialogSession] = useState<Session | null>(null);
  const shown = useRef<TimesheetView | null>(null);
  /** Only the newest lookup may set the state, so an older answer never overwrites a newer one. */
  const lookup = useRef(0);
  const noticeId = useRef(0);
  /** What opened the dialog; it gets focus back when the dialog is gone. */
  const opener = useRef<HTMLElement | null>(null);

  const resolve = useCallback(async (from: TimesheetView | null) => {
    lookup.current += 1;
    const ticket = lookup.current;
    try {
      const found = await findRunningSession(from);
      if (ticket === lookup.current) setRunning(found ?? null);
    } catch {
      if (ticket === lookup.current) setRunning(null);
    }
  }, []);

  /** After an action: the Timesheet page reloads itself (and reports the result); every other screen reads the periods here. */
  const afterAction = useCallback(() => {
    setVersion((value) => value + 1);
    if (shown.current === null) void resolve(null);
  }, [resolve]);

  // Mount and route change on the person's own screens, and the tab coming back into view.
  useEffect(() => {
    if (!enabled) return;
    const refreshOffTimesheet = () => {
      // The Timesheet page reports its own period; a shared address is about to disable this provider.
      if (!onTimesheetPage() && parseSharedHash(window.location.hash) === null) void resolve(null);
    };
    const onVisible = () => {
      if (document.visibilityState !== 'visible' || parseSharedHash(window.location.hash) !== null) return;
      if (shown.current === null) void resolve(null);
      else setVersion((value) => value + 1);
    };
    refreshOffTimesheet();
    window.addEventListener('hashchange', refreshOffTimesheet);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('hashchange', refreshOffTimesheet);
      document.removeEventListener('visibilitychange', onVisible);
      // Leaving the own screens (a shared view): nothing stays open and the next visit starts from a fresh check.
      lookup.current += 1;
      setRunning(undefined);
      setDialogSession(null);
      setError(null);
    };
  }, [enabled, resolve]);

  const announce = useCallback((text: string) => {
    noticeId.current += 1;
    setNotice({ id: noticeId.current, text });
  }, []);

  const checkIn = useCallback(async () => {
    setError(null);
    try {
      await api('POST', '/api/clock/in', { input_zone: displayZone });
      afterAction();
    } catch (caught) {
      setError(describeError(caught));
    }
  }, [afterAction]);

  const openCheckOut = useCallback(async () => {
    setError(null);
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    try {
      const found = await findRunningSession(shown.current);
      if (found === undefined) setError('No running session found; reload the page.');
      else setDialogSession(found);
    } catch (caught) {
      setError(describeError(caught));
    }
  }, []);

  const reportView = useCallback(
    (view: TimesheetView | null) => {
      shown.current = view;
      if (view !== null) void resolve(view);
    },
    [resolve],
  );

  // After the dialog is gone (the page is no longer inert), focus goes back to the button that opened it.
  useEffect(() => {
    if (dialogSession !== null || opener.current === null) return;
    const element = opener.current;
    opener.current = null;
    if (element.isConnected && !element.matches(':disabled')) element.focus();
  }, [dialogSession]);

  const value = useMemo<ClockState | null>(
    () => (enabled ? { running, zone: displayZone, version, error, notice, checkIn, openCheckOut, reportView } : null),
    [enabled, running, version, error, notice, checkIn, openCheckOut, reportView],
  );

  return (
    <ClockContext.Provider value={value}>
      {children}
      {enabled && dialogSession !== null && (
        <ClockOutDialog
          session={dialogSession}
          displayZone={displayZone}
          onDone={() => {
            setDialogSession(null);
            announce('Checked out.');
            afterAction();
          }}
          onStale={() => {
            setDialogSession(null);
            announce('The running session changed elsewhere; it was reloaded. Check out again to review it.');
            afterAction();
          }}
          onClose={() => setDialogSession(null)}
        />
      )}
    </ClockContext.Provider>
  );
}
