import type { ReceivedShare } from '../api.ts';
import { sharedHash } from './sharingModel.ts';

/**
 * The shell's "Shared with me" switcher: one entry per person who shares timesheets with the user.
 * Choosing one opens that person's shared items; choosing "My timesheets" returns. It is absent while
 * nobody shares anything.
 */
export function SharingSwitcher({ received, ownerId }: { received: readonly ReceivedShare[]; ownerId: string | null }) {
  if (received.length === 0) return null;
  return (
    <label className="inline shell-switcher">
      <span className="muted">Shared with me</span>
      <select
        value={ownerId ?? ''}
        onChange={(event) => {
          window.location.hash = event.target.value === '' ? '#/timesheet' : sharedHash(event.target.value, null);
        }}
      >
        <option value="">My timesheets</option>
        {received.map((share) => (
          <option key={share.id} value={share.owner.id}>
            {share.owner.display_name}
          </option>
        ))}
      </select>
    </label>
  );
}
