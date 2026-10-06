# WP4-FIXB3-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIXB3-FREEZE; package WP4; kind
  commit; attempt 1; depends on WP4-FIXB3.
- This freezes the WP4 fix round 3. WP4-REGATE3, WP4-RECHECK-B3 and WP4-RECHECK-A
  attempt 3 review this commit. It also carries the round-2 regate and recheck records.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (parser limits), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  cc34e7ff11e6c27f23fd2bf1b86f77159f95eb8d. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, and never feed scripts through
    stdin.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`.
  - Use `D:\.claude-tmp\timesheet\WP4-FIXB3-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
    folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed paths may only be these (from WP4-FIXB3):
- `src/server/import/xlsxReader.ts`, `src/server/import/templateMapping.ts` and
  `src/server/services/workbookImport.ts`;
- `tests/integration/workbook-reader.test.ts` and `workbook-import.test.ts`;
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`;
- `src/client/importModel.ts`, only if it changed (report whether it did).

Any other changed or untracked path outside handoff/ stops the commit. Also confirm, with
`git diff --name-only`:
- `package.json` and `package-lock.json` are unchanged;
- nothing changed under `.claude/`, `reference/` or the migrations;
- no `.xlsx` or `.map` file is untracked or staged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
635f909da72873548d93407fb3d250806a7e1c29f101cb32e91234c2c9ec3f7b (775 files).

## Handoff files to stage

New files:
- `handoff/delivery/WP4_RECHECK_A2.md`, `WP4_RECHECK_A2.vi.md`, `WP4_RECHECK_B2.md` and
  `WP4_RECHECK_B2.vi.md`;
- `handoff/delivery/tasks/WP4-FIXB3.md`, `WP4-REGATE3.md`, `WP4-RECHECK-B3.md` and
  `WP4-ACCREC.md`;
- this brief, as it stands before you append results;
- every file in these folders under `handoff/delivery/evidence/`: `WP4-REGATE2/`,
  `WP4-RECHECK-A2/`, `WP4-RECHECK-B2/`, `WP4-FIXB3/` and `WP4-FIXB2-FREEZE/`.

Modified files:
- `handoff/delivery/tasks/WP4-REGATE2.md`, `WP4-RECHECK-A.md`, `WP4-RECHECK-B2.md` and
  `WP4-FIXB2-FREEZE.md`;
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP4-FIXB3-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.md` or binary file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-FIXB3-FREEZE/checks.txt`.
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
- A block in a source, test or docs file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Hold the workbook parse budget with margin

- fix(import) (WP4-RB2-01): kept values are decoded once as copies, kept attributes are
  capped at 255 characters, `decodeXml` is linear and the package limits are tightened
  (8 MiB of XML, 150k openings). The measured worst case is 289 ms and +89 MiB, about
  60% of the 500 ms and 150 MiB budget.
- fix(import): the floating-holiday flag comes from the matched holiday (R-B2-1), and a
  declared encoding other than UTF-8 or UTF-16 is refused (R-B2-2).
- test(import): 7 tests red first; decode-once and cap mutations are killed; the benign
  differential against WP4-T09 is identical.
- docs(ops): docs/07 (+ vi) states the measured worst case.
- docs(handoff): WP4-REGATE2 PASS, WP4-RECHECK-A attempt 2 PASS, WP4-RECHECK-B2 FIX
  REQUIRED, round-3 records and briefs, board and checkpoint (+ vi).

Task: WP4-FIXB3-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks;
- check exit codes;
- any blockers.

Return at most 150 words, beginning with your self-reported model.

## Results

(Committer appends here.)
