# WP5-UX2-PLAN2 dispatch brief (plan addendum)

- Mission/task: timesheet-software-readiness / WP5-UX2-PLAN2; package WP5; kind plan;
  attempt 1; depends on WP5-UX2-PLAN (done). Read-only addendum to
  `handoff/delivery/tasks/WP5-UX2-PLAN.md` after the owner's answer to WP5-UX2-Q1.
- Owner answer (chat, 2026-10-14; verbatim in the board `owner_decisions`; English
  translation): "Then add a 'Current Period' button (or a more precise name) to return to
  the period the page opens on, the period that just ended (for review and sign-off),
  while the 'Today' button opens the period that contains today."
- Coordinator decisions (board `coordinator_decisions`, 2026-10-14):
  - "Today" = option (b): it opens the period that contains the server's `today_local`
    (in the timesheet's saved reporting zone; never the device clock or display zone),
    shows today's column, and moves an open Day editor to today (the F-2 default).
  - The second button's visible name is "Current period". It matches the period bar's
    "current" badge (docs/04 line 53). Its target is the R-07 current period: the
    `current` period returned by `GET /periods/current`, re-read on click. That is the
    period the page opens on. The landing rule R-07 is unchanged.
  - Both buttons are implemented in slice WP5-UX2-T04.
- Routing: size S, risk M (date/zone semantics, phone budget), novelty no. Profile
  timesheet-planner (effort high, fixed by the profile); requested model sonnet; no
  override. Record in English. Begin your returned result with 'Self-reported model: ...'.

## Hard rules

- Read-only for everything outside the owned paths. WP5-UX2-T01 is editing source right
  now (`src/client/styles.css`, `AppShell.tsx`, `index.html` and others) and may build
  `dist/`. So:
  - do NOT run `npm` scripts, builds, the app, Playwright or any browser;
  - do NOT run any git command that changes the index or the working tree;
  - read-only git commands and reading files are fine.
- Design from the measurements already in the plan (A5, B5 and the phone budget
  numbers) and from the source. When a number is missing, state the assumption and the
  check that T04 must measure.
- NO STDIN SCRIPTS: NEVER feed a script to python or node through stdin (no `-`, no
  heredocs, no pipes into node or python). NEVER pipe output into head or tail. Never
  use cmd.exe or an interactive shell. Raw output only in
  `D:\.claude-tmp\timesheet\WP5-UX2-PLAN2\`. Never create files elsewhere.

## Settle in Results

1. **B5 revised: Today.**
   - Target: `payPeriodContaining(today_local)`. Re-read on click.
   - "Away" rule: the shown period does not contain `today_local`, or the editor is open
     on another date.
   - The `aria-disabled` state and the `role="status"` line.
   - Scrolling today's column into view.
   - The editor follows to today.
   - Shared view: the owner's zone and the owner's today.
   - Imported periods.
2. **B5b: Current period.**
   - Target: the R-07 `current` period.
   - When the button is active, and whether it is always rendered or rendered only when
     its period differs from today's period. Outside P-4..P both buttons reach the same
     period. Recommend one option, weighing layout stability, clarity for the owner's
     purpose (going back to review and sign off) and the phone budget.
   - Editor behaviour: recommend whether it only navigates like the period arrows (the
     editor stays as it is) or something else, and why.
   - Its status line.
   - How users tell the two buttons apart. The visible text carries the meaning; no
     tooltip-only information. The accessible name contains the visible text
     (SC 2.5.3).
   - Shared view: a grantee sees the owner's current period.
3. **Placement and order.**
   - Tab and visual order in the period bar, for example Previous, Next, Today, Current
     period, Review & sign off.
   - Desktop widths.
   - Phone (< 768px) at 390, 375, 360 and 320: 44px targets, no horizontal scroll, and
     the docs/04 first-screen budget at 390x844 in the four states (first day row above
     the tab bar; the plan's numbers are 659 / 758 without a share and 667 / 766 with
     one, tab bar top 788).
   - If both buttons cannot share the existing Review row, propose the least costly
     layout and give the arithmetic.
4. **Model and tests (delta to section E).**
   - The pure model (for example `periodJumpModel.ts`): targets and active states for
     both buttons.
   - Unit tests stepped through every day of at least two periods, including P-4..P,
     the due Tuesday before and after 17:00 America/Los_Angeles, the LA midnight and the
     DST days.
   - E2E checks for both buttons in both branches (inside and outside the window). Pick
     the branch from server values and assert the other branch's opposite fact; never
     skip.
   - The device-zone case (Asia/Ho_Chi_Minh device, America/Los_Angeles reporting zone),
     the shared view, and the phone layout checks.
   - Update the simulated-clock sweep list if needed.
5. **Docs delta to section D.** The exact docs/04 lines (EN and VI) for both buttons
   (lines 8, 48 and 53 at least), and the docs/10 wording of this owner decision.
6. **Slice delta to section G.** The revised WP5-UX2-T04 row: scope, owned paths,
   size/risk and the tests it must add. Say whether T04 is still at most size M.
7. **Mockup.** Update `handoff/delivery/design/WP5-UX2/mockup.html` (period bar on the
   desktop artboard, phone artboard, light and dark) to show both buttons, with an
   updated Vietnamese caption. Do not regenerate the PNG renders now (no browser while
   T01 runs). State in Results that the renders predate this addendum.
8. **Owner questions.** Expect none. List one only if no safe default exists.

## Owned paths

- `handoff/delivery/tasks/WP5-UX2-PLAN2.md` (this file; append Results only)
- `handoff/delivery/design/WP5-UX2/mockup.html`
- Temp folder `D:\.claude-tmp\timesheet\WP5-UX2-PLAN2\` (outside the repository)

## Acceptance for this task

- Items 1-8 answered; every observation cites file:line or a plan measurement;
  assumptions are labelled, each with the check T04 must run.
- No file changed outside the owned paths: compare `git status --short` at the start and
  at the end. T01's source edits will appear and are expected; list them without
  touching them.

## Results

Self-reported model: claude-sonnet-5-5. Nothing was built, run or opened in a browser (T01 is editing source). Step 0: `git status --short`
at the start listed T01's expected edits (`eslint.config.js`, `AppShell.tsx`, `index.html`, `styles.css`, `shell.spec.ts`, new `ThemeToggle.tsx`,
`themeModel.ts`, `src/client/public/`, theme tests, `contrast.ts`) plus handoff files; I touched none of them. Numbers below come from the PLAN
sections A5/B5 measurements (card 180px, row 1 52px, meta 52px, Review row 44px; 334px usable at 390; first row bottom 659 / 758, 667 / 766 with
a share; tab bar top 788). Text widths of the buttons are ESTIMATES (15px, weight 600, 14px side padding + 2px border): Today about 60px, Current
period about 128px, Review & sign off about 152px. Check T04 must run: measure the real widths at 390, 375, 360 and 320.

**1. B5 revised: Today (opens the period that contains today).**
- Target: `in_progress` of `GET /periods/current` (= `payPeriodContaining(today_local)`, `src/server/routes/api.ts:110`), re-read on click; the sheet
  loads `in_progress.payroll_date`. It always contains `today_local` by construction. `today_local` is the server's accounting date in the saved
  reporting zone; never `new Date()`, never the display zone.
- Away rule: the shown period does not contain `today_local` (`period_start <= today <= period_end` false), or the Day editor is open on a date
  other than `today_local`. Not away: the button stays rendered with `aria-disabled="true"` (not `disabled`; stays in the tab order, keeps focus),
  muted look, hidden description "Already showing today". Activating when not away does nothing.
- Status: one hidden `role="status"` line, replaced on each use: "Showing today, Wed 10/14/2026, in the period 10/12/2026 to 10/25/2026".
- Scroll: after the period renders, `[data-day="{today}"]` (desktop column or phone row) gets `scrollIntoView({ block: 'nearest' })` (the sticky bars'
  scroll padding already applies). Driven by a jump counter in an effect, so ordinary reloads never scroll.
- Editor: if open on another date it moves to `today_local` (as clicking today's column; focus goes to the editor heading, existing behaviour); if
  closed it stays closed. Unsaved typed values are dropped, same as clicking another column (risk R-T1, unchanged).
- Shared view: the same call on the share's requester, so the owner's `today_local`, zone and periods; view-only grantees can use it (the read-only
  editor follows). Imported periods: allowed in both directions; Review stays disabled beside it.
- Landing rule R-07 unchanged: the page still opens on `current`.

**2. B5b: Current period (returns to the R-07 period the page opens on).**
- Target: `current` of `/periods/current`, re-read on click.
- Visibility (recommended): rendered only when BOTH hold: `current.payroll_date !== in_progress.payroll_date` (the five days P-4..P, server values, no local
  date maths, so payroll exceptions are handled) AND the shown period is not `current`. Otherwise absent from the DOM.
  - Why not always rendered: outside P-4..P both buttons reach the same period (9 of 14 days), so it would be a duplicate; and on a phone an
    always-present third button breaks the budget (item 3).
  - Why not "rendered all window days": at landing in the window the shown period already is `current`; a disabled button would still cost the row.
  - Why this: it appears exactly when it is useful (the owner left the ended period he must review and sign), it never exists at landing, so the
    opening layout and budget are calendar-independent, and a window-day layout is only reached by navigating.
  - Focus: activating it removes it, so focus moves to Today (the next logical control). Today is enabled then, because the sheet shows the ended
    period, which does not contain today.
- Editor behaviour (recommended): it only navigates like the period arrows; the editor stays as it is. Its purpose is going back to review and sign;
  the editor may hold unsaved input for another date, and F-2's "follow" belongs to the "return to the current day" intent of Today only.
- Status line (the same hidden `role="status"`): "Showing the current period 09/28/2026 to 10/11/2026".
- Telling the two apart: the visible text carries the meaning ("Today" vs "Current period"); the accessible names are exactly the visible text
  (SC 2.5.3); optional `aria-describedby` hidden texts: "Opens the period that contains today's date" / "Returns to the period this page opens on, for
  review and sign-off". No tooltip-only information.
- Shared view: the owner's `current` and `in_progress`; the same rule applies to the owner's window.

**3. Placement and order.**
- DOM, tab and visual order: Previous, Next, Today, Current period (when rendered), Review & sign off, inside `.period-cta` (now `flex-wrap: wrap`).
- Desktop: the actions group grows from about 194px to about 413px in the window-away state (44 + 70 + 128 + 145 + 3 gaps of 8). At 1280 the 766px
  card leaves about 253px for the title and meta (ASSUMPTION: the meta lines wrap more, the card grows about 20px). `.period-actions` also gets
  `flex-wrap: wrap` so 768-900px never overflows. Check T04 must run: no horizontal overflow and the arrows do not move at 768, 900, 1024, 1280.
  Next stays left of the new buttons, so repeated Next clicks do not move under the pointer.
- Phone, landing state (the only state with a budget, the plan's four states): Today + Review on one row: 60 + 8 + 152 = 220 <= 334 (390), 319 (375),
  304 (360), 264 (320). Card height unchanged at 180px; numbers unchanged: 659 / 758 without a share, 667 / 766 with one, tab bar top 788.
  Current period is absent at landing by rule, in every state, so this holds on every calendar day.
- Phone, window-away state (after navigating): Today + Current period = 60 + 8 + 128 = 196 <= 264 even at 320, one row; Review & sign off
  (152, flex 1) cannot join (196 + 8 + 152 = 356 > 334) and wraps to its own row: card 180 + 44 + 4 = 228 (+48px). The first day row bottom becomes
  707 / 806 / 715 / 814 (the plan's four states in order): with a zone note it ends 18 / 26px below the tab bar top (788). Accepted because docs/04 line 48 describes the page as
  opened; docs/04 line 48 will say so. Check T04 must run: measure this state at 390 and assert no horizontal scroll and 44px targets at 390, 375, 360,
  320 in both landing and away states. Least costly alternative if the owner dislikes the 18-26px: none found without removing text (three labels need
  356px; a two-segment group still needs 332px with 2px spare).
- Shared view on a phone (no Review, no clock card, 76px freed): both buttons share one row, no extra row.

**4. Model and tests (delta to PLAN section E).**
- Pure `src/client/components/periodJumpModel.ts` (name per brief): `todayJump({ today, current, inProgress, shown, editDate })` returns
  `{ targetPayrollDate, away, moveEditorTo }`; `currentPeriodJump({ current, inProgress, shown })` returns `{ targetPayrollDate, visible }`.
  Periods are the server's objects; the model does no calendar arithmetic except comparing the shown period's dates with `today`.
- Unit `tests/client/periodJumpModel.test.ts`: steps `today` through every day of at least two full periods (56 days) at the wall times due Tuesday
  16:59 and 17:00 America/Los_Angeles, LA 00:00 and 23:59, and the DST days 2026-11-01 and 2027-03-14, building `current`/`in_progress` with the
  production `currentPayPeriod`/`payPeriodContaining`. Asserts: the Today target contains `today`; outside the window `visible` is false for every
  shown period and Today and `current` have the same target; inside the window `visible` is true iff shown differs from `current`; Today in the window
  never targets `current`; away is exact (including an editor date other than today); a payroll exception moving a date keeps the rules. Negative
  control: the old PLAN rule (Today targets `current`) fails on the window days.
- E2E (`today.spec.ts`, both projects, `fixtures.ts` gets an additive `periodsCurrent()` returning the server's `/periods/current`): pick the branch
  from server values (`window = current.payroll_date !== in_progress.payroll_date`) and assert the other branch's opposite fact, never skip.
  - Landing: shown = `current`; Current period count is 0 in both branches; Today is aria-disabled iff the shown period contains today.
  - Window branch: Today opens `in_progress`, today's column and the Today tag present, Current period appears, the status line is correct;
    Current period returns to `current`, disappears, focus is on Today. Outside branch: Next makes Today active, Current period stays at count 0, Today
    returns to `current`.
  - Editor (desktop 1280): open on another workday; Today moves the editor to `today_local`; Current period leaves the editor's date unchanged.
  - Device zone Asia/Ho_Chi_Minh with the simulated clock at 2026-10-25 23:30 America/Los_Angeles: the LA date is Sunday 10-25 (last day of the
    period 10-12..10-25), the device date is already Monday 10-26 (next period). Today must show the period of 10-25, and the Today tag date equals
    `today_local`, not the device date.
  - Shared view (existing sharing flow, an owner with another zone): both buttons use the owner's periods and date.
  - Phone: at landing Today and Review share a row (tops within 2px) and the four-state budget tests still pass; in the away state Today and Current
    period share a row above Review; targets >= 44 x 44; `documentElement.scrollWidth <= clientWidth` at 390, 375, 360, 320.
- Sweep list delta (same shiftclock mechanism): add 2026-10-25 23:30 and 2026-10-26 00:30 with the Asia/Ho_Chi_Minh device zone (the discriminators
  above); keep P-13 Saturday 10:00, P-3 13:00 and 18:00, P Friday 23:59, the flip P+1 Saturday 00:30 (2026-10-31), the DST and year-turn instants of
  the PLAN, and the FIX10 set. In the window instants run the window branch; in the others the outside branch.

**5. Docs delta (PLAN section D; EN and VI, same lines).**
- `docs/04` line 8 (Timesheet row): "period bar (with Today and, after you leave the period the page opens on, Current period), clock panel, a toolbar
  (Open a day, Show details as a switch, Change several days)...".
- line 48 (phone): "Today shares the row of Review & sign off at the first screen; Current period appears only after you leave the opening period (five days of
  every 14), takes the row with Today and moves Review & sign off to the next row; the first-screen sentence describes the page as opened."
- line 53 (period bar): add: "Today opens the period that contains today's date in the timesheet's saved reporting zone (the server's date, never the device zone), shows today's
  column and moves an open Day editor to today; it is always shown and is inactive when the sheet already shows today and the editor is on today.
  Current period returns to the period the page opens on, the current period of R-07 (earliest payroll date on or after today); it is shown only
  while the sheet shows another period and that period differs from the one that contains today (the five days from the Monday after a period ends
  to its payroll Friday), and it only navigates. In a shared view both use the owner's zone and date."
- `docs/10` new entry in "Owner decisions: 2026-10-14 (UI change round 2)": "Today and Current period (WP5-UX2-Q1, owner chat 2026-10-14, verbatim on
  the board): 'Today' opens the period that contains today's date; a separate 'Current period' button returns to the period the page opens on, the
  R-07 current period, which during the five days after a period ends is the ended period kept for review and sign-off. R-07 and D-12 are unchanged.
  Coordinator: Today moves an open Day editor to today (F-2 default); Current period only navigates; it is shown only in those five days and only
  away from the opening period." Plus the PLAN D list; docs/12 bullet gains one clause naming both buttons.

**6. Slice delta (PLAN section G; board numbering T04 = Today).** WP5-UX2-T04: scope item 5 with both buttons; owned paths: `src/client/TimesheetScreen.tsx`,
`src/client/components/PeriodBar.tsx`, new `src/client/components/periodJumpModel.ts` (replacing the PLAN's `todayModel.ts`), `src/client/styles.css`,
`tests/client/periodJumpModel.test.ts`, `tests/e2e/today.spec.ts`, `tests/e2e/fixtures.ts` (additive `periodsCurrent`), `tests/e2e/sharing.spec.ts`
(shared-view case). Size M still (one extra conditional button and about six more checks; no server change), risk M, worker-high, sonnet. Not above M.

**7. Mockup.** `handoff/delivery/design/WP5-UX2/mockup.html` updated: desktop (light and dark) period bar shows Today, Current period and Review; the two
phone first-screen frames show the away state (Today and Current period on one row, Review below); Vietnamese captions of artboards 1 and 3
explain when Current period exists and the +48px away state. The PNG renders predate this addendum and were not regenerated (no browser while T01 runs).

**8. Owner questions.** None. Defaults above are safe and reversible; the visibility rule and the editor choice are recorded as coordinator decisions.
The 18 / 26px overshoot in the away state is flagged for the coordinator, not asked.

Deviations: none. No pipe into head or tail, no stdin script, no cmd.exe, no browser or npm. Changed only this file and `mockup.html`; Step 0 and end
`git status --short` differ only by T01's edits.