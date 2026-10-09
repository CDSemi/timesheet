import { describe, expect, it } from 'vitest';
import {
  ApiRequestError,
  type DeliveryAttempt,
  type FinalizationJob,
  type ReviewResponse,
  type RevisionSummary,
} from '../../src/client/api.ts';
import {
  buildSubmitBody,
  checklistSteps,
  classifySubmitError,
  deficitChoiceDays,
  deliveryStatus,
  dueReservations,
  type FormState,
  modeEndpoint,
  parseReviewHash,
  periodStatus,
  reviewLinkLabel,
  resetAfterStale,
  reviewDayRow,
  reviewHash,
  reviewMode,
  reviewSheetDay,
  reviewSheetWeeks,
  sessionLine,
  submitBlockers,
  unresolvedText,
} from '../../src/client/components/reviewModel.ts';
import { addDays } from '../../src/domain/dates.ts';
import type { ReviewSnapshot, SnapshotDay } from '../../src/domain/snapshot.ts';
import { dateTimeIn, instantOfWallTime } from './zoneOracle.ts';

const HASH = 'a'.repeat(64);

function day(workDate: string, overrides: Partial<SnapshotDay> = {}): SnapshotDay {
  return {
    work_date: workDate,
    day_class: 'normal',
    day_class_reason: 'weekday',
    holiday_name: null,
    calendar_version_id: 'cal-1',
    category: 'Worked',
    category_source: 'default',
    attendance_expected: true,
    wfh: false,
    notes: '',
    leave_minutes: 0,
    leave_kind: null,
    ot_leave: { kind_minutes: 0, consumed_minutes: 0, reversed_minutes: 0, mismatch: false },
    sessions: [],
    completeness: 'complete',
    policy_version_id: 'policy-1',
    calculation: null,
    calculation_error: null,
    ...overrides,
  };
}

function payload(overrides: Partial<ReviewSnapshot> = {}): ReviewSnapshot {
  return {
    schema: 'timesheet-review',
    schema_version: 1,
    employee: { name: 'Synthetic Person' },
    period: {
      payroll_date: '2026-10-09',
      nominal_payroll_date: '2026-10-09',
      period_start: '2026-09-28',
      period_end: '2026-10-11',
      due_local_date: '2026-10-12',
      due_local_time: '12:00',
      due_at_utc: '2026-10-12T19:00:00Z',
      is_exception: false,
    },
    reporting_zone: 'America/Los_Angeles',
    submission: { id: 'TS-2026-10-09-0123456789', revision_no: 1, sign_off_status: 'Signed by employee' },
    timesheet: { finalized_revision_no: null },
    calendar: { id: 'cal', version_ids: ['cal-1'] },
    policy: { version_ids: ['policy-1'] },
    days: [day('2026-09-28')],
    totals: { credited_minutes: 0, pending_days: 0 },
    ot_proposals: [],
    deficit_proposals: [],
    unresolved_inputs: [],
    ot_leave_reservations: [],
    recipients: { to: ['payroll@example.invalid'], cc: [], subject: 'Timesheet', body_text: 'Body', body_html: 'Body', template_version: 1 },
    signature: { attachment_id: 'sig-1', sha256: 'b'.repeat(64) },
    auto_image: { authorized: false, attachment_id: null },
    show_ot_on_pdf: true,
    ...overrides,
  };
}

function review(overrides: Partial<ReviewSnapshot> = {}, version = 7): ReviewResponse {
  return { payload: payload(overrides), payload_hash: HASH, expected_version: version, grantee_changes: [] };
}

const chooseDay = (workDate: string) => ({
  work_date: workDate,
  policy_version_id: 'policy-1',
  mode: 'choose_at_signoff' as const,
  deficit_minutes: 120,
  decision: 'pending',
  debit_minutes: 0,
  available_minutes_before: 0,
});

