import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/server/app.ts';
import { LoginRateLimiter } from '../../src/server/auth/rateLimit.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { recordHeartbeat } from '../../src/server/jobs/jobStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createSendJobHandler } from '../../src/server/jobs/sendJob.ts';
import { createOutboundAdapter } from '../../src/server/mail/outbound.ts';
import { setAutomationActivation } from '../../src/server/services/automation.ts';
import { faultCode, HEARTBEAT_STALE_SECONDS } from '../../src/server/services/operationsStatus.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import type { DeliveryConfig } from '../../src/server/types.ts';
import { makePng } from '../support/pdfText.ts';
import { createTestContext, la, LA, ORIGIN, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T13D: the administrator operations status (F-3, F-Q3 (b)). The admin sees the submission
 * and delivery pipeline (states, redacted fault codes, recipient addresses) and nothing of any
 * person's timesheet details. Synthetic data only: example.invalid addresses and marker texts
 * that no allowed field can contain, so a response scan proves their absence.
 */

const PAYROLL = '2026-10-02';
const SENDER = 'timesheet@example.invalid';
const EMPLOYEE_TO = ['payroll-employee@example.invalid'];
const EMPLOYEE_CC = ['manager-employee@example.invalid'];
const ADMIN_TO = ['payroll-admin@example.invalid'];
const NOTE = 'SYNTH-NOTE-7731 private note';
const SUBJECT_MARK = 'SYNTHSUBJ4417';
const BODY_MARK = 'SYNTHBODY9902';

let t: TestContext;
let admin: string;
let employee: string;
let files: FileStore;

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  admin = await t.login('admin');
  employee = await t.login('employee');
  files = new FileStore(join(dirname(t.config.databasePath), 'private-data'));
});

afterEach(() => {
  vi.unstubAllEnvs();
  t.close();
});

const count = (sql: string, ...params: string[]) => Number(t.db.prepare(sql).pluck().get(...params));

interface Finalized {
  revisionId: string;
  sendJobId: string;
  sessionStartUtc: string;
}

/** A signed revision of one account with its own recipients, a private note and a session. */
async function finalizeFor(cookie: string, userId: string, to: string[], cc: string[], withTemplates: boolean): Promise<Finalized> {
  const settings = await t.request('POST', '/api/settings/submission', {
    cookie,
    body: {
      expected_seq: 0,
      to,
      cc,
      auto_submit: false,
      ...(withTemplates
        ? { subject_template: `${SUBJECT_MARK} {PayrollDate}`, body_template: `${BODY_MARK} for {EmployeeName}, revision {Revision}` }
        : {}),
    },
  });
  expect(settings.status, JSON.stringify(settings.body)).toBeLessThan(300);
  const session = await t.request('POST', '/api/days/2026-09-15/sessions', {
    cookie,
    body: { start: la('2026-09-15T09:00'), end: la('2026-09-15T18:00'), input_zone: LA, breaks: [], breaks_confirmed: true },
  });
  expect(session.status, JSON.stringify(session.body)).toBe(201);
  const sessionStartUtc = session.body.session.start_utc as string;
  const day = await t.request('PUT', '/api/days/2026-09-16', {
    cookie,
    body: { category: 'Worked', leave_minutes: 0, wfh: false, notes: NOTE },
  });
  expect(day.status, JSON.stringify(day.body)).toBe(200);
  saveSignature(t.db, t.clock, files, userId, makePng(40, 12), 'image/png');
  const review = await t.request('GET', `/api/timesheets/${PAYROLL}/review`, { cookie });
  expect(review.status, JSON.stringify(review.body)).toBe(200);
  const signed = await t.request('POST', `/api/timesheets/${PAYROLL}/signoff`, {
    cookie,
    body: {
      expected_version: review.body.expected_version,
      reviewed_hash: review.body.payload_hash,
      signer_name: 'Example Person',
      incomplete_evidence_acknowledged: true,
    },
  });
  expect(signed.status, JSON.stringify(signed.body)).toBe(201);
  const revisionId = signed.body.revision.id as string;
  const sendJobId = t.db.prepare("SELECT id FROM jobs WHERE revision_id = ? AND kind = 'send_email'").pluck().get(revisionId) as string;
  return { revisionId, sendJobId, sessionStartUtc };
}

