/*
 * Submission email templates and recipient lists (docs/04 Email and PDF, docs/05).
 *
 * Pure functions: no database, no clock, no I/O. A template is plain text with single-brace
 * variables from a closed set. Validation rejects every unknown variable and every stray
 * brace, rendering escapes values for HTML, and a rendered subject can never carry a line
 * break (header injection). Recipients are bare addr-spec addresses only (no display names,
 * no comma lists), validated, de-duplicated case-insensitively and bounded in number.
 */

/** The only variables a template may use. */
export const TEMPLATE_VARIABLES = [
  'EmployeeName',
  'PeriodStart',
  'PeriodEnd',
  'PayrollDate',
  'SignOffStatus',
  'SubmissionId',
  'Revision',
] as const;

export type TemplateVariable = (typeof TEMPLATE_VARIABLES)[number];

/** Values for every variable; always single-line text (control characters are neutralized on render). */
export type TemplateValues = Readonly<Record<TemplateVariable, string>>;

export type EmailTemplateErrorCode =
  | 'unknown_template_variable'
  | 'invalid_template'
  | 'template_line_break'
  | 'invalid_recipient'
  | 'too_many_recipients'
  | 'recipients_required';

/** A validation failure with a stable machine-readable code (mapped to HTTP 422 by the server). */
export class EmailTemplateError extends Error {
  readonly code: EmailTemplateErrorCode;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(code: EmailTemplateErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'EmailTemplateError';
    this.code = code;
    this.details = details;
  }
}

export const MAX_SUBJECT_TEMPLATE_LENGTH = 500;
export const MAX_BODY_TEMPLATE_LENGTH = 10_000;
/** At most this many addresses in each of the `to` and `cc` lists, after de-duplication. */
export const MAX_RECIPIENTS_PER_LIST = 10;

export const DEFAULT_SUBJECT_TEMPLATE = 'Timesheet {PeriodStart} to {PeriodEnd} - {EmployeeName} - {SignOffStatus}';
export const DEFAULT_BODY_TEMPLATE = [
  'Hello,',
  '',
  'Attached is the timesheet of {EmployeeName} for {PeriodStart} to {PeriodEnd} (payroll date {PayrollDate}).',
  'Status: {SignOffStatus}.',
  'Submission {SubmissionId}, revision {Revision}.',
].join('\n');

/** How a submission was created; only the system tracks it, an outgoing artifact does not show it. */
export type SubmissionOrigin = 'manual' | 'automatic';

/** The {SignOffStatus} text of every submission unless an automatic submission's note line is on. */
export const SUBMITTED_STATUS = 'Submitted';

/**
 * The one {SignOffStatus} value (owner decision G-Q2 (a)): "Submitted" for manual and automatic
 * submissions alike, or the note text for an automatic submission whose note line is on. It never
 * claims a sign-off and never names the origin on its own. The note text is validated one-line,
 * brace-free text (src/domain/snapshot.ts), so it cannot break a header or add a variable.
 */
export function signOffStatusText(origin: SubmissionOrigin, autoNote: { readonly enabled: boolean; readonly text: string }): string {
  return origin === 'automatic' && autoNote.enabled ? autoNote.text : SUBMITTED_STATUS;
}

const KNOWN: ReadonlySet<string> = new Set(TEMPLATE_VARIABLES);

type Token = { kind: 'text'; text: string } | { kind: 'variable'; name: TemplateVariable };

/** Splits a template into text and variable tokens; unknown variables and stray braces throw. */
function tokenize(template: string): Token[] {
  const tokens: Token[] = [];
  let text = '';
  let index = 0;
  while (index < template.length) {
    const char = template.charAt(index);
    if (char === '}') {
      throw new EmailTemplateError('invalid_template', 'The template contains an unmatched closing brace');
    }
    if (char !== '{') {
      text += char;
      index += 1;
      continue;
    }
    const close = template.indexOf('}', index + 1);
    if (close === -1) throw new EmailTemplateError('invalid_template', 'The template contains an unclosed variable');
    const name = template.slice(index + 1, close);
    if (name.includes('{')) throw new EmailTemplateError('invalid_template', 'The template contains a nested brace');
    if (!KNOWN.has(name)) {
      throw new EmailTemplateError('unknown_template_variable', 'The template uses a variable that does not exist', {
        // Bounded and stripped of control characters so the error cannot carry a payload.
        variable: neutralize(name).slice(0, 40),
      });
    }
    if (text !== '') tokens.push({ kind: 'text', text });
    text = '';
    tokens.push({ kind: 'variable', name: name as TemplateVariable });
    index = close + 1;
  }
  if (text !== '') tokens.push({ kind: 'text', text });
  return tokens;
}

/** Control characters (including CR, LF, NEL and the Unicode line/paragraph separators) become one space. */
function neutralize(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, ' ');
}

