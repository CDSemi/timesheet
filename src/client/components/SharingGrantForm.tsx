import { type SubmitEvent, useState } from 'react';
import { api, type GivenShare, type ShareItems } from '../api.ts';
import { SharingItemsFields } from './SharingItemsFields.tsx';
import { DEFAULT_SHARE_ITEMS, grantFailureText, itemsProblem } from './sharingModel.ts';

/**
 * Share one's own timesheets with another account, by its exact email address. The items start at
 * timesheets view on, OT off, PDF off. Whether the address belongs to an active account is the
 * server's answer; an unknown and a deactivated address read the same.
 */
export function SharingGrantForm({ onGranted }: { onGranted: (share: GivenShare) => void }) {
  const [email, setEmail] = useState('');
  const [items, setItems] = useState<ShareItems>(DEFAULT_SHARE_ITEMS);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const problem = itemsProblem(items);

  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (problem !== null || busy) return;
    setBusy(true);
    setError(null);
    try {
      const answer = await api<{ share: GivenShare }>('POST', '/api/shares', { grantee_email: email.trim(), items });
      setEmail('');
      setItems(DEFAULT_SHARE_ITEMS);
      onGranted(answer.share);
    } catch (caught) {
      setError(grantFailureText(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="stack" aria-label="Share my timesheets" onSubmit={submit}>
      <h3>Share my timesheets</h3>
      <label>
        Account email
        <input
          type="email"
          autoComplete="off"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-describedby="share-email-hint"
          required
        />
        <span className="muted hint" id="share-email-hint">
          The exact email address of an active account. The person sees your shared items until you end the share.
        </span>
      </label>
      <SharingItemsFields items={items} onChange={setItems} disabled={busy} />
      {problem !== null && (
        <p className="notice" role="status">
          {problem}
        </p>
      )}
      {error !== null && (
        <p className="error" role="alert" data-error="share-grant">
          {error}
        </p>
      )}
      <div className="button-row">
        <button type="submit" disabled={busy || problem !== null}>
          Share
        </button>
      </div>
    </form>
  );
}
