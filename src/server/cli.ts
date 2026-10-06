import { readFileSync, statSync } from 'node:fs';
import { parseUtcInstant } from '../domain/instants.ts';
import { systemClock } from './clock.ts';
import { loadConfig, loadDeliveryConfig } from './config.ts';
import { openDatabase } from './db/database.ts';
import { migrate } from './db/migrations.ts';
import { FileStore } from './files/fileStore.ts';
import { createJobHandlers, runJobsOnce } from './jobs/runner.ts';
import { BackupError, createBackup } from './ops/backup.ts';
import { manifestSummary } from './ops/manifest.ts';
import { PruneError, type PruneResult, pruneBackups } from './ops/prune.ts';
import {
  dropHeldReminder,
  heldJobsJson,
  listHeldJobs,
  releaseAllHeldJobs,
  releaseHeldJob,
  RestoreError,
  restoreBackup,
  restoreSummaryJson,
  resumeJson,
  resumeOutbound,
} from './ops/restore.ts';
import { seedSynthetic } from './seed.ts';
import { applyBootstrapConfig, BootstrapError, type IssuedSetupToken, issueSetupToken, parseBootstrapConfig } from './services/bootstrap.ts';
import { getOutboundStatus } from './services/operationsStatus.ts';

/*
 * Maintenance commands:
 *   migrate  apply pending versioned migrations to DATABASE_PATH
 *   seed     migrate, then create synthetic example.invalid data (never in production)
 *   run-jobs --once --now <UTC instant>
 *            migrate, then run every due job once at the given instant (deterministic
 *            end-to-end tests; never in production, where the server's runner runs jobs)
 *   bootstrap --config <file>
 *            production bootstrap (WP4-T03): validate the owner's calendar/policy/payroll file, create the
 *            company calendar once, then print a single-use setup token (60 minutes) to this terminal
 *   bootstrap --new-token
 *            print a fresh setup token for an instance that is configured but has no administrator yet
 *   backup --to <dir> [--prune]
 *            consistent backup (WP4-T05) of the live database and its referenced private files into a new folder
 *            under <dir>, which must be outside DATA_DIR; allowed in production while the server runs. --prune (WP4-T05B,
 *            owner decision F-5) then removes expired backup folders the tool created in <dir>, keeping 7 daily, 4
 *            weekly and 6 monthly backups (UTC) and the newest, only after the new backup succeeded and was verified
 *   backup prune --in <dir> --dry-run
 *            print the counts a prune of <dir> would keep and remove; removes nothing
 *   restore --from <backup folder> --to <empty directory>
 *            isolated restore (WP4-T06): verify the manifest hashes, integrity and schema, copy the database and files
 *            into the new directory (<dir>/timesheet.db and <dir>/private-data), pause outbound delivery there and mark
 *            interrupted sends for explicit reconciliation; never writes the live DATABASE_PATH or DATA_DIR
 *   restore --from <backup folder> --to <empty directory> --keep-schema [--confirm]
 *            rollback restore (WP4-T12A): the same, but the schema is kept as the backup has it (no migration), so the
 *            previous build can run on it. A schema older than the outbound pause cannot hold a pause: it is refused
 *            (exit 2) without --confirm, and with it the backed-up send jobs are held and a warning is printed
 *   outbound resume [--confirm]
 *            without --confirm: print what a resume would release and exit 2; with --confirm: clear the outbound pause
 *            of DATABASE_PATH when no delivery attempt awaits its decision (audited system event), otherwise exit 1
 *   outbound release [--all | --job <id>] [--confirm]   /   outbound drop --job <id> [--confirm]
 *            the send jobs a restore holds: without --confirm list them with counts (exit 2); with --confirm release
 *            one or every releasable job back to the queue, or drop one held reminder (audited; refused: exit 1)
 */

const RUN_JOBS_USAGE = 'Usage: cli.js run-jobs --once --now <YYYY-MM-DDTHH:MM:SSZ>';

/** The fixed instant of `run-jobs --once --now <instant>`, or null for any other argument list. */
function parseRunJobsArgs(args: readonly string[]): Date | null {
  let once = false;
  let now: string | undefined;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--once' && !once) once = true;
    else if (arg === '--now' && now === undefined && index + 1 < args.length) now = args[++index];
    else return null;
  }
  if (!once || now === undefined) return null;
  try {
    return new Date(parseUtcInstant(now, '--now') * 1000);
  } catch {
    return null;
  }
}

