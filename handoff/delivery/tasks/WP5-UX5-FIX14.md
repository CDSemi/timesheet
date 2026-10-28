# WP5-UX5-FIX14 dispatch brief (layout wait in controls, period step in the range ladder, tab focus in the theme test, cross-tab theme)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX14, package WP5, kind fix,
  attempt 1.
  - It depends on WP5-UX5-DIAG8 (done).
  - It serves the regate that follows WP5-UX5-REGATE8 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (one small client listener, three e2e files), novelty no. docs/08
    row "Accepted finding naming file/fix/tests".
  - The edits are exact and proven, so the profile is worker. A fresh auditor reads the
    product change later.
  - Reproduce first, then apply.
  - Write the task record in English.
- **The plan.** Read the Results of `handoff/delivery/tasks/WP5-UX5-DIAG7.md` and
  `handoff/delivery/tasks/WP5-UX5-DIAG8.md`, and their evidence folders. Apply three patches,
  in this order, with `git apply`:
  1. **`handoff/delivery/evidence/WP5-UX5-DIAG7/proposed.patch.txt`**:
     `tests/e2e/controls.spec.ts`, +4/-1. It adds `await expectLayoutAt(page, width);` after
     `setViewportSize` in the loops of `:49` and `:68`. The test read the period card in the
     stale layout and the title row after React's commit.
  2. **`handoff/delivery/evidence/WP5-UX5-DIAG8/proposed.patch.txt`**:
     - `tests/e2e/timesheet.spec.ts`, +14/-6: the module helper `stepPeriod`, which reads
       `data-period-due`, clicks, expects the attribute to change, then waits for the 14 days.
       It replaces the three click-and-count pairs of the range ladder and the test after it.
     - `tests/e2e/theme.spec.ts`, +5: `bringToFront` before tab A's click, before tab B's
       paint check, and before tab A's last paint check, with a two-line comment.
  3. **`handoff/delivery/evidence/WP5-UX5-DIAG8/proposed-product.patch.txt`**:
     - `src/client/components/ThemeToggle.tsx`, +12: `followThemeOfOtherTabs`, one `storage`
       listener that calls `applyChoice()`;
     - `src/client/App.tsx`, +4: `useEffect(followThemeOfOtherTabs, [])`;
     - `tests/e2e/theme.spec.ts`, +29: the test "a theme chosen in one tab reaches a second
       tab whose account menu is closed".

     This restores the accepted rule of WP5-UX2-PLAN B3, WP5-UX2-T01 (AC 3) and WP5-UX2-T07:
     "a storage event keeps other tabs in step". WP5-UX3-T02 broke it when it moved the theme
     control, with its only listener, into the account menu.
- **Coordinator decisions:**
  - Apply the three patches exactly as proposed, including the product option. The next
    regate is full.
  - Change no other source, docs, package or lockfile.
  - No assertion loosened, no step or case dropped, no timeout raised, no fixed sleep.
  - If a canonical document contradicts the change, report it in Results. Do not edit docs.
    This covers docs/04, docs/12, the requirements, and the UX2 and UX3 records.
