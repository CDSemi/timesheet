import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import type { Db } from '../../src/server/db/database.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createSendJobHandler } from '../../src/server/jobs/sendJob.ts';
import { postCredit } from '../../src/server/services/ledger.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T13B, FR-17 and AC-16: an owner shares their own timesheets item by item (timesheets view or
 * edit, read-only OT, final PDF downloads) with another account, changes or revokes the share, and
 * the grantee may leave it. A grantee reaches the owner's data only under /api/shared/:ownerId, the
 * grant is resolved live on every request and re-checked inside the write transaction, object ids
 * must belong to the owner, and sign-off, signatures, sending, settings, leave actions, history and
 * re-sharing are never shared. Every account, address and image here is synthetic.
 */

const PAYROLL = '2026-10-02';
const OWNER_NAME = 'Example Employee';

interface Account {
  id: string;
  email: string;
  password: string;
  cookie: string;
}

let t: TestContext;
let owner: string;
let admin: string;
let grantee: Account;
let stranger: Account;

type Items = { timesheets: 'none' | 'view' | 'edit'; ot_read: boolean; pdf_download: boolean };
const items = (timesheets: Items['timesheets'], otRead = false, pdfDownload = false): Items => ({
  timesheets,
  ot_read: otRead,
  pdf_download: pdfDownload,
});
const ALL_ITEMS = items('edit', true, true);

async function signIn(email: string, password: string): Promise<string> {
  const response = await t.request('POST', '/api/auth/login', { body: { email, password } });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.headers.get('set-cookie')?.split(';')[0] ?? '';
}

async function account(email: string, displayName: string): Promise<Account> {
  const password = randomBytes(18).toString('base64url');
  const id = await createUser(t.db, t.clock, { email, displayName, role: 'employee', password, calendarId: t.calendarId }, t.userIds.admin);
  return { id, email, password, cookie: await signIn(email, password) };
}

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  owner = await t.login('employee');
  admin = await t.login('admin');
  grantee = await account('grantee@example.invalid', 'Synthetic Grantee');
  stranger = await account('stranger@example.invalid', 'Synthetic Stranger');
});

afterEach(() => t.close());

const shared = (path: string, ownerId = t.userIds.employee) => `/api/shared/${ownerId}${path}`;

async function grant(granted: Items, email = grantee.email, cookie = owner) {
  return t.request('POST', '/api/shares', { cookie, body: { grantee_email: email, items: granted } });
}

async function granted(granted: Items, email = grantee.email): Promise<string> {
  const response = await grant(granted, email);
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.share.id as string;
}

function shareRows() {
  return t.db
    .prepare(
      `SELECT id, owner_user_id, grantee_user_id, timesheets_scope, ot_read, pdf_download, created_by, revoked_by, revoke_reason,
              revoked_at IS NOT NULL AS revoked
         FROM timesheet_shares ORDER BY rowid`,
    )
    .all() as Array<Record<string, string | number | null>>;
}

function shareAudits() {
  return t.db
    .prepare(
      `SELECT operation, actor_user_id, owner_user_id, entity_type, entity_id, reason, before_json, after_json
         FROM audit_events WHERE operation LIKE 'share.%' ORDER BY rowid`,
    )
    .all() as Array<Record<string, string | null>>;
}

const count = (sql: string, ...params: unknown[]) => Number(t.db.prepare(sql).pluck().get(...params));

/** Rows of every table a shared request could touch, for "nothing was written" checks. */
function personalState() {
  return {
    sessions: t.db.prepare('SELECT * FROM work_sessions ORDER BY rowid').all(),
    breaks: t.db.prepare('SELECT * FROM session_breaks ORDER BY rowid').all(),
    days: t.db.prepare('SELECT * FROM day_entries ORDER BY rowid').all(),
    timesheets: t.db.prepare('SELECT * FROM timesheets ORDER BY rowid').all(),
    leave: t.db.prepare('SELECT * FROM ot_leave_requests ORDER BY rowid').all(),
    ledger: t.db.prepare('SELECT * FROM ot_ledger ORDER BY rowid').all(),
    policies: t.db.prepare('SELECT * FROM work_policies ORDER BY rowid').all(),
    settings: t.db.prepare('SELECT * FROM submission_settings ORDER BY rowid').all(),
    attachments: t.db.prepare('SELECT * FROM attachments ORDER BY rowid').all(),
    revisions: t.db.prepare('SELECT * FROM timesheet_revisions ORDER BY rowid').all(),
    jobs: t.db.prepare('SELECT * FROM jobs ORDER BY rowid').all(),
    shares: t.db.prepare('SELECT * FROM timesheet_shares ORDER BY rowid').all(),
    audit: count('SELECT count(*) FROM audit_events'),
  };
}

const sessionBody = (date: string, from = '09:00', to = '17:00') => ({
  start: la(`${date}T${from}`),
  end: la(`${date}T${to}`),
  input_zone: LA,
  breaks: [],
  breaks_confirmed: true,
});

async function ownerSession(date = '2026-09-21', cookie = owner): Promise<string> {
  const response = await t.request('POST', `/api/days/${date}/sessions`, { cookie, body: sessionBody(date) });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.session.id as string;
}