async function runJobs(args: readonly string[]): Promise<number> {
  // Checked before any configuration is read or any file is opened.
  if (process.env.NODE_ENV === 'production') {
    console.error('Refusing to run jobs from the CLI when NODE_ENV=production; the server runs them');
    return 1;
  }
  const instant = parseRunJobsArgs(args);
  if (instant === null) {
    console.error(RUN_JOBS_USAGE);
    return 2;
  }
  const config = loadConfig();
  const delivery = loadDeliveryConfig(process.env, config);
  const db = openDatabase(config.databasePath);
  try {
    migrate(db);
    const clock = { now: () => new Date(instant.getTime()) };
    const handlers = createJobHandlers({ db, clock, files: new FileStore(delivery.dataDir), delivery });
    const summary = await runJobsOnce({ db, clock, handlers });
    // Counts only: no identifiers, names, recipients or paths.
    console.log(JSON.stringify(summary));
    return 0;
  } finally {
    db.close();
  }
}

const BOOTSTRAP_USAGE = 'Usage: cli.js bootstrap --config <file> | cli.js bootstrap --new-token';
const MAX_CONFIG_BYTES = 256 * 1024;

/** `--config <file>` or `--new-token`, nothing else; null for any other argument list. */
function parseBootstrapArgs(args: readonly string[]): { config: string } | { newToken: true } | null {
  if (args.length === 2 && args[0] === '--config' && args[1] !== undefined && args[1] !== '') return { config: args[1] };
  if (args.length === 1 && args[0] === '--new-token') return { newToken: true };
  return null;
}

/** The one place the setup token is shown: this terminal (stdout), once. It is not stored, logged or audited. */
function printSetupToken(issued: IssuedSetupToken): void {
  console.log(`Setup token (shown once, valid until ${issued.expiresAt}; only its hash is stored):`);
  console.log('');
  console.log(`  ${issued.token}`);
  console.log('');
  console.log('Open the application and enter it on the Setup screen to create the first administrator.');
  console.log('Do not paste it into a chat, ticket or log. If it expires unused: cli.js bootstrap --new-token');
}

/**
 * Production bootstrap. Runs in production (unlike `seed`). The file is read and validated before any database
 * file is opened, so a bad argument or file writes nothing; a refusal prints a reason that quotes no file value.
 */
async function bootstrap(args: readonly string[]): Promise<number> {
  const parsed = parseBootstrapArgs(args);
  if (parsed === null) {
    console.error(BOOTSTRAP_USAGE);
    return 2;
  }
  try {
    const config = 'config' in parsed ? parseBootstrapConfig(readConfigFile(parsed.config)) : null;
    const appConfig = loadConfig();
    const db = openDatabase(appConfig.databasePath);
    try {
      migrate(db);
      if (config !== null) {
        const result = applyBootstrapConfig(db, systemClock, config);
        // Counts only: no names, no dates from the file.
        console.log(`Company calendar and default policy created (${result.holidays} holiday dates).`);
      }
      printSetupToken(issueSetupToken(db, systemClock));
      return 0;
    } finally {
      db.close();
    }
  } catch (error) {
    if (error instanceof BootstrapError) {
      console.error(error.message);
      return 1;
    }
    throw error;
  }
}

function readConfigFile(path: string): unknown {
  let text: string;
  try {
    if (statSync(path).size > MAX_CONFIG_BYTES) throw new BootstrapError('The configuration file is larger than 256 KiB');
    text = readFileSync(path, 'utf8');
  } catch (error) {
    if (error instanceof BootstrapError) throw error;
    throw new BootstrapError('The configuration file cannot be read');
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new BootstrapError('The configuration file is not valid JSON');
  }
}

const BACKUP_USAGE =
  'Usage: cli.js backup --to <directory outside DATA_DIR> [--prune] | cli.js backup prune --in <backup directory> --dry-run';

type BackupCommand = { action: 'backup'; to: string; prune: boolean } | { action: 'prune-dry-run'; dir: string };

const isValue = (arg: string | undefined): arg is string => arg !== undefined && arg !== '' && !arg.startsWith('--');

