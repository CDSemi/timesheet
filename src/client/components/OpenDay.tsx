import { type SubmitEvent, useState } from 'react';

/**
 * Opens the day editor for any accounting date, including dates outside the displayed period. The text, the date field and the button
 * share one row at every width (U-11). Where the row is narrower than 21rem the style sheet hides the words "Open a day" visually (U-18);
 * the label still names the field "Open a day".
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
      <button type="submit" className="secondary" disabled={date === ''}>
        Open day
      </button>
    </form>
  );
}
