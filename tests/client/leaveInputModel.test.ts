import { describe, expect, it } from 'vitest';
import {
  invalidLeaveParts,
  LEAVE_INPUT_MESSAGE,
  LEAVE_MAX_MINUTES,
  leaveInputOf,
  parseLeaveInput,
} from '../../src/client/components/leaveInputModel.ts';
import { leaveHint } from '../../src/client/components/sessionModel.ts';

/*
 * Partial leave typed as hours and minutes: an input conversion to the same integer leave
 * minutes the day endpoint takes (0 to 1440), with the same limits. No business figure.
 */
describe('leave typed as hours and minutes', () => {
  it('converts the two fields to the integer leave minutes', () => {
    expect(parseLeaveInput({ hours: '4', minutes: '0' })).toEqual({ ok: true, minutes: 240 });
    expect(parseLeaveInput({ hours: '1', minutes: '30' })).toEqual({ ok: true, minutes: 90 });
    expect(parseLeaveInput({ hours: '0', minutes: '59' })).toEqual({ ok: true, minutes: 59 });
    expect(parseLeaveInput({ hours: ' 8 ', minutes: ' 15 ' })).toEqual({ ok: true, minutes: 495 });
  });

  it('reads empty fields as zero', () => {
    expect(parseLeaveInput({ hours: '', minutes: '' })).toEqual({ ok: true, minutes: 0 });
    expect(parseLeaveInput({ hours: '2', minutes: '' })).toEqual({ ok: true, minutes: 120 });
    expect(parseLeaveInput({ hours: '', minutes: '45' })).toEqual({ ok: true, minutes: 45 });
  });

  it('accepts exactly the API limits: 0 and 24h 00m (1440 minutes)', () => {
    expect(parseLeaveInput({ hours: '0', minutes: '0' })).toEqual({ ok: true, minutes: 0 });
    expect(parseLeaveInput({ hours: '24', minutes: '0' })).toEqual({ ok: true, minutes: LEAVE_MAX_MINUTES });
    expect(LEAVE_MAX_MINUTES).toBe(1440);
  });

  it('refuses anything above 1440 minutes, minutes of 60 or more, and hours above 24', () => {
    for (const input of [
      { hours: '24', minutes: '1' },
      { hours: '25', minutes: '0' },
      { hours: '0', minutes: '60' },
      { hours: '23', minutes: '60' },
      { hours: '0', minutes: '1440' },
    ]) {
      expect(parseLeaveInput(input), JSON.stringify(input)).toEqual({ ok: false, message: LEAVE_INPUT_MESSAGE });
    }
  });

  it('refuses what is not a whole number: decimals, signs, exponents and words', () => {
    for (const text of ['1.5', '-1', '+1', '1e1', 'abc', '0x10', '1 2']) {
      expect(parseLeaveInput({ hours: text, minutes: '0' }).ok, `hours ${text}`).toBe(false);
      expect(parseLeaveInput({ hours: '0', minutes: text }).ok, `minutes ${text}`).toBe(false);
    }
  });

  it('refuses malformed text such as "2-" and "3-", and an empty or out of range part', () => {
    for (const text of ['2-', '3-', 'e', '1.5', '-1']) {
      expect(parseLeaveInput({ hours: text, minutes: '30' }), `hours ${text}`).toEqual({ ok: false, message: LEAVE_INPUT_MESSAGE });
      expect(parseLeaveInput({ hours: '4', minutes: text }), `minutes ${text}`).toEqual({ ok: false, message: LEAVE_INPUT_MESSAGE });
    }
    expect(parseLeaveInput({ hours: '', minutes: '60' }).ok).toBe(false);
    expect(parseLeaveInput({ hours: '25', minutes: '' }).ok).toBe(false);
  });

  // A number field holds "" for text the browser cannot read ("2-", "e"), exactly like an empty field,
  // so the form passes the browser's own bad-input flag along; it must never be read as 0.
  it('refuses a part the browser flagged as bad input, whatever value it reports', () => {
    expect(parseLeaveInput({ hours: '', minutes: '30', hoursBad: true })).toEqual({ ok: false, message: LEAVE_INPUT_MESSAGE });
    expect(parseLeaveInput({ hours: '4', minutes: '', minutesBad: true })).toEqual({ ok: false, message: LEAVE_INPUT_MESSAGE });
    expect(parseLeaveInput({ hours: '', minutes: '', hoursBad: true, minutesBad: true }).ok).toBe(false);
    expect(parseLeaveInput({ hours: '2', minutes: '30', hoursBad: false, minutesBad: false })).toEqual({ ok: true, minutes: 150 });
    expect(parseLeaveInput({ hours: '', minutes: '', hoursBad: false, minutesBad: false })).toEqual({ ok: true, minutes: 0 });
    expect(leaveHint({ hours: '', minutes: '30', hoursBad: true })).toBeNull();
  });

  it('names the parts that are wrong so the form can mark them', () => {
    expect(invalidLeaveParts({ hours: '2', minutes: '30' })).toEqual({ hours: false, minutes: false });
    expect(invalidLeaveParts({ hours: '', minutes: '' })).toEqual({ hours: false, minutes: false });
    expect(invalidLeaveParts({ hours: '', minutes: '30', hoursBad: true })).toEqual({ hours: true, minutes: false });
    expect(invalidLeaveParts({ hours: '4', minutes: '3-' })).toEqual({ hours: false, minutes: true });
    expect(invalidLeaveParts({ hours: '25', minutes: '60' })).toEqual({ hours: true, minutes: true });
    // Each part is fine alone but the sum passes 24h 00m: both are marked.
    expect(invalidLeaveParts({ hours: '24', minutes: '1' })).toEqual({ hours: true, minutes: true });
  });

  it('starts the fields from the stored leave minutes, and the round trip is exact', () => {
    expect(leaveInputOf(0)).toEqual({ hours: '0', minutes: '0' });
    expect(leaveInputOf(240)).toEqual({ hours: '4', minutes: '0' });
    expect(leaveInputOf(95)).toEqual({ hours: '1', minutes: '35' });
    expect(leaveInputOf(1440)).toEqual({ hours: '24', minutes: '0' });
    for (let minutes = 0; minutes <= LEAVE_MAX_MINUTES; minutes += 1) {
      expect(parseLeaveInput(leaveInputOf(minutes))).toEqual({ ok: true, minutes });
    }
  });
});
