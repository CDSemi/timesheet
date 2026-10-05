import { randomUUID } from 'node:crypto';
import { canonicalize, sha256Hex } from '../../domain/canonical.ts';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import { decideDeficit } from '../../domain/deficit.ts';
import { isDomainError } from '../../domain/errors.ts';
import { type PayPeriod, payPeriodForPayrollDate } from '../../domain/periods.ts';
import type { ReviewSnapshot, SnapshotDeficitProposal } from '../../domain/snapshot.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { normalizeReason } from '../http/validation.ts';
import { recordAudit } from './audit.ts';
import {
  getBalance,
  type LedgerContext,
  type LedgerEntry,
  listLedgerEntries,
  postCorrection,
  postCredit,
  postDeficitDebit,
} from './ledger.ts';
import { ensurePayPeriodRow } from './periods.ts';
import { buildReviewPayload } from './reviewPayload.ts';
import {
  correctionLine,
  type CorrectionLine,
  creditOutcome,
  currentPendingLines,
  deficitDebitOutcome,
  listRevisionLines,
  outcomeCounts,
  pendingLineJson,
  recordRevisionLine,
  type RevisionLedgerLine,
  revisionLineJson,
  revisionOutcomeCounts,
} from './revisionLedger.ts';
import { currentSignature } from './signatures.ts';
import { findTimesheet, loadScope, type TimesheetRow, type UserScope } from './timesheets.ts';

/*
 * Manual sign-off finalization (docs/05 "Manual path", docs/03 "Atomicity and snapshots",
 * R-05, R-06, AC-03, AC-06, R4 and the owner's F-2 decision).
 *
 * One IMMEDIATE write transaction, in this order:
 * 1. recompute the review payload (the same engine-only builder the review GET uses) and
 *    compare the timesheet version and the payload hash with what the employee reviewed;
 *    a mismatch is 409 with a fresh-review hint and nothing is written;
 * 2. require the signer name and the owner's current signature image (422 otherwise), the
 *    explicit acknowledgement when evidence is incomplete, and a deduct/waive choice for
 *    every choose-mode deficit;
 * 3. create the immutable signed revision (origin employee) and the sign-off with the real
 *    `signed_at` from the injectable clock;
 * 4. post authorized debits, then computable credits, only through ledger.ts with
 *    revision-independent day keys, and record every proposal outcome (posted, pending for
 *    an insufficient balance, waived) in revision_ledger_lines;
 * 5. set timesheets.finalized_revision_no, which removes the period's provisional minutes;
 * 6. enqueue the PDF and send jobs (rows only; the runner is a later task);
 * 7. audit ids, hashes and counts, never the signer name, recipients or content.
 *
 * No network call or file write happens inside the transaction. An identical retry after
 * success returns the existing revision and writes nothing; any other sign-off of a
 * finalized period is 409 (corrections and late review are separate flows). Sign-off is
 * strictly owner-only: the owner always comes from the session, the signer is that owner
 * with their own signature, and no other user (an administrator included) can act on it.
 *
 * Debits post before credits so that each debit meets the balance the reviewed payload
 * showed (the review evaluates deficits against the balance before this period's credits).
 */

export interface FinalizationContext {
  db: Db;
  clock: Clock;
  user: SessionUser;
}

export type DeficitChoice = 'deduct' | 'waive';

export interface SignOffInput {
  /** The timesheet version the review was read at (0 when the period had no row yet). */
  expectedVersion: number;
  /** The payload hash the employee reviewed. */
  reviewedHash: string;
  signerName: string;
  /** One choice per choose-mode deficit day; none for other modes. */
  deficitChoices: ReadonlyArray<{ workDate: string; choice: DeficitChoice }>;
  /** Required when the payload lists unresolved inputs; incomplete days stay pending. */
  incompleteEvidenceAcknowledged: boolean;
}

export interface RevisionRecord {
  id: string;
  revisionNo: number;
  revisionKind: 'original' | 'correction' | 'late_review';
  origin: 'employee' | 'deadline';
  reviewState: 'pending' | 'signed';
  supersedesRevisionId: string | null;
  correctionReason: string | null;
  payloadSha256: string;
  reviewedSha256: string | null;
  timesheetVersion: number;
  sendRequested: boolean;
  createdAt: string;
}

export interface SignoffRecord {
  signerName: string;
  signedAt: string;
  reviewedSha256: string;
  signatureAttachmentId: string;
}

export interface JobRecord {
  id: string;
  kind: string;
  state: string;
}

export interface FinalizationView {
  revision: RevisionRecord;
  signoff: SignoffRecord | null;
  lines: RevisionLedgerLine[];
  jobs: JobRecord[];
}

export interface SignOffResult extends FinalizationView {
  status: 'created' | 'replayed';
  finalizedRevisionNo: number;
}

export const JOB_RENDER_PDF = 'render_pdf';
export const JOB_SEND_EMAIL = 'send_email';

/** Original postings are keyed by work date only, so no later revision can post a day's original twice. */
export const creditSourceKey = (workDate: CivilDate): string => `finalization:day:${workDate}:credit`;
export const deficitDebitSourceKey = (workDate: CivilDate): string => `finalization:day:${workDate}:deficit_debit`;

const MAX_SIGNER_NAME = 200;
const NAME_CONTROL = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u;

type SignerName = { ok: true; name: string } | { ok: false; error: ApiError };

function parseSignerName(raw: string): SignerName {
  const name = raw.normalize('NFC').trim();
  if (name === '') return { ok: false, error: new ApiError(422, 'signer_name_required', 'Sign-off requires the employee name') };
  if (name.length > MAX_SIGNER_NAME || NAME_CONTROL.test(name)) {
    return { ok: false, error: new ApiError(422, 'invalid_signer_name', `The name must be one line of at most ${MAX_SIGNER_NAME} characters`) };
  }
  return { ok: true, name };
}

