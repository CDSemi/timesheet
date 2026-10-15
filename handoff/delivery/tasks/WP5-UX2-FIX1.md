# WP5-UX2-FIX1 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-FIX1; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX2-AUDIT (FIX REQUIRED on d1a20a7 / 20e7a7c8); depends
  on WP5-UX2-T10-FREEZE (done).
- Scope: the three Low findings of `handoff/delivery/WP5_UX2_REVIEW.md` ("Findings")
  and the optional risk R-UX2A-2, as decided by the coordinator (board
  `coordinator_decisions`, 2026-10-15). Nothing else.
  1. **WP5-UX2-AUDIT-01.** After the reporting-zone midnight passes while the page stays
     open, Today stays `aria-disabled` and a press does nothing (`PeriodBar.tsx:121-125`,
     `TimesheetScreen.tsx:399-408`).
     - A press on the inactive Today must still re-read `/periods/current` and decide
       from that fresh answer: jump (and announce) when the fresh state is away;
       otherwise leave the sheet and the live region unchanged.
     - Also refresh the periods when the window regains focus or the tab becomes
       visible, in own and shared views alike, so the Today state does not go stale.
     - Never use the device clock or the display zone (AGENTS rule 7).
     - The auditor's probe `handoff/delivery/evidence/WP5-UX2-AUDIT/62-probe-midnight-1025.txt`
       and its spec template show the reproduction.
  2. **WP5-UX2-AUDIT-02 (docs).** In `docs/04_UX_AND_SETTINGS.md` lines 48 and 56 (EN and
     VI) and the docs/10 coordinator bullet "Phone Review link" (EN and VI), add that on
     the narrowest phones (below about 330px), when Current period is shown, the Review
     link takes its own row with its full label.
  3. **WP5-UX2-AUDIT-03.** `styles.css:874-877` dims `button[aria-disabled='true']` with
     `opacity`, so the inactive Today's focus ring paints 2.70:1 (light) and 3.34:1
     (dark).
     - Dim inactive buttons with colour tokens (text and border), never element opacity
       over the focus ring. The ring must be at least 3:1 against every adjacent surface
       in both themes and with both manual overrides; the owner's rule (WP5-UX-Q1 a)
       applies.
     - Check every other element that uses that rule, and say which.
  4. **R-UX2A-2.** Add one unit test (in `tests/client/`) that forbids the old clock
     wording ("Clock in", "Clock out", "Clocked", "clock-in", "Checking the clock") in
     the client's user-visible strings outside identifiers, CSS class names and API
     paths. It may be a source scan with an explicit allowlist of identifier patterns.
     - Show that it fails when one of the three places the auditor named is reverted
       (`otModel.ts:107`, `PolicyFields.tsx:52`, `SharingSettings.tsx:42`, or the stale
       text in `ClockProvider.tsx:207` or `ClockOutDialog.tsx:122`), then restore it.
- Not in scope: R-UX2A-1, -3, -4 and -5. Leave the server's "future" badge unchanged.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size S, risk M (accounting-date behaviour), novelty
  no. Task record in English.
