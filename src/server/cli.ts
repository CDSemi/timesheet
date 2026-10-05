import { parseUtcInstant } from '../domain/instants.ts';
import { systemClock } from './clock.ts';
import { loadConfig, loadDeliveryConfig } from './config.ts';
import { openDatabase } from './db/database.ts';
import { migrate } from './db/migrations.ts';
import { FileStore } from './files/fileStore.ts';
import { createJobHandlers, runJobsOnce } from './jobs/runner.ts';
import { seedSynthetic } from './seed.ts';

/*
 * Maintenance commands:
 *   migrate  apply pending versioned migrations to DATABASE_PATH
 *   seed     migrate, then create synthetic example.invalid data (never in production)
 *   run-jobs --once --now <UTC instant>
 *            migrate, then run every due job once at the given instant (deterministic
 *            end-to-end tests; never in production, where the server's runner runs jobs)
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

async function main(command: string | undefined, args: readonly string[]): Promise<number> {
  if (command === 'run-jobs') return runJobs(args);
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
        const result = await seedSynthetic(db, systemClock, {
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
        }
        return 0;
      }
      default:
        console.error('Usage: cli.js <migrate|seed|run-jobs>');
        return 2;
    }
  } finally {
    db.close();
  }
}

process.exitCode = await main(process.argv[2], process.argv.slice(3));
