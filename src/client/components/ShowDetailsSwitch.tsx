/**
 * "Worked hours" of the Timesheet toolbar as a round slide switch (WP5-UX2-T02, "Show worked hours" in round 4, U4-10, shortened in
 * round 5, U5-18): a native checkbox with `role="switch"`, so the keyboard (Space) and the checked state come from the browser. The
 * visible text is the accessible name and never changes; it names what the switch adds, the rows "Worked, workday" and "Worked,
 * day off". The look is drawn in CSS (`.switch-input`).
 */
export function ShowDetailsSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline switch">
      <input type="checkbox" role="switch" className="switch-input" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      Worked hours
    </label>
  );
}