async function runPipeline(sender: string | null): Promise<void> {
  const pdf = await runJobsOnce({
    db: t.db,
    clock: t.clock,
    owner: 'runner-pdf',
    handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) },
  });
  expect(pdf).toMatchObject({ intervention: 0, retried: 0 });
  t.clock.advanceSeconds(10);
  await runJobsOnce({
    db: t.db,
    clock: t.clock,
    owner: 'runner-send',
    handlers: {
      send_email: createSendJobHandler({
        db: t.db,
        clock: t.clock,
        files,
        outbound: createOutboundAdapter({ mode: 'capture' }, { dataDir: join(dirname(t.config.databasePath), 'private-data') }),
        senderAddress: sender,
      }),
    },
  });
}

async function statusOf(path: string, cookie: string) {
  return t.request('GET', path, { cookie });
}

/** A delivery configuration as `loadDeliveryConfig` builds it; the sender is the only varying part. */
function deliveryConfig(senderAddress: string | null, outbound: DeliveryConfig['outbound'] = { mode: 'capture' }): DeliveryConfig {
  return {
    dataDir: join(dirname(t.config.databasePath), 'private-data'),
    publicBaseUrl: 'https://timesheet.example.invalid',
    senderAddress,
    outbound,
  };
}

/** The operations status through an app started with this delivery configuration (none when undefined). */
async function operationsWith(delivery: DeliveryConfig | undefined) {
  const app = createApp(
    { db: t.db, clock: t.clock, config: t.config, loginLimiter: new LoginRateLimiter(), staticDir: null, ...(delivery === undefined ? {} : { delivery }) },
    { dataDir: join(dirname(t.config.databasePath), 'private-data') },
  );
  const response = await app.request('/api/admin/operations', { headers: { origin: ORIGIN, cookie: admin } });
  return { status: response.status, body: (await response.json()) as any };
}

/** Every key path of a JSON value (`a.b`, arrays as `a[]`), so the shape is compared exactly. */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return [...new Set(value.flatMap((item) => keyPaths(item, `${prefix}[]`)))];
  if (typeof value !== 'object' || value === null) return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    return [path, ...keyPaths(child, path)];
  });
}

function fingerprint(): string {
  const tables = t.db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name <> 'auth_sessions' ORDER BY name")
    .pluck()
    .all() as string[];
  const hash = createHash('sha256');
  for (const table of tables) hash.update(`${table}:${JSON.stringify(t.db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all())};`);
  return hash.digest('hex');
}

const SUBMISSION_PATHS = [
  'submissions',
  'submissions[].delivery',
  'submissions[].delivery.accepted_at',
  'submissions[].delivery.attempts',
  'submissions[].delivery.decision_required',
  'submissions[].delivery.fault_code',
  'submissions[].delivery.job_fault_code',
  'submissions[].delivery.job_state',
  'submissions[].delivery.state',
  'submissions[].display_name',
  'submissions[].pdf',
  'submissions[].pdf.fault_code',
  'submissions[].pdf.state',
  'submissions[].period',
  'submissions[].period.due_at',
  'submissions[].period.payroll_date',
  'submissions[].period.period_end',
  'submissions[].period.period_start',
  'submissions[].recipients',
  'submissions[].recipients.effective',
  'submissions[].recipients.effective.cc',
  'submissions[].recipients.effective.to',
  'submissions[].recipients.frozen',
  'submissions[].recipients.frozen.cc',
  'submissions[].recipients.frozen.to',
  'submissions[].revision',
  'submissions[].revision.finalized_at',
  'submissions[].revision.no',
  'submissions[].revision.origin',
  'submissions[].revision.review_state',
  'submissions[].revision.send_requested',
  'submissions[].user_id',
].sort();

