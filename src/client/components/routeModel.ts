import type { User } from '../api.ts';
import { parseReviewHash, reviewHash } from './reviewModel.ts';
import { parseSharedHash, type SharedView } from './sharingModel.ts';

/*
 * The pure route model of the shell (WP5-UX3-T03): which hash shows which screen for a role, and where an unknown or
 * forbidden hash ends up. No React and no DOM here, so the rules are unit tested (tests/client/routeModel.test.ts).
 *
 * Settings has three sub-pages with their own address: `#/settings` (Personal), `#/settings/profile` and
 * `#/settings/admin` (Administration, administrators only). The old `#/admin` still works for an administrator and is
 * rewritten to the new address. Hiding Administration from an employee is a convenience: the server answers 403 on every
 * admin route, and the client never asks for admin data on an employee's behalf.
 */

/** The role as the session user reports it. */
export type Role = User['role'];

export const SETTINGS_HASH = '#/settings';
export const PROFILE_HASH = '#/settings/profile';
export const ADMIN_HASH = '#/settings/admin';
/** The address Administration had before it moved under Settings. */
export const LEGACY_ADMIN_HASH = '#/admin';
export const IMPORT_HASH = '#/import';

/**
 * The screens reachable by an address. `tab` marks the entries of the phone's bottom tab bar; the others sit under "More".
 * `desktop` marks the entries of the desktop top bar: only Timesheet, Overtime and History; Settings, its sub-pages and
 * Import are reached through the account menu (the `#/import` route works everywhere and the desktop also links to it
 * from Settings). Administration is listed for administrators only.
 */
export const ROUTES = [
  { id: 'timesheet', hash: '#/timesheet', label: 'Timesheet', adminOnly: false, tab: true, desktop: true },
  { id: 'ot', hash: '#/ot', label: 'Overtime', adminOnly: false, tab: true, desktop: true },
  { id: 'history', hash: '#/history', label: 'History', adminOnly: false, tab: true, desktop: true },
  { id: 'settings', hash: SETTINGS_HASH, label: 'Settings', adminOnly: false, tab: false, desktop: false },
  { id: 'profile', hash: PROFILE_HASH, label: 'Profile', adminOnly: false, tab: false, desktop: false },
  { id: 'import', hash: IMPORT_HASH, label: 'Import', adminOnly: false, tab: false, desktop: false },
  { id: 'admin', hash: ADMIN_HASH, label: 'Administration', adminOnly: true, tab: false, desktop: false },
] as const;

export type RouteId = (typeof ROUTES)[number]['id'];

export function routesFor(role: Role) {
  return ROUTES.filter((route) => !route.adminOnly || role === 'admin');
}

/** The entries of the desktop top bar. */
export function desktopRoutesFor(role: Role) {
  return routesFor(role).filter((route) => route.desktop);
}

/** The entries of the phone's tab bar, then the screens under "More" (Settings, Profile, Import, Administration for administrators). */
export function mobileRoutesFor(role: Role) {
  const all = routesFor(role);
  return { tabs: all.filter((route) => route.tab), more: all.filter((route) => !route.tab) };
}

/** The sub-pages of Settings, in order; `id` is the route id that marks the current one. */
export interface SettingsSection {
  id: 'settings' | 'profile' | 'admin';
  label: string;
  hash: string;
}

/** The links of the Settings sections nav: Personal and Profile for everyone, Administration for administrators only. */
export function settingsSectionsFor(role: Role): SettingsSection[] {
  const sections: SettingsSection[] = [
    { id: 'settings', label: 'Personal', hash: SETTINGS_HASH },
    { id: 'profile', label: 'Profile', hash: PROFILE_HASH },
  ];
  if (role === 'admin') sections.push({ id: 'admin', label: 'Administration', hash: ADMIN_HASH });
  return sections;
}

/** True for the routes that belong to the Settings area (the sections nav is shown above them). */
export function isSettingsRoute(id: string): id is SettingsSection['id'] {
  return id === 'settings' || id === 'profile' || id === 'admin';
}

/**
 * A navigation screen, the review of one payroll period (`#/review/{payrollDate}`), or another
 * person's shared items (`#/shared/{ownerId}[/view]`, FR-17).
 */
export type AppRoute =
  | { id: RouteId; payrollDate: null }
  | { id: 'review'; payrollDate: string }
  | { id: 'shared'; payrollDate: null; ownerId: string; view: SharedView | null };

/**
 * The canonical hash of the screen a hash asks for for this role. An unknown or empty hash, an unknown Settings
 * sub-page and Administration for an employee (at either address) are the first route; the old `#/admin` is
 * `#/settings/admin` for an administrator.
 */
export function canonicalHash(hash: string, role: Role): string {
  const payrollDate = parseReviewHash(hash);
  if (payrollDate !== null) return reviewHash(payrollDate);
  if (parseSharedHash(hash) !== null) return hash;
  if (hash === LEGACY_ADMIN_HASH && role === 'admin') return ADMIN_HASH;
  return (routesFor(role).find((route) => route.hash === hash) ?? ROUTES[0]).hash;
}

/** The route a canonical hash shows. */
export function routeOfHash(hash: string): AppRoute {
  const payrollDate = parseReviewHash(hash);
  if (payrollDate !== null) return { id: 'review', payrollDate };
  const shared = parseSharedHash(hash);
  if (shared !== null) return { id: 'shared', payrollDate: null, ownerId: shared.ownerId, view: shared.view };
  return { id: ROUTES.find((route) => route.hash === hash)?.id ?? ROUTES[0].id, payrollDate: null };
}
