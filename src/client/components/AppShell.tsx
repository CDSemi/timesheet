import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { api, type ReceivedShare, type User } from '../api.ts';
import { parseReviewHash, reviewHash } from './reviewModel.ts';
import { SharingSwitcher } from './SharingSwitcher.tsx';
import { parseSharedHash, type SharedView } from './sharingModel.ts';
import { useBlockSizeProperty } from './useBlockSize.ts';

/**
 * The screens reachable from the navigation. Import (the person's own workbook and opening
 * balance, F-1) and Settings are for everyone; Admin is listed for administrators only. Hiding
 * the entry is a convenience: the server answers 403 on every admin route, so an employee who
 * types #/admin gets the timesheet and no data. `tab` marks the entries of the phone's bottom tab
 * bar; the others sit under "More". `desktop` is false for Import, which the desktop bar reaches
 * through a link in Settings (the `#/import` route works everywhere).
 */
export const ROUTES = [
  { id: 'timesheet', hash: '#/timesheet', label: 'Timesheet', adminOnly: false, tab: true, desktop: true },
  { id: 'ot', hash: '#/ot', label: 'Overtime', adminOnly: false, tab: true, desktop: true },
  { id: 'history', hash: '#/history', label: 'History', adminOnly: false, tab: true, desktop: true },
  { id: 'settings', hash: '#/settings', label: 'Settings', adminOnly: false, tab: false, desktop: true },
  { id: 'import', hash: '#/import', label: 'Import', adminOnly: false, tab: false, desktop: false },
  { id: 'admin', hash: '#/admin', label: 'Admin', adminOnly: true, tab: false, desktop: true },
] as const;

export type RouteId = (typeof ROUTES)[number]['id'];

export function routesFor(role: User['role']) {
  return ROUTES.filter((route) => !route.adminOnly || role === 'admin');
}

/** The entries of the desktop top bar. */
export function desktopRoutesFor(role: User['role']) {
  return routesFor(role).filter((route) => route.desktop);
}

/** The entries of the phone's tab bar, then those under "More" (Settings, Import, Admin for administrators). */
export function mobileRoutesFor(role: User['role']) {
  const all = routesFor(role);
  return { tabs: all.filter((route) => route.tab), more: all.filter((route) => !route.tab) };
}

/**
 * A navigation screen, the review of one payroll period (`#/review/{payrollDate}`), or another
 * person's shared items (`#/shared/{ownerId}[/view]`, FR-17).
 */
export type AppRoute =
  | { id: RouteId; payrollDate: null }
  | { id: 'review'; payrollDate: string }
  | { id: 'shared'; payrollDate: null; ownerId: string; view: SharedView | null };

/** The canonical hash of the screen a hash asks for; an unknown or empty hash is the first route. */
function canonicalHash(hash: string, role: User['role']): string {
  const payrollDate = parseReviewHash(hash);
  if (payrollDate !== null) return reviewHash(payrollDate);
  if (parseSharedHash(hash) !== null) return hash;
  return (routesFor(role).find((route) => route.hash === hash) ?? ROUTES[0]).hash;
}

function routeOfHash(hash: string): AppRoute {
  const payrollDate = parseReviewHash(hash);
  if (payrollDate !== null) return { id: 'review', payrollDate };
  const shared = parseSharedHash(hash);
  if (shared !== null) return { id: 'shared', payrollDate: null, ownerId: shared.ownerId, view: shared.view };
  return { id: ROUTES.find((route) => route.hash === hash)?.id ?? ROUTES[0].id, payrollDate: null };
}

/**
 * Hash routing without a router dependency: the server needs no route table and the
 * browser's back button works. An unknown or empty hash is rewritten to the first route.
 * The review and shared hashes carry a payroll date or an owner id only, so they survive sign-in
 * (the sign-in form does not touch the address) and hold no token; a shared address needs a login
 * and a live share before the server shows anything.
 */