/**
 * `--to <dir>` with an optional `--prune`, or `prune --in <dir> --dry-run` (the dry run is the only standalone prune: a
 * real prune happens only right after a new backup succeeded); null for any other argument list.
 */
function parseBackupArgs(args: readonly string[]): BackupCommand | null {
  if ((args.length === 2 || (args.length === 3 && args[2] === '--prune')) && args[0] === '--to' && isValue(args[1])) {
    return { action: 'backup', to: args[1], prune: args.length === 3 };
  }
  if (args.length === 4 && args[0] === 'prune' && args[1] === '--in' && isValue(args[2]) && args[3] === '--dry-run') {
    return { action: 'prune-dry-run', dir: args[2] };
  }
  return null;
}

/** Counts only: no name, key or path. `pruned` is the real run after a backup; `dry_run` reports what a run would do. */
function pruneJson(result: PruneResult): Record<string, unknown> {
  return result.dryRun
    ? { outcome: 'dry_run', candidates: result.candidates, keep: result.kept, remove: result.removed, ignored: result.ignored }
    : { outcome: 'pruned', candidates: result.candidates, kept: result.kept, removed: result.removed, ignored: result.ignored };
}

function reportPruneError(error: PruneError): number {
  console.error(`Prune ${error.refusal ? 'refused' : 'failed'} (${error.code}): ${error.message}`);
  return error.refusal ? 2 : 1;
}

/**
 * A consistent backup of the live database and the private files it refers to (WP4-T05). Allowed in production: the
 * server keeps running and writing. Prints counts and the new folder's name only, never a path, key or person; a
 * refusal exits 2, a failed attempt exits 1 after recording its fault code in operations_state.
 * `--prune` (WP4-T05B, owner decision F-5) then removes expired backup folders of the same target, only after the new
 * backup succeeded and was verified, and only folders the tool created; `backup prune --in <dir> --dry-run` reports the
 * counts it would keep and remove without removing anything. The last prune result is not recorded in operations_state:
 * that needs new columns, which this task does not add.
 */
async function backup(args: readonly string[]): Promise<number> {
  const parsed = parseBackupArgs(args);
  if (parsed === null) {
    console.error(BACKUP_USAGE);
    return 2;
  }
  if (parsed.action === 'prune-dry-run') {
    try {
      console.log(JSON.stringify(pruneJson(pruneBackups({ targetDir: parsed.dir, clock: systemClock, dryRun: true }))));
      return 0;
    } catch (error) {
      if (error instanceof PruneError) return reportPruneError(error);
      throw error;
    }
  }
  const config = loadConfig();
  const delivery = loadDeliveryConfig(process.env, config);
  let created: Awaited<ReturnType<typeof createBackup>>;
  try {
    created = await createBackup({ databasePath: config.databasePath, dataDir: delivery.dataDir, targetDir: parsed.to, clock: systemClock });
  } catch (error) {
    if (error instanceof BackupError) {
      console.error(`Backup ${error.refusal ? 'refused' : 'failed'} (${error.code}): ${error.message}`);
      return error.refusal ? 2 : 1;
    }
    throw error;
  }
  console.log(
    JSON.stringify({
      outcome: 'succeeded',
      backup: created.name,
      ...manifestSummary(created.manifest),
      duration_ms: created.durationMs,
      status_recorded: created.statusRecorded,
    }),
  );
  if (!parsed.prune) return 0;
  try {
    const pruned = pruneBackups({ targetDir: parsed.to, clock: systemClock, dryRun: false, requiredName: created.name });
    console.log(JSON.stringify(pruneJson(pruned)));
    return 0;
  } catch (error) {
    if (error instanceof PruneError) return reportPruneError(error);
    throw error;
  }
}

const RESTORE_USAGE =
  'Usage: cli.js restore --from <backup folder> --to <empty directory outside DATA_DIR> [--keep-schema [--confirm]]';

/**
 * `--from <backup> --to <dir>` in either order, then optionally `--keep-schema` and, only with it, `--confirm`; null for
 * any other argument list (`--confirm` alone is not a way to skip a check).
 */
