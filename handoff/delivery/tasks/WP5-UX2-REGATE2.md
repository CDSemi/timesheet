# WP5-UX2-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-REGATE2; package WP5; kind gate;
  attempt 1; depends on WP5-UX2-FIX2-FREEZE (done).
- Scope: the package-final gate of UI change round 2 after the tests-only fix
  WP5-UX2-FIX2. WP5-UX2-REGATE failed on b1b725b only because the new inactive-Today
  focus-ring tests depended on the calendar. Everything else passed (drill image
  2d269f87…).
- Target: `freeze_commit` = a6437943403fc416240fd13a787a8c4748af3e84 (HEAD = origin/main,
  or a later commit that changes only `handoff/`). Expected digest of record
  229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files). Compute it
  on a clean export of a643794 and cross-check it with the `git ls-tree` form and
  `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX2-REGATE.md` (method, items, limits, evidence layout and
  the failing item; reuse them) and `handoff/delivery/tasks/WP5-UX2-FIX2.md` (claims to
  verify).
- The simulated-clock preload and wrapper from `handoff/delivery/evidence/WP5-UX-FIX10/`
  (copy them into your task folder; never add them to the repository).

## Gate items

1. **The WP5 gate** (REGATE item 1, on a clean export of a643794):
   - `npm ci`; lint with deprecation tracing; `npm run verify`.
   - The FULL e2e on both projects on the real clock, with per-project counts and the Los
     Angeles time.
   - AC-13 three times, and under `Asia/Tokyo` and `America/New_York`.
   - Drill `--wp3`: the image ID and size and the forbidden-file scan (the release image
     for the pilot packet).
   - The compose config forms, the env keys and `npm audit --omit=dev`.
   - The validators, including check_recovery (106 probes), and the precommit
     self-test.
   - PDF unchanged and pdf-visual passing.
   - `npm test` three times.

   Run `docker version` first. If the engine is unreachable, finish every other item,
   then stop with NOT VERIFIED for the drill only. Do not start Docker Desktop.
2. **Boundary and product identity.**
   - `dist/server` and `dist/domain` of a643794 against 90b98ef: only
     `services/timesheetCommands.js` (the three literals and one comment).
   - `dist/` of a643794 against b1b725b: byte-identical (FIX2 changed a test only). If
     identical, the product observations of WP5-UX2-REGATE (findings 01-03 fixed, round
     checks) carry forward; state this.
3. **Fix scope.** `git diff --stat b1b725b..a643794` outside `handoff/` must show exactly
   `tests/e2e/focus-ring.spec.ts`. List every removed or changed line in it, and confirm
   that:
   - no assertion was removed or weakened;
   - the test does not pass vacuously (it still asserts focus, `aria-disabled` and the
     ring of at least 3:1);
   - no `skip`, `fixme` or `.only` was added.
4. **Simulated-clock sweep** (validate the preload first with one control):
   - the FULL suite on both projects at:
     - 2026-10-17 10:00 and 2026-12-31 23:30 (outside the window, where REGATE failed);
     - 2026-10-26 00:30 (inside the window);
   - the midnight e2e at 2026-10-25 23:59:20 and 2026-10-31 23:59:20;
   - `today.spec.ts`, `timesheet.spec.ts`, `shell.spec.ts`, `sharing.spec.ts` and
     `focus-ring.spec.ts` on both projects at 2026-10-27 18:00, 2026-11-01 01:30,
     2027-03-14 03:30 and 2027-01-01 00:30.
   - Every run must end with 0 failed. If a run fails only with a network or buffer
     error, rerun it once and keep both logs. Record a table.
