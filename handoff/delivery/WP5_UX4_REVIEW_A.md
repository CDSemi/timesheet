# WP5 UI change round 4, area A audit on 0ddfead (WP5-UX4-AUDIT-A)

[Tiếng Việt](WP5_UX4_REVIEW_A.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 4 (WP5-UX4), area A (visual,
  shell, Day editor, dialogs, accessibility); task WP5-UX4-AUDIT-A, attempt 1, 2026-10-21 from 15:01Z to about 17:05Z
  (08:01 to about 10:05 in America/Los_Angeles; displayed period 10/12-10/25/2026, which contains today; not a window day).
  Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from
  inside). The strongest author model of the snapshot on the board is `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04); the other
  authors are `claude-sonnet-5-5`, so the reviewer is not weaker. I authored no WP5-UX4 task. WP5-UX4-AUDIT-B ran at the same
  time on the same machine.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `0ddfeada1b66c82b066b179e901184ca5d857793` (the WP5-UX4-FIX1-FREEZE commit; WP5-UX4-REGATE's `freeze_commit`). HEAD =
  origin/main = that commit before and after; no status line outside `handoff/` before or after. Digest
  `b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda`, 849 files, `handoff/` excluded, equal in three forms
  first (15:01Z) and last (see the evidence table): a clean `git archive` export hashed with `git hash-object --no-filters`,
  the `git ls-tree` form (sorted list byte-identical to the export's) and `npm run digest`. Source complete: `npm ci` exit 0 in
  four exports (target, probe copy, mutant copy, base 8e55710 for comparison).
- **Decision: FIX REQUIRED.** Four findings (one Medium, three Low), listed under "Findings":
  1. Medium: with a classic (non-overlay) scrollbar the Day editor layout flaps between beside and floating about 60 times a
     second at window widths 1330-1344 when the window height lies between the two page heights (U4-07).
  2. Low: Escape pressed on a sheet control while the drawer holds unsaved edits does nothing; the discard question opens and is
     closed by the same key press (U4-05 guard, T02 Addendum 1 route "Escape").
  3. Low: "Current period" then "Keep editing" returns focus to "Today", not to the button that was pressed.
  4. Low (documentation): docs/04 claims two things the build does not do (quiet link buttons share the hover tint; the discard
     guard covers every action that changes the open day).

  Everything else in scope passed my own measurements; per item below. Mandatory checks: typecheck, lint, `npm test` twice,
  build (no chunk advisory) and AC-13 exit 0; FULL e2e on the real clock 773 passed, 96 skipped, 1 failed by
  `net::ERR_NO_BUFFER_SPACE` (rerun alone: passed). axe-core 4.14.0: 0 violations in 102 scans. SC 2.4.11: 0 focused controls
  wholly under the drawer in 96 walks (48 configurations, Tab and Shift+Tab). Mutants: 14 of my own, all caught (M4 by the unit test only); see "Test strength".

## Scope actually inspected and executed

1. Read as claims: the brief, AGENTS.md from disk (UI section "Frontend and UI/UX standards"), docs/08 "Gates and independent
   audit", the owner's 2026-10-20 words on the board (round-4 request, F-1..F-5, D answers) and the coordinator decisions of
   2026-10-20, WP5-UX4-PLAN (A, D, E) and the mockup renders, the records T01, T02 (with Addendum 1), T03, T05, GATE, FIX1,
   REGATE, docs/04, docs/10 and docs/12 (EN and VI, structure parity checked: 10/10 headings, 47/47 bullets, 26/26 table rows in
   docs/04; 30/114/31 in docs/10; 10/80 in docs/12).
2. Code read for area A: `styles.css` (tokens, the three colour sets, transitions, the paper, the drawer, selects, switches,
   checkboxes, link actions, transfer styles), `TimesheetScreen.tsx`, `DayEditor.tsx`, `DayFieldsForm.tsx`,
   `SheetWeekTable.tsx`, `PeriodBar.tsx`, `editorLayoutModel.ts`, `useEditorLayout.ts`, `ConfirmDialog.tsx`,
   `AlertDialog.tsx`, `LocalTimeField.tsx`, `SessionDialog.tsx`, `BreakRows.tsx`, `SettingsTransfer*.tsx`,
   `CompanyCalendarFile.tsx`, `ProfileScreen.tsx`, `SettingsScreen.tsx`, `ReviewScreen.tsx`, `ReviewDays.tsx`; the round-4 style
   diff `git diff 8e55710 0ddfead -- src/client/styles.css`.
3. Mandatory checks in a clean export (`export`).
4. Own probes in a second export (`export-probe`, task-local `zz-a-*.spec.ts` through the repository harness, Edge headless,
   nothing in the repository): visual measurements in four theme situations, a computed-style snapshot of the toolbar, weeks
   and footer on the base build 8e55710 and on the target, the Day editor (modes, corners, push, switch, unselect, focus
   order, Escape, every guard route with Keep editing and Discard, the phone sheet), the layout rule with overlay and with
   classic scrollbars, SC 2.4.11 walks, the session and Check out dialogs, Settings, Administration and Profile, a lazy-card
   layout-shift probe, an axe scan, a "Current period" probe under the FIX10 simulated clock at 2026-10-26T16:00Z (a window
   day), and screenshots.
5. Fourteen mutants in a third export (`export-mut`), each applied alone, client rebuilt, the catching tests run, file restored
   and compared byte for byte.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX4-AUDIT-A/` plus 13 `-synthetic.png` screenshots; probe and
