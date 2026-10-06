import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import { openDatabase } from '../../src/server/db/database.ts';
import { MIGRATIONS, migrate } from '../../src/server/db/migrations.ts';
import { FileStore } from '../../src/server/files/fileStore.ts';
import { enqueueJob } from '../../src/server/jobs/jobStore.ts';
import { JOB_SEND_REMINDER } from '../../src/server/jobs/reminderJob.ts';
import { seedSynthetic } from '../../src/server/seed.ts';
import { createSession } from '../../src/server/services/timesheetCommands.ts';
import { signOffTimesheet } from '../../src/server/services/finalization.ts';
import { buildReviewPayload } from '../../src/server/services/reviewPayload.ts';
import type { SessionUser } from '../../src/server/auth/sessions.ts';
import { LA, MutableClock } from './testApp.ts';

/*
 * A populated database at schema version 6, the schema of the accepted WP3 build (WP4-T12A). It is built with the
 * project's own migrations 1-6 (the list handed to `migrate()` is the target), the synthetic seed with sample data, and
 * the real finalization service, so the rows, foreign keys and triggers are the ones a WP3 installation has. Sessions
 * and sign-offs go through the services, which only touch columns that exist at version 6. Every send-related state a
 * restore must hold is present: a send job leased by a runner that died inside the network call (attempt `sending`), a
 * queued send job with its PDF job, and a queued reminder. Synthetic data only; nothing here reads the wall clock.
 */

/** The schema version of the WP3 build. */
export const WP3_SCHEMA_VERSION = 6;
export const WP3_MIGRATIONS = MIGRATIONS.filter((migration) => migration.version <= WP3_SCHEMA_VERSION);

export interface SchemaV6Fixture {
  databasePath: string;
  dataDir: string;
  employeeId: string;
  /** Revisions of the owner: `sending` has a leased send job and an attempt in `sending`; `queued` a queued send job. */
  revisions: { sending: string; queued: string };
  reminderBusinessKey: string;
}

export const FIXTURE_NOW = '2026-09-29T20:00:00Z';

/** Builds the fixture under `<dir>/live` and closes the database again, so its file is complete on its own. */
export async function buildSchemaV6(dir: string, nowIso: string = FIXTURE_NOW): Promise<SchemaV6Fixture> {
  const databasePath = join(dir, 'live', 'timesheet.db');
  const dataDir = join(dir, 'live', 'private-data');
  const db = openDatabase(databasePath);
  try {
    migrate(db, WP3_MIGRATIONS);
    const clock = new MutableClock(nowIso);
    await seedSynthetic(db, clock, {
      files: new FileStore(dataDir),
      passwords: { admin: randomBytes(12).toString('hex'), employee: randomBytes(12).toString('hex'), employee2: randomBytes(12).toString('hex') },
      sampleData: true,
    });
    const row = db
      .prepare<[string], { id: string; email: string; display_name: string; role: 'admin' | 'employee'; calendar_id: string }>(
        'SELECT id, email, display_name, role, calendar_id FROM users WHERE email = ?',
      )
      .get('employee2@example.invalid');
    if (row === undefined) throw new Error('Synthetic employee missing');
    const owner: SessionUser = { id: row.id, email: row.email, displayName: row.display_name, role: row.role, calendarId: row.calendar_id, sessionId: 'fixture' };

    const signOff = (sessionDate: string, from: string, to: string, payrollDate: string): string => {
      createSession({ db, clock, user: owner }, sessionDate, {
        start: { local: `${sessionDate}T${from}`, zone: LA },
        end: { local: `${sessionDate}T${to}`, zone: LA },
        input_zone: LA,
        breaks_confirmed: true,
        breaks: [],
        // An old period: an edit needs a reason.
        reason: 'Synthetic late entry for the schema 6 fixture',
      });
      const review = buildReviewPayload(db, clock, owner, payrollDate);
      const result = signOffTimesheet({ db, clock, user: owner }, payrollDate, {
        expectedVersion: review.expectedVersion,
        reviewedHash: review.payloadHash,
        signerName: 'Example Employee Two',
        deficitChoices: [],
        incompleteEvidenceAcknowledged: true,
      });
      return result.revision.id;
    };
    const sending = signOff('2026-09-02', '09:00', '19:00', '2026-09-18');
    const queued = signOff('2026-08-19', '08:30', '18:00', '2026-09-04');

    // A runner of the source died inside the network call of the first revision's send: the job is leased and its
    // attempt is `sending` (the state flow of version 6 only allows preparing -> sending).
    const sendJob = db.prepare<[string], { id: string }>("SELECT id FROM jobs WHERE kind = 'send_email' AND revision_id = ?").get(sending);
    if (sendJob === undefined) throw new Error('Send job of the signed-off revision missing');
    const at = nowIso;
    const lease = new Date(new Date(nowIso).getTime() + 600_000).toISOString().replace(/\.\d{3}Z$/, 'Z');
    db.prepare("UPDATE jobs SET state = 'leased', lease_owner = 'runner-fixture', lease_expires_at = ?, attempts = 1, updated_at = ? WHERE id = ?").run(lease, at, sendJob.id);
    db.prepare(
      `INSERT INTO delivery_attempts (id, job_id, user_id, revision_id, attempt_no, channel, envelope_json, message_id, state, started_at, updated_at)
       VALUES ('fixture-attempt-1', ?, ?, ?, 1, 'email', '{}', '<fixture-attempt-1@timesheet.invalid>', 'preparing', ?, ?)`,
    ).run(sendJob.id, owner.id, sending, at, at);
    db.prepare("UPDATE delivery_attempts SET state = 'sending' WHERE id = 'fixture-attempt-1'").run();

    const reminderBusinessKey = 'synthetic:reminder:queued';
    enqueueJob(db, clock, { kind: JOB_SEND_REMINDER, businessKey: reminderBusinessKey, userId: owner.id, runAt: '2026-09-29T20:03:30Z' });
    return { databasePath, dataDir, employeeId: owner.id, revisions: { sending, queued }, reminderBusinessKey };
  } finally {
    db.close();
  }
}
