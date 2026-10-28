# WP5-UX5-REGATE10 dispatch brief (scoped regate after FIX15, tests only)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE10, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX15-FREEZE (done).
- **Scope.** WP5-UX5-REGATE9 ran on bd9c275 and failed on one criterion only. In the
  seven-spec sweep that crosses the Los Angeles midnight (2026-10-27T06:58:30Z), the mobile
  test `day-editor.spec.ts:2340` did not find its open session. What followed:
  - **WP5-UX5-DIAG9** found a test assumption at the day boundary. The product was correct:
    an overnight session belongs to its starting date (docs/02, D-05). 31 tests shared the
    assumption.
  - **WP5-UX5-FIX15** changed four test paths, +101/-14:
    - `tests/e2e/day-editor.spec.ts`: `clockIn` polls the day it read and the next one, and
      asserts the found day against the session's own `start_utc`;
    - `tests/e2e/fixtures.ts`: the automatic fixture `midnightFence`. If the reporting-zone
      midnight is within 45 s, it holds a test before it starts. It reads only `Date.now()`
      and `SEED_REPORTING_ZONE`, with no sign-in, request or database access;
    - `tests/e2e/today.spec.ts`: the deliberate crossing test (`:626`) is exempt;
    - `tests/integration/timesheet-api.test.ts`: a check-in at the midnight boundary is
      filed under its starting date.

  Everything else in REGATE9 passed on bd9c275. That includes the drill, axe, every earlier
  model and mutant, and stress. Read the Results of REGATE9, DIAG9 (with Addendum 1) and
  FIX15 in `handoff/delivery/tasks/`.
- **Target.**
  - TARGET_SHA = be2afa2e3c43514581ed62fd145c15eeef13b534. It is pushed. HEAD must equal
    origin/main, or be a later commit that changes only `handoff/`.
  - TARGET_DIGEST = ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f (882
    files).

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size M, risk M (shared e2e fixtures, tests only), novelty no.
  - This is a scoped regate. `dist/` must be identical, so the container drill and axe
    carry forward from REGATE9. Item 1 proves the condition.
  - Write the records in English.
- **Failures.** Report every failure plainly. Do not rerun to get a pass, and do not waive.
  If a failure belongs to a class already fixed, say which one. The fixed classes are:
  - a measuring race after a width change;
  - a starved background tab;
  - the range ladder;
  - a date read across the midnight.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## First, before anything else

1. **Starting point.** Run `git fetch origin`. Record HEAD and origin/main.
   - HEAD must be be2afa2, or a later commit that changes only `handoff/`.
   - If origin/main has moved past HEAD, stop and report. Do not merge.
2. **Host census, read-only, stopping nothing.**
   - Use only inline `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
     Select-Object ..."` queries. Take two samples 60 s apart, and redirect them to a file in
     the task folder. **Never use `-ExecutionPolicy` or `-File`.**
   - **This is a public repository.** Evidence files may hold process names, IDs, counts
     and CPU times only. Never write the command line of a process the mission did not
     start. Use command lines only in memory, to recognise mission processes.
   - Proceed if the non-mission load is under about 4 busy cores. If it is higher, wait 10
     minutes and take the census again. If it is still higher, stop and report.
   - If the inline query is denied, record "census not taken (permission)" and go on.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --name-status bd9c275..TARGET -- . ':!handoff'` must list exactly FIX15's four
     test paths. No `src/`, package or lockfile change.
   - **Clean builds** of bd9c275 and of the target, each after its own `npm ci` in an
     export. All of `dist/` must be identical. Any difference fails the gate, and the drill
     and axe could not carry forward.
2. **`npm audit --omit=dev`** must exit 0.
3. **Core,** in the export, one at a time:
   - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm run verify`;
   - `npm test` three times. Expect 101 files and 2,389 tests.
   - **Every run must exit 0.** A test timeout is a failure: take a census immediately
     after it and record it.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
4. **The real-clock FULL e2e** on both projects, alone, with per-project counts. It must have
   0 failed. Expect desktop 469 ok and 35 skipped, and mobile 407 ok and 97 skipped.
5. **The simulated-clock sweep:** the same six runs, instants and scopes as REGATE9, with
   `--workers=6`, through the FIX10 wrapper from `handoff/delivery/evidence/WP-UX-FIX10/`.
   - Validate the preload with one control first.
   - Every run ends with 0 failed.
   - A run that fails only with a network or buffer error is rerun once, and both runs are
     recorded. **Any other failure, a timeout included, fails the gate.**
   - Report the longest `logo.spec.ts` test in each FULL run.
   - In the seven-spec run at 2026-10-27T06:58:30Z, record how long the desktop crossing test
     `today.spec.ts:626` takes. Tens of seconds shows that it still crosses the midnight.
