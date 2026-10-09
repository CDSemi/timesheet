# WP5 UI redesign, independent re-review area B after the fix round — owner-request fidelity, test strength, accessibility, UI standards and documentation

[Tiếng Việt](WP5_UX_REVIEW_B2.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-B2, attempt
  1, 2026-10-09 (America/Los_Angeles; UTC 2026-10-09T08:30Z to 09:05Z). Reviewer self-reported model `claude-opus-5-5`,
  profile timesheet-auditor (effort set by the profile, not observable from inside). Area A is re-audited separately
  (WP5-UX-AUDIT-A2) and is not covered here. The earlier area-B review on 831f760 is
  [WP5_UX_REVIEW_B.md](WP5_UX_REVIEW_B.md) and is preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `589bcff5541a603abad696a3303dbea11cccb4a7` (the WP5-UX-REGATE freeze; HEAD = origin/main); digest
  `8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e`, 789 files, `handoff/` excluded, recorded first and again
  after all checks, equal in three forms (`git ls-tree` form, `scripts/source-digest.mjs` in the working repository, and in a
  scratch clone at 589bcff with `git status --short` empty). 0 paths outside `handoff/` differ from 589bcff; no unpushed
  commit. Source complete: a clean scratch clone, `npm ci` exit 0.
- **Decision: FIX REQUIRED.** B-01, B-02, B-03 and B-04 of the first review are **closed**, each verified in the built app
  or the test, and every new e2e assertion of the fix round fails on the 831f760 behaviour. One new Low finding:
  **WP5-UX-B2-01**, a regression introduced by the B-01 compaction: below about 375px the "Open a day" date field shrinks
  until its value is clipped ("10/09/202" at 360px, "10/0" at 320px; the full date was shown at 831f760). Everything else in
  area B passed, including all mandatory checks (typecheck, lint, `npm test` 1820 passed, full e2e 164 passed, 10 skipped,
  0 failed on both projects).

## Scope actually inspected and executed

1. B-01..B-04 closure: the fix round diff `831f760..589bcff` (12 files; `10-…`, `14-…`), the built app (auditor probes PB1
   to PB8), and the new e2e assertions run on a scratch clone at 831f760 with the 589bcff spec files copied over it (`30-…`),
   plus a mutation of the Admin view for B-03 (`31-…`).
2. The whole area-B scope again on 589bcff: the owner request and E-1..E-7 (board `owner_decisions`, docs/10 EN and VI,
   WP5-UX-PLAN sections C and E, mockup A1/A2 captions and renders) against the shipped components and my renders; test
   strength over every test file changed since 014bd47 (`11-…`, `13-…`) and the fix round (`12-…`); accessibility with my own
   Playwright probe (`ux2.probe.ts.txt`) on my own built servers (ports 48001 and 48002); UI standards (token scan
   `css-scan.mjs.txt`, rendered contrast, lint `no-deprecated`, Node deprecation tracing, browser console); docs/04, docs/10,
   docs/12 accuracy and EN/VI parity (`parity.mjs.txt`).
3. R-1..R-6 of the first review, re-judged on 589bcff.
4. Mandatory checks, run myself in the scratch clone with Node v24.21.0.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-B2/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms (before) | `8c07aac5…0a2e`, 789 files | `01-digest-before.txt` |
| `npm ci` (scratch clone) | exit 0 | `07-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `04-npm-test.txt` |
| `npm run test:e2e` (build + full Playwright suite, Edge, both projects) | exit 0; 174 tests: 164 passed, 10 skipped, 0 failed; desktop 82 passed + 5 skipped, mobile 82 passed + 5 skipped (all skips project-specific by design); 5.6 min | `05-e2e-full.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; built server with tracing on 48003 (6 requests) | exit 0 each; 0 deprecation lines; server stopped (SIGTERM); browser console only the pre-sign-in 401 | `08-…`, `08a`..`08d`, `49-…` |
| 589bcff spec files on the 831f760 client, the fix-round tests only | 7 failed (B-01 x2: 910.2 and 1046.6 > 788.5; B-02 768 and 1024: "Clock in" focused entirely under the panel after 19 Tab presses; B-02 1280: Escape from the sheet left the editor open; period-card tab order x2), 2 passed (B-03, behaviour unchanged), 5 skipped by project | `30-…`, `30a-…` |
| B-03 mutation: Admin view shows an "Import a workbook" heading (scratch, restored) | 589bcff test fails on desktop and mobile at line 389; 831f760 test passes on desktop, fails only on mobile | `31-…`, `31a`, `31b` |
| PB1 phone 390x844, 6 states x 2 zone situations | first day row bottom 659.0 (zone equal) / 758.0 (zone note) vs tab bar top 788 at load, clocked out and clocked in; order period card, clock card, sheet in every state; scrollY 0; no sideways scroll (831f760: 910.2 / 1046.6) | `41-…`, `41b-…`, `49c`, `49d` |
| PB2 full Tab sequence | phone: Previous, Next, Review, Clock, Open a day, Show details, Change several days, then Edit/Label for 09/28..10/11 in date order, the signature Review link, then the tab bar; 0 reading-order inversions. Desktop: top bar, period, clock, tools, days Mon..Sun week 1 then week 2 (column order) | `42-…`, `42b-…` |
| PB3 widths 390/360/320, default and batch mode | scrollWidth = clientWidth; 0 elements past the viewport; 0 visible controls under 44x44; "Open a day" field 146.2 / 116.2 / 76.2px (831f760: 153px at every width) | `43-…`, `49e` |
| PB3b "Open a day" with a date typed | value 2026-10-09 shows in full at 390 and 375; clipped to "10/09/202" at 360 and "10/0" at 320 (831f760: full at 320) | `43b-…`, `49f`, screenshots |
| PB4 editor at 768/1024/1199/1200/1280 | below 1200: `:modal`, hit test on a sheet day lands on the dialog (page inert), 160 Tab/Shift+Tab presses: 0 outside, 0 hidden; `focus()` on a sheet control or "Open a day" does not move focus; Escape and Close close it, focus returns to the day button. From 1200: not modal, panel beside the sheet card (no overlap), 0 focused controls hidden, Escape from a sheet button and from "Open a day" closes it, focus returns. Resize 1280 to 1024 while open: becomes modal with focus inside; back to 1280: non-modal | `44-…` |
| PB5 nested Escape at 1280 | Escape in an open label picker closes only the picker (focus on it); with a review dialog over the open editor, Escape closes only the dialog (nothing saved); the next Escape closes the editor | `45-…` |
| PB6 period bar | Tab order Previous, Next, Review on both projects; phone: `<` (28,84) and `>` (318,84) beside the title, Review on its own row (28,192); desktop one row x 72, 612, 660 | `46-…`, `46b-…` |
| PB7 rendered contrast of the compact phone text (period card, clock, tools, form header, week bar) | 43 text nodes per theme; minimum 5.00 light, 5.80 dark; 0 below 4.5 | `47-…` |
| PB8 Review on a phone | form title visually hidden (same rule as the Timesheet sheet), page h1 visible, no sideways scroll | `48-…` |
| CSS token scan of `styles.css` | 0 colour, radius, shadow, duration, animation, font or url literals outside the token blocks; `--radius: 4px`; 7 of 7 transitions `var(--transition)` = `all 300ms ease-out`; 0 undefined `var()`; the fix round adds only structural numbers (grid placement, 0, 100%, flex 1, min-width 0); the new `::backdrop` uses `--scrim` | `20-…`, `21-…` |
| EN/VI parity of docs 04, 10, 12 | docs/04: the four fix-round lines (41, 48, 55, 59) match in code spans, quoted strings and numbers; other differences are translated section names and the VI translation-note line; docs/10 and docs/12 unchanged since 831f760 | `50-…`, `51-…` |
| digest, three forms (after) | `8c07aac5…0a2e`, 789 files, all equal | `90-digest-after.txt` |

## B-01..B-04 of the first review

| ID | Disposition | Observation |
|---|---|---|
| WP5-UX-B-01 | **Closed** | At 390x844 the first `[data-day]` row is fully above the tab bar at load: bottom 659.0 (viewing zone = reporting zone) and 758.0 (zone note shown) against 788, also while clocked in and on an old period (682.6 / 781.5). The compact layout keeps the approved order period card, clock card, sheet (mockup A2) in every measured state (`41-…`). The mobile e2e tests assert it and fail on 831f760 (910.2 / 1046.6). docs/04 line 48 (EN, VI) describes it. Deviations from A2 that I judge compatible with the approved direction: the tools row ("Open a day", "Show details", "Change several days") sits between the clock and the sheet; "Review & sign off" is the last row of the period card (and stays on the signature line); the clock button is large but not full width; one or two day rows show instead of a whole week. |
| WP5-UX-B-02 | **Closed** | Below 1200px the editor is modal (inert page, scrim), so no focused sheet control is ever hidden; focus trap, focus return, Escape and Close verified at 768, 1024 and 1199; from 1200px it is non-modal in its own column beside the sheet and Escape closes it from anywhere, while a nested picker or dialog takes Escape first (`44-…`, `45-…`). docs/04 line 59 (EN, VI) states this. The e2e tests fail on 831f760. |
| WP5-UX-B-03 | **Closed** | `tests/e2e/import.spec.ts:388-390` asserts the "Administration" heading, no "Import a workbook" heading and no "Opening OT balance" on `#/admin` in both projects before the desktop branch goes to Settings; the later checks remain. The mutation shows the desktop run now catches an import control on the Admin view; the 831f760 test did not (`31-…`). |
| WP5-UX-B-04 | **Closed** | docs/04 line 41 lists Complete, Running, Open session, Confirm breaks, No times, Missing record, Upcoming, Calculation problem, equal to the `text` values in `sheetModel.ts:180-193`; line 55 names "the category choice ("Category for selected days")"; both in EN and VI. |
| Addendum 1 (phone tab order) | **Closed** | DOM order Previous, Next, Review (`PeriodBar.tsx:37-95`); the Tab order equals the reading order on both layouts (PB2, PB6); the e2e assertion fails on 831f760. |

## Owner request, E-1..E-7 and navigation (scope 1)

- **Desktop sheet:** unchanged by the fix round and met (Excel form header, two Monday to Sunday bands with Day, Date,
  Label, Time, OT, Check, "Overtime Total :", signature lines); the e2e `timesheet.spec.ts` asserts the structure.
- **E-1 (a), E-2 (a), E-4, E-6 (a), E-7 (a):** met as before (no fix-round change). **E-3 (a):** met: side panel on a
  desktop (modal at 768-1199, beside the sheet from 1200), bottom sheet on a phone, in-cell label picker. **E-5 (a):** met
  (e2e shell, admin, import specs).
- **Phone layout:** meets the approved first-screen promise (B-01 above). The one regression is WP5-UX-B2-01.
- **Desktop period bar:** now `<` period `>` "Review & sign off" (mockup A1 had the review link before `>`); this follows
  from making the DOM order the reading order and is not a defect.
- **docs/04 line 16 (viewing zone):** still satisfied; the compact period card keeps "Times in {zone}" (screenshots).

## Test strength (scope 2)

Every test file changed since 014bd47 (20 files) was re-read in the diff `014bd47..589bcff` (`13-…` lists every removed
line). I re-judged each removed, loosened or replaced assertion myself:

| # | File | Change | Judgement |
|---|---|---|---|
| 1-5 | timesheet.spec | layout hooks renamed (`[data-sheet]`); due date in US form plus the reporting zone; day named by its ISO date plus the MM/DD cell and `Edit {date}`; Complete with the server OT as h:mm and the detail row `8:00`; pending OT in the OT cell | equivalent or stronger |
| 6 | timesheet, shell, review specs | 44px loops with `.filter({ visible: true })` | equivalent: count guards kept; my PB3 found 0 small visible controls at 390/360/320 |
| 7-8 | review.spec | per-day detail cells and the OT cell by the PDF rule for all 14 days; wording | equivalent |
| 9-12 | day-editor.spec | heading rename; leave as hours + minutes with a refusal; "No times" / Missing record keys; Upcoming checks | equivalent or stronger |
| 13-16 | shell, admin, import specs | exact nav lists per layout (E-5) | equivalent or stronger |
| 17 | import.spec:382-400 | weakened at 831f760 (B-03) | **restored** at 589bcff (row B-03 above) |
| 18-21 | history-settings, isolation, setup, sharing, ot-leave specs | status moved to the period bar; Complete key; More on a phone; rename | equivalent or stronger |
| 22-24 | dayModel, sessionModel, engine tests | `weekGroups` cases moved to `sheetModel.test.ts`; hours + minutes cases; formatter cases | equivalent or stronger |
| 25 | leaveInputModel.test (FIX2) | import list reformatted (the only removed line); 3 new cases ("2-", "3-", "e", "1.5", "-1", bad-input flags, `invalidLeaveParts`) | added |
| 26 | day-editor.spec (FIX2) | malformed leave input: one alert, `aria-invalid` / `aria-describedby` on the right field, no PUT, nothing stored; 150 and 0 still saved | added |
| 27 | day-editor.spec:833-839 (FIX2 racy wait) | before each "Next period" click the Pay period text is read; after it the test waits for that text to change, then for 14 rows | stronger: one wait added, no assertion removed or loosened |
| 28 | timesheet.spec (FIX3) | phone first screen, zone equal and zone note: first row bottom at or above the tab bar, tab bar in the lower half, scrollY 0 | added; fails on 831f760 |
| 29 | timesheet.spec (Addendum 1) | period card Tab order Previous, Next, Review plus visual order, both projects | added; fails on 831f760 |
| 30 | day-editor.spec (FIX3) | 768 and 1024: 140-press walk, no focused control entirely under the panel, Escape with focus placed on the sheet; 1280: not modal, Escape from a sheet button and from the toolbar, focus return | added; fails on 831f760 |
| 31 | import.spec (FIX3) | B-03 restore | added; bites under mutation |

Result: **no weakened assertion** at 589bcff. No `only`, `fixme` or new unconditional skip; the new skips are
project-scoped (`isMobile`). `playwright.config.ts` and `tests/e2e/fixtures.ts` are unchanged since 014bd47.

## Accessibility (scope 3)

- Keyboard order: phone and desktop follow the reading order (PB2), Mon..Sun week 1 then week 2; the period card order is
  Previous, Next, Review (PB6). **Pass.**
- Names: `Edit {date}`, `Label for {date}: {label}`, the dialog named by its "Day editor {weekday date}" heading, status
  words, the "Open a day" field named by its label. **Pass.**
- Modal editor below 1200px: `:modal`, page inert (hit test lands on the dialog), focus trap over 160 presses, Escape and
  Close, focus return to the day button, resize handled (PB4). Non-modal from 1200px with Escape from anywhere and nested
  dialogs first (PB4, PB5). **Pass.**
- Status never by colour alone: the Check words and shapes are unchanged by the fix round (e2e asserts the shape; the
  screenshots show "No times" with a square). **Pass.**
- 44px targets and no horizontal scroll: 0 small visible controls and no sideways scroll at 390, 360 and 320px (PB3), and
  the e2e mobile loops pass. **Pass**, but see WP5-UX-B2-01 for clipped content at 360 and 320px.
- Contrast: compact phone text minimum 5.00 light / 5.80 dark (PB7); colour tokens unchanged since the gate (REGATE token
  pairs at least 4.65). I keep the first review's WCAG 1.4.11 judgement on `--sheet-rule-strong` (structural rules, not
  required to understand the sheet). **Pass.**