function parseChoices(choices: SignOffInput['deficitChoices']): Map<CivilDate, DeficitChoice> {
  const byDate = new Map<CivilDate, DeficitChoice>();
  for (const item of choices) {
    const workDate = assertCivilDate(item.workDate, 'deficit_choices.work_date');
    if (byDate.has(workDate)) {
      throw new ApiError(422, 'duplicate_deficit_choice', 'Each deficit day takes one choice', { work_date: workDate });
    }
    byDate.set(workDate, item.choice);
  }
  return byDate;
}

function conflict(code: string, message: string): ApiError {
  return new ApiError(409, code, message, { fresh_review_required: true });
}

function resolvePeriod(scope: UserScope, payrollDateInput: string): PayPeriod {
  try {
    return payPeriodForPayrollDate(scope.calendar.schedule, assertCivilDate(payrollDateInput, 'payroll_date'), scope.exceptions);
  } catch (error) {
    // A payroll date that is not one of this user's own is indistinguishable from a missing one.
    if (isDomainError(error) && error.code === 'unknown_payroll_date') throw notFound('Timesheet');
    throw error;
  }
}

/* ------------------------------------------------------------- read side ---- */

interface RevisionRow {
  id: string;
  revision_no: number;
  revision_kind: RevisionRecord['revisionKind'];
  origin: RevisionRecord['origin'];
  review_state: RevisionRecord['reviewState'];
  supersedes_revision_id: string | null;
  correction_reason: string | null;
  payload_json: string;
  payload_sha256: string;
  reviewed_sha256: string | null;
  timesheet_version: number;
  send_requested: number;
  created_at: string;
}

interface SignoffRow {
  signer_name: string;
  signed_at: string;
  reviewed_sha256: string;
  signature_attachment_id: string;
}

function toRevision(row: RevisionRow): RevisionRecord {
  return {
    id: row.id,
    revisionNo: row.revision_no,
    revisionKind: row.revision_kind,
    origin: row.origin,
    reviewState: row.review_state,
    supersedesRevisionId: row.supersedes_revision_id,
    correctionReason: row.correction_reason,
    payloadSha256: row.payload_sha256,
    reviewedSha256: row.reviewed_sha256,
    timesheetVersion: row.timesheet_version,
    sendRequested: row.send_requested === 1,
    createdAt: row.created_at,
  };
}

/** The finalized revision of an owner's timesheet with its sign-off, lines and jobs. */
function loadFinalization(db: Db, userId: string, timesheet: TimesheetRow): { view: FinalizationView; payload: ReviewSnapshot } | null {
  if (timesheet.finalized_revision_no === null) return null;
  const row = db
    .prepare(
      `SELECT id, revision_no, revision_kind, origin, review_state, supersedes_revision_id, correction_reason,
              payload_json, payload_sha256, reviewed_sha256, timesheet_version, send_requested, created_at
         FROM timesheet_revisions WHERE user_id = ? AND timesheet_id = ? AND revision_no = ?`,
    )
    .get(userId, timesheet.id, timesheet.finalized_revision_no) as RevisionRow | undefined;
  if (row === undefined) return null;
  const signoff = db
    .prepare('SELECT signer_name, signed_at, reviewed_sha256, signature_attachment_id FROM signoffs WHERE user_id = ? AND revision_id = ?')
    .get(userId, row.id) as SignoffRow | undefined;
  const jobs = db
    .prepare('SELECT id, kind, state FROM jobs WHERE user_id = ? AND revision_id = ? ORDER BY kind, id')
    .all(userId, row.id) as JobRecord[];
  return {
    view: {
      revision: toRevision(row),
      signoff:
        signoff === undefined
          ? null
          : {
              signerName: signoff.signer_name,
              signedAt: signoff.signed_at,
              reviewedSha256: signoff.reviewed_sha256,
              signatureAttachmentId: signoff.signature_attachment_id,
            },
      lines: listRevisionLines(db, userId, row.id),
      jobs,
    },
    payload: JSON.parse(row.payload_json) as ReviewSnapshot,
  };
}

export interface FinalizationStatus {
  payrollDate: CivilDate;
  finalizedRevisionNo: number | null;
  view: FinalizationView | null;
}

/** The owner's finalization state of one period (read-only; another owner's date is "not found"). */
export function getFinalizationStatus(db: Db, user: SessionUser, payrollDate: string): FinalizationStatus {
  return db
    .transaction((): FinalizationStatus => {
      const scope = loadScope(db, user);
      const period = resolvePeriod(scope, payrollDate);
      const timesheet = findTimesheet(db, scope, period);
      const loaded = timesheet === undefined ? null : loadFinalization(db, user.id, timesheet);
      return { payrollDate: period.payrollDate, finalizedRevisionNo: timesheet?.finalized_revision_no ?? null, view: loaded?.view ?? null };
    })
    .deferred();
}

/** F-2: the owner's current pending lines (shown on the review and OT screens). */
export function listCurrentPendingLines(db: Db, userId: string) {
  return currentPendingLines(db, userId).map(pendingLineJson);
}

/* ------------------------------------------------------------- sign-off ----- */

/** True when a retry asks for exactly what the finalized revision recorded. */
function isIdenticalRetry(
  loaded: { view: FinalizationView; payload: ReviewSnapshot },
  input: SignOffInput,
  signer: SignerName,
  choices: Map<CivilDate, DeficitChoice>,
): boolean {
  const { view, payload } = loaded;
  if (!signer.ok || view.signoff === null) return false;
  if (view.revision.revisionKind !== 'original' || view.revision.origin !== 'employee') return false;
  if (view.revision.reviewedSha256 !== input.reviewedHash || view.signoff.signerName !== signer.name) return false;
  if (payload.unresolved_inputs.length > 0 && !input.incompleteEvidenceAcknowledged) return false;
  const recorded = new Map<CivilDate, DeficitChoice>();
  for (const proposal of payload.deficit_proposals) {
    if (proposal.mode !== 'choose_at_signoff') continue;
    const line = view.lines.find((item) => item.workDate === proposal.work_date && item.lineKind === 'deficit_debit');
    recorded.set(proposal.work_date, line?.outcome === 'waived' ? 'waive' : 'deduct');
  }
  if (recorded.size !== choices.size) return false;
  return [...choices].every(([workDate, choice]) => recorded.get(workDate) === choice);
}

