import { isCivilDate } from '../domain/dates.ts';
import { formatDuration } from '../domain/format.ts';
import {
  ApiRequestError,
  type ImportBatch,
  type ImportDayReason,
  type ImportDecision,
  type ImportDecisionAction,
  type ImportDecisionItem,
  type ImportPeriodState,
  type ImportPlan,
  type OtLedgerEntry,
} from './api.ts';

/*
 * Pure display logic for the workbook import and the opening-balance screens (WP4-T11). The server owns every rule:
 * what a workbook cell maps to, which actions a conflict allows, what a commit writes and how a balance is posted.
 * This module only decides what to offer, how to word the server's codes and how to read the form's signed minutes.
 * The one sum here, the balance a pending entry would lead to, is a preview for the confirmation step: the server
 * computes and returns the real balance after the post.
 */

export const XLSX_FILE_EXTENSION = '.xlsx';

/** The server's route-scoped upload limit (the reader's package limit, WP4-T09). */
export const IMPORT_MAX_BYTES = 2 * 1024 * 1024;
const IMPORT_MAX_TEXT = '2 MiB';

/** The server's technical bound on an opening balance (WP4-T10), in minutes. */
export const OPENING_MAX_MINUTES = 100_000_000;
const OPENING_MAX_HOURS = Math.floor(OPENING_MAX_MINUTES / 60);
const MAX_TEXT_LENGTH = 2000;

/** The status of a period imported from a workbook, and why its edit, sign and submit controls are disabled. */
export const IMPORTED_STATUS_TEXT = 'Imported, unverified';
export const IMPORTED_PERIOD_REASON = 'Imported history is read-only: it cannot be edited, signed or submitted.';

const GENERIC_FAILURE = 'The request failed. Check the connection and try again.';

/* ---- Upload --------------------------------------------------------------------- */

/** Why a chosen file cannot be uploaded, or null. A courtesy: the server checks the type, the size and the content. */
export function workbookFileProblem(file: { name: string; size: number }): string | null {
  if (!file.name.toLowerCase().endsWith(XLSX_FILE_EXTENSION)) {
    return `Choose an ${XLSX_FILE_EXTENSION} workbook. Macro-enabled (.xlsm), older (.xls) and other formats are not accepted.`;
  }
  if (file.size === 0) return 'The file is empty.';
  if (file.size > IMPORT_MAX_BYTES) {
    const mib = (file.size / (1024 * 1024)).toFixed(1);
    return `The file is ${mib} MiB; the limit is ${IMPORT_MAX_TEXT}.`;
  }
  return null;
}

/* ---- Labels --------------------------------------------------------------------- */

const REASON_TEXT: Record<ImportDayReason, string> = {
  finalized_period: 'The period is already finalized in the app and is never overwritten.',
  imported_period: 'The period was already imported and is never overwritten.',
  existing_app_rows: 'The period already has timesheet rows in the app and is never merged.',
  period_not_in_calendar: 'The period is not one of your calendar periods.',
  period_not_ended: 'The period has not ended yet, so it is not history.',
  period_not_due: 'The period has ended but its payroll deadline has not passed, so it is still open for you to sign.',
  unknown_label: 'The day label is not one the template uses.',
  unsupported_label: 'The label has no single day category, so it cannot be imported.',
  date_cell_missing: 'The date cell is blank, so the date cannot be confirmed.',
  date_unexpected: 'The date cell does not match the expected date of this slot.',
  duplicate_date: 'The date appears more than once in the workbook.',
  outside_calendar: 'The date is outside the calendar the app knows.',
  floating_holiday: 'A floating holiday: its date changes year to year, so confirm it.',
  label_from_formula_cache: 'The label comes from a formula result that was not recalculated, so confirm it.',
};

export function reasonText(reason: ImportDayReason): string {
  return REASON_TEXT[reason];
}

