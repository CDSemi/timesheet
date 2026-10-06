#!/usr/bin/env node
// Smoke-tests the BUILT production server (dist/) end to end over real HTTP with a
// throwaway SQLite file, synthetic example.invalid users and random per-run passwords.
// Usage: npm run build && node scripts/smoke-built-server.mjs
// Port: SMOKE_PORT when set; otherwise a free loopback port chosen by the OS per run.
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Database from 'better-sqlite3';

/** Asks the OS for a free loopback port (bound, read, released). */
function freeLoopbackPort() {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => (address && typeof address === 'object' ? resolve(address.port) : reject(new Error('no port assigned'))));
    });
  });
}

const explicitPort = process.env.SMOKE_PORT;
let port;
try {
  port = explicitPort === undefined || explicitPort === '' ? await freeLoopbackPort() : Number(explicitPort);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`invalid SMOKE_PORT "${explicitPort}"`);
} catch (error) {
  console.log(`FAIL  port selection: ${error instanceof Error ? error.message : String(error)}`);
  console.log('SMOKE FAILED (1)');
  process.exit(1);
}
const base = `http://127.0.0.1:${port}`;
const origin = `http://localhost:${port}`;
const work = mkdtempSync(join(tmpdir(), 'timesheet-smoke-'));
const passwords = {
  admin: randomBytes(18).toString('base64url'),
  employee: randomBytes(18).toString('base64url'),
  employee2: randomBytes(18).toString('base64url'),
};
const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: String(port),
  HOST: '127.0.0.1',
  DATABASE_PATH: join(work, 'timesheet.db'),
  APP_ORIGINS: origin,
  // Capture mode with a synthetic sender; the server's own runner is off, the CLI runs the jobs.
  MAIL_FROM: 'smoke-sender@example.invalid',
  OUTBOUND_MODE: 'capture',
  JOB_RUNNER: 'off',
  SEED_ADMIN_PASSWORD: passwords.admin,
  SEED_EMPLOYEE_PASSWORD: passwords.employee,
  SEED_EMPLOYEE2_PASSWORD: passwords.employee2,
};

let failures = 0;
function check(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
  if (!condition) failures += 1;
}

const hideWorkDir = (text) => text.replaceAll(JSON.stringify(work).slice(1, -1), '<tmp>').replaceAll(work, '<tmp>');

function run(args) {
  const result = spawnSync(process.execPath, args, { env, encoding: 'utf8' });
  return { status: result.status, output: hideWorkDir(`${result.stdout}${result.stderr}`).trim() };
}

async function call(method, path, { cookie, body, withOrigin = true } = {}) {
  const headers = {};
  if (withOrigin) headers.origin = origin;
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: response.status, headers: response.headers, json, text };
}

function laDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, weekday: get('weekday') };
}

/** Latest Monday strictly before today (LA): always in the current or in-progress period. */
function recentMonday() {
  for (let back = 1; back <= 7; back += 1) {
    const candidate = laDateParts(new Date(Date.now() - back * 86_400_000));
    if (candidate.weekday === 'Mon') return candidate.date;
  }
  throw new Error('No Monday found');
}

const local = (date, time) => ({ local: `${date}T${time}`, zone: 'America/Los_Angeles' });