script sources are kept as `zz-src-*.txt`.

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; status outside `handoff/` | `b3e9c962…a1fda`, 849 files at 15:01:20Z and at 16:51:39Z; export list = `ls-tree` list; HEAD 0ddfead = origin/main; no line | `01-*-before.txt`, `01-*-after.txt` |
| `npm ci` (four exports) | 0, 0, 0, 0 | `02-core-exits.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, no deprecation line (`NODE_OPTIONS=--trace-deprecation --pending-deprecation`) | `02-typecheck.txt`, `02-lint.txt` |
| `npm test` twice | 0 and 0: 97 files, 2226 tests each; no worker crash | `03-npmtest-1.txt`, `03-npmtest-2.txt` |
| `npm run build` | 0; main `index-DURkl3lw.js` 489.31 kB (gzip 143.24), CSS 83.20 kB, `AdminScreen` 38.29, `ImportScreen` 24.58, `SettingsTransfer` 7.68, `SettingsTransferFile` 26.78 kB; no chunk-size advisory | `04-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `05-ac13.txt` |
| FULL e2e, real clock, both projects (15:06:07-15:30:10Z) | exit 1: 773 passed, 96 skipped, 1 failed: mobile `day-editor.spec.ts:4022`, console `net::ERR_NO_BUFFER_SPACE` during sign-in (a buffer error). Desktop 402/33/0, mobile 371/63/1 | `log-e2e-full-real.txt`, `06-e2e-project-counts.txt` |
| that test alone on mobile (the one allowed rerun) | exit 0, 1 passed | `log-e2e-rerun-4022-mobile.txt` |
| probes | see "Item verdicts"; first runs of some probes stopped on my own locator mistakes and were rerun (kept as `*-run*.txt`) | `obs-*.txt`, `log-probe-*.txt` |
| mutants | see "Test strength" | `60-mutants.txt`, `log-mut-*.txt` |

## Findings

