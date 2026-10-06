import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { parseUtcInstant } from '../../src/domain/instants.ts';
import { buildManifest, MANIFEST_FILE_NAME, serializeManifest } from '../../src/server/ops/manifest.ts';
import { PruneError, pruneBackups, selectRetention } from '../../src/server/ops/prune.ts';
import { createTestContext, MutableClock, type TestContext } from '../support/testApp.ts';

/*
 * WP4-T05B: pruning of old backups (owner decision F-5, docs/07 "Backup, restore and upgrades").
 *
 * Keep the newest backup of each of the last 7 UTC days, 4 ISO weeks and 6 UTC months (counted from the injected clock;
 * day, week and month come from the manifest instant), plus the newest overall. Only folders the backup tool created
 * (exact name, valid manifest agreeing with the name) are candidates; everything else is never touched.
 */

const iso = (value: string): number => parseUtcInstant(value);
const nameOf = (instant: string, hex = 'a1b2c3d4'): string => `timesheet-backup-${instant.replace(/[-:]/g, '')}-${hex}`;

function candidate(instant: string) {
  return { name: nameOf(instant), instant: iso(instant) };
}

/** The kept instants of a selection, as `YYYY-MM-DDTHH:MM:SSZ`, ascending. */
function keptInstants(candidates: ReturnType<typeof candidate>[], now: string): string[] {
  const { keep } = selectRetention(candidates, iso(now));
  const kept = new Set(keep);
  return candidates
    .filter((item) => kept.has(item.name))
    .map((item) => new Date(item.instant * 1000).toISOString().replace('.000Z', 'Z'))
    .sort();
}

/** Two backups a day (03:00 and 21:00 UTC) from `from` to `to`, inclusive, as day strings. */
function calendar(from: string, to: string, hours: readonly string[]): ReturnType<typeof candidate>[] {
  const out: ReturnType<typeof candidate>[] = [];
  for (let day = Date.parse(`${from}T00:00:00Z`); day <= Date.parse(`${to}T00:00:00Z`); day += 86_400_000) {
    for (const hour of hours) out.push(candidate(`${new Date(day).toISOString().slice(0, 10)}T${hour}Z`));
  }
  return out;
}

describe('selectRetention (pure)', () => {
  it('keeps exactly 7 daily, 4 weekly and 6 monthly generations over a calendar of more than 7 months', () => {
    // 2026-10-06 is a Tuesday. Two backups a day from March to 2026-10-05, and one at 03:00 on the 6th.
    const all = [...calendar('2026-03-01', '2026-10-05', ['03:00:00', '21:00:00']), candidate('2026-10-06T03:00:00Z')];
    expect(keptInstants(all, '2026-10-06T12:00:00Z')).toEqual(
      [
        // 7 UTC days: the newest of each of 09-30 .. 10-06 (spans a month boundary)
        '2026-09-30T21:00:00Z',
        '2026-10-01T21:00:00Z',
        '2026-10-02T21:00:00Z',
        '2026-10-03T21:00:00Z',
        '2026-10-04T21:00:00Z',
        '2026-10-05T21:00:00Z',
        '2026-10-06T03:00:00Z',
        // 4 ISO weeks (Mon-Sun): 10-05.. (kept above), 09-28..10-04 (kept above), 09-21..09-27, 09-14..09-20
        '2026-09-20T21:00:00Z',
        '2026-09-27T21:00:00Z',
        // 6 months: Oct and Sep (kept above), Aug, Jul, Jun, May
        '2026-05-31T21:00:00Z',
        '2026-06-30T21:00:00Z',
        '2026-07-31T21:00:00Z',
        '2026-08-31T21:00:00Z',
      ].sort(),
    );
  });

  it('crosses an ISO week-year boundary (2026-W53 to 2027-W01) and a year change', () => {
    // 2027-01-05 is a Tuesday; 2026-12-28 .. 2027-01-03 is ISO week 2026-W53.
    const all = [...calendar('2026-06-01', '2027-01-04', ['21:00:00']), candidate('2027-01-05T03:00:00Z')];
    expect(keptInstants(all, '2027-01-05T10:00:00Z')).toEqual(
      [
        // 7 days
        '2026-12-30T21:00:00Z',
        '2026-12-31T21:00:00Z',
        '2027-01-01T21:00:00Z',
        '2027-01-02T21:00:00Z',
        '2027-01-03T21:00:00Z',
        '2027-01-04T21:00:00Z',
        '2027-01-05T03:00:00Z',
        // weeks: 2027-W01 and 2026-W53 are kept above; 2026-W52 and W51 add
        '2026-12-20T21:00:00Z',
        '2026-12-27T21:00:00Z',
        // months: Jan 2027 and Dec 2026 kept above; Nov, Oct, Sep, Aug add
        '2026-08-31T21:00:00Z',
        '2026-09-30T21:00:00Z',
        '2026-10-31T21:00:00Z',
        '2026-11-30T21:00:00Z',
      ].sort(),
    );
  });

  it('groups by the UTC day of the instant: 23:59:59Z and 00:00:00Z of the next day are different days', () => {
    const all = [candidate('2026-10-05T23:59:59Z'), candidate('2026-10-05T00:00:00Z'), candidate('2026-10-06T00:00:00Z')];
    expect(keptInstants(all, '2026-10-06T00:00:01Z')).toEqual(['2026-10-05T23:59:59Z', '2026-10-06T00:00:00Z']);
  });

  it('always keeps the newest backup overall, even when every backup is outside every window', () => {
    const all = [candidate('2025-01-10T00:00:00Z'), candidate('2025-01-11T00:00:00Z'), candidate('2025-01-12T00:00:00Z')];
    expect(keptInstants(all, '2026-10-06T00:00:00Z')).toEqual(['2025-01-12T00:00:00Z']);
    expect(selectRetention([], iso('2026-10-06T00:00:00Z'))).toEqual({ keep: [], remove: [] });
  });

  it('is deterministic for equal instants and does not depend on the input order', () => {
    const a = { name: nameOf('2026-10-06T03:00:00Z', '00000001'), instant: iso('2026-10-06T03:00:00Z') };
    const b = { name: nameOf('2026-10-06T03:00:00Z', '00000002'), instant: iso('2026-10-06T03:00:00Z') };
    expect(selectRetention([a, b], iso('2026-10-06T12:00:00Z'))).toEqual(selectRetention([b, a], iso('2026-10-06T12:00:00Z')));
    expect(selectRetention([a, b], iso('2026-10-06T12:00:00Z')).keep).toHaveLength(1);
  });
});

