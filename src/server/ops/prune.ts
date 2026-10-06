import { lstatSync, readdirSync, readFileSync, realpathSync, rmdirSync, rmSync, unlinkSync } from 'node:fs';
import { join, relative } from 'node:path';
import { type EpochSeconds, parseUtcInstant } from '../../domain/instants.ts';
import { type Clock, nowEpoch } from '../clock.ts';
import { MANIFEST_FILE_NAME, MANIFEST_FORMAT, MANIFEST_FORMAT_VERSION, MANIFEST_KEY_PATHS } from './manifest.ts';

/*
 * Pruning of old backups (WP4-T05B; owner decision F-5, docs/07 "Backup, restore and upgrades").
 *
 * Retention: keep the newest backup of each of the last 7 UTC days, the last 4 ISO weeks (Monday to Sunday) and the last
 * 6 UTC calendar months, counted back from the injected clock and including the current day, week and month, plus the
 * newest backup overall. The day, week and month of a backup are those of its manifest instant in UTC, never the device
 * zone; the selection is a pure function of instants (`selectRetention`).
 *
 * Which folders may be touched: only a direct child of the target that the backup tool created, that is a real folder
 * (not a link) whose name is exactly `timesheet-backup-<UTC instant>-<8 hex>` and which holds a `manifest.json` that
 * parses, carries the tool's format and only the tool's keys, and whose `created_at` is the instant in the name.
 * Everything else (other names, `.partial-*` staging folders, links, plain files, folders with a missing, unreadable or
 * altered manifest) is never read further, never counted as a generation and never removed; it is only counted.
 *
 * Safety: nothing is removed unless every folder selected resolves, by its real path, to a direct child of the target's
 * real path (otherwise the whole run is refused before the first removal); a folder is emptied with its manifest last,
 * so an interrupted removal leaves a folder that is still recognised and is retried. Prune after a backup is taken only
 * through `requiredName`: the caller names the backup that was just created and verified, and the run is refused when it
 * is not among the candidates. A backup dated after the clock means the clock is probably set back: it would push every
 * newer backup out of every window, so the whole run (a dry run too) is refused and nothing is removed (R-A1). Nothing here prints or stores a path or a name; the result carries counts only.
 */

export const RETAIN_DAYS = 7;
export const RETAIN_WEEKS = 4;
export const RETAIN_MONTHS = 6;

