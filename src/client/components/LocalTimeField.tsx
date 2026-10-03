import { editField, type LocalField } from './sessionModel.ts';

/**
 * A local date and time typed in an explicit input zone. The labels read "<label> date" and
 * "<label> time"; a typed change drops any fold or offset the previous value had.
 */
export function LocalTimeField({
  label,
  field,
  onChange,
}: {
  label: string;
  field: LocalField;
  onChange: (next: LocalField) => void;
}) {
  // A live clock keeps seconds; the time input must then show and keep them.
  const withSeconds = field.time.length > 5;
  return (
    <div className="local-field" role="group" aria-label={label}>
      <label>
        {label} date
        <input type="date" value={field.date} onChange={(event) => onChange(editField(field, { date: event.target.value }))} required />
      </label>
      <label>
        {label} time
        <input
          type="time"
          step={withSeconds ? 1 : 60}
          value={field.time}
          onChange={(event) => onChange(editField(field, { time: event.target.value }))}
          required
        />
      </label>
    </div>
  );
}
