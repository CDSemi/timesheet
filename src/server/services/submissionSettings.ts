import { randomUUID } from 'node:crypto';
import {
  DEFAULT_BODY_TEMPLATE,
  DEFAULT_SUBJECT_TEMPLATE,
  EmailTemplateError,
  normalizeRecipients,
  renderHtmlBody,
  renderSubject,
  renderTextBody,
  signOffStatusText,
  type SubmissionOrigin,
  TEMPLATE_VARIABLES,
  type TemplateValues,
  validateBodyTemplate,
  validateSubjectTemplate,
} from '../../domain/emailTemplate.ts';
import { currentPayPeriod } from '../../domain/periods.ts';
import { checkAutoNoteText, DEFAULT_AUTO_NOTE_TEXT } from '../../domain/snapshot.ts';
import type { SessionUser } from '../auth/sessions.ts';
import { type Clock, nowUtc } from '../clock.ts';
import { type Db, writeTransaction } from '../db/database.ts';
import { ApiError, notFound, staleVersion } from '../http/errors.ts';
import { recordAudit } from './audit.ts';
import { loadScope, todayInReportingZone } from './timesheets.ts';

/*
 * Per-user submission settings (docs/04 Email and Settings, docs/05 Deadline and recovery).
 *
 * Versions are append-only: every change inserts a new `submission_settings` row with the
 * next `seq`; the highest seq is current and earlier rows are never touched (the schema
 * refuses UPDATE and DELETE). Every lookup is scoped to the session user, so another
 * user's version or attachment id is indistinguishable from a missing one (404).
 *
 * Auto-submit: a change records its effective instant. By default that is "now", so a
 * change applies to periods that are not yet due and never to already-overdue drafts;
 * applying it to overdue drafts is an explicit choice. The per-user effective instant is
 * only stored here; the system-wide activation (F-4) is not implemented in this module.
 *
 * Auto-image: authorizing an unsigned automatic submission to carry a signature image is a
 * separate, explicit and audited act that references one immutable signature attachment of
 * the same user; it is off by default and revoking it is audited as well. Neither act is a
 * review event.
 *
 * Automatic note line (WP3-T07B): two more fields of the same versions, a switch (default off)
 * and a one-line text (default "Automatic submission", validated by the domain). Omitted fields
 * keep the current values. The audit event records the before and after of those two fields; the
 * text is the user's own label, not timesheet data. {SignOffStatus} comes from one domain
 * function (signOffStatusText) for the preview, the review payload and the automatic snapshot.
 *
 * Audit records carry flags, counts and identifiers (and the two note fields): never an
 * address, a template text or an image.
 */

/** Immutable rows cannot be deleted, so the number of versions per user is bounded. */
export const MAX_SETTINGS_VERSIONS_PER_USER = 500;

/** Default reminder offsets before the due instant: 24 hours and 2 hours (docs/04). */
export const DEFAULT_REMINDER_OFFSETS_MINUTES: readonly number[] = [1440, 120];

/** The effective instant of an auto-submit change that is explicitly applied to overdue drafts. */
export const APPLY_TO_OVERDUE_EFFECTIVE_FROM = '1970-01-01T00:00:00Z';

export interface SubmissionSettings {
  /** Null for the default view of a user who never saved settings (seq 0). */
  id: string | null;
  seq: number;
  isDefault: boolean;
  recipientsTo: string[];
  recipientsCc: string[];
  subjectTemplate: string;
  bodyTemplate: string;
  templateVersion: number;
  autoSubmit: boolean;
  /** Periods whose due instant is on or after this instant follow `autoSubmit`; null on the default view. */
  autoSubmitEffectiveFrom: string | null;
  autoImageAuthorized: boolean;
  autoImageAttachmentId: string | null;
  autoImageAuthorizedAt: string | null;
  /** Whether an automatic submission's PDF and email show the note line. */
  autoNoteEnabled: boolean;
  autoNoteText: string;
  showOtOnPdf: boolean;
  reminderOffsetsMinutes: number[];
  createdAt: string | null;
}

