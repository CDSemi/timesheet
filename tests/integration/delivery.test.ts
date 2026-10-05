import { createHash, randomBytes } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { inspect } from 'node:util';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDeliveryConfig } from '../../src/server/config.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { claimNextJob, enqueueJob, failJob } from '../../src/server/jobs/jobStore.ts';
import { createPdfJobHandler } from '../../src/server/jobs/pdfJob.ts';
import { createJobHandlers, runJobsOnce } from '../../src/server/jobs/runner.ts';
import { createSendJobHandler, type SendJobHooks } from '../../src/server/jobs/sendJob.ts';
import { captureFolder } from '../../src/server/mail/captureAdapter.ts';
import { buildMessage, MessageError } from '../../src/server/mail/message.ts';
import { createOutboundAdapter, type OutboundAdapter } from '../../src/server/mail/outbound.ts';
import { classifySmtpFailure } from '../../src/server/mail/smtpAdapter.ts';
import { recoverInterruptedSends } from '../../src/server/services/deliveries.ts';
import { saveSignature } from '../../src/server/services/signatures.ts';
import { makePng } from '../support/pdfText.ts';
import { type SinkBehaviour, type SmtpSink, startSmtpSink } from '../support/smtpSink.ts';
import { createTestContext, la, LA, type TestContext } from '../support/testApp.ts';

/*
 * WP3-T09 delivery checks (AC-08, AC-14, docs/05 "Durable delivery" and its failure table):
 * the capture default, the SMTP adapter against a loopback sink started here (127.0.0.1 only,
 * synthetic example.invalid recipients, credentials made up per run), each failure point
 * (pre-transfer, temporary and permanent rejection, acknowledged acceptance, uncertain), the
 * frozen content of the message, the PDF hash re-check, the visible sender/recipient fault,
 * the uncertain decision route, duplicate jobs, owner scoping and the absence of secrets from
 * rows, logs, captured metadata and responses. Nothing here sets the owner-only sending flag
 * in the process environment; SMTP configurations are built from explicit test objects.
 */

const PAYROLL = '2026-10-02';
const SENDER = 'timesheet@example.invalid';
const TO = ['payroll@example.invalid'];
const CC = ['manager@example.invalid'];
const SMTP_USER = `synthetic-user-${randomBytes(6).toString('hex')}`;
const SECRET = `synthetic-secret-${randomBytes(12).toString('hex')}`;
const WRONG_SECRET = `synthetic-wrong-${randomBytes(12).toString('hex')}`;

let t: TestContext;
let employee: string;
let dataDir: string;
let files: FileStore;
const sinks: SmtpSink[] = [];

beforeEach(async () => {
  t = await createTestContext('2026-09-29T20:00:00Z');
  employee = await t.login('employee');
  dataDir = join(dirname(t.config.databasePath), 'private-data');
  files = new FileStore(dataDir);
});

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(sinks.splice(0).map((sink) => sink.close()));
  t.close();
});

const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
const base = () => ({ databasePath: t.config.databasePath, port: 3000, production: false });

function count(sql: string, ...params: string[]): number {
  return Number(t.db.prepare(sql).pluck().get(...params));
}

async function sink(options: { behaviour?: SinkBehaviour; auth?: boolean; implicitTls?: boolean } = {}): Promise<SmtpSink> {
  const started = await startSmtpSink({
    ...(options.behaviour === undefined ? {} : { behaviour: options.behaviour }),
    ...(options.auth === false ? {} : { auth: { user: SMTP_USER, pass: SECRET } }),
    ...(options.implicitTls === true ? { implicitTls: true } : {}),
  });
  sinks.push(started);
  return started;
}

/** An explicit SMTP environment object for one test; never the process environment. */
function smtpEnv(port: number, password = SECRET): NodeJS.ProcessEnv {
  return {
    OUTBOUND_MODE: 'smtp',
    PRODUCTION_SENDING_ENABLED: 'true',
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(port),
    SMTP_SECURITY: 'starttls',
    SMTP_USER,
    SMTP_PASSWORD: password,
    MAIL_FROM: SENDER,
    DATA_DIR: dataDir,
  };
}

function smtpOutbound(target: SmtpSink, password = SECRET): OutboundAdapter {
  const config = loadDeliveryConfig(smtpEnv(target.port, password), base());
  return createOutboundAdapter(config.outbound, { dataDir, smtp: { trustedCa: target.ca } });
}

function captureOutbound(): OutboundAdapter {
  const config = loadDeliveryConfig({ DATA_DIR: dataDir, MAIL_FROM: SENDER }, base());
  expect(config.outbound).toEqual({ mode: 'capture' });
  return createOutboundAdapter(config.outbound, { dataDir });
}

async function addSession(date: string, from: string, to: string) {
  const response = await t.request('POST', `/api/days/${date}/sessions`, {
    cookie: employee,
    body: { start: la(`${date}T${from}`), end: la(`${date}T${to}`), input_zone: LA, breaks: [], breaks_confirmed: true },
  });
  expect(response.status, JSON.stringify(response.body)).toBe(201);
}

/** A signed revision of the employee; with `pdf` its final PDF is rendered (send job still queued). */
async function finalized(options: { recipients?: boolean; pdf?: boolean } = {}) {
  if (options.recipients !== false) {
    const settings = await t.request('POST', '/api/settings/submission', {
      cookie: employee,
      body: { expected_seq: 0, to: TO, cc: CC, auto_submit: false },
    });
    expect(settings.status, JSON.stringify(settings.body)).toBeLessThan(300);
  }
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
    const summary = await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-pdf', handlers: { render_pdf: createPdfJobHandler({ db: t.db, clock: t.clock, files }) } });
    expect(summary).toMatchObject({ claimed: 1, succeeded: 1 });
  }
  const sendJobId = t.db.prepare("SELECT id FROM jobs WHERE revision_id = ? AND kind = 'send_email'").pluck().get(revisionId) as string;
  return { revisionId, sendJobId };
}

