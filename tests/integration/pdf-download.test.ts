import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { createUser } from '../../src/server/services/users.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T13 owner-only PDF download: GET /api/revisions/:id/pdf. The route is built by the T13A
 * submission router factory and reads the final PDF from the private store only after an
 * owner-scoped lookup. It is never a static path, answers `no-store` with an attachment
 * disposition and a sanitized filename, treats another user's revision (an administrator
 * included) exactly like a missing one, refuses anonymous callers with 401 and answers 409 while
 * the PDF is not ready. A stored file whose bytes no longer match the recorded hash is never sent.
 * Every address and image here is synthetic (example.invalid, generated pixels).
 */

const PAYROLL = '2026-10-02';
const MISSING = '00000000-0000-4000-8000-000000000000';

let t: TestContext;
let app: ReturnType<typeof createApp>;
let employee: string;
let admin: string;
let dataDir: string;
let files: FileStore;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
  app = createApp({ db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null });
  employee = await t.login('employee');
  admin = await t.login('admin');
});

afterEach(() => t.close());

interface Sent {
  status: number;
  headers: Headers;
  bytes: Buffer;
  json: any;
}

async function send(path: string, cookie?: string): Promise<Sent> {
  const headers: Record<string, string> = { origin: ORIGIN };
  if (cookie !== undefined) headers.cookie = cookie;
  const response = await app.request(path, { method: 'GET', headers });
  const bytes = Buffer.from(await response.arrayBuffer());
  let json: unknown = null;
  try {
    json = JSON.parse(bytes.toString('utf8'));
  } catch {
    json = null;
  }
  return { status: response.status, headers: response.headers, bytes, json };
}

const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

async function addSession(date: string, from: string, to: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: employee,
    body: { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

/** A signed revision of the employee; with `pdf` the final PDF is rendered by the real job handler. */
async function finalized(options: { pdf?: boolean; render?: () => Promise<Uint8Array> } = {}) {
  const settings = await t.request('POST', '/api/settings/submission', {
    cookie: employee,
    body: { expected_seq: 0, to: ['payroll@example.invalid'], cc: [], auto_submit: false },
  });
  expect(settings.status, JSON.stringify(settings.body)).toBe(201);
  await addSession('2026-09-15', '09:00', '18:00');
  saveSignature(t.db, t.clock, files, t.userIds.employee, makePng(40, 12), 'image/png');
  const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie: employee });
  expect(review.status, JSON.stringify(review.body)).toBe(200);
  const response = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
    cookie: employee,
    body: {
      expected_version: review.body.expected_version,
      reviewed_hash: review.body.payload_hash,
      signer_name: 'Example Employee',
      incomplete_evidence_acknowledged: true,
    },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
  const revisionId = response.body.revision.id as string;
  if (options.pdf !== false) {
    const handler = createPdfJobHandler({ db: t.db, clock: t.clock, files, ...(options.render === undefined ? {} : { render: options.render }) });
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: handler } });
  }
  return revisionId;
}

function storedPdf(revisionId: string): { key: string; bytes: Buffer; sha256: string } {
  const row = t.db
    .prepare(
      `SELECT a.storage_key AS key, a.sha256 FROM revision_files f JOIN attachments a ON a.id = f.attachment_id
        WHERE f.revision_id = ? AND f.kind = 'pdf' AND f.state = 'ready'`,
    )
    .get(revisionId) as { key: string; sha256: string };
  return { key: row.key, sha256: row.sha256, bytes: files.read(row.key) };
}

const count = (sql: string) => Number(t.db.prepare(sql).pluck().get());

