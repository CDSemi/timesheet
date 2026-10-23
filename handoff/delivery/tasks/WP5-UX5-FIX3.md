# WP5-UX5-FIX3 dispatch brief (two load-dependent e2e flakes from REGATE2)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX3, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-FIX2-FREEZE (done) and addresses WP5-UX5-REGATE2 (FAIL).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk M, novelty no.
  - You diagnose and fix in one task. Reproduce first.
  - If the cause is still unclear after one evidence-backed attempt, stop and report
    (docs/08 escalation).
  - **If the cause is in the product, not the test, stop and report before editing.**
  - Write the task record in English.
- **Why.** REGATE2, on the local commit 7aafa21, failed only on two non-network
  assertions in its simulated-clock sweep. They are in tests that FIX2 did not touch:
  1. **`tests/e2e/settings-routes.spec.ts:16`**, mobile project. The "Administration"
     heading was not visible within 7 s. This was the full rerun at
     `2026-10-26T16:00:00Z`; the first full run there had failed on network errors only.
  2. **`tests/e2e/controls.spec.ts:640`**, mobile project: "dpr 1.5: the arrow is on the
     screenshot", the T05A chevron pixel test. This was the full run at
     `2026-11-01T08:45:00Z`.

  The informational full rerun at that instant had 0 failed, and the chevron test alone
  passed 3 of 3. Both failures look like host-load flakes. A test that fails under load is
  still a test defect.
- **Read:**
  - `handoff/delivery/tasks/WP5-UX5-REGATE2.md`, Results item 4, and its evidence
    `handoff/delivery/evidence/WP5-UX5-REGATE2/` (`17-sweep-counts.txt` and the sweep
    logs);
  - the two specs, and every helper they use;
  - for the chevron test, `WP5-UX5-T05A.md` (the seam profile method);
  - the simulated-clock preload and wrapper in `handoff/delivery/evidence/WP5-UX-FIX10/`.
    Copy them into your task folder; never add them to the repository.
- **AGENTS.md on disk wins.**
- **Base.** HEAD 7aafa21bc1c6efc70c0fa8691c3a1165841aeb45 (local, not pushed; origin/main
  has moved ahead, and that is expected). Before you edit, record HEAD, `git status
  --short` and `npm run digest`.
  - **Never touch** the uncommitted `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` and
    `.vi.md`. They belong to the owner's other session.
  - **Never touch** `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
  - Do not pull, merge or fetch-merge.

## What to do

1. **Reproduce under load.** For each test, run it repeatedly under the same kind of load
   as the regate's full sweep, at its failing instant, with the FIX10 wrapper. For example:
   - with `--repeat-each` and many workers;
   - alongside the rest of the mobile project;
   - with CDP CPU throttling.

   Record the failure rate before any change. Read the failing traces, or capture your
   own, to see what the test waited for and what the page was doing.
2. **Find the race.** Say what the test assumes is settled that is not settled under load.
   For example, a lazy chunk not yet loaded, a font, layout or theme not yet applied, or a
   screenshot taken before paint. Give file:line.
3. **Fix the tests** so they wait for the real condition. Use an event or state-based wait
   (`expect.poll`, `toBeVisible` on the element the page renders after loading,
   `document.fonts.ready`, a settled-layout check, or a `requestAnimationFrame` pair before
   the screenshot), never a fixed sleep.
   - Do not loosen an assertion (pixel thresholds, expected values, what is checked).
   - A longer locator timeout is allowed only for a step that is legitimately slow under
     load, such as a lazy chunk. Give the measured time under load and the reason.
4. **No product change.** If the heading or the arrow is late or wrong because of the
   product (for example a lazy load that can stall, or a render that depends on timing),
   stop and report with the evidence.

## Proof (in order; the digest is the LAST command)

1. Put Node 24 first on PATH; run `node --version`. Record the base, the status and the
   digest.
2. Reproduce each failure, and record its rate.
3. Fix. Then run `npm run typecheck` and `npm run lint`.
4. **Under the same load as step 2,** each fixed test runs at least 40 times with 0 failed.
   Also run it on the real clock, on both projects.
5. **Mutants:**
   - **the chevron:** in a scratch copy, break the arrow (for example a second gradient
     layer, as T05A's mutant did). Show the fixed test still fails. Show it is restored;
   - **the heading:** in a scratch copy, make the Administration route render no heading.
     Show the fixed test still fails.
6. Run the FULL e2e on both projects on the real clock, alone, after the last change, with
   0 failed. Only a network or buffer error may be rerun, once, as the full run, and both
   runs are recorded.
7. Run `validate_package.py --preflight` and `git diff --check`.
8. Run `npm run verify` in the repository (the owner's worktree stays present), with
   `SMOKE_PORT` in 50060-50079.
9. `npm run digest` LAST.

## Owned paths

- `tests/e2e/settings-routes.spec.ts` and `tests/e2e/controls.spec.ts`.
- `tests/e2e/fixtures.ts` and `tests/e2e/contrast.ts`, only if a shared wait helper belongs
  there. List the change.
- this brief's Results section, which you keep short.
- `handoff/delivery/evidence/WP5-UX5-FIX3/` (masked LF `.txt`).
- **No `src/` change.** A product cause is a stop.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX3`. Ports 50060-50079. Mutants and probes
  run in a scratch copy in the task folder, never in the repository.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- Never touch `%LOCALAPPDATA%\timesheet-dev`. Do not stage, unstage or commit anything.
