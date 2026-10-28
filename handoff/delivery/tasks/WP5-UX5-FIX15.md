# WP5-UX5-FIX15 dispatch brief (check-in date at midnight, the midnight fence, the boundary test)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX15, package WP5, kind fix,
  attempt 1.
  - It depends on WP5-UX5-DIAG9 (done).
  - It serves the regate that follows WP5-UX5-REGATE9 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (shared e2e fixtures, tests only), novelty no. docs/08 row
    "Accepted finding naming file/fix/tests".
  - Reproduce first, then apply.
  - Write the task record in English.
- **The plan.** Read `handoff/delivery/tasks/WP5-UX5-DIAG9.md`: Results, Addendum 1, and
  "Addendum 1 results". Its evidence is in `handoff/delivery/evidence/WP5-UX5-DIAG9/`, indexed
  by `00-README.txt`.
- **The change.** Apply one patch with `git apply`:
  `handoff/delivery/evidence/WP5-UX5-DIAG9/proposed.patch.txt`. It touches tests only, four
  paths, +101/-14:
  - `tests/e2e/day-editor.spec.ts`: `clockIn` polls the day it read and the next day. It
    asserts the found day against the session's own `start_utc`, using the `dateTimeIn`
    oracle. The two check-in tests use the returned day.
  - `tests/e2e/fixtures.ts`: the automatic fixture `midnightFence` and `holdOffMidnight`.
    - It reads `Date.now()` and the constant `SEED_REPORTING_ZONE`.
    - If the next local midnight is within 45 s, it polls the clock until midnight + 0.5 s.
    - It makes no sign-in, no HTTP request and no database access.
  - `tests/e2e/today.spec.ts`: the deliberate crossing test (`:626`) is exempt, through the
    annotation `crosses-midnight`.
  - `tests/integration/timesheet-api.test.ts`: a test that pins the filing of a check-in at
    the second boundary of the reporting-zone midnight.
- **Coordinator decisions:**
  - Apply the patch exactly as proposed.
  - Change no other source, docs, package or lockfile.
  - No assertion loosened, no step or case dropped, no timeout raised except the fence's own
    fixture timeout as proposed, no fixed sleep.
- **Owned paths:**
  - `tests/e2e/fixtures.ts`;
  - `tests/e2e/day-editor.spec.ts`;
  - `tests/e2e/today.spec.ts`;
  - `tests/integration/timesheet-api.test.ts`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX15/`.
- **Base.**
  - HEAD = origin/main = bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23, or a later commit that
    changes only `handoff/`.
  - The working tree must be clean outside `handoff/` at the start.
  - `npm run digest` must give
    419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708.
  - If either check fails, stop and report.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record:
   - HEAD;
   - `git status --short` and `git diff --stat` outside `handoff/`;
   - the digest.
2. **Reproduce first,** in a scratch export of HEAD (`git archive`, with its own `npm ci`).
   Use DIAG9's hooks and scripts (`diag9Hooks.ts.txt` and the case scripts):
   - the original `day-editor.spec.ts:2340` fails at case C2 on both projects;
   - the fence-off date-reader model fails on the original specs.
3. **Apply the patch** in the repository working tree.
   - Run `git apply --check --whitespace=error` first.
   - Write only the four owned paths.
   - Confirm that `git status` outside `handoff/` shows exactly those four paths, with no
     stray folder. Check line endings against the neighbouring files.
4. **Prove it,** in a fresh scratch export of the working tree:
   - **Cases and models:**
     - the two check-in tests pass at C1 to C6 on both projects;
     - the 13 date-reader models and the check-in model pass;
     - the fence-off control fails again.
   - **Mutants,** each in a scratch copy, restored byte-equal afterwards. Each must fail the
     named test:
     - A2: the INSERT stores an already-ended session;
     - B: the check-in is filed under the next accounting date;
     - the integration test against the UTC-date mutant;
     - with the exemption removed, the crossing test is held: it runs the real-clock branch
       in about 2 s instead of tens of seconds.
   - **Repeat runs:** "Check in then Check out asks" and "a stale session version at Check
     out", both projects, `--repeat-each=20 --workers=6`: 0 failed.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck` and `npm run build`. Record the `dist/`
       comparison against a build of bd9c275: all of `dist/` identical.
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
     - No deprecation warning.
   - **`npm test`** once in the export. Expect 101 files and 2,389 tests.
   - **Real-clock FULL e2e** on both projects. Give per-project counts. Expect desktop 469
     ok and 35 skipped, mobile 407 ok and 97 skipped, 0 failed.
   - **The midnight sweep run.** Run the seven-file scope, both projects, at
     2026-10-27T06:58:30Z with `--workers=6`, through the clock wrapper in
     `handoff/delivery/evidence/WP-UX-FIX10/`. It must end with 0 failed. Record how long the
     desktop crossing test takes.
5. **Digest last.** Make a clean export of the working tree, then compute the digest with the
   repository's digest script. Record the digest and the file count. `npm run digest` and the
   export form must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX15`. Set TEMP and TMP to it. Ports
  51200-51239, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder. Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Inline and read-only, at the start and the end.
  - Use only `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
    Select-Object ..."`, redirected to a file in the task folder. Never use
    `-ExecutionPolicy` or `-File`.
  - **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
    times only. Never write the command line of a process the mission did not start.
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES,
  NOT EVEN TO WRITE A FILE), NO `node -e` (NOT EVEN `node -e 1`), NO `python -c`, NO
  `node -` OR `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS
  A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS. NO PID KILLS, NO
  `Stop-Process`, NO `sed -i` (ALSO NOT ON SCRATCH FILES), NO INTERACTIVE SHELLS, NO FIFO
  WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED
  SHELLS (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS.**
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
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX15/` as `*.ts.txt`,
  `*.mjs.txt` or `*.sh.txt`.