const PERIOD_STATE_TEXT: Record<ImportPeriodState, string> = {
  new: 'Ready to import',
  existing_app_rows: 'Has app rows, skipped',
  finalized: 'Finalized, skipped',
  imported: 'Already imported',
  not_in_calendar: 'Not a calendar period, skipped',
  not_ended: 'Not ended yet, skipped',
  not_due: 'Deadline not passed, skipped',
};

export function periodStateText(state: ImportPeriodState): string {
  return PERIOD_STATE_TEXT[state];
}

export function batchStateText(state: ImportBatch['state']): string {
  return state === 'committed' ? 'Committed' : 'Preview, not committed';
}

/**
 * The ledger entry as the OT views name it. Only the opening balance and its corrections have their own
 * wording; every other entry keeps its stored type in plain words.
 */
export function ledgerEntryLabel(entry: Pick<OtLedgerEntry, 'entry_type' | 'source_key'>): string {
  if (entry.entry_type === 'opening_balance') return 'Opening balance';
  if (entry.entry_type === 'correction' && entry.source_key.startsWith('opening_balance:correction:')) return 'Opening balance correction';
  return entry.entry_type.replaceAll('_', ' ');
}

/* ---- Decisions ------------------------------------------------------------------ */

/** The actions to offer for a conflicting day: skip always comes first, and import only when the server lists it. */
export function allowedActions(item: Pick<ImportDecisionItem, 'allowed_actions'>): ImportDecisionAction[] {
  return item.allowed_actions.includes('import') && item.allowed_actions.includes('skip') ? ['skip', 'import'] : ['skip'];
}

/** The default is to import nothing for a conflicting day. */
export function defaultDecisions(plan: ImportPlan | null): Record<string, ImportDecisionAction> {
  const decisions: Record<string, ImportDecisionAction> = {};
  for (const item of plan?.decisions_required ?? []) decisions[item.work_date] = 'skip';
  return decisions;
}

/** A choice for one day; an action the day does not allow leaves the decisions as they were (same object). */
export function chooseAction(
  decisions: Readonly<Record<string, ImportDecisionAction>>,
  item: Pick<ImportDecisionItem, 'work_date' | 'allowed_actions'>,
  action: ImportDecisionAction,
): Record<string, ImportDecisionAction> {
  if (!allowedActions(item).includes(action)) return decisions as Record<string, ImportDecisionAction>;
  return { ...decisions, [item.work_date]: action };
}

/** The commit body's decisions: one per conflicting day in date order; a missing or disallowed choice is skip. */
export function decisionList(plan: ImportPlan, decisions: Readonly<Record<string, ImportDecisionAction>>): ImportDecision[] {
  return [...plan.decisions_required]
    .sort((a, b) => a.work_date.localeCompare(b.work_date))
    .map((item) => {
      const chosen = decisions[item.work_date];
      return { work_date: item.work_date, action: chosen !== undefined && allowedActions(item).includes(chosen) ? chosen : 'skip' };
    });
}

export interface CommitCounts {
  importedDays: number;
  importedOnDecision: number;
  skippedDays: number;
  periods: number;
}

/** What the commit would write, for its confirmation step: the plan's importable days plus the days chosen to import. */
export function commitCounts(plan: ImportPlan, decisions: Readonly<Record<string, ImportDecisionAction>>): CommitCounts {
  const list = decisionList(plan, decisions);
  const chosen = new Set(list.filter((decision) => decision.action === 'import').map((decision) => decision.work_date));
  const selected = plan.days.filter((day) => day.status === 'importable' || (day.status === 'decision_required' && chosen.has(day.work_date)));
  const sheets = new Set(selected.map((day) => day.sheet));
  return {
    importedDays: selected.length,
    importedOnDecision: chosen.size,
    skippedDays: list.length - chosen.size,
    periods: plan.periods.filter((period) => period.state === 'new' && sheets.has(period.sheet)).length,
  };
}

/* ---- Import error messages ------------------------------------------------------ */

