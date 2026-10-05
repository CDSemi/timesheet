import type { ReviewSnapshot } from '../domain/snapshot.ts';

/** Same-origin JSON calls; the session cookie is HttpOnly and never read by scripts. */

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  /** The server's `error.details` (for example the conflicts of a refused batch), when sent. */
  readonly details: Record<string, unknown> | undefined;

  constructor(status: number, code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: Record<string, unknown> };
}

export async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method, credentials: 'same-origin' };
  if (body !== undefined) {
    init.headers = { 'content-type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const response = await fetch(path, init);
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (data as ErrorBody | null)?.error;
    throw new ApiRequestError(response.status, error?.code ?? 'error', error?.message ?? response.statusText, error?.details);
  }
  return data as T;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'employee';
}

/**
 * A request to an API route written relative to `/api` (for example `/periods/current`). The own
 * requester goes to the caller's own data; a shared requester goes to `/api/shared/:ownerId` for one
 * owner, so a screen cannot reach another person's data by any other path.
 */
export type Requester = <T>(method: string, path: string, body?: unknown) => Promise<T>;

export const ownRequest: Requester = (method, path, body) => api(method, `/api${path}`, body);

/**
 * A requester for one owner's shared timesheets. A refusal is passed to `onRefused` before it is
 * thrown again, so the caller can find out (from the server) whether the share has ended.
 */
export function sharedRequest(ownerId: string, onRefused: (caught: unknown) => Promise<void>): Requester {
  return async (method, path, body) => {
    try {
      return await api(method, `/api/shared/${encodeURIComponent(ownerId)}${path}`, body);
    } catch (caught) {
      if (caught instanceof ApiRequestError && (caught.status === 404 || caught.status === 403)) await onRefused(caught);
      throw caught;
    }
  };
}

export type PeriodRelation = 'old' | 'current' | 'future';

export interface Period {
  payroll_date: string;
  period_start: string;
  period_end: string;
  due_local_date: string;
  due_local_time: string;
  due_at_utc: string;
  relation?: PeriodRelation;
}

export interface CurrentPeriods {
  reporting_zone: string;
  today_local: string;
  current: Period;
  in_progress: Period;
}

export interface CalendarWarning {
  code: string;
  year: number;
  warn_from: string;
  message: string;
}

export interface Session {
  id: string;
  work_date: string;
  start_utc: string;
  end_utc: string | null;
  input_zone: string;
  source: 'manual' | 'clock';
  breaks_confirmed: boolean;
  version: number;
  breaks: Array<{ id: string; start_utc: string; end_utc: string; counts_as_work: boolean }>;
}

export type CalculationStatus = 'complete' | 'incomplete' | 'incomplete_breaks' | 'no_records';

export interface Calculation {
  status: CalculationStatus;
  provisional: boolean;
  policy_version_id: string;
  gross_seconds: number;
  excluded_break_seconds: number;
  regular_seconds: number;
  nonworking_seconds: number;
  regular_minutes: number | null;
  nonworking_minutes: number | null;
  normal_excess_minutes: number | null;
  eligible_minutes: number | null;
  credited_minutes: number | null;
  segments: Array<{ local_date: string; day_class: 'normal' | 'nonworking'; reason: string; calendar_version_id: string; seconds: number }>;
}

export type DayCategory = 'Worked' | 'Off' | 'Vacation' | 'Sick' | 'Holiday' | 'Shutdown';
export type CategorySource = 'default' | 'explicit';
export type LeaveKind = 'vacation' | 'sick' | 'ot';

export interface DayEntry {
  id: string;
  work_date: string;
  category: DayCategory;
  category_source: CategorySource;
  leave_minutes: number;
  leave_kind: LeaveKind | null;
  wfh: boolean;
  notes: string;
  version: number;
}

