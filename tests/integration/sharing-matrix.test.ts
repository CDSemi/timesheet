import { randomBytes } from 'node:crypto';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T13B route-inventory matrix (WP3-REQ C as amended by WP3-REQ2 item 4, AC-16). This file holds
 * its own copy of the authorization matrix on purpose: it enumerates every route the application
 * registers under /api/shared and fails when one has no entry here, so a new shared route needs a
 * reviewed matrix line. For each of the 11 valid item sets it then probes every matrix route as the
 * grantee (allowed: the handler answers; refused: 403 grant_scope), as a non-grantee (404), as an
 * anonymous caller (401) and as the administrator without a share (404), and checks that the routes
 * that are never shared stay absent. Probes that reach a write handler send an empty body, so the
 * handler refuses it with 422 before anything is written. Synthetic data only.
 */

type Item = 'view' | 'edit' | 'ot' | 'pdf' | 'list';
type Scope = 'none' | 'view' | 'edit';
interface ItemSet {
  timesheets: Scope;
  ot_read: boolean;
  pdf_download: boolean;
}

/** Every route under /api/shared/:ownerId and the one share item that allows it. */
const MATRIX: ReadonlyArray<readonly [method: string, path: string, item: Item]> = [
  ['GET', '/calendar', 'view'],
  ['GET', '/periods/current', 'view'],
  ['GET', '/periods', 'view'],
  ['GET', '/timesheets/:payrollDate', 'view'],
  ['GET', '/days/:workDate', 'view'],
  ['GET', '/sessions/:id', 'view'],
  ['GET', '/policies', 'view'],
  ['PUT', '/days/:workDate', 'edit'],
  ['POST', '/days/:workDate/sessions', 'edit'],
  ['PUT', '/sessions/:id', 'edit'],
  ['DELETE', '/sessions/:id', 'edit'],
  ['POST', '/days/batch', 'edit'],
  ['GET', '/ot/summary', 'ot'],
  ['GET', '/ot/ledger', 'ot'],
  ['GET', '/revisions/pending-lines', 'ot'],
  ['GET', '/revisions', 'list'],
  ['GET', '/revisions/:id/pdf', 'pdf'],
];

/** Personal routes that no share item ever reaches (WP3-REQ C "never" rows). */
const NEVER: ReadonlyArray<readonly [method: string, path: string]> = [
  ['POST', '/clock/in'],
  ['POST', '/clock/out'],
  ['POST', '/policies'],
  ['POST', '/policies/preview'],
  ['GET', '/timesheets/2026-10-02/review'],
  ['POST', '/timesheets/2026-10-02/signoff'],
  ['POST', '/timesheets/2026-10-02/revisions'],
  ['POST', '/timesheets/2026-10-02/late-review'],
  ['GET', '/timesheets/2026-10-02/finalization'],
  ['POST', '/revisions/:revision/resend'],
  ['GET', '/deliveries'],
  ['POST', '/deliveries/:revision/decision'],
  ['GET', '/settings/submission'],
  ['GET', '/settings/submission/versions'],
  ['POST', '/settings/submission'],
  ['POST', '/settings/submission/preview'],
  ['POST', '/settings/submission/auto-image/authorize'],
  ['POST', '/settings/submission/auto-image/revoke'],
  ['GET', '/signatures/current'],
  ['POST', '/signatures'],
  // The owner's own workbook import (WP4-T09, F-1): no share item ever reaches it.
  ['GET', '/imports'],
  ['POST', '/imports'],
  ['GET', '/imports/:revision'],
  ['POST', '/imports/:revision/commit'],
  ['GET', '/ot/leave'],
  ['POST', '/ot/leave'],
  ['POST', '/ot/leave/x/consume'],
  ['POST', '/ot/leave/x/cancel'],
  ['POST', '/ot/leave/x/reverse'],
  ['GET', '/ot/evidence.csv?from=2026-09-14&to=2026-09-27'],
  ['GET', '/history'],
  ['GET', '/shares'],
  ['POST', '/shares'],
  ['GET', '/auth/me'],
  ['POST', '/auth/logout'],
];

