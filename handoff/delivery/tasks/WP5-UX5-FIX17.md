# WP5-UX5-FIX17 dispatch brief (no e2e step on a tab that is behind)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX17, package WP5, kind fix,
  attempt 1.
  - It depends on WP5-UX5-DIAG10 (done).
  - It serves the regate that follows WP5-UX5-REGATE11 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk L (two e2e files), novelty no. docs/08 row "Accepted finding
    naming file/fix/tests".
  - Reproduce first, then apply.
  - Write the task record in English.
- **The plan.** Read `handoff/delivery/tasks/WP5-UX5-DIAG10.md`: Results, Addendum 1 and
  "Addendum 1 results". Its evidence is in `handoff/delivery/evidence/WP5-UX5-DIAG10/`
  (`00-README.txt`). Apply `proposed.patch.txt` with `git apply`. It is tests only, two
  files:
  - `tests/e2e/import.spec.ts`, +9: `bringToFront` before each step on a tab that may be
    behind, in its two two-tab tests (the commit test at `:102`, and the opening-balance
    test).
  - `tests/e2e/today.spec.ts`, +16/-2: at `:641`, the second page opens in a browser context
    of its own (`browser.newContext({...})`), not as a second tab. The context is closed at
    the end.
- **Coordinator decisions:**
  - Apply the patch exactly as proposed.
  - Change no other source, docs, package or lockfile.
  - No assertion loosened, no step or case dropped, no timeout raised, no fixed sleep.
- **Owned paths:**
  - `tests/e2e/import.spec.ts`;
  - `tests/e2e/today.spec.ts`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX17/`.
- **Base.**
  - HEAD = origin/main = 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2, or a later commit that
    changes only `handoff/`.
  - The working tree must be clean outside `handoff/` at the start.
  - `npm run digest` must give
    18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c.
  - If either check fails, stop and report.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record:
   - HEAD;
   - `git status --short` outside `handoff/`;
   - the digest;
   - a host census.
2. **Reproduce first,** in a scratch export of HEAD (`git archive`, with its own `npm ci`).
   Use DIAG10's self-stopping 48-thread burner (`burn.mjs.txt` in its evidence) and
   `--workers=6`:
   - the original import commit test at the 2026-11-01T08:45Z instant, 12 repeats on
     desktop: failures expected;
   - the original `today.spec.ts:641` crossing branch at 2026-10-27T06:58:30Z, 6 repeats
     on desktop: failures expected.

   A rate is enough. Record it.
3. **Apply the patch** in the repository working tree.
   - Run `git apply --check --whitespace=error` first.
   - Write only the two owned paths.
   - Confirm that `git status` outside `handoff/` shows exactly those two paths. Check line
     endings against the neighbouring files.
4. **Prove it,** in a fresh scratch export of the working tree.
   - **Under the same burner,** on both projects:
     - the import commit test and the opening-balance test, 12 repeats each: 0 failed;
     - the `today.spec.ts:641` crossing branch, 6 repeats: 0 failed;
     - its normal branch, 12 repeats: 0 failed.
   - **Mutants**, each restored byte-equal afterwards:
     - DIAG10's `mutant-n1.patch.txt`: the commit test fails under the burner;
     - the original `context.newPage()` in `today.spec.ts`: the crossing branch fails under
       the burner;
     - DIAG10's product mutant `mutant-product-m1.patch.txt`, which rebuilds the client:
       the commit test fails on the missing committed notice. Rebuild after restoring, and
       show `dist/` equal to the base.
   - **Calm host:**
     - `import.spec.ts` whole, both projects, `--repeat-each=5`: 0 failed;
     - `today.spec.ts` whole, both projects, at 2026-10-27T06:58:30Z and on the real
       clock: 0 failed.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck` and `npm run build`. Record the `dist/`
       comparison against a build of 1fe5ad3: all of `dist/` must be identical.
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
     - No deprecation warning.
   - **Real-clock FULL e2e** on both projects. Expect desktop 469 ok and 35 skipped, mobile
     407 ok and 97 skipped, 0 failed.
   - **The midnight sweep run.** Run the seven-file scope, both projects, at
     2026-10-27T06:58:30Z with `--workers=6`, through the clock wrapper in
     `handoff/delivery/evidence/WP-UX-FIX10/`: 0 failed. Record how long the desktop
     crossing test takes.
   - Take a census before each load run, and right after any failure.
5. **Digest last.** Make a clean export of the working tree, then compute the digest with the
   repository's digest script. Record the digest and the file count. `npm run digest` and the
   export form must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX17`. Set TEMP and TMP to it. Ports
  51530-51569, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder. Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Inline and read-only.
  - Use only `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
    Select-Object ..."`, redirected to a file in the task folder. Never use
    `-ExecutionPolicy` or `-File`.
  - **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
    times only. Never write the command line of a process the mission did not start.
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO `python -c`, NO `node -` OR
  `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS
  A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS. NO PID KILLS, NO
  `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`,
  NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS (`nohup`, `setsid`,
  `disown`, `start`), NO POLLING HELPER SCRIPTS, NO TRAILING `&` INSIDE A BACKGROUND RUN.**
  - Use the Write or Edit tool for every file you create or change, except through
    `git apply`. The only shell copies allowed are scratch-export copies.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. Stop a run only through its own handle,
    never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Any CPU burner must stop by itself after a fixed duration. Never leave one running.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX17/` as `*.ts.txt`,
  `*.mjs.txt` or `*.sh.txt`.
