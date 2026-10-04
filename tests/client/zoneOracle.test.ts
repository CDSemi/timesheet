import { describe, expect, it } from 'vitest';
import { dateTimeIn, instantOfWallTime, legacyPdtWallTime, wallTimeIn } from './zoneOracle.ts';

/*
 * WP2-B2-01: the R-07 e2e types 22:00 to 23:30 in Asia/Ho_Chi_Minh (+07:00, no DST) and expects
 * the Los Angeles wall time of that instant. The e2e takes its date from the real clock, so the
 * expectation must follow the season: PDT (-07:00) gives 08:00, PST (-08:00) gives 07:00.
 * The e2e harness has no clock override (production code has none), so both seasons are proved
 * here, on the same oracle the spec calls.
 */
const HCM = 'Asia/Ho_Chi_Minh';
const LA = 'America/Los_Angeles';

describe('zone oracle', () => {
  it('follows the Los Angeles season for a time typed at +07:00', () => {
    // [date, start in LA, end in LA]
    const cases: Array<[string, string, string]> = [
      ['2026-07-15', '08:00', '09:30'], // PDT
      ['2026-10-02', '08:00', '09:30'], // PDT, a day the WP2 fixtures use
      ['2026-01-14', '07:00', '08:30'], // PST
      ['2026-12-21', '07:00', '08:30'], // PST
      ['2026-03-08', '08:00', '09:30'], // spring-forward day: the gap is at 02:00 LA, before 15:00Z
      ['2026-11-01', '07:00', '08:30'], // fall-back day: back to PST at 09:00Z, before 15:00Z
    ];
    for (const [date, start, end] of cases) {
      expect(wallTimeIn(date, '22:00', HCM, LA), date).toBe(`${date} ${start}`);
      expect(wallTimeIn(date, '23:30', HCM, LA), date).toBe(`${date} ${end}`);
    }
  });

  it('keeps the Los Angeles calendar date for every day of a year', () => {
    for (let ms = Date.parse('2026-01-01T00:00:00Z'); ms < Date.parse('2027-01-01T00:00:00Z'); ms += 86_400_000) {
      const date = new Date(ms).toISOString().slice(0, 10);
      const start = wallTimeIn(date, '22:00', HCM, LA);
      const end = wallTimeIn(date, '23:30', HCM, LA);
      expect(start.slice(0, 10), date).toBe(date);
      expect(end.slice(0, 10), date).toBe(date);
      expect(['07:00', '08:00']).toContain(start.slice(11));
    }
  });

  it('resolves the instant of a wall time and refuses a DST gap', () => {
    expect(instantOfWallTime('2026-01-14', '22:00', HCM)).toBe('2026-01-14T15:00:00.000Z');
    expect(instantOfWallTime('2026-07-15', '03:00', LA)).toBe('2026-07-15T10:00:00.000Z');
    expect(instantOfWallTime('2026-01-14', '03:00', LA)).toBe('2026-01-14T11:00:00.000Z');
    expect(() => instantOfWallTime('2026-03-08', '02:30', LA)).toThrow(/not an unambiguous wall time/);
    expect(dateTimeIn('2026-01-14T15:00:00Z', HCM)).toBe('2026-01-14 22:00');
  });

  it('refuses a DST fold, where one wall time is two instants', () => {
    // WP2-B3-02: the documented behaviour is a throw, never a silent zone-dependent choice.
    const folds: Array<[string, string, string]> = [
      ['2026-11-01', '01:30', LA], // PDT 08:30Z or PST 09:30Z
      ['2026-04-05', '02:30', 'Australia/Sydney'], // AEDT 15:30Z or AEST 16:30Z
      ['2026-10-25', '02:30', 'Europe/Berlin'], // CEST 00:30Z or CET 01:30Z
      ['2026-10-25', '02:00', 'Europe/Berlin'], // the first repeated minute
      ['2026-10-25', '02:59', 'Europe/Berlin'], // the last repeated minute
    ];
    for (const [date, time, zone] of folds) {
      expect(() => instantOfWallTime(date, time, zone), `${zone} ${date} ${time}`).toThrow(/not an unambiguous wall time.*fold/);
      expect(() => wallTimeIn(date, time, zone, HCM), `${zone} ${date} ${time}`).toThrow(/fold/);
    }
  });

  it('refuses a DST gap in every zone and accepts the minutes next to a gap or a fold', () => {
    const gaps: Array<[string, string, string]> = [
      ['2026-03-08', '02:30', LA],
      ['2026-10-04', '02:30', 'Australia/Sydney'],
      ['2026-03-29', '02:30', 'Europe/Berlin'],
    ];
    for (const [date, time, zone] of gaps) {
      expect(() => instantOfWallTime(date, time, zone), `${zone} ${date} ${time}`).toThrow(/not an unambiguous wall time.*gap/);
    }
    // One minute before and after each ambiguous or missing interval is still unambiguous.
    expect(instantOfWallTime('2026-03-08', '01:59', LA)).toBe('2026-03-08T09:59:00.000Z');
    expect(instantOfWallTime('2026-03-08', '03:00', LA)).toBe('2026-03-08T10:00:00.000Z');
    expect(instantOfWallTime('2026-11-01', '00:59', LA)).toBe('2026-11-01T07:59:00.000Z');
    expect(instantOfWallTime('2026-11-01', '02:00', LA)).toBe('2026-11-01T10:00:00.000Z');
    expect(instantOfWallTime('2026-10-25', '01:59', 'Europe/Berlin')).toBe('2026-10-24T23:59:00.000Z');
    expect(instantOfWallTime('2026-10-25', '03:00', 'Europe/Berlin')).toBe('2026-10-25T02:00:00.000Z');
  });

  it('shows that the old fixed 08:00 expectation is wrong in winter and right only in summer', () => {
    expect(legacyPdtWallTime('2026-07-15', '22:00')).toBe(wallTimeIn('2026-07-15', '22:00', HCM, LA));
    expect(legacyPdtWallTime('2026-01-14', '22:00')).not.toBe(wallTimeIn('2026-01-14', '22:00', HCM, LA));
  });
});
