# WP5 UI change round 5, area A recheck on be2afa2 (WP5-UX5-RECHECK-A2)

[Tiếng Việt](WP5_UX5_RECHECK_A2.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 5, area A (visual, shell, Timesheet,
  Day editor, Review UI, accessibility, and the shared e2e fixtures); task WP5-UX5-RECHECK-A2, attempt 1, 2026-10-28 from 20:49Z to
  about 21:50Z. It rechecks WP5-UX5-RECHECK-A (FIX REQUIRED on a5533b5, `WP5_UX5_RECHECK_A.md`: finding F-UX5A2-1, risks R-A2-1..5)
  after FIX11 to FIX15. Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not
  observable from inside). The strongest author model on the board for this snapshot is `claude-opus-5-5` (WP5-UX5-DIAG7 and the earlier
  UX4 and UX5 planners); FIX11 to FIX15, DIAG5, DIAG6, DIAG8, DIAG9, REGATE7 to REGATE10 and their committers are `claude-sonnet-5-5`, so
  the reviewer is not weaker. I authored no WP5-UX4 or WP5-UX5 task. WP5-UX5-RECHECK-B2 ran at the same time on the same machine.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `reviewed_commit`
  `be2afa2e3c43514581ed62fd145c15eeef13b534` (WP5-UX5-FIX15-FREEZE, pushed; WP5-UX5-REGATE10 PASS with its Addendum 1). HEAD = origin/main =
  that commit before and after; no status line outside `handoff/` before or after. Digest
  `ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f`, 882 files, `handoff/` excluded, equal in three forms at 20:49:34Z
  and at 21:45:28Z: a clean `git archive` export hashed with `git hash-object --no-filters`, the `git ls-tree` form (the sorted list is
  byte-identical to the export's) and `npm run digest`. Source complete: `npm ci` exit 0 in three exports (`export` for the mandatory
  checks, `export-probe` for my probes, `export-mut` for my mutants); the three builds are identical (250 files, entry `index-qNP6kTPW.js`).
