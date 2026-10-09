# WP5 UI redesign, independent recheck of area B on the final snapshot (B5) — owner-request fidelity, test strength, accessibility, UI standards and documentation

[Tiếng Việt](WP5_UX_REVIEW_B5.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-B5, attempt
  1, 2026-10-09 (UTC 22:35Z to about 23:45Z). Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort
  set by the profile, not observable from inside). Area A is rechecked separately (WP5-UX-AUDIT-A5) and is not covered here.
  The earlier area-B reviews [B](WP5_UX_REVIEW_B.md), [B2](WP5_UX_REVIEW_B2.md), [B3](WP5_UX_REVIEW_B3.md) and
  [B4](WP5_UX_REVIEW_B4.md) are preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `5e104e14dad71268a9185920c04ed0ee2a4b31c2` (the WP5-UX-REGATE4 freeze; HEAD = origin/main); digest
  `07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635`, 790 files, `handoff/` excluded, recorded first (after
  `node --version`, 22:35:57Z) and again after all checks, equal in three forms (`git ls-tree` form, `scripts/source-digest.mjs`
  in the working repository, and in a scratch clone at 5e104e1 with `git status --short` empty). No path outside `handoff/`
  differs from 5e104e1; no unpushed commit. Source complete: a clean scratch clone, `npm ci` exit 0.
- **Decision: FIX REQUIRED.** **WP5-UX-B4-01 is closed** for what it named: rendered with real Tab presses, the shared ring is
  at least 3:1 against the adjacent background on every control type the brief lists, in both themes (lowest 4.11 light /
  4.36 dark, the label picker trigger against the cell rules; every other group 4.50 to 6.09 light, 4.93 to 7.52 dark), and the
  new e2e check fails on the edaaa85 tokens. **WP5-UX-B4-02 is closed** (the zone note reads "Wed 10/14/2026, 07:00"; docs/04
  line 45 matches; unit and e2e assertions). All mandatory checks pass (typecheck, lint, `npm test` 82 files / 1821 tests, full
  e2e 190 tests: 174 passed, 16 skipped, 0 failed) and no assertion was removed or weakened since 014bd47. But the brief's own
  conditions for the focus indicator ("not hidden behind sticky bars", "the label picker") are not met, and three WCAG 2.2 AA
  defects block under the brief's severity rule: **WP5-UX-B5-01 (Medium)** the sticky top bar (desktop and phone) and the sticky
  head of the phone's day editor hide focused controls entirely on Shift+Tab (SC 2.4.11, failure F110); **WP5-UX-B5-02
  (Medium)** in the open label picker the keyboard position (the active option) is shown only by a 1.14:1 (light) / 1.28:1
  (dark) tint and the focused list has no ring (SC 1.4.11 with 2.4.7); **WP5-UX-B5-03 (Low)** the day editor's `<dialog>` is
  itself a keyboard stop (a scrollable panel) with no visible focus indicator (SC 2.4.7).

## Scope actually inspected and executed

1. B4-01 and B4-02: the FIX6 diff `edaaa85..5e104e1` (8 files outside `handoff/`, `10-…`); my own Playwright probe
   `b5.probe.ts` on my own built servers (ports 48200-48205), with real Tab and Shift+Tab presses on the Timesheet page (forward,
   backward, batch mode), the day editor (1280 side panel, 1024 modal, 390 bottom sheet), the Clock out and label-review
   dialogs, the open label picker, and the Review, Overtime, History and Settings screens, light and dark, desktop and phone.
   At each stop the probe takes the viewport with the control focused and blurred (transitions fast-forwarded), decodes both
   PNGs and reads, on lines across each side, the ring pixel that changed most, the rendered pixel just outside it (adjacent
   background), the pixel just inside it and what was there before; it also tests whether the control is covered (5x5
   `elementFromPoint` grid). The new `focus-ring.spec.ts` was run on the edaaa85 tokens and on a single-rule mutation in a scratch
   copy only (`30-…` to `33-…`).
