import { randomBytes } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCalendar, createCalendarVersion, getCalendar } from '../../src/server/services/calendars.ts';
import { createUser } from '../../src/server/services/users.ts';
import { createTestContext, la, type TestContext } from '../support/testApp.ts';

/*
 * R-UX5I2-3 (owner decision 2026-11-02): a write that would record a category over a calendar
 * default that changed since the caller loaded it is refused with 409 `default_changed` until the
 * caller names the new default. Today is 2026-09-29 (LA 13:00); the current pay period holds
 * 2026-09-21…2026-09-23. A holiday is imported through the real admin route (preview, then
 * commit), the only runtime event that changes a default. All people here are synthetic.
 */

let t: TestContext;
let cookie: string;
let admin: string;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  cookie = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

const DAY_A = '2026-09-21';
const DAY_B = '2026-09-22';
const DAY_C = '2026-09-23';
const OLD = '2026-09-09';

type Kind = 'holiday' | 'closure';

/** Imports one row into a calendar through the admin routes, taking the effective date from the preview. */
async function importRow(date: string, name: string, kind: Kind = 'holiday', calendarId: string = t.calendarId): Promise<void> {
  const csv = ['date,name,kind', `${date},${name},${kind}`].join('\n');
  const first = await t.request('POST', '/api/admin/calendar/import/preview', {
    cookie: admin,
    body: { calendar_id: calendarId, year: Number(date.slice(0, 4)), effective_from: '2099-01-01', csv, remove_dates: [] },
  });
  expect(first.status, JSON.stringify(first.body)).toBe(200);
  const body = {
    calendar_id: calendarId,
    year: Number(date.slice(0, 4)),
    effective_from: first.body.earliest_effective_from as string,
    csv,
    remove_dates: [],
  };
  const preview = await t.request('POST', '/api/admin/calendar/import/preview', { cookie: admin, body });
  expect(preview.status, JSON.stringify(preview.body)).toBe(200);
  expect(preview.body.can_commit, JSON.stringify(preview.body)).toBe(true);
  const commit = await t.request('POST', '/api/admin/calendar/import/commit', {
    cookie: admin,
    body: { ...body, preview_hash: preview.body.preview_hash },
  });
  expect(commit.status, JSON.stringify(commit.body)).toBe(201);
}

const dayBody = (category: string, extra: Record<string, unknown> = {}) => ({
  category,
  leave_minutes: 0,
  wfh: false,
  notes: '',
  ...extra,
});

const put = (date: string, body: Record<string, unknown>, who: string = cookie) =>
  t.request('PUT', `/api/days/${date}`, { cookie: who, body });

const batch = (body: Record<string, unknown>, who: string = cookie) => t.request('POST', '/api/days/batch', { cookie: who, body });