describe('grant, list, change, revoke and leave (FR-17)', () => {
  it('grants by exact account email and lists the share for both parties, audited without personal content', async () => {
    const response = await grant(items('view'), '  Grantee@Example.INVALID ');
    expect(response.status, JSON.stringify(response.body)).toBe(201);
    const share = response.body.share;
    expect(share).toEqual({
      id: expect.any(String),
      grantee: { display_name: 'Synthetic Grantee', email: grantee.email, active: true },
      items: items('view'),
      created_at: '2026-09-29T20:00:00Z',
    });
    expect(shareRows()).toEqual([
      {
        id: share.id,
        owner_user_id: t.userIds.employee,
        grantee_user_id: grantee.id,
        timesheets_scope: 'view',
        ot_read: 0,
        pdf_download: 0,
        created_by: t.userIds.employee,
        revoked_by: null,
        revoke_reason: null,
        revoked: 0,
      },
    ]);
    const given = await t.request('GET', '/api/shares', { cookie: owner });
    expect(given.status).toBe(200);
    expect(given.body).toEqual({ given: [share], received: [] });
    const received = await t.request('GET', '/api/shares', { cookie: grantee.cookie });
    expect(received.body).toEqual({
      given: [],
      received: [
        {
          id: share.id,
          owner: { id: t.userIds.employee, display_name: OWNER_NAME, email: t.emails.employee },
          items: items('view'),
          created_at: '2026-09-29T20:00:00Z',
        },
      ],
    });
    expect((await t.request('GET', '/api/shares', { cookie: stranger.cookie })).body).toEqual({ given: [], received: [] });
    const audits = shareAudits();
    expect(audits).toEqual([
      {
        operation: 'share.grant',
        actor_user_id: t.userIds.employee,
        owner_user_id: t.userIds.employee,
        entity_type: 'timesheet_share',
        entity_id: share.id,
        reason: null,
        before_json: null,
        after_json: JSON.stringify({ timesheets: 'view', ot_read: false, pdf_download: false }),
      },
    ]);
    expect(JSON.stringify(audits)).not.toContain(grantee.email);
    expect(JSON.stringify(audits)).not.toContain('Synthetic Grantee');
    expect((await t.request('GET', '/api/shares')).status).toBe(401);
  });

  it('answers the same generic 422 for an unknown or inactive address and refuses self and empty shares, writing nothing', async () => {
    const before = personalState();
    const unknown = await grant(items('view'), 'nobody@example.invalid');
    expect(unknown.status).toBe(422);
    expect(unknown.body.error.code).toBe('grantee_not_found');
    const deactivated = await t.request('POST', `/api/admin/users/${stranger.id}/deactivate`, { cookie: admin, body: {} });
    expect(deactivated.status).toBe(200);
    const auditAfterDeactivation = count('SELECT count(*) FROM audit_events');
    const inactive = await grant(items('view'), stranger.email);
    expect(inactive.status).toBe(422);
    expect(inactive.body).toEqual(unknown.body);
    const self = await grant(items('view'), t.emails.employee);
    expect(self.status).toBe(422);
    expect(self.body.error.code).toBe('self_share');
    const empty = await grant(items('none'));
    expect(empty.status).toBe(422);
    expect(empty.body.error.code).toBe('no_share_items');
    for (const body of [
      { grantee_email: grantee.email, items: items('view'), owner_user_id: t.userIds.admin },
      { grantee_email: grantee.email, items: { ...items('view'), history: true } },
      { grantee_email: grantee.email, items: { ...items('view'), timesheets: 'admin' } },
      { grantee_email: grantee.email },
    ]) {
      const response = await t.request('POST', '/api/shares', { cookie: owner, body });
      expect(response.status, JSON.stringify(body)).toBe(422);
      expect(response.body.error.code).toBe('validation_error');
    }
    expect(count('SELECT count(*) FROM timesheet_shares')).toBe(0);
    expect(count('SELECT count(*) FROM audit_events')).toBe(auditAfterDeactivation);
    expect({ ...personalState(), audit: 0 }).toEqual({ ...before, audit: 0 });
  });

  it('rate-limits repeated grantee_not_found answers per account, also for an existing address', async () => {
    for (let index = 0; index < 10; index += 1) {
      const response = await grant(items('view'), `missing-${index}@example.invalid`);
      expect(response.status, String(index)).toBe(422);
    }
    const limited = await grant(items('view'));
    expect(limited.status).toBe(429);
    expect(limited.body.error.code).toBe('rate_limited');
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0);
    expect(count('SELECT count(*) FROM timesheet_shares')).toBe(0);
    // Another account is not limited by the owner's failures.
    expect((await grant(items('view'), t.emails.employee, stranger.cookie)).status).toBe(201);
    // The window passes.
    t.clock.advanceSeconds(16 * 60);
    expect((await grant(items('view'))).status).toBe(201);
  });

  it('refuses a second active share for the same grantee', async () => {
    await granted(items('view'));
    const again = await grant(items('edit'));
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('share_exists');
    expect(shareRows()).toHaveLength(1);
  });

  it('changes items by revoking and replacing the row in one step, audited with before and after', async () => {
    const first = await granted(items('view'));
    t.clock.advanceSeconds(60);
    const changed = await t.request('PUT', `/api/shares/${first}`, { cookie: owner, body: { items: items('edit', true) } });
    expect(changed.status, JSON.stringify(changed.body)).toBe(200);
    expect(changed.body.changed).toBe(true);
    const second = changed.body.share.id as string;
    expect(second).not.toBe(first);
    expect(changed.body.share).toMatchObject({ items: items('edit', true), created_at: '2026-09-29T20:01:00Z' });
    expect(shareRows()).toEqual([
      expect.objectContaining({ id: first, timesheets_scope: 'view', revoked: 1, revoked_by: t.userIds.employee }),
      expect.objectContaining({ id: second, timesheets_scope: 'edit', ot_read: 1, pdf_download: 0, revoked: 0, created_by: t.userIds.employee }),
    ]);
    expect(shareAudits().at(-1)).toEqual({
      operation: 'share.change',
      actor_user_id: t.userIds.employee,
      owner_user_id: t.userIds.employee,
      entity_type: 'timesheet_share',
      entity_id: second,
      reason: null,
      before_json: JSON.stringify({ share_id: first, timesheets: 'view', ot_read: false, pdf_download: false }),
      after_json: JSON.stringify({ share_id: second, timesheets: 'edit', ot_read: true, pdf_download: false }),
    });
    // The replaced id is no longer a share; the same items again change nothing.
    expect((await t.request('PUT', `/api/shares/${first}`, { cookie: owner, body: { items: items('view') } })).status).toBe(404);
    const audits = shareAudits().length;
    const same = await t.request('PUT', `/api/shares/${second}`, { cookie: owner, body: { items: items('edit', true) } });
    expect(same.status).toBe(200);
    expect(same.body).toMatchObject({ changed: false, share: { id: second } });
    expect(shareAudits()).toHaveLength(audits);
    const empty = await t.request('PUT', `/api/shares/${second}`, { cookie: owner, body: { items: items('none') } });
    expect(empty.status).toBe(422);
    expect(empty.body.error.code).toBe('no_share_items');
    // Only the owner changes a share: the grantee, a stranger and an administrator get 404.
    for (const cookie of [grantee.cookie, stranger.cookie, admin]) {
      const response = await t.request('PUT', `/api/shares/${second}`, { cookie, body: { items: items('view') } });
      expect(response.status).toBe(404);
    }
    expect(shareRows()).toHaveLength(2);
  });

  it('lets the owner revoke, effective on the next request, audited once', async () => {
    const id = await granted(items('view'));
    expect((await t.request('GET', shared('/calendar'), { cookie: grantee.cookie })).status).toBe(200);
    const revoked = await t.request('POST', `/api/shares/${id}/revoke`, { cookie: owner, body: {} });
    expect(revoked.status, JSON.stringify(revoked.body)).toBe(200);
    expect(revoked.body).toEqual({ revoked: { id, role: 'owner', revoked_at: '2026-09-29T20:00:00Z' } });
    const next = await t.request('GET', shared('/calendar'), { cookie: grantee.cookie });
    expect(next.status).toBe(404);
    expect(next.body.error.code).toBe('not_found');
    expect(shareRows()).toEqual([expect.objectContaining({ id, revoked: 1, revoked_by: t.userIds.employee })]);
    expect(shareAudits().at(-1)).toMatchObject({
      operation: 'share.revoke',
      actor_user_id: t.userIds.employee,
      owner_user_id: t.userIds.employee,
      entity_id: id,
      after_json: JSON.stringify({ revoked_by_role: 'owner' }),
    });
    expect((await t.request('POST', `/api/shares/${id}/revoke`, { cookie: owner, body: {} })).status).toBe(404);
    expect(shareAudits().filter((row) => row.operation === 'share.revoke')).toHaveLength(1);
    expect((await t.request('GET', '/api/shares', { cookie: grantee.cookie })).body.received).toEqual([]);
  });

  it('lets the grantee leave, attributed to the grantee in the owner audit', async () => {
    const id = await granted(items('edit'));
    const left = await t.request('POST', `/api/shares/${id}/revoke`, { cookie: grantee.cookie, body: {} });
    expect(left.status).toBe(200);
    expect(left.body.revoked.role).toBe('grantee');
    expect((await t.request('GET', shared('/calendar'), { cookie: grantee.cookie })).status).toBe(404);
    expect(shareRows()).toEqual([expect.objectContaining({ id, revoked: 1, revoked_by: grantee.id })]);
    expect(shareAudits().at(-1)).toMatchObject({
      operation: 'share.revoke',
      actor_user_id: grantee.id,
      owner_user_id: t.userIds.employee,
      after_json: JSON.stringify({ revoked_by_role: 'grantee' }),
    });
    expect((await t.request('GET', '/api/shares', { cookie: owner })).body.given).toEqual([]);
  });

  it('refuses revocation by anyone but the two parties, and never re-shares', async () => {
    const id = await granted(ALL_ITEMS);
    for (const cookie of [stranger.cookie, admin]) {
      expect((await t.request('POST', `/api/shares/${id}/revoke`, { cookie, body: {} })).status).toBe(404);
    }
    // The grantee has no route that grants the owner's timesheets: the shares API acts on the caller's own.
    for (const [method, path, body] of [
      ['POST', shared('/shares'), { grantee_email: stranger.email, items: items('view') }],
      ['GET', shared('/shares'), undefined],
      ['PUT', shared(`/shares/${id}`), { items: items('view') }],
      ['POST', shared(`/shares/${id}/revoke`), {}],
    ] as const) {
      const response = await t.request(method, path, { cookie: grantee.cookie, ...(body === undefined ? {} : { body }) });
      expect(response.status, `${method} ${path}`).toBe(404);
    }
    const withOwner = await t.request('POST', '/api/shares', {
      cookie: grantee.cookie,
      body: { grantee_email: stranger.email, items: items('view'), owner_user_id: t.userIds.employee },
    });
    expect(withOwner.status).toBe(422);
    // A share the grantee gives covers the grantee's own timesheets only, never the owner's.
    expect((await grant(items('view'), stranger.email, grantee.cookie)).status).toBe(201);
    expect((await t.request('GET', shared('/calendar'), { cookie: stranger.cookie })).status).toBe(404);
    expect((await t.request('GET', shared('/calendar', grantee.id), { cookie: stranger.cookie })).status).toBe(200);
    expect(
      shareRows().filter((row) => row.revoked === 0).map((row) => [row.owner_user_id, row.grantee_user_id]),
    ).toEqual([
      [t.userIds.employee, grantee.id],
      [grantee.id, stranger.id],
    ]);
  });
});

