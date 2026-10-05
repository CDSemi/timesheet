import { useCallback, useEffect, useState } from 'react';
import { api, type SharesResponse } from '../api.ts';
import { describeError } from './errors.ts';
import { SharingGrantForm } from './SharingGrantForm.tsx';
import { GivenShareRow, ReceivedShareRow } from './SharingRows.tsx';

/**
 * Settings, Sharing (FR-17): share your own timesheets with another account item by item, change or
 * end a share you gave, and leave a share you received. Every answer is the server's; the lists are
 * read again after each action. `onChanged` tells the shell the received shares may have changed, so
 * its "Shared with me" switcher stays current.
 */
export function SharingSection({ onChanged }: { onChanged: () => void }) {
  const [shares, setShares] = useState<SharesResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setShares(await api<SharesResponse>('GET', '/api/shares'));
      setLoadError(null);
    } catch (caught) {
      setLoadError(describeError(caught));
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function changed(message: string) {
    setNotice(message);
    await reload();
    onChanged();
  }

  return (
    <section className="card stack" aria-labelledby="sharing-title" data-settings="sharing">
      <h2 id="sharing-title">Sharing</h2>
      <p className="hint muted">
        Share your timesheets with another account, item by item. You can change or end a share at any time; it applies on the other person&apos;s next
        request. Sign-off, sending, Clock in/out and your settings always stay with you.
      </p>
      {loadError !== null && (
        <p className="error" role="alert">
          {loadError}
        </p>
      )}
      {notice !== null && (
        <p className="notice-ok" role="status" data-status="share">
          {notice}
        </p>
      )}
      <SharingGrantForm onGranted={(share) => void changed(`Shared with ${share.grantee.display_name}.`)} />
      <section className="stack" aria-labelledby="sharing-given-title">
        <h3 id="sharing-given-title">Shared by me</h3>
        {shares === null ? (
          loadError === null && <p className="muted">Loading…</p>
        ) : shares.given.length === 0 ? (
          <p className="muted" data-share-empty="given">
            You have not shared your timesheets with anyone.
          </p>
        ) : (
          <ul className="plain history-list" aria-label="Shares I gave">
            {shares.given.map((share) => (
              <GivenShareRow key={share.id} share={share} onChanged={(message) => void changed(message)} />
            ))}
          </ul>
        )}
      </section>
      <section className="stack" aria-labelledby="sharing-received-title">
        <h3 id="sharing-received-title">Shared with me</h3>
        {shares === null ? (
          loadError === null && <p className="muted">Loading…</p>
        ) : shares.received.length === 0 ? (
          <p className="muted" data-share-empty="received">
            Nobody has shared their timesheets with you.
          </p>
        ) : (
          <ul className="plain history-list" aria-label="Shares I received">
            {shares.received.map((share) => (
              <ReceivedShareRow key={share.id} share={share} onLeft={(message) => void changed(message)} />
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