function runSend(outbound: OutboundAdapter, options: { sender?: string | null; hooks?: SendJobHooks; owner?: string } = {}) {
  const handler = createSendJobHandler({
    db: t.db,
    clock: t.clock,
    files,
    outbound,
    senderAddress: options.sender === undefined ? SENDER : options.sender,
    ...(options.hooks === undefined ? {} : { hooks: options.hooks }),
  });
  return runJobsOnce({ db: t.db, clock: t.clock, owner: options.owner ?? 'runner-send', handlers: { send_email: handler } });
}

interface AttemptRow {
  id: string;
  job_id: string;
  attempt_no: number;
  state: string;
  message_id: string;
  provider_message_id: string | null;
  provider_response: string | null;
  accepted_at: string | null;
  decision: string | null;
  attachment_id: string | null;
  envelope_json: string;
}

function attempts(revisionId: string): AttemptRow[] {
  return t.db.prepare('SELECT * FROM delivery_attempts WHERE revision_id = ? ORDER BY started_at, attempt_no').all(revisionId) as AttemptRow[];
}

function job(id: string) {
  return t.db.prepare('SELECT state, attempts, last_error, next_run_at FROM jobs WHERE id = ?').get(id) as {
    state: string;
    attempts: number;
    last_error: string | null;
    next_run_at: string;
  };
}

function storedPdf(revisionId: string): { storage_key: string; sha256: string; id: string } {
  return t.db
    .prepare("SELECT a.id, a.storage_key, a.sha256 FROM revision_files f JOIN attachments a ON a.id = f.attachment_id WHERE f.revision_id = ? AND f.state = 'ready'")
    .get(revisionId) as { storage_key: string; sha256: string; id: string };
}

function snapshotOf(revisionId: string) {
  const row = t.db.prepare('SELECT payload_json, revision_no FROM timesheet_revisions WHERE id = ?').get(revisionId) as { payload_json: string; revision_no: number };
  return { snapshot: JSON.parse(row.payload_json), revisionNo: row.revision_no };
}

function ledgerState() {
  return {
    ledger: count('SELECT count(*) FROM ot_ledger'),
    lines: count('SELECT count(*) FROM revision_ledger_lines'),
    revisions: count('SELECT count(*) FROM timesheet_revisions'),
    signoffs: count('SELECT count(*) FROM signoffs'),
  };
}

// ------------------------------------------------------------------- MIME reading ----

interface MimePart {
  headers: Map<string, string>;
  body: string;
}

function parsePart(raw: string): MimePart {
  const split = raw.indexOf('\r\n\r\n');
  const head = split < 0 ? raw : raw.slice(0, split);
  const body = split < 0 ? '' : raw.slice(split + 4);
  const headers = new Map<string, string>();
  for (const line of head.replace(/\r\n[ \t]+/g, ' ').split('\r\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) headers.set(line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim());
  }
  return { headers, body };
}

function leaves(part: MimePart): MimePart[] {
  const type = part.headers.get('content-type') ?? 'text/plain';
  const boundary = /boundary="?([^";]+)"?/i.exec(type)?.[1];
  if (!type.toLowerCase().startsWith('multipart/') || boundary === undefined) return [part];
  const sections = part.body.split(`--${boundary}`);
  return sections
    .slice(1, -1)
    .map((section) => parsePart(section.replace(/^\r\n/, '').replace(/\r\n$/, '')))
    .flatMap(leaves);
}

function decode(part: MimePart): Buffer {
  const encoding = (part.headers.get('content-transfer-encoding') ?? '7bit').toLowerCase();
  if (encoding === 'base64') return Buffer.from(part.body.replace(/\s+/g, ''), 'base64');
  if (encoding === 'quoted-printable') {
    const soft = part.body.replace(/=\r\n/g, '');
    const bytes: number[] = [];
    for (let index = 0; index < soft.length; index += 1) {
      const hex = soft.slice(index + 1, index + 3);
      if (soft[index] === '=' && /^[0-9A-F]{2}$/i.test(hex)) {
        bytes.push(parseInt(hex, 16));
        index += 2;
      } else {
        bytes.push(...Buffer.from(soft[index] ?? '', 'utf8'));
      }
    }
    return Buffer.from(bytes);
  }
  return Buffer.from(part.body, 'utf8');
}

/** The readable content of a message: headers, text, HTML and the attachment bytes. */
function readMessage(raw: Buffer) {
  const top = parsePart(raw.toString('latin1'));
  const parts = leaves(top);
  const byType = (prefix: string) => parts.find((part) => (part.headers.get('content-type') ?? '').toLowerCase().startsWith(prefix));
  const text = byType('text/plain');
  const html = byType('text/html');
  const pdf = byType('application/pdf');
  const utf8 = (part: MimePart | undefined) => (part === undefined ? null : Buffer.from(decode(part).toString('latin1'), 'latin1').toString('utf8').replace(/\r\n/g, '\n'));
  return {
    headers: top.headers,
    text: utf8(text),
    html: utf8(html),
    pdf: pdf === undefined ? null : decode(pdf),
    pdfName: pdf?.headers.get('content-disposition') ?? null,
  };
}

const sameText = (actual: string | null, expected: string) => expect(actual?.replace(/\n+$/, '')).toBe(expected.replace(/\r\n/g, '\n').replace(/\n+$/, ''));

// ---------------------------------------------------------------------------------------

