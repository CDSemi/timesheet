# WP5-UX3-SWEEP dispatch brief (read-only defect sweep before the regate)

- Mission/task: timesheet-software-readiness / WP5-UX3-SWEEP; package WP5; kind plan;
  attempt 1; depends on WP5-UX3-GATE (done, FAIL). Read-only. Runs in parallel with the fix
  worker WP5-UX3-FIX1, which edits the repository working tree: **never build, test or read
  the application from the repository working tree; use your own clean export.**
- Purpose: find every remaining defect of UI change round 3 now, so that the regate and the
  fresh audits meet a clean snapshot (earlier rounds lost cycles to audits that found one
  defect at a time). You are not the auditor; your list feeds one more fix task.
- Profile/routing: timesheet-planner (effort high, fixed by the profile); requested model
  opus; override reason size_risk (an audit-depth sweep of a size-L round). Task record in
  English.
- Target: a clean `git archive` export of cecfceb61c7f15216c8f188e8b7059c9f075247d into
  `D:\.claude-tmp\timesheet\WP5-UX3-SWEEP\src` (outside the repository), digest
  29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7 (833 files; verify it on the
  export). `npm ci` and builds run in the export only.
- **AGENTS.md on disk wins** (its UI section is "Frontend and UI/UX standards").

## Known and excluded (already in WP5-UX3-FIX1; do not report again)

The Tuesday lifted-column test (`timesheet.spec.ts:807`), the 409 seed flake
(`timesheet.spec.ts:452`), focus clipped in the 768-899px week-card scroll, the two
`label-content-name-mismatch` items (two-line category trigger, phone break chips), the
`target-size` item under the open account menu, and the notch in the lifted-run shadow.

## Scope

Use the scopes of `handoff/delivery/tasks/WP5-UX3-AUDIT-A.md` (area A: visual, shell,
settings, sheet, accessibility) and `handoff/delivery/tasks/WP5-UX3-AUDIT-B.md` (area B:
break entry integrity, dialogs, pre-fill, Check out) as your checklist, against the owner's
words (board `owner_decisions` 2026-10-15/16), the plans (`WP5-UX3-PLAN.md`,
`WP5-UX3-PLAN2.md`), the slice records and the gate record. Concentrate on what the gate did
not measure:

1. owner fidelity of U-01..U-27, N-1, N-2, G-1..G-5, Q6, 24-hour chips (one line per item:
   done, partly, missing);
2. keyboard and focus behaviour of every new control and dialog (account menu, Settings nav,
   session dialog, notice, confirmations, sub-dialog, delete dialog, chips), desktop and
   phone, light and dark;
3. request bodies of the session and Check out dialogs against a643794's old forms for the
   same typed values (same-day, overnight, DST fold and gap, two input zones, untouched
   rows); `breaks_confirmed` per path; nothing sent on Cancel, Discard or sub-dialog Done;
4. pre-fill only before the server's `today_local`, never the device clock;
5. docs/04, docs/10, docs/12 (EN and VI) against the behaviour (wrong or missing statements);
6. test strength: try at least eight mutants of your own across areas A and B in your export
   and report which the suite misses;
7. anything else that would make an independent auditor return FIX REQUIRED.

## Output (append under "Results")

A numbered list of findings: severity (High, Medium, Low, Info), area, file:line, a
reproduction (commands or steps, the instant and viewport), the expected behaviour and a
suggested fix direction; then the mutation table; then "no finding" statements for the
scope items you checked and found clean. No fixes; no edits outside your owned paths.

## Owned paths

- `handoff/delivery/tasks/WP5-UX3-SWEEP.md` (this file; append Results only)
- `handoff/delivery/evidence/WP5-UX3-SWEEP/` (masked LF `.txt` and at most ten
  `-synthetic.png`)
