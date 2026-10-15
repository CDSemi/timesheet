# WP5 UI change round 2, independent recheck of the fix round on a643794 (WP5-UX2-AUDIT2)

[Tiếng Việt](WP5_UX2_REVIEW2.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 2 after its fix round
  (WP5-UX2-FIX1 and WP5-UX2-FIX2), task WP5-UX2-AUDIT2, attempt 1, 2026-10-15 from 12:40Z to about 14:05Z (05:40 to
  about 07:05 in America/Los_Angeles). Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort
  set by the profile, not observable from inside). A fresh recheck of the three findings and the risk R-UX2A-2 of
  WP5-UX2-AUDIT, of every line the fix round changed, and of the areas the first audit accepted. Every earlier review,
  including [WP5_UX2_REVIEW.md](WP5_UX2_REVIEW.md), is preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `a6437943403fc416240fd13a787a8c4748af3e84` (the WP5-UX2-FIX2 freeze, the WP5-UX2-REGATE2 `freeze_commit`). HEAD =
  origin/main = a643794 before and after; no unpushed commit; no path outside `handoff/` modified or untracked. Digest
  `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3`, 815 files, `handoff/` excluded, recorded first
  (12:42Z) and last (13:46Z), each time in three equal forms: a clean `git archive` export hashed with
  `git hash-object --no-filters`, the `git ls-tree a643794` form (its sorted list byte-identical to the export's), and
  `npm run digest` in the repository. Source complete: `npm ci` exit 0 in the export.
- **Decision: PASS.**
  - The three Low findings and the risk R-UX2A-2 of WP5-UX2-AUDIT are closed on a643794 (section 1). A press on the
    inactive Today and the new focus and visibility re-reads follow the server's date across the reporting-zone midnight,
    in the own view and in a shared view whose owner reports in a far zone, with the device zone far from both; a press
    while not away makes one read and changes nothing. docs/04 and docs/10 (EN and VI) describe the 330px row and the
    inactive press as built. The inactive Today's ring paints the full accent (6.09:1 light, 6.79:1 dark) on all four
    sides with both overrides on both projects, and no focusable element is dimmed by opacity any more. The new wording
    test catches reverted strings.
  - No regression (section 2). The fix changes only what the findings needed. Today and Current period still use the
    server's `today_local`, `current` and `in_progress` only. The new re-reads make one read per real window focus or
    visible tab, never one per element focus, never loop, and in a shared view never leave the share or wake the
    check-in provider. The period bar keeps WCAG 2.2 AA at 1440, 390 and 320 in both themes and both overrides.
  - Unchanged areas carry forward (section 3): nothing else changed since d1a20a7, and `dist/server` still differs from
    90b98ef only in the three message literals and one comment.
  - The mandatory checks pass: typecheck 0, lint 0, `npm test` 0 (89 files, 1882 tests, twice), build 0, smoke PASSED,
    0 deprecation lines; the FULL e2e on both projects on the real clock (a window day) 448 passed, 0 failed, 42 skipped
    (desktop 216/29, mobile 232/13), and outside the window (simulated 2026-11-04 15:00 PST) 448 / 0 / 42 with the same
    split; AC-13 1/1.
  - Every mutation the brief lists is caught (section 4): the inactive-press re-read removed (on the real clock and under
    the preload), the focus or the visibility re-read removed, the opacity rule restored and one renamed string reverted
    (two places); also the one-read guard removed, the re-read sent to the own route in a shared view, and the inactive
    Today's ring removed. The FIX2 focus-ring tests catch the opacity and the missing ring both inside the window and
    outside it, so they are not vacuous. One extra mutant, a press that decides from the stale periods, is caught only
    under the simulated clock (risk R-UX2A2-4).
  - No new finding. New optional risks R-UX2A2-1 to R-UX2A2-4 and the carried R-UX2A-1, -3, -4 and -5 are listed in
    section 5. As the brief states, this PASS re-accepts WP5 on a643794 and supersedes WP5-UX-AUDIT-AB9 and the audits
    that pointed to it.

## Scope actually inspected and executed

1. Read as claims, not proof: the first review [WP5_UX2_REVIEW.md](WP5_UX2_REVIEW.md), the records of WP5-UX2-FIX1, FIX2,
   REGATE (FAIL) and REGATE2 (PASS) with their evidence, and the board's owner and coordinator decisions of 2026-10-14 and
   2026-10-15.
2. The whole diff d1a20a7..a643794 outside `handoff/`: 11 paths, 415 insertions and 19 deletions (two commits, b1b725b and
   a643794). Every changed line of `TimesheetScreen.tsx`, `PeriodBar.tsx`, `styles.css`, the four test files and the four
   docs files was read, with the unchanged code they call (`periodJumpModel.ts`, `ClockProvider.tsx`, `api.ts`,
   `SharedTimesheetScreen.tsx`, `AppShell.tsx`, `sheetModel.ts`, the CSS tokens).
3. Mandatory checks in a clean export: `npm ci`, typecheck, lint, `npm test` twice, build, smoke, the FULL e2e on both
   projects on the real clock, AC-13 once.
4. Own clean builds of 90b98ef and a643794 and a file-by-file diff of `dist/`; the response headers of the built server.
5. Own simulated-clock probes (FIX10 `shiftclock.mjs`, byte-identical copy, validated by a control): five midnight
   probes (own view at a period end, at the end of the five-day window and mid-period; an active Today on the next period
   across its first midnight; a shared view across the owner's midnight in a far zone), the repository's own midnight
   test under the preload, and one FULL e2e run on both projects outside the window (2026-11-04 15:00 PST).
6. Request counting on the new focus and visibility re-reads: keyboard walks, scripted element focus, dispatched window
   focus (single, ten in one task, ten 50 ms apart), visibility visible and hidden, a real tab switch, and the inactive
   press, in the own view and a shared view, on the real clock and outside the window.
7. Accessibility of the period bar and the inactive Today: an axe-core 4.14.0 scan, a full keyboard walk and the painted
   focus ring at 1440 (desktop project) and 390 and 320 (mobile project), in light, dark and both manual overrides,
   inside the window (real clock) and outside it (simulated); the phone Review row measured from 316 to 400px.
8. Mutations of the fix (11 mutants in 15 runs plus 2 baseline runs, each in a scratch copy).
9. Docs: docs/04 lines 48, 54 and 56 and the docs/10 bullet "Phone Review link", EN and VI.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX2-AUDIT2/` (index `00-README.txt`), plus four
`-synthetic.png` screenshots.

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; non-handoff status | `229df806…0b04db3`, 815 files every time; export list = `ls-tree` list; HEAD = origin/main = a643794; no non-handoff change | `01-digest-before.txt`, `01-digest-after.txt`, `00-head.txt` |
| board extract of the WP5-UX2 tasks | every author and gate self-reports `claude-sonnet-5-5`; this audit is opus | `02-board-ux2.txt` |
| `npm ci` / typecheck / lint (`no-deprecated`) / `npm test` / build / smoke / `npm test` again (clean export) | 0 / 0 / 0 / 0, 89 files, 1882 tests / 0 / 0, SMOKE PASSED / 0, 89 / 1882; 0 deprecation lines in every log | `05-exits.txt`, `05-*.txt` |
| FULL e2e, both projects, REAL clock, 2026-10-15 05:48-05:59 PDT (window day P-1) | **exit 0: 448 passed, 0 failed, 42 skipped** (desktop 216/29, mobile 232/13), 11.3 min | `20-e2e-real.txt`, `20-e2e-counts.txt` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once | exit 0, 1/1 | `21-ac13.txt` |
| scope: `git diff --stat d1a20a7 a643794` outside `handoff/`; configs, server, public, brand, shell and sharing files | 11 paths (415+/19-); everything else empty | `10-*.txt`, `11-diff-full.txt`, `13-config-diff-d1.txt` |
| own builds of 90b98ef and a643794, `diff -r dist/` | `dist/domain` identical; `dist/server` 1 of 180 files, 4 lines (3 literals, 1 comment) | `13-dist.txt`, `13-dist-diff.txt` |
| simulated-clock control | server `today_local` 2026-11-04 at 15:00 PST; browser real 2026-10-15 | `61-control-1104.txt` |
| own midnight probes: 10/25, 10/30, 10/31 (own, device Kiritimati), 10/25 in Kiritimati (shared), the edge case | 10 passed, 0 failed (two projects each) | `62-midnight-*.txt` |
| repository midnight test under the preload (2026-10-25 23:59:20 PDT) | exit 0, 2 passed (crossing branch) | `63-repo-midnight-1025.txt` |
| FULL e2e, both projects, simulated 2026-11-04 15:00 PST (outside the window) | **exit 0: 448 passed, 0 failed, 42 skipped** (desktop 216/29, mobile 232/13), 12.9 min | `64-full-1104-1500.txt`, `64-full-counts.txt` |
| request probes, own and shared, real clock and outside the window | exit 0 both times, 4 of 4: element focus 0 requests; one read per real window focus (2-3 in a wrapping 80-press walk) and per dispatched focus, then nothing; visible tab: shared 1 read, own 3 periods reads + 1-2 timesheet reads; inactive press 1 read; shared view: 0 requests outside the share (23-27 per test) | `66-requests-*.txt` |
| phone Review row, 316-400px | own row at 330px and below; shared row as "Sign off" from 332px; 44px; no sideways scroll | `67-row-real.txt` |
| a11y probes: axe-core 4.14.0, keyboard walks, painted ring; 1440 / 390 / 320; four theme situations; real clock and 2026-11-04 | exit 0 both times, 8 of 8; 72 axe scans: desktop 20 clean, 4 with only the pre-existing holiday label-picker name (R-UX2A2-3), phone 48 with only the pre-existing day-button name (R-UX2A-4); 72 walks, 3,048 stops: 0 without a ring, 0 hidden, 0 under 24px, 0 period-bar controls under 44px on the phone, 0 under an opacity below 1; inactive Today ring 6.09 / 6.79 (lowest 6.70) on all four sides | `68-a11y-*.txt`, `68-a11y-summary.txt`, four `-synthetic.png` |
| docs EN/VI parity of the changed lines | equal literal tokens; same headings and bullets | `40-docs-parity.txt`, `40-docs-*.txt` |
| test diff | one changed line (an import); no skip, only, fixme, fail, slow or soft added; `expect(` lines 22→28, 125→143, 38→49, plus 4 in the new test | `50-*.txt`, `51-expect-counts.txt` |
| token contrasts of the inactive Today | ring 6.09 / 6.79 at full strength (2.70 / 3.33 at 0.6); muted text 5.83 / 6.56 | `75-ringcalc.txt` |
| mutations | 11 mutants, 15 runs: 14 caught, 1 survivor by design (MF on the real clock, caught under the preload); 2 baselines pass; every restore byte-identical; the scratch copy's digest equals `229df806…` at the end | `72-*.txt`, `73-mutation-summary.txt` |

## 1. The earlier findings (audit question 1)

### WP5-UX2-AUDIT-01 (Today inert after midnight with the page open): closed

- **What changed.** `PeriodBar.tsx:123-127` now calls `onToday` on every press, active or not.
  `TimesheetScreen.tsx:230-257` `jumpToToday(wasAway)` always re-reads `/periods/current` through `request` and runs
  `todayJump` on the fresh answer: it jumps and announces only when the fresh state is away; otherwise it renews the
  periods and leaves the sheet, the editor and the live region as they are (an inactive press never clears the
  announcement). `TimesheetScreen.tsx:157-181` adds one effect that re-reads the periods on window `focus` and on
  `visibilitychange` to visible, through `request` (so a shared view reads the owner's route), with a ref that allows
  one read at a time. No device clock, no display zone: the only date logic is still `periodJumpModel.ts`, unchanged.
- **My midnight probes** (`zz-audit2-midnight.spec.ts`, simulated clock started 90 s before the midnight, both projects;
  the browser keeps the real 2026-10-15 and its device zone is Pacific/Kiritimati, so its own date is 2026-10-16; three
  tabs on one session; every `/api` request recorded):

| Start (reporting zone) | View | Before midnight | Untouched across midnight | Press on the (stale) inactive Today | Window focus / visibility on the other tabs | Result |
|---|---|---|---|---|---|---|
| 2026-10-25 23:58:30 PDT (period end) | own | inactive on 10/12-10/25, tag 10/25; a control press = 1 read, nothing changed | 0 requests on 3 tabs; still inactive, tag 10/25 | jumps to 10/26-11/08, tag 10/26, live "Showing today, Mon 10/26/2026, in the period 10/26/2026 to 11/08/2026", Current period shown; 6 requests (the jump's re-read and the usual load) | 1 read on focus; 3 periods + 2 timesheet reads on visibility (T09's lookups included); each turns Today active on 10/12-10/25, no navigation | exit 0, 2 passed |
| 2026-10-30 23:58:30 PDT (payroll Friday, the window ends) | own | inactive on 10/26-11/08, Current period shown, live "Showing today, Fri 10/30/2026, ..." | 0 requests | 1 read; sheet and live region unchanged; tag 10/31; Current period gone | 1 read on focus; same outcome | exit 0, 2 passed |
| 2026-10-31 23:58:30 PDT (mid-period, two hours before the clocks fall back) | own | inactive on 10/26-11/08, tag 10/31 | 0 requests | 1 read; sheet unchanged; tag 11/01 | 1 read on focus; same outcome | exit 0, 2 passed |
| 2026-10-25 23:58:00 Pacific/Kiritimati (owner's period end; 02:58 PDT for the grantee) | shared (owner on a second calendar in Kiritimati, grantee device Pacific/Pago_Pago) | inactive on the owner's 10/12-10/25; control press = 1 read of `/api/shared/{owner}/periods/current` | 0 requests | jumps to the owner's 10/26-11/08 with the owner's tag and the live text, Current period shown; 3 share requests | exactly 1 share read on focus and 1 on visibility; Today active | exit 0, 2 passed; no `/api/periods/current`, `/api/clock*` or own timesheet request; the grantee's own date stayed 10/25 |

- **The repository's own midnight test** (`today.spec.ts:538`) under the preload at 2026-10-25 23:59:20 PDT took its
  crossing branch (38 s each) and passed on both projects; on the real clock it takes its other branch (an inactive press
  = exactly one read, nothing moves) and passed in my real-clock run and in the run outside the window.
- **A press while not away changes nothing**: shown by every control press above (own and shared) and by the real-clock
  branch of `today.spec.ts:538`.

### WP5-UX2-AUDIT-02 (docs omit the 320px row): closed

- docs/04 line 48 now adds "(on the narrowest phones, below about 330px, the Review link then takes its own row with its
  full label)", line 56 the same rule, and the docs/10 bullet "Phone Review link" the same clause; line 54 describes the
  inactive Today as "dimmed with colours" and the inactive press and the focus and visibility re-reads. The VI lines carry
  the same clauses (I read them) and the same literal tokens (`40-docs-parity.txt`: equal token lists for docs/04 lines 48,
  54, 56 and docs/10 line 202/203; same headings and bullet counts). No other doc still says the inactive Today "does
  nothing" (`40-docs-inactive.txt`).
- Product as built: my row probe (`67-row-real.txt`, mobile project, real clock on a window day, after Today so that
  Current period shows, 316 to 400px in 2px steps) finds the Review link on its own row with its full label at 330px and
  below, on the shared row as "Sign off" from 332 to 396px and with its full label from 398px; always 44px high and without
  sideways scroll. "Below about 330px" is accurate. The suite's `today.spec.ts:389` asserts the 320px own row and passed in
  the real-clock run.

### WP5-UX2-AUDIT-03 (the inactive Today's ring dimmed to 2.70:1): closed

- `styles.css:879-883` dims `button.secondary[aria-disabled='true']` with `color: var(--muted)` and
  `border-color: var(--line)`; the element opacity is gone, and the inactive hover rule (`styles.css:855-859`) keeps the
  same border. Both tokens exist in `:root` and in both dark sets (no new token).
- Painted ring pixel of the suite's test (`focus-ring.spec.ts:407`, both projects, four theme situations): real clock
  (window day) desktop 6.11:1 (light, manual light) and 6.40:1 (dark, manual dark), mobile 6.09:1 and 6.79:1; outside the
  window (2026-11-04) 6.09:1 and 6.79:1 on both projects; computed opacity 1; muted text 5.83:1 / 6.56:1. Expected from the
  tokens (`75-ringcalc.txt`): 6.09 / 6.79 at full strength, 2.70 / 3.33 at 0.6.
- My own probe (`zz-audit2-a11y.spec.ts`) samples all four sides of the ring at three depths inside the 2px accent band and
  multiplies the opacity of the button and every ancestor: in 24 measurements (1440, 390 and 320; four theme situations;
  inside the window beside Current period and outside it) every side shows the full accent, 6.09:1 in the light theme and
  6.79:1 in the dark theme (one anti-aliased dark sample at 6.70:1), with an opacity chain of 1 and the muted text at
  5.83:1 / 6.56:1 (`68-a11y-summary.txt`). The screenshots `audit2-inactive-today-*-synthetic.png` show the ring closed
  around the grey button, next to an active Current period in the window and next to the Review link outside it.
- **No other element dims a focus ring with opacity.** The only `opacity` rules left in `styles.css` are
  `button:disabled` (869), `input.switch-input:disabled` (1297), both natively disabled and never focusable, and the
  invisible theme radio (602, `opacity: 0`), whose ring is painted on its label (`.theme-option:has(input:focus-visible)`,
  613). No TSX file sets an opacity. Only the Today button carries `aria-disabled` (`23-ariadisabled.txt`). My keyboard
  walks found no stop, in 72 walks of the Timesheet page, whose ring is painted under an opacity below 1 (the theme
  radio's ring is painted by its label, as designed).

### R-UX2A-2 (renamed strings no test reads): closed

- `tests/client/userWording.test.ts` scans every `.ts`, `.tsx`, `.css`, `.html` and `.js` file under `src/client` (more than
  40 files asserted) for "clock in", "clock out" (space or hyphen), "clocked" and "checking the clock" outside comments,
  with only the two element ids `clock-out-title` and `clock-out` allowed; two self-tests show that each phrase is caught
  and that identifiers, API paths and comments pass.
- My reverts in two places no earlier mutation used, `ClockOutDialog.tsx:74` ("check-out time" to "clock-out time") and
  `ClockPanel.tsx:20` ("Checking your status" to "Checking the clock"), each fail 1 of 3 tests, naming the file and line
  (`72-MD-unit.txt`, `72-MD2-unit.txt`). FIX1 showed the same for the five places the first audit named; the three server
  literals stay covered by the integration test (first audit, M10e).

## 2. No regression from the fix (audit question 2)

- **Every changed line read** (`11-diff-full.txt`). Outside the three findings the fix changes nothing: the PeriodBar
  change is the removed guard and a comment; the CSS change is the one rule and its hover twin; the TimesheetScreen change
  is the refresh effect, the `wasAway` parameter and the hoisted `todayAway`. The only removed test line is the
  `today.spec.ts` import (it gains `newPerson`); no assertion was removed or weakened; no `skip`, `only`, `fixme`,
  `test.fail`, `slow` or `expect.soft` was added (`50-test-removed-lines.txt`, `50-test-added-skips.txt`, empty).
- **Edge cases of the new press path, read in the code.** An active press clears the announcement first, as before; an
  inactive press keeps it. One behaviour differs from d1a20a7 in a rare case: a press on an active-looking Today whose
  fresh answer says the sheet already shows today (a page left focused across the first midnight of the period on screen,
  reached with Next) now only renews the periods (the Today tag appears, Today turns inactive) instead of "jumping" to the
  same period with a scroll and an announcement; the old announcement is restored, and in that case it is empty because
  Next clears it. My edge probe shows it on both projects (`62-midnight-edge-1025.txt`: Next to 10/26-11/08 before
  midnight, press after it: one read, Today inactive, tag on 10/26, Current period shown, no announcement, today's row in
  view). Not a defect: the sheet already shows today's period. A failed re-read shows the screen's usual error line.
  Double presses make one read each (user-paced, no loop). The interface comment at `PeriodBar.tsx:14` says a press on
  the inactive button "only re-reads"; the screen may also jump after midnight (wording only).
- **Today and Current period semantics (AGENTS rule 7).** No device-clock read in `src/client`: the grep for `new Date(`,
  `Date.now`, `Date.UTC`, `performance.now`, `Temporal.` and `getTimezoneOffset` finds nothing; `resolvedOptions` appears
  only in `format.ts:7`, the display zone, which Today never uses (`31-device-clock-grep.txt`). `periodJumpModel.ts` is
  unchanged since d1a20a7. Evidence that the behaviour is the same:
  - the FULL suite on the real clock (a window day, 2026-10-15) and the FULL suite outside the window (2026-11-04 15:00
    PST) both pass on both projects, including `today.spec.ts` (Asia/Ho_Chi_Minh device) and the shared-view test of
    `sharing.spec.ts:539` (owner in Pacific/Auckland on a calendar a week apart);
  - my midnight probes above: device zone Pacific/Kiritimati (device date 2026-10-16 while the server said 10/25 to 11/01),
    and a shared view whose owner's date (Kiritimati) crossed midnight while the grantee's own date (Los Angeles) did not:
    every jump, tag and Current period followed the owner's server dates only.
- **Request counts of the new re-reads** (`zz-audit2-requests.spec.ts`, own view and a view share, both projects, on the
  real clock and outside the window; `66-requests-*.txt`):
  - element focus never reads: 20 Tab presses inside the page and a scripted focus of every period-bar and toolbar
    control (8 in the own view, 4 in the shared view) fire no window `focus` and make no request;
  - a real window focus reads once: a keyboard walk past the last stop leaves the document and comes back; 80 presses
    gave 2 or 3 window `focus` events and exactly that many reads of the view's own periods route, nothing else;
  - one dispatched window focus: one read, then nothing for 3 s (no loop); ten in one task: one read (the one-at-a-time
    guard); ten 50 ms apart: ten reads, each finished before the next event, nothing else;
  - the tab becoming visible: one read in a shared view; in the own view 3 periods reads and one or two timesheet reads,
    because the T09 check in/out lookup and the sheet reload react to the same event (risk R-UX2A2-2); hidden: nothing;
  - a press on the inactive Today: exactly one read;
  - a real tab switch (`bringToFront`) fired no window `focus` in headless Chromium, so it read nothing;
  - in the shared view no request left the share during the whole test (23 to 27 requests per test: none to
    `/api/periods/current`, `/api/clock*`, `/api/timesheets*` or the finalization routes). The check-in provider stays
    silent there: it is disabled on the shared route, has no focus listener, and its visibility listener returns on a
    shared address (`ClockProvider.tsx:119-143`, unchanged).
  - The first version of the probe expected no request at all from 80 Tab presses and stopped there
    (`66-requests-real-v1.txt`); the wrapping walk is a real window focus, so the probe was rewritten to count those
    events; the corrected probe passes on both projects in both views on the real clock (`66-requests-real.txt`, a window
    day) and outside the window (`66-requests-1104-1500.txt`).
- **WCAG 2.2 AA of the period bar and the inactive Today** (`zz-audit2-a11y.spec.ts`; `68-a11y-*.txt`, summary
  `68-a11y-summary.txt`). Desktop project at 1440, mobile project at 390 and 320; light, dark and both manual overrides;
  three states each (landing, Next, Next twice), so the inactive Today, the active Today and Current period all occur; on
  the real clock (window day) and at 2026-11-04 (outside the window):
  - keyboard walks from the top of the page: 72 walks with 3,048 stops (real clock and 2026-11-04, `68-a11y-real.txt` and
    `68-a11y-1104-1500.txt`): 0 stops without a painted ring, 0 hidden by the sticky bars, 0 under 24x24, 0 stops whose
    ring is painted under an opacity below 1, and no sideways scroll at any width;
  - period-bar order is always Previous, Next, Today, Current period (when shown), Review; every period-bar control on the
    phone is at least 44x44; the inactive Today stays in the tab order;
  - axe-core 4.14.0 (wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa): 72 scans. Desktop: 20 of 24 clean; the other 4 are
    the period 11/23-12/06 in the four theme situations, where the only result is `label-content-name-mismatch` on the
    label-picker trigger of the two holiday days (pre-existing, risk R-UX2A2-3). Phone: all 48 report only
    `label-content-name-mismatch` on the 14 day buttons (pre-existing, R-UX2A-4). No other rule fails: colour contrast,
    names, roles, ARIA attributes, landmarks and target size pass in every state, including the inactive Today and
    Current period;
  - SC 1.4.11 does not apply to the inactive Today (inactive component), but its ring is the shared ring at full
    strength (above) and its muted text keeps 5.83:1 / 6.56:1; SC 2.4.7 and 2.4.11 hold (ring painted, never hidden);
    SC 2.5.3 holds for Today, Current period and the Review link (names equal or contain the visible text); SC 4.1.2:
    `aria-disabled` and the description "Already showing today" expose the state.

## 3. Unchanged areas carry forward (audit question 3)

- **Nothing else of the round changed since d1a20a7.** `git diff --stat d1a20a7 a643794` outside `handoff/` lists exactly
  the 11 paths above (`10-scope-stat.txt`); a643794 itself changes only `tests/e2e/focus-ring.spec.ts`, 4 added lines
  (`10-fix2-stat.txt`). The server, domain, migrations, scripts, package files, Dockerfile, compose file, every config,
  `src/client/public` and `index.html` are unchanged (`13-config-diff-d1.txt`, empty), and so are the brand, shell, clock
  and sharing components (`BrandWordmark.tsx`, `AppShell.tsx`, `ClockProvider.tsx`, `SharingSwitcher.tsx`,
  `SharedTimesheetScreen.tsx`; `10-unchanged-areas.txt`, empty).
- **`dist/server` still differs from 90b98ef only in the three message literals.** My clean builds of both commits:
  `dist/domain` identical (46 files); `dist/server` 180 files each, one differing file,
  `services/timesheetCommands.js`, in four lines: "Check out of the running session first" (409 `open_session_exists`),
  "There is no running session to check out of" (409 `no_open_session`), "A saved break ends after this Check out; ..."
  (422 `saved_break_after_clock_out`) and one comment (`13-dist.txt`, `13-dist-diff.txt`). The CSP header is unchanged and
  `/`, `/theme-init.js` and `/cd-logo.svg` still have no `Cache-Control` (`61-control-real.txt`).
- **The first audit's PASS-level conclusions carry forward**: owner fidelity (the 16 requested items and both answers;
  Today's target and Current period's visibility are unchanged, the fix only adds the re-reads the first audit asked
  for), sharing (no check in/out in a shared view; the new re-reads go through the share's requester only, shown by my
  shared probes and the refresh test; the grantee's allowed actions are unchanged with an unchanged `dist/server`), brand
  and privacy (no brand file, font, raster or CSP changed), the server delta (above) and the docs (only the four lines
  named in the findings changed). Nothing that the first audit accepted is weakened.

## 4. Test strength of the fix (audit question 4)

Each mutant was applied by `mutate.py` (exact text, exactly one occurrence) in the scratch copy `mut/`, the client
rebuilt, the named tests run alone with their own output folder, then every touched file restored from a643794 and
checked byte-identical to the clean export, and the client rebuilt; at the end the scratch copy's digest equals
229df806… again (`01-digest-mut-after.txt`).

| ID | Mutation | Run | Result |
|---|---|---|---|
| MA | the inactive-press re-read removed (the old guard `if (jumps.todayAway) jumps.onToday()` back in `PeriodBar.tsx`) | `today.spec.ts` "left open across", both projects, real clock | **caught**: 2 failed (the expected `/periods/current` read never comes) |
| MA | the same | the same test under the preload at 2026-10-25 23:59:20 PDT (crossing branch) | **caught**: 2 failed (expected `10/26/2026→ to 11/08/2026`, received `10/12/2026→ to 10/25/2026`, the original symptom) |
| MF | the press decides from the page's stale periods (`todayJump` fed `periods.today_local`) | real clock | survives (2 passed): the stale and the fresh date are the same off midnight (risk R-UX2A2-4) |
| MF | the same | preload at 2026-10-25 23:59:20 PDT | **caught**: 2 failed (the same symptom) |
| MB1 | the window `focus` re-read removed | `today.spec.ts` "re-read" (both refresh tests and the midnight test), real clock | **caught**: 4 failed (own and shared refresh tests, both projects) |
| MB2 | the `visibilitychange` re-read removed | the same | **caught**: 4 failed (own view: 2 reads, expected at least 3; shared view: no read) |
| MB3 | both re-reads removed | the midnight test under the preload at 2026-10-25 23:59:20 PDT | **caught**: 2 failed (the tab refreshed by focus keeps the old tag: expected none, received 2026-10-25) |
| MB4 | the one-read-at-a-time guard removed | "re-read", real clock | **caught**: 4 failed (two focus events in one task: expected 1 read, received 2) |
| MG | the re-read goes to the person's own route in a shared view (`ownRequest` instead of `request`) | "re-read", real clock | **caught**: 2 failed (the shared-view refresh test, both projects: the read through the share never comes) |
| MC | the opacity rule restored (`button[aria-disabled='true'] { opacity: var(--opacity-disabled) }` added back beside the colour dimming) | `focus-ring.spec.ts` "inactive Today", both projects, real clock (window: Today made inactive by a press) | **caught**: 8 failed (opacity 0.6; painted ring 2.70 or 2.73:1 light, 3.34 or 3.16:1 dark, the original numbers) |
| MC | the same | the same, simulated 2026-11-04 15:00 PST (outside the window: Today inactive on landing) | **caught**: 8 failed (opacity 0.6; 2.70:1 light, 3.34:1 dark; the dark cases fail on the opacity and full-accent checks) |
| ME | the inactive Today's ring removed (`:focus-visible { box-shadow: none }` for it) | real clock | **caught**: 8 failed ("a focus ring is painted": 0 ring layers) |
| ME | the same | simulated 2026-11-04 15:00 PST | **caught**: 8 failed (0 ring layers) |
| MD | one renamed string reverted: `ClockOutDialog.tsx:74` "check-out time" to "clock-out time" | unit `userWording.test.ts` | **caught**: 1 of 3 failed, naming the file and line |
| MD2 | one renamed string reverted: `ClockPanel.tsx:20` "Checking your status" to "Checking the clock" | the same | **caught**: 1 of 3 failed, naming the file and line |
| baseline | no mutation, in the same scratch copy | "inactive Today" at 2026-11-04; "left open across" and "re-read" on the real clock | pass: 8 of 8 and 6 of 6 |

- **The FIX2 focus-ring tests are not vacuous on either branch.** Without mutation they pass on the real clock (a window
  day, where the test first presses the active Today) and at 2026-11-04 (outside the window, where Today is inactive on
  landing and the test focuses it, steps away with Shift+Tab and comes back with Tab): 8 of 8 each (`20-e2e-real.txt`,
  `64-full-1104-1500.txt`, `72-base-fr-1104.txt`). With MC they fail 8 of 8 on both days with the original numbers; with
  ME they fail 8 of 8 on both days because no ring is painted on the focused button. So on both branches the test
  focuses the inactive Today by keyboard and measures a real ring.

## 5. Risks (audit question 5)

- **R-UX2A-1, no `Cache-Control` on `/theme-init.js` and the other static files.** Unchanged: the server build is the same
  apart from the three literals, and my header read shows `/`, `/theme-init.js` and `/cd-logo.svg` without `Cache-Control`
  or `ETag` (`61-control-real.txt`). Still an acceptable carried risk for a later server round.
- **R-UX2A-2, rename survivors.** Closed by `userWording.test.ts` (section 1).
- **R-UX2A-3, the phone Review-link thresholds depend on the font.** Unchanged (the container thresholds are the same
  rem values); the new docs clause says "below about 330px", which is what I measured with this machine's system font
  (section 1). A phone with a wider system font may move the row break; a look on a real iPhone and Android phone during
  the pilot remains the optional step.
- **R-UX2A-4, axe `label-content-name-mismatch` on the phone day buttons.** Unchanged: every phone scan of mine reports
  it on the 14 day buttons and nothing else; the button code is not part of the fix round. Still pre-existing and
  optional.
- **R-UX2A-5, the period Today opens reads "future" in the window days.** Unchanged; the owner's optional question
  WP5-UX2-Q3 is open and its default (a) keeps it. I do not decide it.
- **R-UX2A2-1 (new, optional), the inactive Today differs from the active one mainly by hue.** Muted text against accent
  text is 1.04:1 in luminance (light) and 1.03:1 (dark); the borders differ by 1.51:1 and 2.09:1; the cursor turns to
  `not-allowed` only under a mouse (`75-ringcalc.txt`; the 0.6 opacity look of d1a20a7 differed by about 2.3:1). Inactive
  components are exempt from SC 1.4.11, the state is exposed to assistive technology (`aria-disabled` and the description
  "Already showing today"), a press is harmless (it re-reads, and moves only when the date has changed), and the docs/04
  rule "never colour alone" is written for day states; so this is not a defect. Optional: a non-colour cue (for example
  a dashed or no border while inactive), or the owner judges the screenshots
  (`audit2-inactive-today-desktop-light-next-synthetic.png` and three more).
- **R-UX2A2-2 (new, information), one more periods read when an own tab becomes visible.** The new screen re-read joins
  T09's check in/out lookup and the sheet reload, so a visible tab now makes 3 reads of `/api/periods/current` (2 before)
  plus the one or two timesheet reads T09 already made; it is bounded, user-paced and never loops (section 2). Optional:
  let the screen skip its own visibility re-read in the person's own view, where the T09 reload already renews the periods.
- **R-UX2A2-3 (new to the record, pre-existing, optional), the desktop label picker's name on days with a second label
  line.** My scan of the period 11/23-12/06 (desktop, all four theme situations) reports `label-content-name-mismatch` on
  the label-picker trigger of 2026-11-26 and 2026-11-27, the two holiday days: the trigger's name is
  "Label for {date}: {main label}" (`SheetWeekTable.tsx:117`) while its visible text also shows the second line of
  `LabelContent` (`sheetModel.ts:137-162`: on a holiday the holiday name and the word "Holiday"; on other days a leave
  line, "Work from home" or "Note"). The code is unchanged since 90b98ef and outside this round; earlier scans did not
  reach a holiday period. The main visible label is in the name, as AX-05 accepted for the day buttons. Optional: put the
  visible lines into the trigger's name in the pilot fix round.
- **R-UX2A2-4 (new, optional), the midnight decision is guarded only by a run under the simulated clock.** My mutant MF
  (the press decides from the page's stale periods instead of the fresh answer) passes the suite on the real clock and is
  caught only when `today.spec.ts:538` runs under the FIX10 preload within 90 s of a reporting-zone midnight (section 4);
  MA (no re-read at all) is caught on the real clock too. The preload method lives in handoff evidence, not in `scripts/`,
  docs/06 or DEVELOPMENT, so a later gate could skip it. Optional: a documented script or gate step for the midnight run,
  or a screen-level test that feeds a stale periods answer.
- **Observation (no defect).** After a mid-period midnight the hidden live region keeps the text of the last jump (an
  earlier date); it is not announced again, and the brief asked for the region to stay untouched by an inactive press.

## Findings

None. No defect was found in the fix round or in what it touches; the items above are optional risks and observations.

## Required gates unrun or blocked, and why

- None of the mandatory checks is unrun: typecheck, lint, `npm test`, the FULL e2e on both projects on the real clock,
  AC-13 once, my simulated-clock probes with one FULL run outside the window, and the mutations ran on this digest. The
  drill was not required (WP5-UX2-REGATE2 ran it; release image `sha256:6d1844425345…`). NAS items stay NOT VERIFIED as in
  every earlier gate.
- Calendar instants other than the real 2026-10-15 ran only under the simulated clock, validated by a control; the
  browser's own clock stays real by design, which makes the device-date checks stricter.
- Window focus and visibility were dispatched as events in the probes and in the suite: headless Chromium did not fire a
  window `focus` on a real tab switch (`bringToFront`) in my probe (0 events, 0 reads), so a tab switch was not observed;
  the real window focus of a keyboard walk that leaves and re-enters the document was observed (one read each), and the
  listener is the same one either way.
- axe-core 4.14.0 is a byte copy of the file the first audit downloaded into its own task folder (`70-axe-copy.txt`,
  SHA-256 recorded); it was injected only in my probe context, with the CSP bypassed there.
- My server and CLI runs used the e2e fixtures (OS-assigned loopback ports, own data folders) and `SMOKE_PORT` 48871 with
  `DATA_DIR` and `DATABASE_PATH` in the task folder.

## Disposition of previous findings

- WP5-UX2-AUDIT-01, 02 and 03: closed (section 1).
- WP5-UX2-REGATE's FAIL (the calendar-dependent focus-ring tests) is answered by FIX2 and observed fixed: the eight tests
  pass inside and outside the window (section 4).
- The earlier carried backlog (R-AB9-1 to R-AB9-6 and older) is untouched by the fix round.
- As the brief states, this PASS re-accepts WP5 on a643794 and supersedes WP5-UX-AUDIT-AB9 and the audits that pointed to
  it (the coordinator records `superseded_by` on the board).
- The first audit's risks: R-UX2A-2 closed; R-UX2A-1, -3, -4 and -5 carried (section 5); new optional R-UX2A2-1 to
  R-UX2A2-4.

## Software readiness, owner permission and pilot result

- **Software readiness:** re-accepted on a643794 / `229df806…` by this PASS, with WP5-UX2-REGATE2's gate PASS on the same
  digest (release image `sha256:6d1844425345…`, recorded by that gate). The pilot packet's identity refresh to this commit
  and image is the coordinator's step; nothing here changes data, the server or the pilot packet's decisions D-1 to D-15.
- **Owner permission:** none requested or given. No deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator:
- record WP5-UX2-AUDIT2 as PASS on a643794 / `229df806…`, and `superseded_by` WP5-UX2-AUDIT2 on WP5-UX-AUDIT-AB9 and the
  audits that pointed to it;
- put R-UX2A-1, R-UX2A-3, R-UX2A-4 and R-UX2A2-1 to R-UX2A2-4 into the backlog (R-UX2A-5 stays with the owner's optional
  question WP5-UX2-Q3);
- then the accept commit, the pilot-packet identity refresh (a643794, image `6d1844425345…`) and the WP5 re-accept records.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX2-AUDIT2, attempt 1.
  - Reviewer: self-reported `claude-opus-5-5`; a fresh subagent (the board records agent ID `a24468c424df70b4b` for this
    task; not observable from inside).
  - Reviewed authors (board): WP5-UX2-PLAN to PLAN4 (`a767b8896b0d1cc72`), T01 `a9d962e5be41fe678`, T02
    `ac90307b14c9bad40`, T03 `aff6b930318d2d3a0`, T04 `ae57a22e4eaa6440a`, T05 `a51d67415e6afc416`, T06
    `a04f4d6a819678578`, T07 `a4f3080aaa2d73816`, T08 `a96d4ba20fcf89e1e`, T09 `aabbee779a229a4a3`, T10
    `a291a953326b454ee`, FIX1 `aa625bed0af810281`, FIX2 `a7aa5daee5dc1129b`; all self-reported `claude-sonnet-5-5`, as are
    the freezes, WP5-UX2-GATE, REGATE and REGATE2. My model is not weaker than the strongest author model.
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes, ran no plan,
  slice, fix, freeze or gate of this round, and I am not the auditor of WP5-UX2-AUDIT (agent `aa1ac7827beb0fe41`). I edited
  no source, test, doc, board or STATE file. The exports, builds, probes and mutations lived in the task folder; in the
  repository I wrote only this review pair, the Results of my brief and `handoff/delivery/evidence/WP5-UX2-AUDIT2/`.
  Process notes: one foreground `sleep 1`, one `tail -c` read of a log file into another file, and one status line piped
  into `tail -n 0` against the brief's rule (it printed nothing; no file or process effect); two probe defects of my own
  were found and rerun after the fix, with both first logs kept (the first request probe expected no read from a
  wrapping Tab walk; the first ring sampler's 1x1 clip fell outside the ring on two sides and counted the theme radio's
  transparent outline as a ring); the task-local specs lived only in `px/`, never in the audited export; axe-core was
  copied, not downloaded. Nothing is left running.
- **Source digest before/after; gate evidence for that snapshot:** `229df806…0b04db3` (815 files) before and after, in
  three forms (`01-digest-before.txt`, `01-digest-after.txt`). It equals the WP5-UX2-REGATE2 digest of record (gate PASS on
  a643794; NAS items NOT VERIFIED).
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX2_REVIEW2.md` and `.vi.md`, both new;
  every earlier review is untouched.
- **Finding dispositions and next coordinator fix/recheck task:** WP5-UX2-AUDIT-01, 02, 03 and R-UX2A-2 closed; no new
  finding; no fix task is needed; the optional risks go to the backlog ("One next action").