export interface DayView {
  work_date: string;
  classification: { day_class: 'normal' | 'nonworking'; reason: string; name: string | null; calendar_version_id?: string } | null;
  default_category: DayCategory | null;
  category: DayCategory | null;
  category_source: CategorySource;
  attendance_expected: boolean;
  leave_minutes: number;
  leave_kind: LeaveKind | null;
  wfh: boolean;
  ot_leave: { kind_minutes: number; consumed_minutes: number; reversed_minutes: number; mismatch: boolean };
  /** The stored day entry, or null while the day only has its calendar default. */
  entry: DayEntry | null;
  sessions: Session[];
  calculation: Calculation | null;
  calculation_error: string | null;
  deficit_minutes: number | null;
  edit: { period_relation: PeriodRelation; reason_required: boolean };
}

export interface TimesheetView {
  reporting_zone: string;
  period: Period;
  current_payroll_date: string;
  timesheet: { id: string | null; version: number; finalized: boolean };
  reason_required: boolean;
  days: DayView[];
  totals: { provisional_credited_minutes: number; pending_days: number };
}

export interface OtSummary {
  posted_minutes: number;
  reserved_minutes: number;
  available_minutes: number;
  negative: boolean;
  reconciliation_required: boolean;
  provisional_minutes: number;
  provisional_periods: Array<{
    payroll_date: string;
    period_start: string;
    period_end: string;
    credited_minutes: number;
    complete_days: number;
    pending_days: number;
  }>;
}

/** One date of POST /api/days/batch; omitted fields keep the existing entry's value. */
export interface DayBatchEntry {
  work_date: string;
  category: DayCategory;
  leave_minutes?: number;
  leave_kind?: LeaveKind | null;
  wfh?: boolean;
  notes?: string;
  /** The entry version the caller saw; omit or null for a date without an entry. */
  expected_version?: number | null;
}

export interface DayBatchRequest {
  mode: 'preview' | 'commit';
  entries: DayBatchEntry[];
  /** One reason for the whole commit; required when any date is old or finalized. */
  reason?: string;
  /** Must be true to commit dates whose recorded work conflicts with the new label. */
  confirm_conflicts?: boolean;
}

export interface BatchConflict {
  work_date: string;
  session_count: number;
  clock_session_count: number;
  open_session_count: number;
  session_ids: string[];
  current_category: DayCategory | null;
  new_category: DayCategory;
}

export interface DayBatchPreview {
  mode: 'preview';
  can_commit: boolean;
  changed_count: number;
  reason_required: boolean;
  reason_required_dates: string[];
  requires_conflict_confirmation: boolean;
  conflicts: BatchConflict[];
  entries: Array<{
    work_date: string;
    status: 'create' | 'update' | 'unchanged' | 'stale' | 'invalid';
    current_version: number | null;
    period_relation: PeriodRelation;
    reason_required: boolean;
    conflict: boolean;
    before: DayEntry | null;
    after: {
      category: DayCategory;
      category_source: 'explicit';
      leave_minutes: number;
      leave_kind: LeaveKind | null;
      wfh: boolean;
      notes: string;
    };
    error: { code: string; message: string; details: Record<string, unknown> } | null;
  }>;
}

export interface DayBatchResult {
  mode: 'commit';
  changed: string[];
  unchanged: string[];
  days: DayView[];
}

/** A local wall time in an explicit IANA zone; the server resolves it (R-07). */
export interface LocalInstantInput {
  local: string;
  zone: string;
  /** 0 = earlier, 1 = later instant of a repeated (DST fold) local time. */
  fold?: 0 | 1 | null;
  /** An explicit UTC offset such as `-07:00`, valid for that local time in the zone. */
  offset?: string | null;
}

export interface BreakRequest {
  start: LocalInstantInput;
  end: LocalInstantInput;
  counts_as_work: boolean;
}

/** Body of POST /api/days/:date/sessions; PUT /api/sessions/:id adds `expected_version`. */
export interface SessionRequest {
  start: LocalInstantInput;
  end: LocalInstantInput | null;
  input_zone: string;
  breaks: BreakRequest[];
  breaks_confirmed: boolean;
  expected_version?: number;
  reason?: string;
}

