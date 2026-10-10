import { useEffect, useRef, useState } from 'react';
import { api, type GivenShare, type ReceivedShare, type ShareItems } from '../api.ts';
import { describeError } from './errors.ts';
import { displayZone, instantText } from './format.ts';
import { SharingItemsFields } from './SharingItemsFields.tsx';
import { itemsProblem, itemsSummary, sameShareItems, sharedHash } from './sharingModel.ts';

/** An inline confirmation: it takes focus when it opens, names what happens, and Escape cancels. */
function ShareConfirm({
  title,
  message,
  confirmLabel,
  busy,
  error,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  busy: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.focus();
  }, []);
  return (
    <div
      className="confirm-panel stack"
      role="group"
      aria-label={title}
      tabIndex={-1}
      ref={panel}
      data-confirm="share"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !busy) onCancel();
      }}
    >
      <h4>{title}</h4>
      <p>{message}</p>
      {error !== null && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="button-row">
        <button type="button" disabled={busy} onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="secondary" disabled={busy} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function ItemList({ items }: { items: ShareItems }) {
  return (
    <ul className="plain share-summary" aria-label="Shared items">
      {itemsSummary(items).map((phrase) => (
        <li key={phrase} className="badge">
          {phrase}
        </li>
      ))}
    </ul>
  );
}

type Mode = 'idle' | 'change' | 'end';

/**
 * One share the caller gave: its items, since when, a change of items and the end of the share (after a
 * confirmation). The change step takes focus when it opens; cancelling either step returns focus to the
 * button that opened it (WP5-UX-AX-08).
 */
export function GivenShareRow({ share, onChanged }: { share: GivenShare; onChanged: (message: string) => void }) {
  const [mode, setMode] = useState<Mode>('idle');
  const [draft, setDraft] = useState<ShareItems>(share.items);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = share.grantee.display_name;
  const changeButton = useRef<HTMLButtonElement>(null);
  const endButton = useRef<HTMLButtonElement>(null);
  const changePanel = useRef<HTMLDivElement>(null);
  /** The step that was just cancelled; its opener gets focus once the buttons are back. */
  const returnFrom = useRef<Mode>('idle');

  useEffect(() => {
    if (mode === 'change') changePanel.current?.focus();
    if (mode !== 'idle' || returnFrom.current === 'idle') return;
    (returnFrom.current === 'change' ? changeButton : endButton).current?.focus();
    returnFrom.current = 'idle';
  }, [mode]);

  function close() {
    returnFrom.current = mode;
    setMode('idle');
    setError(null);
    setDraft(share.items);
  }

  async function run(work: () => Promise<string>) {
    setBusy(true);
    setError(null);
    try {
      onChanged(await work());
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }

  const save = () =>
    run(async () => {
      const answer = await api<{ changed: boolean }>('PUT', `/api/shares/${share.id}`, { items: draft });
      return answer.changed ? `The items shared with ${name} were changed. It applies on their next request.` : `The items shared with ${name} were already these.`;
    });
  const end = () =>
    run(async () => {
      await api('POST', `/api/shares/${share.id}/revoke`, {});
      return `Sharing with ${name} ended. It applies on their next request.`;
    });

  const problem = itemsProblem(draft);
  return (
    <li className="history-item share-row" data-share-grantee={share.grantee.email}>
      <div className="history-head">
        <strong>{name}</strong>
        <span className="mono muted">{share.grantee.email}</span>
        <span className="muted hint">since {instantText(share.created_at, displayZone)}</span>
        {!share.grantee.active && <span className="badge badge-warn">Account inactive: access suspended</span>}
      </div>
      <ItemList items={share.items} />
      {mode === 'idle' && (
        <div className="button-row">
          <button ref={changeButton} type="button" className="secondary" onClick={() => setMode('change')} aria-label={`Change items shared with ${name}`}>
            Change
          </button>
          <button ref={endButton} type="button" className="secondary" onClick={() => setMode('end')} aria-label={`End share with ${name}`}>
            End share
          </button>
        </div>
      )}
      {mode === 'change' && (
        <div className="stack" role="group" aria-label={`Change items shared with ${name}`} tabIndex={-1} ref={changePanel}>
          <SharingItemsFields items={draft} onChange={setDraft} disabled={busy} />
          {problem !== null && (
            <p className="notice" role="status">
              {problem}
            </p>
          )}
          {error !== null && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <div className="button-row">
            <button type="button" disabled={busy || problem !== null || sameShareItems(draft, share.items)} onClick={() => void save()}>
              Save items
            </button>
            <button type="button" className="secondary" disabled={busy} onClick={close}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {mode === 'end' && (
        <ShareConfirm
          title={`End sharing with ${name}?`}
          message={`${name} loses access to your shared items at their next request. You can share again later.`}
          confirmLabel="End share"
          busy={busy}
          error={error}
          onConfirm={() => void end()}
          onCancel={close}
        />
      )}
    </li>
  );
}

/**
 * One share the caller received: its items, since when, a way into it, and leaving it (after a
 * confirmation). Cancelling the confirmation returns focus to "Leave" (WP5-UX-AX-08).
 */
export function ReceivedShareRow({ share, onLeft }: { share: ReceivedShare; onLeft: (message: string) => void }) {
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const name = share.owner.display_name;
  const leaveButton = useRef<HTMLButtonElement>(null);
  const returnToLeave = useRef(false);

  useEffect(() => {
    if (asking || !returnToLeave.current) return;
    returnToLeave.current = false;
    leaveButton.current?.focus();
  }, [asking]);

  async function leave() {
    setBusy(true);
    setError(null);
    try {
      await api('POST', `/api/shares/${share.id}/revoke`, {});
      onLeft(`You left ${name}'s shared items.`);
    } catch (caught) {
      setError(describeError(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="history-item share-row" data-share-owner={share.owner.id}>
      <div className="history-head">
        <strong>{name}</strong>
        <span className="muted hint">since {instantText(share.created_at, displayZone)}</span>
      </div>
      <ItemList items={share.items} />
      {asking ? (
        <ShareConfirm
          title={`Leave ${name}'s shared items?`}
          message={`You will no longer see ${name}'s shared items. Only ${name} can share them with you again.`}
          confirmLabel="Leave"
          busy={busy}
          error={error}
          onConfirm={() => void leave()}
          onCancel={() => {
            returnToLeave.current = true;
            setAsking(false);
            setError(null);
          }}
        />
      ) : (
        <div className="button-row">
          <a className="button-link" href={sharedHash(share.owner.id, null)} aria-label={`Open ${name}'s shared items`}>
            Open
          </a>
          <button ref={leaveButton} type="button" className="secondary" onClick={() => setAsking(true)} aria-label={`Leave ${name}'s shared items`}>
            Leave
          </button>
        </div>
      )}
    </li>
  );
}
