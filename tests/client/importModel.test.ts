import { describe, expect, it } from 'vitest';
import {
  ApiRequestError,
  type ImportDayReason,
  type ImportPeriodState,
  type ImportPlan,
  type ImportPlanDay,
} from '../../src/client/api.ts';
import {
  allowedActions,
  batchStateText,
  chooseAction,
  commitCounts,
  decisionList,
  defaultDecisions,
  IMPORT_MAX_BYTES,
  IMPORTED_PERIOD_REASON,
  IMPORTED_STATUS_TEXT,
  importErrorMessage,
  ledgerEntryLabel,
  OPENING_MAX_MINUTES,
  openingBalanceErrorMessage,
  openingFormProblems,
  parseSignedMinutes,
  periodStateText,
  reasonText,
  resultingPosted,
  signedMinutesText,
  splitSignedMinutes,
  workbookFileProblem,
} from '../../src/client/importModel.ts';

/*
 * WP4-T11: the pure model behind the import and opening-balance screens. It decides which actions to offer, how to
 * word the server's codes and how to read the signed minutes of the opening-balance form. The server owns every
 * rule: nothing here maps a label, plans a conflict or posts a balance.
 */

const ALL_REASONS: ImportDayReason[] = [
  'finalized_period',
  'imported_period',
  'existing_app_rows',
  'period_not_in_calendar',
  'period_not_ended',
  'period_not_due',
  'unknown_label',
  'unsupported_label',
  'date_cell_missing',
  'date_unexpected',
  'duplicate_date',
  'outside_calendar',
  'floating_holiday',
  'label_from_formula_cache',
];

const ALL_STATES: ImportPeriodState[] = ['new', 'existing_app_rows', 'finalized', 'imported', 'not_in_calendar', 'not_ended', 'not_due'];

function planDay(workDate: string, sheet: string, status: ImportPlanDay['status'], reasons: ImportDayReason[] = []): ImportPlanDay {
  return { work_date: workDate, sheet, source: `${sheet}!B14`, category: 'Worked', wfh: false, status, reasons };
}

/** P1 is new (three importable days, one floating holiday that allows import); P2 is finalized (skip only). */
const PLAN: ImportPlan = {
  periods: [
    { sheet: '2026.06.26', payroll_date: '2026-06-26', period_start: '2026-06-08', period_end: '2026-06-21', state: 'new' },
    { sheet: '2026.07.10', payroll_date: '2026-07-10', period_start: '2026-06-22', period_end: '2026-07-05', state: 'finalized' },
    { sheet: '2026.07.24', payroll_date: '2026-07-24', period_start: '2026-07-06', period_end: '2026-07-19', state: 'new' },
  ],
  days: [
    planDay('2026-06-08', '2026.06.26', 'importable'),
    planDay('2026-06-09', '2026.06.26', 'importable'),
    planDay('2026-06-10', '2026.06.26', 'importable'),
    planDay('2026-06-11', '2026.06.26', 'decision_required', ['floating_holiday']),
    planDay('2026-06-12', '2026.06.26', 'blank'),
    planDay('2026-06-22', '2026.07.10', 'decision_required', ['finalized_period']),
    planDay('2026-07-08', '2026.07.24', 'decision_required', ['label_from_formula_cache']),
  ],
  decisions_required: [
    { work_date: '2026-06-11', reasons: ['floating_holiday'], allowed_actions: ['skip', 'import'], sources: ['2026.06.26!F14'] },
    { work_date: '2026-06-22', reasons: ['finalized_period'], allowed_actions: ['skip'], sources: ['2026.07.10!B14'] },
    { work_date: '2026-07-08', reasons: ['label_from_formula_cache'], allowed_actions: ['skip', 'import'], sources: ['2026.07.24!J14'] },
  ],
  importable_days: 3,
};

