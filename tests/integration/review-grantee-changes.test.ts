import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { canonicalHash } from '../../src/domain/canonical.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-C-01 (FR-17, AC-16, WP3-REQ C/E/G): the owner's Review shows "N day(s) last changed by <grantee>"
 * for the period under review, derived from the audit events written through a grant since the
 * owner's previous finalization of that period (since the period started when there is none). It is
 * owner-only, read-only and outside the snapshot: the payload and its hash never carry it. Today is
 * 2026-09-29 (LA 13:00): the current period is 2026-09-14 ... 2026-09-27, payroll date 2026-10-02.
 * Every account is synthetic.
 */

const PAYROLL = '2026-10-02';
const DAY_A = '2026-09-22';
const DAY_B = '2026-09-23';
const DAY_C = '2026-09-24';
const GRANTEE_NAME = 'Synthetic Grantee';
const SECOND_NAME = 'Synthetic Second Grantee';

interface Account {
  id: string;
  cookie: string;
}

let t: TestContext;
let owner: string;
let admin: string;
let grantee: Account;
let second: Account;

async function account(email: string, displayName: string): Promise<Account> {
  const password = randomBytes(18).toString('base64url');
  const id = await createUser(t.db, t.clock, { email, displayName, role: 'employee', password, calendarId: t.calendarId }, t.userIds.admin);
  const login = await t.request('POST', '/api/auth/login', { body: { email, password } });
  expect(login.status).toBe(200);
  return { id, cookie: login.headers.get('set-cookie')?.split(';')[0] ?? '' };
}

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  owner = await t.login('employee');
  admin = await t.login('admin');
  grantee = await account('grantee@example.invalid', GRANTEE_NAME);
  second = await account('second@example.invalid', SECOND_NAME);
});

afterEach(() => t.close());

const shared = (path: string) => `/api/shared/${t.userIds.employee}${path}`;
const reviewPath = `/api/timesheets/${PAYROLL}/review`;