/** The production inventory outside the sharing feature, as recorded before WP3-T13B (method, path, handlers). */
const SELF_ONLY_BEFORE = [
  'ALL /* 1',
  'ALL /api/* 5',
  'ALL /api/admin/* 1',
  'DELETE /api/sessions/:id 2',
  'GET /api/admin/automation 1',
  'GET /api/admin/operations 1',
  'GET /api/admin/submissions 1',
  'GET /api/admin/users 1',
  'GET /api/auth/me 2',
  'GET /api/auth/setup 1',
  'GET /api/calendar 2',
  'GET /api/days/:workDate 2',
  'GET /api/deliveries 2',
  'GET /api/health 1',
  'GET /api/history 2',
  'GET /api/ot/evidence.csv 2',
  'GET /api/ot/leave 2',
  'GET /api/ot/ledger 2',
  'GET /api/ot/summary 2',
  'GET /api/periods 2',
  'GET /api/periods/current 2',
  'GET /api/policies 2',
  'GET /api/ready 1',
  'GET /api/revisions/:id/pdf 2',
  'GET /api/revisions/pending-lines 2',
  'GET /api/sessions/:id 2',
  'GET /api/settings/submission 2',
  'GET /api/settings/submission/versions 2',
  'GET /api/settings/submission/versions/:id 2',
  'GET /api/signatures/:id 2',
  'GET /api/signatures/current 2',
  'GET /api/timesheets/:payrollDate 2',
  'GET /api/timesheets/:payrollDate/finalization 2',
  'GET /api/timesheets/:payrollDate/review 2',
  'PATCH /api/admin/users/:id 1',
  'POST /api/admin/calendar/import/commit 1',
  'POST /api/admin/calendar/import/preview 1',
  'POST /api/admin/payroll-exceptions 1',
  'POST /api/admin/users 1',
  'POST /api/admin/users/:id/deactivate 1',
  'POST /api/admin/users/:id/reactivate 1',
  'POST /api/auth/bootstrap 1',
  'POST /api/auth/login 1',
  'POST /api/auth/logout 2',
  'POST /api/clock/in 2',
  'POST /api/clock/out 2',
  'POST /api/days/:workDate/sessions 2',
  'POST /api/days/batch 2',
  'POST /api/deliveries/:id/decision 2',
  'POST /api/ot/leave 2',
  'POST /api/ot/leave/:id/cancel 2',
  'POST /api/ot/leave/:id/consume 2',
  'POST /api/ot/leave/:id/reverse 2',
  'POST /api/policies 2',
  'POST /api/policies/preview 2',
  'POST /api/revisions/:id/resend 2',
  'POST /api/settings/submission 2',
  'POST /api/settings/submission/auto-image/authorize 2',
  'POST /api/settings/submission/auto-image/revoke 2',
  'POST /api/settings/submission/preview 2',
  'POST /api/signatures 4',
  'POST /api/timesheets/:payrollDate/late-review 2',
  'POST /api/timesheets/:payrollDate/revisions 2',
  'POST /api/timesheets/:payrollDate/signoff 2',
  'PUT /api/admin/automation/activation 1',
  'PUT /api/days/:workDate 2',
  'PUT /api/sessions/:id 2',
];

/** Routes the sharing feature adds outside /api/shared: the shares API, the admin list/revoke and the status list. */
const SHARING_ADDED = [
  'GET /api/admin/shares 1',
  'GET /api/revisions 2',
  'GET /api/shares 2',
  'POST /api/admin/shares/:id/revoke 1',
  'POST /api/shares 2',
  'POST /api/shares/:id/revoke 2',
  'PUT /api/shares/:id 2',
];