/** Every choose-mode deficit needs exactly one choice; no other day may carry one. */
function checkChoices(proposals: readonly SnapshotDeficitProposal[], choices: Map<CivilDate, DeficitChoice>): void {
  const chooseDates = new Set(proposals.filter((item) => item.mode === 'choose_at_signoff').map((item) => item.work_date));
  const unexpected = [...choices.keys()].filter((workDate) => !chooseDates.has(workDate)).sort();
  if (unexpected.length > 0) {
    throw new ApiError(422, 'unexpected_deficit_choice', 'A choice was given for a day without a choose-mode deficit', { work_dates: unexpected });
  }
  const missing = [...chooseDates].filter((workDate) => !choices.has(workDate)).sort();
  if (missing.length > 0) {
    throw new ApiError(422, 'deficit_choice_required', 'Choose to deduct or waive each deficit before signing off', { work_dates: missing });
  }
}

function createTimesheetRow(db: Db, clock: Clock, scope: UserScope, period: PayPeriod, now: string): TimesheetRow {
  const payPeriodId = ensurePayPeriodRow(db, clock, scope.calendar.id, period);
  const row: TimesheetRow = { id: randomUUID(), user_id: scope.userId, pay_period_id: payPeriodId, version: 1, finalized_revision_no: null };
  db.prepare('INSERT INTO timesheets (id, user_id, pay_period_id, version, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)').run(
    row.id,
    row.user_id,
    payPeriodId,
    now,
    now,
  );
  return row;
}

interface PostingContext {
  ledger: LedgerContext;
  scope: UserScope;
  user: SessionUser;
  revisionId: string;
  payload: ReviewSnapshot;
}

/**
 * R-05: decides each deficit with the production engine (the employee's choice in choose
 * mode, the balance available now) and posts authorized debits through the ledger. The
 * ledger is authoritative: a debit it cannot cover stays pending and appends nothing.
 */
function postDeficits(posting: PostingContext, choices: Map<CivilDate, DeficitChoice>): RevisionLedgerLine[] {
  const { ledger, scope, user, revisionId, payload } = posting;
  const lines: RevisionLedgerLine[] = [];
  for (const proposal of payload.deficit_proposals) {
    const day = payload.days.find((item) => item.work_date === proposal.work_date);
    const policy = scope.policies.find((item) => item.id === proposal.policy_version_id);
    if (day === undefined || policy === undefined) throw new Error('A reviewed deficit has no day or policy');
    const choice = choices.get(proposal.work_date);
    const outcome = decideDeficit({
      requiredMinutes: policy.requiredMinutes,
      regularMinutes: day.calculation?.regular_minutes ?? null,
      nonworkingMinutes: day.calculation?.nonworking_minutes ?? null,
      leaveMinutes: day.leave_minutes,
      normalWorkDate: day.day_class === 'normal',
      attendanceExpected: day.attendance_expected,
      recordsComplete: day.completeness === 'complete',
      mode: policy.deficitMode,
      manualChoice: choice === undefined ? null : choice === 'deduct' ? 'deduct' : 'ignore',
      finalizationOrigin: 'manual',
      availableMinutes: getBalance(ledger.db, user.id).availableMinutes,
    });
    if (outcome.deficitMinutes !== proposal.deficit_minutes) throw new Error('The sign-off deficit differs from the reviewed payload');
    const base = { userId: user.id, revisionId, workDate: proposal.work_date, lineKind: 'deficit_debit' as const, proposedMinutes: -proposal.deficit_minutes };
    switch (outcome.decision) {
      case 'ignored':
        // Policy mode `ignore`: no debit is proposed, so there is no line.
        break;
      case 'declined':
        lines.push(recordRevisionLine(ledger.db, ledger.clock, { ...base, result: { outcome: 'waived', ledgerEntryId: null } }));
        break;
      case 'authorized':
      case 'insufficient_balance': {
        const result = postDeficitDebit(ledger, {
          userId: user.id,
          sourceKey: deficitDebitSourceKey(proposal.work_date),
          sourceRef: revisionId,
          actorUserId: user.id,
          origin: 'manual',
          workDate: proposal.work_date,
          debitMinutes: proposal.deficit_minutes,
        });
        lines.push(recordRevisionLine(ledger.db, ledger.clock, { ...base, result: deficitDebitOutcome(result) }));
        break;
      }
      default:
        throw new Error(`Unexpected deficit decision at sign-off: ${outcome.decision}`);
    }
  }
  return lines;
}

/** R-06: posts each computable credit once through the ledger. */
function postCredits(posting: PostingContext): RevisionLedgerLine[] {
  const { ledger, user, revisionId, payload } = posting;
  return payload.ot_proposals.map((proposal) => {
    const result = postCredit(ledger, {
      userId: user.id,
      sourceKey: creditSourceKey(proposal.work_date),
      sourceRef: revisionId,
      actorUserId: user.id,
      origin: 'manual',
      workDate: proposal.work_date,
      minutes: proposal.credited_minutes,
    });
    return recordRevisionLine(ledger.db, ledger.clock, {
      userId: user.id,
      revisionId,
      workDate: proposal.work_date,
      lineKind: 'credit',
      proposedMinutes: proposal.credited_minutes,
      result: creditOutcome(result),
    });
  });
}

/**
 * Outbox rows for the PDF and the initial send; unique business keys make them once-only.
 * A correction or late review sends only on the owner's explicit choice (`sendEmail`).
 */
function enqueueJobs(db: Db, userId: string, revisionId: string, now: string, sendEmail = true): void {
  const insert = db.prepare(
    `INSERT INTO jobs (id, user_id, revision_id, kind, business_key, payload_json, state, attempts, next_run_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?, ?)`,
  );
  const payload = JSON.stringify({ revision_id: revisionId });
  insert.run(randomUUID(), userId, revisionId, JOB_RENDER_PDF, `revision:${revisionId}:${JOB_RENDER_PDF}`, payload, now, now, now);
  if (sendEmail) {
    insert.run(randomUUID(), userId, revisionId, JOB_SEND_EMAIL, `revision:${revisionId}:${JOB_SEND_EMAIL}:initial`, payload, now, now, now);
  }
}

