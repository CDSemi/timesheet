# WP5-CALDEF-REGATE dispatch brief (scoped regate after the tests-only fix WP5-CALDEF-FIX2)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-REGATE, package WP5, kind
  gate, attempt 1. It depends on WP5-CALDEF-FIX2-FREEZE (done).
- **Why.** WP5-CALDEF-GATE on 300d61f / e24274b9 failed on one item only: in the real-clock
  FULL run of 2026-11-03, desktop `tests/e2e/classic-scrollbar.spec.ts:143` read
  `scrolled()` = 0. WP5-CALDEF-DIAG1 found a test assumption: the press point lies under the
  floating Day editor when it docks right, which happens when `days[0]` is a Monday to
  Wednesday. WP5-CALDEF-FIX2 changed only that spec. Read:
  - the Results of `handoff/delivery/tasks/WP5-CALDEF-GATE.md`, `WP5-CALDEF-DIAG1.md` and
    `WP5-CALDEF-FIX2.md`;
  - the coordinator decision of 2026-11-03 on the board (`coordinator_decisions`), which sets
    this scope.
- **Target.**
  - TARGET_SHA = the `commit_sha` of WP5-CALDEF-FIX2-FREEZE on the board; TARGET_DIGEST = its
    `source_digest`. Both are restated in the dispatch message.
  - HEAD must equal origin/main, or be a later commit that changes only `handoff/`.
  - PREV_SHA = 300d61f055a859857aa8eb3845ed21f4560e82fa (WP5-CALDEF-FREEZE; digest
    e24274b98ceaef10d83b3a9538680c6ed703657eb014211fc015ce9eb9d251a7).
  - Expected FULL counts: 1,090 tests; desktop 508 / 37 skipped, mobile 429 / 116 skipped,
    0 failed. Record the exact per-project counts.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size S, risk M, novelty no. Tests-only change. Write the records in English.
- **You run alone.** No other mission agent is active. Never touch `.claude/worktrees/` or its
  branch. Do not push, pull or merge.

## The load rule (as in WP5-CALDEF-GATE)

1. **Entry census.** Take two inline samples, a few seconds to a minute apart.
   - If the non-mission load is above about 8 busy cores, stop and report "host busy" with
     the figures. Do not wait, do not sleep, and do not proceed.
   - If the inline query is denied, record "census not taken (permission)" and go on.
2. Take a census at the end of each sweep, and right after any failure.
3. **Classify every failure from its trace.**
   - **A timeout whose trace shows host starvation, while the census right after is over the
     limit.** That run is NOT VERIFIED. Repeat it once after the load is back within the
     limit, and record both runs. The repeat must pass.
   - **A network or buffer error** (including a `seed sign-in` 401 at a test's private
     server, the harness port race DIAG1 described in `fixtures.ts`): repeat once, and
     record both runs.
   - **Every other failure fails the gate.**
4. Never rerun a run to turn an assertion failure into a pass.

**Public repository:** evidence may hold process names, IDs, counts and CPU times only. Never
write the command line of a process the mission did not start (a `node dist/server/index.js`
on port 3000 since 2026-10-27 is not the mission's: leave it alone and do not record its
command line). Use only inline
`powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ..."`
queries. Never use `-ExecutionPolicy` or `-File`.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after: the export form, `git ls-tree`, and
     `npm run digest`. All equal TARGET_DIGEST (885 files expected).
   - `git diff --name-status PREV_SHA..TARGET -- . ':!handoff'` lists exactly
     `tests/e2e/classic-scrollbar.spec.ts`. `git diff --check` clean.
   - Read the diff of that file: it matches `handoff/delivery/evidence/WP5-CALDEF-DIAG1/
     proposed.patch.txt`; no loosened assertion, dropped step, raised timeout, sleep, skipped
     date or deprecated API.
   - **Clean builds** of PREV_SHA and the target, each after its own `npm ci` in an export.
     All of `dist/` identical (file list and SHA-256). This is the premise for carrying the
     items below forward; if anything differs, stop and report FAIL.
2. **`npm audit --omit=dev`:** exit 0, 0 vulnerabilities (the advisory database changes over
   time).