async function share(email: string, timesheets: 'view' | 'edit' = 'edit'): Promise<string> {
  const response = await t.request('POST', '/api/shares', {
    cookie: owner,
    body: { grantee_email: email, items: { timesheets, ot_read: false, pdf_download: false } },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.share.id as string;
}

async function granteeDay(who: Account, date: string, notes: string): Promise<void> {
  const current = await t.request('GET', shared(`/days/${date}`), { cookie: who.cookie });
  const version = (current.body.entry?.version as number | undefined) ?? null;
  const response = await t.request('PUT', shared(`/days/${date}`), {
    cookie: who.cookie,
    body: { category: 'Vacation', leave_minutes: 0, wfh: false, notes, expected_version: version },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
}

async function granteeSession(who: Account, date: string): Promise<string> {
  const response = await t.request('POST', shared(`/days/${date}/sessions`), {
    cookie: who.cookie,
    body: { start: la(`${date}T09:00`), end: la(`${date}T17:00`), input_zone: LA, breaks: [], breaks_confirmed: true },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  return response.body.session.id as string;
}

async function ownerDay(date: string, notes: string, reason?: string): Promise<void> {
  const current = await t.request('GET', `/api/days/${date}`, { cookie: owner });
  const version = (current.body.entry?.version as number | undefined) ?? null;
  const response = await t.request('PUT', `/api/days/${date}`, {
    cookie: owner,
    body: { category: 'Worked', leave_minutes: 0, wfh: false, notes, expected_version: version, ...(reason === undefined ? {} : { reason }) },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
}

async function review(who = owner) {
  const response = await t.request('GET', reviewPath, { cookie: who });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  return response.body as {
    payload: Record<string, unknown>;
    payload_hash: string;
    expected_version: number;
    grantee_changes: Array<{ display_name: string; days: number; work_dates: string[] }>;
  };
}

/** Recipients and a signature, so that the owner can sign off (synthetic address and image). */
async function readyToSign(): Promise<void> {
  const settings = await t.request('POST', '/api/settings/submission', {
    cookie: owner,
    body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: [], auto_submit: false },
  });
  expect(settings.status, JSON.stringify(settings.body)).toBe(201);
  const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
  saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
}

async function signOff(body: { payload_hash: string; expected_version: number }) {
  return t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
    cookie: owner,
    body: {
      expected_version: body.expected_version,
      reviewed_hash: body.payload_hash,
      signer_name: 'Example Employee',
      incomplete_evidence_acknowledged: true,
    },
  });
}

describe('the owner Review lists the days a grantee changed last (WP3-C-01)', () => {
  it('names the grantee and counts the days whose last change was made through the share', async () => {
    await share('grantee@example.invalid');
    t.clock.advanceSeconds(60);
    await granteeDay(grantee, DAY_A, 'synthetic note from the grantee');
    await granteeSession(grantee, DAY_B);
    const body = await review();
    expect(body.grantee_changes).toEqual([{ display_name: GRANTEE_NAME, days: 2, work_dates: [DAY_A, DAY_B] }]);
    // The server names the grantee, never identifies the account.
    expect(JSON.stringify(body.grantee_changes)).not.toContain(grantee.id);
    expect(JSON.stringify(body.grantee_changes)).not.toContain('@example.invalid');
  });

  it('is empty when only the owner changed the period, and for a share that changed nothing', async () => {
    await share('grantee@example.invalid');
    await ownerDay(DAY_A, 'synthetic owner note');
    expect((await review()).grantee_changes).toEqual([]);
  });

  it('counts a day once even after several grantee changes, and a later owner change clears that day', async () => {
    await share('grantee@example.invalid');
    t.clock.advanceSeconds(60);
    await granteeDay(grantee, DAY_A, 'first');
    t.clock.advanceSeconds(60);
    const sessionId = await granteeSession(grantee, DAY_A);
    expect(sessionId).not.toBe('');
    await granteeDay(grantee, DAY_B, 'second day');
    expect((await review()).grantee_changes).toEqual([{ display_name: GRANTEE_NAME, days: 2, work_dates: [DAY_A, DAY_B] }]);
    t.clock.advanceSeconds(60);
    await ownerDay(DAY_A, 'the owner took this day back');
    expect((await review()).grantee_changes).toEqual([{ display_name: GRANTEE_NAME, days: 1, work_dates: [DAY_B] }]);
    t.clock.advanceSeconds(60);
    await ownerDay(DAY_B, 'and this one');
    expect((await review()).grantee_changes).toEqual([]);
  });

  it('groups by grantee: each day is attributed to whoever changed it last', async () => {
    await share('grantee@example.invalid');
    await share('second@example.invalid');
    t.clock.advanceSeconds(60);
    await granteeDay(grantee, DAY_A, 'by the first');
    await granteeDay(grantee, DAY_B, 'by the first too');
    t.clock.advanceSeconds(60);
    await granteeDay(second, DAY_B, 'then by the second');
    await granteeDay(second, DAY_C, 'only by the second');
    expect((await review()).grantee_changes).toEqual([
      { display_name: GRANTEE_NAME, days: 1, work_dates: [DAY_A] },
      { display_name: SECOND_NAME, days: 2, work_dates: [DAY_B, DAY_C] },
    ]);
  });

  it('ignores a day outside the reviewed period', async () => {
    await share('grantee@example.invalid');
    await granteeDay(grantee, '2026-09-30', 'belongs to the next period');
    expect((await review()).grantee_changes).toEqual([]);
  });

  it('counts only changes since the owner previous finalization of the period', async () => {
    await readyToSign();
    await share('grantee@example.invalid');
    t.clock.advanceSeconds(60);
    await granteeDay(grantee, DAY_A, 'before the sign-off');
    const before = await review();
    expect(before.grantee_changes).toHaveLength(1);
    t.clock.advanceSeconds(60);
    expect((await signOff(before)).status).toBe(201);
    // Signed off: nothing changed since, so nothing is listed.
    expect((await review()).grantee_changes).toEqual([]);
    t.clock.advanceSeconds(60);
    const correction = await t.request('PUT', shared(`/days/${DAY_B}`), {
      cookie: grantee.cookie,
      body: { category: 'Sick', leave_minutes: 0, wfh: false, notes: 'after the sign-off', reason: 'Synthetic correction reason' },
    });
    expect(correction.status, JSON.stringify(correction.body)).toBe(200);
    expect((await review()).grantee_changes).toEqual([{ display_name: GRANTEE_NAME, days: 1, work_dates: [DAY_B] }]);
  });

  it('still lists a change after the share was revoked: the hint comes from the audit, not from the live share', async () => {
    const id = await share('grantee@example.invalid');
    t.clock.advanceSeconds(60);
    await granteeDay(grantee, DAY_A, 'before the revocation');
    expect((await t.request('POST', `/api/shares/${id}/revoke`, { cookie: owner, body: {} })).status).toBe(200);
    expect((await review()).grantee_changes).toEqual([{ display_name: GRANTEE_NAME, days: 1, work_dates: [DAY_A] }]);
  });

  it('does not count an administrator revocation of a share as a change to a day', async () => {
    const id = await share('grantee@example.invalid');
    await share(t.emails.admin);
    t.clock.advanceSeconds(60);
    expect((await t.request('POST', `/api/admin/shares/${id}/revoke`, { cookie: admin, body: {} })).status).toBe(200);
    expect((await review()).grantee_changes).toEqual([]);
  });
});

describe('the hint is owner-only and outside the snapshot (WP3-C-01)', () => {
  it('never reaches a grantee, a shared view or an administrator response', async () => {
    await share('grantee@example.invalid');
    await share(t.emails.admin);
    t.clock.advanceSeconds(60);
    await granteeDay(grantee, DAY_A, 'synthetic note');
    // The review is not a shared route, whatever the share, and the shared timesheet view carries no hint.
    expect((await t.request('GET', shared(`/timesheets/${PAYROLL}/review`), { cookie: grantee.cookie })).status).toBe(404);
    expect((await t.request('GET', shared(`/timesheets/${PAYROLL}/review`), { cookie: admin })).status).toBe(404);
    const view = await t.request('GET', shared(`/timesheets/${PAYROLL}`), { cookie: grantee.cookie });
    expect(view.status).toBe(200);
    for (const [name, response] of [
      ['shared timesheet view', view],
      ['shared day', await t.request('GET', shared(`/days/${DAY_A}`), { cookie: grantee.cookie })],
      ['admin share list', await t.request('GET', '/api/admin/shares', { cookie: admin })],
    ] as const) {
      expect(JSON.stringify(response.body), name).not.toContain('grantee_changes');
    }
    // The administrator's own Review is the administrator's own timesheet: nothing of the owner's.
    const own = await t.request('GET', reviewPath, { cookie: admin });
    expect(own.status).toBe(200);
    expect(own.body.grantee_changes).toEqual([]);
    expect(JSON.stringify(own.body)).not.toContain(GRANTEE_NAME);
    // The owner does see it.
    expect((await review()).grantee_changes).toHaveLength(1);
  });

  it('keeps the hint out of the payload and the hash: the same payload is signed whether or not it is shown', async () => {
    await readyToSign();
    await share('grantee@example.invalid');
    t.clock.advanceSeconds(60);
    await granteeDay(grantee, DAY_A, 'a synthetic grantee edit');
    const shown = await review();
    expect(shown.grantee_changes).toHaveLength(1);
    // Nothing of the hint is inside what is hashed, and the hash is the one of the payload alone.
    expect(JSON.stringify(shown.payload)).not.toContain(GRANTEE_NAME);
    expect(JSON.stringify(shown.payload)).not.toContain('grantee_changes');
    expect(shown.payload_hash).toBe(canonicalHash(shown.payload as Parameters<typeof canonicalHash>[0]));
    const row = t.db.prepare('SELECT id, email, display_name, role, calendar_id FROM users WHERE id = ?').get(t.userIds.employee) as {
      id: string;
      email: string;
      display_name: string;
      role: SessionUser['role'];
      calendar_id: string;
    };
    const subject: SessionUser = { id: row.id, email: row.email, displayName: row.display_name, role: row.role, calendarId: row.calendar_id, sessionId: 'test' };
    const recomputed = buildReviewPayload(t.db, t.clock, subject, PAYROLL);
    expect(recomputed.payloadHash).toBe(shown.payload_hash);
    // Signing with the hash shown next to the hint is accepted, and the stored revision carries no hint.
    const signed = await signOff(shown);
    expect(signed.status, JSON.stringify(signed.body)).toBe(201);
    const stored = t.db
      .prepare('SELECT payload_json, payload_sha256, reviewed_sha256 FROM timesheet_revisions WHERE user_id = ?')
      .get(t.userIds.employee) as { payload_json: string; payload_sha256: string; reviewed_sha256: string };
    expect(stored.payload_sha256).toBe(shown.payload_hash);
    expect(stored.reviewed_sha256).toBe(shown.payload_hash);
    expect(stored.payload_json).not.toContain(GRANTEE_NAME);
    expect(stored.payload_json).not.toContain('grantee_changes');
  });

  it('writes nothing: reading the Review adds no row and no audit event', async () => {
    await share('grantee@example.invalid');
    await granteeDay(grantee, DAY_A, 'synthetic');
    const changes = () => Number(t.db.prepare('SELECT total_changes()').pluck().get());
    const before = changes();
    await review();
    expect(changes()).toBe(before);
  });
});
