#!/usr/bin/env node
// Container drill, stage 1 (WP4-T04): builds the image for linux/amd64, starts it through compose.example.yaml on a fresh
// host data directory, waits until healthy, records the schema version, creates synthetic data through the API,
// restarts the container, checks the data persisted, then inspects the image (runtime user, forbidden files).
// Stage 2 (WP4-T05): finalizes a synthetic period (signature, PDF), then runs `cli.js backup --to /data/backups` inside
// the running container while a synthetic writer keeps writing through the API, and verifies the backup outside the
// container: manifest keys, every file and the database copy against their SHA-256 and size, integrity and foreign
// keys of the copy, and that the copy is a point-in-time image.
// Stage 3 (WP4-T06): refuses restore targets inside the running container, stops the source instance (never two queues
// on the same data), restores the stage-2 backup with `cli.js restore` in a one-off container (no network, read-only
// root) into a fresh host directory, checks the restored copy on the host (hashes, integrity, schema, outbound pause,
// counts and ledger sums equal to the backup), starts the restored instance on that directory, compares the ledger and
// revisions through its API, signs off a new period and shows that the paused runner renders its PDF but claims no send
// job and spends no attempt (host copy after a clean stop). Attempt 2 (coordinator decision): that paused instance is
// backed up with its queued send job and restored again; the restore holds the job, `cli.js outbound resume --confirm`
// releases only a job created after the restore, nothing from the backup goes out, and only
// `cli.js outbound release --job <id>` and `--all` (with `--confirm`) send the held jobs, each exactly once.
//
// Stage 4 (WP4-T12A, upgrade): with the previous build (the accepted WP3 source, prepared by the operator, see --wp3) a
// schema-N database is built on the host (`cli.js migrate`, `cli.js seed`, synthetic sessions, a second signature file,
// two signed-off periods with queued PDF and send jobs). The CURRENT build's backup tool takes the paired pre-upgrade
// backup of that older schema without migrating it, and the backup is verified on the host. The old data is mounted into
// the current image: the migrations run once, up to the image's own latest schema (read from /api/ready, never pinned), a
// restart applies nothing, and integrity_check, foreign_key_check, every old row, the OT balances and the revision counts
// equal the pre-upgrade values (the upgraded runner then captures the queued mail, as a real upgraded instance would).
// Stage 5 (WP4-T12A, rollback): the previous build's `cli.js migrate` on the upgraded database refuses (exit code recorded);
// the paired backup is restored with `cli.js restore --keep-schema` into an empty host directory (refused without
// --confirm, because a schema older than the outbound pause cannot hold a pause; with it every queued send job is held and
// the schema is not migrated); the previous build starts on the restored data with its runner ON in capture mode, and no
// send attempt appears (balances, counts and health checked). A control copy of the same backup without the hold shows that
// the previous build would otherwise send the queued mail.
//
// Stage 6 (WP4-T12, import and opening balance, inside the container, runner off so no background job moves the counts): an
// owner previews a synthetic workbook through /api/imports (generated in memory from the tracked template; nothing is
// written to the repository), decides every listed day and commits it; the identical workbook committed again leaves the
// eight table counts (timesheets, day_entries, work_sessions, ot_ledger, timesheet_revisions, signoffs, jobs,
// delivery_attempts) unchanged; the opening balance posted twice leaves exactly one opening_balance entry; a sign-off of an
// imported period answers 409 imported_period; another user (and an administrator) gets 404 for the batch.
// The earlier stages are extended for the features added since: the stage 2 backup holds the import sources (committed and
// preview batches, hashes equal to the uploaded workbooks) and a `backup prune --dry-run` inside the container counts what
// it would remove and removes nothing; the stage 3 restore holds every import source, and the outbound pause is read from
// /api/admin/operations; stage 4 migrates from the WP3 schema to the image's latest schema (migrations 0011-0013 included).
//
// Usage: npm run drill:container -- --work <empty host directory outside the repository> [--project <name>] [--wp3 <dir>] [--keep]
//   --work     host directory for the drill data, the env file and the raw logs (created if missing; nothing in it is deleted)
//   --project  Compose project name; every container, volume and network of the drill carries it (default timesheet-drill)
//   --wp3      the previous build for stages 4 and 5, prepared outside the repository and outside --work's data directories:
//              `git archive 49651c8 | tar -x -C <dir>`, then `npm ci` and `npm run build:server` inside <dir> (git is only read).
//              Without it the drill runs stages 1-3 and 6 only and says so.
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
import { buildSyntheticWorkbook, readTemplateBytes } from '../tests/support/syntheticWorkbook.ts';

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
  console.error('Usage: npm run drill:container -- --work <host directory outside the repository> [--project <name>] [--wp3 <previous build directory>] [--keep]');
  process.exit(2);
}
const work = resolve(workOption);
const project = option('project', 'timesheet-drill');
const wp3Option = option('wp3', undefined);
const previousBuild = wp3Option === undefined ? null : resolve(wp3Option);
if (previousBuild !== null) {
  if (previousBuild.toLowerCase().startsWith(resolve(repo).toLowerCase())) {
    console.error('--wp3 must be outside the repository');
    process.exit(2);
  }
  for (const needed of [join('dist', 'server', 'cli.js'), join('dist', 'server', 'index.js'), join('node_modules', 'better-sqlite3')]) {
    if (!existsSync(join(previousBuild, needed))) {
      console.error(`--wp3 is not a prepared build (missing ${needed}): git archive the accepted source, then npm ci and npm run build:server there`);
      process.exit(2);
    }
  }
}
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
let passes = 0;
function check(label, condition, detail = '') {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
  if (condition) passes += 1;
  else failures += 1;
}
/** Per-stage tally: the PASS and FAIL lines printed since the previous stage report. */
const stageTally = [];
let tallyMark = { passes: 0, failures: 0 };
function stageReport(stage, title) {
  const line = { stage, title, passes: passes - tallyMark.passes, failures: failures - tallyMark.failures };
  tallyMark = { passes, failures };
  stageTally.push(line);
  console.log(`STAGE ${stage} (${title}): ${line.passes} PASS, ${line.failures} FAIL`);
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
    else if (/\.map$/i.test(name) && topLevelUnderApp === 'dist') offenders.push(path); // the app's own build; dependencies may ship maps
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

/* ------------------------------------------------------------------------------------- synthetic imports ---- */

const TEMPLATE_SHA256 = '47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331';
const XLSX_MEDIA_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * A synthetic workbook, generated in memory from the tracked sanitized template (the WP4-T08 generator): dated sheets, a
 * fictional employee name, nothing written to disk. The template hash is asserted before every use.
 */
function syntheticWorkbook(periods) {
  const template = readTemplateBytes();
  if (sha256Of(template) !== TEMPLATE_SHA256) throw new Error('the tracked template workbook changed');
  return buildSyntheticWorkbook({ periods, template });
}

/** The raw-body upload of /api/imports (the only route besides the signature upload that is not JSON). */
async function uploadWorkbook(cookie, bytes) {
  const response = await fetch(`${base}/api/imports`, {
    method: 'POST',
    headers: { origin: publicOrigin, cookie, 'content-type': XLSX_MEDIA_TYPE },
    body: bytes,
    signal: AbortSignal.timeout(30_000),
  });
  const text = await response.text();
  return { status: response.status, json: parseJson(text), text };
}

/** Decides every listed day: `import` where the plan allows it (non-authoritative labels), otherwise `skip`. */
const decideAll = (plan) => (plan?.decisions_required ?? []).map((item) => ({ work_date: item.work_date, action: item.allowed_actions.includes('import') ? 'import' : 'skip' }));

/** Import batches of a database file (read-only; [] when the schema has no imports table): identity, state and source hash. */
function importFacts(path) {
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    if (db.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'imports'").pluck().get() === 0) return [];
    return db.prepare('SELECT id, state, source_sha256, size_bytes, storage_key FROM imports ORDER BY id').all();
  } finally {
    db.close();
  }
}

/** Every private file a database refers to, as the manifest lists it: attachments plus import sources, by storage key. */
function referencedFiles(db) {
  const hasImports = db.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = 'imports'").pluck().get() === 1;
  const attachments = 'SELECT storage_key, kind, sha256, size_bytes FROM attachments';
  const imports = "SELECT storage_key, 'import' AS kind, source_sha256 AS sha256, size_bytes FROM imports";
  return db.prepare(`${hasImports ? `${attachments} UNION ALL ${imports}` : attachments} ORDER BY storage_key`).all();
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

  // Two import batches before the backup, so it holds import sources: one committed and one still a preview. The periods
  // (payroll 2026-02-20 and 2026-01-23) end long before the synthetic writer's first day, so nothing meets them later.
  const uploads = [];
  const committedWorkbook = syntheticWorkbook([{ payrollDate: '2026-02-20', days: { 1: { label: 'Vacation' } } }]);
  const previewWorkbook = syntheticWorkbook([{ payrollDate: '2026-01-23' }]);
  const committedPreview = await uploadWorkbook(cookie, committedWorkbook);
  const committedBatch = committedPreview.json?.import;
  check('employee previews a synthetic workbook through /api/imports (201, new batch)', committedPreview.status === 201 && committedPreview.json?.created === true && committedBatch?.state === 'preview', `status ${committedPreview.status}`);
  const committedResult = await call('POST', `/api/imports/${committedBatch?.id}/commit`, { cookie, body: { decisions: decideAll(committedBatch?.plan) } });
  check('the batch commits with a decision for every listed day', committedResult.status === 200 && committedResult.json?.status === 'committed' && committedResult.json?.import?.state === 'committed', `status ${committedResult.status}`);
  const previewOnly = await uploadWorkbook(cookie, previewWorkbook);
  check('a second workbook stays a preview batch (not committed)', previewOnly.status === 201 && previewOnly.json?.import?.state === 'preview');
  const importSources = [
    { id: committedBatch?.id, state: 'committed', sha256: sha256Of(committedWorkbook), size: committedWorkbook.length },
    { id: previewOnly.json?.import?.id, state: 'preview', sha256: sha256Of(previewWorkbook), size: previewWorkbook.length },
  ];

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
  const kinds = { signature: 0, pdf: 0, import: 0 };
  for (const file of manifest.files) kinds[file.kind] = (kinds[file.kind] ?? 0) + 1;
  check('the backup holds signature images and the PDF', kinds.signature >= 1 && kinds.pdf >= 1);
  const manifestImports = manifest.files.filter((file) => file.kind === 'import');
  const expectedSources = importSources.map((source) => ({ kind: 'import', sha256: source.sha256, size_bytes: source.size })).sort((a, b) => (a.sha256 < b.sha256 ? -1 : 1));
  check(
    'the backup holds both import sources (committed and preview), with the SHA-256 and size of the uploaded workbooks',
    JSON.stringify(manifestImports.map((file) => ({ kind: file.kind, sha256: file.sha256, size_bytes: file.size_bytes })).sort((a, b) => (a.sha256 < b.sha256 ? -1 : 1))) === JSON.stringify(expectedSources),
    `${kinds.import} import sources`,
  );
  const sourceBytesMismatched = manifestImports.filter((file) => sha256Of(readFileSync(join(folder, 'files', file.storage_key))) !== file.sha256);
  check('every import source file in the backup hashes to its manifest entry', sourceBytesMismatched.length === 0 && manifestImports.length === importSources.length);

  const copy = new Database(join(folder, 'timesheet.db'), { readonly: true, fileMustExist: true });
  try {
    check('database copy passes integrity_check outside the container', copy.pragma('integrity_check', { simple: true }) === 'ok');
    check('database copy has no foreign key violation', copy.pragma('foreign_key_check').length === 0);
    const schemaVersion = copy.prepare('SELECT max(version) FROM schema_migrations').pluck().get();
    check('schema version of the copy equals the manifest and the running instance', schemaVersion === manifest.schema_version && schemaVersion === printed.schema_version, `schema ${schemaVersion}`);
    const attachments = referencedFiles(copy);
    check('manifest files equal the attachment and import-source rows of the copy', JSON.stringify(attachments) === JSON.stringify(manifest.files));
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

  // Pruning, dry run only: two older folders of the same UTC day (manifest only, written by this script) are expired next to
  // the real backup, so a prune would remove two. The dry run inside the container prints the counts and removes nothing.
  const backupsDir = join(dataDir, 'backups');
  const [, stamp] = /^timesheet-backup-(\d{8}T\d{6}Z)-/.exec(String(printed.backup)) ?? [];
  const realInstant = new Date(`${stamp?.slice(0, 4)}-${stamp?.slice(4, 6)}-${stamp?.slice(6, 8)}T${stamp?.slice(9, 11)}:${stamp?.slice(11, 13)}:${stamp?.slice(13, 15)}Z`);
  const decoys = [];
  for (const secondsBefore of [1, 2]) {
    const instant = new Date(realInstant.getTime() - secondsBefore * 1000);
    if (instant.toISOString().slice(0, 10) !== realInstant.toISOString().slice(0, 10)) continue;
    const iso = instant.toISOString().replace(/\.\d{3}Z$/, 'Z');
    const name = `timesheet-backup-${iso.replace(/[-:]/g, '')}-${randomBytes(4).toString('hex')}`;
    mkdirSync(join(backupsDir, name));
    writeFileSync(join(backupsDir, name, 'manifest.json'), `${JSON.stringify({ ...manifest, created_at: iso }, null, 2)}\n`);
    decoys.push(name);
  }
  const foldersBefore = readdirSync(backupsDir).sort();
  const dry = await dockerAsync(
    ['compose', '--project-name', project, '--file', composeFile, 'exec', '-T', 'timesheet', 'node', 'dist/server/cli.js', 'backup', 'prune', '--in', '/data/backups', '--dry-run'],
    composeEnv,
  );
  const dryJson = parseJson(dry.stdout);
  check(
    'backup prune --dry-run inside the container exits 0 and prints counts only (candidates, keep, remove, ignored)',
    dry.status === 0 && dryJson?.outcome === 'dry_run' && JSON.stringify(Object.keys(dryJson).sort()) === JSON.stringify(['candidates', 'ignored', 'keep', 'outcome', 'remove']) && !PRIVATE_OUTPUT.test(dry.stdout),
    dry.stdout.trim(),
  );
  check('the dry run counts the two expired same-day folders and keeps the real backup', dryJson?.candidates === 1 + decoys.length && dryJson?.keep === 1 && dryJson?.remove === decoys.length && dryJson?.ignored === 0);
  const foldersAfter = readdirSync(backupsDir).sort();
  check(
    'the dry run removed nothing: every folder, manifest and the real backup files are still there',
    JSON.stringify(foldersAfter) === JSON.stringify(foldersBefore) && decoys.every((name) => existsSync(join(backupsDir, name, 'manifest.json'))) && readdirSync(folder).sort().join(',') === 'files,manifest.json,timesheet.db',
    `${foldersAfter.length} folders`,
  );
  return { backupName: String(printed.backup), importSources };
}

/* ---------------------------------------------------------------------------------------------- stage 3 ---- */

/** Counts and ledger sums of a database file (read-only): what the restored copy must equal. No id, name or address. */
function businessFacts(path) {
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    return {
      users: db.prepare('SELECT count(*) FROM users').pluck().get(),
      revisions_per_user: db.prepare('SELECT count(*) FROM timesheet_revisions GROUP BY user_id ORDER BY user_id').pluck().all(),
      ledger_per_user: db.prepare('SELECT count(*) AS entries, sum(delta_minutes) AS minutes FROM ot_ledger GROUP BY user_id ORDER BY user_id').all(),
      signoffs: db.prepare('SELECT count(*) FROM signoffs').pluck().get(),
      attachments: db.prepare('SELECT count(*) FROM attachments').pluck().get(),
      work_sessions: db.prepare('SELECT count(*) FROM work_sessions').pluck().get(),
    };
  } finally {
    db.close();
  }
}

/** Outbound jobs (id, state, attempts) and delivery attempt states of a database file, read-only. */
function outboundFacts(path) {
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    return {
      jobs: db.prepare("SELECT id, state, attempts FROM jobs WHERE kind IN ('send_email', 'send_reminder') ORDER BY id").all(),
      attempts: db.prepare('SELECT id, state, decision FROM delivery_attempts ORDER BY id').all(),
      pause: db.prepare('SELECT outbound_paused_at, outbound_paused_reason FROM operations_state').get(),
      schema: db.prepare('SELECT max(version) FROM schema_migrations').pluck().get(),
      integrity: db.pragma('integrity_check', { simple: true }),
      foreignKeyViolations: db.pragma('foreign_key_check').length,
    };
  } finally {
    db.close();
  }
}

