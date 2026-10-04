#!/usr/bin/env node
// Smoke-tests the BUILT production server (dist/) end to end over real HTTP with a
// throwaway SQLite file, synthetic example.invalid users and random per-run passwords.
// Usage: npm run build && node scripts/smoke-built-server.mjs
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const port = Number(process.env.SMOKE_PORT ?? 3100);
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
  const firstLine = new Promise((resolve) => server.stdout.once('data', (chunk) => resolve(String(chunk).trim())));
  let healthy = false;
  for (let attempt = 0; attempt < 50 && !healthy; attempt += 1) {
    try {
      healthy = (await fetch(`${base}/api/health`)).ok;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
  check('built server starts', healthy, hideWorkDir(String(await firstLine)));

  const health = await call('GET', '/api/health');
  check('GET /api/health has no personal data', health.status === 200 && health.text === '{"status":"ok"}', health.text);

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