6. **Stress** on the real clock, 0 failed:
   - "Check in then Check out asks for break confirmation" and "a stale session version at
     Check out", both projects, `--repeat-each=20 --workers=10`;
   - FIX14's tests, because the shared fixtures changed:
     - the `controls.spec.ts` title-row tests, both projects, `--repeat-each=20
       --workers=10`;
     - the range ladder, desktop, `--repeat-each=60 --workers=6`;
     - the two cross-tab theme tests, both projects, `--repeat-each=20 --workers=6`.
7. **Test strength.** Run everything in a scratch copy, and restore the copy byte-equal
   afterwards.
   - **FIX15 mutants and controls.** Use the definitions in
     `handoff/delivery/evidence/WP5-UX5-FIX15/` and `WP5-UX5-DIAG9/`:
     - mutant A2: the INSERT stores an already-ended session. It fails the check-in tests.
     - mutant B: the check-in is filed under the next accounting date. It fails the
       check-in tests through the day assertion.
     - the UTC-date mutant of the source fails the new integration test.
     - with the exemption removed, the crossing test is held: about 2 s instead of tens of
       seconds.
     - DIAG9's case C2 passes on the target, and its 13 date-reader models pass.
     - the fence-off control (`MIDNIGHT_FENCE_MS = 0`) makes those 13 fail again.
   - **Regression model.** Run the DIAG5 delay suite over the 15 `setViewportSize` spec
     files at 90 ms, on both projects, with `--workers=6`: 0 failed. Use DIAG7's form,
     `fixtures.diag.ts.txt`, merged onto the new `fixtures.ts`.
   - **Carry-forward check.** Confirm with `git diff bd9c275..TARGET` that `src/` and the
     FIX12 to FIX14 test files other than the four are unchanged. The FIX12 to FIX14 mutants
     and the DIAG6 models then stand from REGATE9.
   - **Read the FIX15 diff.**
     - The fence makes no sign-in, HTTP request or database access.
     - It skips no test and changes no assertion.
     - Its only timeout is its own fixture timeout.
     - The waits are state-based: no fixed sleep and no looser assertion.