const unresolved = [{ work_date: '2026-09-29', reason: 'unconfirmed_breaks', detail: null }];

const form = (overrides: Partial<FormState> = {}): FormState => ({
  signerName: 'Synthetic Person',
  acknowledged: false,
  choices: {},
  reason: '',
  sendEmail: null,
  ...overrides,
});

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

const attempt = (overrides: Partial<DeliveryAttempt> = {}): DeliveryAttempt => ({
  id: 'att-1',
  revision_id: 'rev-1',
  attempt_no: 1,
  state: 'accepted',
  decision: null,
  decision_required: false,
  job: { state: 'succeeded', last_error: null },
  ...overrides,
});

const job = (state: string, kind = 'send_email'): FinalizationJob => ({ id: `job-${kind}`, kind, state });

describe('deep link', () => {
  it('builds and parses the review hash, which carries a payroll date and nothing else', () => {
    expect(reviewHash('2026-10-09')).toBe('#/review/2026-10-09');
    expect(parseReviewHash('#/review/2026-10-09')).toBe('2026-10-09');
  });

  it('refuses anything that is not exactly a calendar date', () => {
    for (const hash of ['#/review/', '#/review/2026-13-01', '#/review/2026-02-30', '#/review/2026-10-09?token=x', '#/review/2026-10-09/extra', '#/timesheet', '', '#/review/abc']) {
      expect(parseReviewHash(hash), hash).toBeNull();
    }
  });
});

describe('review mode and endpoint', () => {
  it('first sign-off when nothing is finalized', () => {
    expect(reviewMode(null)).toBe('signoff');
  });

  it('late review for an automatic revision that awaits review', () => {
    expect(reviewMode(revision({ origin: 'deadline', review_state: 'pending', revision_kind: 'original' }))).toBe('late_review');
  });

  it('correction once a signed revision exists', () => {
    expect(reviewMode(revision())).toBe('correction');
    expect(reviewMode(revision({ origin: 'deadline', review_state: 'signed', revision_kind: 'late_review' }))).toBe('correction');
  });

  it('posts to the matching route of the payroll date', () => {
    expect(modeEndpoint('signoff', '2026-10-09')).toBe('/api/timesheets/2026-10-09/signoff');
    expect(modeEndpoint('late_review', '2026-10-09')).toBe('/api/timesheets/2026-10-09/late-review');
    expect(modeEndpoint('correction', '2026-10-09')).toBe('/api/timesheets/2026-10-09/revisions');
  });
});

