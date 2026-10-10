# WP5 UI redesign, independent recheck of area B on the final snapshot (B6) — accessibility fix round, owner-request fidelity, test strength, UI standards and documentation

[Tiếng Việt](WP5_UX_REVIEW_B6.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-B6, attempt 1,
  2026-10-10 (UTC 03:05Z to about 04:10Z). Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort
  set by the profile, not observable from inside). Area A is rechecked separately (WP5-UX-AUDIT-A6) and is not covered here.
  The earlier area-B reviews [B](WP5_UX_REVIEW_B.md) to [B5](WP5_UX_REVIEW_B5.md) are preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `bf954c0b371ad9a5fe461a603c5d476ea210e66c` (the WP5-UX-REGATE5 freeze; HEAD = origin/main); digest
  `b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563`, 793 files, `handoff/` excluded, recorded first (after
  `node --version`, 03:05:43Z) and again after all checks, equal in three forms (`git ls-tree` form, `scripts/source-digest.mjs`
  in a scratch clone at bf954c0 and in the working repository). No path outside `handoff/` differs from bf954c0; no unpushed
  commit; 5b349f8 touches `handoff/` only. Source complete: a clean scratch clone, `npm ci` exit 0.
- **Decision: FIX REQUIRED.** Every item of the fix round is closed when checked with real key presses on both projects, light and
  dark, at 1280, 768, 390 and 320: B5-01..B5-03 (AX-01..AX-03), AX-04..AX-10 and R-12. The new checks fail on 5e104e1 for
  their own reasons. No assertion was removed or weakened since 014bd47. Typecheck, lint, `npm test` (82 files, 1823 tests) and
  the full e2e on both projects pass (run 2: 208 passed, 24 skipped, 0 failed). But one Low defect against docs/04 line 48 as
  shipped blocks under the brief's severity rule: **WP5-UX-B6-01**. When a person has a received share (so the "Shared with
  me" switcher is in the compact bar) and the zone note shows (the viewing zone differs from the reporting zone), the first day
  row is not fully visible above the tab bar at 390x844. Its bottom is at 830.2px; the tab bar top is at 788px. The numbers are
  identical at 5e104e1, so FIX7 did not cause it. The e2e first-screen tests sign in as an account without received shares.
  No other blocking defect was found.

## Scope actually inspected and executed

1. Dispositions: the FIX7 diff `5e104e1..bf954c0` (29 paths, `10-…`) and the round `014bd47..bf954c0`. My own Playwright probes
   ran against my own built servers (ports 48300-48319), with the synthetic accounts, shares and days the probes create:
   - P1: Tab and Shift+Tab walks with occlusion (5x5 `elementFromPoint`) and the rendered ring at every stop (focused against
     unfocused screenshot, read across each side).
   - P2: label picker by Enter/arrows/Home/End/Escape, editor dialog stop, pressed toggles, and date/time fields by Tab and
     Shift+Tab, measured against the screenshot taken before the key press.
   - P3: label in name over every button and link.
   - P4: switcher keys, status roles and focus returns.
   - P5: rendered text contrast.
   - P6: reflow and targets.
   - P7: modal behaviour and keyboard order.
   - P8: Admin walks.
   - P9: desktop SC 2.5.8 and the two AX-07 notices the gate could not reach.
   - P10: phone label targets.
   - P11: phone first screen with and without a received share, on bf954c0 and on 5e104e1.
   - P12: scrolling dialogs (Clock out, batch review) as their own keyboard stop.
   I copied the bf954c0 versions of `keyboard-access.spec.ts`, `dayButton.ts` and `focus-ring.spec.ts` into a base copy at
   5e104e1 and ran them there (`30-…`).
2. Area B on the whole snapshot (items 1-6 of `WP5-UX-AUDIT-B.md`): the owner request and E-1..E-7; test strength over every
   test file changed since 014bd47 (`11-…` to `14-…`); accessibility; UI standards and deprecations; docs/04, docs/10 and docs/12
   with EN/VI parity; the mandatory checks.