const OPERATIONS_PATHS = [
  'operations',
  'operations.activation',
  'operations.activation.active_from',
  'operations.activation.recorded_at',
  'operations.activation.recorded_by',
  'operations.deliveries',
  'operations.deliveries.accepted',
  'operations.deliveries.failed_permanent',
  'operations.deliveries.failed_temporary',
  'operations.deliveries.preparing',
  'operations.deliveries.sending',
  'operations.deliveries.uncertain',
  'operations.jobs',
  'operations.jobs.cancelled',
  'operations.jobs.intervention',
  'operations.jobs.leased',
  'operations.jobs.queued',
  'operations.jobs.succeeded',
  'operations.runner',
  'operations.runner.heartbeat_at',
  'operations.runner.state',
  'operations.sender',
  'operations.sender.configured',
  'operations.sender.outbound_mode',
].sort();

describe('access (F-3: administrators only)', () => {
  it('answers 401 anonymous and 403 to an employee, for both status routes', async () => {
    for (const path of ['/api/admin/operations', '/api/admin/submissions']) {
      const anonymous = await t.request('GET', path);
      expect(anonymous.status, `anonymous ${path}`).toBe(401);
      const asEmployee = await statusOf(path, employee);
      expect(asEmployee.status, `employee ${path}`).toBe(403);
      expect(asEmployee.body.error.code).toBe('forbidden');
      expect(JSON.stringify(asEmployee.body)).not.toContain('payroll');
      const asAdmin = await statusOf(path, admin);
      expect(asAdmin.status, `admin ${path}`).toBe(200);
    }
  });

  it('offers reads only: any write method on the status routes is refused', async () => {
    const before = fingerprint();
    for (const path of ['/api/admin/operations', '/api/admin/submissions']) {
      for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
        const response = await t.request(method, path, { cookie: admin, body: {} });
        expect([404, 405], `${method} ${path}`).toContain(response.status);
      }
    }
    expect(fingerprint()).toBe(before);
  });

  it('validates the limit', async () => {
    for (const limit of ['0', '-1', '501', 'x', '1.5']) {
      const response = await statusOf(`/api/admin/submissions?limit=${limit}`, admin);
      expect(response.status, limit).toBe(422);
      expect(response.body.error.code).toBe('invalid_limit');
    }
    expect((await statusOf('/api/admin/submissions?limit=1', admin)).status).toBe(200);
  });
});

