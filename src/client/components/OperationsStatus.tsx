import { useCallback, useEffect, useState } from 'react';
import {
  api,
  type DeliveryAttemptState,
  type OperationsStatus as OperationsStatusData,
  type RecipientAddresses,
  type SendJobState,
  type SubmissionStatus,
} from '../api.ts';
import { describeError } from './errors.ts';
import { displayZone, instantText } from './format.ts';

/*
 * Operations status for administrators (F-3, F-Q3 (b), WP3-T13D). It shows the state of the
 * pipeline and, per person and period, the revision, PDF and delivery states with redacted fault
 * codes and recipient addresses. It never shows, and the server never sends, a timesheet detail,
 * a template or message content. Colour always comes with text. Reads only.
 */

type Tone = 'neutral' | 'ok' | 'warn' | 'error';

interface Label {
  text: string;
  tone: Tone;
}

const TONE_CLASS: Record<Tone, string> = { neutral: '', ok: 'badge-ok', warn: 'badge-warn', error: 'badge-error' };

const RUNNER: Record<OperationsStatusData['runner']['state'], Label> = {
  running: { text: 'Running', tone: 'ok' },
  stale: { text: 'No recent heartbeat', tone: 'error' },
  never: { text: 'Never seen', tone: 'warn' },
};

const JOB_LABELS: Record<SendJobState, string> = {
  queued: 'Queued',
  leased: 'Running',
  succeeded: 'Done',
  intervention: 'Needs attention',
  cancelled: 'Cancelled',
};

const DELIVERY_LABELS: Record<DeliveryAttemptState, string> = {
  preparing: 'Preparing',
  sending: 'Sending',
  accepted: 'Delivered',
  failed_temporary: 'Failed, will retry',
  failed_permanent: 'Failed',
  uncertain: 'Uncertain',
};

function pdfLabel(row: SubmissionStatus): Label {
  switch (row.pdf.state) {
    case 'ready':
      return { text: 'PDF ready', tone: 'ok' };
    case 'pending':
      return { text: 'PDF pending', tone: 'warn' };
    case 'failed':
      return { text: 'PDF failed', tone: 'error' };
    default:
      return { text: 'No PDF yet', tone: 'neutral' };
  }
}

function deliveryLabel(row: SubmissionStatus): Label {
  const { delivery } = row;
  if (delivery.decision_required) return { text: 'Decision needed', tone: 'error' };
  switch (delivery.state) {
    case 'accepted':
      return { text: DELIVERY_LABELS.accepted, tone: 'ok' };
    case 'failed_permanent':
      return { text: DELIVERY_LABELS.failed_permanent, tone: 'error' };
    case 'uncertain':
      return { text: 'Delivery recorded as uncertain', tone: 'warn' };
    case 'failed_temporary':
    case 'preparing':
    case 'sending':
      return { text: DELIVERY_LABELS[delivery.state], tone: 'warn' };
    default:
      return row.revision.send_requested ? { text: 'Not started', tone: 'warn' } : { text: 'Email not requested', tone: 'neutral' };
  }
}

function reviewLabel(row: SubmissionStatus): Label {
  return row.revision.review_state === 'signed' ? { text: 'Signed', tone: 'ok' } : { text: 'Review pending', tone: 'warn' };
}

function Badge({ label, name }: { label: Label; name: string }) {
  return (
    <span className={`badge ${TONE_CLASS[label.tone]}`} data-status={name}>
      {label.text}
    </span>
  );
}

function addressText(value: RecipientAddresses): string {
  const to = value.to.length === 0 ? 'none' : value.to.join(', ');
  return value.cc.length === 0 ? `To ${to}` : `To ${to}; Cc ${value.cc.join(', ')}`;
}

function Instant({ value }: { value: string }) {
  return <time dateTime={value}>{instantText(value, displayZone)}</time>;
}