const REJECTION_TEXT: Record<string, string> = {
  package_too_large: `The workbook is too large (the limit is ${IMPORT_MAX_TEXT}).`,
  too_many_entries: 'The workbook has too many parts.',
  entry_too_large: 'A part of the workbook is too large when unpacked.',
  total_too_large: 'The workbook is too large when unpacked.',
  not_a_zip: `The file is not a valid ${XLSX_FILE_EXTENSION} workbook.`,
  unsupported_zip: 'The workbook uses a packaging feature that is not accepted.',
  malformed_zip: 'The workbook package is damaged.',
  entry_integrity: 'The workbook package is damaged (a part fails its checksum).',
  macro_content: 'The workbook contains macros, which are never opened.',
  doctype_forbidden: 'The workbook contains a document type declaration (DTD or entities), which is never read.',
  malformed_xml: 'A part of the workbook is not valid XML.',
  not_a_workbook: 'The file is not a spreadsheet workbook.',
  too_many_sheets: 'The workbook has too many sheets.',
  too_many_cells: 'A sheet of the workbook has too many cells.',
  too_many_shared_strings: 'The workbook has too many text entries.',
};

function rejectionMessage(reason: unknown): string {
  const text = typeof reason === 'string' ? REJECTION_TEXT[reason] : undefined;
  return `${text ?? 'The workbook cannot be read safely.'} The workbook was not stored.`;
}

function detailText(details: Record<string, unknown> | undefined, key: string): string {
  const value = details?.[key];
  return typeof value === 'string' ? value : 'that day';
}

/** An import request's failure in words: the server's code decides, and an unknown code shows its own message. */
export function importErrorMessage(caught: unknown): string {
  if (!(caught instanceof ApiRequestError)) return GENERIC_FAILURE;
  const { status, code, details } = caught;
  if (status === 413 || code === 'payload_too_large') return `The workbook is larger than ${IMPORT_MAX_TEXT}, so it was not uploaded.`;
  if (status === 415 || code === 'unsupported_media_type') {
    return `Only ${XLSX_FILE_EXTENSION} workbooks are accepted; macro-enabled workbooks are refused.`;
  }
  switch (code) {
    case 'workbook_rejected':
      return rejectionMessage(details?.reason);
    case 'empty_upload':
      return 'The upload is empty, so nothing was stored.';
    case 'decisions_required': {
      const missing = details?.decisions_required;
      const what = Array.isArray(missing) ? (missing.length === 1 ? '1 day still needs' : `${missing.length} days still need`) : 'Some days still need';
      return `${what} a decision. Nothing was imported.`;
    }
    case 'decision_not_allowed': {
      const allowed = details?.allowed_actions;
      const actions = Array.isArray(allowed) ? allowed.join(', ') : 'skip';
      return `${detailText(details, 'work_date')} allows only: ${actions}. Nothing was imported.`;
    }
    case 'unknown_decision':
      return `${detailText(details, 'work_date')} needs no decision in this batch. Nothing was imported.`;
    case 'duplicate_decision':
      return `${detailText(details, 'work_date')} was decided more than once. Nothing was imported.`;
    case 'import_already_committed':
      return 'This workbook was already imported with different decisions. Nothing new was written.';
    case 'imported_period':
      return IMPORTED_PERIOD_REASON;
    case 'not_found':
      return 'That import was not found.';
    default:
      return `${caught.message} (${code})`;
  }
}

/* ---- Opening balance ------------------------------------------------------------ */

export type SignChoice = 'credit' | 'debit';

export interface SignedMinutesInput {
  sign: SignChoice;
  hours: string;
  minutes: string;
}

const DIGITS = /^\d+$/;

