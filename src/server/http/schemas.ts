import { z } from 'zod';

/*
 * Request contracts. Objects are strict: unknown fields such as user_id or owner are
 * rejected, so ownership always comes from the authenticated session.
 */

const reason = z.string().max(1000).optional();

/** A UTC instant string (`…Z`) or local wall time in an explicit IANA input zone. */
export const instantInput = z.union([
  z.string().max(40),
  z.strictObject({
    local: z.string().max(25),
    zone: z.string().max(64),
    fold: z.union([z.literal(0), z.literal(1)]).nullable().optional(),
    offset: z.string().max(6).nullable().optional(),
  }),
]);
export type InstantInput = z.infer<typeof instantInput>;

export const breakInput = z.strictObject({
  start: instantInput,
  end: instantInput,
  counts_as_work: z.boolean(),
});
export type BreakInput = z.infer<typeof breakInput>;

export const loginBody = z.strictObject({
  email: z.string().max(254),
  password: z.string().max(256),
});

export const sessionBody = z.strictObject({
  start: instantInput,
  end: instantInput.nullable(),
  input_zone: z.string().max(64),
  breaks: z.array(breakInput).max(20),
  breaks_confirmed: z.boolean(),
  reason,
});
export type SessionBody = z.infer<typeof sessionBody>;

export const sessionUpdateBody = z.strictObject({
  start: instantInput,
  end: instantInput.nullable(),
  input_zone: z.string().max(64),
  breaks: z.array(breakInput).max(20),
  breaks_confirmed: z.boolean(),
  expected_version: z.number().int().positive(),
  reason,
});
export type SessionUpdateBody = z.infer<typeof sessionUpdateBody>;

export const deleteBody = z.strictObject({
  expected_version: z.number().int().positive(),
  reason,
});
export type DeleteBody = z.infer<typeof deleteBody>;

/** Labels a day can carry; there is no OT-funded category (owner decision E-2). */
const dayCategory = z.enum(['Worked', 'Off', 'Vacation', 'Sick', 'Holiday', 'Shutdown']);
/** What the day's leave minutes are; the kind never reserves or spends OT. */
const leaveKind = z.enum(['vacation', 'sick', 'ot']);

export const dayEntryBody = z.strictObject({
  category: dayCategory,
  leave_minutes: z.number().int().min(0).max(1440),
  /** Required when leave_minutes > 0 and absent or null without leave. */
  leave_kind: leaveKind.nullable().optional(),
  wfh: z.boolean(),
  notes: z.string().max(2000),
  /** Required when the entry exists; omit or null to create it. */
  expected_version: z.number().int().positive().nullable().optional(),
  reason,
});
export type DayEntryBody = z.infer<typeof dayEntryBody>;

/** Maximum dates in one batch: a little more than a full pay period of weeks. */
export const MAX_DAY_BATCH_ENTRIES = 62;

/**
 * One date of a batch. Omitted fields keep the existing entry's value (or the neutral
 * default for a date without an entry); the category is always explicit.
 */
export const dayBatchEntry = z.strictObject({
  work_date: z.string().max(10),
  category: dayCategory,
  leave_minutes: z.number().int().min(0).max(1440).optional(),
  leave_kind: leaveKind.nullable().optional(),
  wfh: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
  /** The entry version the caller saw; omit or null for a date without an entry. */
  expected_version: z.number().int().positive().nullable().optional(),
});
export type DayBatchEntry = z.infer<typeof dayBatchEntry>;

export const dayBatchBody = z.strictObject({
  mode: z.enum(['preview', 'commit']),
  entries: z.array(dayBatchEntry).min(1).max(MAX_DAY_BATCH_ENTRIES),
  /** One reason for the whole commit; required when any date is old or finalized (R-07). */
  reason,
  /** Must be true to commit dates whose recorded work conflicts with the new label. */
  confirm_conflicts: z.boolean().optional(),
});
export type DayBatchBody = z.infer<typeof dayBatchBody>;

export const clockInBody = z.strictObject({
  input_zone: z.string().max(64),
  reason,
});
export type ClockInBody = z.infer<typeof clockInBody>;

