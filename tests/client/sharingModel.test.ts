import { describe, expect, it } from 'vitest';
import { ApiRequestError, type HistoryEvent, type RevisionListItem } from '../../src/client/api.ts';
import {
  abilitiesOf,
  barTitle,
  classifySharedFailure,
  DEFAULT_SHARE_ITEMS,
  grantFailureText,
  hasAnyItem,
  historyActorBadge,
  isSystemOperation,
  itemsProblem,
  itemsSummary,
  parseSharedHash,
  PDF_SIGNATURE_NOTE,
  resolveSharedView,
  sameShareItems,
  shareEndedMessage,
  shareOperationText,
  sharedBase,
  sharedHash,
  sharedRevisionRows,
  type ShareItems,
  type TimesheetsScope,
} from '../../src/client/components/sharingModel.ts';

/*
 * Pure logic of the sharing screens (WP3-T13C). The server decides every grant and refusal; this
 * model only words the items, says which actions a share shows (an action the share does not allow
 * is absent, never merely disabled) and classifies a refused shared request.
 */

const items = (timesheets: TimesheetsScope, otRead = false, pdfDownload = false): ShareItems => ({
  timesheets,
  ot_read: otRead,
  pdf_download: pdfDownload,
});

/** The 11 valid item sets: timesheets none, view or edit, each with OT and PDF on or off, minus all-off. */
const VALID_SETS: ShareItems[] = (['none', 'view', 'edit'] as const).flatMap((timesheets) =>
  [false, true].flatMap((ot) => [false, true].map((pdf) => items(timesheets, ot, pdf))),
).filter(hasAnyItem);

describe('the grant form defaults and the item rules', () => {
  it('starts with timesheets view on, OT off and PDF off', () => {
    expect(DEFAULT_SHARE_ITEMS).toEqual({ timesheets: 'view', ot_read: false, pdf_download: false });
    expect(hasAnyItem(DEFAULT_SHARE_ITEMS)).toBe(true);
  });

  it('has exactly 11 valid item sets and refuses the empty one in words', () => {
    expect(VALID_SETS).toHaveLength(11);
    expect(hasAnyItem(items('none'))).toBe(false);
    expect(itemsProblem(items('none'))).toBe('Turn on at least one shared item.');
    for (const set of VALID_SETS) expect(itemsProblem(set), JSON.stringify(set)).toBeNull();
  });

  it('warns beside the PDF switch that PDFs carry the signature image', () => {
    expect(PDF_SIGNATURE_NOTE).toBe('PDFs contain your signature image');
  });

  it('compares item sets field by field', () => {
    expect(sameShareItems(items('view'), items('view'))).toBe(true);
    expect(sameShareItems(items('view'), items('edit'))).toBe(false);
    expect(sameShareItems(items('view'), items('view', true))).toBe(false);
    expect(sameShareItems(items('view'), items('view', false, true))).toBe(false);
  });

  it('words each enabled item and nothing else', () => {
    expect(itemsSummary(items('view'))).toEqual(['Timesheets: view only']);
    expect(itemsSummary(items('edit', true, true))).toEqual(['Timesheets: can edit', 'OT summary and ledger (read only)', 'Final PDF downloads']);
    expect(itemsSummary(items('none', true))).toEqual(['OT summary and ledger (read only)']);
    expect(itemsSummary(items('none', false, true))).toEqual(['Final PDF downloads']);
  });
});

describe('which actions a share shows', () => {
  it('shows the timesheet reads with view, and the edit controls only with edit', () => {
    expect(abilitiesOf(items('view'))).toMatchObject({ viewTimesheets: true, editTimesheets: false });
    expect(abilitiesOf(items('edit'))).toMatchObject({ viewTimesheets: true, editTimesheets: true });
    expect(abilitiesOf(items('none', true))).toMatchObject({ viewTimesheets: false, editTimesheets: false });
  });

  it('shows OT only with the OT item and PDF downloads only with the PDF item', () => {
    expect(abilitiesOf(items('view'))).toMatchObject({ viewOt: false, downloadPdf: false });
    expect(abilitiesOf(items('view', true))).toMatchObject({ viewOt: true, downloadPdf: false });
    expect(abilitiesOf(items('view', false, true))).toMatchObject({ viewOt: false, downloadPdf: true });
  });

  it('lists the revision status for timesheets or PDF, as the server does', () => {
    expect(abilitiesOf(items('view')).viewRevisions).toBe(true);
    expect(abilitiesOf(items('none', false, true)).viewRevisions).toBe(true);
    expect(abilitiesOf(items('none', true)).viewRevisions).toBe(false);
  });

  it('never offers Clock in/out, sign-off, sending or settings to a grantee, whatever the items', () => {
    for (const set of VALID_SETS) {
      const abilities = abilitiesOf(set);
      expect(Object.keys(abilities).sort(), JSON.stringify(set)).toEqual(
        ['downloadPdf', 'editTimesheets', 'viewOt', 'viewRevisions', 'viewTimesheets', 'views'].sort(),
      );
    }
  });

  it('opens the views in a fixed order for every valid set', () => {
    expect(abilitiesOf(items('edit', true, true)).views).toEqual(['timesheet', 'ot', 'revisions']);
    expect(abilitiesOf(items('none', true)).views).toEqual(['ot']);
    expect(abilitiesOf(items('none', false, true)).views).toEqual(['revisions']);
    expect(abilitiesOf(items('view')).views).toEqual(['timesheet', 'revisions']);
    for (const set of VALID_SETS) expect(abilitiesOf(set).views.length, JSON.stringify(set)).toBeGreaterThan(0);
  });

  it('falls back to the first allowed view when the asked one is not in the share', () => {
    expect(resolveSharedView(items('view'), 'ot')).toBe('timesheet');
    expect(resolveSharedView(items('none', true), null)).toBe('ot');
    expect(resolveSharedView(items('none', true), 'timesheet')).toBe('ot');
    expect(resolveSharedView(items('view', true), 'ot')).toBe('ot');
  });
});

