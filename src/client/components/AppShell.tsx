import { type ReactNode, useEffect, useState } from 'react';
import { api, type User } from '../api.ts';

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

function routeFromHash(hash: string, role: User['role']): RouteId {
  return routesFor(role).find((route) => route.hash === hash)?.id ?? ROUTES[0].id;
}

/**
 * Hash routing without a router dependency: the server needs no route table and the
 * browser's back button works. An unknown or empty hash is rewritten to the first route.
 */
export function useHashRoute(role: User['role']): RouteId {
  const [route, setRoute] = useState<RouteId>(() => routeFromHash(window.location.hash, role));

  useEffect(() => {
    // Keep the address bar on a known route even when the id did not change (an unknown hash).
    const sync = () => {
      const id = routeFromHash(window.location.hash, role);
      const target = ROUTES.find((item) => item.id === id);
      if (target !== undefined && window.location.hash !== target.hash) {
        window.history.replaceState(null, '', target.hash);
      }
      setRoute(id);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [role]);

  return route;
}

export function AppShell({
  user,
  route,
  onSignedOut,
  children,
}: {
  user: User;
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