describe('sign-off requirements', () => {
  it('has no blocker for a complete first sign-off', () => {
    expect(submitBlockers(review().payload, 'signoff', form())).toEqual([]);
  });

  it('requires the signer name (blank and whitespace only)', () => {
    for (const signerName of ['', '   ', '\t']) {
      expect(submitBlockers(review().payload, 'signoff', form({ signerName })).map((b) => b.field)).toEqual(['signer_name']);
    }
  });

  it('refuses a name with a line break or more than 200 characters', () => {
    expect(submitBlockers(review().payload, 'signoff', form({ signerName: 'A\nB' })).map((b) => b.field)).toEqual(['signer_name']);
    expect(submitBlockers(review().payload, 'signoff', form({ signerName: 'x'.repeat(201) })).map((b) => b.field)).toEqual(['signer_name']);
    expect(submitBlockers(review().payload, 'signoff', form({ signerName: 'x'.repeat(200) }))).toEqual([]);
  });

  it('requires the saved signature image', () => {
    expect(submitBlockers(review({ signature: null }).payload, 'signoff', form()).map((b) => b.field)).toEqual(['signature']);
  });

  it('requires the acknowledgement only while incomplete evidence is listed', () => {
    const withGaps = review({ unresolved_inputs: unresolved }).payload;
    expect(submitBlockers(withGaps, 'signoff', form()).map((b) => b.field)).toEqual(['acknowledgement']);
    expect(submitBlockers(withGaps, 'signoff', form({ acknowledged: true }))).toEqual([]);
    expect(submitBlockers(review().payload, 'signoff', form())).toEqual([]);
  });

  it('requires one choice for every choose-mode deficit day and ignores other modes', () => {
    const deficits = review({
      deficit_proposals: [chooseDay('2026-09-29'), chooseDay('2026-09-30'), { ...chooseDay('2026-10-01'), mode: 'auto_deduct' }],
    }).payload;
    expect(deficitChoiceDays(deficits).map((item) => item.work_date)).toEqual(['2026-09-29', '2026-09-30']);
    expect(submitBlockers(deficits, 'signoff', form()).map((b) => b.field)).toEqual(['deficit_choices']);
    expect(submitBlockers(deficits, 'signoff', form({ choices: { '2026-09-29': 'deduct' } })).map((b) => b.field)).toEqual(['deficit_choices']);
    expect(submitBlockers(deficits, 'signoff', form({ choices: { '2026-09-29': 'deduct', '2026-09-30': 'waive' } }))).toEqual([]);
  });

  it('a correction needs a reason and an explicit email choice; a late review only the email choice', () => {
    expect(submitBlockers(review().payload, 'correction', form()).map((b) => b.field)).toEqual(['reason', 'send_email']);
    expect(submitBlockers(review().payload, 'correction', form({ reason: '   ', sendEmail: true })).map((b) => b.field)).toEqual(['reason']);
    expect(submitBlockers(review().payload, 'correction', form({ reason: 'Fixed a break', sendEmail: false }))).toEqual([]);
    expect(submitBlockers(review().payload, 'late_review', form()).map((b) => b.field)).toEqual(['send_email']);
    expect(submitBlockers(review().payload, 'late_review', form({ sendEmail: false }))).toEqual([]);
  });

  it('every blocker has words for the person to read', () => {
    const blockers = submitBlockers(review({ signature: null, unresolved_inputs: unresolved, deficit_proposals: [chooseDay('2026-09-29')] }).payload, 'correction', form({ signerName: '' }));
    expect(blockers.map((b) => b.field)).toEqual(['signer_name', 'signature', 'acknowledgement', 'deficit_choices', 'reason', 'send_email']);
    for (const blocker of blockers) expect(blocker.message.length).toBeGreaterThan(10);
  });
});

describe('request body', () => {
  it('binds the reviewed hash and the version it was read at', () => {
    expect(buildSubmitBody(review(), 'signoff', form({ signerName: '  Synthetic Person  ' }))).toEqual({
      expected_version: 7,
      reviewed_hash: HASH,
      signer_name: 'Synthetic Person',
      deficit_choices: [],
      incomplete_evidence_acknowledged: false,
    });
  });

  it('sends the acknowledgement only when there is incomplete evidence, and choices in date order', () => {
    const response = review({ unresolved_inputs: unresolved, deficit_proposals: [chooseDay('2026-09-30'), chooseDay('2026-09-29')] });
    const body = buildSubmitBody(response, 'signoff', form({ acknowledged: true, choices: { '2026-09-30': 'waive', '2026-09-29': 'deduct' } }));
    expect(body.incomplete_evidence_acknowledged).toBe(true);
    expect(body.deficit_choices).toEqual([
      { work_date: '2026-09-29', choice: 'deduct' },
      { work_date: '2026-09-30', choice: 'waive' },
    ]);
    expect(buildSubmitBody(review(), 'signoff', form({ acknowledged: true })).incomplete_evidence_acknowledged).toBe(false);
  });

  it('drops a choice for a day that is no longer a choose-mode day', () => {
    const body = buildSubmitBody(review({ deficit_proposals: [chooseDay('2026-09-29')] }), 'signoff', form({ choices: { '2026-09-29': 'deduct', '2026-10-05': 'waive' } }));
    expect(body.deficit_choices).toEqual([{ work_date: '2026-09-29', choice: 'deduct' }]);
  });

  it('adds the reason and the email choice for revisions only', () => {
    const base = form({ reason: '  Fixed a break  ', sendEmail: true });
    expect(buildSubmitBody(review(), 'correction', base)).toMatchObject({ reason: 'Fixed a break', send_email: true });
    const late = buildSubmitBody(review(), 'late_review', base);
    expect(late.send_email).toBe(true);
    expect(late).not.toHaveProperty('reason');
    const first = buildSubmitBody(review(), 'signoff', base);
    expect(first).not.toHaveProperty('reason');
    expect(first).not.toHaveProperty('send_email');
  });
});

