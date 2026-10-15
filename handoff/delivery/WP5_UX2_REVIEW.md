# WP5 UI change round 2, independent audit of areas A and B on d1a20a7 (WP5-UX2-AUDIT)

[Tiếng Việt](WP5_UX2_REVIEW.vi.md) is the translation; English is authoritative.

- **Package/date/reviewer and observable model/effort:** WP5 owner-requested UI change round 2 (slices WP5-UX2-T01 to T10), task
  WP5-UX2-AUDIT, attempt 1, 2026-10-15 from 06:40Z to about 08:35Z (2026-10-14 23:40 to about 01:35 in America/Los_Angeles). Reviewer
  self-reported model `claude-opus-5-5`, profile timesheet-auditor (effort set by the profile, not observable from inside). One combined audit of
  area A (period bar, Today, Current period, sheet, accounting dates) and area B (shell, brand, theme, controls, accessibility, sharing). Every
  earlier review (A to A7, B to B7, AB8, AB9) is preserved unchanged.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** commit
  `d1a20a7f0112fa00171fe4b1d6035427855f12b6` (the WP5-UX2-T10 freeze, the WP5-UX2-GATE `freeze_commit`). HEAD = origin/main = d1a20a7 before and
  after; no unpushed commit; no path outside `handoff/` modified or untracked. Digest
  `20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5`, 814 files, `handoff/` excluded, recorded first (06:41Z) and last
  (08:30Z), each time in three equal forms: a clean `git archive` export hashed with `git hash-object --no-filters`, the
  `git ls-tree d1a20a7` form (its sorted list byte-identical to the export's), and `npm run digest` in the repository. Source complete: `npm ci`
  exit 0 in the export.
- **Decision: FIX REQUIRED.**
  - The round does what the owner asked in all 16 requested items and both answers (section 1). The coordinator's choices (wordmark from
    1440px, "Review" as the short form of the other review labels, the arrow, the app-wide hover token, the 112px phone bar with a share, the
    reworded docs/10 entries E-1 and F-Q5) respect the requests and are documented.
  - Today and Current period use only the server's `today_local`, `current` and `in_progress`, in the own view and in a shared view (the
    owner's dates), on window days, at midnight, on both DST days and at the year turn, with the device far from the reporting zone (section 2).
  - No check in/out exists in any shared view on any width, the ClockProvider never acts for another person, and the grantee's rights are
    unchanged (section 3). The server delta is exactly three message literals and one comment (section 4). Brand assets are vector, safe and
    faithful to the owner's images; no font file is in the repository; the CSP is unchanged (section 7).
  - The mandatory checks pass: typecheck 0, lint 0, `npm test` 88 files / 1878 tests, the FULL e2e on the real clock 434 passed / 0 failed /
    42 skipped (desktop 209/29, mobile 225/13), AC-13 1/1; build 0, smoke PASSED; 0 deprecation lines.
  - Three Low findings block a clean acceptance: WP5-UX2-AUDIT-01 (Today stays inactive and does nothing after the accounting date passes
    midnight while the page is open), WP5-UX2-AUDIT-02 (docs/04 and docs/10 omit the 320px row of the phone buttons) and WP5-UX2-AUDIT-03
    (the inactive Today's focus ring is dimmed by `opacity: 0.6` to 2.70:1 in the light theme, below the owner-decided 3:1). Each has a small
    bounded fix. Every mutation the brief lists is caught (section 6); the rename reverted in three places no test reads survives (risk
    R-UX2A-2).
  - Five optional risks (R-UX2A-1 to R-UX2A-5) are listed separately; R-UX2-1 (no `Cache-Control` on `/theme-init.js`) is judged acceptable.

## Scope actually inspected and executed

1. The board's owner and coordinator decisions of 2026-10-14 (verbatim), the plans PLAN to PLAN4, the mockup, the slice records T01 to T10,
   the gate record and its screenshots, the AB9 review and the AX-01..AX-10 sweep, read as claims.
2. The whole diff 90b98ef..d1a20a7 outside `handoff/` (67 paths): the client source, the CSS, the server file, the tests and the docs.
3. Mandatory checks in a clean export: typecheck, lint, `npm test`, build, smoke, the FULL e2e on both projects on the real clock, AC-13.
4. Own clean builds of 90b98ef and d1a20a7 and a file-by-file diff of `dist/`; a header probe of both built servers.
5. Own simulated-clock probes (window days, midnight, DST, year turn, far device zones, a shared owner in another zone) and a midnight
   reproduction with the page left open.
6. An axe-core scan and keyboard walks at 1440, 1280, 1024, 768 and 390, 375, 360, 320 in light, dark and both manual overrides, plus the
   painted focus ring of the inactive Today; an axe baseline on 90b98ef.
7. A re-render of the logo and the wordmark next to the owner's source images.
8. Mutations at unit and e2e level (24 runs: 19 e2e and 5 unit or integration; 20 distinct mutants).
9. The docs: docs/04, docs/10, docs/12, the renamed lines of docs/01, docs/02 and DEVELOPMENT, EN and VI.

## Evidence table

All evidence is masked LF text in `handoff/delivery/evidence/WP5-UX2-AUDIT/` (index `00-README.txt`), plus four `-synthetic.png` images.

| Command | Result / exit | Evidence |
|---|---|---|
| digest, three forms, first and last; HEAD; non-handoff status | `20e7a7c8…a609773fa5`, 814 files every time; export list = `ls-tree` list; HEAD = origin/main = d1a20a7; no non-handoff change | `01-digest-before.txt`, `01-digest-after.txt` |
| `npm ci` (clean export) | exit 0 | `02-ci-exit.txt` |
| typecheck / lint (`no-deprecated`) / `npm test` / build / smoke | 0 / 0 / 0, 88 files, 1878 tests / 0 / 0, SMOKE PASSED; 0 deprecation lines in each log; a second `npm test` run: 0, 88 / 1878 | `05-…` |
| FULL e2e, both projects, REAL clock, 2026-10-14 23:44-23:54 PDT (window day) | **exit 0: 434 passed, 0 failed, 42 skipped** (desktop 209/29, mobile 225/13), 9.8 min | `20-…` |
| AC-13 `tests/integration/ac13-two-week.test.ts` once (and once more with `TZ=Asia/Tokyo` set) | exit 0, 1/1 (both) | `21-ac13.txt`, `21-ac13-tokyo.txt` |
| `git diff --stat 90b98ef d1a20a7` (scope; server, domain, migrations) | 67 paths; server/domain/migrations: only `timesheetCommands.ts` 4/4 | `10-…`, `11-…` |
| own builds of 90b98ef and d1a20a7, `diff -r dist/` | `dist/domain` identical; `dist/server` 1 of 180 files, 4 lines (3 literals, 1 comment) | `13-…` |
| header probe of both built servers | CSP identical; `/theme-init.js` `text/javascript`, `/cd-logo.svg` `image/svg+xml`, `nosniff`; no `Cache-Control` on any static file (both builds) | `81-…` |
| fonts and rasters in `git ls-files` | 0 font files; one older synthetic `.jpg` outside the round | `10-fonts.txt`, `10-rasters-nonsynthetic.txt` |
| client device-clock grep; visible "Clock" strings | 0 / 0 | `31-…`, `33-…` |
| test diff | 76 removed lines, all replaced by equal or stronger checks; 5 project-conditional skips added; no only/fixme/fail/slow/soft | `50-…` |
| docs parity EN/VI, wording grep | same structure and literal tokens; only the quoted owner request keeps "Clock in/out" | `40-…`, `41-…` |
| simulated-clock control | server `today_local` 2026-10-26 at 00:30 PDT; real 2026-10-14 | `61-…` |
| own Today probes, 11 instants, both projects | 8 passed, 2 skipped, 0 failed each | `62-probe-*.txt` |
| midnight probe (page open across 2026-10-25/26) | **fails**: Today stays inactive, the press does nothing (finding 01) | `62-probe-midnight-1025.txt` |
| suite sweep: today/timesheet at 2026-10-26 00:30, today at 2026-10-30 23:45 | window branch both; 59 passed / 0 failed / 11 skipped and 17 / 0 / 5; away budget 690.0 and 591.0 of 788 | `64-…` |
| axe-core 4.14.0 scan; axe baseline on 90b98ef | 144 scans: desktop 64/64 clean; phone: only the day-button name mismatch that 90b98ef shows too, and `target-size` on the review link at 375px while scrolled under the sticky bar with an overlay open (the follow-up without the share shows none) | `70-…`, `71-…`, `74-…` |
| keyboard walks | 32 walks, 2,784 stops: 0 without a ring, 0 hidden, 0 under 24px, 0 round-2 phone controls under 44px, no sideways scroll | `71-…` |
| painted ring of the inactive Today | inactive 2.70:1 (light) and 3.34:1 (dark), active 6.09 / 6.79; both projects, four situations (finding 03) | `71-…`, `75-ringcalc.txt` |
| mutations, unit and e2e | 20 mutants in 24 runs: 16 caught, including every one the brief lists; 4 survive: the rename in three untested places (R-UX2A-2) and `nowrap` alone (equivalent); the scratch digest equals 20e7a7c8… after every restore | `72-…`, `70-mut-*.txt`, `73-mutation-summary.txt` |
| logo and wordmark against the owner's images | logo mean diff 0.456 / 0.437 / 0.424 at 512 / 64 / 32 px; wordmark luminance diff 30.8/255, ink IoU 0.655 | `80-fidelity.txt`, `audit-brand-fidelity-synthetic.png` |

## 1. Owner fidelity (audit question 1)

Read against the verbatim owner texts of 2026-10-14 on the board (`owner_decisions`), the mockup, the gate screenshots and my own runs.

| Owner request (2026-10-14) | As built on d1a20a7 | Verdict |
|---|---|---|
| UX2-1 (1) highlight the whole column of the open Day editor | Desktop: accent rails on both sides, an underline on the head and a light fill behind every cell, on top of the Today bar and the batch ring; phone: the row is framed; `aria-current="true"` on that day's button only | Done |
| UX2-1 (2) a lighter Label picker selection | 1px open line on the trigger, the active option a light fill with a 3px leading rail (no frame), the current value accent text with a check | Done |
| UX2-1 (3) a dark/light toggle in the main navigation | Desktop top bar (user group); phone More panel; stored per device, applied before first paint | Done (later reshaped by UX2-4 (3)) |
| UX2-1 (4) a clearly visible hover on toggle buttons | Hover fill 1.23:1 (light) / 1.45:1 (dark) against rest (was 1.13 / 1.09) with an accent boundary; pressed is solid accent and keeps its look under the pointer | Done; the coordinator's app-wide hover token is a consistent extension, recorded in docs/10 and docs/04 |
| UX2-1 (5) an explicit Today button | Today in the period bar, server dates only, moves an open editor to today | Done, with finding WP5-UX2-AUDIT-01 (a page left open across midnight) |
| UX2-1 (6) Show details as a slide toggle | Native checkbox with `role="switch"`, 44x24 track, thumb position and fill | Done |
| WP5-UX2-Q1: Today = the period that contains today; a second button back to the opening period | Today targets `in_progress`; "Current period" targets the R-07 `current`, shown only in the five window days and only away from it | Done; the name "Current period" matches the period's "current" badge |
| UX2-2 (1) the logo replaces the brand text, "CDSemi" where there is room | The traced vector logo (also the favicon); the text was then replaced by the wordmark of UX2-3 | Done (superseded by UX2-3 (1)) |
| UX2-2 (2) phone: Check in/out in the header bar; Today, Current period and Review in one row | The bar holds the status and one button on every own screen (60px, 112px with the "Shared with me" row); the three buttons share one row at 390, 375 and 360px | Done at 390/375/360; at 320px with Current period the Review link takes its own row, which docs/04 does not say (finding WP5-UX2-AUDIT-02) |
| UX2-2 (3) "Clock in/out" becomes "Check in/out" | Every visible client string, three server message literals, docs/01, 02, 04, 10, 12 and DEVELOPMENT; API paths, codes and identifiers keep "clock" | Done; some renamed strings have no test (risk R-UX2A-2) |
| UX2-3 (1) the two-line wordmark beside the logo, image colours, company font | Vector outlines (no font file), "Semiconductor" as a capital S plus small capitals over "SERVICES, INC.", `#006eba` / `#4c4f57`, logo left, text right, from 1440px | Done; the 1440px threshold (plan: 1280) keeps a bar with a share on one row, documented in docs/10 |
| UX2-3 (2) remove the company line from the on-screen timesheet | Removed from the Timesheet and the Review sheets; the PDF keeps its header | Done |
| WP5-UX2-Q2: outlines allowed; lighter tints in dark | Outlines; dark uses `--accent` / `--muted` (6.79 / 6.56:1 on the bar) | Done |
| UX2-4 (1) phone: "Sign off" instead of wrapping, full text when it fits | One line, 44px; "Sign off" for "Review & sign off", "Review" for "Review now" and "Review or correct"; accessible name the full label | Done; "Review" for the other two labels is a reasonable coordinator choice, documented |
| UX2-4 (2) more space between brand and menu on large screens | 32px from 1440px (was 24px), where the wordmark shows; 24px below 1440px, where only the 36px logo shows | Done for screens of 1440px and wider; documented. Between 1280 and 1439px the gap is unchanged (logo only); the owner may want to look at it on his own screen (no defect) |
| UX2-4 (3) Dark/Light toggle with icons instead of the "Dark mode" button | A "Theme" radio group, Light (sun) and Dark (moon), in the bar and in More | Done |
| UX2-4 (4) "Due" in the label style | "Due" in the label colour and weight of "Payroll date", the value keeps the value style, text content unchanged | Done |
| UX2-4 (5) the "to" of a period range | An `aria-hidden` label-coloured arrow with a hidden " to " (screen readers read "to"); live-region texts and the PDF keep "to" | Done; the coordinator's choice among the owner's options, documented |

Other coordinator choices: the 112px phone bar with a share is the honest cost of the header clock and keeps the first screen (worst landing
state 722.4 of 788); the docs/10 entries E-1 and F-Q5 were reworded to "Check out"/"Check in/out" for terminology only, disclosed in the new
docs/10 terminology bullet, while the verbatim history stays on the board. I accept both.

## 2. Accounting date and zones (audit question 2, AGENTS rule 7)

- **Source.** `src/client` contains no device-clock read: a grep for `new Date(`, `Date.now`, `Date.UTC`, `performance.now` and `Temporal.`
  finds nothing (`31-device-clock-grep.txt`, empty). `periodJumpModel.ts` takes the server's `today_local`, `current` and `in_progress` and
  only compares ISO dates; `TimesheetScreen.tsx` reads them through `request('/periods/current')`, which is the share's requester in a shared
  view. Today's target is `in_progress.payroll_date`; Current period's is `current.payroll_date`; Current period is visible only when
  `current != in_progress` and the shown period is not `current`.
- **My simulated-clock probes** (FIX10 `shiftclock.mjs`, byte-identical copy; control: the built server reports the simulated `today_local`,
  2026-10-26 at 00:30 PDT, `61-…`). The browser is not shifted, so its own date is the real 2026-10-14/15 while the server is days or months
  away: a client that used the device date would fail every probe. The task-local spec `zz-audit-probe.spec.ts` ran on both projects with the
  device in Pacific/Kiritimati (UTC+14) and in Pacific/Pago_Pago (UTC-11), plus a shared view whose owner reports in Pacific/Kiritimati while
  the grantee's device is in Pago Pago. Eleven instants: 2026-10-25 23:30 (late on P-5, before the window), 2026-10-26 00:30 (P-4, the
  first window day), 2026-10-28 12:00, 2026-10-30 23:50 (P), 2026-10-31 00:30 (P+1), 2026-11-01 01:30 PDT and 01:30 PST (the repeated DST
  hour), 2027-03-14 03:30 (after the spring change), 2026-12-31 23:50, 2027-01-01 00:30 and the real clock. Every run: 8 passed,
  2 skipped (the desktop-only editor test, in both device zones, on the mobile project), 0 failed (`62-probe-*.txt`). In each the Today tag
  sat on the server date, Today was inactive exactly when the shown period held that date, Today opened `in_progress`, Current period
  appeared only in the window and returned to `current`, an open editor moved to the server date, and each jump re-read
  `/periods/current`. In the shared view both buttons followed the owner's dates, also on the instants where the owner's day differs from
  the grantee's (for example 2027-03-14 03:30: owner 2027-03-15 in the window, grantee 2027-03-14 outside it), with no request to
  `/api/clock` or to the grantee's own `/api/periods/current`.
