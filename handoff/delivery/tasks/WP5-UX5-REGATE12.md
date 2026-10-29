# WP5-UX5-REGATE12 dispatch brief (scoped regate after FIX17, tests only)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE12, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX17-FREEZE.
- **Scope.** WP5-UX5-REGATE11 ran on 1fe5ad3 / 18aa0ad0 and failed on one criterion only.
  In the FULL sweep at 2026-11-01T08:45Z, the desktop `import.spec.ts:102` timed out, while
  the host carried about 6–7 busy cores of the owner's own non-mission work. Everything
  else passed. That includes:
  - the drill: 209 PASS, 0 FAIL;
  - `npm audit`: 0;
  - `npm test`: 2,397, three times;
  - the real-clock FULL run: 0 failed;
  - the other five sweeps;
  - the FIX16 mutants and probes.

  `dist/client` was identical, so axe carried forward from REGATE9.
  - **WP5-UX5-DIAG10** found a test defect that a saturated host exposes. The test drove a
    browser tab that Chromium had put behind, at idle priority. The server was never slow,
    and no commit request was sent.
  - **WP5-UX5-FIX17** changed two test files:
    - `tests/e2e/import.spec.ts`, +9: `bringToFront` before each step on a tab that may be
      behind, in its two two-tab tests;
    - `tests/e2e/today.spec.ts`, +17/-2: at `:641`, the second page opens in a browser
      context of its own.

  Read the Results of REGATE11, DIAG10 (with Addendum 1) and FIX17 in
  `handoff/delivery/tasks/`.
- **Target.**
  - TARGET_SHA = the `commit_sha` of WP5-UX5-FIX17-FREEZE on the board. The coordinator
    confirms it in the line below before dispatch. It is pushed. HEAD must equal
    origin/main, or be a later commit that changes only `handoff/`.
  - Target confirmation: (filled in at dispatch).
  - TARGET_DIGEST = 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf (882
    files).

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size M, risk M (two e2e files), novelty no.
  - This is a scoped regate. `dist/` must be identical to the 1fe5ad3 build. So these
    carry forward:
    - the container drill and `npm audit`, from REGATE11;
    - axe, from REGATE9.
  - Write the records in English.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## The load rule (new; read it first)

1. **Entry census.** Take two inline samples, a few seconds to a minute apart.
   - If the non-mission load is above about 4 busy cores, **stop and report** "host busy"
     with the figures. Do not wait, do not sleep, and do not proceed. The coordinator
     retries later.
   - If the inline query is denied, record "census not taken (permission)" and go on.
2. **During the gate,** take a census at the end of each sweep, and **right after any
   failure**.
3. **Classify every failure from its trace.**
   - **A timeout whose trace shows host starvation, while the census right after shows
     non-mission load above the limit.** In the trace, starvation looks like this: the
     server answers fast, but a browser step is slow or never completes. That run is
     **NOT VERIFIED**, not FAIL.
     - Repeat that run once, after a census shows the load back within the limit.
     - Record both runs. The repeat must pass.
     - If the load does not come back within the limit, stop and report.
   - **A network or buffer error:** repeat once, as before.
   - **Every other failure fails the gate,** including a timeout on a host within the
     limit, or one that shows a slow server.
4. Never rerun a run to turn an assertion failure into a pass.

**Public repository:** evidence may hold process names, IDs, counts and CPU times only.
Never write the command line of a process the mission did not start. Use only inline
`powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ..."`
queries. Never use `-ExecutionPolicy` or `-File`.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --name-status 1fe5ad3..TARGET -- . ':!handoff'` must list exactly
     `tests/e2e/import.spec.ts` and `tests/e2e/today.spec.ts`. No `src/`, package or
     lockfile change.
   - **Clean builds** of 1fe5ad3 and of the target, each after its own `npm ci` in an
     export. All of `dist/` must be identical. If it is not, the drill and axe cannot carry
     forward; report it.
2. **Core,** in the export, one at a time:
   - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm run verify`;
   - `npm test` once. Expect 101 files and 2,397 tests.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
3. **The real-clock FULL e2e** on both projects, alone, with per-project counts: 0 failed.
   Expect desktop 469 ok and 35 skipped, and mobile 407 ok and 97 skipped.
4. **The simulated-clock sweep:** all six runs, at the same instants and scopes as REGATE11,
   with `--workers=6`, through the FIX10 wrapper from
   `handoff/delivery/evidence/WP-UX-FIX10/`. Validate the preload with one control first.
   - Every run ends with 0 failed, under the load rule above.
   - Report the longest `logo.spec.ts` test in each FULL run.
   - In the seven-spec run at 2026-10-27T06:58:30Z, record how long the desktop crossing
     test `today.spec.ts:641` takes.
5. **Stress,** 0 failed:
   - `import.spec.ts`, both projects, `--repeat-each=20 --workers=6`, on the real clock
     and at 2026-11-01T08:45Z;
   - the two two-tab import tests under DIAG10's self-stopping 48-thread burner
     (`burn.mjs.txt`), 12 repeats on each project;
   - `today.spec.ts:641`, both projects:
     - the crossing branch at 2026-10-27T06:58:30Z, 6 repeats;
     - the normal branch at 2026-11-01T08:45Z, 12 repeats;
     - one crossing run of 6 repeats under the burner.
6. **Test strength.** Run everything in a scratch copy, and restore the copy byte-equal
   afterwards.
   - DIAG10's `mutant-n1.patch.txt` fails the commit test under the burner.
   - The original `context.newPage()` in `today.spec.ts` fails the crossing branch under
     the burner.
   - DIAG10's product mutant `mutant-product-m1.patch.txt` (rebuild the client) fails the
     commit test. Rebuild after restoring, and show `dist/` equal to the base.
   - **Carry-forward check.** Confirm with `git diff 1fe5ad3..TARGET` that `src/`,
     `tests/e2e/fixtures.ts` and every other test file are unchanged. The FIX12 to FIX16
     mutants, models and probes, and the earlier stress, then stand.
   - **Read the FIX17 diff.**
     - No assertion is loosened.
     - No step is dropped.
     - No timeout is raised.
     - There is no sleep.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE12`. Set TEMP and TMP to it. Ports
  51570-51609, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash. Use PowerShell only for the inline read-only census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES,
  NOT EVEN TO WRITE A FILE), NO `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO
  `python -c`, NO `node -` OR `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER
  REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO
  NOT IN `2>` AND NOT AS A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS.
  NO PID KILLS, NO `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER
  SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS
  (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS, NO TRAILING `&` INSIDE A
  BACKGROUND RUN.**
  - Write and change scripts with the Write and Edit tools.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. A run you must stop is stopped through
    its own handle, never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Any CPU burner must stop by itself after a fixed duration.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Files.**
  - Create files only in the task folder and the evidence folder.
  - Keep every probe script in the evidence folder as `*.ts.txt`, `*.mjs.txt` or `*.sh.txt`.
  - Evidence is masked LF `.txt` only. Every file ends with exactly one newline, this
    brief's Results included.
- **Data.**
  - Use synthetic data and local mail capture only.
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal, and mask user profile paths as `<user>`.
  - No evidence basename may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running.**
- If a permission check denies a call, stop and report. The only exception is the census
  rule above.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE12/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - every failure, with its class and the census beside it;
  - the `dist/` comparison;
  - the sweep counts;
  - the digest.

## Results