## UI standards and deprecated APIs (scope 4)

Tokens only outside the token blocks, `--radius: 4px`, one shared `--transition` (`all 300ms ease-out`) on every transition,
layered shadows (`--shadow-overlay`, `--shadow-panel` from 1200px), the new backdrop on `--scrim`, no animation or
`@keyframes`, reduced-motion block untouched, system fonts only. New client APIs (`useSyncExternalStore`,
`matchMedia().addEventListener`, `HTMLDialogElement.show/showModal`, `validity.badInput`) are current. Lint `no-deprecated`
exit 0; 0 Node deprecation lines in lint, tests, build and the running server; 0 browser deprecation messages. **Pass.**

## Documentation (scope 5)

docs/04 (EN and VI) describes the shipped phone first screen (line 48), the editor modes and Escape rule (line 59), the
Check words (line 41) and the batch category choice (line 55) accurately; EN/VI parity holds on those lines. docs/10 and
docs/12 are unchanged since 831f760, still accurate at their level of detail, and docs/12 adds no release identity.
**Pass** (one optional wording point, O-1).

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-B2-01 | Low | `src/client/styles.css:1081-1103` (phone block added by WP5-UX-FIX3: `.tools .open-day { flex-wrap: nowrap }`, the label made a row with `white-space: nowrap`, the input `flex: 1; min-width: 0`) | Mobile project, Timesheet page, type a date in "Open a day", set the width to 360 and 320px (`43b-PB3b-open-day-field.txt`, `pb3b-open-day-w360-synthetic.png`, `pb3b-open-day-w320-synthetic.png`); compare 831f760 (`49f-…`, `831f760-pb3b-open-day-w320-synthetic.png`) | Expected: the field shows the full date it holds at every phone width, as at 831f760 (153px on its own row). Actual: the field shrinks to 116.2px at 360 and 76.2px at 320; "2026-10-09" renders as "10/09/202" and "10/0". No sideways scroll and the picker still works, but the value is cut off. 320 CSS px is also a 1280px desktop at 400% zoom | WCAG 2.2 SC 1.4.10 Reflow (AA, no loss of information at 320 CSS px); AGENTS.md "responsive mobile-first default"; a regression introduced by the fix round | Keep the date field at least the width of a full date (a new token, for example `--date-field-min`) and let the "Open a day" row wrap (label above the field or the button below) when that does not fit, for example below 375px, without breaking the 390x844 first-screen budget; add a phone assertion at 360 and 320px that the field is at least that width, and keep the B-01 tests passing |

