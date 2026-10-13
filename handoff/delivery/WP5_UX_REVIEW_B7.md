# WP5 UI redesign, independent area-B delta recheck (B7) — B6-01 fix, the compact phone shell bar, test strength and the mandatory checks

[Tiếng Việt](WP5_UX_REVIEW_B7.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round, task WP5-UX-AUDIT-B7, attempt 2,
  2026-10-13 (UTC 18:56Z to about 19:45Z). Attempt 1 (2026-10-09) stopped at a usage limit and left no record; I ignored its task
  folder. Reviewer self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from
  inside). Area A is rechecked separately (WP5-UX-AUDIT-A7) and is not covered here. The earlier area-B reviews
  [B](WP5_UX_REVIEW_B.md) to [B6](WP5_UX_REVIEW_B6.md) are preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `255ba17d6bf891c0ff779d4a4f518e0d2998cee8` (the WP5-UX-REGATE6 freeze). HEAD = origin/main = 255ba17 before and after; no later
  commit, so nothing outside `handoff/` differs. Digest `b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe`, 793 files,
  `handoff/` excluded. I recorded it first (18:57:10Z, right after `node --version`) and again after every check (19:36:18Z). The
  three forms are equal: `git ls-tree` at 255ba17 and at HEAD, `scripts/source-digest.mjs` in the repository, and the same script
  in a scratch clone at 255ba17. Source complete: a clean scratch clone, `npm ci` exit 0.
- **Decision: FIX REQUIRED.**
  - The delta is what FIX8 claims: CSS for the phone bar and two new mobile e2e tests. No test line was removed or weakened. The
    new tests fail on bf954c0 for their own reasons.
  - **B6-01 is closed.** At 390x844, in all four states, light and dark, the first day row ends above the tab bar.
  - Every area-B item the bar change can affect holds at 767, 390 and 320, light and dark, with and without a received share. Nothing
    changes at 768px and wider.
  - Typecheck, lint and `npm test` pass (82 files, 1823 tests). **The full e2e does not pass:** 204 passed, 6 failed, 26 skipped.
    The six failures are one test defect that predates FIX8: **WP5-UX-B7-01** (Low). Three tests seed "a past free workday" from
    the in-progress period. On the due Tuesday of every period, before 17:00 America/Los_Angeles, the app does not display that
    period first, so the tests fail before reaching their AC-01 isolation assertions.
    - Reproduced: at 255ba17 and at bf954c0.
    - Proven: scratch copies that take the day from the displayed period pass 6/6 in the same window.
  - A mandatory check that fails cannot pass, and the gate depends on the calendar day (AGENTS.md rule 5, docs/06 line 30). So
    this blocks.
  - No other blocking defect was found. The clipped select text (a gate observation) is a non-blocking regression, R-B7-1.

## Scope actually inspected and executed

1. **Delta proof:** `git diff bf954c0..255ba17` outside `handoff/` (`10-…`). I ran the two new tests on the bf954c0 build through a
   scratch copy of the 255ba17 spec in a base copy (`30-…`).
2. **My own Playwright probes** (`b7.probe.ts.txt`). They ran against my own built servers on ports 48420-48423, with synthetic
   accounts, two owners ("Synthetic Sharing Owner" view-only, "Synthetic Sharing Partner" edit), a grantee and a person without
   shares. They ran on both snapshots wherever a comparison mattered.
   - P1: first screen, four states, light and dark, at 390x844, plus 375/360/320 for information.
   - P2: switcher items, with a fresh page per width and per step.
   - P2t: Open by touch and pointer.
   - P2s: the shared-view switcher.
   - P3: Tab and Shift+Tab walks with 5x5 occlusion and ring checks.
   - P3b: rendered rings.
   - P4: every element's computed style and the shell-bar screenshots at 768px and wider.
   - P5: width sweep 300-420.
   - P6: 320x256.
   - P7: a check of the e2e sideways detector.
3. **Code and documents:** `styles.css` (shell bar, touch rule, switcher), `SharingSwitcher.tsx`, `AppShell.tsx` and
   `useBlockSize.ts`. docs/04 lines 7, 14, 48 and 80 (EN/VI), WP5-UX-PLAN section C and the A2 mockup caption, and docs/06.