1. **Medium. With a classic scrollbar the Day editor flaps between beside and floating at about 60 changes a second.**
   - Where: `src/client/components/useEditorLayout.ts:28` (the rule's width is `document.documentElement.clientWidth`) and
     `:38-43` (re-evaluated on every size change of the root element), with the push of the page
     (`src/client/styles.css:3753-3761`: the page reserves 416px and the form header stacks) and `TimesheetScreen.tsx:104`.
   - Reproduction (`obs-rule.txt`, `obs-flap.txt`): Edge headless launched without Playwright's default `--hide-scrollbars`, so it
     draws a 15px classic scrollbar as Windows desktop browsers do. Drawer open on a day; window 1335, 1340 or 1344 wide and 1370
     high: `data-editor-layout` changes 180 to 182 times in 1.5 s; at 1340x1400 600 times in 10 s, alternating `beside` and
     `floating`. The page is 1369px tall floating and 1442px tall beside, so the vertical scrollbar appears and disappears with
     the mode, `clientWidth` swings across 1330 (1340 and 1325), and each swing flips the mode. With a tall (2185px) or a short
     (500px) window there is no flap; the switch itself is at a window width of 1345 (client 1330) as designed, and with overlay
     scrollbars one change per crossing (1329 floating, 1330 beside, 42-step sweep, 2 changes).
   - Expected: one layout per window size. docs/04 line 66 says the rule is "of the window width alone ... so it cannot flap"
     and the U4-07 acceptance asks for one change per crossing. A full-page reflow alternating at frame rate is also a flashing
     risk (WCAG 2.3.1) and makes the page unusable while it lasts. No test covers a classic scrollbar (the headless default hides
     it).
   - Bounded fix: make the measured width independent of whether the page scrolls, for example `scrollbar-gutter: stable` on the
     root (the classic gutter is always reserved, so the switch stays at 1345px), or a width measured once without the
     scrollbar; add an e2e that launches without `--hide-scrollbars` and asserts no layout change in 1.5 s at a window between
     the two page heights; correct docs/04 line 66 and docs/12 (EN and VI) if the wording changes.
2. **Low. Escape on a sheet control with unsaved edits does nothing.**
   - Where: `src/client/DayEditor.tsx:155-164` (`closeOnEscape` calls `onClose()` without `event.preventDefault()`).
   - Reproduction (`obs-diag.txt`, `obs-editor.txt`): at 1280 (floating) and 1440 (beside), open a day, type in Notes, focus
     another day's date button (any control on the sheet), press Escape. The question "Discard your changes?" is added to the page
     and at once receives a `cancel` event (the browser's close request of the same, unprevented Escape goes to the modal that
     just opened), so it closes as Keep editing: no question is seen and the drawer stays. With no unsaved edit the same Escape
     closes the drawer. Escape inside the drawer asks correctly (its handler `DayEditor.tsx:284-291` prevents the default).
   - Expected: docs/04 line 67 and T02 Addendum 1: with unsaved edits, Escape (wherever focus is) asks "Discard your changes?".
     No data is lost (it fails safe), but the specified route does not work.
   - Bounded fix: `event.preventDefault()` in `closeOnEscape` before `onClose()`, and a test for Escape from a sheet control
     with unsaved edits (Keep editing and Discard).
3. **Low. "Current period" then "Keep editing" moves focus to "Today".**
   - Where: `src/client/components/PeriodBar.tsx:147-151` (focus moves to Today before `onCurrent`) with
     `TimesheetScreen.tsx:516-517` (the question returns focus to the element focused when it was asked).
   - Reproduction (`obs-current.txt`, simulated clock 2026-10-26T16:00Z, server `today_local` 2026-10-26): Today, open today's
     day, type a note, focus "Current period", Enter, Keep editing: the period and the note are kept and "Current period" is still
     shown, but focus is on "Today". T02 recorded this (PeriodBar.tsx was not owned).
   - Expected: focus returns to the control that opened the question (the dialog rule of docs/04 line 73; every other route does
     so in my probe). Bounded fix: move focus to Today only when the jump goes ahead (inside the proceed path).
4. **Low (documentation). docs/04 states two things the build does not do.**
   - docs/04 line 108 (Visual standard, "Hover and pressed"): "secondary and quiet buttons ... share one hover tint
     (`--hover-fill`) with an accent boundary". The round-4 quiet link buttons "Today", "Now" and "Set an end instead" have a
     transparent hover by design (`styles.css:3526-3549`: colour to `--accent-strong`, 1.31:1 light and 1.23:1 dark from rest,
     and a thicker underline).
   - docs/04 line 67: "every action that would change the open day, close the drawer or move the sheet to another period first
     asks". Two routes do not ask, by design: a link that leaves the page, and the reload after a label or batch commit changed
     the open day (my probe: a typed note replaced by the saved one with no question, `obs-editor.txt`). docs/10 line 277 and
     docs/12 line 95 say so; docs/04 does not.
   - Bounded fix: one sentence each in docs/04 and docs/04.vi.

## Item verdicts (owner fidelity and mockup)

| Item | Verdict | Evidence (mine) |
|---|---|---|
| U4-02 title gap 32px | PASS | 32.00px at 768, 1024, 1280, 1440, 1920 in light, dark and both manual overrides (Timesheet); Review 32px at 768-1920 (`obs-visual.txt`, `obs-visual-run1-partial.txt`) |
| U4-03 paper, toolbar/weeks/footer unchanged, signatures two rows, free paper style | PASS | one `[data-paper]`; it holds the toolbar, form header, both weeks, footer, legend, OT total and signatures, not the h1 or period card; 4 signature cells in 2 rows; paper 12px corners, 16px padding, `--elev-2`, 1.14:1 (light) and 1.15:1 (dark) from the page, overflow visible. Base-vs-target style snapshot (1038 equal values per state): only the intended changes differ (week and footer shadow gone, header strip and first column fill, the switch label), plus 32px less width and toolbar-to-form-head 12 to 16px (`20-snapdiff.txt`, screenshots base/target) |
| F-5 stronger week header row and first column, readable text | PASS (owner to see) | `--sheet-head-strong` in all three sets; 1.27:1 (light) and 1.36:1 (dark) from the white cells; 1.09:1 and 1.20:1 from the Mon/Tue day cells (`--sheet-head`), a small step as asked ("lên 1 chút"); `--text` 12.30/9.91:1, `--muted` 4.59/4.83:1 on it (`41-contrast-tokens.txt`) |
| U4-04 round switches | PASS | every switch `appearance: none`, radius 999px, 44x24, round 18px thumb, four situations |
| U4-05 non-modal, switch, unselect | PASS except findings 2 and 3 | `:modal` false, no `inert`, no `aria-modal` at 768-1920; switch by button and by column; unselect keeps focus and announces "Day editor closed"; phone sheet modal |
| U4-06 corners, push | PASS | right 12/0/0/12, left 0/12/12/0; edge and bottom gap 0; top under the 56px bar; beside clearance 32px (1330, 1440), 184px (1920) |
| U4-07 rule | FAIL (finding 1) | overlay: switch 1329/1330, one change per crossing; classic: switch 1344/1345 but a flap in the height band |
| U4-08 select chevron | PASS | `appearance: none`, 34px end padding, 12px from the edge, 5.83:1 / 7.07:1; forced-colour rule present (emulation only, see risks) |
| U4-09 checkbox centring | PASS | WFH centre = Category centre (0.00px), four situations |
| U4-10 "Show worked hours" | PASS | visible text and name |
| U4-12 zone first | PASS | zone, start date, start time, end date, end time in DOM, screen and Tab order at 1440, 768, 390 |
| U4-13 Today/Now right-aligned | PASS | right edge delta 0.00px for all four links at 1440, 768, 390 and in the running edit; names "Today, start date" etc. contain the visible word; 44x44 on touch, 28px high with a pointer |
| U4-14 aligned break rows | PASS | suggested and added rows: time x/width and minutes x/width identical at 1440, 768, 390 (rows) and in the Check out dialog; chips at 390 in Check out |
| U4-15 alert | PASS | initial focus OK; in view at 1440, 768, 390 (session) and 1440 (Check out); Escape = OK; focus to the first marked row, else Save / "Check out with these breaks"; no `p.error` |
| Running-session edit layout (U4-11 UI) | PASS | subtitle "running", "No end yet" box, "Set an end instead", no End fields, no "Confirm no breaks taken", hint, at 1440 and 390 |
| Mockup fidelity (not overridden) | PASS | drawer, corners, floating rule, session dialog, running edit and the import preview match B5-B8 and B10; the one-row signatures and the square paper of B1-B3 were overridden by the owner (two rows) and the paper style left free. One visible difference: the card's import control is the native labelled file input ("Choose File"), where B10 draws an "Import settings..." button (docs/04 line 86 records the native input; risk 10) |

**The two routes left unguarded by design.** Leaving the page through a link: acceptable. The owner asked for switching and
unselecting a column; the app has no navigation guard on any screen (Settings forms behave the same) and a router guard would be a
new concept. The reload after a label or batch commit changed the open day: acceptable but the weakest; the person changes that
same day on purpose and the form must follow the new version, yet typed fields of that day are dropped silently. Both are
recorded in docs/10 and docs/12 but not in docs/04 (finding 4). A cheap optional improvement is to ask before such a commit when
the open day holds unsaved edits.

**Review.** The two-column switch at 1330px is justified: below it the 850px sheet beside the 380px checklist overflowed (772px
at 1200-1329 before round 4). At 1280 Review works as one column (paper 1168px, no grid overflow, no page scroll); the checklist
follows the sheet. The footer without its own shadow: my view is to keep it so; the paper is the one surface and the footer
reads like the PDF's; a `--sheet-rule` hairline would bring back the old card edge if the owner prefers it (owner choice, not a
defect).

