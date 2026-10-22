import type { MouseEvent } from 'react';
import type { Session } from '../api.ts';
import { type SessionCard, sessionCardOf } from './dayEditorModel.ts';

/** The state pill of a card: its words always (never colour alone), plus the live dot of a running session. */
function StatePill({ card }: { card: SessionCard }) {
  return (
    <span className={`pill pill-${card.state}`} data-session-state={card.state}>
      {card.state === 'running' && <span className="shape live-dot" aria-hidden="true" />}
      {card.stateText}
    </span>
  );
}

function BreakTable({ card }: { card: SessionCard }) {
  return (
    <table className="break-table" data-break-table={card.id}>
      <caption>{card.caption}</caption>
      <thead>
        <tr>
          <th scope="col">Break</th>
          <th scope="col">Date</th>
          <th scope="col">Start</th>
          <th scope="col">Minutes</th>
        </tr>
      </thead>
      <tbody>
        {card.breaks.map((item) => (
          <tr key={item.key}>
            <td>{item.number}</td>
            <td className="mono">{item.date}</td>
            <td className="mono">{item.start}</td>
            <td className="mono">{item.minutes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * The sessions of a day as cards (WP5-UX3-T07, owner decision U-21): the range in the display zone, a state pill, where it
 * came from, and the saved breaks as a table (start date, start time and minutes). The card only shows what is saved;
 * every change goes through the session dialog (Edit, Add session, or "Confirm breaks" for a session whose breaks are
 * not confirmed). The pressed button is passed on, so focus can return to it when the dialog closes. In a read-only editor
 * the card has no button at all.
 */
export function SessionList({
  sessions,
  workDate,
  zone,
  readOnly,
  shared = false,
  onEdit,
  onConfirmBreaks,
  onDelete,
}: {
  sessions: readonly Session[];
  workDate: string;
  /** The display zone every time is shown in (R-07). */
  zone: string;
  readOnly: boolean;
  /** A shared edit view: the owner's running session offers no Delete (the server answers 409 shared_clock_action, R2 a). */
  shared?: boolean;
  onEdit: (session: Session, button: HTMLButtonElement) => void;
  onConfirmBreaks: (session: Session, button: HTMLButtonElement) => void;
  /** The button is passed on so focus can return to it when the confirmation is cancelled. */
  onDelete: (session: Session, button: HTMLButtonElement) => void;
}) {
  return (
    <ul className="plain session-list">
      {sessions.map((session) => {
        const card = sessionCardOf(session, workDate, zone);
        return (
          <li key={session.id} className="session-card" data-session={session.id} data-state={card.state}>
            <div className="session-card-head">
              <span className="mono session-range">
                {card.startDate !== null && <span className="muted session-start-date">{card.startDate} </span>}
                {card.range}
              </span>
              <StatePill card={card} />
            </div>
            <p className="muted hint session-source">{card.source}</p>
            {card.runningText !== null && <p className="session-running">{card.runningText}</p>}
            {card.state !== 'running' && card.breaks.length > 0 && <BreakTable card={card} />}
            {card.emptyText !== null && <p className="muted session-empty">{card.emptyText}</p>}
            {card.attentionText !== null && (
              <div className="session-attention" data-session-attention>
                <p>{card.attentionText}</p>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => onConfirmBreaks(session, event.currentTarget)}
                    aria-label={`Confirm breaks of ${card.range}`}
                  >
                    Confirm breaks
                  </button>
                )}
              </div>
            )}
            {!readOnly && (
              <div className="button-row">
                <button
                  type="button"
                  className="secondary"
                  onClick={(event: MouseEvent<HTMLButtonElement>) => onEdit(session, event.currentTarget)}
                  aria-label={`Edit session ${session.id}`}
                >
                  Edit
                </button>
                {!(shared && card.state === 'running') && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={(event: MouseEvent<HTMLButtonElement>) => onDelete(session, event.currentTarget)}
                    aria-label={`Delete session ${session.id}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
