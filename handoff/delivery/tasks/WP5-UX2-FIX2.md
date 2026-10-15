# WP5-UX2-FIX2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-FIX2; package WP5; kind fix;
  attempt 1; depends on WP5-UX2-FIX1-FREEZE (done). Answers the FAIL of WP5-UX2-REGATE
  on b1b725b.
- Scope, tests only: the four new tests at `tests/e2e/focus-ring.spec.ts:407` ("the focus
  ring of the inactive Today is painted at 3:1") depend on the calendar.
  - Outside the five-day Current-period window, Today is already inactive on landing.
    The test then skips its press, and `Shift+Tab` then `Tab` from the document start
    never reaches Today, so `expect(today).toBeFocused()` fails.
  - They pass only on window days. The gate saw 8 failures in each full simulated-clock
    run outside the window (2026-10-17 10:00 and 2026-12-31 23:30); the real clock
    2026-10-15 is a window day.
  - See the gate record `handoff/delivery/tasks/WP5-UX2-REGATE.md` ("Item 5") and its
    evidence.
- Fix: make the focus step independent of the calendar.
  - Reach the inactive Today the same way on every day: for example, focus a known
    element right before it (the "Next period" button) and press Tab, or focus the
    button directly with a keyboard-equivalent step.
  - Keep the assertions unchanged: it is focused, `aria-disabled="true"`, the painted
    ring is at least 3:1 in light and dark and with both overrides.
  - If reaching the inactive state needs a press on window days (as now), keep that
    branch, chosen from server values, and assert the opposite fact on the other branch.
    Never skip.
  - No product change.
- Profile/routing: timesheet-worker (effort medium, fixed by the profile); requested model
  sonnet; no override. Routing: size S, risk L (tests only), novelty no. Task record in
  English.
- Base: HEAD = origin/main = b1b725b7361d55e7aed70656051359153e457b5c, or a later commit
  that changes only `handoff/`. Source digest
  ac1895d9f79da0fa6bbcbca9e8f52fddf67cb4fed3ac7d420e73cee6181fe8a2 (815 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Reproduce the failure on the base under the FIX10 simulated-clock preload (copy
   `handoff/delivery/evidence/WP5-UX-FIX10/shiftclock.mjs.txt` and its wrapper into your
   task folder; see how WP5-UX2-REGATE ran it in its `sweep.sh.txt` evidence). Run
   `focus-ring.spec.ts` at 2026-10-17 10:00 America/Los_Angeles; expect 8 failures.
4. Fix the test. Then run `focus-ring.spec.ts` on both projects under the preload at
   these instants, each alone with its own output folder:
   - 2026-10-17 10:00 and 2026-12-31 23:30 (outside the window);
   - 2026-10-26 00:30 and 2026-10-27 18:00 (inside the window);
   - and once on the real clock.

   All must pass. Record a table.
5. Run the FULL e2e suite on both projects:
   - once on the real clock;
   - once under the preload at 2026-10-17 10:00 (FIX1 never ran the full suite outside
     the window; this run closes that gap).

   Both must end with 0 failed. If a run fails only with a network or buffer error,
   rerun it once and keep both logs.
6. Run `npm run typecheck`, `npm run lint` and `npm test`.
7. Grep your changed file and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`.
8. Run `npm run verify` with `SMOKE_PORT` in 48820-48839, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
9. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
10. Copy the masked logs into the evidence folder.

## Hard constraints

- Only `tests/e2e/focus-ring.spec.ts` changes. If another file must change, stop and
  report.
- No assertion removed or weakened. No new `skip`, `fixme` or `.only` beyond the existing
  project-conditional pattern.

## Owned paths

- `tests/e2e/focus-ring.spec.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-FIX2/` (masked LF `.txt` only)

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell. Never create links or junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Create the task folder first.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-FIX2`. Set TEMP and TMP to it. Use ports
  48820-48839. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push. Write no markdown links in Results.

## Return

At most 120 words, beginning with 'Self-reported model: ...'. Include:
- the change;
- the base reproduction;
- the instant table;
- the two full-suite counts per project;
- the unit count;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any deviation.

## Results

Model: claude-sonnet-5-5. Base HEAD b1b725b7361d55e7aed70656051359153e457b5c; digest before ac1895d9f79da0fa6bbcbca9e8f52fddf67cb4fed3ac7d420e73cee6181fe8a2 (815 files).

Change (only tests/e2e/focus-ring.spec.ts): after asserting aria-disabled="true", the test now calls `today.focus()`, presses Shift+Tab, asserts Today is not focused, then Tab and asserts focused again. This is the same on every day; the existing press branch stays (chosen from the server-rendered attribute). All assertions are unchanged; no skip added.

Reproduction on the base, simulated 2026-10-17 10:00 LA: 8 failed (`toBeFocused`), exit 1 (logs/10-repro-1017.txt).

Instant table (focus-ring.spec.ts, both projects, each alone): 2026-10-17 10:00 30 passed/2 skipped; 2027-01-01 07:30Z (2026-12-31 23:30 LA) 30/2; 2026-10-26 00:30 30/2; 2026-10-27 18:00 30/2; real clock 30/2. All exit 0.

Full e2e: real clock first run 447 passed, 1 failed (review.spec.ts:383, ERR_NO_BUFFER_SPACE, a network buffer error), rerun once: 448 passed, 0 failed (desktop 216 ok/29 skipped, mobile 232 ok/13 skipped). Simulated 2026-10-17 10:00: 448 passed, 0 failed (desktop 216/29, mobile 232/13).

typecheck 0, lint 0, npm test 89 files / 1882 tests passed. verify exit 0 (SMOKE_PORT 48825, DATA_DIR and DATABASE_PATH in the task folder). Digest last: 229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3 (815 files).

Evidence: handoff/delivery/evidence/WP5-UX2-FIX2/ (masked LF logs 00-51, run-shift.sh.txt, env.sh.txt, shiftclock.mjs.txt). Ran in the repository directly (dist rebuilt with npm run build), not in a clean export. No background task is still running.

Status: done
