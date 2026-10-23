# INGAT-GC-FIX1 dispatch brief (a test that reaches the "never delete every version" abort)

- **Task.** Follow-up GHCR cleanup, task INGAT-GC-FIX1, kind fix, attempt 1. It answers the
  gate INGAT-GC-GATE attempt 1 (FAIL, item 6; `addresses_gate` INGAT-GC-GATE). It fixes the
  snapshot of INGAT-GC-IMPL (`evidence/INGAT-GC-IMPL/snapshot-sha256.txt`, digest
  `1d004a9aafc7d424253b4b1c8faa38f2937d3f9d36b2427c24c93e223607dfa0`). Worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`. Not on
  `ORCHESTRATION.json`; do not edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-worker (effort medium), requested model sonnet, no
  override. Routing: size S, risk M (a test for a safety check), novelty no. docs/08 row
  "Accepted finding naming file/fix/tests". Write the task record in English.

## The finding (gate item 6)

Removing the abort `if (deleted >= decisions.length) throw new Error('internal error: every
version would be deleted');` (`scripts/ghcr-cleanup.ts:139`) leaves all 26 tests passing
(`handoff/delivery/evidence/INGAT-GC-GATE/mutation-*.txt`). Through `selectVersions` the
line is unreachable, because the `keepNewest >= 10` floor always keeps the newest version;
it is defence in depth, so it needs a test that reaches it directly.

## Scope

1. Reproduce first: on a copy in the task folder, remove line 139 and show the suite still
   passes.
2. Add one test (or a few) to `tests/integration/ghcr-cleanup.test.ts` that reach the
   abort through the function that holds it, with a crafted decision list in which every
   version is marked for deletion, and that expect the exact error. If the function that
   holds the check is not exported, export it with the smallest change in
   `scripts/ghcr-cleanup.ts` (an `export` keyword, no behaviour change) and say so. Also
   cover the neighbouring check at line 136 (a version that must not be deleted is marked
   for deletion) in the same way if no test reaches it directly today; reproduce that
   mutation first too.
3. No other change: the rules, floors, workflow and docs stay byte-identical.

## Owned paths

- `tests/integration/ghcr-cleanup.test.ts`; `scripts/ghcr-cleanup.ts` (only an `export`
  keyword if needed);
- this brief's Results; `handoff/delivery/evidence/INGAT-GC-FIX1/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-GC-FIX1`.

## Checks (in order)

1. Before any edit: HEAD, `git status --short`, `sha256sum -c` of
   `handoff/delivery/evidence/INGAT-GC-IMPL/snapshot-sha256.txt` (all OK), and the digest.
   Copy the two owned files to the task folder before editing.
2. The reproduction(s) of scope item 1 and 2.
3. Edits.
4. In a clean export (`git archive HEAD`, the 15 snapshot files with your changes copied
   in, `npm ci` with Node 24 first on PATH, `DATA_DIR` and `DATABASE_PATH` in the task
   folder): the cleanup test, `npm run typecheck`, `npm run lint`, `npm test`,
   `npm run verify`; all exit 0, no deprecation warning.
5. Mutation proof on the export: each of the six mutations of the gate (release rule,
   untagged rule, non-SHA-tag rule, future-date check, floors, the line-139 abort) and the
   line-136 check now makes at least one test fail.
6. A diff of `scripts/ghcr-cleanup.ts` against your pre-edit copy shows at most the added
   `export` keyword(s).
7. `git diff --check`; the precommit gate on a scratch repository holding the two files.
8. **LAST:** `node scripts/source-digest.mjs`, then the new snapshot list
   `handoff/delivery/evidence/INGAT-GC-FIX1/snapshot-sha256.txt` (all 15 paths of the IMPL
   list, sorted, same format). No edit after this.

## Runtime

- Use Git Bash only. Set TEMP and TMP inside the task folder. Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail` (ALSO NOT FOR `ls`), NO `/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul` (ALSO NOT IN `2>` REDIRECTS), NO
  `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools to create files; never write a file through the shell.
  - Use Glob to list files; redirect output to files in the task folder and read them
    with Read.
- Never touch `%LOCALAPPDATA%\timesheet-dev` data. No GitHub call, no `gh`, nothing
  against the owner's NAS. Never install npm packages in the repository. Do not stage,
  commit or push.
- Stop every server you start through its own handle; before returning, no background
  command of yours is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step; end the file with exactly one
  newline after "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...'.

## Results

Evidence: `handoff/delivery/evidence/INGAT-GC-FIX1/`. Task folder `D:\.claude-tmp\timesheet\INGAT-GC-FIX1`.

1. Identity: HEAD `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`; IMPL `snapshot-sha256.txt` 15 of 15 OK
   (`identity.txt`). Two owned files copied to `pre/` before editing.
2. Reproduction (clean export, Node 24.21.0, pristine script): line 139 abort removed -> exit 0, all
   tests pass; line 136 check removed -> exit 0 as well (`repro-*.txt`). No test reached either.
3. Edits: `export` keyword added to `assertSafe` in `scripts/ghcr-cleanup.ts` (no behaviour change);
   3 new tests in `tests/integration/ghcr-cleanup.test.ts` reaching `assertSafe` with crafted decision
   lists (all versions deleted; a safe list; each protection rule on its own).
4. Clean export, `npm ci` (Node 24): cleanup test 29 passed, typecheck, lint, `npm test` (2374 passed),
   `npm run verify` all exit 0; no deprecation warning (`check-*.txt`, `checks-summary.txt`).
5. Mutation proof, all seven now fail tests: release 5, untagged 4, non-SHA tag 4, future date 1,
   floors 3, line-139 abort 1, line-136 check 1 (`mutation-*.txt`); script restored (`restored-sha.txt`).
6. `script-vs-pre.diff`: only the `export` keyword on line 129.
7. `git diff --check` exit 0; precommit gate on a scratch repository with both files: PASS, 0 findings.
8. `node scripts/source-digest.mjs`: `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56`
   (882 files, handoff/ excluded). New snapshot list `snapshot-sha256.txt` written last.

Status: done
