import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { classifyDate } from '../../src/domain/calendar.ts';
import { datesBetween } from '../../src/domain/dates.ts';
import { createCalendarVersion, listCalendarVersions } from '../../src/server/services/calendars.ts';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * WP2-T08 (FR-13, AC-05, R-07, E-4, E-12): admin holiday CSV preview and commit under
 * /api/admin/calendar/import, and the missing next-year calendar warning. All CSV text is an
 * inline string. Today is 2026-10-09 (LA 13:00): the current period is 2026-09-28…2026-10-11
 * (payroll 2026-10-16, the earliest payroll on/after today), so the prospective boundary is
 * 2026-09-28; the period 2026-09-14…2026-09-27 (payroll 2026-10-02) is old. The seed calendar
 * has one version from 2026-01-01 with nine 2026 holidays and Monday–Friday work days.
 */

let t: TestContext;
let admin: string;
let employee: string;

const PREVIEW = '/api/admin/calendar/import/preview';
const COMMIT = '/api/admin/calendar/import/commit';
const BOUNDARY = '2026-09-28';

beforeEach(async () => {
  t = await createTestContext('2026-10-09T20:00:00Z');
  admin = await t.login('admin');
  employee = await t.login('employee');
});

afterEach(() => t.close());

const csv = (...rows: string[]) => ['date,name,kind', ...rows].join('\n');

function importBody(text: string, overrides: Record<string, unknown> = {}) {
  return { calendar_id: t.calendarId, year: 2026, effective_from: BOUNDARY, csv: text, ...overrides };
}

async function preview(text: string, overrides: Record<string, unknown> = {}) {
  return t.request('POST', PREVIEW, { cookie: admin, body: importBody(text, overrides) });
}

/** Previews and commits the same text; the commit carries the preview hash. */
async function previewAndCommit(text: string, overrides: Record<string, unknown> = {}, commitExtra: Record<string, unknown> = {}) {
  const previewed = await preview(text, overrides);
  expect(previewed.status, JSON.stringify(previewed.body)).toBe(200);
  const commit = await t.request('POST', COMMIT, {
    cookie: admin,
    body: { ...importBody(text, overrides), preview_hash: previewed.body.preview_hash ?? 'f'.repeat(64), ...commitExtra },
  });
  return { previewed, commit };
}

const versionCount = () => t.db.prepare('SELECT count(*) FROM calendar_versions').pluck().get() as number;
const auditCount = () => t.db.prepare('SELECT count(*) FROM audit_events').pluck().get() as number;
const dayEntryRows = () => t.db.prepare('SELECT * FROM day_entries ORDER BY id').all();