/** A host copy of a database file that no running process holds (taken only after a clean stop or before a start). */
function hostCopy(path, name) {
  const copy = join(work, name);
  if (existsSync(copy)) throw new Error(`${name} exists already`);
  writeFileSync(copy, readFileSync(path));
  return copy;
}

const RESTORE_SUMMARY_KEYS = ['counts', 'manifest', 'outbound', 'outcome', 'reconciliation', 'schema'];
const PAUSE_LINE = /Outbound delivery PAUSED since \d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ \(reason: restored\)/;
const PRIVATE_OUTPUT = /@|Synthetic|employee|\/data|\/backups|\/restore|\\/i;

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Signs off one past synthetic period as the employee; returns the status and the new revision id. */
async function signOffPeriod(cookie, payrollDate) {
  const review = await call('GET', `/api/timesheets/${payrollDate}/review`, { cookie });
  const signoff = await call('POST', `/api/timesheets/${payrollDate}/signoff`, {
    cookie,
    body: { expected_version: review.json?.expected_version, reviewed_hash: review.json?.payload_hash, signer_name: 'Synthetic Employee', incomplete_evidence_acknowledged: true },
  });
  return { status: signoff.status, revisionId: signoff.json?.revision?.id };
}

/** Polls until `predicate` holds or the timeout passes. */
async function waitUntil(predicate, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await predicate()) return { ok: true, seconds: (Date.now() - start) / 1000 };
    await sleep(1000);
  }
  return { ok: false, seconds: (Date.now() - start) / 1000 };
}

async function waitPdfReady(cookie, revisionId) {
  const ready = await waitUntil(async () => ((await call('GET', '/api/revisions', { cookie })).json?.revisions ?? []).some((item) => item.id === revisionId && item.pdf_state === 'ready'), 120_000);
  return ready.ok;
}

