# WP5-UX5-FIX13 dispatch brief (Check in focus race in a test; Day editor dirty flag timing)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX13, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-DIAG6 (done). It serves the regate that follows
  WP5-UX5-REGATE7 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (one client hook on an unsaved-changes guard), novelty no. docs/08
    row "Accepted finding naming file/fix/tests".
  - The edit is exact and proven, so the profile is worker. A fresh auditor reads the product
    change later.
  - Reproduce first, then apply.
  - Write the task record in English.
- **The plan.** Read `handoff/delivery/tasks/WP5-UX5-DIAG6.md`, Results 1-7, and its
  evidence in `handoff/delivery/evidence/WP5-UX5-DIAG6/` (`00-README.txt` indexes it). The
  exact change is `proposed.patch.txt`: 3 files, +42/-2, on top of the FIX12 working tree.
  DIAG6 found `git apply --check` clean.
  - **`tests/e2e/keyboard-access.spec.ts:267`**: `await expect(button).toBeEnabled();` before
    `button.focus()`, with a short comment. The Check in button is disabled while the status
    is still unknown. That is documented, correct behaviour.
  - **`src/client/components/DayFieldsForm.tsx`**: report `dirty` through `useLayoutEffect`
    instead of `useEffect`. The change is the import line, one word and a two-line comment.
    - Without it, a fast Escape after typing in Notes can close the Day editor without "Discard
      your changes?", and the typed note is lost. That contradicts U4-05: unsaved edits are
      never dropped silently.
    - Leave the reason field (`DayEditor`'s own `dirty`) alone.
  - **`tests/e2e/day-editor.spec.ts`**: the new deterministic test, "Escape dispatched in the
    same task as a keystroke in the Notes still asks "Discard your changes?"".
    - In one typed `evaluate`, it sets the value through the native setter, dispatches
      `input`, then dispatches an Escape keydown.
    - It runs on both projects.
    - Use the typed function form that DIAG6 proved, not a string passed to `evaluate`.
- **Coordinator decisions:**
  - Apply the patch exactly as DIAG6 proposed.
  - Change no other source, docs, package or lockfile.
  - No assertion loosened, no case dropped, no timeout raised, no fixed sleep.
  - Do not touch FIX12's five uncommitted files: `tests/e2e/fixtures.ts`, `logo.spec.ts`,
    `review.spec.ts`, `timesheet.spec.ts` and `tests/integration/restore.test.ts`.
  - If a canonical document (docs/04, docs/12 or the requirements) describes this guard in a
    way the change contradicts, report it in Results. Do not edit docs.
- **Owned paths:**
  - `src/client/components/DayFieldsForm.tsx`;
  - `tests/e2e/keyboard-access.spec.ts`;
  - `tests/e2e/day-editor.spec.ts`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX13/`.
- **Base.** HEAD = origin/main = 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955, or a later commit
  that changes only `handoff/`.
  - Outside `handoff/`, the working tree must differ only in FIX12's five files at the start.
  - `npm run digest` must give bf7ec3f7c47ec97f84d51c9bb18d14945b8e303dcd2b732acee7cbb55d73653f.
  - If either check fails, stop and report.
- **Nothing else runs.** You are the only active agent and the only source writer.
- **Host.** Processes from an earlier probe may still be alive: node 63092, 37448, 90528 and
  101148, bash 96332, and `waitfor.sh` 22240. The owner has been asked to close them. Do not
  stop them. Record a short inline census at the start and at the end.

## Steps

1. **Start state.** Record HEAD, `git status --short` and `git diff --stat` outside
   `handoff/`, and the digest. Expect FIX12's five paths only, and bf7ec3f7.
2. **Reproduce first,** in a scratch export of the working tree (`git archive` of HEAD, with
   FIX12's five files copied over, and its own `npm ci`). Use DIAG6's models and scripts:
   - with the late lookup (+300 ms on the third and later `/api/periods/current`), the
     original keyboard test fails;
   - with the main thread throttled 4x, the original Escape test fails;
   - the new test fails on the original product. Add the new test only, then run it.
3. **Apply the patch** in the repository working tree.
   - Run `git apply --check` first, and write only the three owned paths.
   - Confirm that `git status` outside `handoff/` shows exactly the eight paths: FIX12's five
     and your three. There must be no stray folder.
4. **Prove it,** in a fresh scratch export of the working tree:
   - **Repeat runs:** `--repeat-each=60` of the keyboard test, the Escape test and the new
     test, at 2 and at 6 workers. Expect 0 failed.
   - **Models:** with the fix, the late-lookup model and the 4x-throttle model pass. Rerun
     DIAG6's flag-lag matrix on the fixed product (`gap-fixed-table.txt` form); expect 0 in
     every cell.
   - **Load:** one run of the three tests under a self-stopping burner. Expect 0 failed.
   - **Mutants,** each in a scratch copy, restored byte-equal afterwards. Each must fail the
     named test:
     - the Check in button never enabled;
     - the button removed from the tab order;
     - Escape inside the drawer does not close;
     - `dirty` never reported;
     - `useEffect` restored in `DayFieldsForm.tsx`: the new test fails.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck` and `npm run build`. Record the `dist/` comparison
       against the FIX12 build: `dist/server` identical; only `dist/client` chunks and
       `index.html` differ. Name the changed files.
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
     - No deprecation warning.
   - **`npm test`** once in the export. Expect 101 files and 2,388 tests.
   - **Real-clock FULL e2e** on both projects. Give per-project counts. Expect desktop 468
     ok and 35 skipped, mobile 406 ok and 97 skipped, 0 failed.
   - **One sweep-instant run.** Run the seven-file scope at 2026-10-27T06:58:30Z with
     `--workers=6`, through the FIX10 wrapper (`handoff/delivery/evidence/WP-UX-FIX10/`). It
     must end with 0 failed. Add `keyboard-access.spec.ts` and `day-editor.spec.ts` if they
     are not in that scope.
5. **Digest last.** Make a clean export of the working tree, then compute the digest with the
   repository's digest script. Record the digest and the file count. Both `npm run digest`
   and the export form must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX13`. Ports 50820-50859. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Run each Playwright run with its own output folder, one after another.
- Use Git Bash. Use `powershell.exe -NoProfile -Command "..."` only for a read-only census,
  with its output redirected to a file in the task folder. Never use `-ExecutionPolicy` or
  `-File`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -c`, NO
  `python -`), NO PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`,
  `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO
  `Stop-Process`, NO `sed -i` (ALSO NOT ON SCRATCH FILES), NO INTERACTIVE SHELLS, NO FIFO
  WAITER SCRIPTS, NO `git init`, NO `ping`, `sleep` OR `tail -F` USED AS WAITS.**
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
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX13/` as `*.ts.txt`,
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
- the repeat, model, load and mutant results;
- the `npm test` count;
- the repository checks and the `dist/` comparison;
- the FULL and sweep-instant counts;
- the digest.

## Results

Worker: claude-sonnet-5-5. Details and scripts: `handoff/delivery/evidence/WP5-UX5-FIX13/` (`00-README.txt`, `10-results.txt`).

1. **Start.** HEAD 0f52300c; outside `handoff/` only FIX12's five files; digest bf7ec3f7 (882 files).
2. **Reproduced on the original product.** Late lookup (+300 ms): keyboard test 10 of 10 failed. 4x throttle: Escape test 10 of 10
   failed. New test alone: 20 of 20 failed (both projects).
3. **Applied** `proposed.patch.txt` by `git apply` (check clean): `src/client/components/DayFieldsForm.tsx`,
   `tests/e2e/keyboard-access.spec.ts`, `tests/e2e/day-editor.spec.ts`; +42/-2. `git status` outside `handoff/` shows exactly the
   eight paths; FIX12's five files untouched.
4. **Proof.** Repeat 60 of the three tests, both projects, at 2 workers and at 6 workers: 300 passed, 60 skipped, 0 failed each
   (the keyboard test is desktop-only). Late-lookup model 10/10 and 4x-throttle model 20/20 passed. Flag-lag matrix on the fixed
   product: 0 failures in all 15 cells. Burner load (32 threads, 240 s): 50 passed, 10 skipped, 0 failed. Mutants (restored
   byte-equal): never enabled, out of tab order, Escape in the drawer not closing, dirty never reported, `useEffect` restored: each
   failed its named test (the `useEffect` mutant failed the new test 5 of 5).
5. **Repository.** lint, typecheck, build, `npm run verify` (smoke 50820; 101 files, 2,388 tests; SMOKE PASSED) and
   `git diff --check` all exit 0; no deprecation warning. `dist/server` and `dist/domain` identical to the FIX12 build; only
   `dist/client` `index.html` and the `AdminScreen`, `ImportScreen`, `ReviewScreen`, `SettingsTransfer`, `SettingsTransferFile` and
   `index` chunks (js and map) differ.
6. **`npm test`** in the export: 101 files, 2,388 tests passed.
7. **FULL e2e, real clock:** desktop 468 passed / 35 skipped / 0 failed; mobile 406 / 97 / 0.
   **Sweep 2026-10-27T06:58:30Z**, `--workers=6`, REGATE7's seven files plus `keyboard-access.spec.ts`: 408 passed, 94 skipped,
   0 failed.
8. **Digest (last).** c1691aed8604a00e6fa33e89f7a1bf8970c7cef44bf2eab64239661cf6a11fba, 882 files; `npm run digest` and the clean
   export form agree.
9. **Docs.** No canonical document contradicts the change; none edited.
10. **Process notes.** The proof chain was started from one detached shell by mistake and ran to completion; nothing is left
    running. The census shows the same node.exe and msedge.exe counts at start and end. A few read-only inspection commands used
    pipes into head or tail; no evidence depends on them.

Status: done
