import { describe, expect, it } from 'vitest';
import { ApiRequestError, type DeliveryRecord, type FinalizationJob, type FinalizationResponse, type RevisionSummary } from '../../src/client/api.ts';
import {
  attemptFault,
  attemptStateText,
  buildRevisionRows,
  confirmationFor,
  correctionLinkLabel,
  decisionFailureText,
  decisionText,
  faultCodeOf,
  filenameFromDisposition,
  gridStatus,
  type HistoryPeriod,
  historyWindow,
  pdfStateOf,
  pdfStateText,
  pendingDecision,
  resendFailureText,
  resendState,
  revisionOriginText,
  revisionReviewText,
  type RevisionRow,
} from '../../src/client/components/deliveryModel.ts';

/*
 * Pure logic of the history and delivery screen. Every value it words (origin, review state, PDF
 * and delivery state, fault codes) is a server field; nothing here recomputes a minute, a state or
 * a deadline, and nothing reads the device clock or the device zone.
 */

const job = (state: string, kind = 'send_email', id = `job-${kind}-${state}`): FinalizationJob => ({ id, kind, state });

function revision(overrides: Partial<RevisionSummary> = {}): RevisionSummary {
  return {
    id: 'rev-1',
    revision_no: 1,
    revision_kind: 'original',
    origin: 'employee',
    review_state: 'signed',
    correction_reason: null,
    send_requested: true,
    created_at: '2026-10-12T18:00:00Z',
    ...overrides,
  };
}

function attempt(overrides: Partial<DeliveryRecord> = {}): DeliveryRecord {
  return {
    id: 'att-1',
    job_id: 'job-1',
    revision_id: 'rev-1',
    revision_no: 1,
    payroll_date: '2026-10-16',
    attempt_no: 1,
    channel: 'email',
    to: ['payroll@example.invalid'],
    cc: [],
    subject: 'Timesheet',
    state: 'accepted',
    decision: null,
    decision_required: false,
    provider_response: null,
    accepted_at: '2026-10-12T18:01:00Z',
    decided_at: null,
    started_at: '2026-10-12T18:00:30Z',
    updated_at: '2026-10-12T18:01:00Z',
    job: { state: 'succeeded', last_error: null },
    ...overrides,
  };
}

function finalization(overrides: Partial<FinalizationResponse> = {}): FinalizationResponse {
  return {
    payroll_date: '2026-10-16',
    finalized_revision_no: 1,
    revision: revision(),
    signoff: { signer_name: 'Example Employee', signed_at: '2026-10-12T18:00:00Z' },
    ledger_lines: [],
    jobs: [job('succeeded', 'render_pdf'), job('succeeded')],
    ...overrides,
  };
}

const period = (payrollDate: string, start: string, end: string): HistoryPeriod['period'] => ({ payroll_date: payrollDate, period_start: start, period_end: end });

function historyPeriod(overrides: Partial<FinalizationResponse> = {}, payrollDate = '2026-10-16'): HistoryPeriod {
  return { period: period(payrollDate, '2026-09-28', '2026-10-11'), finalization: finalization({ payroll_date: payrollDate, ...overrides }) };
}

describe('PDF state from the render job', () => {
  it('reads ready, pending and failed from the job state, and pending when there is no job', () => {
    expect(pdfStateOf([job('succeeded', 'render_pdf')])).toBe('ready');
    expect(pdfStateOf([job('queued', 'render_pdf')])).toBe('pending');
    expect(pdfStateOf([job('leased', 'render_pdf')])).toBe('pending');
    expect(pdfStateOf([job('intervention', 'render_pdf')])).toBe('failed');
    expect(pdfStateOf([job('cancelled', 'render_pdf')])).toBe('failed');
    expect(pdfStateOf([job('succeeded', 'send_email')])).toBe('pending');
    expect(pdfStateOf([])).toBe('pending');
  });

  it('words every state, with the earlier-revision state unknown', () => {
    expect(pdfStateText('ready')).toBe('PDF ready');
    expect(pdfStateText('pending')).toBe('PDF is being prepared');
    expect(pdfStateText('failed')).toBe('PDF needs attention');
    expect(pdfStateText('unknown')).toBe('PDF of an earlier revision');
  });
});

