import { describe, expect, it } from 'vitest';
import {
  addBreakRow,
  type BreakRowDraft,
  buildSessionDialogRequest,
  changeDialogZone,
  editBreakRow,
  newBreakRow,
  newSessionDialogDraft,
  rowKeepsPin,
  type SessionDialogDraft,
  suggestionRows,
} from '../../src/client/components/breakRowsModel.ts';
import {
  applyBreakEdit,
  breakChipText,
  breakDateVisible,
  breakListLayout,
  breakRowsMinWidth,
  followSessionDate,
} from '../../src/client/components/breakChipModel.ts';
import type { PolicyVersion } from '../../src/client/api.ts';
import { parseUtcInstant } from '../../src/domain/instants.ts';

const LA = 'America/Los_Angeles';
const utc = (text: string) => parseUtcInstant(text);

function field(date: string, time: string) {
  return { date, time, fold: null, offset: null };
}

function typedRow(key: string, date: string, time: string, minutes: string): BreakRowDraft {
  return { ...newBreakRow(key, date), start: field(date, time), minutes };
}

function dialog(overrides: Partial<SessionDialogDraft> = {}): SessionDialogDraft {
  return {
    ...newSessionDialogDraft('2026-10-14', LA),
    start: field('2026-10-14', '08:00'),
    end: field('2026-10-14', '17:00'),
    ...overrides,
  };
}

