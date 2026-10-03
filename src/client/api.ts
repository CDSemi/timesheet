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
}