describe('capture (default outbound mode)', () => {
  it('writes the exact message and PDF from the frozen snapshot and records the acceptance', async () => {
    const { revisionId, sendJobId } = await finalized();
    const before = ledgerState();
    // The default configuration: capture, through the production handler registration.
    const delivery = loadDeliveryConfig({ DATA_DIR: dataDir, MAIL_FROM: SENDER }, base());
    const handlers = createJobHandlers({ db: t.db, clock: t.clock, files, delivery });
    t.clock.set('2026-09-29T20:10:00Z');
    const summary = await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-default', handlers });
    expect(summary).toMatchObject({ claimed: 1, succeeded: 1 });

    const [attempt, ...others] = attempts(revisionId);
    expect(others).toHaveLength(0);
    if (attempt === undefined) throw new Error('no attempt');
    const pdf = storedPdf(revisionId);
    const { snapshot, revisionNo } = snapshotOf(revisionId);
    expect(attempt).toMatchObject({ job_id: sendJobId, attempt_no: 1, state: 'accepted', accepted_at: '2026-09-29T20:10:00Z', provider_response: 'captured', attachment_id: pdf.id });
    expect(attempt.provider_message_id).toMatch(/^capture-[0-9a-f]{32}$/);
    expect(attempt.message_id).toMatch(/^<[0-9a-f-]{36}@timesheet\.invalid>$/);
    expect(JSON.parse(attempt.envelope_json)).toMatchObject({ revision_id: revisionId, to: TO, cc: CC, subject: snapshot.recipients.subject, attachment_sha256: pdf.sha256 });
    expect(job(sendJobId)).toMatchObject({ state: 'succeeded', attempts: 1, last_error: null });

    const folder = captureFolder(dataDir, attempt.id);
    expect(readdirSync(folder).sort()).toEqual(['attachment.pdf', 'message.eml', 'metadata.json']);
    const eml = readFileSync(join(folder, 'message.eml'));
    const attached = readFileSync(join(folder, 'attachment.pdf'));
    const stored = files.read(pdf.storage_key);
    expect(sha(attached)).toBe(pdf.sha256);
    expect(attached.equals(stored)).toBe(true);

    const message = readMessage(eml);
    expect(message.headers.get('from')).toBe(SENDER);
    expect(message.headers.get('to')).toBe(TO.join(', '));
    expect(message.headers.get('cc')).toBe(CC.join(', '));
    expect(message.headers.get('subject')).toBe(snapshot.recipients.subject);
    expect(message.headers.get('message-id')).toBe(attempt.message_id);
    expect(message.headers.has('x-mailer')).toBe(false);
    sameText(message.text, snapshot.recipients.body_text);
    sameText(message.html, snapshot.recipients.body_html);
    expect(message.pdf?.equals(stored)).toBe(true);
    expect(message.pdfName).toContain(`timesheet-${PAYROLL}-r${revisionNo}.pdf`);
    // The provider id is derived from the exact captured bytes.
    expect(attempt.provider_message_id).toBe(`capture-${sha(eml).slice(0, 32)}`);

    const metadata = JSON.parse(readFileSync(join(folder, 'metadata.json'), 'utf8'));
    expect(metadata).toEqual({
      mode: 'capture',
      message_id: attempt.message_id,
      envelope: { from: SENDER, to: [...TO, ...CC] },
      eml_sha256: sha(eml),
      eml_bytes: eml.length,
      pdf_sha256: pdf.sha256,
      pdf_bytes: stored.length,
    });
    // The bytes are exactly what the builder makes from the snapshot, the stored PDF, the attempt's Message-ID and send instant.
    const rebuilt = await buildMessage({ snapshot, revisionNo, senderAddress: SENDER, messageId: attempt.message_id, date: new Date('2026-09-29T20:10:00Z'), pdf: stored });
    expect(rebuilt.raw.equals(eml)).toBe(true);

    // Nothing posted; a later pass sends nothing more.
    expect(ledgerState()).toEqual(before);
    t.clock.advanceSeconds(3600);
    expect((await runJobsOnce({ db: t.db, clock: t.clock, owner: 'runner-default', handlers })).claimed).toBe(0);
    expect(readdirSync(join(dataDir, 'mail-capture'))).toEqual([attempt.id]);
  });

  it('waits for the PDF without creating an attempt', async () => {
    const { revisionId, sendJobId } = await finalized({ pdf: false });
    const summary = await runSend(captureOutbound());
    expect(summary).toMatchObject({ claimed: 1, retried: 1 });
    expect(attempts(revisionId)).toHaveLength(0);
    expect(job(sendJobId)).toMatchObject({ state: 'queued', attempts: 1, last_error: 'pdf_not_ready', next_run_at: '2026-09-29T20:01:00Z' });
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
  });

  it('a message without an attachment (a reminder or notice) writes no attachment.pdf', async () => {
    const attemptId = '3b0f6f0e-0a52-4c3a-9d0b-6d2f0a6b7c11';
    const raw = Buffer.from(['From: timesheet@example.invalid', 'To: payroll@example.invalid', 'Subject: Synthetic notice', '', 'Body', ''].join('\r\n'), 'utf8');
    const outcome = await createOutboundAdapter({ mode: 'capture' }, { dataDir }).send(
      { messageId: '<notice@timesheet.invalid>', envelope: { from: SENDER, to: TO }, raw, pdf: new Uint8Array(0), pdfSha256: sha(new Uint8Array(0)) },
      { attemptId },
    );
    expect(outcome).toMatchObject({ kind: 'accepted', providerResponse: 'captured' });
    const folder = captureFolder(dataDir, attemptId);
    expect(readdirSync(folder).sort()).toEqual(['message.eml', 'metadata.json']);
    expect(JSON.parse(readFileSync(join(folder, 'metadata.json'), 'utf8'))).toEqual({
      mode: 'capture',
      message_id: '<notice@timesheet.invalid>',
      envelope: { from: SENDER, to: TO },
      eml_sha256: sha(raw),
      eml_bytes: raw.length,
    });
    // A second send of the same attempt is still refused as already captured.
    expect(await createOutboundAdapter({ mode: 'capture' }, { dataDir }).send(
      { messageId: '<notice@timesheet.invalid>', envelope: { from: SENDER, to: TO }, raw, pdf: new Uint8Array(0), pdfSha256: sha(new Uint8Array(0)) },
      { attemptId },
    )).toMatchObject({ kind: 'uncertain', code: 'capture_exists' });
  });

  it('enqueues a duplicate send job once and sends once', async () => {
    const { revisionId, sendJobId } = await finalized();
    const duplicate = enqueueJob(t.db, t.clock, {
      kind: 'send_email',
      businessKey: `revision:${revisionId}:send_email:initial`,
      userId: t.userIds.employee,
      revisionId,
      payload: { revision_id: revisionId },
    });
    expect(duplicate).toMatchObject({ created: false, job: { id: sendJobId } });
    expect(count("SELECT count(*) FROM jobs WHERE revision_id = ? AND kind = 'send_email'", revisionId)).toBe(1);
    await runSend(captureOutbound());
    t.clock.advanceSeconds(7200);
    expect((await runSend(captureOutbound())).claimed).toBe(0);
    expect(attempts(revisionId).map((row) => row.state)).toEqual(['accepted']);
    expect(readdirSync(join(dataDir, 'mail-capture'))).toHaveLength(1);
  });
});