/** The signed minutes of the hours, minutes and explicit sign fields, or the problem in words. */
export function parseSignedMinutes(input: SignedMinutesInput): { minutes: number } | { error: string } {
  const hoursText = input.hours.trim();
  const minutesText = input.minutes.trim();
  if (hoursText !== '' && !DIGITS.test(hoursText)) return { error: 'Hours must be a whole number, 0 or more.' };
  if (minutesText !== '' && !DIGITS.test(minutesText)) return { error: 'Minutes must be a whole number from 0 to 59.' };
  const hours = hoursText === '' ? 0 : Number(hoursText);
  const minutes = minutesText === '' ? 0 : Number(minutesText);
  if (minutes > 59) return { error: 'Minutes must be a whole number from 0 to 59.' };
  if (hours > OPENING_MAX_HOURS) return { error: `The value is too large (the limit is ${OPENING_MAX_MINUTES} minutes).` };
  const total = hours * 60 + minutes;
  if (total === 0) return { error: 'Enter at least 1 minute; an opening balance of zero is not recorded.' };
  if (total > OPENING_MAX_MINUTES) return { error: `The value is too large (the limit is ${OPENING_MAX_MINUTES} minutes).` };
  return { minutes: input.sign === 'debit' ? -total : total };
}

/** A signed value with an explicit sign in hours and minutes, never decimal hours. */
export function signedMinutesText(minutes: number): string {
  if (minutes === 0) return '0m';
  return `${minutes > 0 ? '+' : ''}${formatDuration(minutes)}`;
}

/** A stored signed value split back into the form's sign, hours and minutes. */
export function splitSignedMinutes(minutes: number): SignedMinutesInput {
  const total = Math.abs(minutes);
  return { sign: minutes < 0 ? 'debit' : 'credit', hours: String(Math.floor(total / 60)), minutes: String(total % 60) };
}

/** The posted balance after replacing the current opening value (0 when none) with the new one. */
export function resultingPosted(posted: number, currentOpening: number, newOpening: number): number {
  return posted - currentOpening + newOpening;
}

export interface OpeningFormValues extends SignedMinutesInput {
  asOfDate: string;
  reason: string;
  evidence: string;
}

/** A message for each field of the form that is not ready; an empty object means it can go to the confirmation step. */
export function openingFormProblems(form: OpeningFormValues, options: { needsAsOfDate: boolean }): Record<string, string> {
  const problems: Record<string, string> = {};
  const minutes = parseSignedMinutes(form);
  if ('error' in minutes) problems.minutes = minutes.error;
  if (options.needsAsOfDate && !isCivilDate(form.asOfDate)) problems.asOfDate = 'Enter the as-of date as a calendar date.';
  const reason = form.reason.trim();
  if (reason === '') problems.reason = 'A reason is required.';
  else if (reason.length > MAX_TEXT_LENGTH) problems.reason = `The reason can have at most ${MAX_TEXT_LENGTH} characters.`;
  const evidence = form.evidence.trim();
  if (evidence === '') problems.evidence = 'An evidence reference is required.';
  else if (evidence.length > MAX_TEXT_LENGTH) problems.evidence = `The evidence reference can have at most ${MAX_TEXT_LENGTH} characters.`;
  return problems;
}

/** An opening-balance request's failure in words (the WP4-T10 codes). */
export function openingBalanceErrorMessage(caught: unknown): string {
  if (!(caught instanceof ApiRequestError)) return GENERIC_FAILURE;
  switch (caught.code) {
    case 'opening_balance_exists':
      return 'An opening balance is already recorded with other values. Change it with a reasoned correction.';
    case 'stale_version':
      return 'The opening balance changed since you loaded it. It was reloaded; review it and try again.';
    case 'invalid_minutes':
      return 'Enter a signed, non-zero whole number of minutes.';
    case 'reason_required':
      return 'A reason is required.';
    case 'evidence_required':
      return 'An evidence reference is required.';
    case 'invalid_reason':
      return `The reason can have at most ${MAX_TEXT_LENGTH} characters.`;
    case 'invalid_evidence_ref':
      return `The evidence reference can have at most ${MAX_TEXT_LENGTH} characters.`;
    case 'not_found':
      return 'No opening balance is recorded yet, so there is nothing to correct.';
    default:
      return `${caught.message} (${caught.code})`;
  }
}