**Settings, Administration, Profile.** Export and import card: visible labels, native file input labelled; the preview dialog's
heading takes focus, it holds a real table (caption, three column headers, 16 row headers, 3 group headers, "changed"/"same" in
words), Escape returns focus to the file input; axe 0 in light and dark. Company card: heading, labelled file input, export
button. Change password: visible labels, `current-password`/`new-password` autocomplete with a hidden `username`, errors in a
`role="alert"` paragraph that takes focus. **The lazy card's layout shift:** with the chunk held 1.5 s the card moves "Import
from Excel" down 326px (desktop) and 564px (360px) (layout-shift 0.61 and 0.64); it happens once per page load and below the
first screen, before a person can reach the link by keyboard in practice. My verdict: the test-side wait is acceptable and no
product mitigation is required now; reserving the card's height (or placing it last) is an optional improvement.

**AGENTS UI section and style system.** New colour token `--sheet-head-strong` in the light set and both dark sets (identical
dark values); the other round-4 tokens derive from existing colours or are lengths; every rule that writes `transition` (12)
writes `var(--transition)`, which lists six properties and never `all`; durations 0.01ms under reduced motion; no animation or keyframes; hover gated by
`(hover: hover)`; state never colour alone (switch thumb position, "changed"/"same", status words and shapes). Contrast of every
new surface and state in light, dark and both overrides: `41-contrast-tokens.txt` (all at or above the need). One new literal
outside a token: `.transfer-table th[scope='row'] { width: 30% }` (risk 7).