- Use synthetic data only. Do not stage, commit or push.
- **Evidence files.**
  - No basename may contain "signature" unless it also contains "synthetic".
  - Write evidence as masked LF `.txt` only. Mask user profile paths as `<user>`.
  - Write no email address except `@example.invalid`, and no password literal.
  - Every file you write, this brief's Results included, ends with exactly one newline.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.** Leave no server, browser or
  Compose project behind.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

## Return

At most 150 words, beginning 'Self-reported model: ...', with:

- the reproductions;
- the two changed paths;
- the proof under the burner and on a calm host;
- the mutants;
- the repository checks, with the `dist/` comparison;
- the FULL counts and the midnight sweep run;
- the digest;
- any slip.

## Results

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX17/` (`00-README.txt`, `01-checks.txt`, `10-census.txt`, `20-runs.txt`, scripts).

- **Start.** HEAD = origin/main = 1fe5ad3, git status outside `handoff/` empty, digest 18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c (882 files). Census taken.
- **Reproduction** (scratch export of 1fe5ad3, own `npm ci`, DIAG10 48-thread self-stopping burner, `--workers=6`, desktop):
  - import commit test at 2026-11-01T08:45Z, 12 repeats: **12 of 12 failed** (median 40.1 s against the 30 s limit).
  - `today.spec.ts` crossing branch at 2026-10-27T06:58:30Z, 6 repeats: **3 of 6 failed** (DIAG10 saw 5 of 6).
- **Patch.** DIAG10 `proposed.patch.txt`, `git apply --check --whitespace=error` exit 0, then applied. Changed paths: `tests/e2e/import.spec.ts` (+9) and `tests/e2e/today.spec.ts` (+17 -2; the brief said +16, the patch gives 17). Both stay LF, `git diff --check` exit 0, no other path touched.
- **Under the burner** (fresh export with the patched specs, both projects):
  - import commit test and opening-balance test, 12 repeats each: desktop 24 of 24, mobile 24 of 24 passed.
  - `today.spec.ts` crossing branch, 6 repeats: desktop 6 of 6, mobile 6 of 6 (median 78 s, max 84 s).
  - normal branch, 12 repeats: desktop 12 of 12, mobile 12 of 12.
- **Mutants** (each restored byte-equal):
  - DIAG10 `mutant-n1`: the commit test **failed 11 of 12** under the burner.
  - the original `context.newPage()`: the crossing branch **failed 3 of 6** under the burner.
  - DIAG10 product mutant (no committed notice), client rebuilt: the commit test **failed 6 of 6** waiting for `[data-import-notice="committed"]`. After the restore and rebuild `dist/` equals the 1fe5ad3 build (250 files, cmp exit 0).
- **Calm host:** `import.spec.ts` whole, `--repeat-each=5`, both projects: 40 + 40 passed. `today.spec.ts` whole at 2026-10-27T06:58:30Z and on the real clock, both projects: 18 passed and 4 skipped each, 0 failed.
- **Repository:** `npm run lint`, `typecheck`, `build` exit 0; `dist/` after the build and after `verify` identical to a clean build of 1fe5ad3 (250 files, every hash equal). `npm run verify` exit 0 (101 files, 2397 tests, smoke passed, `SMOKE_PORT` 51530). `git diff --check` exit 0. No deprecation warning in any of the outputs (run with `--trace-deprecation --pending-deprecation`).
- **Real-clock FULL e2e:** desktop 469 ok / 35 skipped / 0 failed; mobile 407 ok / 97 skipped / 0 failed; exit 0 each.
- **Midnight sweep run** (seven files, both projects, 2026-10-27T06:58:30Z, `--workers=6`, FIX10 clock wrapper): 384 ok / 84 skipped / 0 failed, exit 0. The desktop crossing test took 72 s.
- **Digest (last).** Clean export (archive of 1fe5ad3 plus the two changed files) gives 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf, 882 files; `npm run digest` gives the same value. Nothing of this task is left running (final census equals the start sample by process name).
- **Host note.** Other jobs of the host (not started by this task) used 2 to 6 busy cores during the burner runs and 3 to 10 during some calm runs; names and counts are in `10-census.txt`. Every proof run passed regardless.
- **Slips** (none changed a result):
  - A first digest attempt copied raw CRLF working-tree files and gave a different value; it was discarded and redone from the archive (explained in `01-checks.txt`).
  - Rule slips in four read-only commands: a `grep | head -5` written to a file, a `cat | head -3 > /dev/null 2>&1`, and two `tail -c | od` / `od | tail` reads of file endings. No script was fed through stdin; none of them changed a result.
  - Evidence scripts and the run table were written by hand with the Write tool, not copied from the task folder, so the raw per-run logs stay in the task folder outside the repository.

Status: done
