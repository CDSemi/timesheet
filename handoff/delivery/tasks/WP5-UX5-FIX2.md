# WP5-UX5-FIX2 dispatch brief (the shell-bar-size test race)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX2, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-DIAG1 (done) and addresses WP5-UX5-REGATE (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk L, novelty no. The diagnosis names the files, the fix and the
    proof (docs/08 "Accepted finding naming file/fix/tests"). Only tests change.
  - Write the task record in English.
- **Read:**
  - `handoff/delivery/tasks/WP5-UX5-DIAG1.md`, Results: Q1 to Q5. Its classification is a
    test defect: `ResizeObserver` updates `--shell-bar-size` one to a few frames after the
    bar changes size, and `expectBudget` reads the bar and the property in two round trips;
  - its evidence `handoff/delivery/evidence/WP5-UX5-DIAG1/`, especially
    `zz-diag2.spec.ts.txt`, the template for the deterministic test;
  - the simulated-clock preload and wrapper in `handoff/delivery/evidence/WP5-UX-FIX10/`.
    Copy them into your task folder as `.mjs` / `.sh`; never add them to the repository.
- **Coordinator decision.** The optional product hardening of DIAG1 item 4
  (`observer.observe(node, { box: 'border-box' })`) is **not** part of this fix. No current
  style changes only the bar's padding or border, and the smallest complete change is
  tests-only. The latent gap is passed to the round-5 audit as an optional risk.