- **The suite's own sweep** at the first window day: `today.spec.ts` and `timesheet.spec.ts` at 2026-10-26 00:30 PDT (window branch: exit 0,
  59 passed, 0 failed, 11 skipped; away budget at 390x844 with the Today tag on the first row 690.0 with the zone note and 591.0 without, of
  788); and `today.spec.ts` at 2026-10-30 23:45 PDT (window branch: exit 0, 17 passed, 0 failed, 5 skipped; `64-…`).
- **Midnight with the page open: finding WP5-UX2-AUDIT-01.** `zz-audit-midnight.spec.ts` signs in at 2026-10-25 23:59:20 PDT (P-5, the last day
  of the period in progress), waits until the server's date becomes 2026-10-26 (the first window day, `in_progress` moves to 10/26-11/08), then
  presses Today. The page still shows Today inactive (`aria-disabled="true"`), the Today tag on 10/25, and the press changes nothing: the sheet
  stays on 10/12-10/25 (`62-probe-midnight-1025.txt`: expected `10/26/2026→ to 11/08/2026`, received `10/12/2026→ to 10/25/2026`).

## 3. Ownership and sharing (audit question 3)

- **No check in/out in a shared view, on any width.** `AppShell.tsx` renders `ClockProvider enabled={route !== 'shared'}`; disabled, the provider
  gives a `null` context, makes no request and shows no dialog; `BarClock` and `ClockPanel` render nothing without it, and the Timesheet page
  renders the card only for `own && desktop`. My probe opened an edit share on both projects and checked 1280 or 390, then 1440, 390 and 320:
  no "Check in", "Check out", "Clock in" or "Clock out" button, no `.bar-clock`, `.clock-panel` or `[data-clock]`, no "Check in and out" region,
  and no `/api/clock` request in the whole session (`62-probe-*.txt`). `sharing.spec.ts` and `shell.spec.ts` assert the same and passed.