3. The risks of `WP5_UX_REVIEW_B5.md`, and the items FIX7 left by design, re-judged under the severity rule.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-B6/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms (before / after) | `b7c011d2…a563`, 793 files, all equal | `00-…`, `90-…` |
| `npm ci` / `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / 0 / 0 | `02a-…` to `02c-…` |
| `npm test` with `--trace-deprecation --pending-deprecation` | exit 0; 82 files, 1823 tests; 0 deprecation lines | `03-…` |
| `npm run test:e2e` run 1 (build + full suite, Edge, both projects, deprecation tracing) | exit 1: 207 passed, 24 skipped, 1 failed. The failure is desktop `automation.spec.ts:118`, "fetch failed … read ECONNRESET" from the test process to its private server on the first request after a 9.4 s job drain (area A). The same test alone with `--repeat-each=3` gives 3 passed, exit 0 | `04-…`, `04b-…`, `04c-…` |
| `npm run test:e2e` run 2 (nothing else running) | **exit 0; 232 tests: 208 passed, 24 skipped, 0 failed, 0 flaky**; desktop 103 + 13 skipped, mobile 105 + 11 skipped (every skip is a project condition); 0 deprecation lines | `05-…`, `05b-…` |
| New checks of bf954c0 on the 5e104e1 build (base copy) | exit 1: 36 failed, 8 skipped, 2 passed (AX-09 dark: the dark token did not change). Each failure is its own defect: hidden stops 11/3/25/31 (1280/768/390/320); list ring 1.21 / 1.15; no inset ring on the dialog; date field ring "none"; focused = pressed only; no day button with the new name; ArrowDown navigates; no `role=alert`; focus not returned; "Complete" 4.41; day button out of its cell | `30-…`, `30a-…` |
| P1 walks, desktop 1280/768 and mobile 390/320, light and dark | desktop 100 walks / 3628 stops, mobile 100 / 3692; **0 entirely hidden, 0 without a ring, 0 rings under 3:1** (lowest 4.32); 18 phone date/time stops measured in P2 instead (their computed ring is the token, `:focus-visible` true); 14 day buttons in date order in all 56 sheet walks | `41-…`, `41b-…` to `41d-…` |
| P2 rings | picker: list ring 4.54-7.01 against the page, active option inset ring on 4 sides 5.86-6.79, active option fully visible (25/25) at every arrow position, Escape returns to the trigger. Editor dialog: Shift+Tab from Close lands on the dialog, `:focus-visible`, inset ring 6.09/6.79 on 3-4 sides. Pressed toggles: ring 6.09/6.79 on 4 sides. Date/time fields by Tab and Shift+Tab: ring 4 sides 5.15-6.79 | `42-…`, `42b-…`, `raw-…p2…` |
| P12 scrolling dialogs (Clock out, batch review; 1280x600 and 320x640; light and dark) | Clock out scrolls at 320x640; Shift+Tab from the first control lands on the dialog, `:focus-visible`, inset ring on 4 sides 6.09 / 6.79 | `45-…` |
| P3 names | 56 + 56 day buttons named exactly "{verb} {visible text} ({ISO date})"; "End share with {name}" | `43-…`, `43b-…` |
| P4 behaviour (4 widths x 2 themes) | switcher: arrows, Home, End, PageDown, type-ahead and Enter on the select keep `#/timesheet`, 0 non-GET requests; Open (Enter or Space) navigates. `role=alert` for the sign-in and Timesheet errors, `role=status` for the share-form problem. Focus returns: batch review, label review, End share, Leave, Change | `42-…`, `42b-…` |
| P5 text contrast (8 states x 2 themes x 2 projects) | 0 under 4.5:1; lowest 4.54 (light) / 4.67 (dark); "Complete" 6.63 / 5.82 / 5.17 light; Check cells 10/10 with words and a shape | `42-…`, `42b-…`, `46-…` |
| P6 phone 390/375/360/320, 12 states | 0 sideways scroll, 0 overflow; AX-10 batch rows 14, 0 problems, selection targets 44x44 | `42b-…`, `raw-…p6…` |
| P7 modal | 768/1024/390/320 `:modal`, 0 Tab stops outside; 1280 non-modal; focus on the heading on open, Escape returns focus to the day button | `42-…`, `42c-…` |
| P9 / P10 | desktop 2.5.8: undersized radios only, all meeting the spacing exception. Policy and administrator notices are `role=status`. Phone checkboxes and radios: 0 of 18 whose label target is under 44x44 | `42c-…` |
| P11 first screen, 390x844 (bf954c0, then 5e104e1) | no share: 676.4 (zone equal) / 775.4 (zone note) ≤ 788. Received share: 731.2 ≤ 788, but **830.2 > 788 with the zone note**. Identical on both snapshots | `44-…`, `44b-…`, screenshots |
| CSS token scan | 0 colour, duration, radius or url literals outside the token blocks; `--radius: 4px`; 7/7 transitions `var(--transition)`; 0 undefined `var()` | `20-…` |
| EN/VI parity | docs/04 line 48 identical quoted names in both; other differences are date order in prose and a pre-existing translation note in docs/10 | `60-…` |

