import { type ReactNode, useEffect, useState } from 'react';
import { api, type User } from '../api.ts';
import { parseReviewHash, reviewHash } from './reviewModel.ts';

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

/** A navigation screen, or the review of one payroll period (`#/review/{payrollDate}`). */
export type AppRoute = { id: RouteId; payrollDate: null } | { id: 'review'; payrollDate: string };

/** The canonical hash of the screen a hash asks for; an unknown or empty hash is the first route. */
function canonicalHash(hash: string, role: User['role']): string {
  const payrollDate = parseReviewHash(hash);
  if (payrollDate !== null) return reviewHash(payrollDate);
  return (routesFor(role).find((route) => route.hash === hash) ?? ROUTES[0]).hash;
}

function routeOfHash(hash: string): AppRoute {
  const payrollDate = parseReviewHash(hash);
  if (payrollDate !== null) return { id: 'review', payrollDate };
  return { id: ROUTES.find((route) => route.hash === hash)?.id ?? ROUTES[0].id, payrollDate: null };
}

/**
 * Hash routing without a router dependency: the server needs no route table and the
 * browser's back button works. An unknown or empty hash is rewritten to the first route.
 * The review hash carries a payroll date only, so it survives sign-in (the sign-in form does
 * not touch the address) and holds no token.
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
  onSignedOut,
  children,
}: {
  user: User;
  /** The navigation entry to mark as current (the review belongs under Timesheet). */
  route: RouteId;
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
        <div className="shell-user">
          <span className="muted">{user.display_name}</span>
          <button type="button" className="secondary" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </>
  );
}