describe('conflict and field errors', () => {
  const error = (status: number, code: string, details?: Record<string, unknown>) => new ApiRequestError(status, code, `server says ${code}`, details);

  it('a stale version, a stale review and an already finalized period lead to a fresh review', () => {
    for (const code of ['stale_version', 'stale_review', 'already_finalized', 'not_finalized', 'no_pending_review']) {
      const failure = classifySubmitError(error(409, code, { fresh_review_required: true }));
      expect(failure.kind, code).toBe('stale');
      expect(failure.message, code).toMatch(/nothing was submitted/i);
    }
  });

  it('says plainly that the period was already submitted', () => {
    expect(classifySubmitError(error(409, 'already_finalized')).message).toMatch(/already submitted/i);
  });

  it('a changed late review is refused with a pointer to a correction, not reloaded', () => {
    const failure = classifySubmitError(error(409, 'content_changed'));
    expect(failure.kind).toBe('refused');
    expect(failure.message).toMatch(/correction/i);
  });

  it('a 422 names the missing field', () => {
    const cases: Array<[string, string]> = [
      ['signer_name_required', 'signer_name'],
      ['invalid_signer_name', 'signer_name'],
      ['signature_required', 'signature'],
      ['acknowledgement_required', 'acknowledgement'],
      ['deficit_choice_required', 'deficit_choices'],
      ['unexpected_deficit_choice', 'deficit_choices'],
      ['duplicate_deficit_choice', 'deficit_choices'],
      ['reason_required', 'reason'],
      ['invalid_reason', 'reason'],
    ];
    for (const [code, field] of cases) {
      const failure = classifySubmitError(error(422, code));
      expect(failure, code).toMatchObject({ kind: 'field', field });
    }
  });

  it('anything else keeps the server message and code', () => {
    const failure = classifySubmitError(error(500, 'internal_error'));
    expect(failure.kind).toBe('other');
    expect(failure.message).toContain('internal_error');
    expect(classifySubmitError(new Error('boom')).kind).toBe('other');
  });

  it('after a stale review the old acknowledgement and choices are cleared, the typed text is kept', () => {
    const next = resetAfterStale(form({ acknowledged: true, choices: { '2026-09-29': 'deduct' }, reason: 'Because', sendEmail: false, signerName: 'Synthetic Person' }));
    expect(next).toEqual(form({ acknowledged: false, choices: {}, reason: 'Because', sendEmail: false, signerName: 'Synthetic Person' }));
  });
});

