import { type ReactNode, useEffect, useState } from 'react';
import { api, type ReceivedShare, type User } from '../api.ts';
import { parseReviewHash, reviewHash } from './reviewModel.ts';
import { SharingSwitcher } from './SharingSwitcher.tsx';
import { parseSharedHash, type SharedView } from './sharingModel.ts';

/**
 * The screens reachable from the navigation. Settings is for everyone; Admin is listed for
 * administrators only. Hiding the entry is a convenience: the server answers 403 on every
 * admin route, so an employee who types #/admin gets the timesheet and no data.
 */
export const ROUTES = [
  { id: 'timesheet', hash: '#/timesheet', label: 'Timesheet', adminOnly: false },
  { id: 'ot', hash: '#/ot', label: 'OT', adminOnly: false },
  { id: 'history', hash: '#/history', label: 'History', adminOnly: false },
  { id: 'settings', hash: '#/settings', label: 'Settings', adminOnly: false },
  { id: 'admin', hash: '#/admin', label: 'Admin', adminOnly: true },
] as const;

export type RouteId = (typeof ROUTES)[number]['id'];

export function routesFor(role: User['role']) {
  return ROUTES.filter((route) => !route.adminOnly || role === 'admin');
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
  async function signOut() {
    await api('POST', '/api/auth/logout', {}).catch(() => undefined);
    onSignedOut();
  }

  return (
    <>
      <header className="shell-bar">
        <span className="shell-brand">C&amp;D Semi</span>
        <nav className="shell-nav" aria-label="Main">
          {routesFor(user.role).map((item) => (
            <a key={item.id} className="nav-link" href={item.hash} aria-current={item.id === route ? 'page' : undefined}>
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
    </>
  );
}