## Risks and optional improvements (not defects)

- **R-1 Focus ring (pre-existing, unchanged):** `--focus-ring` (`styles.css:37, 176`) computes to about 1.72:1 on the light
  card and 2.45:1 on the dark card; the modal editor relies on it too. Still pre-existing and outside this round; a stronger
  shared ring remains recommended.
- **R-2 ISO dates in the Review header (unchanged):** `ReviewScreen.tsx:170`. Optional.
- **R-3 No phone account button (unchanged):** the name and Sign out stay under More; on the phone Timesheet the page heading
  with the name is now screen-reader only, the form header still shows "Employee: {name}". Functionally equivalent.
- **R-4 Legend always lists "Today" (unchanged):** `TimesheetSheet.tsx:284`. Optional.
- **R-5 Read-only editor prints "none" (unchanged):** `DayEditor.tsx:407, 413, 423`. Optional.
- **R-6 Ports (unchanged):** the e2e fixture picks OS-free loopback ports; my own servers used 48001-48003. Not a defect.
- **O-1** docs/04 line 9 (EN, VI) still summarises the editor as "a side panel beside the sheet on desktop"; from 768 to
  1199px it is a modal panel over the sheet (line 59 is exact). Optional wording alignment.
- **O-2** `DayEditor.tsx:83-84` comment still says the mode switch happens when "the window crossed 768px"; it is 1200px now.
- **O-3** `.tools .open-day` is declared twice in the same phone block (`styles.css:1081` and `:1101`); can be merged with
  the WP5-UX-B2-01 fix.
