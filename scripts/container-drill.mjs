#!/usr/bin/env node
// Container drill, stage 1 (WP4-T04): builds the image for linux/amd64, starts it through compose.example.yaml on a fresh
// host data directory, waits until healthy, records the schema version, creates synthetic data through the API,
// restarts the container, checks the data persisted, then inspects the image (runtime user, forbidden files).
// Stage 2 (WP4-T05): finalizes a synthetic period (signature, PDF), then runs `cli.js backup --to /data/backups` inside
// the running container while a synthetic writer keeps writing through the API, and verifies the backup outside the
// container: manifest keys, every file and the database copy against their SHA-256 and size, integrity and foreign
// keys of the copy, and that the copy is a point-in-time image. Later stages (restore, outbound pause) extend this file.
//
// Usage: npm run drill:container -- --work <empty host directory outside the repository> [--project <name>] [--keep]
//   --work     host directory for the drill data, the env file and the raw logs (created if missing; nothing in it is deleted)
//   --project  Compose project name; every container, volume and network of the drill carries it (default timesheet-drill)
//   --keep     leave the container running (default: `docker compose down -v` by project name at the end)
// Needs Docker and a free loopback port. Everything is synthetic (example.invalid, random per-run passwords); the
// published port is loopback only; nothing is pushed to or pulled from any registry except the pinned base image.
import { spawn, spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateSync } from 'node:zlib';
import Database from 'better-sqlite3';

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

/* ---------------------------------------------------------------------------------------------- stage 2 ---- */

/** The exact key paths a backup manifest may contain (the list of src/server/ops/manifest.ts). */
const MANIFEST_KEY_PATHS = [
  'app_version', 'created_at', 'database', 'database.name', 'database.sha256', 'database.size_bytes', 'files', 'files[].kind',
  'files[].sha256', 'files[].size_bytes', 'files[].storage_key', 'format', 'format_version', 'integrity', 'integrity.files_verified',
  'integrity.foreign_key_violations', 'integrity.integrity_check', 'schema_version',
];

function keyPaths(value, prefix = '') {
  if (Array.isArray(value)) return value.flatMap((item) => keyPaths(item, `${prefix}[]`));
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    return [path, ...keyPaths(child, path)];
  });
}

const sha256Of = (bytes) => createHash('sha256').update(bytes).digest('hex');

function pngChunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'latin1'), data]);
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

/** A synthetic 8x8 PNG generated at run time (no image file is committed). */
function syntheticPng(fill) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(8, 0);
  header.writeUInt32BE(8, 4);
  header[8] = 8;
  header[9] = 2;
  const rows = Array.from({ length: 8 }, () => Buffer.concat([Buffer.from([0]), Buffer.alloc(24, fill)]));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

async function uploadSignature(cookie, fill) {
  const response = await fetch(`${base}/api/signatures`, {
    method: 'POST',
    headers: { origin: publicOrigin, cookie, 'content-type': 'image/png' },
    body: syntheticPng(fill),
    signal: AbortSignal.timeout(15_000),
  });
  await response.text();
  return response.status;
}

