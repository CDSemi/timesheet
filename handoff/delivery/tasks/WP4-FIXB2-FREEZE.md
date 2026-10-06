# WP4-FIXB2-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIXB2-FREEZE; package WP4; kind
  commit; attempt 1; depends on WP4-DEPCLEAN, which depends on WP4-FIXB2.
- This freezes WP4 fix round 2. WP4-REGATE2, WP4-RECHECK-B2 and WP4-RECHECK-A attempt 2
  review this commit. The commit also carries the round-1 regate and recheck records.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (a security-relevant parser and a lock change), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  0f7fba2ee6bc2a7affcd1a3bf800e085351c7b65. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Never feed scripts to python or node through stdin.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-FIXB2-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed paths may only be these.

From WP4-FIXB2:
- `src/server/import/xlsxReader.ts` and `src/server/import/templateMapping.ts`;
- `src/server/services/workbookImport.ts`;
- `tests/integration/workbook-reader.test.ts` and `workbook-import.test.ts`;
- `docs/07_DEPLOYMENT_AND_OPERATIONS.md` and `.vi.md`.

From WP4-DEPCLEAN:
- `package.json` and `package-lock.json`. The only change is the removal of
  `fast-xml-parser` and its seven transitive packages.

A listed path that is unchanged is fine; report it. Any changed or untracked path
outside handoff/ that is not listed stops the commit.

Also confirm, with `git diff --name-only`:
- nothing changed under `.claude/`, `reference/`, the migrations, AGENTS.md or
  CLAUDE.md;
- no `.xlsx` or `.map` file is untracked or staged;
- the `package.json` diff removes only the `fast-xml-parser` line.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
96445de4ad266f0fa70f78c0c72b03625775d170e8841c757c39b2b5cae7d503 (775 files).

## Handoff files to stage

- New:
  - `handoff/delivery/WP4_RECHECK_A.md`, `WP4_RECHECK_A.vi.md`, `WP4_RECHECK_B.md` and
    `WP4_RECHECK_B.vi.md`;
  - `handoff/delivery/tasks/WP4-FIXB2.md`, `WP4-DEPCLEAN.md`, `WP4-REGATE2.md` and
    `WP4-RECHECK-B2.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/` in `WP4-REGATE/`, `WP4-RECHECK-A/`,
    `WP4-RECHECK-B/`, `WP4-FIXB2/`, `WP4-DEPCLEAN/` and `WP4-FIX-FREEZE/`.
- Modified:
  - `handoff/delivery/tasks/WP4-REGATE.md`, `WP4-RECHECK-A.md`, `WP4-RECHECK-B.md` and
    `WP4-FIX-FREEZE.md`;
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in
`handoff/delivery/evidence/WP4-FIXB2-FREEZE/` stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.md` or binary file under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-FIXB2-FREEZE/checks.txt`.
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

Subject: Bound workbook parsing with a streaming scanner and remove fast-xml-parser

- fix(import) (WP4-RB-01, WP4-B-01): a bounded streaming scanner replaces
  fast-xml-parser.
  - It counts every `<`: 100k per part and 200k per package.
  - It bounds attributes: 64 per element, 200k per part and 500k per package.
  - Tag length is capped at 64 KiB, and non-XML names are refused.
  - Kept text is cut at 200 characters with a `truncated` flag, the report is capped at
    2 MiB, and a report failure answers 422, never 500.
  - The proven budget is at most 500 ms and +150 MiB per preview.
- test(import): 15 red-first tests and a 35-shape adversarial sweep; ten mutations are
  killed.
- build(deps): remove the unused fast-xml-parser and its seven transitive packages. No
  other dependency changes.
- docs(ops): the docs/07 workbook limits (+ vi).
- docs(handoff): the WP4-REGATE PASS, WP4-RECHECK-A PASS (attempt 1), WP4-RECHECK-B FIX
  REQUIRED, the round-2 fix records, the regate and recheck briefs, the board and the
  checkpoint (+ vi).

Task: WP4-FIXB2-FREEZE

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
