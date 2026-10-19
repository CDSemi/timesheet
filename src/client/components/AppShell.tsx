import { type FocusEvent, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
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

/** How long a screen that loads on demand may take before an account entry stops waiting to focus its heading. */
const HEADING_WAIT_MS = 5000;

/**
 * Focus after an account entry (WP5-UX3-FIX2 item 1, WCAG 2.2 SC 2.4.3): the entry's panel unmounts with the focused link, which
 * would leave focus on the page body. `entryUsed(hash, returnFocus)` runs when an entry is used: when the address does not change
 * (the entry of the page already shown) focus returns to the opener at once; otherwise the next screen takes focus on its main
 * heading (`h1`, made focusable with `tabindex="-1"`: a programmatic target that shows a ring only to a keyboard user). A screen
 * that loads on demand has no heading yet, so the shell waits for it (bounded), and gives up when the person has already moved focus
 * elsewhere. The route is the single source of truth: the focus follows the route change, not the click.
 */
function useRouteHeadingFocus(route: RouteId | 'shared', mainRef: { current: HTMLElement | null }) {
  const wanted = useRef<AppRoute['id'] | null>(null);

  useEffect(() => {
    const target = wanted.current;
    if (target === null) return;
    if (target !== route) {
      wanted.current = null;
      return;
    }
    const main = mainRef.current;
    if (main === null) return;
    const takeFocus = (): boolean => {
      const active = document.activeElement;
      // The person moved on while the screen was loading: leave focus where they put it.
      if (active !== null && active !== document.body) return true;
      const heading = main.querySelector<HTMLElement>('h1');
      if (heading === null) return false;
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus();
      return true;
    };
    if (takeFocus()) {
      wanted.current = null;
      return;
    }
    const observer = new MutationObserver(() => {
      if (takeFocus()) {
        wanted.current = null;
        observer.disconnect();
      }
    });
    observer.observe(main, { childList: true, subtree: true });
    const giveUp = window.setTimeout(() => {
      wanted.current = null;
      observer.disconnect();
    }, HEADING_WAIT_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(giveUp);
    };
  }, [route, mainRef]);

  return function entryUsed(hash: string, returnFocus: () => void) {
    if (window.location.hash === hash) {
      returnFocus();
      return;
    }
    wanted.current = routeOfHash(hash).id;
  };
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
  const tabbing = useRef(false);
  const barRef = useRef<HTMLElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const entryUsed = useRouteHeadingFocus(route, mainRef);
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

  function onTabBarKeyDown(event: KeyboardEvent<HTMLElement>) {
    // A Tab key may be taking focus out of the document (past the last entry, or back past the first tab): the blur then has no target.
    tabbing.current = event.key === 'Tab';
    if (event.key !== 'Escape' || !moreOpen) return;
    setMoreOpen(false);
    moreButton.current?.focus();
  }

  // Focus that leaves the tab bar closes the panel, as the desktop menu does (WCAG 2.2 SC 2.4.11: an open panel must not cover the
  // control that takes focus next). Focus moving between the bar's own controls keeps it open. A blur without a target (focus left the
  // document, or a press on a button that does not take focus) closes only after a Tab key, so a press on More still toggles the panel.
  function onTabBarBlur(event: FocusEvent<HTMLElement>) {
    if (!moreOpen) return;
    const next = event.relatedTarget;
    if (next instanceof Node ? tabsRef.current?.contains(next) !== true : tabbing.current) setMoreOpen(false);
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
        <AccountMenu user={user} current={menuCurrent} onEntry={entryUsed} onSignOut={() => void signOut()} />
      </header>
      <main ref={mainRef} className="page">
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
      <nav
        ref={tabsRef}
        className="shell-tabs"
        aria-label="Main"
        onKeyDown={onTabBarKeyDown}
        onPointerDown={() => {
          tabbing.current = false;
        }}
        onBlur={onTabBarBlur}
      >
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
            <AccountContent
              user={user}
              layout="phone"
              current={route}
              onNavigate={(hash) => {
                setMoreOpen(false);
                entryUsed(hash, () => moreButton.current?.focus());
              }}
              onSignOut={() => void signOut()}
            />
          </div>
        )}
      </nav>
    </ClockProvider>
  );
}
