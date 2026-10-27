# WP5-UX5-FIX10 dispatch brief (make the slow e2e tests cheaper, tests only)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX10, package WP5, kind
  fix, attempt 1. It depends on WP5-UX5-DIAG4 (done), and addresses WP5-UX5-REGATE5 (FAIL).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size S, risk M (shared e2e helpers), novelty no. docs/08 row "Accepted
    finding naming file/fix/tests".
  - The plan is proven, so reproduce first, then apply it.
  - Write the task record in English.
- **The plan.** Read `handoff/delivery/tasks/WP5-UX5-DIAG4.md` (Results, sections 1-5)
  and its evidence in `handoff/delivery/evidence/WP5-UX5-DIAG4/`. The exact change is
  `proposed-tests.patch.txt`; DIAG4 found `git apply --check` clean against the working
  tree. It has four parts:
  - **F1, `tests/e2e/logo.spec.ts`:** each sweep runs in four browser contexts, not tabs,
    and the shared-view sweep of `:508` becomes its own test. A new check confirms that
    every width from 320 to 1440 is measured once.
  - **F2, `tests/e2e/admin-status.spec.ts`:** a state-based wait for the PDF before
    `sendSigned` (lines 142 and 283).
  - **F3, `tests/e2e/contrast.ts` and `tests/e2e/timesheet.spec.ts:1037`:** one decoded
    screenshot surface instead of 360 one-pixel screenshots.
  - **F4, `tests/e2e/day-editor.spec.ts:5547`:** `textContrastProblems` in one evaluate,
    with the same ratios.
- **Coordinator decisions:**
  - apply F1 to F4 exactly as DIAG4 proposed;
  - tests only: no `src/`, docs, package or lockfile change;
  - no assertion loosened, no width, theme or case dropped, no timeout raised.
- **Owned paths:**
  - `tests/e2e/logo.spec.ts`;
  - `tests/e2e/admin-status.spec.ts`;
  - `tests/e2e/timesheet.spec.ts`;
  - `tests/e2e/contrast.ts`;
  - `tests/e2e/day-editor.spec.ts`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX10/`.
- **Base.** HEAD = origin/main = 94accda904240fda1cf500063d8b30d3a3603fd2, or a later commit
  that changes only `handoff/`. Outside `handoff/`, the working tree must be clean at the
  start.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record HEAD, `git status --short` and `git diff --stat` outside
   `handoff/`. Expect nothing.
2. **Reproduce first,** in a scratch export of HEAD, with DIAG4's method:
   - `logo.spec.ts:508` alone, with its duration;
   - the same under DIAG4's self-stopping burner, until it times out or comes within 20%
     of 240 s;
   - the `admin-status` bimodal duration (4 runs);
   - `timesheet.spec.ts:1037` and `day-editor.spec.ts:5560` durations.
3. **Apply the patch** in the repository working tree.
   - Run `git apply --check` first. If the patch's headers carry a masked or wrong path
     prefix, do not let git write outside `tests/e2e/`. Apply by hand from the patch text
     instead, and record it.
   - Confirm that `git status` shows only the five owned paths outside `handoff/`, with no
     stray folder.
4. **Prove it,** in a fresh scratch export of the working tree:
   - **Durations** after the change, for the same probes as step 2. Expect:
     - 508: about 33 s per test alone, and passing under the burner;
     - admin-status: about 31 s every run;
     - :1037: about 15 s;
     - :5560: about 3 to 7 s.
   - **Equivalence:**
     - DIAG4's compare for the logo rows (1,121 of 1,121 identical);
     - the leaf ratios for `textContrastProblems` (identical to 4 decimals).
   - **Mutants** L1, L2, H1, H2, A1, A2, T1, T2, T3 and D1 (DIAG4's `mut.sh` and
     definitions): each fails its named test. Run them in a scratch copy only, and restore
     it afterwards (byte-equal).
   - **In the repository,** one after another: `npm run lint`, `npm run typecheck`, and
     `npm run build`. Record that the asset names equal HEAD's (`dist/` unchanged). Then
     `npm run verify` (smoke port in your range) and `git diff --check`.
   - **The real-clock FULL e2e** on both projects (2 workers), with per-project counts and
     0 failed. Expect desktop 466 ok and 35 skipped, mobile 405 ok and 96 skipped.
   - **One FULL run at 2026-11-01T08:45Z** with `--workers=6`, through the FIX10 wrapper
     (`handoff/delivery/evidence/WP-UX-FIX10/`), with 0 failed. Report the durations of
     the logo and admin-status tests.
5. **Digest last.** Make a clean export of the working tree, compute the digest with the
   repository's digest script, and record the digest and the file count.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX10`. Ports 50540-50579. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Run each Playwright run with its own output folder, one after another.
- Use Git Bash. Use `powershell.exe -NoProfile -Command "..."` only for a read-only census,
  with its output redirected to a file in the task folder.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO `Stop-Process`, NO
  `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`.**
  - Use the Write or Edit tool for every file you create or change, except `git apply`.
    The only shell copies allowed are scratch-export copies.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit
    notice.
