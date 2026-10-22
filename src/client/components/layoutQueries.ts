/*
 * The two documented layout breakpoints (WP5-UX5-T04, owner decision F-6 a), each written once in range syntax so no fractional
 * width (a 150% display scaling gives 479.33 and 767.33 CSS px) falls between two rules: `width < N` and `width >= N` cover every
 * width, where `max-width: N-1` and `min-width: N` leave a hole. A media query cannot read a custom property, so styles.css repeats
 * the same two literals; tests/client/layoutQueries.test.ts fails when the style sheet and these constants disagree or an old
 * `max-width: 767px` / `min-width: 768px` pair comes back. No DOM here: the constants are read by the tests too; the hook that
 * follows a query is in useMedia.ts.
 */

/**
 * The navigation shell: the desktop top bar (navigation and identity) versus the phone bar with the tab bar, the check in/out group
 * in the Timesheet title row versus the top bar, the Day editor drawer versus the bottom sheet, full-screen dialogs and the 44px
 * touch rule. `DRAWER_MIN_WIDTH` (editorLayoutModel.ts) is the same 768.
 */
export const SHELL_QUERY = '(width >= 768px)';

/**
 * The sheet's compact form, from 480px up the full form: the 7-column week sheet (scrolling sideways inside the week card until the
 * page is wide enough) versus the 4-column table per week, the phone toolbar, the hidden form title and the compact paper. The
 * period card's two arrangements are decided by their own container, not by this query.
 */
export const SHEET_QUERY = '(width >= 480px)';