describe('period and delivery status from server fields', () => {
  it('is a draft until a revision is finalized', () => {
    expect(periodStatus({ finalized_revision_no: null, revision: null })).toMatchObject({ key: 'draft', text: 'Draft' });
    expect(periodStatus({ finalized_revision_no: null, revision: revision() }).key).toBe('draft');
  });

  it('names a manual sign-off', () => {
    expect(periodStatus({ finalized_revision_no: 1, revision: revision() })).toMatchObject({ key: 'submitted_manual', text: 'Submitted manually' });
  });

  it('names an automatic submission with review pending', () => {
    const status = periodStatus({ finalized_revision_no: 1, revision: revision({ origin: 'deadline', review_state: 'pending' }) });
    expect(status).toMatchObject({ key: 'submitted_auto_pending', text: 'Submitted automatically, review pending', tone: 'warn' });
  });

  it('names a late review and a correction with the revision number', () => {
    expect(periodStatus({ finalized_revision_no: 2, revision: revision({ revision_no: 2, revision_kind: 'late_review', origin: 'deadline', review_state: 'signed' }) }).key).toBe('reviewed_late');
    expect(periodStatus({ finalized_revision_no: 3, revision: revision({ revision_no: 3, revision_kind: 'correction' }) })).toMatchObject({ key: 'corrected', text: 'Corrected (revision 3)' });
  });

  it('words the link to the review by period status', () => {
    expect(reviewLinkLabel(null)).toBe('Review & sign off');
    expect(reviewLinkLabel(periodStatus({ finalized_revision_no: null, revision: null }))).toBe('Review & sign off');
    expect(reviewLinkLabel(periodStatus({ finalized_revision_no: 1, revision: revision({ origin: 'deadline', review_state: 'pending' }) }))).toBe('Review now');
    expect(reviewLinkLabel(periodStatus({ finalized_revision_no: 1, revision: revision() }))).toBe('Review or correct');
  });

  it('no delivery state before a revision', () => {
    expect(deliveryStatus(null, [], [])).toBeNull();
  });

  it('reports email not requested, queued and needing attention from the send job', () => {
    expect(deliveryStatus(revision({ send_requested: false }), [job('succeeded', 'render_pdf')], [])?.key).toBe('not_requested');
    expect(deliveryStatus(revision(), [job('queued')], [])?.key).toBe('queued');
    expect(deliveryStatus(revision(), [job('leased')], [])?.key).toBe('queued');
    expect(deliveryStatus(revision(), [job('intervention')], [])?.key).toBe('attention');
  });

  it('the newest attempt decides the delivery state', () => {
    const states: Array<[Partial<DeliveryAttempt>, string]> = [
      [{ state: 'accepted' }, 'accepted'],
      [{ state: 'sending' }, 'sending'],
      [{ state: 'preparing' }, 'sending'],
      [{ state: 'failed_temporary' }, 'retrying'],
      [{ state: 'failed_permanent' }, 'failed'],
      [{ state: 'uncertain', decision_required: true }, 'uncertain'],
      [{ state: 'uncertain', decision: 'mark_delivered' }, 'marked_delivered'],
    ];
    for (const [overrides, key] of states) {
      expect(deliveryStatus(revision(), [job('succeeded')], [attempt(overrides), attempt({ id: 'older', attempt_no: 0, state: 'failed_permanent' })])?.key, key).toBe(key);
    }
  });

  it('an uncertain delivery asks for a decision in a warning tone', () => {
    expect(deliveryStatus(revision(), [], [attempt({ state: 'uncertain', decision_required: true })])).toMatchObject({ tone: 'warn', text: 'Delivery uncertain: your decision is needed' });
  });
});

