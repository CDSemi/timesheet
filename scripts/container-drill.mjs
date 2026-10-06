#!/usr/bin/env node
// Container drill, stage 1 (WP4-T04): builds the image for linux/amd64, starts it through compose.example.yaml on a fresh
// host data directory, waits until healthy, records the schema version, creates synthetic data through the API,
// restarts the container, checks the data persisted, then inspects the image (runtime user, forbidden files).
// Later stages (backup, restore, outbound pause) extend this file.
//
// Usage: npm run drill:container -- --work <empty host directory outside the repository> [--project <name>] [--keep]
//   --work     host directory for the drill data, the env file and the raw logs (created if missing; nothing in it is deleted)
//   --project  Compose project name; every container, volume and network of the drill carries it (default timesheet-drill)
//   --keep     leave the container running (default: `docker compose down -v` by project name at the end)
// Needs Docker and a free loopback port. Everything is synthetic (example.invalid, random per-run passwords); the
// published port is loopback only; nothing is pushed to or pulled from any registry except the pinned base image.
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = fileURLToPath(new URL('..', import.meta.url));
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (value === undefined || value.startsWith('--')) {
    console.error(`--${name} needs a value`);
    process.exit(2);
  }
  return value;
}
const keep = args.includes('--keep');
const workOption = option('work', undefined);
if (workOption === undefined) {
  console.error('Usage: npm run drill:container -- --work <host directory outside the repository> [--project <name>] [--keep]');
  process.exit(2);
}
const work = resolve(workOption);
const project = option('project', 'timesheet-drill');
if (!/^[a-z0-9][a-z0-9_-]*$/.test(project)) {
  console.error('--project must be a lower-case Compose project name');
  process.exit(2);
}
if (work.toLowerCase().startsWith(resolve(repo).toLowerCase())) {
  console.error('--work must be outside the repository');
  process.exit(2);
}

const image = `${project}-timesheet:drill`;
const publicOrigin = 'https://timesheet.example.invalid';
const dataDir = join(work, 'data');
const envFile = join(work, 'timesheet.env');
const composeFile = join(repo, 'compose.example.yaml');
const forwardSlashes = (path) => path.replaceAll('\\', '/');

let failures = 0;
function check(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
  if (!condition) failures += 1;
}
const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

function docker(dockerArgs, { env = {}, allowFailure = false } = {}) {
  const result = spawnSync('docker', dockerArgs, {
    cwd: repo,
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
    env: { ...process.env, ...env },
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`docker ${dockerArgs.slice(0, 3).join(' ')} failed (${result.status}): ${String(result.stderr).slice(-600)}`);
  }
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const composeEnv = {
  TIMESHEET_IMAGE: image,
  TIMESHEET_ENV_FILE: forwardSlashes(envFile),
  TIMESHEET_DATA_DIR: forwardSlashes(dataDir),
  TIMESHEET_PORT: '0',
};
const compose = (composeArgs, options = {}) =>
  docker(['compose', '--project-name', project, '--file', composeFile, ...composeArgs], {
    ...options,
    env: { ...composeEnv, ...options.env },
  });

/** Asks the OS for a free loopback port (bound, read, released). */
function freeLoopbackPort() {
  return new Promise((done, fail) => {
    const probe = createServer();
    probe.once('error', fail);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      probe.close(() => (address && typeof address === 'object' ? done(address.port) : fail(new Error('no port assigned'))));
    });
  });
}