2. Area B on the whole snapshot (items 1-6 of `WP5-UX-AUDIT-B.md`): owner request and E-1..E-7 against the shipped screens (my
   e2e screenshots, probe screenshots), test strength over every test file changed since 014bd47 (`11-…` to `14-…`),
   accessibility (Tab order, names, focus and modal behaviour, status words and shapes, 44px and reflow at 390/375/360/320,
   rendered text contrast), UI standards (`css-scan.mjs`, Node deprecation tracing, browser console), docs/04, docs/10 and
   docs/12 accuracy and EN/VI parity (`parity.mjs`).
3. The risks of `WP5_UX_REVIEW_B4.md` re-judged under the brief's severity rule.
4. Mandatory checks, run myself in the scratch clone with Node v24.21.0.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-B5/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms (before) | `07c3ca00…e635`, 790 files | `00-digest-before.txt`, `01-setup-clone.txt` |
| `npm ci` (scratch clone at 5e104e1) | exit 0 | `01a-npm-ci.txt` |
| `npm run typecheck` | exit 0 | `02-typecheck.txt` |
| `npm run lint` (typescript-eslint `no-deprecated`) | exit 0 | `03-lint.txt` |
| `npm test` | exit 0; 82 files, 1821 tests passed | `04-npm-test.txt` |
| `npm run test:e2e` (build + full Playwright suite, Edge, both projects) | exit 0; 190 tests: 174 passed, 16 skipped, 0 failed; desktop 86 passed + 9 skipped, mobile 88 passed + 7 skipped (every skip project-scoped); 5.0 min | `05-e2e-full.txt`, `05a-e2e-counts.txt`, `06-checks-summary.txt` |
| lint, `npm test`, build with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`; probe servers with tracing | exit 0 each; 0 deprecation lines; browser console: 0 deprecation messages | `07-…` |
| `focus-ring.spec.ts` on the edaaa85 `styles.css` (scratch copy) | exit 1: 4 of 4 fail, "--focus-ring rgba(31, 95, 191, 0.35) … against --card" 1.72 (light), "rgba(110, 168, 255, 0.45)" 2.46 (dark) | `30-…`, `31-…` |
| `focus-ring.spec.ts` with only `.sheet .sheet-date:focus-visible` set to the old ring (scratch copy) | exit 1: desktop light and dark fail on "sheet date ring … against its backdrop" (1.72 / 1.35); phone passes (its day button is another element) | `32-…`, `33-…` |
| P1-P4 rendered ring per control group, both themes, both projects (probe runs `5e104e1r2`, `5e104e1r3`, exit 0) | see "B4-01" below | `40-…`, `41-…` to `44-…`, `41a-aggregate.txt` |
| P8 Shift+Tab from the end of the sheet (desktop 1280x800) | "Edit 2026-10-04" … "Edit 2026-09-28" each at y = 0.17 under the 56px sticky bar, 0 of 25 points visible, no indicator on screen | `48a-…`, screenshot `b5-sticky-hidden-desktop-…` |
| P1 backward walk (phone 390x844) | "Edit 2026-10-09", "Edit 2026-10-08", "Edit 2026-10-02", "Next period", "Previous period": 0 of 25 visible under the compact bar | `41-…`, screenshots `b5-sticky-hidden-phone-…` |
| P2 backward walk in the bottom sheet (390x844) | "Worked from home (WFH)" and "Confirm suggested breaks": 0 of 25 visible under the sticky editor head | `42-…`, screenshot `b5-editor-head-hidden-phone-…` |
| P3 open label picker, three arrow positions, both themes, both projects | listbox focused, `:focus-visible` true, box-shadow = the overlay shadow (no ring); active option rendered #ebf1f9 on #ffffff = 1.14:1 (light), #263347 on #1a2029 = 1.28:1 (dark); no other cue | `43-…`, screenshots `b5-label-list-…` |
| P8 Shift+Tab from "Close" in the day editor (1280, 1024, 390) | focus on the `<dialog>` itself (tabIndex -1, no attribute, scrollHeight 1465 > clientHeight 720); box-shadow = panel shadow, outline transparent; 0 pixels change; ArrowDown scrolls it 40px | `48a-…`, screenshot `b5-editor-dialog-focused-…` |
| P5 phone 390/375/360/320: default, batch, editor, label list, More, Review | 0 sideways scroll, 0 overflowing elements, 0 visible controls under 44x44 in 24 states (41 / 60 / 42 / 48 / 44 / 9 controls) | `45-…` |
| P6 zone note, names, Check words, rendered text contrast | note "Due, your time (Asia/Saigon) Wed 10/14/2026, 07:00" = runtime Intl value for 2026-10-14T00:00:00Z, both projects; 14 day names "Mon 2026-09-28" … "Sun 2026-10-11"; every Check has words and a shape; text minimum 5.00 light / 5.74 dark, 0 under 4.5 | `46-…`, screenshot `b5-zone-note-…` |
| CSS token scan of `styles.css` | 0 colour, shadow, duration, font or url literals outside the token blocks; `--radius: 4px`; 7 of 7 transitions `var(--transition)` = `all 300ms ease-out`; 0 undefined `var()`; reduced-motion block | `20-css-scan.txt` |
| EN/VI parity (docs/04, docs/10 round section, docs/12) | structure, code spans, numbers equal; only translated section names differ | `60-docs-parity.txt` |
| digest, three forms (after) | `07c3ca00…e635`, 790 files, all equal | `90-digest-after.txt` |

## WP5-UX-B4-01 and WP5-UX-B4-02

| Item | Disposition | Observation |
|---|---|---|
| WP5-UX-B4-01 | **Closed** (the token contrast it named); see B5-01..B5-03 for the brief's further conditions | `styles.css:42-43`: `--focus-ring: 0 0 0 1px var(--card), 0 0 0 3px var(--accent)` and `--focus-ring-inset` for the phone tabs; the dark override is gone because `--card` and `--accent` switch. Rendered, real Tab presses, outer ring against the adjacent pixel (light / dark, desktop and phone): top-bar links and Sign out 6.09 / 6.79; phone tabs 4.50-6.09 / 5.21-6.79; period buttons 6.06-6.09 / 6.48-6.79; Clock in 6.09 / 6.70-6.79; Review link 5.87-6.09 / 5.15-6.79; sheet "Edit {date}" 5.23-6.09 / 4.93-6.79 (non-working days lowest; one phone batch-mode reading of 2.11 is the glyph of the adjacent label text, the ring against the cell is 6.09, R-15); label picker trigger (its own inset 2px accent) 4.11-6.09 / 4.36-6.79; toolbar 6.09 / 6.79; batch controls 4.86-6.09 / 5.43-6.79; editor fields and buttons 5.38-6.09 / 6.11-6.79; dialog buttons 6.09 / 6.79; Review, Overtime, History, Settings 4.50-6.09 / 5.09-7.52 (`41a-aggregate.txt`). The ring is never clipped by `overflow` except on one side when the browser aligns a control flush with a scroll edge (R-11). The new check fails on the edaaa85 tokens (4 of 4) and on a one-rule regression of the sheet date (desktop). |
| WP5-UX-B4-02 | **Closed** | `periodBarModel.ts:28-32` `dueInZoneText` used by `PeriodBar.tsx:73`: the zone note shows "Wed 10/14/2026, 07:00" under "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)", equal to the Intl value my probe computed for `due_at_utc` 2026-10-14T00:00:00Z in Asia/Saigon (both projects). docs/04 line 45 (MM/DD/YYYY in the period bar) holds in EN and VI. `periodBarModel.test.ts` (2 zones) and `timesheet.spec.ts:232-239` (runtime-computed expectation) assert it. Display only: no request or value changed (`10a-…`). |

## Owner request, E-1..E-7 and navigation (scope 2)

- **Desktop sheet (E-1, E-2, E-4, E-6):** form header (company, "TIME SHEET FOR SALARIED EXEMPT EMPLOYEES", Employee, Payroll
  Date, Period), "WEEK 1" and "WEEK 2" Monday to Sunday with Day, Date, Label, Time, OT (h:mm), Check and the detail rows,
  legend, "Overtime Total :" in h:mm, signature lines with "Not used yet" for the manager, non-working days tinted and hatched,
  US dates, h:mm, 24-hour times (screenshots of my e2e run). **Met.**
- **E-3 (a):** side panel from 1200px, modal side panel 768-1199px, bottom sheet on a phone, label picker in the cell; focus
  moves to the panel heading on open and back to "Edit {date}" on Escape at 1280, 1024 and 390 (P2). **Met**, with the keyboard
  defects B5-02 and B5-03.
- **E-5 (a), E-7 (a):** desktop Timesheet, Overtime, History, Settings (+ Admin); phone three tabs and More (shell, admin, import
  specs pass); Overtime, History and Settings not restyled. **Met.**
- **Phone layout:** period card, clock card, compact tools, then the sheet; the first-screen e2e test at 390x844 passes. **Met.**
- **docs/04 line 16 (viewing zone):** the bar always shows "Times in {zone}"; each day keeps its accounting date. **Met.**

## Test strength (scope 2)

Every test file changed since 014bd47 (`11-…`) was re-read and every removed line (`12-…`) judged against its replacement in
context (`13a-…` to `13d-…`); the table is in `13-test-strength.txt`. FIX6 removes nothing: it adds two `dueInZoneText`
expectations, the zone-note assertion (computed by the test runtime, not by the app) and the new `focus-ring.spec.ts`.
Result: **no assertion removed or weakened since 014bd47, including FIX6.** No `only` or `fixme`; every `test.skip` is
project-scoped (`14-…`); `playwright.config.ts`, `vitest.config.ts` and `tests/e2e/fixtures.ts` are unchanged since 014bd47. The
tap-target loops' `.filter({ visible: true })` excludes only controls that are not rendered on the phone (`49-…`); my own P5
finds 0 visible controls under 44px.

## Accessibility (scope 2)

- Keyboard order equals the reading order on both layouts, Mon..Sun week 1 then week 2 (14 "Edit {date}" stops in date order,
  P1, both projects and themes). **Pass.**
- Names: "Edit {date}", "Label for {date}: {label}", day elements "Mon 2026-09-28" …, dialogs named by their headings. **Pass.**
- Modal and focus: focus on the panel heading on open, Escape and Close return focus to the day's button (1280, 1024, 390);
  nested review dialog takes Escape first and the label stays Worked (P3); modal editor and dialogs: 0 Tab stops outside. **Pass.**
- Status never by colour alone: 10 Check cells, each with words and a shape (P6). **Pass.**
- 44px and reflow at 390, 375, 360 and 320: 0 small controls, 0 sideways scroll, 0 overflowing elements in 24 states (P5). **Pass.**
- Contrast: text minimum 5.00 light / 5.74 dark (P6); focus ring see B4-01. **Pass.**
- Focus not obscured (SC 2.4.11): **fail, WP5-UX-B5-01.** Focus indicator of the open label picker (SC 1.4.11, 2.4.7): **fail,
  WP5-UX-B5-02.** Focus visible on every keyboard stop (SC 2.4.7): **fail at one stop, WP5-UX-B5-03.**

## UI standards and deprecated APIs (scope 2)

Tokens only outside the token blocks, `--radius: 4px`, one shared `--transition` (`all 300ms ease-out`) on all 7 transitions,
layered shadows, reduced motion, system fonts only, no inline styles; FIX6's values are tokens (`20-…`). Lint `no-deprecated`
exit 0; 0 Node deprecation lines in lint, `npm test`, build and the running servers; 0 browser deprecation messages (`07-…`).
**Pass.**

## Documentation (scope 2)

docs/04 lines 7, 41, 45, 48, 53, 55, 59 and 79 describe the shipped UI; docs/10 records E-1..E-7 and the Excel formulas not
reproduced; docs/12 summarises the round and keeps the release identity unchanged until the round is accepted. EN/VI parity
holds (`60-…`). **Pass** (wording risks R-14).

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-B5-01 | Medium | `src/client/styles.css:238-250` (`.shell-bar { position: sticky; top: 0 }`), `:382-386` (only `scroll-padding-bottom`, phones), `:1975-1983` (`.day-panel .editor-head { position: sticky; top: 0 }`; `.day-panel` at `:1909-1920` has no scroll padding) | Desktop 1280x800: focus the sheet's "Review & sign off" link (end of the page), press Shift+Tab: the label pickers and dates of week 2 stay visible, then "Edit 2026-10-04" … "Edit 2026-09-28" each land at y = 0.17 under the 56px bar, 0 of 25 points visible, no focus indicator anywhere on the screen (light and dark). Phone 390x844: Shift+Tab from the end: "Edit 2026-10-09", "Edit 2026-10-08", "Edit 2026-10-02", "Next period", "Previous period" entirely under the compact bar. Bottom sheet: Shift+Tab from the end of the editor: "Worked from home (WFH)" and "Confirm suggested breaks" entirely under the sticky editor head (also mostly hidden, 5 of 25 visible, at 1280 and 1024). The sticky bar is new in this round (not sticky at 014bd47) | Expected: a focused control is never entirely hidden by author content. Actual: 7 stops on the desktop sheet, 5 on the phone sheet and 2 in the bottom sheet are entirely hidden when reached by Shift+Tab (`html` scroll-padding-top `auto` in both layouts) | WCAG 2.2 SC 2.4.11 Focus Not Obscured (Minimum), failure F110 (sticky header), technique C43 (`scroll-padding`); the brief: "the ring must not be … hidden behind sticky bars" | Token-based scroll padding: `html { scroll-padding-top: calc(var(--bar-height-compact) + var(--space-2)) }` below 768px and `calc(var(--bar-height) + var(--space-2))` from 768px (keep the bottom padding), and a `scroll-padding-top` on `.day-panel` that clears the sticky editor head (or a non-sticky head); add an e2e that Shift+Tabs from the end of the sheet and of the editor and asserts each focused control is not covered (`elementFromPoint`), desktop and phone |
| WP5-UX-B5-02 | Medium | `src/client/styles.css:2243-2259` (`.label-list { box-shadow: var(--shadow-overlay) }` replaces the shared `:focus-visible` ring of `:220-224` on the focused list), `:2275-2277` (`.label-option.active { background: var(--day-selected) }`, `--day-selected` `:103` light 9%, `:192` dark 14%); `SheetWeekTable.tsx:137-160` (focus on the listbox, `aria-activedescendant`) | Any project and theme: Tab to "Label for {date}", press Enter, then ArrowDown: the list has DOM focus (`:focus-visible` true) and no ring; the option that Enter will pick is marked only by the tint: rendered #ebf1f9 against #ffffff = 1.14:1 (light), #263347 against #1a2029 = 1.28:1 (dark); no outline, border, shape or text change (P3, screenshots). A pick that needs no review commits at once | Expected: the keyboard position inside the picker has an indicator of at least 3:1 against its adjacent colours. Actual: 1.14:1 / 1.28:1 and no list ring | WCAG 2.2 SC 1.4.11 Non-text Contrast (focus indicator) with SC 2.4.7 Focus Visible; docs/04 line 63 ("operated by mouse or keyboard"); the brief lists the label picker | Tokens only: give `.label-option.active` an indicator of at least 3:1 (for example `box-shadow: var(--focus-ring-inset)` or an accent bar/solid accent fill with `--on-accent` text) and keep or restore a ring on `.label-list:focus-visible` (for example `box-shadow: var(--focus-ring), var(--shadow-overlay)`); extend `focus-ring.spec.ts` to open the picker, move with the arrows and measure the active option in both themes |
| WP5-UX-B5-03 | Low | `src/client/DayEditor.tsx:238-247` (`<dialog className="day-panel …">`), `src/client/styles.css:1909-1920` (`.day-panel { box-shadow: var(--shadow-overlay); overflow: auto }` replaces the `:focus-visible` ring of `:220-224`; outline transparent) | 1280, 1024 and 390: open the editor of a day, Tab once to "Close", press Shift+Tab: focus is on the `<dialog>` itself (a keyboard-focusable scroll container: scrollHeight 1465 > clientHeight 720; ArrowDown scrolls it), `:focus-visible` true, nothing on screen changes (0 changed pixels; screenshot). At 1280 the backward walk goes Close → the dialog → the sheet's "Review & sign off" link, so the same blank stop also sits between the sheet and the panel's first control | Expected: every keyboard stop shows a visible focus indicator. Actual: one stop with none | WCAG 2.2 SC 2.4.7 Focus Visible (failure F78 pattern: author styles remove the visible indicator); the brief: "editor fields and dialog buttons" | Tokens only: `.day-panel:focus-visible { box-shadow: var(--focus-ring), var(--shadow-overlay) }` (or an inset ring that is not clipped), the same for any scrollable `.dialog`; add the stop to the e2e ring check |

## Risks and optional improvements (not defects)

- **R-2 ISO dates in the Review header (unchanged):** `ReviewScreen.tsx:170`; not the sheet header of docs/04 line 41. Optional.
- **R-3 No phone account button (unchanged):** name and Sign out under More (docs/04 line 7). Not a defect.
- **R-4 Legend always lists "Today" (unchanged):** `TimesheetSheet.tsx:284` (`<Legend today />`). Optional.
- **R-5 Read-only editor and editor figures print "none" (unchanged):** `DayEditor.tsx:428, 434, 444`; docs/04 line 43 concerns
  the sheet's cells, which show no "none" (e2e). Optional.
- **R-6 Ports (unchanged):** the e2e fixture picks OS-free loopback ports; my servers used 48200-48205. Not a defect.
- **O-4 First-screen budget and A2 R5 grantee (unchanged):** the 390x844 first-screen test passes; other states are outside the
  rule. Not defects.
- **R-8 Focus on a mode switch (unchanged):** crossing 1200px moves focus to the editor heading. Optional.
- **R-9 Input boundaries (unchanged):** `--line` borders about 1.35:1; every input has a visible label, and the focus ring now
  reaches at least 3:1. Optional.
- **R-10 (new) Hover hides the ring:** a pointer resting on a keyboard-focused control replaces its ring, because
  `button:hover:not(:disabled)` (`styles.css:496`), `.sheet .sheet-date:hover:not(:disabled)` (`:1328`),
  `.sheet .label-trigger:hover:not(:disabled)` (`:2216`) and `.shell-tabs .tab:hover:not(:disabled)` (`:327`) outrank the
  `:focus-visible` rules (P7: Clock in shows the panel shadow, the sheet date none, the label trigger a 1px accent line). The
  ring is visible whenever the pointer is elsewhere, so SC 2.4.7 holds. Optional: let the focus ring win over hover.
- **R-11 (new) Ring cut at a scroll edge:** when the browser aligns a control flush with the bottom of the viewport (desktop) or
  of the editor panel ("Save day fields" at 1280/1024), one side of the outset ring is outside the scroll area (3 of 4 sides
  visible). Optional; the scroll padding of the B5-01 fix also covers it.
- **R-12 (new) Date inputs reached by Shift+Tab:** Tab into "Open a day" shows the shared ring (6.09 / 6.79, desktop; ring
  visible in the phone crop). Shift+Tab lands on the browser's own calendar button inside the input: the host does not match
  `:focus-visible`, so no author ring, but the browser draws its own outline around the calendar icon (UA indicator, visible;
  P9 crop). Not a defect; optional to style `::-webkit-calendar-picker-indicator:focus-visible` with the token. On the phone
  project my blur-based measurement cannot isolate the ring of date and time inputs (the blurred image still shows it); the
  focused crop shows the ring, so the "no ring" rows of those inputs in `41a-aggregate.txt` are a measurement limit, not a
  finding.
- **R-13 (new) Reach of the new check:** `focus-ring.spec.ts` covers the shared token on 7 surface tokens and four real
  controls; it does not cover the open label picker, the editor dialog stop or occlusion by the sticky bars, and its
  `parseColour` falls back to black for a colour syntax other than `rgb()`/`rgba()` (a future `oklch()` token could pass
  vacuously on light surfaces). Optional, best fixed with B5-01..B5-03.
- **R-14 (new) docs/04 wording:** line 43 says a day with no record shows no placeholder text, while the Time cell of a past
  workday without times shows the note "no times yet" (as in the approved mockup); line 79 says "one shared token" while the
  phone tabs use its inset variant and the label trigger its own 2px accent ring (both at least 3:1). Optional precision.
- **R-15 (new) Phone batch mode crowding:** the day button's ring touches the label text next to it ("Worked"); the ring is
  fully visible (6.09 against the cell). Optional spacing.
- **Information outside area B:** `npm ci` reports 1 high severity advisory; the earlier reviews traced it to a development
  dependency. Not re-verified here.

## Required gates unrun or blocked, and why

None in area B. Typecheck, lint, `npm test` and the full e2e suite on both projects ran here and passed. Area A items are
outside this review.

## Disposition of previous findings

WP5-UX-B4-01: **closed** (shared ring contrast). WP5-UX-B4-02: **closed**. R-2..R-6, O-4, A2 R5, R-8 and R-9: re-judged, none is
a defect under the brief's severity rule. New: WP5-UX-B5-01 (Medium), WP5-UX-B5-02 (Medium) and WP5-UX-B5-03 (Low), open;
R-10..R-15 optional.

## Software readiness, owner permission and pilot result

- **Software readiness, area B:** not yet; B5-01 needs token scroll padding, B5-02 a stronger active-option indicator and a
  list ring, B5-03 a ring on the focused editor panel, each with an automated check; then a freeze, a gate and an area-B
  recheck.
- **Owner permission:** none requested or given; no deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: open a bounded fix task for WP5-UX-B5-01..B5-03 (scroll padding for the sticky top bar and editor head, a 3:1
active-option indicator plus a list ring in the label picker, a ring on the focused editor panel; tokens only; e2e checks that
fail on 5e104e1), then freeze, gate and a fresh area-B recheck on the new digest.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-B5, attempt 1; reviewer self-reported
  `claude-opus-5-5` (fresh subagent; agent ID not visible from inside). Reviewed authors: WP5-UX-PLAN, WP5-UX-T01..T06,
  WP5-UX-FIX1..FIX6 and their freezes, and the gate verifiers (as recorded in their task files; the strongest author model
  recorded is opus `claude-opus-5-5`, FIX6 and REGATE4 `claude-sonnet-5-5`), so my model is not weaker than any author.
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no earlier gate
  or audit of this round. I edited no source, test, doc, board or STATE file. My probes ran in a scratch clone in the task
  folder, kept out of git by `.git/info/exclude`; the two mutations were made only in a second scratch copy. Process slips,
  none of which wrote outside the task and evidence folders or changed any result: one read-only `grep … styles.css | head -n 40` (a pipe into `head`, against the brief's shell
  rules); one `sleep 60` that the harness refused (no effect). My first probe run (tag `5e104e1`) stopped its Tab walks early at
  date inputs (their segments keep focus); I fixed the walker and reran everything (tag `5e104e1r2`, follow-ups `5e104e1r3`);
  the conclusions rest on the reruns, the first run is kept for the record.
- **Source digest before/after; gate evidence for that snapshot:** `07c3ca00…e635` before and after, three forms
  (`00-digest-before.txt`, `90-digest-after.txt`); it equals the WP5-UX-REGATE4 digest of record.
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_B5.md` and `.vi.md`, new files; every
  earlier review is untouched.
- **Finding dispositions and next coordinator fix/recheck task:** B4-01 and B4-02 closed; WP5-UX-B5-01..B5-03 open; next: a fix
  task for them, its freeze, a gate and an area-B recheck.