const SECONDS_PER_DAY = 86_400;
/** `timesheet-backup-` + compact UTC instant (`20260929T200000Z`) + `-` + 8 lowercase hex digits (see backup.ts). */
const BACKUP_NAME = /^timesheet-backup-(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z-[0-9a-f]{8}$/;
const MAX_MANIFEST_BYTES = 32 * 1024 * 1024;
const MANIFEST_TOP_LEVEL = ['app_version', 'created_at', 'database', 'files', 'format', 'format_version', 'integrity', 'schema_version'] as const;

export type PruneFaultCode = 'target_unusable' | 'candidate_outside_target' | 'new_backup_missing' | 'clock_behind_backups' | 'remove_failed';

const MESSAGES: Record<PruneFaultCode, string> = {
  target_unusable: 'The backup folder does not exist or is not a directory',
  candidate_outside_target: 'A backup folder selected for removal does not resolve to a direct child of the backup folder; nothing was removed',
  new_backup_missing: 'The backup that was just taken is not among the folders found; nothing was removed',
  clock_behind_backups: 'A backup is dated after the system clock, so the clock may be wrong; check the host time. Nothing was removed',
  remove_failed: 'A backup folder could not be removed',
};

export class PruneError extends Error {
  readonly code: PruneFaultCode;

  constructor(code: PruneFaultCode, options?: { cause?: unknown }) {
    super(MESSAGES[code], options);
    this.name = 'PruneError';
    this.code = code;
  }

  /** True for a refusal before anything was removed (exit 2), false for a failed removal (exit 1). */
  get refusal(): boolean {
    return this.code !== 'remove_failed';
  }
}

export interface RetentionCandidate {
  /** Folder name; the identity of the backup. */
  name: string;
  /** The manifest instant, UTC epoch seconds. */
  instant: EpochSeconds;
}

export interface RetentionSelection {
  keep: string[];
  remove: string[];
}

/** Newer first: later instant, then the greater name (a fixed tie-break, independent of the input order). */
function newerFirst(a: RetentionCandidate, b: RetentionCandidate): number {
  if (a.instant !== b.instant) return b.instant - a.instant;
  return a.name < b.name ? 1 : a.name > b.name ? -1 : 0;
}

/** Whole UTC days since 1970-01-01. */
function dayOf(instant: EpochSeconds): number {
  return Math.floor(instant / SECONDS_PER_DAY);
}

/** Consecutive index of the Monday-to-Sunday week of a UTC day (1970-01-01 was a Thursday), so weeks never skip at a year change. */
function weekOf(instant: EpochSeconds): number {
  return Math.floor((dayOf(instant) + 3) / 7);
}

/** Consecutive index of the UTC calendar month. */
function monthOf(instant: EpochSeconds): number {
  const date = new Date(instant * 1000);
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

/**
 * Pure retention selection (F-5): the newest of each of the last 7 UTC days, 4 ISO weeks and 6 UTC months at `now`, plus
 * the newest overall. A backup dated after `now` lies in no window and is kept only if it is the newest overall.
 */
export function selectRetention(candidates: readonly RetentionCandidate[], now: EpochSeconds): RetentionSelection {
  const ordered = [...candidates].sort(newerFirst);
  const keep = new Set<string>();
  const newest = ordered[0];
  if (newest !== undefined) keep.add(newest.name);
  const windows: ReadonlyArray<{ of: (instant: EpochSeconds) => number; span: number }> = [
    { of: dayOf, span: RETAIN_DAYS },
    { of: weekOf, span: RETAIN_WEEKS },
    { of: monthOf, span: RETAIN_MONTHS },
  ];
  for (const { of, span } of windows) {
    const current = of(now);
    const seen = new Set<number>();
    for (const candidate of ordered) {
      const bucket = of(candidate.instant);
      if (bucket > current || bucket <= current - span || seen.has(bucket)) continue;
      seen.add(bucket);
      keep.add(candidate.name);
    }
  }
  return {
    keep: ordered.filter((candidate) => keep.has(candidate.name)).map((candidate) => candidate.name),
    remove: ordered.filter((candidate) => !keep.has(candidate.name)).map((candidate) => candidate.name),
  };
}

/** The instant a backup folder name encodes, or null when the name is not exactly the tool's pattern or not a real instant. */
export function backupNameInstant(name: string): EpochSeconds | null {
  const match = BACKUP_NAME.exec(name);
  if (match === null) return null;
  const [, year, month, day, hour, minute, second] = match;
  try {
    return parseUtcInstant(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);
  } catch {
    return null;
  }
}

/** Every key path of a JSON value; array elements collapse into `name[]` (the form of MANIFEST_KEY_PATHS). */
function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) return value.flatMap((item) => keyPaths(item, `${prefix}[]`));
  if (value === null || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix === '' ? key : `${prefix}.${key}`;
    return [path, ...keyPaths(child, path)];
  });
}

/** The `created_at` of a manifest the backup tool wrote, or null when the file is missing, unreadable, altered or not the tool's. */
function readManifestInstant(folder: string): EpochSeconds | null {
  const path = join(folder, MANIFEST_FILE_NAME);
  try {
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.size > MAX_MANIFEST_BYTES) return null;
    const parsed: unknown = JSON.parse(readFileSync(path, 'utf8'));
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
    const manifest = parsed as Record<string, unknown>;
    if (manifest.format !== MANIFEST_FORMAT || manifest.format_version !== MANIFEST_FORMAT_VERSION) return null;
    if (!MANIFEST_TOP_LEVEL.every((key) => key in manifest) || !Array.isArray(manifest.files)) return null;
    const allowed = new Set(MANIFEST_KEY_PATHS);
    if (!keyPaths(manifest).every((keyPath) => allowed.has(keyPath))) return null;
    return parseUtcInstant(manifest.created_at, 'created_at');
  } catch {
    return null;
  }
}

