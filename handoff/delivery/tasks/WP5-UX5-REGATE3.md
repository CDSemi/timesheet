# WP5-UX5-REGATE3 dispatch brief (regate after WP5-UX5-FIX3 and the Ingat synchronization)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE3, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX3-FREEZE.
- **Scope.**
  - **The previous regate:** WP5-UX5-REGATE2 on the local 7aafa21 / 59516a2d failed on two
    load-dependent flakes in its simulated-clock sweep:
    - `settings-routes.spec.ts:16`;
    - `controls.spec.ts:640`.

    WP5-UX5-FIX3 found both to be test races and fixed the tests only.
  - **The Ingat synchronization:** the owner's Ingat track then merged 7aafa21 into
    origin/main (merge b8bae50, origin 9f186b2).
  - **This regate's target:** the mission fast-forwarded to 9f186b2 and committed FIX3 on
    top, as 5b8b718.
  - **The records:** `handoff/delivery/tasks/WP5-UX5-REGATE2.md`, `WP5-UX5-FIX3.md`,
    `WP5-UX5-FIX3-FREEZE.md`, and the board's `external_tracks.INGAT`. The last accepted
    snapshot is still 8e55710.
- **Target.**
  - TARGET_SHA = 5b8b7184692fff683c4083c9fc5610acd47bece1 (pushed; HEAD = origin/main, or
    a later commit that changes only `handoff/`).
  - TARGET_DIGEST = edcca1949c429251b1476c3e32e1485507ef488264429c6afe318a7fccc041ce.

  Compute the digest in three forms, before and after, and record the file count.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  Routing: size M, risk H (a new merge from another track enters the gated tree), novelty
  no. Write the records in English.
- **Owner decisions.**
  - The Ingat changes are the owner's work, outside rounds 4 and 5. They are checked only
    for non-interference: the build, typecheck, tests, the docs pairs, and no change to
    the app's behaviour. Their deployment content is not reviewed.
  - Never touch `.claude/worktrees/` or its branch. Do not push, pull or merge.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --stat 7aafa21..TARGET` outside `handoff/`. Map every path:
     - to FIX3: `tests/e2e/controls.spec.ts`, `tests/e2e/fixtures.ts`;
     - or to an Ingat commit in `7aafa21..TARGET`: name the commit for each path.

     Flag any path under `src/`, `assets/`, the Dockerfile or the package files: the Ingat
     track was expected not to touch them.
   - Clean builds of 7aafa21 and the target: compare **all of `dist/`**.
     - If it is byte-identical, REGATE2's items (identity and the carried-forward drill,
       axe, CSP and integration results) carry forward.
     - If any `dist/` file differs, list it, map it to its source, and rerun what that
       source can affect:
       - for `dist/server` or `dist/domain`: the drill `--wp3` (Compose project
         `ts-wp5-ux5regate3`, cleaned up at the end) and the integration files of the
         earlier gates;
       - for `dist/client`: the axe scan of the affected screens.
2. **Core:**
   - `npm ci`;
   - `npm run lint`;
   - `npm run typecheck` (the Ingat tsconfig changes);
   - `npm run verify`, in the export and once in the repository;
   - `npm test` three times; a vitest worker crash is a FAIL. Record the counts,
     including the Ingat `ghcr-cleanup` tests;
   - the validators: check_recovery (106) and `validate_package.py --preflight`;
   - `npm audit --omit=dev`.
3. **The real-clock FULL e2e** on both projects, alone, with per-project counts. It must
   have 0 failed.
4. **The simulated-clock sweep, all seven runs** (the instants and scopes of REGATE2),
   **with `--workers=6`.** This sweep checks dates and DST, not stress; the stress is
   item 5.
   - Validate the preload with one control first.
   - Every run ends with 0 failed.
   - A run that fails only with a network or buffer error is rerun once, as the same full
     run or spec set, and both runs are recorded. Any other failure is reported as is.
5. **Stress the fixed tests** at their failing instants, through the FIX10 wrapper, each
   with `--repeat-each=40 --workers=14`, 0 failed:
   - `settings-routes.spec.ts` at `2026-10-26T16:00:00Z`;
   - the chevron test of `controls.spec.ts` at `2026-11-01T08:45:00Z`;
   - FIX2's targeted bar-size tests at `2026-11-01T08:45:00Z`.
6. **Test strength.**
   - Read FIX3's diff: the waits are state-based, there is no sleep, and no assertion is
     looser.
   - Run FIX3's three mutants yourself in a scratch copy:
     - the invisible arrow;
     - a second gradient layer;
     - the Administration `h1` replaced by a `div`.

     Each must fail the fixed tests.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE3`. Set TEMP and TMP to it. Ports
  50080-50119, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder. Never touch
  `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only. **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS
  (NOT EVEN TO WRITE A FILE), NO `node -e`, NO `node -` OR `python -`. NEVER PIPE INTO
  `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul`, ALSO NOT IN `2>`. NO `rm -r`, NO PID KILLS, NO INTERACTIVE
  SHELLS.**
  - Write scripts with the Write tool.
  - Put Node 24 first on PATH. Use the workflow Python only.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once. Never kill by PID.
- Create files only in the task folder and the evidence folder. Probes run in a scratch
  copy.
- Use synthetic data and capture mode only. Never edit source, docs, tests, the board or
  STATE.
- Name no evidence file with "signature" in its basename unless it also contains
  "synthetic". Write no email address except `@example.invalid`.
- Leave nothing running. Before returning, make sure none of your background commands is
  still running.
- If a permission check denies a call, stop and report.

## Output

- **Results** in this file, concise.
- **Evidence** in `handoff/delivery/evidence/WP5-UX5-REGATE3/` (masked LF `.txt`).
- **Return** at most 150 words, beginning with 'Self-reported model: ...'.

## Addendum 1 (coordinator, attempt 2 after the usage pause)

- **Attempt 1 was stopped by the coordinator mid-run** (TaskStop, 2026-10-23), when the
  owner paused for the usage limit. It wrote no Results. Treat any files it left in
  `handoff/delivery/evidence/WP5-UX5-REGATE3/` as attempt-1 notes: rerun everything, and
  overwrite or keep them as `a1-*`.
- **First, before anything else:**
  - Run `git fetch origin`. Record HEAD and origin/main. HEAD must be 5b8b718, or a later
    commit that changes only `handoff/`. If origin/main has moved past HEAD, stop and
    report; do not merge.
  - Check for attempt-1 leftovers, and remove only by name:
    - `docker ps --all --filter name=ts-wp5-ux5regate3`; if anything is there, run
      `docker compose -p ts-wp5-ux5regate3 down -v`;
    - any process whose command line contains `WP5-UX5-REGATE3`, listed with
      `Get-CimInstance` as in DIAG1. Stop none by PID; report them.
- Use the new task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE3-a2` and the same ports.
  Then run the brief from "Gate items".

