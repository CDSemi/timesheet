# WP5 UI redesign, independent re-review area B on the final snapshot — owner-request fidelity, test strength, accessibility, UI standards and documentation

[Tiếng Việt](WP5_UX_REVIEW_B3.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-B3, attempt
  1, 2026-10-09 (America/Los_Angeles; UTC 2026-10-09T09:46Z to 10:15Z). Reviewer self-reported model `claude-opus-5-5`,
  profile timesheet-auditor (effort set by the profile, not observable from inside). Area A is rechecked separately
  (WP5-UX-AUDIT-A3) and is not covered here. The earlier area-B reviews [WP5_UX_REVIEW_B.md](WP5_UX_REVIEW_B.md) (831f760)
  and [WP5_UX_REVIEW_B2.md](WP5_UX_REVIEW_B2.md) (589bcff) are preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb` (the WP5-UX-REGATE2 freeze; HEAD = origin/main); digest
  `0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d`, 789 files, `handoff/` excluded, recorded first (after
  `node --version`) and again after all checks, equal in three forms (`git ls-tree` form, `scripts/source-digest.mjs` in the
  working repository, and in a scratch clone at a2ea7a4 with `git status --short` empty). 0 paths outside `handoff/` differ
  from a2ea7a4; no unpushed commit. Source complete: a clean scratch clone, `npm ci` exit 0.
- **Decision: FIX REQUIRED.** **WP5-UX-B2-01 is closed**: at 390, 375, 360, 344 and 320px the "Open a day" field keeps a
  full date (146.2 / 235 / 220 / 204 / 180px; screenshots show "10/09/2026" in full), the row wraps below about 388px, the
  390x844 first-screen budget holds (first day row bottom 659.0 without and 758.0 with the zone note, tab bar top 788),
  and the new assertion fails on the 589bcff behaviour. O-1..O-3 are done. All mandatory checks pass (typecheck, lint,
  `npm test` 82 files / 1820 tests, full e2e 180 tests: 167 passed, 13 skipped, 0 failed). Two **Low** findings remain
  in area B: **WP5-UX-B3-01** (re-judged A2 R2: after the window shrinks below 1200px with a review dialog open over the
  editor, the editor covers the review, the first Escape closes the editor instead of the nested dialog and focus is
  lost to the page, contrary to docs/04 line 59) and **WP5-UX-B3-02** (docs/04 line 55 EN and VI say "Open a day" opens
  "any date of the period"; it opens any date).

## Scope actually inspected and executed

1. B2-01 closure: the FIX4 diff `589bcff..a2ea7a4` (5 files outside `handoff/`; `10-…`, `10a-…`), my own probe of the field
   at five widths with three values on a2ea7a4, on 589bcff and on a variant (PC1, `41-…`), the B-01 budget in seven states
   and three narrower widths on a2ea7a4 and 589bcff (PC2, `42a-…`..`42d-…`), and the FIX4 assertions run on the 589bcff
   behaviour in two scratch variants (`30-…`).
2. The whole area-B scope on a2ea7a4 (items 1-6 of `WP5-UX-AUDIT-B.md`): the owner request and E-1..E-7 against the shipped
   screens (e2e screenshots, my probes), test strength over every test file changed since 014bd47 (`11-…`, `12-…`, `13a-…`
   to `13c-…`), accessibility with my own Playwright probe `ux3.probe.ts` (PC1-PC13) on my own built servers, UI standards
   (token scan `css-scan.mjs`, rendered contrast, lint `no-deprecated`, Node deprecation tracing, browser console), and
   docs/04, docs/10, docs/12 accuracy and EN/VI parity (`parity.mjs`).
3. R-1..R-6 and O-4 of the B2 review and R2 and R5 of `WP5_UX_REVIEW_A2.md`, re-judged on a2ea7a4 with new probes (PC6,
   PC8, PC10, PC10b).
4. Mandatory checks, run myself in the scratch clone with Node v24.21.0.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-B3/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms (before) | `0b8428fd…b77d`, 789 files | `00-digest-before.txt`, `01-setup-clone.txt` |
| `npm ci` (scratch clone at a2ea7a4) | exit 0 | `01a-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `04-npm-test.txt` |
| `npm run test:e2e` (build + full Playwright suite, Edge, both projects) | exit 0; 180 tests: 167 passed, 13 skipped, 0 failed; desktop 82 passed + 8 skipped, mobile 85 passed + 5 skipped (every skip project-scoped by design); 6.1 min | `05-e2e-full.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; built server with tracing on 48066 (6 requests) | exit 0 each; 0 deprecation lines; server stopped (SIGTERM); browser console only the pre-sign-in 401 | `07-…`, `07a`..`07d`, `40-…` |
| FIX4 assertions on the 589bcff behaviour, mobile, no retries | V1 (589bcff client, a2ea7a4 spec): 3 failed (390 only because the token is absent there; 360: 116.2, 320: 76.2), B-01 tests pass. V2 (a2ea7a4 with only the 589bcff open-day rules): 390 passes, 360 and 320 fail (116.2 and 76.2 < 142) | `30-…`, `30a-…`, `30b-…`, `30c-…` |
| PC1 "Open a day" field, values empty / 2026-10-09 / 2026-12-28, widths 390/375/360/344/320 | a2ea7a4: 146.2 / 235 / 220 / 204 / 180px, button beside the field at 390 and below it from 375, page scrollWidth = width, row inside its card; 589bcff: 146.2 / 131.2 / 116.2 / 100.2 / 76.2px (clipped at 360 and below) | `41-…`, `41a`..`41c`, screenshots |
| PC2 first screen 390x844, zone equal / zone note | first `[data-day]` bottom 659.0 / 758.0 at load, also with the field filled and while clocked in; 688.8 / 787.7 after clock out; 682.6 / 781.5 on the previous period; tab bar top 788; scrollY 0; no sideways scroll. Same values as 589bcff | `41-…`, `42a`..`42d` |
| PC3 widths 390/360/320: default, field filled, batch, editor open (content loaded), Review | scrollWidth = clientWidth in all 15 states; 0 elements past the viewport; 0 visible controls under 44x44 (41 / 41 / 46 / 9 / 8 controls) | `43-…` |
| PC4 full Tab sequence | desktop 43 stops: top bar, period (Previous, Next, Review), clock, tools, then days Mon..Sun week 1 then week 2 (column order), signature link; phone at 390 and 320 (field filled): 0 reading-order inversions, 14 days in date order | `44a-…`, `44b-…` |
| PC5 editor at 768/1024/1199/1200/1280 | below 1200: `:modal`, hit test on a sheet day lands on the dialog, 160 presses 0 outside; from 1200: not modal, beside the sheet, 0 focused controls hidden; Escape (inside, from the sheet) and Close return focus to the day button; resize 1280 to 1024 to 1280 handled | `45-…` |
| PC6 nested Escape at 1280 and A2 R2 (1280 to 1024 with a review open) | at 1280 the picker and the review take Escape first. After the resize the editor is modal on top of the modal review, the first Escape closes the editor and focus is on BODY while the review stays open; a Tab enters the review; a second Escape closes it; nothing saved | `46-…`, screenshots (WP5-UX-B3-01) |
| PC7 period bar | Tab order Previous, Next, Review on both projects; phone `<` (28,84) and `>` (318,84) beside the title, Review on its own row | `47a-…`, `47b-…` |
| PC8 rendered text contrast (period card, clock, tools, form header, week bar, sheet) and the focus ring | text: 136 / 134 nodes, minimum 5.00 light, 5.74 dark, 0 under 4.5; focus ring against the adjacent background 1.72 light, 2.46 dark (R-1) | `48a-…`, `48b-…` |
| PC9 Review on a phone | form title visually hidden, page h1 visible, header line in ISO dates (R-2), no sideways scroll | `49-…` |
| PC10 / PC10b grantee on a 390x844 phone (A2 R5) | first row bottom: view-only 750.7 (zone equal, above 788), edit 802.7, view 849.7 with the zone note, edit 901.7 with the zone note | `50a`..`50c`, screenshot |
| PC11 "Open a day" with 2026-04-06 (displayed period 09/28 to 10/11) | the editor opens "Day editor Mon 2026-04-06"; the field has no min or max (WP5-UX-B3-02) | `51-…`, `61-…` |
| PC12 phone status | 10 days with a Check status; each has visible words and a shape | `52-…` |
| PC13 phone bottom sheet at 390 and 320 | `:modal`, 86% of the screen height, 120 presses 0 outside, Escape and Close return focus to the day button | `53-…` |
| CSS token scan of `styles.css` | 0 colour, radius, shadow, duration, animation, font or url literals outside the token blocks; `--radius: 4px`; 7 of 7 transitions `var(--transition)` = `all 300ms ease-out`; 0 undefined `var()`; FIX4 adds `--date-field-min: 9.5rem` and `--open-day-label-min: 15.25rem` in the token block and structural `flex: 1 1 var(…)` only | `20-…`, `21-…`, `21a-…` |
| EN/VI parity of docs 04 and of the round sections of docs 10 and 12 | docs/04: only translated section names and the VI translation-note line differ; docs/10 and docs/12 round sections: 0 differences | `60-…` |
| digest, three forms (after) | `0b8428fd…b77d`, 789 files, all equal | `90-digest-after.txt` |

## WP5-UX-B2-01 and O-1..O-3

| Item | Disposition | Observation |
|---|---|---|
| WP5-UX-B2-01 | **Closed** | `styles.css:1083-1103` (phone block): the row wraps; the label keeps `min-width: var(--open-day-label-min)` and the input `min-width: var(--date-field-min)` (142.5px). With a date typed the field is 146.2px at 390 (button beside it) and 235 / 220 / 204 / 180px at 375 / 360 / 344 / 320 (button below); every screenshot shows "10/09/2026" whole, the label text stays before the field, no sideways scroll, the row stays inside its card, 0 controls under 44px. The B-01 budget at 390x844 is unchanged (659.0 / 758.0 against 788). The new e2e test passes at a2ea7a4 and fails on the 589bcff behaviour at 360 and 320 (V2), while passing at 390 where 589bcff showed the full date. |
| O-1 | **Done** | docs/04 line 9 EN and VI: a side panel beside the sheet from 1200px and a modal panel (a bottom sheet on phones) below 1200px; matches PC5 and PC13. |
| O-2 | **Done** | `DayEditor.tsx:84`: only the comment changed ("crossed 768px" to "crossed 1200px"); no code token changed (`10a-…`). |
| O-3 | **Done** | One `.tools .open-day` rule in the phone block (`styles.css:1084`); the base rule at `:1737` is outside the block. |

## Owner request, E-1..E-7 and navigation (scope 1)

- **Desktop sheet (E-1, E-2, E-4, E-6):** the Excel form header (company, "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES",
  Employee, Payroll Date, Period), "WEEK 1" and "WEEK 2" Monday to Sunday with Day, Date, Label, Time, OT (h:mm), Check and
  the "Show details" rows, the legend, "Overtime Total :" in h:mm and the signature lines with "Not used yet" for the
  manager; non-working days tinted and hatched; US dates, h:mm, 24-hour times (e2e screenshot, `timesheet.spec.ts`
  assertions). **Met.**
- **E-3 (a):** side panel on desktop (modal 768-1199, beside the sheet from 1200), bottom sheet on a phone, in-cell label
  picker (PC5, PC6, PC13). **Met**, with WP5-UX-B3-01 for a resize while a nested dialog is open.
- **E-5 (a):** desktop Timesheet, Overtime, History, Settings (+ Admin); phone three tabs and More (e2e shell, admin, import
  specs pass). **E-7 (a):** Overtime, History and Settings are not restyled (Settings only gains the Import link). **Met.**
- **Phone layout:** period card, clock card, compact tools, then the sheet; the first day row is above the tab bar at
  390x844 in both zone situations (PC2). **Met.**
- **docs/04 line 16 (viewing zone):** the period bar always shows "Times in {zone}" and each day keeps its accounting date
  (e2e, screenshots). **Met.**

## Test strength (scope 2)

Every test file changed since 014bd47 (20 files; `11-…`) was re-read in the diff `014bd47..a2ea7a4`; every removed line
is listed in `12-…` with its hunk and judged against its replacement in the context diffs `13a-…` to `13c-…`:

| # | File | Change | Judgement |
|---|---|---|---|
| 1 | dayModel.test | `weekGroups` cases removed with the function | equivalent: week grouping moved to `sheetModel.ts`, cases in `sheetModel.test.ts` (new, 357 lines) |
| 2 | sessionModel.test | leave typed as minutes became hours + minutes; bad-input list | stronger: 7 bad pairs instead of 4, a 90-minute case, hint cases |
| 3 | engine.test | import only | added h:mm cases equal to the PDF formatter for 0..3000 minutes |
| 4 | admin, import, isolation, setup, sharing, shell specs | exact nav lists per layout, Sign out under More on a phone, Import reached from Settings on the desktop, `complete` to `Complete` plus `[data-check]` | equivalent or stronger (exact lists replace a count; extra absence checks) |
| 5 | history-settings | the status moved from the grid caption to the period bar | equivalent, plus layout and signature checks |
| 6 | review.spec | per-day Regular / Off-calendar / Credit cells became the detail rows plus the OT cell by the PDF rule | equivalent (every day still checked against the server payload) |
| 7 | review, shell, timesheet specs | 44px loops gained `.filter({ visible: true })` | equivalent: count guards kept; PC3 finds 0 visible controls under 44px at 390/360/320 |
| 8 | day-editor.spec | heading rename; leave in hours + minutes with a refusal; "missing record" to "No times" with `[data-check="missing"]`; Upcoming checks; one wait added before each period step | equivalent or stronger |
| 9 | timesheet.spec (whole round) | grid/list hooks to `[data-sheet]`; due date in US form plus zone; day named by ISO date; Complete with the server OT and `8:00` detail | stronger |
| 10 | timesheet.spec (FIX4) | 3 tests added (390, 360, 320), 0 lines removed | added; bites on the 589bcff behaviour (V2). Its sub-assertion "the date value is not clipped" cannot fail (O-5) |

Result: **no assertion removed or weakened since 014bd47, including FIX4.** No `only`, `fixme` or unconditional skip
was added; the two new `test.skip` calls are project-scoped (`isMobile`). `playwright.config.ts` and `tests/e2e/fixtures.ts`
are unchanged since 014bd47.

## Accessibility (scope 3)

- Keyboard order equals the reading order on both layouts, Mon..Sun week 1 then week 2, also at 320px with the field
  filled (PC4, PC7). **Pass.**
- Names: `Edit {date}`, `Label for {date}: {label}`, the dialogs named by their headings ("Day editor Thu 2026-10-08",
  "Review label change for {date}"), the field named "Open a day", phone rows named by weekday and ISO date (e2e). **Pass.**
- Modal and focus: editor modes, focus trap, Escape, Close and focus return at every width (PC5, PC13); nested Escape at a
  fixed 1280px (PC6). **Pass, except WP5-UX-B3-01** (resize across 1200px while a review dialog is open).
- Status never by colour alone: words and a shape in every Check cell on the phone and desktop (PC12, screenshot). **Pass.**
- 44px and reflow: 0 visible controls under 44x44 and no sideways scroll at 390, 360 and 320px, including the editor and
  the Review (PC3); at 320px the date stays whole (PC1). **Pass.**
- Contrast: text minimum 5.00 light / 5.74 dark (PC8). I keep the earlier WCAG 1.4.11 judgement on `--sheet-rule-strong`
  (structural rules, not needed to understand the sheet). The focus ring is R-1 below. **Pass.**

## UI standards and deprecated APIs (scope 4)

Tokens only outside the token blocks, `--radius: 4px`, one shared `--transition` (`all 300ms ease-out`) on all 7
transitions, layered shadows (`--shadow-panel`, `--shadow-overlay`), reduced-motion block, system fonts only (CSP
`default-src 'self'`, no web-font reference). FIX4's two new values are tokens. Lint `no-deprecated` exit 0; 0 Node
deprecation lines in lint, tests, build and the running server; 0 browser deprecation messages. **Pass.**

## Documentation (scope 5)

docs/04 lines 9, 41, 48 and 59 describe the shipped UI (PC1-PC13); docs/10 records E-1..E-7 and the formulas not
reproduced; docs/12 summarises the round and adds no release identity ("refreshed only after them"). EN/VI parity holds
(`60-…`). **One inaccuracy:** docs/04 line 55 (EN and VI) says "Open a day" takes "any date of the period"; the control
opens any date (WP5-UX-B3-02).

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-B3-01 | Low | `src/client/DayEditor.tsx:83-95` (the mode-switch effect: `element.close()` then `showModal()` and `heading.focus()`), with `:97-109` | Desktop project, 1280x800: open a day in the editor (non-modal), pick "Off" in the Label cell of a worked day so the modal "Review label change for {date}" opens, then resize to 1024x800 (PC6, `46-…`, `a2ea7a4-pc6-r2-shrink-review-open-w1024-synthetic.png`, `a2ea7a4-pc6-r2-after-first-escape-w1024-synthetic.png`). Reproduced in two runs | Expected (docs/04 line 59): the nested dialog keeps Escape first and focus returns to the opener. Actual: the editor is re-shown as a modal above the review and takes focus (the review is hidden behind it; a hit test on its button lands in the editor); the first Escape closes the editor, not the review; focus then sits on BODY while the modal review is still open; one Tab enters the review, a second Escape closes it. Nothing is saved (category stays Worked) | docs/04 line 59 ("a nested dialog takes Escape first", "focus returns to the day's date button"); WCAG 2.2 SC 2.4.3 Focus Order | When the editor must switch mode while another modal dialog is open, keep that dialog on top: defer the switch until it closes, or re-show it after the editor so it keeps focus. Add a desktop e2e test: 1280 to 1024 with the review open, the review stays on top and focused, the first Escape closes only the review (nothing saved) with the editor still open and focus inside it, the next Escape closes the editor and focus returns to the day's button |
| WP5-UX-B3-02 | Low | `docs/04_UX_AND_SETTINGS.md:55` and `docs/04_UX_AND_SETTINGS.vi.md:55` | Desktop, current period 09/28 to 10/11: type 2026-04-06 in "Open a day" and press "Open day" (PC11, `51-…`); `src/client/components/OpenDay.tsx:3` and the input without `min`/`max` (`61-…`) | Expected: the docs describe the shipped control. Actual: the docs say "(any date of the period)" / "(mọi ngày trong kỳ)"; the control opens any accounting date, also outside the displayed period ("Day editor Mon 2026-04-06"), as it has since WP2-T10 and as the day-editor e2e tests rely on | AGENTS.md rule 1 (English authoritative, matching translation); `WP5-UX-AUDIT-B.md` item 5 (docs describe the shipped UI) | Change the wording in both files, for example "Open a day" (any date, also outside the displayed period); keep EN/VI parity |

## Risks and optional improvements (not defects)

- **R-1 Focus ring (pre-existing, unchanged since before 014bd47):** `--focus-ring` (`styles.css:37`, `:178`, used at
  `:218`) measures 1.72:1 on the light card and 2.46:1 on the dark card against the adjacent background (PC8). The
  project's documented requirement, "a visible focus ring" (docs/04 line 79), is met, but the W3C Understanding document
  for WCAG 2.2 SC 1.4.11 expects 3:1 for a focus indicator. Not counted as a finding of this round; a stronger shared ring
  is recommended as an owner-scheduled follow-up.
- **R-2 ISO dates in the Review header (unchanged):** `ReviewScreen.tsx:170` ("2026-09-28 to 2026-10-11, payroll date
  2026-10-16"; PC9). The sheet itself uses US dates. Optional.
- **R-3 No phone account button (unchanged):** name and Sign out under More; the form header shows "Employee: {name}".
- **R-4 Legend always lists "Today" (unchanged):** `TimesheetSheet.tsx:152`. Optional.
- **R-5 Read-only editor prints "none" (unchanged):** `DayEditor.tsx:407, 413, 423`; the sheet shows no "none" (e2e).
  Optional.
- **R-6 Ports (unchanged):** the e2e fixture picks OS-free loopback ports; my own servers used 48060-48066. Not a defect.
- **O-4 Tight first-screen budget (unchanged):** with the zone note and "Clocked out." the first row bottom is 787.7
  against 788; batch mode pushes it below (932.3 / 1031.2), as it did at 589bcff. The load state that the rule names
  passes.
- **A2 R5 Grantee on a phone (not a defect):** the B-01 rule (docs/04 line 48) describes the owner's page with the clock
  card; a grantee has the share bar and no clock. Measured first row bottom: view-only 750.7 (above 788) with the zones
  equal, edit share 802.7, view 849.7 and edit 901.7 with the zone note (PC10, PC10b). The owner may decide whether the
  promise should extend to shared views.
- **O-5 (new) Vacuous sub-assertion in the FIX4 test:** `tests/e2e/timesheet.spec.ts:142` ("the date value is not
  clipped", `input.scrollWidth <= input.clientWidth`) cannot fail for a Chromium date input: at 589bcff, where the value is
  visibly clipped at 360 and 320px, it reads 114/114 and 74/74 (`30-…`). The width assertion carries the check. Optional:
  drop it or replace it with a measured needed width.
- **R-7 (new) Wrap threshold:** `--date-field-min` (9.5rem, 142.5px) is about 11px wider than the full date needs (589bcff
  showed "10/09/2026" whole at 131.2px, 375px wide), so the row wraps below about 388px. At 375x844 with the zone note the
  first day row now ends at 827.4 (589bcff 775.4) and at 320x844 with the zones equal at 791.2 (589bcff 739.2), against
  788. Outside the 390x844 rule; optional tuning of the two tokens.

## Required gates unrun or blocked, and why

None in area B. Typecheck, lint, `npm test` and the full e2e suite on both projects ran here and passed. Area A items are
outside this review.

## Disposition of previous findings

WP5-UX-B2-01: **closed** (table above). O-1, O-2, O-3: done. R-1..R-6 and O-4 of the B2 review: re-judged, none is a
defect of this round (R-1 carried as a recommended follow-up). A2 R2: **a defect** under the brief's rules, recorded as
WP5-UX-B3-01 (Low). A2 R5: not a defect. New: WP5-UX-B3-01 (Low) and WP5-UX-B3-02 (Low), open; O-5 and R-7 optional.

## Software readiness, owner permission and pilot result

- **Software readiness, area B:** not yet; WP5-UX-B3-01 needs a small client fix with one e2e test and WP5-UX-B3-02 a
  one-line wording fix in docs/04 EN and VI, then a freeze, a gate and an area-B recheck.
- **Owner permission:** none requested or given; no deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: open a bounded fix task for WP5-UX-B3-01 (`DayEditor.tsx` mode switch while a nested modal dialog is open,
plus a desktop e2e test) and WP5-UX-B3-02 (docs/04 line 55 EN and VI); optionally O-5 and R-7; then freeze, gate and a
fresh area-B recheck on the new digest.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-B3, attempt 1; reviewer self-reported
  `claude-opus-5-5` (fresh subagent; agent ID not visible from inside). Reviewed authors: WP5-UX-PLAN, WP5-UX-T01..T06,
  WP5-UX-FIX1..FIX4 and their freezes, the WP5-UX-GATE, REGATE and REGATE2 verifiers (as recorded in their task files; the
  strongest author model recorded is opus, the same as mine).
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no earlier
  gate or audit of this round. I edited no source, test, doc, board or STATE file. My probes ran in scratch clones in the
  task folder, kept out of git by `.git/info/exclude`; the V2 mutation was made only in its own scratch clone. Process
  slips, none of which wrote outside the task and evidence folders or changed any result: two read-only listings were piped
  into `head` (`ls -t … | head -n 1` and `grep … | head -n 8`) and one `grep` redirected its output to `/dev/null`, all
  against the brief's shell rules.
- **Source digest before/after; gate evidence for that snapshot:** `0b8428fd…b77d` before and after, three forms
  (`00-digest-before.txt`, `90-digest-after.txt`); it equals the WP5-UX-REGATE2 digest of record.
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_B3.md` and `.vi.md`, new files;
  `WP5_UX_REVIEW_B.md`, `WP5_UX_REVIEW_B2.md` and every earlier review are untouched.
- **Finding dispositions and next coordinator fix/recheck task:** B2-01 closed; WP5-UX-B3-01 and WP5-UX-B3-02 open; next: a
  fix task for both, its freeze, a gate and an area-B recheck.
