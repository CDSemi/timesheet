# WP5 UI change round 5, area A recheck on a5533b5 (WP5-UX5-RECHECK-A)

[Tiếng Việt](WP5_UX5_RECHECK_A.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 5, area A (visual, shell, Timesheet,
  Day editor, Review UI, accessibility); task WP5-UX5-RECHECK-A, attempt 1, 2026-10-27 from 16:18Z to about 17:30Z. It rechecks
  WP5-UX5-AUDIT-A (FIX REQUIRED on f4049aa, `WP5_UX5_REVIEW_A.md`, findings F-UX5A-1..4, risks R1-R8) after FIX8, FIX9 and FIX10.
  Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from inside).
  The strongest author model on the board for the snapshot is `claude-opus-5-5` (WP5-UX4-PLAN, WP5-UX4-T04, WP5-UX5-PLAN,
  WP5-UX5-T01B); FIX8, FIX9, FIX10 and their planners and committers are `claude-sonnet-5-5`, so the reviewer is not weaker. I authored no
  WP5-UX4 or WP5-UX5 task. WP5-UX5-RECHECK-B ran at the same time on the same machine.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5` (WP5-UX5-FIX10-FREEZE, pushed; WP5-UX5-REGATE6 PASS on it). HEAD = origin/main = that commit
  before and after; no status line outside `handoff/` before or after. Digest
  `4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f`, 882 files, `handoff/` excluded, equal in three forms at 16:18:19Z and
  at 17:24:40Z: a clean `git archive` export hashed with `git hash-object --no-filters`, the `git ls-tree` form (sorted list byte-identical
  to the export's) and `npm run digest`. Source complete: `npm ci` exit 0 in three exports (`export` for the mandatory checks,
  `export-probe` for my probes, `export-mut` for my mutants).
- **Decision: FIX REQUIRED.** F-UX5A-1, F-UX5A-2, F-UX5A-3 and F-UX5A-4 are fixed (each reproduced as fixed by my own measurements
  below). One new Low finding, in FIX9's change: **F-UX5A2-1**, the focus indicator of a read-only Review week card is painted on the top
  and left edges only (the day columns cover it on the right and bottom, and on the left once the card is scrolled), it is not the shared
  focus ring, and document 04 (EN and VI) and two code comments say the opposite; no test checks the indicator. Everything else in scope
  passed. Mandatory checks: typecheck, lint, `npm test` (101 files, 2384 tests), build (no chunk advisory) and AC-13 exit 0; the real-clock
  FULL e2e 871 passed, 131 skipped, 0 failed (desktop 466/35, mobile 405/96), no rerun.

## Scope actually inspected and executed

1. Read as claims: the brief; AGENTS.md from disk (UI section "Frontend and UI/UX standards"); `WP5_UX5_REVIEW_A.md`; the board's
   `owner_decisions` of 2026-10-21 and 2026-10-22 (round-5 request, F-1..F-10, mockup adjustments 2 with B7/B9, adjustment 3 and its
   correction "hai hàng chữ ký ... thụt vào giống như bản vẽ b11-pdf", "1 a, 2 a"); the task records PLAN-FIX7A, FIX8, FIX9, DIAG4, FIX10,
   REGATE5 and REGATE6 with their evidence; the source and test diffs `f4049aa..94accda` (FIX7-FIX9) and `94accda..a5533b5` (FIX10);
   docs/04 and docs/12, EN and VI.
2. Mandatory checks in the clean export, one after another (core) and alone (the FULL e2e; RECHECK-B ran its own work at the same time).
3. Own probes in `export-probe` (task-local `zz-ra-*.spec.ts` through the repository harness, Edge headless, its port helper pointed at
   49862-49889): the signed and reloaded Review at nine widths in both themes and both projects, with a 1px threshold sweep and a classic
   scrollbar; the "Change days" name at every width 320-1440 through Chromium's accessibility tree; touch swipes, taps, a long press, pen and
   mouse presses, classic and overlay scrollbar presses with the Day editor open; the FIX9 week cards (1px sweep 470-1110 with and without
   a classic scrollbar, Tab, name, arrows, `revealFocused`, resize with focus, the painted ring per edge in four theme states); axe-core
   4.14.0 (loaded from the task folder; no dependency added) and keyboard walks; page sideways scroll at every width 320-1440; the FIX10 PNG
   decoder against the browser's own decoder; the replaced documentation lines against the build.
4. Seventeen mutants of my own in `export-mut`, each applied alone, client rebuilt, the named tests run, the file restored and compared
   byte for byte with the clean export, the client rebuilt.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX5-RECHECK-A/` plus 9 `-synthetic.png` screenshots; probe and
