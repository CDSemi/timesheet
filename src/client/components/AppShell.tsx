import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { api, type ReceivedShare, type User } from '../api.ts';
import { AccountContent, AccountMenu } from './AccountMenu.tsx';
import { BarClock } from './BarClock.tsx';
import { BrandWordmark } from './BrandWordmark.tsx';
import { ClockProvider } from './ClockProvider.tsx';
import { type AppRoute, canonicalHash, desktopRoutesFor, mobileRoutesFor, type RouteId, routeOfHash } from './routeModel.ts';
import { SharingSwitcher } from './SharingSwitcher.tsx';
import { useBlockSizeProperty } from './useBlockSize.ts';

/**
 * Hash routing without a router dependency: the server needs no route table and the
 * browser's back button works. An unknown or empty hash is rewritten to the first route, and the
 * old `#/admin` of an administrator to `#/settings/admin` (the rules are in routeModel.ts).
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
  // Import belongs under Settings in the desktop menu; on the phone it is its own entry under "More".
  const menuCurrent = route === 'import' ? 'settings' : route;
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
    // One check in/out state for the person's own screens; a shared view has none (F-Q5).
    <ClockProvider enabled={route !== 'shared'}>
      <header ref={barRef} className="shell-bar">
        <span className="shell-brand">
          <img src="/cd-logo.svg" alt="" width={36} height={36} />
          <BrandWordmark />
          <span className="sr-only">C&amp;D Semiconductor Services, Inc.</span>
        </span>
        <BarClock />
        <nav className="shell-nav" aria-label="Main">
          {desktopRoutesFor(user.role).map((item) => (
            <a key={item.id} className="nav-link" href={item.hash} aria-current={item.id === route ? 'page' : undefined}>
              {item.label}
            </a>
          ))}
        </nav>
        <SharingSwitcher received={received} ownerId={sharedOwnerId} />
        {/* Always the signed-in user, also in a shared view (the owner of a shared timesheet is named by the page). */}
        <AccountMenu user={user} current={menuCurrent} onSignOut={() => void signOut()} />
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
          <div id="more-panel" className="account-panel more-panel">
            <AccountContent user={user} layout="phone" current={route} onNavigate={() => setMoreOpen(false)} onSignOut={() => void signOut()} />
          </div>
        )}
      </nav>
    </ClockProvider>
  );
}