## Dispositions of B5-01..B5-03, AX-04..AX-10 and R-12

| Item | Disposition | Observation (bf954c0) |
|---|---|---|
| B5-01 / AX-01 (SC 2.4.11) | **Closed** | 0 stops entirely hidden in 200 walks of 7320 stops. The walks cover Tab and Shift+Tab, every screen, the editor, the edit share and Admin, at 1280/768/390/320, light and dark. `--shell-bar-size` follows the bar (56 / 100 / 106.8px). `html` scroll padding is 205.4px (1280, shared) and 249.4px (768, shared). The share bar sits below the shell bar from 768px. The e2e AX-01 checks fail on 5e104e1 (11/3/25/31 hidden) |
| B5-02 / AX-02 (SC 1.4.11, 2.4.7) | **Closed** | The focused list has the outer ring (4.54-7.01 against the page). The active option has a 2px inset accent ring on 4 sides (5.86-6.79), fully visible at every arrow position near the top and bottom of the page. Escape returns to the trigger |
| B5-03 / AX-03 (SC 2.4.7) | **Closed** | The editor dialog as a keyboard stop shows the inset ring (6.09 / 6.79) at all widths. The top side sits under its own sticky head on the side panel; 3 or 4 sides show. The Clock out dialog scrolls at 320x640 (P12). Shift+Tab from its first control lands on the dialog with `:focus-visible` and a rendered inset ring on 4 sides: 6.09 light / 6.79 dark against the card, with the white gap against the scrim. At 1280x600, and for the batch review at both sizes, the dialogs do not scroll and are not a stop (`45-…`) |
| AX-04 (SC 2.4.7) | **Closed** | A pressed "Show details" or "Change several days" with focus shows the outer ring plus the pressed edge (6.09 / 6.79). Without focus it shows the pressed edge only |
| AX-05 (SC 2.5.3) | **Closed** | 112 day buttons named "Edit 09/28 (2026-09-28)", phone "Edit Mon 09/28 (2026-09-28)", "View …" read-only. "End share" is named "End share with {name}". docs/04 line 48 EN and VI match. Code selects days by `data-day` (`focusDay`) |
| AX-06 (SC 3.2.2) | **Closed** | No key on the select changes the screen or sends a request; Open navigates; owner-only controls stay absent |
| AX-07 (SC 4.1.3) | **Closed** | Sign-in error `role=alert`, a new element on every failure. Timesheet action error `role=alert`. Share form, sharing change step, Settings policy and administrator password notices `role=status` (the last two observed here; the gate could not reach them) |
| AX-08 (SC 2.4.3) | **Closed** | Batch review Escape/Cancel return to "Preview changes"; a step change moves focus to its heading; label review Escape returns to the picker; End share, Leave and Change return to their opener. Only preview requests are sent; the day stays Worked. Import and opening balance: e2e `import.spec.ts` passes on both projects |
| AX-09 (SC 1.4.3) | **Closed** | Light `--ok` #136a42 on every light surface token is at least 5.29 plain and 4.69 under the selection tint. Rendered "Complete": 6.63 normal, 5.82 desktop selected, 5.17 phone selected. Dark unchanged (at least 5.43) |
| AX-10 (SC 1.4.10) | **Closed** | At 390/375/360/320 in batch mode: 14 rows, day button inside its cell and clear of the label, selection targets 44x44, no sideways scroll |
| R-12 (SC 2.4.7) | **Closed** | Shift+Tab into "Open a day" and the session-form time fields: the field matches only `:focus-within` and shows the ring (6.09 / 6.79). FIX7's claim is confirmed by my own method: after Shift+Tab, `blur()` leaves the field active on the desktop (both directions on the phone), so I measured against the screenshot taken before the key press |

## Owner request, E-1..E-7 and navigation

- **Desktop sheet (E-1, E-2, E-4, E-6), phone layout (E-1, E-3), navigation (E-5), scope (E-7):** met, as in B5; rechecked on
  my probe screenshots and the e2e assertions (form header, two Monday-Sunday bands, rows Day/Date/Label/Time/OT/Check,
  hatched non-working days, US dates, h:mm, "Not used yet" manager line, three tabs plus More, Overtime/History/Settings not
  restyled).