async function addSession(date: string, who: string = cookie) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: who,
    body: {
      start: la(`${date}T09:00`),
      end: la(`${date}T12:00`),
      input_zone: 'America/Los_Angeles',
      breaks: [],
      breaks_confirmed: true,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

async function entryVersion(date: string): Promise<number> {
  const response = await t.request('GET', `/api/days/${date}`, { cookie });
  expect(response.status).toBe(200);
  return response.body.entry.version as number;
}

const count = (sql: string, ...params: unknown[]) => Number(t.db.prepare(sql).pluck().get(...params));
const entryRows = (userId: string = t.userIds.employee) =>
  t.db.prepare('SELECT * FROM day_entries WHERE user_id = ? ORDER BY work_date').all(userId) as Array<Record<string, unknown>>;
const timesheetRows = () => t.db.prepare('SELECT * FROM timesheets ORDER BY rowid').all();
const auditCount = () => count('SELECT count(*) FROM audit_events');
function dayEntryAudits() {
  return t.db
    .prepare(
      `SELECT operation, before_json, after_json, actor_user_id FROM audit_events
        WHERE entity_type = 'day_entry' ORDER BY rowid`,
    )
    .all() as Array<{ operation: string; before_json: string | null; after_json: string | null; actor_user_id: string }>;
}

describe('PUT /api/days/:date refuses a category recorded over a changed calendar default', () => {
  it('I1: a day with no entry: 409 default_changed with both defaults, nothing written', async () => {
    await importRow(DAY_A, 'Synthetic Holiday');
    const rows = entryRows();
    const sheets = timesheetRows();
    const audits = auditCount();
    const response = await put(DAY_A, dayBody('Worked', { default_category: 'Worked' }));
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body.error).toMatchObject({
      code: 'default_changed',
      message: `The calendar default for ${DAY_A} changed from Worked to Holiday since it was loaded. Nothing was saved.`,
      details: { work_date: DAY_A, expected_default: 'Worked', current_default: 'Holiday' },
    });
    expect(entryRows()).toEqual(rows);
    expect(timesheetRows()).toEqual(sheets);
    expect(auditCount()).toBe(audits);
  });

  it('I2: a default-sourced entry: 409, and the entry, its version and its notes are unchanged', async () => {
    await addSession(DAY_A);
    const version = await entryVersion(DAY_A);
    await importRow(DAY_A, 'Synthetic Holiday');
    const rows = entryRows();
    const sheets = timesheetRows();
    const audits = auditCount();
    const response = await put(DAY_A, dayBody('Worked', { notes: 'typed', expected_version: version, default_category: 'Worked' }));
    expect(response.status, JSON.stringify(response.body)).toBe(409);
    expect(response.body.error).toMatchObject({
      code: 'default_changed',
      details: { work_date: DAY_A, expected_default: 'Worked', current_default: 'Holiday' },
    });
    expect(entryRows()).toEqual(rows);
    expect(entryRows()[0]).toMatchObject({ category_source: 'default', notes: '', version });
    expect(timesheetRows()).toEqual(sheets);
    expect(auditCount()).toBe(audits);
  });

  it('I3: the acknowledgement (the current default) records the category as explicit, audited', async () => {
    await addSession(DAY_A);
    const version = await entryVersion(DAY_A);
    await importRow(DAY_A, 'Synthetic Holiday');
    const saved = await put(DAY_A, dayBody('Worked', { expected_version: version, default_category: 'Holiday' }));
    expect(saved.status, JSON.stringify(saved.body)).toBe(200);
    expect(saved.body).toMatchObject({ category: 'Worked', category_source: 'explicit' });
    expect(saved.body.entry).toMatchObject({ version: version + 1 });
    const update = dayEntryAudits().find((row) => row.operation === 'day_entry.update');
    expect(JSON.parse(update?.before_json ?? '{}')).toMatchObject({ category: 'Holiday', category_source: 'default' });
    expect(JSON.parse(update?.after_json ?? '{}')).toMatchObject({ category: 'Worked', category_source: 'explicit' });

    await importRow(DAY_B, 'Synthetic Holiday Two');
    const created = await put(DAY_B, dayBody('Worked', { default_category: 'Holiday' }));
    expect(created.status, JSON.stringify(created.body)).toBe(200);
    expect(created.body).toMatchObject({ category: 'Worked', category_source: 'explicit' });
    const create = dayEntryAudits().filter((row) => row.operation === 'day_entry.create').at(-1);
    expect(create?.before_json).toBeNull();
    expect(JSON.parse(create?.after_json ?? '{}')).toMatchObject({ category: 'Worked', category_source: 'explicit' });
  });

  it('I4: an explicit entry is never checked, even with a stale default', async () => {
    const first = await put(DAY_A, dayBody('Worked'));
    expect(first.status).toBe(200);
    await importRow(DAY_A, 'Synthetic Holiday');
    const again = await put(DAY_A, dayBody('Worked', { notes: 'again', expected_version: first.body.entry.version, default_category: 'Worked' }));
    expect(again.status, JSON.stringify(again.body)).toBe(200);
    expect(again.body).toMatchObject({ category: 'Worked', category_source: 'explicit', default_category: 'Holiday' });
  });

  it('I5: no false notice for an import that moves another date, a rename, or an unchanged category; a kind change refuses', async () => {
    await addSession(DAY_A);
    const version = await entryVersion(DAY_A);
    await importRow(DAY_B, 'Synthetic Other Holiday');
    const other = await put(DAY_A, dayBody('Off', { notes: 'a', expected_version: version, default_category: 'Worked' }));
    expect(other.status, JSON.stringify(other.body)).toBe(200);

    await addSession(DAY_C);
    const holiday = await entryVersion(DAY_C);
    await importRow(DAY_C, 'Synthetic Holiday Original');
    // The person loaded the sheet after the first import: Holiday is the default they saw.
    await importRow(DAY_C, 'Synthetic Holiday Renamed');
    const renamed = await put(DAY_C, dayBody('Off', { notes: 'r', expected_version: holiday, default_category: 'Holiday' }));
    expect(renamed.status, JSON.stringify(renamed.body)).toBe(200);

    await importRow(DAY_B, 'Synthetic Other Holiday', 'closure');
    const kind = await put(DAY_B, dayBody('Holiday', { default_category: 'Holiday' }));
    expect(kind.status, JSON.stringify(kind.body)).toBe(409);
    expect(kind.body.error.details).toMatchObject({ expected_default: 'Holiday', current_default: 'Shutdown' });
  });

  it('I6: an omitted default_category is not checked', async () => {
    await importRow(DAY_A, 'Synthetic Holiday');
    const response = await put(DAY_A, dayBody('Worked'));
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toMatchObject({ category: 'Worked', category_source: 'explicit' });
  });

  it('I7: reason (422) and stale_version (409) are answered before default_changed', async () => {
    await addSession(DAY_A);
    const version = await entryVersion(DAY_A);
    await importRow(DAY_A, 'Synthetic Holiday');
    // The entry moved elsewhere and the default moved: the version guard wins.
    const moved = await put(DAY_A, dayBody('Worked', { expected_version: version + 5, default_category: 'Worked' }));
    expect(moved.status).toBe(409);
    expect(moved.body.error.code).toBe('stale_version');
    // An old period needs a reason first, whatever the default says.
    const noReason = await put(OLD, dayBody('Off', { default_category: 'Holiday' }));
    expect(noReason.status).toBe(422);
    expect(noReason.body.error.code).toBe('reason_required');
    const withReason = await put(OLD, dayBody('Off', { default_category: 'Holiday', reason: 'Synthetic correction' }));
    expect(withReason.status, JSON.stringify(withReason.body)).toBe(409);
    expect(withReason.body.error.code).toBe('default_changed');
  });

  it('I8: a null default means "none was shown": refused when the calendar has one; unknown values are 422', async () => {
    const mismatch = await put(DAY_A, dayBody('Off', { default_category: null }));
    expect(mismatch.status, JSON.stringify(mismatch.body)).toBe(409);
    expect(mismatch.body.error.message).toBe(
      `The calendar default for ${DAY_A} changed from none to Worked since it was loaded. Nothing was saved.`,
    );
    expect(mismatch.body.error.details).toMatchObject({ expected_default: null, current_default: 'Worked' });
    expect(entryRows()).toEqual([]);
    const same = await put(DAY_A, dayBody('Worked', { default_category: null }));
    expect(same.status, JSON.stringify(same.body)).toBe(200);

    for (const bad of ['OT-funded leave', 7, 'worked']) {
      const response = await put(DAY_B, dayBody('Worked', { default_category: bad }));
      expect(response.status, String(bad)).toBe(422);
    }
    const extra = await put(DAY_B, dayBody('Worked', { default_source: 'default' }));
    expect(extra.status).toBe(422);
    expect(entryRows()).toHaveLength(1);
  });

  it('I14: a category equal to the new default is not refused (both choices give the same category)', async () => {
    await addSession(DAY_A);
    const version = await entryVersion(DAY_A);
    await importRow(DAY_A, 'Synthetic Holiday');
    const saved = await put(DAY_A, dayBody('Holiday', { expected_version: version, default_category: 'Worked' }));
    expect(saved.status, JSON.stringify(saved.body)).toBe(200);
    expect(saved.body).toMatchObject({ category: 'Holiday', category_source: 'explicit' });

    await importRow(DAY_B, 'Synthetic Holiday Two');
    const preview = await batch({
      mode: 'preview',
      entries: [{ work_date: DAY_B, category: 'Holiday', default_category: 'Worked' }],
    });
    expect(preview.status, JSON.stringify(preview.body)).toBe(200);
    expect(preview.body.entries[0]).toMatchObject({ status: 'create', error: null });
    expect(preview.body.can_commit).toBe(true);
    const commit = await batch({ mode: 'commit', entries: [{ work_date: DAY_B, category: 'Holiday', default_category: 'Worked' }] });
    expect(commit.status, JSON.stringify(commit.body)).toBe(200);
  });

  it('I17: a date no calendar version covers has no default to protect: the calendar_missing refusal stands, not default_changed', async () => {
    const response = await put('2025-12-31', dayBody('Off', { default_category: 'Worked', reason: 'Synthetic correction' }));
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.error.code).toBe('calendar_missing');
    expect(entryRows()).toEqual([]);
  });

  it('I16: an invalid leave is answered (422) before a changed default', async () => {
    await importRow(DAY_A, 'Synthetic Holiday');
    const response = await put(DAY_A, dayBody('Worked', { leave_minutes: 481, leave_kind: 'vacation', default_category: 'Worked' }));
    expect(response.status, JSON.stringify(response.body)).toBe(422);
    expect(response.body.error.code).toBe('leave_exceeds_required');
  });
});