export const clockOutBody = z.strictObject({
  /**
   * The session's complete actual break set. When present it replaces the saved rows,
   * confirmed or not (an empty list clears them). Omit it only for an unconfirmed Clock
   * out, which keeps the saved rows and leaves the breaks unknown (R-01, R-02).
   */
  breaks: z.array(breakInput).max(20).optional(),
  breaks_confirmed: z.boolean(),
  /** Version of the running session as last loaded; a mismatch is 409 stale_version. */
  expected_version: z.number().int().positive(),
  reason,
});
export type ClockOutBody = z.infer<typeof clockOutBody>;

export const policyBody = z.strictObject({
  effective_from: z.string().max(10),
  // Numeric semantics (whole minutes, ranges) are checked by the domain for exact error codes.
  required_minutes: z.number(),
  threshold_minutes: z.number(),
  rounding_step_minutes: z.number(),
  reference_start: z.string().max(5),
  reference_end: z.string().max(5),
  breaks: z
    .array(
      z.strictObject({
        start_offset_minutes: z.number(),
        duration_minutes: z.number(),
        counts_as_work: z.boolean(),
      }),
    )
    .max(10),
  deficit_mode: z.enum(['ignore', 'auto_deduct', 'choose_at_signoff']),
  note: z.string().max(500).optional(),
});
export type PolicyBody = z.infer<typeof policyBody>;

/*
 * OT leave contracts. The owner is never a field: it is always the session user.
 * Numeric semantics (whole minutes 1–1440) are checked by the domain for exact codes.
 */

export const otLeaveCreateBody = z.strictObject({
  request_key: z.string().max(200),
  leave_date: z.string().max(10),
  requested_minutes: z.number(),
  approved_minutes: z.number().optional(),
  permission: z.strictObject({
    approver_name: z.string().max(200),
    approver_identity: z.string().max(320).nullable().optional(),
    approval_date: z.string().max(10),
    /** E-7: a text reference to the permission evidence. */
    evidence_ref: z.string().max(2000),
  }),
  note: z.string().max(2000).nullable().optional(),
});
export type OtLeaveCreateBody = z.infer<typeof otLeaveCreateBody>;

export const otLeaveConsumeBody = z.strictObject({
  use_key: z.string().max(200),
  minutes: z.number(),
  expected_version: z.number().int().positive(),
});
export type OtLeaveConsumeBody = z.infer<typeof otLeaveConsumeBody>;

export const otLeaveCancelBody = z.strictObject({
  expected_version: z.number().int().positive(),
  reason: z.string().max(2000).optional(),
});
export type OtLeaveCancelBody = z.infer<typeof otLeaveCancelBody>;

export const otLeaveReverseBody = z.strictObject({
  reversal_key: z.string().max(200),
  minutes: z.number(),
  reason: z.string().max(2000),
  expected_version: z.number().int().positive(),
});
export type OtLeaveReverseBody = z.infer<typeof otLeaveReverseBody>;

/* User administration (WP2-T07, E-11). The password is the admin-set temporary one and is never echoed. */
const userRole = z.enum(['admin', 'employee']);
const accountDisplayName = z.string().max(120);

export const adminUserCreateBody = z.strictObject({
  email: z.string().max(254),
  display_name: accountDisplayName,
  role: userRole,
  password: z.string().max(256),
  calendar_id: z.string().min(1).max(64),
});

export const adminUserUpdateBody = z
  .strictObject({
    display_name: accountDisplayName.optional(),
    role: userRole.optional(),
    calendar_id: z.string().min(1).max(64).optional(),
  })
  .refine((body) => body.display_name !== undefined || body.role !== undefined || body.calendar_id !== undefined, {
    message: 'Provide at least one of display_name, role or calendar_id',
  });

export const adminUserStatusBody = z.strictObject({ reason: z.string().max(1000).optional() });

/*
 * Calendar administration (WP2-T08). The holiday CSV travels as one string field inside the
 * 64 KB body limit; the parser enforces rows, names and dates. Dates are checked by the domain.
 */
const holidayImportShape = {
  calendar_id: z.string().min(1).max(64),
  year: z.number().int().min(2000).max(2100),
  effective_from: z.string().max(10),
  csv: z.string().max(50_000),
  /** Dates to drop from the calendar; a date the CSV does not list is otherwise kept (E-4). */
  remove_dates: z.array(z.string().max(10)).max(500).optional(),
};

