# WP5-UX5-REGATE4 dispatch brief (regate after FIX4, FIX5 and FIX6)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE4, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX6-FREEZE (done).
- **Scope.** WP5-UX5-REGATE3 on 5b8b718 / edcca194 failed. Read
  `handoff/delivery/tasks/WP5-UX5-REGATE3.md` (Results) and the fix records:
  - **WP5-UX5-FIX4** (`WP5-UX5-FIX4.md`, from DEPS1): exact pins of nodemailer 10.1.4 and
    zod 4.6.6 for the two new `npm audit` advisories. Runtime dependencies changed.
  - **WP5-UX5-FIX5** (`WP5-UX5-FIX5.md`, from DIAG2), tests only:
    - the `showToday` poll in `timesheet.spec.ts`;
    - the signature image wait in `review.spec.ts`;
    - `connection: close` in the `fixtures.ts` seed client.
  - **WP5-UX5-FIX6** (`WP5-UX5-FIX6.md`, from DIAG3), harness and test configuration:
    - `vitest.config.ts` `maxWorkers: '50%'`;
    - `connection: close` and the monitor close in `scripts/smoke-built-server.mjs`;
    - `connection: close` in `scripts/container-drill.mjs` and the `fixtures.ts` health
      poll.

  The last accepted snapshot is still 8e55710.
- **Target.**
  - TARGET_SHA = f4049aa7905e22f1467dfcae4208675cb2fc8e80 (pushed; HEAD = origin/main, or
    a later commit that changes only `handoff/`).
  - TARGET_DIGEST = 26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336
    (882 files).

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  Routing: size M, risk H (runtime dependency versions changed), novelty no. Write the
  records in English.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## First, before anything else

1. **Starting point.** Run `git fetch origin`. Record HEAD and origin/main.
   - HEAD must be f4049aa, or a later commit that changes only `handoff/`.
   - If origin/main has moved past HEAD, stop and report. Do not merge.