- **Decision: PASS.** F-UX5A2-1 is fixed: the read-only week card's ring is painted on all four edges in every theme state, at every
  width where the card overflows and at every scroll position, and the documents and comments say what the build draws. No new finding.
  The two product changes (`DayFieldsForm.tsx`'s layout effect and the cross-tab theme follower) hold under my probes on both projects;
  the e2e helper changes prove what the old tests proved, with no loosened assertion and no dropped case; the midnight fence is a
  side-effect-free hold. Mandatory checks: typecheck, lint, `npm test` (101 files, 2,389 tests), build (no chunk advisory) and AC-13 exit 0;
  the real-clock FULL e2e 876 passed, 132 skipped, 0 failed (desktop 469/35, mobile 407/97); the seven-file run at 2026-10-27T06:58:30Z
  384 passed, 84 skipped, 0 failed (desktop 219/15, mobile 165/69; the desktop crossing test 58.6 s); no rerun. Test-strength gaps and the
  fence's limits are recorded as risks R-A3-1..3.

## Scope actually inspected and executed

1. Read as claims: the brief; AGENTS.md from disk (UI section "Frontend and UI/UX standards"); `WP5_UX5_RECHECK_A.md`; the task records
   FIX11, REGATE7, DIAG5, FIX12, DIAG6, FIX13, REGATE8, DIAG7, DIAG8, FIX14, REGATE9, DIAG9 (with Addendum 1), FIX15 and REGATE10 (with
   Addendum 1) and the evidence they cite; the board's author models; the source and test diff `a5533b5..be2afa2` outside `handoff/`
   (27 files; area A: `App.tsx`, `DayFieldsForm.tsx`, `ThemeToggle.tsx`, `TimesheetSheet.tsx`, `styles.css`, the nine e2e files and
   the new boundary integration test); docs/04 and docs/12, EN and VI; the accepted UX2 and UX3 records the changes restore or keep.
2. Mandatory checks in the clean export, one after another; the real-clock FULL e2e and the seven-file run alone of my own work
   (RECHECK-B2 ran its work at the same time). The brief names the clock wrapper folder `WP-UX-FIX10`; the file is
   `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt`, byte-equal to REGATE10's copy, used unchanged.
3. Own probes in `export-probe` (task-local `zz-rc-*.spec.ts` through the repository harness, Edge headless, its port helper pointed at
   51282-51309): the week-card ring per pixel, mouse focus, forced colours and a resize with focus; same-task edits in the Day editor;
   the cross-tab theme; axe-core 4.14.0 (packed into the task folder, no dependency added); keyboard walks; sideways scroll at every width;
   the midnight fence; the two axe `target-size` reports.
4. Sixteen mutants of my own in 18 runs, plus 3 controls, in `export-mut` (definitions `53-mutant-*.json.txt`), each applied alone, the
   client rebuilt where the mutant is in `src/`, the named tests run, the file restored and compared byte for byte, the client rebuilt.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX5-RECHECK-A2/` plus 4 `-synthetic.png` pictures; probe and script
sources are kept as `90-src-*.txt` and `91-*.txt`; my rule slips are `99-slips.txt`.

| Command | Result / exit | Evidence |
|---|---|---|
| HEAD, status outside `handoff/`, digest in three forms, first and last | HEAD be2afa2 = origin/main; no line; `ff73565b…686f`, 882 files, at 20:49:34Z and 21:45:28Z | `00-*`, `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (three exports), builds compared | 0, 0, 0; the three `dist/` trees identical (250 files, `index-qNP6kTPW.js`), also after the mutants | `02-*` |
| `npm run typecheck` / `npm run lint` | 0 / 0, no deprecation line | `03-typecheck.txt`, `03-lint.txt` |
| `npm test` | 0: 101 files, 2,389 tests (51 s) | `03-npmtest.txt` |
| `npm run build` | 0; `index-qNP6kTPW.js` 492.09 kB, no chunk-size advisory | `03-build.txt` |
| AC-13 `vitest run tests/integration/ac13-two-week.test.ts` | 0, 1/1 | `03-ac13.txt` |
| FULL e2e, real clock, both projects, 2 workers (20:52:43-21:13:31Z) | exit 0: 876 passed, 132 skipped, 0 failed; desktop 469/35/0, mobile 407/97/0; no rerun | `06-e2e-full-run1.txt`, `06-e2e-counts.txt` |
| Seven-file run at 2026-10-27T06:58:30Z, FIX10 wrapper, 6 workers (21:13:38-21:21:46Z) | exit 0: 384 passed, 84 skipped, 0 failed; desktop 219/15/0, mobile 165/69/0; desktop crossing test 58.6 s; no rerun | `08-seven-1026.txt`, `08-seven-counts.txt` |
| Ring probe (F-UX5A2-1) | 96 states, all four edges 100%, gap 100%, unfocused 0%, no scroll move | `40-obs-ring.txt`, `42-sum-ring.txt` |
| Day editor probe (FIX13) | every same-task, save, discard and revert case as expected, both projects | `40-obs-dirty.txt` |
| Theme probe (FIX14) | sign-in page, clear, other key, menu open, tab behind, blocked storage as expected, both projects | `40-obs-theme.txt` |
| axe-core 4.14.0 | 90 scans; only the accepted UX3 menu item at 1440px and a scroll-position artefact | `42-sum-axe-v2.txt`, `40-obs-axe-*.txt`, `40-obs-target.txt` |
| Keyboard walks | 14 walks; a focus indicator on every stop; 0 wholly hidden | `40-obs-walk.txt` |
| Sideways scroll 320-1440px | 0 widths overflow (the Timesheet, and the signed and reloaded Review) | `40-obs-scroll.txt` |
| Mutants and controls | 16 own mutants: 11 caught by the suite for the right reason; MB3, MB5, MB8, MB11, MB12 not (MB11 and MB12 seen by my fence probe) | `52-mut-*.txt`, `50-mut-summary.txt`, `53-mutant-*.json.txt` |

## F-UX5A2-1: the read-only week card's focus ring

**Fixed.** Measured per pixel (`40-obs-ring.txt`, `42-sum-ring.txt`): the Review at 480, 600, 767, 768, 900 and 913px (every width
where the cards overflow on the desktop project), both week cards, in four theme states (device light, device dark, a manual dark on a
light device, a manual light on a dark device), card 1 at its start, middle and end scroll positions and card 2 at its end: 96 states.
In every state every whole pixel of the 2px band is `--accent` on all four edges (top, bottom, left and right 100%; a fractional edge
leaves one whole pixel row inside the band and an anti-aliased one, as it must), the 1px gap inside it is `--card` (100% of the gap
pixels), the band holds no accent pixel while the card has no focus, the focus never moves the card's scroll position, and the focus is
`:focus-visible`. The layer is `.sheet-week-ring::after` at z-index 1 with `inset 0 0 0 2px accent, inset 0 0 0 3px card`; the card
itself draws `outline: none` and `box-shadow: none`. Contrast of the ring: 6.09:1 on the card and 4.80:1 on the WEEK bar in light,
6.79:1 and 5.00:1 in dark; a manual light on a dark device paints byte-identically to device light (`rc-ring-768-mid-*-synthetic.png`;
dark, scrolled to the end: `rc-ring-768-end-device-dark-synthetic.png`). A real Tab reaches the card from the control before it and
paints the ring on all four edges; a mouse press focuses the card without `:focus-visible` and paints no ring, as for every other
control. Forced colours (Chromium `forcedColors: 'active'`): the box shadow is dropped and the layer's transparent outline becomes the
system text colour on all four edges (`rc-ring-768-forced-colours-synthetic.png`). The documents now say what the build does:
docs/04:50 and vi:51 (the shared inset ring, 2px accent and a 1px card gap, on all four edges of the visible box, drawn by a
non-scrolling wrapper above the day columns, not moved by a sideways scroll), the style-sheet comments at `styles.css:2909-2932` and
`:2982-2997`, and the hook and wrapper comments in `TimesheetSheet.tsx:155-158` and `:212`. The new e2e check catches RECHECK-A's MA8 (an
invisible ring, mapped onto the new layer: MA8n) and MA9 (exact text), see the mutants.

