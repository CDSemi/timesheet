/** Clock in starts a live session now; Clock out opens the break confirmation dialog. */
export function ClockBar({ onClockIn, onClockOut }: { onClockIn: () => void; onClockOut: () => void }) {
  return (
    <div className="toolbar">
      <button type="button" onClick={onClockIn}>
        Clock in
      </button>
      <button type="button" onClick={onClockOut}>
        Clock out
      </button>
    </div>
  );
}