- **Owned paths:**
  - `tests/e2e/controls.spec.ts`;
  - `tests/e2e/timesheet.spec.ts`;
  - `tests/e2e/theme.spec.ts`;
  - `src/client/App.tsx`;
  - `src/client/components/ThemeToggle.tsx`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX14/`.
- **Base.**
  - HEAD = origin/main = bb8d34039b79320e415a0224c0bd02075bd0f76a, or a later commit that
    changes only `handoff/`.
  - The working tree must be clean outside `handoff/` at the start.
  - `npm run digest` must give
    c1691aed8604a00e6fa33e89f7a1bf8970c7cef44bf2eab64239661cf6a11fba.
  - If either check fails, stop and report.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record:
   - HEAD;
   - `git status --short` and `git diff --stat` outside `handoff/`;
   - the digest.
2. **Reproduce first,** in a scratch export of HEAD (`git archive`, with its own `npm ci`).
   Use the DIAG7 and DIAG8 models and scripts:
   - `controls.spec.ts:49` (mobile) fails under DIAG7's step-delay model;
   - the range ladder fails under DIAG8's forced-interleaving probe (`probe-ladder-forced`);
   - `theme.spec.ts:376` fails beside DIAG8's self-stopping 48-thread burner (mobile,
     6 workers, 45 ms model);
   - the new cross-tab test fails on the unchanged product. Add the test only, then run it on
     both projects.

   A rate is enough where DIAG8 found no deterministic model. Record it.
3. **Apply the patches** in the repository working tree, in the order above.
   - Run `git apply --check` before each one.
   - Write only the five owned source and test paths.
   - Confirm that `git status` outside `handoff/` shows exactly those five paths, with no
     stray folder. Check line endings against the neighbouring files.
4. **Prove it,** in a fresh scratch export of the working tree.
   - **Models and load:**
     - DIAG7's step-delay model on `controls.spec.ts` `:49` and `:68`, both projects: 0
       failed;
     - DIAG8's forced-interleaving probe, run with `stepPeriod`: 0 failed;
     - the theme test beside the self-stopping 48-thread burner: 24 of 24 pass.
   - **Repeat runs** (expect 0 failed):
     - the range ladder, desktop, `--repeat-each=60 --workers=6`;
     - `theme.spec.ts` whole, both projects, `--repeat-each=10 --workers=6`;
     - `controls.spec.ts` `:49` and `:68`, both projects, `--repeat-each=20 --workers=6`.
   - **Mutants,** each in a scratch copy, rebuilt where needed and restored byte-equal
     afterwards. Each must fail the named test:
     - m1 (DIAG7): the period card and the Review block 42.797 px lower at 768-1023 px;
     - f1b (DIAG8): a wrong end year on the two-year period;
     - f2 (DIAG8): the theme control's listener never applies the choice;
     - `followThemeOfOtherTabs` never applies the choice: the new cross-tab test fails;
     - `App.tsx` without the effect: the new cross-tab test fails.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck` and `npm run build`. Record the `dist/`
       comparison against a build of bb8d340: `dist/server` and `dist/domain` identical; only
       `dist/client` chunks and `index.html` differ. Name the changed files.
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
     - No deprecation warning.
   - **`npm test`** once in the export. Expect 101 files and 2,388 tests.
   - **Real-clock FULL e2e** on both projects. Give per-project counts. The new test adds one
     test per project. Expect desktop 469 ok and 35 skipped, mobile 407 ok and 97 skipped, 0
     failed. Explain any other count.
   - **One sweep-instant run** of the 15 `setViewportSize` spec files plus `theme.spec.ts`,
     both projects, at 2027-03-14T10:30Z with `--workers=6`, through the clock wrapper in
     `handoff/delivery/evidence/WP-UX-FIX10/`. It must end with 0 failed.