describe('workbook file check (before any upload)', () => {
  it('accepts an .xlsx file whatever the case of the extension', () => {
    expect(workbookFileProblem({ name: 'Hours 2026.xlsx', size: 25_878 })).toBeNull();
    expect(workbookFileProblem({ name: 'HOURS.XLSX', size: 1 })).toBeNull();
  });

  it('refuses a macro-enabled, older or extension-less file and says what is accepted', () => {
    for (const name of ['hours.xlsm', 'hours.xls', 'hours.csv', 'hours']) {
      expect(workbookFileProblem({ name, size: 100 }), name).toMatch(/\.xlsx/);
    }
  });

  it('refuses an empty file', () => {
    expect(workbookFileProblem({ name: 'hours.xlsx', size: 0 })).toBe('The file is empty.');
  });

  it('refuses a file above the 2 MiB limit and allows exactly the limit', () => {
    expect(IMPORT_MAX_BYTES).toBe(2 * 1024 * 1024);
    expect(workbookFileProblem({ name: 'hours.xlsx', size: IMPORT_MAX_BYTES })).toBeNull();
    const problem = workbookFileProblem({ name: 'hours.xlsx', size: IMPORT_MAX_BYTES + 1 });
    expect(problem).toContain('2 MiB');
  });
});

describe('labels', () => {
  it('words every conflict reason in plain, distinct text and never shows the stored code', () => {
    const texts = ALL_REASONS.map((reason) => reasonText(reason));
    for (const text of texts) {
      expect(text.length).toBeGreaterThan(10);
      expect(text).not.toContain('_');
    }
    expect(new Set(texts).size).toBe(ALL_REASONS.length);
    expect(reasonText('floating_holiday')).toMatch(/floating/i);
    expect(reasonText('finalized_period')).toMatch(/finalized/i);
  });

  it('words every period state in plain, distinct text', () => {
    const texts = ALL_STATES.map((state) => periodStateText(state));
    for (const text of texts) expect(text).not.toContain('_');
    expect(new Set(texts).size).toBe(ALL_STATES.length);
    expect(periodStateText('new')).toBe('Ready to import');
    expect(periodStateText('imported')).toBe('Already imported');
  });

  it('names a batch state', () => {
    expect(batchStateText('preview')).toBe('Preview, not committed');
    expect(batchStateText('committed')).toBe('Committed');
  });

  it('uses one status word for an imported period and one reason for its disabled controls', () => {
    expect(IMPORTED_STATUS_TEXT).toBe('Imported, unverified');
    expect(IMPORTED_PERIOD_REASON).toMatch(/read-only/);
    expect(IMPORTED_PERIOD_REASON).toMatch(/edited, signed or submitted/);
  });

  it('labels the opening balance and its correction, and keeps the other entry wording', () => {
    expect(ledgerEntryLabel({ entry_type: 'opening_balance', source_key: 'opening_balance' })).toBe('Opening balance');
    expect(ledgerEntryLabel({ entry_type: 'correction', source_key: 'opening_balance:correction:2' })).toBe('Opening balance correction');
    expect(ledgerEntryLabel({ entry_type: 'correction', source_key: 'credit:2026-09-18:correction:1' })).toBe('correction');
    expect(ledgerEntryLabel({ entry_type: 'leave_consumption', source_key: 'use-1' })).toBe('leave consumption');
  });
});