- Base: HEAD = origin/main = d1a20a7f0112fa00171fe4b1d6035427855f12b6, or a later commit
  that changes only `handoff/`. Source digest
  20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/WP5_UX2_REVIEW.md` (findings, risks, the midnight section) and the
  auditor's evidence named above.
- The T04 record (`handoff/delivery/tasks/WP5-UX2-T04.md`, the jump model and its tests)
  and the T09 record (the `ClockProvider` refresh triggers, which already include
  visibility for the person's own view).
- `src/client/components/PeriodBar.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/periodJumpModel.ts`, `src/client/styles.css`,
  `tests/e2e/today.spec.ts`, `tests/e2e/focus-ring.spec.ts`, the docs lines named above.

## Tests

- Finding 01:
  - a unit test in `periodJumpModel.test.ts` if the model changes;
  - an e2e that, under the FIX10 simulated-clock preload (as in T04), signs in before
    the reporting-zone midnight (for example 2026-10-25 23:59:20 America/Los_Angeles),
    waits until the server date has passed midnight, presses Today, and asserts the
    jump to the period that contains the new date, the Today tag on that date and the
    live-region text.
  - On the real clock, the same spec must branch on server values (no skip on other
    days). If the midnight case can only run under the preload, document how the gate
    runs it, and make the real-clock part assert the inactive-press re-read (a press
    while not away leaves the state unchanged and issues one `/periods/current` read).
- Finding 03: the inactive Today in `focus-ring.spec.ts`: the ring is at least 3:1 in
  light, dark and both overrides, on both projects.
- R-UX2A-2: the new unit test, and a recorded mutation run showing it catches a reverted
  string.
- No assertion removed or weakened. No new `skip`, `fixme` or `.only` beyond the existing
  project-conditional pattern.

## Hard constraints

- No server, API, domain, calculation, schema or CSP change.
- Not owned: `src/client/api.ts`, every file not listed under "Owned paths".
- Tokens only for new CSS values; every new dark token goes into BOTH dark sets.
- Keep every behaviour that earlier audits and slices verified:
  - AX-01..AX-10 and R-12;
  - the phone budgets: landing 571.5/670.4/623.5/722.4; away 591.0/690.0; all against
    788;
  - 44px targets;
  - no check in/out in shared views;
  - the T01 to T10 behaviour and tests.

## Owned paths

- `src/client/components/PeriodBar.tsx`, `src/client/TimesheetScreen.tsx`,
  `src/client/components/periodJumpModel.ts`, `src/client/styles.css`
- `tests/client/periodJumpModel.test.ts`, a new `tests/client/` wording test,
  `tests/e2e/today.spec.ts`, `tests/e2e/focus-ring.spec.ts`
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and
  `.vi.md` (the lines named above only)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-FIX1/` (masked LF `.txt` only, plus at most four
  screenshots whose basenames end in `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Reproduce finding 01 on the base with the auditor's method (simulated clock), and
   finding 03 with the ring measurement. Record the numbers.
4. Fix; then run `npm run typecheck`, `npm run lint` and `npm test` (including the
   wording-test mutation run).
5. Run the FULL e2e suite on both projects on the real clock (`npm run test:e2e`):
   - run it alone, with its own output folders;
   - the run must end with 0 failed.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once.
6. Run the midnight e2e under the preload at 2026-10-25 23:59:20 and 2026-10-31 23:59:20
   America/Los_Angeles, and run `today.spec.ts` at 2026-10-26 00:30 and 2026-10-17 10:00.
   All must pass. Record a table.
7. EN/VI parity for the changed docs lines. Run `validate_package.py --preflight` with
   the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).
8. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
9. Run `npm run verify` with `SMOKE_PORT` in 48770-48789, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
10. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
    digest.
11. Copy the masked logs into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell. Never create links or junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Create the task folder first.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-FIX1`. Set TEMP and TMP to it. Use ports
  48770-48789 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push. Write no markdown links in Results (paths in
  backticks only).

## Return

At most 160 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the reproduction numbers on the base;
- the fix for each finding;
- the ring numbers after the fix;
- the midnight and sweep table;
- the wording-test mutation result;
- the unit and full e2e counts per project;
- the preflight and verify exit codes;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any deviation.

## Addendum 1 (coordinator, 2026-10-15)

- docs/04 line 54 (EN and VI) still says that an inactive Today does nothing. After this
  fix, a press on the inactive Today re-reads the server's date and moves to today's
  period when the date has changed. Update that sentence in both languages so it
  matches the code; that docs line is now in your owned paths.
- Then rerun the EN/VI parity check for that line, `validate_package.py --preflight`,
  `npm run verify` and `npm run digest` LAST.
- Append "Addendum 1 results" with the Edit tool (the new digest, the exit codes).
- All runtime rules still apply: no stdin scripts, no pipes into head or tail, no
  `/dev/null`.

## Results

### Checkpoint 1 (base, reproduction, edits; checks still to run)

- Model: self-reported `claude-sonnet-5-5`. Node `v24.21.0`. Task folder `D:\.claude-tmp\timesheet\WP5-UX2-FIX1`.
- Base: HEAD `d1a20a7f0112fa00171fe4b1d6035427855f12b6`; `git status --short` showed only the coordinator's `handoff/` files (the same list as in the
  dispatch); `npm run digest` = `20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5` (814 files).
