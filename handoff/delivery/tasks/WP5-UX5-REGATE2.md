# WP5-UX5-REGATE2 dispatch brief (regate after the tests-only WP5-UX5-FIX2)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-REGATE2, package WP5, kind
  gate, attempt 1. It depends on WP5-UX5-FIX2-FREEZE.
- **Scope.** WP5-UX5-REGATE on 2bce0ab / 70975091 failed on one non-network assertion,
  `theme.spec.ts:605` mobile, in the simulated-clock sweep.
  - WP5-UX5-DIAG1 classified it as a test defect.
  - WP5-UX5-FIX2 changed only e2e tests.
  - This regate confirms that nothing else changed. It then reruns what a tests-only change
    can affect.
- **Records:** `handoff/delivery/tasks/WP5-UX5-REGATE.md`, `WP5-UX5-DIAG1.md` and
  `WP5-UX5-FIX2.md`, with their evidence. The last accepted snapshot is still BASE_SHA =
  8e557100d16b6b6eb86a48e00276835761aabfdf.
- **Target.** Written under "Target at dispatch" below. Compute the digest in three forms,
  before and after.
- **Profile and routing.** timesheet-verifier, requested sonnet/medium, no override.
  Routing: size M, risk M, novelty no. Write the records in English.
- **AGENTS.md on disk wins.**

## Owner decisions that shape this regate (2026-10-22, "A.a, B.A, C.b")

- **A a.** The FIX2 freeze fast-forwarded local main to origin/main 70dce2a, then
  committed FIX2 on top. The two commits in between are owner work outside rounds 4 and 5:
  - 6173f07, the Ingat manifest and the GHCR image workflow: `ingat.toml`,
    `.github/workflows/image.yml` and `ingat-validate.yml`, docs 07 and 11 (+vi), ADR 0002
    (+vi), INGAT records;
  - 70dce2a, handoff only.

  Check them only for non-interference:
  - they change no file under `src/`, `tests/`, `scripts/`, `assets/` or the package
    files;
  - they do not change `dist/`;
  - build, tests and the docs pairs (preflight) still pass.

  Do not review their content.
- **B a.** `tests/client/wordmarkAsset.test.ts` skips `.claude/` in its font walk, so a
  repository-level `npm run verify` passes with the owner's ignored worktree
  `.claude/worktrees/relaxed-lalande-8359f0` present. Never touch that worktree.
- **C b.** No push to origin. The target is a **local commit** one ahead of origin/main
  70dce2a. Work from it, not from origin.

## Gate items

1. **Identity and scope.**
   - The digest in three forms, before and after.
   - `git diff --stat 2bce0ab..TARGET` outside `handoff/` lists:
     - FIX2's test paths (`tests/e2e/theme.spec.ts`, `tests/e2e/shell.spec.ts`,
       `tests/client/wordmarkAsset.test.ts`, and any other path FIX2 recorded);
     - the Ingat paths of 6173f07.

     Map each path to one of them, and flag any other path.
   - Clean builds of 2bce0ab and the target: **all of `dist/`** (server, domain and client)
     must be byte-identical. If so, these REGATE items carry forward:
     - identity against e2bf1aa;
     - the drill (209/0);
     - the integration files;
     - axe;
     - the CSP;
     - the build sizes.

     Say so explicitly. If any `dist/` file differs, stop and report FAIL with the list.
2. **Core:**
   - `npm ci`;
   - `npm run lint`;
   - `npm run verify`, in the export and once in the repository itself. The repository
     run proves B a with the worktree present;
   - `npm test` once. A vitest worker crash is a FAIL;
   - the validators, including check_recovery (106).
3. **The real-clock FULL e2e** on both projects, alone, with per-project counts. It must
   have 0 failed.
4. **The simulated-clock sweep, all seven runs, as in REGATE:**
   - FULL at `2026-10-26T16:00:00Z`, `2026-11-01T08:45:00Z` and `2027-03-14T10:30:00Z`;
   - the seven specs at `2026-10-27T06:58:30Z`, `2026-12-31T23:30:00-08:00` and
     `2027-01-01T08:30:00Z`.

   Validate the preload with one control first. Every run ends with 0 failed. A run that
   fails only with a network or buffer error is rerun once, as the full run or the same
   spec set, and both runs are recorded. Any other failure is reported as is.
5. **Stress the fixed race.** Use the FIX10 wrapper at `2026-11-01T08:45:00Z`.
   - **The targeted repeat:** the bar-size, phone-bar and first-screen tests (`--grep`
     as FIX2 recorded), `--repeat-each=40 --workers=14`, 0 failed.
   - **The two whole specs** (`theme.spec.ts`, `shell.spec.ts`): `--repeat-each=20
     --workers=4`, 0 failed. FIX2 saw host overload (timeouts, buffer errors) with 14
     workers on the whole specs. A run whose failures are all network or buffer errors is
     rerun once, and both runs are recorded.
6. **Test strength.** Read FIX2's diff against DIAG1:
   - the assertions are not weaker;
   - the poll still fails when the property never matches;
   - there is no fixed sleep.

   Run FIX2's deterministic test once on each project.

**Decision:** PASS, FAIL or NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-REGATE2`. Set TEMP and TMP to it. Ports
  50020-50059, with `SMOKE_PORT` in that range.
- Run each Playwright run with its own output folder, one after another.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only. **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS
  (NOT EVEN TO WRITE A FILE), NO `node -e`, NO `node -` OR `python -`. NEVER PIPE INTO
  `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul`, ALSO NOT IN `2>`. NO `rm -r`, NO PID KILLS, NO INTERACTIVE
  SHELLS.** Write scripts with the Write tool and run them by path.
- Put Node 24 first on PATH; the first shell call is `node --version`. Run Python only as
  the workflow Python
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Create files only inside the task folder and the evidence folder.
- Use synthetic data and local mail capture only. Never edit source, docs, tests, the board
  or STATE.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle if you have one, and rerun once. Never kill by PID.
- Leave nothing running. Before returning, make sure none of your background commands is
  still running.
- If a permission check denies a call, stop and report.
- Name no evidence file with "signature" in its basename unless it also contains
  "synthetic"; the precommit check refuses such names.

## Output

- **Results** go in this file, kept concise: the decision, and every item with its
  commands, exit codes and counts.
- **Evidence** goes in `handoff/delivery/evidence/WP5-UX5-REGATE2/` as masked LF `.txt`.
- **Return** at most 150 words, beginning with 'Self-reported model: ...'.

## Target at dispatch

(written by the coordinator before dispatch)

## Results