describe('review content helpers', () => {
  it('lists only unconsumed reservations whose use is due', () => {
    const reservation = (id: string, reserved: number, due: boolean) => ({ request_id: id, leave_date: '2026-10-05', approved_minutes: 480, reserved_minutes: reserved, consumed_minutes: 480 - reserved, use_due: due });
    const due = dueReservations(review({ ot_leave_reservations: [reservation('a', 480, true), reservation('b', 480, false), reservation('c', 0, true)] }).payload);
    expect(due.map((item) => item.request_id)).toEqual(['a']);
  });

  it('words every unresolved reason', () => {
    expect(unresolvedText({ work_date: '2026-09-29', reason: 'open_session', detail: null })).toBe('Open session: OT stays pending');
    expect(unresolvedText({ work_date: '2026-09-29', reason: 'unconfirmed_breaks', detail: null })).toBe('Breaks not confirmed: OT stays pending');
    expect(unresolvedText({ work_date: '2026-09-29', reason: 'no_records', detail: null })).toBe('No record on a day with expected attendance');
    expect(unresolvedText({ work_date: '2026-09-29', reason: 'calculation_error', detail: 'overlap' })).toBe('Calculation problem (overlap)');
    expect(unresolvedText({ work_date: '2026-09-29', reason: 'something_new', detail: null })).toBe('something new');
  });

  it('shows session times in the reporting zone, never the device zone, in every season', () => {
    for (const date of ['2026-01-12', '2026-07-13']) {
      const at = (time: string, zone = 'America/Los_Angeles', day = date) => instantOfWallTime(day, time, zone).replace('.000Z', 'Z');
      const session = {
        id: 's',
        start_utc: at('09:00'),
        end_utc: at('17:30'),
        source: 'manual',
        breaks_confirmed: true,
        breaks: [{ start_utc: at('12:00'), end_utc: at('12:30'), counts_as_work: false }],
      };
      expect(sessionLine(session, date, 'America/Los_Angeles'), date).toBe('09:00 to 17:30, 1 break');
      // The same instants read in another zone: the oracle gives the wall clock, the date note follows the oracle too.
      const zone = 'Asia/Ho_Chi_Minh';
      const [startDate, startTime] = dateTimeIn(session.start_utc, zone).split(' ');
      const [endDate, endTime] = dateTimeIn(session.end_utc, zone).split(' ');
      expect(sessionLine(session, date, zone), date).toBe(`${startTime} to ${endTime} (${startDate} to ${endDate}), 1 break`);
      expect(sessionLine({ ...session, end_utc: null, breaks: [], breaks_confirmed: false }, date, 'America/Los_Angeles'), date).toBe('09:00 to running, breaks unconfirmed');
    }
  });

  it('counts breaks in the plural', () => {
    const at = (time: string) => instantOfWallTime('2026-03-10', time, 'America/Los_Angeles').replace('.000Z', 'Z');
    const breaks = [
      { start_utc: at('11:00'), end_utc: at('11:15'), counts_as_work: false },
      { start_utc: at('13:00'), end_utc: at('13:30'), counts_as_work: false },
    ];
    const session = { id: 's', start_utc: at('09:00'), end_utc: at('18:00'), source: 'manual', breaks_confirmed: true, breaks };
    expect(sessionLine(session, '2026-03-10', 'America/Los_Angeles')).toBe('09:00 to 18:00, 2 breaks');
    expect(sessionLine({ ...session, breaks: [] }, '2026-03-10', 'America/Los_Angeles')).toBe('09:00 to 18:00, no breaks');
  });

  it('passes the server minutes through and words the day status', () => {
    const calc = { regular_minutes: 480, nonworking_minutes: 0, normal_excess_minutes: 0, eligible_minutes: 30, credited_minutes: 30 };
    const row = reviewDayRow(day('2026-09-28', { calculation: calc }), 'America/Los_Angeles');
    expect(row).toMatchObject({ weekday: 'Mon', calendar: 'Work day', category: 'Worked', regular: 480, offCalendar: 0, credited: 30, nonworking: false });
    expect(row.status).toEqual({ key: 'complete', text: 'complete', shape: 'circle' });
    expect(reviewDayRow(day('2026-09-28'), 'America/Los_Angeles')).toMatchObject({ regular: null, offCalendar: null, credited: null });
  });

  it('maps every completeness of the payload to a status with a shape and words', () => {
    const status = (overrides: Partial<SnapshotDay>) => reviewDayRow(day('2026-09-29', overrides), 'America/Los_Angeles').status;
    expect(status({ completeness: 'incomplete' })).toMatchObject({ key: 'open_session', shape: 'diamond' });
    expect(status({ completeness: 'incomplete_breaks' })).toMatchObject({ key: 'confirm_breaks', shape: 'diamond' });
    expect(status({ completeness: 'no_records' })).toMatchObject({ key: 'missing', shape: 'square' });
    expect(status({ completeness: 'no_records', attendance_expected: false })).toMatchObject({ key: 'not_expected', shape: 'bar' });
    expect(status({ completeness: 'calculation_error', calculation_error: 'overlap' })).toMatchObject({ key: 'error', shape: 'triangle' });
  });

  it('names holidays, non-working days and leave without recomputing minutes', () => {
    const row = reviewDayRow(day('2026-10-03', { day_class: 'nonworking', holiday_name: null, category: 'Vacation', leave_minutes: 240, leave_kind: 'vacation', wfh: true, notes: 'private' }), 'America/Los_Angeles');
    expect(row).toMatchObject({ weekday: 'Sat', calendar: 'Non-working day', nonworking: true, leave: 'vacation leave 4h 00m', wfh: true, notes: 'private' });
    expect(reviewDayRow(day('2026-10-12', { day_class: 'normal', holiday_name: 'Synthetic Day' }), 'America/Los_Angeles').calendar).toBe('Synthetic Day');
    expect(reviewDayRow(day('2026-10-12', { day_class: null }), 'America/Los_Angeles').calendar).toBe('unclassified');
  });
});