3. **Core,** in the target export, one at a time:
   - `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory, no deprecation
     warning);
   - `npm run verify` (SMOKE PASSED);
   - `npm test` once. Expect 103 files and 2,425 tests.
   - **The validators:** `check_recovery.py` (141), `validate_package.py --preflight` (the
     workflow Python; if it lacks a time-zone database, a scratch `tzdata` on `PYTHONPATH`
     outside the repository, recorded) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
4. **The real-clock FULL e2e** on both projects, alone, `--workers=6`, with per-project
   counts: 0 failed. Record the run date, the weekday of `days[0]` (the newest past free
   workday of the displayed period) and the side the floating Day editor docks on in
   `classic-scrollbar.spec.ts:143`.
5. **The simulated-clock sweep:** all six runs, at the same instants and scopes as
   WP5-CALDEF-GATE (full at 2026-10-26T16:00Z, 2026-11-01T08:45Z and 2027-03-14T10:30Z; the
   seven-file scope at 2026-10-27T06:58:30Z, 2027-01-01T07:30Z and 2027-01-01T08:30Z), both
   projects, `--workers=6`, through the FIX10 wrapper. Validate the preload with one control
   first. Every run ends with 0 failed, under the load rule.
6. **The changed test.**
   - Stress: `classic-scrollbar.spec.ts:143`, desktop, `--repeat-each=20 --workers=6`,
     through the wrapper at 2026-11-04T18:00Z (drawer right) and 2026-11-06T18:00Z (drawer
     left): 0 failed.
   - The whole spec file once on the real clock, both projects: 0 failed.
   - **Mutants** M1 (`onOwnScrollbar` in `src/client/TimesheetScreen.tsx` always false) and
     M2 (`.sheet-week { overflow-x: hidden }` in the 480-929 px query of
     `src/client/styles.css`), as DIAG1 and FIX2 defined them, in a scratch copy of the
     target, each at 2026-11-04T18:00Z and 2026-11-06T18:00Z: `:143` fails each time, for the
     reason DIAG1 recorded. Restore byte-equal (`cmp` against `git show TARGET:<path>`) and
     rebuild; the rebuilt `dist/` equals the target build.
7. **Carried forward from WP5-CALDEF-GATE,** on the premise of item 1 (only a test file
   changed and `dist/` is identical): the container drill (209 / 0), the 36 mutants of the
   round, the INT3 administrator probe, the smoke DST proof, axe (21 scans, 0 violations),
   the documents parity, and the stress of `calendar-default.spec.ts`, FIX18, FIX19 and the
   unsaved-changes tests. State the carry-forward and its premise in the Results; do not
   rerun them.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-REGATE`. Set TEMP and TMP to it. Ports
  52290-52329, with `SMOKE_PORT` in that range (the e2e harness picks its own free loopback
  ports; that is fine).
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only for the inline read-only census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES,
  NOT EVEN TO WRITE A FILE), NO `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO
  `python -c`, NO `node -` OR `python -`. NO BARE `cat`. NEVER PIPE INTO `head`, `tail` OR
  `cat`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul`, ALSO NOT IN `2>` AND NOT AS A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON
  SCRATCH FOLDERS. NO PID KILLS, NO `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO
  FIFO WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO
  DETACHED SHELLS (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS OR WAIT
  LOOPS, NO TRAILING `&` INSIDE A BACKGROUND RUN.**
  - Write and change scripts and mutants with the Write and Edit tools.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. A run you must stop is stopped through
    its own handle, never by PID.
- **Git.** Never change any git configuration. For git in a scratch export or clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Files.**
  - Create files only in the task folder and the evidence folder.
  - Keep every probe script in the evidence folder as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`
    (never a lint-parsed extension inside the repository).
  - Evidence is masked LF `.txt` only, with no stray scratch files. Every file ends with
    exactly one newline, this brief's Results included.
- **Data.**
  - Use synthetic data and local mail capture only.
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal, and mask user profile paths as `<user>`.
  - No evidence basename may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running.**
- If a permission check denies a call, stop and report. The only exception is the census rule
  above.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-CALDEF-REGATE/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - every failure, with its class and the census beside it;
  - the `dist/` comparison and the carry-forward;
  - the audit result;
  - the counts of items 3 to 6, with the weekday of `days[0]` and the dock side of item 4;
  - the digests before and after.

## Results

Verifier: self-reported model claude-sonnet-5-5 (timesheet-verifier, 2026-11-03, 11:48Z to 12:52Z). Evidence: `handoff/delivery/evidence/WP5-CALDEF-REGATE/` (index `00-README.txt`).
Nothing staged or committed; the repository changed only in this Results section and that evidence folder. Node v24.21.0, Edge, 32 logical processors.

**Decision: PASS** (scope: tests-only change; NAS items stay NOT VERIFIED). No failure in any gate run; nothing repeated.