export function useHashRoute(role: User['role']): AppRoute {
  const [hash, setHash] = useState<string>(() => canonicalHash(window.location.hash, role));

  useEffect(() => {
    // Keep the address bar on a known route even when the route did not change (an unknown hash).
    const sync = () => {
      const target = canonicalHash(window.location.hash, role);
      if (window.location.hash !== target) window.history.replaceState(null, '', target);
      setHash(target);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [role]);

  return routeOfHash(hash);
}

export function AppShell({
  user,
  route,
  sharedOwnerId,
  received,
  flash,
  onDismissFlash,
  onSignedOut,
  children,
}: {
  user: User;
  /** The navigation entry to mark as current (the review belongs under Timesheet); none for a shared view. */
  route: RouteId | 'shared';
  /** The owner of the shared view being shown, or null on the user's own screens. */
  sharedOwnerId: string | null;
  /** The shares other people gave this user: the "Shared with me" switcher lists them. */
  received: readonly ReceivedShare[];
  /** A message that must outlive a redirect (a share that ended), or null. */
  flash: string | null;
  onDismissFlash: () => void;
  onSignedOut: () => void;
  children: ReactNode;
}) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const tabsRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);
  // The sticky bar wraps (52 to 107px); scroll padding follows its real height (WP5-UX-AX-01).
  useBlockSizeProperty(barRef, '--shell-bar-size');
  const { tabs, more } = mobileRoutesFor(user.role);
  // Import belongs under Settings on the desktop bar; on the phone it is its own entry under "More".
  const desktopCurrent = route === 'import' ? 'settings' : route;
  const moreCurrent = more.some((item) => item.id === route);

  async function signOut() {
    await api('POST', '/api/auth/logout', {}).catch(() => undefined);
    onSignedOut();
  }

  // Leaving for another screen closes the panel (the address is the single source of truth for the screen).
  useEffect(() => {
    const close = () => setMoreOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, []);

  // A touch or click outside the tab bar closes the panel.
  useEffect(() => {
    if (!moreOpen) return;
    const closeOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || tabsRef.current?.contains(event.target) !== true) setMoreOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [moreOpen]);

  function closeOnEscape(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Escape' || !moreOpen) return;
    setMoreOpen(false);
    moreButton.current?.focus();
  }

  return (
    <>
      <header ref={barRef} className="shell-bar">
        <span className="shell-brand">C&amp;D Semi</span>
        <nav className="shell-nav" aria-label="Main">
          {desktopRoutesFor(user.role).map((item) => (
            <a key={item.id} className="nav-link" href={item.hash} aria-current={item.id === desktopCurrent ? 'page' : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
        <SharingSwitcher received={received} ownerId={sharedOwnerId} />
        <div className="shell-user">
          <span className="muted">{user.display_name}</span>
          <button type="button" className="secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="page">
        {flash !== null && (
          <div className="flash" role="status" data-flash="share-ended">
            <p>{flash}</p>
            <button type="button" className="secondary" onClick={onDismissFlash}>
              Dismiss
            </button>
          </div>
        )}
        {children}
      </main>
      <nav ref={tabsRef} className="shell-tabs" aria-label="Main" onKeyDown={closeOnEscape}>
        {tabs.map((item) => (
          <a key={item.id} className="tab" href={item.hash} aria-current={item.id === route ? 'page' : undefined}>
            {item.label}
          </a>
        ))}
        <button
          ref={moreButton}
          type="button"
          className="tab"
          aria-expanded={moreOpen}
          aria-controls="more-panel"
          aria-current={moreCurrent ? 'true' : undefined}
          onClick={() => setMoreOpen((open) => !open)}
        >
          More
        </button>
        {moreOpen && (
          <div id="more-panel" className="more-panel">
            <span className="more-who muted">{user.display_name}</span>
            {more.map((item) => (
              <a
                key={item.id}
                className="nav-link"
                href={item.hash}
                aria-current={item.id === route ? 'page' : undefined}
                onClick={() => setMoreOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <button type="button" className="more-action" onClick={signOut}>
              Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