describe('shared addresses', () => {
  it('builds the shared API base and the deep-link hash from the owner id', () => {
    expect(sharedBase('owner-1')).toBe('/api/shared/owner-1');
    expect(sharedHash('owner-1', null)).toBe('#/shared/owner-1');
    expect(sharedHash('owner-1', 'ot')).toBe('#/shared/owner-1/ot');
  });

  it('parses only well-formed shared hashes and keeps nothing else in them', () => {
    expect(parseSharedHash('#/shared/owner-1')).toEqual({ ownerId: 'owner-1', view: null });
    expect(parseSharedHash('#/shared/owner-1/timesheet')).toEqual({ ownerId: 'owner-1', view: 'timesheet' });
    expect(parseSharedHash('#/shared/owner-1/revisions')).toEqual({ ownerId: 'owner-1', view: 'revisions' });
    expect(parseSharedHash('#/shared/owner-1/other')).toBeNull();
    expect(parseSharedHash('#/shared/')).toBeNull();
    expect(parseSharedHash('#/shared/a/b/c')).toBeNull();
    expect(parseSharedHash('#/shared/ow ner/ot')).toBeNull();
    expect(parseSharedHash('#/timesheet')).toBeNull();
  });
});

describe('the persistent bar and the end of a share', () => {
  it('names the owner and says view only or can edit', () => {
    expect(barTitle('Example Owner', items('view'))).toBe("Viewing Example Owner's timesheets - view only");
    expect(barTitle('Example Owner', items('edit', true))).toBe("Viewing Example Owner's timesheets - can edit");
    expect(barTitle('Example Owner', items('none', true))).toBe("Viewing Example Owner's shared items");
  });

  it('tells the user a share ended and that they are back in their own view', () => {
    expect(shareEndedMessage('Example Owner')).toBe("Access to Example Owner's timesheets has ended. You are back in your own timesheets.");
    expect(shareEndedMessage(null)).toBe('That shared view is not available. You are back in your own timesheets.');
  });

  it('classifies a refused shared request by asking whether the share still exists', () => {
    const refused = (status: number, code: string) => new ApiRequestError(status, code, 'message');
    expect(classifySharedFailure(refused(404, 'not_found'), false)).toBe('ended');
    expect(classifySharedFailure(refused(404, 'not_found'), true)).toBe('other');
    expect(classifySharedFailure(refused(404, 'not_found'), null)).toBe('other');
    expect(classifySharedFailure(refused(403, 'grant_scope'), true)).toBe('scope_changed');
    expect(classifySharedFailure(refused(403, 'forbidden'), true)).toBe('other');
    expect(classifySharedFailure(refused(409, 'stale_version'), true)).toBe('other');
    expect(classifySharedFailure(new Error('x'), false)).toBe('other');
  });
});

describe('the grant form refusals', () => {
  const refused = (status: number, code: string) => new ApiRequestError(status, code, 'server message');

  it('words every refusal the server can give', () => {
    expect(grantFailureText(refused(422, 'grantee_not_found'))).toBe('No active account can receive a share at this address.');
    expect(grantFailureText(refused(422, 'self_share'))).toBe('Your own timesheets are already yours. Enter another account.');
    expect(grantFailureText(refused(422, 'no_share_items'))).toBe('Turn on at least one shared item.');
    expect(grantFailureText(refused(409, 'share_exists'))).toBe('This account already has a share. Change its items below instead.');
    expect(grantFailureText(refused(429, 'rate_limited'))).toBe('Too many addresses without an account. Try again in a few minutes.');
    expect(grantFailureText(refused(500, 'internal_error'))).toBe('server message (internal_error)');
    expect(grantFailureText(new Error('x'))).toBe('Request failed');
  });
});