async function stageThree({ backupName, cookie, adminPassword, importSources }) {
  const backupFolder = join(dataDir, 'backups', backupName);
  const manifest = JSON.parse(readFileSync(join(backupFolder, 'manifest.json'), 'utf8'));

  // Source facts while it still runs: its API view of the ledger and revisions, and the backup copy on the host.
  const sourceLedger = await call('GET', '/api/ot/ledger', { cookie });
  const sourceRevisions = await call('GET', '/api/revisions', { cookie });
  check('source ledger and revisions read through the API', sourceLedger.status === 200 && sourceRevisions.status === 200);
  const backupFacts = businessFacts(join(backupFolder, 'timesheet.db'));

  // Refused targets, inside the running source container.
  const cliIn = (cliArgs) => compose(['exec', '-T', 'timesheet', 'node', 'dist/server/cli.js', ...cliArgs], { allowFailure: true });
  const busy = cliIn(['restore', '--from', `/data/backups/${backupName}`, '--to', '/data/backups']);
  check('restore into a non-empty target is refused (exit 2, target_not_empty)', busy.status === 2 && busy.stderr.includes('target_not_empty'));
  const inside = cliIn(['restore', '--from', `/data/backups/${backupName}`, '--to', '/data/private-data/restore']);
  check('restore into the live DATA_DIR is refused (exit 2, target_inside_data_dir)', inside.status === 2 && inside.stderr.includes('target_inside_data_dir'));
  check('a refused restore created nothing in the live data directory', !existsSync(join(dataDir, 'private-data', 'restore')));

  // Stop the source first: the old and the restored queues never run at the same time.
  const sourceContainer = containerId();
  compose(['stop', '--timeout', '45', 'timesheet']);
  const stopped = docker(['inspect', '--format', '{{.State.Status}}', sourceContainer], { allowFailure: true }).stdout.trim();
  check('source instance stopped before the restore', stopped === 'exited', stopped);

  // The restore: a one-off container without network, read-only root, the backups read-only and a fresh host directory.
  const restoredDir = join(work, 'restored');
  mkdirSync(restoredDir);
  check('restore target is a fresh empty host directory', readdirSync(restoredDir).length === 0);
  const restoreStart = Date.now();
  const restore = docker(
    [
      'run', '--rm', '--read-only', '--network', 'none', '--tmpfs', '/tmp:size=64m,mode=1777', '--name', `${project}-restore`,
      '--env-file', envFile, '--volume', `${forwardSlashes(join(dataDir, 'backups'))}:/backups:ro`, '--volume', `${forwardSlashes(restoredDir)}:/restore`,
      image, 'node', 'dist/server/cli.js', 'restore', '--from', `/backups/${backupName}`, '--to', '/restore',
    ],
    { allowFailure: true },
  );
  const restoreMs = Date.now() - restoreStart;
  const summary = parseJson(restore.stdout);
  check('cli.js restore in a one-off container exits 0', restore.status === 0 && summary?.outcome === 'restored', restore.status === 0 ? `${restoreMs} ms` : `exit ${restore.status}: ${String(restore.stderr).trim().slice(0, 300)}`);
  if (summary === null) throw new Error('no restore summary');
  check('restore output has exactly the allowed keys and no address, name or path', JSON.stringify(Object.keys(summary).sort()) === JSON.stringify(RESTORE_SUMMARY_KEYS) && !PRIVATE_OUTPUT.test(restore.stdout));
  check(
    'restore verified the manifest and paused outbound delivery (reason restored)',
    summary.manifest?.verified === true && summary.manifest?.files === manifest.files.length && summary.outbound?.paused === true && summary.outbound?.reason === 'restored',
  );
  console.log(`INFO  restore summary: ${JSON.stringify(summary)}`);
  const left = docker(['ps', '--all', '--quiet', '--filter', `name=${project}-restore`], { allowFailure: true }).stdout.trim();
  check('the one-off restore container is gone', left === '');

  // Host checks on the restored directory (no process holds it yet; the database is read from a copy).
  check('restored directory holds the database and the private data directory only', readdirSync(restoredDir).sort().join(',') === 'private-data,timesheet.db');
  const restoredFiles = join(restoredDir, 'private-data', 'files');
  const badFiles = manifest.files.filter((file) => {
    const path = join(restoredFiles, file.storage_key);
    if (!existsSync(path)) return true;
    const bytes = readFileSync(path);
    return sha256Of(bytes) !== file.sha256 || bytes.length !== file.size_bytes;
  });
  check(
    'every restored file matches its manifest SHA-256 and size',
    badFiles.length === 0 && readdirSync(restoredFiles).length === manifest.files.length,
    `${manifest.files.length} files, ${badFiles.length} mismatched`,
  );
  const atRestore = hostCopy(join(restoredDir, 'timesheet.db'), 'restored-at-restore.db');
  const restoredOutbound = outboundFacts(atRestore);
  check('restored database passes integrity_check and has no foreign key violation', restoredOutbound.integrity === 'ok' && restoredOutbound.foreignKeyViolations === 0);
  check('restored schema version equals the backup', restoredOutbound.schema === manifest.schema_version, `schema ${restoredOutbound.schema}`);
  check('restored copy is paused with reason restored', restoredOutbound.pause?.outbound_paused_reason === 'restored' && typeof restoredOutbound.pause?.outbound_paused_at === 'string');
  check(
    'no outbound job is leased and no attempt is sending or preparing in the restored copy',
    restoredOutbound.jobs.every((job) => job.state !== 'leased') && restoredOutbound.attempts.every((attempt) => attempt.state !== 'sending' && attempt.state !== 'preparing'),
  );
  const restoredFacts = businessFacts(atRestore);
  check('restored balances (ledger entries and sums per user), revisions, sign-offs, files and sessions equal the backup', JSON.stringify(restoredFacts) === JSON.stringify(backupFacts));
  // The import sources (WP4-T09B): every batch of the backup is in the restored copy, and its source file is restored with the
  // hash of the workbook that was uploaded.
  const restoredImports = importFacts(atRestore);
  check(
    'restored import batches (ids, states, source hashes and sizes) equal the backup and the uploaded workbooks',
    JSON.stringify(restoredImports) === JSON.stringify(importFacts(join(backupFolder, 'timesheet.db'))) &&
      restoredImports.length === importSources.length &&
      importSources.every((source) => restoredImports.some((row) => row.id === source.id && row.state === source.state && row.source_sha256 === source.sha256 && row.size_bytes === source.size)),
    `${restoredImports.length} batches`,
  );
  const lostSources = restoredImports.filter((row) => {
    const path = join(restoredFiles, row.storage_key);
    return !existsSync(path) || sha256Of(readFileSync(path)) !== row.source_sha256;
  });
  check('every import source file is restored and hashes to its batch', lostSources.length === 0 && restoredImports.length > 0, `${restoredImports.length - lostSources.length} of ${restoredImports.length} sources`);
  const totals = {
    users: restoredFacts.users,
    import_batches: restoredImports.length,
    revisions: restoredFacts.revisions_per_user.reduce((sum, value) => sum + value, 0),
    ledger_entries: restoredFacts.ledger_per_user.reduce((sum, row) => sum + row.entries, 0),
    ledger_minutes: restoredFacts.ledger_per_user.reduce((sum, row) => sum + row.minutes, 0),
    signoffs: restoredFacts.signoffs,
    attachments: restoredFacts.attachments,
    work_sessions: restoredFacts.work_sessions,
    outbound_jobs: restoredOutbound.jobs.length,
    delivery_attempts: restoredOutbound.attempts.length,
  };
  console.log(`INFO  restored counts (equal to the backup): ${JSON.stringify(totals)}`);

  // Start the restored instance on the fresh directory (same project; the stopped source container is replaced).
  composeEnv.TIMESHEET_DATA_DIR = forwardSlashes(restoredDir);
  compose(['up', '--detach', '--no-build']);
  const healthy = await waitHealthy(180_000);
  check('restored instance becomes healthy', healthy.ok, `${healthy.seconds.toFixed(1)} s (${healthy.state})`);
  if (!healthy.ok) throw new Error('restored instance not healthy');
  check('restored instance logs the outbound pause at startup', PAUSE_LINE.test(compose(['logs', '--no-color', 'timesheet']).stdout));

  // The same data through the restored instance's API (the employee's stored sign-in session was restored too).
  const restoredLedger = await call('GET', '/api/ot/ledger', { cookie });
  check('stored sign-in session works on the restored instance', restoredLedger.status === 200);
  check(
    'OT balance and ledger entries through the API equal the source',
    JSON.stringify(restoredLedger.json?.balance) === JSON.stringify(sourceLedger.json?.balance) && restoredLedger.json?.entries?.length === sourceLedger.json?.entries?.length,
    `${restoredLedger.json?.entries?.length} entries`,
  );
  const restoredRevisions = await call('GET', '/api/revisions', { cookie });
  check('revisions through the API equal the source', JSON.stringify(restoredRevisions.json?.revisions) === JSON.stringify(sourceRevisions.json?.revisions), `${restoredRevisions.json?.revisions?.length} revisions`);

  const restoredList = await call('GET', '/api/imports', { cookie });
  check(
    'the employee lists the same import batches through the API of the restored instance',
    restoredList.status === 200 && JSON.stringify((restoredList.json?.imports ?? []).map((item) => item.id).sort()) === JSON.stringify(importSources.map((source) => source.id).sort()),
    `${restoredList.json?.imports?.length} batches`,
  );
  const committedSource = importSources.find((source) => source.state === 'committed');
  const restoredBatch = await call('GET', `/api/imports/${committedSource?.id}`, { cookie });
  check('the committed batch reads back as committed with its report on the restored instance', restoredBatch.status === 200 && restoredBatch.json?.import?.state === 'committed' && restoredBatch.json?.import?.source_sha256 === committedSource?.sha256);

  // While paused: a new sign-off (a send job created after the restore) waits; its PDF renders, its send is not claimed.
  const later = await signOffPeriod(cookie, '2026-04-17');
  check('a sign-off on the paused restored instance creates a send job (not held: created after the restore)', later.status === 201, `status ${later.status}`);
  check('its PDF renders while outbound delivery is paused', await waitPdfReady(cookie, later.revisionId));
  // A second send job, so the bulk release after the second restore has more than the one released by id (R-A5).
  const laterToo = await signOffPeriod(cookie, '2026-05-15');
  check('a second sign-off on the paused restored instance creates a second send job', laterToo.status === 201 && (await waitPdfReady(cookie, laterToo.revisionId)), `status ${laterToo.status}`);
  const previewBefore = cliIn(['outbound', 'resume']);
  const before = parseJson(previewBefore.stdout);
  check('outbound resume without --confirm only previews (exit 2) and shows the paused queue', previewBefore.status === 2 && before?.paused === true && before?.queued_send_jobs >= 1, previewBefore.stdout.trim());
  const adminLogin = await call('POST', '/api/auth/login', { body: { email: 'admin@example.invalid', password: adminPassword } });
  const waitStart = Date.now();
  await sleep(40_000); // more than two passes of the 15 s runner loop
  const operations = await call('GET', '/api/admin/operations', { cookie: adminLogin.cookie });
  const ops = operations.json?.operations;
  check('the restored runner keeps running (heartbeat) while paused', ops?.runner?.state === 'running', `waited ${((Date.now() - waitStart) / 1000).toFixed(0)} s`);
  check('/api/admin/operations reports outbound delivery paused with reason restored', operations.status === 200 && ops?.outbound?.paused === true && ops?.outbound?.reason === 'restored' && typeof ops?.outbound?.paused_at === 'string', JSON.stringify({ paused: ops?.outbound?.paused, reason: ops?.outbound?.reason, queued: ops?.outbound?.queued_send_jobs, held: ops?.outbound?.held_send_jobs }));
  const acceptedAtRestore = restoredOutbound.attempts.filter((attempt) => attempt.state === 'accepted').length;
  check('no job is leased and nothing more was accepted while paused', ops?.jobs?.leased === 0 && (ops?.deliveries?.accepted ?? 0) === acceptedAtRestore, `jobs ${JSON.stringify(ops?.jobs)}`);
  check('nothing was captured while paused', !existsSync(join(restoredDir, 'private-data', 'mail-capture')));
  check('nothing was sent while paused: no delivery attempt beyond the restored ones', Object.values(ops?.deliveries ?? {}).reduce((sum, value) => sum + value, 0) === restoredOutbound.attempts.length, JSON.stringify(ops?.deliveries));

  // Clean stop, then the attempt counters on a host copy: every restored outbound job unchanged, the new one unclaimed.
  compose(['stop', '--timeout', '45', 'timesheet']);
  const paused = outboundFacts(hostCopy(join(restoredDir, 'timesheet.db'), 'restored-after-paused-run.db'));
  const known = new Map(restoredOutbound.jobs.map((job) => [job.id, job]));
  const changed = paused.jobs.filter((job) => known.has(job.id) && JSON.stringify(job) !== JSON.stringify(known.get(job.id)));
  const added = paused.jobs.filter((job) => !known.has(job.id));
  check('paused run: no restored outbound job changed state or attempts', changed.length === 0, `${restoredOutbound.jobs.length} restored outbound jobs, ${changed.length} changed`);
  check('paused run: the two new send jobs are queued with no attempt spent', added.length === 2 && added.every((job) => job.state === 'queued' && job.attempts === 0), `${added.length} new`);
  check(
    'paused run: still paused, no attempt sending and none accepted beyond the restored ones',
    paused.pause?.outbound_paused_reason === 'restored' &&
      paused.attempts.every((attempt) => attempt.state !== 'sending') &&
      paused.attempts.filter((attempt) => attempt.state === 'accepted').length === acceptedAtRestore,
  );

  // Second generation (WP4-T06 attempt 2): a backup that holds a queued send job, restored again. After the resume,
  // nothing from that backup goes out until the operator releases it explicitly.
  const oneOff = (name, volumes, cliArgs) =>
    docker(
      ['run', '--rm', '--read-only', '--network', 'none', '--tmpfs', '/tmp:size=64m,mode=1777', '--name', `${project}-${name}`, '--env-file', envFile, ...volumes.flatMap((volume) => ['--volume', volume]), image, 'node', 'dist/server/cli.js', ...cliArgs],
      { allowFailure: true },
    );
  const backup2 = oneOff('backup', [`${forwardSlashes(restoredDir)}:/data`], ['backup', '--to', '/data/backups']);
  const backup2Summary = parseJson(backup2.stdout);
  check('a backup of the paused restored instance (with its queued send job) exits 0', backup2.status === 0 && backup2Summary?.outcome === 'succeeded', backup2.status === 0 ? '' : String(backup2.stderr).trim().slice(0, 300));
  if (backup2Summary === null) throw new Error('no second backup');
  const restoredDir2 = join(work, 'restored-2');
  mkdirSync(restoredDir2);
  const restore2 = oneOff('restore', [`${forwardSlashes(join(restoredDir, 'backups'))}:/backups:ro`, `${forwardSlashes(restoredDir2)}:/restore`], ['restore', '--from', `/backups/${backup2Summary.backup}`, '--to', '/restore']);
  const summary2 = parseJson(restore2.stdout);
  check('the second restore exits 0 and holds the backed-up queued send job (queued 0)', restore2.status === 0 && summary2?.reconciliation?.send_jobs_held >= 1 && summary2?.reconciliation?.queued_send_jobs === 0, JSON.stringify(summary2?.reconciliation));
  console.log(`INFO  second restore summary: ${JSON.stringify(summary2)}`);

  // Which revisions' send jobs the second restore holds (host copy before the instance starts; ids stay in this process).
  const heldDb = new Database(hostCopy(join(restoredDir2, 'timesheet.db'), 'restored-2-at-restore.db'), { readonly: true, fileMustExist: true });
  let heldRevisions;
  try {
    heldRevisions = heldDb
      .prepare("SELECT revision_id FROM jobs WHERE kind = 'send_email' AND state = 'intervention' AND last_error = 'reconcile_after_restore' ORDER BY created_at")
      .pluck()
      .all();
  } finally {
    heldDb.close();
  }
  check('the second restore holds both queued send jobs of the paused instance', heldRevisions.includes(later.revisionId) && heldRevisions.includes(laterToo.revisionId), `${heldRevisions.length} held send jobs`);
  const importsSecond = importFacts(join(work, 'restored-2-at-restore.db'));
  const sourcesSecond = importsSecond.filter((row) => existsSync(join(restoredDir2, 'private-data', 'files', row.storage_key)) && sha256Of(readFileSync(join(restoredDir2, 'private-data', 'files', row.storage_key))) === row.source_sha256);
  check('the second restore (a backup of a restored instance) also holds every import source', importsSecond.length === importSources.length && sourcesSecond.length === importSources.length, `${sourcesSecond.length} of ${importsSecond.length} sources`);

  composeEnv.TIMESHEET_DATA_DIR = forwardSlashes(restoredDir2);
  compose(['up', '--detach', '--no-build']);
  const healthy2 = await waitHealthy(180_000);
  check('second restored instance becomes healthy and logs the pause', healthy2.ok && PAUSE_LINE.test(compose(['logs', '--no-color', 'timesheet']).stdout), `${healthy2.seconds.toFixed(1)} s`);
  if (!healthy2.ok) throw new Error('second restored instance not healthy');
  // A job created after this restore (another sign-off) is not held: it only waits for the resume.
  const fresh = await signOffPeriod(cookie, '2026-05-01');
  check('a sign-off after the second restore creates a send job', fresh.status === 201 && (await waitPdfReady(cookie, fresh.revisionId)), `status ${fresh.status}`);
  const held = parseJson(cliIn(['outbound', 'release']).stdout);
  const heldSend = (held?.jobs ?? []).find((job) => job.kind === 'send_email' && job.blocker === null);
  check('outbound release (preview, exit 2) lists the held send job as releasable', held?.outcome === 'confirmation_required' && held?.held >= 1 && heldSend !== undefined, JSON.stringify({ held: held?.held, releasable: held?.releasable, blocked: held?.blocked }));
  const attemptsOf = async (revisionId) => (await call('GET', `/api/deliveries?revision_id=${revisionId}`, { cookie })).json?.deliveries?.length ?? -1;
  const atRestore2 = await Promise.all(heldRevisions.map((revisionId) => attemptsOf(revisionId)));
  const resume = cliIn(['outbound', 'resume', '--confirm']);
  check('cli.js outbound resume --confirm clears the pause (exit 0)', resume.status === 0 && parseJson(resume.stdout)?.outcome === 'resumed', resume.stdout.trim());
  const freshClaimed = await waitUntil(async () => (await attemptsOf(fresh.revisionId)) >= 1, 60_000);
  check('after the resume the runner claims the send job created after the restore', freshClaimed.ok, `${freshClaimed.seconds.toFixed(1)} s`);
  await sleep(35_000); // two more runner passes
  // The held sends of the backup: their revisions keep the attempt count they had at the restore.
  const after1 = await Promise.all(heldRevisions.map((revisionId) => attemptsOf(revisionId)));
  check('after the resume nothing from the backups went out: no new attempt on any held send', JSON.stringify(after1) === JSON.stringify(atRestore2), `${JSON.stringify(atRestore2)} -> ${JSON.stringify(after1)}`);
  const opsAfter = (await call('GET', '/api/admin/operations', { cookie: (await call('POST', '/api/auth/login', { body: { email: 'admin@example.invalid', password: adminPassword } })).cookie })).json?.operations;
  check('no outbound job is leased after the resume', opsAfter?.jobs?.leased === 0, `jobs ${JSON.stringify(opsAfter?.jobs)}`);

  // The explicit, audited release (one by id, then the rest in bulk): each held job goes out exactly once.
  const release = cliIn(['outbound', 'release', '--job', heldSend?.id ?? 'none', '--confirm']);
  check('cli.js outbound release --job <id> --confirm releases one held job (exit 0)', release.status === 0 && parseJson(release.stdout)?.outcome === 'released', release.stdout.trim());
  const bulk = cliIn(['outbound', 'release', '--all', '--confirm']);
  const bulkResult = parseJson(bulk.stdout);
  check(
    'cli.js outbound release --all --confirm releases the remaining held send jobs (exit 0, released >= 1)',
    bulk.status === 0 && bulkResult?.released >= 1 && bulkResult?.released === (held?.releasable ?? 0) - 1,
    bulk.stdout.trim(),
  );
  const releasedClaimed = await waitUntil(async () => (await Promise.all(heldRevisions.map((revisionId) => attemptsOf(revisionId)))).every((value, index) => value > (atRestore2[index] ?? 0)), 60_000);
  check('the released jobs are claimed', releasedClaimed.ok, `${releasedClaimed.seconds.toFixed(1)} s`);
  await sleep(35_000);
  const after2 = await Promise.all(heldRevisions.map((revisionId) => attemptsOf(revisionId)));
  check('each released job made exactly one delivery attempt', after2.every((value, index) => value === (atRestore2[index] ?? 0) + 1), `${JSON.stringify(atRestore2)} -> ${JSON.stringify(after2)}`);
  const again = cliIn(['outbound', 'release', '--job', heldSend?.id ?? 'none', '--confirm']);
  check('releasing it again is refused (exit 1, not_held)', again.status === 1 && parseJson(again.stdout)?.code === 'not_held');
  const deliveries = await call('GET', '/api/deliveries', { cookie });
  const states = {};
  for (const item of deliveries.json?.deliveries ?? []) states[item.state] = (states[item.state] ?? 0) + 1;
  console.log(`INFO  delivery attempt states at the end (capture mode, synthetic data without recipients): ${JSON.stringify(states)}`);
  const finalLog = compose(['logs', '--no-color', 'timesheet']).stdout;
  check('restored instance log has no deprecation warning', !/deprecat/i.test(finalLog));
  check('restored instance log never contains a password', !finalLog.includes(adminPassword));
  const leftovers = docker(['ps', '--all', '--quiet', '--filter', `name=${project}-`], { allowFailure: true }).stdout.trim().split('\n').filter((line) => line !== '');
  check('only the compose service container of the project runs (one-off containers are gone)', leftovers.length === 1);
}