describe('access through /api/shared (AC-16)', () => {
  it('shows a view grantee the owner timesheet, never the grantee own data', async () => {
    const ownerSessionId = await ownerSession('2026-09-21');
    const granteeSessionId = await ownerSession('2026-09-22', grantee.cookie);
    await granted(items('view'));
    const sheet = await t.request('GET', shared(`/timesheets/${PAYROLL}`), { cookie: grantee.cookie });
    expect(sheet.status).toBe(200);
    const ids = sheet.body.days.flatMap((day: { sessions: Array<{ id: string }> }) => day.sessions.map((session) => session.id));
    expect(ids).toEqual([ownerSessionId]);
    expect(JSON.stringify(sheet.body)).not.toContain(granteeSessionId);
    const session = await t.request('GET', shared(`/sessions/${ownerSessionId}`), { cookie: grantee.cookie });
    expect(session.status).toBe(200);
    expect(session.body.session.id).toBe(ownerSessionId);
    for (const path of ['/calendar', '/periods/current', '/periods?from=2026-09-14&to=2026-09-27', '/days/2026-09-21', '/policies']) {
      expect((await t.request('GET', shared(path), { cookie: grantee.cookie })).status, path).toBe(200);
    }
    // The grantee's own routes stay the grantee's own.
    const own = await t.request('GET', `/api/timesheets/${PAYROLL}`, { cookie: grantee.cookie });
    expect(JSON.stringify(own.body)).not.toContain(ownerSessionId);
  });

  it('lets an edit grantee write into the owner timesheet, attributed to the grantee; a view grantee gets 403 grant_scope', async () => {
    const id = await granted(items('view'));
    const before = personalState();
    const refused = await t.request('POST', shared('/days/2026-09-21/sessions'), { cookie: grantee.cookie, body: sessionBody('2026-09-21') });
    expect(refused.status).toBe(403);
    expect(refused.body.error.code).toBe('grant_scope');
    for (const [method, path, body] of [
      ['PUT', '/days/2026-09-22', { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' }],
      ['POST', '/days/batch', { mode: 'commit', entries: [{ work_date: '2026-09-23', category: 'Sick', expected_version: null }] }],
    ] as const) {
      const response = await t.request(method, shared(path), { cookie: grantee.cookie, body });
      expect(response.status, path).toBe(403);
      expect(response.body.error.code).toBe('grant_scope');
    }
    expect(personalState()).toEqual(before);

    expect((await t.request('PUT', `/api/shares/${id}`, { cookie: owner, body: { items: items('edit') } })).status).toBe(200);
    const created = await t.request('POST', shared('/days/2026-09-21/sessions'), { cookie: grantee.cookie, body: sessionBody('2026-09-21') });
    expect(created.status, JSON.stringify(created.body)).toBe(201);
    const sessionId = created.body.session.id as string;
    const day = await t.request('PUT', shared('/days/2026-09-22'), {
      cookie: grantee.cookie,
      body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' },
    });
    expect(day.status, JSON.stringify(day.body)).toBe(200);
    const batch = await t.request('POST', shared('/days/batch'), {
      cookie: grantee.cookie,
      body: { mode: 'commit', entries: [{ work_date: '2026-09-23', category: 'Sick', expected_version: null }] },
    });
    expect(batch.status, JSON.stringify(batch.body)).toBe(200);
    const update = await t.request('PUT', shared(`/sessions/${sessionId}`), {
      cookie: grantee.cookie,
      body: { ...sessionBody('2026-09-21', '08:30', '17:00'), expected_version: 1 },
    });
    expect(update.status, JSON.stringify(update.body)).toBe(200);
    expect(t.db.prepare('SELECT DISTINCT user_id FROM work_sessions UNION SELECT DISTINCT user_id FROM day_entries').pluck().all()).toEqual([
      t.userIds.employee,
    ]);
    const writes = t.db
      .prepare(
        `SELECT DISTINCT actor_user_id, owner_user_id FROM audit_events
          WHERE entity_type IN ('work_session', 'day_entry')`,
      )
      .all();
    expect(writes).toEqual([{ actor_user_id: grantee.id, owner_user_id: t.userIds.employee }]);
    // The owner sees the change on the owner's own route.
    const ownerDay = await t.request('GET', '/api/days/2026-09-22', { cookie: owner });
    expect(ownerDay.body.entry.category).toBe('Vacation');
    const deleted = await t.request('DELETE', shared(`/sessions/${sessionId}`), { cookie: grantee.cookie, body: { expected_version: 2 } });
    expect(deleted.status, JSON.stringify(deleted.body)).toBe(200);
  });

  it('never offers Clock in/out, sign-off, signatures, review, settings, leave, evidence, history or policies to a full grantee', async () => {
    postCredit(
      { db: t.db, clock: t.clock },
      { userId: t.userIds.employee, sourceKey: 'opening', minutes: 600, workDate: '2026-09-21', actorUserId: null, origin: 'system' },
    );
    await granted(ALL_ITEMS);
    const before = personalState();
    const never: Array<[string, string, unknown?]> = [
      ['POST', '/clock/in', { input_zone: LA }],
      ['POST', '/clock/out', { breaks: [], breaks_confirmed: true, expected_version: 1 }],
      ['POST', '/policies', {}],
      ['POST', '/policies/preview', {}],
      ['GET', `/timesheets/${PAYROLL}/review`],
      ['POST', `/timesheets/${PAYROLL}/signoff`, {}],
      ['POST', `/timesheets/${PAYROLL}/revisions`, {}],
      ['POST', `/timesheets/${PAYROLL}/late-review`, {}],
      ['GET', `/timesheets/${PAYROLL}/finalization`],
      ['POST', '/revisions/00000000-0000-4000-8000-000000000000/resend', {}],
      ['GET', '/deliveries'],
      ['POST', '/deliveries/00000000-0000-4000-8000-000000000000/decision', { decision: 'mark_delivered' }],
      ['GET', '/settings/submission'],
      ['POST', '/settings/submission', {}],
      ['POST', '/settings/submission/auto-image/authorize', {}],
      ['GET', '/signatures/current'],
      ['GET', '/ot/leave'],
      ['POST', '/ot/leave', {}],
      ['POST', '/ot/leave/x/consume', {}],
      ['POST', '/ot/leave/x/cancel', {}],
      ['POST', '/ot/leave/x/reverse', {}],
      ['GET', '/ot/evidence.csv?from=2026-09-14&to=2026-09-27'],
      ['GET', '/history'],
      ['GET', '/auth/me'],
      ['GET', '/admin/users'],
    ];
    for (const [method, path, body] of never) {
      const response = await t.request(method, shared(path), { cookie: grantee.cookie, ...(body === undefined ? {} : { body }) });
      expect(response.status, `${method} ${path}`).toBe(404);
      expect(response.body.error.code).toBe('not_found');
    }
    expect(personalState()).toEqual(before);
  });

  it('requires every object id to belong to the owner', async () => {
    const strangerSession = await ownerSession('2026-09-22', stranger.cookie);
    const granteeSession = await ownerSession('2026-09-23', grantee.cookie);
    await granted(items('edit'));
    const before = personalState();
    for (const id of [strangerSession, granteeSession, '00000000-0000-4000-8000-000000000000']) {
      for (const [method, body] of [
        ['GET', undefined],
        ['PUT', { ...sessionBody('2026-09-22', '07:00', '17:00'), expected_version: 1, reason: 'swap attempt' }],
        ['DELETE', { expected_version: 1, reason: 'swap attempt' }],
      ] as const) {
        const response = await t.request(method, shared(`/sessions/${id}`), { cookie: grantee.cookie, ...(body === undefined ? {} : { body }) });
        expect(response.status, `${method} ${id}`).toBe(404);
      }
    }
    expect(personalState()).toEqual(before);
  });

  it('suspends access while the owner is deactivated, without revoking, and restores it on reactivation', async () => {
    await granted(items('view'));
    expect((await t.request('POST', `/api/admin/users/${t.userIds.employee}/deactivate`, { cookie: admin, body: {} })).status).toBe(200);
    expect((await t.request('GET', shared('/calendar'), { cookie: grantee.cookie })).status).toBe(404);
    expect((await t.request('GET', '/api/shares', { cookie: grantee.cookie })).body.received).toEqual([]);
    expect(shareRows()).toEqual([expect.objectContaining({ revoked: 0 })]);
    expect((await t.request('POST', `/api/admin/users/${t.userIds.employee}/reactivate`, { cookie: admin, body: {} })).status).toBe(200);
    expect((await t.request('GET', shared('/calendar'), { cookie: grantee.cookie })).status).toBe(200);
  });

  it('suspends access while the grantee is deactivated and restores it after reactivation and a new sign-in', async () => {
    await granted(items('view'));
    expect((await t.request('POST', `/api/admin/users/${grantee.id}/deactivate`, { cookie: admin, body: {} })).status).toBe(200);
    expect((await t.request('GET', shared('/calendar'), { cookie: grantee.cookie })).status).toBe(401);
    const given = await t.request('GET', '/api/shares', { cookie: owner });
    expect(given.body.given).toEqual([expect.objectContaining({ grantee: expect.objectContaining({ active: false }) })]);
    expect((await t.request('POST', `/api/admin/users/${grantee.id}/reactivate`, { cookie: admin, body: {} })).status).toBe(200);
    const cookie = await signIn(grantee.email, grantee.password);
    expect((await t.request('GET', shared('/calendar'), { cookie })).status).toBe(200);
  });

  it('applies a change of items on the next request', async () => {
    const id = await granted(items('view'));
    const body = { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' };
    expect((await t.request('PUT', shared('/days/2026-09-22'), { cookie: grantee.cookie, body })).status).toBe(403);
    const toEdit = await t.request('PUT', `/api/shares/${id}`, { cookie: owner, body: { items: items('edit') } });
    expect((await t.request('PUT', shared('/days/2026-09-22'), { cookie: grantee.cookie, body })).status).toBe(200);
    const toOt = await t.request('PUT', `/api/shares/${toEdit.body.share.id}`, { cookie: owner, body: { items: items('none', true) } });
    expect(toOt.status).toBe(200);
    const refused = await t.request('GET', shared('/calendar'), { cookie: grantee.cookie });
    expect(refused.status).toBe(403);
    expect(refused.body.error.code).toBe('grant_scope');
    expect((await t.request('GET', shared('/ot/summary'), { cookie: grantee.cookie })).status).toBe(200);
  });
});

describe('the grant is re-checked inside the write transaction (revocation race)', () => {
  /**
   * An application whose database runs `between` once, at the first transaction a request opens:
   * the guard has already resolved the share, and the write has not started yet.
   */
  function racingApp(between: () => void) {
    let armed = true;
    const db = new Proxy(t.db, {
      get(target, property) {
        if (property === 'transaction') {
          return (work: (...args: never[]) => unknown) => {
            if (armed) {
              armed = false;
              between();
            }
            return target.transaction(work);
          };
        }
        const value: unknown = Reflect.get(target, property, target);
        return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(target) : value;
      },
    }) as Db;
    const app = createApp({ db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
    return async (method: string, path: string, body: unknown) => {
      const response = await app.request(path, {
        method,
        headers: { origin: ORIGIN, cookie: grantee.cookie, 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      return { status: response.status, body: (await response.json()) as { error?: { code: string } } };
    };
  }

  const revokeNow = (id: string) => () =>
    t.db.prepare('UPDATE timesheet_shares SET revoked_by = ?, revoked_at = ? WHERE id = ?').run(t.userIds.employee, '2026-09-29T20:00:00Z', id);

  const writes: Array<[string, string, (sessionId: string) => unknown]> = [
    ['POST', '/days/2026-09-22/sessions', () => sessionBody('2026-09-22')],
    ['PUT', '/days/2026-09-23', () => ({ category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' })],
    ['POST', '/days/batch', () => ({ mode: 'commit', entries: [{ work_date: '2026-09-24', category: 'Sick', expected_version: null }] })],
    ['PUT', '/sessions/:id', () => ({ ...sessionBody('2026-09-21', '08:00', '17:00'), expected_version: 1 })],
    ['DELETE', '/sessions/:id', () => ({ expected_version: 1 })],
  ];

  it.each(writes)('refuses %s %s with 404 and writes nothing when the share is revoked mid-request', async (method, path, body) => {
    const sessionId = await ownerSession('2026-09-21');
    const id = await granted(items('edit'));
    const before = personalState();
    const request = racingApp(revokeNow(id));
    const response = await request(method, shared(path.replace(':id', sessionId)), body(sessionId));
    expect(response.status, JSON.stringify(response.body)).toBe(404);
    expect(response.body.error?.code).toBe('not_found');
    expect({ ...personalState(), shares: [] }).toEqual({ ...before, shares: [] });
  });

  it('refuses a write with 403 grant_scope when the share drops to view mid-request', async () => {
    const id = await granted(items('edit'));
    const before = personalState();
    const request = racingApp(() => {
      t.db.transaction(() => {
        revokeNow(id)();
        t.db
          .prepare(
            `INSERT INTO timesheet_shares (id, owner_user_id, grantee_user_id, timesheets_scope, ot_read, pdf_download, created_by, created_at)
             VALUES ('race-view', ?, ?, 'view', 0, 0, ?, '2026-09-29T20:00:00Z')`,
          )
          .run(t.userIds.employee, grantee.id, t.userIds.employee);
      })();
    });
    const response = await request('PUT', shared('/days/2026-09-23'), { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' });
    expect(response.status).toBe(403);
    expect(response.body.error?.code).toBe('grant_scope');
    expect({ ...personalState(), shares: [] }).toEqual({ ...before, shares: [] });
  });

  it('refuses a write with 404 when the owner is deactivated mid-request', async () => {
    await granted(items('edit'));
    const before = personalState();
    const request = racingApp(() => {
      t.db.prepare("UPDATE users SET status = 'deactivated' WHERE id = ?").run(t.userIds.employee);
    });
    const response = await request('PUT', shared('/days/2026-09-23'), { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' });
    expect(response.status).toBe(404);
    expect(personalState()).toEqual(before);
  });
});

describe('final PDF downloads (pdf_download)', () => {
  let files: FileStore;

  beforeEach(() => {
    files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
  });

  async function finalizedWithPdf(): Promise<string> {
    const settings = await t.request('POST', '/api/settings/submission', {
      cookie: owner,
      body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: [], auto_submit: false },
    });
    expect(settings.status, JSON.stringify(settings.body)).toBe(201);
    await ownerSession('2026-09-15');
    saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
    const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: owner });
    expect(review.status, JSON.stringify(review.body)).toBe(200);
    const signed = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
      cookie: owner,
      body: {
        expected_version: review.body.expected_version,
        reviewed_hash: review.body.payload_hash,
        signer_name: OWNER_NAME,
        incomplete_evidence_acknowledged: true,
      },
    });
    expect(signed.status, JSON.stringify(signed.body)).toBe(201);
    const handler = createPdfJobHandler({ db: t.db, clock: t.clock, files });
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: handler } });
    return signed.body.revision.id as string;
  }

  async function download(path: string, cookie: string) {
    const response = await t.request('GET', path, { cookie });
    return response;
  }

  it('sends the owner PDF to a grantee with the PDF item and audits every download', async () => {
    const revisionId = await finalizedWithPdf();
    await granted(items('none', false, true));
    const ownerCopy = await download(`/api/revisions/${revisionId}/pdf`, owner);
    expect(ownerCopy.status).toBe(200);
    expect(shareAudits()).toHaveLength(1);
    const copy = await download(shared(`/revisions/${revisionId}/pdf`), grantee.cookie);
    expect(copy.status).toBe(200);
    expect(copy.headers.get('content-type')).toBe('application/pdf');
    expect(copy.headers.get('cache-control')).toBe('no-store');
    expect(copy.headers.get('content-disposition')).toBe(`attachment; filename="timesheet-${PAYROLL}-r1.pdf"`);
    expect(copy.body).toEqual(ownerCopy.body);
    expect(shareAudits().at(-1)).toEqual({
      operation: 'share.pdf_download',
      actor_user_id: grantee.id,
      owner_user_id: t.userIds.employee,
      entity_type: 'timesheet_revision',
      entity_id: revisionId,
      reason: null,
      before_json: null,
      after_json: JSON.stringify({ payroll_date: PAYROLL, revision_no: 1 }),
    });
    expect((await download(shared(`/revisions/${revisionId}/pdf`), grantee.cookie)).status).toBe(200);
    expect(shareAudits().filter((row) => row.operation === 'share.pdf_download')).toHaveLength(2);
    // The owner's history names the grantee for the download.
    const history = await t.request('GET', '/api/history', { cookie: owner });
    const event = (history.body.audit_events as Array<Record<string, unknown>>).find((row) => row.operation === 'share.pdf_download');
    expect(event).toMatchObject({ via_share: true, actor_display_name: 'Synthetic Grantee', actor_user_id: null });
  });

  it('refuses the download without the PDF item, without a share and after revocation, and audits nothing', async () => {
    const revisionId = await finalizedWithPdf();
    const id = await granted(items('edit', true, false));
    const audits = count('SELECT count(*) FROM audit_events');
    const scoped = await download(shared(`/revisions/${revisionId}/pdf`), grantee.cookie);
    expect(scoped.status).toBe(403);
    expect(scoped.body.error.code).toBe('grant_scope');
    expect((await download(shared(`/revisions/${revisionId}/pdf`), stranger.cookie)).status).toBe(404);
    expect((await download(shared(`/revisions/${revisionId}/pdf`), admin)).status).toBe(404);
    expect((await t.request('GET', shared(`/revisions/${revisionId}/pdf`))).status).toBe(401);
    expect((await t.request('POST', `/api/shares/${id}/revoke`, { cookie: owner, body: {} })).status).toBe(200);
    const auditsAfterRevoke = count('SELECT count(*) FROM audit_events');
    expect(auditsAfterRevoke).toBe(audits + 1);
    expect((await download(shared(`/revisions/${revisionId}/pdf`), grantee.cookie)).status).toBe(404);
    expect(count('SELECT count(*) FROM audit_events')).toBe(auditsAfterRevoke);
  });

  it('finds only the owner revisions: another owner revision id is 404 for a PDF grantee', async () => {
    const revisionId = await finalizedWithPdf();
    // The stranger shares PDFs with the grantee too, but the owner's revision is not the stranger's.
    await granted(items('none', false, true), grantee.email);
    expect((await grant(items('none', false, true), grantee.email, stranger.cookie)).status).toBe(201);
    const response = await download(shared(`/revisions/${revisionId}/pdf`, stranger.id), grantee.cookie);
    expect(response.status).toBe(404);
    expect(shareAudits().filter((row) => row.operation === 'share.pdf_download')).toHaveLength(0);
  });
});

describe('revision status list GET /api/revisions (owner-only, write-free)', () => {
  it('lists the owner revisions as status metadata only, writes nothing and is empty for another user', async () => {
    const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
    expect((await t.request('GET', '/api/revisions', { cookie: owner })).body).toEqual({ revisions: [] });
    const settings = await t.request('POST', '/api/settings/submission', {
      cookie: owner,
      body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: [], auto_submit: false },
    });
    expect(settings.status).toBe(201);
    await ownerSession('2026-09-15');
    saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
    const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: owner });
    const signed = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
      cookie: owner,
      body: {
        expected_version: review.body.expected_version,
        reviewed_hash: review.body.payload_hash,
        signer_name: OWNER_NAME,
        incomplete_evidence_acknowledged: true,
      },
    });
    expect(signed.status).toBe(201);
    const pending = await t.request('GET', '/api/revisions', { cookie: owner });
    expect(pending.body.revisions).toEqual([expect.objectContaining({ pdf_state: null, delivery_state: null })]);
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) } });
    // A send without a sender address ends its attempt failed_permanent; the adapter is never reached.
    const outbound = {
      mode: 'capture' as const,
      send: () => Promise.reject(new Error('The synthetic adapter must not be reached')),
    };
    const send = createSendJobHandler({ db: t.db, clock: t.clock, files, outbound, senderAddress: null });
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-send', handlers: { send_email: send } });
    const before = personalState();
    const list = await t.request('GET', '/api/revisions', { cookie: owner });
    expect(list.status).toBe(200);
    expect(list.headers.get('cache-control')).toBe('no-store');
    expect(list.body).toEqual({
      revisions: [
        {
          id: signed.body.revision.id,
          payroll_date: PAYROLL,
          revision_no: 1,
          revision_kind: 'original',
          origin: 'employee',
          review_state: 'signed',
          supersedes_revision_id: null,
          finalized_at: '2026-09-29T20:00:00Z',
          pdf_state: 'ready',
          delivery_state: 'failed_permanent',
        },
      ],
    });
    const text = JSON.stringify(list.body);
    for (const secret of ['payload', 'sha256', 'payroll@example.invalid', 'signer', 'signature', 'envelope', OWNER_NAME]) {
      expect(text).not.toContain(secret);
    }
    expect(personalState()).toEqual(before);
    expect((await t.request('GET', '/api/revisions', { cookie: stranger.cookie })).body).toEqual({ revisions: [] });
    expect((await t.request('GET', '/api/revisions', { cookie: admin })).body).toEqual({ revisions: [] });
    expect((await t.request('GET', '/api/revisions')).status).toBe(401);
    for (const method of ['POST', 'PUT', 'DELETE']) {
      expect((await t.request(method, '/api/revisions', { cookie: owner, body: {} })).status, method).toBe(404);
    }

    // Through a share: timesheets or PDFs list the same metadata; OT alone does not.
    const id = await granted(items('view'));
    const viaView = await t.request('GET', shared('/revisions'), { cookie: grantee.cookie });
    expect(viaView.status).toBe(200);
    expect(viaView.body).toEqual(list.body);
    const pdfOnly = await t.request('PUT', `/api/shares/${id}`, { cookie: owner, body: { items: items('none', false, true) } });
    expect((await t.request('GET', shared('/revisions'), { cookie: grantee.cookie })).body).toEqual(list.body);
    await t.request('PUT', `/api/shares/${pdfOnly.body.share.id}`, { cookie: owner, body: { items: items('none', true) } });
    const otOnly = await t.request('GET', shared('/revisions'), { cookie: grantee.cookie });
    expect(otOnly.status).toBe(403);
    expect(otOnly.body.error.code).toBe('grant_scope');
  });
});

