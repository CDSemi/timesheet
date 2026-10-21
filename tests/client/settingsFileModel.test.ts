import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { CalendarInfo, PolicyVersion, SubmissionSettings } from '../../src/client/api.ts';
import {
  ALLOWED_KEYS,
  APP_VERSION,
  buildCompanyFile,
  buildPersonalFile,
  buildPolicyRequest,
  buildSubmissionRequest,
  type CompanyData,
  companyCalendarProblems,
  companyYears,
  defaultCompanyYear,
  exceptionRequest,
  holidayCsvForYear,
  importNote,
  keyPaths,
  nextPeriodStart,
  offersAutoSubmitTick,
  type PersonalCurrent,
  type PersonalData,
  parseSettingsFile,
  planExceptions,
  planPersonalImport,
  resolveAutoSubmit,
  serializeSettingsFile,
  settingsFileName,
  settingsFileProblem,
} from '../../src/client/components/settingsFileModel.ts';

/*
 * The settings file (WP5-UX4-T05, U4-01): what an export may hold (a fixed allowlist, proved over a synthetic account that has
 * a signature, an authorization and more), what a read refuses before any preview, and what an import writes. All data is
 * synthetic (example.invalid).
 */

const EXPORTED_AT = '2026-10-20T16:40:00Z';

