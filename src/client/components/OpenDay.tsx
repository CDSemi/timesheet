import { type SubmitEvent, useState } from 'react';

/**
 * Opens the day editor for any accounting date, including dates outside the displayed period. The words, the date field and the button
 * share one row at every width (U-11). The row is a size container, and the style sheet steps the row down as it narrows (U-18, U5-17):
 * first the button reads "Open" instead of "Open day", then the words "Open a day" are hidden visually. The label still names the field
 * "Open a day" and the button is still named "Open day" (it contains every visible form, SC 2.5.3).
 */
export function OpenDay({ onOpen }: { onOpen: (workDate: string) => void }) {
  const [date, setDate] = useState('');

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (date !== '') onOpen(date);
  }

  return (
    <form className="open-day" onSubmit={submit}>
      <label>
        <span className="open-day-text">Open a day</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
      </label>
      <button type="submit" className="secondary" aria-label="Open day" disabled={date === ''}>
        <span className="open-day-long">Open day</span>
        <span className="open-day-short" data-text="Open" aria-hidden="true" />
      </button>
    </form>
  );
}
