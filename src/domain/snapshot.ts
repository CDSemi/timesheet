import { type CanonicalValue, canonicalDate, canonicalHash, canonicalMinutes, canonicalUtc, CanonicalError } from './canonical.ts';

/*
 * The review payload and its frozen snapshot (docs/03 "Atomicity and snapshots", docs/05
 * "Manual path"). This module only describes, validates and orders the payload; it computes
 * no business minutes: every minute value in it is produced by the production engine
 * (computeWorkDay, provisionalCredits, decideDeficit) and handed in by the server service.
 * The payload holds no credential, no file bytes and nothing that depends on the current
 * clock, so equal content always gives an equal hash.
 *
 * Version 2 (WP3-T07B) adds `auto_note`, the user's optional note line for automatic
 * submissions, frozen from the effective settings. Version 1 payloads (finalized before that
 * change) stay valid for reading and rendering: they have no note, so they render with the
 * note off and their stored hash is unchanged (normalization adds nothing to them).
 */

export const SNAPSHOT_SCHEMA = 'timesheet-review';
export const SNAPSHOT_VERSION = 2;
/** The oldest payload version that can still be read and rendered. */
const OLDEST_READABLE_VERSION = 1;

/** The default text of the optional note line of an automatic submission. */
export const DEFAULT_AUTO_NOTE_TEXT = 'Automatic submission';
/** The note text is 1 to this many characters (code points), one line. */
export const MAX_AUTO_NOTE_LENGTH = 120;

/** The user's note line for automatic submissions as frozen at review time. */
export type SnapshotAutoNote = { enabled: boolean; text: string };

const UNSAFE_NOTE_CHARACTER = /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}{}]/u;

export type AutoNoteCheck = { ok: true; text: string } | { ok: false; message: string };

/**
 * Validates and normalizes the text of the note line: NFC form, trimmed, 1 to 120 characters, one
 * line, no control or format character (line and paragraph separators and bidirectional controls
 * included) and no brace, so the text is literal and can never be a template variable.
 */
export function checkAutoNoteText(raw: string): AutoNoteCheck {
  const text = raw.normalize('NFC').trim();
  const length = [...text].length;
  if (length < 1 || length > MAX_AUTO_NOTE_LENGTH) {
    return { ok: false, message: `The note text must have 1 to ${MAX_AUTO_NOTE_LENGTH} characters` };
  }
  if (UNSAFE_NOTE_CHARACTER.test(text)) {
    return { ok: false, message: 'The note text must be one line without control characters or braces' };
  }
  return { ok: true, text };
}

/** The note of a payload; a version 1 payload has none, so it reads as "off". */
export function autoNoteOf(snapshot: Pick<ReviewSnapshot, 'auto_note'>): SnapshotAutoNote {
  return snapshot.auto_note ?? { enabled: false, text: DEFAULT_AUTO_NOTE_TEXT };
}

/** The OT proposal for a complete day with a positive credit, from the engine's provisional credit. */
export type SnapshotOtProposal = {
  work_date: string;
  credited_minutes: number;
  eligible_minutes: number;
  policy_version_id: string;
};

export type SnapshotDeficitMode = 'ignore' | 'auto_deduct' | 'choose_at_signoff';

/** The engine's deficit decision for a day with a positive deficit (no manual choice yet). */
export type SnapshotDeficitProposal = {
  work_date: string;
  policy_version_id: string;
  mode: SnapshotDeficitMode;
  deficit_minutes: number;
  /** The engine decision: ignored, authorized, insufficient_balance or pending. */
  decision: string;
  debit_minutes: number;
  /** The available OT balance this decision was evaluated against (after earlier authorized debits). */
  available_minutes_before: number;
};

export type SnapshotSession = {
  id: string;
  start_utc: string;
  end_utc: string | null;
  source: string;
  breaks_confirmed: boolean;
  breaks: Array<{ start_utc: string; end_utc: string; counts_as_work: boolean }>;
};