const POLICY: PolicyVersion = {
  id: 'policy-1',
  seq: 1,
  effective_from: '2026-01-01',
  required_minutes: 480,
  threshold_minutes: 30,
  rounding_step_minutes: 30,
  reference_start: '08:00',
  reference_end: '17:00',
  breaks: [
    { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
    { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
    { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
  ],
};

describe('breakDateVisible (owner answer Q6 b)', () => {
  it('hides the date field for a session that starts and ends on one local date', () => {
    expect(breakDateVisible('2026-10-14', '2026-10-14')).toBe(false);
  });

  it('shows it when the end date differs, whichever way', () => {
    expect(breakDateVisible('2026-10-14', '2026-10-15')).toBe(true);
    expect(breakDateVisible('2026-10-15', '2026-10-14')).toBe(true);
  });

  it('shows it while the session has no end date, or no start date to follow', () => {
    expect(breakDateVisible('2026-10-14', '')).toBe(true);
    expect(breakDateVisible('', '2026-10-14')).toBe(true);
    expect(breakDateVisible('', '')).toBe(true);
  });
});

describe('followSessionDate: a hidden row date is the session date', () => {
  it('moves a row to a changed session date and marks it changed, so its pin is dropped', () => {
    const rows = suggestionRows(POLICY, utc('2026-10-14T15:00:00Z'), utc('2026-10-15T00:00:00Z'), LA, (index) => `s${index}`);
    const start = dialog({ rows, noBreaks: false });
    expect(followSessionDate(start)).toBe(start);
    const moved = followSessionDate({ ...start, start: field('2026-10-16', '08:00'), end: field('2026-10-16', '17:00') });
    expect(moved.rows.map((row) => [row.start.date, row.start.time, row.start.offset, row.edited])).toEqual([
      ['2026-10-16', '10:00', null, true],
      ['2026-10-16', '12:00', null, true],
      ['2026-10-16', '14:30', null, true],
    ]);
    expect(moved.rows.map((row) => rowKeepsPin(row, LA))).toEqual([false, false, false]);
  });

  it('keeps a row that already has the session date exactly as it is (its pin stays)', () => {
    const rows = suggestionRows(POLICY, utc('2026-10-14T15:00:00Z'), utc('2026-10-15T00:00:00Z'), LA, (index) => `s${index}`);
    const draft = dialog({ rows });
    expect(followSessionDate(draft)).toBe(draft);
    const [first] = followSessionDate(draft).rows;
    expect(first === undefined ? false : rowKeepsPin(first, LA)).toBe(true);
  });

  it('leaves the dates alone while the date field is shown (an overnight session or no end date)', () => {
    const rows = [typedRow('a', '2026-10-15', '00:30', '15')];
    const overnight = dialog({ rows, end: field('2026-10-15', '06:00') });
    expect(followSessionDate(overnight)).toBe(overnight);
    const noEnd = dialog({ rows, end: field('', '') });
    expect(followSessionDate(noEnd)).toBe(noEnd);
  });

  it('follows after the input zone changed: the typed wall dates stay, so the rows stay on the session date', () => {
    const draft = dialog({ rows: [typedRow('a', '2026-10-14', '10:00', '15')] });
    const changed = followSessionDate(changeDialogZone(draft, 'Asia/Ho_Chi_Minh'));
    expect(changed.rows.map((row) => row.start.date)).toEqual(['2026-10-14']);
  });

  it('a row added later starts on the session date', () => {
    const added = followSessionDate(addBreakRow(dialog(), 'n1'));
    expect(added.rows.map((row) => row.start.date)).toEqual(['2026-10-14']);
  });

  it('the request carries the same instants as for a typed date: 2026-10-16 10:00 for 15 minutes', () => {
    const typedOnTheOldDate = dialog({
      start: field('2026-10-16', '08:00'),
      end: field('2026-10-16', '17:00'),
      rows: [typedRow('a', '2026-10-16', '10:00', '15')],
    });
    const followed = followSessionDate({ ...typedOnTheOldDate, rows: [typedRow('a', '2026-10-14', '10:00', '15')] });
    const send = (draft: SessionDialogDraft) => {
      const built = buildSessionDialogRequest(draft, { allowUnconfirmed: false });
      if (!built.ok) throw new Error(JSON.stringify(built));
      return built.request;
    };
    expect(send(followed)).toEqual(send(typedOnTheOldDate));
    expect(send(followed).breaks).toEqual([
      { start: { local: '2026-10-16T10:00', zone: LA }, end: { local: '2026-10-16T10:15', zone: LA, offset: '-07:00' }, counts_as_work: false },
    ]);
  });

  it('a row edited by the person keeps its change when it follows', () => {
    const draft = editBreakRow(dialog({ rows: [typedRow('a', '2026-10-14', '10:00', '15')] }), 'a', { minutes: '20' });
    const followed = followSessionDate({ ...draft, start: field('2026-10-15', '08:00'), end: field('2026-10-15', '17:00') });
    expect(followed.rows.map((row) => [row.start.date, row.minutes])).toEqual([['2026-10-15', '20']]);
  });
});

describe('applyBreakEdit: what the sub-dialog hands back reaches the draft with the T06 functions', () => {
  const rowsOf = () => suggestionRows(POLICY, utc('2026-10-14T15:00:00Z'), utc('2026-10-15T00:00:00Z'), LA, (index) => `s${index}`);
  const first = (draft: SessionDialogDraft) => {
    const [row] = draft.rows;
    if (row === undefined) throw new Error('expected a row');
    return row;
  };

  it('an unchanged copy changes nothing: the row keeps its pinned instants', () => {
    const draft = dialog({ rows: rowsOf() });
    const same = applyBreakEdit(draft, 's0', first(draft));
    expect(same).toBe(draft);
    expect(rowKeepsPin(first(same), LA)).toBe(true);
  });

  it('new minutes keep the start as it is and mark the row changed', () => {
    const draft = dialog({ rows: rowsOf() });
    const next = applyBreakEdit(draft, 's0', { ...first(draft), minutes: '20' });
    expect(next).toEqual(editBreakRow(draft, 's0', { minutes: '20' }));
    expect(first(next).start).toEqual(first(draft).start);
    expect(first(next).edited).toBe(true);
    expect(next.breaksEdited).toBe(true);
  });

  it('a new time or date drops the pin and the old fold, and the fold chosen in the sub-dialog is kept', () => {
    const draft = dialog({ rows: [typedRow('a', '2026-10-14', '10:00', '15')] });
    const row = first(draft);
    const next = applyBreakEdit(draft, 'a', { ...row, start: { ...row.start, time: '10:30', fold: 1 } });
    expect(first(next).start).toEqual({ date: '2026-10-14', time: '10:30', fold: 1, offset: null });
    const dated = applyBreakEdit(draft, 'a', { ...row, start: { ...row.start, date: '2026-10-15' } });
    expect(first(dated).start.date).toBe('2026-10-15');
  });

  it('only a changed fold is applied without touching the start', () => {
    const draft = dialog({ rows: [typedRow('a', '2026-11-01', '01:30', '15')] });
    const row = first(draft);
    const next = applyBreakEdit(draft, 'a', { ...row, start: { ...row.start, fold: 0 } });
    expect(first(next).start).toEqual({ date: '2026-11-01', time: '01:30', fold: 0, offset: null });
    expect(first(next).edited).toBe(false);
  });

  it('an unknown key returns the draft as it is', () => {
    const draft = dialog({ rows: rowsOf() });
    expect(applyBreakEdit(draft, 'missing', typedRow('x', '2026-10-14', '09:00', '5'))).toBe(draft);
  });
});

describe('breakChipText: 24-hour text of a chip', () => {
  const valid = (time: string, minutes: string, date = '2026-10-14') => typedRow('a', date, time, minutes);

  it('a same-day break reads label, start and end without a date', () => {
    const chip = breakChipText(valid('10:00', '15'), 0, LA, false);
    expect(chip.text).toBe('Break 1 · 10:00 → 10:15');
    expect(chip.spoken).toBe('Break 1 · 10:00 to 10:15');
    expect(chip).toMatchObject({ label: 'Break 1', start: '10:00', end: '10:15', problem: null });
  });

  it('an overnight session adds the start date, in the US form, and the end is a time only', () => {
    const chip = breakChipText(valid('23:40', '30', '2026-10-12'), 1, LA, true);
    expect(chip.text).toBe('Break 2 · 10/12/2026 23:40 → 00:10');
    expect(chip.spoken).toBe('Break 2 · 10/12/2026 23:40 to 00:10');
  });

  it('uses 24 hours for the afternoon', () => {
    expect(breakChipText(valid('14:30', '45'), 2, LA, false).text).toBe('Break 3 · 14:30 → 15:15');
    expect(breakChipText(valid('00:05', '10'), 0, LA, false).text).toBe('Break 1 · 00:05 → 00:15');
  });

  it('keeps seconds of a saved break, so the text is not shorter than the value', () => {
    const [row] = suggestionRows(POLICY, utc('2026-10-14T15:00:30Z'), null, LA, (index) => `s${index}`);
    if (row === undefined) throw new Error('expected a row');
    expect(breakChipText(row, 0, LA, false).text).toBe('Break 1 · 10:00:30 → 10:15:30');
  });

  it('says which piece is missing', () => {
    expect(breakChipText(valid('14:30', ''), 2, LA, false).text).toBe('Break 3 · 14:30, minutes missing');
    expect(breakChipText(valid('14:30', '   '), 2, LA, false).problem).toBe('minutes missing');
    expect(breakChipText(valid('', '15'), 0, LA, false).text).toBe('Break 1 · start time missing');
    expect(breakChipText(valid('', ''), 0, LA, false).text).toBe('Break 1 · start time and minutes missing');
    expect(breakChipText(valid('14:30', '', '2026-10-12'), 2, LA, true).text).toBe('Break 3 · 10/12/2026 14:30, minutes missing');
    expect(breakChipText({ ...valid('14:30', '15'), start: field('', '14:30') }, 0, LA, true).text).toBe('Break 1 · 14:30, date missing');
  });

  it('says when the minutes cannot be used or the start cannot be placed', () => {
    expect(breakChipText(valid('14:30', '0'), 0, LA, false).text).toBe('Break 1 · 14:30, minutes not valid');
    expect(breakChipText(valid('14:30', '1000'), 0, LA, false).problem).toBe('minutes not valid');
    // 2027-03-14 02:30 does not exist in Los Angeles.
    expect(breakChipText(valid('02:30', '15', '2027-03-14'), 0, LA, false).text).toBe('Break 1 · 02:30, check the start time');
  });

  it('shows no arrow while there is no end', () => {
    expect(breakChipText(valid('14:30', ''), 0, LA, false).text).not.toContain('→');
    expect(breakChipText(valid('14:30', ''), 0, LA, false).spoken).not.toContain(' to ');
  });
});

describe('breakListLayout: rows or chips by the measured list width', () => {
  const REM = 15;

  it('the measured thresholds at the 15px root: 268px for a same-day row, 390px for an overnight row', () => {
    expect(breakRowsMinWidth(REM, false)).toBe(268);
    expect(breakRowsMinWidth(REM, true)).toBe(390);
    expect(breakRowsMinWidth(REM, false)).toBeLessThan(breakRowsMinWidth(REM, true));
  });

  it('is rows at and above each threshold and chips below it', () => {
    expect(breakListLayout(268, REM, false)).toBe('rows');
    expect(breakListLayout(267.5, REM, false)).toBe('chips');
    expect(breakListLayout(390, REM, true)).toBe('rows');
    expect(breakListLayout(389.5, REM, true)).toBe('chips');
    // The probe: one line at 272 and 392, wrapped at 264 and 384.
    expect(breakListLayout(272, REM, false)).toBe('rows');
    expect(breakListLayout(264, REM, false)).toBe('chips');
    expect(breakListLayout(392, REM, true)).toBe('rows');
    expect(breakListLayout(384, REM, true)).toBe('chips');
  });

  it('reads the phone widths: a same-day session keeps rows from 320px, an overnight one only from the wide phones', () => {
    // The list is the dialog width minus 2 x 16px of body padding.
    const list = (viewport: number) => viewport - 32;
    for (const viewport of [430, 390, 375, 360, 320]) expect(breakListLayout(list(viewport), REM, false), `same day at ${viewport}`).toBe('rows');
    expect(breakListLayout(list(430), REM, true)).toBe('rows');
    for (const viewport of [390, 375, 360, 320]) expect(breakListLayout(list(viewport), REM, true), `overnight at ${viewport}`).toBe('chips');
  });

  it('the field widths scale with the root font size, the fixed pixels do not', () => {
    expect(breakRowsMinWidth(20, true)).toBe(20 * 20 + 90);
    expect(breakRowsMinWidth(20, false)).toBe(12.4 * 20 + 82);
    expect(breakListLayout(20 * 20 + 89, 20, true)).toBe('chips');
    expect(breakListLayout(20 * 20 + 90, 20, true)).toBe('rows');
  });
});
