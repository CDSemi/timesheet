# WP5-UX3-REGATE5 dispatch brief (minimal regate)

- Mission/task: timesheet-software-readiness / WP5-UX3-REGATE5; package WP5; kind gate;
  attempt 1; depends on WP5-UX3-FIX6-FREEZE.
- Scope: the package-final gate after the one-line test fix WP5-UX3-FIX6. The coordinator
  decision on the board (2026-10-19, starting "WP5-UX3-REGATE4 FAIL on item 2") sets it.
  - WP5-UX3-REGATE4 on 5c101c1 passed everything except the real-clock full e2e.
  - WP5-UX3-DIAG1 (`handoff/delivery/tasks/WP5-UX3-DIAG1.md`) classified those failures:
    - two were `net::ERR_NO_BUFFER_SPACE` host events, which count under the rerun rule;
    - one was a race in `hover.spec.ts`, now fixed.
  - REGATE3's carried items and REGATE4's passed items (simulated-clock FULL runs, the
    fixed day-editor test and M5b) carry forward if the builds are byte-identical.
- Target: `freeze_commit` = 8e557100d16b6b6eb86a48e00276835761aabfdf (HEAD = origin/main).
  - Digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files).
  - Compute it on a clean `git archive` export with no `.git` folder. Cross-check it with
    `git ls-tree` and `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size S, risk H.
- AGENTS.md on disk at the target wins over any injected copy.

## Gate items

1. **Identity and carry-forward proof.**
   - `git diff --name-only 5c101c1..8e557100` outside `handoff/` is exactly
     `tests/e2e/hover.spec.ts`.
   - Build the target from a clean export. Its `dist/client`, `dist/server` and
     `dist/domain` must be byte-identical to a clean build of 5c101c1 (hash every file).
   - If either check fails: FAIL.
2. **Tests.**
   - `npm ci`, lint and `npm test`, each exit 0, with no deprecation line.
   - One FULL e2e run on both projects on the real clock: 0 failed, with per-project
     counts.
   - Rerun rule, as clarified on the board: a failure whose trace or console shows
     `net::ERR_NO_BUFFER_SPACE` or another network or buffer error counts as a network or
     buffer error even when it surfaces as a timeout. Rerun only that test alone once,
     record both results, and quote the trace line.
   - Any other failure is a FAIL.
3. **The fixed test.** `--grep "keyboard focus ring stays under the pointer"` on the
   desktop project with `--repeat-each=30` and 2 workers. All must pass.
4. **Validators.** `validate_package --preflight`, `validate_orchestration`, and
   `check_recovery` (106 probes). Then the digest before and after.

Decision: PASS / FAIL / NOT VERIFIED. NAS items stay NOT VERIFIED. List the items carried
forward from REGATE3 and REGATE4 by name.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-REGATE5`. Ports 49300-49329.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`, NO PID
  KILLS.**
  - Write scripts with the Write tool and run them by path.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python is
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  Write `<user>` in the evidence.
- Create files only in the task folder and in
  `handoff/delivery/evidence/WP5-UX3-REGATE5/` (masked LF `.txt` only; at least a
  `00-README.txt` and the digest files).
- Never edit source, docs, tests, AGENTS, the board or STATE. Leave nothing running.
- If a permission check denies a call, stop and report.

## Output

- Results go in this file.
- Return at most 120 words, beginning with 'Self-reported model: ...'.

## Results

Self-reported model: claude-sonnet-5-5. Decision: PASS (NAS items NOT VERIFIED). Node v24.21.0, Git Bash. Task folder
`D:\.claude-tmp\timesheet\WP5-UX3-REGATE5`; evidence `handoff/delivery/evidence/WP5-UX3-REGATE5/` (index `00-README.txt`).

- Digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6, 833 files: clean `git archive` export, `git ls-tree` form and
  `npm run digest` equal, and equal again after all checks. HEAD stayed 8e557100; `git status` outside `handoff/` empty.
- Item 1 PASS: `git diff --name-only 5c101c1..8e557100` outside `handoff/` is exactly `tests/e2e/hover.spec.ts` (2 insertions, 1 deletion). Clean builds of
  both commits: 236 dist files each (client, server, domain), 0 hash differences.
- Item 2 PASS: `npm ci`, lint, `npm test` (94 files, 2141 tests) and build exit 0, 0 deprecation lines. One real-clock FULL e2e (21:18 to 21:35 PDT):
  desktop 329 passed, mobile 322 passed, 67 skipped, 0 failed, exit 0, 16.7 min. No `ERR_NO_BUFFER_SPACE` or other buffer line, so no rerun was needed.
- Item 3 PASS: ring test, desktop, `--repeat-each=30`, 2 workers: 60 passed (two matching tests x 30), exit 0.
- Item 4 PASS: `validate_package --preflight`, `validate_orchestration`, `check_recovery` (count 106) exit 0, in the clean export and in the working tree.
- Carried forward from REGATE3 and REGATE4 (source and bundles byte-identical): drill `--wp3`, AC-13 (incl. Asia/Tokyo and America/New_York), compose config,
  `npm audit --omit=dev`, the boundary, the FIX4 behaviours and mutants M1, M4, M5, M6a, M6b, 44px targets, 390x844 budgets, full axe scan, contrast, docs/10
  figure; REGATE4: simulated-clock FULL runs at 2026-11-01T08:45:00Z and 2026-10-26T16:00:00Z (651/0), the fixed day-editor test at three instants, mutant M5b.
- Slips: first npm run used the Program Files shim (Node 26, EBADENGINE), redone with Node 24 and the user-level npm dir first; an `npm exec node` probe
  pulled node@26 into the npx cache; two probe lines piped to `head -0`. No stdin to node or python, no heredoc to them, no rm -r, no PID kill.
  Only shell processes mention the task folder afterwards. Docker, NAS and non-Chromium browsers not run: NOT VERIFIED.
