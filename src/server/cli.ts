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
import { seedSynthetic } from './seed.ts';
import { applyBootstrapConfig, BootstrapError, type IssuedSetupToken, issueSetupToken, parseBootstrapConfig } from './services/bootstrap.ts';

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
 *   backup --to <dir>
 *            consistent backup (WP4-T05) of the live database and its referenced private files into a new folder
 *            under <dir>, which must be outside DATA_DIR; allowed in production while the server runs
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

const BACKUP_USAGE = 'Usage: cli.js backup --to <directory outside DATA_DIR>';

/** `--to <dir>`, nothing else (pruning waits for owner decision F-5); null for any other argument list. */
function parseBackupArgs(args: readonly string[]): string | null {
  if (args.length === 2 && args[0] === '--to' && args[1] !== undefined && args[1] !== '' && !args[1].startsWith('--')) return args[1];
  return null;
}

/**
 * A consistent backup of the live database and the private files it refers to (WP4-T05). Allowed in production: the
 * server keeps running and writing. Prints counts and the new folder's name only, never a path, key or person; a
 * refusal exits 2, a failed attempt exits 1 after recording its fault code in operations_state.
 */
async function backup(args: readonly string[]): Promise<number> {
  const to = parseBackupArgs(args);
  if (to === null) {
    console.error(BACKUP_USAGE);
    return 2;
  }
  const config = loadConfig();
  const delivery = loadDeliveryConfig(process.env, config);
  try {
    const result = await createBackup({ databasePath: config.databasePath, dataDir: delivery.dataDir, targetDir: to, clock: systemClock });
    console.log(
      JSON.stringify({
        outcome: 'succeeded',
        backup: result.name,
        ...manifestSummary(result.manifest),
        duration_ms: result.durationMs,
        status_recorded: result.statusRecorded,
      }),
    );
    return 0;
  } catch (error) {
    if (error instanceof BackupError) {
      console.error(`Backup ${error.refusal ? 'refused' : 'failed'} (${error.code}): ${error.message}`);
      return error.refusal ? 2 : 1;
    }
    throw error;
  }
}

async function main(command: string | undefined, args: readonly string[]): Promise<number> {
  if (command === 'run-jobs') return runJobs(args);
  if (command === 'bootstrap') return bootstrap(args);
  if (command === 'backup') return backup(args);
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
        console.error('Usage: cli.js <migrate|seed|run-jobs|bootstrap|backup>');
        return 2;
    }
  } finally {
    db.close();
  }
}

process.exitCode = await main(process.argv[2], process.argv.slice(3));
