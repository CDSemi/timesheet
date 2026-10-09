# WP5 UI redesign, independent review area B — owner-request fidelity, test strength, accessibility, UI standards and documentation

[Tiếng Việt](WP5_UX_REVIEW_B.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-B, attempt 1,
  2026-10-08 (America/Los_Angeles; UTC 2026-10-09T06:36Z to 07:05Z). Reviewer self-reported model `claude-opus-5-5`, profile
  timesheet-auditor (effort set by the profile, not observable from inside). Area A (business integrity, zones, edit paths,
  sharing, privacy, PDF) is reviewed separately and is not covered here.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `831f760838950a59f0e5c880f0bbefda15fe0c61` (the WP5-UX-GATE freeze); digest
  `3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9`, 789 files, `handoff/` excluded, identical before and
  after the review in three forms (`git ls-tree` form, `scripts/source-digest.mjs` in a scratch clone at 831f760, and in the
  working repository). HEAD = origin/main = `5beae2f668d15fc77a39b91a91e2c8bb6195d65a`; `git diff --name-only 831f760 5beae2f`
  outside `handoff/` lists 0 paths. No unpushed commit. Source complete: a clean scratch clone, `npm ci` exit 0.
- **Decision: FIX REQUIRED.** Two Medium findings (B-01 the phone page does not show the first day on the first screen, as
  the approved mockup promised; B-02 between 768 and 1199px the fixed side panel hides keyboard-focused sheet controls) and
  two Low findings (B-03 one weakened e2e assertion; B-04 two inaccurate lines in docs/04, EN and VI). Everything else in
  area B passed: Excel layout on the desktop, E-1..E-7, navigation, keyboard order and names, focus on open/Escape/return,
  the bottom-sheet trap, status never by colour alone, 44px targets, no sideways scroll, text contrast, tokens, radius,
  transition, shadows, reduced motion, system fonts, no deprecated API, docs/10 and docs/12, EN/VI parity, and all
  mandatory checks.

## Scope actually inspected and executed

1. Owner request and E-1..E-7: the board `owner_decisions` of 2026-10-08 (verbatim request and "OK theo khuyến nghị"), docs/10
   (EN and VI), WP5-UX-PLAN sections B, C, E, F, G and the mockup (`mockup.html` captions and the A1/A2 renders), compared
   with the shipped components (`TimesheetSheet.tsx`, `SheetWeekTable.tsx`, `sheetModel.ts`, `DayStatus.tsx`, `PeriodBar.tsx`,
   `ClockPanel.tsx`, `AppShell.tsx`, `TimesheetScreen.tsx`, `DayEditor.tsx`, `SettingsScreen.tsx`) and with my own renders.
2. Test strength: every test file changed since 014bd47 (20 files, `11-tests-numstat.txt`, full diff `12-tests-diff.txt`);
   each removed, loosened or replaced assertion is judged in the table below. I probed what the new
   `filter({ visible: true })` excludes.
3. Accessibility, probed myself with an auditor-written Playwright spec (`ux.probe.ts.txt`, run outside git on the built
   server of the e2e fixture, both projects) and a self-closing runtime probe (`runtime-probe.mjs.txt`, port 47930).
4. UI standards: a token scan of `styles.css` outside the token blocks (`css-scan.mjs.txt`, `css-literals.mjs.txt`), rendered
   transitions, radii, fonts and animations, the CSP in `src/server/app.ts`, grep of the new client code for deprecated DOM
   or React APIs, lint `no-deprecated`, and Node deprecation tracing on lint, unit tests, build and the running server.
5. Documentation: the diffs of docs/04, docs/10, docs/12 (EN and VI) against the shipped UI; a structural EN/VI parity
   script; docs/04 line 16 (viewing zone); the release identity section of docs/12.
6. Mandatory checks, run myself in the clean clone with Node v24.21.0: typecheck, lint, `npm test`, and the full e2e suite on
   both projects.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-B/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| `git ls-tree -r --format='%(path) %(objectname)' 831f760 \| grep -v '^handoff/' \| LC_ALL=C sort \| sha256sum` (before) | `3d274c9e…c7ea9`, 789 lines | `01-digest-before.txt` |
| `node scripts/source-digest.mjs` in the scratch clone at 831f760 (before) | exit 0, `3d274c9e…c7ea9` (789 files) | `01-digest-before.txt` |
| `npm ci` (clone, Node 24) | exit 0, 161 packages | `07-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 files, 1817 tests passed | `04-npm-test.txt` |
| `npm run test:e2e` (build + full Playwright suite, Edge, both projects) | exit 0; 160 tests: 155 passed, 5 skipped, 0 failed; desktop 77 passed + 3 skipped, mobile 78 passed + 2 skipped; 6.3 min | `05-e2e-full.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build with `NODE_OPTIONS=--trace-deprecation --pending-deprecation` | lint exit 0 (rerun with `--ignore-pattern audit-probe/`; the first run failed only on my own probe files, `08a`), test exit 0 (1817 passed), build exit 0; 0 deprecation lines in each | `08-deprecation-summary.txt`, `08a`..`08d` |
| runtime probe: built server with deprecation tracing on port 47930, Edge desktop/1024px/phone through Timesheet, editor, Overtime, History, Settings, Import, Review | exit 0; server deprecation lines 0, browser deprecation messages 0, page errors 0; server stopped (SIGTERM) | `09-runtime-probe.txt` |
| `git diff --stat 014bd47 831f760` outside handoff/ | 67 paths | `10-diffstat-014bd47-831f760.txt` |
| CSS token scan outside the `:root`, dark and reduced-motion blocks | 0 colour, radius, shadow, duration, animation, font or `@font-face` literals; only the keywords `transparent`/`currentColor`; 7 of 7 transitions are `var(--transition)`; 0 undefined `var()`; 3 new literal declarations, all `100vw`/`100dvh` inside `calc()` | `20-css-scan.txt`, `21-css-literals.txt` |
| probe P1 keyboard order and names (both projects) | Tab order: nav, period bar, clock, tools, then `Edit {date}` and `Label for {date}` for 09/28..10/11 in date order (week 1 Mon..Sun, then week 2), then the review link; 14 named day elements (`group "Mon 2026-09-28"` desktop, `row` phone); row-label column `aria-hidden`; hidden row names `Time:`, `OT:`, `Check:` | `31-P1-*.txt` |
| probe P2 editor focus | desktop: heading focused on open, non-modal; Escape from inside closes and focus returns to `Edit {date}`; phone: `:modal`, 60 Tab + 40 Shift+Tab never focus an element outside the sheet (only the browser step, BODY); Escape and Close return focus | `32-P2-*.txt` |
| probe P3 phone 390x844, 8 states (default, details, batch mode, picker open, More, editor, editor with Add session, Review) | 0 controls under 44x44; scrollWidth 390 = clientWidth in every state; editor overflow 0; first day row top 836.6px, tab bar top 788px | `33-P3-*.txt` |
| probe P4 rendered contrast, light and dark | 151/171 text nodes, minimum 5.00 (light) and 5.74 (dark), 0 below 4.5; non-text `--sheet-rule-strong` 2.86/2.97, `--sheet-rule` 1.48/1.56; 0 animated elements; transitions 0.3s ease-out (1e-05s under reduced motion); fonts: the system and mono stacks only; radius 4px (0 on the tab bar items) | `34-P4-*.txt` |
| probe P5 colour alone | every amber cell has Check words and a shape; every non-working day has hatching and a label; today has the "Today" tag | `35-P5-*.txt` |
| probe P6 desktop 768 and 1024px with the panel open | no sideways scroll; 12 sheet controls lie entirely under the fixed panel when focused, at both widths | `36-P6-panel-768-1199.txt`, `editor-w1024-synthetic.png` |
| probe P7 what `filter({ visible: true })` excludes on the phone | only the 5 desktop-bar controls (4 nav links and Sign out, parent `display: none`) on the timesheet, shell and review pages | `37-P7-visible-filter-exclusions.txt` |
| probe P8 phone rows and 360px | every day row at least 54px; no sideways scroll at 360px | `38-P8-phone-rows-360.txt` |
| EN/VI structure of docs 04, 08, 10, 12 | same sections, bullets and code spans; number differences only in decimal style (8.5 / 8,5) and in sections this round did not change | `40-docs-parity.txt` |
| digest after (three forms) | `3d274c9e…c7ea9`, 789 files, all equal | `90-digest-after.txt` |

## Owner request, E-1..E-7 and navigation (scope 1)

- **Desktop sheet: met.** Form header (company, title, "Employee:", "Payroll Date:", "Period:"), two "WEEK n" bands Mon..Sun
  with the rows Day, Date, Label, Time, OT (h:mm), Check, "Show details" rows, legend, "Overtime Total :" bottom right with the
  server's `provisional_credited_minutes` as h:mm, and the signature lines (Employee Signature, Date, Manager Signature "Not
  used yet", Date), matching mockup A1 (`TimesheetSheet.tsx:219-297`, `timesheet-desktop-first-screen-synthetic.png`).
- **E-1 (a)** met: Check row; details behind "Show details" on the Timesheet (`aria-pressed`), always on in the Review
  (`ReviewSheet` passes `details`). **E-2 (a)** met: tint plus hatching from `classification.day_class === 'nonworking'`,
  holiday name in the label cell, app categories only. **E-3 (a)** met on the desktop from 1200px and on the phone (bottom
  sheet; in-cell picker through a one-entry batch preview); between 768 and 1199px see B-02. **E-4** met: MM/DD in cells,
  MM/DD/YYYY in the header and period bar, h:mm, 24-hour ranges in the display zone. **E-5 (a)** met: desktop Timesheet,
  Overtime, History, Settings (+ Admin); phone tabs Timesheet, Overtime, History, More (Settings, Import, Admin, Sign out);
  Import from a Settings link; "OT" renamed. **E-6 (a)** met. **E-7 (a)** met: Overtime, History, Settings keep their layout.
- **Phone layout: deviation (B-01).** The rows are right (Day | Label | Time | OT, Check folded into the Day cell, rows at
  least 54px, no sideways scroll), but the approved direction put the first day on the first screen and the page does not.
- **docs/04 line 16 (viewing zone):** satisfied; the period bar always shows "Times in {zone}" (e2e
  `timesheet.spec.ts:40-58`) and each day keeps its accounting date as its accessible name.

## Test strength (scope 2): every removed, loosened or replaced assertion since 014bd47

| # | File | Old assertion | New assertion | Judgement |
|---|---|---|---|---|
| 1 | timesheet.spec | `table.grid` / `.day-list` counts | `[data-sheet="desktop"\|"phone"]` counts | equivalent (layout renamed) |
| 2 | timesheet.spec | `.facts` contains the ISO `due_local_date` | `[data-period-due]` contains the US date and the reporting zone | equivalent (E-4), plus the zone |
| 3 | timesheet.spec | first row contains the ISO start date | accessible name ends with it, cell shows MM/DD, `Edit {date}` button | stronger |
| 4 | timesheet.spec | complete day contains `complete` and `8h 00m` | `Complete`; `[data-ot]` equals h:mm of the server credit; detail row `regular` exactly `8:00`, 14 detail cells | stronger |
| 5 | timesheet.spec | complete day lacks `pending OT`; pending day has `confirm breaks`, `pending OT` | OT cell lacks `pending`; `Confirm breaks`; `[data-ot="pending"]` text `pending` | equivalent (the OT cell is where pending is printed) |
| 6 | timesheet, shell, review specs | 44px loops over every match | same loops with `.filter({ visible: true })` | equivalent: on the phone the filter drops only the 5 hidden desktop-bar controls (P7); the count guards stay; my P3 found 0 small controls in 8 states |
| 7 | review.spec | per day `td[data-label]` Regular, Off-calendar, Credit = `formatDuration` or `none` | detail cells `regular`, `off-calendar` = h:mm or empty; OT cell by the PDF rule (credit of a complete day, `pending` for incomplete days, absent otherwise) for all 14 days | equivalent: every day's displayed values are still asserted exactly; the credit of an incomplete day is no longer displayed by design (docs/04, PDF `otCellText`) |
| 8 | review.spec | `complete`, `breaks unconfirmed` | `Complete`, `breaks not confirmed` | wording only |
| 9 | day-editor.spec | heading `Figures from the server` | `Figures (computed by the server)` | rename |
| 10 | day-editor.spec | fill `Partial leave minutes` 240 | `Leave hours` 4 + `Leave minutes` 0, same stored 240, plus an out-of-range refusal with nothing saved | stronger |
| 11 | day-editor.spec | past day contains `missing record` | `No times` and one `[data-check="missing"]` | equivalent, plus the status key |
| 12 | day-editor.spec | future day `upcoming`, not `missing record`, not `pending OT` | `Upcoming`, `[data-check="upcoming"]`, not `No times`/`Missing record`, no missing key, no `[data-ot="pending"]`, no `pending` | stronger |
| 13 | shell.spec | 5 nav links; banner Sign out | exact link lists per layout, More expanded/collapsed, Escape returns focus, tabs 56x44; desktop banner Sign out | stronger |
| 14 | shell.spec | row `complete`, `8h 00m` | `Complete`, `[data-check="complete"]`, detail `8:00` | equivalent+ |
| 15 | admin.spec | nav lists with `OT` and `Import` | exact lists per layout (E-5) | equivalent |
| 16 | import.spec | `Import` link `aria-current` on `#/import` | phone `Import`, desktop `Settings` current | equivalent (E-5 mapping) |
| 17 | import.spec:382-396 | on `#/admin`: Import link visible, then no `Import a workbook` heading and no `Opening OT balance` in main | desktop clicks Settings first, so both absence checks run on the Settings page | **weakened on the desktop project (B-03)**; the phone project still checks the Admin page |
| 18 | history-settings.spec | status line in the desktop grid caption; no grid on the phone | one status line in the period bar, none in the sheet, the right layout present, signature line text, no image | equivalent (status moved by design) |
| 19 | isolation.spec | row lacks `complete` (x2) | lacks `Complete` and `[data-check="complete"]` | stronger |
| 20 | setup, sharing, isolation, admin specs | banner Sign out / direct nav links | open More on the phone first | equivalent |
| 21 | ot-leave.spec | link `OT` | link `Overtime` | rename |
| 22 | dayModel.test | 3 `weekGroups` cases (function removed) | `sheetWeeks` cases: Mon..Sun bands with Mon first and Sun last, mid-week partial weeks [2,1], empty, plus zone invariance | equivalent+ (the [2,1] split still proves the Monday boundary) |
| 23 | sessionModel.test | minutes field; bad `1.5`, `-1`, `1441`, `abc`; hints | hours+minutes; bad `1.5`, `-1`, 24h1m (=1441), 25h, 60m, `abc`, `1e1`; hints incl. `45m`; 90-minute case | stronger |
| 24 | engine.test | none removed | formatter cases and app-vs-PDF equality for 0..3000 | added |

Result: one weakened assertion (#17, B-03); every other change is equivalent or stronger. No skip, `only` or `fixme` was
added; no config changed; `fixtures.ts` unchanged.

## Accessibility (scope 3)

- Keyboard order Mon..Sun week 1 then week 2: **pass** on both projects (P1). Names: day `group`/`row` "Mon 2026-09-28",
  `Edit {date}` / `View {date}`, `Label for {date}: {label}`, dialog "Day editor {weekday date}", status words: **pass**.
  Hidden row names and the `aria-hidden` row-label column: **pass**.
- Side panel focus on open, Escape, focus return: **pass** at 1280px (P2, e2e). Bottom sheet trap: **pass** (P2: focus never
  reaches the page behind; `:modal`). More panel Escape returns focus to More (e2e).
- Status never by colour alone: **pass** (P5). 44px on the phone and no sideways scroll at 390px (and 360px): **pass** (P3,
  P8). Contrast of text: **pass** (rendered minimum 5.00 light, 5.74 dark; gate token pairs at least 4.65).
- **WCAG 1.4.11 judgement on `--sheet-rule-strong` (2.86 light / 2.97 dark against the card):** not required to understand
  the sheet, so not a failure. It draws the rule under the form header, the frame of the "Overtime Total :" box, the
  signature lines and the dashed outline of break chips. None of them identifies a control or a state: each carries its own
  text (the header text, "Overtime Total :" with its value on a tinted `--sheet-head` background, "Employee Signature" /
  "Manager Signature" / "Date" captions with the state above the line, the break times). The lighter cell rule
  `--sheet-rule` (1.48 / 1.56) is likewise structural: days are identified by the weekday header and the column alignment
  on the desktop (and the group names), and by column headers in the phone tables. A darker rule would be an optional
  visual improvement, not a conformance fix.
- **Not passed:** between 768 and 1199px the fixed side panel hides focused sheet controls (B-02).

## UI standards (scope 4)

Tokens only outside the token blocks (no hard-coded colour, radius, shadow or duration), `--radius: 4px`, one shared
`--transition: all 300ms ease-out` on every transition declaration, layered tinted shadows (`--shadow-panel` 4 layers,
`--shadow-overlay`), reduced motion (`--duration` 0.01ms, no `animation` or `@keyframes`, the running dot is static),
system and mono font stacks only (CSP `default-src 'self'`, no `@font-face`, no inline style), lint `no-deprecated` exit 0,
0 Node and 0 browser deprecation messages: **pass**. Nine layout custom properties are scoped inside rules (styles.css
1028-1032 and 1324-1327) rather than the `:root` block; they are geometry, not colour/radius/shadow/duration, so acceptable.

## Documentation (scope 5)

docs/10 and docs/12 (EN and VI) describe the round accurately; docs/12 adds no release identity (the only commit and digest
in it are the pre-existing pre-notes source of WP5, and the new text says the identity is refreshed after the gate and
audit). EN/VI parity holds in every changed section. docs/04 is accurate except the two lines in B-04 and the 768-1199px
sentence in B-02.

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-B-01 | Medium | `src/client/TimesheetScreen.tsx:352-391` (page heading block, workbar and tools card above the sheet); `src/client/components/PeriodBar.tsx:82-94` with `styles.css:979-993` (phone period card wraps a separate actions row); `src/client/components/TimesheetSheet.tsx:249-270` with `styles.css:1568-1576` (three-line form header on the phone) | Phone 390x844 (e2e mobile project or `runtime-probe.mjs.txt`): sign in, measure the first `[data-day]` (`33-P3-phone-targets-overflow-position.txt`; `timesheet-phone-first-screen-synthetic.png`) | Expected (approved direction): "The first day row appears within the first screen" (WP5-UX-PLAN section C, mobile-first behaviour; owner-facing caption of mockup A2: "Ngày đầu tiên hiện ngay trong màn hình đầu"), with the order period card, clock card, sheet. Actual: first day row top 836.6px, below the tab bar (788px) and the viewport (844px); before it come a "Timesheet"/name block (below the 52px bar), the period card (from 162px, with a separate `<` / "Review & sign off" / `>` row), the clock card (from 361px), a tools card ("Open a day", "Show details", "Change several days", from 499px) and a three-line form header (from 636px). No day is visible without scrolling, as in the old UI (1149px) | Owner request 2026-10-08 (friendlier, Excel-like page for daily phone use), E-1/E-3 approved with mockup A2, plan C | Compact the phone layout so at least the first day row is fully visible above the tab bar at 390x844 (for example hide the page heading block below 768px, put `<` `>` and the badges in the period title row and the "Review & sign off" link in the signature card as in A2, fold the tools into one compact row or below the sheet, one-line form header as in A2), and add a mobile e2e assertion that the first `[data-day]` bottom is at or above the tab bar top |
| WP5-UX-B-02 | Medium | `src/client/styles.css:1768-1774` (`.day-panel-side` fixed at the right edge below 1200px) and `:1776-1794`; `src/client/DayEditor.tsx:79-89` (`show()`, non-modal) and `:184-189` (Escape handled only inside the dialog); docs/04 line 59 (EN and VI) | Desktop project at 768x800 and 1024x800: open a day, focus each day button and label picker of the sheet (`36-P6-panel-768-1199.txt`; `editor-w1024-synthetic.png`); press Escape while focus is on the sheet (`32-P2-editor-focus-desktop.txt`, `panelOpenAfterEscapeFromSheet: true`) | Expected: the sheet stays visible and usable beside the panel (E-3 a, docs/04 "so the sheet stays visible"), and a focused control is never entirely hidden. Actual: 12 sheet controls (Thu/Fri..Sun columns of both weeks) are focusable while entirely covered by the panel at both widths; the toolbar's right side and the clock panel are covered too; Escape from the sheet does not close the panel, so a keyboard user cannot reveal the focused control without moving focus | WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum); plan C accessibility; E-3 (a) | Below 1200px either give the panel its own column so it does not overlay the sheet, or open it modal there (inert page) like the phone sheet; keep focus return; align docs/04 line 59 (EN and VI); add an e2e check at 1024px that no focused sheet control is entirely under the open panel |
| WP5-UX-B-03 | Low | `tests/e2e/import.spec.ts:382-396` | Read the test; on the desktop project the `else` branch clicks Settings (line 391) before lines 394-395 | Expected: as before the round, the absence of "Import a workbook" and "Opening OT balance" is asserted on the Admin view in both projects. Actual: on the desktop project both absence checks run on the Settings page, so the desktop run no longer checks the Admin view (the phone run still does) | Brief scope 2 (a weakened assertion is a finding); AC-01 intent of the test name | Assert the two absence checks on `#/admin` before the desktop branch navigates to Settings (or navigate back to Admin), keeping the "Import from Excel" link check |
| WP5-UX-B-04 | Low | `docs/04_UX_AND_SETTINGS.md:55` and `.vi.md:55`; `docs/04_UX_AND_SETTINGS.md:41` and `.vi.md:41` | Compare with `TimesheetScreen.tsx:407-422`, `SheetWeekTable.tsx:50-52`, `BatchBar.tsx:36-45`, `sheetModel.ts:189` | Line 55 says "the label picker" appears only after "Change several days"; the in-cell label picker is shown by default and is absent in batch mode (line 63 says so); the batch control is "Category for selected days". Line 41 lists the Check words but omits "Missing record" (shown for an expected day with sessions but no calculation) | Brief scope 5 (docs describe the shipped UI); AGENTS rule 1 (EN/VI pairs) | Replace "the label picker" with "the category choice ("Category for selected days")" and add "Missing record" to the Check list, in EN and VI |

## Risks and optional improvements (not defects)

- **R-1 Focus ring (pre-existing).** `--focus-ring` (unchanged since before 014bd47) is a 3px accent ring at 35% / 45% alpha,
  about 1.7:1 against the light card and 2.4:1 against the dark card (computed from the tokens). The new label picker uses
  a solid 2px accent ring; the date buttons and other controls use the shared ring. A stronger shared ring would help the
  keyboard-heavy sheet; optional for a later round.
- **R-2 Date style outside the sheet.** The Review header ("2026-09-28 to 2026-10-11, payroll date 2026-10-16") and its
  checklist use ISO dates while the sheet uses US dates (E-4 covers the sheet only). Optional consistency.
- **R-3 Phone account button.** Plan C mentioned an account button in the phone top bar; the name and Sign out sit under
  More instead. Functionally equivalent.
- **R-4 Legend.** The Timesheet legend always lists "Today" (`TimesheetSheet.tsx:284`), also for a period without today.
- **R-5 Read-only editor wording.** The read-only day facts still print "none" (`DayEditor.tsx:387, 393, 403`); the sheet
  itself never does.
- **R-6 Port note.** The e2e fixture chooses OS-free loopback ports (as in every earlier gate); my own server used 47930.

## Required gates unrun or blocked, and why

None in area B. Typecheck, lint, `npm test` and the full e2e suite on both projects ran here and passed. Area A items
(business integrity, R-07 zone correctness of every value, AC-04/AC-16/AC-01 on every new edit path, privacy, PDF) are
outside this review.

## Disposition of previous findings

No earlier area-B finding exists for this round. The gate's note on `--sheet-rule-strong` is judged above (not a failure).
The gate's fixed-bar conclusion (sticky top bar, fixed tab bar, no overlap) agrees with my phone renders.

## Software readiness, owner permission and pilot result

- **Software readiness, area B:** not yet; B-01 and B-02 need a bounded client fix round (fix, freeze, gate, re-audit of
  area B; area A only if its findings or the fix touch its scope). B-03 and B-04 can ride in the same round.
- **Owner permission:** none requested or given; no deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: open a bounded fix task for WP5-UX-B-01..B-04 (client layout below 768px and between 768 and 1199px, one e2e
assertion each, the import.spec order, docs/04 EN+VI), then freeze, gate and re-audit area B on the new digest.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-B, attempt 1; reviewer self-reported
  `claude-opus-5-5` (fresh subagent; agent ID not visible from inside). Reviewed authors: WP5-UX-PLAN, WP5-UX-T01..T06,
  WP5-UX-FIX1 and their freezes, and the WP5-UX-GATE verifier (as recorded in their task files).
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no earlier
  gate or audit of this round. I edited no source, test, doc, board or STATE file; my probes ran in a scratch clone outside
  git tracking (`.git/info/exclude`) and are copied here as `.txt`.
- **Source digest before/after; gate evidence for that snapshot:** `3d274c9e…c7ea9` before and after, three forms
  (`01-digest-before.txt`, `90-digest-after.txt`); it equals the WP5-UX-GATE digest of record.
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_B.md` and `.vi.md`, new files;
  earlier WP5 reviews are untouched.
- **Finding dispositions and next coordinator fix/recheck task:** WP5-UX-B-01..B-04 open; next: a WP5-UX fix task, its freeze,
  a gate and a fresh area-B re-audit on the new digest.
