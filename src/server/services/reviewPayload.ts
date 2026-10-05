import { assertCivilDate } from '../../domain/dates.ts';
import { sha256Hex } from '../../domain/canonical.ts';
import { decideDeficit } from '../../domain/deficit.ts';
import {
  renderHtmlBody,
  renderSubject,
  renderTextBody,
  signOffStatusText,
  type SubmissionOrigin,
  type TemplateValues,
} from '../../domain/emailTemplate.ts';
import { isDomainError } from '../../domain/errors.ts';
import { formatUtcInstant } from '../../domain/instants.ts';
import { type PayPeriod, payPeriodForPayrollDate } from '../../domain/periods.ts';
import {
  type ReviewSnapshot,
  SNAPSHOT_SCHEMA,
  SNAPSHOT_VERSION,
  type SnapshotDay,
  type SnapshotDeficitProposal,
  type SnapshotOtProposal,
  type SnapshotReservation,
  type SnapshotUnresolved,
  sealReviewSnapshot,
} from '../../domain/snapshot.ts';
import { effectiveVersionOn } from '../../domain/versions.ts';
import { provisionalCredits } from '../../domain/workday.ts';
import type { SessionUser } from '../auth/sessions.ts';
import type { Clock } from '../clock.ts';
import type { Db } from '../db/database.ts';
import { notFound } from '../http/errors.ts';
import { getBalance } from './ledger.ts';
import { listOtLeaveRequests } from './otLeave.ts';
import { currentSignature } from './signatures.ts';
import { submissionSettingsOrDefault } from './submissionSettings.ts';
import { calculateDay, type DayView, findTimesheet, getTimesheetView, loadScope, loadSessions } from './timesheets.ts';

/*
 * The review payload (docs/05 "Manual path"): the exact content an employee reviews and,
 * in WP3-T05, signs. It is assembled only from the production engine's results (the
 * timesheet view, provisionalCredits and decideDeficit) and from the owner's own stored
 * settings; this module computes no business minutes of its own. The whole read runs in one
 * deferred transaction, so the payload and the timesheet `expected_version` come from one
 * consistent snapshot, and nothing here writes (no audit event, no row).
 *
 * The payload depends on content only: nothing in it varies with the current clock or with
 * the device zone, so a recomputation of unchanged content gives the identical hash.
 *
 * {SignOffStatus} comes from one domain function (signOffStatusText, owner decision G-Q2 (a)):
 * "Submitted" for a manual submission and for an automatic one with the note line off, the note
 * text for an automatic one with the note line on. The automatic deadline path builds its payload
 * with origin `automatic`; the frozen subject and bodies and `submission.sign_off_status` carry that
 * text, and nothing else in the payload records the origin (the revision row does).
 */

export interface ReviewPayloadResult {
  payload: ReviewSnapshot;
  /** SHA-256 (lowercase hex) of the canonical payload bytes: the "reviewed hash". */
  payloadHash: string;
  /** The timesheet version the payload was read at (0 when the timesheet row does not exist yet). */
  expectedVersion: number;
}

/**
 * A stable, human-readable submission identifier that does not depend on a timesheet row
 * (a period with no saved entries has none yet) or on the revision: the nominal payroll
 * date plus a short digest of the owner, calendar and period index. It carries no name or
 * address.
 */
export function submissionIdFor(userId: string, calendarId: string, period: Pick<PayPeriod, 'index' | 'nominalPayrollDate'>): string {
  const digest = sha256Hex(`${userId}|${calendarId}|${period.index}`).slice(0, 10);
  return `TS-${period.nominalPayrollDate.replaceAll('-', '')}-${digest}`;
}

function resolvePeriod(db: Db, user: SessionUser, payrollDateInput: string): PayPeriod {
  const scope = loadScope(db, user);
  try {
    return payPeriodForPayrollDate(scope.calendar.schedule, assertCivilDate(payrollDateInput, 'payroll_date'), scope.exceptions);
  } catch (error) {
    // A payroll date that is not one of this user's own is indistinguishable from a missing one.
    if (isDomainError(error) && error.code === 'unknown_payroll_date') throw notFound('Timesheet');
    throw error;
  }
}