2. **Host census, read-only, stopping nothing.** Use DIAG3's method
   (`handoff/delivery/evidence/WP5-UX5-DIAG3/10-census.txt`): two samples 60 s apart. Record:
   - the busy cores, by group;
   - any `bash.exe` whose command line contains `waitfor.sh`. PID 22240, from REGATE3
     attempt 2, may still be there.
     - Shells created by your own census command can match its own text. Say which
       matches are yours.
   - `docker ps --all --filter label=com.docker.compose.project=fix6-drill` and
     `--filter name=ts-wp5-ux5regate4`.

   **Proceed if the non-mission load is under about 4 busy cores.** One spinning leftover
   core is within that.

   If the load is higher, wait 10 minutes and take the census again. If it is still
   higher, stop and report. Never stop a process by PID.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --stat 5b8b718..TARGET` outside `handoff/` must be exactly these eight paths.
     Map each to FIX4, FIX5 or FIX6:
     - `package.json`
     - `package-lock.json`
     - `tests/e2e/timesheet.spec.ts`
     - `tests/e2e/review.spec.ts`
     - `tests/e2e/fixtures.ts`
     - `vitest.config.ts`
     - `scripts/smoke-built-server.mjs`
     - `scripts/container-drill.mjs`
   - In `package-lock.json`, list every package whose version changed. Flag any change
     beyond nodemailer, zod and what they require.
   - **Clean builds** of 5b8b718 and the target, each after its own `npm ci`. Compare all of
     `dist/`. If any file differs, list it and map it to its source.
2. **Runtime dependencies.**
   - **The container drill with `--wp3`, every stage.**
     - Use the Compose project `ts-wp5-ux5regate4`, cleaned up at the end with
       `docker compose -p ts-wp5-ux5regate4 down -v`.
     - Report each stage with its PASS and FAIL counts.
     - The image is built from the new lockfile, so this checks the pinned runtime
       dependencies in the container.
   - **Where the code uses nodemailer and zod.** Name the integration tests that exercise:
     - the mail transport, in capture or dry-run mode;
     - zod validation, on the server and the client.

     Confirm they ran and passed in item 3.
   - `npm audit --omit=dev` must exit 0.
3. **Core.** Run each heavy command alone, one after another, never two together.
   - `npm ci` in the export. Run `npm ci` in the repository before its `verify`; if it
     fails with EBUSY or EPERM, rerun it once.
   - `npm run lint`, `npm run typecheck`.
   - `npm run verify` in the export, and once in the repository.
   - `npm test` three times. Record the counts, and the worker count vitest used.
   - **Every run must exit 0.**
     - A test timeout is a failure. Take a census immediately after it and record it.
     - A vitest worker crash is a failure.
   - **The validators:** check_recovery (106), `validate_package.py --preflight`,
     `validate_orchestration.py` and `scripts/precommit-check.mjs`.
4. **The real-clock FULL e2e** on both projects, alone, with per-project counts. It must
   have 0 failed.
5. **The simulated-clock sweep:** every run of REGATE3's sweep, at the same instants and
   scopes, with `--workers=6`. Use the FIX10 wrapper from
   `handoff/delivery/evidence/WP5-UX-FIX10/`.
   - Validate the preload with one control first.
   - Every run ends with 0 failed.
   - **A run that fails only with a network or buffer error** is rerun once, as the same
     full run or spec set, and both runs are recorded. FIX5 removed the known ECONNRESET
     cause, so report any network error even when its rerun passes. Any other failure is
     reported as is.
6. **Stress the fixed tests,** through the FIX10 wrapper, each with
   `--repeat-each=40 --workers=14`, 0 failed:
   - the tests that use `showToday` (`timesheet.spec.ts`), at `2026-10-27T06:59:35Z`;
   - `review.spec.ts` "row 1 lines align at 1440px", on the real clock;
   - `submission.spec.ts:67`, at `2027-03-14T10:30:00Z`.
7. **Test strength.** Do these in a scratch copy, and restore it afterwards.
   - **Read the FIX5 and FIX6 diffs.**
     - The waits are state-based; there is no fixed sleep.
     - No assertion is looser, and no timeout is raised.
     - No check is removed: A's date check moved into the poll.
   - **FIX5:**
     - DIAG2's deterministic Today probe (`handoff/delivery/evidence/WP5-UX5-DIAG2/`): the
       old helper fails, the fixed helper passes. This is the proof for the poll's date
       compare; FIX5's mutant M1 was caught by the earlier count check.
     - Mutant M1: the app marks the wrong day as Today.
     - Mutant M2: one signature row in the Sign off preview shifts by a few pixels.

     Each mutant must fail the fixed tests.
   - **FIX6:**
     - **Smoke blocked probe** (DIAG3's `40-smoke.txt` and `50-fix-probes.txt`): a wait of
       about 8 s after the CLI runs. It passes on the target. With the `connection` header
       removed, it fails.
     - **Induced smoke failure:** it prints "SMOKE FAILED (n)", exits non-zero, and leaves
       no `timesheet-smoke-*` folder.
     - **The suite at 4 logical CPUs** with the target configuration, once (DIAG3's
       affinity method): record failures and time.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE4`. Set TEMP and TMP to it. Ports
  50280-50319, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- **Shells.** Use Git Bash. Use `powershell.exe -NoProfile -Command "..."` only for:
  - the read-only census;
  - DIAG3's CPU-affinity start.

  Redirect its output to a file in the task folder.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN TO WRITE A
  FILE), NO `node -e`, NO `node -` OR `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`.
  NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`,
  ALSO NOT IN `2>`. NO `rm -r`, NO PID KILLS, NO `Stop-Process`, NO `sed -i`, NO
  INTERACTIVE SHELLS.**
  - Write scripts with the Write tool.
  - Put Node 24 first on PATH. Use the workflow Python only.
- **Waiting.** No FIFO waiter scripts such as `waitfor.sh`. To wait for a long command,
  use the Bash tool's own background run and its exit notice.
- **Never change any git configuration,** including `safe.directory`. For git in a
  scratch export, use a per-process override:
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once. Never kill by PID.
- **Files.**
  - Create files only in the task folder and the evidence folder. Probes and mutants run in
    a scratch copy.
  - Store any probe script under `handoff/delivery/evidence/` as `*.mjs.txt` or `*.ts.txt`.
- **Data.**
  - Use synthetic data and capture mode only.
  - Never edit source, docs, tests, the board or STATE.
  - Name no evidence file with "signature" in its basename unless it also contains
    "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running.** Before returning, make sure none of your background commands
  and no Compose project of yours is still running.
- If a permission check denies a call, stop and report.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE4/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with the
  decision, every failure, the drill stages and the digest.

## Results

### Verifier result - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-REGATE4/` (masked); task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE4`; Node v24.21.0.
Start: `git fetch origin` exit 0; HEAD = origin/main = f4049aa (before and after); no push, pull or merge; `.claude/worktrees` untouched. Non-handoff worktree clean before and after.

**Host census** (DIAG3 `census.ps1`, two samples 60 s apart, read-only): about 1.4 cores busy of 32, free memory 63.9 GB, instant CPU load 5%. Busy: `bash.exe` PID 22240 (`waitfor.sh out/sweep.done 590`, REGATE3-a2 leftover, still alive, 60.1 s per 60 s = 1.0 core,
not stopped); claude.exe 13 processes 8.4 s (0.14 core); Docker backend + vmmemWSL 8.0 s; Dropbox 3.2 s; msedge (58 processes, owner's) 2.1 s; Defender 2.1 s. My own census shells: `bash.exe` 94616 and 91680 matched the task name (not waitfor).
`docker ps --all` for `label=com.docker.compose.project=fix6-drill` and `name=ts-wp5-ux5regate4`: both empty. Under 4 cores: proceeded.

1. **Identity and scope.** Digest 26b163a6...05336, 882 files, equal in all three forms (export form, ls-tree form, `npm run digest`), before and after. Eight non-handoff paths exactly as listed, mapped to FIX4 (`package.json`, `package-lock.json`),
   FIX5 (`timesheet.spec.ts`, `review.spec.ts`, `fixtures.ts` SeedClient), FIX6 (`vitest.config.ts`, both scripts, `fixtures.ts` health poll) in `25-lock-and-scope.txt`. Lockfile versions changed: nodemailer 10.0.14 to 10.1.4, zod 4.6.5 to 4.6.6, plus a new
   nested dev-only `smtp-server/node_modules/nodemailer` 10.0.14 (flagged, dev, not in the image). No other package changed. Clean builds of 5b8b718 and f4049aa after their own `npm ci`: 250 `dist/` files each, all hashes equal.
2. **Runtime dependencies.** Drill `--wp3` (previous build 49651c8 prepared in the task folder), Compose project `ts-wp5-ux5regate4`, exit 0: stage 1 33 PASS / 0 FAIL; stage 2 32 / 0; stage 3 57 / 0; stage 4 35 / 0; stage 5 27 / 0; stage 6 23 / 0; total 209 PASS, 0 FAIL;
   image has production dependencies only; `compose down -v` exit 0, no container or project left. `npm audit --omit=dev`: found 0 vulnerabilities, exit 0. Code use and tests: `26-deps-usage-and-strength.txt` (nodemailer: mail transport and notifications, tests `delivery`,
   `delivery-crash`, `reminders`, `workbook-import`; zod: server only, `src/client` imports none; tests `isolation`, `actor-subject` and the 400-answer tests); all within the 101 files that passed in item 3.
3. **Core.** Export: `npm ci` 0, `lint` 0, `typecheck` 0, `verify` 0 (101 files / 2374 tests, SMOKE PASSED, 49 s), `npm test` x3: 0, 0, 0 (101 / 2374 each, 46.6 / 48.2 / 48.2 s, no worker crash, no timeout, 0 deprecation lines).
   Repository: `npm ci` 0 (first try), `npm run verify` 0 (101 / 2374, SMOKE PASSED, 168 s, 0 deprecation lines). Worker count: not printed by vitest; 50% of 32 logical CPUs = 16 (computed, not observed). Validators: check_recovery 0 (count 106), `validate_package.py --preflight` 0,
   `validate_orchestration.py` 0, `precommit-check.mjs --self-test` 0 (run in the export of the target).
4. **Real-clock FULL e2e** (LA 2026-10-26 18:59-19:21, UTC 2026-10-27 01:59-02:21): desktop 459 passed / 35 skipped / 0 failed (13.3 min); mobile 404 / 90 / 0 (7.7 min); both exit 0. Controls: real clock 2 passed, simulated 2026-11-01 2 passed.
5. **Simulated-clock sweep** (REGATE3's six runs, same instants and scopes, `--workers=6`, FIX10 wrapper): full-1026 863 passed, 0 failed (9.2 min); full-1101 863 / 0 (10.3); full-0314 863 / 0 (8.8); seven-1026 376 / 0 (5.1); seven-1231 376 / 0 (5.2);
   seven-0101 376 / 0 (5.1). All exit 0; no ECONNRESET, socket or fetch-failed line in any log, no rerun needed. REGATE3's non-network failures (`timesheet.spec.ts:1216`, `review.spec.ts:616`) did not recur.
6. **Stress** (`--repeat-each=40 --workers=14`, FIX10 wrapper): `showToday` tests (`Today bar is painted over`, `Today spacing`) at 2026-10-27T06:59:35Z: 160 passed, 0 failed; `signature rows: the PDF block insets...` (the test holding "row 1 lines align at 1440px"; that text is an
   assertion message, not a test title), real clock: 80 passed, 0 failed; `submission.spec.ts:67` at 2027-03-14T10:30:00Z: 80 passed, 0 failed.
7. **Test strength.** Diff read (eight paths): waits are state-based, no fixed sleep, no raised timeout, no assertion loosened; A's date check moved into the poll (now compared with a fresh server read, with exactly one Today tag required). Scratch export only, restored afterwards.
   - DIAG2 probe (`zz-a.spec.ts`, mobile, start 2026-10-27T06:59:35Z): old helper 1 failed (`toHaveCount` Expected 1, Received 0); fixed helper 1 passed (today=2026-10-27).
   - M1 (Today mark on the previous day, client rebuilt): `Today bar` / `Today spacing`, both projects: 4 failed. M2 (employee signature line shifted 4 px by a CSS rule): `signature rows` 2 failed ("row 1 lines align at 1440px", Expected <= 1, Received 4).
     After M1 the source file was byte-equal to the target and the rebuilt `dist` equal to the clean build (all hashes); after M2 the stylesheet hash was restored; the unmutated build passes the test (2 passed).
   - FIX6 smoke blocked probe (8 s wait after the CLI runs, BLOCKED_MS 9016 and 9060): target copy SMOKE PASSED exit 0; the same copy with both `connection` headers removed: "FAIL unexpected error: fetch failed", SMOKE FAILED (1), exit 1.
   - Induced smoke failure (one check made to expect 999): prints "FAIL state change without Origin..." and "SMOKE FAILED (1)", exit 1, no `timesheet-smoke-*` folder before or after.
   - Suite at 4 logical CPUs (affinity mask F, target config, DIAG3 method): 101 files / 2374 tests passed, 0 failed, 222 s. The wrapper printed an empty exit code; the vitest summary shows no failure.

NAS items: NOT VERIFIED. Left running: nothing of mine; no Compose project of mine (`docker compose ls` shows only other owners' projects). PID 22240 `waitfor.sh` leftover was already there and was not touched.
Slips: one command of mine piped into `tail` and redirected to `/dev/null` (a wait listing); no stdin to node or python, no PID kill, no `sed -i`, no git config change. Two truncated strings `Employee...employee@examp` remain in
captured logs (not addresses). Note: the container drill picks its own free loopback port, so it ran outside the 50280-50319 range.
