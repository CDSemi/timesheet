import { describe, expect, it } from 'vitest';
import { ApiRequestError, type DayView } from '../../src/client/api.ts';
import {
  canCancel,
  canRecordUse,
  canReverse,
  changedFields,
  insufficientBalanceMessage,
  mismatchDays,
  operationText,
  parseMinutes,
  useHint,
  valueText,
} from '../../src/client/components/otModel.ts';

const open = { leave_date: '2026-10-05', reserved_minutes: 480 };

describe('record use availability (E-3)', () => {
  it('is offered only on or after the leave date', () => {
    expect(canRecordUse(open, '2026-10-04')).toBe(false);
    expect(canRecordUse(open, '2026-10-05')).toBe(true);
    expect(canRecordUse(open, '2026-10-06')).toBe(true);
  });

  it('is not offered when nothing is reserved any more', () => {
    expect(canRecordUse({ ...open, reserved_minutes: 0 }, '2026-10-06')).toBe(false);
  });

  it('explains the wait only before the date and only while minutes are reserved', () => {
    expect(useHint(open, '2026-10-04')).toBe('Use can be recorded from 2026-10-05.');
    expect(useHint(open, '2026-10-05')).toBeNull();
    expect(useHint({ ...open, reserved_minutes: 0 }, '2026-10-04')).toBeNull();
  });

  it('offers cancel and reverse from the server counters', () => {
    expect(canCancel({ reserved_minutes: 1 })).toBe(true);
    expect(canCancel({ reserved_minutes: 0 })).toBe(false);
    expect(canReverse({ reversible_minutes: 240 })).toBe(true);
    expect(canReverse({ reversible_minutes: 0 })).toBe(false);
  });
});

describe('parseMinutes', () => {
  it('accepts positive whole numbers only', () => {
    expect(parseMinutes(' 240 ')).toBe(240);
    for (const bad of ['', '0', '-5', '1.5', '2h', '123456']) expect(parseMinutes(bad)).toBeNull();
  });
});

describe('insufficientBalanceMessage (E-5)', () => {
  it('words the refusal with the server figures', () => {
    const caught = new ApiRequestError(409, 'insufficient_balance', 'no', { available_minutes: 60, requested_minutes: 480 });
    expect(insufficientBalanceMessage(caught)).toBe('Not enough available OT balance. 1h 00m available, 8h 00m needed. Nothing was reserved.');
  });

  it('ignores other errors', () => {
    expect(insufficientBalanceMessage(new ApiRequestError(409, 'stale_version', 'x'))).toBeNull();
    expect(insufficientBalanceMessage(new Error('x'))).toBeNull();
  });
});

describe('mismatchDays (E-2)', () => {
  const day = (workDate: string, kind: number, consumed: number, reversed: number, mismatch: boolean) =>
    ({ work_date: workDate, ot_leave: { kind_minutes: kind, consumed_minutes: consumed, reversed_minutes: reversed, mismatch } }) as unknown as DayView;

  it('lists mismatching days once, sorted, with the net used minutes', () => {
    const days = [day('2026-10-03', 0, 240, 0, true), day('2026-10-02', 480, 480, 0, false), day('2026-10-01', 480, 240, 60, true), day('2026-10-03', 0, 240, 0, true)];
    expect(mismatchDays(days)).toEqual([
      { work_date: '2026-10-01', kind_minutes: 480, net_consumed_minutes: 180 },
      { work_date: '2026-10-03', kind_minutes: 0, net_consumed_minutes: 240 },
    ]);
  });
});

describe('history display', () => {
  it('names known operations and falls back to a neutral plain label for unknown ones (WP3-B-03)', () => {
    expect(operationText('ot_leave.use')).toBe('OT leave use recorded');
    expect(operationText('day.save')).toBe('Other change');
    expect(operationText('some_future.op')).not.toContain('.');
  });

  it('words every operation an owner can see in the history, including the WP3 ones, without a raw code', () => {
    expect(operationText('timesheet.auto_finalize')).toBe('Submitted automatically');
    expect(operationText('timesheet.signoff')).toBe('Timesheet signed off');
    expect(operationText('timesheet.correction')).toBe('Correction signed');
    expect(operationText('timesheet.late_review')).toBe('Late review signed');
    expect(operationText('revision.resend')).toBe('Revision resent');
    expect(operationText('delivery.decision')).toBe('Delivery decision recorded');
    expect(operationText('deadline.overdue')).toBe('Deadline passed with automatic submission off');
    expect(operationText('deadline.finalize_failed')).toBe('Automatic submission could not complete');
    expect(operationText('auth.login')).toBe('Signed in');
    const known = [
      'auth.login',
      'auth.logout',
      'calendar.create',
      'calendar_version.create',
      'payroll_exception.create',
      'day_entry.create',
      'day_entry.update',
      'work_session.create',
      'work_session.update',
      'work_session.delete',
      'work_session.clock_in',
      'work_session.clock_out',
      'work_policy.create',
      'signature.upload',
      'submission_settings.update',
      'submission_settings.auto_image_authorize',
      'submission_settings.auto_image_revoke',
      'timesheet.signoff',
      'timesheet.auto_finalize',
      'timesheet.correction',
      'timesheet.late_review',
      'revision.resend',
      'delivery.decision',
      'deadline.overdue',
      'deadline.finalize_failed',
      'automation.activation',
      'user.create',
      'user.update',
      'user.deactivate',
      'user.reactivate',
      'ot_leave.reserve',
      'ot_leave.use',
      'ot_leave.cancel',
      'ot_leave.reverse',
      'ot_ledger.credit',
      'ot_ledger.leave_consumption',
      'ot_ledger.leave_reversal',
      'ot_ledger.correction',
      'ot_ledger.deficit_debit',
    ];
    for (const operation of known) {
      const text = operationText(operation);
      expect(text, operation).not.toBe(operation);
      expect(text, operation).not.toBe('Other change');
      expect(text, operation).not.toMatch(/[._]/);
    }
  });

  it('lists only changed fields, or all fields of a creation', () => {
    expect(changedFields({ a: 1, b: 'x' }, { a: 2, b: 'x' })).toEqual([{ field: 'a', before: '1', after: '2' }]);
    expect(changedFields(null, { a: 1, b: null })).toEqual([
      { field: 'a', before: 'none', after: '1' },
      { field: 'b', before: 'none', after: 'none' },
    ]);
    expect(changedFields({ a: 1 }, null)).toEqual([{ field: 'a', before: '1', after: 'none' }]);
  });

  it('renders values as text', () => {
    expect(valueText('')).toBe('none');
    expect(valueText(true)).toBe('true');
    expect(valueText({ k: 1 })).toBe('{"k":1}');
  });
});
