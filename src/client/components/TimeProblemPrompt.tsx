import {
  chosenFold,
  gapReplacement,
  problemText,
  type SessionDraft,
  type TimeProblem,
} from './sessionModel.ts';

/**
 * Asks how to resolve a local time the zone cannot place by itself (R-07). A repeated time
 * (DST fold) needs the earlier or the later instant; a time that does not exist (the gap) can
 * be moved to the first valid time or edited. Nothing is chosen for the user.
 */
export function TimeProblemPrompt({
  problem,
  draft,
  onFold,
  onGap,
}: {
  problem: TimeProblem;
  draft: SessionDraft;
  onFold: (fold: 0 | 1) => void;
  onGap: () => void;
}) {
  if (problem.kind === 'gap') {
    const replacement = gapReplacement(problem);
    return (
      <div className="time-problem" role="alert" data-problem="gap">
        <p>{problemText(problem)} Choose another time, or use the first valid time.</p>
        <button type="button" className="secondary" onClick={onGap}>
          Use {replacement.time} on {replacement.date}
        </button>
      </div>
    );
  }
  const chosen = chosenFold(draft, problem);
  const options: ReadonlyArray<{ fold: 0 | 1; label: string }> = [
    { fold: 0, label: `Earlier time, UTC offset ${problem.offsets[0] ?? ''}` },
    { fold: 1, label: `Later time, UTC offset ${problem.offsets[1] ?? ''}` },
  ];
  return (
    <fieldset className="time-problem" data-problem="fold">
      <legend>Which {problem.local.replace('T', ' ')} do you mean?</legend>
      <p role="alert">{problemText(problem)} Choose one, then save again.</p>
      {options.map((option) => (
        <label key={option.fold} className="inline">
          <input type="radio" name="fold-choice" checked={chosen === option.fold} onChange={() => onFold(option.fold)} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