describe('system status', () => {
  it('reports an empty system: never a heartbeat, no activation, zero totals', async () => {
    const response = await operationsWith(deliveryConfig(null));
    expect(response.status).toBe(200);
    expect(response.body.operations).toEqual({
      sender: { configured: false, outbound_mode: 'capture' },
      runner: { heartbeat_at: null, state: 'never' },
      activation: { active_from: null, recorded_at: null, recorded_by: null },
      jobs: { queued: 0, leased: 0, succeeded: 0, intervention: 0, cancelled: 0 },
      deliveries: { preparing: 0, sending: 0, accepted: 0, failed_temporary: 0, failed_permanent: 0, uncertain: 0 },
    });
  });

  it('reads the sender flag and mode from the injected configuration without echoing the address', async () => {
    const response = await operationsWith(deliveryConfig(SENDER));
    expect(response.body.operations.sender).toEqual({ configured: true, outbound_mode: 'capture' });
    expect(JSON.stringify(response.body)).not.toContain(SENDER);
    // Real sending is reported as a mode, never acted on, and never reveals the SMTP settings.
    const smtp = await operationsWith(deliveryConfig(SENDER, { mode: 'smtp', smtp: { host: 'smtp.example.invalid', port: 587, security: 'starttls', auth: null } }));
    expect(smtp.body.operations.sender).toEqual({ configured: true, outbound_mode: 'smtp' });
    expect(JSON.stringify(smtp.body)).not.toContain('smtp.example.invalid');
    // The environment is not consulted: an app started without a configuration reports it as unknown.
    vi.stubEnv('MAIL_FROM', SENDER);
    const unknown = await operationsWith(undefined);
    expect(unknown.body.operations.sender).toEqual({ configured: null, outbound_mode: 'unknown' });
  });

  it('classifies the runner heartbeat as running, then stale after the documented age', async () => {
    recordHeartbeat(t.db, t.clock, 'runner-one');
    const running = await statusOf('/api/admin/operations', admin);
    expect(running.body.operations.runner).toEqual({ heartbeat_at: '2026-09-29T20:00:00Z', state: 'running' });
    t.clock.advanceSeconds(HEARTBEAT_STALE_SECONDS);
    expect((await statusOf('/api/admin/operations', admin)).body.operations.runner.state).toBe('running');
    t.clock.advanceSeconds(1);
    expect((await statusOf('/api/admin/operations', admin)).body.operations.runner.state).toBe('stale');
    // The opaque runner instance never leaves the server.
    expect(JSON.stringify((await statusOf('/api/admin/operations', admin)).body)).not.toContain('runner-one');
  });

  it('shows the activation instant with who recorded it and when', async () => {
    setAutomationActivation(t.db, t.clock, { actorUserId: t.userIds.admin, activeFrom: '2026-10-05T00:00:00Z', reason: 'Synthetic pilot start' });
    const response = await statusOf('/api/admin/operations', admin);
    expect(response.body.operations.activation).toEqual({
      active_from: '2026-10-05T00:00:00Z',
      recorded_at: '2026-09-29T20:00:00Z',
      recorded_by: t.userIds.admin,
    });
    expect(JSON.stringify(response.body)).not.toContain('Synthetic pilot start');
  });
});

