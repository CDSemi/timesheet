# WP5-UX5-FIX6 dispatch brief (suite contention, smoke keep-alive and cleanup, other fetch-after-spawn sites)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX6, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-DIAG3 (done) and WP5-UX5-FIX5 (done), and addresses
  WP5-UX5-REGATE3 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (test runner configuration and shared harness), novelty no.
    docs/08 row "Accepted finding naming file/fix/tests": no plan; reproduce first.
  - Write the task record in English.
- **The findings.** Read `handoff/delivery/tasks/WP5-UX5-DIAG3.md` (Results) and its
  evidence in `handoff/delivery/evidence/WP5-UX5-DIAG3/`. The probes and the CPU-restriction
  method are in `30-timeouts.txt`, `40-smoke.txt` and `50-fix-probes.txt`.
  1. **Integration-test timeouts come from contention.** The suite runs 31 vitest forks (the
     default) that spawn CLI children. When the host gives the suite only 2-8 logical CPUs,
     the spawn-heavy files pass 30 s. At 4 CPUs, 16 or 8 workers gave 0 failures. On an
     idle host, 16 workers cost nothing (53 s).
  2. **Smoke keep-alive.** `scripts/smoke-built-server.mjs:410-413` runs three blocking
     `spawnSync` CLIs. Then `:415` fetches on a pooled socket that the server closed after
     its 5 s keep-alive (`src/server/index.ts:59`).
  3. **Smoke cleanup.** After a failure, `monitor` (opened at about `:316`, closed only at
     about `:484`) keeps the database open. `rmSync` at about `:496` then throws EPERM, the
     "SMOKE FAILED (n)" line is lost, and a `timesheet-smoke-*` folder remains.
  4. **The same fetch-after-spawn pattern** may exist at `scripts/container-drill.mjs:174`
     (after `docker exec`), `tests/e2e/fixtures.ts:69` (the health poll) and
     `tests/e2e/setup.spec.ts:98`.
- **Coordinator decisions.**
  - Harness and test configuration only. **No `src/` change.** DIAG3's optional lazy PDF
    import (FIX6b) is deferred to the WP5 optional backlog.
  - **Raise no timeout and change no assertion.**
  - **For item 4, read each site first.** Add `connection: 'close'` only where a fetch can
    follow a blocking spawn on a pooled connection. Record each site's verdict, changed or
    not, with the reason.
- **Fixes:**
  - **a. `vitest.config.ts`:** cap the workers at half the logical CPUs (DIAG3 proposes
    `maxWorkers: '50%'`).
    - Check the option and its value form against the installed vitest version's types and
      documentation; it must not be deprecated.
    - Record the worker count it yields on this host.
  - **b. `scripts/smoke-built-server.mjs`:**
    - send `connection: 'close'` on its requests (DIAG3: the helper call at `:76` and the
      fetch at `:415`; cover every request the script makes after a spawn);
    - close `monitor` in the `finally` before `rmSync`, so a failure still prints its
      "SMOKE FAILED (n)" line and leaves no temporary folder. Declare it where the `finally`
      can reach it.
  - **c. The item 4 sites, as decided above.**