5. **Screenshots:** none required beyond at most two of the inactive Today ring outside
   the window, light and dark (`-synthetic.png`).

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX2-REGATE2`. Set TEMP and TMP to it.
- Ports: 48840-48869, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Use the Compose project `ts-wp5-ux2regate2`, with non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-ux2regate2`; it must be empty.
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e` (NOT EVEN `node -e "1"`), NO `node -`
  OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM
  `/dev/null` OR `nul`, AND NEVER USE `< /dev/null` ON A COMMAND.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
    (write `<user>` in the evidence).
  - Put Node 24 first on PATH with `cygpath -u` before any node call. The first shell
    call is `node --version` (it must be v24.x).
- **Create files only inside the task folder and the evidence folder.**
- Never stop a process you did not start, and never kill by PID. Never remove anything
  recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only. Never edit source, docs, tests, the
  board or STATE. Leave nothing running.
- In your Results and evidence:
  - write no email address except the full synthetic `@example.invalid` form;
  - write no real profile path (use `<user>`);
  - mask probe-truncated addresses as `<email>`.

## Output

- Write your results into this file with the Edit tool, after each coherent step.
- Put masked LF `.txt` evidence (and at most two `-synthetic.png`) in
  `handoff/delivery/evidence/WP5-UX2-REGATE2/`. Save scripts as `*.mjs.txt` or
  `*.sh.txt`.
- Record the drill image ID; the pilot packet identity refresh uses it.
- Decide PASS, FAIL or NOT VERIFIED from actual results. NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model. Include:
- the decision;
- the digest of record in its three forms;
- each gate item's result, with counts and exit codes;
- the dist comparison;
- the sweep table summary;
- the image ID;
- the evidence files;
- any deviation, and that nothing is left running.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze a6437943403fc416240fd13a787a8c4748af3e84; HEAD = origin/main before and after; no non-handoff path changed
(`00-nonhandoff-status.txt`, `-after.txt` empty). Node v24.21.0 portable, Git Bash. `docker version` first: Docker Desktop 4.48.0, engine 28.5.1 reachable.
Evidence: `handoff/delivery/evidence/WP5-UX2-REGATE2/` (index `00-README.txt`).

Digest of record `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3`, 815 files, equal in three forms (clean `git archive a643794` export with `git hash-object --no-filters`;
`git ls-tree` form, sorted list byte-identical; `npm run digest`) before and after all checks. 0 `zz-` files left in the export.

Item 1, WP5 gate (clean export): `npm ci`, `npm run lint`, `npm run verify` exit 0 (89 files, 1882 tests, SMOKE PASSED, 0 deprecation lines). FULL e2e real clock exit 0: 448 passed, 42 skipped, 0 failed
(12.5 min; desktop 216 ok / 29 skipped, mobile 232 ok / 13 skipped; automation.spec.ts:118 ok on both; pdf-visual 2 ok on desktop, skipped on mobile by design); run 2026-10-15 04:27-04:39 America/Los_Angeles
(a window day). AC-13 x3 exit 0 (dep=0); Asia/Tokyo (offset -540) and America/New_York (240) exit 0. Drill `--wp3` exit 0: 208 PASS, 0 FAIL (33/31/57/35/27/23), "DRILL STAGES 1-6 PASSED", forbidden-file scan PASS,
the 8 "deprecat" lines are PASS lines. RELEASE IMAGE `sha256:6d1844425345a6e64a962689c01c03143a225abf33df02bcdaa20c8dcc05695a`, 110024344 bytes (104.9 MiB), linux/amd64 (same size as the REGATE image 2d269f87...; the ID differs, which
the dist identity below makes expected for a rebuild). Cleanup: image removed by exact tag, `compose -p ts-wp5-ux2regate2 down -v` exit 0, `docker ps --all --filter name=ts-wp5-ux2regate2` empty, no volume/network left.
Compose config live/restored/rollback exit 0 x3 (rollback `timesheet:bbbbbbb`, `JOB_RUNNER: "off"`); env keys 21, only SQLITE_BUSY and WP5_HANDOFF map to none (as before); `npm audit --omit=dev` exit 0, 0 vulnerabilities.
Validators exit 0: validate_package --preflight, validate_orchestration, check_recovery (count 106), precommit self-test, contrast script. PDF: `git diff --stat 90b98ef..a643794 -- src/server/pdf` and `tests/e2e/pdf-visual.spec.ts` empty;
pdf-visual passed. `npm test` x3 exit 0 (dep=0, crash=0).

Item 2, boundary (clean builds of 90b98ef, b1b725b, a643794; `cmp-dist.txt`): `git diff --stat 90b98ef..a643794 -- src/server src/domain` = only `timesheetCommands.ts` (4+/4-). The only differing file of `dist/server` (180) and
`dist/domain` (46) against 90b98ef is `dist/server/services/timesheetCommands.js` (16 diff lines: three message literals and one comment). `dist/` of a643794 against b1b725b: 232 files each, 0 hash differences, same file
list: byte-identical. So the product observations of WP5-UX2-REGATE (findings 01-03 fixed, round checks, CSP, targets, budgets) carry forward unchanged.

Item 3, fix scope: `git diff --stat b1b725b..a643794` outside `handoff/` = exactly `tests/e2e/focus-ring.spec.ts`, 4 insertions, 0 deletions (`22-fix-stat.txt`, `24-test-diff.txt`): a 2-line comment, `await today.focus();` and
`await expect(today).not.toBeFocused();` before the existing Shift+Tab/Tab. No line removed or changed; no assertion removed or weakened (one added). Not vacuous: still asserts `toBeFocused` after Tab, `aria-disabled="true"`,
painted pixel equals the accent, painted ring >= 3:1, opacity 1, ring token ratios and text >= 4.5. Added skip/fixme/only/slow: none.

Item 4, simulated-clock sweep (preload `shiftclock.mjs` unchanged; control at simulated 2026-10-30 10:00 PDT: server today_local 2026-10-30, payroll 2026-10-30, due 2026-10-28T00:00Z; real control today_local 2026-10-15):

| Instant (LA) | Scope | desktop ok/skip | mobile ok/skip | Result |
|---|---|---|---|---|
| 2026-10-25 23:59:20 | midnight e2e | 1/0 | 1/0 | exit 0, 2 passed |
| 2026-10-31 23:59:20 | midnight e2e | 1/0 | 1/0 | exit 0, 2 passed |
| 2026-10-26 00:30 (window) | FULL | 216/29 | 232/13 | exit 0, 448 passed, 0 failed |
| 2026-10-17 10:00 (outside) | FULL | 216/29 | 232/13 | exit 0, 448 passed, 0 failed |
| 2026-12-31 23:30 (outside) | FULL | 216/29 | 232/13 | exit 0, 448 passed, 0 failed |
| 2026-10-27 18:00 | 5 specs | 60/21 | 78/3 | exit 0, 138 passed, 0 failed |
| 2026-11-01 01:30 | 5 specs | 60/21 | 78/3 | exit 0, 138 passed, 0 failed |
| 2027-03-14 03:30 | 5 specs | 60/21 | 78/3 | exit 0, 138 passed, 0 failed |
| 2027-01-01 00:30 | 5 specs | 60/21 | 78/3 | exit 0, 138 passed, 0 failed |

The 8 focus-ring inactive-Today tests (4 situations x 2 projects) that failed in REGATE at 2026-10-17 and 2026-12-31 now pass at both (painted ring 6.09/6.79 light/dark, opacity 1). No network or buffer error, no rerun needed.

Item 5: no screenshots taken (none required).

Deviations: none beyond the above; `export-old`/`export-d1` scratch exports (90b98ef, b1b725b) were built for item 2. Slips: none. NAS items NOT VERIFIED. Nothing is left running; no container, volume or
network of the project remains. No source, docs, tests, board or STATE edited.

Status: done (decision PASS)