export interface SessionResponse {
  session: Session;
  day: DayView;
}

/** Body of POST /api/clock/out; an omitted `breaks` keeps the saved rows (unconfirmed only). */
export interface ClockOutRequest {
  breaks?: BreakRequest[];
  breaks_confirmed: boolean;
  expected_version: number;
  reason?: string;
}

/** Body of PUT /api/days/:date; `expected_version` is null for a date without an entry. */
export interface DayEntryRequest {
  category: DayCategory;
  leave_minutes: number;
  leave_kind: LeaveKind | null;
  wfh: boolean;
  notes: string;
  expected_version: number | null;
  reason?: string;
}

export interface PolicyBreak {
  start_offset_minutes: number;
  duration_minutes: number;
  counts_as_work: boolean;
}

export type DeficitMode = 'ignore' | 'auto_deduct' | 'choose_at_signoff';

export interface PolicyVersion {
  id: string;
  seq: number;
  effective_from: string;
  required_minutes: number;
  threshold_minutes: number;
  rounding_step_minutes: number;
  reference_start: string;
  reference_end: string;
  breaks: PolicyBreak[];
  deficit_mode?: DeficitMode;
  note?: string | null;
  created_at?: string;
}

/** Body of POST /api/policies and POST /api/policies/preview (the same checks, the preview writes nothing). */
export interface PolicyRequest {
  effective_from: string;
  required_minutes: number;
  threshold_minutes: number;
  rounding_step_minutes: number;
  reference_start: string;
  reference_end: string;
  breaks: PolicyBreak[];
  deficit_mode: DeficitMode;
  note?: string;
}

export type PolicyMinuteField = 'regular_minutes' | 'nonworking_minutes' | 'normal_excess_minutes' | 'eligible_minutes' | 'credited_minutes';
export type PolicyMinutes = Record<PolicyMinuteField, number | null>;

/** The draft days a proposed policy version would change; the server computes before and after. */
export interface PolicyPreview {
  effective_from: string;
  days: Array<{
    work_date: string;
    period_relation: PeriodRelation;
    changed: PolicyMinuteField[];
    before: PolicyMinutes;
    after: PolicyMinutes;
  }>;
}

/** An account as the admin routes return it: account fields only, never a password or personal data. */
export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'employee';
  status: 'active' | 'deactivated';
  calendar_id: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUserCreateRequest {
  email: string;
  display_name: string;
  role: 'admin' | 'employee';
  password: string;
  calendar_id: string;
}

export interface AdminUserUpdateRequest {
  display_name?: string;
  role?: 'admin' | 'employee';
  calendar_id?: string;
}

export interface CalendarInfo {
  id: string;
  name: string;
  reporting_zone: string;
  payroll: { cycle_days: number; anchor_payroll_date: string };
  payroll_exceptions: Array<{
    nominal_payroll_date: string;
    payroll_date: string;
    due_local_date: string | null;
    due_local_time: string | null;
  }>;
  /** E-12: the server decides when next year's calendar dates are missing. */
  warnings: CalendarWarning[];
}

export interface HolidayImportRequest {
  calendar_id: string;
  year: number;
  effective_from: string;
  csv: string;
  remove_dates: string[];
}

export interface HolidayRule {
  date: string;
  kind: string;
  name: string;
}

export interface HolidayChange {
  date: string;
  before: { name: string; kind: string };
  after: { name: string; kind: string };
}

export interface HolidayImportPreview {
  can_commit: boolean;
  preview_hash: string | null;
  no_change: boolean;
  earliest_effective_from: string;
  issues: Array<{ line: number; code: string; message: string; field?: string; value?: string }>;
  issue_count: number;
  removal_problems: unknown[];
  effective_from_problem: { code: string; message: string } | null;
  finalized_conflicts: Array<{ date: string }>;
  diff: {
    added: HolidayRule[];
    renamed: HolidayChange[];
    kind_changed: HolidayChange[];
    removed: HolidayRule[];
    unchanged_count: number;
    kept: HolidayRule[];
    ignored_past: HolidayRule[];
  };
  result_date_count: number;
  affected_days: Array<{
    date: string;
    label_before: string | null;
    label_after: string | null;
  }>;
}