script sources are kept as `90-src-*.txt` and `91-*.txt`; `00-README.txt` is the index.

| Command | Result / exit | Evidence |
|---|---|---|
| HEAD, status outside `handoff/`, digest in three forms, first and last | HEAD a5533b5 = origin/main; no line; `41477510…69f`, 882 files, at 16:18:19Z and 17:24:40Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (three exports) | 0, 0, 0 | `02-ci-*.txt` |
| `npm run typecheck` / `npm run lint` | 0 / 0, no deprecation line | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 files, 2384 tests (48.3 s) | `03-npmtest.txt` |
| `npm run build` | 0; `index-BNsJjgBK.js` 491.83 kB (the FIX10 and REGATE6 asset names), `ReviewScreen` 25.75 kB, no chunk-size advisory | `03-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `03-ac13.txt` |
| FULL e2e, real clock, both projects, 2 workers (16:21:18-16:50:07Z) | exit 0: 871 passed, 131 skipped, 0 failed; desktop 466/35/0, mobile 405/96/0; no rerun | `06-e2e-full-run1.txt`, `06-e2e-counts.txt` |
| Signed footer probe (F-UX5A-1) | see below | `40-obs-review.txt`, `40-obs-review-mobile.txt`, `40-obs-classic.txt` |
| Name probe (F-UX5A-2) | see below | `40-obs-sheet.txt` |
| Touch, pen, scrollbar probes (F-UX5A-3) | see below | `40-obs-sheet.txt`, `40-obs-tap2.txt`, `40-obs-classic.txt`, `40-obs-overlay.txt` |
| FIX9 probes | see below | `40-obs-review.txt`, `40-obs-ring.txt`, `40-obs-classic.txt` |
| axe-core 4.14.0 | 104 scans, 0 violations | `40-obs-axe.txt`, `40-sum-axe.txt`, `40-obs-walk2.txt` |
| Keyboard walks | 12 walks, 1,558 stops; a focus indicator on every stop; 0 wholly hidden once settled | `40-sum-axe.txt`, `40-obs-walk2.txt` |
| FIX10 decoder probes | 0 of 65,600 pixels differ from the browser's decoder | `40-obs-surface3.txt`, `40-obs-surface.txt` |
| Mutants | 17 own: 11 caught; MA1, MA5, MA8, MA9 not caught; MF3 equivalent here, MF3b within tolerance | `50-mut-*.txt`, `50-mut-summary.txt` |
| `npm audit --omit=dev` (information for area B) | 0 vulnerabilities; the whole tree reports 6 dev-only advisories | `07-npm-audit-*.txt` |

## Disposition of the AUDIT-A findings

1. **F-UX5A-1 (Medium, signed footer on a narrow Review): fixed.** Signed in the UI, reloaded, at 1440, 1200, 1100, 900, 768, 600, 480,
   390 and 320px, light and dark, desktop and mobile projects (36 measurements, `40-obs-review*.txt`): no overlap of "Sign correction" with
   the image, the name or the "Signed" mark at any width; the button ends 8.00px inside the end of its line and stands on it (its bottom
   5px above the line's outer edge: the 4px padding and the 1px rule) at every width; the four lines align by row (0.00px) and by column (x and width
   0.00px); the fractions at 768px and wider are 0.0352 / 0.2741 / 0.4445 / 0.1370 / 0.1092, the B11 and PDF values; the image keeps
   160x48px from 768px and 135-138px below; the name is one line (a long name without an image wraps by word into 2-3 lines and stays inside
   the line); no page scrolls sideways. The button stays beside the content from 1150px and drops under it at 1149px and below (1164px with a
   classic 15px scrollbar), which is the owner-informed design: the owner's rules (Addendum 2: the button at the end of its line, inset a
   little, lines aligned; B7/B9: two rows; Addendum 3b: the B11 insets) all hold, and the "signed, opened again" state was never in the
   mockup. Below 1150px the signed content stands one button-height above the line instead of on it (`ra-sig-*-synthetic.png`); I judge this
   acceptable and leave it to the owner's informed review. The PDF geometry is unchanged: `src/server/pdf/layout.ts` and the signature
   drawing are untouched (`20-pdf-diffstat.txt`: only `drawCategory` changed, by FIX7, area B), the `--sig-*` fractions are unchanged and the
   review.spec PDF-fraction tests pass in my FULL run.
2. **F-UX5A-2 (Low, SC 2.5.3): fixed.** At every window width from 320 to 1440px the button's accessible name in Chromium's accessibility
   tree equals its visible words: "Change days" at 320-343px, "Change several days" at 344-1440px; pressed (batch mode) at 320px the name
   stays "Change days" with `aria-pressed="true"` (`40-obs-sheet.txt`). The name never doubles (the hidden form is `display: none`). The
   short form is real text, so axe finds no `button-name`; axe's remaining `label-content-name-mismatch` (incomplete) items are only the "<"
   and ">" period-step glyph buttons, which are symbols, not text labels.
3. **F-UX5A-3 (Low, a scroll closes the Day editor): fixed in Chromium.** On a 1024x768 touch screen with the floating drawer and unsaved
   edits: swipes up, down, sideways and diagonally from plain page are cancelled by the browser (`pointerdown`, `pointercancel`) and the
   drawer stays open with no question (`40-obs-sheet.txt`); a tap asks, Keep editing returns focus to the field, a tap then Discard closes
   with focus on the day button; a tap after a swipe closes; a tap on another day column switches the day; a long press without movement
   acts as a press; a control tapped right after a closing tap acts at once and the one-shot `touchend` listener is gone
   (`40-obs-tap2.txt`, read through `DOMDebugger.getEventListeners`). Pen and mouse close on `pointerdown` as before, with focus on the day
   button. With a classic 15px scrollbar at 900 and 800px, presses on a week card's scrollbar thumb, track and arrow buttons and on the
   window scrollbar leave the drawer open; plain page closes it (`40-obs-classic.txt`). The U5-23..U5-26 tests, the new touch test and the
   scrollbar test pass in my FULL run (`06-e2e-area-a-lines.txt`), and the phone backdrop test passes on the mobile project. Residual risk
   (only Chromium emulation exists here): see R-A2-1 and R-A2-2.
4. **F-UX5A-4 (Low, documentation): fixed.** Each replaced line checked against the build, EN and VI equal in content: docs/04:10 (the
   button drops under the content where the line is under about 290px, a window under about 1150px: measured 1149/1150px); :49 / vi:50 (a
   "22:00-06:00+1" range: one line at 1100px and wider, tight at 930px, two lines in the 107px cells at 900-480px and in the 80px phone cell
   at 320px, one line at 390px; `40-obs-sheet.txt`); :63 (named by the shown words); :69 (scrollbar and touch rules, as measured above);
   :103 (12px corner at every width, 8px edges below 480px); :105 (`--select-arrow-w` 12px, `-h` 6px, `-inset` 12px, `--select-pad-end`
   34px in `styles.css:171-174`); :111 (36px in the drawer form, 44px full-width in the phone foot, measured); :124 and docs/12:54 (FIX7's
   text: "Signer" with "(you)", "your name only" with the Settings link, "your saved image and your name", as `SignoffDialog.tsx:136-160`
   and `reviewModel.ts:514-515` render); docs/12:116 (the suite proves fractional widths on the style sheet; the audit probe is described as
   such). The style-sheet comments at `:153-158`, `:344-347`, `:2704`, `:2821-2828`, `:3854-3858` and `:4090-4097` now match the build. The
   one new inaccurate sentence (FIX9's, docs/04:50 / vi:51) is finding F-UX5A2-1.

## FIX9: read-only Review week cards

- **Stop exactly while it scrolls:** 1px sweep 470-1110px (`40-obs-review.txt`): `tabindex="0"` on both cards at 480-913px, where they
  overflow (`overflow-x: auto`, scroll width 850 > client width); no tabindex at 914-929px (scroller, but the grid fits) and from 930px
  (`overflow: visible`); 0 mismatches. With a classic scrollbar: stops at 480-928px, none at 929px and above, 0 mismatches
  (`40-obs-classic.txt`). The Timesheet's editable cards never get a tabindex at 900, 768, 600 and 480px; at 1280 and 1440px a 60-stop walk
  of the Review meets no card.
- **Name and keys:** Chromium names the card region "Week 1, 10/12/2026 to 10/18/2026", focusable; Tab reaches it; ArrowRight scrolls it
  by 40px; Home and End do not scroll it sideways (the browser's vertical keys; docs/04 promises the arrow keys only).
- **`revealFocused`:** a card scrolled to 60px keeps 60px when Tab focuses it (no jump) at 768, 600 and 480px.
- **Resize with focus:** focused at 900px, widened to 1100px: the tabindex goes, focus falls to `body`, and the next Tab reaches "Sign off",
  the control after the cards (risk R-A2-3).
- **The ring:** the card's own rule paints a 2px inset `outline` in `--accent` (contrast 6.09:1 on the paper and 4.80:1 on the WEEK bar in
  light, 6.79:1 and 5.00:1 in dark, the same in both manual overrides). But it is painted on two sides only: the seven `.sheet-day` columns
  are `position: relative`, so they paint over their parent's outline. Pixel coverage of the 2px band (`40-obs-ring.txt`, every pixel of
  each edge): top 100%; left 100% at the start and 50% once scrolled to the end at 768px; right 8.5% (the WEEK bar part), 100% only when
  scrolled to the end; bottom 0-13%; the same in both themes.
  The rule's own `box-shadow: var(--elev-2)` never applies (`.review-preview .sheet-week { box-shadow: none }` comes later with the same
  specificity). This is finding F-UX5A2-1.

## Regressions in area A, accessibility and layout

- axe-core 4.14.0, WCAG 2.0-2.2 A/AA tags, light and dark: the Timesheet (1440, 900, 768, 480, 390, 320; worked hours on at 1440 and 390;
  the Day editor open at 1280, 900 and 390), the Review unsigned, the Sign off dialog, the Review signed and the Review signed and reloaded
  at the six widths on the desktop project, and at 480, 390 and 320px on the mobile project: 104 scans, 0 violations
  (`40-sum-axe.txt`).
- Keyboard walks, light and dark: Timesheet 1280 (157 stops), Timesheet 1280 with the floating drawer (157), Review 900 (76), phone 390
  Timesheet (157) and Review (75), plus the drawer walk again with two frames after each Tab (157). A focus indicator on every stop
  (outline or box-shadow ring computed); 0 stops wholly hidden (SC 2.4.11) in every walk once settled (`40-obs-walk2.txt`; read at once,
  before the drawer re-docks, up to 24 drawer-walk stops look covered, which is the documented re-dock, not a fault).
- No page scrolls sideways at any width 320-1440px: the Timesheet (worked hours off and on) and the signed and reloaded Review (light and
  dark), and the Review with a classic scrollbar.
- Nothing else in the FIX8 and FIX9 diffs changes a layout outside the signature rows and the cards; the arrow "→" in the Review
  description and the Sign off dialog subtitle keeps "to" for screen readers; the removed `aria-label` on the dialog preview `div` leaves the
  inner "Signatures" group name.

## FIX10 test changes (tests only; dist unchanged)

- **Logo (four contexts, split shared-view test):** each extra window is a context of the same browser with the page's storage state,
  locale, zone, colour scheme and reduced motion; the rows are put back in width order and a new check proves every width 320-1440 was
  measured once. The shared-view sweep is its own test with the same assertions and theme loop. My mutant MF1 (the shared-view rule from
  about 512px instead of 492px) fails the split test ("493px: the wordmark is hidden but fits"); MF1b (each window skips its last width)
  fails the new completeness check. Durations: 59.5-78 s per sweep test in my FULL run beside RECHECK-B's work; 78-84 s in REGATE6's
  6-worker sweeps; up to 204 s of 240 s in REGATE6's 10-worker logo-only stress (40 sweeping windows at once). For the gate's sweep at 6
  workers the margin (about 35% of the limit used) is acceptable; the stress figure shows the test is load-sensitive, so a gate run beside
  another heavy run could use most of the limit (risk R-A2-5).
- **The decoded screenshot surface (`paintedSurface`):** Playwright's viewport screenshots here are 8-bit RGB (colour type 2), not
  interlaced, in 28 IDAT chunks, with filter types 1, 2, 4 and (dark) 3 (`40-obs-surface.txt`). The decoder equals the browser's own PNG
  decoder on 32,800 pixels per theme, 0 differences (`40-obs-surface3.txt`). Against per-pixel screenshots 1 and 2 of 690 pixels differ
  by one unit in one channel (two separate captures), inside the test's tolerance of 3. Palette, 16-bit and interlaced PNGs fail loudly.
  My mutants MF3 (Paeth ties prefer "up") and MF3b (Average rounds up) do not fail the frame test: MF3 changes no decoded pixel of these
  screenshots and MF3b changes 801 of 32,800 dark-theme pixels by one unit, inside the test's tolerance; the shipped decoder is exact. MF4
  (the editing frame on the left edge only) fails it ("light: right frame over d-day"). The test reads the same pixels as before, one
  surface per unchanged page state and a fresh one after the scroll to the neighbour.
- **The batched contrast evaluate:** the same leaf selector, the same visibility rule (`visibility` visible and a non-empty box, as
  `isVisible`), the same `innerText` test and the same colour maths in Node. MF5 (a mid-grey fill on the session dialog head, an ancestor
  of the title text) fails "U4-12, U4-13 at 1440" ("text contrast of the session dialog (light)"), so the ancestors' fills are read.
- **admin-status:** the PDF wait is state-based (`expect.poll`, 1 s interval, 60 s cap) before `sendSigned`, every later assertion is
  unchanged; MF2 ("PDF ready" relabelled) fails "the admin sees pipeline states".
- So the five changed files prove what the old tests proved: no assertion is looser, no width, theme or case is dropped, and the one
  timeout added is the PDF poll's cap.

## Test strength: my own mutants

Each mutant was applied alone in `export-mut` (definitions in `91-mkmutants.mjs.txt`), the client rebuilt where the mutant is in `src/`,
the named tests run on the desktop project (and on both where the test is a phone test), then the file restored byte-identical to the
clean export and the client rebuilt (`50-mut-*.txt`, `50-mut-summary.txt`). None of them repeats a mutant of DIAG4, FIX8, FIX9, REGATE5 or
REGATE6.

| Mutant | Change | Result |
|---|---|---|
| MA1 | FIX8: `.rsig-content:empty` displayed again | not caught (4 review tests pass); the unsigned employee and date lines grow 52 to 57px below 768px, aligned (`40-obs-empty.txt`) |
| MA2 | FIX8: `--sig-content-min` 10rem to 3rem | caught: "the saved image keeps its width at 768px" (45.4 < 100) |
| MA3 | the wrapped button loses `margin-inline-start: auto` | caught: "Sign off sits 8px inside the end of its line" at 1440 and 768px (two tests) |
| MA4 | FIX8: `onOwnScrollbar` without the "the target scrolls" condition | caught: U5-24 at 1280 and 1440px, "a press on the legend / the period card text closes the drawer" |
| MA5 | FIX8: the `touchend` cancel listener without `once` | not caught (12 day-editor tests pass); with it every later tap is cancelled: the switch and "Next period" do not act (`40-obs-MA5-impact.txt`) |
| MA6 | FIX8: the cancel listener does not `preventDefault` | caught: "the mouse events after the tap do not move the focus" |
| MA7 | FIX9: `scrollWidth >= clientWidth` | caught: "1100px: week 1 fits, so it takes no tab stop" |
| MA8 | FIX9: the card's outline transparent | not caught (review, focus-ring and keyboard-access specs: 45 pass) |
| MA9 | FIX9: `revealFocused` acts on the card itself | not caught (2 pass); effect a jump of the scroll padding on focus |
| MA10 | FIX8: the short form `aria-hidden` again | caught: four tests, both projects ("288px: the name is the visible words", the 320px name lookups) |
| MF1 | FIX10 logo: the shared-view rule from about 512px | caught by the split shared-view test: "493px: the wordmark is hidden but fits" |
| MF1b | FIX10 logo: each window skips its last width | caught by the new check "every width from 320 to 1440px was measured once, in order" |
| MF2 | FIX10 admin-status: "PDF ready" relabelled | caught: "the admin sees pipeline states" (`toHaveText`) |
| MF3 | FIX10 contrast.ts: Paeth ties prefer "up" | not caught; equivalent on these screenshots (0 of 65,600 pixels change, `40-obs-MF3-impact.txt`) |
| MF3b | FIX10 contrast.ts: Average rounds up | not caught; 801 of 32,800 dark pixels change by one unit, inside the tests' tolerance of 3 (`40-obs-MF3b-impact.txt`) |
| MF4 | FIX10 timesheet.spec: the editing frame on the left edge only | caught: "light: right frame over d-day" |
| MF5 | FIX10 day-editor.spec: a mid-grey fill on the session dialog head | caught: "text contrast of the session dialog (light)" (the ancestors' fills are read) |

Eleven of seventeen are caught. MA8 belongs to F-UX5A2-1; MA5 and MA9 and MA1 are recorded as R-A2-4; MF3 and MF3b show the decoder has
no self-check in the suite, while my probe shows the shipped decoder is exact.

## Recorded risks R1-R8 of AUDIT-A and the backlog

None has become a defect. R1 (`useBlockSize.ts` observes the content box): unchanged, no padding- or border-only change of the bar exists.
R2 (the Sign off dialog's late image shift): unchanged, backlog. R3: the ladder's last two forms now have a browser test (REGATE6's M2 and
my reading); fractional widths stay proved on the style-sheet text (docs/12:116 says so). R4: fixed (no `aria-label` on the generic
`div`). R5: the arrow is "→"; the reason dialog's "2026-10-26 20:55" is the app-wide `instantText` format, consistent, left recorded. R6
(`reviewLinkLabel` unused outside its test), R7 (payroll date as "Today" when `/api/periods/current` fails) and R8 (wordmark shown, hidden,
shown with a switcher) unchanged. `deliveryModel.ts:251` "A delivery of this revision is in progress." is still accurate: it shows only
when the current revision's own send runs or waits; a send of another revision of the period is refused by the server with "A delivery of
this period is already in progress." (FIX7's text), so the History button can look available and then be refused (an area-B nuance, noted
for RECHECK-B, not a defect of area A).

## Findings

1. **F-UX5A2-1, Low - the read-only week card's focus indicator is covered on two sides, and the documents say it is the shared ring**
   (`src/client/styles.css:2962-2967`, `src/client/components/TimesheetSheet.tsx:154-158` and `:184`, docs/04:50 / vi:51).
   Reproduction: open the Review of a period at 768 or 900px (any theme), press Tab until "Week 1, ..." has focus. Actual: a 2px accent line
   on the top edge and the left edge only; the seven `.sheet-day` columns (`position: relative`) paint over the outline on the right and
   bottom edges (coverage right 8.5% unless scrolled to the end, bottom 0-13%) and, once the card is scrolled past its label column, on
   the left edge too
   (`40-obs-ring.txt`, `ra-fix9-*-synthetic.png`). The rule's `box-shadow: var(--elev-2)` never applies. Expected: AGENTS.md UI section item
   3 requires the shared focus ring for every focus-visible state and docs/04 says this card "shows the shared focus ring"; the CSS comment
   says "an inset outline the WEEK bar and cells cannot cover", and the hook comment says it "takes the shared focus ring". WCAG 2.2 AA
   itself is met (SC 2.4.7: the top line stays visible at 4.80:1 or more; SC 2.4.13 is AAA), so the defect is the standard and the
   documentation. Bounded fix: paint the indicator above the positioned day columns (for example a non-interactive pseudo-element over the
   card's visible box carrying `--focus-ring-inset`, or the ring on a non-scrolling wrapper), drop the dead `box-shadow`, correct the two
   comments and docs/04:50 / vi:51 to what is drawn, and add an e2e check that the indicator is painted on all four edges at 768px in both
   themes (my mutant MA8, an invisible outline, survives today's suite).

## Risks and optional improvements (not proven defects)

- R-A2-1 (real devices): touch handling is proved only in Chromium emulation. Chromium sends `pointerup` before `touchend`, so the one-shot
  `touchend` listener registered on `pointerup` cancels the closing tap's own touch-end and is then gone (checked). If a browser (for example
  iOS WebKit) delivered `touchend` before `pointerup`, the listener would wait for the next touch and cancel that tap's click, so the next
  control would need a second tap; and the suite would not notice (my mutant MA5, a listener that is never removed, survives). Check on a
  real iPad and Android tablet in the pilot, or register the cancel on `pointerdown` with a bound lifetime.
- R-A2-2 (overlay scrollbars): `onOwnScrollbar` relies on the client box, which an overlay scrollbar (macOS, some touch laptops) lies
  inside. Chromium's overlay-scrollbar feature in headless Edge did not give me a pressable scrollbar, so the case is unverified.
- R-A2-3: widening the window while a week card has focus removes its tabindex and drops focus to `body`; the next Tab continues after the
  cards. Acceptable, recorded.
- R-A2-4 (test strength): the suite does not catch MA1 (the unsigned line grows 52 to 57px below 768px without `.rsig-content:empty`), MA5
  (see R-A2-1), MA8 (see F-UX5A2-1) or MA9 (focus on a scrolled card would jump by the scroll padding).
- R-A2-5: the logo sweep tests are frame-bound and load-sensitive (above); keep the gate's sweep isolated.
- Information for area B: `npm audit --omit=dev` reports 0 vulnerabilities; the whole tree reports 6 dev-only advisories (vite 8.3.1,
  source-map-js, @vitest/mocker, the test-only nodemailer under smtp-server).

## Required gates unrun or blocked

None of the mandatory checks was skipped. The repository harness picks its own free loopback ports for the mandatory FULL run in the clean
export (I did not change the code under test); my probes and mutants used 49862-49889 through a probe-copy port helper. NAS and production
items are outside area A. One probe of mine misbehaved: `zz-ra-surface2.spec.ts` compared every pixel of the viewport through
`paintedSurface().at()`, one Playwright expect step per pixel, and its worker stayed busy in that synchronous loop past its own timeout
(about 3 GB, in my scratch folder only); I replaced it by the sampled `zz-ra-surface3.spec.ts`. I may not kill processes by PID, so if it is
still running at hand-back, the coordinator stops it through its background task (my report names the task); it touches nothing in the
repository and no result here depends on it.

## Disposition of previous findings

F-UX5A-1, F-UX5A-2, F-UX5A-3 and F-UX5A-4: fixed (above). R1-R8: as above. The round-4 findings F-UX4A-1..4 stay fixed (the classic
scrollbar, Escape, focus and documentation tests pass in my FULL run).

## Software readiness, owner permission and pilot result

Area A is not accepted on a5533b5 (FIX REQUIRED, one Low finding). This review says nothing about owner permission or a pilot result; no
production sending or deployment was touched (local capture only).

## One next action

A coordinator fix task for F-UX5A2-1 (one CSS rule or pseudo-element, two comments, docs/04 EN and VI, one e2e check), then a scoped regate
and a recheck of area A on the new digest.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX5-RECHECK-A attempt 1; reviewer agent `af318528ad22bcca0` (board); the
  authors of the reviewed changes include PLAN-FIX7A `a456a2ba415c54275`, FIX8 `a4349a3f47d95bc39`, FIX9 `a61a88f6109035605`, DIAG4
  `a6bfd56e473a84c2a`, FIX10 `a86722480f1aa3aee` and the FIX9 and FIX10 committers `ae47074d02a6381cd` and `ab2c334d3cecf95ca`.
- Fresh context; I wrote none of the reviewed changes. I changed nothing outside this review pair, the brief's Results and the evidence
  folder.
- Digest before and after: equal (above); gate evidence for this snapshot: WP5-UX5-REGATE6 PASS.
- New report path: `handoff/delivery/WP5_UX5_RECHECK_A.md` (+ `.vi.md`); `WP5_UX5_REVIEW_A.md` and earlier reviews are untouched.
- Finding dispositions and the next coordinator task: F-UX5A-1..4 closed; F-UX5A2-1 open; fix, regate, recheck.
