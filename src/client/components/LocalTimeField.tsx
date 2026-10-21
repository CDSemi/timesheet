import { type EpochSeconds, epochSecondsOf } from '../../domain/instants.ts';
import { isValidTimeZone } from '../../domain/zones.ts';
import { applyNow, applyToday, editField, type LocalField } from './sessionModel.ts';

/** The device clock in whole seconds; it is read in the input zone by `nowField`, never in the device zone (AGENTS rule 7). */
function deviceInstant(): EpochSeconds {
  return epochSecondsOf(new Date());
}

/**
 * A local date and time typed in an explicit input zone. The labels read "<label> date" and
 * "<label> time"; a typed change drops any fold or offset the previous value had.
 *
 * With `zone` (the session dialog's input zone, U4-13) a quiet link sits under each input, right-aligned to it: "Today" under the
 * date and "Now" under the time. Both read the device clock in that zone and change the field like a typed value (no fold, no
 * offset); "Now" also moves the date when the field holds another one, so the value is this instant. Without `zone` there are no links.
 */
export function LocalTimeField({
  label,
  field,
  zone,
  onChange,
}: {
  label: string;
  field: LocalField;
  /** The input zone, trimmed; the links are shown only when it is given. */
  zone?: string;
  onChange: (next: LocalField) => void;
}) {
  // A live clock keeps seconds; the time input must then show and keep them.
  const withSeconds = field.time.length > 5;
  const lower = label.toLowerCase();
  const take = (next: LocalField | null) => {
    if (next !== null) onChange(next);
  };
  return (
    <div className="local-field" role="group" aria-label={label}>
      <div className="local-cell">
        <label>
          {label} date
          <input type="date" value={field.date} onChange={(event) => onChange(editField(field, { date: event.target.value }))} required />
        </label>
        {zone !== undefined && (
          <button
            type="button"
            className="quiet link-action"
            aria-label={`Today, ${lower} date`}
            disabled={!isValidTimeZone(zone)}
            onClick={() => take(applyToday(field, zone, deviceInstant()))}
          >
            Today
          </button>
        )}
      </div>
      <div className="local-cell">
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
        {zone !== undefined && (
          <button
            type="button"
            className="quiet link-action"
            aria-label={`Now, ${lower} time`}
            disabled={!isValidTimeZone(zone)}
            onClick={() => take(applyNow(field, zone, deviceInstant()))}
          >
            Now
          </button>
        )}
      </div>
    </div>
  );
}