interface SettingsRow {
  id: string;
  seq: number;
  recipients_to: string;
  recipients_cc: string;
  subject_template: string;
  body_template: string;
  template_version: number;
  auto_submit: number;
  auto_submit_effective_from: string;
  auto_image_authorized: number;
  auto_image_attachment_id: string | null;
  auto_image_authorized_at: string | null;
  auto_note_enabled: number;
  auto_note_text: string;
  show_ot_on_pdf: number;
  reminder_offsets_minutes: string;
  created_at: string;
}

function fromRow(row: SettingsRow): SubmissionSettings {
  return {
    id: row.id,
    seq: row.seq,
    isDefault: false,
    recipientsTo: JSON.parse(row.recipients_to) as string[],
    recipientsCc: JSON.parse(row.recipients_cc) as string[],
    subjectTemplate: row.subject_template,
    bodyTemplate: row.body_template,
    templateVersion: row.template_version,
    autoSubmit: row.auto_submit === 1,
    autoSubmitEffectiveFrom: row.auto_submit_effective_from,
    autoImageAuthorized: row.auto_image_authorized === 1,
    autoImageAttachmentId: row.auto_image_attachment_id,
    autoImageAuthorizedAt: row.auto_image_authorized_at,
    autoNoteEnabled: row.auto_note_enabled === 1,
    autoNoteText: row.auto_note_text,
    showOtOnPdf: row.show_ot_on_pdf === 1,
    reminderOffsetsMinutes: JSON.parse(row.reminder_offsets_minutes) as number[],
    createdAt: row.created_at,
  };
}

/** What a user who never saved settings sees (nothing is stored until the first save). */
function defaultSettings(): SubmissionSettings {
  return {
    id: null,
    seq: 0,
    isDefault: true,
    recipientsTo: [],
    recipientsCc: [],
    subjectTemplate: DEFAULT_SUBJECT_TEMPLATE,
    bodyTemplate: DEFAULT_BODY_TEMPLATE,
    templateVersion: 1,
    autoSubmit: true,
    autoSubmitEffectiveFrom: null,
    autoImageAuthorized: false,
    autoImageAttachmentId: null,
    autoImageAuthorizedAt: null,
    autoNoteEnabled: false,
    autoNoteText: DEFAULT_AUTO_NOTE_TEXT,
    showOtOnPdf: true,
    reminderOffsetsMinutes: [...DEFAULT_REMINDER_OFFSETS_MINUTES],
    createdAt: null,
  };
}

export function submissionSettingsJson(settings: SubmissionSettings) {
  return {
    id: settings.id,
    seq: settings.seq,
    is_default: settings.isDefault,
    recipients: { to: settings.recipientsTo, cc: settings.recipientsCc },
    subject_template: settings.subjectTemplate,
    body_template: settings.bodyTemplate,
    template_version: settings.templateVersion,
    variables: [...TEMPLATE_VARIABLES],
    auto_submit: settings.autoSubmit,
    auto_submit_effective_from: settings.autoSubmitEffectiveFrom,
    auto_image: {
      authorized: settings.autoImageAuthorized,
      signature_attachment_id: settings.autoImageAttachmentId,
      authorized_at: settings.autoImageAuthorizedAt,
    },
    auto_note: { enabled: settings.autoNoteEnabled, text: settings.autoNoteText },
    show_ot_on_pdf: settings.showOtOnPdf,
    reminder_offsets_minutes: settings.reminderOffsetsMinutes,
    created_at: settings.createdAt,
  };
}

function latestRow(db: Db, userId: string): SettingsRow | undefined {
  return db.prepare<[string], SettingsRow>('SELECT * FROM submission_settings WHERE user_id = ? ORDER BY seq DESC LIMIT 1').get(userId);
}

/** The newest stored version, or null when the user never saved settings. */
export function currentSubmissionSettings(db: Db, userId: string): SubmissionSettings | null {
  const row = latestRow(db, userId);
  return row === undefined ? null : fromRow(row);
}

/** The newest stored version, or the defaults (seq 0) when none was saved. */
export function submissionSettingsOrDefault(db: Db, userId: string): SubmissionSettings {
  return currentSubmissionSettings(db, userId) ?? defaultSettings();
}

