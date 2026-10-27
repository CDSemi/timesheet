# WP5 UI change round 5, area A audit on f4049aa (WP5-UX5-AUDIT-A)

[Tiếng Việt](WP5_UX5_REVIEW_A.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 5 with round 4 folded in (WP5-UX5),
  area A (visual, shell, Timesheet, Day editor, Review UI, accessibility); task WP5-UX5-AUDIT-A, attempt 1, 2026-10-27 from 03:26Z to
  about 04:20Z (Mon 2026-10-26, 20:26 to about 21:20 in America/Los_Angeles: a window day; the page opens on 10/12-10/25/2026, which has
  ended and is due Tue 10/27 17:00; today is in the in-progress period 10/26-11/08). Reviewer self-reported model `claude-opus-5-5`,
  profile timesheet-auditor (effort set by the profile, not observable from inside). The strongest author model on the board for the
  snapshot is `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04, WP5-UX5-PLAN, WP5-UX5-T01B); the others are `claude-sonnet-5-5` (a few
  entries record no model), so the reviewer is not weaker. I authored no WP5-UX4 or WP5-UX5 task. WP5-UX5-AUDIT-B ran at the same time on
  the same machine.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `f4049aa7905e22f1467dfcae4208675cb2fc8e80` (the WP5-UX5-FIX6-FREEZE commit, pushed; WP5-UX5-REGATE4 PASS on it). HEAD = that commit
  before and after; no status line outside `handoff/` before or after. Digest
  `26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336`, 882 files, `handoff/` excluded, equal in three forms at 03:26:44Z
  and at 04:12:21Z: a clean `git archive` export hashed with `git hash-object --no-filters`, the `git ls-tree` form (sorted list
  byte-identical to the export's) and `npm run digest`. Source complete: `npm ci` exit 0 in three exports (target, probe copy, mutant
  copy).
- **Decision: FIX REQUIRED.** Four findings (one Medium, three Low), details under "Findings":
  1. Medium: on the Review page of a period that is already signed (any visit after the sign-off, for example to send it), the Employee
     Signature line holds the signed image, name and "Signed" plus the "Sign correction" button. From 480px down the content is squeezed to
     about 21px, the name breaks into two or three letters per line, the button covers the "Signed" mark and the employee line no longer
     lines up with the manager line (at 768px the content is 45px wide).
  2. Low (WCAG 2.2 SC 2.5.3, Level A): below about 344px of window the toolbar button shows "Change days" while its accessible name stays
     "Change several days", which does not contain the visible text.
  3. Low: the desktop outside press closes the Day editor on a pointer-down that is a scroll: a touch swipe that starts outside a day column
     on a 768px-or-wider touch screen, and a press or drag on a week card's own horizontal scrollbar (768 to 929px).
  4. Low (documentation): docs/04, docs/12 (EN and VI) and three style-sheet comments state things the build does not do.

  Everything else in scope passed my own measurements (per item below). Mandatory checks: typecheck, lint, `npm test` twice, build (no
  chunk advisory) and AC-13 exit 0; FULL e2e on the real clock 863 passed, 125 skipped, 0 failed. axe-core 4.14.0: 0 violations in 108
  scans (eight theme and device situations). SC 2.4.11: 0 focused controls wholly hidden in 1,440 keyboard stops. Mutants: 17 of my own,
  15 caught, one not caught (M2), and the FIX5 date-compare mutant (M13) caught at the midnight crossing by `today.spec.ts:626`, not by the
  new poll.

## Scope actually inspected and executed

1. Read as claims: the brief; AGENTS.md from disk (UI section "Frontend and UI/UX standards"); the owner's words on the board (round-5
   request, F-1..F-10 answers and mockup adjustments, mockup notes 2, adjustment 3 and its correction, "1 a, 2 a", "A.a, B.A, C.b",
   round-4 answers) and the coordinator decisions of 2026-10-20 to 2026-10-22; WP5-UX5-PLAN (A, B3, D, E, Addenda 1, 2, 3b) and the twelve
   renders; the slice records T03, T04, T05A, T05B (and T06 for docs); GATE, FIX1, REGATE, DIAG1, FIX2, REGATE2, FIX3, REGATE3, DIAG2,
   FIX5, DIAG3, FIX6, REGATE4; WP5-UX4-AUDIT-A, FIX2, FIX3; docs/04, docs/10, docs/12 (EN and VI).
2. Code read for area A: `styles.css` (tokens in the three sets, motion, forced colours, every media and container query, the period
   card, toolbar, sheet, signatures, drawer, sub-buttons), `layoutQueries.ts`, `useMedia.ts`, `useEditorLayout.ts`,
   `editorLayoutModel.ts`, `useBlockSize.ts`, `TimesheetScreen.tsx`, `PeriodBar.tsx`, `OpenDay.tsx`, `ReviewStatus.tsx`,
   `reviewModel.ts` (U5-14 parts), `TimesheetSheet.tsx`, `SheetWeekTable.tsx`, `DayEditor.tsx`, `DayFieldsForm.tsx`, `LeaveDialog.tsx`,
   `ReviewScreen.tsx`, `ReviewDays.tsx`, `SignoffDialog.tsx`, `SendCard.tsx`, `deliveryModel.ts` (`sendCardState`),
   `SubmissionSettingsForm.tsx`; the fix-round test diffs (FIX2, FIX3, FIX5, FIX6).
3. Mandatory checks in a clean export (`export`).
4. Own probes in a second export (`export-probe`; task-local `zz-a5-*.spec.ts` through the repository harness, Edge headless, nothing
   in the repository): Timesheet geometry at 13 desktop and 7 compact widths; fractional widths at forced device scale factors (window
   resize through CDP and an about:blank frame); the Day editor (outside-press matrix, every guard route with Keep editing and Discard,
   touch swipe, classic-scrollbar presses, phone sheet, Partial leave dialog, old-period reason); the Review page (head, check card,
   Preview, signature geometry at 10 widths, the Sign off dialog, the signed footer, the Send card, field errors, a real send through the
   capture sink, the reason dialog); axe and a text-contrast sweep; keyboard walks; target sizes; the round-4 rechecks.
5. Seventeen mutants in a third export (`export-mut`), each applied alone, client rebuilt, the catching tests run, the file restored and
   compared byte for byte; M13 under the FIX10 simulated clock at the America/Los_Angeles midnight crossing, with an unmutated control.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX5-AUDIT-A/` plus 10 `-synthetic.png` screenshots; probe and script
sources are kept as `zz-src-*.txt`; `00-README.txt` is the index.

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; status outside `handoff/` | `26b163a6…05336`, 882 files at 03:26:44Z and 04:12:21Z; export list = `ls-tree` list; HEAD f4049aa; no line | `01-*-before.txt`, `01-*-after.txt`, `00-*` |
| `npm ci` (three exports) | 0, 0, 0 | `02-ci.txt`, `02-ci-extra.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, no deprecation line | `02-typecheck.txt`, `02-lint.txt` |
| `npm test` twice | 0 and 0: 101 files, 2374 tests each (50.8 s, 48.9 s); no worker crash | `03-npmtest-1.txt`, `03-npmtest-2.txt` |
| `npm run build` | 0; main `index-BeK5KvKY.js` 490.79 kB, `ReviewScreen` 25.68 kB, no chunk-size advisory | `04-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `05-ac13.txt` |
| FULL e2e, real clock, both projects (03:29:54-03:53:37Z) | exit 0: 863 passed, 125 skipped, 0 failed (494 tests per project); no rerun | `06-e2e-full.txt`, `06-e2e-project-started.txt` |
| Timesheet geometry probe | see U5 table | `obs-sheet.txt` |
| Fractional widths | 767.333 CSS px reached by window resize at 150%; 479.333 and 767.333 in an about:blank frame at 150% | `obs-frac*.txt` |
| Day editor probes | see "Day editor" | `obs-editor*.txt`, `obs-classic*.txt` |
| Review probe | see "Review UI" | `obs-review.txt` |
| axe-core 4.14.0 + text-contrast sweep | 108 scans, 0 violations; text min 4.59:1 (light), 4.65:1 (dark), 0 below 4.5 | `obs-axe.txt` |
| Keyboard walks | 8 walks, 1,440 stops, 0 wholly hidden, a ring on every stop | `obs-walk.txt` |
| Target sizes (390 touch, 1280 coarse) | only the 36px sub-buttons are under 44px, each with its hit area above and below | `obs-targets.txt` |
| Mutants | 17: 15 caught, M2 not caught, M13 caught only by `today.spec.ts:626` | `61-mutants-summary.txt`, `log-mut-*.txt` |

## Owner fidelity, round 5 (one verdict per item; U5-33 and U5-34 are area B)

| Item | Verdict | My evidence |
|---|---|---|
| U5-01 compact below 480 (F-6 a) | Pass | 479px: card and paper 8px from each edge, card corner 12px, table 447px; 480-929px: 7-column grid scrolling in its card, no page scroll at any width |
| U5-02 wordmark | Pass (deviation acceptable) | shown at 600 (phone bar) and 1440, hidden at 390/320 (needs 414px); e2e `logo.spec` sweeps passed in my run |
| U5-03 select chevron | Pass | one conic layer, 12x6 tile, forced colours restore the native arrow; seam test passed in my e2e |
| U5-04 icons | Pass | inline SVG on Edit, Delete (danger tone), Add session, Add (leave) in my screenshots and code |
| U5-05 36px + 44px hit (F-1 a) | Pass | 36.0px boxes; hit area 3px above and below at 390 touch and 1280 coarse (`obs-targets.txt`); M5 caught |
| U5-06 theme toggle | Pass | 32px with a fine pointer from 768, 44px otherwise (CSS; `theme.spec` passed in my run) |
| U5-07 spaced ranges | Pass, with a documentation gap (finding 4) | "07:30 - 11:45" at 1440; tight per sheet when needed; an overnight "22:00-06:00+1" breaks onto two lines on the 7-column sheet at 480 to 900px and more, not only "in the narrowest phone cell" |
| U5-08 Current period | Pass | shown after Next on this window day; Keep editing keeps focus on it |
| U5-09 ">" and Today left | Pass | gaps 20.0px / 20.0px around the range, Today 8.0px after ">" at 1440..632 |
| U5-10 chips under the range | Pass | range top = button top (0.00), last pill bottom = button bottom (0.00) |
| U5-11 divider kept | Pass | 1px solid, 10px above / 8px below wide, 8 / 6 narrow |
| U5-12 buttons down only when needed | Pass | wide at 632, narrow at 631; narrow: ">" on the right edge (0.0), range centred (0.0) |
| U5-13 range ladder | Pass | full form to 360px, "10/12 → 10/25/2026" at 340/320, "10/26 → 11/08/2026" across months; accessible text "10/12/2026 to 10/25/2026" |
| U5-14 primary Review button (H-1 a) | Pass | primary for the ended draft; quiet for the in-progress period (320 screenshot); M3 caught |
| U5-15 767/768 | Pass | 767.333 CSS px reached: old `max-width: 767px` and `min-width: 768px` both false, every range rule on the phone-shell side |
| U5-16 header wrap | Pass | one row at 1100+; field block under the title at 900/768; Period wraps first at 700; title one line |
| U5-17 "Open" | Pass | "Open" at 340/320, words hidden at 320, field fills the row |
| U5-17b "Change days" | Behaviour pass; SC 2.5.3 fails (finding 2) | right-aligned (0px) at every compact width, "Change days" at 340/320 |
| U5-18 "Worked hours" | Pass | switch name and label |
| U5-19 Today spacing | Pass | button 8.5px after the 3px bar at 390 and 320 |
| U5-20 worked lines | Pass | a tbody per day, no rule under the day row, 2px rule closing the group, `--worked-line` tint, indent 27px |
| U5-21 WEEK bar | Pass | bar width = grid width (850px) before and after a full sideways scroll at 900..480 |
| U5-22 compact margins | Pass | 8.0px both sides at 479..320; table 358px at 390 |
| U5-23 square drawer | Pass | all four radii 0px, light and dark, docked right; phone sheet 12/12/0/0 |
| U5-24 outside press (F-7 a) | Pass, except finding 3 | 8 targets at 1280 and 1440 close it with focus on the day button; controls keep their action (Today moved the editor to today); with edits the question asks and Keep editing returns focus to the field |
| U5-25 Partial leave dialog (B5 Notes stay) | Pass | Done writes only the draft (0 PUT), Cancel and Escape restore and close only the dialog, focus back to Change/Add, 25h refused in the dialog with `aria-invalid`, Remove, Close after Done asks, old period needs the reason, Notes not in the dialog |
| U5-26 phone foot, no Figures | Pass | modal sheet, 0 figures, Save 358x44 in the foot (outside the form, `form=`), same y after scrolling the body |
| U5-27 title and chips | Pass | no submission id; chips under the description, left-aligned |
| U5-28 check card | Pass | 16px padding (12px below 480), text centred on the button (0.0), gap 16px, "Back" below 480 |
| U5-29 Preview card | Pass | company line hidden (height 0) at 340/320, never wrapped; title wraps by word at 390 and below |
| U5-30 Sign off dialog and signature | Fail on revisit at narrow widths (finding 1) | dialog content, inline refusal with focus to the checkbox, Escape back to Sign off, signed footer and focus to the Send card all pass; insets 3.518 / 27.406 / 13.703 / 10.925% at 1440..768, rows aligned, button 8.00px inside |
| U5-31 Send card (F-3 b, F-4) | Pass (deviation acceptable) | Send disabled "Sign off first" before; field errors with focus and no POST; switches drive the PDF link; a real send through capture; "Send another copy..." with the reason dialog: empty and 1-character reasons refused, Cancel posts nothing |
| U5-32 zone note | Pass | one muted note ends the page |

Grantees see none of it: the shared view has no Sign off, Send, PDF Preview or Save PDF and the shared mount answers 404 to send,
send-draft and pdf-preview (`sharing.spec.ts:370-378`, passed in my e2e run); `#/review/<date>` renders only the signed-in person's
own review (`App.tsx:173`).

**Recorded deviations, judged:** T03 "From" before a revision (acceptable; the From row exists and the address appears after the
sign-off); T03 "PDF Preview" in a new tab (acceptable: the CSP forbids framing); T04 shared-view wordmark from 492px and the measured
card thresholds 600 / +138px (acceptable; I measured the flip at 631/632); T05A toolbar thresholds (acceptable; measured at 340/320);
T05A late "+1" wrap fallback (acceptable behaviour, wrongly described, finding 4); T05A Review header `nowrap` (acceptable: it is a
column, the fields still wrap by group); T05B `LeaveRow.tsx` not reused (acceptable: it is the OT leave-request row);
`preventDefault` on the outside press (acceptable: I saw focus return to the day button or the field); the "saved" status out of view
after a foot save (acceptable as the documented known limit, docs/12:117; announced by `role=status`); a bare top-bar press closing
the drawer (acceptable: it is a press outside).

**Optional risk from DIAG1 (`useBlockSize.ts`):** a recorded risk, not needed now. The observer watches the content box while the
property is the border box, but the only bar change at a breakpoint is `min-height` 52 to 56px, which changes the content box under
`box-sizing: border-box`, and the bar's padding is constant; the readers are scroll padding and offsets.

**DIAG2 B (the Sign off dialog's late image shift):** acceptable as backlog. WCAG 2.2 AA has no layout-stability criterion and
docs/04 states none; the shift happens once while the dialog opens, with focus on its heading. Reserving the image box stays a cheap
optional hardening.

## Style system, breakpoints, accessibility

- Tokens: `--compact-edge`, `--period-step-gap`, `--period-current-room`, `--subbtn-h`, `--subbtn-hit-extra`, `--theme-seg-h`,
  `--select-arrow-w/-h/-inset`, `--send-*`, `--signoff-*`, the `--sig-*` set (scoped to `.review-signatures`) exist; the one new colour,
  `--worked-line`, is in the light set and in both dark sets with the same value. One `--transition` on every element, never `all`; reduced
  motion sets the durations to 0.01 ms; forced colours bring back the native select arrow. docs/04 "Visual standard" has stale lines
  (finding 4).
- Breakpoints: every media query is range syntax; `SHELL_QUERY` and `SHEET_QUERY` match the CSS. My own method reaches fractional
  widths in a browser: Edge with `--force-device-scale-factor=1.5` and no viewport emulation, resized through CDP, gives 767.333 CSS px
  (the window minimum stops at 485.33), and an about:blank frame of 479.333px or 767.333px at that scale gives a layout viewport of
  479.333 / 767.333 CSS px. At both, the old `max-width`/`min-width` pairs are both false (the round-4 hole) while each range rule falls on
  exactly one side (compact margins, week card overflow, page head, tab bar). No width without a layout.
- Round-4 rechecks: F-UX4A-1 fixed (0 layout changes in 3 s at 1335x1430, 1340x1400, 1344x1370 and four more sizes with a classic 15px
  scrollbar; beside from 1345px); F-UX4A-2 fixed (Escape on a sheet control with edits opens the question and it stays; Keep editing
  returns focus to the control); F-UX4A-3 fixed (Keep editing leaves focus on "Current period"); F-UX4A-4 fixed (docs/04:69 names the two
  unguarded routes, :110 the transparent hover of the quiet link buttons). None regressed.
- WCAG 2.2 AA: axe 0 violations in 108 scans (Timesheet, 600px narrow card, drawer and phone sheet, Partial leave dialog with a refusal,
  discard question, Review unsigned, signed and sent, Sign off dialog with its error, Send card with a field error, reason dialog with its
  error, Settings) in light, dark, manual dark and manual light, desktop and phone; axe "incomplete" items were checked by hand (finding 2;
  risk R4). Text contrast: minimum 4.59:1 light and 4.65:1 dark, none below. Keyboard: 8 walks (1280 and 900 floating, 1440 beside, 390
  phone sheet; light and dark), 1,440 stops, 0 wholly hidden, a focus indicator on every stop. Targets: below 768px and with a coarse
  pointer every control is 44px or a sub-button with its hit area. SC 2.5.3: "Back", "Open", "Send", "Sign off", "Current" and "Review"
  are contained in their names; "Change days" is not (finding 2). No page-level horizontal scroll at 320 to 1440 (Timesheet and Review).

## Test strength and the fix rounds' e2e changes

- 17 mutants (`61-mutants-summary.txt`): caught M1 (by the vitest text test only), M3-M12, M14-M17. Not caught: **M2**, the range ladder's
  end-day step disabled (`width < 7.3em` to `0.1em`): no browser test reaches a range box under 7.3em, so the last two ladder forms are
  proved only as text (risk R3).
- FIX2 (bar-size poll, same 0.05px tolerance, deterministic CSSOM test), FIX3 (`settledSelect`: no placeholder and six still frames; the
  sign-in form visible before filling), FIX5 (`showToday` poll with a focus event and a fresh server read; the signature images complete
  before the geometry is read; `connection: close` on the seed client) and FIX6 (`connection: close` on the health poll; vitest
  `maxWorkers: '50%'`): every wait is state-based, no fixed sleep, no timeout raised, no assertion loosened, no check removed (the date
  check moved into the poll), and each test still proves its behaviour.
- **Today across midnight (FIX5 A):** my mutant M13 keeps the old periods when the window-focus refresh brings a new date. At
  2026-11-04T07:59:20Z (LA 23:59:20, a date where the open period holds both days) with the FIX10 wrapper, `--repeat-each=3`,
  `--workers=6`: 4 failed, all `today.spec.ts:626` "the refreshed tab tags the new date" (Expected 2026-11-04, Received 2026-11-03); the 12
  `showToday` instances passed. The unmutated control at the same instant: 18 passed. So the suite catches M13, but through the existing
  crossing test; the new poll's date compare caught nothing here, because the crossing has to fall between the page load and the poll's
  first read.

## Findings

1. **F-UX5A-1, Medium - signed footer on a narrow Review page** (`src/client/ReviewScreen.tsx:242`, `src/client/components/ReviewDays.tsx:68-81`,
   `src/client/components/TimesheetSheet.tsx:453-469`, `src/client/styles.css:5714-5762` and `:5791-5794`).
   Reproduction: sign off a period (synthetic person with a saved image), reload `#/review/<payrollDate>`, set the window to 480, 390 or
   320px. Actual: `canSign` is true again (`justSigned === null`), so the employee line holds the signed mark and the "Sign correction"
   button; the line is about 160px, the content box 21.4px, the name wraps by two or three letters, the line is 232px tall, the button
   (left 69.2px) covers the "Signed" mark (right 91.8px) and the employee line is 25.16px narrower than the manager line
   (`obs-review.txt` lines 46-53; `a5-review-390-signed-reloaded-light-synthetic.png`); at 768px the content is 45.4px. Expected (owner
   B7/B9 and Addendum 3b, AGENTS UI section): the signed name, image and "Signed" stay readable and uncovered and the four lines stay
   aligned at every width. Bounded fix: keep the correction button out of the signature line (for example in the check card, or under the
   line) for a signed period, or let the action wrap below the content; add an e2e check of a signed, reloaded Review at 390 and 320px.
2. **F-UX5A-2, Low - SC 2.5.3 Label in Name for "Change days"** (`src/client/TimesheetScreen.tsx:687-703`, `src/client/styles.css:2777-2809`).
   Reproduction: 340 or 320px window (toolbar row under 20.8rem): the button shows "Change days" (also "Change / days"); its name is the
   `aria-label` "Change several days" (`obs-sheet.txt` lines 99 and 104; axe lists `label-content-name-mismatch` as incomplete). Expected:
   the name contains the visible text (WCAG 2.2 SC 2.5.3, Level A; failure F96); the plan's claim "it contains every visible form" holds
   for "Open" and "Send" but not here. Bounded fix: drop the `aria-label` and let the shown span be the name (the hidden form is
   `display: none`), or use a short form that is contained in the name; adjust the e2e that asserts the name at every width.
3. **F-UX5A-3, Low - a scroll closes the Day editor** (`src/client/TimesheetScreen.tsx:596-609`). Reproduction: (a) 1024x768 context with
   `hasTouch`, drawer open (floating), a touch swipe up that starts on the form header title: the page scrolls 0 to 606px and the drawer
   closes (`obs-editor-run1.txt` line 16); (b) classic scrollbars, 900x900, drawer open: a press-drag on a week card's own horizontal
   scrollbar scrolls the card and closes the drawer (`obs-classic.txt`). With unsaved edits the discard question interrupts the scroll.
   Expected: owner F-7 a and docs/04:69 speak of a press or click outside; docs/04 already excludes the window's scrollbar, and a scroll
   gesture or an element scrollbar is not a press on the page. Bounded fix: act on `click` (or on a pointer-up that did not move) for touch
   pointers, and ignore a press whose point lies outside the target element's client box (its own scrollbar); add the two cases to the
   U5-24 tests.
4. **F-UX5A-4, Low - documentation accuracy** (EN and VI): docs/04:103 / vi:104 says the paper is square and full-bleed on a phone (it has the
   12px corner and 8px edges since U5-22); docs/04:105 / vi:106 lists `--select-arrow-size` 7px, which no longer exists (now
   `--select-arrow-w/-h`); docs/04:111 / vi:112 says Save day fields has a 36px box on every device, while :71 and the build give the phone
   foot a 44px full-width button; docs/04:124 / vi:125 and docs/12:54 (EN and VI) quote "You sign as" and "Signed with your name only.",
   which the client no longer renders (the dialog shows "Signer ... (you)" and "your name only" with the Settings link); docs/04:49 / vi:50
   limits the "+1" wrap to "the narrowest phone cell", but it also happens on the 7-column sheet at 480 to 900px and more
   (`obs-sheet.txt` lines 68-69); docs/12:116 (EN and VI) says a browser run cannot set 479.33 / 767.33px, which my probe did. Stale
   style-sheet comments: `styles.css:154-156` (paper full-bleed on a phone), `:345` (wordmark from 1024px), `:2826` (grid from 768px).
   Bounded fix: correct those lines in both languages and the three comments.

## Risks and optional improvements (not proven defects)

- R1: `useBlockSize.ts` content box versus border box (recorded; harden with `{ box: 'border-box' }` the next time the file is touched).
- R2: the Sign off dialog's late image shift (reserve the image box).
- R3: test strength: the last two range-ladder forms have no browser check (M2); the fractional-width hole is caught only by the vitest
  text test, although a browser can now reach 479.33 / 767.33px (frame at 150%); the `showToday` poll did not catch M13.
- R4: `SignoffDialog.tsx:164` puts `aria-label` on a generic `div` (axe "aria-prohibited-attr", incomplete): the label is ignored.
- R5: the Review description and the dialog subtitle print an ASCII "->" where the period card and the mockup use "→"; the reason
  dialog writes the earlier copy's time as "2026-10-26 20:55" where other dates are MM/DD/YYYY.
- R6: `reviewLinkLabel` (`reviewModel.ts:220`) is unused outside its unit test.
- R7: `ReviewScreen.tsx:360` falls back to the payroll date as "Today" in the dialog when `/api/periods/current` fails.
- R8: the wordmark with a "Shared with me" switcher shows at 414-494px, hides at 495-665px and shows again from 666px (by the
  documented no-new-row rule).

## Required gates unrun or blocked

None of the mandatory checks was skipped. The Playwright harness picks its own free loopback ports (outside 49860-49889); the smoke
script was not required and not run. NAS and production items are outside area A.

## Disposition of previous findings

F-UX4A-1, F-UX4A-2, F-UX4A-3 and F-UX4A-4: fixed, none regressed by round 5 (see "Style system, breakpoints, accessibility").

## Software readiness, owner permission and pilot result

Area A is not accepted on f4049aa (FIX REQUIRED). This review says nothing about owner permission or a pilot result; no production
sending or deployment was touched (local capture only).

## One next action

A coordinator fix task for findings 1-4 (client and docs only), then a regate and a recheck of area A on the new digest.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX5-AUDIT-A attempt 1; reviewer agent `aaddbc8e28007ef07` (board);
  authors of the snapshot are the WP5-UX4 and WP5-UX5 planners, workers, fixers and committers listed on the board (for example T03
  `a1e70b03fd49b67f6`, T04 `ae9b4b07ad11134d2`, T05A `a5b0f9fde2966c43a`, T05B `a85bee422bff60911`, FIX5 `a292049dae7aa2fac`, FIX6
  `acb61957f41e06689`).
- Fresh context; I wrote none of the reviewed changes. I changed nothing outside this review pair, the brief's Results and the evidence
  folder.
- Digest before and after: equal (above); gate evidence for this snapshot: WP5-UX5-REGATE4 PASS.
- New report path: `handoff/delivery/WP5_UX5_REVIEW_A.md` (+ `.vi.md`); earlier reviews are untouched.
- Finding dispositions and the next coordinator task: open; fix round for F-UX5A-1..4, then recheck.
