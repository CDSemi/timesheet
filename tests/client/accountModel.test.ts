import { describe, expect, it } from 'vitest';
import { accountItems, initialsOf, roleLabel } from '../../src/client/components/accountModel.ts';
import { routeOfHash } from '../../src/client/components/routeModel.ts';

describe('initialsOf', () => {
  it('uses one letter for a one-word name', () => {
    expect(initialsOf('Synthetic', 'someone@example.invalid')).toBe('S');
  });

  it('uses the first letter of the first and of the last word of a two-word name', () => {
    expect(initialsOf('Example Employee', 'someone@example.invalid')).toBe('EE');
  });

  it('skips the middle words of a longer name', () => {
    expect(initialsOf('Mary Jane Watson-Parker', 'someone@example.invalid')).toBe('MW');
    expect(initialsOf('  Ada   King  Lovelace  ', 'someone@example.invalid')).toBe('AL');
  });

  it('upper-cases a lower-case name and handles letters beyond ASCII', () => {
    expect(initialsOf('nguyen van an', 'someone@example.invalid')).toBe('NA');
    expect(initialsOf('émile zola', 'someone@example.invalid')).toBe('ÉZ');
  });

  it('takes the first letter of a word that starts with punctuation, and skips a word with none', () => {
    expect(initialsOf("(Dev) O'Neil", 'someone@example.invalid')).toBe('DO');
    expect(initialsOf('Ada - Lovelace', 'someone@example.invalid')).toBe('AL');
  });

  it('falls back to the first character of the email when the name has no letter', () => {
    expect(initialsOf('1234 - 99', 'zed@example.invalid')).toBe('Z');
    expect(initialsOf('---', 'zed@example.invalid')).toBe('Z');
  });

  it('falls back to the email for an empty or blank name, and to a question mark when both are empty', () => {
    expect(initialsOf('', 'zed@example.invalid')).toBe('Z');
    expect(initialsOf('   ', ' zed@example.invalid')).toBe('Z');
    expect(initialsOf('', '')).toBe('?');
  });
});

describe('roleLabel', () => {
  it('names an administrator and nobody else', () => {
    expect(roleLabel('admin')).toBe('Administrator');
    expect(roleLabel('employee')).toBeNull();
  });
});

describe('accountItems', () => {
  const labels = (role: 'admin' | 'employee', layout: 'desktop' | 'phone') => accountItems(role, layout).map((item) => item.label);

  it('lists Profile and Settings for an employee on a desktop (Import is reached from Settings)', () => {
    expect(labels('employee', 'desktop')).toEqual(['Profile', 'Settings']);
  });

  it('adds Administration for an administrator on a desktop', () => {
    expect(labels('admin', 'desktop')).toEqual(['Profile', 'Settings', 'Administration']);
  });

  it('lists Profile, Settings and Import for an employee on a phone', () => {
    expect(labels('employee', 'phone')).toEqual(['Profile', 'Settings', 'Import']);
  });

  it('lists Profile, Settings, Import and Administration for an administrator on a phone', () => {
    expect(labels('admin', 'phone')).toEqual(['Profile', 'Settings', 'Import', 'Administration']);
  });

  it('gives every entry a distinct id and a hash route, and never offers Administration to an employee', () => {
    for (const layout of ['desktop', 'phone'] as const) {
      for (const role of ['admin', 'employee'] as const) {
        const items = accountItems(role, layout);
        expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
        for (const item of items) expect(item.hash).toMatch(/^#\/[a-z/]+$/);
        if (role === 'employee') expect(items.map((item) => item.id)).not.toContain('admin');
      }
    }
  });

  it('points Profile and Administration at their Settings sub-pages, Settings at Personal and Import at its screen', () => {
    const phone = accountItems('admin', 'phone');
    expect(phone.find((item) => item.id === 'profile')?.hash).toBe('#/settings/profile');
    expect(phone.find((item) => item.id === 'admin')?.hash).toBe('#/settings/admin');
    expect(phone.find((item) => item.id === 'import')?.hash).toBe('#/import');
    expect(phone.find((item) => item.id === 'settings')?.hash).toBe('#/settings');
  });

  it('gives every entry the id of the route that shows it, so the shown route marks its entry as current', () => {
    for (const item of accountItems('admin', 'phone')) expect(routeOfHash(item.hash).id).toBe(item.id);
  });
});
