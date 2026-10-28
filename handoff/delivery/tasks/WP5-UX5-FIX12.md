# WP5-UX5-FIX12 dispatch brief (layout waits after viewport changes, and the R3 restore case; tests only)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX12, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-DIAG5 (done) and addresses WP5-UX5-REGATE7 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (shared e2e helpers), novelty no. docs/08 row "Accepted finding
    naming file/fix/tests".
  - `restore.test.ts` is a recovery test. The change is still test-only, and the exact edit
    is specified and proven, so the profile is worker rather than worker-high.
  - The plan is proven. Reproduce first, then apply it.
  - Write the task record in English.
- **The plan.** Read `handoff/delivery/tasks/WP5-UX5-DIAG5.md`: Results sections 1-6 and
  "Addendum 1 results". Its evidence is in `handoff/delivery/evidence/WP5-UX5-DIAG5/`.
  - The exact change is `proposed.patch.txt`: 5 files, +42/-5. DIAG5 found `git apply
    --check` clean in a fresh export of 0f52300.
  - **`tests/e2e/fixtures.ts`:** two exported helpers.
    - `expectSheetAt(page, width)` waits until `[data-paper] [data-sheet="phone"]` has
      count 1 below 480 px, and 0 from 480 px.
    - `expectLayoutAt(page, width)` polls `window.innerWidth` until it equals the width,
      waits for the `.bar-clock` count (1 below 768 px, 0 from it), then calls
      `expectSheetAt`.
  - **`tests/e2e/review.spec.ts`:** `await expectLayoutAt(page, width);` directly after
    `setViewportSize`, in the loops of the tests at 406, 643 and 734.
  - **`tests/e2e/timesheet.spec.ts`:** the same call after `setViewportSize`, in the test
    at 2541.
  - **`tests/e2e/logo.spec.ts`:** `await expectSheetAt(page, width);` after
    `setViewportSize` in `sweepRange`, with a two-line comment.
  - **`tests/integration/restore.test.ts`:** a change inside the case "a held send of a
    superseded revision (F-UX5B2-1)", between the queued and the succeeded phases.
    - A runner claims the correction's send, with a 600 s lease. Assert that it is the
      later job and that its state is `leased`.
    - `heldSends()` must list `[[heldJobId, 'superseded_by_later_send']]`.
    - `releaseHeldJob` must return
      `{ outcome: 'refused', code: 'superseded_by_later_send' }`.
    - `releaseAllHeldJobs` must return
      `{ released: 0, refused: { superseded_by_later_send: 1 } }`.
    - The title and the header comment are updated. No new `it`, so the test count stays
      2,388.
- **Coordinator decisions:**
  - apply the patch exactly as DIAG5 proposed;
  - tests only: no `src/`, docs, package or lockfile change;
  - no assertion loosened, no width, theme or case dropped, no timeout raised, no fixed
    sleep;
  - the one-frame 8 px jump when a window crosses 768 px is not changed. It goes to the WP5
    optional backlog at ACCEPT-DOCS.
