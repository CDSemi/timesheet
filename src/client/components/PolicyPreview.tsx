import type { PolicyPreview as PolicyPreviewData } from '../api.ts';
import { minutesText } from './format.ts';
import { MINUTE_FIELD_LABELS } from './policyModel.ts';

/**
 * The server's before/after figures for the draft days the new version would change. Each field
 * carries the raw minutes as data attributes, so a test reads the number and not its wording.
 */
export function PolicyPreview({ preview }: { preview: PolicyPreviewData }) {
  return (
    <section className="stack" aria-label="Policy preview" data-preview-effective-from={preview.effective_from}>
      <h3>Effect from {preview.effective_from}</h3>
      {preview.days.length === 0 ? (
        <p className="muted" data-preview-empty="true">
          No recorded day in an open period changes. The version only applies to days entered from now on.
        </p>
      ) : (
        <ul className="plain preview-days">
          {preview.days.map((day) => (
            <li key={day.work_date} className="preview-day" data-preview-day={day.work_date}>
              <strong className="mono">{day.work_date}</strong>
              <dl className="facts">
                {day.changed.map((field) => (
                  <div key={field} data-field={field} data-before={day.before[field] ?? ''} data-after={day.after[field] ?? ''}>
                    <dt>{MINUTE_FIELD_LABELS[field]}</dt>
                    <dd>
                      {minutesText(day.before[field])} to {minutesText(day.after[field])}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
