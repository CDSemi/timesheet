import { systemClock } from './clock.ts';
import { loadConfig } from './config.ts';
import { openDatabase } from './db/database.ts';
import { migrate } from './db/migrations.ts';
import { seedSynthetic } from './seed.ts';

/*
 * Maintenance commands:
 *   migrate  apply pending versioned migrations to DATABASE_PATH
 *   seed     migrate, then create synthetic example.invalid data (never in production)
 */

async function main(command: string | undefined): Promise<number> {
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
        console.error('Usage: cli.js <migrate|seed>');
        return 2;
    }
  } finally {
    db.close();
  }
}

process.exitCode = await main(process.argv[2]);