export interface HolidayImportResult {
  committed: boolean;
  unchanged: boolean;
  version: { id: string; seq: number; effective_from: string };
  preview_hash: string;
}

export interface PayrollExceptionRequest {
  calendar_id: string;
  nominal_payroll_date: string;
  payroll_date: string;
  due_local_date?: string | null;
  due_local_time?: string | null;
  reason: string;
}

/**
 * The administrator operations status (F-3, F-Q3 (b)): pipeline states, redacted fault codes and
 * recipient addresses. By contract it carries no timesheet detail, template or message content.
 */
export interface OperationsStatus {
  sender: { configured: boolean | null; outbound_mode: 'capture' | 'smtp' | 'unknown' };
  runner: { heartbeat_at: string | null; state: 'never' | 'running' | 'stale' };
  activation: { active_from: string | null; recorded_at: string | null; recorded_by: string | null };
  jobs: Record<'queued' | 'leased' | 'succeeded' | 'intervention' | 'cancelled', number>;
  deliveries: Record<'preparing' | 'sending' | 'accepted' | 'failed_temporary' | 'failed_permanent' | 'uncertain', number>;
}

export type DeliveryAttemptState = keyof OperationsStatus['deliveries'];
export type SendJobState = keyof OperationsStatus['jobs'];

export interface RecipientAddresses {
  to: string[];
  cc: string[];
}

export interface SubmissionStatus {
  user_id: string;
  display_name: string;
  period: { payroll_date: string; period_start: string; period_end: string; due_at: string };
  revision: { no: number; origin: 'employee' | 'deadline'; review_state: 'pending' | 'signed'; finalized_at: string; send_requested: boolean };
  pdf: { state: 'pending' | 'ready' | 'failed' | 'none'; fault_code: string | null };
  delivery: {
    state: DeliveryAttemptState | 'none';
    attempts: number;
    accepted_at: string | null;
    fault_code: string | null;
    decision_required: boolean;
    job_state: SendJobState | 'none';
    job_fault_code: string | null;
  };
  recipients: { effective: RecipientAddresses; frozen: RecipientAddresses | null };
}

/** The balance block of every OT response; the server computes it, the client never does. */
export interface OtBalance {
  posted_minutes: number;
  reserved_minutes: number;
  available_minutes: number;
  negative: boolean;
  reconciliation_required: boolean;
}