export interface FoundBackups {
  candidates: RetentionCandidate[];
  /** Every other entry of the target: counted, never read further and never removed. */
  ignored: number;
}

/** Splits the direct children of `targetDir` into the tool's backup folders and everything else. */
export function findBackups(targetDir: string): FoundBackups {
  const candidates: RetentionCandidate[] = [];
  let ignored = 0;
  for (const entry of readdirSync(targetDir, { withFileTypes: true })) {
    const nameInstant = entry.isDirectory() && !entry.isSymbolicLink() ? backupNameInstant(entry.name) : null;
    const folder = join(targetDir, entry.name);
    const real = nameInstant === null ? false : lstatSync(folder).isDirectory();
    const manifestInstant = nameInstant !== null && real ? readManifestInstant(folder) : null;
    if (nameInstant !== null && manifestInstant === nameInstant) candidates.push({ name: entry.name, instant: nameInstant });
    else ignored += 1;
  }
  return { candidates, ignored };
}

export interface PruneRequest {
  /** The backup target (the folder that holds the backup folders); never created here. */
  targetDir: string;
  clock: Clock;
  /** Select and count only; remove nothing. */
  dryRun: boolean;
  /** The backup that was just created and verified; the run is refused when it is not among the candidates. */
  requiredName?: string;
  /** Test seam: the real-path resolver. Production passes none. */
  realpath?: (path: string) => string;
}

export interface PruneResult {
  /** Folders the tool created. */
  candidates: number;
  /** Candidates kept by the retention rule. */
  kept: number;
  /** Candidates selected for removal (dry run) or removed. */
  removed: number;
  /** Other entries of the target, left alone. */
  ignored: number;
  dryRun: boolean;
}

/** Empties a backup folder with its manifest last, then removes it: an interrupted run leaves a folder still recognised. */
function removeBackupFolder(folder: string): void {
  for (const entry of readdirSync(folder)) {
    if (entry !== MANIFEST_FILE_NAME) rmSync(join(folder, entry), { recursive: true });
  }
  unlinkSync(join(folder, MANIFEST_FILE_NAME));
  rmdirSync(folder);
}

/** Applies the retention rule to the backup folders of `targetDir`; see the module comment for the safety rules. */
export function pruneBackups(request: PruneRequest): PruneResult {
  const resolve = request.realpath ?? ((path: string): string => realpathSync.native(path));
  let targetReal: string;
  try {
    targetReal = resolve(request.targetDir);
    if (!lstatSync(targetReal).isDirectory()) throw new Error('not a directory');
  } catch (error) {
    throw new PruneError('target_unusable', { cause: error });
  }
  const { candidates, ignored } = findBackups(targetReal);
  if (request.requiredName !== undefined && !candidates.some((candidate) => candidate.name === request.requiredName)) {
    throw new PruneError('new_backup_missing');
  }
  const now = nowEpoch(request.clock);
  if (candidates.some((candidate) => candidate.instant > now)) throw new PruneError('clock_behind_backups');
  const selection = selectRetention(candidates, now);
  const result: PruneResult = { candidates: candidates.length, kept: selection.keep.length, removed: selection.remove.length, ignored, dryRun: request.dryRun };
  if (request.dryRun || selection.remove.length === 0) return result;

  // Resolve every folder first: one that does not resolve to a direct child of the target refuses the whole run.
  const folders = selection.remove.map((name) => {
    const folder = join(targetReal, name);
    let real: string;
    try {
      real = resolve(folder);
    } catch (error) {
      throw new PruneError('candidate_outside_target', { cause: error });
    }
    if (relative(targetReal, real) !== name) throw new PruneError('candidate_outside_target');
    return folder;
  });
  let removed = 0;
  for (const folder of folders) {
    try {
      if (!lstatSync(folder).isDirectory()) throw new Error('not a real directory any more');
      removeBackupFolder(folder);
      removed += 1;
    } catch (error) {
      throw new PruneError('remove_failed', { cause: error });
    }
  }
  return { ...result, removed };
}