4. **Mandatory checks at 255ba17:** typecheck, lint, `npm test` and the full e2e on both projects, all with deprecation tracing.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX-AUDIT-B7/` (index `00-README.txt`).

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms (before / after) | `b07727b2…4a95abe`, 793 files, all equal; HEAD = origin/main = 255ba17 | `00-…`, `00b-…`, `90-…` |
| `npm ci` / `npm run typecheck` / `npm run lint` (`no-deprecated`) | exit 0 / 0 / 0; no deprecation line | `02a-…` to `02c-…` |
| `npm test` (deprecation tracing) | exit 0; 82 files, 1823 tests | `03-…` |
| `npm run test:e2e` (build + full suite, Edge, both projects, deprecation tracing), 19:01-19:07Z | **exit 1: 204 passed, 6 failed, 26 skipped** (desktop 100/3/15, mobile 104/3/11). Failures: `shell.spec.ts:67`, `isolation.spec.ts:94`, `isolation.spec.ts:145` on both projects, all on `[data-day="2026-10-12"]` not found. `automation.spec.ts:118` passed on both projects (no ECONNRESET); both new FIX8 tests passed (mobile) | `04-…`, `04a-…` |
| The 6 failing tests again at 255ba17, then on the bf954c0 build | 6 failed / 6 failed, same locator: pre-existing, not from FIX8 | `04b-…`, `04c-…` |
| Failure context | displayed period 09/28-10/11/2026, "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)"; the seeded day 2026-10-12 is in the in-progress period | `04d-…` |
| Scratch copies with `displayedPeriodFreeWorkdays()` (one line each) at 255ba17, same window | **6 passed**, exit 0 | `04e-…`, `04f-…` |
| `git diff --stat/--numstat bf954c0..255ba17` outside `handoff/` | `src/client/styles.css` +25/-0, `tests/e2e/sharing.spec.ts` +51/-0; one commit; 0 removed test lines | `10-…` to `10d-…` |
| New FIX8 tests on the bf954c0 build | 2 failed (mobile), each for its own reason: first row bottom 812.8 > 788.5; shell bar 106.8 > 60; 2 skipped (desktop, project condition) | `30-…` |
| P1 first screen, 390x844, light and dark | all four states fully visible (table below); bf954c0: share + note 812.8 > 788 | `50-…`, `50b-…`, screenshots |
| P2/P2t/P2s switcher at 767 (both projects), 640 (desktop = 1280 at 200%), 390/375/360/320, light and dark | label visible, name, AX-06, targets, contrast, zoom and reflow hold (table below); select value clipped (R-B7-1) | `51-…` to `51f-…` |
| P3 walks: desktop 767; mobile 767/390/320; light and dark; Timesheet, day editor, shared view-only and edit; with and without a share | **128 walks, 2928 stops: 0 entirely hidden, 0 partly covered by a bar, minimum 25/25 sample points visible, 0 without a ring, 0 rings with no side shown, 0 stops outside the modal editor**; Escape closes the editor and returns focus to the day button | `52-…`, `52b-…` |
| P3b rendered rings on the switcher's select and Open (own and shared view) | 4 sides at every width: 6.09:1 light, 6.79:1 dark | `52c-…` |
| P4 768/1024/1280 (desktop) and 768x1024 (mobile), light and dark, with and without a share, bf954c0 against 255ba17 | 24 states, 8696 element comparisons, **0 differing** computed values; `--shell-bar-size` and `scroll-padding-top` equal; 24 shell-bar screenshots byte-identical | `53-…` |
| P5 sweep 300-420 px (both projects) | one row from 355 px (bar 60), wraps below (90.83); 0 sideways, 0 overlap, targets 44, label visible at all 121 widths | `54-…`, `54b-…` |
| P6 320x256 (1280x1024 at 400%) | bar 90.83 (bf954c0 106.83), no sideways scroll, Tab walk 25/25 visible at every stop | `55-…` |
| P7 e2e sideways expression with a forced 600 px overflow | mobile project: innerWidth grows to 616 = scrollWidth, so `scrollWidth <= innerWidth` still passes; clientWidth stays 390. Desktop project: caught (R-B7-2) | `56-…`, `56b-…` |
| CSS token scan (255ba17 and bf954c0) | 0 colour or duration literals outside the token blocks, 0 undefined `var()`, 7/7 transitions `var(--transition)`, `--radius: 4px`; the one compound radius (`var(--radius) var(--radius) 0 0`, bottom sheet) predates the delta | `20-…` |
| docs | no doc in the delta; docs/04 line 48 and line 80 EN/VI unchanged | `60-…` |

## B6-01 disposition: closed

Mobile project, 390x844, real sign-in, 14 day rows, reduced motion. Each cell gives the first `[data-day]` bottom, then the margin to
the tab bar top (788 px). Light and dark are identical. scrollY is 0 and there is no sideways scroll.

| State (390x844) | 255ba17 | Shell bar | bf954c0 |
|---|---|---|---|
| No received share, zone note shown | 757.97 (+30.03) | 52 | 757.97 |
| No received share, zone note hidden | 659.02 (+128.98) | 52 | 659.02 |
| Received share, zone note shown | **765.97 (+22.03)** | 60, one row | **812.80 (-24.80)**, bar 106.83 |
| Received share, zone note hidden | 667.02 (+120.98) | 60, one row | 713.84 |

The measured `--shell-bar-size` equals the bar height in every state (52 / 60 / 90.83 px). Numbers at the other widths are for
information only (`50-…`):

| Size | No share, note | Share, note | Share, no note |
|---|---|---|---|
| 375x812 | 775.36 vs 756 | 783.36 vs 756 | 667.02 vs 756 |
| 360x800 | 827.36 vs 744 | 852.75 vs 744 | 736.41 vs 744 |
| 320x640 (bar 90.83 with a share) | 924.92 vs 584 | 963.75 vs 584 | 830.02 vs 584 |

## Area-B items the bar change can affect (767, 390, 320; light and dark; with and without a received share)

| Item | Result |
|---|---|
| Visible label (SC 3.3.2) | "Shared with me" is visible at every width (12 px, two lines), inside the viewport and not covered. Without a share the switcher is absent and the bar is 52 px |
| Name contains the label (SC 2.5.3) | ARIA snapshot `combobox "Shared with me"`; exactly one combobox with that exact name; form `Shared with me`; button `Open` |
| AX-06 (SC 3.2.2) | ArrowDown, ArrowDown, ArrowUp, End, Home, PageDown and ArrowDown on the select change the value and keep `#/timesheet`. No share bar appears and no request other than GET is sent. Tab lands on Open, and Enter opens `#/shared/{owner}/timesheet` with the share bar. A tap (mobile) or click (desktop) on Open does the same in fresh pages. Owner-only controls in the shared view: 0 |
| 44x44 targets | select at least 90x44 (138x44 at 390, 149x44 at 320), Open 67x44, label 44 high; 0 bar controls under 44 at 300-420 px |
| Contrast of the smaller label (SC 1.4.3) | 12 px normal text: 5.83:1 light (rgb 91,102,117 on white), 6.56:1 dark; select value 14.57 / 14.91 |
| Resize text (SC 1.4.4) | Browser zoom 200% on a desktop gives 1280→640 and 767→384: the bar stays one row (60 px), with no sideways scroll and no overlap. 200% text-only (root 30 px) at 767 and 640: no sideways scroll, label 24 px visible, bar 85.6 / 139.3 px followed by `--shell-bar-size`. On phone widths, 200% text-only needs 456 px and Open overlaps the select's arrow by about 8 px; this is identical at bf954c0, so it predates FIX8 (R-B7-4) |
| Reflow at 320 (SC 1.4.10) | layout = inner width = 320, scale 1, no sideways scroll, every bar element inside the viewport; 400% of 1280 (320x200) and 320x256: no sideways scroll |
| Focus not obscured (SC 2.4.11) | 128 walks, 2928 stops, 0 entirely hidden and 0 partly covered by the shell bar, tab bar, share bar or editor head |
| Visible focus rings | Every stop shows a ring; the date field shows it on its `:focus-within` wrapper, as B6 R-12 recorded. Select and Open: rendered ring on 4 sides, 6.09 / 6.79 |
| Tokens, 4px radius, shared transition | new rules use `var(--space-3)`, `var(--switcher-basis)` (new token 16rem in `:root`), `var(--font-size-xs)` and `0`; select and Open radius 4 px and transition `var(--transition)`; scan clean |
| No change at 768px and wider | 0 differing computed values over 8696 element comparisons; screenshots byte-identical |