let server;
try {
  console.log(`node ${process.version}`);
  const migrated = run(['dist/server/cli.js', 'migrate']);
  check('cli migrate on a fresh database', migrated.status === 0, migrated.output);
  const again = run(['dist/server/cli.js', 'migrate']);
  check('cli migrate again is a no-op', again.status === 0 && again.output.includes('"applied":[]'), again.output);
  const seeded = run(['dist/server/cli.js', 'seed']);
  check(
    'cli seed creates synthetic users without printing supplied passwords',
    seeded.status === 0 && !seeded.output.includes(passwords.admin) && !seeded.output.includes(passwords.employee2),
    seeded.output.replaceAll('\n', ' | '),
  );
  check(
    'cli seed lists employee2@example.invalid and its sample data',
    seeded.output.includes('employee2@example.invalid') && seeded.output.includes('sample data for employee2@example.invalid: 3 sessions, 1 leave request'),
  );

  server = spawn(process.execPath, ['dist/server/index.js'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let serverOutput = '';
  let serverExit = null;
  server.stdout.on('data', (chunk) => (serverOutput += String(chunk)));
  server.stderr.on('data', (chunk) => (serverOutput += String(chunk)));
  server.once('exit', (code, signal) => (serverExit = `exit ${code ?? signal}`));
  let healthy = false;
  for (let attempt = 0; attempt < 50 && !healthy && serverExit === null; attempt += 1) {
    try {
      const response = await fetch(`${base}/api/health`, { signal: AbortSignal.timeout(2000) });
      // Only our own child counts: a foreign listener on the port must not pass as healthy.
      healthy = response.ok && (await response.text()) === '{"status":"ok"}' && serverExit === null;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (!healthy) await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const startNote = serverExit === null ? '' : `server process ended early (${serverExit}); port ${port} may be in use`;
  check('built server starts', healthy, hideWorkDir(`${startNote} ${serverOutput.trim().split(String.fromCharCode(10))[0] ?? ''}`.trim()));
  if (!healthy) throw new Error(`built server did not become healthy on port ${port}${serverExit === null ? ' within the wait' : `: ${serverExit}`}`);

  const health = await call('GET', '/api/health');
  check('GET /api/health has no personal data', health.status === 200 && health.text === '{"status":"ok"}', health.text);

  // Readiness: 200 with the allowlisted keys only, no login, no path or personal value.
  const ready = await call('GET', '/api/ready', { withOrigin: false });
  const readyKeys = ready.json === null ? '' : Object.keys(ready.json).sort().join(',');
  const readySchemaKeys = ready.json?.schema === undefined ? '' : Object.keys(ready.json.schema).sort().join(',');
  check(
    'GET /api/ready returns 200 with the allowlisted keys only',
    ready.status === 200 &&
      readyKeys === 'data_dir_writable,schema,status' &&
      readySchemaKeys === 'actual,expected' &&
      ready.json.status === 'ready' &&
      ready.json.data_dir_writable === true &&
      Number.isInteger(ready.json.schema.expected) &&
      ready.json.schema.actual === ready.json.schema.expected &&
      !ready.text.includes(work) &&
      !ready.text.includes('example.invalid'),
    ready.text,
  );

  const index = await call('GET', '/');
  check('GET / serves the built React client with CSP', index.status === 200 && index.text.includes('<div id="root">') && (index.headers.get('content-security-policy') ?? '').includes("default-src 'self'"));
  const deepLink = await call('GET', '/some/client/route');
  check('SPA fallback serves index.html', deepLink.status === 200 && deepLink.text.includes('<div id="root">'));

  const login = await call('POST', '/api/auth/login', { body: { email: 'employee@example.invalid', password: passwords.employee } });
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
  check('employee login sets an HttpOnly SameSite=Strict cookie', login.status === 200 && /HttpOnly/.test(login.headers.get('set-cookie') ?? '') && /SameSite=Strict/.test(login.headers.get('set-cookie') ?? ''));

  const current = await call('GET', '/api/periods/current', { cookie });
  check('GET /api/periods/current', current.status === 200, `today ${current.json?.today_local}, current payroll ${current.json?.current?.payroll_date}, due ${current.json?.current?.due_at_utc}`);

  const monday = recentMonday();
  const created = await call('POST', `/api/days/${monday}/sessions`, {
    cookie,
    body: {
      start: local(monday, '09:00'),
      end: local(monday, '18:00'),
      input_zone: 'America/Los_Angeles',
      breaks_confirmed: true,
      breaks: [
        { start: local(monday, '11:00'), end: local(monday, '11:15'), counts_as_work: false },
        { start: local(monday, '13:00'), end: local(monday, '13:30'), counts_as_work: false },
        { start: local(monday, '15:30'), end: local(monday, '15:45'), counts_as_work: false },
      ],
    },
  });
  const calc = created.json?.day?.calculation;
  const normal = created.json?.day?.classification?.day_class === 'normal';
  check(
    `POST 09:00–18:00 on ${monday} with shifted breaks`,
    created.status === 201 && calc?.status === 'complete' && (normal ? calc.regular_minutes === 480 && calc.credited_minutes === 0 : calc.nonworking_minutes === 480),
    `status ${created.status}, R ${calc?.regular_minutes}, O ${calc?.nonworking_minutes}, credited ${calc?.credited_minutes}`,
  );

  const adminLogin = await call('POST', '/api/auth/login', { body: { email: 'admin@example.invalid', password: passwords.admin } });
  const adminCookie = (adminLogin.headers.get('set-cookie') ?? '').split(';')[0];
  const swapped = await call('GET', `/api/sessions/${created.json?.session?.id}`, { cookie: adminCookie });
  check('admin cannot read the employee session by id (404)', swapped.status === 404, String(swapped.status));

  // Cross-area access: the admin area is closed to employees; no role reads another user's records.
  const employeeAdminList = await call('GET', '/api/admin/users', { cookie });
  const employeeAdminCreate = await call('POST', '/api/admin/users', { cookie, body: {} });
  const anonymousAdminList = await call('GET', '/api/admin/users');
  check(
    'employee gets 403 on the admin area and anonymous gets 401',
    employeeAdminList.status === 403 && employeeAdminCreate.status === 403 && anonymousAdminList.status === 401,
    `${employeeAdminList.status}/${employeeAdminCreate.status}/${anonymousAdminList.status}`,
  );
  const adminUsers = await call('GET', '/api/admin/users', { cookie: adminCookie });
  const accountKeys = new Set((adminUsers.json?.users ?? []).flatMap((account) => Object.keys(account)));
  const accountFields = ['id', 'email', 'display_name', 'role', 'status', 'calendar_id', 'created_at', 'updated_at'];
  check(
    'admin lists the three accounts with account fields only',
    adminUsers.status === 200 && (adminUsers.json?.users ?? []).length === 3 && [...accountKeys].every((key) => accountFields.includes(key)),
    [...accountKeys].join(','),
  );

  const login2 = await call('POST', '/api/auth/login', { body: { email: 'employee2@example.invalid', password: passwords.employee2 } });
  const cookie2 = (login2.headers.get('set-cookie') ?? '').split(';')[0];
  check('employee2 signs in with the environment password', login2.status === 200 && cookie2 !== '', String(login2.status));

  // OT summary: the seeded setup credit (600) and recorded leave request (240) belong to employee2 only.
  const summary2 = await call('GET', '/api/ot/summary', { cookie: cookie2 });
  check(
    'employee2 OT summary: posted 600, reserved 240, available 360, not negative',
    summary2.status === 200 &&
      summary2.json?.posted_minutes === 600 &&
      summary2.json?.reserved_minutes === 240 &&
      summary2.json?.available_minutes === 360 &&
      summary2.json?.negative === false &&
      Array.isArray(summary2.json?.provisional_periods),
    `posted ${summary2.json?.posted_minutes}, reserved ${summary2.json?.reserved_minutes}, available ${summary2.json?.available_minutes}, provisional ${summary2.json?.provisional_minutes}`,
  );
  const summary1 = await call('GET', '/api/ot/summary', { cookie });
  check(
    'employee OT summary is separate (posted 0, reserved 0)',
    summary1.status === 200 && summary1.json?.posted_minutes === 0 && summary1.json?.reserved_minutes === 0,
    `posted ${summary1.json?.posted_minutes}, reserved ${summary1.json?.reserved_minutes}`,
  );

  const leave2 = await call('GET', '/api/ot/leave', { cookie: cookie2 });
  const leaveRequests = leave2.json?.requests ?? [];
  const leaveId = leaveRequests[0]?.id;
  check(
    'employee2 lists the one seeded leave request',
    leave2.status === 200 && leaveRequests.length === 1 && typeof leaveId === 'string',
    `status ${leave2.status}, count ${leaveRequests.length}`,
  );
  const adminLeave = await call('GET', '/api/ot/leave', { cookie: adminCookie });
  check('admin sees no employee leave requests', adminLeave.status === 200 && (adminLeave.json?.requests ?? []).length === 0);
  const foreignCancel = await call('POST', `/api/ot/leave/${leaveId}/cancel`, { cookie, body: { expected_version: 1 } });
  const adminCancel = await call('POST', `/api/ot/leave/${leaveId}/cancel`, { cookie: adminCookie, body: { expected_version: 1 } });
  check(
    'another employee and the admin get 404 on the employee2 leave request by id',
    foreignCancel.status === 404 && adminCancel.status === 404,
    `${foreignCancel.status}/${adminCancel.status}`,
  );
  const unchanged = await call('GET', '/api/ot/summary', { cookie: cookie2 });
  check('the refused cancels changed nothing', unchanged.json?.reserved_minutes === 240 && unchanged.json?.posted_minutes === 600);

  // The range covers the sample sessions (past) and the seeded leave date (about two weeks ahead).
  const range = { to: laDateParts(new Date(Date.now() + 30 * 86_400_000)).date, from: laDateParts(new Date(Date.now() - 30 * 86_400_000)).date };
  const evidence = await call('GET', `/api/ot/evidence.csv?from=${range.from}&to=${range.to}`, { cookie: cookie2 });
  const evidenceLines = evidence.text.split('\n');
  const sections = evidenceLines.filter((line) => line.startsWith('#section,')).map((line) => line.slice('#section,'.length));
  const expectedSections = ['export', 'policy_versions', 'intervals', 'breaks', 'daily', 'ledger', 'leave_permissions'];
  check(
    'evidence CSV: text/csv, no-store, safe filename, export header, seven sections in order',
    evidence.status === 200 &&
      (evidence.headers.get('content-type') ?? '').startsWith('text/csv') &&
      (evidence.headers.get('cache-control') ?? '').includes('no-store') &&
      /^attachment; filename="[A-Za-z0-9._-]+"$/.test(evidence.headers.get('content-disposition') ?? '') &&
      evidenceLines[1] === 'from,to,reporting_zone,generated_at_utc,days' &&
      expectedSections.every((name, index) => sections[index] === name),
    `sections ${sections.join(',')}`,
  );
  check(
    'evidence CSV carries the seeded setup credit and the leave permission of employee2 only',
    evidence.text.includes('seed-setup-credit-employee2') && evidence.text.includes('Example Manager') && !evidence.text.includes('employee@example.invalid'),
  );
  const evidence1 = await call('GET', `/api/ot/evidence.csv?from=${range.from}&to=${range.to}`, { cookie });
  check(
    'employee evidence CSV has no employee2 ledger or permission rows',
    evidence1.status === 200 && !evidence1.text.includes('seed-setup-credit-employee2') && !evidence1.text.includes('Example Manager'),
  );
  const intervalsAt = evidenceLines.indexOf('#section,intervals') + 2;
  const sessionIds2 = [];
  for (let index = intervalsAt; index < evidenceLines.length && evidenceLines[index] !== ''; index += 1) sessionIds2.push(evidenceLines[index].split(',')[1]);
  check('employee2 evidence lists the 3 seeded sample sessions', sessionIds2.length === 3, String(sessionIds2.length));
  const sessionId2 = sessionIds2[0];
  const foreignSession = await call('GET', `/api/sessions/${sessionId2}`, { cookie });
  check(
    'employee cannot read an employee2 session by id (404)',
    typeof sessionId2 === 'string' && foreignSession.status === 404,
    `${typeof sessionId2}, ${foreignSession.status}`,
  );

  const noOrigin = await call('PUT', `/api/days/${monday}`, { cookie, withOrigin: false, body: { category: 'Sick', leave_minutes: 0, wfh: false, notes: '' } });
  check('state change without Origin is rejected (403)', noOrigin.status === 403, String(noOrigin.status));

// ---- WP3: review safety, sign-off conflict, private PDF, capture, shared route (WP3-T14) ----
  const monitor = new Database(join(work, 'timesheet.db'), { readonly: true });
  const tableNames = monitor.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").pluck().all();
  /** Row counts of every table plus the commit counter: any write by another connection changes it. */
  const dbState = () =>
    JSON.stringify({
      version: monitor.pragma('data_version', { simple: true }),
      rows: tableNames.map((name) => [name, monitor.prepare(`SELECT count(*) FROM "${name}"`).pluck().get()]),
    });

  const me2 = await call('GET', '/api/auth/me', { cookie: cookie2 });
  const ownerId2 = me2.json?.user?.id;
  const periods2 = await call('GET', '/api/periods/current', { cookie: cookie2 });
  const payroll2 = periods2.json?.current?.payroll_date;
  check('employee2 identifies and has a current period', typeof ownerId2 === 'string' && typeof payroll2 === 'string', `${me2.status}/${periods2.status}`);

  // The seed saved synthetic submission settings and a generated signature for employee2.
  const settings2 = await call('GET', '/api/settings/submission', { cookie: cookie2 });
  const signature2 = await call('GET', '/api/signatures/current', { cookie: cookie2 });
  check(
    'seed: employee2 has saved submission settings (recipients on example.invalid) and a synthetic signature',
    settings2.status === 200 && JSON.stringify(settings2.json).includes('payroll@example.invalid') && signature2.status === 200 && typeof signature2.json?.signature?.id === 'string',
    `${settings2.status}/${signature2.status}`,
  );

  // GET safety: reading the review (and every other read of the submission area) writes nothing.
  const reviewPath2 = `/api/timesheets/${payroll2}/review`;
  const stateBefore = dbState();
  const reads = [
    reviewPath2,
    `/api/timesheets/${payroll2}/finalization`,
    '/api/revisions',
    '/api/deliveries',
    '/api/history',
    '/api/settings/submission',
    '/api/settings/submission/versions',
    '/api/signatures/current',
    '/api/shares',
  ];
  const readStatuses = [];
  for (const path of reads) readStatuses.push((await call('GET', path, { cookie: cookie2 })).status);
  check(
    'review GET and the other submission reads change nothing in the database (data_version and every table count)',
    readStatuses.every((status) => status === 200) && dbState() === stateBefore,
    readStatuses.join(','),
  );

  // Sign off on the displayed review; then a request built from the old review is a conflict (409).
  const review2 = await call('GET', reviewPath2, { cookie: cookie2 });
  const signoffBody = {
    expected_version: review2.json?.expected_version,
    reviewed_hash: review2.json?.payload_hash,
    signer_name: 'Example Employee Two',
    incomplete_evidence_acknowledged: true,
  };
  const signoff = await call('POST', `/api/timesheets/${payroll2}/signoff`, { cookie: cookie2, body: signoffBody });
  const revisionId = signoff.json?.revision?.id;
  check('sign-off of the reviewed period creates revision 1', signoff.status === 201 && signoff.json?.revision?.revision_no === 1 && typeof revisionId === 'string', String(signoff.status));
  const stateAfterSignoff = dbState();
  const conflict = await call('POST', `/api/timesheets/${payroll2}/signoff`, { cookie: cookie2, body: { ...signoffBody, signer_name: 'Another Name' } });
  check(
    'a second, different sign-off of the same period is refused with 409 and writes nothing',
    conflict.status === 409 && conflict.json?.error?.code === 'already_finalized' && dbState() === stateAfterSignoff,
    `${conflict.status} ${conflict.json?.error?.code}`,
  );
  const staleReview = await call('POST', `/api/timesheets/${payroll2}/signoff`, { cookie: cookie2, body: { ...signoffBody, reviewed_hash: '0'.repeat(64) } });
  check('a sign-off built from a stale review hash is also a 409', staleReview.status === 409, String(staleReview.status));

  // The runner is off in this smoke: run the due jobs through the CLI (PDF, then delivery in capture mode).
  const runAt = (offsetSeconds) =>
    run(['dist/server/cli.js', 'run-jobs', '--once', '--now', new Date(Date.now() + offsetSeconds * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z')]);
  const passes = [runAt(1), runAt(150), runAt(300)];
  check('cli run-jobs --once --now runs the PDF and send jobs', passes.every((pass) => pass.status === 0), passes.map((pass) => pass.output).join(' '));

  const pdf2 = await fetch(`${base}/api/revisions/${revisionId}/pdf`, { headers: { cookie: cookie2 } });
  const pdfBytes = Buffer.from(await pdf2.arrayBuffer());
  check(
    'the owner downloads the revision PDF (application/pdf, no-store, attachment)',
    pdf2.status === 200 &&
      pdf2.headers.get('content-type') === 'application/pdf' &&
      (pdf2.headers.get('cache-control') ?? '').includes('no-store') &&
      pdfBytes.subarray(0, 5).toString('latin1') === '%PDF-',
    `${pdf2.status} ${pdfBytes.length} bytes`,
  );
  const foreignPdf = await call('GET', `/api/revisions/${revisionId}/pdf`, { cookie });
  const adminPdf = await call('GET', `/api/revisions/${revisionId}/pdf`, { cookie: adminCookie });
  const anonymousPdf = await call('GET', `/api/revisions/${revisionId}/pdf`);
  check(
    'the revision PDF is private: another employee and the admin get 404, anonymous gets 401',
    foreignPdf.status === 404 && adminPdf.status === 404 && anonymousPdf.status === 401,
    `${foreignPdf.status}/${adminPdf.status}/${anonymousPdf.status}`,
  );

  // Capture check: one accepted attempt whose captured message and PDF match the stored revision PDF.
  const deliveries = await call('GET', `/api/deliveries?revision_id=${revisionId}`, { cookie: cookie2 });
  const attempt = deliveries.json?.deliveries?.[0];
  const captureDir = join(work, 'private-data', 'mail-capture', String(attempt?.id));
  const captured = attempt?.state === 'accepted' && existsSync(captureDir) ? readdirSync(captureDir).sort() : [];
  const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
  const metadata = captured.includes('metadata.json') ? JSON.parse(readFileSync(join(captureDir, 'metadata.json'), 'utf8')) : {};
  const capturedPdf = captured.includes('attachment.pdf') ? readFileSync(join(captureDir, 'attachment.pdf')) : Buffer.alloc(0);
  const eml = captured.includes('message.eml') ? readFileSync(join(captureDir, 'message.eml'), 'latin1') : '';
  check(
    'capture: one accepted attempt; message.eml, attachment.pdf and metadata.json exist; the PDF equals the download; sender and recipients are example.invalid',
    (deliveries.json?.deliveries ?? []).length === 1 &&
      attempt?.state === 'accepted' &&
      captured.join(',') === 'attachment.pdf,message.eml,metadata.json' &&
      sha256(capturedPdf) === sha256(pdfBytes) &&
      metadata.pdf_sha256 === sha256(pdfBytes) &&
      metadata.mode === 'capture' &&
      metadata.envelope?.from === 'smoke-sender@example.invalid' &&
      (metadata.envelope?.to ?? []).every((address) => address.endsWith('@example.invalid')) &&
      eml.includes('payroll@example.invalid'),
    `${attempt?.state} ${captured.join('+')}`,
  );
  check(
    'capture: no password in the captured metadata',
    !JSON.stringify(metadata).includes(passwords.employee2) && !JSON.stringify(metadata).toLowerCase().includes('password'),
  );

  // The shared route of an owner who granted nothing: a non-grantee (and the admin) get 404, never data.
  const sharedPaths = [
    `/api/shared/${ownerId2}/periods/current`,
    `/api/shared/${ownerId2}/timesheets/${payroll2}`,
    `/api/shared/${ownerId2}/revisions`,
    `/api/shared/${ownerId2}/revisions/${revisionId}/pdf`,
  ];
  const sharedStatuses = [];
  for (const path of sharedPaths) {
    sharedStatuses.push(`${(await call('GET', path, { cookie })).status}/${(await call('GET', path, { cookie: adminCookie })).status}/${(await call('GET', path)).status}`);
  }
  check(
    'shared routes of an owner without a share: a non-grantee and the admin get 404, anonymous gets 401',
    sharedStatuses.every((status) => status === '404/404/401'),
    sharedStatuses.join(' '),
  );
  monitor.close();


  const logout = await call('POST', '/api/auth/logout', { cookie });
  const after = await call('GET', '/api/auth/me', { cookie });
  check('logout revokes the session', logout.status === 200 && after.status === 401, `${logout.status}/${after.status}`);
} catch (error) {
  failures += 1;
  console.log(`FAIL  unexpected error: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  server?.kill();
  await new Promise((resolve) => setTimeout(resolve, 300));
  rmSync(work, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}

console.log(failures === 0 ? 'SMOKE PASSED' : `SMOKE FAILED (${failures})`);
process.exitCode = failures === 0 ? 0 : 1;