describe('per-day decisions: only the allowed actions, default skip', () => {
  it('always offers skip first and never an action the server did not list', () => {
    expect(allowedActions({ allowed_actions: ['skip', 'import'] })).toEqual(['skip', 'import']);
    expect(allowedActions({ allowed_actions: ['import', 'skip'] })).toEqual(['skip', 'import']);
    expect(allowedActions({ allowed_actions: ['skip'] })).toEqual(['skip']);
    expect(allowedActions({ allowed_actions: [] })).toEqual(['skip']);
    expect(allowedActions({ allowed_actions: ['import'] })).toEqual(['skip']);
  });

  it('defaults every conflicting day to skip', () => {
    expect(defaultDecisions(PLAN)).toEqual({ '2026-06-11': 'skip', '2026-06-22': 'skip', '2026-07-08': 'skip' });
    expect(defaultDecisions(null)).toEqual({});
  });

  it('records an allowed choice without changing the earlier map', () => {
    const start = defaultDecisions(PLAN);
    const item = PLAN.decisions_required[0];
    if (item === undefined) throw new Error('fixture');
    const next = chooseAction(start, item, 'import');
    expect(next['2026-06-11']).toBe('import');
    expect(start['2026-06-11']).toBe('skip');
  });

  it('ignores a choice the day does not allow', () => {
    const start = defaultDecisions(PLAN);
    const finalized = PLAN.decisions_required[1];
    if (finalized === undefined) throw new Error('fixture');
    const next = chooseAction(start, finalized, 'import');
    expect(next).toBe(start);
    expect(next['2026-06-22']).toBe('skip');
  });

  it('builds the commit list in date order with skip for a missing or disallowed choice', () => {
    const list = decisionList(PLAN, { '2026-07-08': 'import', '2026-06-22': 'import', '2026-12-31': 'import' });
    expect(list).toEqual([
      { work_date: '2026-06-11', action: 'skip' },
      { work_date: '2026-06-22', action: 'skip' },
      { work_date: '2026-07-08', action: 'import' },
    ]);
  });

  it('counts what a commit would write, from the plan and the choices', () => {
    expect(commitCounts(PLAN, defaultDecisions(PLAN))).toEqual({ importedDays: 3, importedOnDecision: 0, skippedDays: 3, periods: 1 });
    expect(commitCounts(PLAN, { '2026-06-11': 'import', '2026-06-22': 'skip', '2026-07-08': 'skip' })).toEqual({
      importedDays: 4,
      importedOnDecision: 1,
      skippedDays: 2,
      periods: 1,
    });
    // A new period that holds only a day imported on decision is still a period the commit creates.
    expect(commitCounts(PLAN, { '2026-06-11': 'skip', '2026-06-22': 'skip', '2026-07-08': 'import' })).toEqual({
      importedDays: 4,
      importedOnDecision: 1,
      skippedDays: 2,
      periods: 2,
    });
  });

  it('never counts a disallowed import as imported', () => {
    expect(commitCounts(PLAN, { '2026-06-11': 'skip', '2026-06-22': 'import', '2026-07-08': 'skip' })).toEqual({
      importedDays: 3,
      importedOnDecision: 0,
      skippedDays: 3,
      periods: 1,
    });
  });
});

describe('import error messages', () => {
  const fail = (status: number, code: string, details?: Record<string, unknown>, message = 'server text') =>
    new ApiRequestError(status, code, message, details);

  it('maps 413 and 415 to the limit and the accepted type', () => {
    expect(importErrorMessage(fail(413, 'payload_too_large'))).toMatch(/2 MiB.*not uploaded/);
    expect(importErrorMessage(fail(415, 'unsupported_media_type'))).toMatch(/\.xlsx/);
  });

  it('maps a rejected workbook to its reason in words, and never to the stored code', () => {
    const rejected = (reason: string) => importErrorMessage(fail(422, 'workbook_rejected', { reason }));
    expect(rejected('macro_content')).toMatch(/macros/);
    expect(rejected('doctype_forbidden')).toMatch(/DTD|entity|entities/i);
    expect(rejected('not_a_zip')).toMatch(/not a valid .xlsx/);
    expect(rejected('package_too_large')).toMatch(/too large/);
    expect(rejected('zzz_unknown')).toMatch(/cannot be read safely/);
    for (const reason of ['macro_content', 'doctype_forbidden', 'not_a_zip', 'package_too_large', 'zzz_unknown']) {
      expect(rejected(reason)).not.toContain('_');
      expect(rejected(reason)).toMatch(/not stored/);
    }
  });

  it('maps the decision refusals', () => {
    expect(importErrorMessage(fail(409, 'decisions_required', { decisions_required: [{}, {}] }))).toMatch(/2 days.*Nothing was imported/);
    expect(importErrorMessage(fail(409, 'decisions_required', { decisions_required: [{}] }))).toMatch(/1 day /);
    expect(importErrorMessage(fail(409, 'decisions_required'))).toMatch(/Nothing was imported/);
    const notAllowed = importErrorMessage(fail(422, 'decision_not_allowed', { work_date: '2026-09-02', allowed_actions: ['skip'] }));
    expect(notAllowed).toContain('2026-09-02');
    expect(notAllowed).toMatch(/skip/);
    expect(importErrorMessage(fail(422, 'unknown_decision', { work_date: '2026-09-03' }))).toContain('2026-09-03');
    expect(importErrorMessage(fail(422, 'duplicate_decision', { work_date: '2026-09-04' }))).toContain('2026-09-04');
  });

  it('maps a second commit with other decisions, an empty upload, a missing batch and an imported period', () => {
    expect(importErrorMessage(fail(409, 'import_already_committed'))).toMatch(/already imported.*different decisions/i);
    expect(importErrorMessage(fail(422, 'empty_upload'))).toMatch(/empty/);
    expect(importErrorMessage(fail(404, 'not_found'))).toMatch(/not found/);
    expect(importErrorMessage(fail(409, 'imported_period'))).toMatch(/read-only/);
  });

  it('falls back to the server message and code, and to a plain line for a non-API failure', () => {
    expect(importErrorMessage(fail(500, 'boom', undefined, 'Something broke'))).toBe('Something broke (boom)');
    expect(importErrorMessage(new TypeError('network'))).toBe('The request failed. Check the connection and try again.');
  });
});