describe('history: shared edits and share events', () => {
  const event = (overrides: Partial<HistoryEvent>): HistoryEvent => ({
    id: 'e1',
    occurred_at: '2026-10-05T10:00:00Z',
    operation: 'day.update',
    entity_type: 'day',
    entity_id: 'd1',
    reason: null,
    actor_is_self: true,
    via_share: false,
    actor_display_name: null,
    before: null,
    after: null,
    ...overrides,
  });

  it('attributes an edit made under a share to the grantee by name', () => {
    expect(historyActorBadge(event({ actor_is_self: false, via_share: true, actor_display_name: 'Synthetic Grantee' }))).toBe(
      'Changed by Synthetic Grantee (shared access)',
    );
  });

  it('keeps "by someone else" for any other event of another person and shows nothing for the owner', () => {
    expect(historyActorBadge(event({ actor_is_self: false }))).toBe('by someone else');
    expect(historyActorBadge(event({}))).toBeNull();
  });

  it('labels the actor-less system events as automatic, never as someone else (WP3-B-03)', () => {
    for (const operation of ['timesheet.auto_finalize', 'deadline.overdue', 'deadline.finalize_failed']) {
      expect(isSystemOperation(operation), operation).toBe(true);
      expect(historyActorBadge(event({ operation, actor_is_self: false })), operation).toBe('automatic');
    }
    // A person's operation is never a system event, and the grantee attribution is unchanged.
    expect(isSystemOperation('timesheet.signoff')).toBe(false);
    expect(isSystemOperation('day_entry.update')).toBe(false);
    expect(historyActorBadge(event({ operation: 'day_entry.update', actor_is_self: false }))).toBe('by someone else');
    expect(
      historyActorBadge(event({ operation: 'day_entry.update', actor_is_self: false, via_share: true, actor_display_name: 'Synthetic Grantee' })),
    ).toBe('Changed by Synthetic Grantee (shared access)');
  });

  it('words a grantee PDF download as a download, never as a change (WP3-C-02 wording)', () => {
    const download = event({ operation: 'share.pdf_download', actor_is_self: false, via_share: true, actor_display_name: 'Synthetic Grantee' });
    expect(historyActorBadge(download)).toBe('Downloaded by Synthetic Grantee (shared access)');
    // A day or session edit under a share keeps the "Changed by" wording.
    expect(historyActorBadge({ ...download, operation: 'work_session.update' })).toBe('Changed by Synthetic Grantee (shared access)');
  });

  it('words the share events and leaves other operations to the existing labels', () => {
    expect(shareOperationText('share.grant')).toBe('Share granted');
    expect(shareOperationText('share.change')).toBe('Share items changed');
    expect(shareOperationText('share.revoke')).toBe('Share ended');
    expect(shareOperationText('share.pdf_download')).toBe('Shared PDF downloaded');
    expect(shareOperationText('day.update')).toBeNull();
  });
});

describe('the revision status list of a shared view', () => {
  const listed = (overrides: Partial<RevisionListItem>): RevisionListItem => ({
    id: 'rev-1',
    payroll_date: '2026-10-16',
    revision_no: 1,
    revision_kind: 'original',
    origin: 'employee',
    review_state: 'signed',
    supersedes_revision_id: null,
    finalized_at: '2026-10-12T18:00:00Z',
    pdf_state: 'ready',
    delivery_state: 'accepted',
    ...overrides,
  });

  it('lists every revision newest period first, without any recipient or personal content', () => {
    const rows = sharedRevisionRows(
      [listed({ id: 'a', payroll_date: '2026-10-02' }), listed({ id: 'c', payroll_date: '2026-10-30' }), listed({ id: 'b', payroll_date: '2026-10-16', revision_no: 2, supersedes_revision_id: 'x' })],
      items('view', false, true),
    );
    expect(rows.map((row) => row.id)).toEqual(['c', 'b', 'a']);
    expect(Object.keys(rows[0] ?? {}).sort()).toEqual(['canDownload', 'delivery', 'id', 'origin', 'payrollDate', 'pdf', 'review', 'revisionNo'].sort());
  });

  it('offers the PDF download only with the PDF item and only for a ready PDF', () => {
    const row = (set: ShareItems, state: RevisionListItem['pdf_state']) => sharedRevisionRows([listed({ pdf_state: state })], set)[0];
    expect(row(items('view', false, true), 'ready')?.canDownload).toBe(true);
    expect(row(items('view', false, false), 'ready')?.canDownload).toBe(false);
    expect(row(items('view', false, true), 'pending')?.canDownload).toBe(false);
    expect(row(items('view', false, true), 'failed')?.canDownload).toBe(false);
    expect(row(items('view', false, true), null)?.canDownload).toBe(false);
  });

  it('words origin, review state, PDF and delivery without saying "you"', () => {
    const [signed] = sharedRevisionRows([listed({})], items('view'));
    expect(signed).toMatchObject({ origin: 'Signed by the employee', review: 'Signed', pdf: 'PDF ready', delivery: 'Accepted by the mail server' });
    const [automatic] = sharedRevisionRows([listed({ origin: 'deadline', review_state: 'pending', delivery_state: null, pdf_state: 'pending' })], items('view'));
    expect(automatic).toMatchObject({ origin: 'Submitted automatically', review: 'Review pending', pdf: 'PDF is being prepared', delivery: 'Not sent yet' });
    const [correction] = sharedRevisionRows([listed({ revision_kind: 'correction', revision_no: 2 })], items('view'));
    expect(correction?.origin).toBe('Correction signed by the employee');
  });
});
