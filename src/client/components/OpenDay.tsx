import { type SubmitEvent, useState } from 'react';

/** Opens the day editor for any accounting date, including dates outside the displayed period. */
export function OpenDay({ onOpen }: { onOpen: (workDate: string) => void }) {
  const [date, setDate] = useState('');

  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (date !== '') onOpen(date);
  }

  return (
    <form className="open-day" onSubmit={submit}>
      <label>
        Open a day
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
      </label>
      <button type="submit" className="secondary" disabled={date === ''}>
        Open day
      </button>
    </form>
  );
}