export type SnapshotCalculation = {
  regular_minutes: number | null;
  nonworking_minutes: number | null;
  normal_excess_minutes: number | null;
  eligible_minutes: number | null;
  credited_minutes: number | null;
};

export type SnapshotDay = {
  work_date: string;
  day_class: string | null;
  day_class_reason: string | null;
  holiday_name: string | null;
  calendar_version_id: string | null;
  category: string | null;
  category_source: string;
  attendance_expected: boolean;
  wfh: boolean;
  notes: string;
  leave_minutes: number;
  leave_kind: string | null;
  ot_leave: { kind_minutes: number; consumed_minutes: number; reversed_minutes: number; mismatch: boolean };
  sessions: SnapshotSession[];
  /** The engine status (complete, incomplete, incomplete_breaks, no_records) or calculation_error. */
  completeness: string;
  policy_version_id: string | null;
  calculation: SnapshotCalculation | null;
  calculation_error: string | null;
};

export type SnapshotUnresolved = { work_date: string; reason: string; detail: string | null };

export type SnapshotReservation = {
  request_id: string;
  leave_date: string;
  approved_minutes: number;
  reserved_minutes: number;
  consumed_minutes: number;
  /** The leave date is on or before the last day of the reviewed period (E-3: "record use" is due). */
  use_due: boolean;
};

export type ReviewSnapshot = {
  schema: string;
  schema_version: number;
  employee: { name: string };
  period: {
    payroll_date: string;
    nominal_payroll_date: string;
    period_start: string;
    period_end: string;
    due_local_date: string;
    due_local_time: string;
    due_at_utc: string;
    is_exception: boolean;
  };
  reporting_zone: string;
  submission: { id: string; revision_no: number; sign_off_status: string };
  timesheet: { finalized_revision_no: number | null };
  calendar: { id: string; version_ids: string[] };
  policy: { version_ids: string[] };
  days: SnapshotDay[];
  totals: { credited_minutes: number; pending_days: number };
  ot_proposals: SnapshotOtProposal[];
  deficit_proposals: SnapshotDeficitProposal[];
  unresolved_inputs: SnapshotUnresolved[];
  ot_leave_reservations: SnapshotReservation[];
  recipients: {
    to: string[];
    cc: string[];
    subject: string;
    body_text: string;
    body_html: string;
    template_version: number;
  };
  /** The signature image reference (attachment and hash); never the bytes. */
  signature: { attachment_id: string; sha256: string } | null;
  /** The explicit automatic-image authorization at review time (docs/05). */
  auto_image: { authorized: boolean; attachment_id: string | null };
  /** The optional note line of an automatic submission (version 2); absent in a version 1 payload. */
  auto_note?: SnapshotAutoNote | undefined;
  show_ot_on_pdf: boolean;
};

const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

function sortedUnique(values: readonly string[], field: string): string[] {
  const set = new Set<string>();
  for (const value of values) {
    if (typeof value !== 'string' || value === '') throw new CanonicalError(`${field} must contain non-empty identifiers`, { field });
    set.add(value);
  }
  return [...set].sort(compareText);
}

function optionalMinutes(value: number | null, field: string): number | null {
  return value === null ? null : canonicalMinutes(value, field);
}