describe('submission and delivery status', () => {
  it('lists each person and period with states, a redacted fault and their own recipients (F-Q3 (b))', async () => {
    const own = await finalizeFor(employee, t.userIds.employee, EMPLOYEE_TO, EMPLOYEE_CC, true);
    const adminOwn = await finalizeFor(admin, t.userIds.admin, ADMIN_TO, [], false);
    await runPipeline(null);
    const response = await statusOf('/api/admin/submissions', admin);
    expect(response.status).toBe(200);
    const rows = response.body.submissions as Array<Record<string, any>>;
    expect(rows).toHaveLength(2);
    const byUser = new Map(rows.map((row) => [row.user_id as string, row]));
    const employeeRow = byUser.get(t.userIds.employee);
    const adminRow = byUser.get(t.userIds.admin);
    if (employeeRow === undefined || adminRow === undefined) throw new Error('rows missing');
    expect(employeeRow).toMatchObject({
      display_name: expect.any(String),
      period: { payroll_date: PAYROLL },
      revision: { no: 1, origin: 'employee', review_state: 'signed', send_requested: true },
      pdf: { state: 'ready', fault_code: null },
      delivery: { state: 'failed_permanent', attempts: 1, accepted_at: null, fault_code: 'sender_missing', decision_required: false, job_state: 'intervention' },
    });
    // Recipients: the effective settings and the frozen envelope, each person's own only.
    expect(employeeRow.recipients).toEqual({
      effective: { to: EMPLOYEE_TO, cc: EMPLOYEE_CC },
      frozen: { to: EMPLOYEE_TO, cc: EMPLOYEE_CC },
    });
    expect(adminRow.recipients).toEqual({ effective: { to: ADMIN_TO, cc: [] }, frozen: { to: ADMIN_TO, cc: [] } });
    expect(JSON.stringify(adminRow)).not.toContain('employee@example.invalid');
    expect(JSON.stringify(employeeRow)).not.toContain('payroll-admin');
    expect(own.revisionId).not.toBe(adminOwn.revisionId);
  });

  it('shows an accepted delivery with no fault and the settings changed after the freeze', async () => {
    await finalizeFor(employee, t.userIds.employee, EMPLOYEE_TO, EMPLOYEE_CC, false);
    await runPipeline(SENDER);
    const changed = await t.request('POST', '/api/settings/submission', {
      cookie: employee,
      body: { expected_seq: 1, to: ['changed@example.invalid'], cc: [], auto_submit: false },
    });
    expect(changed.status, JSON.stringify(changed.body)).toBeLessThan(300);
    const row = (await statusOf('/api/admin/submissions', admin)).body.submissions[0];
    expect(row.delivery).toMatchObject({ state: 'accepted', attempts: 1, fault_code: null, decision_required: false, job_state: 'succeeded' });
    expect(row.delivery.accepted_at).toMatch(/^2026-09-29T20:00:\d\dZ$/);
    expect(row.recipients.effective.to).toEqual(['changed@example.invalid']);
    expect(row.recipients.frozen).toEqual({ to: EMPLOYEE_TO, cc: EMPLOYEE_CC });
    const ops = (await statusOf('/api/admin/operations', admin)).body.operations;
    expect(ops.deliveries.accepted).toBe(1);
    expect(ops.jobs.succeeded).toBeGreaterThanOrEqual(2);
  });

  it('shows an uncertain delivery as a decision needed, with the redacted code only', async () => {
    const { revisionId } = await finalizeFor(employee, t.userIds.employee, EMPLOYEE_TO, [], false);
    await runPipeline(SENDER);
    // Simulate an interrupted send: the attempt is uncertain with a provider text that holds an address.
    t.db.exec('DROP TRIGGER delivery_attempts_state_flow');
    t.db
      .prepare("UPDATE delivery_attempts SET state = 'uncertain', accepted_at = NULL, provider_response = ? WHERE revision_id = ?")
      .run('lease_expired_while_sending to=leaked-bob@example.invalid', revisionId);
    const response = await statusOf('/api/admin/submissions', admin);
    const row = response.body.submissions[0];
    expect(row.delivery).toMatchObject({ state: 'uncertain', fault_code: 'lease_expired_while_sending', decision_required: true });
    expect(JSON.stringify(response.body)).not.toContain('leaked-bob');
  });

  it('shows a failed PDF with its code', async () => {
    const { revisionId } = await finalizeFor(employee, t.userIds.employee, EMPLOYEE_TO, [], false);
    t.db
      .prepare("INSERT INTO revision_files (id, user_id, revision_id, kind, state, attachment_id, last_error, created_at, updated_at) VALUES ('rf-synth-1', ?, ?, 'pdf', 'failed', NULL, ?, '2026-09-29T20:00:00Z', '2026-09-29T20:00:00Z')")
      .run(t.userIds.employee, revisionId, 'render_failed at C:\\synthetic\\path.pdf');
    const row = (await statusOf('/api/admin/submissions', admin)).body.submissions[0];
    expect(row.pdf).toEqual({ state: 'failed', fault_code: 'render_failed' });
  });
});

