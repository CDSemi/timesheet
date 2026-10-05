import { useCallback, useEffect, useState } from 'react';
import { api, type HistoryEvent, type HistoryPage } from './api.ts';
import { DeliveryHistory } from './components/DeliveryHistory.tsx';
import { describeError } from './components/errors.ts';
import { displayZone, instantText } from './components/format.ts';
import { changedFields, operationText } from './components/otModel.ts';
import { historyActorBadge, isSystemOperation, shareOperationText } from './components/sharingModel.ts';

const PAGE_SIZE = 25;

function EventItem({ event }: { event: HistoryEvent }) {
  const changes = changedFields(event.before, event.after);
  const actor = historyActorBadge(event);
  const label = shareOperationText(event.operation) ?? operationText(event.operation);
  return (
    <li className="history-item" data-operation={event.operation} data-via-share={event.via_share}>
      <div className="history-head">
        <strong>{label}</strong>
        <span className="mono muted">{instantText(event.occurred_at, displayZone)}</span>
        {actor !== null && (
          <span className="badge" data-history-actor={event.via_share ? 'grantee' : isSystemOperation(event.operation) ? 'system' : 'other'}>
            {actor}
          </span>
        )}
      </div>
      <p className="history-reason" data-reason={event.reason ?? ''}>
        Reason: {event.reason ?? 'none given'}
      </p>
      {changes.length > 0 && (
        <div className="table-wrap">
          <table aria-label={`Changes for ${label}`}>
            <thead>
              <tr>
                <th>Field</th>
                <th>Before</th>
                <th>After</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => (
                <tr key={change.field} data-field={change.field}>
                  <td className="mono">{change.field}</td>
                  <td className="mono" data-side="before">
                    {change.before}
                  </td>
                  <td className="mono" data-side="after">
                    {change.after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </li>
  );
}

/** The caller's own audit trail, newest first, paged with the server's per-user cursor. */
export function HistoryScreen() {
  const [events, setEvents] = useState<HistoryEvent[] | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadPage = useCallback(async (before: string | null) => {
    setBusy(true);
    try {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE), ...(before === null ? {} : { before }) });
      const page = await api<HistoryPage>('GET', `/api/history?${query.toString()}`);
      setEvents((current) => (before === null ? page.audit_events : [...(current ?? []), ...page.audit_events]));
      setCursor(page.next_before);
      setMessage(null);
    } catch (caught) {
      setMessage(describeError(caught));
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void loadPage(null);
  }, [loadPage]);

  return (
    <div className="stack">
      <h1>History</h1>
      <DeliveryHistory />
      <section className="stack" aria-labelledby="changes-title">
        <h2 id="changes-title">Recorded changes</h2>
        <p className="hint">
          Changes to your days, sessions, OT leave and sharing, newest first, with the values before and after and the reason given. A change made by someone you share with
          names them.
        </p>
        {message !== null && (
          <p className="error" role="alert">
            {message}
          </p>
        )}
        {events === null ? (
          message === null && <p className="muted">Loading…</p>
        ) : events.length === 0 ? (
          <p className="muted">Nothing has been recorded yet. Changes to days, sessions and OT leave appear here.</p>
        ) : (
          <ul className="plain history-list" aria-label="Audit events">
            {events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))}
          </ul>
        )}
        {cursor !== null && (
          <div className="button-row">
            <button type="button" className="secondary" disabled={busy} onClick={() => void loadPage(cursor)}>
              Load older events
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