describe('the review payload on the sheet', () => {
  const zone = 'America/Los_Angeles';
  const at = (date: string, time: string, inZone = zone) => instantOfWallTime(date, time, inZone).replace('.000Z', 'Z');
  const calc = (credited: number | null) => ({ regular_minutes: 480, nonworking_minutes: 0, normal_excess_minutes: 0, eligible_minutes: 30, credited_minutes: credited });
  const session = (date: string, start: string, end: string | null, confirmed = true, breaks = 1) => ({
    id: `s-${date}`,
    start_utc: at(date, start),
    end_utc: end === null ? null : at(date, end),
    source: 'manual',
    breaks_confirmed: confirmed,
    breaks: Array.from({ length: breaks }, () => ({ start_utc: at(date, '12:00'), end_utc: at(date, '12:30'), counts_as_work: false })),
  });

  it('shows a complete day with its payload minutes as h:mm, times in the reporting zone, and no Check blank', () => {
    const row = reviewSheetDay(day('2026-09-28', { calculation: calc(90), sessions: [session('2026-09-28', '09:00', '17:30')] }), zone);
    expect(row).toMatchObject({ workDate: '2026-09-28', weekday: 'Mon', dateText: '09/28', name: 'Mon 2026-09-28', today: false, nonworking: false });
    expect(row.time.ranges.map((range) => range.text)).toEqual(['09:00-17:30']);
    expect(row.time).toMatchObject({ note: '1 break', attention: false });
    expect(row.ot).toEqual({ kind: 'minutes', text: '1:30' });
    expect(row.check).toEqual({ key: 'complete', text: 'Complete', shape: 'circle' });
    expect(row.details).toEqual({ regular: '8:00', offCalendar: '0:00' });
  });

  it('keeps the reporting-zone time of a session whatever the device zone is', () => {
    const row = reviewSheetDay(day('2026-01-12', { sessions: [session('2026-01-12', '23:00', null, false, 0)] }), zone);
    expect(row.time.ranges[0]?.text).toBe('23:00');
    const other = reviewSheetDay(day('2026-01-12', { sessions: [session('2026-01-12', '23:00', null, false, 0)] }), 'Asia/Ho_Chi_Minh');
    expect(other.time.ranges[0]?.startDate, 'another zone shows another local date').not.toBeNull();
  });

  it('maps every completeness to the OT cell and the Check cell of the PDF rule', () => {
    const cell = (overrides: Partial<SnapshotDay>) => {
      const row = reviewSheetDay(day('2026-09-29', overrides), zone);
      return { ot: row.ot.kind, check: row.check?.key ?? null, attention: row.time.attention };
    };
    expect(cell({ completeness: 'complete', calculation: calc(0) })).toEqual({ ot: 'minutes', check: 'complete', attention: false });
    expect(cell({ completeness: 'incomplete', sessions: [session('2026-09-29', '09:00', null)] })).toEqual({ ot: 'pending', check: 'running', attention: false });
    expect(cell({ completeness: 'incomplete', sessions: [session('2026-09-29', '09:00', '10:00')] })).toMatchObject({ ot: 'pending', check: 'open_session' });
    expect(cell({ completeness: 'incomplete_breaks' })).toEqual({ ot: 'pending', check: 'confirm_breaks', attention: true });
    expect(cell({ completeness: 'no_records' })).toEqual({ ot: 'blank', check: 'missing', attention: true });
    expect(cell({ completeness: 'no_records', attendance_expected: false })).toEqual({ ot: 'blank', check: null, attention: false });
    expect(cell({ completeness: 'calculation_error', calculation_error: 'overlap' })).toMatchObject({ ot: 'na', check: 'error' });
  });

  it('writes the label, the leave line and the note in full', () => {
    const holiday = reviewSheetDay(day('2026-11-26', { day_class: 'nonworking', holiday_name: 'Synthetic Day', category: 'Holiday' }), zone);
    expect(holiday).toMatchObject({ nonworking: true, label: { main: 'Synthetic Day', lines: ['Holiday'], note: false } });
    const leave = reviewSheetDay(day('2026-09-30', { category: 'Vacation', leave_minutes: 240, leave_kind: 'vacation', wfh: true, notes: 'private note' }), zone);
    expect(leave.label.main).toBe('Vacation');
    expect(leave.label.lines).toEqual(['Work from home', 'Leave 4:00']);
    expect(leave.noteText).toBe('private note');
    expect(reviewSheetDay(day('2026-09-30', { day_class: null, holiday_name: null, category: null }), zone).label.lines).toEqual(['Not in the calendar']);
  });

  it('groups the 14 days of a period into two Monday to Sunday weeks', () => {
    const days = Array.from({ length: 14 }, (_, index) => day(addDays('2026-09-28', index)));
    const weeks = reviewSheetWeeks(days, zone);
    expect(weeks.map((week) => [week.index, week.rangeText, week.days.length])).toEqual([
      [1, '09/28/2026 - 10/04/2026', 7],
      [2, '10/05/2026 - 10/11/2026', 7],
    ]);
  });
});

