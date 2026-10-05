import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiRequestError, type CurrentPeriods, type DeliveryRecord, type FinalizationResponse, type Period, requestFailure } from '../api.ts';
import { DeliveryRevision, type PendingAction } from './DeliveryRevision.tsx';
import {
  buildRevisionRows,
  decisionFailureText,
  type DeliveryAction,
  filenameFromDisposition,
  type HistoryPeriod,
  historyWindow,
  resendFailureText,
  type RevisionRow,
} from './deliveryModel.ts';
import { describeError } from './errors.ts';
import { displayZone } from './format.ts';

/*
 * The owner's submissions: every revision with its origin and review state, the PDF, the delivery
 * attempts, an explicit resend and the decision on an uncertain delivery. Everything shown is a
 * server field. A few windows of periods are read at a time (the server lists periods, never
 * revisions), and every action asks the server and then reads the state again: nothing is assumed.
 */

interface Loaded {
  periods: HistoryPeriod[];
  deliveries: DeliveryRecord[];
  /** The end of the period that contains today: the anchor the windows walk back from. */
  currentEnd: string;
  windows: number;
}

type RowMessage = { tone: 'ok' | 'error'; text: string };

interface PendingState {
  revisionKey: string;
  payrollDate: string;
  action: PendingAction['action'];
  attemptId: string | null;
}

async function fetchWindow(currentEnd: string, index: number): Promise<HistoryPeriod[]> {
  const { from, to } = historyWindow(currentEnd, index);
  const { periods } = await api<{ periods: Period[] }>('GET', `/api/periods?from=${from}&to=${to}`);
  return Promise.all(
    periods
      .filter((period) => period.relation !== 'future')
      .map(async (period) => ({
        period,
        finalization: await api<FinalizationResponse>('GET', `/api/timesheets/${period.payroll_date}/finalization`),
      })),
  );
}

async function fetchDeliveries(): Promise<DeliveryRecord[]> {
  return (await api<{ deliveries: DeliveryRecord[] }>('GET', '/api/deliveries')).deliveries;
}

async function fetchAll(windows: number): Promise<Loaded> {
  const current = await api<CurrentPeriods>('GET', '/api/periods/current');
  const currentEnd = current.in_progress.period_end;
  const [deliveries, ...pages] = await Promise.all([
    fetchDeliveries(),
    ...Array.from({ length: windows }, (_, index) => fetchWindow(currentEnd, index)),
  ]);
  return { periods: pages.flat(), deliveries: deliveries ?? [], currentEnd, windows };
}

const RELEASE_DELAY_MS = 1000;

/**
 * Fetches a revision's final PDF through the owner-only route and hands it to the browser as a
 * download. Nothing is cached or kept: the object URL is released right after the click. The
 * saved name comes from the response's Content-Disposition, reduced to a safe name.
 */
async function downloadRevisionPdf(revisionId: string): Promise<string> {
  const response = await fetch(`/api/revisions/${revisionId}/pdf`, { credentials: 'same-origin' });
  if (!response.ok) throw await requestFailure(response);
  const blob = await response.blob();
  const name = filenameFromDisposition(response.headers.get('content-disposition'));
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  // Released a moment later so the browser has started reading the blob.
  setTimeout(() => URL.revokeObjectURL(url), RELEASE_DELAY_MS);
  return name;
}

const RESULT_TEXT: Record<DeliveryAction, string> = {
  resend: 'A new delivery attempt was queued. It sends the same PDF; use Refresh to follow it.',
  resend_uncertain: 'The same PDF was queued for another delivery attempt. Use Refresh to follow it.',
  mark_delivered: 'Recorded: you marked this attempt as delivered. Nothing was sent.',
};