**Decision:** PASS, FAIL or NOT VERIFIED. The drill and axe carry forward from REGATE9 only if
item 1 shows `dist/` identical. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE10`. Set TEMP and TMP to it. Ports
  51240-51279, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only for the inline read-only census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES,
  NOT EVEN TO WRITE A FILE), NO `node -e` (NOT EVEN `node -e 1`), NO `python -c`, NO
  `node -` OR `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS
  A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS. NO PID KILLS, NO
  `Stop-Process`, NO `sed -i` (ALSO NOT ON TASK COPIES), NO INTERACTIVE SHELLS, NO FIFO
  WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED
  SHELLS (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS.**
  - Write and change scripts with the Write and Edit tools.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. A run you must stop is stopped through
    its own handle, never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Files.**
  - Create files only in the task folder and the evidence folder.
  - Keep every probe script in the evidence folder as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`.
  - Evidence is masked LF `.txt` only, with no other extension.
  - The last line of every file you write ends with exactly one newline: no blank line at
    the end. This includes this brief's Results.
- **Data.**
  - Use synthetic data and capture mode only.
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal into evidence, and mask user profile paths as `<user>`.
  - No evidence basename may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running.**
- If a permission check denies a call, stop and report. The only exception is the census
  rule above.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE10/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - every failure, and its class;
  - the `dist/` comparison;
  - the sweep counts;
  - the crossing test's time;
  - the digest.

## Addendum 1 (coordinator, 2026-10-28, after the first result)

- **The coordinator's brief was at fault.** It said that the fence-off control "makes those
  13 fail again". That overstated the evidence:
  - FIX15's own mobile control also had `today.spec.ts:242` passing with the fence off;
  - the control is one sample per target of a 0.3 s timing model, not a deterministic one.

  Your NOT VERIFIED was the right call under the brief as written. Items 1 to 6 and the rest
  of item 7 stand, and you do not rerun them.
- **What the control must show.** The question is whether the fence, and nothing else,
  removes the date-reader failures. The criterion, now stated precisely:
  - **Fence on:** no target fails in any sample.
  - **Fence off:** each target fails in at least one sample. Use your first sample plus five
    more.
  - A target that never fails with the fence off is not a defect of the target. That test is
    then safe at that placement. Show from DIAG9's hook timeline where the midnight fell
    relative to the test's date read in its samples, and report it as a model-placement
    note. It does not fail the item.
- **Run, one at a time:**
  - `day-editor.spec.ts:795`, on desktop and on mobile;
  - `today.spec.ts:242`, on mobile;
  - five more fence-off samples each, and five fence-on samples each, with the same 0.3 s
    model;
  - for each sample, record the hook instants (the date read, the midnight, the end of the
    test).
- **Then decide.**
  - PASS if the fence-on samples never fail, and every target either fails in at least one
    fence-off sample or carries a placement note.
  - FAIL if any fence-on sample fails.
  - Add an "Addendum 1 results" part at the end of Results, with the decision.
- The same runtime rules apply. Every file ends with exactly one newline. Return at most 100
  words, beginning 'Self-reported model: ...'.

## Results

**Decision: NOT VERIFIED.** Every product, regression, sweep and stress check passed with 0 failures. One strength claim in item 7 did not reproduce: the fence-off control did not make all 13 date-reader models fail (`day-editor.spec.ts:795` passed with the fence off on both projects). Not rerun, not waived.

Verifier: sonnet (claude-sonnet-5-5). Evidence: `handoff/delivery/evidence/WP5-UX5-REGATE10/` (223 masked LF `.txt`; index `00-README.txt`).

- **Start.** `git fetch origin`; HEAD = origin/main = be2afa2e3c43514581ed62fd145c15eeef13b534, branch main. Census: sample 1 at 18:55:17Z, sample 2 at 18:56:12Z (gap 55 s, not 60), 3.27 busy cores of 32; proceeded. Sample 3 after the run: same node process count as before (16), nothing left running.
- **1 Identity.** Digest before and after, export form, ls-tree form and `npm run digest`: ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f, 882 files, all six equal. Non-handoff status empty before and after. `git diff --name-status bd9c275..TARGET -- . ':!handoff'` = exactly `tests/e2e/day-editor.spec.ts`, `tests/e2e/fixtures.ts`, `tests/e2e/today.spec.ts`, `tests/integration/timesheet-api.test.ts`; `src/` diff 0 lines, package and lockfile diff 0 lines; `git diff bd9c275..TARGET` on `src/` and the FIX12 to FIX14 test files is empty. **`dist/` identical:** clean `npm ci` builds of bd9c275 and of the target, 250 files each, 0 differing hash lines; dist after `npm run verify` equals dist before. The drill and axe therefore carry forward from REGATE9 (not rerun, as the brief says).
- **2** `npm audit --omit=dev` exit 0, 0 vulnerabilities.
- **3 Core** (export): `npm ci`, lint, typecheck, build (no advisory, no deprecation line), `npm run verify`: exit 0. `npm test` x3: exit 0 each, 101 files, 2,389 tests each. `check_recovery.py` (106 checks, PASS), `validate_package.py --preflight`, `validate_orchestration.py`: exit 0.
- **4 Real-clock FULL e2e:** desktop 469 ok / 35 skipped / 0 failed; mobile 407 ok / 97 skipped / 0 failed.
- **5 Sweep** (`--workers=6`, FIX10 wrapper; control first: 2 passed on the real clock and on 2026-11-01T08:45Z with `today_local` 2026-11-01). All six runs 0 failed, exit 0, no rerun needed:
  - full 2026-10-26T16:00Z: 469+407 ok; longest logo test 37 s.
  - full 2026-11-01T08:45Z: 469+407 ok; longest 60 s.
  - full 2027-03-14T10:30Z: 469+407 ok; longest 59.8 s.
  - seven-spec 2026-10-27T06:58:30Z: desktop 219 ok / 15 skipped, mobile 165 ok / 69 skipped. The desktop crossing test (`today.spec.ts:627`, the brief says :626) took **1.1 m** in this run, so it still crosses the midnight; the mobile one 2.3 s.
  - seven-spec 2027-01-01T07:30Z and 2027-01-01T08:30Z: desktop 219 / 15, mobile 165 / 69, 0 failed each.
- **6 Stress, real clock, 0 failed:** the two check-in tests, both projects, x20 w10: 80 ok; controls title-row, both projects, x20 w10: 120 ok; range ladder desktop x60 w6: 60 ok; cross-tab theme tests, both projects, x20 w6: 80 ok.
- **7 Test strength** (scratch copy `export-mut`, restored byte-equal; dist, src and the three e2e files compared with `cmp`):
  - Control (unmutated) passes: 4 of 4. Mutant A (closed session in the past): 4 of 4 fail (HTTP 500 console error). A2 (already-ended session): 4 of 4 fail. B (next accounting date): 4 of 4 fail through the day assertion (`Expected "2026-10-28"`, `Received "2026-10-29"`).
  - Boundary integration test: 16 passed; against the UTC-date mutant of the source: 1 of 16 failed.
  - Crossing test at 2026-10-27T06:59:20Z: normal 38.3 s; with the exemption removed 1.9 s (held by the fence, then runs at once).
  - DIAG9 cases C1 to C6, both check-in tests, both projects: 24 of 24 exit 0, including C2.
  - 13 date-reader models with the fence on (original specs, 300 ms before the midnight): desktop 13 passed; mobile 11 passed, 2 skipped (as in FIX15).
  - **Fence-off control (`MIDNIGHT_FENCE_MS = 0`): not all fail.** Desktop 12 of 13 failed, `day-editor.spec.ts:795` passed. Mobile 9 failed, `:795` and `today.spec.ts:242` passed (`:242` also passed in FIX15), `:5196` and `:293` skipped. In FIX15 `:795` failed on both projects. This was one run per model of a 0.3 s timing model; I did not rerun and do not waive. It is a control sample, not a failure of the target: the fence-on run passes. The coordinator decides whether `:795` needs a deterministic placement.
  - DIAG5 delay suite at 90 ms, 15 `setViewportSize` files, `--workers=6`, DIAG5 fixture merged as a patch onto the new `fixtures.ts`: desktop 405 ok / 33 skipped / 0 failed, mobile 343 ok / 95 skipped / 0 failed.
  - Diff read (`20-fix15-tests.diff.txt`): the fence makes no sign-in, HTTP request or database access (it reads `Date.now()` and the constant zone only); it skips no test and removes no assertion; its only timeout is the fixture's own (75 s; the inner poll is 60 s); the waits are state-based (`expect.poll` on the clock, `expect.poll` in `clockIn`), no fixed sleep. `clockIn` accepts the next day but then asserts the found day equals the oracle date of the session's own `start_utc`, so it is stricter, not looser. The crossing test is exempt by an annotation. Product diff: none.
- **Failures:** none in items 1 to 6. No network or buffer error occurred, so no rerun was made. The only unmet claim is the `:795` fence-off control above (class: control sample of the date-read-across-midnight model, not a test or product defect).
- **Process notes (honest record).** Three read-only or no-op shell slips by me, nothing written by them: an empty-input `sed` on stdin with `2>/dev/null`, a no-op pipe into `cat` with a `/dev/null` redirect, and a mistyped `cat` of a missing file with `2>/dev/null`. No PID kill, no source, docs, test, board or STATE edit; scripts and copies only in the task folder and the evidence folder. Nothing is left running.

### Addendum 1 results

**Decision: PASS.** No fence-on sample failed. No target failed with the fence off, so each carries a placement note (below); that does not fail the item.

- **Run.** `addendum.sh` in the scratch copy `export-mut` (restored byte-equal, 0 leftover scratch specs), one run at a time, the same 0.3 s model (original bd9c275 specs, DIAG9 hooks, `MIDNIGHT_FENCE_MS` 45000 or 0), plus a hook that logs the instant of every `SeedClient.call` relative to the midnight. Per target: 5 fence-off and 5 fence-on samples, in addition to the first samples above. Targets: `day-editor.spec.ts:795` desktop and mobile, `today.spec.ts:242` mobile.
- **Fence on:** 15 of 15 passed (795 desktop 5, 795 mobile 5, 242 mobile 5).
- **Fence off:** 15 of 15 passed. With the first sample, each target passed in 6 of 6 fence-off samples (the two `:795` first samples above were passes too).
- **Placement note (from the hook timeline, `81-addendum-samples.txt`).** In every fence-off sample the test body starts 0.29 s before the midnight and makes all its server date reads in the first ~30 ms (795 desktop and mobile: 3 reads at midnight -0.30 to -0.27 s; 242 mobile: 1 read at -0.29 s). The midnight falls about 0.3 s later during sign-in and page load, after the last date read, and the run ends at 07:00:01.4Z to 07:00:02.0Z. So at this placement there is no read-then-use straddle for these three tests: they are safe at the 0.3 s model with or without the fence. They are not discriminating targets there; the other models (12 of 13 desktop, 9 mobile) are. FIX15's single `:795` failure was a different tick of the same noisy model.
- Evidence: `80-addendum-exits.txt`, `81-addendum-samples.txt`, `addendum.sh.txt`, `variant-fixtures.reads-on.ts.txt`, `variant-fixtures.reads-off.ts.txt`, `mutdef-add.*`, and 30 `log-dense-add-*.txt` run logs. The overall decision above (NOT VERIFIED) is superseded by this addendum: **PASS**.