describe('owner download of a ready PDF', () => {
  it('sends the stored bytes with no-store, an attachment disposition and a sanitized filename', async () => {
    const revisionId = await finalized();
    const stored = storedPdf(revisionId);
    const response = await send(`/api/revisions/${revisionId}/pdf`, employee);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-disposition')).toBe(`attachment; filename="timesheet-${PAYROLL}-r1.pdf"`);
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(sha(response.bytes)).toBe(stored.sha256);
    expect(response.bytes.equals(stored.bytes)).toBe(true);
  });

  it('puts no id, storage key or address into any header', async () => {
    const revisionId = await finalized();
    const stored = storedPdf(revisionId);
    const response = await send(`/api/revisions/${revisionId}/pdf`, employee);
    const headers = [...response.headers.entries()].map(([name, value]) => `${name}: ${value}`).join('\n');
    expect(headers).not.toContain(revisionId);
    expect(headers).not.toContain(stored.key);
    expect(headers).not.toContain('example.invalid');
  });

  it('writes nothing: no row and no audit event', async () => {
    const revisionId = await finalized();
    const before = { audit: count('SELECT count(*) FROM audit_events'), attachments: count('SELECT count(*) FROM attachments'), jobs: count('SELECT count(*) FROM jobs') };
    expect((await send(`/api/revisions/${revisionId}/pdf`, employee)).status).toBe(200);
    expect({ audit: count('SELECT count(*) FROM audit_events'), attachments: count('SELECT count(*) FROM attachments'), jobs: count('SELECT count(*) FROM jobs') }).toEqual(before);
  });

  it('is served only by the route, not as a static file under the private directory', async () => {
    const revisionId = await finalized();
    const stored = storedPdf(revisionId);
    for (const path of [`/files/${stored.key}`, `/private-data/files/${stored.key}`, `/api/files/${stored.key}`, `/api/revisions/${stored.key}/pdf`]) {
      const response = await send(path, employee);
      expect(response.status, path).toBe(404);
      expect(response.bytes.subarray(0, 5).toString('latin1'), path).not.toBe('%PDF-');
    }
  });
});

describe('ownership and authentication', () => {
  it('answers 404 to another user (an administrator included), exactly like a missing revision', async () => {
    const revisionId = await finalized();
    const swapped = await send(`/api/revisions/${revisionId}/pdf`, admin);
    const missing = await send(`/api/revisions/${MISSING}/pdf`, admin);
    expect(swapped.status).toBe(404);
    expect(swapped.json).toEqual(missing.json);
    expect(swapped.bytes.subarray(0, 5).toString('latin1')).not.toBe('%PDF-');
    expect((await send(`/api/revisions/${MISSING}/pdf`, employee)).status).toBe(404);
  });

  it('answers 401 to anonymous and forged-session callers, also for a real revision id', async () => {
    const revisionId = await finalized();
    expect((await send(`/api/revisions/${revisionId}/pdf`)).status).toBe(401);
    expect((await send(`/api/revisions/${revisionId}/pdf`, 'ts_session=forged')).status).toBe(401);
    expect((await send(`/api/revisions/${MISSING}/pdf`)).status).toBe(401);
  });

  it('treats a malformed id and path-like ids as not found', async () => {
    const revisionId = await finalized();
    const key = storedPdf(revisionId).key;
    for (const id of ['not-a-uuid', key, '..%2F..%2Fapp.db', '%2e%2e', 'pending-lines']) {
      const response = await send(`/api/revisions/${id}/pdf`, employee);
      expect([404, 422], id).toContain(response.status);
      expect(response.bytes.subarray(0, 5).toString('latin1'), id).not.toBe('%PDF-');
    }
  });
});

describe('a PDF that is not ready', () => {
  it('answers 409 pdf_not_ready while the PDF job has not run', async () => {
    const revisionId = await finalized({ pdf: false });
    const response = await send(`/api/revisions/${revisionId}/pdf`, employee);
    expect(response.status).toBe(409);
    expect(response.json.error.code).toBe('pdf_not_ready');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.bytes.subarray(0, 5).toString('latin1')).not.toBe('%PDF-');
  });

  it('answers 409 pdf_not_ready after a failed render and 200 once a later run succeeds', async () => {
    const revisionId = await finalized({
      render: () => Promise.reject(new Error('synthetic render fault')),
    });
    const state = t.db.prepare("SELECT state FROM revision_files WHERE revision_id = ? AND kind = 'pdf'").pluck().get(revisionId);
    expect(state).toBe('failed');
    expect((await send(`/api/revisions/${revisionId}/pdf`, employee)).status).toBe(409);

    t.clock.advanceSeconds(3600);
    const handler = createPdfJobHandler({ db: t.db, clock: t.clock, files });
    await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-retry', handlers: { render_pdf: handler } });
    expect((await send(`/api/revisions/${revisionId}/pdf`, employee)).status).toBe(200);
  });
});

