import { readFileSync } from 'node:fs';
import { expect } from 'vitest';
import { isDomainError } from '../../src/domain/errors.ts';

/** Loads a canonical fixture file from /reference/fixtures (never copied into tests). */
export function loadFixture<T>(name: string): T {
  return JSON.parse(readFileSync(new URL(`../../reference/fixtures/${name}`, import.meta.url), 'utf8')) as T;
}

/** Asserts that `action` throws a DomainError with the given semantic code. */
export function expectDomainError(action: () => unknown, code: string): void {
  let thrown: unknown;
  try {
    action();
  } catch (error) {
    thrown = error;
  }
  expect(thrown, `expected DomainError ${code}`).toBeDefined();
  expect(isDomainError(thrown), `expected a DomainError, got ${String(thrown)}`).toBe(true);
  if (isDomainError(thrown)) expect(thrown.code).toBe(code);
}

export interface FixtureBreak {
  start_utc: string;
  end_utc: string;
  counts_as_work: boolean;
  confirmed: boolean;
}

export interface FixtureSession {
  start_utc: string;
  end_utc: string | null;
  breaks: FixtureBreak[];
}

export interface TimeDefaults {
  reporting_zone: string;
  normal_weekdays_iso: number[];
  holidays: string[];
  required_minutes: number;
  threshold_minutes: number;
  rounding_step_minutes: number;
  breaks_confirmed: boolean;
}

interface CaseBase {
  id: string;
}

export interface IntervalCase extends CaseBase {
  kind: 'interval_calculation' | 'incomplete' | 'incomplete_breaks';
  input: {
    work_date: string;
    sessions: FixtureSession[];
    breaks_confirmed?: boolean;
    category?: string;
    attendance_expected?: boolean;
  };
  expected: {
    regular_minutes?: number;
    nonworking_minutes?: number;
    eligible_minutes?: number;
    credited_minutes: number | null;
    calculation_status?: string;
    ledger_events?: number;
  };
}

export interface ValidationCase extends CaseBase {
  kind: 'validation';
  input: { records?: Array<FixtureSession & { work_date: string }>; sessions?: FixtureSession[] };
  expected_error: string;
}

export interface LocalResolutionCase extends CaseBase {
  kind: 'local_time_resolution';
  input: { local: string; zone: string; fold: 0 | 1 | null };
  expected?: { utc: string; offset: string };
  expected_error?: string;
}

export interface DisplayCase extends CaseBase {
  kind: 'display';
  input: { instant_utc: string; work_date: string; zones: string[] };
  expected: { local_by_zone: Record<string, string>; work_date: string };
}

export interface PayPeriodCase extends CaseBase {
  kind: 'pay_period';
  input: { payroll_date: string; due_local_time: string };
  expected: { period_start: string; period_end: string; due_local_date: string; due_at_utc: string };
}

export interface EditReasonCase extends CaseBase {
  kind: 'edit_reason';
  input: {
    now_utc: string;
    anchor_payroll_date: string;
    cycle_days: number;
    target_payroll_date: string;
    finalized: boolean;
  };
  expected: { current_payroll_date: string; reason_required: boolean };
}

export type TimeCase =
  | IntervalCase
  | ValidationCase
  | LocalResolutionCase
  | DisplayCase
  | PayPeriodCase
  | EditReasonCase;

export interface TimeFixtureFile {
  schema_version: number;
  defaults: TimeDefaults;
  cases: TimeCase[];
}

export interface OvertimePolicyFixture {
  required_minutes: number;
  threshold_minutes: number;
  rounding_step_minutes: number;
}

export interface OvertimeFixtureFile {
  default_policy: OvertimePolicyFixture & { threshold_comparison: string; rounding_mode: string };
  cases: Array<{
    id: string;
    input: { regular_minutes: number; nonworking_minutes: number; policy_override?: Partial<OvertimePolicyFixture> };
    expected: { normal_excess_minutes: number; eligible_minutes: number; credited_minutes: number };
  }>;
  daily_separation_cases: Array<{
    id: string;
    days: Array<{ work_date: string; regular_minutes: number; nonworking_minutes: number }>;
    expected: { daily_credited_minutes: number[]; period_credited_minutes: number };
  }>;
  invalid_policy_cases: Array<{ id: string; input: OvertimePolicyFixture; expected_error: string }>;
}

export interface DeficitFixtureInput {
  required_minutes: number;
  regular_minutes: number | null;
  nonworking_minutes: number;
  leave_minutes: number;
  category: string;
  normal_work_date: boolean;
  attendance_expected: boolean;
  records_complete: boolean;
  finalization_origin: 'manual' | 'automatic';
  available_minutes: number;
  mode: 'ignore' | 'auto_deduct' | 'choose_at_signoff';
  manual_choice?: 'deduct' | 'ignore';
}

export interface LedgerFixtureFile {
  deficit_defaults: Omit<DeficitFixtureInput, 'mode' | 'manual_choice'>;
  deficit_cases: Array<{
    id: string;
    input: Partial<DeficitFixtureInput> & { mode: DeficitFixtureInput['mode'] };
    expected: { deficit_minutes: number | null; debit_minutes: number; decision: string };
  }>;
  ledger_scenarios: Array<{ id: string }>;
}
