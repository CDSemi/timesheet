import { type SubmitEvent, useState } from 'react';
import type { ReceivedShare } from '../api.ts';
import { sharedHash } from './sharingModel.ts';

/**
 * The shell's "Shared with me" switcher: one entry per person who shares timesheets with the user,
 * and "My timesheets". Choosing an entry changes nothing by itself (WCAG 2.2 SC 3.2.2, WP5-UX-AX-06):
 * the arrow keys can move through the people without leaving the screen, and "Open" goes to the chosen
 * person's shared items (or back to the user's own timesheets). It is absent while nobody shares anything.
 */
export function SharingSwitcher({ received, ownerId }: { received: readonly ReceivedShare[]; ownerId: string | null }) {
  if (received.length === 0) return null;
  // A new screen starts the choice again from the person (or "My timesheets") being shown.
  return <SwitcherForm key={ownerId ?? ''} received={received} ownerId={ownerId} />;
}

function SwitcherForm({ received, ownerId }: { received: readonly ReceivedShare[]; ownerId: string | null }) {
  const [choice, setChoice] = useState(ownerId ?? '');

  function open(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.hash = choice === '' ? '#/timesheet' : sharedHash(choice, null);
  }

  return (
    <form className="shell-switcher" aria-label="Shared with me" onSubmit={open}>
      <label className="inline">
        <span className="muted">Shared with me</span>
        <select value={choice} onChange={(event) => setChoice(event.target.value)}>
          <option value="">My timesheets</option>
          {received.map((share) => (
            <option key={share.id} value={share.owner.id}>
              {share.owner.display_name}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="secondary">
        Open
      </button>
    </form>
  );
}
