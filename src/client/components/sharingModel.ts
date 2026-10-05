import { ApiRequestError, type HistoryEvent, type RevisionListItem, type ShareItems, type TimesheetsScope } from '../api.ts';
import { describeError } from './errors.ts';
import { attemptStateText, type PdfState, pdfStateText } from './deliveryModel.ts';

export type { ShareItems, TimesheetsScope };

/*
 * Pure logic of the sharing screens (FR-17, AC-16, WP3-T13C). The server decides every grant and
 * every refusal: a share is resolved from the database on each request and a refused action answers
 * 403 or 404. This model only words the items, says which actions a share shows (an action the share
 * does not allow is absent from the page, never merely disabled), builds the shared addresses and
 * classifies a refused shared request. Nothing here reads a clock, a zone or a business value.
 */

/* ---- Items ------------------------------------------------------------------------------ */

/** The grant form starts with timesheets view on, OT off and final PDF downloads off. */
export const DEFAULT_SHARE_ITEMS: ShareItems = { timesheets: 'view', ot_read: false, pdf_download: false };

/** Shown beside the PDF switch: the owner's signature image is inside every PDF a grantee downloads. */
export const PDF_SIGNATURE_NOTE = 'PDFs contain your signature image';

/** A share needs at least one item; the server refuses an empty set with 422 `no_share_items`. */
export function hasAnyItem(items: ShareItems): boolean {
  return items.timesheets !== 'none' || items.ot_read || items.pdf_download;
}

export function itemsProblem(items: ShareItems): string | null {
  return hasAnyItem(items) ? null : 'Turn on at least one shared item.';
}

export function sameShareItems(a: ShareItems, b: ShareItems): boolean {
  return a.timesheets === b.timesheets && a.ot_read === b.ot_read && a.pdf_download === b.pdf_download;
}

const TIMESHEETS_TEXT: Record<Exclude<TimesheetsScope, 'none'>, string> = { view: 'Timesheets: view only', edit: 'Timesheets: can edit' };

/** One phrase per enabled item, in a fixed order. */
export function itemsSummary(items: ShareItems): string[] {
  const phrases: string[] = [];
  if (items.timesheets !== 'none') phrases.push(TIMESHEETS_TEXT[items.timesheets]);
  if (items.ot_read) phrases.push('OT summary and ledger (read only)');
  if (items.pdf_download) phrases.push('Final PDF downloads');
  return phrases;
}

/* ---- What a share shows --------------------------------------------------------------------- */

export type SharedView = 'timesheet' | 'ot' | 'revisions';

export const SHARED_VIEW_LABEL: Record<SharedView, string> = { timesheet: 'Timesheet', ot: 'OT', revisions: 'Revisions' };

/**
 * The actions and views a share exposes. There is deliberately no field for Clock in/out, sign-off,
 * sending, corrections, leave or settings: no share can ever allow them, so no screen of a shared
 * view has anything to show for them.
 */
export interface SharedAbilities {
  viewTimesheets: boolean;
  editTimesheets: boolean;
  viewOt: boolean;
  /** The revision status list: the server lists it for timesheets or PDF downloads. */
  viewRevisions: boolean;
  downloadPdf: boolean;
  views: SharedView[];
}

export function abilitiesOf(items: ShareItems): SharedAbilities {
  const viewTimesheets = items.timesheets !== 'none';
  const viewRevisions = viewTimesheets || items.pdf_download;
  const views: SharedView[] = [];
  if (viewTimesheets) views.push('timesheet');
  if (items.ot_read) views.push('ot');
  if (viewRevisions) views.push('revisions');
  return {
    viewTimesheets,
    editTimesheets: items.timesheets === 'edit',
    viewOt: items.ot_read,
    viewRevisions,
    downloadPdf: items.pdf_download,
    views,
  };
}

/** The asked view when the share has it, otherwise the first view the share has (null never happens for a valid share). */
export function resolveSharedView(items: ShareItems, requested: SharedView | null): SharedView | null {
  const { views } = abilitiesOf(items);
  return requested !== null && views.includes(requested) ? requested : (views[0] ?? null);
}

/* ---- Addresses --------------------------------------------------------------------------------- */

/** The API base of one owner's shared timesheets; every shared screen reads and writes below it. */
export const sharedBase = (ownerId: string): string => `/api/shared/${encodeURIComponent(ownerId)}`;

export const sharedHash = (ownerId: string, view: SharedView | null): string =>
  view === null ? `#/shared/${ownerId}` : `#/shared/${ownerId}/${view}`;

const SHARED_HASH = /^#\/shared\/([A-Za-z0-9-]{1,64})(?:\/(timesheet|ot|revisions))?$/;

/** The owner and view of a `#/shared/{ownerId}[/view]` hash; null for anything else. The hash holds no token. */
export function parseSharedHash(hash: string): { ownerId: string; view: SharedView | null } | null {
  const match = SHARED_HASH.exec(hash);
  if (match === null) return null;
  const [, ownerId, view] = match;
  if (ownerId === undefined) return null;
  return { ownerId, view: view === undefined ? null : (view as SharedView) };
}

