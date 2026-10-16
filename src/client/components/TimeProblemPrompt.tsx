import { useId } from 'react';
import { gapReplacement, problemText, type TimeProblem } from './sessionModel.ts';

/**
 * Asks how to resolve a local time the zone cannot place by itself (R-07). A repeated time
 * (DST fold) needs the earlier or the later instant; a time that does not exist (the gap) can
 * be moved to the first valid time or edited. Nothing is chosen for the user. `label` names the
 * field the question is about ("Break 2"); without it the question is about the session's own
 * start or end.
 */
export function TimeProblemPrompt({
  problem,
  chosen,
  label,
  onFold,
  onGap,
}: {
  problem: TimeProblem;
  /** The fold already chosen for the repeated time (null = none yet). */
  chosen: 0 | 1 | null;
  label?: string;
  onFold: (fold: 0 | 1) => void;
  onGap: () => void;
}) {
  const name = useId();
  const prefix = label === undefined ? '' : `${label}: `;
  if (problem.kind === 'gap') {
    const replacement = gapReplacement(problem);
    return (
      <div className="time-problem" role="alert" data-problem="gap">
        <p>
          {prefix}
          {problemText(problem)} Choose another time, or use the first valid time.
        </p>
        <button type="button" className="secondary" onClick={onGap}>
          Use {replacement.time} on {replacement.date}
        </button>
      </div>
    );
  }
  const options: ReadonlyArray<{ fold: 0 | 1; label: string }> = [
    { fold: 0, label: `Earlier time, UTC offset ${problem.offsets[0] ?? ''}` },
    { fold: 1, label: `Later time, UTC offset ${problem.offsets[1] ?? ''}` },
  ];
  return (
    <fieldset className="time-problem" data-problem="fold">
      <legend>
        {prefix}Which {problem.local.replace('T', ' ')} do you mean?
      </legend>
      <p role="alert">
        {prefix}
        {problemText(problem)} Choose one, then save again.
      </p>
      {options.map((option) => (
        <label key={option.fold} className="inline">
          <input type="radio" name={name} checked={chosen === option.fold} onChange={() => onFold(option.fold)} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