describe('what the owner sees for the origin and review state', () => {
  it('says an automatic submission is awaiting the owner review (the system tracks it, only outgoing files drop it)', () => {
    const automatic = revision({ origin: 'deadline', review_state: 'pending' });
    expect(revisionOriginText(automatic)).toBe('Submitted automatically');
    expect(revisionReviewText(automatic)).toMatchObject({ text: 'Review pending', tone: 'warn' });
  });

  it('words a manual sign-off, a correction and a late review', () => {
    expect(revisionOriginText(revision())).toBe('Signed by you');
    expect(revisionReviewText(revision())).toMatchObject({ text: 'Signed', tone: 'ok' });
    expect(revisionOriginText(revision({ revision_kind: 'correction', revision_no: 2 }))).toBe('Correction signed by you');
    expect(revisionOriginText(revision({ revision_kind: 'late_review', origin: 'deadline', review_state: 'signed', revision_no: 2 }))).toBe(
      'Automatic submission, reviewed by you later',
    );
  });
});

describe('delivery attempts', () => {
  it('words every attempt state and decision', () => {
    expect(attemptStateText('preparing')).toBe('Preparing');
    expect(attemptStateText('sending')).toBe('Sending');
    expect(attemptStateText('accepted')).toBe('Accepted by the mail server');
    expect(attemptStateText('failed_temporary')).toBe('Failed, will retry');
    expect(attemptStateText('failed_permanent')).toBe('Failed');
    expect(attemptStateText('uncertain')).toBe('Uncertain');
    expect(decisionText('mark_delivered')).toBe('You marked it as delivered');
    expect(decisionText('resend')).toBe('You chose to resend');
    expect(decisionText('abandon')).toBe('Given up');
    expect(decisionText(null)).toBeNull();
  });

  it('keeps only the leading fault code of a stored text (as the administrator status does)', () => {
    expect(faultCodeOf(null)).toBeNull();
    expect(faultCodeOf('lease_expired_while_sending')).toBe('lease_expired_while_sending');
    expect(faultCodeOf('recipient_rejected secret@example.invalid password=hunter2')).toBe('recipient_rejected');
    expect(faultCodeOf('550 5.1.1 user unknown payroll@example.invalid')).toBe('smtp_550');
    expect(faultCodeOf('Free text with Capital letters')).toBe('unclassified');
  });

  it('shows a fault code only for failed and uncertain attempts, never for an accepted one', () => {
    expect(attemptFault(attempt({ state: 'accepted', provider_response: '250 queued as abc' }))).toBeNull();
    expect(attemptFault(attempt({ state: 'uncertain', provider_response: 'lease_expired_while_sending' }))).toBe('lease_expired_while_sending');
    expect(attemptFault(attempt({ state: 'failed_permanent', provider_response: '550 5.1.1 user unknown' }))).toBe('smtp_550');
    expect(attemptFault(attempt({ state: 'failed_temporary', provider_response: null, job: { state: 'queued', last_error: 'timeout while sending' } }))).toBe('timeout');
    expect(attemptFault(attempt({ state: 'failed_permanent', provider_response: null, job: { state: 'intervention', last_error: null } }))).toBeNull();
  });
});

describe('revision rows for the history list', () => {
  it('lists the current revision of each finalized period, newest period first, and skips periods without one', () => {
    const rows = buildRevisionRows(
      [
        historyPeriod({}, '2026-10-02'),
        historyPeriod({ revision: null, finalized_revision_no: null, signoff: null, jobs: [] }, '2026-10-16'),
        historyPeriod({ revision: revision({ id: 'rev-b' }) }, '2026-10-30'),
      ],
      [],
    );
    expect(rows.map((row) => row.payrollDate)).toEqual(['2026-10-30', '2026-10-02']);
    expect(rows[0]).toMatchObject({ revisionId: 'rev-b', current: true, revisionNo: 1, pdf: 'ready', periodStart: '2026-09-28', periodEnd: '2026-10-11' });
  });

  it('attaches the attempts of a revision, newest first as the server sends them', () => {
    const rows = buildRevisionRows(
      [historyPeriod()],
      [attempt({ id: 'att-2', attempt_no: 2 }), attempt({ id: 'att-1' }), attempt({ id: 'other', revision_id: 'rev-x', revision_no: 3, payroll_date: '2026-10-02' })],
    );
    expect(rows.find((row) => row.revisionId === 'rev-1')?.attempts.map((item) => item.id)).toEqual(['att-2', 'att-1']);
  });

  it('adds an earlier (superseded) revision that only a delivery attempt or the supersedes link reveals', () => {
    const current = revision({ id: 'rev-2', revision_no: 2, revision_kind: 'correction', correction_reason: 'Late sick day', supersedes_revision_id: 'rev-1' });
    const rows = buildRevisionRows([historyPeriod({ finalized_revision_no: 2, revision: current })], [attempt({ revision_id: 'rev-1', revision_no: 1 })]);
    expect(rows.map((row) => [row.revisionId, row.current, row.revisionNo])).toEqual([
      ['rev-2', true, 2],
      ['rev-1', false, 1],
    ]);
    expect(rows[1]).toMatchObject({ pdf: 'unknown', revision: null });
    // Without any attempt the supersedes link still gives the owner the earlier PDF.
    const linked = buildRevisionRows([historyPeriod({ finalized_revision_no: 2, revision: current })], []);
    expect(linked.map((row) => [row.revisionId, row.revisionNo])).toEqual([
      ['rev-2', 2],
      ['rev-1', null],
    ]);
  });

  it('takes the recipients from the newest attempt envelope', () => {
    const [row] = buildRevisionRows([historyPeriod()], [attempt({ to: ['a@example.invalid'], cc: ['b@example.invalid'] })]);
    expect(row?.recipients).toEqual({ to: ['a@example.invalid'], cc: ['b@example.invalid'] });
    expect(buildRevisionRows([historyPeriod()], [])[0]?.recipients).toBeNull();
  });
});