describe('the checklist beside the sheet', () => {
  it('lists the three steps in order with their states in words', () => {
    const ready = payload();
    expect(checklistSteps(ready, form(), false)).toEqual([
      { key: 'attention', title: 'Days that need attention', state: 'Nothing to resolve' },
      { key: 'email', title: 'Email and PDF', state: 'Recipients and signature ready' },
      { key: 'sign', title: 'Sign', state: 'Waiting for your signature' },
    ]);
  });

  it('says what still needs the person: acknowledgement, then deficit choices', () => {
    const open = payload({ unresolved_inputs: unresolved, deficit_proposals: [chooseDay('2026-09-30')] });
    expect(checklistSteps(open, form(), false)[0]?.state).toBe('1 day needs your acknowledgement');
    expect(checklistSteps(open, form({ acknowledged: true }), false)[0]?.state).toBe('1 deficit day needs your choice');
    expect(checklistSteps(open, form({ acknowledged: true, choices: { '2026-09-30': 'waive' } }), false)[0]?.state).toBe('Acknowledged');
  });

  it('names a missing signature or recipient and the imported lock', () => {
    expect(checklistSteps(payload({ signature: null }), form(), false)[1]?.state).toBe('No signature image saved');
    expect(checklistSteps(payload({ recipients: { ...payload().recipients, to: [] } }), form(), false)[1]?.state).toBe('No recipient set');
    expect(checklistSteps(payload(), form(), true)[2]?.state).toBe('Locked: imported history');
  });
});
