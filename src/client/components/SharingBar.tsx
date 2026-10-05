import type { ReceivedShare } from '../api.ts';
import { abilitiesOf, barTitle, itemsSummary, SHARED_VIEW_LABEL, type SharedView, sharedHash } from './sharingModel.ts';

/**
 * The persistent bar of a shared view: whose timesheets these are, whether they are view only or
 * can be edited, the items the share holds, the views it opens and the way back to one's own
 * timesheets. It stays on every shared screen, so a person never mistakes another person's data for
 * their own.
 */
export function SharingBar({ share, current }: { share: ReceivedShare; current: SharedView }) {
  const { views } = abilitiesOf(share.items);
  return (
    <section className="share-bar stack" aria-label="Shared access" data-share-bar={share.owner.id}>
      <div className="share-bar-head">
        <strong data-share-bar-title="true">{barTitle(share.owner.display_name, share.items)}</strong>
        <a className="button-link" href="#/timesheet">
          Back to my timesheets
        </a>
      </div>
      <ul className="plain share-summary" aria-label="Shared items">
        {itemsSummary(share.items).map((phrase) => (
          <li key={phrase} className="badge">
            {phrase}
          </li>
        ))}
      </ul>
      <nav className="share-views" aria-label="Shared views">
        {views.map((view) => (
          <a
            key={view}
            className="nav-link"
            href={sharedHash(share.owner.id, view)}
            aria-current={view === current ? 'page' : undefined}
          >
            {SHARED_VIEW_LABEL[view]}
          </a>
        ))}
      </nav>
    </section>
  );
}