describe('SMTP adapter against the loopback sink (docs/05 failure table)', () => {
  it('acknowledged acceptance: provider id and time, the frozen envelope and content', async () => {
    const target = await sink();
    const { revisionId, sendJobId } = await finalized();
    const before = ledgerState();
    t.clock.set('2026-09-29T20:20:00Z');
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, succeeded: 1 });
    const [attempt] = attempts(revisionId);
    expect(attempt).toMatchObject({ state: 'accepted', provider_message_id: 'SINK0001', provider_response: '250', accepted_at: '2026-09-29T20:20:00Z' });
    expect(job(sendJobId).state).toBe('succeeded');
    expect(target.logins).toBe(1);
    expect(target.messages).toHaveLength(1);
    const [received] = target.messages;
    expect(received?.from).toBe(SENDER);
    expect(received?.to).toEqual([...TO, ...CC]);
    const message = readMessage(received?.raw ?? Buffer.alloc(0));
    const { snapshot } = snapshotOf(revisionId);
    expect(message.headers.get('message-id')).toBe(attempt?.message_id);
    expect(message.headers.get('subject')).toBe(snapshot.recipients.subject);
    sameText(message.text, snapshot.recipients.body_text);
    expect(message.pdf?.equals(files.read(storedPdf(revisionId).storage_key))).toBe(true);
    expect(ledgerState()).toEqual(before);
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
  });

  it('implicit TLS (SMTP_SECURITY=tls) and an untrusted certificate', async () => {
    const target = await sink({ implicitTls: true });
    const { revisionId } = await finalized();
    const config = loadDeliveryConfig({ ...smtpEnv(target.port), SMTP_SECURITY: 'tls' }, base());
    // Without the test CA the certificate is not trusted: refused before any transfer, nothing sent.
    expect(await runSend(createOutboundAdapter(config.outbound, { dataDir }))).toMatchObject({ claimed: 1, retried: 1 });
    expect(target.transactions).toBe(0);
    t.clock.advanceSeconds(60);
    expect(await runSend(createOutboundAdapter(config.outbound, { dataDir, smtp: { trustedCa: target.ca } }))).toMatchObject({ claimed: 1, succeeded: 1 });
    expect(attempts(revisionId).map((row) => row.state)).toEqual(['failed_temporary', 'accepted']);
    expect(target.messages).toHaveLength(1);
  });

  it('pre-transfer failure (connection lost before DATA, or refused): temporary, retried, then accepted with a new attempt', async () => {
    const target = await sink({ behaviour: 'drop_before_data' });
    const { revisionId, sendJobId } = await finalized();
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, retried: 1 });
    expect(attempts(revisionId).map((row) => [row.state, row.provider_response])).toEqual([['failed_temporary', 'smtp_unavailable']]);
    expect(job(sendJobId)).toMatchObject({ state: 'queued', last_error: 'smtp_unavailable', next_run_at: '2026-09-29T20:01:00Z' });
    expect(target.messages).toHaveLength(0);

    // A closed port: also definitely before the transfer.
    const closed = await sink();
    const outbound = smtpOutbound(closed);
    await closed.close();
    sinks.splice(sinks.indexOf(closed), 1);
    t.clock.set('2026-09-29T20:01:00Z');
    expect(await runSend(outbound)).toMatchObject({ claimed: 1, retried: 1 });
    expect(job(sendJobId)).toMatchObject({ state: 'queued', attempts: 2, last_error: 'smtp_unavailable', next_run_at: '2026-09-29T20:06:00Z' });

    target.setBehaviour('accept');
    t.clock.set('2026-09-29T20:06:00Z');
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, succeeded: 1 });
    const rows = attempts(revisionId);
    expect(rows.map((row) => [row.attempt_no, row.state])).toEqual([
      [1, 'failed_temporary'],
      [2, 'failed_temporary'],
      [3, 'accepted'],
    ]);
    // A stable Message-ID per attempt: each attempt has its own, and the accepted one is in the received message.
    expect(new Set(rows.map((row) => row.message_id)).size).toBe(3);
    expect(target.messages).toHaveLength(1);
    expect(readMessage(target.messages[0]?.raw ?? Buffer.alloc(0)).headers.get('message-id')).toBe(rows[2]?.message_id);
  });

  for (const [behaviour, code, reply] of [
    ['reject_rcpt_temporary', 'smtp_envelope_rejected_temporary', '451'],
    ['reject_data_temporary', 'smtp_message_rejected_temporary', '451'],
  ] as const) {
    it(`explicit temporary rejection (${behaviour}): failed_temporary and retried through the job store`, async () => {
      const target = await sink({ behaviour });
      const { revisionId, sendJobId } = await finalized();
      expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, retried: 1 });
      expect(attempts(revisionId).map((row) => [row.state, row.provider_response, row.accepted_at])).toEqual([['failed_temporary', `${code} ${reply}`, null]]);
      expect(job(sendJobId)).toMatchObject({ state: 'queued', attempts: 1, last_error: code });
      target.setBehaviour('accept');
      t.clock.advanceSeconds(60);
      expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, succeeded: 1 });
      expect(attempts(revisionId).map((row) => row.state)).toEqual(['failed_temporary', 'accepted']);
    });
  }

  for (const [behaviour, code, reply] of [
    ['reject_rcpt_permanent', 'smtp_envelope_rejected_permanent', '550'],
    ['reject_data_permanent', 'smtp_message_rejected_permanent', '554'],
  ] as const) {
    it(`explicit permanent rejection (${behaviour}): failed_permanent, intervention, never retried`, async () => {
      const target = await sink({ behaviour });
      const { revisionId, sendJobId } = await finalized();
      expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, intervention: 1 });
      expect(attempts(revisionId).map((row) => [row.state, row.provider_response])).toEqual([['failed_permanent', `${code} ${reply}`]]);
      expect(job(sendJobId)).toMatchObject({ state: 'intervention', last_error: code });
      const transactions = target.transactions;
      target.setBehaviour('accept');
      t.clock.advanceSeconds(7200);
      expect((await runSend(smtpOutbound(target))).claimed).toBe(0);
      expect(target.transactions).toBe(transactions);
    });
  }

  it('uncertain (connection lost after DATA): never retried; one explicit resend creates one new attempt', async () => {
    const target = await sink({ behaviour: 'drop_after_data' });
    const { revisionId, sendJobId } = await finalized();
    const before = ledgerState();
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, intervention: 1 });
    const [uncertain] = attempts(revisionId);
    expect(uncertain).toMatchObject({ state: 'uncertain', provider_response: 'smtp_connection_lost_after_data', decision: null, accepted_at: null });
    expect(job(sendJobId)).toMatchObject({ state: 'intervention', last_error: 'delivery_uncertain' });
    expect(target.messages).toHaveLength(1); // the server got the whole message, then the connection died

    // No automatic resend, however long we wait (beyond every retry delay; within the session lifetime).
    target.setBehaviour('accept');
    t.clock.advanceSeconds(6 * 3600);
    expect((await runSend(smtpOutbound(target))).claimed).toBe(0);
    expect(target.transactions).toBe(1);

    // The owner sees the decision (a write-free read); the same-revision resend is refused until a decision exists.
    const rowsBefore = JSON.stringify([t.db.prepare('SELECT * FROM delivery_attempts').all(), t.db.prepare('SELECT * FROM jobs').all(), count('SELECT count(*) FROM audit_events')]);
    const history = await t.request('GET', '/api/deliveries', { cookie: employee });
    expect(history.status).toBe(200);
    expect(JSON.stringify([t.db.prepare('SELECT * FROM delivery_attempts').all(), t.db.prepare('SELECT * FROM jobs').all(), count('SELECT count(*) FROM audit_events')])).toBe(rowsBefore);
    expect(history.body.deliveries).toHaveLength(1);
    expect(history.body.deliveries[0]).toMatchObject({ id: uncertain?.id, state: 'uncertain', decision_required: true, revision_id: revisionId, payroll_date: PAYROLL, to: TO, cc: CC, job: { state: 'intervention', last_error: 'delivery_uncertain' } });
    const refused = await t.request('POST', `/api/revisions/${revisionId}/resend`, { cookie: employee, body: {} });
    expect(refused.status).toBe(409);
    expect(refused.body.error.code).toBe('delivery_uncertain');

    const decided = await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { cookie: employee, body: { decision: 'resend' } });
    expect(decided.status, JSON.stringify(decided.body)).toBe(201);
    expect(decided.body.attempt).toMatchObject({ id: uncertain?.id, state: 'uncertain', decision: 'resend', decision_required: false });
    expect(decided.body.resend).toMatchObject({ revision_id: revisionId, job: { kind: 'send_email', state: 'queued' }, attempt: { attempt_no: 1, state: 'preparing' } });
    const again = await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { cookie: employee, body: { decision: 'resend' } });
    expect(again.status).toBe(409);
    expect(again.body.error.code).toBe('delivery_decision_recorded');
    expect(count("SELECT count(*) FROM jobs WHERE revision_id = ? AND kind = 'send_email'", revisionId)).toBe(2);
    const audit = t.db.prepare("SELECT actor_user_id, after_json FROM audit_events WHERE operation = 'delivery.decision'").all() as Array<{ actor_user_id: string; after_json: string }>;
    expect(audit).toHaveLength(1);
    expect(JSON.parse(audit[0]?.after_json ?? '{}')).toMatchObject({ decision: 'resend', resend_attempt_id: decided.body.resend.attempt.id });

    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, succeeded: 1 });
    const rows = attempts(revisionId);
    expect(rows.map((row) => [row.state, row.decision])).toEqual([
      ['uncertain', 'resend'],
      ['accepted', null],
    ]);
    expect(rows[1]?.id).toBe(decided.body.resend.attempt.id);
    expect(rows[1]?.message_id).not.toBe(rows[0]?.message_id);
    expect(target.messages).toHaveLength(2);
    expect(ledgerState()).toEqual(before);
  });

  it('mark delivered closes the uncertain attempt without sending', async () => {
    const target = await sink({ behaviour: 'drop_after_data' });
    const { revisionId } = await finalized();
    await runSend(smtpOutbound(target));
    const [uncertain] = attempts(revisionId);
    const decided = await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { cookie: employee, body: { decision: 'mark_delivered' } });
    expect(decided.status).toBe(200);
    expect(decided.body).toMatchObject({ attempt: { state: 'uncertain', decision: 'mark_delivered', decision_required: false }, resend: null });
    expect(t.db.prepare('SELECT decision, decision_actor_user_id FROM delivery_attempts WHERE id = ?').get(uncertain?.id)).toEqual({
      decision: 'treat_as_accepted',
      decision_actor_user_id: t.userIds.employee,
    });
    expect(count("SELECT count(*) FROM jobs WHERE revision_id = ? AND kind = 'send_email'", revisionId)).toBe(1);
    expect(target.messages).toHaveLength(1);
  });

  it('classifies a timeout or loss after the transfer began as uncertain and before it as temporary', () => {
    expect(classifySmtpFailure({ code: 'ETIMEDOUT' }, 'transfer')).toMatchObject({ kind: 'uncertain', code: 'smtp_timeout_after_data' });
    expect(classifySmtpFailure({ code: 'ECONNECTION' }, 'transfer')).toMatchObject({ kind: 'uncertain' });
    expect(classifySmtpFailure({ code: 'ETIMEDOUT' }, 'envelope')).toMatchObject({ kind: 'failed_temporary', code: 'smtp_timeout_before_data' });
    expect(classifySmtpFailure({ code: 'ECONNECTION', responseCode: 421, response: '421 4.3.2 shutting down for rcpt@example.invalid' }, 'transfer')).toEqual({
      kind: 'failed_temporary',
      code: 'smtp_message_rejected_temporary',
      providerResponse: '421 4.3.2',
    });
    expect(classifySmtpFailure({ code: 'EAUTH', responseCode: 535, response: '535 5.7.8 bad' }, 'auth')).toMatchObject({ kind: 'failed_permanent', code: 'smtp_auth_failed' });
    expect(classifySmtpFailure({ code: 'ETLS' }, 'connect')).toMatchObject({ kind: 'failed_permanent', code: 'smtp_tls_failed' });
  });
});