## Gate observations judged

- **Clipped select text.** It is not a WCAG 2.2 AA failure:
  - SC 1.4.10: at 320 px nothing scrolls in two dimensions and no function is lost.
  - Activating the native select lists every full name, with the chosen one marked.
  - The combobox exposes the full selected option as its value, and the relationships are programmatic (SC 1.3.1).
  - After Open, the share bar names the owner in full ("Viewing Synthetic Sharing Owner's timesheets - view only").
  - docs/04 promises only that the share bar names the owner.

  The clipping can still hide which owner is chosen before Open. Names that share a prefix ("Synthetic Sharing Owner" and "Synthetic
  Sharing Partner") show the same text. FIX8 made this worse at 355-420 px (R-B7-1).
- **First screen below 390.** docs/04 line 48 (EN and VI) promises the budget "at 390x844" only. Plan C ("The first day row appears
  within the first screen") is stated for the A2 mockup at 390 px, and nothing promises smaller widths. Even a person without a
  received share misses the budget with the zone note at 375x812 and 360x800, both before and after FIX8. So this is not a defect.

## Test strength

- FIX8 adds 51 lines and removes none. The two tests skip on the desktop project by project condition and fail on bf954c0 for
  their own reasons. They assert:
  - the first row bottom against the tab bar top (+0.5);
  - a one-row bar (at most 60);
  - scrollY 0;
  - select and Open at least 44x44 and inside the bar;
  - the visible label;
  - no sideways scroll. This last assertion is vacuous on the mobile project (R-B7-2).
- **No assertion was removed or weakened in the delta.**

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX-B7-01 | Low (test only; blocks because a mandatory check fails) | `tests/e2e/shell.spec.ts:68` and `tests/e2e/isolation.spec.ts:52` (`seedOwner`, used by `:94` and `:145`) take the day from `pastFreeWorkdays()` (`tests/e2e/fixtures.ts:392-406`). That helper returns days from both `periods.in_progress` and `periods.current`, newest first. The app displays `periods.current` first | Run `npm run test:e2e` on the due Tuesday of any period, between 00:00 and 17:00 America/Los_Angeles (here 2026-10-13, 19:01Z). The helper returns the Monday 2026-10-12 of the in-progress period, while the page shows 09/28-10/11 (due Tue 10/13 17:00). `[data-day="2026-10-12"]` is never found. The same 6 tests fail on the bf954c0 build (`04b-…`, `04c-…`, `04d-…`) | Expected: the required browser suite passes on any day, and the AC-01 isolation flows (hash swap, id swap, admin screens) run every time. Actual: 6 failures on both projects for about 17 hours of every 14-day period, before any isolation assertion runs | AGENTS.md rule 5 (follow the required acceptance gate; this audit's mandatory full e2e); docs/06 line 30 (deterministic clocks); docs/06 AC-01 evidence | Seed from the period the app displays first. For example, call `displayedPeriodFreeWorkdays()` at both call sites: my scratch copies with exactly that one-line change pass 6/6 in the failing window (`04e-…`, `04f-…`). Or navigate the page to the period that contains the chosen day. Keep every isolation assertion. Consider the edge case where the displayed period has no past normal workday (a holiday Monday after the due time) |

## Risks and optional improvements (not defects)

- **R-B7-1 select value clipped (a regression from FIX8, non-blocking).** The one-row bar narrows the select at 355-420 px: content
  120 px at 390 instead of 185, 107 at 375 instead of 171, 94 at 360 instead of 158.
  - "My timesheets" is now clipped at 355-385 px ("My timeshe" at 360, "My timesheet" at 375). At bf954c0 it was clipped only at
    300-313.
  - An owner name of about 160 px is clipped at every width 300-420. At bf954c0 it fitted from 388 px; at 390 the screen now shows
    "Synthetic Sharin" where bf954c0 showed "Synthetic Sharing Owner" (`51e-…`, `51f-…`, screenshots).
  - Optional fixes:
    - let the switcher wrap below the brand when the select would get less than about 10rem. The first-screen budget is promised
      only at 390x844, which still fits one row only if the select keeps enough room;
    - or shorten the visible label text;
    - or show the chosen owner's name next to Open.
- **R-B7-2 the e2e sideways checks are vacuous on the mobile project.** `expectNoSidewaysScroll` (`sharing.spec.ts:172-177`, also
  used by both new tests) and the same expression in 10 other spec files compare `scrollWidth` with `window.innerWidth`. Under the
  `isMobile` emulation, a page wider than the device zooms out, so innerWidth grows with the content: a forced 600 px block gives
  616 = 616 and the check passes (P7). `timesheet.spec.ts:57` and `:181` use `clientWidth`, which catches it. My probes found no overflow at phone
  widths with `clientWidth`, so this is not a product defect. Recommended: compare with `document.documentElement.clientWidth`.
- **R-B7-3 the label wraps to two lines at every width below 768 px**, even at 767 where the label box is 577 px wide, because the
  select grows first. At bf954c0 the label also wrapped, at 15 px. Cosmetic.
- **R-B7-4 200% text-only on phone widths (pre-existing).** The switcher row needs 456 px, so the page scrolls sideways. Open
  overlaps the select's right edge (its arrow) by about 8 px. Both are identical at bf954c0, where the bar was even taller (216 px
  against 174). Browser zoom on a desktop (the G142 technique) shows neither. Optional.
- **Carried forward from B6 (not re-judged beyond the delta):** R-10, R-11, R-13, R-14, R-16 to R-20.
- **Information:** `npm ci` reports 1 high advisory, which earlier reviews traced to a dev dependency; I did not re-verify it here.

## Required gates unrun or blocked, and why

None unrun. The full e2e ran once on both projects; it failed only through WP5-UX-B7-01, which I reproduced on both snapshots and
traced. I did not rerun the full suite after 17:00 America/Los_Angeles. The scratch run in `04e-…` already shows the six tests
pass in the same window once the seed day is taken from the displayed period. Area A is outside this review.

## Disposition of previous findings

- WP5-UX-B6-01 is **closed** (table above).
- B6 risks R-10, R-11, R-13, R-14 and R-16 to R-20 are outside the delta and unchanged.
- R-B7-1 to R-B7-4 are new and optional.
- WP5-UX-B7-01 is new and open.

## Software readiness, owner permission and pilot result

- **Software readiness, area B:** not yet, only because of WP5-UX-B7-01, a test-only Low defect. The product behaviour in the delta
  passes.
- **Owner permission:** none requested or given. No deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator: open a small test-only fix task for WP5-UX-B7-01. It changes the two seed call sites, or makes the page open the
period that contains the seeded day. Then run a freeze, a gate with the full e2e, and an area-B recheck limited to the two spec
files plus the mandatory checks. Optionally decide R-B7-1 in the same round.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX-AUDIT-B7, attempt 2.
  - Reviewer: self-reported `claude-opus-5-5` (a fresh subagent; its agent ID is not visible from inside).
  - Reviewed authors: WP5-UX-FIX8 (`claude-sonnet-5-5`); the FIX8 freeze and WP5-UX-REGATE6 (verifier and committer); the earlier
    round authors, the strongest of which is `claude-opus-5-5`. My model is not weaker than the strongest author.
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no gate, fix or
  earlier audit of this round. I edited no source, test, doc, board or STATE file.
  - My probes and the scratch spec copies lived only in the task folder clone and base copy, excluded through `.git/info/exclude`.
  - Process notes: a first listing file was written next to the task folder and moved into it at once. Two probe versions reused one
    mobile page across zoom steps, which broke Playwright's tap; this was a probe artefact, and fresh pages show every tap working.
    One probe screenshot name was refused and then renamed. Details are in `00-README.txt`.
- **Source digest before/after; gate evidence for that snapshot:** `b07727b2…4a95abe` before and after, three forms (`00-…`,
  `90-…`); it equals the WP5-UX-REGATE6 digest of record.
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX_REVIEW_B7.md` and `.vi.md`, both new files;
  every earlier review is untouched.
- **Finding dispositions and next coordinator fix/recheck task:** B6-01 is closed and WP5-UX-B7-01 is open. Next: the test-only fix
  above, then a gate and an area-B recheck.