/** Single-line value: neutralized and trimmed. */
function singleLine(value: string): string {
  return neutralize(value).trim();
}

/** Escapes text for an HTML element body or a double-quoted attribute. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

/** Throws unless the subject template is valid, single-line and within bounds. */
export function validateSubjectTemplate(template: string): void {
  if (template.trim() === '' || template.length > MAX_SUBJECT_TEMPLATE_LENGTH) {
    throw new EmailTemplateError('invalid_template', `The subject template must have 1 to ${MAX_SUBJECT_TEMPLATE_LENGTH} characters`);
  }
  if (/[\r\n\u0085\u2028\u2029]/.test(template)) {
    throw new EmailTemplateError('template_line_break', 'The subject template cannot contain a line break');
  }
  tokenize(template);
}

/** Throws unless the body template is valid and within bounds. */
export function validateBodyTemplate(template: string): void {
  if (template.trim() === '' || template.length > MAX_BODY_TEMPLATE_LENGTH) {
    throw new EmailTemplateError('invalid_template', `The body template must have 1 to ${MAX_BODY_TEMPLATE_LENGTH} characters`);
  }
  tokenize(template);
}

/** Body text lines: only LF is kept; CR is normalized away so no bare CR reaches a header or part. */
function normalizeNewlines(text: string): string {
  return text.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
}

/** Renders a subject: values are single-line, so the result never contains CR or LF. */
export function renderSubject(template: string, values: TemplateValues): string {
  validateSubjectTemplate(template);
  const rendered = tokenize(template)
    .map((token) => (token.kind === 'text' ? token.text : singleLine(values[token.name])))
    .join('');
  return singleLine(rendered);
}

/** Renders the plain-text body. */
export function renderTextBody(template: string, values: TemplateValues): string {
  validateBodyTemplate(template);
  return normalizeNewlines(
    tokenize(template)
      .map((token) => (token.kind === 'text' ? token.text : singleLine(values[token.name])))
      .join(''),
  );
}

/**
 * Renders the HTML body: both the template text and every value are escaped, so neither
 * can introduce markup; line breaks become `<br>`.
 */
export function renderHtmlBody(template: string, values: TemplateValues): string {
  validateBodyTemplate(template);
  const html = tokenize(template)
    .map((token) => escapeHtml(token.kind === 'text' ? normalizeNewlines(token.text) : singleLine(values[token.name])))
    .join('');
  return html.replaceAll('\n', '<br>\n');
}

const ATOM = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+$/;
const LABEL = /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/;

/** True for a bare ASCII addr-spec: no display name, comments, quotes, spaces, control characters or IDN. */
export function isValidEmailAddress(address: string): boolean {
  if (address.length < 3 || address.length > 254) return false;
  const at = address.indexOf('@');
  if (at <= 0 || at !== address.lastIndexOf('@')) return false;
  const local = address.slice(0, at);
  const domain = address.slice(at + 1);
  if (local.length > 64) return false;
  if (!local.split('.').every((part) => ATOM.test(part))) return false;
  const labels = domain.split('.');
  if (labels.length < 2) return false;
  if (!labels.every((label) => label.length <= 63 && LABEL.test(label))) return false;
  return !/^[0-9]+$/.test(labels.at(-1) ?? '');
}

export interface NormalizedRecipients {
  to: string[];
  cc: string[];
}

function normalizeList(list: readonly string[], field: 'to' | 'cc', seen: Set<string>): string[] {
  if (list.length > 4 * MAX_RECIPIENTS_PER_LIST) {
    throw new EmailTemplateError('too_many_recipients', `Provide at most ${MAX_RECIPIENTS_PER_LIST} ${field} addresses`);
  }
  const result: string[] = [];
  for (const [position, raw] of list.entries()) {
    const address = raw.trim();
    // The address is not echoed back: it may carry an injection payload.
    if (!isValidEmailAddress(address)) {
      throw new EmailTemplateError('invalid_recipient', `The ${field} address at position ${position + 1} is not valid`, { field, position: position + 1 });
    }
    const key = address.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(address);
  }
  if (result.length > MAX_RECIPIENTS_PER_LIST) {
    throw new EmailTemplateError('too_many_recipients', `Provide at most ${MAX_RECIPIENTS_PER_LIST} ${field} addresses`, { field });
  }
  return result;
}

/**
 * Validates and normalizes both lists: `to` is required, `cc` is optional, addresses are
 * trimmed and de-duplicated case-insensitively (an address already in `to` is dropped from
 * `cc`), and each list is bounded.
 */
export function normalizeRecipients(to: readonly string[], cc: readonly string[] = []): NormalizedRecipients {
  const seen = new Set<string>();
  const normalizedTo = normalizeList(to, 'to', seen);
  if (normalizedTo.length === 0) throw new EmailTemplateError('recipients_required', 'At least one to address is required');
  return { to: normalizedTo, cc: normalizeList(cc, 'cc', seen) };
}