async function addSession(who: string, date: string, extra: Record<string, unknown> = {}) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: who,
    body: {
      start: la(`${date}T09:00`),
      end: la(`${date}T17:00`),
      input_zone: 'America/Los_Angeles',
      breaks: [],
      breaks_confirmed: true,
      ...extra,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

async function putExplicit(who: string, date: string, category: string) {
  const response = await t.request('PUT', `/api/days/${date}`, {
    cookie: who,
    body: { category, leave_minutes: 0, wfh: false, notes: '' },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
}

describe('access control on the admin import routes', () => {
  const body = () => ({ ...importBody(csv('2026-10-20,Synthetic Day')), preview_hash: 'a'.repeat(64) });

  it.each([PREVIEW, COMMIT])('answers 401 without a session and 403 to an employee on %s, changing nothing', async (path) => {
    const versions = versionCount();
    const audits = auditCount();
    const anonymous = await t.request('POST', path, { body: body() });
    expect(anonymous.status).toBe(401);
    const forbidden = await t.request('POST', path, { cookie: employee, body: body() });
    expect(forbidden.status).toBe(403);
    expect(forbidden.body.error.code).toBe('forbidden');
    expect(versionCount()).toBe(versions);
    expect(auditCount()).toBe(audits);
  });

  it('rejects a cross-origin POST and unknown fields, and answers 404 for an unknown calendar', async () => {
    const noOrigin = await t.request('POST', PREVIEW, { cookie: admin, body: body(), origin: null });
    expect(noOrigin.status).toBe(403);
    const extra = await t.request('POST', PREVIEW, { cookie: admin, body: { ...importBody(csv()), user_id: t.userIds.employee } });
    expect(extra.status).toBe(422);
    const unknown = await preview(csv('2026-10-20,Synthetic Day'), { calendar_id: 'no-such-calendar' });
    expect(unknown.status).toBe(404);
  });
});

describe('preview', () => {
  it('writes nothing: no version, no audit event, no employee row', async () => {
    await addSession(employee, '2026-10-07');
    const rows = dayEntryRows();
    const versions = versionCount();
    const audits = auditCount();
    const response = await preview(csv('2026-10-07,Synthetic Company Day', '2026-12-24,Synthetic Eve'));
    expect(response.status).toBe(200);
    expect(response.body.can_commit).toBe(true);
    expect(response.body.preview_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(versionCount()).toBe(versions);
    expect(auditCount()).toBe(audits);
    expect(dayEntryRows()).toEqual(rows);
  });

  it('reports invalid dates, duplicates, empty names, out-of-year rows and formula cells, and gives no commit hash', async () => {
    const response = await preview(
      csv(
        '2026-02-30,Impossible',
        '2026-10-20,First',
        '2026-10-20,Second',
        '2026-10-21,',
        '2027-01-04,Wrong year',
        '2026-10-22,"=HYPERLINK(""x"")"',
        '2026-10-23,@cmd',
        '2026-10-24,-1+1',
        '2026-10-25,"+1"',
        '2026-10-26,"\tTabbed"',
        '2026-10-27,Fine',
      ),
    );
    expect(response.status).toBe(200);
    expect(response.body.can_commit).toBe(false);
    expect(response.body.preview_hash).toBeNull();
    const byCode = (code: string) => response.body.issues.filter((issue: { code: string }) => issue.code === code);
    expect(byCode('invalid_date')).toHaveLength(1);
    expect(byCode('duplicate_date')).toEqual([expect.objectContaining({ line: 4, first_line: 3 })]);
    expect(byCode('empty_name')).toHaveLength(1);
    expect(byCode('out_of_year')).toHaveLength(1);
    expect(byCode('formula_cell').map((issue: { line: number }) => issue.line)).toEqual([7, 8, 9, 10, 11]);
    // Only the clean row is in the diff.
    expect(response.body.diff.added.map((item: { date: string }) => item.date)).toEqual(['2026-10-20', '2026-10-27']);
  });

  it('diffs against the effective version: added, renamed, kind changed, removed and kept dates (E-4)', async () => {
    // A manual date an admin added earlier and the seed's own holidays.
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: t.calendarId,
        effectiveFrom: BOUNDARY,
        weekdays: [1, 2, 3, 4, 5],
        dates: [
          ...(listCalendarVersions(t.db, t.calendarId).at(-1)?.dates ?? []),
          { date: '2026-10-20', kind: 'holiday', name: 'Synthetic Manual Day' },
          { date: '2026-10-21', kind: 'holiday', name: 'Synthetic Manual Removable' },
        ],
      },
      t.userIds.admin,
    );
    const text = csv(
      '2026-11-26,Synthetic Thanksgiving,holiday',
      '2026-11-27,Floating Holiday,closure',
      '2026-12-25,Christmas Day',
      '2026-12-24,Synthetic Eve',
    );
    const response = await preview(text, { remove_dates: ['2026-10-21'] });
    expect(response.status).toBe(200);
    const diff = response.body.diff;
    expect(diff.added).toEqual([{ date: '2026-12-24', kind: 'holiday', name: 'Synthetic Eve' }]);
    expect(diff.renamed.map((item: { date: string }) => item.date)).toEqual(['2026-11-26']);
    expect(diff.unchanged_count).toBe(1);
    expect(diff.kind_changed.map((item: { date: string }) => item.date)).toEqual(['2026-11-27']);
    expect(diff.removed).toEqual([{ date: '2026-10-21', kind: 'holiday', name: 'Synthetic Manual Removable' }]);
    // The manual date the CSV does not mention is kept, as are the seed dates outside the CSV.
    expect(diff.kept.map((item: { date: string }) => item.date)).toContain('2026-10-20');
    expect(diff.kept.map((item: { date: string }) => item.date)).not.toContain('2026-10-21');
    expect(response.body.base_version).toMatchObject({ seq: 2, effective_from: BOUNDARY });
  });

  it('keeps every manual date when the CSV lists none of them and nothing is marked for removal', async () => {
    const response = await preview(csv('2026-12-24,Synthetic Eve'));
    expect(response.body.diff.removed).toEqual([]);
    expect(response.body.diff.kept).toHaveLength(9);
  });

  it('flags a removal of an unknown date, a CSV conflict and a past date, and blocks the commit', async () => {
    const response = await preview(csv('2026-12-25,Christmas Day'), {
      remove_dates: ['2026-10-31', '2026-12-25', '2026-09-07'],
    });
    expect(response.body.can_commit).toBe(false);
    expect(response.body.removal_problems.map((item: { code: string }) => item.code)).toEqual([
      'remove_not_found',
      'remove_conflicts_with_csv',
      'remove_before_effective_from',
    ]);
  });

  it('ignores CSV rows before the effective date and says so', async () => {
    const response = await preview(csv('2026-02-16,Renamed Past Day', '2026-03-02,Added Past Day', '2026-12-24,Synthetic Eve'));
    expect(response.body.diff.ignored_past.map((item: { date: string }) => item.date)).toEqual(['2026-02-16', '2026-03-02']);
    expect(response.body.diff.added.map((item: { date: string }) => item.date)).toEqual(['2026-12-24']);
    expect(response.body.diff.renamed).toEqual([]);
  });

  it('refuses an effective date before the prospective boundary in the preview and names the earliest', async () => {
    const response = await preview(csv('2026-12-24,Synthetic Eve'), { effective_from: '2026-09-27' });
    expect(response.status).toBe(200);
    expect(response.body.can_commit).toBe(false);
    expect(response.body.preview_hash).toBeNull();
    expect(response.body.effective_from_problem).toMatchObject({ code: 'retroactive_change', earliest_effective_from: BOUNDARY });
    expect(response.body.earliest_effective_from).toBe(BOUNDARY);
  });

  it('lists the days whose default label changes from the calendar alone, with no employee-derived counts', async () => {
    const response = await preview(
      csv('2026-10-07,Synthetic Company Day', '2026-10-08,Synthetic Shutdown,closure', '2026-12-24,Synthetic Eve'),
    );
    expect(response.status).toBe(200);
    expect(response.body.affected_days).toEqual([
      { date: '2026-10-07', label_before: 'Worked', label_after: 'Holiday' },
      { date: '2026-10-08', label_before: 'Worked', label_after: 'Shutdown' },
      { date: '2026-12-24', label_before: 'Worked', label_after: 'Holiday' },
    ]);
  });

  it('answers identically whether or not employees have day entries on the affected dates (WP2-A-01)', async () => {
    const text = csv('2026-10-07,Synthetic Company Day', '2026-10-08,Synthetic Shutdown,closure', '2026-12-24,Synthetic Eve');
    const before = await preview(text);
    expect(before.status).toBe(200);
    // Default-labelled work, an explicit personal label and a second user's work on changed dates.
    await addSession(employee, '2026-10-07');
    await addSession(admin, '2026-10-07');
    await putExplicit(employee, '2026-10-08', 'Worked');
    const after = await preview(text);
    expect(after.status).toBe(200);
    expect(after.body).toEqual(before.body);
    const body = JSON.stringify(after.body);
    for (const secret of [t.userIds.employee, t.userIds.admin, t.emails.employee, t.emails.admin]) {
      expect(body).not.toContain(secret);
    }
    // No count keys of any employee data remain anywhere in the response.
    expect(body).not.toMatch(/default_labelled_entries|explicit_overrides_preserved|finalized_timesheets/);
  });

  it('reports a finalized period as a date-only signal and blocks the commit, without counts', async () => {
    await addSession(employee, '2026-10-07');
    await addSession(admin, '2026-10-07');
    t.db.prepare('UPDATE timesheets SET finalized_revision_no = 1').run();
    const response = await preview(csv('2026-10-07,Synthetic Company Day'));
    expect(response.body.can_commit).toBe(false);
    expect(response.body.preview_hash).toBeNull();
    expect(response.body.finalized_conflicts).toEqual([{ date: '2026-10-07' }]);
    // Two timesheets are finalized, yet no count of them leaves the server.
    expect(JSON.stringify(response.body)).not.toMatch(/finalized_timesheets/);
  });
});

describe('commit', () => {
  const TEXT = () => csv('2026-10-07,Synthetic Company Day', '2026-12-24,Synthetic Eve', '2026-11-26,Synthetic Thanksgiving');

  it('creates one immutable version and one audit event from a matching preview', async () => {
    const versionsBefore = versionCount();
    const auditsBefore = auditCount();
    const { previewed, commit } = await previewAndCommit(TEXT(), {}, { note: 'Synthetic 2026 holiday refresh' });
    expect(commit.status, JSON.stringify(commit.body)).toBe(201);
    expect(commit.body.committed).toBe(true);
    expect(commit.body.version).toMatchObject({ seq: 2, effective_from: BOUNDARY });
    expect(commit.body.preview_hash).toBe(previewed.body.preview_hash);
    expect(versionCount()).toBe(versionsBefore + 1);
    expect(auditCount()).toBe(auditsBefore + 1);

    const versions = listCalendarVersions(t.db, t.calendarId);
    expect(versions).toHaveLength(2);
    expect(versions[1]?.dates.map((item) => item.date)).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-02-16',
      '2026-05-25',
      '2026-07-03',
      '2026-09-07',
      '2026-10-07',
      '2026-11-26',
      '2026-11-27',
      '2026-12-24',
      '2026-12-25',
    ]);
    expect(versions[1]?.dates.find((item) => item.date === '2026-11-26')?.name).toBe('Synthetic Thanksgiving');
    expect(versions[0]?.dates).toHaveLength(9);

    const event = t.db
      .prepare("SELECT actor_user_id, owner_user_id, operation, entity_type, entity_id, reason, after_json FROM audit_events WHERE operation = 'calendar_version.create' ORDER BY rowid DESC LIMIT 1")
      .get() as { actor_user_id: string; owner_user_id: string | null; operation: string; entity_type: string; entity_id: string; reason: string; after_json: string };
    expect(event).toMatchObject({ actor_user_id: t.userIds.admin, owner_user_id: null, entity_type: 'calendar_version', entity_id: versions[1]?.id, reason: 'Synthetic 2026 holiday refresh' });
    expect(JSON.parse(event.after_json)).toMatchObject({
      seq: 2,
      import: { year: 2026, added: 2, renamed: 1, kind_changed: 0, removed: 0, preview_hash: previewed.body.preview_hash },
    });
    expect(() => t.db.prepare('UPDATE calendar_versions SET note = ? WHERE seq = 2').run('x')).toThrow(/immutable_calendar_version/);
    expect(() => t.db.prepare('DELETE FROM calendar_versions WHERE seq = 2').run()).toThrow(/immutable_calendar_version/);
  });

  it('refuses a missing, malformed, stale or mismatched preview hash and writes nothing', async () => {
    const previewed = await preview(TEXT());
    const hash = previewed.body.preview_hash as string;
    const versions = versionCount();
    const audits = auditCount();

    const missing = await t.request('POST', COMMIT, { cookie: admin, body: importBody(TEXT()) });
    expect(missing.status).toBe(422);
    const malformed = await t.request('POST', COMMIT, { cookie: admin, body: { ...importBody(TEXT()), preview_hash: 'abc' } });
    expect(malformed.status).toBe(422);

    // A hash for different content, i.e. a different CSV or effective date than the preview.
    const otherCsv = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(csv('2026-10-07,Synthetic Company Day')), preview_hash: hash },
    });
    expect(otherCsv.status).toBe(409);
    expect(otherCsv.body.error.code).toBe('stale_preview');
    const otherDate = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(TEXT(), { effective_from: '2026-10-05' }), preview_hash: hash },
    });
    expect(otherDate.status).toBe(409);
    expect(otherDate.body.error.code).toBe('stale_preview');
    const zero = await t.request('POST', COMMIT, { cookie: admin, body: { ...importBody(TEXT()), preview_hash: '0'.repeat(64) } });
    expect(zero.status).toBe(409);

    // The calendar changes between preview and commit: the old preview is stale.
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: t.calendarId,
        effectiveFrom: BOUNDARY,
        weekdays: [1, 2, 3, 4, 5],
        dates: [...(listCalendarVersions(t.db, t.calendarId).at(-1)?.dates ?? []), { date: '2026-10-20', kind: 'holiday', name: 'Synthetic Concurrent Day' }],
      },
      t.userIds.admin,
    );
    const afterConcurrent = versionCount();
    const auditsAfterConcurrent = auditCount();
    const stale = await t.request('POST', COMMIT, { cookie: admin, body: { ...importBody(TEXT()), preview_hash: hash } });
    expect(stale.status).toBe(409);
    expect(stale.body.error.code).toBe('stale_preview');
    expect(versionCount()).toBe(afterConcurrent);
    expect(auditCount()).toBe(auditsAfterConcurrent);
    expect(versions + 1).toBe(afterConcurrent);
    expect(audits + 1).toBe(auditsAfterConcurrent);
  });

  it('refuses an effective date before the prospective boundary', async () => {
    const previewed = await preview(TEXT());
    const versions = versionCount();
    const response = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(TEXT(), { effective_from: '2026-09-27' }), preview_hash: previewed.body.preview_hash },
    });
    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('retroactive_change');
    expect(response.body.error.details.earliest_effective_from).toBe(BOUNDARY);
    expect(versionCount()).toBe(versions);
  });

  it('refuses an effective date earlier than the latest version', async () => {
    const first = await previewAndCommit(TEXT(), { effective_from: '2026-10-12' });
    expect(first.commit.status).toBe(201);
    const second = await previewAndCommit(csv('2026-12-28,Synthetic Day'), { effective_from: '2026-10-05' });
    expect(second.previewed.body.can_commit).toBe(false);
    expect(second.previewed.body.effective_from_problem.code).toBe('effective_from_before_latest_version');
    expect(second.commit.status).toBe(422);
    expect(second.commit.body.error.code).toBe('effective_from_before_latest_version');
    expect(versionCount()).toBe(2);
  });

  it('refuses a CSV with issues or removal problems and writes nothing', async () => {
    const versions = versionCount();
    const bad = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(csv('2026-02-30,Impossible', '2026-10-20,=1+1')), preview_hash: 'f'.repeat(64) },
    });
    expect(bad.status).toBe(422);
    expect(bad.body.error.code).toBe('invalid_holiday_import');
    expect(bad.body.error.details.issues.map((issue: { code: string }) => issue.code).sort()).toEqual(['formula_cell', 'invalid_date']);
    const removal = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(csv('2026-10-20,Synthetic Day'), { remove_dates: ['2026-10-31'] }), preview_hash: 'f'.repeat(64) },
    });
    expect(removal.status).toBe(422);
    expect(removal.body.error.code).toBe('invalid_holiday_import');
    expect(versionCount()).toBe(versions);
  });

  it('treats an identical re-commit as a no-op: no new version, no audit event', async () => {
    const first = await previewAndCommit(TEXT());
    expect(first.commit.status).toBe(201);
    const versions = versionCount();
    const audits = auditCount();
    const again = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(TEXT()), preview_hash: first.previewed.body.preview_hash },
    });
    expect(again.status).toBe(200);
    expect(again.body).toMatchObject({ committed: false, unchanged: true });
    expect(again.body.version).toMatchObject({ seq: 2 });
    expect(versionCount()).toBe(versions);
    expect(auditCount()).toBe(audits);
    // A fresh preview of the same CSV now shows nothing to change and still commits as a no-op.
    const reviewed = await preview(TEXT());
    expect(reviewed.body.diff.added).toEqual([]);
    expect(reviewed.body.diff.renamed).toEqual([]);
    const repeat = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(TEXT()), preview_hash: reviewed.body.preview_hash },
    });
    expect(repeat.status).toBe(200);
    expect(repeat.body.committed).toBe(false);
    expect(versionCount()).toBe(versions);
  });

  it('removes a manual date only when the commit lists it explicitly', async () => {
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: t.calendarId,
        effectiveFrom: BOUNDARY,
        weekdays: [1, 2, 3, 4, 5],
        dates: [...(listCalendarVersions(t.db, t.calendarId).at(-1)?.dates ?? []), { date: '2026-10-20', kind: 'holiday', name: 'Synthetic Manual Day' }],
      },
      t.userIds.admin,
    );
    const kept = await previewAndCommit(csv('2026-12-24,Synthetic Eve'));
    expect(kept.commit.status).toBe(201);
    expect(listCalendarVersions(t.db, t.calendarId).at(-1)?.dates.map((item) => item.date)).toContain('2026-10-20');
    const removed = await previewAndCommit(csv('2026-12-24,Synthetic Eve'), { remove_dates: ['2026-10-20'] });
    expect(removed.commit.status).toBe(201);
    expect(listCalendarVersions(t.db, t.calendarId).at(-1)?.dates.map((item) => item.date)).not.toContain('2026-10-20');
    // The earlier version still lists it: history is immutable.
    expect(listCalendarVersions(t.db, t.calendarId).at(-2)?.dates.map((item) => item.date)).toContain('2026-10-20');
  });

  it('rolls the version back when the audit event cannot be written', async () => {
    const previewed = await preview(TEXT());
    t.db.exec(
      "CREATE TRIGGER test_force_audit_failure BEFORE INSERT ON audit_events WHEN NEW.operation = 'calendar_version.create' BEGIN SELECT RAISE(ABORT, 'forced_audit_failure'); END",
    );
    const versions = versionCount();
    const response = await t.request('POST', COMMIT, {
      cookie: admin,
      body: { ...importBody(TEXT()), preview_hash: previewed.body.preview_hash },
    });
    expect(response.status).toBe(500);
    expect(versionCount()).toBe(versions);
  });

  it('keeps the classification of past dates and old finalized periods unchanged', async () => {
    // An old period (payroll 2026-10-02) with a recorded, finalized day and a current-period day.
    await addSession(employee, '2026-09-21', { reason: 'Synthetic backfill' });
    await addSession(employee, '2026-10-07');
    t.db
      .prepare(
        `UPDATE timesheets SET finalized_revision_no = 1
          WHERE user_id = ? AND pay_period_id IN (SELECT id FROM pay_periods WHERE period_start = '2026-09-14')`,
      )
      .run(t.userIds.employee);

    const classifyAll = () =>
      datesBetween('2026-01-01', BOUNDARY).map((date) => {
        const classification = classifyDate(listCalendarVersions(t.db, t.calendarId), date);
        return { date, dayClass: classification.dayClass, reason: classification.reason, name: classification.name ?? null };
      });
    const before = classifyAll();
    const oldPeriodBefore = (await t.request('GET', '/api/timesheets/2026-10-02', { cookie: employee })).body;
    const oldDayBefore = (await t.request('GET', '/api/days/2026-09-21', { cookie: employee })).body;
    const rowsBefore = dayEntryRows();
    const olderVersionBefore = listCalendarVersions(t.db, t.calendarId)[0];

    const { commit } = await previewAndCommit(
      csv('2026-02-16,Renamed Past Day', '2026-03-02,Added Past Day', '2026-09-22,Synthetic Old Period Day', '2026-10-07,Synthetic Company Day'),
    );
    expect(commit.status, JSON.stringify(commit.body)).toBe(201);

    expect(classifyAll()).toEqual(before);
    expect((await t.request('GET', '/api/timesheets/2026-10-02', { cookie: employee })).body).toEqual(oldPeriodBefore);
    expect((await t.request('GET', '/api/days/2026-09-21', { cookie: employee })).body).toEqual(oldDayBefore);
    expect(listCalendarVersions(t.db, t.calendarId)[0]).toEqual(olderVersionBefore);
    // Only the draft day from the effective date on is reclassified; no employee row was written.
    const draft = (await t.request('GET', '/api/days/2026-10-07', { cookie: employee })).body;
    expect(draft.classification).toMatchObject({ day_class: 'nonworking', reason: 'holiday', name: 'Synthetic Company Day' });
    expect(dayEntryRows()).toEqual(rowsBefore);
    const resulting = listCalendarVersions(t.db, t.calendarId).at(-1);
    expect(resulting?.dates.map((item) => item.date)).not.toContain('2026-03-02');
    expect(resulting?.dates.find((item) => item.date === '2026-02-16')?.name).toBe('Presidents Day');
  });

  it('preserves explicit labels and relabels default rows at read time (E-4)', async () => {
    await addSession(employee, '2026-10-07');
    await putExplicit(employee, '2026-10-08', 'Worked');
    const rows = dayEntryRows();
    const { commit } = await previewAndCommit(csv('2026-10-07,Synthetic Company Day', '2026-10-08,Synthetic Second Day'));
    expect(commit.status).toBe(201);
    expect(dayEntryRows()).toEqual(rows);
    const defaulted = (await t.request('GET', '/api/days/2026-10-07', { cookie: employee })).body;
    expect(defaulted).toMatchObject({ category: 'Holiday', category_source: 'default' });
    const explicit = (await t.request('GET', '/api/days/2026-10-08', { cookie: employee })).body;
    expect(explicit).toMatchObject({ category: 'Worked', category_source: 'explicit', default_category: 'Holiday' });
  });

  it('refuses a change that would alter a finalized timesheet, then accepts a later date', async () => {
    await addSession(employee, '2026-10-07');
    t.db.prepare('UPDATE timesheets SET finalized_revision_no = 1 WHERE user_id = ?').run(t.userIds.employee);
    const versions = versionCount();
    const refused = await previewAndCommit(csv('2026-10-07,Synthetic Company Day'));
    expect(refused.commit.status).toBe(409);
    expect(refused.commit.body.error.code).toBe('finalized_period_affected');
    expect(versionCount()).toBe(versions);
    // A holiday in the next, unfinalized period is fine, and a pure rename never affects a finalized sheet.
    const later = await previewAndCommit(csv('2026-10-20,Synthetic Next Period Day'));
    expect(later.commit.status).toBe(201);
  });
});