function snapshotDay(day: DayView): SnapshotDay {
  return {
    work_date: day.work_date,
    day_class: day.classification?.day_class ?? null,
    day_class_reason: day.classification?.reason ?? null,
    holiday_name: day.classification?.name ?? null,
    calendar_version_id: day.classification?.calendar_version_id ?? null,
    category: day.category,
    category_source: day.category_source,
    attendance_expected: day.attendance_expected,
    wfh: day.wfh,
    notes: day.entry?.notes ?? '',
    leave_minutes: day.leave_minutes,
    leave_kind: day.leave_kind,
    ot_leave: {
      kind_minutes: day.ot_leave.kind_minutes,
      consumed_minutes: day.ot_leave.consumed_minutes,
      reversed_minutes: day.ot_leave.reversed_minutes,
      mismatch: day.ot_leave.mismatch,
    },
    sessions: day.sessions.map((session) => ({
      id: session.id,
      start_utc: session.start_utc,
      end_utc: session.end_utc,
      source: session.source,
      breaks_confirmed: session.breaks_confirmed,
      breaks: session.breaks.map((item) => ({
        start_utc: item.start_utc,
        end_utc: item.end_utc,
        counts_as_work: item.counts_as_work,
      })),
    })),
    completeness: day.calculation?.status ?? 'calculation_error',
    policy_version_id: day.calculation?.policy_version_id ?? null,
    calculation:
      day.calculation === null
        ? null
        : {
            regular_minutes: day.calculation.regular_minutes,
            nonworking_minutes: day.calculation.nonworking_minutes,
            normal_excess_minutes: day.calculation.normal_excess_minutes,
            eligible_minutes: day.calculation.eligible_minutes,
            credited_minutes: day.calculation.credited_minutes,
          },
    calculation_error: day.calculation_error,
  };
}