## Results

### Verifier result (attempt 2) - decision: FAIL (sweep non-network failures; `npm audit` finds 2 new advisories; NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-REGATE3/`; task folder `D:\.claude-tmp\timesheet\WP5-UX5-REGATE3-a2`; Node v24.21.0.
HEAD = origin/main = 5b8b718 after `git fetch` (before and after); no push, pull or merge; `.claude/worktrees` untouched. Attempt-1 leftovers: no `ts-wp5-ux5regate3` container; the only processes
matching `WP5-UX5-REGATE3` were this session's own shells (reported, none stopped). Nothing left running.

1. **Identity.** Digest edcca194...41ce, 882 files, equal in export form, ls-tree form and `npm run digest`, before and after. `7aafa21..TARGET` outside `handoff/`: FIX3 (5b8b718) =
   `tests/e2e/controls.spec.ts`, `tests/e2e/fixtures.ts`; Ingat 782cddab = image-cleanup workflow, docs 07/11 and ADR 0002/0003 (+vi), `scripts/ghcr-cleanup.ts`, its test and fixtures,
   `tsconfig.json`, `tsconfig.test.json`. Nothing under `src/`, `assets/`, Dockerfile or package files. Clean builds of 7aafa21 and the target: **all 250 `dist/` files byte-identical**,
   so REGATE2's drill, axe, CSP and integration results carry forward (no drill run).
2. **Core.** `npm ci`, `lint`, `typecheck` 0; `verify` in the export 0 (101 files / 2374 tests, SMOKE PASSED); `npm test` x3: 0, 0, 0 (101/2374, no crash); ghcr-cleanup 29 tests pass.
   Repository `verify`: run 1 exit 1 (`backup.test.ts` and `jobs-restart.test.ts` timed out under load), run 2 exit 0 (101/2374, SMOKE PASSED). Validators 0 (check_recovery count 106;
   preflight, orchestration, precommit). **`npm audit --omit=dev` exit 1: nodemailer (moderate) and zod (high), new advisories; package files unchanged since 7aafa21 (REGATE2: 0).**
3. **Real-clock FULL e2e** (LA 2026-10-26 11:42, inside the window): desktop 459/35/0, mobile 404/90/0, exit 0.
4. **Sweep, `--workers=6`.** FULL 1026 and 1101: 0 failed. FULL 0314: desktop `submission.spec.ts:67` ECONNRESET; rerun: 4 ECONNRESET (submission, automation). seven-1026: mobile
   `timesheet.spec.ts:1216` (not network; the run crossed LA midnight, Today stayed 2026-10-26); rerun: 2 ECONNRESET only. seven-1231: 2 ECONNRESET; rerun: ECONNRESET plus
   **`review.spec.ts:616` "row 1 lines align at 1440px" 23.25 (not network)**. seven-0101: 0 failed. ECONNRESET is load-bound (`submission.spec.ts:67` alone 3/3 per project, whole file at 6 workers 1/1). Sweep not clean.
5. **Stress** (`--repeat-each=40 --workers=14`): settings-routes 800/0 failed; chevron 160/0; bar-size tests 1360/0 (320 skipped).
6. **Strength.** FIX3 waits on state (button visible; no "Loading"; six rAF-still frames, bounded loop), no sleep, no looser assertion. Mutants fail the fixed tests (invisible arrow and second layer: 4 failed each; `h1` to `div`: 10 failed); the build was restored (sha-256 equal) and the tests pass again.

NAS items: NOT VERIFIED. Slip: one `head` in a listing command; no stdin to node or python, no PID kill.

Status: done (decision FAIL)

Post-return: background commands stopped: none (all my background tasks reported completed; handle bgp2dpkh9, a waitfor, showed no output; five idle bash.exe still match the task folder in their command line, none stopped by PID; no stop tool available to me).