describe('signed minutes from the opening-balance form', () => {
  const input = (sign: 'credit' | 'debit', hours: string, minutes: string) => ({ sign, hours, minutes });

  it('reads hours and minutes with an explicit sign', () => {
    expect(parseSignedMinutes(input('credit', '1', '30'))).toEqual({ minutes: 90 });
    expect(parseSignedMinutes(input('debit', '2', '5'))).toEqual({ minutes: -125 });
    expect(parseSignedMinutes(input('credit', '', '45'))).toEqual({ minutes: 45 });
    expect(parseSignedMinutes(input('debit', ' 3 ', ''))).toEqual({ minutes: -180 });
  });

  it('refuses zero, a missing value, a decimal, a negative or minutes of 60 and over', () => {
    for (const bad of [input('credit', '0', '0'), input('credit', '', ''), input('credit', '1.5', '0'), input('credit', '-1', '0'), input('credit', '0', '60'), input('debit', '0', '-5'), input('credit', 'a', '0')]) {
      const result = parseSignedMinutes(bad);
      expect('error' in result, JSON.stringify(bad)).toBe(true);
    }
    expect(parseSignedMinutes(input('credit', '0', '0'))).toEqual({ error: 'Enter at least 1 minute; an opening balance of zero is not recorded.' });
    expect(parseSignedMinutes(input('credit', '0', '60'))).toEqual({ error: 'Minutes must be a whole number from 0 to 59.' });
  });

  it('refuses a value above the server bound and allows exactly the bound', () => {
    expect(OPENING_MAX_MINUTES).toBe(100_000_000);
    expect(parseSignedMinutes(input('credit', '1666666', '40'))).toEqual({ minutes: 100_000_000 });
    expect(parseSignedMinutes(input('debit', '1666666', '40'))).toEqual({ minutes: -100_000_000 });
    expect('error' in parseSignedMinutes(input('credit', '1666666', '41'))).toBe(true);
    expect('error' in parseSignedMinutes(input('credit', '99999999999', '0'))).toBe(true);
  });

  it('shows a signed value with an explicit sign and no decimal hours', () => {
    expect(signedMinutesText(90)).toBe('+1h 30m');
    expect(signedMinutesText(45)).toBe('+45m');
    expect(signedMinutesText(-125)).toBe('−2h 05m');
    expect(signedMinutesText(0)).toBe('0m');
  });

  it('splits a stored value back into the form fields', () => {
    expect(splitSignedMinutes(90)).toEqual({ sign: 'credit', hours: '1', minutes: '30' });
    expect(splitSignedMinutes(-125)).toEqual({ sign: 'debit', hours: '2', minutes: '5' });
    expect(splitSignedMinutes(0)).toEqual({ sign: 'credit', hours: '0', minutes: '0' });
  });

  it('shows the posted balance a first entry or a correction leads to', () => {
    expect(resultingPosted(600, 0, 90)).toBe(690);
    expect(resultingPosted(600, 0, -700)).toBe(-100);
    expect(resultingPosted(690, 90, 120)).toBe(720);
    expect(resultingPosted(690, 90, -30)).toBe(570);
  });
});