/** All of the caller's versions, newest first. */
export function listSubmissionSettingsVersions(db: Db, userId: string): SubmissionSettings[] {
  return db
    .prepare<[string], SettingsRow>('SELECT * FROM submission_settings WHERE user_id = ? ORDER BY seq DESC')
    .all(userId)
    .map(fromRow);
}

/** One of the caller's own versions; another user's id is "not found". */
export function getSubmissionSettingsVersion(db: Db, userId: string, id: string): SubmissionSettings {
  const row = db.prepare<[string, string], SettingsRow>('SELECT * FROM submission_settings WHERE id = ? AND user_id = ?').get(id, userId);
  if (row === undefined) throw notFound('Settings version');
  return fromRow(row);
}

/** Maps a pure-domain validation failure to the HTTP 422 contract. */
function validation<T>(work: () => T): T {
  try {
    return work();
  } catch (error) {
    if (error instanceof EmailTemplateError) {
      throw new ApiError(422, error.code, error.message, error.details === undefined ? undefined : { ...error.details });
    }
    throw error;
  }
}

function normalizeOffsets(offsets: readonly number[]): number[] {
  return [...new Set(offsets)].sort((a, b) => b - a);
}

/** Flags, counts, identifiers and the two note fields only: no address, template text or image (canonical audit boundary). */
function auditSummary(settings: SubmissionSettings) {
  return {
    seq: settings.seq,
    template_version: settings.templateVersion,
    recipients_to_count: settings.recipientsTo.length,
    recipients_cc_count: settings.recipientsCc.length,
    auto_submit: settings.autoSubmit,
    auto_submit_effective_from: settings.autoSubmitEffectiveFrom,
    auto_image_authorized: settings.autoImageAuthorized,
    auto_image_attachment_id: settings.autoImageAttachmentId,
    auto_note_enabled: settings.autoNoteEnabled,
    auto_note_text: settings.autoNoteText,
    show_ot_on_pdf: settings.showOtOnPdf,
    reminder_offsets_minutes: settings.reminderOffsetsMinutes,
  };
}

interface NewVersion {
  recipientsTo: string[];
  recipientsCc: string[];
  subjectTemplate: string;
  bodyTemplate: string;
  templateVersion: number;
  autoSubmit: boolean;
  autoSubmitEffectiveFrom: string;
  autoImageAttachmentId: string | null;
  autoImageAuthorizedAt: string | null;
  autoNoteEnabled: boolean;
  autoNoteText: string;
  showOtOnPdf: boolean;
  reminderOffsetsMinutes: number[];
}

