import { useEffect, useState } from 'react';
import type { OtLedgerEntry, OtSummary, Requester } from '../api.ts';
import { describeError } from './errors.ts';
import { ledgerEntryLabel } from '../importModel.ts';
import { displayZone, instantText, minutesText, periodRange } from './format.ts';

/**
 * The owner's OT balance and ledger for a share with the OT item. Read-only by construction: it has
 * no leave form, no reserve, use or cancel action and no evidence export, because the server mounts
 * only the two reads for a share. A refusal (for example a share that no longer holds the item) is
 * handled by the requester, which asks the server whether the share still exists.
 */
export function SharingOt({ request, ownerName }: { request: Requester; ownerName: string }) {
  const [summary, setSummary] = useState<OtSummary | null>(null);
  const [ledger, setLedger] = useState<OtLedgerEntry[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    Promise.all([request<OtSummary>('GET', '/ot/summary'), request<{ entries: OtLedgerEntry[] }>('GET', '/ot/ledger')])
      .then(([nextSummary, nextLedger]) => {
        if (!current) return;
        setSummary(nextSummary);
        setLedger(nextLedger.entries);
        setMessage(null);
      })
      .catch((caught: unknown) => {
        if (current) setMessage(describeError(caught));
      });
    return () => {
      current = false;
    };
  }, [request]);

  if (summary === null || ledger === null) {
    return message === null ? (
      <p className="muted">Loading…</p>
    ) : (
      <p className="error" role="alert">
        {message}
      </p>
    );
  }

  const figures: Array<{ name: string; label: string; minutes: number }> = [
    { name: 'posted', label: 'Posted', minutes: summary.posted_minutes },
    { name: 'provisional', label: 'Provisional', minutes: summary.provisional_minutes },
    { name: 'reserved', label: 'Reserved', minutes: summary.reserved_minutes },
    { name: 'available', label: 'Available', minutes: summary.available_minutes },
  ];

  return (
    <div className="stack ot-screen" data-shared-view="ot">
      <h1>{ownerName}&apos;s overtime balance</h1>
      <section className="card stack" aria-label="OT balances">
        <h2>OT balance</h2>
        <dl className="ot-balances">
          {figures.map((figure) => (
            <div key={figure.name} data-balance={figure.name}>
              <dt>{figure.label}</dt>
              <dd className="mono" data-minutes={figure.minutes}>
                {minutesText(figure.minutes)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="hint">Provisional minutes come from complete days in open periods. They cannot be spent until the period is finalized.</p>
        {summary.negative && (
          <p className="error" role="status" data-flag="negative">
            The posted balance is negative.
          </p>
        )}
        {summary.reconciliation_required && (
          <p className="notice" role="status" data-flag="reconciliation">
            Reconciliation required: a correction changed minutes that were already spent.
          </p>
        )}
      </section>
      <section className="card stack" aria-label="OT ledger">
        <h2>Ledger</h2>
        {summary.provisional_periods.length > 0 && (
          <ul className="plain" aria-label="Provisional credit by period">
            {summary.provisional_periods.map((period) => (
              <li key={period.payroll_date} className="ot-line">
                <span className="mono">{periodRange(period)}</span>
                <span>
                  {minutesText(period.credited_minutes)} from {period.complete_days} complete {period.complete_days === 1 ? 'day' : 'days'}
                </span>
                {period.pending_days > 0 && <span className="muted">{period.pending_days} pending</span>}
              </li>
            ))}
          </ul>
        )}
        {ledger.length === 0 ? (
          <p className="muted">The ledger has no entries yet. Credits are posted when a period is finalized.</p>
        ) : (
          <div className="table-wrap">
            <table aria-label="OT ledger entries">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Entry</th>
                  <th>Minutes</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id} data-ledger-type={entry.entry_type}>
                    <td className="mono">{entry.work_date ?? instantText(entry.posted_at, displayZone)}</td>
                    <td>
                      {ledgerEntryLabel(entry)}
                      {entry.reconciliation_required ? ' (reconcile)' : ''}
                    </td>
                    <td className="mono" data-minutes={entry.delta_minutes}>
                      {entry.delta_minutes > 0 ? '+' : ''}
                      {minutesText(entry.delta_minutes)}
                    </td>
                    <td className="muted">{entry.reason ?? 'none'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