function parseRestoreArgs(args: readonly string[]): { from: string; to: string; keepSchema: boolean; confirm: boolean } | null {
  const flags = args.filter((arg) => arg === '--keep-schema' || arg === '--confirm');
  const keepSchema = flags.includes('--keep-schema');
  const confirm = flags.includes('--confirm');
  if (flags.length !== new Set(flags).size || (confirm && !keepSchema)) return null;
  const pairs = args.filter((arg) => arg !== '--keep-schema' && arg !== '--confirm');
  if (pairs.length !== 4) return null;
  const values = new Map<string, string>();
  for (let index = 0; index < pairs.length; index += 2) {
    const flag = pairs[index];
    const value = pairs[index + 1];
    if ((flag !== '--from' && flag !== '--to') || values.has(flag) || value === undefined || value === '' || value.startsWith('--')) return null;
    values.set(flag, value);
  }
  const from = values.get('--from');
  const to = values.get('--to');
  return from === undefined || to === undefined ? null : { from, to, keepSchema, confirm };
}

/**
 * Isolated restore (WP4-T06). Allowed in production: it reads the live configuration only to refuse a target inside
 * the live DATA_DIR or holding the live database, and never opens either. Prints counts and the manifest check only; a
 * refused target exits 2, a backup that fails a check (or a failed copy) exits 1 and leaves nothing behind.
 * `--keep-schema` (WP4-T12A) restores for a rollback without migrating; see restore.ts.
 */
async function restore(args: readonly string[]): Promise<number> {
  const parsed = parseRestoreArgs(args);
  if (parsed === null) {
    console.error(RESTORE_USAGE);
    return 2;
  }
  const config = loadConfig();
  const delivery = loadDeliveryConfig(process.env, config);
  try {
    const result = await restoreBackup({
      fromDir: parsed.from,
      toDir: parsed.to,
      liveDataDir: delivery.dataDir,
      liveDatabasePath: config.databasePath,
      clock: systemClock,
      keepSchema: parsed.keepSchema,
      confirmUnpaused: parsed.confirm,
    });
    console.log(JSON.stringify(restoreSummaryJson(result)));
    if (result.pause === null) {
      // stderr, so the JSON on stdout stays machine-readable.
      console.error(
        'WARNING: this schema predates the outbound pause, so the restored copy is NOT paused. Its backed-up send jobs are held and its interrupted sends await a decision, ' +
          'but jobs created later are not held: start the previous build on it with JOB_RUNNER=off until the reconciliation is done.',
      );
    }
    return 0;
  } catch (error) {
    if (error instanceof RestoreError) {
      console.error(`Restore ${error.refusal ? 'refused' : 'failed'} (${error.code}): ${error.message}`);
      return error.refusal ? 2 : 1;
    }
    throw error;
  }
}

const OUTBOUND_USAGE =
  'Usage: cli.js outbound resume [--confirm] | outbound release [--all | --job <id>] [--confirm] | outbound drop --job <id> [--confirm]';

type OutboundCommand =
  | { action: 'resume'; confirm: boolean }
  | { action: 'release'; target: 'all' | { job: string } | null; confirm: boolean }
  | { action: 'drop'; job: string; confirm: boolean };

/** The `outbound` sub-commands; null for any other argument list. */
function parseOutboundArgs(args: readonly string[]): OutboundCommand | null {
  const [action, ...rest] = args;
  const confirm = rest.at(-1) === '--confirm';
  const options = confirm ? rest.slice(0, -1) : rest;
  const job = options.length === 2 && options[0] === '--job' && options[1] !== undefined && options[1] !== '' && !options[1].startsWith('--') ? options[1] : null;
  if (action === 'resume' && options.length === 0) return { action, confirm };
  if (action === 'release') {
    if (options.length === 0 && !confirm) return { action, target: null, confirm };
    if (options.length === 1 && options[0] === '--all') return { action, target: 'all', confirm };
    if (job !== null) return { action, target: { job }, confirm };
  }
  if (action === 'drop' && job !== null) return { action, job, confirm };
  return null;
}

/**
 * `outbound resume`: without `--confirm` prints the pause and the counts a resume would release (exit 2); with it,
 * clears the pause of DATABASE_PATH unless an attempt awaits its decision (exit 1). Counts only.
 * `outbound release` / `outbound drop` (WP4-T06 attempt 2): without `--confirm` print the jobs a restore holds (ids,
 * kinds, attempts and blockers; no person) and exit 2; with it, release one held job (`--job <id>`) or every releasable
 * one (`--all`) back to the queue, or drop one held reminder; a refused release or drop exits 1. Every step is audited.
 */
