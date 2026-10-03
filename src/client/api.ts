/** Same-origin JSON calls; the session cookie is HttpOnly and never read by scripts. */

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
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
    const error = (data as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiRequestError(response.status, error?.code ?? 'error', error?.message ?? response.statusText);
  }
  return data as T;
}

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'employee';
}

export interface Period {
  payroll_date: string;
  period_start: string;
  period_end: string;
  due_local_date: string;
  due_local_time: string;
  due_at_utc: string;
  relation?: 'old' | 'current' | 'future';
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

export interface Calculation {
  status: 'complete' | 'incomplete' | 'incomplete_breaks' | 'no_records';
  regular_minutes: number | null;
  nonworking_minutes: number | null;
  eligible_minutes: number | null;
  credited_minutes: number | null;
}

export interface DayView {
  work_date: string;
  classification: { day_class: 'normal' | 'nonworking'; reason: string; name: string | null } | null;
  category: string | null;
  sessions: Session[];
  calculation: Calculation | null;
  calculation_error: string | null;
  deficit_minutes: number | null;
}

export interface TimesheetView {
  reporting_zone: string;
  period: Period;
  current_payroll_date: string;
  reason_required: boolean;
  days: DayView[];
  totals: { provisional_credited_minutes: number; pending_days: number };
}
