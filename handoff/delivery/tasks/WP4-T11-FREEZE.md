# WP4-T11-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T11-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T11.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (many client files and four screenshots), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  aff904a89c6a85b3963616eddf676cef0979370b. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Use Git Bash only. Never use `cmd.exe` in any form, or any interactive shell.
  - Call Node 24 by its full portable path, and make the first shell call a trivial
    `node --version`. Stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T11-FREEZE` for TEMP/TMP and raw output.
  - Never kill processes by PID, and never redirect to /dev/null or nul.
  - Delete only files you created; never remove folders recursively.
  - Write your results into this brief with the Edit tool.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be the following.

New files:
- `src/client/ImportScreen.tsx` and `src/client/importModel.ts`;
- `src/client/components/ImportPreview.tsx`, `ImportDecisions.tsx`, `ImportCommit.tsx`,
  `ImportStatus.tsx`, `OpeningBalanceForm.tsx` and `OpeningBalancePanel.tsx`;
- `tests/client/importModel.test.ts` and `tests/e2e/import.spec.ts`.

Modified client files:
- `src/client/App.tsx`, `src/client/api.ts`, `src/client/styles.css`,
  `src/client/TimesheetScreen.tsx` and `src/client/ReviewScreen.tsx`;
- `src/client/components/AppShell.tsx`, `PeriodHeader.tsx`, `BatchBar.tsx`,
  `TimesheetGrid.tsx` and `DayList.tsx`;
- `src/client/OtScreen.tsx`, `src/client/SharingOt.tsx` and `src/client/otModel.ts`, or
  their current locations under `src/client/` (report the real paths).

Modified server file: `src/server/services/timesheets.ts`.

Modified tests:
- `tests/integration/edit-rules.test.ts` and `tests/integration/workbook-import.test.ts`;
- `tests/client/dayModel.test.ts`;
- `tests/e2e/shell.spec.ts` and `tests/e2e/admin.spec.ts`.

A listed path that is unchanged is fine; report it. Any changed or untracked path
outside handoff/ that is not listed stops the commit. A file under `src/client/` that
is not listed counts too; report it instead of staging it.

Also confirm with `git diff --name-only`, without printing file bodies:
- nothing changed under `.claude/`, docs/, `reference/` or the migrations;
- `package.json` and `package-lock.json` are unchanged;
- no `.xlsx` file is untracked or staged.

Recompute the digest with Node 24 (`node scripts/source-digest.mjs`) immediately before
`git add`. It must equal
70561b0d855fe98e8eb76003075b97e09b908b62213618165a0585d6aedac38a (772 files).

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T12.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T11/`, including the four
    `*-synthetic.png` screenshots;
  - every file under `handoff/delivery/evidence/WP4-T10-FREEZE/`.
- Modified:
  - `handoff/delivery/tasks/WP4-T11.md` (its results);
  - `handoff/delivery/tasks/WP4-T10-FREEZE.md` (its results);
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`.

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T11-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`;
- a `.png` that is not one of the four named screenshots.

## Checks before committing

Run one command per step, and record each exit code. Save the masked output of every
step in `handoff/delivery/evidence/WP4-T11-FREEZE/checks.txt`.
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
- A block in a source or test file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Do not print diffs or file bodies. Keep evidence LF and `.txt` (screenshots excepted).

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the import and opening-balance screens and the imported-period read-only status

- feat(client): the import screen at `#/import` lets the signed-in person import their
  own data.
  - Flow: upload, preview with source cells and flags, one decision per conflicting day
    (skip by default), commit after confirmation.
  - A repeated import shows "Already imported", and every error code has a message.
- feat(client): imported periods show "Imported, unverified". Sign-off, batch editing,
  selection and edits are disabled.
- feat(client): the opening-balance form has a confirmation step and a reasoned
  correction. The OT views label opening balances.
- feat(server): the timesheet read JSON exposes `imported_unverified`.
- fix(client): `.shell-nav` wraps, so the six-link administrator nav fits on phones.
- test: 33 model tests red first; a read-model test; e2e import flows on desktop and
  mobile, with four synthetic screenshots.
- docs(handoff): WP4-T11 records, the WP4-T12 brief, the WP4-T10 freeze result, board
  and checkpoint (+ vi).

Task: WP4-T11-FREEZE

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

Committer results (attempt 1, Sonnet 5.5):
- Pre-HEAD aff904a89c6a85b3963616eddf676cef0979370b; post-HEAD/commit 61bf524a53368ac1373ec9fe41f6cc550dc6c68b.
- Pushed: yes; remote main = 61bf524a53368ac1373ec9fe41f6cc550dc6c68b.
- Digest 70561b0d855fe98e8eb76003075b97e09b908b62213618165a0585d6aedac38a (772 files); 53 files staged.
- Scope: working tree equaled the expected set; no extras. Real paths: src/client/OtScreen.tsx, src/client/components/SharingOt.tsx, src/client/components/otModel.ts. No change under .claude/, docs/, reference/, migrations, package files; no .xlsx.
- Checks: node v24.21.0, digest, add, precommit, diff --check, JSON parse, validate_orchestration, check_recovery, validate_package --preflight: all rc=0. Details in evidence/WP4-T11-FREEZE/checks.txt.
- Blockers: none. Note: the brief and its commit-time state were staged before this append.
