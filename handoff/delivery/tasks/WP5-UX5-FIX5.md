# WP5-UX5-FIX5 dispatch brief (fix the three REGATE3 sweep failures in tests and harness)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX5, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-DIAG2 (done) and WP5-UX5-FIX4 (done), and addresses
  WP5-UX5-REGATE3 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (a shared e2e fixture), novelty no. docs/08 row "Accepted
    finding naming file/fix/tests": no plan; reproduce first.
  - Write the task record in English.
- **The findings.** Read `handoff/delivery/tasks/WP5-UX5-DIAG2.md` (Results), its evidence
  in `handoff/delivery/evidence/WP5-UX5-DIAG2/`, and the probes and patches in
  `40-patches.txt`.
  - **A. `tests/e2e/timesheet.spec.ts:1216`.** The helper `showToday` (527-536) reads the
    server date once and asserts it at 533. Across LA midnight, the page's own re-read after
    a click moves Today. The product follows document 04 line 58: it re-reads on mount,
    load, focus, visibility and the Today press, with no timer.
    - **Fix at :533-535:** after the `.today-tag` count is 1, poll until the Today tag's
      `data-day` equals a fresh server read (`employeeSeed.today()`), dispatching the
      page's documented `focus` refresh in each poll. Return the app's date.
    - Callers at :1225 and :2288 keep working.
  - **B. `tests/e2e/review.spec.ts:616`.** In the Sign off dialog preview, the saved
    signature image arrives late (`SignoffDialog.tsx:168`), and the employee line grows by
    one text line while `expectSignatureGeometry` (568-614) reads the boxes one at a time.
    - **Fix after :569:** an `expect.poll` until every `img` in the rows is `complete` with
      `naturalWidth > 0`, then the existing geometry checks, unchanged.
  - **C. ECONNRESET.** `SeedClient.raw` (`tests/e2e/fixtures.ts:371-376`) reuses a
    keep-alive socket after `drainJobsFrom` (150-168, six `spawnSync` runs) has blocked the
    runner past the server's 5 s keep-alive timeout.
    - **Fix at `fixtures.ts:372` and `:383`:** send `connection: close` from `SeedClient`.
- **Coordinator decisions.**
  - Tests and harness only. **No `src/` change.** The optional product hardening, reserving
    the signature image box so the dialog does not shift by 23 px, goes to the WP5 optional
    backlog and is not part of this task.
  - The gate method stays the same: `--workers=6` and the rerun rule.
- **Owned paths:**
  - `tests/e2e/timesheet.spec.ts`;
  - `tests/e2e/review.spec.ts`;
  - `tests/e2e/fixtures.ts`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX5/`.
- **Base.**
  - HEAD = origin/main = 5b8b7184692fff683c4083c9fc5610acd47bece1, or a later commit that
    changes only `handoff/`.
  - The working tree also holds WP5-UX5-FIX4's uncommitted `package.json` and
    `package-lock.json` (nodemailer 10.1.4, zod 4.6.6; digest c431c508). Keep them as they
    are.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record HEAD, `git status --short` and `git diff --stat` outside
   `handoff/`. Expect only the two package files.
2. **Sync `node_modules`.** Run `npm ci` once in the repository, so `node_modules` matches
   FIX4's lockfile.
   - If it fails with EBUSY or EPERM (Dropbox), rerun once.
   - If it still fails, do every later run in a scratch export of the working tree instead:
     `git archive` HEAD, then copy in the two package files and your three test files.
     Record the reason.
3. **Reproduce first.** With the FIX10 wrapper from
   `handoff/delivery/evidence/WP5-UX-FIX10/`, copied into your task folder, run each of A, B
   and C with DIAG2's probes. Record the failure before you change anything.
4. **Make the three fixes.** Use event-based waits only:
   - no fixed sleep;
   - no looser assertion;
   - no removed check. A's date check moves into the poll; it is not dropped.
5. **Prove each fix:**
   - **A:** DIAG2's deterministic probe (old fails, fixed passes). Then the tests that use
     `showToday` with `--repeat-each=20` at `2026-10-27T06:59:35Z`, and on the real clock.
   - **B:** DIAG2's delayed-image route probe, at 50-200 ms delays. Show it failing before
     and 50/50 passing after. Then `review.spec.ts` on the real clock.
   - **C:** `submission.spec.ts:67` at `2027-03-14T10:30:00Z` with `--repeat-each=12`, at 6
     and at 10 workers. Then `automation.spec.ts` with `submission.spec.ts` at 8 workers.
     All 0 failed.
   - **Real-clock FULL e2e**, both projects (`fixtures.ts` is shared), 0 failed, with
     per-project counts.
   - **Mutants**, in a scratch export only:
     - make the app mark the wrong day as Today (for example the next day): the fixed A
       test must fail;
     - shift one signature row in the Sign off preview by a few pixels: the fixed B check
       must fail.

     Restore the export afterwards and record the result.
   - `npm run lint`, `npm run typecheck`, `npm test`, `npm run verify` (smoke port in your
     range), and `git diff --check`.
6. **Digest last.** Make a clean export of the working tree (HEAD plus the two package files
   and your three test files) and compute the digest with the repository's digest script in
   that export. Record the digest and the file count.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-FIX5`. Ports 50180-50219. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Run each Playwright run with its own output folder, one after another.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write or Edit tool for every file you create or change. The only shell copies
    allowed are the scratch-export copies in step 2.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
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
rates, the FULL counts, the mutant results and the digest.

## Results

Worker: claude-sonnet-5-5. Base 5b8b718 plus FIX4's package files. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX5/00-fix5-evidence.txt`. Changed: `tests/e2e/timesheet.spec.ts` (showToday poll), `tests/e2e/review.spec.ts` (image-loaded wait), `tests/e2e/fixtures.ts` (connection: close). No src/ change. Not staged or committed.

- **Before.** A: DIAG2 probe `old` failed (deterministic). B: unmodified test with a 50 ms image delay failed 3 of 6. C: submission.spec.ts:67 at 2027-03-14T10:30Z failed 2 of 20 at 10 workers and 20 of 20 at 14 workers (12 of 12 passed at 6 workers this time; load dependent).
- **After.** A probe `fixed` passed; showToday tests repeat-each=20: 80/80 at 06:59:35Z and 80/80 real clock. B delays 50/75/100/150/200 ms: 50/50; review.spec.ts real clock 34 passed. C: w6 12/12, w10 20/20, w14 20/20, automation+submission w8 12/12.
- **FULL e2e, real clock, 2 workers:** 863 passed, 125 skipped, 0 failed; desktop 459/35/0, mobile 404/90/0.
- **Mutants (scratch export):** Today on the previous day: 4 failed; employee-date line shifted 4 px: "row 1 lines align at 1440px" failed (Received 4). Export restored (src diff empty).
- **Checks:** lint 0, typecheck 0, git diff --check 0. `npm test` failed twice on 30 s timeouts of different integration tests under host load; `npm run verify` run 1 failed in smoke ("fetch failed" after run-jobs, scripts/smoke-built-server.mjs, same mechanism as C, outside owned paths); smoke alone 2/2 passed; `npm run verify` run 2 exit 0 (2374 tests, smoke 46 PASS).
- **Note for the coordinator:** M1 is stopped by the earlier pre-click count check, not by the new poll; the poll's date compare is proven by the old/fixed probe. scripts/smoke-built-server.mjs would benefit from the same `connection: close` (optional, separate task).
- **Digest** (clean export, computed last): 4e93f7663fdea86d5c80cf6ff086786aeb7414449872248238586bb35aef4519 (882 files).

Status: done