describe('integrity of the stored file', () => {
  it('never sends bytes that no longer match the recorded hash', async () => {
    const revisionId = await finalized();
    const stored = storedPdf(revisionId);
    writeFileSync(join(dataDir, 'files', stored.key), Buffer.concat([stored.bytes, Buffer.from('tampered')]));
    const response = await send(`/api/revisions/${revisionId}/pdf`, employee);
    expect(response.status).toBe(500);
    expect(response.bytes.includes(Buffer.from('tampered'))).toBe(false);
    expect(readFileSync(join(dataDir, 'files', stored.key)).includes(Buffer.from('tampered'))).toBe(true);
  });
});

/*
 * WP4-T02 (FR-17, AC-16; WP3_REVIEW_C R1): a grantee's GET of the shared PDF writes one `share.pdf_download`
 * audit event that records the share it was made under, and a `HEAD` on the same route returns the headers
 * but writes none (Hono serves HEAD through the GET handler, so the handler must tell them apart).
 */
describe('shared PDF download audit', () => {
  let granteeCookie: string;
  let shareId: string;

  async function share(items: { timesheets: string; ot_read: boolean; pdf_download: boolean }) {
    const password = randomBytes(18).toString('base64url');
    await createUser(
      t.db,
      t.clock,
      { email: 'grantee@example.invalid', displayName: 'Synthetic Grantee', role: 'employee', password, calendarId: t.calendarId },
      t.userIds.admin,
    );
    const login = await t.request('POST', '/api/auth/login', { body: { email: 'grantee@example.invalid', password } });
    granteeCookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
    const granted = await t.request('POST', '/api/shares', { cookie: employee, body: { grantee_email: 'grantee@example.invalid', items } });
    expect(granted.status, JSON.stringify(granted.body)).toBe(201);
    shareId = granted.body.share.id as string;
  }

  async function sharedRequest(method: 'GET' | 'HEAD', revisionId: string, cookie: string): Promise<Sent> {
    const response = await app.request(`/api/shared/${t.userIds.employee}/revisions/${revisionId}/pdf`, {
      method,
      headers: { origin: ORIGIN, cookie },
    });
    const bytes = Buffer.from(await response.arrayBuffer());
    return { status: response.status, headers: response.headers, bytes, json: null };
  }

  const downloads = () => count("SELECT count(*) FROM audit_events WHERE operation = 'share.pdf_download'");

  it('records one audit event with the share marker for a GET', async () => {
    const revisionId = await finalized();
    await share({ timesheets: 'none', ot_read: false, pdf_download: true });
    const response = await sharedRequest('GET', revisionId, granteeCookie);
    expect(response.status).toBe(200);
    expect(response.bytes.subarray(0, 5).toString('latin1')).toBe('%PDF-');
    expect(downloads()).toBe(1);
    expect(t.db.prepare("SELECT via_share_id FROM audit_events WHERE operation = 'share.pdf_download'").pluck().get()).toBe(shareId);
  });

  it('returns the headers for a HEAD and writes no audit event', async () => {
    const revisionId = await finalized();
    await share({ timesheets: 'none', ot_read: false, pdf_download: true });
    const total = count('SELECT count(*) FROM audit_events');
    const head = await sharedRequest('HEAD', revisionId, granteeCookie);
    expect(head.status).toBe(200);
    expect(head.headers.get('content-type')).toBe('application/pdf');
    expect(head.headers.get('cache-control')).toBe('no-store');
    expect(head.bytes.length).toBe(0);
    expect(downloads()).toBe(0);
    expect(count('SELECT count(*) FROM audit_events')).toBe(total);
    // The GET after it is still audited exactly once.
    expect((await sharedRequest('GET', revisionId, granteeCookie)).status).toBe(200);
    expect(downloads()).toBe(1);
  });

  it('refuses a HEAD without the PDF item, from a stranger and after revocation, and audits none of them', async () => {
    const revisionId = await finalized();
    await share({ timesheets: 'view', ot_read: false, pdf_download: false });
    expect((await sharedRequest('HEAD', revisionId, granteeCookie)).status).toBe(403);
    expect((await sharedRequest('HEAD', revisionId, admin)).status).toBe(404);
    const revoked = await t.request('POST', `/api/shares/${shareId}/revoke`, { cookie: employee, body: {} });
    expect(revoked.status).toBe(200);
    expect((await sharedRequest('HEAD', revisionId, granteeCookie)).status).toBe(404);
    expect(downloads()).toBe(0);
  });
});