- **Phone first screen (docs/04 line 48, approved direction B-01):** met for a person without received shares, in both zone
  situations. **Not met when the person has a received share and the zone note shows: WP5-UX-B6-01.**

## Test strength

Every removed test line since 014bd47 is judged against its replacement in `13-test-strength.txt`. FIX7 replaces each renamed
day-button name with `namedDayButton` or `dayButtonName`: the same day, an anchored name with the visible text and the ISO
date. None is dropped. FIX7 adds 105 expect lines and changes no fixture or config. **Result: no assertion removed or weakened
since 014bd47.** No `.only`, `fixme` or unscoped skip.

## Accessibility, UI standards and documentation

- Keyboard order Mon..Sun week 1 then week 2: **pass** (56 walks; P7 phone). Names, modal behaviour, focus return, bottom-sheet
  trap: **pass**. Focus not obscured: **pass**. Status never colour alone: **pass**. 44px on the phone: **pass** (checkboxes and
  radios through their 44px labels). Reflow at 320: **pass**. Contrast: **pass**. Status messages: **pass**.
- Tokens only, `--radius: 4px`, the shared transition, layered shadows, reduced motion, system fonts: **pass**.
  `useBlockSize.ts` uses `ResizeObserver`, `getBoundingClientRect` and CSSOM `setProperty`/`removeProperty` (none
  deprecated; CSP allows CSSOM). FIX7 uses `SubmitEvent` and `RefObject`, the non-deprecated React types. No deprecation line
  in lint, `npm test`, build, e2e or the browser consoles.
- docs/04 (lines 14, 41-63, 78-80), docs/10 and docs/12 describe the shipped UI, with EN/VI parity. The exception is line 48's
  first-screen sentence in the B6-01 state.

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-B6-01 | Low | `src/client/components/SharingSwitcher.tsx:26-45` (label "Shared with me", select, Open) rendered in the compact bar by `AppShell.tsx:165`. The bar wraps (`styles.css:250-262`), and the touch rule makes the switcher row 60px (`styles.css:578-597`: `label.inline` min-height 44 plus 8px padding). With the zone note (`PeriodBar.tsx:61`, `styles.css:744-790`), the phone first screen exceeds 788px. Not introduced by FIX7: identical at 5e104e1 | Mobile project, 390x844, device zone Asia/Ho_Chi_Minh (reporting zone America/Los_Angeles, so the zone note shows). Sign in as a person someone shares timesheets with, then open `#/timesheet` at the top (`b6c.probe.ts.txt`, `44b-…`, screenshot `b6-first-screen-received-share-zone-note-390-bf954c0-synthetic.png`) | Expected (docs/04 line 48 EN/VI; plan C; B-01): "the first day row is fully visible above the tab bar at 390x844". Actual: the shell bar is 106.8px instead of 52px. The first day row bottom is at 830.2px against the tab bar top at 788px; only its first line ("Mon") shows. Without a received share: 775.4px. With a share but no zone note: 731.2px | docs/04 as shipped, line 48; approved direction (plan C, mockup A2) | Keep the phone first screen within the budget when the switcher is shown. For example, move "Shared with me" into the More panel below 768px, or make the compact bar one row with a visible but compact label (keep SC 3.3.2 and 2.5.3). Add a mobile e2e for a person with a received share and the zone note at 390x844: the first `[data-day]` bottom at or above the tab bar top. If the owner prefers to narrow the rule instead, docs/04 line 48 EN/VI needs an owner/coordinator decision (AGENTS rule 8) |

## Risks and optional improvements (not defects)

- **R-10 hover hides the ring (unchanged):** a pointer resting on a focused control shows the hover style (Clock in:
  `--shadow-panel`, `:focus-visible` true). Keyboard-only use always shows the ring, so SC 2.4.7 holds. Optional.
- **R-11 ring cut (narrower):** 102 of 7302 measured stops show 3 or fewer sides. They are controls at a scroll edge, today's
  day button beside its accent bar, the History diff scroller, and tall textareas. Every one shows a visible ring. Optional.
- **R-13 test reach (partly addressed):** the new specs cover the picker, the dialog stop, toggles, date fields, occlusion and
  focus returns. `parseColour` in `keyboard-access.spec.ts` still reads a non-`rgb()` colour as black. Optional.
