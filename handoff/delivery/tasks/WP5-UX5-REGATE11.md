# WP5-UX5-REGATE11 dispatch brief (scoped regate after FIX16, server change)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE11, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX16-FREEZE.
- **Scope.** WP5-UX5-RECHECK-B2 found F-UX5B3-1 (Low) on be2afa2: `restore.ts` `blockerOf`
  ignored a later send of the period that had ended in `intervention`. A held superseded
  send could then be released and delivered after the correction.
  WP5-UX5-FIX16 changed five paths:
  - `src/server/ops/restore.ts`: `blockerOf` counts every later send job of the period, in
    any state except `cancelled`. The later order is kept. The owner's same-revision repeat
    is refused as `superseded_by_later_send`.
  - `tests/integration/restore.test.ts`: seven cases. Each `intervention` end state, the
    same-revision repeat, a cancelled later send, and the later order (E1).
  - `tests/integration/timesheet-api.test.ts`: a check-in at exactly the reporting-zone
    midnight second.
  - `docs/05_SUBMISSION_AND_NOTIFICATIONS.md` and `.vi.md`: one clause at line 72.

  Area A (WP5-UX5-RECHECK-A2) passed on be2afa2. Read the Results of RECHECK-B2 and FIX16 in
  `handoff/delivery/tasks/`, and REGATE10 for the last gate.
- **Target.**
  - TARGET_SHA = the `commit_sha` of WP5-UX5-FIX16-FREEZE on the board. The coordinator
    confirms it in the line below before dispatch. It is pushed. HEAD must equal
    origin/main, or be a later commit that changes only `handoff/`.
  - Target confirmation: (filled in at dispatch).
  - TARGET_DIGEST = 18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c (882
    files).

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  - Routing: size M, risk H (the restore release rule ships in the container image),
    novelty no.
  - This is a scoped regate. The server bundle changed, so the container drill reruns.
    `dist/client` must be identical, so axe carries forward from REGATE9.
  - Write the records in English.
- **Failures.** Report every failure plainly, with its class. Do not rerun to get a pass, and
  do not waive.
- **You run alone.** No other mission agent is active.
- Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## First, before anything else

1. **Starting point.** Run `git fetch origin`. Record HEAD and origin/main.
   - HEAD must be TARGET_SHA, or a later commit that changes only `handoff/`.
   - If origin/main has moved past HEAD, stop and report. Do not merge.
2. **Host census, read-only, stopping nothing.**
   - Use only inline `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
     Select-Object ..."` queries. Take two samples 60 s apart, and redirect them to a file in
     the task folder. **Never use `-ExecutionPolicy` or `-File`.**
   - **This is a public repository.** Evidence files may hold process names, IDs, counts
     and CPU times only. Never write the command line of a process the mission did not
     start.
   - Proceed if the non-mission load is under about 4 busy cores. If it is higher, wait 10
     minutes and take the census again. If it is still higher, stop and report.
   - If the inline query is denied, record "census not taken (permission)" and go on.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --name-status be2afa2..TARGET -- . ':!handoff'` must list exactly FIX16's
     five paths. No package or lockfile change.
   - **Clean builds** of be2afa2 and of the target, each after its own `npm ci` in an
     export. Compare all of `dist/`.
     - Expected: only `dist/server/ops/restore.js` and its map differ.
     - `dist/client` and `dist/domain` must be identical. If `dist/client` differs, axe
       cannot carry forward; report it.
   - Read the docs/05:72 clause in EN and VI. Do the two lines say the same, and do they
     match the build?
2. **The container drill with `--wp3`, every stage.**
   - Use the Compose project `ts-wp5-ux5regate11`, cleaned up with
     `docker compose -p ts-wp5-ux5regate11 down -v`.
   - Report each stage's PASS and FAIL counts.
   - `npm audit --omit=dev` must exit 0.
3. **Core,** in the export, one at a time:
   - `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build` (no chunk advisory, no
     deprecation warning);
   - `npm run verify`;
   - `npm test` three times. Expect 101 files and 2,397 tests.
   - **Every run must exit 0.** A test timeout is a failure: take a census immediately
     after it and record it.
   - **The validators:** `check_recovery.py` (106), `validate_package.py --preflight`
     (workflow Python) and `validate_orchestration.py`.
   - Do not run `npm ci` or `npm install` in the repository.
4. **The real-clock FULL e2e** on both projects, alone, with per-project counts. It must have
   0 failed. Expect desktop 469 ok and 35 skipped, and mobile 407 ok and 97 skipped.
5. **The simulated-clock sweep:** the same six runs, instants and scopes as REGATE10, with
   `--workers=6`, through the FIX10 wrapper from `handoff/delivery/evidence/WP-UX-FIX10/`.
   - Validate the preload with one control first.
   - Every run ends with 0 failed.
   - A run that fails only with a network or buffer error is rerun once, and both runs are
     recorded. **Any other failure, a timeout included, fails the gate.**
6. **Repeats of the changed integration files:** `restore.test.ts` and
   `timesheet-api.test.ts`, five runs each. 0 failed.
7. **Test strength.** Run everything in a scratch copy, and restore the copy byte-equal
   afterwards.
   - **FIX16 mutants**, from `handoff/delivery/evidence/WP5-UX5-FIX16/` (`90-mutants.mjs.txt`).
     Each must fail its named test:
     - M1, the old state list (only `queued`, `leased` and `succeeded`);
     - K2, the later order dropped;
     - C1, a cancelled later send blocks;
     - T4, the midnight second filed on the previous day.
   - Also rerun R2, R3 and G2.
   - **The auditor's probes** from `handoff/delivery/evidence/WP5-UX5-RECHECK-B2/`:
     - the in-process probe `40-restore-probe.ts.txt`: 12 of 12 behave as the docs say;
     - the HTTP and CLI probe `50-http-restore.mjs.txt`: sections A to D pass.
   - **Carry-forward check.** Confirm with `git diff be2afa2..TARGET` that `src/client`, the
     e2e tests and `tests/e2e/fixtures.ts` are unchanged. The FIX12 to FIX15 mutants and
     models, and REGATE10's stress, then stand.
   - **Read the FIX16 diff.**
     - No assertion is loosened.
     - No case is dropped.
     - The refusal codes are unchanged.
     - The cancelled exception is the only state left out.

**Decision:** PASS, FAIL or NOT VERIFIED. axe carries forward from REGATE9 only if item 1
shows `dist/client` identical. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE11`. Set TEMP and TMP to it. Ports
  51380-51419, with `SMOKE_PORT` in that range.
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
  (`nohup`, `setsid`, `disown`, `start`), NO POLLING HELPER SCRIPTS.**
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
  - Use synthetic data and local mail capture only. `PRODUCTION_SENDING_ENABLED` is never
    set.
  - Never edit source, docs, tests, the board or STATE.
  - Write no password literal into evidence, and mask user profile paths as `<user>`.
  - No evidence basename may contain "signature" unless it also contains "synthetic".
  - Write no email address except `@example.invalid`.
- **Leave nothing running,** including no Compose project of yours.
- If a permission check denies a call, stop and report. The only exception is the census
  rule above.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE11/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...', with:
  - the decision;
  - every failure and its class;
  - the drill stages;
  - the `dist/` comparison;
  - the digest.

## Results