- **O-4** The phone first-screen budget is tight: with the zone note and a one-line notice ("Clocked out.") the first row
  bottom is 787.7 against 788 (`41b-…`, state `afterClockOut`); a longer transient message pushes it below the tab bar.
  The load state the requirement names passes.

## Required gates unrun or blocked, and why

None in area B. Typecheck, lint, `npm test` and the full e2e suite on both projects ran here and passed. Area A items are
outside this review.

## Disposition of previous findings

WP5-UX-B-01, B-02, B-03 and B-04: closed (table above). R-1..R-6: re-judged, none became a defect; the fix round changed
none of them. New: WP5-UX-B2-01 (Low), open.

## Software readiness, owner permission and pilot result

- **Software readiness, area B:** not yet; WP5-UX-B2-01 needs a small client fix (CSS of one phone row and one assertion),
  its freeze, a gate and an area-B recheck of that change.
- **Owner permission:** none requested or given; no deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: open a bounded fix task for WP5-UX-B2-01 (the "Open a day" row in the phone block of `styles.css`, one phone
assertion at 360 and 320px; optionally O-1..O-3), then freeze, gate and a fresh area-B recheck on the new digest.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-B2, attempt 1; reviewer self-reported
  `claude-opus-5-5` (fresh subagent; agent ID not visible from inside). Reviewed authors: WP5-UX-PLAN, WP5-UX-T01..T06,
  WP5-UX-FIX1..FIX3 and their freezes, the WP5-UX-GATE and WP5-UX-REGATE verifiers (as recorded in their task files; the
  strongest author model recorded is opus, the same as mine).
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no earlier
  gate or audit of this round. I edited no source, test, doc, board or STATE file. My probes ran in scratch clones in the
  task folder, kept out of git by `.git/info/exclude`; the B-03 mutation was made only in the 831f760 scratch clone and
  restored. Process slips, none of which wrote a file outside the task and evidence folders: one read-only `node -e` print
  ran with the system Node v26 because the environment was not sourced (it failed on a syntax error); one command ended
  with a `| head -c 0` pipe (no output); one redirect with an unset variable tried the drive root and was refused
  ("Permission denied"; no file exists there).
- **Source digest before/after; gate evidence for that snapshot:** `8c07aac5…0a2e` before and after, three forms
  (`01-digest-before.txt`, `90-digest-after.txt`); it equals the WP5-UX-REGATE digest of record.
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_B2.md` and `.vi.md`, new files;
  `WP5_UX_REVIEW_B.md` and every earlier review are untouched.
- **Finding dispositions and next coordinator fix/recheck task:** B-01..B-04 closed; WP5-UX-B2-01 open; next: a fix task
  for WP5-UX-B2-01, its freeze, a gate and an area-B recheck.