/* ---- The persistent bar and the end of a share --------------------------------------------- */

export function barTitle(ownerName: string, items: ShareItems): string {
  if (items.timesheets === 'none') return `Viewing ${ownerName}'s shared items`;
  return `Viewing ${ownerName}'s timesheets - ${items.timesheets === 'edit' ? 'can edit' : 'view only'}`;
}

/** What the user reads after a revoked share sent them back to their own view. */
export function shareEndedMessage(ownerName: string | null): string {
  return ownerName === null
    ? 'That shared view is not available. You are back in your own timesheets.'
    : `Access to ${ownerName}'s timesheets has ended. You are back in your own timesheets.`;
}

export type SharedFailure = 'ended' | 'scope_changed' | 'other';

/**
 * What a refused shared request means. A 404 can be a missing object as well as a gone share, so it
 * counts as ended only when the caller's fresh list of received shares no longer holds the owner
 * (`stillShared` false); `null` means the list could not be read. A 403 `grant_scope` means the items
 * changed so that this action is no longer allowed.
 */
export function classifySharedFailure(caught: unknown, stillShared: boolean | null): SharedFailure {
  if (!(caught instanceof ApiRequestError)) return 'other';
  if (caught.status === 404 && stillShared === false) return 'ended';
  if (caught.status === 403 && caught.code === 'grant_scope') return 'scope_changed';
  return 'other';
}

/* ---- The grant form --------------------------------------------------------------------------- */

/** A refused grant in words; an unknown or deactivated address always gets the same answer. */
export function grantFailureText(caught: unknown): string {
  if (caught instanceof ApiRequestError) {
    switch (caught.code) {
      case 'grantee_not_found':
        return 'No active account can receive a share at this address.';
      case 'self_share':
        return 'Your own timesheets are already yours. Enter another account.';
      case 'no_share_items':
        return 'Turn on at least one shared item.';
      case 'share_exists':
        return 'This account already has a share. Change its items below instead.';
      case 'rate_limited':
        return 'Too many addresses without an account. Try again in a few minutes.';
      default:
        break;
    }
  }
  return describeError(caught);
}

/* ---- History ------------------------------------------------------------------------------------ */

const SHARE_OPERATION_TEXT: Record<string, string> = {
  'share.grant': 'Share granted',
  'share.change': 'Share items changed',
  'share.revoke': 'Share ended',
  'share.pdf_download': 'Shared PDF downloaded',
};

/** A label for a sharing audit operation, or null when the operation is not a sharing one. */
export function shareOperationText(operation: string): string | null {
  return SHARE_OPERATION_TEXT[operation] ?? null;
}

/**
 * The badge of a history entry made by someone else. An edit performed under a share names the
 * grantee (the server sends the display name, never an id); any other foreign event stays unnamed.
 */
export function historyActorBadge(event: Pick<HistoryEvent, 'actor_is_self' | 'via_share' | 'actor_display_name'>): string | null {
  if (event.via_share && event.actor_display_name !== null) return `Changed by ${event.actor_display_name} (shared access)`;
  return event.actor_is_self ? null : 'by someone else';
}

/* ---- The revision status list of a shared view -------------------------------------------- */

export interface SharedRevisionRow {
  id: string;
  payrollDate: string;
  revisionNo: number;
  origin: string;
  review: string;
  pdf: string;
  delivery: string;
  /** True only with the PDF item and a ready PDF; the server refuses anything else. */
  canDownload: boolean;
}

function pdfStateOfListed(state: RevisionListItem['pdf_state']): PdfState {
  return state ?? 'pending';
}

function originText(item: Pick<RevisionListItem, 'revision_kind' | 'origin'>): string {
  if (item.revision_kind === 'late_review') return 'Automatic submission, reviewed by the employee later';
  if (item.revision_kind === 'correction') return 'Correction signed by the employee';
  return item.origin === 'deadline' ? 'Submitted automatically' : 'Signed by the employee';
}

/** Every revision, newest period first, as words: status only, no recipient, name or personal content. */
export function sharedRevisionRows(revisions: readonly RevisionListItem[], items: ShareItems): SharedRevisionRow[] {
  return revisions
    .map((item) => {
      const pdf = pdfStateOfListed(item.pdf_state);
      return {
        id: item.id,
        payrollDate: item.payroll_date,
        revisionNo: item.revision_no,
        origin: originText(item),
        review: item.review_state === 'pending' ? 'Review pending' : 'Signed',
        pdf: pdfStateText(pdf),
        delivery: item.delivery_state === null ? 'Not sent yet' : attemptStateText(item.delivery_state),
        canDownload: items.pdf_download && pdf === 'ready',
      };
    })
    .sort((a, b) => b.payrollDate.localeCompare(a.payrollDate) || b.revisionNo - a.revisionNo);
}
