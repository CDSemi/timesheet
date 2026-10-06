import { describe, expect, it } from 'vitest';
import { ApiRequestError, type OperationsStatus } from '../../src/client/api.ts';
import {
  BACKUP_WARN_SECONDS,
  backupSummary,
  byteText,
  calendarOptions,
  csvFileProblem,
  defaultImportYear,
  diskSummary,
  issueText,
  outboundBanner,
  passwordProblem,
  refusalMessage,
  setupFlag,
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

const NO_BACKUP: OperationsStatus['backup'] = { outcome: 'never', last_attempt_at: null, last_success_at: null, fault_code: null, age_seconds: null };
const SUCCESS = '2026-10-04T08:00:00Z';

describe('backup summary', () => {
  it('warns when no backup was ever recorded', () => {
    expect(backupSummary(NO_BACKUP)).toEqual({ text: 'No backup recorded', tone: 'warn', detail: null });
  });

  it('is fine up to 26 hours and warns after, in whole units', () => {
    const ok = backupSummary({ outcome: 'succeeded', last_attempt_at: SUCCESS, last_success_at: SUCCESS, fault_code: null, age_seconds: BACKUP_WARN_SECONDS });
    expect(ok).toEqual({ text: 'Last backup 26 hours ago', tone: 'ok', detail: null });
    const late = backupSummary({ outcome: 'succeeded', last_attempt_at: SUCCESS, last_success_at: SUCCESS, fault_code: null, age_seconds: BACKUP_WARN_SECONDS + 1 });
    expect(late.tone).toBe('warn');
    expect(late.detail).toBe('Older than 26 hours');
    expect(backupSummary({ ...NO_BACKUP, outcome: 'succeeded', last_success_at: SUCCESS, last_attempt_at: SUCCESS, age_seconds: 90 }).text).toBe('Last backup 1 minute ago');
    expect(backupSummary({ ...NO_BACKUP, outcome: 'succeeded', last_success_at: SUCCESS, last_attempt_at: SUCCESS, age_seconds: 5 * 3600 }).text).toBe('Last backup 5 hours ago');
    expect(backupSummary({ ...NO_BACKUP, outcome: 'succeeded', last_success_at: SUCCESS, last_attempt_at: SUCCESS, age_seconds: 20 }).text).toBe('Last backup less than a minute ago');
  });

  it('shows a failed latest attempt as an error with its code, even when an older success exists', () => {
    const failed = backupSummary({ outcome: 'failed', last_attempt_at: '2026-10-04T11:00:00Z', last_success_at: SUCCESS, fault_code: 'disk_full', age_seconds: 4 * 3600 });
    expect(failed).toEqual({ text: 'Last backup attempt failed', tone: 'error', detail: 'disk_full' });
  });
});

describe('disk summary and byte text', () => {
  it('formats binary units with one decimal where it helps', () => {
    expect(byteText(0)).toBe('0 B');
    expect(byteText(1023)).toBe('1023 B');
    expect(byteText(1024)).toBe('1.0 KiB');
    expect(byteText(5 * 1024 ** 3)).toBe('5.0 GiB');
    expect(byteText(1.5 * 1024 ** 4)).toBe('1.5 TiB');
  });

  it('states free space of the total and the percentage, or that it is unknown', () => {
    expect(diskSummary({ free_bytes: 25 * 1024 ** 3, total_bytes: 100 * 1024 ** 3 })).toBe('25.0 GiB free of 100.0 GiB (25% free)');
    expect(diskSummary({ free_bytes: null, total_bytes: null })).toBe('Unknown');
    expect(diskSummary({ free_bytes: 0, total_bytes: 0 })).toBe('Unknown');
  });
});

describe('outbound banner', () => {
  const live: OperationsStatus['outbound'] = { paused: false, paused_at: null, reason: null, awaiting_decision: 0, queued_send_jobs: 0, held_send_jobs: 0 };

  it('shows nothing while delivery is not paused', () => {
    expect(outboundBanner(live)).toBeNull();
  });

  it('says why delivery is paused and how many sends are held, waiting and awaiting a decision', () => {
    const banner = outboundBanner({ paused: true, paused_at: '2026-10-04T09:00:00Z', reason: 'restored', awaiting_decision: 1, queued_send_jobs: 2, held_send_jobs: 3 });
    expect(banner?.headline).toBe('Outbound delivery is paused');
    expect(banner?.reason).toBe('This instance was restored from a backup, so nothing is sent until the held sends are reconciled.');
    expect(banner?.counts).toEqual([
      { label: 'Held for reconciliation', value: 3 },
      { label: 'Waiting', value: 2 },
      { label: 'Awaiting a decision', value: 1 },
    ]);
  });

  it('falls back to the reason code for any other reason', () => {
    const banner = outboundBanner({ paused: true, paused_at: '2026-10-04T09:00:00Z', reason: 'maintenance_window', awaiting_decision: 0, queued_send_jobs: 0, held_send_jobs: 0 });
    expect(banner?.reason).toBe('Paused: maintenance_window.');
  });
});

describe('"not set up" flag (owner decision F-3 (a), WP4-T07B)', () => {
  it('shows the flag only for an account whose settings were never saved', () => {
    expect(setupFlag({ not_set_up: true })).toEqual({
      label: 'Not set up',
      detail: 'This person has not saved submission settings yet, so nothing is submitted automatically and no overdue warning is shown to them.',
    });
    expect(setupFlag({ not_set_up: false })).toBeNull();
  });
});