/** `docker` without blocking the event loop, so the synthetic writer keeps writing while it runs. */
function dockerAsync(dockerArgs, env) {
  return new Promise((done, fail) => {
    const child = spawn('docker', dockerArgs, { cwd: repo, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.setEncoding('utf8').on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('error', fail);
    child.once('close', (status) => done({ status, stdout, stderr }));
  });
}

/** Weekdays from 2026-04-06 (past periods; each write is a new session on its own day). */
function* writerDates() {
  const day = new Date('2026-04-06T00:00:00Z');
  for (;;) {
    if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) yield day.toISOString().slice(0, 10);
    day.setUTCDate(day.getUTCDate() + 1);
  }
}

async function stageTwo(cookie) {
  // A finalized period with its signature and rendered PDF, so the backup has both kinds of private file.
  check('employee uploads a synthetic signature image', (await uploadSignature(cookie, 40)) === 201);
  const payrollDate = '2026-03-20';
  const review = await call('GET', `/api/timesheets/${payrollDate}/review`, { cookie });
  const signoff = await call('POST', `/api/timesheets/${payrollDate}/signoff`, {
    cookie,
    body: {
      expected_version: review.json?.expected_version,
      reviewed_hash: review.json?.payload_hash,
      signer_name: 'Synthetic Employee',
      incomplete_evidence_acknowledged: true,
    },
  });
  check('employee signs off a past synthetic period (finalization)', signoff.status === 201, `status ${signoff.status}${signoff.status === 201 ? '' : ` ${signoff.text.slice(0, 200)}`}`);
  let pdfReady = false;
  const pdfWaitStart = Date.now();
  while (!pdfReady && Date.now() - pdfWaitStart < 120_000) {
    const revisions = await call('GET', '/api/revisions', { cookie });
    pdfReady = (revisions.json?.revisions ?? []).some((revision) => revision.pdf_state === 'ready');
    if (!pdfReady) await sleep(1000);
  }
  check('the container job runner renders the PDF of the finalized period', pdfReady, `${((Date.now() - pdfWaitStart) / 1000).toFixed(1)} s`);

  // The synthetic writer: a new work session on its own day every request, and a signature image every fourth one.
  const writes = [];
  let stopWriting = false;
  const dates = writerDates();
  const writer = (async () => {
    for (let index = 0; !stopWriting && index < 400; index += 1) {
      const workDate = dates.next().value;
      const created = await call('POST', `/api/days/${workDate}/sessions`, {
        cookie,
        body: {
          start: local(workDate, '09:00'),
          end: local(workDate, '17:30'),
          input_zone: 'America/Los_Angeles',
          breaks_confirmed: true,
          reason: 'Synthetic drill write during the backup',
          breaks: [],
        },
      });
      writes.push({ kind: 'session', status: created.status, endedAt: Date.now() });
      if (index % 4 === 3) writes.push({ kind: 'signature', status: await uploadSignature(cookie, 60 + (index % 100)), endedAt: Date.now() });
    }
  })();
  while (writes.length < 5) await sleep(20);

  const sessionsBefore = 1 + writes.filter((write) => write.kind === 'session' && write.status === 201).length;
  const backupStart = Date.now();
  const run = await dockerAsync(
    ['compose', '--project-name', project, '--file', composeFile, 'exec', '-T', 'timesheet', 'node', 'dist/server/cli.js', 'backup', '--to', '/data/backups'],
    composeEnv,
  );
  const backupEnd = Date.now();
  await sleep(500);
  stopWriting = true;
  await writer;
  const during = writes.filter((write) => write.endedAt >= backupStart && write.endedAt <= backupEnd);
  const sessionsTotal = 1 + writes.filter((write) => write.kind === 'session' && write.status === 201).length;
  let printed = null;
  try {
    printed = JSON.parse(run.stdout);
  } catch {
    // reported below
  }
  check('cli.js backup inside the running container exits 0', run.status === 0 && printed?.outcome === 'succeeded', run.status === 0 ? '' : `exit ${run.status}: ${String(run.stderr).trim().slice(0, 300)}`);
  check('every synthetic write succeeded', writes.every((write) => write.status === 201), `${writes.length} writes, ${writes.filter((write) => write.status !== 201).length} not 201`);
  check('writes continued while the backup ran', during.length > 0, `${during.length} writes completed inside the ${backupEnd - backupStart} ms backup window`);
  check('the backup recorded its success in operations_state', printed?.status_recorded === true);
  console.log(`INFO  backup duration ${printed?.duration_ms} ms inside the CLI, ${backupEnd - backupStart} ms for docker compose exec; writes before/during/after: ${writes.filter((write) => write.endedAt < backupStart).length}/${during.length}/${writes.filter((write) => write.endedAt > backupEnd).length}`);
  if (printed === null) throw new Error('no backup summary');

  // Verification outside the container: the host side of the bind mount.
  const folder = join(dataDir, 'backups', String(printed.backup));
  check('backup folder name is timesheet-backup-<UTC>-<random>', /^timesheet-backup-\d{8}T\d{6}Z-[0-9a-f]{8}$/.test(String(printed.backup)));
  const entries = readdirSync(join(dataDir, 'backups')).sort();
  check('only the finished backup folder exists (no partial folder)', entries.length === 1 && entries[0] === printed.backup, `${entries.length} entries`);
  check('backup folder holds the database copy, files and manifest only', readdirSync(folder).sort().join(',') === 'files,manifest.json,timesheet.db');
  const manifestText = readFileSync(join(folder, 'manifest.json'), 'utf8');
  const manifest = JSON.parse(manifestText);
  check('manifest has exactly the allowed keys', JSON.stringify([...new Set(keyPaths(manifest))].sort()) === JSON.stringify([...MANIFEST_KEY_PATHS].sort()));
  check('manifest has no email address, name or host path', !/@|Synthetic|employee|admin|\/data|\\/i.test(manifestText.replace(/"(?:sha256|storage_key)": "[^"]*"/g, '')));
  const dbBytes = readFileSync(join(folder, 'timesheet.db'));
  check('database copy matches the manifest SHA-256 and size', sha256Of(dbBytes) === manifest.database.sha256 && dbBytes.length === manifest.database.size_bytes);
  const copiedKeys = readdirSync(join(folder, 'files')).sort();
  check('copied file set equals the manifest file list', JSON.stringify(copiedKeys) === JSON.stringify(manifest.files.map((file) => file.storage_key)));
  const mismatched = manifest.files.filter((file) => {
    const bytes = readFileSync(join(folder, 'files', file.storage_key));
    return sha256Of(bytes) !== file.sha256 || bytes.length !== file.size_bytes;
  });
  check('every copied file matches its manifest SHA-256 and size', mismatched.length === 0 && manifest.files.length > 0, `${manifest.files.length} files, ${mismatched.length} mismatched`);
  const kinds = { signature: 0, pdf: 0 };
  for (const file of manifest.files) kinds[file.kind] = (kinds[file.kind] ?? 0) + 1;
  check('the backup holds signature images and the PDF', kinds.signature >= 1 && kinds.pdf >= 1);

  const copy = new Database(join(folder, 'timesheet.db'), { readonly: true, fileMustExist: true });
  try {
    check('database copy passes integrity_check outside the container', copy.pragma('integrity_check', { simple: true }) === 'ok');
    check('database copy has no foreign key violation', copy.pragma('foreign_key_check').length === 0);
    const schemaVersion = copy.prepare('SELECT max(version) FROM schema_migrations').pluck().get();
    check('schema version of the copy equals the manifest and the running instance', schemaVersion === manifest.schema_version && schemaVersion === printed.schema_version, `schema ${schemaVersion}`);
    const attachments = copy.prepare('SELECT storage_key, kind, sha256, size_bytes FROM attachments ORDER BY storage_key').all();
    check('manifest files equal the attachment rows of the copy', JSON.stringify(attachments) === JSON.stringify(manifest.files));
    const sessionsInCopy = copy.prepare('SELECT count(*) FROM work_sessions').pluck().get();
    check(
      'the copy is a point-in-time image: every session written before the backup, none beyond the end state',
      sessionsInCopy >= sessionsBefore && sessionsInCopy <= sessionsTotal,
      `sessions before ${sessionsBefore}, in the copy ${sessionsInCopy}, at the end ${sessionsTotal}`,
    );
  } finally {
    copy.close();
  }
  console.log(
    `INFO  manifest summary: schema ${manifest.schema_version}, app ${manifest.app_version}, ${manifest.files.length} files (${kinds.signature} signatures, ${kinds.pdf} PDFs), database ${manifest.database.size_bytes} bytes, integrity ${manifest.integrity.integrity_check}, foreign key violations ${manifest.integrity.foreign_key_violations}`,
  );

  const refused = await dockerAsync(
    ['compose', '--project-name', project, '--file', composeFile, 'exec', '-T', 'timesheet', 'node', 'dist/server/cli.js', 'backup', '--to', '/data/private-data/backups'],
    composeEnv,
  );
  check('a target inside DATA_DIR is refused (exit 2)', refused.status === 2);
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

  // 7. Stage 2 (WP4-T05): a backup inside the container while writes continue, verified outside it.
  await stageTwo(relogin.cookie);
  const logsAfterBackup = compose(['logs', '--no-color', 'timesheet']).stdout;
  check('container log after the backup has no deprecation warning', !/deprecat/i.test(logsAfterBackup));
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

console.log(failures === 0 ? 'DRILL STAGES 1-2 PASSED' : `DRILL STAGES 1-2 FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);
