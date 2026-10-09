# WP5 UI redesign, independent recheck of area B on the final snapshot — owner-request fidelity, test strength, accessibility, UI standards and documentation

[Tiếng Việt](WP5_UX_REVIEW_B4.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-B4, attempt
  1, 2026-10-09 (America/Los_Angeles; UTC 2026-10-09T11:07Z to about 11:50Z). Reviewer self-reported model
  `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from inside). Area A is rechecked
  separately (WP5-UX-AUDIT-A4) and is not covered here. The earlier area-B reviews [WP5_UX_REVIEW_B.md](WP5_UX_REVIEW_B.md),
  [WP5_UX_REVIEW_B2.md](WP5_UX_REVIEW_B2.md) and [WP5_UX_REVIEW_B3.md](WP5_UX_REVIEW_B3.md) are preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `edaaa852370128ca9bdf206d730f3849346ba994` (the WP5-UX-REGATE3 freeze; HEAD = origin/main); digest
  `b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873`, 789 files, `handoff/` excluded, recorded first (after
  `node --version`, 11:07:42Z) and again after all checks (11:39:17Z), equal in three forms (`git ls-tree` form,
  `scripts/source-digest.mjs` in the working repository, and in a scratch clone at edaaa85 with `git status --short` empty).
  0 paths outside `handoff/` differ from edaaa85; no unpushed commit. Source complete: a clean scratch clone, `npm ci` exit 0.
- **Decision: FIX REQUIRED.** The four items of the fix round are closed: **B3-01** (the review keeps the top layer, focus
  and Escape across 1200px in every path I tried, nothing is saved, focus never falls to BODY, and the new tests fail on the
  a2ea7a4 behaviour), **B3-02** (docs/04 line 55 EN and VI), **O-5** (the replacement assertion fails on clipped dates) and
  **R-7** (full date at 390, 375, 360 and 320px; 390x844 unchanged). All mandatory checks pass (typecheck, lint, `npm test`
  82 files / 1820 tests, full e2e 186 tests: 170 passed, 16 skipped, 0 failed). No assertion was removed or weakened since
  014bd47. Two findings block under the brief's severity rule: **WP5-UX-B4-01 (Medium)**, re-judged R-1: the shared focus
  ring measures 1.72:1 (light) and 2.46:1 (dark) against the adjacent background on buttons, links, tabs and the sheet's
  "Edit {date}" buttons, below the 3:1 that WCAG 2.2 SC 1.4.11 requires for an author-styled focus indicator; and
  **WP5-UX-B4-02 (Low)**: the zone note of the period bar prints the display-zone due time in ISO form ("2026-10-14 07:00"),
  while docs/04 line 45 (EN and VI) says the period bar uses MM/DD/YYYY.

## Scope actually inspected and executed

1. B3-01, B3-02, O-5, R-7: the FIX5 diff `a2ea7a4..edaaa85` (6 files outside `handoff/`; `10-…`, `10a-…`); my own Playwright
   probe `ux4.probe.ts` on my own built servers (Q1 nested dialogs across 1200px in seven paths, Q2 editor alone and with
   the leave alert, Q3/Q3b the "Open a day" field and the first-screen budget); the new e2e tests run on the a2ea7a4
   DayEditor and the O-5 replacement run with soft assertions on the 589bcff open-day rules, in scratch copies only
   (`30-…`, `31-…`, `32-…`); the same Q1/Q2 probe on the a2ea7a4 DayEditor as a control (`45b-…`).
2. Area B on the whole snapshot (items 1-6 of `WP5-UX-AUDIT-B.md`): owner request and E-1..E-7 against the shipped screens
   (e2e screenshots of my run, probes), test strength over every test file changed since 014bd47 (`11-…` to `14-…`),
   accessibility (Q4-Q7: 44px, reflow at 320px, bottom sheet, Tab order, names, status words, contrast and focus ring),
   UI standards (`css-scan.mjs`, fonts and CSP, Node deprecation tracing, browser console), docs/04, docs/10 and docs/12
   accuracy and EN/VI parity (`parity.mjs`).
3. R-1..R-6, O-4 and A2 R5 re-judged under the brief's severity rule with new measurements (Q6, Q7, Q8, Q9).
4. Mandatory checks, run myself in the scratch clone with Node v24.21.0.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-B4/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms (before) | `b7bbcbc0…a873`, 789 files | `00-digest-before.txt`, `01-setup-clone.txt` |
| `npm ci` (scratch clone at edaaa85) | exit 0 | `01a-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `04-npm-test.txt` |
| `npm run test:e2e` (build + full Playwright suite, Edge, both projects) | exit 0; 186 tests: 170 passed, 16 skipped, 0 failed; desktop 84 passed + 9 skipped, mobile 86 passed + 7 skipped (every skip project-scoped); 5.8 min | `05-e2e-full.txt`, `05a-e2e-counts.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; built server with tracing on 48134 | exit 0 each; 0 deprecation lines; server stopped (SIGTERM); browser console of all probes: only the pre-sign-in 401 | `07-…` to `07d-…`, `49m-…`, `49n-…` |
| The two new B3-01 e2e tests on the a2ea7a4 DayEditor (clone-old), desktop, no retries | 2 failed: at 1024px the review is `modal: true` but `focus: false`, `onTop: false` | `30a-…`, `31-…` |
| The date-field test with soft assertions on the 589bcff open-day rules (clone-o5), mobile, no retries | 390 and 375 pass; 360 and 320 fail, each with "the date value is not clipped (its measured need)" (116.23 and 76.23 < 117.89), "the empty field shows mm/dd/yyyy whole" and "at least a full date wide" | `30b-…`, `32-…` |
| Q1 S1-S6: label review, batch review and Clock out over the editor; 1280→1024, 1280→1024→1280, 1280→1024→768→1280→1024, Cancel click, 1199↔1200, batch dialog, Clock out dialog | at every step the other dialog is modal, holds focus and is on top (Cancel hit test lands in it); first Escape (or Cancel) closes only that dialog; below 1200px the editor is then modal with focus on its heading, at 1280 focus is back on the picker; second Escape closes the editor and focus is on "Edit {date}"; only the preview POST was sent, the day stays Worked, the running session stays running; focus never on BODY | `45-…`, `46a-…` to `46g-…`, screenshots `q1-…` |
| Same Q1/Q2 probe on the a2ea7a4 DayEditor (control) | Q1 7 of 7 fail (the first Escape leaves the review open; the Cancel click is intercepted by the editor); Q2 3 of 3 pass | `40c-…`, `45b-…` |
| Q2 editor alone 1280→1024→768→1280→1200→1199→1280; leave alert ("2-" hours, 30 minutes) from 1280 and from 1024 | modal at 1024/768/1199, non-modal at 1280/1200; 40-press Tab walk below 1200px: 0 stops outside the editor (BODY stops only while the document has no focus, the browser UI wrap); alert and `aria-invalid` stay through every switch; focus moves from the field to the heading on a switch (pre-existing); Escape closes, focus on "Edit {date}", 0 writes, leave 0 | `45-…`, `47a-…` to `47c-…` |
| Q3/Q3b phone 390/375/360/320, zone equal and zone note, "Open a day" empty and filled; field forced to 115-128px | field 146.23 / 131.23 / 219.95 / 179.95px, token 127.5px, button beside at 390/375 and below at 360/320, no sideways scroll; first row bottom vs tab bar top 788: zone equal 659.02 / 676.41 / 728.41 / 791.19, zone note 757.97 / 775.36 / 827.36 / 924.92; forced width: last digit cut at 115.0px, whole at 115.97px (test need 117.89, conservative); placeholder whole at 125.48px (need 125.73) | `41-…`, `48a-…` to `48c-…`, screenshots `q3-…`, `q3b-…` |
| Q4 phone 390/375/360/320: default, field filled, batch, editor, Review; bottom sheet | 0 sideways scroll, 0 overflowing elements, 0 visible controls under 44x44 in 20 states (41 / 41 / 46 / 9 / 8 controls); bottom sheet `:modal`, 86% high, 100-press walk 0 stops outside, Escape returns focus to the day | `49-…` |
| Q5 Tab order | desktop 43 stops: top bar, period (Previous, Next, Review), Clock in, tools, then Edit/Label per day Mon..Sun week 1 then week 2, 14 days in date order; phone 41 stops at 390 and 320, same day order | `44-…`, `49a-…`, `49b-…` |
| Q6 rendered contrast | text: 128 / 123 nodes, minimum 5.00 light, 5.74 dark, 0 under 4.5; focus ring vs adjacent background: 1.72 light, 2.46 dark on top-bar links, period buttons, Review link, Clock in, sheet "Edit {date}", phone tabs; label picker 6.09 / 6.79 | `44-…`, `49c-…`, `49d-…`, screenshots `q6-…` (WP5-UX-B4-01) |
| Q7 carried items | 10 days with a Check status, each with words and a shape; legend always lists "Today"; Review header line in ISO dates; read-only editor prints "none"; grantee 390x844 first row: view 750.73 (fits), edit 802.73, zone note 849.69 / 901.69 | `44-…`, `49e-…` to `49h-…` |
| Q8 / Q9 first screen at 390x844 | fresh person (26-character name): zone equal load 676.41, clocked in 676.41, after clock out 706.16, batch 949.66; zone note 775.36 / 775.36 / 805.11 / 1048.61; names of 16 to 42 characters: load fits in both zones (header one line taller from 23 characters, maximum 775.36) | `49i-…` to `49l-…`, screenshot `q9-…` |
| CSS token scan of `styles.css` (whole round and FIX5) | 0 colour, radius, shadow, duration, animation, font or url literals outside the token blocks; `--radius: 4px`; 7 of 7 transitions `var(--transition)` = `all 300ms ease-out`; reduced-motion block; 0 undefined `var()`; FIX5 changes only `--date-field-min` (8.5rem) and `--open-day-label-min` (14.25rem); system fonts, CSP `default-src 'self'`, no inline styles | `20-…`, `21-…`, `22-…` |
| EN/VI parity and docs lines | docs/04: only translated section names and the VI translation-note line differ (as at a2ea7a4); docs/10 and docs/12 round sections: 0 differences; docs/04 line 55 EN and VI as required; docs/12 adds no release identity | `60-…`, `61-…`, `62-…` |
| digest, three forms (after) | `b7bbcbc0…a873`, 789 files, all equal | `90-digest-after.txt` |

## WP5-UX-B3-01, B3-02, O-5 and R-7

| Item | Disposition | Observation |
|---|---|---|
| WP5-UX-B3-01 | **Closed** | `DayEditor.tsx:18-21, 93-116`: while another modal dialog is open the mode switch is deferred through a `MutationObserver` and applied once none is left; cleanup disconnects it. In all seven Q1 paths the open dialog (label review, batch review, Clock out) keeps the top layer, focus and Escape at 1024, 768, 1199, 1200 and back at 1280; the first Escape or Cancel closes only it; below 1200px the editor then becomes modal with focus on its heading (the picker behind is inert), from 1200px focus returns to the picker; the second Escape closes the editor and focus returns to "Edit {date}". Only the preview request is sent, the day stays Worked, a running session stays running, and focus is never on BODY. The editor alone keeps its modes (modal below 1200px with 0 Tab stops outside, side panel from 1200px), and the leave alert survives every switch with nothing saved. The two new e2e tests fail on the a2ea7a4 DayEditor (2 of 2), and my probe fails there in 7 of 7 paths. |
| WP5-UX-B3-02 | **Closed** | docs/04 line 55: EN "(any date, also outside the displayed period)", VI "(mọi ngày, kể cả ngoài kỳ đang hiển thị)"; the control has no `min`/`max` (`OpenDay.tsx:16`). |
| O-5 | **Done** | `timesheet.spec.ts:141-179`: the vacuous `scrollWidth <= clientWidth` is replaced by `box.width >= valueNeed` (glyph width in the field's font + padding + borders + 23.5px chrome). It fails on the 589bcff rules at 360 and 320px (116.23 and 76.23 < 117.89) and passes at edaaa85. Rendered check: the last digit is cut at 115.0px and whole at 115.97px, so the value need is about 2px conservative; the placeholder need (125.73) matches the observed threshold (whole at 125.48px). |
| R-7 | **Done** | `--date-field-min` 9.5rem → 8.5rem (127.5px) and `--open-day-label-min` 15.25rem → 14.25rem. Full date shown at 390, 375, 360 and 320px (screenshots); 390x844 unchanged (659.02 / 757.97); 375 now fits with the zone note (775.36); 360 with the note and 320 stay below the tab bar, outside the 390x844 rule. |

## Owner request, E-1..E-7 and navigation (scope 1)

- **Desktop sheet (E-1, E-2, E-4, E-6):** form header (company, "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES", Employee, Payroll
  Date, Period), "WEEK 1" and "WEEK 2" Monday to Sunday with Day, Date, Label, Time, OT (h:mm), Check and the detail rows,
  legend, "Overtime Total :" in h:mm, signature lines with "Not used yet" for the manager, non-working days tinted and
  hatched, US dates, h:mm, 24-hour times (e2e screenshot of my run, `timesheet.spec.ts`). **Met.**
- **E-3 (a):** side panel beside the sheet from 1200px, modal side panel 768-1199px, bottom sheet on a phone, label picker
  in the cell; nested dialogs now keep Escape and focus across the 1200px switch (Q1, Q2, Q4). **Met.**
- **E-5 (a), E-7 (a):** desktop Timesheet, Overtime, History, Settings (+ Admin); phone three tabs and More (shell, admin,
  import specs pass); Overtime, History and Settings not restyled. **Met.**
- **Phone layout:** period card, clock card, compact tools, then the sheet; the first day row is above the tab bar at
  390x844 in both zone situations and for names of 16 to 42 characters (Q3, Q9). **Met.**
- **docs/04 line 16 (viewing zone):** the bar always shows "Times in {zone}"; each day keeps its accounting date. **Met.**

## Test strength (scope 2)

All 20 test files changed since 014bd47 (`11-…`) were re-read; every removed line (`12-…`) was judged against its
replacement in the context diffs (`13a-…` to `13d-…`):

| # | File | Change | Judgement |
|---|---|---|---|
| 1 | dayModel.test | `weekGroups` cases removed with the function | equivalent: `sheetModel.test.ts` (new) covers Monday-Sunday bands, mid-week periods, empty input and device-zone stability |
| 2 | sessionModel.test | leave as hours + minutes; bad-input list | stronger: 7 bad pairs instead of 4, a 90-minute case, hint cases |
| 3 | engine.test | import only | added h:mm cases |
| 4 | admin, import, isolation, setup, shell, sharing, ot-leave specs | exact nav lists per layout, Sign out under More, Import from Settings, `complete` → `Complete` plus `[data-check]`, "OT" → "Overtime" | equivalent or stronger; the B-03 Admin absence checks now run on the Admin view on both projects |
| 5 | history-settings | status moved to the period bar | stronger (bar, not in sheet, layout, signature line) |
| 6 | review.spec | per-day Regular/Off-calendar/Credit → detail rows plus the OT cell by the PDF rule | equivalent (every day still checked against the server payload) |
| 7 | review, shell, timesheet specs | 44px loops gained `.filter({ visible: true })` | equivalent: count guards kept; Q4 finds 0 visible controls under 44px |
| 8 | day-editor.spec | heading rename; leave in hours + minutes with refusal; "missing record" → "No times" + `[data-check]`; a wait before each period step | equivalent or stronger |
| 9 | timesheet.spec (round) | grid/list hooks → `[data-sheet]`; US due date + zone; day named by ISO date; Complete with server OT | stronger |
| 10 | timesheet.spec (FIX5) | width 375 added; `>= 135` → `>= max(placeholderNeed, valueNeed)`; vacuous clip check → `box.width >= valueNeed`; new `valueNeed > 100` and empty-field checks | not weaker: the fixed proxy 135 is replaced by the measured need, which fails whenever the token or the field is under the observed clip threshold (`32-…`, Q3b); the remaining width check is unchanged |
| 11 | day-editor.spec (FIX5) | 2 tests added, 0 lines removed | added; fail on the a2ea7a4 behaviour (`31-…`) |

Result: **no assertion removed or weakened since 014bd47, including FIX5.** No `only` or `fixme`; every `test.skip` is
project-scoped (`14-…`); `playwright.config.ts`, `tests/e2e/fixtures.ts` and `vitest.config.ts` are unchanged since 014bd47.

## Accessibility (scope 3)

- Keyboard order equals the reading order on both layouts, Mon..Sun week 1 then week 2 (Q5). **Pass.**
- Names: "Edit {date}", "Label for {date}: {label}", dialogs named by their headings, phone rows by weekday and date. **Pass.**
- Modal and focus: editor modes, focus trap below 1200px, Escape, Close and focus return at every width; nested dialogs
  across the 1200px switch (Q1, Q2, Q4). **Pass.**
- Status never by colour alone: words and a shape on every Check (Q7). **Pass.**
- 44px and reflow at 320px: 0 small controls, 0 sideways scroll, 0 overflowing elements in 20 states (Q4). **Pass.**
- Contrast: text minimum 5.00 / 5.74 (Q6). The `--sheet-rule-strong` judgement of the earlier reviews stands (structural
  rules, not needed to understand the sheet). **Focus indicator: fail (WP5-UX-B4-01).**

## UI standards and deprecated APIs (scope 4)

Tokens only outside the token blocks, `--radius: 4px`, one shared `--transition` (`all 300ms ease-out`) on all 7
transitions, layered shadows, reduced motion, system fonts only (CSP `default-src 'self'`, no font source), no inline
styles; FIX5's two values are tokens. Lint `no-deprecated` exit 0; 0 Node deprecation lines in lint, tests, build and the
running server; 0 browser deprecation messages. **Pass.** (The focus ring token's value is WP5-UX-B4-01.)

## Documentation (scope 5)

docs/04 lines 9, 41, 48, 55 and 59 describe the shipped UI (Q1-Q9); docs/10 records E-1..E-7 and the formulas not
reproduced; docs/12 summarises the round and adds no release identity. EN/VI parity holds (`60-…`). **One inaccuracy:**
the period bar's zone note prints the display-zone due time as ISO while docs/04 line 45 promises MM/DD/YYYY in the period
bar (WP5-UX-B4-02).

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-B4-01 | Medium | `src/client/styles.css:37` (`--focus-ring: 0 0 0 3px rgb(31 95 191 / 0.35)`) and `:178` (dark `rgb(110 168 255 / 0.45)`), used by `:215-219` (`:focus-visible`, outline transparent), `:328-330` (phone tabs, inset), `:501-503` (buttons), `:1331-1333` (sheet "Edit {date}") | Desktop and phone, light and dark: Tab once, then focus each control type (Q6, `44-…`, `49c-…`, `49d-…`; screenshots `q6-focus-ring-clock-light`, `q6-focus-ring-sheet-date-light`). Re-judged R-1 of the B, B2 and B3 reviews | Expected: an author-styled focus indicator with at least 3:1 against the colours adjacent to it. Actual: the ring, blended over the adjacent background, measures 1.72:1 (light) and 2.46:1 (dark) on top-bar links, period buttons, the Review link, Clock in, the sheet's "Edit {date}" buttons and the phone tabs; the outline is transparent, so the ring is the only focus cue. The label picker (inset 2px accent, 6.09 / 6.79) passes; text inputs show the caret | WCAG 2.2 SC 1.4.11 Non-text Contrast with 2.4.7 Focus Visible: W3C Understanding 1.4.11, "the visual focus indicator for a component must have sufficient contrast against the adjacent background" and Figure 43 (a 2.3:1 author focus outline fails) (`50-…`); the brief's severity rule (WCAG 2.2 AA) | Token change only: give `--focus-ring` (light and dark) a colour with at least 3:1 against every surface it sits on (card, page, sheet head, non-working tint, tab bar), for example a solid accent ring or a two-colour ring (WCAG technique C40: a card-coloured gap inside an accent ring); keep the shared transition. Add an automated check (e2e or contrast probe) that the composited ring colour reaches 3:1 against the adjacent background for a button, a link, a tab and a sheet date in both themes |
| WP5-UX-B4-02 | Low | `src/client/components/PeriodBar.tsx:71-74` (`instantText(period.due_at_utc, zone)`, `format.ts:38-40`); docs/04 line 45 EN and VI | Any viewing zone other than the reporting zone, e.g. Asia/Ho_Chi_Minh, 390x844 or desktop: the zone note shows "Due, your time (Asia/Saigon) 2026-10-14 07:00" under "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)" (e2e screenshot `period-mobile-zone-note`, Q9 screenshot) | Expected (docs/04 line 45, with line 53 placing the note in the period bar): US dates, MM/DD/YYYY in the header and period bar. Actual: ISO date in the note | docs/04 as shipped (lines 45 and 53, EN and VI); AGENTS.md rule 1 | Format the display-zone due time like the bar ("Wed 10/14/2026, 07:00") and assert it in `timesheet.spec.ts` (zone-note test); or, if ISO is wanted there, narrow docs/04 line 45 in EN and VI. Optionally use the same formatter for the Review header line (R-2) |

## Risks and optional improvements (not defects)

- **R-2 ISO dates in the Review header (unchanged):** `ReviewScreen.tsx:170`; the Review's form header uses US dates. Not
  the sheet header of docs/04 line 41; optional, best fixed together with WP5-UX-B4-02.
- **R-3 No phone account button (unchanged):** name and Sign out under More (docs/04 line 7); the form header names the
  employee. Not a defect.
- **R-4 Legend always lists "Today" (unchanged):** `TimesheetSheet.tsx:152`. Optional.
- **R-5 Read-only editor prints "none" (unchanged):** `DayEditor.tsx:428, 434, 444`; docs/04 line 43 concerns the sheet's
  cells, which show no "none" (e2e). Optional.
- **R-6 Ports (unchanged):** the e2e fixture picks OS-free loopback ports; my own servers used 48130-48134. Not a defect.
- **O-4 Tight first-screen budget:** the load state named by docs/04 line 48 passes in both zones (659.02 / 757.97 with the
  seeded name; 676.41 / 775.36 for names of 23 to 42 characters). After clock out with the zone note and a name of 23+
  characters the first row ends at 805.11 (below 788); batch mode always pushes it below. Outside the rule; optional.
- **A2 R5 Grantee on a phone (not a defect):** view-only 750.73 (fits), edit 802.73, with the zone note 849.69 / 901.69.
  docs/04 line 48 describes the owner's page with the clock card; the owner may extend the promise to shared views.
- **R-8 (new) Focus on a mode switch:** crossing 1200px moves focus to the editor heading even from a field inside the
  editor (the leave field in Q2); pre-existing since T04 and consistent with "focus moves to the panel heading on open".
  Optional: keep the focused element when it is inside the editor.
- **R-9 (new) Input boundaries:** inputs use `--line` borders (about 1.35:1 on the card). Every input has a visible label,
  so its presence is identified without the border (W3C Understanding 1.4.11, "Boundaries"); optional to strengthen with
  the focus-ring fix.
- **Information outside area B:** `npm audit` reports 1 high advisory in a development dependency (source-map-js);
  `npm audit --omit=dev` reports 0 (`08a-…`, `08b-…`).

## Required gates unrun or blocked, and why

None in area B. Typecheck, lint, `npm test` and the full e2e suite on both projects ran here and passed. Area A items are
outside this review.

## Disposition of previous findings

WP5-UX-B3-01: **closed**. WP5-UX-B3-02: **closed**. O-5 and R-7: **done**. R-1: **re-judged as a defect** under the brief's
severity rule (WCAG 2.2 AA), recorded as WP5-UX-B4-01 (Medium). R-2..R-6, O-4 and A2 R5: re-judged, none is a defect under
that rule. New: WP5-UX-B4-01 (Medium) and WP5-UX-B4-02 (Low), open; R-8 and R-9 optional.

## Software readiness, owner permission and pilot result

- **Software readiness, area B:** not yet; WP5-UX-B4-01 needs a token change with an automated contrast check and
  WP5-UX-B4-02 a one-line formatting change (or a docs/04 wording change in EN and VI), then a freeze, a gate and an area-B
  recheck.
- **Owner permission:** none requested or given; no deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: open a bounded fix task for WP5-UX-B4-01 (`--focus-ring` light and dark to at least 3:1 against the adjacent
surfaces, plus an automated contrast check) and WP5-UX-B4-02 (the zone note's due time in US form, plus an assertion);
then freeze, gate and a fresh area-B recheck on the new digest.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-B4, attempt 1; reviewer self-reported
  `claude-opus-5-5` (fresh subagent; agent ID not visible from inside). Reviewed authors: WP5-UX-PLAN, WP5-UX-T01..T06,
  WP5-UX-FIX1..FIX5 and their freezes, and the gate verifiers (as recorded in their task files; the strongest author model
  recorded is opus, FIX5 `claude-opus-5-5`, the same as mine).
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no earlier
  gate or audit of this round. I edited no source, test, doc, board or STATE file. My probes ran in scratch clones in the
  task folder, kept out of git by `.git/info/exclude`; the two mutations were made only in their own scratch clones.
  Process slips, none of which wrote outside the task and evidence folders or changed any result: two read-only commands
  were piped into `head`/`tail` (`grep … | head -n 20` on ClockOutDialog.tsx and `grep -n "^## " … | tail -n 3` on docs/10),
  against the brief's shell rules.
- **Source digest before/after; gate evidence for that snapshot:** `b7bbcbc0…a873` before and after, three forms
  (`00-digest-before.txt`, `90-digest-after.txt`); it equals the WP5-UX-REGATE3 digest of record.
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_B4.md` and `.vi.md`, new files;
  every earlier review is untouched.
- **Finding dispositions and next coordinator fix/recheck task:** B3-01 and B3-02 closed, O-5 and R-7 done; WP5-UX-B4-01 and
  WP5-UX-B4-02 open; next: a fix task for both, its freeze, a gate and an area-B recheck.