function compute(db: Db, clock: Clock, user: SessionUser, payrollDateInput: string, origin: SubmissionOrigin): ReviewPayloadResult {
  const period = resolvePeriod(db, user, payrollDateInput);
  const scope = loadScope(db, user);
  const view = getTimesheetView(db, clock, user, period.payrollDate);
  const timesheet = findTimesheet(db, scope, period);
  const sessions = loadSessions(db, user.id, period.periodStart, period.periodEnd);

  const days: SnapshotDay[] = view.days.map(snapshotDay);
  const otProposals: SnapshotOtProposal[] = [];
  const deficitProposals: SnapshotDeficitProposal[] = [];
  const unresolved: SnapshotUnresolved[] = [];
  const policyVersionIds = new Set<string>();
  const calendarVersionIds = new Set<string>();
  let available = getBalance(db, user.id).availableMinutes;

  for (const day of view.days) {
    if (day.classification !== null) calendarVersionIds.add(day.classification.calendar_version_id);
    const policy = effectiveVersionOn(scope.policies, day.work_date);
    if (policy !== undefined) policyVersionIds.add(policy.id);
    const { result } = calculateDay(
      scope,
      day.work_date,
      sessions.filter((session) => session.work_date === day.work_date),
    );
    for (const segment of result?.segments ?? []) calendarVersionIds.add(segment.calendarVersionId);
    if (result !== null) {
      for (const credit of provisionalCredits(result)) {
        otProposals.push({
          work_date: credit.workDate,
          credited_minutes: credit.minutes,
          eligible_minutes: result.eligibleMinutes ?? 0,
          policy_version_id: credit.policyVersionId,
        });
      }
    }
    if (day.calculation_error !== null) {
      unresolved.push({ work_date: day.work_date, reason: 'calculation_error', detail: day.calculation_error });
    } else if (day.calculation?.status === 'incomplete') {
      unresolved.push({ work_date: day.work_date, reason: 'open_session', detail: null });
    } else if (day.calculation?.status === 'incomplete_breaks') {
      unresolved.push({ work_date: day.work_date, reason: 'unconfirmed_breaks', detail: null });
    }
    if (policy === undefined || result === null || day.classification === null) continue;
    // The engine's own decision with no manual choice yet; the manual choices arrive at sign-off.
    const outcome = decideDeficit({
      requiredMinutes: policy.requiredMinutes,
      regularMinutes: result.regularMinutes,
      nonworkingMinutes: result.nonworkingMinutes,
      leaveMinutes: day.leave_minutes,
      normalWorkDate: day.classification.day_class === 'normal',
      attendanceExpected: day.attendance_expected,
      recordsComplete: result.status === 'complete',
      mode: policy.deficitMode,
      manualChoice: null,
      finalizationOrigin: 'manual',
      availableMinutes: available,
    });
    if (outcome.deficitMinutes !== day.deficit_minutes) {
      throw new Error('The review deficit differs from the timesheet view');
    }
    if (outcome.decision === 'incomplete' && result.status === 'no_records') {
      unresolved.push({ work_date: day.work_date, reason: 'no_records', detail: null });
    }
    if (outcome.deficitMinutes !== null && outcome.deficitMinutes > 0) {
      deficitProposals.push({
        work_date: day.work_date,
        policy_version_id: policy.id,
        mode: policy.deficitMode,
        deficit_minutes: outcome.deficitMinutes,
        decision: outcome.decision,
        debit_minutes: outcome.debitMinutes,
        available_minutes_before: available,
      });
      // Debits post one after another (R-05): a later day sees the balance the earlier ones left.
      available -= outcome.debitMinutes;
    }
  }

  const reservations: SnapshotReservation[] = listOtLeaveRequests(db, user.id)
    .filter((request) => request.reservedMinutes > 0)
    .map((request) => ({
      request_id: request.id,
      leave_date: request.leaveDate,
      approved_minutes: request.approvedMinutes,
      reserved_minutes: request.reservedMinutes,
      consumed_minutes: request.consumedMinutes,
      use_due: request.leaveDate <= period.periodEnd,
    }));

  const settings = submissionSettingsOrDefault(db, user.id);
  const signature = currentSignature(db, user.id);
  const revisionNo =
    (timesheet === undefined
      ? 0
      : (db
          .prepare<[string, string], { latest: number | null }>(
            'SELECT max(revision_no) AS latest FROM timesheet_revisions WHERE user_id = ? AND timesheet_id = ?',
          )
          .get(user.id, timesheet.id)?.latest ?? 0)) + 1;
  const submissionId = submissionIdFor(user.id, scope.calendar.id, period);
  const autoNote = { enabled: settings.autoNoteEnabled, text: settings.autoNoteText };
  const signOffStatus = signOffStatusText(origin, autoNote);
  const values: TemplateValues = {
    EmployeeName: user.displayName,
    PeriodStart: period.periodStart,
    PeriodEnd: period.periodEnd,
    PayrollDate: period.payrollDate,
    SignOffStatus: signOffStatus,
    SubmissionId: submissionId,
    Revision: String(revisionNo),
  };

  const sealed = sealReviewSnapshot({
    schema: SNAPSHOT_SCHEMA,
    schema_version: SNAPSHOT_VERSION,
    employee: { name: user.displayName },
    period: {
      payroll_date: period.payrollDate,
      nominal_payroll_date: period.nominalPayrollDate,
      period_start: period.periodStart,
      period_end: period.periodEnd,
      due_local_date: period.dueLocalDate,
      due_local_time: period.dueLocalTime,
      due_at_utc: formatUtcInstant(period.dueAtUtc),
      is_exception: period.isException,
    },
    reporting_zone: scope.calendar.schedule.reportingZone,
    submission: { id: submissionId, revision_no: revisionNo, sign_off_status: signOffStatus },
    timesheet: { finalized_revision_no: timesheet?.finalized_revision_no ?? null },
    calendar: { id: scope.calendar.id, version_ids: [...calendarVersionIds] },
    policy: { version_ids: [...policyVersionIds] },
    days,
    totals: {
      credited_minutes: view.totals.provisional_credited_minutes,
      pending_days: view.totals.pending_days,
    },
    ot_proposals: otProposals,
    deficit_proposals: deficitProposals,
    unresolved_inputs: unresolved,
    ot_leave_reservations: reservations,
    recipients: {
      to: settings.recipientsTo,
      cc: settings.recipientsCc,
      subject: renderSubject(settings.subjectTemplate, values),
      body_text: renderTextBody(settings.bodyTemplate, values),
      body_html: renderHtmlBody(settings.bodyTemplate, values),
      template_version: settings.templateVersion,
    },
    signature: signature === null ? null : { attachment_id: signature.id, sha256: signature.sha256 },
    auto_image: { authorized: settings.autoImageAuthorized, attachment_id: settings.autoImageAttachmentId },
    auto_note: autoNote,
    show_ot_on_pdf: settings.showOtOnPdf,
  });
  return { payload: sealed.snapshot, payloadHash: sealed.sha256, expectedVersion: timesheet?.version ?? 0 };
}

/**
 * The owner's review payload for one payroll date. It reads only the caller's own data (a
 * payroll date that is not one of the caller's is "not found") and writes nothing. Inside
 * a caller's transaction (the sign-off) the same function runs as part of it. `origin` is
 * `manual` for every employee-driven payload and `automatic` only for the deadline path.
 */
export function buildReviewPayload(
  db: Db,
  clock: Clock,
  user: SessionUser,
  payrollDate: string,
  origin: SubmissionOrigin = 'manual',
): ReviewPayloadResult {
  return db.transaction(() => compute(db, clock, user, payrollDate, origin)).deferred();
}

export function reviewPayloadJson(result: ReviewPayloadResult) {
  return { payload: result.payload, payload_hash: result.payloadHash, expected_version: result.expectedVersion };
}