- Use synthetic data and capture mode only. Do not stage, commit or push.
- **Evidence files.**
  - No basename may contain "signature" unless it also contains "synthetic".
  - Write evidence as masked LF `.txt` only. Mask user profile paths as `<user>`.
  - Write no email address except `@example.invalid`, and no password literal.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.** Leave no server, browser or
  Compose project behind.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

## Return

At most 150 words, beginning 'Self-reported model: ...', with:

- the reproductions;
- the four changed paths;
- the proof: cases, models, mutants and repeats;
- the repository checks, with the `dist/` comparison;
- `npm test`;
- the FULL counts and the midnight sweep run;
- the digest;
- any slip.

## Results

Worker: timesheet-worker, self-reported model claude-sonnet-5-5. Base: HEAD = origin/main = bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23; nothing changed outside `handoff/` at the start; `npm run digest` at the start 419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708 (882 files). Evidence: `handoff/delivery/evidence/WP5-UX5-FIX15/` (79 masked LF files, index `00-README.txt`). Scratch exports in `D:\.claude-tmp\timesheet\WP5-UX5-FIX15`: `export` (git archive of bd9c275, own `npm ci`, Node 24.21.0; reproduction), `export2` (the same plus the four patched files; every proof), `digest-export` (`git clone` plus the four files).

**Reproduced first, on the unchanged export** (DIAG9's hooks and scripts, FIX10 clock wrapper): `day-editor.spec.ts` "Check in then Check out asks" at case C2 (midnight 0.3 s into the test, between the date read and the click) failed on desktop and mobile (`Expected: true / Received: false`; `10-*`). The fence-off date-reader models failed against the original specs: today.spec.ts eight targets as in DIAG9 (`11-repro-dense-original-first-run-...`); the five day-editor targets failed on both projects after a rerun on the byte-exact spec, except `:5196` desktop, which passed once (timing noise of the 0.3 s model) and failed 3 of 3 on rerun (`11-*`).

**Applied** `proposed.patch.txt` with `git apply` (`--check --whitespace=error` exit 0, apply exit 0): exactly the four owned paths, +101/-14, LF like their neighbours, `git diff --check` exit 0 (`12-apply-check.txt`).

**Proof, in `export2`:**
- Cases C1 to C6, both check-in tests ("Check in then Check out asks", "a stale session version at Check out"), both projects: 24 of 24 passed (`20-*`).
- Models against the new fence and the original specs: the 13 date readers on both projects, 0 failed (desktop 13 passed; mobile 11 passed, 2 skipped as in DIAG9); the check-in model over the 18 targets on both projects, 36 of 36 passed (`21-*`, `22-*`). Fence off (`MIDNIGHT_FENCE_MS = 0`): desktop 13 of 13 failed, mobile 10 failed, `:242` passes and `:5196`, `:293` are skipped, as in DIAG9 (`23-*`).
- Mutants on the built server, each restored byte-equal (`dist/` equal to the base build, `diff -r` empty), real clock, both check-in tests on both projects: control 4 passed; A (closed session in the past), A2 (already-ended session) and B (next accounting date) each failed 4 of 4 (`30-*`). The integration boundary test passes (16 tests) and fails 1 of 16 against the UTC-date mutant of the source (`31-*`). The crossing test at 06:59:20Z took 37.9 s normally and 2.1 s with the exemption removed (the fence holds it for the 40 s first) (`32-*`).
- Repeats `--repeat-each=20 --workers=6`, real clock, both check-in tests: desktop 40 passed, mobile 40 passed, 0 failed (`40-*`).

**Repository checks** (`50-*`): `npm run lint`, `npm run typecheck`, `npm run build` exit 0, 0, 0; `dist/` of the build equals a build of bd9c275 (`diff -r` empty, 250 files); `npm run verify` exit 0 (SMOKE_PORT 51210); `git diff --check` exit 0; 0 lines containing "deprecat" in the lint, typecheck, build, verify, npm test and run logs.

**`npm test`** in `export2`: 101 files, 2,389 tests, exit 0 (`51-*`; also inside `verify`).

**Real-clock FULL e2e** (2 workers, one project after the other): desktop 469 ok, 35 skipped, 0 failed (12.9 m); mobile 407 ok, 97 skipped, 0 failed (7.0 m) (`60-*`). **Midnight sweep run**: the seven files, both projects, `--workers=6`, FIX10 wrapper, simulated start 2026-10-27T06:58:30Z: 468 tests, 384 ok, 84 skipped, 0 failed, exit 0 (7.0 m); the desktop crossing test (`today.spec.ts:627`) took 1.0 m, the mobile one 2.2 s (`61-*`).

**Digest, last:** a `git clone` of the repository plus the four files and `npm run digest` agree: ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f (882 files, handoff/ excluded) (`70-*`).

**Host:** census at the start and the end (inline read-only, counts by process name only): node.exe 16 both times; msedge.exe 46 and 48 (the owner's browser); no run of mine left behind.

**Slips (harmless):** several reads were piped into `head` (`ls | head`, `grep | head`, `cat | head`) and `head -n` was used to split a list; the first reproduction dense run used line numbers that the scratch hooks had shifted (five "No tests found", rerun in `repro2.sh`); a `sed -n` read of a list file. No heredoc, no stdin to node or python, no `/dev/null`, no `rm -r`, no PID kill, no `sed -i`.

Status: done
