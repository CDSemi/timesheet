/*
 * The pure parts of the account area of the shell (WP5-UX3-T02, owner decisions U-03 to U-05): the initials shown in the
 * avatar and the list of items the account menu (desktop) and the "More" panel (phone) offer. No React and no DOM here,
 * so the rules are unit tested (tests/client/accountModel.test.ts).
 */

/** The role as the session user reports it. */
export type AccountRole = 'admin' | 'employee';

/** Where the account content is shown: the desktop menu under the identity button, or the phone's "More" panel. */
export type AccountLayout = 'desktop' | 'phone';

export interface AccountItem {
  /** The entry's identity: it matches the navigation entry that marks it as the current screen. */
  id: 'profile' | 'settings' | 'import' | 'admin';
  label: string;
  /** The address the entry opens (hash routing). */
  hash: string;
}

/*
 * Profile and Administration become pages of the Settings area in the next slice (`#/settings/profile` and
 * `#/settings/admin`). Until then Profile opens Settings, which holds the personal data, and Administration keeps
 * today's address; the next slice changes these two constants only.
 */
const PROFILE_HASH = '#/settings';
const SETTINGS_HASH = '#/settings';
const IMPORT_HASH = '#/import';
const ADMIN_HASH = '#/admin';

/** The first letter (Unicode) of a word, or an empty string when the word has none (punctuation, digits). */
function firstLetter(word: string): string {
  for (const character of word) {
    if (/\p{L}/u.test(character)) return character.toUpperCase();
  }
  return '';
}

/**
 * The initials of the avatar: the first letter of the first and of the last word of the display name (one letter for
 * one word). A name without any letter falls back to the first character of the email, and an empty email to a question
 * mark, so the avatar is never blank. A word without a letter (a lone dash) is skipped.
 */
export function initialsOf(displayName: string, email: string): string {
  const letters = displayName
    .split(/\s+/)
    .map(firstLetter)
    .filter((letter) => letter !== '');
  const first = letters[0];
  const last = letters[letters.length - 1];
  if (first !== undefined && last !== undefined) return letters.length === 1 ? first : `${first}${last}`;
  const [fromEmail] = Array.from(email.trim());
  return fromEmail === undefined ? '?' : fromEmail.toUpperCase();
}

/** The role line of the menu header: shown for administrators only (an employee needs no label). */
export function roleLabel(role: AccountRole): string | null {
  return role === 'admin' ? 'Administrator' : null;
}

/**
 * The entries of the account content, in order: Profile, Settings, Import (the phone only: the desktop reaches it from
 * Settings), then Administration for administrators. Hiding Administration is a convenience; the server answers 403 on
 * every admin route whatever the client shows.
 */
export function accountItems(role: AccountRole, layout: AccountLayout): AccountItem[] {
  const items: AccountItem[] = [
    { id: 'profile', label: 'Profile', hash: PROFILE_HASH },
    { id: 'settings', label: 'Settings', hash: SETTINGS_HASH },
  ];
  if (layout === 'phone') items.push({ id: 'import', label: 'Import', hash: IMPORT_HASH });
  if (role === 'admin') items.push({ id: 'admin', label: 'Administration', hash: ADMIN_HASH });
  return items;
}