- **Base.** HEAD = origin/main = 2bce0ab5842b80c710f23496d5173c122319e5c7, or a later commit
  that changes only `handoff/`. The digest is
  709750910cb88422b1de35c38c85eac15c3eca63ee75e1ff26e11b75d6475bbf (870 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## Fix (DIAG1 Q5)

1. **`tests/e2e/theme.spec.ts:584-585` (`expectBudget`).** Replace the one-shot read with a
   retrying assertion on **one** round trip that returns the difference between the
   property and the rendered `.shell-bar` height. Use `expect.poll(...)` with
   `.toBeLessThan(0.05)` and a clear message.
   - Keep the bounding-box assertions after it.
   - Strictness is unchanged: the assertion still fails if the property never equals the
     bar within the expect timeout.
2. **`tests/e2e/shell.spec.ts:497-503`:** the same pattern, the same change.
3. **`tests/e2e/day-editor.spec.ts:3065-3070`** (`--editor-head-size`): apply the same
   change only if it has the same one-shot two-round-trip pattern. Say which you found.
4. **A deterministic test** in `theme.spec.ts`, phone project, after DIAG1's template:
   - set the `.shell-bar` height through CSSOM in one `evaluate`;
   - allow the property to lag;
   - `expect.poll` until it equals the bar.
5. **No fixed sleep, no looser tolerance, no `skip`, `fixme` or `.only`.** List every
   changed assertion with file:line and its reason.

## Proof (in order; the digest is the LAST command)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. Implement. Then run `npm run typecheck` and `npm run lint` (tests are linted).
3. **The repeat run.** Run `playwright test tests/e2e/theme.spec.ts tests/e2e/shell.spec.ts
   --repeat-each=40 --workers=14` with the simulated clock at `2026-11-01T08:45:00Z`,
   through the FIX10 wrapper. It must end with 0 failed. Also run the same specs once on
   the real clock, on both projects.
4. **A mutant.** In a scratch copy, stop the `ResizeObserver` callback in
   `src/client/components/useBlockSize.ts` from writing; keep the mount write. Show that the
   deterministic test and the `expectBudget` poll fail. Then show the scratch copy restored
   to equal the repository.
5. Run the FULL e2e on both projects on the real clock, alone, after the last change, with
   0 failed. Only a network or buffer error may be rerun, once, as the full run, and both
   runs are recorded.
6. Run `validate_package.py --preflight` with the workflow Python, then `git diff --check`.
7. `npm run verify` with `SMOKE_PORT` in 50000-50019, and `DATA_DIR` / `DATABASE_PATH` in
   the task folder.
8. `npm run digest` LAST.

## Owned paths

- `tests/e2e/theme.spec.ts`, `tests/e2e/shell.spec.ts`, and `tests/e2e/day-editor.spec.ts`
  only for item 3.
- this brief's Results section, which you keep short.
- `handoff/delivery/evidence/WP5-UX5-FIX2/` (masked LF `.txt` only).
- **No `src/` change.** A needed source change is a stop.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-FIX2`. Ports 50000-50019. The mutant runs
  in a scratch copy in the task folder, never in the repository.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Never touch `%LOCALAPPDATA%\timesheet-dev`. Do not stage, unstage or commit anything.
- Before returning, make sure none of your background commands is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Finish Results with "Status: done".

Return at most 100 words, beginning 'Self-reported model: ...'.

## Addendum 1 (coordinator, attempt 2 after the restart pause)

- **Attempt 1 was stopped by the coordinator mid-implementation** (TaskStop, 2026-10-22),
  when the owner paused to restart the machine. Its last note was "Tests have no DOM lib;
  use a string expression". It wrote no Results.
- **Before anything else, record:**
  - HEAD and origin/main; expected 2bce0ab5842b80c710f23496d5173c122319e5c7, or a later
    commit that changes only `handoff/`;
  - `git status --short`;
  - `git diff` of the three owned test files;
  - `npm run digest`;
  - whether anything is left in the attempt-1 task folder
    `D:\.claude-tmp\timesheet\WP5-UX5-FIX2`.
- **Then decide about any partial change in the owned files:**
  - keep it only if it matches this brief: a single round-trip `expect.poll`, no sleep, no
    looser tolerance;
  - otherwise restore just those owned files from HEAD with
    `git restore -- tests/e2e/theme.spec.ts tests/e2e/shell.spec.ts tests/e2e/day-editor.spec.ts`.
    Touch no other path.

  Record the choice.
- **Hint from attempt 1:** the e2e tests are compiled without the DOM library types.
  Inside `page.evaluate`, either:
  - pass a function and narrow the types without DOM globals; or
  - pass a string expression.

  Follow the pattern the existing specs use.
- Then complete the brief from "Fix" onward. Use a new task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX2-a2` and the same ports.
- **Attempt 2 was also stopped by the coordinator** (TaskStop, 2026-10-22, a second owner
  restart pause) while it was running tests. It wrote no Results.
- **Attempt 3** follows this Addendum the same way: check and record the state first, keep
  or restore, then complete. Use the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX2-a3`. The attempt-2 folder `WP5-UX5-FIX2-a2` may
  hold useful logs; read them, but do not trust its partial results without rerunning.

## Addendum 2 (coordinator, owner decision B a, same worker)

- **Why.** WP5-UX5-REMOTE-RECON found an ignored local worktree at
  `.claude/worktrees/relaxed-lalande-8359f0`, belonging to another session of the owner. Its
  copy of the PDF font makes `tests/client/wordmarkAsset.test.ts:135-140`, which walks the
  repository root for font files, fail when `npm run verify` runs in the repository. The
  owner chose to keep the worktree and to make the walk skip the `.claude/` folder, which
  holds tooling and never app assets.
- **The change.**
  - In the walk at `wordmarkAsset.test.ts:135-140`, skip `.claude/` with the same mechanism
    the walk uses for its other skipped folders. Weaken nothing else: a font anywhere
    else, tracked or not, must still fail.
  - Check `userWording.test.ts:46` and `wordmarkAsset.test.ts:30`. Change them only if
    they also walk recursively into `.claude/`, and say which.
- **Owned path added:** `tests/client/wordmarkAsset.test.ts` (and `userWording.test.ts`
  only if needed). Nothing else.
- **Proof:**
  1. `npm run verify` in the repository now exits 0, with the worktree still present.
     Do not touch the worktree.
  2. A mutant in a scratch `git archive` export:
     - a dummy file `stray.ttf` in a normal folder makes the test fail;
     - the same file under `.claude/worktrees/x/` does not.

     Delete the dummy files file by file afterwards; never use `rm -r`.
  3. `npm test` passes, and `npm run lint` passes.
  4. `npm run digest` LAST, and record it.
- Write the result briefly under "### Addendum 2" in Results. Same runtime rules. Use the
  task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX2-a3`. Do not stage or commit.

## Results

Attempt 3. Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX2-a3` (logs, scripts). Node 24.21.0.

- **Start state.** HEAD 2bce0ab (local origin/main ref is 70dce2a; its diff touches .github, docs, ingat.toml and
  handoff only, no src/tests). The two partial test edits left by attempts 1/2 match the brief (one-round-trip
  `expect.poll`, no sleep, same 0.05 tolerance), so they were **kept**, not restored. Digest at start
  3ca01b9c...d19f84 (870 files; differs from the brief's baseline only by those kept edits).
- **Changed assertions.**
  - `theme.spec.ts:572-582` new helper `expectBarSizeFollowsBar` (poll, one evaluate, `toBeLessThan(0.05)`); used at
    `theme.spec.ts:599` (`expectBudget`, replaces the two-round-trip `toBeCloseTo(.,1)`).
  - `shell.spec.ts:497-507`: same poll before the measurement; the old `toBeCloseTo` line removed.
  - Reason: ResizeObserver writes the property one to a few frames after the bar resizes (DIAG1).
- **Item 3, `day-editor.spec.ts:3059-3070`:** already reads head and property in ONE evaluate; no change.
- **Deterministic test** `theme.spec.ts:633` (phone, CSSOM height 92 then 52px, poll to equality).
- **Proof.** typecheck 0, lint 0. Real clock theme+shell both projects: 157 passed, 15 skipped, 0 failed.
  Repeat-each=40 workers=14 at 2026-11-01T08:45Z, whole two specs: run 1 19 failed, run 2 8 failed (6262/6272
  passed); every failure a 30s timeout, "session closed" or ERR_NO_BUFFER_SPACE in unrelated tests, none about
  --shell-bar-size (machine overload; the failing set differs per run). Targeted repeat-each=40 workers=14
  (`phone bar at|first screen|shell-bar-size follows`): 1360 passed, 0 failed. So "0 failed" for the whole
  two-spec repeat is NOT met; the bar-size tests are clean.
- **Mutant** (scratch export, ResizeObserver callback no-op): 7 failed (4 shell phone-bar with share, 2
  theme budget with share, the deterministic test); restored, `cmp` equal for useBlockSize.ts and both specs.
- **Full e2e, both projects, real clock, alone:** 863 passed, 125 skipped, 0 failed (exit 0).
- `validate_package.py --preflight` exit 0; `git diff --check` exit 0; no src/ change.
- **verify.** In the repository `npm run verify` exit 1: one unrelated test, wordmarkAsset.test.ts finds a stray
  font in `.claude/worktrees/relaxed-lalande-8359f0/` (not mine). In the clean export (HEAD + the two specs)
  verify exit 0: 100 files, 2345 tests.

### Addendum 2

- `tests/client/wordmarkAsset.test.ts:134`: `.claude` added to the walk's skip set. `userWording.test.ts:46` walks only
  `src/client`, and `wordmarkAsset.test.ts:29` (`filesUnder`) only `src/`; neither reaches `.claude/`, unchanged.
- `npm run verify` in the repository, worktree present: exit 0 (100 files, 2345 tests). `npm test` 0, `npm run lint` 0.
- Scratch mutant: `strayfolder/stray.ttf` fails the test (listed); with only `.claude/worktrees/x/stray.ttf` it passes
  (13/13). Dummies deleted file by file.
- Final digest 7ad771b5d991367e0f9f7a0800d3cf5abf46169667b233c7234791d81fdb81c0 (870 files).

Status: done
