# WP4-FIX-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-FIX-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-FIXA. WP4-FIXA itself depends on WP4-FIXB.
- This is the freeze of the WP4 fix round. WP4-REGATE and the two rechecks review this
  commit. It also commits the first gate and audit records.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size L, risk M (many paths, including the image build and canonical docs), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  13a258db86b2f0b6388830e584e2cca5303f1f6c. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Never feed scripts to python or node through stdin.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-FIX-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be the following.

From WP4-FIXB:
- `src/server/import/xlsxReader.ts` and `src/server/import/templateMapping.ts`;
- `src/server/services/workbookImport.ts` and `src/server/services/otLeave.ts`;
- `src/client/api.ts` and `src/client/importModel.ts`;
- `tests/integration/workbook-reader.test.ts`, `workbook-import.test.ts`,
  `ot-leave.test.ts` and `opening-balance.test.ts`;
- `tests/client/importModel.test.ts`.

From WP4-FIXA:
- `Dockerfile`, `.env.example` and `vite.config.ts`;
- `scripts/container-drill.mjs` and `scripts/smoke-built-server.mjs`;
- `src/server/ops/prune.ts`, `src/server/services/bootstrap.ts` and `src/server/app.ts`;
- `tests/integration/backup-prune.test.ts` and `tests/integration/static-assets.test.ts`
  (new);
- `docs/03_ARCHITECTURE_AND_DATA.md`, `docs/07_DEPLOYMENT_AND_OPERATIONS.md`,
  `docs/10_DECISIONS_AND_SOURCES.md` and `docs/11_OPERATIONS_RUNBOOK.md`, each with its
  `.vi.md` pair.

A listed path that is unchanged is fine; report it. Any changed or untracked path
outside handoff/ that is not listed stops the commit.

Also confirm, with `git diff --name-only` and without printing file bodies:
- nothing changed under `.claude/`, `reference/` or the migrations, or in AGENTS.md or
  CLAUDE.md;
- `package.json` and `package-lock.json` are unchanged;
- no `.xlsx` or `.map` file is untracked or staged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
dfe4541d2c6c908a00782ed9fbe2fb7a3be48ea18aa9fc23ae1ced9085b86742 (775 files).

## Handoff files to stage

New:
- `handoff/delivery/WP4_REVIEW_A.md`, `WP4_REVIEW_A.vi.md`, `WP4_REVIEW_B.md` and
  `WP4_REVIEW_B.vi.md`;
- `handoff/delivery/tasks/WP4-FIXB.md`, `WP4-FIXA.md`, `WP4-REGATE.md`,
  `WP4-RECHECK-A.md` and `WP4-RECHECK-B.md`;
- this brief, as it stands before you append results;
- every file under `handoff/delivery/evidence/` in these folders: `WP4-GATE/`,
  `WP4-AUDIT-A/`, `WP4-AUDIT-B/`, `WP4-FIXB/`, `WP4-FIXA/` and `WP4-T13-FREEZE/`.

Modified:
- `handoff/delivery/tasks/WP4-GATE.md`, `WP4-AUDIT-A.md`, `WP4-AUDIT-B.md` and
  `WP4-T13-FREEZE.md` (their results);
- `handoff/delivery/ORCHESTRATION.json`;
- the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in `handoff/delivery/evidence/WP4-FIX-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv`, `.map` or database file;
- any `.md` file under `evidence/`;
- any binary under `evidence/`.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-FIX-FREEZE/checks.txt`.
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
- A block in a source, test, script, docs or root file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix the WP4 audit findings: workbook parse limits, holiday overflow, no image source maps

- fix(import): the reader refuses a package with 422 before parsing if it exceeds any
  limit:
  - 4 MiB of XML per part, or 16 MiB per package;
  - the element count;
  - 50k cells, 20k rows, or 50k shared strings.

  Stored findings keep 20 sources plus a count (WP4-B-01). The holiday rows are read
  without an unbounded spread (WP4-B-02).
- fix(import): a not-yet-due period is skip-only (`not_due`). An OT leave reservation
  inside an imported period answers 409.
- fix(ops):
  - The image ships no source maps, and `/assets/*.map` answers 404 (WP4-A-01).
  - Prune refuses candidates dated after the clock.
  - The smoke test uses its own DATA_DIR (WP4-A-04).
  - The drill proves a two-job bulk release.
- docs: the `.env.example` JOB_RUNNER rule (WP4-A-02) and the runbook accuracy fixes
  (WP4-A-03). docs/03, docs/07 and docs/10 (+ vi) cover the account-list wording, the
  reader limits and the not_due default.
- docs(handoff): the WP4-GATE PASS, the WP4 area A and B reviews (FIX REQUIRED), the fix
  records, the regate and recheck briefs, the board and the checkpoint (+ vi).

Task: WP4-FIX-FREEZE

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
