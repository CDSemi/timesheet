/**
 * "Show details" of the Timesheet toolbar as a slide switch (WP5-UX2-T02): a native checkbox with
 * `role="switch"`, so the keyboard (Space) and the checked state come from the browser. The visible text
 * is the accessible name and never changes. The look is drawn in CSS (`.switch-input`).
 */
export function ShowDetailsSwitch({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline switch">
      <input type="checkbox" role="switch" className="switch-input" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      Show details
    </label>
  );
}