describe('POST /api/days/batch with a changed calendar default', () => {
  const entry = (date: string, category: string, extra: Record<string, unknown> = {}) => ({ work_date: date, category, ...extra });

  it('I9: the preview marks the date default_changed, cannot commit, and writes nothing', async () => {
    await importRow(DAY_A, 'Synthetic Holiday');
    const rows = entryRows();
    const sheets = timesheetRows();
    const audits = auditCount();
    const response = await batch({
      mode: 'preview',
      entries: [entry(DAY_A, 'Worked', { default_category: 'Worked' }), entry(DAY_B, 'Off', { default_category: 'Worked' })],
    });
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.can_commit).toBe(false);
    expect(response.body.entries[0]).toMatchObject({
      work_date: DAY_A,
      status: 'default_changed',
      error: {
        code: 'default_changed',
        message: 'The calendar default is now Holiday (was Worked)',
        details: { expected_default: 'Worked', current_default: 'Holiday' },
      },
    });
    expect(response.body.entries[1]).toMatchObject({ work_date: DAY_B, status: 'create', error: null });
    expect(response.body.changed_count).toBe(1);
    expect(entryRows()).toEqual(rows);
    expect(timesheetRows()).toEqual(sheets);
    expect(auditCount()).toBe(audits);
  });

  it('I10: a commit with one changed default is 409 with the dates and writes neither date; stale_version wins', async () => {
    await importRow(DAY_A, 'Synthetic Holiday');
    const rows = entryRows();
    const audits = auditCount();
    const refused = await batch({
      mode: 'commit',
      entries: [entry(DAY_A, 'Worked', { default_category: 'Worked' }), entry(DAY_B, 'Off', { default_category: 'Worked' })],
    });
    expect(refused.status, JSON.stringify(refused.body)).toBe(409);
    expect(refused.body.error).toMatchObject({
      code: 'default_changed',
      details: {
        work_dates: [DAY_A],
        changes: [{ work_date: DAY_A, expected_default: 'Worked', current_default: 'Holiday' }],
      },
    });
    expect(entryRows()).toEqual(rows);
    expect(auditCount()).toBe(audits);

    const stale = await batch({
      mode: 'commit',
      entries: [entry(DAY_A, 'Worked', { default_category: 'Worked' }), entry(DAY_B, 'Off', { default_category: 'Worked', expected_version: 3 })],
    });
    expect(stale.status).toBe(409);
    expect(stale.body.error).toMatchObject({ code: 'stale_version', details: { work_dates: [DAY_B] } });
    expect(entryRows()).toEqual(rows);
  });

  it('I11: the acknowledgement (the current default) commits every date', async () => {
    await importRow(DAY_A, 'Synthetic Holiday');
    const response = await batch({
      mode: 'commit',
      entries: [entry(DAY_A, 'Worked', { default_category: 'Holiday' }), entry(DAY_B, 'Off', { default_category: 'Worked' })],
    });
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body.changed).toEqual([DAY_A, DAY_B]);
    expect(entryRows().map((row) => [row.work_date, row.category, row.category_source])).toEqual([
      [DAY_A, 'Worked', 'explicit'],
      [DAY_B, 'Off', 'explicit'],
    ]);
  });

  it('I11b: an omitted default_category and an explicit entry are not checked in a batch', async () => {
    await importRow(DAY_A, 'Synthetic Holiday');
    const omitted = await batch({ mode: 'commit', entries: [entry(DAY_A, 'Worked')] });
    expect(omitted.status, JSON.stringify(omitted.body)).toBe(200);
    await importRow(DAY_B, 'Synthetic Holiday Two');
    const explicit = await put(DAY_C, dayBody('Worked'));
    await importRow(DAY_C, 'Synthetic Holiday Three');
    const again = await batch({
      mode: 'commit',
      entries: [entry(DAY_C, 'Off', { expected_version: explicit.body.entry.version, default_category: 'Worked' })],
    });
    expect(again.status, JSON.stringify(again.body)).toBe(200);
  });

  it('I15: the commit order is stale, invalid, reason, default_changed, then conflicts', async () => {
    await addSession(DAY_A);
    const version = await entryVersion(DAY_A);
    await importRow(DAY_B, 'Synthetic Holiday');
    // DAY_A: recorded work against a Vacation label is a conflict that needs confirmation.
    // DAY_B: the default changed. The default refusal comes first, so nobody confirms a conflict and then learns it moved.
    const body = {
      mode: 'commit',
      entries: [
        entry(DAY_A, 'Vacation', { expected_version: version, default_category: 'Worked' }),
        entry(DAY_B, 'Worked', { default_category: 'Worked' }),
      ],
    };
    const refused = await batch(body);
    expect(refused.status, JSON.stringify(refused.body)).toBe(409);
    expect(refused.body.error.code).toBe('default_changed');
    const confirmedToo = await batch({ ...body, confirm_conflicts: true });
    expect(confirmedToo.status).toBe(409);
    expect(confirmedToo.body.error.code).toBe('default_changed');
    // Without the changed date the conflict is the next refusal.
    const conflict = await batch({ mode: 'commit', entries: [body.entries[0]] });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe('conflicts_require_confirmation');
    // An invalid entry is answered before the default.
    const invalid = await batch({
      mode: 'commit',
      entries: [entry(DAY_B, 'Worked', { default_category: 'Worked' }), entry(DAY_C, 'Worked', { leave_minutes: 481, leave_kind: 'vacation' })],
    });
    expect(invalid.status).toBe(422);
    expect(invalid.body.error.code).toBe('batch_invalid');
    // A missing reason is answered before the default.
    const reason = await batch({
      mode: 'commit',
      entries: [entry(DAY_B, 'Worked', { default_category: 'Worked' }), entry(OLD, 'Off')],
    });
    expect(reason.status).toBe(422);
    expect(reason.body.error.code).toBe('reason_required');
  });
});