function normalizeDay(day: SnapshotDay): SnapshotDay {
  return {
    ...day,
    work_date: canonicalDate(day.work_date, 'days.work_date'),
    leave_minutes: canonicalMinutes(day.leave_minutes, 'days.leave_minutes'),
    ot_leave: {
      kind_minutes: canonicalMinutes(day.ot_leave.kind_minutes, 'days.ot_leave.kind_minutes'),
      consumed_minutes: canonicalMinutes(day.ot_leave.consumed_minutes, 'days.ot_leave.consumed_minutes'),
      reversed_minutes: canonicalMinutes(day.ot_leave.reversed_minutes, 'days.ot_leave.reversed_minutes'),
      mismatch: day.ot_leave.mismatch,
    },
    sessions: day.sessions
      .map((session) => ({
        ...session,
        start_utc: canonicalUtc(session.start_utc, 'sessions.start_utc'),
        end_utc: session.end_utc === null ? null : canonicalUtc(session.end_utc, 'sessions.end_utc'),
        breaks: session.breaks
          .map((item) => ({
            ...item,
            start_utc: canonicalUtc(item.start_utc, 'breaks.start_utc'),
            end_utc: canonicalUtc(item.end_utc, 'breaks.end_utc'),
          }))
          .sort((a, b) => compareText(a.start_utc, b.start_utc) || compareText(a.end_utc, b.end_utc)),
      }))
      .sort((a, b) => compareText(a.start_utc, b.start_utc) || compareText(a.id, b.id)),
    calculation:
      day.calculation === null
        ? null
        : {
            regular_minutes: optionalMinutes(day.calculation.regular_minutes, 'calculation.regular_minutes'),
            nonworking_minutes: optionalMinutes(day.calculation.nonworking_minutes, 'calculation.nonworking_minutes'),
            normal_excess_minutes: optionalMinutes(day.calculation.normal_excess_minutes, 'calculation.normal_excess_minutes'),
            eligible_minutes: optionalMinutes(day.calculation.eligible_minutes, 'calculation.eligible_minutes'),
            credited_minutes: optionalMinutes(day.calculation.credited_minutes, 'calculation.credited_minutes'),
          },
  };
}

/**
 * Validates every date, UTC instant and minute count and puts every set-like list in a
 * fixed order (days, proposals and reservations by date; identifiers sorted). The result is
 * the exact canonical payload; nothing is recalculated here.
 */
export function normalizeReviewSnapshot(input: ReviewSnapshot): ReviewSnapshot {
  if (
    input.schema !== SNAPSHOT_SCHEMA ||
    !Number.isInteger(input.schema_version) ||
    input.schema_version < OLDEST_READABLE_VERSION ||
    input.schema_version > SNAPSHOT_VERSION
  ) {
    throw new CanonicalError('Unknown snapshot schema');
  }
  const { auto_note: note, ...rest } = input;
  const byDate = <T extends { work_date: string }>(items: readonly T[]): T[] =>
    [...items].sort((a, b) => compareText(a.work_date, b.work_date));
  return {
    ...rest,
    ...normalizeAutoNote(input.schema_version, note),
    period: {
      ...input.period,
      payroll_date: canonicalDate(input.period.payroll_date, 'period.payroll_date'),
      nominal_payroll_date: canonicalDate(input.period.nominal_payroll_date, 'period.nominal_payroll_date'),
      period_start: canonicalDate(input.period.period_start, 'period.period_start'),
      period_end: canonicalDate(input.period.period_end, 'period.period_end'),
      due_local_date: canonicalDate(input.period.due_local_date, 'period.due_local_date'),
      due_at_utc: canonicalUtc(input.period.due_at_utc, 'period.due_at_utc'),
    },
    submission: { ...input.submission, revision_no: canonicalMinutes(input.submission.revision_no, 'submission.revision_no') },
    calendar: { ...input.calendar, version_ids: sortedUnique(input.calendar.version_ids, 'calendar.version_ids') },
    policy: { version_ids: sortedUnique(input.policy.version_ids, 'policy.version_ids') },
    days: byDate(input.days.map(normalizeDay)),
    totals: {
      credited_minutes: canonicalMinutes(input.totals.credited_minutes, 'totals.credited_minutes'),
      pending_days: canonicalMinutes(input.totals.pending_days, 'totals.pending_days'),
    },
    ot_proposals: byDate(
      input.ot_proposals.map((item) => ({
        ...item,
        work_date: canonicalDate(item.work_date, 'ot_proposals.work_date'),
        credited_minutes: canonicalMinutes(item.credited_minutes, 'ot_proposals.credited_minutes'),
        eligible_minutes: canonicalMinutes(item.eligible_minutes, 'ot_proposals.eligible_minutes'),
      })),
    ),
    deficit_proposals: byDate(
      input.deficit_proposals.map((item) => ({
        ...item,
        work_date: canonicalDate(item.work_date, 'deficit_proposals.work_date'),
        deficit_minutes: canonicalMinutes(item.deficit_minutes, 'deficit_proposals.deficit_minutes'),
        debit_minutes: canonicalMinutes(item.debit_minutes, 'deficit_proposals.debit_minutes'),
        // The available balance can be negative after a truthful correction (LG-08): a signed whole number.
        available_minutes_before: wholeNumber(item.available_minutes_before, 'deficit_proposals.available_minutes_before'),
      })),
    ),
    unresolved_inputs: [...input.unresolved_inputs]
      .map((item) => ({ ...item, work_date: canonicalDate(item.work_date, 'unresolved_inputs.work_date') }))
      .sort((a, b) => compareText(a.work_date, b.work_date) || compareText(a.reason, b.reason)),
    ot_leave_reservations: [...input.ot_leave_reservations]
      .map((item) => ({
        ...item,
        leave_date: canonicalDate(item.leave_date, 'ot_leave_reservations.leave_date'),
        approved_minutes: canonicalMinutes(item.approved_minutes, 'ot_leave_reservations.approved_minutes'),
        reserved_minutes: canonicalMinutes(item.reserved_minutes, 'ot_leave_reservations.reserved_minutes'),
        consumed_minutes: canonicalMinutes(item.consumed_minutes, 'ot_leave_reservations.consumed_minutes'),
      }))
      .sort((a, b) => compareText(a.leave_date, b.leave_date) || compareText(a.request_id, b.request_id)),
    recipients: {
      ...input.recipients,
      template_version: canonicalMinutes(input.recipients.template_version, 'recipients.template_version'),
    },
  };
}