describe('integrity and visible faults', () => {
  it('a PDF hash mismatch blocks the send', async () => {
    const target = await sink();
    const { revisionId, sendJobId } = await finalized();
    const pdf = storedPdf(revisionId);
    const path = files.pathOf(pdf.storage_key);
    const tampered = Buffer.from(readFileSync(path));
    tampered[tampered.length - 2] = (tampered[tampered.length - 2] ?? 0) ^ 0xff;
    writeFileSync(path, tampered);
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, intervention: 1 });
    expect(attempts(revisionId).map((row) => [row.state, row.provider_response])).toEqual([['failed_permanent', 'pdf_hash_mismatch']]);
    expect(job(sendJobId)).toMatchObject({ state: 'intervention', last_error: 'pdf_hash_mismatch' });
    expect(target.transactions).toBe(0);
    await runSend(captureOutbound());
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
  });

  it('a missing sender is a visible fault, never "sent"', async () => {
    const { revisionId, sendJobId } = await finalized();
    expect(await runSend(captureOutbound(), { sender: null })).toMatchObject({ claimed: 1, intervention: 1 });
    expect(attempts(revisionId).map((row) => [row.state, row.provider_response, row.accepted_at])).toEqual([['failed_permanent', 'sender_missing', null]]);
    expect(job(sendJobId)).toMatchObject({ state: 'intervention', last_error: 'sender_missing' });
    const history = await t.request('GET', `/api/deliveries?revision_id=${revisionId}`, { cookie: employee });
    expect(history.body.deliveries).toEqual([expect.objectContaining({ state: 'failed_permanent', provider_response: 'sender_missing', accepted_at: null, job: { state: 'intervention', last_error: 'sender_missing' } })]);
    const status = await t.request('GET', `/api/timesheets/${PAYROLL}/finalization`, { cookie: employee });
    expect(status.body.jobs).toContainEqual(expect.objectContaining({ kind: 'send_email', state: 'intervention' }));
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
    // The production registration without MAIL_FROM gives the same fault.
    const delivery = loadDeliveryConfig({ DATA_DIR: dataDir }, base());
    expect(delivery.senderAddress).toBeNull();
  });

  it('a missing recipient is a visible fault, never "sent"', async () => {
    const target = await sink();
    const { revisionId, sendJobId } = await finalized({ recipients: false });
    expect(snapshotOf(revisionId).snapshot.recipients.to).toEqual([]);
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, intervention: 1 });
    expect(attempts(revisionId).map((row) => [row.state, row.provider_response])).toEqual([['failed_permanent', 'recipient_missing']]);
    expect(job(sendJobId)).toMatchObject({ state: 'intervention', last_error: 'recipient_missing' });
    expect(target.transactions).toBe(0);
  });

  it('the builder refuses a missing or malformed sender and recipient', async () => {
    const { revisionId } = await finalized();
    const { snapshot, revisionNo } = snapshotOf(revisionId);
    const source = { snapshot, revisionNo, senderAddress: SENDER, messageId: '<a@timesheet.invalid>', date: new Date(0), pdf: new Uint8Array([1]) };
    const code = async (overrides: Record<string, unknown>) => {
      try {
        await buildMessage({ ...source, ...overrides });
        return 'built';
      } catch (error) {
        return error instanceof MessageError ? error.code : 'other';
      }
    };
    expect(await code({})).toBe('built');
    expect(await code({ senderAddress: null })).toBe('sender_missing');
    expect(await code({ senderAddress: 'a@b.invalid\r\nBcc: x@example.invalid' })).toBe('sender_invalid');
    expect(await code({ snapshot: { ...snapshot, recipients: { ...snapshot.recipients, to: [] } } })).toBe('recipient_missing');
    expect(await code({ snapshot: { ...snapshot, recipients: { ...snapshot.recipients, cc: ['x@example.invalid, y@example.invalid'] } } })).toBe('recipient_invalid');
    expect(await code({ messageId: '<a@b>\r\nX: y' })).toBe('message_id_invalid');
  });

  it('a process lost after `sending` was committed leaves the attempt uncertain and sends nothing later', async () => {
    const target = await sink();
    const { revisionId, sendJobId } = await finalized();
    const crash: SendJobHooks = {
      beforeSend: () => {
        throw new Error('simulated loss after the sending state was committed');
      },
    };
    expect(await runSend(smtpOutbound(target), { hooks: crash })).toMatchObject({ claimed: 1, retried: 1 });
    expect(attempts(revisionId).map((row) => row.state)).toEqual(['sending']);
    t.clock.advanceSeconds(60);
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, intervention: 1 });
    expect(attempts(revisionId).map((row) => [row.state, row.provider_response])).toEqual([['uncertain', 'lease_expired_while_sending']]);
    expect(job(sendJobId)).toMatchObject({ state: 'intervention', last_error: 'delivery_uncertain' });
    expect(target.transactions).toBe(0);
  });

  it('a process lost during the LAST permitted attempt is uncertain with the owner decision, like any earlier attempt (WP3-B-02)', async () => {
    const { revisionId, sendJobId } = await finalized();
    const flaky: OutboundAdapter = { mode: 'capture', send: async () => ({ kind: 'failed_temporary', code: 'smtp_unavailable', providerResponse: '421' }) };
    for (let round = 0; round < 4; round += 1) {
      expect(await runSend(flaky)).toMatchObject({ claimed: 1, retried: 1 });
      t.clock.set(job(sendJobId).next_run_at);
    }
    expect(job(sendJobId)).toMatchObject({ state: 'queued', attempts: 4 });
    // The fifth (last) attempt: `sending` is committed, then the process dies without releasing the job.
    const crash: SendJobHooks = {
      beforeSend: () => {
        throw new Error('simulated loss after the sending state was committed');
      },
    };
    await runSend(captureOutbound(), { hooks: crash });
    t.db
      .prepare("UPDATE jobs SET state = 'leased', lease_owner = 'runner-dead', lease_expires_at = ?, last_error = NULL WHERE id = ?")
      .run(new Date(t.clock.now().getTime() + 60_000).toISOString().replace('.000Z', 'Z'), sendJobId);
    expect(attempts(revisionId).map((row) => row.state)).toEqual(['failed_temporary', 'failed_temporary', 'failed_temporary', 'failed_temporary', 'sending']);
    expect(job(sendJobId)).toMatchObject({ state: 'leased', attempts: 5 });

    // One ordinary runner pass after the lease expired (no other send job anywhere).
    t.clock.advanceSeconds(61);
    expect(await runSend(captureOutbound())).toMatchObject({ claimed: 0 });
    expect(attempts(revisionId).at(-1)).toMatchObject({ attempt_no: 5, state: 'uncertain', provider_response: 'lease_expired_while_sending', decision: null });
    expect(job(sendJobId).state).toBe('intervention');
    const listed = await t.request('GET', '/api/deliveries', { cookie: employee });
    const last = (listed.body.deliveries as Array<{ attempt_no: number; state: string; decision_required: boolean; id: string }>).find((row) => row.attempt_no === 5);
    expect(last).toMatchObject({ state: 'uncertain', decision_required: true });

    // Never resent automatically, however long we wait.
    t.clock.advanceSeconds(6 * 3600);
    expect(await runSend(captureOutbound())).toMatchObject({ claimed: 0 });
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
    // Without a decision a same-revision resend is refused with the decision prompt, not "in progress".
    const refused = await t.request('POST', `/api/revisions/${revisionId}/resend`, { cookie: employee, body: {} });
    expect(refused.status).toBe(409);
    expect(refused.body.error.code).toBe('delivery_uncertain');

    // One explicit decision resends exactly once.
    const decided = await t.request('POST', `/api/deliveries/${last?.id}/decision`, { cookie: employee, body: { decision: 'resend' } });
    expect(decided.status, JSON.stringify(decided.body)).toBe(201);
    expect(await runSend(captureOutbound())).toMatchObject({ claimed: 1, succeeded: 1 });
    expect(attempts(revisionId).map((row) => row.state).slice(-2)).toEqual(['uncertain', 'accepted']);
    expect(readdirSync(join(dataDir, 'mail-capture'))).toHaveLength(1);
    expect(await runSend(captureOutbound())).toMatchObject({ claimed: 0 });
    expect(readdirSync(join(dataDir, 'mail-capture'))).toHaveLength(1);
  });
});