- Before returning, make sure none of your background commands is still running.
- If a permission check denies a call, stop and report.
- Finish Results with "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

Self-reported model: claude-sonnet-5-5. Base 7aafa21 (local); evidence in `evidence/WP5-UX5-FIX3/` (`15-counts.txt` has all counts).

1. **Heading flake (test race).** The trace of the REGATE2 failure shows the Email field filled while the Administration screen was
   still shown: after a Sign out click the signed-in screen stays until the sign-out answer arrives, and `AdminUsers.tsx:82` has its own
   Email field. The login form then mounted with an empty email and no `POST /api/auth/login` was sent. Product behaviour is correct.
   Fix: `tests/e2e/fixtures.ts` `signInPageAs` waits for the "Sign in" button before filling (3 lines). Before: 2 of 40 failed (mobile,
   2026-10-26T16:00Z, 14 workers). After: 80 of 80 passed under the same load.
2. **Chevron flake (test race).** The first select is below sections that show "Loading…" until their own request answers; the swap moves
   the select by 0.53px while the test measures and screenshots. Probe before the fix: 10 of 200 samples moved, all with a placeholder
   still shown, 1 had no arrow. Fix: `controls.spec.ts` `settledSelect` waits for no placeholder and 6 still animation frames
   (`SETTLED_SCRIPT`, no sleep, no looser assertion). Probe after: 0 of 300 moved. Original: 4 of 80 failed once (2026-11-01T08:45Z),
   0 of 80 on three re-runs; the natural rate depends on host load. After the fix: 80 of 80 under a 32-thread CPU burner.
3. Mutants (fixed tests still fail): invisible arrow (one layer, transparent) fails "the arrow is on the screenshot"; second gradient
   layer fails "exactly one layer"; Administration `h1` replaced by `div` fails the heading check. The scratch build was restored
   (sha-256 equal, see `20-` and `21-`).
4. Real clock, both projects, the two tests: 3 of 3 each. FULL e2e, real clock, alone: desktop 459 ok / 0 failed, mobile 404 ok / 0 failed
   (863 passed, 17.4 min). `npm run typecheck`, `npm run lint`, `git diff --check`, `npm run verify` (SMOKE_PORT 50061): exit 0.
5. **`validate_package.py --preflight` fails in the repository** on another session's untracked file
   (`INGAT_MANIFEST_DESIGN_REVIEW.md`: a directory link `evidence/INGAT-MANIFEST-DESIGN/` fails the `is_file()` link check). HEAD plus my
   three test files passes in the scratch export (`40-preflight-export.txt`). Not touched.

Files changed: `tests/e2e/controls.spec.ts`, `tests/e2e/fixtures.ts`. No `src/` change.

Status: done