/** One OT leave request with its counters (GET /api/ot/leave); `version` guards every action. */
export interface OtLeaveRequest {
  id: string;
  request_key: string;
  leave_date: string;
  requested_minutes: number;
  approved_minutes: number;
  reserved_minutes: number;
  consumed_minutes: number;
  released_minutes: number;
  reversed_minutes: number;
  /** Used minutes that a reversal may still give back. */
  reversible_minutes: number;
  approver_name: string;
  approver_identity: string | null;
  approval_date: string;
  /** E-7: a text reference to the permission evidence (no files in WP2). */
  evidence_ref: string;
  approval_origin: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface OtLedgerEntry {
  id: string;
  entry_type: 'credit' | 'deficit_debit' | 'correction' | 'leave_consumption' | 'leave_reversal';
  delta_minutes: number;
  source_key: string;
  work_date: string | null;
  origin: string;
  reason: string | null;
  reconciliation_required: boolean;
  posted_at: string;
}

/** Body of POST /api/ot/leave. */
export interface OtReserveRequest {
  request_key: string;
  leave_date: string;
  requested_minutes: number;
  permission: { approver_name: string; approval_date: string; evidence_ref: string; approver_identity?: string | null };
  note?: string | null;
}

/** One of the caller's own audit events (GET /api/history); snapshots are the stored before/after. */
export interface HistoryEvent {
  id: string;
  occurred_at: string;
  operation: string;
  entity_type: string;
  entity_id: string | null;
  reason: string | null;
  actor_is_self: boolean;
  /** True for an event the owner's grantee performed while holding an active share (FR-17). */
  via_share: boolean;
  /** The grantee's display name for such an event; null for every other event. */
  actor_display_name: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export interface HistoryPage {
  audit_events: HistoryEvent[];
  /** Per-user cursor for the next older page, or null at the end. */
  next_before: string | null;
}

/*
 * Review and submission (WP3). The review payload is the server's frozen snapshot type: the
 * client shows its values and computes no business minutes from them.
 */

/** GET /api/timesheets/:payrollDate/review: the exact payload, its SHA-256 and the version it was read at. */
export interface ReviewResponse {
  payload: ReviewSnapshot;
  payload_hash: string;
  expected_version: number;
}

export interface RevisionSummary {
  id: string;
  revision_no: number;
  revision_kind: 'original' | 'correction' | 'late_review';
  /** `deadline` is the automatic submission at the due time. */
  origin: 'employee' | 'deadline';
  review_state: 'pending' | 'signed';
  correction_reason: string | null;
  send_requested: boolean;
  created_at: string;
  /** The revision this one replaced (a correction or a late review); null for the first revision. */
  supersedes_revision_id?: string | null;
}

/** One row of GET /api/revisions (and of the shared mount): status metadata only, newest period first. */
export interface RevisionListItem {
  id: string;
  payroll_date: string;
  revision_no: number;
  revision_kind: 'original' | 'correction' | 'late_review';
  /** `deadline` is the automatic submission at the due time. */
  origin: 'employee' | 'deadline';
  review_state: 'pending' | 'signed';
  supersedes_revision_id: string | null;
  finalized_at: string;
  /** The stored PDF state; null while no PDF row exists yet. */
  pdf_state: 'pending' | 'ready' | 'failed' | null;
  /** The state of the latest delivery attempt; null before any attempt. */
  delivery_state: DeliveryAttemptState | null;
}

export interface FinalizationJob {
  id: string;
  kind: string;
  state: string;
}

/** GET /api/timesheets/:payrollDate/finalization and the body of a sign-off response (plus `status`). */
export interface FinalizationResponse {
  payroll_date: string;
  finalized_revision_no: number | null;
  revision: RevisionSummary | null;
  signoff: { signer_name: string; signed_at: string } | null;
  ledger_lines: Array<{ work_date: string | null; line_kind: string; proposed_minutes: number; outcome: string }>;
  jobs: FinalizationJob[];
}

export interface SignOffResponse extends Omit<FinalizationResponse, 'payroll_date'> {
  status: 'created' | 'replayed';
}

/** One delivery attempt (GET /api/deliveries, newest first). */
export interface DeliveryAttempt {
  id: string;
  revision_id: string | null;
  attempt_no: number;
  state: 'preparing' | 'sending' | 'accepted' | 'failed_temporary' | 'failed_permanent' | 'uncertain';
  decision: 'mark_delivered' | 'resend' | 'abandon' | null;
  decision_required: boolean;
  job: { state: string; last_error: string | null };
}

/**
 * One delivery attempt with the owner's frozen envelope (GET /api/deliveries). The server redacts
 * provider data and never sends the message body, the PDF or a credential.
 */
export interface DeliveryRecord extends DeliveryAttempt {
  job_id: string;
  revision_no: number | null;
  payroll_date: string | null;
  channel: string;
  to: string[];
  cc: string[];
  subject: string | null;
  provider_response: string | null;
  accepted_at: string | null;
  decided_at: string | null;
  started_at: string;
  updated_at: string;
}

/** POST /api/deliveries/:id/decision and POST /api/revisions/:id/resend: what the server answers. */
export type DeliveryDecisionChoice = 'mark_delivered' | 'resend';

/*
 * Submission settings and the signature image (WP3). The server owns every rule (recipient
 * limits, template variables, the note text); these types only describe what it sends.
 */

export interface SubmissionSettings {
  /** Null for the defaults a user sees before the first save (seq 0, is_default). */
  id: string | null;
  seq: number;
  is_default: boolean;
  recipients: RecipientAddresses;
  subject_template: string;
  body_template: string;
  template_version: number;
  variables: string[];
  auto_submit: boolean;
  auto_submit_effective_from: string | null;
  /** The audited authorization to print this signature image on automatic submissions. */
  auto_image: { authorized: boolean; signature_attachment_id: string | null; authorized_at: string | null };
  auto_note: { enabled: boolean; text: string };
  show_ot_on_pdf: boolean;
  reminder_offsets_minutes: number[];
  created_at: string | null;
}

/** Body of POST /api/settings/submission; omitted optional fields keep the saved value. */
export interface SubmissionSettingsRequest {
  expected_seq: number;
  to: string[];
  cc: string[];
  subject_template: string;
  body_template: string;
  auto_submit: boolean;
  apply_to_overdue_drafts?: boolean;
  auto_note_enabled: boolean;
  auto_note_text?: string;
  show_ot_on_pdf: boolean;
}

/** POST /api/settings/submission/preview: the caller's subject and body with sample values. */
export interface SubmissionPreview {
  sample: true;
  sign_off: 'manual' | 'automatic';
  values: Record<string, string>;
  subject: string;
  text_body: string;
  html_body: string;
  recipients: RecipientAddresses;
  template_version: number;
}

export interface SignatureMetadata {
  id: string;
  mime_type: 'image/png' | 'image/jpeg';
  size_bytes: number;
  width_px: number;
  height_px: number;
  sha256: string;
  created_at: string;
}

/** The answer of POST /api/signatures; `settings` is present only when the upload authorized the image. */
export interface SignatureUploadResult {
  signature: SignatureMetadata;
  settings?: SubmissionSettings;
}

/** The error a failed response stands for, with the server's own code and message. */
export async function requestFailure(response: Response): Promise<ApiRequestError> {
  const data: unknown = await response.json().catch(() => null);
  const error = (data as ErrorBody | null)?.error;
  return new ApiRequestError(response.status, error?.code ?? 'error', error?.message ?? response.statusText, error?.details);
}

/**
 * Uploads the signature image as the raw body (the one route that is not JSON). The consent flag is
 * always sent explicitly, so the server records the audited authorization only when it is `true`,
 * in the same transaction as the upload.
 */
export async function uploadSignature(file: Blob, authorizeAutoImage: boolean): Promise<SignatureUploadResult> {
  const query = `authorize_auto_image=${authorizeAutoImage ? 'true' : 'false'}`;
  const response = await fetch(`/api/signatures?${query}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': file.type },
    body: file,
  });
  if (!response.ok) throw await requestFailure(response);
  return (await response.json()) as SignatureUploadResult;
}

/*
 * Sharing (FR-17, WP3-T13B). The server owns every rule (who may grant, what an item allows); these
 * types only describe what it sends. The caller never sends an owner id for its own shares.
 */

export type TimesheetsScope = 'none' | 'view' | 'edit';

/** The three per-item switches of a share, as the API names them. */
export interface ShareItems {
  timesheets: TimesheetsScope;
  ot_read: boolean;
  pdf_download: boolean;
}

/** A share the caller gave: the grantee's name and address are shown to the owner only. */
export interface GivenShare {
  id: string;
  grantee: { display_name: string; email: string; active: boolean };
  items: ShareItems;
  created_at: string;
}

/** A share the caller received: `owner.id` is the `:ownerId` of the `/api/shared` paths. */
export interface ReceivedShare {
  id: string;
  owner: { id: string; display_name: string; email: string };
  items: ShareItems;
  created_at: string;
}

export interface SharesResponse {
  given: GivenShare[];
  received: ReceivedShare[];
}