describe('opening-balance form problems', () => {
  const valid = { sign: 'credit' as const, hours: '2', minutes: '30', asOfDate: '2026-09-30', reason: 'Carried over from the old sheet', evidence: 'Email 2026-10-01' };

  it('has no problem for a complete form', () => {
    expect(openingFormProblems(valid, { needsAsOfDate: true })).toEqual({});
  });

  it('names every missing field', () => {
    const problems = openingFormProblems({ sign: 'credit', hours: '', minutes: '', asOfDate: '', reason: '  ', evidence: '' }, { needsAsOfDate: true });
    expect(Object.keys(problems).sort()).toEqual(['asOfDate', 'evidence', 'minutes', 'reason']);
  });

  it('checks the as-of date as a real calendar date and only when the form has one', () => {
    expect(openingFormProblems({ ...valid, asOfDate: '2026-13-40' }, { needsAsOfDate: true }).asOfDate).toBeDefined();
    expect(openingFormProblems({ ...valid, asOfDate: '30/09/2026' }, { needsAsOfDate: true }).asOfDate).toBeDefined();
    expect(openingFormProblems({ ...valid, asOfDate: '' }, { needsAsOfDate: false })).toEqual({});
  });

  it('limits the reason and the evidence to 2000 characters', () => {
    expect(openingFormProblems({ ...valid, reason: 'x'.repeat(2001) }, { needsAsOfDate: true }).reason).toBeDefined();
    expect(openingFormProblems({ ...valid, evidence: 'x'.repeat(2001) }, { needsAsOfDate: true }).evidence).toBeDefined();
    expect(openingFormProblems({ ...valid, reason: 'x'.repeat(2000), evidence: 'x'.repeat(2000) }, { needsAsOfDate: true })).toEqual({});
  });
});

describe('opening-balance error messages', () => {
  const fail = (status: number, code: string, details?: Record<string, unknown>) => new ApiRequestError(status, code, 'server text', details);

  it('maps the WP4-T10 codes', () => {
    expect(openingBalanceErrorMessage(fail(409, 'opening_balance_exists', { minutes: 90, version: 2 }))).toMatch(/already recorded.*correction/i);
    expect(openingBalanceErrorMessage(fail(409, 'stale_version'))).toMatch(/changed since.*reloaded/i);
    expect(openingBalanceErrorMessage(fail(422, 'invalid_minutes'))).toMatch(/non-zero/);
    expect(openingBalanceErrorMessage(fail(422, 'reason_required'))).toMatch(/reason/);
    expect(openingBalanceErrorMessage(fail(422, 'evidence_required'))).toMatch(/evidence/);
    expect(openingBalanceErrorMessage(fail(422, 'invalid_reason'))).toMatch(/reason.*2000/);
    expect(openingBalanceErrorMessage(fail(422, 'invalid_evidence_ref'))).toMatch(/evidence.*2000/);
    expect(openingBalanceErrorMessage(fail(404, 'not_found'))).toMatch(/No opening balance/);
  });

  it('falls back to the server message and code, and to a plain line for a non-API failure', () => {
    expect(openingBalanceErrorMessage(fail(500, 'boom'))).toBe('server text (boom)');
    expect(openingBalanceErrorMessage(new TypeError('network'))).toBe('The request failed. Check the connection and try again.');
  });
});
