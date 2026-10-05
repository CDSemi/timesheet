import { assertCivilDate } from '../../domain/dates.ts';
import { isDomainError } from '../../domain/errors.ts';
import { payPeriodForPayrollDate } from '../../domain/periods.ts';
import type { SessionUser } from '../auth/sessions.ts';
import type { Db } from '../db/database.ts';
import { notFound } from '../http/errors.ts';
import { findTimesheet, loadScope } from './timesheets.ts';

/*
 * WP3-C-01/C-02 (FR-17, AC-16): which audit events were written through a grant.
 *
 * The audit row records the actor and the owner, not the request path. An actor other than the
 * owner exists on exactly two paths: /api/shared/:ownerId (the grantee acting for the owner, the
 * only place the access guard sets `actor` apart from `subject`) and the administrator and share
 * routes, which write their own operation codes with the owner of the affected account or share
 * (`user.*`, `share.revoke`, whose actor is the administrator or the leaving grantee). An event
 * therefore counts as performed through a grant when its actor is not the owner and its operation is
 * one of the operations a shared route writes. The time window in which a share existed is never
 * used: a share existing at that instant does not make an act a shared one (an administrator who
 * also holds a share, or an act in the same second as a later grant, stays what it was).
 *
 * SHARED_ACT_OPERATIONS must list every operation code the allowlisted /api/shared routes write
 * (SHARED_ROUTES in routes/shares.ts). A test performs every write route and checks each attribution.
 */

export const SHARED_ACT_OPERATIONS: readonly string[] = [
  'day_entry.create',
  'day_entry.update',
  'work_session.create',
  'work_session.update',
  'work_session.delete',
  'share.pdf_download',
];

const OPERATION_LIST = SHARED_ACT_OPERATIONS.map((operation) => `'${operation}'`).join(', ');

/** The SQL condition "this audit row (alias `row`) was written through a grant". The list is a code constant. */
export function sharedActCondition(row: string): string {
  return `(${row}.actor_user_id IS NOT NULL AND ${row}.actor_user_id <> ${row}.owner_user_id AND ${row}.operation IN (${OPERATION_LIST}))`;
}

/** One grantee's days of a period whose last change was made through a share. */
export interface GranteeChange {
  display_name: string;
  days: number;
  work_dates: string[];
}

const FINALIZATION_OPERATIONS = ['timesheet.signoff', 'timesheet.correction', 'timesheet.late_review'];

interface DayChangeRow {
  work_date: string | null;
  shared_actor_id: string | null;
  shared_actor_name: string | null;
}

/**
 * The days of the owner's period that were last changed through a grant, grouped by grantee name, for
 * the owner's Review (never part of the review payload, its hash or the PDF). The window starts
 * after the owner's latest own finalization of the period (sign-off, correction or late review; the
 * automatic submission is not the owner's) and, when there is none, has no time bound: every change to a
 * day of the period counts, including one made before the period started (WP3-RBC-02). A later change
 * by the owner or by another grantee takes the day over. Read-only.
 */
export function granteeChangesForReview(db: Db, owner: Pick<SessionUser, 'id' | 'calendarId'>, payrollDateInput: string): GranteeChange[] {
  return db
    .transaction(() => {
      const scope = loadScope(db, owner);
      let period;
      try {
        period = payPeriodForPayrollDate(scope.calendar.schedule, assertCivilDate(payrollDateInput, 'payroll_date'), scope.exceptions);
      } catch (error) {
        // A payroll date that is not one of this user's own is indistinguishable from a missing one.
        if (isDomainError(error) && error.code === 'unknown_payroll_date') throw notFound('Timesheet');
        throw error;
      }
      const timesheet = findTimesheet(db, scope, period);
      const finalization =
        timesheet === undefined
          ? null
          : (db
              .prepare<[string, string], { last: number | null }>(
                `SELECT max(a.rowid) AS last
                   FROM audit_events a
                   JOIN timesheet_revisions r ON r.id = a.entity_id AND r.user_id = a.owner_user_id
                  WHERE a.owner_user_id = ? AND r.timesheet_id = ? AND a.entity_type = 'timesheet_revision'
                    AND a.operation IN (${FINALIZATION_OPERATIONS.map((operation) => `'${operation}'`).join(', ')})`,
              )
              .get(owner.id, timesheet.id)?.last ?? null);
      // With no owner finalization there is no lower bound in time (WP3-RBC-02): the period's own work dates,
      // filtered below, already bound the days, and a grantee change made before the period started (planned leave)
      // is still a change the owner has not seen. After the owner's finalization only later events count.
      const sinceRowid = finalization ?? 0;
      const rows = db
        .prepare<[string, number], DayChangeRow>(
          `SELECT json_extract(COALESCE(a.after_json, a.before_json), '$.work_date') AS work_date,
                  CASE WHEN ${sharedActCondition('a')} THEN a.actor_user_id END AS shared_actor_id,
                  CASE WHEN ${sharedActCondition('a')} THEN (SELECT u.display_name FROM users u WHERE u.id = a.actor_user_id) END AS shared_actor_name
             FROM audit_events a
            WHERE a.owner_user_id = ? AND a.entity_type IN ('day_entry', 'work_session') AND a.rowid > ?
            ORDER BY a.rowid`,
        )
        .all(owner.id, sinceRowid);
      // The last event of a day decides who changed it last.
      const lastChange = new Map<string, { id: string; name: string } | null>();
      for (const row of rows) {
        if (row.work_date === null || row.work_date < period.periodStart || row.work_date > period.periodEnd) continue;
        lastChange.set(row.work_date, row.shared_actor_id === null || row.shared_actor_name === null ? null : { id: row.shared_actor_id, name: row.shared_actor_name });
      }
      const groups = new Map<string, GranteeChange>();
      for (const [workDate, who] of [...lastChange].sort(([a], [b]) => (a < b ? -1 : 1))) {
        if (who === null) continue;
        const group = groups.get(who.id) ?? { display_name: who.name, days: 0, work_dates: [] };
        group.days += 1;
        group.work_dates.push(workDate);
        groups.set(who.id, group);
      }
      return [...groups.values()].sort((a, b) => (a.display_name === b.display_name ? 0 : a.display_name < b.display_name ? -1 : 1));
    })
    .deferred();
}