/** The owner's own workbook import (WP4-T09, F-1): self-only routes, never reachable under /api/shared. */
const IMPORTS_ADDED = ['GET /api/imports 2', 'GET /api/imports/:id 2', 'POST /api/imports 4', 'POST /api/imports/:id/commit 2'];

const ITEM_SETS: ItemSet[] = (['none', 'view', 'edit'] as const).flatMap((timesheets) =>
  [false, true].flatMap((otRead) =>
    [false, true]
      .filter((pdf) => timesheets !== 'none' || otRead || pdf)
      .map((pdf) => ({ timesheets, ot_read: otRead, pdf_download: pdf })),
  ),
);

function allows(set: ItemSet, item: Item): boolean {
  switch (item) {
    case 'view':
      return set.timesheets !== 'none';
    case 'edit':
      return set.timesheets === 'edit';
    case 'ot':
      return set.ot_read;
    case 'pdf':
      return set.pdf_download;
    case 'list':
      return set.timesheets !== 'none' || set.pdf_download;
  }
}

const label = (set: ItemSet) => `timesheets=${set.timesheets} ot=${set.ot_read} pdf=${set.pdf_download}`;

let t: TestContext;
let app: ReturnType<typeof createApp>;
let owner: string;
let admin: string;
let grantee: string;
let stranger: string;
let sessionId: string;
let revisionId: string;
let shareId: string | null = null;

async function signIn(email: string, password: string): Promise<string> {
  const response = await t.request('POST', '/api/auth/login', { body: { email, password } });
  expect(response.status).toBe(200);
  return response.headers.get('set-cookie')?.split(';')[0] ?? '';
}

async function account(email: string, displayName: string): Promise<string> {
  const password = randomBytes(18).toString('base64url');
  await createUser(t.db, t.clock, { email, displayName, role: 'employee', password, calendarId: t.calendarId }, t.userIds.admin);
  return signIn(email, password);
}

beforeAll(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
  owner = await t.login('employee');
  admin = await t.login('admin');
  grantee = await account('grantee@example.invalid', 'Synthetic Grantee');
  stranger = await account('stranger@example.invalid', 'Synthetic Stranger');
  // The owner's data: one session and a finalized revision whose final PDF is ready.
  const created = await t.request('POST', '/api/days/2026-09-21/sessions', {
    cookie: owner,
    body: { start: la('2026-09-21T09:00'), end: la('2026-09-21T17:00'), input_zone: LA, breaks: [], breaks_confirmed: true },
  });
  expect(created.status).toBe(201);
  sessionId = created.body.session.id as string;
  const settings = await t.request('POST', '/api/settings/submission', {
    cookie: owner,
    body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: [], auto_submit: false },
  });
  expect(settings.status).toBe(201);
  const files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
  saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
  const review = await t.request('GET', '/api/timesheets/2026-10-02/review', { cookie: owner });
  const signed = await t.request('POST', '/api/timesheets/2026-10-02/signoff', {
    cookie: owner,
    body: {
      expected_version: review.body.expected_version,
      reviewed_hash: review.body.payload_hash,
      signer_name: 'Example Employee',
      incomplete_evidence_acknowledged: true,
    },
  });
  expect(signed.status, JSON.stringify(signed.body)).toBe(201);
  revisionId = signed.body.revision.id as string;
  await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) } });
});

afterAll(() => t.close());

