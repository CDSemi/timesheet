import { type FocusEvent, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import type { User } from '../api.ts';
import { type AccountItem, type AccountLayout, accountItems, initialsOf, roleLabel } from './accountModel.ts';
import { ThemeToggle } from './ThemeToggle.tsx';

/*
 * The account area of the shell (WP5-UX3-T02, owner decisions U-03 to U-05). On a desktop (768px and wider) one button
 * at the right end of the top bar shows who is signed in (the display name over the email, then an initials avatar and a
 * chevron) and discloses a panel with the account entries; on a phone the same content is the "More" panel of the tab bar.
 *
 * The pattern is a disclosure button with a non-modal panel (`aria-expanded`, `aria-controls`), not an ARIA `menu`: the
 * links, the native Theme radio group and the Sign out button keep their own semantics and the Tab order. Opening it by
 * keyboard moves focus to the first entry; Escape closes it and returns focus to the button; a press outside, a change of
 * the address and Tab past the last entry close it.
 */

/** The one account menu of the page (a phone shows the "More" panel instead, so there is never a second one). */
const ACCOUNT_MENU_ID = 'account-menu';

/** A 24-unit stroke icon in the text colour; decoration only (the entry's text is its name). */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="account-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function ItemIcon({ id }: { id: AccountItem['id'] }) {
  switch (id) {
    case 'profile':
      return (
        <Icon>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
        </Icon>
      );
    case 'settings':
      return (
        <Icon>
          <path d="M4 6h8M18 6h2M4 12h2M12 12h8M4 18h11M19 18h1" />
          <circle cx="15" cy="6" r="2" />
          <circle cx="9" cy="12" r="2" />
          <circle cx="17" cy="18" r="2" />
        </Icon>
      );
    case 'import':
      return (
        <Icon>
          <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
        </Icon>
      );
    case 'admin':
      return (
        <Icon>
          <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
        </Icon>
      );
  }
}

/** The 36px initials avatar: no image, decoration only (the name and email beside it carry the information). */
export function Avatar({ user }: { user: Pick<User, 'display_name' | 'email'> }) {
  return (
    <span className="avatar" aria-hidden="true">
      {initialsOf(user.display_name, user.email)}
    </span>
  );
}

/**
 * The account content shared by the desktop menu and the phone's "More" panel: the header (avatar, full name, email, the
 * role of an administrator), the entries, the Theme control and Sign out. `current` is the id of the entry that marks the
 * screen shown; `onNavigate` runs when an entry is used (the panel closes).
 */
export function AccountContent({
  user,
  layout,
  current,
  onNavigate,
  onSignOut,
}: {
  user: User;
  layout: AccountLayout;
  current: string;
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  const role = roleLabel(user.role);
  return (
    <>
      <div className="account-head">
        <Avatar user={user} />
        <span className="account-who">
          <span className="account-name">{user.display_name}</span>
          <span className="account-email">{user.email}</span>
          {role !== null && <span className="account-role">{role}</span>}
        </span>
      </div>
      <hr className="account-sep" />
      {accountItems(user.role, layout).map((item) => (
        <a key={item.id} className="nav-link account-item" href={item.hash} aria-current={item.id === current ? 'page' : undefined} onClick={onNavigate}>
          <ItemIcon id={item.id} />
          {item.label}
        </a>
      ))}
      <hr className="account-sep" />
      <div className="account-theme-row">
        <span className="account-theme-label" aria-hidden="true">
          Theme
        </span>
        <ThemeToggle className="account-theme" />
      </div>
      <hr className="account-sep" />
      <button type="button" className="account-action" onClick={onSignOut}>
        <Icon>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </Icon>
        Sign out
      </button>
    </>
  );
}

/** The identity button of the top bar and its panel (shown from 768px; below it the "More" panel holds the same content). */
export function AccountMenu({ user, current, onSignOut }: { user: User; current: string; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Only a keyboard opening moves focus into the panel (a pointer opening keeps it on the button).
  const focusFirst = useRef(false);

  function close() {
    setOpen(false);
  }

  useEffect(() => {
    if (!open || !focusFirst.current) return;
    focusFirst.current = false;
    panelRef.current?.querySelector<HTMLElement>('a[href], button, input')?.focus();
  }, [open]);

  // Leaving for another screen closes the panel (the address is the single source of truth for the screen).
  useEffect(() => {
    const closeOnNavigate = () => setOpen(false);
    window.addEventListener('hashchange', closeOnNavigate);
    return () => window.removeEventListener('hashchange', closeOnNavigate);
  }, []);

  // A press outside the button and the panel closes it.
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || rootRef.current?.contains(event.target) !== true) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, [open]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || !open) return;
    // The key is used here: an open non-modal Day editor must not close with it.
    event.preventDefault();
    setOpen(false);
    buttonRef.current?.focus();
  }

  // Tab past the last entry moves focus out of the root: the panel closes after focus has left it.
  function onBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (open && next instanceof Node && rootRef.current?.contains(next) !== true) setOpen(false);
  }

  return (
    <div ref={rootRef} className="shell-user" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={buttonRef}
        type="button"
        className="identity"
        aria-expanded={open}
        aria-controls={ACCOUNT_MENU_ID}
        onClick={(event) => {
          // A click made by Enter or Space has no pointer position: detail is 0.
          if (!open && event.detail === 0) focusFirst.current = true;
          setOpen(!open);
        }}
      >
        <span className="identity-text">
          <span className="identity-name">{user.display_name}</span>
          <span className="identity-email">{user.email}</span>
        </span>
        <Avatar user={user} />
        <svg className="identity-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <path d="M6 9l6 6 6-6" />
        </svg>
        <span className="sr-only">, account menu</span>
      </button>
      {open && (
        <div ref={panelRef} id={ACCOUNT_MENU_ID} className="account-panel account-menu" role="group" aria-label="Account">
          <AccountContent user={user} layout="desktop" current={current} onNavigate={close} onSignOut={onSignOut} />
        </div>
      )}
    </div>
  );
}
