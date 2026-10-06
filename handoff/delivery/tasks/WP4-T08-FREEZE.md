# WP4-T08-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-T08-FREEZE; package WP4; kind commit;
  attempt 1; depends on WP4-T08.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (new runtime dependencies, lock file, untrusted-input source), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes", and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  e1d97bd298949020d2c7aadb9733a1a8acc98ebb. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path; plain `node` resolves v26 here.
  - Make the first shell call a trivial `node --version`, and stop on ENOSPC.
  - Use `D:\.claude-tmp\timesheet\WP4-T08-FREEZE` for TEMP/TMP and raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell, and never kill processes by PID.
  - Never redirect to /dev/null or nul, including `> /dev/null` after `git add`.
- The coordinator writes no file while you run.

## Expected working-tree set

Outside handoff/, the changed or new paths may only be these:
- `package.json` (dependencies only) and `package-lock.json`;
- `src/server/import/xlsxReader.ts` and `src/server/import/templateMapping.ts` (new);
- `tests/support/syntheticWorkbook.ts` and `tests/integration/workbook-reader.test.ts`
  (new).

Also confirm the following, using the Grep tool or `git diff --name-only` and printing
no file bodies:
- `reference/inputs/` is unchanged;
- no `.xlsx` file is staged;
- the `package.json` diff touches only `dependencies`.

Nothing may change under `.claude/` or docs/.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add`. It
must equal 6fcd692dc7e9aa2bdcec5042a1190ddb3ceaa023ae61da76650a2bf157231f1f.

Handoff files to stage:
- New:
  - `handoff/delivery/tasks/WP4-T08.md`;
  - this brief, as it stands before you append results;
  - every file under `handoff/delivery/evidence/WP4-T07-FREEZE/` and `WP4-T08/`.
- Modified:
  - `handoff/delivery/ORCHESTRATION.json`;
  - the checkpoint pair;
  - `handoff/delivery/tasks/WP4-T07-FREEZE.md` (its results).

Your appended results and your evidence in `handoff/delivery/evidence/WP4-T08-FREEZE/`
stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw`, `.xlsx`, `.pdf`, `.eml`, `.csv` or database file;
- any `.md` file under `evidence/`;
- `mail-capture` or `private-data` content.

## Checks before committing

Run one command per step with Node 24 (by full path), and record each exit code:
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
- A block in a source, test or lock file stops the commit.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Never write into the repository root. Do not print diffs or file bodies. Keep evidence
LF and `.txt` only.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add a safe workbook reader, template mapping v1 and a synthetic workbook generator

- feat(import): xlsxReader enforces package, entry, per-entry, total, sheet and cell
  limits on real inflated output.
  - It checks CRC-32 and declared sizes.
  - It rejects DOCTYPE/ENTITY and macro content, and lists external links without
    opening them.
  - It never evaluates formulas, labels cached values as not authoritative, and keeps
    cell-level provenance.
- feat(import): template mapping v1 builds a preview model only. It detects the README
  defects (8.5-hour formula, X24 omitting Sunday, TODAY() in W26), floating holidays,
  unknown labels, duplicate dates and non-date sheet names.
- build(deps): fflate 0.8.3 and fast-xml-parser 5.11.2 (exact); no deprecation warnings.
- test(import): an in-memory synthetic workbook generator clones the template at ZIP
  level, and the tracked template hash stays unchanged. Includes zip-bomb, entity and
  macro tests and six mutation checks.
- docs(handoff): WP4-T07 freeze result, WP4-T08 records, board and checkpoint (+ vi).

Task: WP4-T08-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest and staged count;
- the scope checks (`reference/inputs`, `.xlsx`, `package.json`);
- check exit codes;
- any blockers.

Write evidence to `handoff/delivery/evidence/WP4-T08-FREEZE/` as `.txt` files only.
Return at most 150 words.

## Attempt 2 (coordinator note)

Attempt 1 stopped correctly on a blank line at EOF in
`src/server/import/xlsxReader.ts`. The WP4-T08 worker (attempt 2) removed exactly that
line; no other content changed. The new digest is
**d70a03c27dac714707b86d74c5fe28c2973622ea17ab979f563cd5cf9d86ad0b** and replaces the
value above.

For attempt 2:
1. Confirm that HEAD and origin/main are still e1d97bd.
2. Recompute the digest. It must equal d70a03c2….
3. Re-stage by explicit path, in its own `git add` command, every path that changed
   since attempt 1:
   - `src/server/import/xlsxReader.ts`;
   - the brief `handoff/delivery/tasks/WP4-T08.md`;
   - the two new evidence files `10-verify-attempt2.txt` and `11-digest-attempt2.txt`;
   - `handoff/delivery/ORCHESTRATION.json`;
   - the checkpoint pair;
   - this brief.
4. Rerun every check, one command each.

## Results

(Committer appends here.)

### Committer attempt 1 result

- STOPPED, no commit. Pre-HEAD e1d97bd (= origin/main). Digest matched, 23 staged, scope checks OK, precommit rc=0.
- git diff --cached --check rc=2: src/server/import/xlsxReader.ts:553 blank line at EOF (source file; not an allowed fix). Files remain staged.

### Committer attempt 2 result

- Pre-HEAD e1d97bd, post-HEAD dd1422f (commit dd1422fbd8de53791e6fa9d6b8d8741f1f484488), pushed to origin main, remote SHA identical.
- Digest d70a03c2... match; 25 staged; scope checks OK; all checks rc=0. No blockers.