**WCAG 2.2 AA.** axe-core 4.14.0 (WCAG 2.0/2.1/2.2 A and AA tags; engine loaded from the task folder): 0 violations in 102 scans
(desktop and phone, four theme situations: Timesheet paper, drawer beside, floating at 1280 and 900, bottom sheet, discard
question, new session, the alert, running edit, Check out, Review 1440/1280/390, Settings, Profile with an error,
Administration, the import preview); text sweep minimum 4.59:1 (light) and 4.83:1 (dark), none below. SC 2.4.11: 96 walks
(768, 790, 900, 1024, 1180, 1329; docked left and right; batch mode on and off; DPR 1 and 2; Tab and Shift+Tab, 130 presses):
0 stops wholly under the drawer after the frame; 2 to 22 per walk for one frame before the re-dock (by design). Keyboard walks:
focus order sheet to drawer and back, Escape, the guard routes. 44px targets below 768px: none smaller (the switch box sits in a
44px label). No page-level horizontal scroll at 320, 360, 375, 390, 768, 820, 1024, 1280, 1329, 1330 and 1440 on Timesheet
(also with the drawer), Review, Settings and Profile.

## Test strength

Fourteen mutants of my own in `export-mut`, each applied alone (`mutate.mjs`, exactly one occurrence), client rebuilt, the
listed tests run on the desktop project, the file restored and compared with the pristine export (`cmp`; at the end
`diff -rq export/src export-mut/src` empty and a clean rebuild). All 14 are caught, each by an assertion, not a timeout
(`60-mutants-clean.txt`, `61-mutant-reasons.txt`, `log-mut-M*.txt`):

| Mutant | Caught by |
|---|---|
| M1 paper class removed from the Timesheet section | `controls.spec.ts:95` and `surfaces.spec.ts:73` (6 failed) |
| M2 title gap `--space-3` | `controls.spec.ts:49` (3 failed, "title row to period card at 768px") |
| M3 chevron inset 4px | `controls.spec.ts:429/484/510` (4 failed, "arrow edge distance 4") |
| M4 `COVER_TOLERANCE = 0` (re-dock tolerance) | the unit test "allows the tolerance at the drawer edges" only; the two FIX1 walks pass (clipping to the window already handles the 0.23px case) |
| M5 unselect toggle removed | `day-editor.spec.ts:4607` (5 failed) |
| M6 discard guard bypassed on Today | `day-editor.spec.ts:5033` (the Today test) |
| M7 left-docked corners rounded on the edge side | `day-editor.spec.ts:4886` |
| M8 zone field moved below the times | `day-editor.spec.ts:5334` at 1440 and 390 ("DOM order") |
| M9 focus after the alert to the heading instead of Save | `day-editor.spec.ts:5713` at 1440 and 390 |
| M10 break time slot 6.8rem | `day-editor.spec.ts:5613` ("time ... is not clipped") |
| M11 `--sheet-head-strong` = the old `--sheet-head` (light) | `controls.spec.ts:259` and `:529` |
| M12 Today/Now aligned to the start of the cell | `day-editor.spec.ts:5334` ("ends where Start date ends") |
| M13 period step moves before it asks (Keep editing cannot keep the period) | `day-editor.spec.ts:5091` |
| M14 the document Escape handler of the drawer removed | `day-editor.spec.ts:3294` walks and the addendum tests (11 failed) |