describe('the send handler meets an attempt that is still `sending` (WP3-FIX2, WP3-RECHECK-BC item 5)', () => {
  it('marks the attempt uncertain and stops the job for good, never resending, when the handler itself finds `sending`', async () => {
    const { revisionId, sendJobId } = await finalized();
    const crash: SendJobHooks = {
      beforeSend: () => {
        throw new Error('simulated loss after the sending state was committed');
      },
    };
    expect(await runSend(captureOutbound(), { hooks: crash, owner: 'runner-dead' })).toMatchObject({ claimed: 1, retried: 1 });
    expect(attempts(revisionId).map((row) => row.state)).toEqual(['sending']);
    // The dead runner still holds a lease that is valid for one more minute: a pass-start recovery changes nothing.
    t.db
      .prepare("UPDATE jobs SET state = 'leased', lease_owner = 'runner-dead', lease_expires_at = ?, last_error = NULL WHERE id = ?")
      .run(new Date(t.clock.now().getTime() + 60_000).toISOString().replace('.000Z', 'Z'), sendJobId);
    expect(recoverInterruptedSends(t.db, t.clock)).toBe(0);
    // The lease then expires after that recovery and before the claim: the claim reclaims the job with the
    // attempt still `sending`, so the handler's own branch is the one that must stop it (no pass-start recovery here).
    t.clock.advanceSeconds(61);
    const claimed = claimNextJob(t.db, t.clock, { owner: 'runner-reclaim', kinds: ['send_email'] });
    expect(claimed?.id).toBe(sendJobId);
    if (claimed === null) throw new Error('The job was not reclaimed');
    expect(attempts(revisionId).map((row) => row.state)).toEqual(['sending']);
    const handler = createSendJobHandler({ db: t.db, clock: t.clock, files, outbound: captureOutbound(), senderAddress: SENDER });
    // The handler's own recovery sees a valid lease (this runner's), so only the `sending` branch can stop it.
    const caught = await handler({ job: claimed, renewLease: () => true }).then(
      () => null,
      (error: unknown) => error,
    );
    expect(caught).toMatchObject({ name: 'JobError', code: 'delivery_uncertain', permanent: true });
    expect(attempts(revisionId).map((row) => [row.state, row.provider_response, row.decision])).toEqual([['uncertain', 'lease_expired_while_sending', null]]);
    expect(failJob(t.db, t.clock, claimed.id, 'runner-reclaim', caught)).toEqual({ state: 'intervention' });
    expect(job(sendJobId)).toMatchObject({ state: 'intervention', last_error: 'delivery_uncertain' });
    // Nothing was sent, and nothing sends later: the owner's decision is the only way on.
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
    t.clock.advanceSeconds(6 * 3600);
    expect(await runSend(captureOutbound())).toMatchObject({ claimed: 0 });
    expect(existsSync(join(dataDir, 'mail-capture'))).toBe(false);
  });
});