## FIX13: `DayFieldsForm.tsx` reports `dirty` in a layout effect (product)

**Closes the fast-Escape gap with no new defect found.** The form's Notes textarea and category select are controlled inputs; the
report now runs in the commit of the edit (`useLayoutEffect`, `DayFieldsForm.tsx:55-59`), so `DayEditor`'s `setFieldsDirty` and its own
passive report (a sync-lane commit) reach `TimesheetScreen`'s `editorDirty` ref before the input event's task ends; with `useEffect` the
report was a default-priority update and reached the ref a task later (DIAG6's trace; my MB1 confirms the effect of the one word). No
loop: `onDirtyChange` is `DayEditor`'s `useState` setter (stable), the dependencies are `[dirty, onDirtyChange]`, a same-value set bails
out, and the effect has no clean-up, as before. No SSR exists (`createRoot` only) and no unit test renders the component, so the server
warning of a layout effect cannot arise.
Probes on both projects (`40-obs-dirty.txt`): a same-task Notes input and Escape asks "Discard your changes?"; a same-task revert to the
saved text then Escape closes at once (no stale true); Save then an immediate Escape closes at once (no stale true after a save);
Discard, then the same day and another day reopened, Escape closes at once (clean); a same-task category change and Escape asks; a
same-task Notes input and a click on another day's button asks instead of switching; real keyboard typing followed at once by Escape
asks; the reason field of a signed period (`DayEditor`'s own flag, untouched, a controlled textarea) asks after a same-task reason and
Escape and closes at once after a same-task revert. No console error or page error in any run. The new same-task test is
deterministic (one `evaluate`, no task turn between the input and the key, so no timing enters), it fails on the old hook on both
projects at "Discard your changes?" (MB1), and it proves the guard: the question, Keep editing focused, the note kept. U4-05 holds.

## FIX14: the cross-tab theme (product: `ThemeToggle.tsx`, `App.tsx`)

**Restores the accepted rule with no defect found.** `followThemeOfOtherTabs` (`ThemeToggle.tsx:46-56`) applies the stored choice on a
`storage` event whose key is null (storage cleared) or `timesheet.theme`, and `App` mounts it once before any branch (`App.tsx:26-27`),
so the sign-in page follows too. Probes on both projects (`40-obs-theme.txt`): a second tab on the sign-in page follows Dark, then a
manual Light against its dark device (and stays on the sign-in form); a storage clear in the first tab drops the choice there and the
second tab follows its dark device again; another key causes 0 changes of `data-theme`; with the menu open in the second tab both
listeners set the same value (`["dark","light","light"]` after the open; stable, no loop) and its Light radio is checked; with storage
blocked in the second tab (the `localStorage` getter throws) there is no page error, it follows its own device after the other tab's
choice, and a choice of its own (kept for the page) survives the other tab's change (the `pageChoice` precedence). The handler writes
nothing, so it cannot start an event loop. `App` never unmounts; the effect returns the clean-up. docs/04:114 (vi:115) states no tab
rule and nothing contradicts it; the module comment states the rule.
**`bringToFront` hides no product delay:** with the second tab left behind, its `data-theme` was already `dark` 3-4 ms after the first
tab's click returned and its computed background was already dark (`behind` in `40-obs-theme.txt`). The stall DIAG8 recorded is the
harness drawing a tab that is not in front; bringing the driven or read tab forward is what a person does, and the old test's steps and
checks are unchanged.
**The tests:** the old test still proves the step-by-step sync with both menus open; the new test proves that a closed menu follows.
Neither pins the sign-in page, a storage clear or the key filter: my MB5 and MB3 survive (risk R-A3-1).

## The e2e helper changes (tests only)

- **`expectLayoutAt` and `expectSheetAt`** (`fixtures.ts:718-736`): after `setViewportSize` they wait for the window width, then for the
  DOM that width asks for (`.bar-clock` below 768px only; the phone table below 480px only). Call sites: `review.spec.ts` 406, 643, 737
  and 779, `timesheet.spec.ts` 2541 and 2671, `controls.spec.ts` 49 and 68, and `expectSheetAt` in `logo.spec.ts` `sweepRange`. Each wait
  comes before the measurements, every assertion after it is unchanged, and FIX11 added a 600px width and the unsigned-line height to
  the signature test (stricter). A wait for a state the page must reach cannot pass a page that never reaches it. What the waits stop
  measuring is only DIAG5's one-frame transient (backlog). Under DIAG5's 90 ms model the call sites pass with the helper (CTL10) and fail
  without it (MB10); an off-by-one threshold fails at 480px (MB13).
- **The controls title-row waits:** the same helper in the loops of `:49` and `:68`; `:95` unchanged.
- **`stepPeriod`** (`timesheet.spec.ts:2593-2604`): it reads `data-period-due`, clicks, waits until the attribute changes, then for the 14
  days, so `check()` reads the period it stepped to (DIAG8: 17% stale reads before). No step, kind or measurement is removed.
- **The keyboard test's `toBeEnabled`:** it waits for the documented enabled state ("Checking your status" until the first lookup);
  the focus, Tab and Shift+Tab assertions are unchanged.
- **The `clockIn` day check** (`day-editor.spec.ts:139-168`): it polls the day it read and the next one, then asserts that the found day
  is the local date of the session's own `start_utc` in the reporting zone, read with the independent `zoneOracle`; later reads use
  that day. It is stricter on the filing date (REGATE10's mutant B fails on that line) and accepts the next day only together with a
  start instant that belongs to it.
- **The midnight fence** (`fixtures.ts:760-785`, `:839-845`): an automatic test fixture with no dependency, so it makes no sign-in,
  request or database access; it reads `Date.now()` and the constant `SEED_REPORTING_ZONE`, holds only when the zone's next midnight is
  at most 45 s away, polls the clock every 100 ms until midnight + 0.5 s (poll cap 60 s, fixture timeout 75 s, not the test's), and the
  one crossing test is exempt by its annotation. My fence probe through the FIX10 wrapper at 06:59:30Z: the annotated test started at
  once, 27.9 s before the midnight, and the plain one 0.58 s after it (CTLF). In the seven-file run at 06:58:30Z the desktop crossing test
  took 58.6 s, and 38.6 s alone at 06:59:20Z (CTL11), so it still crosses.
  Judgement: holding a test off the midnight removes no case and no assertion (every test still runs in full, on the new date); what
  it removes is chance coverage of a midnight inside arbitrary tests, which in DIAG9's census found 31 test assumptions and no product
  defect. The midnight behaviour itself stays covered by the crossing test (the Today press and the focus refresh across the midnight),
  by the new integration test (a check-in filed under its start date on both sides of 07:00:00Z, the check-out across it, a check-in
  after it; it fails against the UTC-date mutant, REGATE10) and by DIAG9's product probe (evidence, not in the suite). That is enough for
  the rule (docs/02, D-05). The constant zone is safe today: the seeded employee and the company calendar are `America/Los_Angeles`, the
  specs assert it, and no spec moves the shared employee to another zone. Its limits are risk R-A3-2.

## Regressions in area A (FIX11 to FIX15)

- **axe-core 4.14.0**, WCAG 2.0-2.2 A/AA tags, light and dark (`42-sum-axe-v2.txt`, `40-obs-axe-*.txt`): the Timesheet with the Day editor
  open and Notes typed (unsaved), the account menu (1440, 900, 768) or the More panel (480, 390, 320), and the Review unsigned, signed
  and signed and reloaded with a scrolling week card focused, at 1440, 900, 768, 480, 390 and 320px on the desktop project and 480, 390
  and 320px on the mobile project: 90 scans. Two `target-size` items, neither new nor a regression:
  - the account menu open at 1440px leaves 12.2px of "Review & sign off" uncovered (light and dark; 900 and 768px clean): exactly the
    item WP5-UX3-FIX1 justified and WP5-UX3-AUDIT-A accepted with the same measurement (risk R2 of `WP5_UX3_REVIEW_A.md`; the menu is
    user-opened, non-modal and transient); my target probe reproduces it on a fresh page, before and after a 320px window and after a
    reload (`40-obs-target.txt`);
  - the signed Review in dark at 1440, 900 and 768px flagged "Back to the timesheet": the page was scrolled by 197-219px, so the link
    stood half under the sticky top bar (9.9px uncovered, `40-obs-axe-review3.txt`); at the top of the page it is clean before and after
    a 320px window (`40-obs-target.txt`). A scroll position, not a layout state.
  `incomplete` holds only `color-contrast` and `label-content-name-mismatch` (the "<" and ">" glyph buttons), as before.
- **Keyboard walks**, light and dark (`40-obs-walk.txt`): desktop Timesheet at 1280 (42 stops), with the Day editor open (50), Review at
  900 and 768 (16 each, both week cards with their ring); phone Timesheet (41), the bottom sheet (7, focus kept inside) and Review (15)
  at 390. Every stop shows a change of its painted focus styles when focused, and none is wholly hidden behind a fixed or sticky bar.
- **No page scrolls sideways** at any whole width from 320 to 1440px: the Timesheet and the signed and reloaded Review with the week-card
  wrappers, light at every pixel and dark every 8px (`40-obs-scroll.txt`).

## The recorded risks

None has become a defect. `git diff a5533b5..be2afa2` touches only `App.tsx`, `DayFieldsForm.tsx`, `ThemeToggle.tsx`, `TimesheetSheet.tsx`
and `styles.css` in `src/client` (`20-src-namestatus.txt`); `TimesheetScreen.tsx`, `DayEditor.tsx`, `ReviewScreen.tsx`, `AppShell.tsx`,
`BarClock.tsx`, `SignoffDialog.tsx`, `useBlockSize.ts` and `useMedia.ts` are unchanged (`20-risk-files-diffstat.txt`, empty).
- R-A2-1 (touch on real devices): the touch code is unchanged; still a pilot-packet item.
- R-A2-2 (overlay scrollbars): unchanged and still unverified (no pressable overlay scrollbar in headless Edge).
- R-A2-3 (a resize with focus): with the wrapper, widening 900 to 1100px with the card focused removes its tab stop and drops focus to
  `body`; the next Tab reaches "Sign off" (`40-obs-ring.txt`). Unchanged, acceptable.
- R-A2-4 (test strength): MA1, MA8 and MA9 are now caught (my runs, below); MA5 stays uncaught, as FIX11 recorded.
- R-A2-5 (logo sweeps): 41.3-50.7 s of their 240 s limit in my FULL run at 2 workers beside RECHECK-B2 (`06-e2e-logo-durations.txt`).
- The one-frame 8px jump at 768px (DIAG5, backlog): `useMedia`, `BarClock` and the shell are unchanged; the new waits measure after it.
- The 23px Sign off image shift: `SignoffDialog.tsx` unchanged; backlog.
- `useBlockSize`: unchanged.
- The reason dialog's date format: unchanged (the app-wide `instantText` form).

## Test strength: my own mutants

Each mutant was applied alone in `export-mut` (exact old and new texts in `53-mutant-*.json.txt`), the client rebuilt where the mutant is
in `src/`, the named tests run, then the file restored byte-identical to its backup and to the clean export (or, for `fixtures.ts`, to the
mutation base: the clean file plus the probe port helper and DIAG5's inert delay model, `51-mutbase-fixtures.diff.txt`) and the client
rebuilt (`52-mut-*.txt`, `50-mut-summary.txt`); after the last one `dist/` equals the clean build. None repeats a mutant of FIX11 to
FIX15, the DIAGs or REGATE10, except MA1 and MA9, which are RECHECK-A's exact texts, rerun on purpose.

| Mutant | Change | Result |
|---|---|---|
| MB1 | FIX13: the dirty report in `useEffect` again | caught: the same-task test fails on both projects at "Discard your changes?" (no question); the older Escape test passes, as its timing allows |
| MB2 | FIX13: the layout effect reports only `true` | caught: "a saved day asks nothing" (a switch at 1280 and 1440px) and U5-25 "the unsaved-edit guard sees the draft" (both projects): a stale flag after a save or a cancel |
| MB3 | FIX14: the follower ignores key `null` (storage cleared) | not caught (82 theme tests pass); R-A3-1 |
| MB4 | FIX14: the key filter inverted | caught: the new test, both projects, "the page is painted dark"; the old test passes because the open menu's own listener applies |
| MB5 | FIX14: the follower mounted only while signed in | not caught (82 pass); the sign-in page would not follow; R-A3-1 |
| MB6 | FIX11: the card returned without its wrapper | caught: the ring test, "light, scrolled 0px: the ring is painted on every edge" |
| MB7 | FIX11: the layer draws the outset `--focus-ring` | caught: the same assertion |
| MB8 | FIX11: the layer on `:focus` instead of `:focus-visible` | not caught (46 pass); R-A3-3 |
| MB9 | FIX11: the wrapper `position: static` | caught: the same assertion |
| MA8n | RECHECK-A MA8 on the new layer: the accent ring transparent | caught: the same assertion (the focus-ring and keyboard specs pass, so the ring test is the one that sees it) |
| MA9 | RECHECK-A MA9 exact: `revealFocused` acts on the card itself | caught: "light, scrolled 60px: taking focus does not move the card" |
| MA1 | RECHECK-A MA1 exact: `.rsig-content:empty` shown | caught: "the unsigned employee line is 52px high at 600px (measured 57)" |
| CTL10 | control: DIAG5's 90 ms model on the helper's call sites, unmutated, `--repeat-each=2` | 44 passed, 0 failed |
| MB10 | FIX12: `expectLayoutAt` returns at once, the same model | caught: 8 failed (the check card on both projects, "vertically centred at 767px" and "page width"; the narrow period card, "430px: no sideways scroll"; the signature rows and one column on mobile), so the helper is what holds them |
| MB13 | FIX12: `expectSheetAt` threshold `<= 480` | caught: "480px: the week sheet is the phone table below 480px only" (the check card, the narrow period card) |
| CTL11 | control: the crossing test at 2026-10-27T06:59:20Z, FIX10 wrapper | passed in 38.6 s: it waited for the midnight and asserted both tabs |
| MB11 | FIX15: the exemption ignored (every test held) | not caught by the suite: the crossing test is held about 40 s, runs its real-clock branch in 2.0 s and passes; my fence probe sees the annotated test start 0.58 s after the midnight instead of before it (MB11F); R-A3-2 |
| CTLF | control: my fence probe at 06:59:30Z | the annotated test starts at 06:59:32.13Z (not held), the plain one at 07:00:00.58Z (held to midnight + 0.5 s) |
| MB12 | FIX15: the constant zone `UTC` | not caught by the suite: both check-in tests started at 06:59:40Z pass (they end before the midnight); my fence probe sees the plain test start 27.9 s before the midnight (not held); R-A3-2 |

Eleven of sixteen are caught by the suite, each for the reason the change targets. The five that survive are recorded below; none hides
a product defect (my probes show the product behaviour the mutants break).

## Findings

None new. No F-UX5A3 finding: every product claim of FIX11, FIX13 and FIX14 that I measured holds, and no regression in area A was found.

## Risks and optional improvements (not proven defects)

- R-A3-1 (test strength, the cross-tab theme): no test pins that the sign-in page follows another tab (the App-level mount), that a
  storage clear in another tab drops the choice, or that the follower ignores other keys; MB5 and MB3 survive the whole `theme.spec.ts`.
  The product does all three (my probe). Optional: one step of the new test with the second tab on the sign-in page, and one
  `localStorage.clear()` in the first tab.
- R-A3-2 (the midnight fence): (a) the zone is a constant, so a future spec that moves the shared employee to another zone, or a person on
  another calendar (DIAG9 names the Pacific/Auckland sharing spec and a noon-zone day-editor test), is not held at its own midnight; no gate
  instant crosses those today; (b) a test longer than 45 s that starts just outside the fence and reads a date late could still straddle
  (DIAG9 found none by reading); (c) the exemption has no test of its own: with it ignored (MB11) the crossing test is held, runs its
  real-clock branch in about 2 s and passes, so only a gate that records the crossing test's duration (as REGATE10 and this recheck did)
  notices; with a wrong constant zone (MB12) nothing in the suite fails at the measured placement. Optional: let the crossing test fail
  when it starts within 90 s of the midnight under the wrapper and still sees no change of date.
- R-A3-3 (test strength, the ring): the ring on mouse focus as well (`:focus` instead of `:focus-visible`, MB8) survives; the shared
  convention elsewhere is `:focus-visible`, and my probe shows that the build paints no ring on a mouse press.
- The account-menu `target-size` item at 1440px (and 1280px per UX3) stays the accepted UX3 R2 item, unchanged.

## Required gates unrun or blocked

None of the mandatory checks was skipped, and none needed a rerun. The repository harness picks its own free loopback ports for the
mandatory FULL run and the seven-file run in the clean export (I did not change the code under test); my probes and mutants used
51282-51309 through a port helper in their copies (`51-*-fixtures*.diff.txt`). Four probes of mine had probe defects on their first run
and were corrected and rerun; the first runs are kept as `*-v1` / `*-v2` (the ring metric read the second, anti-aliased row of a
fractional edge; the phone's modal bottom sheet made a Playwright click behind it impossible; two clicks hit an already-checked radio and
one hash-only navigation did not reload; hard axe assertions stopped a run at its first item). No product conclusion rests on a first run.
NAS and production items are outside area A.

## Disposition of previous findings

F-UX5A2-1: fixed (above). R-A2-1..5: as above. RECHECK-A's closed findings F-UX5A-1..4 and the round-4 findings stay fixed (their tests
pass in my FULL run).

## Software readiness, owner permission and pilot result

Area A is accepted on be2afa2 by this recheck (PASS). This review says nothing about owner permission or a pilot result; no production
sending or deployment was touched (local capture only).

## One next action

The coordinator records this PASS of area A on be2afa2 and continues with WP5-UX5-RECHECK-B2's result and the next WP5 step on the board;
R-A3-1..3 can go to the WP5 optional backlog as test-strength items.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP5-UX5-RECHECK-A2 attempt 1; reviewer agent `ac4e1fc487e2170bb` (board); the
  authors of the reviewed changes include FIX11 `ad20b5d60d23b40b3`, DIAG5 `a4b3d773a6c773cc3`, FIX12 `a4d0a2d06582c033b`, DIAG6
  `aa5b47c77e20ee0d8`, FIX13 `ae88157dbd8cfbaf3`, DIAG7 `a2f9710356f00cfc2`, DIAG8 `a2d866ee4d98d8fc8`, FIX14 `a1c4234a6f1e1ba0b`, DIAG9
  `a3f238d09db3d0559`, FIX15 `a95d2f3d7fd1cf6e5` and the committers `ab548c09464afc4b4`, `ad74ddf24fe9fa54e`, `ac3b5ae5d6aa244dc` and
  `af240aefa6e644b8a`.
- Fresh context; I wrote none of the reviewed changes. I changed nothing outside this review pair, the brief's Results and the evidence
  folder.
- Digest before and after: equal (above); gate evidence for this snapshot: WP5-UX5-REGATE10 PASS (Addendum 1).
- New report path: `handoff/delivery/WP5_UX5_RECHECK_A2.md` (+ `.vi.md`); `WP5_UX5_RECHECK_A.md` and earlier reviews are untouched.
- Finding dispositions and the next coordinator task: F-UX5A2-1 closed; no new finding; R-A3-1..3 recorded.