- Temp folder `D:\.claude-tmp\timesheet\WP5-UX3-SWEEP\` (outside the repository)

## Runtime

- Git Bash only; never cmd.exe or an interactive shell. **NEVER FEED ANYTHING TO PYTHON OR
  NODE THROUGH STDIN (NO HEREDOCS, NO `node -e`, NO `| node`, NO `| python`). NEVER PIPE INTO
  `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm
  -rf`.** Write probes as files in the temp folder and run them; read outputs with the Read
  tool. Node 24 first on PATH (`node --version` v24.x). Ports 48960-48999 only. `DATA_DIR`
  and `DATABASE_PATH` inside the temp folder for every server or CLI run; never touch
  `%LOCALAPPDATA%\timesheet-dev`. Never kill processes by PID; leave nothing running. The
  only git commands you may run in the repository are read-only (`git archive`, `git show`,
  `git log`, `git diff` between commits); no index or working-tree change.
- For a643794 comparisons export a6437943403fc416240fd13a787a8c4748af3e84 into a second
  folder of the temp folder.
- Synthetic data only; screenshots end `-synthetic.png`; no email address except the full
  synthetic `@example.invalid` form; `<user>` for profile paths.
- If a permission check denies a call, stop and report.

## Return

At most 250 words, beginning with 'Self-reported model: ...': the number of findings per
severity with one line each, the mutation survivors, the clean scope items, and confirmation
that nothing is left running.

## Results

### Checkpoint 1 (2026-10-16, about 13:30 UTC; planner, attempt 1)

- Setup: `git archive` of cecfceb into `D:\.claude-tmp\timesheet\WP5-UX3-SWEEP\src` and of a643794
  into `...\old`; digest of the export (git hash-object `--no-filters`, sorted path list, sha256)
  29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7, 833 files, byte-identical to
  the `git ls-tree` form (`cmp` exit 0). Node v24.21.0 (portable). `npm ci` and `npm run build`
  exit 0 in both exports. Unit baseline in the export: 95 files, 2138 tests passed (the 94 files and
  2126 tests of the gate plus my one probe file of 12 tests).
- Export-only probe changes (never in the repository): `tests/client/zz-sweep-probe.test.ts`,
  `tests/e2e/zz-sweep.spec.ts`, and `tests/e2e/fixtures.ts` `freePort()` patched to ports
  48960-48991 (16 per worker) so every server stays in my port range.
- Done so far: model-level request matrix old form vs new dialog (8 typed cases equal by instant,
  untouched edit byte-identical); keyboard/focus probe (account menu, More panel, session dialog
  stack); docs 04/10/12 read against the code; EN/VI number parity of docs/04 clean; mutation runs
  started (M01 caught by unit and e2e).
- Remaining: mutants M02-M18, owner-fidelity list, final findings.

### Sweep result (attempt 1, done 2026-10-16 about 14:00 UTC)

Self-reported model: claude-opus-5-5. Read-only sweep of cecfceb (digest above, verified on the export); the six FIX1
items are excluded. Evidence: `handoff/delivery/evidence/WP5-UX3-SWEEP/` (masked LF `.txt`; probe scripts as `zz-*.txt`).
Real clock during the probes: Fri 2026-10-16 05:40-07:00 America/Los_Angeles, a window day (current period
09/28-10/11, in progress 10/12-10/25); the host and the Playwright default zone are America/Los_Angeles; Edge
(Chromium) only, no Firefox or WebKit is installed on the host.

#### Findings

1. **Medium, area A (keyboard and focus).** Using an account-menu entry by keyboard drops focus to `<body>`.
   `src/client/components/AccountMenu.tsx:112` (the entry's `onClick={onNavigate}`), `:144-146` and `:209-213` (the panel,
   with the focused link, unmounts); no screen or route focus handling in `src/client/App.tsx:139-206` or `AppShell.tsx`.
   Reproduction (`zz-sweep.spec.ts.txt` S1, desktop 1440x900, light): focus the identity button, Enter (focus on
   "Profile"), Tab ("Settings"), Enter: `#/settings`, panel closed, `document.activeElement` is `body`
   (`21-e2e-probe-observations.txt`); Enter on "Profile" while on Profile gives the same. a643794 at the same step keeps
   focus on the bar link "Settings" (`23-e2e-a643794-observations.txt`). Expected: focus lands on a defined target
   (the identity button, or the new page's `h1`), WCAG 2.2 SC 2.4.3. Fix direction: after an entry closes the panel,
   move focus to the identity button (or focus the main heading on a route change); add the case to the keyboard test
   at `tests/e2e/shell.spec.ts:588`. The phone More panel behaves the same way since round 2 (pre-existing).
2. **Medium, area B (test strength, pre-fill by the server date).** Mutant M18 (the past-day rule fed with the device
   date, `new Date().toLocaleDateString('en-CA')`, at `src/client/components/SessionDialog.tsx:231`) survives the whole
   unit suite and `tests/e2e/day-editor.spec.ts:593` on both projects. That test uses the device zone
   `Asia/Ho_Chi_Minh` (`day-editor.spec.ts:23`), whose date equals the Los Angeles date from 07:00 to 17:00 UTC every
   day (the gate's real-clock run, 09:01-09:15 UTC, was inside that band), so "whatever the device zone" is not
   tested during those hours. The product code is correct (`breakRowsModel.ts:544-551` compares with `todayLocal`;
   no `Date` in the dialog or the model). Expected: a test that fails for a device-clock rule at any hour. Fix
   direction: choose the device zone in that test from the server's `today_local` so the device date differs (or fix
   the browser clock with `page.clock` to an instant whose device date differs), and assert the past-day branch.
3. **Low, areas A/B (G-5 b).** The Day editor's period chip says "future period" for a day of the period in progress
   when the day is opened through "Open a day" while the sheet shows the current period; the bar calls that period
   "in progress". `src/client/TimesheetScreen.tsx:590` passes `periodPill` only for a day inside the displayed period;
   `src/client/components/dayEditorModel.ts:125-127` then falls back to the server relation. Reproduction (S2, real
   clock above): Open a day 2026-10-14 -> chip "future period"; Next -> bar pill "in progress"; open 10/14 from the sheet
   -> chip "in progress". Expected (G-5 b; PLAN2 item 7 "The editor chip uses the same function for its day's period"):
   "in progress" for every day of that period in the window days. Fix direction: give the editor the server periods
   and decide by the day's own period (for example `in_progress.period_start <= date <= period_end`); test the
   Open-a-day path (`tests/e2e/today.spec.ts:787` covers only the Today path).
4. **Low, area A (G-2 a wording).** `src/client/components/BatchDialog.tsx:133` still says "Only the day label changes."
   in the conflict step whose heading (line 131) and checkbox (line 153) now say "category". Expected: "Only the day's
   category changes." Outside the sheet the word also remains in `HolidayImport.tsx:120` ("Days whose default label
   changes"), `ImportPreview.tsx:126,164` ("Label as read") and `OtScreen.tsx:243` ("Day label and recorded use
   differ"), Info only (not in the owner's U-15 scope) (`43-label-words.txt`).
5. **Low, docs/12.** `docs/12_RELEASE_NOTES.md:71` (VI :71) "Unconfirmed breaks": a Check out refusal (a running
   session) is followed by the remedy "'Confirm breaks' on the session card opens the session dialog", but a running
   session's card has no "Confirm breaks" (`dayEditorModel.ts:193-203`, `SessionList.tsx:84-97`) and its Edit cannot
   save without an end. Expected: the remedy at Check out is the Check out dialog's own rows or "Confirm no breaks
   taken"; "Confirm breaks" applies to ended sessions. Fix: reword both languages.
6. **Low, docs/10.** `docs/10_DECISIONS_AND_SOURCES.md:240` (VI :241) gives the main chunk as 452 kB; the frozen build
   gives `index-*.js` 484.26 kB (gate record and my rebuild, `index-B_GPJsM_.js`). Fix: the frozen figure or "under the
   500 kB advisory".
7. **Low, area A (test strength, AGENTS rule 7).** Mutant M21 (Profile shows the device zone instead of the saved
   reporting zone, `src/client/ProfileScreen.tsx:20`) survives: `tests/e2e/settings-routes.spec.ts:10` runs the Profile
   test with `timezoneId: 'America/Los_Angeles'`, equal to the reporting zone. Fix direction: run that test (or one
   assertion) in a device zone that differs from the reporting zone.
8. **Low, owner fidelity U-26 (Check out).** The Check out dialog now edits break rows and chips like the session dialog,
   but Cancel and Escape discard changed rows without "Discard your changes?" (`ClockOutDialog.tsx:195, 269`). U-26
   asks for the question on Cancel with modified data; the coordinator decision (docs/10:238) removes only the G-4 notice
   and the final confirmation at Check out. Expected: the discard question, or a recorded coordinator decision that
   Check out keeps closing at once. Not a regression of a643794 (it never asked).
9. **Info, docs/10.** `docs/10_DECISIONS_AND_SOURCES.md:226` (VI :227) says the old sentence "Actual clock values are not
   seeded from a schedule" was in document 04 "Timesheet sheet"; at a643794 it was `docs/04:16`, the paragraph after the
   Screens table. Fix the section reference.
10. **Info, code hygiene.** `dayEditorModel.ts:88-107` `quickBreaksRequest` and `confirmBreaksDraft` are used only by
    `tests/client/dayEditorModel.test.ts`; the second documents "when nothing fits, for none", which the dialog no longer
    does (it asks through the notice). Remove or mark as test-only.
11. **Info, AGENTS UI rule 3.** `src/client/styles.css:2755` adds a hover tint (`.sheet-day[data-lift]:hover`) outside
    `@media (hover: hover)`, unlike docs/04:92; it follows the older ungated `.sheet-day:hover` (`:2565`, also in a643794),
    so a tap on a touch screen of 768px or more can leave the tint on the lifted column (`40-css-scan-target.txt`).
12. **Info, Check out semantics (API only).** For a running session with saved unconfirmed rows, a643794's dialog
    defaulted to omitting the list; the new one lists the rows and "Check out with these breaks" confirms them, and
    removing every row then omits the list, so the server keeps the removed rows (E-1)
    (`11-request-bodies-old-vs-new.txt`, last case). No UI path saves rows on a running session today.
13. **Info, accessibility.** The "Calendar default. Saving records it as your choice." hint moved out of the Category
    label (`DayFieldsForm.tsx:114`) and is not linked to the select (`aria-describedby`).

#### Mutation table (22 mutants in the export, each reverted; unit = full `vitest run`, e2e = the listed specs on both projects)

| Id | Area | Mutant | Unit | e2e | Result |
|---|---|---|---|---|---|
| M01 | B | past-day test `<=` (`breakRowsModel.ts:547`) | 2 fail | day-editor:593 fails x2 | caught |
| M02 | B | typed break end sent without its offset (`:321`) | 9 repo tests fail | :799, :1504 fail x2 | caught |
| M03 | B | Check out empty list sends `breaks: []` (`:391`) | 2 fail | :1814 fails x2 | caught |
| M04 | B | hidden break dates stop following the session date (`breakChipModel.ts:35`) | 3 repo tests fail | :1023 fails x2 | caught |
| M05 | B | G-4 notice also with the box ticked (`SessionDialog.tsx:435`) | pass | :703 fails x2 | caught (e2e only) |
| M06 | B | sub-dialog Cancel acts as Done (`BreakSubDialog.tsx:172`) | pass | :1225, :1925 fail x2 | caught (e2e only) |
| M07 | B | notice Escape = leave unconfirmed (`SessionDialog.tsx:116-120`) | pass | :703 fails x2 | caught (e2e only) |
| M08 | A | menu Escape without focus return (`AccountMenu.tsx:176`) | pass | shell:588 fails x4 | caught (e2e only) |
| M09 | A | wordmark from 1100px (`styles.css:587`) | pass | logo:268 fails | caught (e2e only) |
| M10 | A | "in progress" outside the window (`periodBarModel.ts:357`) | 2 fail | pass (a window day) | caught (unit) |
| M11 | A | Administration in Settings nav for employees (`routeModel.ts:71`) | 1 fail | settings-routes :48, :87 fail | caught |
| M12 | A | row named "Label" again (`sheetModel.ts:29`) | 1 fail | timesheet:1485 fails | caught |
| M13 | A | lift run `mid` -> `start` (`sheetModel.ts:70`) | 3 fail | timesheet:1347, :1450 fail | caught |
| M14 | A | `WIDE_QUERY` 1280 (`TimesheetScreen.tsx:44`) | pass | 7 fail (B-02, T05B, B3-01) | caught (e2e only) |
| M15 | A | editor frame layer removed (`styles.css:2739`) | pass | timesheet :807, :935, :1291, :1347 fail | caught (e2e only) |
| M16 | B | dirty check ignores minutes (`breakRowsModel.ts:636`) | 1 fail | day-editor:3719 fails x2 | caught |
| M17 | B | pin kept in another input zone (`:131`) | 2 fail | :434 fails x2 | caught |
| M18 | B | past-day rule on the device date (`SessionDialog.tsx:231`) | pass | :593 passes x2 | **survives** (finding 2) |
| M19 | A | keyboard opening keeps focus on the button (`AccountMenu.tsx:195`) | pass | shell:588 fails x4 | caught (e2e only) |
| M20 | A | `mid` column not clipped (`styles.css:2766`) | pass | timesheet:1347 fails | caught (e2e only) |
| M21 | A | Profile shows the device zone (`ProfileScreen.tsx:20`) | pass | settings-routes passes (20) | **survives** (finding 7) |
| M22 | B | reference hours read in the input zone (`SessionDialog.tsx:237`) | pass | :593 fails x2 | caught (e2e only) |

After the last revert every tracked file of the export again has its cecfceb blob except my recorded `fixtures.ts`
port patch (`50-export-clean-after-mutants.txt`), and the client rebuild gives the gate's `index-B_GPJsM_.js` again.

#### Owner fidelity (one line each; "done" = matches the owner's words in code and in the gate's measurements)

U-01 done (AGENTS section, tokens) · U-02 done (card 1.14/1.15:1, week cards `--elev-2`) · U-03 done (bold name over a
muted email, right-aligned, avatar right) · U-04 done · U-05 done · U-06 done (from 1024px, hidden 1024-1279 with a
share) · U-07 done (desktop title row) · U-08 done · U-09 done (old amber, current green, future pink) · U-10 done ·
U-11 done · U-12 done · U-13 done (Day-cell fill, rails replaced by the lift and a 1px frame) · U-14 done · U-15 done
on the sheet and editor (finding 4 for leftovers) · U-16 done · U-17 done · U-18 done · U-19 done (chips) · U-20 done ·
U-21 done (dialog; table Break, Date, Start, Minutes) · U-22 done · U-23 done (server date) · U-24 done · U-25 done ·
U-26 done in the session dialog, partly for Check out (finding 8) · U-27 done · N-1 done · N-2 done (measured scroll,
head and foot in view) · G-1 done (square sheets, 4px lift, no shadow on a lifted neighbour, floating below 1360px;
the notch is in FIX1) · G-2 done · G-3 done (rule rewritten in docs/04 and docs/10, EN and VI) · G-4 done · G-5 partly
(bar and Today path done; finding 3) · Q6 b done · 24-hour chips done (seconds kept when the start has seconds, by
design and tested).

#### Checked and found clean (no finding)

- Request integrity (`11-request-bodies-old-vs-new.txt`): for eight typed cases (same-day, overnight with a break across
  midnight, fall-back fold earlier and later, spring-forward after the gap and across it, Asia/Ho_Chi_Minh same-day and
  overnight) the new dialog's body resolves to the same UTC instants as a643794's form body through the server's own
  call (`timesheetCommands.ts:180`); the only shape change is the explicit end offset (PLAN B8). An untouched edit of a
  saved session (fold day, a break with seconds) is byte-identical. A zone round trip LA -> HCM -> LA keeps the saved
  rows pinned (a643794 resent an ambiguous 01:45 without fold). The end is start + minutes as elapsed time (M02).
- `breaks_confirmed` on every path (listed rows, ticked box, notice "Confirm no breaks taken", "Leave breaks unconfirmed
  for now", Confirm breaks, Check out rows, box and omitted list) by code reading and M03, M05, M07; nothing is sent on
  Cancel, Discard or the sub-dialog's Done (code; the e2e `posts` assertions; M06).
- Pre-fill: only before `today_local` of `/api/periods/current` (`TimesheetScreen.tsx:461`, `SessionDialog.tsx:231`,
  `breakRowsModel.ts:544-551`); reference hours in the reporting zone (M22 caught). Only the test strength is short
  (finding 2).
- Dialog stack and focus (S4, desktop 1440): Escape closes the confirmation (focus Save), then asks "Discard your
  changes?" (focus Keep editing), Escape keeps editing (focus Save), and a second Escape asks again; the account menu's
  Escape over the non-modal editor closes only the menu; Escape from the Theme radios closes the menu with focus on the
  identity button; the phone More panel's Escape returns focus to More (S5).
- docs/04 against the code: the 22.8/18.4/15.4rem, 21rem, 25.5/42rem, 268/390px, 1360px, 1600px, 86dvh, 720px, 14rem,
  radius 6/8/12/0/4px and 120/180/260 ms values match `styles.css` and `breakChipModel.ts`; no `transition: all` (a643794
  had one); EN/VI number parity of docs/04 clean (`42-docs04-en-vi-number-parity.txt`); the docs/04 and docs/10 G-3
  rule text is the PLAN section C text in both languages.
- Layers: the account menu (`--layer-menu` 4 in the bar's layer 3) stays above the docked editor (2) and lifted columns (1).

#### Deviations and limits

- One read-only command in the a643794 export piped `grep` output into `head -c` (against the runtime rules); it read
  `tests/e2e/fixtures.ts` only, with no other effect. No other rule was broken: no stdin scripts, no `/dev/null`, no
  recursive delete, no process killed; all servers ran on 48960-48999 through the patched export harnesses.
- Not done: a browser capture of request bodies on both builds (the comparison is at the model level plus the e2e
  stored-instant tests); a second browser engine (none installed); screenshots (none needed).
- Nothing is left running: `51-ports-after.txt` shows only TIME_WAIT sockets in 48960-48999, no listener. No file of the
  repository outside this Results section and the evidence folder was written; no git command other than `archive`,
  `show`, `ls-tree` and `diff` between commits was run.

Status: done