1. Identity and scope. HEAD = origin/main = b810ba94 before and after; `git status` outside `handoff/` empty before and after. Digest 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a
   (885 files) before and after in the export form, the `git ls-tree` form and `npm run digest` (`01-*`, `63-*`). `git diff --name-status 300d61f..b810ba9 -- . ':!handoff'` = `M tests/e2e/classic-scrollbar.spec.ts` only;
   no package, lockfile or migration path; `git diff --check` exit 0. The diff equals DIAG1 `proposed.patch.txt` line for line: no loosened assertion, dropped step, raised timeout, sleep, skipped date or deprecated API (`22-*`, `70-diff-review.txt`).
   Clean builds (each after its own `npm ci`, exit 0): `dist/` of 300d61f and of the target are 250 files each, 250 identical by path and SHA-256, 0 differ (`50-dist-compare.txt`); again identical after all runs (`63-*`).
   The premise for the carry-forward holds.
2. `npm audit --omit=dev`: exit 0, 0 vulnerabilities (`03-npm-audit.txt`; the only output besides is the npm `allow-scripts` configuration notice).
3. Core (target export): `npm run lint`, `typecheck`, `build` exit 0, no chunk advisory and no deprecation text (`03-warn-grep.txt` only matches vite's "rendering chunks..." line); `npm run verify` exit 0, SMOKE PASSED;
   `npm test` once: 103 files, 2,425 tests passed. Validators: `check_recovery.py` 141 PASS, `validate_package.py --preflight` PASS (no tzdata scratch needed), `validate_orchestration.py` PASS, exit 0 each (`11-*`).
4. Real-clock FULL e2e (2026-11-03, one run, both projects, `--workers=6`, 9.1 min): desktop 508 passed / 37 skipped / 0 failed; mobile 429 passed / 116 skipped / 0 failed; 937 passed, exit 0.
   Probe at the same clock (`04-probe-real.jsonl.txt`): `days[0]` = 2026-11-02, a Monday; the floating Day editor docks on the right, so the patched test presses near the left end of the card.
5. Six simulated-clock sweeps, `--workers=6`, FIX10 wrapper; controls validated the preload first (`log-control-*.txt`: today_local 2026-11-01, 2026-11-04, 2026-11-06 and the real date confirmed). Full runs are sharded 1/2 and 2/2 (sums):
   2026-10-26T16:00Z, 2026-11-01T08:45Z and 2027-03-14T10:30Z each desktop 508 / 37 skipped / 0 failed and mobile 429 / 116 / 0; the seven-file scope at 2026-10-27T06:58:30Z, 2027-01-01T07:30Z and 2027-01-01T08:30Z each
   desktop 234 / 16 / 0 and mobile 166 / 84 / 0. All 0 failed, exit 0 (`17-run-counts.txt`).
6. Changed test. Stress `classic-scrollbar.spec.ts:143`, desktop, `--repeat-each=20 --workers=6`: 20 passed at 2026-11-04T18:00Z (drawer right) and 20 passed at 2026-11-06T18:00Z (drawer left), 0 failed.
   The whole spec on the real clock: desktop 3 passed, mobile 3 skipped (the spec skips that project), 0 failed.
   Mutants, in a scratch copy of the target (`export-mut`), each at both instants: M1 (`onOwnScrollbar` always false) fails `:143` at "a scrollbar press is not a press on the page" (`toBeVisible`, element not found) at both;
   M2 (`.sheet-week { overflow-x: hidden }` in the 480-929 px query) fails at "a week card with a sideways scrollbar in view" (`Received: null`) at both; the reasons are the ones DIAG1 and FIX2 recorded.
   Both restored: `cmp` against `git show b810ba9:<path>` equal for both files, `diff -rq` of `src`, `tests` and `scripts` against the target export empty, the rebuild exit 0 and its `dist/` equals the target build (250/250 identical) (`61-*`, `62-*`).
7. Carried forward from WP5-CALDEF-GATE (not rerun), on the premise of item 1 (one test file changed, `dist/` identical): the container drill (209 / 0), the 36 mutants of the round, the INT3 administrator probe,
   the smoke DST proof, axe (21 scans, 0 violations), the documents parity, and the stress of `calendar-default.spec.ts`, FIX18, FIX19 and the unsaved-changes tests.

Load: entry census 0.94 and 0.70 busy cores (limit about 8); the highest census after a run was 1.83; final 0.80 (`10-census-*`). No run was classified as starved or network-class because none failed.
Leftovers: no mission process remains (`90-*`: the Edge and node processes listed are older than the task or children of the owner's Edge). No server, browser or Compose project was started outside the runs.

Slips: one early `ls ... | head -0` (a forbidden pipe into `head`), no effect on a result. The background run `runset.sh` was cut after the real-clock FULL run by editing the script while it ran, because waiting is not allowed; all later runs were foreground slices.

Status: done