describe('owner scoping', () => {
  it('another user cannot see or decide an attempt (404 on ID swap)', async () => {
    const target = await sink({ behaviour: 'drop_after_data' });
    const { revisionId } = await finalized();
    await runSend(smtpOutbound(target));
    const [uncertain] = attempts(revisionId);
    const admin = await t.login('admin');
    const swapped = await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { cookie: admin, body: { decision: 'resend' } });
    expect(swapped.status).toBe(404);
    expect(swapped.body.error.code).toBe('not_found');
    const unknown = await t.request('POST', '/api/deliveries/00000000-0000-4000-8000-000000000000/decision', { cookie: admin, body: { decision: 'resend' } });
    expect(unknown.status).toBe(404);
    expect(swapped.body).toEqual(unknown.body);
    const list = await t.request('GET', '/api/deliveries', { cookie: admin });
    expect(list.body).toEqual({ deliveries: [] });
    const filtered = await t.request('GET', `/api/deliveries?revision_id=${revisionId}`, { cookie: admin });
    expect(filtered.body).toEqual({ deliveries: [] });
    expect(t.db.prepare('SELECT decision FROM delivery_attempts WHERE id = ?').pluck().get(uncertain?.id)).toBeNull();
    // Anonymous, cross-site and malformed requests change nothing.
    expect((await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { body: { decision: 'resend' } })).status).toBe(401);
    expect((await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { cookie: employee, origin: 'https://evil.example.invalid', body: { decision: 'resend' } })).status).toBe(403);
    const invalid = await t.request('POST', `/api/deliveries/${uncertain?.id}/decision`, { cookie: employee, body: { decision: 'abandon', user_id: t.userIds.admin } });
    expect(invalid.status).toBe(422);
    expect((await t.request('GET', '/api/deliveries?revision_id=x', { cookie: employee })).status).toBe(422);
    expect(t.db.prepare('SELECT decision FROM delivery_attempts WHERE id = ?').pluck().get(uncertain?.id)).toBeNull();
  });

  it('only an uncertain attempt takes a decision', async () => {
    const { revisionId } = await finalized();
    await runSend(captureOutbound());
    const [accepted] = attempts(revisionId);
    const response = await t.request('POST', `/api/deliveries/${accepted?.id}/decision`, { cookie: employee, body: { decision: 'resend' } });
    expect(response.status).toBe(409);
    expect(response.body.error).toMatchObject({ code: 'delivery_not_uncertain', details: { state: 'accepted' } });
    expect(count("SELECT count(*) FROM jobs WHERE revision_id = ? AND kind = 'send_email'", revisionId)).toBe(1);
  });
});