/** Appends one version and its audit event; call inside the caller's write transaction. */
function appendVersion(
  db: Db,
  clock: Clock,
  userId: string,
  previous: SubmissionSettings | null,
  next: NewVersion,
  operation: string,
  extra: Record<string, unknown>,
): SubmissionSettings {
  const existing = db.prepare<[string], { total: number }>('SELECT count(*) AS total FROM submission_settings WHERE user_id = ?').get(userId);
  if ((existing?.total ?? 0) >= MAX_SETTINGS_VERSIONS_PER_USER) {
    throw new ApiError(422, 'settings_version_limit_reached', 'The maximum number of stored settings versions has been reached');
  }
  const id = randomUUID();
  const seq = (previous?.seq ?? 0) + 1;
  const createdAt = nowUtc(clock);
  db.prepare(
    `INSERT INTO submission_settings
       (id, user_id, seq, recipients_to, recipients_cc, subject_template, body_template, template_version,
        auto_submit, auto_submit_effective_from, auto_image_authorized, auto_image_attachment_id,
        auto_image_authorized_at, auto_note_enabled, auto_note_text, show_ot_on_pdf, reminder_offsets_minutes,
        created_by, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    userId,
    seq,
    JSON.stringify(next.recipientsTo),
    JSON.stringify(next.recipientsCc),
    next.subjectTemplate,
    next.bodyTemplate,
    next.templateVersion,
    next.autoSubmit ? 1 : 0,
    next.autoSubmitEffectiveFrom,
    next.autoImageAttachmentId === null ? 0 : 1,
    next.autoImageAttachmentId,
    next.autoImageAuthorizedAt,
    next.autoNoteEnabled ? 1 : 0,
    next.autoNoteText,
    next.showOtOnPdf ? 1 : 0,
    JSON.stringify(next.reminderOffsetsMinutes),
    userId,
    createdAt,
  );
  const created: SubmissionSettings = {
    id,
    seq,
    isDefault: false,
    recipientsTo: next.recipientsTo,
    recipientsCc: next.recipientsCc,
    subjectTemplate: next.subjectTemplate,
    bodyTemplate: next.bodyTemplate,
    templateVersion: next.templateVersion,
    autoSubmit: next.autoSubmit,
    autoSubmitEffectiveFrom: next.autoSubmitEffectiveFrom,
    autoImageAuthorized: next.autoImageAttachmentId !== null,
    autoImageAttachmentId: next.autoImageAttachmentId,
    autoImageAuthorizedAt: next.autoImageAuthorizedAt,
    autoNoteEnabled: next.autoNoteEnabled,
    autoNoteText: next.autoNoteText,
    showOtOnPdf: next.showOtOnPdf,
    reminderOffsetsMinutes: next.reminderOffsetsMinutes,
    createdAt,
  };
  recordAudit(db, clock, {
    actorUserId: userId,
    ownerUserId: userId,
    operation,
    entityType: 'submission_settings',
    entityId: id,
    before: previous === null ? null : auditSummary(previous),
    after: { ...auditSummary(created), ...extra },
  });
  return created;
}

/** A new version that keeps every field of `base`. */
function carry(base: SubmissionSettings): NewVersion {
  return {
    recipientsTo: base.recipientsTo,
    recipientsCc: base.recipientsCc,
    subjectTemplate: base.subjectTemplate,
    bodyTemplate: base.bodyTemplate,
    templateVersion: base.templateVersion,
    autoSubmit: base.autoSubmit,
    autoSubmitEffectiveFrom: base.autoSubmitEffectiveFrom ?? APPLY_TO_OVERDUE_EFFECTIVE_FROM,
    autoImageAttachmentId: base.autoImageAttachmentId,
    autoImageAuthorizedAt: base.autoImageAuthorizedAt,
    autoNoteEnabled: base.autoNoteEnabled,
    autoNoteText: base.autoNoteText,
    showOtOnPdf: base.showOtOnPdf,
    reminderOffsetsMinutes: base.reminderOffsetsMinutes,
  };
}

export interface SaveSettingsInput {
  expectedSeq: number;
  to: string[];
  cc?: string[] | undefined;
  subjectTemplate?: string | undefined;
  bodyTemplate?: string | undefined;
  autoSubmit: boolean;
  applyToOverdueDrafts?: boolean | undefined;
  /** The automatic note line switch and text; omitted keeps the current values (default off, "Automatic submission"). */
  autoNoteEnabled?: boolean | undefined;
  autoNoteText?: string | undefined;
  showOtOnPdf?: boolean | undefined;
  reminderOffsetsMinutes?: number[] | undefined;
}

/**
 * Appends a settings version for `userId`. Omitted optional fields keep the previous value
 * (the defaults for a first save); the auto-image authorization is never changed here.
 */
export function saveSubmissionSettings(db: Db, clock: Clock, userId: string, input: SaveSettingsInput): SubmissionSettings {
  const recipients = validation(() => normalizeRecipients(input.to, input.cc ?? []));
  // The note text is normalized (NFC, trimmed) and validated before anything is written.
  let autoNoteText: string | undefined;
  if (input.autoNoteText !== undefined) {
    const checked = checkAutoNoteText(input.autoNoteText);
    if (!checked.ok) throw new ApiError(422, 'invalid_auto_note', checked.message);
    autoNoteText = checked.text;
  }
  return writeTransaction(db, () => {
    const previous = currentSubmissionSettings(db, userId);
    if ((previous?.seq ?? 0) !== input.expectedSeq) throw staleVersion();
    const base = previous ?? defaultSettings();
    const subjectTemplate = input.subjectTemplate ?? base.subjectTemplate;
    const bodyTemplate = input.bodyTemplate ?? base.bodyTemplate;
    validation(() => {
      validateSubjectTemplate(subjectTemplate);
      validateBodyTemplate(bodyTemplate);
    });
    const templateChanged = subjectTemplate !== base.subjectTemplate || bodyTemplate !== base.bodyTemplate;
    const autoNoteEnabled = input.autoNoteEnabled ?? base.autoNoteEnabled;
    const nextAutoNoteText = autoNoteText ?? base.autoNoteText;
    const autoNoteChanged = autoNoteEnabled !== base.autoNoteEnabled || nextAutoNoteText !== base.autoNoteText;

    // The auto-submit instant moves only when the switch itself changes (or on the first
    // save). By default a change takes effect now, which covers periods not yet due.
    const autoChanged = previous === null || previous.autoSubmit !== input.autoSubmit;
    if (input.applyToOverdueDrafts === true && !autoChanged) {
      throw new ApiError(422, 'apply_to_overdue_requires_change', 'Applying to overdue drafts only applies when auto-submit changes');
    }
    const autoSubmitEffectiveFrom = autoChanged
      ? input.applyToOverdueDrafts === true
        ? APPLY_TO_OVERDUE_EFFECTIVE_FROM
        : nowUtc(clock)
      : (previous.autoSubmitEffectiveFrom ?? nowUtc(clock));

    const next: NewVersion = {
      ...carry(base),
      recipientsTo: recipients.to,
      recipientsCc: recipients.cc,
      subjectTemplate,
      bodyTemplate,
      templateVersion: previous === null ? 1 : base.templateVersion + (templateChanged ? 1 : 0),
      autoSubmit: input.autoSubmit,
      autoSubmitEffectiveFrom,
      autoNoteEnabled,
      autoNoteText: nextAutoNoteText,
      showOtOnPdf: input.showOtOnPdf ?? base.showOtOnPdf,
      reminderOffsetsMinutes: normalizeOffsets(input.reminderOffsetsMinutes ?? base.reminderOffsetsMinutes),
    };
    return appendVersion(db, clock, userId, previous, next, 'submission_settings.update', {
      template_changed: previous === null || templateChanged,
      auto_submit_changed: autoChanged,
      auto_note_changed: autoNoteChanged,
      applies_to_overdue_drafts: autoChanged && input.applyToOverdueDrafts === true,
    });
  });
}

/**
 * The explicit, audited authorization to include one of the caller's own immutable
 * signature images on automatic (unsigned) submissions. Another user's attachment, a
 * non-signature attachment and an unknown id are all "not found".
 */
export function authorizeAutoImage(
  db: Db,
  clock: Clock,
  userId: string,
  input: { expectedSeq: number; signatureAttachmentId: string },
): SubmissionSettings {
  return writeTransaction(db, () => authorizeWithin(db, clock, userId, input.signatureAttachmentId, input.expectedSeq));
}

/**
 * The same explicit, audited authorization inside the caller's own write transaction, for the
 * signature upload that asks for it (owner decision G-Q1 (b)): the new image and its
 * authorization are one atomic act, so a failure here also rolls back the upload. There is no
 * `expected_seq`: the consent names the image being uploaded and applies to the settings version
 * current inside the transaction. Saved settings must exist (422 `submission_settings_required`).
 */
export function authorizeAutoImageInTransaction(db: Db, clock: Clock, userId: string, signatureAttachmentId: string): SubmissionSettings {
  return authorizeWithin(db, clock, userId, signatureAttachmentId, null);
}

function authorizeWithin(db: Db, clock: Clock, userId: string, signatureAttachmentId: string, expectedSeq: number | null): SubmissionSettings {
  const previous = currentSubmissionSettings(db, userId);
  if (expectedSeq !== null && (previous?.seq ?? 0) !== expectedSeq) throw staleVersion();
  if (previous === null) {
    throw new ApiError(422, 'submission_settings_required', 'Save the submission settings before authorizing the signature image');
  }
  const attachment = db
    .prepare<[string, string], { id: string; sha256: string }>(
      "SELECT id, sha256 FROM attachments WHERE id = ? AND user_id = ? AND kind = 'signature'",
    )
    .get(signatureAttachmentId, userId);
  if (attachment === undefined) throw notFound('Signature');
  if (previous.autoImageAttachmentId === attachment.id) {
    throw new ApiError(409, 'already_authorized', 'This signature image is already authorized for automatic submissions');
  }
  return appendVersion(
    db,
    clock,
    userId,
    previous,
    { ...carry(previous), autoImageAttachmentId: attachment.id, autoImageAuthorizedAt: nowUtc(clock) },
    'submission_settings.auto_image_authorize',
    { signature_sha256: attachment.sha256, replaces_attachment_id: previous.autoImageAttachmentId },
  );
}

/** Revokes the automatic-image authorization (audited); a no-op revocation is refused. */
export function revokeAutoImage(db: Db, clock: Clock, userId: string, input: { expectedSeq: number }): SubmissionSettings {
  return writeTransaction(db, () => {
    const previous = currentSubmissionSettings(db, userId);
    if ((previous?.seq ?? 0) !== input.expectedSeq) throw staleVersion();
    if (previous === null || !previous.autoImageAuthorized) {
      throw new ApiError(409, 'not_authorized', 'No signature image is authorized for automatic submissions');
    }
    return appendVersion(
      db,
      clock,
      userId,
      previous,
      { ...carry(previous), autoImageAttachmentId: null, autoImageAuthorizedAt: null },
      'submission_settings.auto_image_revoke',
      { revoked_attachment_id: previous.autoImageAttachmentId },
    );
  });
}

/** The origin the preview renders {SignOffStatus} for; only the system tracks it, the text may not reveal it. */
export type PreviewSignOff = SubmissionOrigin;

export interface SubmissionPreview {
  signOff: PreviewSignOff;
  values: TemplateValues;
  subject: string;
  textBody: string;
  htmlBody: string;
  recipientsTo: string[];
  recipientsCc: string[];
  templateVersion: number;
}

/**
 * Renders the caller's own subject and body with sample values for the current pay period.
 * Read-only: nothing is written (the pay-period row is not materialized), and an unsaved
 * template draft is validated with the same rules as a save.
 */
export function previewSubmission(
  db: Db,
  clock: Clock,
  user: Pick<SessionUser, 'id' | 'displayName' | 'calendarId'>,
  draft: { subjectTemplate?: string | undefined; bodyTemplate?: string | undefined; signOff?: PreviewSignOff | undefined },
): SubmissionPreview {
  const settings = submissionSettingsOrDefault(db, user.id);
  const scope = loadScope(db, user);
  const period = currentPayPeriod(scope.calendar.schedule, todayInReportingZone(clock, scope), scope.exceptions);
  const signOff = draft.signOff ?? 'manual';
  const values: TemplateValues = {
    EmployeeName: user.displayName,
    PeriodStart: period.periodStart,
    PeriodEnd: period.periodEnd,
    PayrollDate: period.payrollDate,
    SignOffStatus: signOffStatusText(signOff, { enabled: settings.autoNoteEnabled, text: settings.autoNoteText }),
    SubmissionId: 'PREVIEW',
    Revision: '1',
  };
  const subjectTemplate = draft.subjectTemplate ?? settings.subjectTemplate;
  const bodyTemplate = draft.bodyTemplate ?? settings.bodyTemplate;
  return validation(() => ({
    signOff,
    values,
    subject: renderSubject(subjectTemplate, values),
    textBody: renderTextBody(bodyTemplate, values),
    htmlBody: renderHtmlBody(bodyTemplate, values),
    recipientsTo: settings.recipientsTo,
    recipientsCc: settings.recipientsCc,
    templateVersion: settings.templateVersion,
  }));
}

export function previewJson(preview: SubmissionPreview) {
  return {
    sample: true,
    sign_off: preview.signOff,
    values: preview.values,
    subject: preview.subject,
    text_body: preview.textBody,
    html_body: preview.htmlBody,
    recipients: { to: preview.recipientsTo, cc: preview.recipientsCc },
    template_version: preview.templateVersion,
  };
}