Gaps that no test covers (they match findings 1-3): a classic scrollbar (every e2e runs with hidden scrollbars), Escape from a
sheet control with unsaved edits, and the focus after Keep editing on "Current period".

## Risks and optional improvements (not proven defects)

1. The floating drawer docked right lies over the right end of the period bar (Next, Today, Review) and the check in/out button
   for a pointer at 768-1329px; the keyboard re-docks. Expected of an overlay; closing is one click.
2. The reload after a label or batch commit on the open day drops typed fields silently (by design; see above).
3. The lazy export/import card shifts the page once per load when its chunk is slow (see above).
4. Change password: a repeated identical error is not announced again and focus stays on the button; the fields carry no
   `aria-invalid` (the message names the field in words).
5. `ol.review-steps.plain` keeps the browser's 40px list indent (only `ul.plain` resets it), now visible in the one-column Review
   at 768-1329px (pre-existing).
6. `styles.css:85-88` says the docked editor uses `--elev-2`; the drawer uses `--elev-3` in every mode (docs/04 is right).
   `--scrim-side` (`styles.css:102-103`, 428, 495) is unused since the backdrop went, with a stale comment.
7. `width: 30%` on the transfer table's row headers is a literal outside a token (AGENTS UI rule 1).
8. Forced colours: the select rule restores the native arrow (checked by emulation only); the round switches draw their thumb
   with a gradient, whose rendering in a real forced-colours mode could not be checked headless (NOT VERIFIED).
9. Server codes appear in the alert text, for example "(overlapping_user_intervals)" (pre-existing message format; docs/04 line
   16 asks for no DB terms in ordinary flows).
10. The personal card's import control is the browser's native file input ("Choose File / No file chosen"), not the mockup's
    "Import settings..." button; accessible and documented, but plainer than the approved drawing.

## Required gates unrun or blocked

None of the mandatory checks is unrun. Real forced-colours rendering and real classic-scrollbar devices other than the headless
probe were not checked.

## Disposition of previous findings

The gate's SC 2.4.11 failure (1280, docked left) is closed by my walks (0 hidden in 96 walks, including 1280-adjacent widths and
DPR 2). The FIX1 item 5 question is answered above (no product mitigation required).

## Software readiness, owner permission and pilot result

Not ready for the round-4 re-acceptance: area A is FIX REQUIRED. Owner permission and the pilot are separate and untouched.

## One next action

A bounded fix round for findings 1-4 (one source writer: `useEditorLayout.ts`/`styles.css`, `DayEditor.tsx`, `PeriodBar.tsx`,
docs/04 EN and VI, and the three tests), then a freeze, a regate including a classic-scrollbar run, and a fresh area-A recheck.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX4-AUDIT-A attempt 1; reviewer agent `a0a1a11cfee4a1c8e` (from
  the board); authors of the snapshot on the board: PLAN `a3f294195d4f4c99f`, T01 `a92d8e4a467bd6b4e`, T02 `af66795ab39964860`,
  T03 `abd3f154777315616`, T04 `ac40529a094d001dc`, T05 `ac50555628a30054f`, T06 `aeb02a4427bbe14e5`, FIX1 `aaf0f2fdc628d8f2c`.
- Fresh context; I wrote no change in the reviewed snapshot and edited no source, test, doc, board or STATE.
- Source digest before and after: `b3e9c962…a1fda` (849 files) both times; gate evidence for that snapshot: WP5-UX4-REGATE PASS.
- New report path: `handoff/delivery/WP5_UX4_REVIEW_A.md` (and `.vi.md`); earlier reviews untouched.
- Finding dispositions and next coordinator task: findings 1-4 to a fix round; risks for the owner and the coordinator.