function StatusPanel({ status }: { status: OperationsStatusData }) {
  const runner = RUNNER[status.runner.state];
  const sender = status.sender.configured === null ? 'Unknown' : status.sender.configured ? 'Configured' : 'Not configured';
  const mode =
    status.sender.outbound_mode === 'capture'
      ? 'Capture only (nothing leaves the server)'
      : status.sender.outbound_mode === 'smtp'
        ? 'SMTP (real sending)'
        : 'Unknown';
  return (
    <div className="stack" data-ops="status">
      <dl className="facts">
        <div>
          <dt>Sender address</dt>
          <dd data-fact="sender">{sender}</dd>
        </div>
        <div>
          <dt>Outbound mode</dt>
          <dd data-fact="mode">{mode}</dd>
        </div>
        <div>
          <dt>Job runner</dt>
          <dd data-fact="runner">
            <Badge label={runner} name="runner" />
            {status.runner.heartbeat_at !== null && (
              <>
                {' '}
                <Instant value={status.runner.heartbeat_at} />
              </>
            )}
          </dd>
        </div>
        <div>
          <dt>Automatic submission starts</dt>
          <dd data-fact="activation">{status.activation.active_from === null ? 'Not activated' : <Instant value={status.activation.active_from} />}</dd>
        </div>
      </dl>
      <div>
        <h3>Jobs</h3>
        <dl className="facts ops-counts" data-ops="jobs">
          {(Object.keys(JOB_LABELS) as SendJobState[]).map((state) => (
            <div key={state}>
              <dt>{JOB_LABELS[state]}</dt>
              <dd data-job-state={state}>{status.jobs[state]}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div>
        <h3>Delivery attempts</h3>
        <dl className="facts ops-counts" data-ops="deliveries">
          {(Object.keys(DELIVERY_LABELS) as DeliveryAttemptState[]).map((state) => (
            <div key={state}>
              <dt>{DELIVERY_LABELS[state]}</dt>
              <dd data-delivery-state={state}>{status.deliveries[state]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

function SubmissionRow({ row }: { row: SubmissionStatus }) {
  const pdf = pdfLabel(row);
  const delivery = deliveryLabel(row);
  const deliveryCode = row.delivery.fault_code ?? row.delivery.job_fault_code;
  const showFrozen = row.recipients.frozen !== null;
  return (
    <tr data-submission-user={row.user_id} data-submission-period={row.period.payroll_date}>
      <th scope="row" className="ops-person" data-label="Person">
        {row.display_name}
      </th>
      <td data-label="Period">
        <span>{row.period.payroll_date}</span>
        <span className="muted hint">
          {row.period.period_start} to {row.period.period_end}
        </span>
      </td>
      <td data-label="Due">
        <Instant value={row.period.due_at} />
      </td>
      <td data-label="Revision">
        <span>Revision {row.revision.no}</span>
        <span className="muted hint">{row.revision.origin === 'deadline' ? 'Automatic submission' : 'By the employee'}</span>
      </td>
      <td data-label="Review">
        <Badge label={reviewLabel(row)} name="review" />
      </td>
      <td data-label="PDF">
        <Badge label={pdf} name="pdf" />
        {row.pdf.fault_code !== null && <span className="ops-code mono hint">{row.pdf.fault_code}</span>}
      </td>
      <td data-label="Delivery">
        <Badge label={delivery} name="delivery" />
        {deliveryCode !== null && <span className="ops-code mono hint">{deliveryCode}</span>}
        {row.delivery.attempts > 0 && (
          <span className="muted hint">
            {row.delivery.attempts} attempt{row.delivery.attempts === 1 ? '' : 's'}
          </span>
        )}
      </td>
      <td data-label="Recipients" className="ops-recipients">
        <span data-recipients="effective">
          <span className="muted hint">Settings</span> {addressText(row.recipients.effective)}
        </span>
        {showFrozen && row.recipients.frozen !== null && (
          <span data-recipients="frozen">
            <span className="muted hint">Sent to</span> {addressText(row.recipients.frozen)}
          </span>
        )}
      </td>
    </tr>
  );
}

/** The status panel and the per-person submission and delivery table; it loads and refreshes itself. */
export function OperationsStatus() {
  const [status, setStatus] = useState<OperationsStatusData | null>(null);
  const [rows, setRows] = useState<SubmissionStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [operations, submissions] = await Promise.all([
        api<{ operations: OperationsStatusData }>('GET', '/api/admin/operations'),
        api<{ submissions: SubmissionStatus[] }>('GET', '/api/admin/submissions'),
      ]);
      setStatus(operations.operations);
      setRows(submissions.submissions);
      setError(null);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <section className="card stack ops-status" aria-label="Operations status" aria-busy={busy}>
        <div className="toolbar">
          <h2>Operations status</h2>
          <button type="button" className="secondary" onClick={() => void load()} disabled={busy}>
            Refresh
          </button>
        </div>
        <p className="hint muted">
          Delivery pipeline health. Recipient addresses are shown; timesheet details, templates and message content never are.
        </p>
        {error !== null && (
          <p className="error" role="alert" data-error="operations">
            {error}
          </p>
        )}
        {status === null ? error === null && <p className="muted">Loading status…</p> : <StatusPanel status={status} />}
      </section>
      <section className="card stack ops-status" aria-label="Submissions and delivery">
        <h2>Submissions and delivery</h2>
        <p className="hint muted">The latest revision of each person and period, most recent deadline first.</p>
        {rows === null ? (
          error === null && <p className="muted">Loading submissions…</p>
        ) : rows.length === 0 ? (
          <p className="muted" data-ops="empty">
            No period has been submitted yet. Submitted periods appear here with their delivery state.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="ops-table">
              <caption className="sr-only">Submission and delivery status per person and period</caption>
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Period</th>
                  <th scope="col">Due</th>
                  <th scope="col">Revision</th>
                  <th scope="col">Review</th>
                  <th scope="col">PDF</th>
                  <th scope="col">Delivery</th>
                  <th scope="col">Recipients</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <SubmissionRow key={`${row.user_id}:${row.period.payroll_date}`} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