/* ------------------------------------------------------------ folders on disk ---- */

const SHA = '0'.repeat(64);

function writeBackup(target: string, instant: string, options: { manifestInstant?: string; hex?: string; importSource?: boolean } = {}): string {
  const name = nameOf(instant, options.hex);
  const dir = join(target, name);
  mkdirSync(join(dir, 'files'), { recursive: true });
  writeFileSync(join(dir, 'timesheet.db'), 'synthetic database copy');
  writeFileSync(join(dir, 'files', 'abc'), 'synthetic file');
  if (options.importSource === true) writeFileSync(join(dir, 'files', 'import-source-0001'), 'synthetic workbook source');
  const manifest = buildManifest({
    appVersion: '0.0.0',
    schemaVersion: 9,
    createdAt: options.manifestInstant ?? instant,
    database: { sha256: SHA, sizeBytes: 23 },
    files: [
      { storageKey: 'abc', kind: 'pdf', sha256: SHA, sizeBytes: 14 },
      ...(options.importSource === true ? [{ storageKey: 'import-source-0001', kind: 'import' as const, sha256: SHA, sizeBytes: 25 }] : []),
    ],
  });
  writeFileSync(join(dir, MANIFEST_FILE_NAME), serializeManifest(manifest));
  return name;
}

const NOW = '2026-10-06T12:00:00Z';
const clockAt = (instant: string) => new MutableClock(instant);