- Reproduction on the base (new tests written first, run against the unchanged base build):
  - Finding 01, simulated clock 2026-10-25 23:59:20 America/Los_Angeles, both projects: the press on the inactive Today left the sheet on
    `10/12/2026 to 10/25/2026` (expected `10/26/2026 to 11/08/2026`); the focus refresh of a second tab did nothing (the Today tag stayed on 2026-10-25).
  - Finding 03, real clock, both projects, four theme situations: the computed element opacity was 0.6 and the painted ring pixel against the card was
    2.73 / 2.70 (light, desktop / mobile) and 3.16 / 3.34 (dark), as the auditor measured.
- Edits: `src/client/TimesheetScreen.tsx` (the press always re-reads; focus and visibility refresh), `src/client/components/PeriodBar.tsx` (guard removed),
  `src/client/styles.css` (colour dimming), `tests/client/periodJumpModel.test.ts`, new `tests/client/userWording.test.ts`, `tests/e2e/today.spec.ts`,
  `tests/e2e/focus-ring.spec.ts`, docs/04 and docs/10 (EN and VI).

### Final results

Fixes:

- **WP5-UX2-AUDIT-01.** `PeriodBar.tsx` no longer ignores a press on the inactive Today. `TimesheetScreen.tsx` `jumpToToday(wasAway)` always re-reads
  `/periods/current` and judges with `todayJump` on the fresh answer: it jumps and announces only when the fresh state is away; otherwise it renews the
  periods only (the Today tag follows the server date) and leaves the sheet and the live region as they are. A new effect re-reads the periods on window
  `focus` and on `visibilitychange` to visible, in the own view and in a shared view alike (through `request`, so a shared view reads the owner's route),
  one read at a time. No device clock and no display zone is read. The model needed no change.
- **WP5-UX2-AUDIT-02.** One clause in docs/04 lines 48 and 56 and the docs/10 bullet "Phone Review link", EN and VI: below about 330px, when Current
  period is shown, the Review link takes its own row with its full label.
- **WP5-UX2-AUDIT-03.** `styles.css`: `button.secondary[aria-disabled='true']` now uses `color: var(--muted)` and `border-color: var(--line)`; the element
  `opacity` is gone and the inactive hover rule uses the same border. Only one element uses the rule: the Today button of the period bar (`grep` of
  `aria-disabled` in `src/client`); `--opacity-disabled` stays for `button:disabled` and the line-1291 rule. No new token, so no dark-set change.
- **R-UX2A-2.** New `tests/client/userWording.test.ts` (source scan of `src/client` for the old clock wording, with a two-id allowlist, plus two
  scanner self-checks).

Ring numbers after the fix (painted pixel in the accent band against the card, `ring-after.txt`; element opacity 1): light 6.09 (mobile) / 6.11
(desktop); dark 6.79 (mobile) / 6.40 (desktop); both manual overrides the same as their theme; the muted text on the card is 5.83 (light) and 6.56 (dark).
Base: 2.70 / 2.73 light, 3.34 / 3.16 dark.

Tests:

- `npm run typecheck` 0, `npm run lint` 0 (0 deprecation lines), `npm test` 0: 89 files, 1882 tests (base 88 / 1878; +1 midnight-decision unit test in
  `periodJumpModel.test.ts`, +3 wording tests).
- FULL e2e on the real clock (`e2e-full1.txt`, 2026-10-15 08:57-09:09Z, one run, its own output folders): exit 0, 448 passed, 0 failed, 42 skipped
  (desktop 216 passed / 29 skipped; mobile 232 / 13). 490 tests (base 476: +4 ring tests and +3 Today tests per project). No ECONNRESET and no
  `ERR_NO_BUFFER_SPACE`, so no rerun.
- Midnight and sweep table (simulated clock; every row exit 0; each in its own output folder):

| Instant (America/Los_Angeles) | Run | Result |
|---|---|---|
| 2026-10-25 23:59:20 (period end, crosses into the window) | midnight e2e, both projects | 2 passed |
| 2026-10-31 23:59:20 (mid-period, one day before the DST change) | midnight e2e, both projects | 2 passed |
| 2026-10-26 00:30 (first window day) | `today.spec.ts`, both projects | 23 passed, 5 skipped |
| 2026-10-17 10:00 (outside the window) | `today.spec.ts`, both projects | 23 passed, 5 skipped |

  The gate runs the midnight e2e under the FIX10 preload (`NODE_OPTIONS=--import .../shiftclock.mjs`, `AB8_SHIFT_MS` = target minus now, target 40 s
  before midnight) with `-g "left open across"`; on the real clock the same test takes its other branch (the inactive press issues exactly one
  `/periods/current` read and leaves the period, the live region and the Today tag as they are).
- Mutation runs (all restored, `git status` shows only the intended files):
  - wording test, `mut-a-…` to `mut-e-…`: `otModel.ts:107` ("Clocked in"), `PolicyFields.tsx:52` ("first clock-in"), `SharingSettings.tsx:42`
    ("Clock in/out"), `ClockProvider.tsx:207` ("Clock out again") and `ClockOutDialog.tsx:122` ("clock out again") each fail 1 of 3 tests naming the line;
    after the restore 3 of 3 pass (`mut-restored.txt`).
  - e2e: the old press guard restored fails the midnight e2e on both projects (`mut-guard-e2e.txt`); the `visibilitychange` listener removed fails the
    refresh e2e in the own view and in the shared view (`mut-vis-e2e.txt`).
- `validate_package.py --preflight` with the workflow Python at `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`:
  exit 0, PASS. EN/VI parity of the four changed lines: each pair has the same clause and the same literal "330px" (`docs-parity.txt`).
- Privacy grep of the diff, the new test and the evidence: no e-mail address and no user-profile path left (`<user>` masks).
- `npm run verify` (SMOKE_PORT 48771; DATA_DIR and DATABASE_PATH inside the task folder): exit 0, 89 files / 1882 tests, SMOKE PASSED. `npm run digest`
  last: `d2728e838a215e0433433ab5b719abebc0e3e33da14a82da050bbe128e3cf9da` (815 files, `handoff/` excluded; the base was 814 files, +1 new test file).

Notes and deviations:

- In the own view a tab becoming visible makes three reads of `/periods/current`: the check in/out lookup and the sheet reload (T09, existing) and the
  new screen refresh; the e2e asserts at least three there and exactly one in a shared view. I left the T09 path alone.
- The shared-view refresh test lives in `today.spec.ts` (with its own owner and grantee accounts) because `sharing.spec.ts` is not an owned path.
- docs/04 line 54 still says Today is "doing nothing" while inactive; it was outside the named lines and I left it. A one-word follow-up for the
  coordinator ("re-reads the server date and acts only when it moved").
- Process slips (no effect on files or processes): one early `ls ... | head -0` and one `... | tail -5 > /dev/null` in a command line, both against the
  runtime rules; nothing else was piped or redirected that way. No background task is left running.

Status: done.

### Addendum 1 results

- docs/04 line 54 (EN and VI) updated: the inactive Today is "dimmed with colours" (no longer "doing nothing"); a press re-reads the server's date and moves
  to today's period only when the date has changed (for example after midnight in the reporting zone), otherwise nothing moves; the periods are also re-read
  when the window regains focus or the tab becomes visible. Parity: both languages carry the same three clauses and the same literal `aria-disabled`.
- `validate_package.py --preflight` (workflow Python): exit 0, PASS. `npm run verify` (SMOKE_PORT 48772, DATA_DIR and DATABASE_PATH in the task folder):
  exit 0, 89 files / 1882 tests, SMOKE PASSED.
- `npm run digest` last: `ac1895d9f79da0fa6bbcbca9e8f52fddf67cb4fed3ac7d420e73cee6181fe8a2` (815 files, `handoff/` excluded). This replaces the earlier digest.
- Evidence: `preflight2.txt`, `verify2.txt`, `digest2.txt` in `handoff/delivery/evidence/WP5-UX2-FIX1/`. No background task is running.