function currentRow(overrides: Partial<FinalizationResponse> = {}, attempts: DeliveryRecord[] = []): RevisionRow {
  const row = buildRevisionRows([historyPeriod(overrides)], attempts)[0];
  if (row === undefined) throw new Error('row expected');
  return row;
}

describe('explicit resend', () => {
  it('is available only for the current revision', () => {
    const rows = buildRevisionRows([historyPeriod({ finalized_revision_no: 2, revision: revision({ id: 'rev-2', revision_no: 2, supersedes_revision_id: 'rev-1' }) })], []);
    expect(resendState(rows[0] as RevisionRow)).toMatchObject({ available: true, enabled: true });
    expect(resendState(rows[1] as RevisionRow)).toMatchObject({ available: false });
  });

  it('is enabled when the PDF is ready and nothing is in progress', () => {
    expect(resendState(currentRow({}, [attempt()]))).toEqual({ available: true, enabled: true, reason: null });
    expect(resendState(currentRow({}, [attempt({ state: 'failed_permanent', job: { state: 'intervention', last_error: 'x' } })])).enabled).toBe(true);
  });

  it('is disabled with a reason while the PDF is not ready, a delivery is running, or a decision is due', () => {
    expect(resendState(currentRow({ jobs: [job('queued', 'render_pdf')] }))).toMatchObject({ enabled: false, reason: 'The PDF is not ready yet.' });
    for (const state of ['preparing', 'sending'] as const) {
      expect(resendState(currentRow({}, [attempt({ state })]))).toMatchObject({ enabled: false, reason: 'A delivery of this revision is in progress.' });
    }
    expect(resendState(currentRow({ jobs: [job('succeeded', 'render_pdf'), job('queued')] }))).toMatchObject({ enabled: false, reason: 'A delivery of this revision is in progress.' });
    expect(resendState(currentRow({}, [attempt({ state: 'uncertain', decision_required: true })]))).toMatchObject({
      enabled: false,
      reason: 'Decide on the uncertain delivery first.',
    });
  });

  it('turns a decided uncertain attempt back into an allowed resend', () => {
    expect(resendState(currentRow({}, [attempt({ state: 'uncertain', decision_required: false, decision: 'mark_delivered' })])).enabled).toBe(true);
  });
});

describe('the uncertain delivery decision and its confirmation', () => {
  it('finds the attempt that still needs a decision, only on a decision-required attempt', () => {
    const open = attempt({ id: 'att-open', attempt_no: 2, state: 'uncertain', decision_required: true });
    expect(pendingDecision(currentRow({}, [open, attempt()]))?.id).toBe('att-open');
    expect(pendingDecision(currentRow({}, [attempt({ state: 'uncertain', decision: 'resend', decision_required: false })]))).toBeNull();
    expect(pendingDecision(currentRow({}, [attempt()]))).toBeNull();
  });

  it('asks for a confirmation that names what happens, before anything is sent', () => {
    const recipients = { to: ['payroll@example.invalid'], cc: ['manager@example.invalid'] };
    const mark = confirmationFor('mark_delivered', recipients);
    expect(mark).toMatchObject({ action: 'mark_delivered', confirmLabel: 'Mark as delivered', cancelLabel: 'Cancel' });
    expect(mark.message).toContain('nothing is sent');
    const again = confirmationFor('resend_uncertain', recipients);
    expect(again.confirmLabel).toBe('Resend now');
    expect(again.message).toContain('payroll@example.invalid');
    expect(again.message).toContain('manager@example.invalid');
    expect(again.message).toContain('twice');
    const plain = confirmationFor('resend', recipients);
    expect(plain.title).toBe('Send this revision again?');
    expect(plain.message).toContain('No revision, sign-off or OT balance changes');
    expect(confirmationFor('resend', null).message).toContain('your saved recipients');
  });

  it('explains a refused decision or resend in words', () => {
    const refused = (status: number, code: string) => new ApiRequestError(status, code, 'message');
    expect(decisionFailureText(refused(409, 'delivery_decision_recorded'))).toContain('already recorded');
    expect(decisionFailureText(refused(409, 'delivery_not_uncertain'))).toContain('no longer uncertain');
    expect(decisionFailureText(refused(404, 'not_found'))).toContain('could not be found');
    expect(decisionFailureText(new Error('x'))).toBe('Request failed');
    expect(resendFailureText(refused(409, 'delivery_uncertain'))).toContain('decision');
    expect(resendFailureText(refused(409, 'delivery_in_progress'))).toContain('in progress');
    expect(resendFailureText(refused(409, 'pdf_not_ready'))).toContain('not ready');
    expect(resendFailureText(refused(409, 'revision_superseded'))).toContain('newer revision');
    expect(resendFailureText(refused(409, 'envelope_changed'))).toContain('recipients');
  });
});