async function outbound(args: readonly string[]): Promise<number> {
  const command = parseOutboundArgs(args);
  if (command === null) {
    console.error(OUTBOUND_USAGE);
    return 2;
  }
  const config = loadConfig();
  const db = openDatabase(config.databasePath);
  try {
    migrate(db);
    if (!command.confirm) {
      if (command.action === 'resume') {
        const status = getOutboundStatus(db);
        console.log(
          JSON.stringify({
            outcome: 'confirmation_required',
            paused: status.paused,
            reason: status.reason,
            awaiting_decision: status.awaitingDecision,
            queued_send_jobs: status.queuedSendJobs,
            held_send_jobs: status.heldSendJobs,
          }),
        );
      } else {
        console.log(JSON.stringify({ outcome: 'confirmation_required', ...heldJobsJson(listHeldJobs(db)) }));
      }
      return 2;
    }
    if (command.action === 'resume') {
      const result = resumeOutbound(db, systemClock);
      console.log(JSON.stringify(resumeJson(result)));
      if (result.outcome === 'refused') {
        console.error('Outbound delivery stays paused: record a decision on every uncertain delivery attempt first');
        return 1;
      }
      return 0;
    }
    if (command.action === 'drop') {
      const dropped = dropHeldReminder(db, systemClock, command.job);
      console.log(JSON.stringify(dropped));
      return dropped.outcome === 'dropped' ? 0 : 1;
    }
    if (command.target === 'all') {
      console.log(JSON.stringify({ outcome: 'released', ...releaseAllHeldJobs(db, systemClock) }));
      return 0;
    }
    if (command.target === null) {
      console.error(OUTBOUND_USAGE);
      return 2;
    }
    const released = releaseHeldJob(db, systemClock, command.target.job);
    console.log(JSON.stringify(released));
    return released.outcome === 'released' ? 0 : 1;
  } finally {
    db.close();
  }
}

async function main(command: string | undefined, args: readonly string[]): Promise<number> {
  if (command === 'run-jobs') return runJobs(args);
  if (command === 'bootstrap') return bootstrap(args);
  if (command === 'backup') return backup(args);
  if (command === 'restore') return restore(args);
  if (command === 'outbound') return outbound(args);
  const config = loadConfig();
  const db = openDatabase(config.databasePath);
  try {
    switch (command) {
      case 'migrate': {
        const result = migrate(db);
        console.log(JSON.stringify({ database: config.databasePath, applied: result.applied, version: result.version }));
        return 0;
      }
      case 'seed': {
        if (config.production) throw new Error('Refusing to seed synthetic data when NODE_ENV=production');
        migrate(db);
        const delivery = loadDeliveryConfig(process.env, config);
        const result = await seedSynthetic(db, systemClock, {
          files: new FileStore(delivery.dataDir),
          passwords: {
            admin: process.env.SEED_ADMIN_PASSWORD,
            employee: process.env.SEED_EMPLOYEE_PASSWORD,
            employee2: process.env.SEED_EMPLOYEE2_PASSWORD,
          },
          sampleData: true,
        });
        console.log(result.created ? 'Created synthetic seed data:' : 'Synthetic seed data already present:');
        for (const user of result.users) {
          const secret = user.generatedPassword === null ? '' : `  generated dev password: ${user.generatedPassword}`;
          console.log(`  ${user.role.padEnd(8)} ${user.email}${secret}`);
        }
        if (result.sample !== undefined) {
          console.log(
            `  sample data for employee2@example.invalid: ${result.sample.sessions} sessions, ${result.sample.leaveRequests} leave request, setup credit ${result.sample.creditMinutes} minutes`,
          );
          if (result.sample.submissionSettings) {
            console.log(
              '  submission settings (recipients on example.invalid, automatic submission off) and a generated synthetic signature saved for employee2@example.invalid',
            );
            console.log('  capture sender: set MAIL_FROM to an example.invalid address (OUTBOUND_MODE stays capture) so first attempts are captured');
          }
        }
        return 0;
      }
      default:
        console.error('Usage: cli.js <migrate|seed|run-jobs|bootstrap|backup|restore|outbound>');
        return 2;
    }
  } finally {
    db.close();
  }
}

process.exitCode = await main(process.argv[2], process.argv.slice(3));
