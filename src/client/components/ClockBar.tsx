export function ClockBar({
  noBreaks,
  onNoBreaks,
  onClockIn,
  onClockOut,
}: {
  noBreaks: boolean;
  onNoBreaks: (value: boolean) => void;
  onClockIn: () => void;
  onClockOut: () => void;
}) {
  return (
    <div className="toolbar">
      <button type="button" onClick={onClockIn}>
        Clock in
      </button>
      <label className="inline">
        <input type="checkbox" checked={noBreaks} onChange={(event) => onNoBreaks(event.target.checked)} />
        No unpaid breaks taken
      </label>
      <button type="button" onClick={onClockOut}>
        Clock out
      </button>
    </div>
  );
}
