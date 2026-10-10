import type { Locator, Page } from '@playwright/test';

/*
 * The day's own button on the Timesheet sheet (desktop date button, phone day button). Specs select it
 * by the day's `data-day` and the button's `data-day-button` marker, never by its accessible name.
 * WP5-UX-AX-05 (WCAG 2.2 SC 2.5.3): the name starts with the verb, then the visible text, then the ISO
 * date, for example "Edit 09/28 (2026-09-28)" on the desktop sheet and "Edit Mon 09/28 (2026-09-28)" on
 * a phone, "View ..." when the day only opens to read (docs/04).
 */

/** The button that opens one day's editor. */
export function dayButton(scope: Page | Locator, workDate: string): Locator {
  return scope.locator(`[data-day="${workDate}"] [data-day-button]`);
}

/** The accessible name of a day's button: the verb, the visible "MM/DD" (a phone adds the weekday), the ISO date. */
export function dayButtonName(verb: 'Edit' | 'View', workDate: string): RegExp {
  const [, month = '', day = ''] = /^\d{4}-(\d{2})-(\d{2})$/.exec(workDate) ?? [];
  return new RegExp(`^${verb} (?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?${month}/${day} \\(${workDate}\\)$`);
}

/** The day's button, which must also carry the accessible name of `verb` ("Edit" or "View"). */
export function namedDayButton(scope: Page | Locator, workDate: string, verb: 'Edit' | 'View'): Locator {
  return dayButton(scope, workDate).and(scope.getByRole('button', { name: dayButtonName(verb, workDate) }));
}

/** Any day button's accessible name, for checks that do not name the date. */
export const ANY_DAY_BUTTON_NAME = /^(Edit|View) (?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) )?\d{2}\/\d{2} \(\d{4}-\d{2}-\d{2}\)$/;