- **Never change any git configuration.** For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- A CPU burner must stop by itself, after a fixed duration. Never leave one running.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/` as `*.ts.txt`, `*.mjs.txt` or
  `*.sh.txt`.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data and
  capture mode only. Do not stage, commit or push.
- **Evidence files.**
  - Name no evidence file with "signature" in its basename unless it also contains
    "synthetic".
  - Write evidence as masked LF `.txt`.
  - Write no email address except `@example.invalid`, and no password literal.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.**
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with:
- the before and after durations;
- the equivalence results;
- the mutant results;
- the FULL and sweep-instant counts;
- the repository checks;
- the digest.

## Results

Worker: Claude Sonnet 5.5 (claude-sonnet-5-5), timesheet-worker. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX10/`
(`00-commands-and-results.txt`, `10-mutants.txt`, `mut.sh.txt`, `mutants-all.sh.txt`); full logs stay in
`D:\.claude-tmp\timesheet\WP5-UX5-FIX10\logs\`. Start state: HEAD 94accda, nothing changed outside `handoff/`.

- **Applied.** DIAG4's `proposed-tests.patch.txt` with `git apply --include='tests/e2e/*'` (check clean). Changed
  paths outside `handoff/`: the five owned test files only (221 insertions, 31 deletions), no untracked file. Nothing staged
  or committed.
- **Durations before, then after** (HEAD scratch export against the working tree's files; alone unless noted):

  | probe | before | after |
  | --- | --- | --- |
  | `logo` 508 (light, dark) / new split tests | 1.9 m each (two sweeps in one test) | 31.7 s + 30.7 s light, 31.6 s + 31.1 s dark |
  | same, 4 at once under the 64-thread burner | 4 of 4 timed out at 240 s (4.3 to 4.9 m) | 12 of 12 passed, max 2.5 m (6.8 m for the run) |
  | `admin-status` (4 runs) | 17.7, 17.8, 78 (1.3 m), 17.8 s | 32.9, 31.7, 32.9, 30.9 s |
  | `timesheet` desktop frame test | 33.9 s | 15.1 s |
  | `day-editor` U4-12/13 (1440, 390) | desktop 5.0, 4.5 s; mobile 4.1, 3.0 s | desktop 3.1, 2.7 s; mobile 2.2, 1.8 s |

- **Equivalence.** Logo: 1,121 of 1,121 rows identical to a serial re-measure in all six sweeps (own view and switcher,
  shared view; light and dark). `textContrastProblems`: old and new leaf lists identical to 4 decimals in 8 of 8 cases
  (34 leaves at 1440, 28 at 390).
- **Mutants.** L1, L2, H1, H2, A1, A2, T1, T2, T3, D1: all ten killed by the named test (messages in `10-mutants.txt`),
  run in the scratch copy only, files restored byte-equal. The exact mutant texts were not recorded by DIAG4; they are
  reconstructed from its Results (`mutants-all.sh.txt`).
- **Repository checks** (Node 24, one after another): `npm run lint` 0, `npm run typecheck` 0, `npm run build` 0 with
  `dist/client/assets` names equal to before and to HEAD's (`index-BNsJjgBK.js`, `index-CGoignED.css`), `npm run verify`
  SMOKE PASSED (port 50541) 0, `git diff --check` 0.
- **Real-clock FULL e2e** (scratch export of the working tree, 2 workers): 871 passed, 131 skipped, 0 failed (18.8 m);
  desktop 466 ok / 35 skipped, mobile 405 ok / 96 skipped. The logo tests took 37.5 to 42.5 s, admin-status 31 to 33 s.
- **FULL at 2026-11-01T08:45Z, `--workers=6`** (FIX10 wrapper, `shiftclock.mjs` unchanged): 871 passed, 131 skipped,
  0 failed (11.3 m); desktop 466 / 35, mobile 405 / 96. The six logo tests took 1.1 to 1.3 m (78 s of 240 s at most;
  before: median 192 s, one timeout); admin-status 29.7 to 33.6 s.
- **Digest** (last, `node scripts/source-digest.mjs` in the working tree, handoff excluded):
  `4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f` (882 files). It was taken in the working tree
  (the script needs git), not in a git-less export.
- **Deviations.** The DIAG4 mutant texts are reconstructed (above). Test lines moved (logo 547/569/599, admin 139/277,
  timesheet 1042, day-editor 5577). Two waiter loops (bash `until`/`sleep`) were moved to the background by the tool and
  ended by themselves; the first needed its watched file to be rewritten by hand to end (the burner prints no end line when it
  exits at its deadline). Burners ended by themselves; nothing is running. No heredoc, no stdin to node or python, no pipe
  into tail (three no-op `| head -0` pipes in early listings were a slip against the rule; they printed nothing), no PID kill, no `rm`, no git configuration change.

Status: done