export function DeliveryHistory() {
  const [data, setData] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<PendingState | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Readonly<Record<string, RowMessage>>>({});
  const opener = useRef<HTMLElement | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async (windows: number) => {
    setLoading(true);
    try {
      setData(await fetchAll(windows));
      setLoadError(null);
    } catch (caught) {
      setLoadError(describeError(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  function say(key: string, message: RowMessage | null) {
    setMessages((current) => {
      const rest = Object.fromEntries(Object.entries(current).filter(([name]) => name !== key));
      return message === null ? rest : { ...rest, [key]: message };
    });
  }

  async function showOlder() {
    if (data === null || loading) return;
    setLoading(true);
    try {
      const older = await fetchWindow(data.currentEnd, data.windows);
      setData({ ...data, periods: [...data.periods, ...older], windows: data.windows + 1 });
      setLoadError(null);
    } catch (caught) {
      setLoadError(describeError(caught));
    } finally {
      setLoading(false);
    }
  }

  /** Reads the deliveries and the one period again after an action (or a refusal that shows the list is stale). */
  async function refreshAround(payrollDate: string) {
    try {
      const [deliveries, finalization] = await Promise.all([
        fetchDeliveries(),
        api<FinalizationResponse>('GET', `/api/timesheets/${payrollDate}/finalization`).catch(() => null),
      ]);
      setData((current) =>
        current === null
          ? current
          : {
              ...current,
              deliveries,
              periods: current.periods.map((item) =>
                item.period.payroll_date === payrollDate && finalization !== null ? { ...item, finalization } : item,
              ),
            },
      );
    } catch (caught) {
      setLoadError(describeError(caught));
    }
  }

  async function download(row: RevisionRow) {
    say(row.key, null);
    try {
      const name = await downloadRevisionPdf(row.revisionId);
      say(row.key, { tone: 'ok', text: `Downloaded ${name}.` });
    } catch (caught) {
      const notReady = caught instanceof ApiRequestError && caught.code === 'pdf_not_ready';
      say(row.key, { tone: 'error', text: notReady ? 'The PDF of this revision is not ready yet.' : describeError(caught) });
    }
  }

  function ask(row: RevisionRow, action: DeliveryAction, attemptId: string | null, trigger: HTMLElement) {
    opener.current = trigger;
    say(row.key, null);
    setConfirmError(null);
    setPending({ revisionKey: row.key, payrollDate: row.payrollDate, action, attemptId });
  }

  function cancel() {
    setPending(null);
    setConfirmError(null);
    opener.current?.focus();
  }

  async function confirm() {
    if (pending === null || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setConfirmError(null);
    const { revisionKey, payrollDate, action, attemptId } = pending;
    try {
      if (action === 'resend') {
        await api('POST', `/api/revisions/${revisionKey}/resend`, {});
      } else {
        await api('POST', `/api/deliveries/${attemptId ?? ''}/decision`, { decision: action === 'mark_delivered' ? 'mark_delivered' : 'resend' });
      }
      setPending(null);
      say(revisionKey, { tone: 'ok', text: RESULT_TEXT[action] });
      await refreshAround(payrollDate);
      document.querySelector<HTMLElement>(`[data-revision="${revisionKey}"] h3`)?.focus();
    } catch (caught) {
      const text = action === 'resend' ? resendFailureText(caught) : decisionFailureText(caught);
      if (caught instanceof ApiRequestError && (caught.status === 404 || caught.status === 409)) {
        // The situation changed (another window, a runner): show why, and read the state again.
        setPending(null);
        say(revisionKey, { tone: 'error', text });
        await refreshAround(payrollDate);
      } else {
        setConfirmError(text);
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const rows = data === null ? [] : buildRevisionRows(data.periods, data.deliveries);

  return (
    <section className="stack" aria-labelledby="submissions-title" data-history="submissions">
      <div className="toolbar">
        <div>
          <h2 id="submissions-title">Submissions</h2>
          <p className="hint muted">
            Each submitted revision of your timesheets, its PDF and every delivery attempt. A revision never changes: a correction adds a new one. Times are shown in {displayZone}.
          </p>
        </div>
        <button type="button" className="secondary" disabled={loading || busy} onClick={() => void load(data?.windows ?? 1)}>
          Refresh
        </button>
      </div>

      {loadError !== null && (
        <p className="error" role="alert">
          {loadError}
        </p>
      )}
      {data === null ? (
        loadError === null && <p className="muted">Loading submissions…</p>
      ) : rows.length === 0 ? (
        <p className="muted" data-history-empty="true">
          No period has been submitted in this range. When you sign off a period, or its deadline passes with automatic submission on, its revision, PDF and delivery attempts appear here.
        </p>
      ) : (
        <ul className="plain history-list" aria-label="Submitted revisions">
          {rows.map((row) => (
            <DeliveryRevision
              key={row.key}
              row={row}
              busy={busy}
              pending={pending !== null && pending.revisionKey === row.key ? { action: pending.action, attemptId: pending.attemptId } : null}
              message={messages[row.key] ?? null}
              confirmError={pending !== null && pending.revisionKey === row.key ? confirmError : null}
              onDownload={(item) => void download(item)}
              onResend={(item, trigger) => ask(item, 'resend', null, trigger)}
              onDecide={(item, attempt, action, trigger) => ask(item, action, attempt.id, trigger)}
              onConfirm={() => void confirm()}
              onCancel={cancel}
            />
          ))}
        </ul>
      )}
      {data !== null && (
        <div className="button-row">
          <button type="button" className="secondary" disabled={loading} onClick={() => void showOlder()}>
            Show older periods
          </button>
        </div>
      )}
    </section>
  );
}