/* ------------------------------------------------------------------------------------- stages 4 and 5 ---- */

/*
 * Stage 4 (upgrade) and stage 5 (rollback) need the PREVIOUS build, the accepted WP3 source, prepared outside the
 * repository: `git archive 49651c8 | tar -x -C <dir>`, then `npm ci` and `npm run build:server` inside <dir>
 * (git is only read; no other commit is ever checked out). It runs on the host (the host's Node), never in the image.
 */

/** A copy of the environment with the settings of the previous build replaced; production and runner flags are added by the caller. */
function previousBuildEnv(databasePath, privateDir, extra = {}) {
  const env = { ...process.env };
  for (const name of ['NODE_ENV', 'JOB_RUNNER', 'HOST', 'PORT', 'SEED_ADMIN_PASSWORD', 'SEED_EMPLOYEE_PASSWORD', 'SEED_EMPLOYEE2_PASSWORD']) delete env[name];
  return {
    ...env,
    DATABASE_PATH: databasePath,
    DATA_DIR: privateDir,
    MAIL_FROM: 'timesheet@example.invalid',
    OUTBOUND_MODE: 'capture',
    APP_ORIGINS: publicOrigin,
    PUBLIC_BASE_URL: publicOrigin,
    ...extra,
  };
}

function previousCli(args, env) {
  const result = spawnSync(process.execPath, [join(previousBuild, 'dist', 'server', 'cli.js'), ...args], { cwd: previousBuild, encoding: 'utf8', env, maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw result.error;
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

const previousServers = new Set();

/** Starts the previous build's server on loopback and waits for /api/health (it has no /api/ready). */
async function startPreviousServer(name, databasePath, privateDir, { runnerOff = false, production = false } = {}) {
  const port = await freeLoopbackPort();
  const env = previousBuildEnv(databasePath, privateDir, {
    HOST: '127.0.0.1',
    PORT: String(port),
    ...(runnerOff ? { JOB_RUNNER: 'off' } : {}),
    ...(production ? { NODE_ENV: 'production' } : {}),
  });
  const child = spawn(process.execPath, [join(previousBuild, 'dist', 'server', 'index.js')], { cwd: previousBuild, env, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  child.stdout.setEncoding('utf8').on('data', (chunk) => {
    log += chunk;
  });
  child.stderr.setEncoding('utf8').on('data', (chunk) => {
    log += chunk;
  });
  const exited = new Promise((done) => child.once('exit', (code) => done(code)));
  const server = {
    base: `http://127.0.0.1:${port}`,
    log: () => log,
    /** Terminates the process this script started (its own child handle); on Windows this is an abrupt stop, so the database is read in place afterwards. */
    async stop() {
      if (child.exitCode === null) {
        child.kill();
        await Promise.race([exited, sleep(15_000)]);
      }
      writeFileSync(join(work, `previous-build-${name}.log`), log);
      previousServers.delete(server);
    },
  };
  previousServers.add(server);
  const started = Date.now();
  for (;;) {
    try {
      const health = await fetch(`${server.base}/api/health`, { signal: AbortSignal.timeout(2000) });
      if (health.ok) return server;
    } catch {
      // not listening yet
    }
    if (Date.now() - started > 30_000 || child.exitCode !== null) {
      await server.stop();
      throw new Error(`the previous build did not start (${name})`);
    }
    await sleep(300);
  }
}

/** Reads every table of a database file (read-only): column list, row count and a digest of all rows in insertion order. */
function tableSnapshot(path) {
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    const names = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").pluck().all();
    const tables = {};
    for (const name of names) {
      const columns = db.prepare('SELECT name FROM pragma_table_info(?) ORDER BY cid').pluck().all(name);
      const rows = db.prepare(`SELECT ${columns.map((column) => `"${column}"`).join(', ')} FROM "${name}" ORDER BY rowid`).all();
      tables[name] = { columns, rows: rows.length, digest: sha256Of(JSON.stringify(rows)) };
    }
    return tables;
  } finally {
    db.close();
  }
}

/** Tables a running application legitimately writes after a start (heartbeat, sessions, job state) are skipped; the bookkeeping of migrations is checked on its own. */
const SNAPSHOT_SKIPPED = new Set(['jobs', 'auth_sessions', 'operations_state', 'schema_migrations']);
/** Tables that only grow: the rows of the earlier snapshot must still be the first rows (a PDF, an attempt or an audit row may be appended). */
const SNAPSHOT_APPEND_ONLY = new Set(['attachments', 'audit_events', 'delivery_attempts', 'revision_files']);

/**
 * Compares a database file with an earlier snapshot of the same data, table by table and column by column (the columns of
 * the snapshot only, so a table that gained a column still compares). Returns the names of the tables that differ.
 * `strict` compares every table in full, for a source that nothing may have written.
 */
function snapshotMismatches(path, snapshot, { strict = false } = {}) {
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    const mismatched = [];
    for (const [name, before] of Object.entries(snapshot)) {
      if (!strict && SNAPSHOT_SKIPPED.has(name)) continue;
      const exists = db.prepare("SELECT count(*) FROM sqlite_master WHERE type = 'table' AND name = ?").pluck().get(name) === 1;
      if (!exists) {
        mismatched.push(name);
        continue;
      }
      const limit = !strict && SNAPSHOT_APPEND_ONLY.has(name) ? ` LIMIT ${before.rows}` : '';
      const rows = db.prepare(`SELECT ${before.columns.map((column) => `"${column}"`).join(', ')} FROM "${name}" ORDER BY rowid${limit}`).all();
      if (rows.length !== before.rows || sha256Of(JSON.stringify(rows)) !== before.digest) mismatched.push(name);
    }
    return mismatched;
  } finally {
    db.close();
  }
}

/** Facts that exist at every schema version (no pause columns): schema, integrity, outbound jobs and attempts. */
function plainFacts(path) {
  const db = new Database(path, { readonly: true, fileMustExist: true });
  try {
    return {
      schema: db.prepare('SELECT max(version) FROM schema_migrations').pluck().get(),
      migrations: db.prepare('SELECT version, name, checksum, applied_at FROM schema_migrations ORDER BY version').all(),
      integrity: db.pragma('integrity_check', { simple: true }),
      foreignKeyViolations: db.pragma('foreign_key_check').length,
      outboundJobs: db.prepare("SELECT id, kind, state, attempts, last_error FROM jobs WHERE kind IN ('send_email', 'send_reminder') ORDER BY id").all(),
      attempts: db.prepare('SELECT id, state FROM delivery_attempts ORDER BY id').all(),
      pauseColumns: db.prepare("SELECT count(*) FROM pragma_table_info('operations_state') WHERE name LIKE 'outbound_paused%'").pluck().get(),
    };
  } finally {
    db.close();
  }
}

/** What the employee sees through the API: balance, ledger entry count and the identity of every revision. */
async function apiFacts(cookie) {
  const ledger = await call('GET', '/api/ot/ledger', { cookie });
  const revisions = await call('GET', '/api/revisions', { cookie });
  const list = revisions.json?.revisions ?? [];
  return {
    status: [ledger.status, revisions.status],
    balance: ledger.json?.balance,
    entries: ledger.json?.entries?.length,
    revisions: list.map((item) => ({ id: item.id, revision_no: item.revision_no, payroll_date: item.payroll_date, revision_kind: item.revision_kind, review_state: item.review_state })).sort((a, b) => (a.id < b.id ? -1 : 1)),
    pdfReady: list.filter((item) => item.pdf_state === 'ready').length,
    accepted: list.filter((item) => item.delivery_state === 'accepted').length,
  };
}

const identityOf = (facts) => JSON.stringify({ balance: facts.balance, entries: facts.entries, revisions: facts.revisions });

/** A one-off container of the current image (no network, read-only root), like the restore of stage 3. */
function runOneOff(name, volumes, cliArgs) {
  return docker(
    ['run', '--rm', '--read-only', '--network', 'none', '--tmpfs', '/tmp:size=64m,mode=1777', '--name', `${project}-${name}`, '--env-file', envFile, ...volumes.flatMap((volume) => ['--volume', volume]), image, 'node', 'dist/server/cli.js', ...cliArgs],
    { allowFailure: true },
  );
}

/** The manifest, database and file checks of a backup folder on the host (the stage 2 checks, without the live comparison). */
function verifyBackupFolder(folder, expectedSchema) {
  const manifest = JSON.parse(readFileSync(join(folder, 'manifest.json'), 'utf8'));
  check('paired backup: manifest has exactly the allowed keys and the old schema version', JSON.stringify([...new Set(keyPaths(manifest))].sort()) === JSON.stringify([...MANIFEST_KEY_PATHS].sort()) && manifest.schema_version === expectedSchema, `schema ${manifest.schema_version}`);
  const dbBytes = readFileSync(join(folder, 'timesheet.db'));
  check('paired backup: database copy matches the manifest SHA-256 and size', sha256Of(dbBytes) === manifest.database.sha256 && dbBytes.length === manifest.database.size_bytes);
  const mismatched = manifest.files.filter((file) => {
    const bytes = readFileSync(join(folder, 'files', file.storage_key));
    return sha256Of(bytes) !== file.sha256 || bytes.length !== file.size_bytes;
  });
  check('paired backup: every file matches its manifest SHA-256 and size', mismatched.length === 0 && manifest.files.length > 0, `${manifest.files.length} files, ${mismatched.length} mismatched`);
  const facts = plainFacts(join(folder, 'timesheet.db'));
  check('paired backup: copy passes integrity_check, has no foreign key violation and carries the old schema', facts.integrity === 'ok' && facts.foreignKeyViolations === 0 && facts.schema === expectedSchema);
  return manifest;
}

async function stageFour() {
  const containerBase = base;
  const upgradeDir = join(work, 'upgrade');
  const live = join(upgradeDir, 'data');
  const databasePath = join(live, 'timesheet.db');
  const privateDir = join(live, 'private-data');
  mkdirSync(live, { recursive: true });
  check('upgrade data directory is fresh', readdirSync(live).length === 0);
  const passwords = { admin: password(), employee: password(), employee2: password() };

  // 1. A database produced by the previous build: migrate, then seed (synthetic data only).
  const cliEnv = previousBuildEnv(databasePath, privateDir, { SEED_ADMIN_PASSWORD: passwords.admin, SEED_EMPLOYEE_PASSWORD: passwords.employee, SEED_EMPLOYEE2_PASSWORD: passwords.employee2 });
  const migrated = previousCli(['migrate'], cliEnv);
  const migratedJson = parseJson(migrated.stdout);
  const oldVersion = migratedJson?.version;
  check('previous build: cli.js migrate creates the database', migrated.status === 0 && Array.isArray(migratedJson?.applied) && migratedJson.applied.length === oldVersion, `schema ${oldVersion}`);
  const seeded = previousCli(['seed'], cliEnv);
  check('previous build: cli.js seed creates synthetic example.invalid data', seeded.status === 0 && seeded.stdout.includes('employee2@example.invalid'));

  // Sessions, a second signature file and two signed-off periods through the previous build's API (its runner stays off,
  // so the PDF and send jobs stay queued: the state a pre-upgrade backup holds).
  const server = await startPreviousServer('seed-data', databasePath, privateDir, { runnerOff: true });
  base = server.base;
  let apiBefore;
  let cookie;
  try {
    const login = await call('POST', '/api/auth/login', { body: { email: 'employee2@example.invalid', password: passwords.employee2 } });
    cookie = login.cookie;
    check('previous build: synthetic employee signs in', login.status === 200 && cookie !== undefined, `status ${login.status}`);
    let sessionsOk = true;
    for (const day of ['2026-03-02', '2026-03-03', '2026-03-16']) {
      const created = await call('POST', `/api/days/${day}/sessions`, {
        cookie,
        body: { start: local(day, '09:00'), end: local(day, '18:00'), input_zone: 'America/Los_Angeles', breaks_confirmed: true, reason: 'Synthetic upgrade drill record', breaks: [{ start: local(day, '13:00'), end: local(day, '13:30'), counts_as_work: false }] },
      });
      if (created.status !== 201) sessionsOk = false;
    }
    check('previous build: three synthetic work sessions recorded', sessionsOk);
    check('previous build: a second synthetic signature file is stored', (await uploadSignature(cookie, 90)) === 201);
    const first = await signOffPeriod(cookie, '2026-03-20');
    const second = await signOffPeriod(cookie, '2026-04-03');
    check('previous build: two synthetic periods signed off (revisions, OT ledger, queued PDF and send jobs)', first.status === 201 && second.status === 201, `status ${first.status}/${second.status}`);
    apiBefore = await apiFacts(cookie);
  } finally {
    await server.stop();
    base = containerBase;
  }
  check('pre-upgrade API facts read (ledger and two revisions)', apiBefore.status.join() === '200,200' && apiBefore.revisions.length === 2 && apiBefore.entries >= 1, `${apiBefore.entries} ledger entries, ${apiBefore.revisions.length} revisions`);
  // A clean close of the old database (checkpoints the write-ahead log): the previous build's migrate applies nothing at its own version.
  const closed = parseJson(previousCli(['migrate'], cliEnv).stdout);
  check('previous build: migrate at its own schema applies nothing', closed?.applied?.length === 0 && closed?.version === oldVersion);

  const preSnapshot = tableSnapshot(databasePath);
  const preFacts = plainFacts(databasePath);
  const preBusiness = businessFacts(databasePath);
  const queuedSends = preFacts.outboundJobs.filter((job) => job.state === 'queued' && job.kind === 'send_email').length;
  check('pre-upgrade state: schema of the previous build, queued send jobs, signatures, revisions and OT credits', preFacts.schema === oldVersion && queuedSends === 2 && preBusiness.attachments >= 2 && preBusiness.signoffs === 2 && preBusiness.ledger_per_user.length >= 1, `schema ${preFacts.schema}, ${queuedSends} queued send jobs, ${preBusiness.attachments} files`);
  check('pre-upgrade database is consistent', preFacts.integrity === 'ok' && preFacts.foreignKeyViolations === 0);

  // 2. The paired pre-upgrade backup: the CURRENT build's backup tool on the older schema, without migrating the source.
  const backupsDir = join(upgradeDir, 'backups');
  mkdirSync(backupsDir);
  const backupRun = runOneOff('upgrade-backup', [`${forwardSlashes(live)}:/data`, `${forwardSlashes(backupsDir)}:/backups`], ['backup', '--to', '/backups']);
  const backupSummary = parseJson(backupRun.stdout);
  check('cli.js backup (current build) of the older schema exits 0 and records no status (the schema has none)', backupRun.status === 0 && backupSummary?.outcome === 'succeeded' && backupSummary?.status_recorded === false, backupRun.status === 0 ? '' : `exit ${backupRun.status}: ${String(backupRun.stderr).trim().slice(0, 300)}`);
  if (backupSummary === null) throw new Error('no pre-upgrade backup summary');
  const backupName = String(backupSummary.backup);
  const pairedFolder = join(backupsDir, backupName);
  const pairedManifest = verifyBackupFolder(pairedFolder, oldVersion);
  check('the source database was not migrated or changed by its backup (every table equal, schema unchanged)', snapshotMismatches(databasePath, preSnapshot, { strict: true }).length === 0 && plainFacts(databasePath).schema === oldVersion);
  console.log(`INFO  paired backup: schema ${pairedManifest.schema_version}, ${pairedManifest.files.length} files, database ${pairedManifest.database.size_bytes} bytes; source: ${preFacts.outboundJobs.length} outbound jobs (${queuedSends} queued send_email), ${preBusiness.revisions_per_user.reduce((sum, value) => sum + value, 0)} revisions, ${preBusiness.ledger_per_user.reduce((sum, row) => sum + row.entries, 0)} ledger entries`);

  // 3. Mount the old data into the current image: the migrations run once, up to the image's latest schema.
  compose(['stop', '--timeout', '45', 'timesheet']);
  composeEnv.TIMESHEET_DATA_DIR = forwardSlashes(live);
  compose(['up', '--detach', '--no-build']);
  const upgraded = await waitHealthy(180_000);
  check('current image becomes healthy on the older data', upgraded.ok, `${upgraded.seconds.toFixed(1)} s (${upgraded.state})`);
  if (!upgraded.ok) throw new Error('upgraded instance not healthy');
  const ready = await call('GET', '/api/ready');
  const target = ready.json?.schema?.expected;
  check('/api/ready: schema is the image latest (derived from the image, not pinned) and newer than the old one', ready.status === 200 && ready.json?.status === 'ready' && ready.json?.schema?.actual === target && target > oldVersion, `schema ${oldVersion} -> ${ready.json?.schema?.actual} of ${target}`);

  // The employee's stored sign-in session (a row of the old database) works, and the balance and revisions are the same.
  const apiAfter = await apiFacts(cookie);
  check('stored sign-in session works on the upgraded instance', apiAfter.status.join() === '200,200');
  check('OT balance, ledger entry count and revision identities through the API equal the pre-upgrade values', identityOf(apiAfter) === identityOf(apiBefore), `${apiAfter.entries} ledger entries, ${apiAfter.revisions.length} revisions`);
  // The upgraded runner now does the queued work in capture mode: this is the mail that the paired backup still holds as queued.
  const worked = await waitUntil(async () => {
    const facts = await apiFacts(cookie);
    return facts.pdfReady === 2 && facts.accepted === 2;
  }, 120_000);
  check('the upgraded runner renders both queued PDFs and captures both queued sends', worked.ok, `${worked.seconds.toFixed(1)} s`);
  const upgradedLog1 = compose(['logs', '--no-color', 'timesheet']).stdout;
  check('upgraded instance log has no deprecation warning', !/deprecat/i.test(upgradedLog1));

  // 4. Stop cleanly, then read the database on the host: consistent, every old row kept, migrations applied once.
  compose(['stop', '--timeout', '45', 'timesheet']);
  const afterUpgrade = plainFacts(databasePath);
  check('upgraded database passes integrity_check and has no foreign key violation', afterUpgrade.integrity === 'ok' && afterUpgrade.foreignKeyViolations === 0);
  check('schema_migrations: contiguous 1..latest, and the old rows are unchanged', afterUpgrade.schema === target && afterUpgrade.migrations.map((row) => row.version).join() === Array.from({ length: target }, (_, index) => index + 1).join() && JSON.stringify(afterUpgrade.migrations.slice(0, oldVersion)) === JSON.stringify(preFacts.migrations));
  const appliedNow = afterUpgrade.migrations.slice(oldVersion);
  check('migrations 0011 (job retention), 0012 (imports) and 0013 (opening balance) are among the applied ones', [11, 12, 13].every((version) => appliedNow.some((row) => row.version === version)), `versions ${appliedNow.map((row) => row.version).join(',')}`);
  const upgradedImports = new Database(databasePath, { readonly: true, fileMustExist: true });
  try {
    const tables = upgradedImports.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('imports', 'job_retention_window') ORDER BY name").pluck().all();
    check('the upgraded database has the imports table (empty) and the retention window row', tables.join() === 'imports,job_retention_window' && upgradedImports.prepare('SELECT count(*) FROM imports').pluck().get() === 0 && upgradedImports.prepare('SELECT count(*) FROM job_retention_window').pluck().get() === 1);
  } finally {
    upgradedImports.close();
  }
  check('the new migrations ran exactly once, in one transaction (one application instant, one row each)', appliedNow.length === target - oldVersion && new Set(appliedNow.map((row) => row.applied_at)).size === 1, `${appliedNow.length} applied (versions ${appliedNow.map((row) => row.version).join(',')})`);
  const changed = snapshotMismatches(databasePath, preSnapshot);
  check('every pre-upgrade row of every table is unchanged (jobs, sessions and heartbeat aside; PDFs, attempts and audit rows may be appended)', changed.length === 0, changed.length === 0 ? `${Object.keys(preSnapshot).length} tables compared` : `differs: ${changed.join(',')}`);
  const upgradedBusiness = businessFacts(databasePath);
  check(
    'representative balances (ledger entries and sums per user), revision counts, sign-offs and sessions equal the pre-upgrade values',
    JSON.stringify({ ...upgradedBusiness, attachments: 0 }) === JSON.stringify({ ...preBusiness, attachments: 0 }) && upgradedBusiness.attachments >= preBusiness.attachments,
    `${upgradedBusiness.ledger_per_user.reduce((sum, row) => sum + row.entries, 0)} ledger entries, ${upgradedBusiness.ledger_per_user.reduce((sum, row) => sum + row.minutes, 0)} minutes`,
  );
  const migrationsAfterFirstStart = afterUpgrade.migrations;
  const finishedJobs = plainFacts(databasePath).outboundJobs;
  check('the upgraded instance finished the queued send jobs (so the paired backup still holds mail that already went out)', finishedJobs.filter((job) => job.kind === 'send_email').every((job) => job.state === 'succeeded'), `${finishedJobs.map((job) => job.state).join(',')}`);

  // 5. A restart applies nothing.
  compose(['up', '--detach', '--no-build']);
  const again = await waitHealthy(180_000);
  const readyAgain = await call('GET', '/api/ready');
  check('restart of the upgraded instance: healthy, same schema', again.ok && readyAgain.json?.schema?.actual === target, `${again.seconds.toFixed(1)} s`);
  compose(['stop', '--timeout', '45', 'timesheet']);
  check('restart applied no migration (schema_migrations identical, application instants included)', JSON.stringify(plainFacts(databasePath).migrations) === JSON.stringify(migrationsAfterFirstStart));
  const oneOffMigrate = runOneOff('upgrade-migrate', [`${forwardSlashes(live)}:/data`], ['migrate']);
  const oneOffJson = parseJson(oneOffMigrate.stdout);
  check('cli.js migrate (current build) on the upgraded database applies nothing', oneOffMigrate.status === 0 && oneOffJson?.applied?.length === 0 && oneOffJson?.version === target);
  const upgradedLog2 = compose(['logs', '--no-color', 'timesheet']).stdout;
  check('instance log after the restart has no deprecation warning', !/deprecat/i.test(upgradedLog2));
  return { oldVersion, target, passwords, databasePath, privateDir, live, backupsDir, backupName, preSnapshot, preFacts, preBusiness, apiBefore, cookie, queuedSends };
}

async function stageFive(four) {
  const { oldVersion, target, passwords, databasePath, privateDir, live, backupsDir, backupName, preSnapshot, preFacts, preBusiness, apiBefore } = four;
  const containerBase = base;

  // 1. The previous build refuses the upgraded database (migrate() refuses an unknown newer schema; O1 of WP4-PLAN).
  const upgradedSnapshot = tableSnapshot(databasePath);
  const liveListing = readdirSync(live).sort().join(',');
  const refusal = previousCli(['migrate'], previousBuildEnv(databasePath, privateDir));
  check('previous build: cli.js migrate on the upgraded database refuses (non-zero exit, newer than this application)', refusal.status !== 0 && refusal.status !== null && /newer than this application/.test(refusal.stderr), `exit code ${refusal.status}`);
  console.log(`INFO  refusal recorded: previous build cli.js migrate exit code ${refusal.status}, upgraded database at schema ${target}, previous build at schema ${oldVersion}`);
  check('the refusal changed nothing (every table equal, schema unchanged)', snapshotMismatches(databasePath, upgradedSnapshot, { strict: true }).length === 0 && plainFacts(databasePath).schema === target);

  // 2. The paired pre-upgrade backup, restored into an empty host directory in rollback mode (never the live data directory).
  const restoredDir = join(work, 'rollback');
  mkdirSync(restoredDir);
  const volumes = [`${forwardSlashes(backupsDir)}:/backups:ro`, `${forwardSlashes(restoredDir)}:/restore`];
  const restoreArgs = ['restore', '--from', `/backups/${backupName}`, '--to', '/restore'];
  const unconfirmed = runOneOff('rollback-refuse', volumes, [...restoreArgs, '--keep-schema']);
  check('rollback restore of the older schema is refused without --confirm (exit 2, unpaused_schema_unconfirmed), writing nothing', unconfirmed.status === 2 && unconfirmed.stderr.includes('unpaused_schema_unconfirmed') && readdirSync(restoredDir).length === 0);
  const confirmedStart = Date.now();
  const confirmed = runOneOff('rollback-restore', volumes, [...restoreArgs, '--keep-schema', '--confirm']);
  const summary = parseJson(confirmed.stdout);
  check('cli.js restore --keep-schema --confirm exits 0', confirmed.status === 0 && summary?.outcome === 'restored', confirmed.status === 0 ? `${Date.now() - confirmedStart} ms` : `exit ${confirmed.status}: ${String(confirmed.stderr).trim().slice(0, 300)}`);
  if (summary === null) throw new Error('no rollback restore summary');
  check('restore output has exactly the allowed keys and no address, name or path', JSON.stringify(Object.keys(summary).sort()) === JSON.stringify(RESTORE_SUMMARY_KEYS) && !PRIVATE_OUTPUT.test(confirmed.stdout));
  check('the schema is kept as in the backup (no migration) and the manifest is verified', summary.schema?.backup === oldVersion && summary.schema?.restored === oldVersion && summary.schema?.applied?.length === 0 && summary.manifest?.verified === true);
  check('the restore states that nothing could be paused, held every queued send job and left none queued', summary.outbound?.paused === false && summary.reconciliation?.send_jobs_held === four.queuedSends && summary.reconciliation?.queued_send_jobs === 0, JSON.stringify(summary.reconciliation));
  check('the restore warns on stderr that the copy is not paused and names JOB_RUNNER=off', /WARNING/.test(confirmed.stderr) && confirmed.stderr.includes('JOB_RUNNER=off'));
  console.log(`INFO  rollback restore summary: ${JSON.stringify(summary)}`);
  check('the live (upgraded) data directory was not written by the restore', readdirSync(live).sort().join(',') === liveListing && snapshotMismatches(databasePath, upgradedSnapshot, { strict: true }).length === 0);

  // Host checks on the restored directory (nothing holds it yet).
  const restoredDb = join(restoredDir, 'timesheet.db');
  const restoredPrivate = join(restoredDir, 'private-data');
  check('restored directory holds the database and the private data directory only', readdirSync(restoredDir).sort().join(',') === 'private-data,timesheet.db');
  const pairedManifest = JSON.parse(readFileSync(join(backupsDir, backupName, 'manifest.json'), 'utf8'));
  const badFiles = pairedManifest.files.filter((file) => {
    const path = join(restoredPrivate, 'files', file.storage_key);
    return !existsSync(path) || sha256Of(readFileSync(path)) !== file.sha256;
  });
  check('every restored file matches its manifest SHA-256', badFiles.length === 0 && readdirSync(join(restoredPrivate, 'files')).length === pairedManifest.files.length, `${pairedManifest.files.length} files, ${badFiles.length} mismatched`);
  const restoredFacts = plainFacts(restoredDb);
  check('restored database: schema of the previous build (not upgraded), no pause columns, consistent', restoredFacts.schema === oldVersion && restoredFacts.pauseColumns === 0 && restoredFacts.integrity === 'ok' && restoredFacts.foreignKeyViolations === 0, `schema ${restoredFacts.schema}`);
  check('restored database: no outbound job is queued or leased; every backed-up send job is held; no attempt exists', restoredFacts.outboundJobs.every((job) => job.state !== 'queued' && job.state !== 'leased') && restoredFacts.outboundJobs.filter((job) => job.state === 'intervention' && job.last_error === 'reconcile_after_restore').length === four.queuedSends && restoredFacts.attempts.length === 0, `${restoredFacts.outboundJobs.length} outbound jobs held`);
  const restoredMismatch = snapshotMismatches(restoredDb, preSnapshot);
  check('restored rows equal the pre-upgrade rows of every table (jobs, sessions and heartbeat aside)', restoredMismatch.length === 0, restoredMismatch.length === 0 ? `${Object.keys(preSnapshot).length} tables compared` : `differs: ${restoredMismatch.join(',')}`);
  const restoredBusiness = businessFacts(restoredDb);
  check('restored balances (ledger entries and sums), revision counts, sign-offs, files and sessions equal the pre-upgrade values', JSON.stringify(restoredBusiness) === JSON.stringify(preBusiness));
  console.log(`INFO  restored counts (equal to the pre-upgrade values): ${JSON.stringify({ users: restoredBusiness.users, revisions: restoredBusiness.revisions_per_user.reduce((sum, value) => sum + value, 0), ledger_entries: restoredBusiness.ledger_per_user.reduce((sum, row) => sum + row.entries, 0), ledger_minutes: restoredBusiness.ledger_per_user.reduce((sum, row) => sum + row.minutes, 0), signoffs: restoredBusiness.signoffs, attachments: restoredBusiness.attachments, work_sessions: restoredBusiness.work_sessions })}`);

  // 3. Control, NOT a supported procedure: the same backup copied as plain files, without the hold. The previous build sends
  //    (capture) the queued mail, which is exactly what the hold prevents in the restored copy.
  const controlDir = join(work, 'rollback-control');
  mkdirSync(join(controlDir, 'private-data', 'files'), { recursive: true });
  writeFileSync(join(controlDir, 'timesheet.db'), readFileSync(join(backupsDir, backupName, 'timesheet.db')));
  for (const file of pairedManifest.files) writeFileSync(join(controlDir, 'private-data', 'files', file.storage_key), readFileSync(join(backupsDir, backupName, 'files', file.storage_key)));
  const control = await startPreviousServer('control-copy', join(controlDir, 'timesheet.db'), join(controlDir, 'private-data'));
  let controlAttempts = 0;
  try {
    base = control.base;
    const controlLogin = await call('POST', '/api/auth/login', { body: { email: 'employee2@example.invalid', password: passwords.employee2 } });
    const sent = await waitUntil(async () => {
      controlAttempts = (await call('GET', '/api/deliveries', { cookie: controlLogin.cookie })).json?.deliveries?.length ?? 0;
      return controlAttempts >= 1;
    }, 120_000);
    check('control: the previous build on a plain file copy of the backup (no hold) sends the queued mail by itself', sent.ok, `${controlAttempts} delivery attempts after ${sent.seconds.toFixed(1)} s (capture mode)`);
  } finally {
    await control.stop();
    base = containerBase;
  }

  // 4. Start the previous build on the restored data, with its runner ON in capture mode: the hold must be enough.
  const server = await startPreviousServer('rollback', restoredDb, restoredPrivate, { production: true });
  base = server.base;
  try {
    const health = await call('GET', '/api/health');
    check('health endpoint reports ok', health.status === 200 && health.json?.status === 'ok');
    const login = await call('POST', '/api/auth/login', { body: { email: 'employee2@example.invalid', password: passwords.employee2 } });
    check('the employee signs in on the previous build (users and password hashes restored)', login.status === 200 && login.cookie !== undefined, `status ${login.status}`);
    const stored = await apiFacts(four.cookie);
    check('the employee session stored before the upgrade works on the rolled-back instance', stored.status.join() === '200,200');
    const rolledBack = await apiFacts(login.cookie);
    check('OT balance, ledger entry count and revision identities through the API equal the pre-upgrade values', identityOf(rolledBack) === identityOf(apiBefore), `${rolledBack.entries} ledger entries, ${rolledBack.revisions.length} revisions`);
    const rendered = await waitUntil(async () => (await apiFacts(login.cookie)).pdfReady === 2, 90_000);
    check('non-outbound work resumes: the previous runner renders both pending PDFs', rendered.ok, `${rendered.seconds.toFixed(1)} s`);
    await sleep(40_000); // more than two passes of the 15 s runner loop after the PDFs
    const deliveries = await call('GET', '/api/deliveries', { cookie: login.cookie });
    check('no send attempt appears after the previous build started (runner on, capture mode)', deliveries.status === 200 && (deliveries.json?.deliveries ?? []).length === 0, `${deliveries.json?.deliveries?.length} delivery attempts`);
    const final = await apiFacts(login.cookie);
    check('no revision shows a delivery', final.accepted === 0);
    check('nothing was captured on the rolled-back instance', !existsSync(join(restoredPrivate, 'mail-capture')));
    check('previous build log has no deprecation warning and no error', !/deprecat|error/i.test(server.log()));
  } finally {
    await server.stop();
    base = containerBase;
  }
  const after = plainFacts(restoredDb);
  const heldNow = after.outboundJobs.filter((job) => job.state === 'intervention' && job.last_error === 'reconcile_after_restore');
  check('the held send jobs are untouched (state, attempts), still not queued, no delivery attempt in the database', JSON.stringify(after.outboundJobs) === JSON.stringify(restoredFacts.outboundJobs) && heldNow.length === four.queuedSends && after.attempts.length === 0 && after.schema === oldVersion);
  check('rolled-back database is still consistent at the previous schema', after.integrity === 'ok' && after.foreignKeyViolations === 0);
}

/* ---------------------------------------------------------------------------------------------- stage 6 ---- */

/** The eight tables whose counts an identical second import commit must leave unchanged (docs/07 "Workbook import"). */
const COUNT_TABLES = ['timesheets', 'day_entries', 'work_sessions', 'ot_ledger', 'timesheet_revisions', 'signoffs', 'jobs', 'delivery_attempts'];

/** Row counts read inside the container (the database is live, so the host does not open it): counts only. */
function countsInContainer() {
  const script = [
    "const Database = require('better-sqlite3');",
    "const db = new Database('/data/timesheet.db', { readonly: true, fileMustExist: true });",
    'const counts = {};',
    `for (const table of ${JSON.stringify(COUNT_TABLES)}) counts[table] = db.prepare('SELECT count(*) FROM ' + table).pluck().get();`,
    "counts.imports = db.prepare('SELECT count(*) FROM imports').pluck().get();",
    `counts.opening_balance = db.prepare("SELECT count(*) FROM ot_ledger WHERE entry_type = 'opening_balance'").pluck().get();`,
    'console.log(JSON.stringify(counts));',
  ].join('\n');
  const run = compose(['exec', '-T', 'timesheet', 'node', '-e', script], { allowFailure: true });
  const counts = parseJson(run.stdout);
  if (run.status !== 0 || counts === null) throw new Error(`counts could not be read: ${String(run.stderr).trim().slice(0, 300)}`);
  return counts;
}

const sameCounts = (left, right, keys = [...COUNT_TABLES, 'imports', 'opening_balance']) => keys.every((key) => left[key] === right[key]);
const printCounts = (label, counts) => console.log(`INFO  counts ${label}: ${COUNT_TABLES.map((table) => `${table} ${counts[table]}`).join(', ')}, imports ${counts.imports}, opening_balance ${counts.opening_balance}`);

async function stageSix({ employeePassword, adminPassword }) {
  // The job runner stays off for this stage: the scan jobs it enqueues every minute would move the jobs count between two
  // reads. Everything else is the production image on the production compose file, on the stage 1 data directory.
  writeFileSync(envFile, `${readFileSync(envFile, 'utf8').trimEnd()}\nJOB_RUNNER=off\n`, { mode: 0o600 });
  compose(['stop', '--timeout', '45', 'timesheet'], { allowFailure: true });
  composeEnv.TIMESHEET_DATA_DIR = forwardSlashes(dataDir);
  compose(['up', '--detach', '--no-build', '--force-recreate']);
  const healthy = await waitHealthy(180_000);
  check('the stage 1 instance starts again for stage 6 (healthy)', healthy.ok, `${healthy.seconds.toFixed(1)} s (${healthy.state})`);
  if (!healthy.ok) throw new Error('stage 6 instance not healthy');
  const runnerFlag = compose(['exec', '-T', 'timesheet', 'printenv', 'JOB_RUNNER'], { allowFailure: true }).stdout.trim();
  check('the job runner is off in the container (counts cannot move in the background)', runnerFlag === 'off');

  const employee = await call('POST', '/api/auth/login', { body: { email: 'employee@example.invalid', password: employeePassword } });
  const admin = await call('POST', '/api/auth/login', { body: { email: 'admin@example.invalid', password: adminPassword } });
  check('the synthetic owner and the administrator sign in', employee.status === 200 && admin.status === 200);
  const users = await call('GET', '/api/admin/users', { cookie: admin.cookie });
  const otherPassword = password();
  const createdOther = await call('POST', '/api/admin/users', {
    cookie: admin.cookie,
    body: { email: 'employee2@example.invalid', display_name: 'Synthetic Employee Two', role: 'employee', password: otherPassword, calendar_id: users.json?.users?.[0]?.calendar_id },
  });
  const other = await call('POST', '/api/auth/login', { body: { email: 'employee2@example.invalid', password: otherPassword } });
  check('another synthetic user exists and signs in', createdOther.status === 201 && other.status === 200, `status ${createdOther.status}/${other.status}`);

  // 1. Preview a synthetic workbook, decide every listed day, commit.
  const workbook = syntheticWorkbook([
    { payrollDate: '2026-02-06', days: { 1: { label: 'Vacation' }, 2: { label: 'Banana Day' }, 3: { label: 'Floating Holiday' }, 4: { labelFormulaCache: 'Worked' } } },
    { payrollDate: '2026-03-06' },
  ]);
  const start = countsInContainer();
  printCounts('before the first import', start);
  const preview = await uploadWorkbook(employee.cookie, workbook);
  const batch = preview.json?.import;
  const required = batch?.plan?.decisions_required ?? [];
  check('the owner previews the workbook through /api/imports (201, new batch, plan with decisions to make)', preview.status === 201 && preview.json?.created === true && batch?.state === 'preview' && required.length >= 3, `status ${preview.status}, ${required.length} days need a decision, ${batch?.plan?.importable_days} importable`);
  const previewed = countsInContainer();
  check('the preview stored only the batch: no timesheet, day entry, session, ledger entry, revision, sign-off, job or delivery attempt', previewed.imports === start.imports + 1 && sameCounts(previewed, start, [...COUNT_TABLES, 'opening_balance']));
  const decisions = decideAll(batch?.plan);
  check('every listed day gets a decision (skip, or import where the plan allows it)', decisions.length === required.length && decisions.length > 0, `${decisions.filter((item) => item.action === 'skip').length} skip, ${decisions.filter((item) => item.action === 'import').length} import`);
  const first = await call('POST', `/api/imports/${batch?.id}/commit`, { cookie: employee.cookie, body: { decisions } });
  check('the commit answers 200 committed', first.status === 200 && first.json?.status === 'committed' && first.json?.import?.state === 'committed', `status ${first.status} ${first.status === 200 ? '' : first.text.slice(0, 200)}`);
  const committed = countsInContainer();
  printCounts('after the first commit', committed);
  check(
    'the commit wrote only timesheets (two imported periods) and day entries: no session, ledger entry, revision, sign-off, job or delivery attempt',
    committed.timesheets === previewed.timesheets + 2 && committed.day_entries > previewed.day_entries && sameCounts(committed, previewed, ['work_sessions', 'ot_ledger', 'timesheet_revisions', 'signoffs', 'jobs', 'delivery_attempts', 'imports', 'opening_balance']),
  );

  // 2. The identical workbook again: the same batch, and a committed batch commits as a no-op.
  const again = await uploadWorkbook(employee.cookie, workbook);
  check('the identical workbook returns the same batch (200, not created)', again.status === 200 && again.json?.created === false && again.json?.import?.id === batch?.id);
  const second = await call('POST', `/api/imports/${batch?.id}/commit`, { cookie: employee.cookie, body: { decisions } });
  check('committing the identical workbook again answers 200 replayed', second.status === 200 && second.json?.status === 'replayed' && JSON.stringify(second.json?.import?.result) === JSON.stringify(first.json?.import?.result));
  const different = await call('POST', `/api/imports/${batch?.id}/commit`, { cookie: employee.cookie, body: { decisions: [] } });
  check('committing the batch with other decisions is refused (409 import_already_committed)', different.status === 409 && different.json?.error?.code === 'import_already_committed');
  const afterSecond = countsInContainer();
  printCounts('after the second commit', afterSecond);
  check(`the eight table counts (${COUNT_TABLES.join(', ')}) and the import batches are unchanged by the second commit`, sameCounts(afterSecond, committed, [...COUNT_TABLES, 'imports']));

  // 3. The opening balance, posted twice: exactly one entry.
  const opening = { minutes: 150, as_of_date: '2026-01-01', reason: 'Synthetic carried-in balance', evidence_ref: 'Synthetic ledger note 1', expected_version: 0 };
  const postedOnce = await call('POST', '/api/ot/opening-balance', { cookie: employee.cookie, body: opening });
  const postedTwice = await call('POST', '/api/ot/opening-balance', { cookie: employee.cookie, body: opening });
  check('the opening balance posts once (201 posted) and a repeat is a no-op (200 duplicate)', postedOnce.status === 201 && postedOnce.json?.status === 'posted' && postedTwice.status === 200 && postedTwice.json?.status === 'duplicate', `status ${postedOnce.status}/${postedTwice.status}`);
  const changed = await call('POST', '/api/ot/opening-balance', { cookie: employee.cookie, body: { ...opening, minutes: 200 } });
  check('a different opening balance is refused (409 opening_balance_exists)', changed.status === 409 && changed.json?.error?.code === 'opening_balance_exists');
  const afterOpening = countsInContainer();
  printCounts('after the opening balance', afterOpening);
  check('exactly one opening_balance entry exists, and it is the only new ledger row', afterOpening.opening_balance === 1 && afterOpening.ot_ledger === afterSecond.ot_ledger + 1 && sameCounts(afterOpening, afterSecond, COUNT_TABLES.filter((table) => table !== 'ot_ledger')));
  const stated = await call('GET', '/api/ot/opening-balance', { cookie: employee.cookie });
  check('the owner reads the opening balance back (150 minutes, as of 2026-01-01)', stated.status === 200 && stated.json?.opening_balance?.minutes === 150 && stated.json?.opening_balance?.as_of_date === '2026-01-01');

  // 4. An imported period is read-only history: a sign-off attempt is 409 imported_period and writes nothing.
  const review = await call('GET', '/api/timesheets/2026-03-06/review', { cookie: employee.cookie });
  const signoff = await call('POST', '/api/timesheets/2026-03-06/signoff', {
    cookie: employee.cookie,
    body: { expected_version: review.json?.expected_version, reviewed_hash: review.json?.payload_hash, signer_name: 'Synthetic Employee', incomplete_evidence_acknowledged: true },
  });
  check('a sign-off of an imported period answers 409 imported_period', review.status === 200 && signoff.status === 409 && signoff.json?.error?.code === 'imported_period', `status ${review.status}/${signoff.status} ${signoff.json?.error?.code}`);
  check('the refused sign-off wrote nothing', sameCounts(countsInContainer(), afterOpening));

  // 5. Ownership: another user, and an administrator, cannot see or commit the batch.
  const otherRead = await call('GET', `/api/imports/${batch?.id}`, { cookie: other.cookie });
  const otherCommit = await call('POST', `/api/imports/${batch?.id}/commit`, { cookie: other.cookie, body: { decisions } });
  const otherList = await call('GET', '/api/imports', { cookie: other.cookie });
  const adminRead = await call('GET', `/api/imports/${batch?.id}`, { cookie: admin.cookie });
  check('another synthetic user gets 404 for the batch (read and commit) and lists none', otherRead.status === 404 && otherCommit.status === 404 && otherList.status === 200 && otherList.json?.imports?.length === 0, `status ${otherRead.status}/${otherCommit.status}/${otherList.status}`);
  check('an administrator gets 404 for the batch as well', adminRead.status === 404);
  const end = countsInContainer();
  printCounts('at the end of stage 6', end);
  check('the ownership attempts wrote nothing', sameCounts(end, afterOpening));
  const log = compose(['logs', '--no-color', 'timesheet']).stdout;
  check('the stage 6 instance log has no deprecation warning and never contains a password', !/deprecat/i.test(log) && !log.includes(employeePassword) && !log.includes(adminPassword) && !log.includes(otherPassword));
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
  check('forbidden-file scan (*.xlsx, source maps under /app/dist, .env*, handoff, tests, docs, reference, .claude, .agents, databases)', offenders.length === 0, offenders.slice(0, 5).join(' | '));
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
  // No source maps are served (WP4-A-01): the bundle has no sourceMappingURL and /assets/<bundle>.map answers 404.
  const indexPage = await call('GET', '/');
  const bundlePath = /src="(\/assets\/[^"]+\.js)"/.exec(indexPage.text)?.[1];
  const bundle = bundlePath === undefined ? null : await call('GET', bundlePath);
  check('the client bundle is served and carries no sourceMappingURL', bundle?.status === 200 && bundle.text.length > 1000 && !/sourceMappingURL/.test(bundle.text), `${bundlePath ?? 'no bundle in index.html'} ${bundle?.text.length ?? 0} bytes`);
  const mapAnswer = await call('GET', `${bundlePath ?? '/assets/none.js'}.map`);
  check('/assets/<bundle>.map answers 404', mapAnswer.status === 404, `status ${mapAnswer.status}`);
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

  stageReport(1, 'build, image, start, persistence');

  // 7. Stage 2 (WP4-T05, extended in WP4-T12): a backup inside the container while writes continue, verified outside it.
  const two = await stageTwo(relogin.cookie);
  const logsAfterBackup = compose(['logs', '--no-color', 'timesheet']).stdout;
  check('container log after the backup has no deprecation warning', !/deprecat/i.test(logsAfterBackup));
  stageReport(2, 'backup, import sources, prune dry run');

  // 8. Stage 3 (WP4-T06, extended in WP4-T12): isolated restore of that backup, a paused restored instance, then the explicit resume.
  await stageThree({ backupName: two.backupName, cookie: relogin.cookie, adminPassword, importSources: two.importSources });
  stageReport(3, 'restore, pause, release');

  // 9. Stages 4 and 5 (WP4-T12A): upgrade of an older database, then rollback to it, with the previous build.
  if (previousBuild === null) {
    console.log('INFO  stages 4 and 5 (upgrade, rollback) skipped: no --wp3 previous build given');
  } else {
    const four = await stageFour();
    stageReport(4, 'upgrade from the WP3 schema');
    await stageFive(four);
    stageReport(5, 'rollback to the WP3 build');
  }

  // 10. Stage 6 (WP4-T12): workbook import, identical second commit, opening balance, imported period, ownership.
  await stageSix({ employeePassword, adminPassword });
  stageReport(6, 'import and opening balance');
} catch (error) {
  failures += 1;
  console.log(`FAIL  drill stopped: ${error instanceof Error ? error.message : String(error)}`);
} finally {
  for (const server of [...previousServers]) await server.stop();
  if (started && !keep) {
    const down = compose(['down', '--volumes', '--timeout', '45'], { allowFailure: true });
    check('cleanup by project name (docker compose down -v)', down.status === 0);
  }
  const left = docker(['ps', '--all', '--quiet', '--filter', `name=${project}`], { allowFailure: true }).stdout.trim();
  if (!keep) check('no container of the project remains', left === '');
}

const stages = previousBuild === null ? '1-3 and 6' : '1-6';
console.log(`SUMMARY ${stageTally.map((line) => `stage ${line.stage}: ${line.passes} PASS${line.failures === 0 ? '' : ` ${line.failures} FAIL`}`).join('; ')}; total ${passes} PASS, ${failures} FAIL`);
console.log(failures === 0 ? `DRILL STAGES ${stages} PASSED` : `DRILL STAGES ${stages} FAILED (${failures})`);
process.exit(failures === 0 ? 0 : 1);