describe('ownership and calendars', () => {
  const OTHER_EMAIL = 'other-calendar@example.invalid';

  async function otherCalendarUser(email: string, name: string) {
    const schedule = getCalendar(t.db, t.calendarId).schedule;
    const calendarId = createCalendar(t.db, t.clock, { name: `Synthetic other calendar ${name}`, schedule }, null);
    createCalendarVersion(t.db, t.clock, { calendarId, effectiveFrom: '2026-01-01', weekdays: [1, 2, 3, 4, 5], dates: [], note: 'Synthetic' }, null);
    const password = randomBytes(18).toString('base64url');
    const id = await createUser(t.db, t.clock, { email, displayName: name, role: 'employee', password, calendarId }, null);
    const login = await t.request('POST', '/api/auth/login', { body: { email, password } });
    expect(login.status, JSON.stringify(login.body)).toBe(200);
    return { id, calendarId, cookie: login.headers.get('set-cookie')?.split(';')[0] ?? '' };
  }

  it('I12: the shared edit route checks the owner calendar, not the grantee calendar; a read-only grantee is still 403', async () => {
    const grantee = await otherCalendarUser(OTHER_EMAIL, 'Synthetic Grantee');
    const shareEdit = await t.request('POST', '/api/shares', {
      cookie,
      body: { grantee_email: OTHER_EMAIL, items: { timesheets: 'edit', ot_read: false, pdf_download: false } },
    });
    expect(shareEdit.status, JSON.stringify(shareEdit.body)).toBe(201);
    await importRow(DAY_A, 'Synthetic Holiday');
    const path = (date: string) => `/api/shared/${t.userIds.employee}/days/${date}`;
    const rows = entryRows();
    const refused = await t.request('PUT', path(DAY_A), { cookie: grantee.cookie, body: dayBody('Worked', { default_category: 'Worked' }) });
    expect(refused.status, JSON.stringify(refused.body)).toBe(409);
    expect(refused.body.error).toMatchObject({
      code: 'default_changed',
      details: { work_date: DAY_A, expected_default: 'Worked', current_default: 'Holiday' },
    });
    expect(Object.keys(refused.body.error.details).sort()).toEqual(['current_default', 'expected_default', 'work_date']);
    expect(entryRows()).toEqual(rows);
    // The grantee's own calendar has no holiday: a check against the actor would let this through.
    const acknowledged = await t.request('PUT', path(DAY_A), { cookie: grantee.cookie, body: dayBody('Worked', { default_category: 'Holiday' }) });
    expect(acknowledged.status, JSON.stringify(acknowledged.body)).toBe(200);
    expect(entryRows()).toHaveLength(1);
    const audit = dayEntryAudits().at(-1);
    expect(audit?.actor_user_id).toBe(grantee.id);

    const viewOnly = await t.request('PUT', `/api/shares/${shareEdit.body.share.id}`, {
      cookie,
      body: { items: { timesheets: 'view', ot_read: false, pdf_download: false } },
    });
    expect(viewOnly.status, JSON.stringify(viewOnly.body)).toBe(200);
    const denied = await t.request('PUT', path(DAY_B), { cookie: grantee.cookie, body: dayBody('Worked', { default_category: 'Holiday' }) });
    expect(denied.status).toBe(403);
  });

  it('I13: another user on another calendar is unaffected by an import on the first calendar', async () => {
    const other = await otherCalendarUser('second-calendar@example.invalid', 'Synthetic Second');
    await importRow(DAY_A, 'Synthetic Holiday');
    const response = await t.request('PUT', `/api/days/${DAY_A}`, { cookie: other.cookie, body: dayBody('Worked', { default_category: 'Worked' }) });
    expect(response.status, JSON.stringify(response.body)).toBe(200);
    expect(response.body).toMatchObject({ category: 'Worked', category_source: 'explicit', default_category: 'Worked' });
    // Importing into the second calendar changes only that user's default.
    await importRow(DAY_B, 'Synthetic Second Holiday', 'holiday', other.calendarId);
    const mine = await put(DAY_B, dayBody('Worked', { default_category: 'Worked' }));
    expect(mine.status, JSON.stringify(mine.body)).toBe(200);
    const theirs = await t.request('PUT', `/api/days/${DAY_B}`, { cookie: other.cookie, body: dayBody('Worked', { default_category: 'Worked' }) });
    expect(theirs.status).toBe(409);
  });
});
