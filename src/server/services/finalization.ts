import { randomUUID } from 'node:crypto';
import { canonicalize } from '../../domain/canonical.ts';
import { assertCivilDate, type CivilDate } from '../../domain/dates.ts';
import { decideDeficit } from '../../domain/deficit.ts';
import { isDomainError } from '../../domain/errors.ts';
import { type PayPeriod, payPeriodForPayrollDate } from '../../domain/periods.ts';
import type { ReviewSnapshot, SnapshotDeficitProposal } from '../../domain/snapshot.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { getBalance, type LedgerContext, postCredit, postDeficitDebit } from './ledger.ts';
import { ensurePayPeriodRow } from './periods.ts';
import { buildReviewPayload } from './reviewPayload.ts';
import {
  creditOutcome,
  currentPendingLines,
  deficitDebitOutcome,
  listRevisionLines,
  outcomeCounts,
  pendingLineJson,
  recordRevisionLine,
  type RevisionLedgerLine,
  revisionLineJson,
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
      `SELECT id, revision_no, revision_kind, origin, review_state, payload_json, payload_sha256, reviewed_sha256,
              timesheet_version, send_requested, created_at
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

/** Outbox rows for the PDF and the initial send; unique business keys make them once-only. */
function enqueueJobs(db: Db, userId: string, revisionId: string, now: string): void {
  const insert = db.prepare(
    `INSERT INTO jobs (id, user_id, revision_id, kind, business_key, payload_json, state, attempts, next_run_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, ?, ?, ?)`,
  );
  const payload = JSON.stringify({ revision_id: revisionId });
  insert.run(randomUUID(), userId, revisionId, JOB_RENDER_PDF, `revision:${revisionId}:${JOB_RENDER_PDF}`, payload, now, now, now);
  insert.run(randomUUID(), userId, revisionId, JOB_SEND_EMAIL, `revision:${revisionId}:${JOB_SEND_EMAIL}:initial`, payload, now, now, now);
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

/* ------------------------------------------------------------------ JSON ---- */

function revisionJson(revision: RevisionRecord) {
  return {
    id: revision.id,
    revision_no: revision.revisionNo,
    revision_kind: revision.revisionKind,
    origin: revision.origin,
    review_state: revision.reviewState,
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

export function finalizationStatusJson(status: FinalizationStatus) {
  return { payroll_date: status.payrollDate, finalized_revision_no: status.finalizedRevisionNo, ...viewJson(status.view) };
}