/**
 * Signs off and finalizes the owner's period `payrollDate` (see the module comment for the
 * transaction steps). Returns `created`, or `replayed` for an identical retry.
 */
export function signOffTimesheet(ctx: FinalizationContext, payrollDate: string, input: SignOffInput): SignOffResult {
  const { db, clock, user } = ctx;
  const signer = parseSignerName(input.signerName);
  const choices = parseChoices(input.deficitChoices);
  return writeTransaction(db, (): SignOffResult => {
    // 1. Recompute the reviewed content from the engine and bind it to the review.
    const review = buildReviewPayload(db, clock, user, payrollDate);
    const scope = loadScope(db, user);
    const period = resolvePeriod(scope, review.payload.period.payroll_date);
    const existing = findTimesheet(db, scope, period);
    if (existing !== undefined && existing.finalized_revision_no !== null) {
      const loaded = loadFinalization(db, user.id, existing);
      if (loaded !== null && isIdenticalRetry(loaded, input, signer, choices)) {
        return { status: 'replayed', finalizedRevisionNo: existing.finalized_revision_no, ...loaded.view };
      }
      throw conflict('already_finalized', 'This period is already finalized; load it again to review its current state');
    }
    if (review.expectedVersion !== input.expectedVersion) {
      throw conflict('stale_version', 'The timesheet changed since it was reviewed; review it again');
    }
    if (review.payloadHash !== input.reviewedHash) {
      throw conflict('stale_review', 'The reviewed content changed; review it again');
    }

    // 2. The owner's name and current signature image, the acknowledgement and the choices.
    if (!signer.ok) throw signer.error;
    const payload = review.payload;
    if (payload.signature === null) {
      throw new ApiError(422, 'signature_required', 'Upload a signature image before signing off');
    }
    const signature = currentSignature(db, user.id);
    if (signature?.id !== payload.signature.attachment_id || signature.sha256 !== payload.signature.sha256) {
      throw conflict('stale_review', 'The signature image changed; review it again');
    }
    if (payload.unresolved_inputs.length > 0 && !input.incompleteEvidenceAcknowledged) {
      throw new ApiError(422, 'acknowledgement_required', 'Acknowledge the incomplete evidence before signing off', {
        unresolved: payload.unresolved_inputs.length,
      });
    }
    checkChoices(payload.deficit_proposals, choices);

    // 3. The immutable signed revision and the real sign-off.
    const now = nowUtc(clock);
    const timesheet = existing ?? createTimesheetRow(db, clock, scope, period, now);
    const revisionId = randomUUID();
    const revisionNo = 1;
    db.prepare(
      `INSERT INTO timesheet_revisions (id, user_id, timesheet_id, revision_no, revision_kind, origin, review_state,
         supersedes_revision_id, correction_reason, timesheet_version, payload_json, payload_sha256, reviewed_sha256,
         send_requested, actor_user_id, created_at)
       VALUES (?, ?, ?, ?, 'original', 'employee', 'signed', NULL, NULL, ?, ?, ?, ?, 1, ?, ?)`,
    ).run(revisionId, user.id, timesheet.id, revisionNo, timesheet.version, canonicalize(payload), review.payloadHash, review.payloadHash, user.id, now);
    db.prepare(
      `INSERT INTO signoffs (id, user_id, revision_id, signer_name, signed_at, reviewed_sha256, signature_attachment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(randomUUID(), user.id, revisionId, signer.name, now, review.payloadHash, signature.id);

    // 4. Ledger postings through ledger.ts and every proposal outcome (R4, F-2).
    const posting: PostingContext = { ledger: { db, clock }, scope, user, revisionId, payload };
    const lines = [...postDeficits(posting, choices), ...postCredits(posting)];

    // 5. Finalize the period: provisional minutes of this period disappear.
    const finalized = db
      .prepare(
        `UPDATE timesheets SET finalized_revision_no = ?, version = version + 1, updated_at = ?
          WHERE id = ? AND user_id = ? AND finalized_revision_no IS NULL AND version = ?`,
      )
      .run(revisionNo, now, timesheet.id, user.id, timesheet.version);
    if (finalized.changes !== 1) throw conflict('stale_version', 'The timesheet changed since it was reviewed; review it again');

    // 6. PDF and send work for the runner.
    enqueueJobs(db, user.id, revisionId, now);

    // 7. Audit without personal content.
    const loaded = loadFinalization(db, user.id, { ...timesheet, finalized_revision_no: revisionNo });
    if (loaded === null) throw new Error('The new revision was not stored');
    recordAudit(db, clock, {
      actorUserId: user.id,
      ownerUserId: user.id,
      operation: 'timesheet.signoff',
      entityType: 'timesheet_revision',
      entityId: revisionId,
      before: { timesheet_id: timesheet.id, finalized_revision_no: null, version: timesheet.version },
      after: {
        timesheet_id: timesheet.id,
        revision_id: revisionId,
        revision_no: revisionNo,
        revision_kind: 'original',
        origin: 'employee',
        review_state: 'signed',
        payroll_date: period.payrollDate,
        payload_sha256: review.payloadHash,
        signed_at: now,
        signature_attachment_id: signature.id,
        signature_sha256: signature.sha256,
        ledger_lines: outcomeCounts(lines),
        job_ids: loaded.view.jobs.map((job) => job.id),
        finalized_revision_no: revisionNo,
        version: timesheet.version + 1,
      },
    });
    return { status: 'created', finalizedRevisionNo: revisionNo, ...loaded.view };
  });
}

/* ------------------------------------------------- corrections, late review --- */

/*
 * Revisions after the first finalization (docs/05 "Corrections and resends", R-06, R-07,
 * LG-08, LG-09, AC-04, R1, R4 and the owner's F-2 decision).
 *
 * - A correction revision (`correction`) needs a reason and a genuine sign-off. It posts only
 *   differences against what the ledger holds for each day:
 *   - a day with a posted original credit or deficit debit gets `postCorrection` with the
 *     revision-specific key `rev:{revisionId}:day:{date}:correction` (an unchanged value
 *     appends nothing and is recorded as `unchanged`; a debit increase the balance cannot
 *     cover is recorded as a pending line and appended nowhere, F-2);
 *   - a day without a posted original (it had no records, or its debit stayed pending) gets a
 *     first credit or debit with the day's revision-independent original key (WP3-REQ O7);
 *     this is also how a later finalized revision re-evaluates an earlier pending debit.
 * - A late review (`late_review`) turns an automatic revision awaiting review into a genuinely
 *   signed revision. Its ledger-relevant content must be unchanged (otherwise it is a
 *   correction with a reason), so the difference is zero (LG-09).
 * - Both are explicit about e-mail: `sendEmail` false enqueues only the PDF job.
 * - Originals (revision rows, sign-offs, PDFs, lines, ledger entries) are never touched; the
 *   timesheet only points at the newest revision.
 *
 * The owner always comes from the session. Every write runs in one IMMEDIATE transaction
 * together with the ledger postings, so a failure rolls all of it back; no network call.
 */

export type RevisionKind = 'correction' | 'late_review';

export interface ReviseInput extends SignOffInput {
  kind: RevisionKind;
  /** Required (non-blank, at most 2000 characters) for a correction; ignored for a late review. */
  reason: string | null;
  /** The explicit choice to e-mail this revision; false enqueues no send job. */
  sendEmail: boolean;
}

const MAX_REASON = 2000;
const LATE_REVIEW_LEDGER_REASON = 'Late review of an automatic revision';

/** Days whose records are unresolved post nothing and keep what the ledger already holds. */
const UNRESOLVED_COMPLETENESS: ReadonlySet<string> = new Set(['incomplete', 'incomplete_breaks', 'calculation_error']);

function parseReason(kind: RevisionKind, raw: string | null): string | null {
  if (kind === 'late_review') return null;
  const reason = normalizeReason(raw);
  if (reason === null) throw new ApiError(422, 'reason_required', 'A correction requires a reason');
  if (reason.length > MAX_REASON) throw new ApiError(422, 'invalid_reason', `The reason must be at most ${MAX_REASON} characters`);
  return reason;
}

/** What the ledger would post for a day, compared between two payloads (credits and deficits only). */
function ledgerContent(payload: ReviewSnapshot): string {
  return JSON.stringify({
    credits: payload.ot_proposals.map((item) => [item.work_date, item.credited_minutes]),
    deficits: payload.deficit_proposals.map((item) => [item.work_date, item.deficit_minutes, item.mode]),
  });
}

/** True when a retry asks for exactly what the current revision already recorded. */
function isRevisionReplay(
  loaded: { view: FinalizationView; payload: ReviewSnapshot },
  input: ReviseInput,
  signer: SignerName,
  reason: string | null,
): boolean {
  const { view, payload } = loaded;
  if (!signer.ok || view.signoff === null) return false;
  const revision = view.revision;
  if (revision.revisionKind !== input.kind || revision.reviewedSha256 !== input.reviewedHash) return false;
  if (view.signoff.signerName !== signer.name || revision.correctionReason !== reason || revision.sendRequested !== input.sendEmail) return false;
  if (payload.unresolved_inputs.length > 0 && !input.incompleteEvidenceAcknowledged) return false;
  // Choose-mode choices cannot be compared with what was recorded: such a retry is not a replay.
  return !payload.deficit_proposals.some((item) => item.mode === 'choose_at_signoff');
}

interface RevisionPosting extends PostingContext {
  reason: string;
}

/**
 * Posts the differences between the reviewed payload and the ledger (see the section
 * comment). Debit-side movements come first, then credit-side ones, like the sign-off. The
 * ledger stays authoritative: a debit increase it cannot cover is returned as pending.
 */
function postDifferences(posting: RevisionPosting, choices: Map<CivilDate, DeficitChoice>): RevisionLedgerLine[] {
  const { ledger, scope, user, revisionId, payload, reason } = posting;
  const entries = listLedgerEntries(ledger.db, user.id);
  const byKey = new Map<string, LedgerEntry>(entries.map((entry) => [entry.sourceKey, entry]));
  /** The posted signed value of an original: its delta plus the deltas of all corrections of it. */
  const netOf = (original: LedgerEntry): number =>
    entries.filter((entry) => entry.correctsEntryId === original.id).reduce((total, entry) => total + entry.deltaMinutes, original.deltaMinutes);
  const collected: Array<{ workDate: CivilDate; line: CorrectionLine }> = [];
  const usedKeys = new Set<string>();
  /** The revision-specific key; a second correction posted for the same day takes a numbered suffix. */
  const correctionKey = (workDate: CivilDate): string => {
    const plain = `rev:${revisionId}:day:${workDate}:correction`;
    return usedKeys.has(plain) ? `${plain}:2` : plain;
  };
  const common = { userId: user.id, sourceRef: revisionId, actorUserId: user.id, origin: 'manual' as const };
  const reviewedDays = payload.days.filter((day) => !UNRESOLVED_COMPLETENESS.has(day.completeness));

  for (const day of reviewedDays) {
    const proposal = payload.deficit_proposals.find((item) => item.work_date === day.work_date);
    const original = byKey.get(deficitDebitSourceKey(day.work_date));
    const posted = original === undefined ? 0 : -netOf(original);
    let wanted = 0;
    let waived = false;
    if (proposal !== undefined) {
      const policy = scope.policies.find((item) => item.id === proposal.policy_version_id);
      if (policy === undefined) throw new Error('A reviewed deficit has no policy');
      const choice = choices.get(proposal.work_date);
      const outcome = decideDeficit({
        requiredMinutes: policy.requiredMinutes,
        regularMinutes: day.calculation?.regular_minutes ?? null,
        nonworkingMinutes: day.calculation?.nonworking_minutes ?? null,
        leaveMinutes: day.leave_minutes,
        normalWorkDate: day.day_class === 'normal',
        attendanceExpected: day.attendance_expected,
        recordsComplete: day.completeness === 'complete',
        mode: policy.deficitMode,
        manualChoice: choice === undefined ? null : choice === 'deduct' ? 'deduct' : 'ignore',
        finalizationOrigin: 'manual',
        // The ledger decides whether the balance covers the debit; the engine only classifies it here.
        availableMinutes: Number.MAX_SAFE_INTEGER,
      });
      if (outcome.deficitMinutes !== proposal.deficit_minutes) throw new Error('The revision deficit differs from the reviewed payload');
      switch (outcome.decision) {
        case 'ignored':
          break;
        case 'declined':
          waived = true;
          break;
        case 'authorized':
          wanted = proposal.deficit_minutes;
          break;
        default:
          throw new Error(`Unexpected deficit decision in a revision: ${outcome.decision}`);
      }
    }
    if (original !== undefined) {
      if (wanted === 0 && posted === 0) continue;
      const key = correctionKey(day.work_date);
      const result = postCorrection(ledger, {
        ...common,
        sourceKey: key,
        reason,
        originalEntryId: original.id,
        correctedMinutes: wanted,
        expectedPreviousMinutes: posted,
      });
      if (result.status === 'posted') usedKeys.add(key);
      collected.push({ workDate: day.work_date, line: correctionLine(result, original, true) });
    } else if (wanted > 0) {
      // No posted original: the first debit takes the day's original key (this also re-evaluates a pending one, F-2).
      const result = postDeficitDebit(ledger, {
        ...common,
        sourceKey: deficitDebitSourceKey(day.work_date),
        workDate: day.work_date,
        debitMinutes: wanted,
      });
      collected.push({ workDate: day.work_date, line: { lineKind: 'deficit_debit', proposedMinutes: -wanted, result: deficitDebitOutcome(result) } });
    } else if (waived && proposal !== undefined) {
      collected.push({
        workDate: day.work_date,
        line: { lineKind: 'deficit_debit', proposedMinutes: -proposal.deficit_minutes, result: { outcome: 'waived', ledgerEntryId: null } },
      });
    }
  }

  for (const day of reviewedDays) {
    const wanted = payload.ot_proposals.find((item) => item.work_date === day.work_date)?.credited_minutes ?? 0;
    const original = byKey.get(creditSourceKey(day.work_date));
    if (original !== undefined) {
      const posted = netOf(original);
      if (wanted === 0 && posted === 0) continue;
      const key = correctionKey(day.work_date);
      const result = postCorrection(ledger, {
        ...common,
        sourceKey: key,
        reason,
        originalEntryId: original.id,
        correctedMinutes: wanted,
        expectedPreviousMinutes: posted,
      });
      if (result.status === 'posted') usedKeys.add(key);
      collected.push({ workDate: day.work_date, line: correctionLine(result, original, false) });
    } else if (wanted > 0) {
      // O7: no posted original for this day, so this is a first credit, not a correction.
      const result = postCredit(ledger, { ...common, sourceKey: creditSourceKey(day.work_date), workDate: day.work_date, minutes: wanted });
      collected.push({ workDate: day.work_date, line: { lineKind: 'credit', proposedMinutes: wanted, result: creditOutcome(result) } });
    }
  }

  // An `unchanged` line is information only: it yields its slot to a real line of the same day and kind.
  const slot = (item: { workDate: CivilDate; line: CorrectionLine }) => `${item.workDate}:${item.line.lineKind}`;
  const busy = new Set(collected.filter((item) => item.line.result.outcome !== 'unchanged').map(slot));
  const kept = collected.filter((item) => item.line.result.outcome !== 'unchanged' || !busy.has(slot(item)));
  if (new Set(kept.map(slot)).size !== kept.length) throw new ApiError(409, 'day_line_conflict', 'A day has two movements of the same kind in one revision');
  return kept.map((item) => recordRevisionLine(ledger.db, ledger.clock, { userId: user.id, revisionId, workDate: item.workDate, ...item.line }));
}

/**
 * Creates a correction revision or the late review of an automatic revision for the owner's
 * finalized period (see the section comment). Returns `created`, or `replayed` for an
 * identical retry that is still the current revision.
 */
export function reviseTimesheet(ctx: FinalizationContext, payrollDate: string, input: ReviseInput): SignOffResult {
  const { db, clock, user } = ctx;
  const reason = parseReason(input.kind, input.reason);
  const signer = parseSignerName(input.signerName);
  const choices = parseChoices(input.deficitChoices);
  return writeTransaction(db, (): SignOffResult => {
    const review = buildReviewPayload(db, clock, user, payrollDate);
    const scope = loadScope(db, user);
    const period = resolvePeriod(scope, review.payload.period.payroll_date);
    const existing = findTimesheet(db, scope, period);
    if (existing === undefined || existing.finalized_revision_no === null) {
      throw new ApiError(409, 'not_finalized', 'This period is not finalized yet; sign it off first');
    }
    const previous = loadFinalization(db, user.id, existing);
    if (previous === null) throw new Error('The finalized revision was not found');
    if (isRevisionReplay(previous, input, signer, reason)) {
      return { status: 'replayed', finalizedRevisionNo: existing.finalized_revision_no, ...previous.view };
    }
    if (input.kind === 'late_review' && !(previous.view.revision.origin === 'deadline' && previous.view.revision.reviewState === 'pending')) {
      throw new ApiError(409, 'no_pending_review', 'Only an automatic revision awaiting employee review can be reviewed late');
    }
    if (review.expectedVersion !== input.expectedVersion) {
      throw conflict('stale_version', 'The timesheet changed since it was reviewed; review it again');
    }
    if (review.payloadHash !== input.reviewedHash) {
      throw conflict('stale_review', 'The reviewed content changed; review it again');
    }

    // The owner's name and current signature image, the acknowledgement and the choices, as at sign-off.
    if (!signer.ok) throw signer.error;
    const payload = review.payload;
    if (payload.signature === null) {
      throw new ApiError(422, 'signature_required', 'Upload a signature image before signing off');
    }
    const signature = currentSignature(db, user.id);
    if (signature?.id !== payload.signature.attachment_id || signature.sha256 !== payload.signature.sha256) {
      throw conflict('stale_review', 'The signature image changed; review it again');
    }
    if (payload.unresolved_inputs.length > 0 && !input.incompleteEvidenceAcknowledged) {
      throw new ApiError(422, 'acknowledgement_required', 'Acknowledge the incomplete evidence before signing off', {
        unresolved: payload.unresolved_inputs.length,
      });
    }
    checkChoices(payload.deficit_proposals, choices);
    if (input.kind === 'late_review' && ledgerContent(previous.payload) !== ledgerContent(payload)) {
      throw conflict('content_changed', 'The content changed since the automatic submission; create a correction with a reason instead');
    }

    // The immutable signed revision superseding the current one, and the real sign-off.
    const now = nowUtc(clock);
    const previousNo = existing.finalized_revision_no;
    const revisionNo = previousNo + 1;
    if (payload.submission.revision_no !== revisionNo) throw new Error('The reviewed revision number is not the next one');
    const revisionId = randomUUID();
    db.prepare(
      `INSERT INTO timesheet_revisions (id, user_id, timesheet_id, revision_no, revision_kind, origin, review_state,
         supersedes_revision_id, correction_reason, timesheet_version, payload_json, payload_sha256, reviewed_sha256,
         send_requested, actor_user_id, created_at)
       VALUES (?, ?, ?, ?, ?, 'employee', 'signed', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      revisionId,
      user.id,
      existing.id,
      revisionNo,
      input.kind,
      previous.view.revision.id,
      reason,
      existing.version,
      canonicalize(payload),
      review.payloadHash,
      review.payloadHash,
      input.sendEmail ? 1 : 0,
      user.id,
      now,
    );
    db.prepare(
      `INSERT INTO signoffs (id, user_id, revision_id, signer_name, signed_at, reviewed_sha256, signature_attachment_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(randomUUID(), user.id, revisionId, signer.name, now, review.payloadHash, signature.id);

    // Only differences reach the ledger, through ledger.ts; every outcome is recorded.
    const lines = postDifferences(
      { ledger: { db, clock }, scope, user, revisionId, payload, reason: reason ?? LATE_REVIEW_LEDGER_REASON },
      choices,
    );

    const finalized = db
      .prepare(
        `UPDATE timesheets SET finalized_revision_no = ?, version = version + 1, updated_at = ?
          WHERE id = ? AND user_id = ? AND finalized_revision_no = ? AND version = ?`,
      )
      .run(revisionNo, now, existing.id, user.id, previousNo, existing.version);
    if (finalized.changes !== 1) throw conflict('stale_version', 'The timesheet changed since it was reviewed; review it again');

    enqueueJobs(db, user.id, revisionId, now, input.sendEmail);

    const loaded = loadFinalization(db, user.id, { ...existing, finalized_revision_no: revisionNo });
    if (loaded === null) throw new Error('The new revision was not stored');
    recordAudit(db, clock, {
      actorUserId: user.id,
      ownerUserId: user.id,
      operation: input.kind === 'correction' ? 'timesheet.correction' : 'timesheet.late_review',
      entityType: 'timesheet_revision',
      entityId: revisionId,
      reason,
      before: { timesheet_id: existing.id, finalized_revision_no: previousNo, revision_id: previous.view.revision.id, version: existing.version },
      after: {
        timesheet_id: existing.id,
        revision_id: revisionId,
        revision_no: revisionNo,
        revision_kind: input.kind,
        supersedes_revision_id: previous.view.revision.id,
        payroll_date: period.payrollDate,
        payload_sha256: review.payloadHash,
        signed_at: now,
        signature_attachment_id: signature.id,
        send_requested: input.sendEmail,
        ledger_lines: revisionOutcomeCounts(lines),
        job_ids: loaded.view.jobs.map((job) => job.id),
        finalized_revision_no: revisionNo,
        version: existing.version + 1,
      },
    });
    return { status: 'created', finalizedRevisionNo: revisionNo, ...loaded.view };
  });
}

/* ------------------------------------------------------------------ resend ---- */

export interface ResendInput {
  /** Optional echo of the envelope the caller expects; a difference needs a new revision instead. */
  to?: readonly string[];
  cc?: readonly string[];
  templateVersion?: number;
}

export interface ResendResult {
  revisionId: string;
  job: JobRecord;
  attempt: { id: string; attemptNo: number; state: string };
}

const addressKey = (list: readonly string[]): string => JSON.stringify(list.map((item) => item.trim().toLowerCase()).sort());

/**
 * Same-revision resend (docs/05): a new delivery attempt and send job for the revision's frozen
 * PDF and frozen envelope. No revision, sign-off, line or ledger row is written or changed.
 * Refused while an attempt is preparing or sending, while one is uncertain without an
 * explicit decision, or while a send job of the revision is still waiting; a changed
 * envelope needs a new revision. The attempt starts `preparing`; the send job (a later task)
 * claims it and moves it on.
 */
export function resendRevision(ctx: FinalizationContext, revisionId: string, input: ResendInput): ResendResult {
  const { db, clock, user } = ctx;
  return writeTransaction(db, (): ResendResult => {
    const row = db
      .prepare(
        `SELECT r.id, r.revision_no, r.payload_json, t.finalized_revision_no
           FROM timesheet_revisions r
           JOIN timesheets t ON t.id = r.timesheet_id AND t.user_id = r.user_id
          WHERE r.id = ? AND r.user_id = ?`,
      )
      .get(revisionId, user.id) as { id: string; revision_no: number; payload_json: string; finalized_revision_no: number | null } | undefined;
    // Another user's revision is indistinguishable from a missing one.
    if (row === undefined) throw notFound('Revision');
    if (row.finalized_revision_no !== row.revision_no) {
      throw new ApiError(409, 'revision_superseded', 'A newer revision exists; only the current revision can be resent');
    }
    const payload = JSON.parse(row.payload_json) as ReviewSnapshot;
    const frozen = payload.recipients;
    const changed = [
      ...(input.to !== undefined && addressKey(input.to) !== addressKey(frozen.to) ? ['to'] : []),
      ...(input.cc !== undefined && addressKey(input.cc) !== addressKey(frozen.cc) ? ['cc'] : []),
      ...(input.templateVersion !== undefined && input.templateVersion !== frozen.template_version ? ['template_version'] : []),
    ];
    if (changed.length > 0) {
      throw new ApiError(409, 'envelope_changed', 'The recipients or template differ from this revision; create a new revision instead', {
        new_revision_required: true,
        fields: changed,
      });
    }

    const open = db
      .prepare(
        `SELECT state FROM delivery_attempts
          WHERE user_id = ? AND revision_id = ? AND (state IN ('preparing', 'sending') OR (state = 'uncertain' AND decision IS NULL))
          ORDER BY started_at`,
      )
      .all(user.id, revisionId) as Array<{ state: string }>;
    if (open.some((attempt) => attempt.state === 'uncertain')) {
      throw new ApiError(409, 'delivery_uncertain', 'A delivery attempt is uncertain; record a decision before resending');
    }
    const waiting = db
      .prepare("SELECT 1 FROM jobs WHERE user_id = ? AND revision_id = ? AND kind = ? AND state IN ('queued', 'leased') LIMIT 1")
      .get(user.id, revisionId, JOB_SEND_EMAIL);
    if (open.length > 0 || waiting !== undefined) {
      throw new ApiError(409, 'delivery_in_progress', 'A delivery of this revision is already in progress');
    }
    const pdf = db
      .prepare(
        `SELECT f.attachment_id, a.sha256
           FROM revision_files f
           JOIN attachments a ON a.id = f.attachment_id AND a.user_id = f.user_id
          WHERE f.user_id = ? AND f.revision_id = ? AND f.kind = 'pdf' AND f.state = 'ready'`,
      )
      .get(user.id, revisionId) as { attachment_id: string; sha256: string } | undefined;
    if (pdf === undefined) throw new ApiError(409, 'pdf_not_ready', 'The final PDF of this revision is not ready yet');

    const now = nowUtc(clock);
    const sends = Number(db.prepare('SELECT count(*) FROM jobs WHERE user_id = ? AND revision_id = ? AND kind = ?').pluck().get(user.id, revisionId, JOB_SEND_EMAIL));
    const jobId = randomUUID();
    const businessKey = `revision:${revisionId}:${JOB_SEND_EMAIL}:resend:${sends + 1}`;
    db.prepare(
      `INSERT INTO jobs (id, user_id, revision_id, kind, business_key, payload_json, state, attempts, next_run_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?, ?)`,
    ).run(jobId, user.id, revisionId, JOB_SEND_EMAIL, businessKey, JSON.stringify({ revision_id: revisionId }), now, now, now);
    // The envelope is frozen from the revision's own payload: recipients, subject, a digest of the body and the PDF hash.
    const envelope = {
      revision_id: revisionId,
      to: frozen.to,
      cc: frozen.cc,
      subject: frozen.subject,
      template_version: frozen.template_version,
      body_sha256: sha256Hex(canonicalize({ body_text: frozen.body_text, body_html: frozen.body_html })),
      attachment_sha256: pdf.sha256,
    };
    const attemptId = randomUUID();
    db.prepare(
      `INSERT INTO delivery_attempts (id, job_id, user_id, revision_id, attempt_no, channel, envelope_json, attachment_id,
         message_id, state, started_at, updated_at)
       VALUES (?, ?, ?, ?, 1, 'email', ?, ?, ?, 'preparing', ?, ?)`,
    ).run(attemptId, jobId, user.id, revisionId, canonicalize(envelope), pdf.attachment_id, `<${randomUUID()}@timesheet.invalid>`, now, now);
    recordAudit(db, clock, {
      actorUserId: user.id,
      ownerUserId: user.id,
      operation: 'revision.resend',
      entityType: 'timesheet_revision',
      entityId: revisionId,
      after: { revision_id: revisionId, job_id: jobId, business_key: businessKey, attempt_id: attemptId, attempt_no: 1, attachment_id: pdf.attachment_id },
    });
    return { revisionId, job: { id: jobId, kind: JOB_SEND_EMAIL, state: 'queued' }, attempt: { id: attemptId, attemptNo: 1, state: 'preparing' } };
  });
}

/* ------------------------------------------------------------------ JSON ---- */

function revisionJson(revision: RevisionRecord) {
  return {
    id: revision.id,
    revision_no: revision.revisionNo,
    revision_kind: revision.revisionKind,
    origin: revision.origin,
    review_state: revision.reviewState,
    supersedes_revision_id: revision.supersedesRevisionId,
    correction_reason: revision.correctionReason,
    payload_sha256: revision.payloadSha256,
    reviewed_sha256: revision.reviewedSha256,
    timesheet_version: revision.timesheetVersion,
    send_requested: revision.sendRequested,
    created_at: revision.createdAt,
  };
}

function signoffJson(signoff: SignoffRecord | null) {
  return signoff === null
    ? null
    : {
        signer_name: signoff.signerName,
        signed_at: signoff.signedAt,
        reviewed_sha256: signoff.reviewedSha256,
        signature_attachment_id: signoff.signatureAttachmentId,
      };
}

function viewJson(view: FinalizationView | null) {
  return {
    revision: view === null ? null : revisionJson(view.revision),
    signoff: view === null ? null : signoffJson(view.signoff),
    ledger_lines: view === null ? [] : view.lines.map(revisionLineJson),
    jobs: view === null ? [] : view.jobs.map((job) => ({ id: job.id, kind: job.kind, state: job.state })),
  };
}

export function signOffJson(result: SignOffResult) {
  return { status: result.status, finalized_revision_no: result.finalizedRevisionNo, ...viewJson(result) };
}

export function resendJson(result: ResendResult) {
  return {
    revision_id: result.revisionId,
    job: { id: result.job.id, kind: result.job.kind, state: result.job.state },
    attempt: { id: result.attempt.id, attempt_no: result.attempt.attemptNo, state: result.attempt.state },
  };
}

export function finalizationStatusJson(status: FinalizationStatus) {
  return { payroll_date: status.payrollDate, finalized_revision_no: status.finalizedRevisionNo, ...viewJson(status.view) };
}
