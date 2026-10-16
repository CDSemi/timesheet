import { describe, expect, it } from 'vitest';
import {
  ADMIN_HASH,
  canonicalHash,
  desktopRoutesFor,
  isSettingsRoute,
  mobileRoutesFor,
  PROFILE_HASH,
  routeOfHash,
  SETTINGS_HASH,
  settingsSectionsFor,
} from '../../src/client/components/routeModel.ts';

describe('canonicalHash for Settings and Administration', () => {
  it('rewrites the old #/admin to #/settings/admin for an administrator', () => {
    expect(canonicalHash('#/admin', 'admin')).toBe('#/settings/admin');
  });

  it('sends an employee from the old #/admin to the timesheet', () => {
    expect(canonicalHash('#/admin', 'employee')).toBe('#/timesheet');
  });

  it('keeps #/settings/admin for an administrator and sends an employee to the timesheet', () => {
    expect(canonicalHash('#/settings/admin', 'admin')).toBe('#/settings/admin');
    expect(canonicalHash('#/settings/admin', 'employee')).toBe('#/timesheet');
  });

  it('keeps #/settings and #/settings/profile for both roles', () => {
    for (const role of ['admin', 'employee'] as const) {
      expect(canonicalHash('#/settings', role)).toBe('#/settings');
      expect(canonicalHash('#/settings/profile', role)).toBe('#/settings/profile');
    }
  });

  it('sends an unknown Settings sub-page, a trailing slash and a deeper admin path to the timesheet for both roles', () => {
    for (const role of ['admin', 'employee'] as const) {
      for (const hash of ['#/settings/unknown', '#/settings/', '#/settings/profile/extra', '#/settings/admin/users', '#/admin/users', '#/settings/ADMIN']) {
        expect(canonicalHash(hash, role), `${role} ${hash}`).toBe('#/timesheet');
      }
    }
  });

  it('keeps #/import and the first-route fallback of an empty or unknown hash', () => {
    expect(canonicalHash('#/import', 'employee')).toBe('#/import');
    expect(canonicalHash('', 'employee')).toBe('#/timesheet');
    expect(canonicalHash('#/nowhere', 'admin')).toBe('#/timesheet');
  });

  it('keeps the review and shared addresses', () => {
    expect(canonicalHash('#/review/2026-10-15', 'employee')).toBe('#/review/2026-10-15');
    expect(canonicalHash('#/shared/abc123', 'employee')).toBe('#/shared/abc123');
  });
});

describe('routeOfHash', () => {
  it('names each Settings sub-page by its own route id', () => {
    expect(routeOfHash(SETTINGS_HASH).id).toBe('settings');
    expect(routeOfHash(PROFILE_HASH).id).toBe('profile');
    expect(routeOfHash(ADMIN_HASH).id).toBe('admin');
  });
});

describe('routes per role', () => {
  it('lists Administration for an administrator only', () => {
    const ids = (role: 'admin' | 'employee') => mobileRoutesFor(role).more.map((route) => route.id);
    expect(ids('admin')).toEqual(['settings', 'profile', 'import', 'admin']);
    expect(ids('employee')).toEqual(['settings', 'profile', 'import']);
  });

  it('keeps the desktop top bar to Timesheet, Overtime and History for both roles', () => {
    for (const role of ['admin', 'employee'] as const) {
      expect(desktopRoutesFor(role).map((route) => route.label)).toEqual(['Timesheet', 'Overtime', 'History']);
    }
  });
});

describe('settingsSectionsFor', () => {
  it('offers Personal and Profile to an employee, with no Administration', () => {
    const sections = settingsSectionsFor('employee');
    expect(sections.map((section) => section.label)).toEqual(['Personal', 'Profile']);
    expect(sections.map((section) => section.hash)).toEqual(['#/settings', '#/settings/profile']);
  });

  it('adds Administration last for an administrator', () => {
    const sections = settingsSectionsFor('admin');
    expect(sections.map((section) => section.label)).toEqual(['Personal', 'Profile', 'Administration']);
    expect(sections.at(-1)?.hash).toBe('#/settings/admin');
  });

  it('every section id is a Settings route', () => {
    for (const section of settingsSectionsFor('admin')) expect(isSettingsRoute(section.id)).toBe(true);
    expect(isSettingsRoute('timesheet')).toBe(false);
    expect(isSettingsRoute('import')).toBe(false);
  });
});
