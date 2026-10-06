import type { ImportDecisionAction, ImportDecisionItem } from '../api.ts';
import { allowedActions, reasonText } from '../importModel.ts';

const ACTION_TEXT: Record<ImportDecisionAction, string> = {
  skip: 'Skip this day (import nothing)',
  import: 'Import this day as read',
};

/**
 * One decision per conflicting day. The default is skip, and a day offers only the actions the server's plan
 * allows: a day that allows skip only shows that single, fixed choice.
 */
export function ImportDecisions({
  items,
  decisions,
  busy,
  onChoose,
}: {
  items: readonly ImportDecisionItem[];
  decisions: Readonly<Record<string, ImportDecisionAction>>;
  busy: boolean;
  onChoose: (item: ImportDecisionItem, action: ImportDecisionAction) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="notice-ok" role="status" data-import-decisions="none">
        No day needs a decision.
      </p>
    );
  }
  return (
    <section className="card stack" aria-label="Decisions" data-import-decisions={items.length}>
      <h2>Decisions ({items.length})</h2>
      <p className="hint">
        Each listed day needs your decision before the import can be committed. The default is to skip: nothing is imported for that day.
      </p>
      <ul className="plain stack decision-list">
        {items.map((item) => {
          const actions = allowedActions(item);
          const chosen = decisions[item.work_date] ?? 'skip';
          return (
            <li key={item.work_date} data-decision-date={item.work_date}>
              <fieldset className="choice-set decision">
                <legend>
                  <span className="mono">{item.work_date}</span> <span className="muted mono">{item.sources.join(', ')}</span>
                </legend>
                <ul className="plain">
                  {item.reasons.map((reason) => (
                    <li key={reason} className="muted" data-reason={reason}>
                      {reasonText(reason)}
                    </li>
                  ))}
                </ul>
                <div className="mode-list">
                  {actions.map((action) => (
                    <label key={action} className="inline">
                      <input
                        type="radio"
                        name={`decision-${item.work_date}`}
                        checked={chosen === action}
                        disabled={busy || actions.length === 1}
                        onChange={() => onChoose(item, action)}
                        data-action={action}
                      />
                      {actions.length === 1 ? `${ACTION_TEXT[action]}, the only option` : ACTION_TEXT[action]}
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