describe('secrets and the owner-only sending flag', () => {
  it('SMTP mode is refused without the owner-only flag; the test process never sets it', () => {
    expect(process.env.PRODUCTION_SENDING_ENABLED).toBeUndefined();
    const env = smtpEnv(2525);
    const { PRODUCTION_SENDING_ENABLED: _flag, ...unflagged } = env;
    expect(() => loadDeliveryConfig(unflagged, base())).toThrow(/PRODUCTION_SENDING_ENABLED/);
    expect(() => loadDeliveryConfig({ ...env, PRODUCTION_SENDING_ENABLED: '1' }, base())).toThrow(/PRODUCTION_SENDING_ENABLED/);
    // Without OUTBOUND_MODE the adapter is capture, even when SMTP variables are present.
    const capture = loadDeliveryConfig({ ...unflagged, OUTBOUND_MODE: undefined }, base());
    expect(capture.outbound).toEqual({ mode: 'capture' });
    expect(createOutboundAdapter(capture.outbound, { dataDir }).mode).toBe('capture');
    expect(JSON.stringify(capture) + inspect(capture, { depth: 10 })).not.toContain(SECRET);
  });

  it('credentials never reach rows, logs, captured metadata or responses', async () => {
    const logged: string[] = [];
    for (const method of ['log', 'info', 'warn', 'error', 'debug'] as const) {
      vi.spyOn(console, method).mockImplementation((...args: unknown[]) => {
        logged.push(args.map((arg) => (typeof arg === 'string' ? arg : inspect(arg, { depth: 10 }))).join(' '));
      });
    }
    const target = await sink();
    const { revisionId } = await finalized();
    // A failed login with a wrong password, then an accepted send with the right one.
    expect(await runSend(smtpOutbound(target, WRONG_SECRET))).toMatchObject({ claimed: 1, intervention: 1 });
    expect(attempts(revisionId).map((row) => [row.state, row.provider_response])).toEqual([['failed_permanent', 'smtp_auth_failed 535']]);
    const resend = await t.request('POST', `/api/revisions/${revisionId}/resend`, { cookie: employee, body: {} });
    expect(resend.status, JSON.stringify(resend.body)).toBe(201);
    expect(await runSend(smtpOutbound(target))).toMatchObject({ claimed: 1, succeeded: 1 });
    expect(target.logins).toBe(1);

    // Capture mode with SMTP credentials present in its environment object reads none of them.
    const capture = loadDeliveryConfig({ DATA_DIR: dataDir, MAIL_FROM: SENDER, SMTP_USER, SMTP_PASSWORD: SECRET }, base());
    const again = await t.request('POST', `/api/revisions/${revisionId}/resend`, { cookie: employee, body: {} });
    expect(again.status).toBe(201);
    await runSend(createOutboundAdapter(capture.outbound, { dataDir }));
    const captured = attempts(revisionId).at(-1);
    expect(captured?.state).toBe('accepted');

    const responses = [
      await t.request('GET', '/api/deliveries', { cookie: employee }),
      await t.request('GET', `/api/timesheets/${PAYROLL}/finalization`, { cookie: employee }),
      resend,
      again,
    ].map((response) => JSON.stringify(response.body));
    const tables = t.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").pluck().all() as string[];
    const rows = tables.map((table) => JSON.stringify(t.db.prepare(`SELECT * FROM "${table}"`).all()));
    t.db.pragma('wal_checkpoint(TRUNCATE)');
    const databaseBytes = readFileSync(t.config.databasePath);
    const folder = captureFolder(dataDir, captured?.id ?? '');
    const capturedFiles = readdirSync(folder).map((name) => readFileSync(join(folder, name)));
    const { snapshot } = snapshotOf(revisionId);

    for (const secret of [SECRET, WRONG_SECRET, SMTP_USER]) {
      for (const text of [...responses, ...rows, ...logged]) expect(text).not.toContain(secret);
      expect(databaseBytes.includes(secret)).toBe(false);
      for (const bytes of capturedFiles) expect(bytes.includes(secret)).toBe(false);
    }
    // The delivery history carries no body and no storage key.
    expect(responses[0]).not.toContain(snapshot.recipients.body_text.slice(0, 40));
    expect(responses[0]).not.toContain(storedPdf(revisionId).storage_key);
    expect(logged).toEqual([]);
  });
});