/** Version 2 requires a valid note; a version 1 payload cannot carry one. Returns the field to add, if any. */
function normalizeAutoNote(version: number, note: SnapshotAutoNote | undefined): { auto_note?: SnapshotAutoNote } {
  if (version < 2) {
    if (note !== undefined) throw new CanonicalError('A version 1 snapshot has no automatic note', { field: 'auto_note' });
    return {};
  }
  if (note === undefined || typeof note.enabled !== 'boolean' || typeof note.text !== 'string') {
    throw new CanonicalError('auto_note must be an object with a flag and a text', { field: 'auto_note' });
  }
  const checked = checkAutoNoteText(note.text);
  if (!checked.ok || checked.text !== note.text) {
    throw new CanonicalError('auto_note.text must be a normalized one-line text of 1 to 120 characters', { field: 'auto_note.text' });
  }
  return { auto_note: { enabled: note.enabled, text: note.text } };
}

function wholeNumber(value: number, field: string): number {
  if (!Number.isSafeInteger(value)) throw new CanonicalError(`${field} must be a whole number`, { field });
  return value;
}

/** The payload as a canonical value (a type-level bridge for hashing and storage). */
export function snapshotValue(snapshot: ReviewSnapshot): CanonicalValue {
  return snapshot;
}

/** SHA-256 over the canonical bytes of the normalized payload (the "reviewed hash"). */
export function reviewSnapshotHash(snapshot: ReviewSnapshot): string {
  return canonicalHash(snapshotValue(normalizeReviewSnapshot(snapshot)));
}

/** The normalized payload together with its hash, computed once. */
export function sealReviewSnapshot(snapshot: ReviewSnapshot): { snapshot: ReviewSnapshot; sha256: string } {
  const normalized = normalizeReviewSnapshot(snapshot);
  return { snapshot: normalized, sha256: canonicalHash(snapshotValue(normalized)) };
}