function inventory(prefix?: string): string[] {
  const counts = new Map<string, number>();
  for (const route of app.routes) {
    if (prefix !== undefined && !route.path.startsWith(prefix)) continue;
    const key = `${route.method} ${route.path}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([key, handlers]) => `${key} ${handlers}`).sort();
}

const url = (path: string, ownerId = t.userIds.employee) =>
  `/api/shared/${ownerId}${path
    .replace(':payrollDate', '2026-10-02')
    .replace(':workDate', '2026-09-21')
    .replace(':revision', revisionId)
    .replace(':id', path.startsWith('/sessions') ? sessionId : revisionId)}${path === '/periods' ? '?from=2026-09-14&to=2026-09-27' : ''}`;

async function probe(method: string, path: string, cookie?: string) {
  return t.request(method, url(path), { ...(cookie === undefined ? {} : { cookie }), ...(method === 'GET' ? {} : { body: {} }) });
}

async function share(set: ItemSet): Promise<void> {
  const items = { timesheets: set.timesheets, ot_read: set.ot_read, pdf_download: set.pdf_download };
  const response =
    shareId === null
      ? await t.request('POST', '/api/shares', { cookie: owner, body: { grantee_email: 'grantee@example.invalid', items } })
      : await t.request('PUT', `/api/shares/${shareId}`, { cookie: owner, body: { items } });
  expect(response.status, JSON.stringify(response.body)).toBeLessThan(300);
  shareId = response.body.share.id as string;
}

describe('route inventory', () => {
  it('registers exactly the matrix routes under /api/shared, each behind its guard', () => {
    const registered = inventory('/api/shared/');
    const expected = MATRIX.map(([method, path]) => `${method} /api/shared/:ownerId${path} 2`).sort();
    for (const route of registered) {
      expect(expected, `no matrix entry for ${route}`).toContain(route);
    }
    expect(registered).toEqual(expected);
    expect(app.routes.filter((route) => route.path.startsWith('/api/shared') && route.method === 'ALL')).toEqual([]);
  });

  it('keeps every self-only /api route unchanged and adds only the reviewed sharing routes', () => {
    const outside = inventory().filter((route) => !route.includes(' /api/shared/'));
    expect(outside).toEqual([...SELF_ONLY_BEFORE, ...SHARING_ADDED, ...IMPORTS_ADDED].sort());
  });

  it('WP4-T02 drift guard: the shared write routes are exactly the five that record the audit marker', () => {
    // Each of these records `audit_events.via_share_id` (asserted by the history drift test, which performs them all).
    // A new shared write route fails here until the marker is recorded for it and that test performs it.
    const writes = MATRIX.filter(([method]) => method !== 'GET').map(([method, path]) => `${method} ${path}`);
    expect(writes.sort()).toEqual(
      ['DELETE /sessions/:id', 'POST /days/:workDate/sessions', 'POST /days/batch', 'PUT /days/:workDate', 'PUT /sessions/:id'].sort(),
    );
  });

  it('covers the 11 valid item sets', () => {
    expect(ITEM_SETS).toHaveLength(11);
    expect(new Set(ITEM_SETS.map(label)).size).toBe(11);
  });
});

describe.each(ITEM_SETS)('item set %#', (set) => {
  it(`answers every matrix route by item for ${label(set)}`, async () => {
    await share(set);
    for (const [method, path, item] of MATRIX) {
      const route = `${method} ${path} [${label(set)}]`;
      const asGrantee = await probe(method, path, grantee);
      if (allows(set, item)) {
        expect(asGrantee.status, route).toBe(method === 'GET' ? 200 : 422);
        if (method !== 'GET') expect(asGrantee.body.error.code, route).toBe('validation_error');
      } else {
        expect(asGrantee.status, route).toBe(403);
        expect(asGrantee.body.error.code, route).toBe('grant_scope');
      }
      const asStranger = await probe(method, path, stranger);
      expect(asStranger.status, `stranger ${route}`).toBe(404);
      expect(asStranger.body.error.code, `stranger ${route}`).toBe('not_found');
      const asAdmin = await probe(method, path, admin);
      expect(asAdmin.status, `admin ${route}`).toBe(404);
      const anonymous = await probe(method, path);
      expect(anonymous.status, `anonymous ${route}`).toBe(401);
    }
  });

  it(`never reaches the owner-only routes for ${label(set)}`, async () => {
    await share(set);
    for (const [method, path] of NEVER) {
      for (const cookie of [grantee, stranger, admin]) {
        const response = await probe(method, path, cookie);
        expect(response.status, `${method} ${path}`).toBe(404);
      }
    }
  });
});
