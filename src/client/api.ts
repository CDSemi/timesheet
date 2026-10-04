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
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

export interface HistoryPage {
  audit_events: HistoryEvent[];
  /** Per-user cursor for the next older page, or null at the end. */
  next_before: string | null;
}