- **The ClockProvider never acts on another person's timesheet.** It calls only the person's own routes through `api()` (`/api/clock/in`,
  `/api/periods/current`, `/api/timesheets/{date}`), never the shared requester; the Timesheet page reports its view to it only when `own`
  (`TimesheetScreen.tsx:159-163`); leaving for a shared address resets its state (`ClockProvider.tsx:134-142`).
- **The grantee's allowed actions are unchanged.** `dist/server` differs from 90b98ef only in three message literals and a comment, so every
  route, guard and share allowlist is byte-identical. In the client a grantee gains only Today and Current period, which navigate through the
  share (`expectOnlySharedRequests` in `sharing.spec.ts:539-624`, and my probe found no request to the grantee's own periods).

## 4. Server delta (audit question 4)

- `git diff --stat 90b98ef d1a20a7 -- src/server src/domain migrations`: only `src/server/services/timesheetCommands.ts`, 4 insertions and 4
  deletions (`10-bound-stat.txt`, `11-server-src-diff.txt`).
- My clean builds of both commits (`npm ci` and `npm run build`, exit 0 each): `dist/domain` identical (46 files, `diff -r` exit 0);
  `dist/server` 180 files each and exactly one differs, `services/timesheetCommands.js`, in four lines: "Clock out of the running session
  first" → "Check out of …" (409 `open_session_exists`), "… to clock out of" → "… to check out of" (409 `no_open_session`), "A saved break ends
  after this Clock out; …" → "… Check out; …" (422 `saved_break_after_clock_out`), and the comment line. No code path, status, error code, API
  path or event type changed (`13-dist-diff.txt`). `dist/client` differs as expected (new bundles, `theme-init.js`, `cd-logo.svg`, `index.html`).
- The CSP header is byte-identical on both builds (`81-headers-new.txt`, `81-headers-old.txt`).

## 5. Accessibility, WCAG 2.2 AA, no regression (audit question 5)

- **The suite's checks passed in my real-clock run** (434 passed, `20-…`): AX-01 Shift+Tab walks with a received share (the 112px phone bar)
  at 1280, 768, 390, 375, 360 and 320 (`keyboard-access.spec.ts`, 0 hidden stops); AX-02 the label-picker rail at least 2px and 3:1 against
  the option fill and the card (`focus-ring.spec.ts`, `expectRail`); AX-03 dialog and panel rings; AX-04 the pressed "Change several days" and
  both checked theme segments, with ring/gap and gap/fill at 3:1; AX-05 the day-button names; AX-06 the switcher; AX-07 the alert and status
  roles (the clock error is `role="alert"` in the bar and in the card); AX-08 the focus returns, now also from the check-out dialog to the bar
  button; AX-09 text contrast on the editing fill (lowest 4.52 light / 4.62 dark); AX-10 the 320px batch reflow. The four theme situations
  (light, dark, manual dark on a light device, manual light on a dark device) are asserted by theme.spec, hover.spec, focus-ring.spec and
  timesheet.spec on both projects.
- **My axe-core 4.14.0 scan** (installed only in the task folder, `70-axe-install.txt`; tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa;
  CSP bypassed in that probe context only so the script could be injected): 144 scans (landing, away, Show details on, the label picker
  open and, on the phone, the More panel open, at 1440, 1280, 1024 and 768 and at 390, 375, 360 and 320 with a received share, in the four
  theme situations; `71-a11y-2-summary.txt`). Desktop:
  64 of 64 scans with 0 violations. Phone: every scan reports `label-content-name-mismatch` on the 14 day buttons, which the same scan of
  90b98ef reports too (`74-axe-base-old.txt`; risk R-UX2A-4); and 8 scans at 375px only, with the picker or the More panel open, report
  `target-size` on the review link: in those states the page had scrolled so that the link sat partly under the sticky 112px bar. A
  follow-up without a share at 390, 380, 375, 370 and 360 with each overlay open, on d1a20a7 and on 90b98ef, reports no `target-size`
  (`77-axe375-*.txt`); the link is 44px high. I read it as a scroll-position overlap with the sticky bar, not a size defect (I did not repeat
  the scan with the share). No other rule fails: colour contrast, roles, ARIA attributes, names, landmarks and the radio group pass
  in all four theme situations. The landing-page baseline of d1a20a7 equals that of 90b98ef apart from a `target-size` result on the old
  build's navigation links that is gone (`74-axe-base-new.txt`).
- **My keyboard walks** (forward from the top and backward from the end of the Timesheet page, every width, four theme situations; a stop
  passes when a ring is painted, at least one of 25 sample points of the stop is not covered, and its box is at least 24x24, 44x44 on a phone
  for the round's controls): 32 walks (8 widths x 4 situations; the phone with a received share, so the 112px bar), 44 stops each way on
  the desktop and 43 on the phone, 2,784 stops in all: every stop paints a ring, none is hidden by the sticky bars, none is below 24x24, every round-2
  control on the phone is at least 44x44, and no width scrolls sideways (`71-a11y-2-summary.txt`). The order is the documented one: the
  navigation links, the Theme group (one stop), Sign out, Previous, Next, Today, Review & sign off, Check in (the desktop card), Open a day, the
  Show details switch, Change several days, then each day's button and label picker; on the phone the bar's Check in comes first.
- **New controls against the listed SC.** 1.3.1/4.1.2: the Theme `radiogroup` with two native radios, the native switch, `aria-current` on
  one day button, Today `aria-disabled` with a description, a persistent polite atomic live region (4.1.3) for the jumps; 1.4.1: rails, check,
  thumb position, the checked fill and the radio state are shapes or semantics, not colour alone; 1.4.3/1.4.11: the suite's contrast lines
  (hover 1.23/1.45, boundaries 6.09/6.79, switch states at least 4.53, rails at least 4.72, wordmark 5.33/8.19 light, 6.79/6.56 dark);
  2.1.1: all reachable and operable by keyboard (arrow keys in the radio group, Space on the switch); 2.4.3: Previous, Next, Today, Current
  period, Review, and focus to Today after Current period; 2.4.7/2.4.11: see the walks and finding WP5-UX2-AUDIT-03; 2.5.3: the Review
  short label is contained in its full accessible name, the arrow is hidden and " to " is read; 2.5.8: Today, Current period, the review link, the switch
  label and the bar's Check in/out button are 44px on a phone (the button 87.4x44 in the gate, at least 44 in my walk).
- **The inactive Today's focus ring.** The painted pixel in the ring band, on both projects and in all four situations, in both a11y runs
  (`71-a11y-real.txt`, `71-a11y-2-summary.txt`): inactive, 121,159,217 on the white card = 2.70:1 in the light theme (light device and
  manual light) and 76,114,169 on `#1a2029` = 3.34:1 in the dark theme; the same button active paints 6.09:1 and 6.79:1. The values match the computed 0.6-opacity blend (`75-ringcalc.txt`: 2.70 and 3.33). Finding
  WP5-UX2-AUDIT-03.

## 6. Test strength (audit question 7)

- **Assertions changed, none weakened beyond the recorded role and height changes.** 76 removed lines over 25 test files (`50-…`): the
  Clock → Check renames (forbidden lists keep both names), Show details `aria-pressed` → `role=switch` with `toBeChecked`, the AX-02 framing
  check → `expectRail` (no frame, rail at least 2px, 3:1 against fill and card), the AX-04 loop extended to the theme segments with ring/gap and
  gap/fill checks, the tab order with Today, the company line turned into its explicit absence plus the remaining header facts, and the phone
  bar bound 60 → 60 or 112.5 with a share, now with the `--shell-bar-size` equality (T09). Each replacement asserts the same fact or more.
  Added skips: five, all project-conditional (`test.skip(isMobile …)` or its mirror); no `.only`, `fixme`, `test.fail`, `slow` or
  `expect.soft` added. No test file lost an `expect(` or a test (`51-expect-counts.txt`); the vitest suite grew from 83 files / 1831 tests
  on 90b98ef to 88 / 1878, and the e2e suite from 236 to 476 tests over both projects.
- **Mutations** (one at a time in scratch exports, restored afterwards; the scratch export's digest equals 20e7a7c8… again at the end):

| ID | Mutation | Run (simulated instant) | Result |
|---|---|---|---|
| M1 | Today reads the device date (`TimesheetScreen.tsx`, three places) | today.spec, both projects, 2026-10-27 13:00 PDT | caught: 7 failed (desktop 4, mobile 3) |
| M2 | Today targets `current` (`periodJumpModel.ts`) | unit `periodJumpModel.test.ts`; today.spec, both, 2026-10-27 13:00 | caught: unit 3 failed; e2e 5 failed |
| M3 | `aria-current` removed from the editing day's button (both layouts) | timesheet.spec, both, 2026-10-21 12:00 | caught: 20 failed |
| M4a | the desktop editing rails dropped (`::after` border) | timesheet.spec, desktop | caught: 4 failed |
| M4b | the phone editing fill dropped | timesheet.spec, mobile | caught: 2 failed |
| M5 | light hover fill halved (below 1.20:1) | hover.spec, both | caught: 6 failed (desktop; the phone has no hover by design) |
| M6 | `role="switch"` removed from Show details | timesheet.spec, both | caught: 15 failed |
| M7 | `<script src="/theme-init.js">` removed (no pre-paint) | theme.spec, both | caught: 14 failed |
| M8 | the ClockProvider enabled in shared views | sharing.spec and shell.spec, both | caught: 6 failed (phone; on the desktop nothing renders in a shared view and the provider's own shared-address guard still prevents requests) |
| M9 | the logo `<img>` removed | logo.spec, both | caught: 13 failed |
| M10a | the rename reverted on the Check in button | shell.spec, both | caught: 7 failed |
| M10b | the rename reverted on the History/OT label ("Clocked in") | unit `tests/client`; history-settings.spec and ot-leave.spec, both | **survives** (359 unit, 22 e2e passed): risk R-UX2A-2 |
| M10c | the rename reverted on the policy legend ("first clock-in") | unit `tests/client`; history-settings.spec, both | **survives** (359 unit, 14 e2e passed): risk R-UX2A-2 |
| M10d | the rename reverted on the stale check-out notice | day-editor.spec, both | **survives** (50 passed): risk R-UX2A-2 |
| M10e | the rename reverted on one server message literal | integration `timesheet-api.test.ts` | caught: 1 failed |
| M11 | `white-space: nowrap` removed from the review link | today.spec, mobile, 2026-10-27 13:00 | survives (10 passed): an equivalent mutant with the measured fonts, because the short-form rule already keeps the label within the row |
| M11b | the short-form container rule removed (the one-line rule beside Current period) | today.spec, mobile, 2026-10-27 13:00 | caught: 1 failed |
| M12 | Current period shown outside the window days | unit; today.spec, both, 2026-10-21 12:00 | caught: unit 2 failed; e2e 6 failed |
| M13 | the theme choice not mirrored to `data-theme` | theme.spec, both | caught: 36 failed |
| M14 | the CSP loosened (`'unsafe-inline'` scripts) | theme.spec, both (server rebuilt) | caught: 2 failed |

Every mutant the brief lists is caught; the rename survives in three places that no test reads (R-UX2A-2), and M11 changes no behaviour
with the measured fonts. After every restore the scratch export's digest equals 20e7a7c8… again (20 checks, `73-mutation-summary.txt`).

## 7. Brand and privacy (audit question 6)

- **No font file, no stray raster.** `git ls-files` at d1a20a7 lists no `.ttf`, `.otf`, `.woff`, `.woff2` or `.eot` (`10-fonts.txt`, empty).
  The only tracked raster whose name does not end in `-synthetic.png` is the older `handoff/delivery/evidence/WP1/ui-timesheet-synthetic.jpg`
  (synthetic by name, not from this round; `10-rasters-nonsynthetic.txt`). `@pdf-lib/fontkit` and `dejavu-fonts-ttf` stay npm dependencies
  (unchanged); no font is in the repository.
- **The logo SVG is pure vector and safe.** `src/client/public/cd-logo.svg` (3,440 bytes) holds only `svg`, `circle`, `clipPath`, `g`, `rect`
  and `path`; its only reference is the internal `url(#disc)`; no `script`, `href`, `xlink`, `data:`, `image`, `text`, `foreignObject`,
  event attribute or `style`.
- **The wordmark is outlines only.** `BrandWordmark.tsx` is one inline `svg` with two `path` elements (`aria-hidden`, fills from CSS classes);
  no `<text>`, no `font-family` and no `@font-face` anywhere under `src/`; `wordmarkAsset.test.ts` guards this.
- **Fidelity to the owner's images** (the source copies in the PLAN3 and PLAN4 temp folders still exist; `80-fidelity.txt`,
  `audit-brand-fidelity-synthetic.png`). Logo, both drawn at 512 over white and reduced with the same box filter: mean absolute channel
  difference 0.456 at 512px (0.014% of pixels over 48), 0.437 at 64px and 0.424 at 32px (0% over 48). Wordmark: the shipped paths in their
  light colours rendered into the ink box of the owner's 131x90 image (rows 62-84): mean absolute luminance difference 30.8 of 255 and an ink
  overlap (IoU) of 0.655 against a source with blur and a drop shadow; the side-by-side shows the same letterforms, the capital S with small
  capitals, and the spaced second line. I judge both faithful.
- **The PDF keeps its company line; the on-screen sheet does not.** `src/server/pdf` and `dist/server/pdf` are unchanged; `timesheet.spec.ts`
  and `review.spec.ts` assert the absence on the two sheets and the name once (hidden) in the bar, and passed.
- **CSP unchanged**, with no `securitypolicyviolation` (theme.spec, logo.spec); `/theme-init.js` is `text/javascript` and `/cd-logo.svg` is
  `image/svg+xml`, both with `nosniff`.
- **R-UX2-1 (`/theme-init.js` without `Cache-Control`).** Confirmed, and it is the general pattern: on both builds `/`, `/theme-init.js`,
  `/cd-logo.svg` and the hashed assets carry `Last-Modified`, no `ETag` and no `Cache-Control` (`81-…`). A browser may reuse a stale
  `theme-init.js` for a heuristic period after an upgrade. Its job is small and stable (read one key, set one attribute) and a stale copy would
  only miss a future change of that logic; `index.html` has the same exposure today. Judgement: an acceptable carried risk, not a defect of this
  round (the round may not change the server). Recommended later: `Cache-Control: no-cache` for `index.html` and `theme-init.js` (or a hashed
  name), with long caching for the hashed assets.

## 8. Docs (audit question 8)

- docs/04, docs/10, docs/12 and the renamed lines in docs/01 (FR-06), docs/02 (line 15) and DEVELOPMENT (lines 68, 118) describe the product
  as built, apart from the 320px row (WP5-UX2-AUDIT-02). EN/VI parity: the six pairs have the same headings, table rows, bullets and numbered
  items, and the same literal tokens (numbers, px, ratios, hex colours, code spans) except the existing translation-pair link line and
  decimal-comma spellings outside this round (`40-docs-parity.txt`). The only "Clock in/out" left in the docs is the quoted owner request
  UX2-2 in docs/10 (`41-docs-clock-grep.txt`); no visible client string says "Clock" (`33-client-clock-strings.txt`, empty).
- No contradiction with a canonical rule (AGENTS rule 8): R-07 and D-12 are unchanged (the landing period), the theme choice is not business
  data, and FR-06/docs/02 change wording only. The earlier docs/04 line 82 "follow the device" (now line 87) was superseded by the owner's
  own request and updated in both languages.

## Findings

| ID | Severity | File / function | Reproduction | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP5-UX2-AUDIT-01 | Low | `src/client/components/PeriodBar.tsx:121-125` (the press is ignored while `todayAway` is false) with `src/client/TimesheetScreen.tsx:399-408` (`todayAway` from the page's last `periods` read) | `zz-audit-midnight.spec.ts` at simulated 2026-10-25 23:59:20 PDT, page left open until the server date is 2026-10-26, then press Today (`62-probe-midnight-1025.txt`) | Expected (docs/04 line 54): the sheet no longer shows today's date, so Today is active and opens 10/26-11/08 with the Today tag on 10/26. Actual: Today stays `aria-disabled`, the tag stays on 10/25 and the press does nothing; it recovers only after Next/Previous, a reload, or (own view only) the tab becoming visible again | docs/04 line 54 (EN/VI); the PLAN's B5 rule "the click first re-reads `/periods/current` … the date can pass midnight"; owner item UX2-1 (5) | Let a press on the inactive Today still re-read `/periods/current` and decide from that answer (jump when the fresh state is away, otherwise leave the sheet and the live region as they are); optionally refresh `periods` when the window regains focus. Add a simulated-clock e2e that crosses the reporting-zone midnight with the page open (the probe above is a template) |
| WP5-UX2-AUDIT-02 | Low (docs) | `docs/04_UX_AND_SETTINGS.md` lines 48 and 56 and `.vi.md`; docs/10 coordinator bullet "Phone Review link" (EN/VI) | `today.spec.ts:414-417` (asserted and passing) and `audit-today-bar-phone-away-w320-synthetic.png`: at 320px with Current period shown, Today and Current period share a row and the Review link takes its own row with the full label | Expected: the docs describe the 320px behaviour. Actual: they say the three share one row ("also in the five days when Current period joins that row", "share one row") | Audit question 8; docs as built | Add one clause in both languages: "on the narrowest phones (below about 330px) the Review link takes its own row with its full label when Current period is shown" |
| WP5-UX2-AUDIT-03 | Low | `src/client/styles.css:874-877` (`button[aria-disabled='true'] { opacity: var(--opacity-disabled) }`, new in T04) applied to the inactive Today, whose `:focus-visible` ring is part of the same dimmed element | Land on a period that shows today (or press Today), Shift+Tab then Tab back to Today, read the painted pixel in the ring band (`zz-audit-a11y.spec.ts`, `71-…`; expected values in `75-ringcalc.txt`) | Expected: the shared ring at least 3:1 against the card in both themes (owner decision WP5-UX-Q1 (a), docs/10; docs/04 line 82). Actual: 2.70:1 in the light theme (dark 3.34:1); the same button active paints 6.09:1 (light) and 6.79:1 (dark) | Owner decision WP5-UX-Q1 (a) and docs/04 "Visual standard"; WCAG 1.4.11 exempts inactive components and 2.4.7 is met (the ring is visible), so this is a project-standard defect, not a WCAG 2.2 AA failure | Dim the inactive Today with colour tokens (text and border) instead of element opacity, or keep `opacity` off the focus ring (for example a separate rule `button[aria-disabled='true']:focus-visible { opacity: 1 }` with muted text); add the inactive Today to the focus-ring spec in both themes |

## Risks and optional improvements (separate from the findings)

- **R-UX2A-1, `/theme-init.js` and the other static files have no `Cache-Control` (R-UX2-1).** Confirmed on both builds; judged above as an
  acceptable carried risk. Optional: `no-cache` for `index.html` and `theme-init.js`, long caching for the hashed assets (a server change for a
  later round).
- **R-UX2A-2, rename survivors.** Reverting the rename in one of these places is caught by no test: the History/OT operation label
  ("Checked in", `otModel.ts:107`), the policy legend ("first check-in", `PolicyFields.tsx:52`), the Settings sharing sentence
  (`SharingSettings.tsx:42`) and the stale texts ("Check out again …", `ClockProvider.tsx:207`, `ClockOutDialog.tsx:122`). My mutations
  M10b, M10c and M10d confirm it (section 6).
  Optional: one unit test over the client's user-visible strings (or a source grep in `tests/client`) that forbids the old terms outside
  identifiers.
- **R-UX2A-3, the phone review-link thresholds depend on the font.** The container thresholds (`styles.css:1600-1650`) are literal rem values
  measured with the Windows system font (Segoe UI); the font stack is `system-ui`, so iOS and Android draw other widths. My probe forced Arial
  and Verdana on the window-day away state at every width from 320 to 767px: the link never overflowed and stayed 44px high (`REVIEWFIT` lines
  in `71-a11y-2-summary.txt`); so where the row is too narrow the wrapping flex row must have moved the link to its own row, as at 320px
  (not measured separately). The away-state budget at
  390x844 on the first window day has 80.6px of headroom on the person's own timesheet but only 28.6px with a received share and the zone note (gate
  `62-obs-away.txt`), so a second button row (+52px) from a wider phone font could push the first day row under the tab bar on the first
  window day. Optional: a look on a real iPhone and an Android phone during the pilot, or a few rem of margin in the thresholds.
- **R-UX2A-4, axe's `label-content-name-mismatch` on the phone day buttons.** The same axe scan of 90b98ef reports it on the same 14 phone buttons (`74-axe-base-old.txt`), so it predates this round. The button's two spans ("Mon", "09/28") have no
  whitespace between them, so the computed text is "Mon09/28"; the name "Edit Mon 09/28 (2026-09-28)" holds the visible words, which is what
  SC 2.5.3 asks (AX-05, accepted earlier). Optional: a space or a line-break element between the spans silences the tool.
- **R-UX2A-5, the period that contains today reads "future".** In the five window days the period Today opens carries the server's relation
  badge "future" (`audit-today-bar-phone-away-w390-synthetic.png`), because R-07/D-12 call the ended period "current". This
  is unchanged server semantics, now reached more often through Today; the owner may want a different badge wording later (not a defect).
- **Observation for the owner (no defect):** the larger brand-to-menu gap shows only from 1440px; between 1280 and 1439px the bar shows the
  logo alone with the earlier 24px gap.

## Required gates unrun or blocked, and why

- None of the mandatory checks is unrun: typecheck, lint, `npm test`, the FULL e2e on both projects on the real clock, AC-13 once, my own
  simulated-clock probes and the mutation set ran on this digest. The drill was not required (WP5-UX2-GATE ran it; image
  `sha256:8b0effa0…`). NAS items stay NOT VERIFIED as in every earlier gate.
- Calendar instants other than the real 2026-10-14/15 ran only under the simulated clock, validated by a control; the browser's own clock is
  real by design, which makes the device-date probes stricter.
- axe-core was not in `node_modules`; I installed axe-core 4.14.0 with `--ignore-scripts` into a new folder inside my task folder only (no
  repository or dependency change) and injected it in a probe context that bypasses the CSP.
- My own server probes used ports 48745 and 48746 with `DATA_DIR` and `DATABASE_PATH` in the task folder; the e2e fixtures used their own
  OS-assigned loopback ports, as in every earlier gate.

## Disposition of previous findings

- WP5-UX-AUDIT-AB9 found no defect; its risks R-AB9-1 to R-AB9-6 and the carried backlog are untouched by this round (the files they concern
  are unchanged or changed only in wording), except that R-AB8-4 (sweep coverage) is widened by the round's and my own Today instants.
- AX-01 to AX-10 and the B5 items still hold (section 5). Finding 03 concerns a new control (the inactive Today), not a regression of an
  AX item, but it falls under the same owner-decided ring rule (WP5-UX-Q1 (a)).
- This audit does not supersede WP5-UX-AUDIT-AB9 yet: a PASS on a later digest of this round would.

## Software readiness, owner permission and pilot result

- **Software readiness:** not re-accepted on d1a20a7. The round does what the owner asked, the server delta is three message literals, the
  accounting-date semantics and the sharing boundary hold, and the mandatory checks pass; the three Low findings must first be fixed and
  rechecked on a new digest. Until then the last accepted snapshot stays 90b98ef (WP5-UX-AUDIT-AB9); nothing here affects data, the server
  or the pilot packet's decisions.
- **Owner permission:** none requested or given. No deployment, no real mail, synthetic data only.
- **Pilot result:** none; no pilot has run.

## One next action

Coordinator:
- record WP5-UX2-AUDIT as FIX REQUIRED (findings WP5-UX2-AUDIT-01 to 03; risks R-UX2A-1 to R-UX2A-5 to the backlog);
- dispatch one bounded fix task (for example WP5-UX2-FIX1; size S-M, risk M, worker-high) owning `src/client/components/PeriodBar.tsx`,
  `src/client/TimesheetScreen.tsx`, `src/client/styles.css`, `tests/e2e/today.spec.ts`, `tests/e2e/focus-ring.spec.ts` and docs/04 and docs/10
  (EN and VI), to: (1) let a press on the inactive Today re-read `/periods/current` and jump when the fresh answer is away, with a
  simulated-clock e2e across the reporting-zone midnight with the page open; (2) add the 320px row clause to docs/04 lines 48 and 56 and to the
  docs/10 bullet; (3) dim the inactive Today without dimming its focus ring, with a ring check in both themes;
- then its freeze, a regate on the new digest (verify, lint, the full e2e on both projects, the Today sweep with a midnight instant, the
  contrast checks) and a fresh recheck audit of the fix on that digest.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP5-UX2-AUDIT, attempt 1.
  - Reviewer: self-reported `claude-opus-5-5`; a fresh subagent (the board records agent ID `aa1ac7827beb0fe41` for this task; not
    observable from inside).
  - Reviewed authors (board): WP5-UX2-PLAN to PLAN4 (`a767b8896b0d1cc72`), T01 `a9d962e5be41fe678`, T02 `ac90307b14c9bad40`, T03
    `aff6b930318d2d3a0`, T04 `ae57a22e4eaa6440a`, T05 `a51d67415e6afc416`, T06 `a04f4d6a819678578`, T07 `a4f3080aaa2d73816`, T08
    `a96d4ba20fcf89e1e`, T09 `aabbee779a229a4a3`, T10 `a291a953326b454ee`; all self-reported `claude-sonnet-5-5`. The freezes (committers) and
    WP5-UX2-GATE (verifier, `a46d743f16f3661d6`) also self-reported `claude-sonnet-5-5`. My model is not weaker than the strongest author.
- **Fresh context; reviewer did not author changes:** confirmed. I authored none of the reviewed changes and ran no plan, slice, freeze, gate or
  earlier audit of this round. I edited no source, test, doc, board or STATE file. The exports, builds, mutations, task-local specs and every
  run lived in the task folder; in the repository I wrote only this review pair, the Results of my brief and
  `handoff/delivery/evidence/WP5-UX2-AUDIT/`. Process notes: seven shell lines piped a listing or a grep into `head` or `tail` (no file or
  process effect); my first a11y run clicked an aria-disabled Today in my own probe, so its walk tests timed out (10 min each) and only its
  axe and ring lines are used; axe-core 4.14.0 was downloaded with `--ignore-scripts` into the task folder only. Nothing is left running.
- **Source digest before/after; gate evidence for that snapshot:** `20e7a7c8…a609773fa5` (814 files) before and after, in three forms
  (`01-digest-before.txt`, `01-digest-after.txt`). It equals the WP5-UX2-GATE digest of record (gate PASS on d1a20a7; NAS items NOT VERIFIED).
- **New report path preserving previous review history:** `handoff/delivery/WP5_UX2_REVIEW.md` and `.vi.md`, both new; every earlier review is
  untouched.
- **Finding dispositions and next coordinator fix/recheck task:** WP5-UX2-AUDIT-01, 02 and 03 are open (Low each); the next step is the
  fix task and the recheck in "One next action".