let base = '';
async function call(method, path, { cookie, body } = {}) {
  const headers = { origin: publicOrigin };
  if (cookie) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(`${base}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // not JSON
  }
  const cookies = response.headers.getSetCookie().map((line) => line.split(';')[0]);
  return { status: response.status, json, text, cookie: cookies.find((item) => item.includes('=')) };
}

const containerId = () => compose(['ps', '--quiet', 'timesheet']).stdout.trim();

async function waitHealthy(timeoutMs) {
  const started = Date.now();
  let state = 'unknown';
  while (Date.now() - started < timeoutMs) {
    const id = containerId();
    if (id !== '') {
      const inspected = docker(['inspect', '--format', '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{end}}', id], { allowFailure: true });
      state = inspected.stdout.trim();
      if (state === 'running healthy') return { ok: true, seconds: (Date.now() - started) / 1000, state };
      if (state.startsWith('exited') || state.startsWith('dead')) break;
    }
    await sleep(1000);
  }
  return { ok: false, seconds: (Date.now() - started) / 1000, state };
}

const password = () => randomBytes(18).toString('base64url');
const local = (date, time) => ({ local: `${date}T${time}`, zone: 'America/Los_Angeles' });

/** The file list scan: names that must never exist inside the image. Returns the offending paths. */
function forbiddenPaths(paths) {
  const offenders = [];
  for (const path of paths) {
    const parts = path.split('/').filter((part) => part !== '');
    const name = parts.at(-1) ?? '';
    const topLevelUnderApp = parts[0] === 'app' ? parts[1] : undefined;
    if (/\.xlsx$/i.test(name)) offenders.push(path);
    else if (name === '.env' || name.startsWith('.env.')) offenders.push(path);
    else if (parts.some((part) => part === 'handoff' || part === '.claude' || part === '.agents')) offenders.push(path);
    else if (topLevelUnderApp !== undefined && ['tests', 'docs', 'reference', '.git'].includes(topLevelUnderApp)) offenders.push(path);
    else if (/\.(?:db|sqlite)(?:-wal|-shm)?$/i.test(name) && parts[0] !== 'data') offenders.push(path);
  }
  return offenders;
}

mkdirSync(dataDir, { recursive: true });
let started = false;
try {
  console.log(`node ${process.version}; docker ${docker(['--version']).stdout.trim()}; project ${project}`);

  // 1. Build for linux/amd64 (deprecation scan over the whole build log).
  const buildStart = Date.now();
  const build = docker(['build', '--platform', 'linux/amd64', '--progress', 'plain', '--tag', image, '.'], { allowFailure: true });
  const buildLog = `${build.stdout}\n${build.stderr}`;
  writeFileSync(join(work, 'build.log'), buildLog);
  check('docker build --platform linux/amd64', build.status === 0, `${((Date.now() - buildStart) / 1000).toFixed(0)} s, log in the work directory`);
  if (build.status !== 0) throw new Error('build failed');
  const deprecated = buildLog.split('\n').filter((line) => /deprecat/i.test(line));
  check('build output (including npm ci) has no deprecation line', deprecated.length === 0, deprecated.slice(0, 3).join(' | '));

  // 2. Image facts: platform, size, runtime user.
  const inspected = JSON.parse(docker(['image', 'inspect', image]).stdout)[0];
  const user = String(inspected.Config.User ?? '');
  const uid = Number(user.split(':')[0]);
  console.log(`INFO  image id ${inspected.Id}, ${inspected.Os}/${inspected.Architecture}, size ${inspected.Size} bytes (${(inspected.Size / 1_048_576).toFixed(1)} MiB)`);
  check('image architecture is amd64', inspected.Architecture === 'amd64' && inspected.Os === 'linux');
  check('image runtime user is numeric and not root', user !== '' && Number.isInteger(uid) && uid !== 0, `User=${user}`);
  check('image sets NODE_ENV=production and OUTBOUND_MODE=capture', inspected.Config.Env.includes('NODE_ENV=production') && inspected.Config.Env.includes('OUTBOUND_MODE=capture'));
  check('image declares a HEALTHCHECK and the /data volume', Boolean(inspected.Config.Healthcheck?.Test) && '/data' in (inspected.Config.Volumes ?? {}));

  // 3. Forbidden-file scan of the image file list (read-only, throwaway container named after the project).
  const listing = docker(
    ['run', '--rm', '--read-only', '--network', 'none', '--name', `${project}-scan`, '--entrypoint', 'find', image, '/', '-xdev', '-not', '-path', '/proc/*', '-print'],
    { allowFailure: true },
  );
  const paths = listing.stdout.split('\n').filter((line) => line !== '');
  writeFileSync(join(work, 'image-files.txt'), `${paths.join('\n')}\n`);
  // find exits 1 on the unreadable root-owned directories a non-root user meets; the list itself is what matters.
  check('image file list was read', paths.length > 1000 && paths.includes('/app/dist/server/index.js'), `${paths.length} paths`);
  const offenders = forbiddenPaths(paths);
  check('forbidden-file scan (*.xlsx, .env*, handoff, tests, docs, reference, .claude, .agents, databases)', offenders.length === 0, offenders.slice(0, 5).join(' | '));
  check('production dependencies only (no devDependency in the image)', !paths.some((path) => /^\/app\/node_modules\/(?:vitest|typescript|vite|eslint|@playwright)(?:\/|$)/.test(path)));

  // 4. Fresh data directory, synthetic env file and bootstrap file; start through compose.example.yaml.
  const port = await freeLoopbackPort();
  composeEnv.TIMESHEET_PORT = String(port);
  base = `http://127.0.0.1:${port}`;
  check('data directory is fresh', !existsSync(join(dataDir, 'timesheet.db')), 'no timesheet.db before the first start');
  writeFileSync(
    envFile,
    [`APP_ORIGINS=${publicOrigin}`, `PUBLIC_BASE_URL=${publicOrigin}`, 'MAIL_FROM=timesheet@example.invalid', ''].join('\n'),
    { mode: 0o600 },
  );
  writeFileSync(
    join(dataDir, 'bootstrap.json'),
    JSON.stringify({
      schema_version: 1,
      calendar: { name: 'Synthetic drill calendar', reporting_zone: 'America/Los_Angeles', normal_weekdays_iso: [1, 2, 3, 4, 5], effective_from: '2026-01-01' },
      holidays: [{ date: '2026-01-01', name: 'Synthetic holiday' }],
      policy: {
        effective_from: '2026-01-01',
        required_minutes: 480,
        threshold_minutes: 30,
        rounding_step_minutes: 30,
        reference_start: '08:00',
        reference_end: '17:00',
        breaks: [
          { start_offset_minutes: 120, duration_minutes: 15, counts_as_work: false },
          { start_offset_minutes: 240, duration_minutes: 30, counts_as_work: false },
          { start_offset_minutes: 390, duration_minutes: 15, counts_as_work: false },
        ],
        deficit_mode: 'ignore',
      },
      payroll: { anchor_payroll_date: '2026-10-02', cycle_days: 14, period_start_offset_days: -18, period_end_offset_days: -5, due_offset_days: -3, due_local_time: '17:00' },
    }),
  );
  compose(['up', '--detach', '--no-build']);
  started = true;
  const first = await waitHealthy(180_000);
  check('container becomes healthy', first.ok, `${first.seconds.toFixed(1)} s (${first.state})`);
  if (!first.ok) throw new Error('not healthy');

  const ready = await call('GET', '/api/ready');
  const schema = ready.json?.schema;
  check('/api/ready reports ready with the schema version', ready.status === 200 && ready.json?.status === 'ready' && ready.json?.data_dir_writable === true && schema?.actual === schema?.expected && schema?.actual > 0, `schema ${schema?.actual} of ${schema?.expected}`);
  const idUser = compose(['exec', '-T', 'timesheet', 'node', '-e', 'console.log(process.getuid() + ":" + process.getgid())']).stdout.trim();
  check('running process UID is not 0', /^\d+:\d+$/.test(idUser) && !idUser.startsWith('0:'), `uid:gid ${idUser}`);
  const rootWrite = compose(['exec', '-T', 'timesheet', 'node', '-e', "try { process.getBuiltinModule('node:fs').writeFileSync('/app/probe', '1'); process.exit(1); } catch { process.exit(0); }"], { allowFailure: true });
  check('root filesystem is read-only (cannot write under /app)', rootWrite.status === 0);
  const tmpWrite = compose(['exec', '-T', 'timesheet', 'node', '-e', "process.getBuiltinModule('node:fs').writeFileSync('/tmp/probe', '1')"], { allowFailure: true });
  check('/tmp tmpfs is writable', tmpWrite.status === 0);

  // 5. Bootstrap (CLI inside the container), first administrator, an employee and one synthetic work session.
  const boot = compose(['exec', '-T', 'timesheet', 'node', 'dist/server/cli.js', 'bootstrap', '--config', '/data/bootstrap.json'], { allowFailure: true });
  const token = /^\s{2}([A-Z2-7]{5}(?:-[A-Z2-7]{5}){7})\s*$/m.exec(boot.stdout)?.[1];
  check('bootstrap CLI prints a single-use setup token', boot.status === 0 && token !== undefined, boot.status === 0 ? '' : `exit ${boot.status}: ${String(boot.stderr).trim().slice(0, 300)}`);
  const adminPassword = password();
  const employeePassword = password();
  const setup = await call('POST', '/api/auth/bootstrap', { body: { token: token ?? '', email: 'admin@example.invalid', display_name: 'Synthetic Admin', password: adminPassword } });
  check('first administrator created with the token', setup.status === 201, `status ${setup.status}`);
  const replay = await call('POST', '/api/auth/bootstrap', { body: { token: token ?? '', email: 'admin2@example.invalid', display_name: 'Replay', password: password() } });
  check('setup token cannot be replayed', replay.status === 403, `status ${replay.status}`);
  const adminLogin = await call('POST', '/api/auth/login', { body: { email: 'admin@example.invalid', password: adminPassword } });
  const adminCookie = adminLogin.cookie;
  check('administrator sign-in', adminLogin.status === 200 && adminCookie !== undefined);
  const users = await call('GET', '/api/admin/users', { cookie: adminCookie });
  const calendarId = users.json?.users?.[0]?.calendar_id;
  check('administrator lists accounts (calendar id present)', users.status === 200 && typeof calendarId === 'string');
  const created = await call('POST', '/api/admin/users', {
    cookie: adminCookie,
    body: { email: 'employee@example.invalid', display_name: 'Synthetic Employee', role: 'employee', password: employeePassword, calendar_id: calendarId },
  });
  check('administrator creates a synthetic employee', created.status === 201, `status ${created.status}`);
  const employeeLogin = await call('POST', '/api/auth/login', { body: { email: 'employee@example.invalid', password: employeePassword } });
  const workDate = '2026-03-02';
  const session = await call('POST', `/api/days/${workDate}/sessions`, {
    cookie: employeeLogin.cookie,
    body: {
      start: local(workDate, '09:00'),
      end: local(workDate, '18:00'),
      input_zone: 'America/Los_Angeles',
      breaks_confirmed: true,
      reason: 'Synthetic drill record in a past period',
      breaks: [{ start: local(workDate, '13:00'), end: local(workDate, '13:30'), counts_as_work: false }],
    },
  });
  const sessionId = session.json?.session?.id;
  check('employee records a synthetic work session', session.status === 201 && typeof sessionId === 'string', `status ${session.status}${session.status === 201 ? '' : ` ${session.text.slice(0, 200)}`}`);
  const before = await call('GET', `/api/sessions/${sessionId}`, { cookie: employeeLogin.cookie });
  check('session reads back before the restart', before.status === 200);
  const adminRead = await call('GET', `/api/sessions/${sessionId}`, { cookie: adminCookie });
  check('administrator cannot read the employee session', adminRead.status === 404 || adminRead.status === 403, `status ${adminRead.status}`);
  check('database and private directory exist on the host data directory', existsSync(join(dataDir, 'timesheet.db')) && statSync(join(dataDir, 'private-data')).isDirectory());

  // 6. Restart the container and check persistence.
  const restartStart = Date.now();
  compose(['restart', '--timeout', '45', 'timesheet']);
  const second = await waitHealthy(180_000);
  check('container is healthy again after the restart', second.ok, `${second.seconds.toFixed(1)} s after the restart (${((Date.now() - restartStart) / 1000).toFixed(1)} s in all)`);
  const readyAfter = await call('GET', '/api/ready');
  check('schema version unchanged after the restart', readyAfter.json?.schema?.actual === schema?.actual && readyAfter.status === 200, `schema ${readyAfter.json?.schema?.actual}`);
  const staleSession = await call('GET', `/api/sessions/${sessionId}`, { cookie: employeeLogin.cookie });
  check('stored sign-in session survives the restart', staleSession.status === 200);
  const relogin = await call('POST', '/api/auth/login', { body: { email: 'employee@example.invalid', password: employeePassword } });
  const after = await call('GET', `/api/sessions/${sessionId}`, { cookie: relogin.cookie });
  check('synthetic work session persisted byte for byte after the restart', after.status === 200 && after.text === before.text);
  const logs = compose(['logs', '--no-color', 'timesheet']).stdout;
  check('container log has no deprecation warning', !/deprecat/i.test(logs));
  check('container log never contains the setup token or a password', !(token && logs.includes(token)) && !logs.includes(adminPassword) && !logs.includes(employeePassword));
} catch (error) {
  failures += 1;
  console.log(`FAIL  drill stopped: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  if (started && !keep) {
    const down = compose(['down', '--volumes', '--timeout', '45'], { allowFailure: true });
    check('cleanup by project name (docker compose down -v)', down.status === 0);
  }
  const left = docker(['ps', '--all', '--quiet', '--filter', `name=${project}`], { allowFailure: true }).stdout.trim();
  if (!keep) check('no container of the project remains', left === '');
}

console.log(failures === 0 ? 'DRILL STAGE 1 PASSED' : `DRILL STAGE 1 FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);