describe('missing next-year calendar warning (E-12), with a fixed clock', () => {
  const warnings = async (who: string) => (await t.request('GET', '/api/calendar', { cookie: who })).body.warnings;

  it('is empty before 1 October in the reporting zone and appears from then', async () => {
    t.clock.set('2026-09-30T18:00:00Z');
    expect(await warnings(await t.login('employee'))).toEqual([]);
    // 05:00Z on 1 October is 22:00 on 30 September in Los Angeles: still no warning.
    t.clock.set('2026-10-01T05:00:00Z');
    expect(await warnings(await t.login('employee'))).toEqual([]);
    // 07:00Z is 00:00 on 1 October in Los Angeles.
    t.clock.set('2026-10-01T07:00:00Z');
    const warned = await warnings(await t.login('employee'));
    expect(warned).toEqual([
      expect.objectContaining({ code: 'next_year_calendar_missing', year: 2027, warn_from: '2026-10-01' }),
    ]);
    expect(typeof warned[0].message).toBe('string');
    t.clock.set('2026-12-31T20:00:00Z');
    expect((await warnings(await t.login('admin'))).map((item: { year: number }) => item.year)).toEqual([2027]);
  });

  it('is empty in the new year until the next 1 October', async () => {
    t.clock.set('2027-01-01T20:00:00Z');
    expect(await warnings(await t.login('employee'))).toEqual([]);
    t.clock.set('2027-09-30T20:00:00Z');
    expect(await warnings(await t.login('employee'))).toEqual([]);
    t.clock.set('2027-10-02T20:00:00Z');
    expect((await warnings(await t.login('employee'))).map((item: { year: number }) => item.year)).toEqual([2028]);
  });

  it('disappears once a committed version holds next-year dates', async () => {
    const { commit } = await previewAndCommit(csv('2027-01-01,Synthetic New Year', '2027-12-24,Synthetic Eve'), { year: 2027 });
    expect(commit.status, JSON.stringify(commit.body)).toBe(201);
    expect(await warnings(employee)).toEqual([]);
    // The following year is then missing, from 1 October 2027.
    t.clock.set('2027-10-05T20:00:00Z');
    expect((await warnings(await t.login('employee'))).map((item: { year: number }) => item.year)).toEqual([2028]);
  });

  it('does not count a version that is not in force for next year', async () => {
    // Dates for 2027 exist only in an older version that a later one replaces without them.
    createCalendarVersion(
      t.db,
      t.clock,
      {
        calendarId: t.calendarId,
        effectiveFrom: BOUNDARY,
        weekdays: [1, 2, 3, 4, 5],
        dates: [{ date: '2027-01-01', kind: 'holiday', name: 'Synthetic New Year' }],
      },
      t.userIds.admin,
    );
    createCalendarVersion(
      t.db,
      t.clock,
      { calendarId: t.calendarId, effectiveFrom: '2026-10-12', weekdays: [1, 2, 3, 4, 5], dates: [] },
      t.userIds.admin,
    );
    expect((await warnings(employee)).map((item: { year: number }) => item.year)).toEqual([2027]);
  });

  it('keeps the existing calendar fields', async () => {
    const calendar = (await t.request('GET', '/api/calendar', { cookie: employee })).body;
    expect(Object.keys(calendar).sort()).toEqual(
      ['id', 'name', 'payroll', 'payroll_exceptions', 'reporting_zone', 'versions', 'warnings'].sort(),
    );
  });
});
