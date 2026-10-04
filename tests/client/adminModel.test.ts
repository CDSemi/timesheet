import { describe, expect, it } from 'vitest';
import { ApiRequestError } from '../../src/client/api.ts';
import {
  calendarOptions,
  csvFileProblem,
  defaultImportYear,
  issueText,
  passwordProblem,
  refusalMessage,
} from '../../src/client/components/adminModel.ts';

describe('refusal messages', () => {
  it('explains the refusals the admin screen must show clearly', () => {
    expect(refusalMessage(new ApiRequestError(409, 'calendar_in_use', 'x'))).toContain('already has timesheet data');
    expect(refusalMessage(new ApiRequestError(409, 'cannot_deactivate_self', 'x'))).toContain('your own account');
    expect(refusalMessage(new ApiRequestError(409, 'last_active_admin', 'x'))).toContain('At least one active administrator');
    expect(refusalMessage(new ApiRequestError(409, 'stale_preview', 'x'))).toContain('Preview it again');
  });

  it('keeps the code visible', () => {
    expect(refusalMessage(new ApiRequestError(409, 'calendar_in_use', 'x'))).toMatch(/\(calendar_in_use\)$/);
  });

  it('names the boundary the server sent', () => {
    const caught = new ApiRequestError(422, 'retroactive_change', 'x', { earliest_effective_from: '2026-09-28' });
    expect(refusalMessage(caught)).toContain('before 2026-09-28');
    const later = new ApiRequestError(422, 'effective_from_before_latest_version', 'x', { latest_effective_from: '2026-11-02' });
    expect(refusalMessage(later)).toContain('starts on 2026-11-02');
  });

  it('falls back to the server message for other codes', () => {
    expect(refusalMessage(new ApiRequestError(422, 'something_else', 'Plain words'))).toBe('Plain words (something_else)');
    expect(refusalMessage(new Error('boom'))).toBe('Request failed');
  });
});

describe('temporary password length', () => {
  it('mirrors the server rule of 12 to 256 characters', () => {
    expect(passwordProblem('x'.repeat(11))).not.toBeNull();
    expect(passwordProblem('x'.repeat(12))).toBeNull();
    expect(passwordProblem('x'.repeat(256))).toBeNull();
    expect(passwordProblem('x'.repeat(257))).not.toBeNull();
  });
});

describe('calendar options', () => {
  it('lists the own calendar by name and other calendars used by accounts once', () => {
    const options = calendarOptions(
      [{ calendar_id: 'own-id' }, { calendar_id: 'abcdef1234567890' }, { calendar_id: 'abcdef1234567890' }],
      { id: 'own-id', name: 'Company calendar' },
    );
    expect(options).toEqual([
      { id: 'own-id', label: 'Company calendar' },
      { id: 'abcdef1234567890', label: 'Calendar abcdef12' },
    ]);
  });
});

describe('import defaults and file checks', () => {
  it('uses the warned year, else the year of the server date', () => {
    expect(defaultImportYear('2026-10-04', [{ code: 'next_year_calendar_missing', year: 2027, warn_from: '2026-10-01', message: 'm' }])).toBe(2027);
    expect(defaultImportYear('2026-05-04', [])).toBe(2026);
  });

  it('names a CSV problem with its line and value', () => {
    expect(issueText({ line: 3, message: 'Invalid date', value: '2027-13-01' })).toBe('Line 3: Invalid date (2027-13-01)');
    expect(issueText({ line: 4, message: 'Empty name' })).toBe('Line 4: Empty name');
  });

  it('accepts only a CSV name within the server limit', () => {
    expect(csvFileProblem('holidays-synthetic.csv', 1_000)).toBeNull();
    expect(csvFileProblem('holidays.txt', 10)).not.toBeNull();
    expect(csvFileProblem('big.CSV', 50_001)).not.toBeNull();
  });
});