describe('correction entry point', () => {
  it('leads an automatic submission to its review and every other current revision to a correction', () => {
    expect(correctionLinkLabel(currentRow({ revision: revision({ origin: 'deadline', review_state: 'pending' }) }))).toBe('Review now');
    expect(correctionLinkLabel(currentRow())).toBe('Correct this period');
    const earlier = buildRevisionRows([historyPeriod({ finalized_revision_no: 2, revision: revision({ id: 'rev-2', revision_no: 2, supersedes_revision_id: 'rev-1' }) })], [])[1];
    expect(correctionLinkLabel(earlier as RevisionRow)).toBeNull();
  });
});

describe('period status in the grid area, from server fields', () => {
  const state = (finalizationOverrides: Partial<FinalizationResponse>, attempts: DeliveryRecord[] = []) => ({ finalization: finalization(finalizationOverrides), attempts });

  it('is a draft before any revision, with no PDF and no delivery line', () => {
    expect(gridStatus(state({ revision: null, finalized_revision_no: null, signoff: null, jobs: [] }))).toMatchObject({
      review: { key: 'draft', text: 'Draft' },
      delivery: null,
      pdf: null,
      revisionNo: null,
      submitted: false,
    });
  });

  it('shows an automatic submission as awaiting review, a manual one as submitted, and a correction with its revision number', () => {
    expect(gridStatus(state({ revision: revision({ origin: 'deadline', review_state: 'pending' }) })).review).toMatchObject({
      key: 'submitted_auto_pending',
      text: 'Submitted automatically, review pending',
    });
    expect(gridStatus(state({})).review.key).toBe('submitted_manual');
    expect(gridStatus(state({ finalized_revision_no: 2, revision: revision({ revision_no: 2, revision_kind: 'correction' }) })).review).toMatchObject({ key: 'corrected', text: 'Corrected (revision 2)' });
  });

  it('carries the PDF state and the delivery state of the newest attempt', () => {
    const accepted = gridStatus(state({}, [attempt()]));
    expect(accepted).toMatchObject({ pdf: 'ready', revisionNo: 1, submitted: true });
    expect(accepted.delivery).toMatchObject({ key: 'accepted', tone: 'ok' });
    expect(gridStatus(state({ jobs: [job('queued', 'render_pdf'), job('queued')] })).pdf).toBe('pending');
    expect(gridStatus(state({}, [attempt({ state: 'uncertain', decision_required: true })])).delivery).toMatchObject({ key: 'uncertain', tone: 'warn' });
  });
});

describe('history windows', () => {
  it('walks back in fixed windows from the end of the current period without overlap', () => {
    const first = historyWindow('2026-10-11', 0);
    const second = historyWindow('2026-10-11', 1);
    expect(first).toEqual({ from: '2026-04-13', to: '2026-10-11' });
    expect(second).toEqual({ from: '2025-10-13', to: '2026-04-12' });
    expect(historyWindow('2026-10-11', 2).to).toBe('2025-10-12');
  });
});

describe('the saved file name of a downloaded PDF', () => {
  it('takes the server name and refuses anything outside letters, digits, dots, dashes and underscores', () => {
    expect(filenameFromDisposition('attachment; filename="timesheet-2026-10-16-r2.pdf"')).toBe('timesheet-2026-10-16-r2.pdf');
    expect(filenameFromDisposition(null)).toBe('timesheet.pdf');
    expect(filenameFromDisposition('attachment')).toBe('timesheet.pdf');
    expect(filenameFromDisposition('attachment; filename="../../evil name.pdf"')).toBe('timesheet.pdf');
    expect(filenameFromDisposition('attachment; filename="report.exe"')).toBe('timesheet.pdf');
  });
});