- **R-14 docs/04 wording (unchanged):** line 43 "no placeholder text" against "no times yet"; line 79 "one shared token" while
  inset variants exist. Optional.
- **R-15 phone batch crowding: closed by AX-10.**
- **R-16 label picker extras (re-judged; the "WFH Note" item):** the trigger is named "Label for {date}: {label}" while it also
  shows a second line ("Vacation leave 2:00", "Holiday", "Work from home" on another category) and a "Note" marker. Under
  SC 2.5.3 the control's label is its value plus the "Label" row header. The extras are supplementary state, and they are
  available in text in the day editor and on the Review sheet. So I judge this not a 2.5.3 or 1.3.1 failure. Recommended: add
  them to the name or to `aria-describedby`, so screen-reader users hear them on the sheet.
- **R-17 "<" and ">" names:** "Previous period" / "Next period". Symbolic text characters are outside SC 2.5.3. Not a defect.
- **R-18 inline "Import" link on Overtime (pre-existing, WP4, not restyled per E-7):** 35.9x16px. It is inside a sentence, so
  SC 2.5.8 exempts it. It is not one of docs/04 line 80's controls (buttons, fields, nav and button links). Optional.
- **R-19 switcher choice persists:** a choice made without Open stays shown on the person's other own screens. The code comment
  says it resets per screen; it resets per shared owner. No context change. Optional.
- **R-20 Escape in the sharing change step:** the inline step ignores Escape (not a dialog; Cancel returns focus). Optional.
- **Information outside area B:** e2e run 1 had one transient ECONNRESET in `automation.spec.ts:118` (area A). It passed 3/3
  alone and in run 2. `npm ci` reports 1 high advisory (not re-verified; earlier reviews traced it to a dev dependency).

## Required gates unrun or blocked, and why

None in area B. Typecheck, lint, `npm test` and the full e2e suite on both projects ran here; run 2 passed. Area A is outside
this review.

## Disposition of previous findings

WP5-UX-B5-01, B5-02 and B5-03 are **closed**. Sweep items AX-04..AX-10 are **closed**, and B5 risk R-12 is **closed**. B5 R-15
is closed by AX-10. R-2..R-6, O-4, R-8..R-11, R-13 and R-14 were re-judged; none blocks. B5's O-4 ("other states outside the
rule") did not cover a person's own view with a received share. That state is now WP5-UX-B6-01 (Low, open). R-16..R-20 are new
and optional.

## Software readiness, owner permission and pilot result

- **Software readiness, area B:** not yet. One Low layout item (B6-01) remains; every accessibility item of the fix round is closed.
- **Owner permission:** none requested or given; no deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: decide B6-01. Either open a small fix task (phone shell bar or switcher placement, plus a 390x844 e2e for a person
with a received share and the zone note), then freeze, gate and an area-B recheck limited to that item and a regression run.
Or ask the owner whether docs/04 line 48 should be narrowed instead.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-B6, attempt 1; reviewer self-reported
  `claude-opus-5-5` (fresh subagent; agent ID not visible from inside). Reviewed authors: WP5-UX-A11Y-SWEEP and WP5-UX-FIX7
  (`claude-opus-5-5`), the FIX7 freeze and WP5-UX-REGATE5 (`claude-sonnet-5-5`), and the earlier round authors. My model is
  not weaker than the strongest author.
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no gate,
  sweep or earlier audit of this round. I edited no source, test, doc, board or STATE file.
  - My probes ran in a scratch clone in the task folder, kept out of git by `.git/info/exclude`. The 5e104e1 checks ran only in
    a separate base copy.
  - Process slips, none of which changed a tracked file or a result: four grep outputs were written by relative path into the
    clone root and then moved out (`90-…`).
  - The P7 desktop order counter stops at the segments of the "Open a day" field (a probe defect, in every run); the P1 walks
    give the desktop order instead.
  - The P4 dark runs hit the server's sign-in rate limit after the light runs. The alert then said "Too many failed sign-in
    attempts" and was still `role=alert`.
- **Source digest before/after; gate evidence for that snapshot:** `b7c011d2…a563` before and after, three forms (`00-…`, `90-…`);
  equals the WP5-UX-REGATE5 digest of record.
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_B6.md` and `.vi.md`, new files; every
  earlier review is untouched.
- **Finding dispositions and next coordinator fix/recheck task:** B5-01..B5-03, AX-04..AX-10 and R-12 are closed. WP5-UX-B6-01
  is open. Next: the decision above.