5. **Digest last.** Make a clean export of the working tree, then compute the digest with the
   repository's digest script. Record the digest and the file count. `npm run digest` and the
   export form must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX14`. Set TEMP and TMP to it. Ports
  51080-51119, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder. Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Inline and read-only, at the start and the end.
  - Use only `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
    Select-Object ..."`, redirected to a file in the task folder. Never use
    `-ExecutionPolicy` or `-File`.
  - **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
    times only. Never write the command line of a process the mission did not start.
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN TO WRITE A
  FILE), NO `node -e`, NO `python -c`, NO `node -` OR `python -`. NEVER PIPE INTO `head`,
  `tail` OR `cat`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS A `cp` TARGET. NO `rm -r` OR `rm -rf`,
  ALSO NOT ON SCRATCH FOLDERS (MAKE A NEW FOLDER INSTEAD). NO PID KILLS, NO
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
- A CPU burner must stop by itself after a fixed duration. Never leave one running.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX14/` as `*.ts.txt`,
  `*.mjs.txt` or `*.sh.txt`.
- Use synthetic data and capture mode only. Do not stage, commit or push.
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

## Return

At most 150 words, beginning 'Self-reported model: ...', with:

- the reproductions;
- the five changed paths;
- the proof: models, repeats and mutants;
- the repository checks, with the `dist/` comparison;
- `npm test`;
- the FULL counts and the sweep-instant run;
- the digest;
- any slip.

## Results

Worker: timesheet-worker, self-reported model claude-sonnet-5-5. Base: HEAD = bb8d34039b79320e415a0224c0bd02075bd0f76a, branch main; nothing changed outside `handoff/` at the start (`out/00-nonhandoff-status-start.txt`, 0 lines); `npm run digest` at the start c1691aed8604a00e6fa33e89f7a1bf8970c7cef44bf2eab64239661cf6a11fba (882 files). Scratch exports: `git archive` of bb8d340 with its own `npm ci` (export-base, Node 24.21.0), later a second one with the five files (export-fix). Evidence: `handoff/delivery/evidence/WP5-UX5-FIX14/` (124 masked LF files: outputs, `log-*` run logs, scripts as `*.sh.txt`, `*.mjs.txt`, `*.ts.txt`, `*.css.txt`).

**Reproduced first, on the unchanged export of bb8d340** (`repro1.txt`, `theme-burn.txt`, `repro-sweep-model.txt`):
- `controls.spec.ts:49` and `:68`, DIAG7 step-delay model (base 0 ms, step 3 ms per repeat, real clock, 6 workers, 40 repeats): mobile 26 failed of 200 (`:49` x14 "title row to period card at 768px => 84", `:68` x12 "review title row to the next block at 768px => 84"); desktop 0 of 200 (it does not leave the desktop width).
- Range ladder, DIAG8 forced-interleaving probe (`probe-ladder-forced.ts.txt`, original steps, desktop x6): 6 of 6 failed.
- `theme.spec.ts:376`, mobile, 6 workers, 45 ms media model, 24 repeats beside the self-stopping 48-thread burner (480 s): 21 of 24 failed ("the page is painted light", "Dark is not checked"); 3 passed.
- The new cross-tab test added alone (theme part of the two patches) on the unchanged product, both projects x6: 12 of 12 failed, "the page is painted dark" received rgb(237, 240, 245).

**Applied** in the repository, in order, with `git apply` (each `--check --whitespace=error` exit 0, apply exit 0; `apply.txt`): DIAG7 `proposed.patch.txt`, DIAG8 `proposed.patch.txt`, DIAG8 `proposed-product.patch.txt`. `git status --short` outside `handoff/` shows exactly five paths, no stray file (`status-after-apply.txt`), 69 insertions and 7 deletions (`diffstat.txt`, `changes.diff.txt`), all `i/lf w/lf` like their neighbours, `git diff --check` exit 0:
- `tests/e2e/controls.spec.ts`
- `tests/e2e/timesheet.spec.ts`
- `tests/e2e/theme.spec.ts`
- `src/client/App.tsx`
- `src/client/components/ThemeToggle.tsx`

**Proof, in a fresh scratch export of the working tree** (the five files equal the repository, `export-fix-equals-repo.txt`; `prove-a.txt`, `prove-a2.txt`, `prove-b.txt`, `theme-burn.txt`):
- DIAG7 step-delay model, `:49` and `:68` (and `:95`), 6 workers, 40 repeats: mobile 200 passed, 0 failed; desktop 200 passed, 0 failed.
- Forced hold of the two-year answer (1.5 s timer) with `stepPeriod` (`probe-ladder-forced-fixed.ts.txt`), desktop x24: 24 passed, 0 failed. The first attempt ran in the wrong export by a script slip ("No tests found", 0 run) and was rerun in `prove-a2.sh.txt`.
- Theme test beside the 48-thread burner (mobile, 45 ms, 6 workers): 24 of 24 passed, twice (`proof-theme-burn`, `proof-theme-burn2`).
- Repeat runs, 0 failed: range ladder desktop `--repeat-each=60 --workers=6` 120 passed (two tests of the describe); `theme.spec.ts` whole, both projects x10, 820 passed; `controls.spec.ts` "the title row is 32px above" (`:49`, `:68`), both projects x20, 120 passed.
- Mutants (each rebuilt, restored byte-equal; dist hashes identical after the last restore, 250 files), each failed the named test: m1 (card and Review block 42.797 px lower at 768-1023 px) 12 of 12 failed, `controls.spec.ts:49` and `:70` (the Review title test, shifted by the patch) on both projects; f1b (wrong end year on the two-year period) 12 of 12 failed, ladder `timesheet.spec.ts:2608`, "cross-year"; f2 (the control's listener never applies) 12 of 12 failed, `theme.spec.ts:376`; `followThemeOfOtherTabs` never applies 12 of 12 failed, new test `theme.spec.ts:407` "the page is painted dark"; `App.tsx` without the effect 12 of 12 failed, same test and message.

**Repository checks** (`repo-lint-exit.txt`, `repo-verify.txt`): `npm run lint`, `npm run typecheck`, `npm run build` exit 0, 0, 0; `npm run verify` (typecheck, lint, test, build, smoke with SMOKE_PORT 51081) exit 0; `git diff --check` exit 0; 0 lines containing "deprecat" in the lint, typecheck, build and verify logs. `dist/` comparison against a build of bb8d340 (`dist-compare.txt`, `dist-chunk-compare.txt`): 250 files each; `dist/server` and `dist/domain` identical; only `dist/client` differs: `index.html`, the entry chunk `index-C0DifRQQ.js` to `index-qNP6kTPW.js` (with `.map`; `App.tsx` and `ThemeToggle.tsx` live there), and five chunks that import it only by its renamed hashed name: `AdminScreen`, `ImportScreen`, `ReviewScreen`, `SettingsTransfer`, `SettingsTransferFile` (with `.map`; their code is equal apart from the renamed references). The build in the repository equals the build of the scratch export.

**`npm test`** in the export: 101 files, 2,388 tests, exit 0 (also inside `verify`).

**Real-clock FULL e2e** (`full.txt`, one project after the other, 2 workers): desktop 469 ok, 35 skipped, 0 failed; mobile 407 ok, 97 skipped, 0 failed (the new test is the one test more per project). **Sweep-instant run** at 2027-03-14T10:30Z (`shiftclock.mjs`, control line `sweep-clock-control.txt`: process clock 2027-03-14T10:30:00Z), the 15 `setViewportSize` spec files (`theme.spec.ts` is one of them), both projects, `--workers=6`: 876 tests, 748 ok, 128 skipped, 0 failed.

**Digest, last:** clean export (`git clone` of the repository plus the five files) and `npm run digest` agree: 419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708 (882 files, handoff/ excluded) (`digest.txt`).

**Documents:** no canonical document contradicts the change. `docs/04_UX_AND_SETTINGS.md` line 114 says the choice is stored on that device and states no cross-tab rule; the rule "a storage event keeps other tabs in step" is in the WP5-UX2 records, which the patch restores. No docs edited.

**Host:** census at the start and the end (inline read-only, `census-summary.txt`): node.exe 16, msedge.exe 46, 498 processes both times; each burner stopped by itself (480 s); nothing left running.

**Slips (harmless; no heredoc, no stdin to node or python, no `/dev/null`, no `rm -r`, no PID kill, no `sed -i`):** six reads piped into `head` (`ls | head`, `grep | head`, early file listings) and one `git diff --stat | cat`; the PW_EXPORT slip above; `prove-a.sh` was not edited while it ran. `git clone` (not `git init`) made the digest export. Mutant lines in `prove-b.sh` use `cp` and `cmp` on scratch copies only.

Status: done