describe('administrator: list and revoke, never create or use', () => {
  it('lists every share with names, items and instants, and revokes one with a reason', async () => {
    const first = await granted(items('view'));
    t.clock.advanceSeconds(60);
    await granted(items('none', true, true), stranger.email);
    const list = await t.request('GET', '/api/admin/shares', { cookie: admin });
    expect(list.status).toBe(200);
    expect(list.body.shares).toEqual([
      {
        id: expect.any(String),
        owner: { id: t.userIds.employee, display_name: OWNER_NAME },
        grantee: { id: stranger.id, display_name: 'Synthetic Stranger' },
        items: items('none', true, true),
        created_at: '2026-09-29T20:01:00Z',
        revoked_at: null,
        revoked_by_role: null,
      },
      {
        id: first,
        owner: { id: t.userIds.employee, display_name: OWNER_NAME },
        grantee: { id: grantee.id, display_name: 'Synthetic Grantee' },
        items: items('view'),
        created_at: '2026-09-29T20:00:00Z',
        revoked_at: null,
        revoked_by_role: null,
      },
    ]);
    const revoked = await t.request('POST', `/api/admin/shares/${first}/revoke`, { cookie: admin, body: { reason: 'Synthetic security reason' } });
    expect(revoked.status, JSON.stringify(revoked.body)).toBe(200);
    expect(revoked.body.share).toMatchObject({ id: first, revoked_at: '2026-09-29T20:01:00Z', revoked_by_role: 'admin' });
    expect((await t.request('GET', shared('/calendar'), { cookie: grantee.cookie })).status).toBe(404);
    expect(shareAudits().at(-1)).toMatchObject({
      operation: 'share.revoke',
      actor_user_id: t.userIds.admin,
      owner_user_id: t.userIds.employee,
      entity_id: first,
      reason: 'Synthetic security reason',
      after_json: JSON.stringify({ revoked_by_role: 'admin' }),
    });
    expect(shareRows().find((row) => row.id === first)).toMatchObject({ revoked: 1, revoked_by: t.userIds.admin, revoke_reason: 'Synthetic security reason' });
    expect((await t.request('POST', `/api/admin/shares/${first}/revoke`, { cookie: admin, body: {} })).status).toBe(404);
    // The list carries no timesheet content and no email address.
    const text = JSON.stringify((await t.request('GET', '/api/admin/shares', { cookie: admin })).body);
    expect(text).not.toContain('@example.invalid');
  });

  it('refuses an employee, an anonymous caller and every create attempt', async () => {
    const id = await granted(items('view'));
    expect((await t.request('GET', '/api/admin/shares', { cookie: owner })).status).toBe(403);
    expect((await t.request('POST', `/api/admin/shares/${id}/revoke`, { cookie: grantee.cookie, body: {} })).status).toBe(403);
    expect((await t.request('GET', '/api/admin/shares')).status).toBe(401);
    const create = await t.request('POST', '/api/admin/shares', {
      cookie: admin,
      body: { owner_user_id: t.userIds.employee, grantee_email: t.emails.admin, items: items('view') },
    });
    expect(create.status).toBe(404);
    // The administrator's own POST /api/shares shares the administrator's own timesheets only.
    expect((await t.request('GET', shared('/calendar'), { cookie: admin })).status).toBe(404);
    expect(shareRows()).toHaveLength(1);
  });

  it('lets an administrator use a share only like any grantee, once the owner grants one', async () => {
    expect((await t.request('GET', shared('/calendar'), { cookie: admin })).status).toBe(404);
    await granted(items('view'), t.emails.admin);
    expect((await t.request('GET', shared('/calendar'), { cookie: admin })).status).toBe(200);
    const write = await t.request('PUT', shared('/days/2026-09-22'), { cookie: admin, body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes: '' } });
    expect(write.status).toBe(403);
  });
});
