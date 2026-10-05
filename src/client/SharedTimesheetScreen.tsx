import { useEffect, useMemo, useRef } from 'react';
import { type ReceivedShare, sharedRequest, type User } from './api.ts';
import { SharingBar } from './components/SharingBar.tsx';
import { SharingOt } from './components/SharingOt.tsx';
import { SharingRevisions } from './components/SharingRevisions.tsx';
import { abilitiesOf, classifySharedFailure, resolveSharedView, type SharedView, sharedHash } from './components/sharingModel.ts';
import { TimesheetScreen } from './TimesheetScreen.tsx';

/**
 * Another person's shared items, opened from "Shared with me" or a `#/shared/{ownerId}/...` link.
 * Every read and write below goes to `/api/shared/:ownerId/...` and the server resolves the share
 * on each request. The page shows only what the share holds: an action the share does not allow is
 * absent. A refused request asks the server whether the share still exists (`refreshShares`); when
 * it has ended, `onEnded` sends the user back to their own timesheets with a message.
 */
export function SharedTimesheetScreen({
  user,
  ownerId,
  view,
  received,
  refreshShares,
  onEnded,
}: {
  user: User;
  ownerId: string;
  view: SharedView | null;
  /** The signed-in user's received shares; null while the first list is loading. */
  received: readonly ReceivedShare[] | null;
  /** Reads the received shares again from the server and returns them (null when they could not be read). */
  refreshShares: () => Promise<readonly ReceivedShare[] | null>;
  /** The share is gone: show the message and leave for the user's own view. */
  onEnded: (ownerName: string | null) => void;
}) {
  const share = received === null ? undefined : received.find((item) => item.owner.id === ownerId);
  const resolved = share === undefined ? null : resolveSharedView(share.items, view);
  // The last name the share was seen under, so the message after it ended can still name the owner.
  const knownName = useRef<string | null>(null);
  useEffect(() => {
    if (share !== undefined) knownName.current = share.owner.display_name;
  }, [share]);

  // The share is not (or no longer) in the list: back to the user's own view with a message.
  useEffect(() => {
    if (received !== null && share === undefined) onEnded(knownName.current);
  }, [received, share, onEnded]);

  // An address the share does not hold is rewritten to the first view it does hold.
  useEffect(() => {
    if (resolved !== null && resolved !== view) window.history.replaceState(null, '', sharedHash(ownerId, resolved));
  }, [resolved, view, ownerId]);

  const onRefused = useMemo(
    () => async (caught: unknown) => {
      const fresh = await refreshShares();
      const stillShared = fresh === null ? null : fresh.some((item) => item.owner.id === ownerId);
      if (classifySharedFailure(caught, stillShared) === 'ended') onEnded(knownName.current);
    },
    [refreshShares, ownerId, onEnded],
  );
  const request = useMemo(() => sharedRequest(ownerId, onRefused), [ownerId, onRefused]);

  if (share === undefined || resolved === null) return <p className="muted">Loading…</p>;
  const abilities = abilitiesOf(share.items);

  return (
    <div className="stack" data-shared-owner={ownerId}>
      <SharingBar share={share} current={resolved} />
      {resolved === 'timesheet' && abilities.viewTimesheets && (
        <TimesheetScreen user={user} shared={{ ownerName: share.owner.display_name, canEdit: abilities.editTimesheets, request }} />
      )}
      {resolved === 'ot' && abilities.viewOt && <SharingOt request={request} ownerName={share.owner.display_name} />}
      {resolved === 'revisions' && abilities.viewRevisions && (
        <SharingRevisions request={request} ownerId={ownerId} ownerName={share.owner.display_name} items={share.items} onRefused={onRefused} />
      )}
    </div>
  );
}