- **Owned paths:**
  - `vitest.config.ts`;
  - `scripts/smoke-built-server.mjs`;
  - `scripts/container-drill.mjs`;
  - `tests/e2e/fixtures.ts` (it already holds FIX5's uncommitted change; keep that change);
  - `tests/e2e/setup.spec.ts`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX6/`.
- **Base.**
  - HEAD = origin/main = 5b8b7184692fff683c4083c9fc5610acd47bece1, or a later commit that
    changes only `handoff/`.
  - The working tree also holds these uncommitted files. Keep them as they are:
    - from WP5-UX5-FIX4: `package.json`, `package-lock.json`;
    - from WP5-UX5-FIX5: `tests/e2e/timesheet.spec.ts`, `tests/e2e/review.spec.ts`,
      `tests/e2e/fixtures.ts`.

    Their combined digest is 4e93f766...4519. FIX5's `npm ci` already synced
    `node_modules`, so do not run `npm ci` or `npm install`.
- **Nothing else runs.** You are the only active agent and the only source writer.
- **Known host state.** DIAG3 found one mission leftover, `bash.exe waitfor.sh out/sweep.done
  590`, spinning one core. The owner has been asked to close it. Do not stop it. Record
  whether it is still present at the start.

## Steps

1. **Start state.**
   - Record HEAD, `git status --short` and `git diff --stat` outside `handoff/`. Expect only
     the five files above.
   - Take a short read-only census, with the same method as DIAG3's `10-census.txt`, and
     record the busy cores.
2. **Reproduce first,** in a scratch export of the working tree: `git archive` HEAD, then
   copy in the five files.
   - **Smoke:** DIAG3's blocked-run probe (a wait of about 8 s added after the spawns, in the
     scratch copy only). It must fail with "fetch failed" or ECONNRESET. Also show that the
     "SMOKE FAILED" line is lost and a temporary folder remains.
   - **Timeouts:** DIAG3's CPU-restriction method at 4 logical CPUs with the default worker
     count: record the failures.
3. **Make the fixes** in the repository working tree.
4. **Prove each fix,** in a fresh scratch export of the new working tree:
   - **Smoke:** the same blocked probe passes, at about 9 s and at a block of 40 s or more.
     An induced failure (for example, a deliberately wrong expected value in the scratch
     copy only) prints its "SMOKE FAILED (n)" line, exits non-zero, and leaves no
     `timesheet-smoke-*` folder.
   - **Timeouts:** with the new configuration, at 4 logical CPUs, run the suite three times:
     0 failures each, with the times. Then run the suite on the unrestricted host, with its
     time against DIAG3's 48-53 s.
   - **Item 4 sites:**
     - for each changed e2e site, run its spec file on both projects with the real clock;
     - because `fixtures.ts` is shared, run the real-clock FULL e2e once (both projects,
       2 workers), and report the counts per project;
     - if `container-drill.mjs` changed and Docker is available, run the drill once. If not,
       record "not run" and why; REGATE4 runs the drill.
   - **In the repository:** `npm run lint`, `npm run typecheck`, `npm test` and
     `npm run verify` (smoke port in your range), one after another, never together. Then
     `git diff --check`.
5. **Digest last.** Make a clean export of the working tree (HEAD plus the five earlier
   files and your changed files) and compute the digest with the repository's digest script
   in that export. Record the digest and the file count.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-FIX6`. Ports 50240-50279. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Run one heavy command at a time. Give each Playwright run its own output folder.
- Use Git Bash. Use `powershell.exe -NoProfile -Command "..."` only for the read-only census
  and for the CPU-affinity start that DIAG3 used, with its output redirected to a file in
  your task folder.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO
  `Stop-Process`, NO INTERACTIVE SHELLS, NO `sed -i`.**
  - Use the Write or Edit tool for every file you create or change. The only shell copies
    allowed are the scratch-export copies.
  - Read outputs with the Read tool.
- **No FIFO waiter scripts** such as `waitfor.sh`. To wait for a long command, use the Bash
  tool's own background run and its exit notice.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Store any probe script under `handoff/delivery/evidence/` as `*.mjs.txt` or `*.ts.txt`,
  never as `.mjs`, `.js` or `.ts`, because `npm run lint` parses those.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data and
  capture mode only. Do not stage, commit or push.
- Name no evidence file with "signature" in its basename unless it also contains
  "synthetic". Write evidence as masked LF `.txt`. Write no email address except
  `@example.invalid`.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.** Before returning, check
  that each background command you started has ended, or stop it through its own handle.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the before and after
results for each fix, the item 4 verdicts, the FULL counts, the repository check results
and the digest.

## Results

Worker: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX6/00-fix6-evidence.txt` (raw logs in the task folder). Nothing staged or committed; no `src/` change, no timeout raised, no assertion changed.

- **a. vitest.config.ts:** `maxWorkers: '50%'` (option typed `number | string`, not deprecated); 16 forks on this host (was 31). Before: at 4 logical CPUs with 31 forks two runs both passed (183 s, 310 s, 0 failed), so DIAG3's failures did NOT recur; the fix is not shown to cure an observed failure. After: three runs at 4 CPUs 321 s, 266 s, 334 s, 0 failed each (2374 tests); unrestricted host 65 s, 0 failed (DIAG3: 48-53 s; the leftover core and owner load were present).
- **b. smoke:** `connection: 'close'` on call() and the PDF fetch; `monitor` declared beside `server`, closed first in the `finally`. Before: blocked 8 s probe failed with "fetch failed" (9154 ms), the EPERM crash hid "SMOKE FAILED" and left a temp folder. After: blocked probes 8 s and 40 s pass (10190 ms, 43111 ms); an induced failure prints "SMOKE FAILED (2)", exits 1, leaves no folder.
- **c. Item 4 verdicts:** container-drill.mjs call(): changed (fetch after blocking docker exec/compose). fixtures.ts health poll: changed (hardening, not reproduced; a runJobsAt can precede the first request). setup.spec.ts:98: not changed (all spawns precede the server, later requests are the browser's).
- **Counts:** full e2e real clock, 2 workers: 988 tests, 863 passed, 125 skipped, 0 failed (desktop 459 passed / 35 skipped; mobile 404 passed / 90 skipped). Container drill (Docker 28.5.1) rc 0: stages 1, 2, 3, 6 = 33, 32, 57, 23 PASS, 0 FAIL (stages 4-5 need --wp3, not run).
- **Repository:** lint 0, typecheck 0, `npm test` 0 (101 files, 2374 tests), `npm run verify` 0 (smoke passed, port 50246), `git diff --check` 0.
- **Digest** (clean export, repository script): `26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336` (882 files, handoff/ excluded).
- **Host:** the `waitfor.sh out/sweep.done 590` leftover was still present at the start (one core); not stopped.
- **Slip:** one global git setting was added (`safe.directory` for the scratch export); the owner may remove it.

Status: done
