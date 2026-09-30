/**
 * Machine-readable domain error codes. These English strings are API contracts;
 * the fixture files use the same codes for expected errors.
 */
export type DomainErrorCode =
  | 'invalid_date'
  | 'invalid_instant'
  | 'invalid_local_time'
  | 'invalid_time_zone'
  | 'nonexistent_local_time'
  | 'ambiguous_local_time'
  | 'offset_mismatch'
  | 'invalid_minutes'
  | 'invalid_required_minutes'
  | 'invalid_threshold_minutes'
  | 'invalid_rounding_step'
  | 'invalid_clock_time'
  | 'invalid_break_rule'
  | 'overlapping_break_rules'
  | 'break_rule_outside_reference'
  | 'inconsistent_reference_schedule'
  | 'invalid_deficit_mode'
  | 'end_not_after_start'
  | 'break_outside_session'
  | 'overlapping_breaks'
  | 'overlapping_user_intervals'
  | 'invalid_calendar_version'
  | 'calendar_missing'
  | 'policy_missing'
  | 'invalid_payroll_schedule'
  | 'invalid_payroll_exception'
  | 'unknown_payroll_date';

export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(code: DomainErrorCode, message?: string, details?: Record<string, unknown>) {
    super(message ?? code);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