export const holidayImportPreviewBody = z.strictObject(holidayImportShape);
export type HolidayImportPreviewBody = z.infer<typeof holidayImportPreviewBody>;

export const holidayImportCommitBody = z.strictObject({
  ...holidayImportShape,
  /** The hash returned by the matching preview. */
  preview_hash: z.string().regex(/^[0-9a-f]{64}$/),
  note: z.string().max(500).optional(),
});
export type HolidayImportCommitBody = z.infer<typeof holidayImportCommitBody>;

export const adminPayrollExceptionBody = z.strictObject({
  calendar_id: z.string().min(1).max(64),
  nominal_payroll_date: z.string().max(10),
  payroll_date: z.string().max(10),
  due_local_date: z.string().max(10).nullable().optional(),
  due_local_time: z.string().max(5).nullable().optional(),
  /** Required and non-blank; checked by the service for a precise error code. */
  reason: z.string().max(1000),
});

/*
 * Submission settings (WP3-T03). The owner is never a field. Address and template
 * semantics (syntax, bounds, unknown variables) are checked by the domain for exact codes.
 */
const addressList = z.array(z.string().max(320)).max(40);

export const submissionSettingsBody = z.strictObject({
  /** The seq of the version the caller saw (0 before the first save); a mismatch is 409 stale_version. */
  expected_seq: z.number().int().min(0),
  to: addressList,
  cc: addressList.optional(),
  subject_template: z.string().max(600).optional(),
  body_template: z.string().max(12_000).optional(),
  auto_submit: z.boolean(),
  /** Explicit choice: let an auto-submit change also cover already-overdue drafts. */
  apply_to_overdue_drafts: z.boolean().optional(),
  show_ot_on_pdf: z.boolean().optional(),
  reminder_offsets_minutes: z.array(z.number().int().min(1).max(20_160)).max(5).optional(),
});
export type SubmissionSettingsBody = z.infer<typeof submissionSettingsBody>;

export const submissionPreviewBody = z.strictObject({
  subject_template: z.string().max(600).optional(),
  body_template: z.string().max(12_000).optional(),
  sign_off: z.enum(['signed', 'review_pending']).optional(),
});

export const autoImageAuthorizeBody = z.strictObject({
  expected_seq: z.number().int().min(0),
  signature_attachment_id: z.string().min(1).max(64),
});

export const autoImageRevokeBody = z.strictObject({
  expected_seq: z.number().int().min(0),
});

/*
 * Manual sign-off (WP3-T05). The owner is never a field: it comes from the session. The
 * reviewed hash and expected version bind the request to the review the employee saw.
 */
const signoffShape = {
  /** The timesheet version the review was read at (0 when the period had no saved row). */
  expected_version: z.number().int().min(0),
  reviewed_hash: z.string().regex(/^[0-9a-f]{64}$/),
  signer_name: z.string().max(400),
  /** One deduct/waive choice per choose-mode deficit day (a 14-day period has at most 14). */
  deficit_choices: z.array(z.strictObject({ work_date: z.string().max(10), choice: z.enum(['deduct', 'waive']) })).max(31).optional(),
  /** Required when the review lists unresolved inputs. */
  incomplete_evidence_acknowledged: z.boolean().optional(),
};

export const signoffBody = z.strictObject(signoffShape);
export type SignoffBody = z.infer<typeof signoffBody>;

/*
 * Revisions after the first finalization (WP3-T06). The sign-off fields bind the request to
 * the review the employee saw; `send_email` is an explicit choice with no default, so an
 * edit never silently resends. A correction needs a reason (checked by the service for the
 * exact code); a late review of an automatic revision takes none.
 */
export const correctionRevisionBody = z.strictObject({
  ...signoffShape,
  reason: z.string().max(4000),
  send_email: z.boolean(),
});
export type CorrectionRevisionBody = z.infer<typeof correctionRevisionBody>;

export const lateReviewBody = z.strictObject({
  ...signoffShape,
  send_email: z.boolean(),
});
export type LateReviewBody = z.infer<typeof lateReviewBody>;

/** Optional echo of the envelope the caller expects; any difference needs a new revision (409). */
export const resendBody = z.strictObject({
  to: addressList.optional(),
  cc: addressList.optional(),
  template_version: z.number().int().min(1).optional(),
});
export type ResendBody = z.infer<typeof resendBody>;