- **Owned paths:**
  - `tests/e2e/fixtures.ts`;
  - `tests/e2e/logo.spec.ts`;
  - `tests/e2e/review.spec.ts`;
  - `tests/e2e/timesheet.spec.ts`;
  - `tests/integration/restore.test.ts`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX12/`.
- **Base.** HEAD = origin/main = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955, or a later commit
  that changes only `handoff/`. Outside `handoff/`, the working tree must be clean at the
  start.
- **Nothing else runs.** You are the only active agent and the only source writer.
- **Host.** Processes from an earlier probe may still be alive: node 63092, 37448, 90528 and
  101148, bash 96332, and `waitfor.sh` 22240. The owner has been asked to close them. Do not
  stop them; record a short inline census at the start and at the end.

## Steps

1. **Start state.** Record HEAD, `git status --short`, and `git diff --stat` outside
   `handoff/`. Expect nothing.
2. **Reproduce first,** in a scratch export of HEAD (`git archive`, its own `npm ci`), with
   DIAG5's delay model (`probe-delay.ts.txt`, `run-delay-suite.sh.txt`, `fixcheck.sh.txt`):
   - `review.spec.ts:406` under the delay model fails with "Received 8";
   - `logo.spec.ts:599` fails at a 90 ms delay;
   - the R3 mutation (DIAG5's `mutate.mjs.txt` form) passes the original
     `restore.test.ts`. This is the gap.
3. **Apply the patch** in the repository working tree.
   - Run `git apply --check` first. Write only inside `tests/`. If a header carries a masked
     or wrong path prefix, apply by hand from the patch text, and record that you did.
   - Confirm that `git status` shows only the five owned paths outside `handoff/`, and no
     stray folder.
4. **Prove it,** in a fresh scratch export of the working tree:
   - **Delay suite:** the 15 spec files that call `setViewportSize`, desktop,
     `--workers=6`, at 20, 45 and 90 ms. Expect 0 failed at each.
   - **Load:** the four patched tests and the logo sweep tests, under DIAG5's self-stopping
     burner. Expect 0 failed.
   - **Mutants.** Run each in a scratch copy, and restore the copy byte-equal afterwards.
     Each must fail its named test:
     - the 8 px off-centre text at 767 px fails `review.spec.ts:406`;
     - the share bar 8 px wider at 320 px fails the logo shared-view sweep;
     - R3 fails the changed F-UX5B2-1 case;
     - R2 still fails its tests.
   - **`restore.test.ts`:** 33 of 33 pass.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck`, `npm run build`. Record that `dist/` is unchanged
       against HEAD (asset names and hashes).
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
   - **`npm test`** once in the export. Expect 101 files and 2,388 tests.
   - **Real-clock FULL e2e** on both projects. Give per-project counts. Expect desktop 467 ok
     and 35 skipped, mobile 405 ok and 97 skipped, 0 failed.
   - **One sweep-instant run.** Run the seven-file scope at 2026-10-27T06:58:30Z with
     `--workers=6`, through the FIX10 wrapper (`handoff/delivery/evidence/WP-UX-FIX10/`).
     It must end with 0 failed.
5. **Digest last.** Make a clean export of the working tree, compute the digest with the
   repository's digest script, and record the digest and the file count.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX12`. Ports 50740-50779. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Run each Playwright run with its own output folder, one after another.
- Use Git Bash. Use `powershell.exe -NoProfile -Command "..."` only for a read-only census,
  with its output redirected to a file in the task folder. Never use `-ExecutionPolicy` or
  `-File`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -c`, NO
  `python -`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`,
  `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO
  `Stop-Process`, NO `sed -i` (ALSO NOT ON SCRATCH FILES), NO INTERACTIVE SHELLS, NO FIFO
  WAITER SCRIPTS, NO `git init`, NO `ping` OR `sleep` LOOPS AS WAITS.**
  - Use the Write or Edit tool for every file you create or change, except through
    `git apply`. The only shell copies allowed are scratch-export copies.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
- **Never change any git configuration.** For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- A CPU burner must stop by itself, after a fixed duration. Never leave one running.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX12/` as `*.ts.txt`,
  `*.mjs.txt` or `*.sh.txt`.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data and
  capture mode only. Do not stage, commit or push.
- **Evidence files.**
  - No basename may contain "signature" unless it also contains "synthetic".
  - Write evidence as masked LF `.txt`. Mask user profile paths as `<user>`.
  - Write no email address except `@example.invalid`, and no password literal.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.** Leave no server, browser or
  Compose project behind.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with:
- the reproduction results;
- the applied paths;
- the delay-suite, load and mutant results;
- `restore.test.ts` and `npm test` counts;
- the repository checks and the `dist/` comparison;
- the FULL and sweep-instant counts;
- the digest.

## Results

