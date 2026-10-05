import { useEffect, useState } from 'react';
import { ApiRequestError, type RevisionListItem, type Requester, type ShareItems } from '../api.ts';
import { downloadRevisionPdf } from './DeliveryHistory.tsx';
import { describeError } from './errors.ts';
import { sharedBase, sharedRevisionRows } from './sharingModel.ts';

/**
 * The revision status list of a shared view, newest period first: payroll date, revision, origin,
 * review state, PDF and delivery state, as words. The list holds status only (no recipient, signer
 * or personal content). The PDF download button exists only for a share with the PDF item and a
 * ready PDF; without the item there is no button at all.
 */
export function SharingRevisions({
  request,
  ownerId,
  ownerName,
  items,
  onRefused,
}: {
  request: Requester;
  ownerId: string;
  ownerName: string;
  items: ShareItems;
  /** Called with a refused PDF download so the shell can tell whether the share has ended. */
  onRefused: (caught: unknown) => Promise<void>;
}) {
  const [revisions, setRevisions] = useState<RevisionListItem[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notes, setNotes] = useState<Readonly<Record<string, { tone: 'ok' | 'error'; text: string }>>>({});

  useEffect(() => {
    let current = true;
    request<{ revisions: RevisionListItem[] }>('GET', '/revisions')
      .then((answer) => {
        if (!current) return;
        setRevisions(answer.revisions);
        setMessage(null);
      })
      .catch((caught: unknown) => {
        if (current) setMessage(describeError(caught));
      });
    return () => {
      current = false;
    };
  }, [request]);

  async function download(id: string) {
    setNotes((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
    try {
      const name = await downloadRevisionPdf(id, sharedBase(ownerId));
      setNotes((current) => ({ ...current, [id]: { tone: 'ok', text: `Downloaded ${name}.` } }));
    } catch (caught) {
      if (caught instanceof ApiRequestError && (caught.status === 404 || caught.status === 403)) await onRefused(caught);
      const notReady = caught instanceof ApiRequestError && caught.code === 'pdf_not_ready';
      setNotes((current) => ({
        ...current,
        [id]: { tone: 'error', text: notReady ? 'The PDF of this revision is not ready yet.' : describeError(caught) },
      }));
    }
  }

  if (revisions === null) {
    return message === null ? (
      <p className="muted">Loading…</p>
    ) : (
      <p className="error" role="alert">
        {message}
      </p>
    );
  }

  const rows = sharedRevisionRows(revisions, items);
  return (
    <section className="stack" aria-labelledby="shared-revisions-title" data-shared-view="revisions">
      <h1 id="shared-revisions-title">{ownerName}&apos;s submissions</h1>
      <p className="hint muted">
        Each submitted revision of this person&apos;s timesheets. A revision never changes: a correction adds a new one.
        {items.pdf_download ? ' You can download the final PDFs.' : ''}
      </p>
      {rows.length === 0 ? (
        <p className="muted" data-history-empty="true">
          No period has been submitted yet.
        </p>
      ) : (
        <ul className="plain history-list" aria-label="Submitted revisions">
          {rows.map((row) => (
            <li key={row.id} className="history-item revision" data-revision={row.id} data-payroll={row.payrollDate}>
              <div className="history-head">
                <h2>Payroll date {row.payrollDate}</h2>
                <span className="badge" data-revision-badge="number">
                  Revision {row.revisionNo}
                </span>
                <span className="badge" data-revision-badge="review">
                  {row.review}
                </span>
                <span className="badge" data-revision-badge="pdf">
                  {row.pdf}
                </span>
              </div>
              <dl className="facts">
                <div>
                  <dt>Origin</dt>
                  <dd>{row.origin}</dd>
                </div>
                <div>
                  <dt>Delivery</dt>
                  <dd>{row.delivery}</dd>
                </div>
              </dl>
              {row.canDownload && (
                <div className="button-row">
                  <button type="button" onClick={() => void download(row.id)} aria-label={`Download PDF, payroll date ${row.payrollDate}, revision ${row.revisionNo}`}>
                    Download PDF
                  </button>
                </div>
              )}
              {notes[row.id] !== undefined && (
                <p className={notes[row.id]?.tone === 'ok' ? 'notice-ok' : 'error'} role={notes[row.id]?.tone === 'ok' ? 'status' : 'alert'}>
                  {notes[row.id]?.text}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