function policy(overrides: Partial<PolicyVersion> = {}): PolicyVersion {
  return {
    id: 'policy-id-1',
    seq: 2,
    effective_from: '2026-01-05',
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
    deficit_mode: 'ignore',
    note: 'a private note',
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

/** A synthetic account with a signature image, an authorization, a settings version id and instants. */
function settings(overrides: Partial<SubmissionSettings> = {}): SubmissionSettings {
  return {
    id: 'settings-id-1',
    seq: 4,
    is_default: false,
    recipients: { to: ['payroll@example.invalid'], cc: ['manager@example.invalid'] },
    subject_template: 'Timesheet {PeriodStart} to {PeriodEnd} - {EmployeeName}',
    body_template: 'Hello,\nPlease find the timesheet of {EmployeeName}.',
    template_version: 3,
    variables: ['EmployeeName'],
    auto_submit: false,
    auto_submit_effective_from: '2026-09-01T00:00:00Z',
    auto_image: { authorized: true, signature_attachment_id: 'signature-attachment-secret', authorized_at: '2026-09-02T00:00:00Z' },
    auto_note: { enabled: true, text: 'Submitted automatically' },
    show_ot_on_pdf: true,
    reminder_offsets_minutes: [1440, 120],
    created_at: '2026-09-02T00:00:00Z',
    ...overrides,
  };
}

function current(overrides: Partial<PersonalCurrent> = {}): PersonalCurrent {
  return { policy: policy(), submission: settings(), theme: 'light', ...overrides };
}

function exportPersonal(source: Partial<Parameters<typeof buildPersonalFile>[0]> = {}) {
  const file = buildPersonalFile({ policy: policy(), submission: settings(), theme: 'dark', exportedAt: EXPORTED_AT, ...source });
  if (file === null) throw new Error('expected a file');
  return file;
}

function calendar(overrides: Partial<CalendarInfo> = {}): CalendarInfo {
  return {
    id: 'calendar-1',
    name: 'Synthetic calendar',
    reporting_zone: 'America/Los_Angeles',
    payroll: {
      cycle_days: 14,
      anchor_payroll_date: '2026-01-02',
      period_start_offset_days: -18,
      period_end_offset_days: -5,
      due_offset_days: -3,
      due_local_time: '17:00',
    },
    versions: [
      { id: 'v1', seq: 1, effective_from: '2026-01-01', weekdays: [1, 2, 3, 4, 5], dates: [{ date: '2026-12-25', kind: 'holiday', name: 'Synthetic Winter Day' }] },
      {
        id: 'v2',
        seq: 2,
        effective_from: '2026-06-01',
        weekdays: [5, 4, 3, 2, 1],
        dates: [
          { date: '2026-12-25', kind: 'holiday', name: 'Synthetic Winter Day' },
          { date: '2027-01-01', kind: 'holiday', name: 'Synthetic New Year, observed' },
          { date: '2027-07-05', kind: 'closure', name: 'Synthetic "Summer" Closure' },
        ],
      },
    ],
    payroll_exceptions: [{ nominal_payroll_date: '2026-12-25', payroll_date: '2026-12-24', due_local_date: null, due_local_time: null }],
    warnings: [],
    ...overrides,
  };
}

/** A parsed-and-reserialized view: the object of a file with one change, for a tampering test. */
function tampered(change: (file: Record<string, unknown>) => void, scope: 'personal' | 'company' = 'personal'): string {
  const base = scope === 'personal' ? exportPersonal() : buildCompanyFile(calendar(), EXPORTED_AT);
  const object = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
  change(object);
  return JSON.stringify(object);
}

const data = (file: Record<string, unknown>) => file.data as Record<string, Record<string, unknown>>;

function problemsOf(text: string, scope: 'personal' | 'company' = 'personal'): string[] {
  const result = parseSettingsFile(text, scope);
  if (result.ok) throw new Error('expected the file to be refused');
  return result.problems;
}

describe('the version of the file', () => {
  it('equals the version in package.json, so a release that moves one moves the other', () => {
    const pkg = JSON.parse(readFileSync(join(import.meta.dirname, '..', '..', 'package.json'), 'utf8')) as { version: string };
    expect(APP_VERSION).toBe(pkg.version);
  });

  it('names the file by scope and accounting date', () => {
    expect(settingsFileName('personal', '2026-10-20')).toBe('timesheet-settings-2026-10-20.json');
    expect(settingsFileName('company', '2026-10-20')).toBe('timesheet-company-calendar-2026-10-20.json');
  });
});

describe('what a personal export may hold', () => {
  it('holds exactly the allowlisted keys and nothing of the signature, its authorization, ids or instants', () => {
    // The expected paths are written out here, not taken from the model: a key added to the export must be added on purpose.
    const expected = [
      'format',
      'schema_version',
      'app_version',
      'exported_at',
      'scope',
      'data',
      'data.work_policy',
      'data.work_policy.required_minutes',
      'data.work_policy.threshold_minutes',
      'data.work_policy.rounding_step_minutes',
      'data.work_policy.reference_start',
      'data.work_policy.reference_end',
      'data.work_policy.breaks',
      'data.work_policy.breaks[].start_offset_minutes',
      'data.work_policy.breaks[].duration_minutes',
      'data.work_policy.breaks[].counts_as_work',
      'data.work_policy.deficit_mode',
      'data.submission',
      'data.submission.to',
      'data.submission.cc',
      'data.submission.subject_template',
      'data.submission.body_template',
      'data.submission.show_ot_on_pdf',
      'data.submission.reminder_offsets_minutes',
      'data.submission.auto_note_enabled',
      'data.submission.auto_note_text',
      'data.submission.auto_submit',
      'data.theme',
    ];
    const file = exportPersonal();
    expect([...keyPaths(file)].sort()).toEqual([...expected].sort());
    const text = serializeSettingsFile(file);
    for (const forbidden of [
      'auto_image',
      'signature',
      'authorized',
      'apply_to_overdue_drafts',
      'sha256',
      'password',
      'token',
      'settings-id-1',
      'policy-id-1',
      'a private note',
      'effective_from',
      'created_at',
      'template_version',
    ]) {
      expect(text, `the file must not contain ${forbidden}`).not.toContain(forbidden);
    }
  });

  it('copies keys one by one: a stray field of an answer is never carried into the file', () => {
    const smuggled = { ...settings(), password_hash: 'x', setup_token: 'y', ledger: [1], sessions: [2] } as SubmissionSettings;
    const file = exportPersonal({ submission: smuggled, policy: { ...policy(), opening_balance: 99 } as PolicyVersion });
    const text = serializeSettingsFile(file);
    for (const stray of ['password_hash', 'setup_token', 'ledger', 'sessions', 'opening_balance']) expect(text).not.toContain(stray);
  });

  it('leaves the theme out unless asked, the submission out while never saved, and is null with nothing to export', () => {
    expect(exportPersonal({ theme: null }).data.theme).toBeUndefined();
    const policyOnly = exportPersonal({ submission: settings({ is_default: true }) });
    expect(policyOnly.data.submission).toBeUndefined();
    expect(policyOnly.data.work_policy).toBeDefined();
    expect(buildPersonalFile({ policy: undefined, submission: settings({ is_default: true }), theme: 'dark', exportedAt: EXPORTED_AT })).toBeNull();
  });

  it('is read back by this app with every key allowlisted', () => {
    const result = parseSettingsFile(serializeSettingsFile(exportPersonal()), 'personal');
    expect(result.ok).toBe(true);
    for (const key of Object.keys(ALLOWED_KEYS)) expect(ALLOWED_KEYS[key as keyof typeof ALLOWED_KEYS].length).toBeGreaterThan(0);
  });
});

describe('a tampered or foreign file is refused before any preview', () => {
  it('refuses an unknown key at the top and nested', () => {
    expect(problemsOf(tampered((file) => (file.extra = 1))).join(' ')).toContain('file.extra');
    expect(problemsOf(tampered((file) => (data(file).submission!.auto_image = { authorized: true }))).join(' ')).toContain('data.submission.auto_image');
    expect(problemsOf(tampered((file) => (data(file).work_policy!.effective_from = '2026-01-01'))).join(' ')).toContain('data.work_policy.effective_from');
    expect(problemsOf(tampered((file) => (data(file).submission!.apply_to_overdue_drafts = true))).join(' ')).toContain('apply_to_overdue_drafts');
    expect(problemsOf(tampered((file) => (data(file).work_policy!.breaks as Array<Record<string, unknown>>)[0]!.note = 'x'))).toHaveLength(1);
  });

  it('refuses a key named __proto__ as unknown', () => {
    const text = JSON.stringify(exportPersonal()).replace('"format"', '"__proto__":{"a":1},"format"');
    expect(problemsOf(text).join(' ')).toContain('__proto__');
  });

  it('refuses a wrong format and a wrong schema version, and says which', () => {
    expect(problemsOf(tampered((file) => (file.format = 'other')))[0]).toContain('not a settings file of this app');
    expect(problemsOf(tampered((file) => (file.schema_version = 2)))[0]).toContain('schema version 2');
    expect(problemsOf(tampered((file) => delete file.schema_version))[0]).toContain('schema version');
  });

  it('refuses text that is not JSON, not an object, or too large', () => {
    expect(problemsOf('not json')[0]).toContain('not valid JSON');
    expect(problemsOf('[1,2]')[0]).toContain('not an object');
    expect(problemsOf(' '.repeat(200_001))[0]).toContain('too large');
    expect(settingsFileProblem('settings.csv', 10)).toContain('.json');
    expect(settingsFileProblem('settings.json', 200_001)).toContain('too large');
    expect(settingsFileProblem('settings.JSON', 200)).toBeNull();
  });

  it('refuses an invalid time, an invalid instant and an invalid date', () => {
    expect(problemsOf(tampered((file) => (data(file).work_policy!.reference_start = '25:99'))).join(' ')).toContain('reference_start');
    expect(problemsOf(tampered((file) => (file.exported_at = '2026-10-20 16:40'))).join(' ')).toContain('exported_at');
    expect(problemsOf(tampered((file) => (file.exported_at = '2026-02-30T10:00:00Z'))).join(' ')).toContain('exported_at');
    expect(problemsOf(tampered((file) => ((file.data as CompanyData).payroll.due_local_time = '24:00'), 'company'), 'company').join(' ')).toContain('due_local_time');
  });

  it('refuses values the server would refuse: an inconsistent reference day, a bad address, an empty recipient list', () => {
    expect(problemsOf(tampered((file) => (data(file).work_policy!.required_minutes = 470))).join(' ')).toContain('Reference');
    expect(problemsOf(tampered((file) => (data(file).submission!.to = ['not-an-address']))).join(' ')).toContain('data.submission.to[0]');
    expect(problemsOf(tampered((file) => (data(file).submission!.to = []))).join(' ')).toContain('data.submission.recipients');
    expect(problemsOf(tampered((file) => (data(file).submission!.auto_submit = 'yes'))).join(' ')).toContain('auto_submit');
    expect(problemsOf(tampered((file) => (data(file).submission!.subject_template = 'Hello {Nope}'))).join(' ')).toContain('subject_template');
    expect(problemsOf(tampered((file) => (data(file).theme = 'blue' as never))).join(' ')).toContain('theme');
  });

  it('refuses a file of the other scope with a pointer to where it belongs', () => {
    expect(problemsOf(serializeSettingsFile(buildCompanyFile(calendar(), EXPORTED_AT)!), 'personal')[0]).toContain('company calendar file');
    expect(problemsOf(serializeSettingsFile(exportPersonal()), 'company')[0]).toContain('personal settings file');
  });

  it('refuses a personal file with no group', () => {
    expect(problemsOf(tampered((file) => (file.data = { theme: 'dark' })))[0]).toContain('neither a work policy nor submission settings');
  });

  it('never partly accepts: one bad group refuses the whole file', () => {
    const text = tampered((file) => {
      data(file).submission!.to = ['bad'];
    });
    expect(parseSettingsFile(text, 'personal').ok).toBe(false);
  });
});

describe('the company file', () => {
  it('holds the allowlisted keys only and no person', () => {
    const file = buildCompanyFile(calendar(), EXPORTED_AT)!;
    expect([...keyPaths(file)].sort()).toEqual(
      [
        'format',
        'schema_version',
        'app_version',
        'exported_at',
        'scope',
        'data',
        'data.reporting_zone',
        'data.payroll',
        'data.payroll.cycle_days',
        'data.payroll.anchor_payroll_date',
        'data.payroll.period_start_offset_days',
        'data.payroll.period_end_offset_days',
        'data.payroll.due_offset_days',
        'data.payroll.due_local_time',
        'data.weekdays',
        'data.holidays',
        'data.holidays[].date',
        'data.holidays[].name',
        'data.holidays[].kind',
        'data.payroll_exceptions',
        'data.payroll_exceptions[].nominal_payroll_date',
        'data.payroll_exceptions[].payroll_date',
        'data.payroll_exceptions[].due_local_date',
        'data.payroll_exceptions[].due_local_time',
      ].sort(),
    );
    // The newest version (seq 2), with sorted weekdays.
    expect(file.data.weekdays).toEqual([1, 2, 3, 4, 5]);
    expect(file.data.holidays).toHaveLength(3);
  });

  it('is null for a calendar without a version', () => {
    expect(buildCompanyFile(calendar({ versions: [] }), EXPORTED_AT)).toBeNull();
  });

  it('is read back, and refused for a bad zone, a duplicated date, a formula name or a repeated weekday', () => {
    expect(parseSettingsFile(serializeSettingsFile(buildCompanyFile(calendar(), EXPORTED_AT)!), 'company').ok).toBe(true);
    expect(problemsOf(tampered((file) => ((file.data as CompanyData).reporting_zone = 'Mars/Olympus'), 'company'), 'company').join(' ')).toContain('reporting_zone');
    const duplicated = tampered((file) => {
      const holidays = (file.data as CompanyData).holidays;
      holidays.push({ ...holidays[0]! });
    }, 'company');
    expect(problemsOf(duplicated, 'company').join(' ')).toContain('twice');
    const formula = tampered((file) => {
      (file.data as CompanyData).holidays[0]!.name = '=HYPERLINK("x")';
    }, 'company');
    expect(problemsOf(formula, 'company').join(' ')).toContain('formula');
    const weekdays = tampered((file) => {
      (file.data as CompanyData).weekdays = [1, 1, 2];
    }, 'company');
    expect(problemsOf(weekdays, 'company').join(' ')).toContain('weekdays');
  });

  it('refuses a foreign reporting zone, a different payroll schedule and different weekdays against the calendar', () => {
    const own = calendar();
    const file = buildCompanyFile(own, EXPORTED_AT)!.data;
    expect(companyCalendarProblems(file, own)).toEqual([]);
    expect(companyCalendarProblems({ ...file, reporting_zone: 'Asia/Tokyo' }, own)[0]).toContain('reporting zone');
    expect(companyCalendarProblems({ ...file, payroll: { ...file.payroll, cycle_days: 7 } }, own)[0]).toContain('payroll schedule');
    expect(companyCalendarProblems({ ...file, payroll: { ...file.payroll, due_local_time: '16:00' } }, own)[0]).toContain('due time');
    expect(companyCalendarProblems({ ...file, weekdays: [1, 2, 3] }, own)[0]).toContain('weekdays');
  });

  it('builds the holiday CSV of one year with quoted names, and picks the year to offer', () => {
    const file = buildCompanyFile(calendar(), EXPORTED_AT)!.data;
    expect(companyYears(file)).toEqual([2026, 2027]);
    expect(holidayCsvForYear(file, 2027)).toBe('date,name,kind\n2027-01-01,"Synthetic New Year, observed",holiday\n2027-07-05,"Synthetic ""Summer"" Closure",closure\n');
    expect(defaultCompanyYear([2026, 2027], 2027)).toBe(2027);
    expect(defaultCompanyYear([2026, 2027], 2025)).toBe(2026);
    expect(defaultCompanyYear([2026, 2027], 2030)).toBe(2027);
    expect(defaultCompanyYear([], 2026)).toBeNull();
  });

  it('plans the payroll exceptions: new ones are added, identical ones counted, differing ones kept', () => {
    const existing = calendar().payroll_exceptions;
    const plan = planExceptions(
      [
        { nominal_payroll_date: '2026-12-25', payroll_date: '2026-12-24', due_local_date: null, due_local_time: null },
        { nominal_payroll_date: '2027-01-08', payroll_date: '2027-01-07', due_local_date: null, due_local_time: null },
      ],
      existing,
    );
    expect(plan.same).toBe(1);
    expect(plan.add.map((item) => item.nominal_payroll_date)).toEqual(['2027-01-08']);
    const differing = planExceptions([{ nominal_payroll_date: '2026-12-25', payroll_date: '2026-12-23', due_local_date: null, due_local_time: null }], existing);
    expect(differing.differing).toHaveLength(1);
    expect(exceptionRequest(plan.add[0]!, 'calendar-1', 'x.json')).toEqual({
      calendar_id: 'calendar-1',
      nominal_payroll_date: '2027-01-08',
      payroll_date: '2027-01-07',
      due_local_date: null,
      due_local_time: null,
      reason: 'Imported from settings file x.json',
    });
  });
});

describe('the personal import: comparison and requests', () => {
  const fileData = (overrides: Partial<PersonalData> = {}): PersonalData => ({ ...exportPersonal().data, ...overrides });
  const options = { tick: false, effectiveFrom: '2026-11-02', fileName: 'timesheet-settings-2026-10-20.json' };

  it('compares each group and counts a write for the groups that differ', () => {
    const other = fileData({
      work_policy: { ...exportPersonal().data.work_policy!, reference_start: '07:30', reference_end: '16:30', deficit_mode: 'choose_at_signoff' },
      submission: { ...exportPersonal().data.submission!, cc: [], reminder_offsets_minutes: [60] },
      theme: 'dark',
    });
    const plan = planPersonalImport(other, current(), options);
    expect(plan.changeCount).toBe(3);
    const policyGroup = plan.groups.find((group) => group.id === 'work_policy')!;
    expect(policyGroup.rows.find((item) => item.key === 'reference')).toMatchObject({ now: '08:00-17:00', file: '07:30-16:30', changed: true });
    expect(policyGroup.rows.find((item) => item.key === 'breaks')?.changed).toBe(false);
    const submissionGroup = plan.groups.find((group) => group.id === 'submission')!;
    expect(submissionGroup.rows.find((item) => item.key === 'cc')).toMatchObject({ now: 'manager@example.invalid', file: 'none', changed: true });
    expect(submissionGroup.rows.find((item) => item.key === 'reminders')).toMatchObject({ now: '24 h, 2 h', file: '1 h', changed: true });
  });

  it('writes exactly one policy version and one submission-settings version into another account', () => {
    const second = current({
      policy: policy({ required_minutes: 420, reference_end: '16:00', seq: 1 }),
      submission: settings({ seq: 0, is_default: true, recipients: { to: [], cc: [] }, auto_image: { authorized: false, signature_attachment_id: null, authorized_at: null } }),
    });
    const plan = planPersonalImport(fileData({ theme: undefined }), second, options);
    expect(plan.changeCount).toBe(2);
    expect(plan.policy).toMatchObject({ effective_from: '2026-11-02', required_minutes: 480, note: 'Imported from settings file timesheet-settings-2026-10-20.json' });
    expect(plan.submission).toMatchObject({ expected_seq: 0, to: ['payroll@example.invalid'], reminder_offsets_minutes: [1440, 120] });
    expect(plan.theme).toBeNull();
  });

  it('writes nothing for a file identical to the current settings', () => {
    const same = fileData({ theme: 'light' });
    const plan = planPersonalImport(same, current(), options);
    expect(plan.changeCount).toBe(0);
    expect(plan.policy).toBeNull();
    expect(plan.submission).toBeNull();
    expect(plan.theme).toBeNull();
  });

  it('plans the policy for a person without any version', () => {
    const plan = planPersonalImport(fileData(), current({ policy: undefined }), options);
    expect(plan.policy).not.toBeNull();
    expect(plan.groups.find((group) => group.id === 'work_policy')?.rows[0]?.now).toBe('no version yet');
  });

  it('keeps apply_to_overdue_drafts and the image authorization out of every request', () => {
    const request = buildSubmissionRequest(exportPersonal().data.submission!, settings(), true);
    expect(Object.keys(request).sort()).toEqual(
      ['auto_note_enabled', 'auto_note_text', 'auto_submit', 'body_template', 'cc', 'expected_seq', 'reminder_offsets_minutes', 'show_ot_on_pdf', 'subject_template', 'to'].sort(),
    );
    expect(Object.keys(buildPolicyRequest(exportPersonal().data.work_policy!, '2026-11-02', 'a.json')).sort()).toEqual(
      ['breaks', 'deficit_mode', 'effective_from', 'note', 'reference_end', 'reference_start', 'required_minutes', 'rounding_step_minutes', 'threshold_minutes'].sort(),
    );
  });

  it('marks the effective date from the pay period that contains today', () => {
    expect(nextPeriodStart('2026-10-30')).toBe('2026-10-31');
    expect(nextPeriodStart('2026-12-31')).toBe('2027-01-01');
  });

  it('words the note with the file name as one printable line, bounded', () => {
    expect(importNote('a\nb.json')).toBe('Imported from settings file a b.json');
    expect(importNote('x'.repeat(300)).length).toBeLessThan(200);
  });
});

describe('automatic submission is switched on by a separate tick only', () => {
  it('follows the truth table', () => {
    expect(resolveAutoSubmit(true, false, false)).toBe(false);
    expect(resolveAutoSubmit(true, false, true)).toBe(true);
    expect(resolveAutoSubmit(true, true, false)).toBe(true);
    expect(resolveAutoSubmit(false, true, false)).toBe(false);
    expect(resolveAutoSubmit(false, false, true)).toBe(false);
  });

  it('stays off in the request without the tick and in the plan, even when the file says on', () => {
    const fileOn = { ...exportPersonal().data.submission!, auto_submit: true };
    const off = settings({ auto_submit: false });
    expect(buildSubmissionRequest(fileOn, off, false).auto_submit).toBe(false);
    expect(buildSubmissionRequest(fileOn, off, true).auto_submit).toBe(true);
    const data: PersonalData = { submission: fileOn };
    const unticked = planPersonalImport(data, current({ submission: off }), { tick: false, effectiveFrom: '2026-11-02', fileName: 'a.json' });
    // Everything else equals the current settings, so an unticked file changes nothing at all.
    expect(unticked.submission).toBeNull();
    const ticked = planPersonalImport(data, current({ submission: off }), { tick: true, effectiveFrom: '2026-11-02', fileName: 'a.json' });
    expect(ticked.submission?.auto_submit).toBe(true);
  });

  it('offers the tick only when the file asks for it and it is off now', () => {
    const fileOn: PersonalData = { submission: { ...exportPersonal().data.submission!, auto_submit: true } };
    expect(offersAutoSubmitTick(fileOn, current({ submission: settings({ auto_submit: false }) }))).toBe(true);
    expect(offersAutoSubmitTick(fileOn, current({ submission: settings({ auto_submit: true }) }))).toBe(false);
    expect(offersAutoSubmitTick({ submission: { ...fileOn.submission!, auto_submit: false } }, current())).toBe(false);
    expect(offersAutoSubmitTick({ theme: 'dark' }, current())).toBe(false);
  });

  it('lets a file switch it off', () => {
    const fileOff = { ...exportPersonal().data.submission!, auto_submit: false };
    expect(buildSubmissionRequest(fileOff, settings({ auto_submit: true }), false).auto_submit).toBe(false);
  });
});
