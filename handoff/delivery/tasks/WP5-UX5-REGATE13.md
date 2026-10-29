# WP5-UX5-REGATE13 dispatch brief (regate after FIX18, client change)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE13, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX18-FREEZE.
- **Scope.**
  - **WP5-UX5-AUDIT-INT** (FIX REQUIRED on a5cbc91) found F-UX5I-1. On desktop, the open
    Day editor did not follow a Check in or Check out made from the page, so a note typed
    first was refused on save.
  - **WP5-UX5-FIX18** fixed it. It changed the client (`TimesheetScreen.tsx`,
    `DayEditor.tsx`), added one e2e test in `day-editor.spec.ts`, and may have changed
    docs/04 by one clause in EN and VI.

  Read `handoff/delivery/WP5_UX5_REVIEW_INT.md`, and the Results of FIX18 in
  `handoff/delivery/tasks/`. The last gate, REGATE12 on a5cbc91, passed.
- **Target.**
  - TARGET_SHA = the `commit_sha` of WP5-UX5-FIX18-FREEZE on the board. TARGET_DIGEST = the
    digest of FIX18 on the board. The coordinator confirms both in the line below before
    dispatch. HEAD must equal origin/main, or be a later commit that changes only
    `handoff/`.
  - Target confirmation: (filled in at dispatch).

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size M, risk H (a client change on the Day editor's unsaved-changes and
    version path), novelty no.
  - `dist/client` changes. If `dist/server`, `dist/domain`, `package.json` and the lockfile
    are unchanged, the container drill and `npm audit` carry forward from REGATE11. axe is
    rerun on the screens the change touches.
  - Write the records in English.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## The load rule (as in REGATE12)

1. **Entry census.** Take two inline samples, a few seconds to a minute apart.
   - If the non-mission load is above about 8 busy cores, stop and report "host busy" with
     the figures. Do not wait, do not sleep, and do not proceed.
   - If the inline query is denied, record "census not taken (permission)" and go on.
2. Take a census at the end of each sweep, and right after any failure.
3. **Classify every failure from its trace.**
   - **A timeout whose trace shows host starvation, while the census right after is over
     the limit.** Starvation means fast server answers, and a browser step that is slow or
     never completes. That run is NOT VERIFIED. Repeat it once after the load is back
     within the limit, and record both runs. The repeat must pass.
   - **A network or buffer error:** repeat once.
   - **Every other failure fails the gate.**
4. Never rerun a run to turn an assertion failure into a pass.

**Public repository:** evidence may hold process names, IDs, counts and CPU times only.
Never write the command line of a process the mission did not start. Use only inline
`powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ..."`
queries. Never use `-ExecutionPolicy` or `-File`.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --name-status a5cbc91..TARGET -- . ':!handoff'` must list exactly FIX18's
     paths. No package or lockfile change.
   - **Clean builds** of a5cbc91 and of the target, each after its own `npm ci` in an export.
     Compare all of `dist/`:
     - `dist/server` and `dist/domain` must be identical;
     - only `dist/client` may differ. Name the changed files, and normalise hash names for
       lazy chunks.
     - If `dist/server` differs, the drill and `npm audit` must run; report it.
   - If docs/04 changed, check that EN and VI say the same, and that they match the build.
2. **Core,** in the export, one at a time:
   - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm run verify`;
   - `npm test` three times. Expect 101 files and 2,397 tests.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
3. **The real-clock FULL e2e** on both projects, alone, with per-project counts: 0 failed.
   The expected counts are FIX18's: one more desktop test than REGATE12's 469 ok, and one
   more mobile skip.
4. **The simulated-clock sweep:** all six runs, at the same instants and scopes as REGATE12,
   with `--workers=6`, through the FIX10 wrapper. Validate the preload with one control
   first. Every run ends with 0 failed, under the load rule.
5. **Stress,** 0 failed:
   - the new FIX18 test at 1440 and 1280 px, desktop, `--repeat-each=20 --workers=10`, on
     the real clock and at 2026-10-27T06:58:30Z;
   - the change-from-elsewhere case;
   - the Day editor's unsaved-changes tests (the Escape test and the same-task test), both
     projects, `--repeat-each=20 --workers=10`.
6. **Test strength.** Use FIX18's mutant definitions in its evidence. Run them in a scratch
   copy, and restore it byte-equal afterwards. Each mutant must fail its named test:
   - the clock-version refresh removed;
   - a refresh with a `generation` bump;
   - a refresh on any change, not only the page's own clock action.

   Also read the FIX18 diff:
   - no loosened assertion;
   - no dropped check;
   - no raised timeout;
   - no sleep;
   - the version check kept for changes from elsewhere.
7. **axe 4.14.0**, loaded from your task folder with no dependency added, light and dark: the
   Timesheet with the Day editor open on today:
   - at 1440 px;
   - at 1280 px;
   - at 390 px (the bottom sheet);
   - before and after a Check in.

   Expect 0 violations.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE13`. Set TEMP and TMP to it. Ports
  51650-51689, with `SMOKE_PORT` in that range.
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
  (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS OR WAIT LOOPS, NO
  TRAILING `&` INSIDE A BACKGROUND RUN.**
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
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE13/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - every failure, with its class and the census beside it;
  - the `dist/` comparison;
  - the sweep counts;
  - the axe counts;
  - the digest.

## Results