describe('the privacy boundary of every admin response (F-3, WP2-A-01, A3-01)', () => {
  it('returns exactly the allowlisted fields and none of the private content', async () => {
    const seeded = await finalizeFor(employee, t.userIds.employee, EMPLOYEE_TO, EMPLOYEE_CC, true);
    await finalizeFor(admin, t.userIds.admin, ADMIN_TO, [], false);
    await runPipeline(SENDER);
    // A payroll exception on a stored, unfinalized period leaves an audit payload that names `refreshed_pay_period`.
    expect((await t.request('GET', '/api/timesheets/2026-10-16', { cookie: employee })).status).toBe(200);
    const exception = await t.request('POST', '/api/admin/payroll-exceptions', {
      cookie: admin,
      body: { calendar_id: t.calendarId, nominal_payroll_date: '2026-10-16', payroll_date: '2026-10-19', reason: 'Synthetic shift' },
    });
    expect(exception.status, JSON.stringify(exception.body)).toBe(201);
    expect(count("SELECT count(*) FROM audit_events WHERE after_json LIKE '%refreshed_pay_period%'")).toBeGreaterThan(0);

    const submissions = await statusOf('/api/admin/submissions', admin);
    const operations = await statusOf('/api/admin/operations', admin);
    expect(submissions.status).toBe(200);
    expect(operations.status).toBe(200);
    expect(keyPaths(submissions.body).sort()).toEqual(SUBMISSION_PATHS);
    expect(keyPaths(operations.body).sort()).toEqual(OPERATIONS_PATHS);

    const row = t.db
      .prepare('SELECT message_id, provider_message_id, envelope_json FROM delivery_attempts WHERE revision_id = ?')
      .get(seeded.revisionId) as { message_id: string; provider_message_id: string; envelope_json: string };
    const revision = t.db
      .prepare('SELECT payload_json, payload_sha256, timesheet_id FROM timesheet_revisions WHERE id = ?')
      .get(seeded.revisionId) as { payload_json: string; payload_sha256: string; timesheet_id: string };
    const snapshot = JSON.parse(revision.payload_json) as { recipients: { subject: string; body_text: string } };
    const pdfKey = t.db
      .prepare("SELECT a.storage_key FROM revision_files f JOIN attachments a ON a.id = f.attachment_id WHERE f.revision_id = ?")
      .pluck()
      .get(seeded.revisionId) as string;
    const forbidden = [
      NOTE,
      'SYNTH-NOTE',
      seeded.sessionStartUtc,
      '2026-09-15T16:00:00Z',
      SUBJECT_MARK,
      BODY_MARK,
      snapshot.recipients.subject,
      snapshot.recipients.body_text,
      row.message_id,
      row.provider_message_id,
      pdfKey,
      revision.payload_sha256,
      revision.timesheet_id,
      seeded.revisionId,
      'refreshed_pay_period',
      'payload_json',
      'envelope_json',
      'Synthetic shift',
    ];
    for (const [name, response] of [['submissions', submissions], ['operations', operations]] as const) {
      const text = JSON.stringify(response.body);
      for (const needle of forbidden) expect(text, `${name} must not contain ${needle}`).not.toContain(needle);
      for (const key of ['notes', 'minutes', 'sessions', 'breaks', 'ledger', 'start_utc', 'end_utc', 'message_id', 'subject', 'body', 'template', 'payload', 'leave', 'signature', 'audit']) {
        expect(keyPaths(response.body).join(' '), `${name} must have no ${key} field`).not.toContain(key);
      }
    }
    // The only personal-looking values are the allowed addresses (F-Q3 (b)).
    expect(JSON.stringify(submissions.body)).toContain(EMPLOYEE_TO[0]);
  });

  it('writes nothing: the status reads leave every table as it was', async () => {
    await finalizeFor(employee, t.userIds.employee, EMPLOYEE_TO, [], false);
    await runPipeline(SENDER);
    const before = fingerprint();
    await statusOf('/api/admin/operations', admin);
    await statusOf('/api/admin/submissions', admin);
    await statusOf('/api/admin/submissions?limit=1', admin);
    expect(fingerprint()).toBe(before);
  });
});

describe('fault redaction', () => {
  it('keeps only a leading lowercase code or the numeric SMTP reply', () => {
    expect(faultCode(null)).toBeNull();
    expect(faultCode('sender_missing')).toBe('sender_missing');
    expect(faultCode('tls_failed 451 4.3.0 to=bob@example.invalid')).toBe('tls_failed');
    expect(faultCode('550 5.1.1 <bob@example.invalid> unknown')).toBe('smtp_550');
    expect(faultCode('Mailbox bob@example.invalid unavailable')).toBe('unclassified');
    expect(faultCode('')).toBe('unclassified');
    expect(faultCode('bob@example.invalid')).toBe('unclassified');
  });
});
