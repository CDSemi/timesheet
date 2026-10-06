# WP4-FIXB4-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIXB4-FREEZE; package WP4; kind
  commit; attempt 1; depends on WP4-DEPCLEAN2, which depends on WP4-FIXB4.
- This commit freezes WP4 fix round 4. WP4-REGATE4, WP4-RECHECK-B4 and WP4-RECHECK-A
  attempt 4 review it. It also carries the round-3 regate and recheck records.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (parser, upload ceiling, dependency move), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  972ccda6409a7521a008c55c35a5b5cf416daf1e. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form.
  - Never feed anything to python or node through stdin.
  - Call Node 24 by full path; make the first shell call a trivial `node --version`.
  - Use `D:\.claude-tmp\timesheet\WP4-FIXB4-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed paths may only be these.

From WP4-FIXB4:
- `src/server/import/xlsxReader.ts`, `src/server/app.ts` and
  `src/server/routes/imports.ts`;
- `src/server/import/templateMapping.ts` and `src/server/services/workbookImport.ts`,
  only if changed (report which);
- `src/client/importModel.ts`, plus `src/client/ImportScreen.tsx` and
  `src/client/components/ImportPreview.tsx` if changed;
- `tests/integration/workbook-reader.test.ts`, `workbook-import.test.ts`,
  `tests/client/importModel.test.ts` and `tests/e2e/import.spec.ts`;
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`, and
  `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`, plus `docs/03_ARCHITECTURE_AND_DATA.md`
  and `.vi.md` if changed.

From WP4-DEPCLEAN2:
- `package.json` and `package-lock.json`. The only change is `fflate` 0.8.3 moving to
  `devDependencies`; no package is added, removed or re-versioned.

Any other changed or untracked path outside handoff/ stops the commit.

Also confirm, with `git diff --name-only`:
- nothing changed under `.claude/`, `reference/`, the migrations, AGENTS.md or
  CLAUDE.md;
- no `.xlsx` or `.map` file is untracked or staged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (775 files).

## Handoff files to stage

New files:
- `handoff/delivery/WP4_RECHECK_A3.md`, `WP4_RECHECK_A3.vi.md`, `WP4_RECHECK_B3.md` and
  `WP4_RECHECK_B3.vi.md`;
- `handoff/delivery/tasks/WP4-FIXB4.md`, `WP4-DEPCLEAN2.md`, `WP4-REGATE4.md` and
  `WP4-RECHECK-B4.md`;
- this brief, as it stands before you append results;
- every file in these folders under `handoff/delivery/evidence/`: `WP4-REGATE3/`,
  `WP4-RECHECK-A3/`, `WP4-RECHECK-B3/`, `WP4-FIXB4/`, `WP4-DEPCLEAN2/` and
  `WP4-FIXB3-FREEZE/`.

Modified files:
- `handoff/delivery/tasks/WP4-REGATE3.md`, `WP4-RECHECK-A.md`, `WP4-RECHECK-B3.md` and
  `WP4-FIXB3-FREEZE.md`;
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP4-FIXB4-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.md` or binary file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-FIXB4-FREEZE/checks.txt`.
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths, as its own command and with no redirect.
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. `check_recovery.py`.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

Allowed fixes:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  `evidence/`, remove exactly that line and re-stage it.
- If the precommit check blocks an email address or the Windows user name in an evidence
  log, replace it with `<email>` or `<user>` in that file only, then re-stage and rerun.

When to stop:
- A block in a source, test, docs or package file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Derive the workbook parse bound and set realistic upload ceilings

- fix(import) (WP4-RB3-01):
  - Inflate uses one native zlib call per part into one buffer (251 ms → 16 ms on
    8 MiB of incompressible data).
  - Large parts are decoded in steps.
  - The cost bound is derived from the enforced limits: t ≤ 40 ms + 14.8 ns·X +
    339 ns·O and m ≤ 15 MiB + 13.3 B·X + 428 B·O.
  - The new ceilings are a 2 MiB upload, 1 MiB per part, 3 MiB per package and 100k
    openings, giving about 121 ms and +95 MiB.
  - The measured worst case is 114 ms and +72 MiB.
- build(deps): fflate 0.8.3 moves to devDependencies, because only tests use it now.
- test(import): 5 tests written red-first; tests sized at the limits are re-sized; the
  ceilings are pinned.
- docs(ops): docs/07 and docs/11 (+ vi) state the bound and the ceilings.
- docs(handoff):
  - WP4-REGATE3 PASS, WP4-RECHECK-A attempt 3 PASS, WP4-RECHECK-B3 FIX REQUIRED;
  - the round-4 records and briefs;
  - board and checkpoint (+ vi).

Task: WP4-FIXB4-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Attempt 2 (coordinator note)

Attempt 1 stopped correctly. The validator failed on WP4-RECHECK-A because the
coordinator had moved that task to attempt 4 but left its status as `done`. The status is
now `pending`; the board has no other change.

For attempt 2:
1. Confirm HEAD and origin/main are still 972ccda.
2. Recompute the digest; it is unchanged, 26fcc969….
3. Re-stage these three files by explicit path, in one `git add`:
   - `handoff/delivery/ORCHESTRATION.json`;
   - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md`;
   - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.vi.md`.

   Re-stage this brief too, before you append results.
4. Rerun checks 4 to 9, one command each, then commit and push.

## Results

(Committer appends here.)

- Outcome: STOPPED, no commit, no push. Pre-HEAD = origin/main = 972ccda (unchanged).
- Digest 26fcc969...d9081 (775 files) matched; 215 paths staged; branch main, no merge/rebase.
- Scope: only listed paths; templateMapping, workbookImport, ImportScreen, ImportPreview, docs/03 did not change; package.json only the fflate move; no .xlsx/.map.
- Exit codes: version 0, digest 0, add 0, precommit 0, diff --check 0, JSON 0, validate_orchestration 1.
- Blocker: validate_orchestration.py: "Gate/audit lacks digest/execution evidence: WP4-RECHECK-A" (board entry needs source_digest/evidence). Not an allowed fix. Index left staged.