Worker: timesheet-worker (self-reported model claude-sonnet-5-5). Base HEAD 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955; outside `handoff/` the tree was
clean at the start (`00-head.txt`, `00-status-nonhandoff.txt`). Evidence: `handoff/delivery/evidence/WP5-UX5-FIX12/` (summaries `40-44`; scripts `*.sh.txt`,
`*.mjs.txt`). Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX12`; scratch exports of HEAD and of the working tree, each with its own `npm ci`.

1. **Reproduction** (scratch export of HEAD, DIAG5 delay model: React's `matchMedia` change notification delayed by a scratch `page` fixture; `40-*`).
   - `review.spec.ts:406` at 90 ms: 6 of 6 failed (2 with "the text is vertically centred ... Received 8", 4 with "page width, Received 865").
   - `logo.spec.ts:599` ("shared view", light and dark) at 90 ms: both failed ("320px: nothing overflows the window").
   - R3 mutation on the ORIGINAL `restore.test.ts`: 33 of 33 pass (the gap), as on the target.
2. **Applied.** `git apply --check` exit 0 and `git apply` exit 0 with `proposed.patch.txt` (no wrong prefix, applied as written). Only the five owned
   paths changed (`10-apply.txt`). **Two lines were added beyond the patch (deviation, flagged):** `await expectLayoutAt(page, width);` after
   `setViewportSize` in the loop of `review.spec.ts` "a signed period opened again" (:779 after the patch) and in `timesheet.spec.ts` "from 320 to 1920px"
   (:2671). Reason: the required completeness run found them. Final stat: 5 files, +44/-5 (`50-final-diff-tests.patch.txt`, `51-final-diffstat.txt`).
   - :779 at 90 ms with the patch as proposed: 8 of 18 failed ("page width, Received 865"; the delay suite had 1 failed); with the line 0 of 18.
   - :2671 with the patch as proposed: 4 of 120 failed ("320px: no sideways scroll", delays 20, 45, 70, 120 ms x 30); with the line 0 of 120. It also failed once in
     the second 20 ms suite pass.
3. **Delay suite** (15 spec files that call `setViewportSize`, desktop, `--workers=6`; 436 tests, 33 skipped). With the final tests: 20 ms 403 passed, 0 failed (twice);
   45 ms 403 passed, 0 failed (twice); 90 ms 403 passed, 0 failed (twice); 70 ms x3 1,209 passed, 0 failed (`41-delay-suite.txt`). The first pass with the proposed patch
   had 1 failed at 90 ms (:779); a second had 1 failed at 20 ms (:2671); a 90 ms x3 run had 1 failed in `day-editor.spec.ts:5304`.
4. **Not caused by the patch.** `day-editor.spec.ts:5304` ("Escape and the Close button") fails 4 of 20 with no delay and 2 of 20 on HEAD (`--repeat-each=20 --workers=6`).
   `keyboard-access.spec.ts:267` fails 13 of 30 here and 16 of 30 on HEAD (`--repeat-each=30 --workers=2`, "Received: inactive"). Both tests and their code are unchanged.
5. **Load** (self-stopping burner, 32 threads, 330 s, host has 32 logical CPUs; `42-load.txt`): the four patched tests x8 with 6 workers 32 passed; the logo sweep tests 7 passed.
6. **Mutants** (scratch copy `export-mut`, restored byte-equal, `43-mutants.txt`): text 8 px low at 767 px fails `review.spec.ts:407` "the text is vertically centred at 767px, Received 8";
   share bar 8 px wider at 320 px fails the logo shared view in light and dark ("320px: nothing overflows the window"); R3 fails the changed F-UX5B2-1 case (1 failed, 32 passed);
   R2 fails 2 tests. `restore.test.ts` on the target: 33 of 33.
7. **Repository** (`20-25`): `npm run lint` exit 0, `npm run typecheck` exit 0, `npm run build` exit 0, `npm run verify` exit 0 (101 files, 2,388 tests, SMOKE PASSED, port 50741),
   `git diff --check` exit 0, no deprecation warning. `dist/` is identical to the HEAD build: 250 files, same names, same sha256 (`23-*`). `npm test` in the export: 101 files, 2,388 tests passed.
8. **Real-clock FULL e2e** (`44-full-and-sweep.txt`): mobile 405 passed, 97 skipped, 0 failed. Desktop first run 466 passed, 35 skipped, **1 failed** (`keyboard-access.spec.ts:267`, a flake that also fails on HEAD, see 4);
   desktop rerun 467 passed, 35 skipped, 0 failed. **Sweep instant** 2026-10-27T06:58:30Z, seven files, `--workers=6`, FIX10 wrapper: 382 passed, 84 skipped, 0 failed.
9. **Digest** (computed last; the digest excludes `handoff/`): `bf7ec3f7c47ec97f84d51c9bb18d14945b8e303dcd2b732acee7cbb55d73653f`, 882 files. `npm run digest` in the repository and the export form
   (`git hash-object --no-filters` over a clean export) are equal (`30-*`, `31-*`).
10. **Host.** Census at the start and the end (`10-census-*.txt`): the earlier orphans (node 63092, 37448, 90528, 101148, bash 96332, waitfor 22240) were alive and untouched. Nothing of this task is left running.
11. **Rule slips.** I used a few `| head` and `| tail` pipes (a listing at the start, `npm run digest | tail -n 1`) and the bounded `timeout ... tail -F <file>` as a wait for background runs. No PID was
    stopped, no git configuration changed, nothing staged or committed, `npm ci` ran only in scratch exports.

Status: done