describe('pruneBackups on disk', () => {
  let root: string;
  let counter = 0;

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'timesheet-prune-'));
  });

  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  function freshTarget(): string {
    counter += 1;
    const dir = join(root, `target-${counter}`);
    mkdirSync(dir);
    return dir;
  }

  it('removes only expired folders the tool created and leaves everything else alone', () => {
    const target = freshTarget();
    const outside = join(root, `outside-${counter}`);
    mkdirSync(outside);
    const outsideBackup = writeBackup(outside, '2024-01-01T00:00:00Z', { hex: 'cafef00d' });

    // Expired, genuine backups (before every window): all but the newest of them must go.
    const expired = ['2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z', '2024-01-03T00:00:00Z'].map((instant) => writeBackup(target, instant));
    // The newest backup, inside every window.
    const newest = writeBackup(target, '2026-10-06T03:00:00Z');

    // Never touched: foreign names, staging folders, bad or missing manifests, a link, a plain file.
    const foreign = ['photos', 'timesheet-backup-latest', 'timesheet-backup-20240101T000000Z-short', 'Timesheet-Backup-20240201T000000Z-a1b2c3d4'];
    for (const name of foreign) mkdirSync(join(target, name));
    mkdirSync(join(target, `.partial-${nameOf('2024-01-01T00:00:00Z', 'deadbeef')}`));
    const staging = `.partial-${nameOf('2024-01-01T00:00:00Z', 'deadbeef')}`;
    const mismatched = writeBackup(target, '2024-01-04T00:00:00Z', { manifestInstant: '2024-01-05T00:00:00Z', hex: '11111111' });
    const unparsable = writeBackup(target, '2024-01-06T00:00:00Z', { hex: '22222222' });
    writeFileSync(join(target, unparsable, MANIFEST_FILE_NAME), '{ not json');
    const wrongFormat = writeBackup(target, '2024-01-07T00:00:00Z', { hex: '33333333' });
    writeFileSync(join(target, wrongFormat, MANIFEST_FILE_NAME), `${JSON.stringify({ format: 'something-else', created_at: '2024-01-07T00:00:00Z' })}\n`);
    const extraKey = writeBackup(target, '2024-01-08T00:00:00Z', { hex: '44444444' });
    const parsed = JSON.parse(readFileSync(join(target, extraKey, MANIFEST_FILE_NAME), 'utf8')) as Record<string, unknown>;
    writeFileSync(join(target, extraKey, MANIFEST_FILE_NAME), JSON.stringify({ ...parsed, owner: 'someone' }));
    const noManifest = writeBackup(target, '2024-01-09T00:00:00Z', { hex: '55555555' });
    rmSync(join(target, noManifest, MANIFEST_FILE_NAME));
    const plainFile = nameOf('2024-01-10T00:00:00Z', '66666666');
    writeFileSync(join(target, plainFile), 'not a folder');
    const link = nameOf('2024-01-01T00:00:00Z', '77777777');
    symlinkSync(join(outside, outsideBackup), join(target, link), 'junction');

    const before = readdirSync(target).sort();
    const dry = pruneBackups({ targetDir: target, clock: clockAt(NOW), dryRun: true });
    expect(readdirSync(target).sort()).toEqual(before);
    expect(dry).toEqual({ candidates: 4, kept: 1, removed: 3, ignored: foreign.length + 8, dryRun: true });

    const done = pruneBackups({ targetDir: target, clock: clockAt(NOW), dryRun: false });
    expect(done).toEqual({ candidates: 4, kept: 1, removed: 3, ignored: foreign.length + 8, dryRun: false });

    const left = readdirSync(target).sort();
    for (const name of expired) expect(left.includes(name), name).toBe(false);
    for (const name of [newest, ...foreign, staging, mismatched, unparsable, wrongFormat, extraKey, noManifest, plainFile, link]) {
      expect(left.includes(name), name).toBe(true);
    }
    expect(existsSync(join(outside, outsideBackup, MANIFEST_FILE_NAME))).toBe(true);
    expect(existsSync(join(target, newest, MANIFEST_FILE_NAME))).toBe(true);
    expect(existsSync(join(target, noManifest, 'files', 'abc'))).toBe(true);
  });

  it('keeps treating a backup folder that holds import sources (kind import) as a folder the backup tool created (WP4-T09B)', () => {
    const target = freshTarget();
    const expired = ['2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z'].map((instant) => writeBackup(target, instant, { importSource: true }));
    const newest = writeBackup(target, '2026-10-06T03:00:00Z', { importSource: true });
    const dry = pruneBackups({ targetDir: target, clock: clockAt(NOW), dryRun: true });
    expect(dry).toEqual({ candidates: 3, kept: 1, removed: 2, ignored: 0, dryRun: true });
    expect(pruneBackups({ targetDir: target, clock: clockAt(NOW), dryRun: false, requiredName: newest })).toEqual({ candidates: 3, kept: 1, removed: 2, ignored: 0, dryRun: false });
    for (const name of expired) expect(existsSync(join(target, name)), name).toBe(false);
    expect(readdirSync(target)).toEqual([newest]);
    expect(readFileSync(join(target, newest, 'files', 'import-source-0001'), 'utf8')).toBe('synthetic workbook source');
  });

  it('refuses a candidate that resolves outside the target and removes nothing', () => {
    const target = freshTarget();
    const old = writeBackup(target, '2024-01-01T00:00:00Z');
    const alsoOld = writeBackup(target, '2024-01-02T00:00:00Z');
    writeBackup(target, '2026-10-06T03:00:00Z');
    const elsewhere = join(root, 'elsewhere');
    mkdirSync(elsewhere, { recursive: true });
    const resolver = (path: string): string => (path.endsWith(old) ? join(elsewhere, old) : path);
    let error: unknown;
    try {
      pruneBackups({ targetDir: target, clock: clockAt(NOW), dryRun: false, realpath: resolver });
    } catch (caught) {
      error = caught;
    }
    expect(error).toBeInstanceOf(PruneError);
    expect(error).toMatchObject({ code: 'candidate_outside_target', refusal: true });
    expect(existsSync(join(target, old))).toBe(true);
    expect(existsSync(join(target, alsoOld))).toBe(true);
  });

  it('refuses when the backup that was just taken is not among the candidates, and removes nothing', () => {
    const target = freshTarget();
    const old = writeBackup(target, '2024-01-01T00:00:00Z');
    writeBackup(target, '2026-10-06T03:00:00Z');
    expect(() => pruneBackups({ targetDir: target, clock: clockAt(NOW), dryRun: false, requiredName: nameOf('2026-10-06T09:00:00Z') })).toThrow(PruneError);
    expect(existsSync(join(target, old))).toBe(true);
  });

  it('refuses a target that is missing or not a folder, without creating it', () => {
    const missing = join(root, 'does-not-exist');
    expect(() => pruneBackups({ targetDir: missing, clock: clockAt(NOW), dryRun: true })).toThrow(PruneError);
    expect(existsSync(missing)).toBe(false);
    const file = join(root, 'a-file');
    writeFileSync(file, 'x');
    expect(() => pruneBackups({ targetDir: file, clock: clockAt(NOW), dryRun: true })).toThrow(PruneError);
  });
});

