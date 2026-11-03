import { describe, expect, it } from 'vitest';
import { ApiRequestError } from '../../src/client/api.ts';
import { defaultChangeOf, describeError } from '../../src/client/components/errors.ts';

const details = (extra: Record<string, unknown> = {}) => ({
  work_date: '2026-11-30',
  expected_default: 'Worked',
  current_default: 'Holiday',
  ...extra,
});
const refused = (status: number, code: string, body?: Record<string, unknown>) => new ApiRequestError(status, code, 'The calendar default changed', body);

describe('defaultChangeOf (R-UX5I2-3)', () => {
  it('reads a 409 default_changed of the day PUT: the date, what was shown and what the calendar gives now', () => {
    expect(defaultChangeOf(refused(409, 'default_changed', details()))).toEqual({ workDate: '2026-11-30', expected: 'Worked', current: 'Holiday' });
  });

  it('keeps null for "no default was shown"', () => {
    expect(defaultChangeOf(refused(409, 'default_changed', details({ expected_default: null })))).toEqual({
      workDate: '2026-11-30',
      expected: null,
      current: 'Holiday',
    });
  });

  it('is null for another status, another code, a plain Error and a non-error', () => {
    expect(defaultChangeOf(refused(422, 'default_changed', details()))).toBeNull();
    expect(defaultChangeOf(refused(409, 'stale_version', details()))).toBeNull();
    expect(defaultChangeOf(new Error('default_changed'))).toBeNull();
    expect(defaultChangeOf('default_changed')).toBeNull();
    expect(defaultChangeOf(null)).toBeNull();
  });

  it('is null when the details are missing or ill-typed, so the generic message is shown instead', () => {
    expect(defaultChangeOf(refused(409, 'default_changed'))).toBeNull();
    expect(defaultChangeOf(refused(409, 'default_changed', {}))).toBeNull();
    expect(defaultChangeOf(refused(409, 'default_changed', details({ work_date: 20261130 })))).toBeNull();
    expect(defaultChangeOf(refused(409, 'default_changed', details({ current_default: null })))).toBeNull();
    expect(defaultChangeOf(refused(409, 'default_changed', details({ current_default: 'Weekend' })))).toBeNull();
    expect(defaultChangeOf(refused(409, 'default_changed', details({ expected_default: 'Weekend' })))).toBeNull();
    expect(defaultChangeOf(refused(409, 'default_changed', details({ expected_default: undefined })))).toBeNull();
  });

  it('is null for the batch commit shape (dates and changes, no single date), which the page handles as a changed period', () => {
    expect(
      defaultChangeOf(refused(409, 'default_changed', { work_dates: ['2026-11-30'], changes: [{ work_date: '2026-11-30', expected_default: 'Worked', current_default: 'Holiday' }] })),
    ).toBeNull();
  });

  it('leaves the generic message for any other failure to describeError', () => {
    expect(describeError(refused(409, 'default_changed'))).toBe('The calendar default changed (default_changed)');
  });
});