/* ------------------------------------------------------------------ the CLI ---- */

describe('cli.js backup --prune and backup prune --dry-run', () => {
  const repo = fileURLToPath(new URL('../..', import.meta.url));
  let t: TestContext;
  let root: string;

  beforeAll(async () => {
    t = await createTestContext('2026-09-29T20:00:00Z');
    root = mkdtempSync(join(tmpdir(), 'timesheet-prune-cli-'));
  });

  afterAll(() => {
    t.close();
    rmSync(root, { recursive: true, force: true });
  });

  const dataDirOf = (context: TestContext): string => join(dirname(context.config.databasePath), 'private-data');

  function cli(args: string[], databasePath = t.config.databasePath) {
    const result = spawnSync(process.execPath, ['src/server/cli.ts', 'backup', ...args], {
      cwd: repo,
      encoding: 'utf8',
      env: {
        ...process.env,
        NODE_ENV: 'production',
        APP_ORIGINS: 'https://timesheet.example.invalid',
        PUBLIC_BASE_URL: 'https://timesheet.example.invalid',
        DATABASE_PATH: databasePath,
        DATA_DIR: dataDirOf(t),
      },
    });
    return { status: result.status, stdout: result.stdout, stderr: result.stderr };
  }

  function seededTarget(name: string): { target: string; old: string[] } {
    const target = join(root, name);
    mkdirSync(target);
    // Far in the past, so the result does not depend on the wall clock: none of them is in any window.
    const old = ['2024-01-01T00:00:00Z', '2024-01-02T00:00:00Z', '2024-01-03T00:00:00Z'].map((instant) => writeBackup(target, instant));
    return { target, old };
  }

  it('prunes after a successful backup and prints counts only', () => {
    const { target, old } = seededTarget('ok');
    const result = cli(['--to', target, '--prune']);
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
    const lines = result.stdout.trim().split('\n');
    expect(lines).toHaveLength(2);
    const backup = JSON.parse(lines[0] ?? '') as { backup: string };
    expect(JSON.parse(lines[1] ?? '')).toEqual({ outcome: 'pruned', candidates: 4, kept: 1, removed: 3, ignored: 0 });
    expect(readdirSync(target)).toEqual([backup.backup]);
    for (const name of old) expect(existsSync(join(target, name))).toBe(false);
    for (const value of [target, ...old]) expect(result.stdout.includes(value)).toBe(false);
  });

  it('prunes nothing when the new backup fails', () => {
    const { target, old } = seededTarget('failed');
    const before = readdirSync(target).sort();
    const result = cli(['--to', target, '--prune'], join(root, 'no-such-database.db'));
    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(readdirSync(target).sort()).toEqual(before);
    for (const name of old) expect(existsSync(join(target, name, MANIFEST_FILE_NAME))).toBe(true);
  });

  it('dry run prints the counts and removes nothing; it is the only way to run backup prune', () => {
    const { target } = seededTarget('dry');
    const before = readdirSync(target).sort();
    const dry = cli(['prune', '--in', target, '--dry-run']);
    expect(dry.stderr).toBe('');
    expect(dry.status).toBe(0);
    expect(JSON.parse(dry.stdout)).toEqual({ outcome: 'dry_run', candidates: 3, keep: 1, remove: 2, ignored: 0 });
    expect(dry.stdout.includes(target)).toBe(false);
    expect(readdirSync(target).sort()).toEqual(before);

    for (const args of [
      ['prune', '--in', target],
      ['prune', '--dry-run'],
      ['prune', '--in', '--dry-run'],
      ['prune', '--in', target, '--dry-run', '--dry-run'],
      ['--to', target, '--prune', '--dry-run'],
      ['--prune'],
      ['--to', target, '--keep'],
    ]) {
      expect(cli(args).status, args.join(' ')).toBe(2);
    }
    expect(readdirSync(target).sort()).toEqual(before);
    expect(cli(['prune', '--in', join(root, 'missing'), '--dry-run']).status).toBe(2);
  });
});
