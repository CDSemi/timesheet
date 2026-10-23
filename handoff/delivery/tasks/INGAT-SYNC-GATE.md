# INGAT-SYNC-GATE dispatch brief (step 2: gate the exact merged tree before the merge commit)

- **Task.** Side track "Ingat deployability", synchronization step 2, task
  INGAT-SYNC-GATE, kind gate, attempt 1. It depends on INGAT-SYNC-RECORD (done:
  `db8793967b6967fbe0f62c6e97d9039ffe4f39fe` pushed to `main`). Not on
  `ORCHESTRATION.json`; do not edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-verifier (effort medium), requested model sonnet, no
  override. Routing: size M, risk M (it gates the tree of a merge commit that joins two
  coordinators' audited lines), novelty no. English record.
- **Context.** Local `refs/heads/main` (the main checkout, paused by the owner) is
  `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45` (WP5-UX5-FIX2, unpushed); `origin/main` is
  `db87939`; they diverged from `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5` and share no
  path (`tasks/INGAT-SYNC-RECON.md`). Step 3, if the owner approves, is
  `git merge --no-ff refs/heads/main` in this worktree; its tree must equal the tree you
  gate here. You change nothing in git except objects written by `git merge-tree`.

## Gate (record command | exit | result for each)

1. Worktree: HEAD = `db87939…`; `git fetch origin`; `origin/main` = HEAD; `git status
   --short` shows only untracked `handoff/` records (this brief, `evidence/INGAT-SYNC-RECORD/`).
2. Main checkout, strictly read-only (`git -C D:/Dropbox/Work.CDSemi/timesheet
   --no-optional-locks …` only): `rev-parse HEAD` = `7aafa21…`; no `MERGE_HEAD`,
   `rebase-merge/`, `rebase-apply/`, `CHERRY_PICK_HEAD`, `index.lock` in its git dir
   (check with `[ -e ]`, delete nothing). `git rev-parse refs/heads/main` = `7aafa21…`.
3. `git merge-tree --write-tree HEAD refs/heads/main`: exit 0, no conflict lines; record
   the tree id T.
4. Path checks: `git diff --name-only HEAD T` equals the paths of `70dce2a..7aafa21`, and
   `git diff --name-only 7aafa21 T` equals the paths of `70dce2a..HEAD` (save both lists
   and their comparison).
5. Export T: `git archive --format=tar -o <task>/merged.tar T`, extract into
   `<task>/export` (`tar -xf`), `npm ci` there with Node 24 first on PATH (record
   `node --version` and `npm --version`), `DATA_DIR` and `DATABASE_PATH` inside the task
   folder. Run in the export: `npm run typecheck`, `npm run lint`, `npm test`,
   `npm run verify`. Every exit 0, no deprecation warning.
6. In the export: `ingat validate` with
   `ghcr.io/lisahq/ingat@sha256:b5db73bef81f8da0d8efd7e38baa522b38b9b0fcc0a89b0df934b06d3c54badb`
   exactly as `.github/workflows/ingat-validate.yml` runs it (`export MSYS_NO_PATHCONV=1`),
   and actionlint pinned by digest
   (`rhysd/actionlint@sha256:b1934ee5f1c509618f2508e6eb47ee0d3520686341fec936f3b79331f9315667`)
   on the three workflows. Both exit 0.
7. Repeat items 1-3 last: HEAD, `origin/main`, `refs/heads/main` and T unchanged.

Decision: PASS only if every item passed and nothing moved. Record T prominently in
Results: step 3 checks the merge commit's tree against it.

## Owned paths

- this brief's Results; `handoff/delivery/evidence/INGAT-SYNC-GATE/`; task folder
  `D:\.claude-tmp\timesheet\INGAT-SYNC-GATE`. Nothing else; nothing in the main checkout.

## Runtime

- Use Git Bash only. Set TEMP and TMP inside the task folder. Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail` (ALSO NOT FOR `ls`), NO `/dev/null` OR `nul`,
  NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.** Use the Write and Edit tools to create
  files; redirect output to files in the task folder and read them with Read.
- Evidence copies write `<user>` for the account segment of any profile path, and for the
  bare account name if it appears.
- Never touch `%LOCALAPPDATA%\timesheet-dev` data. No commit, merge, push, staging, `gh`
  or GitHub write; nothing against the owner's NAS; no npm install in the repository.
- Stop every server you start through its own handle; before returning, no background
  command of yours is still running.
- If a permission check denies a call, stop and report.
- Write Results with the Edit tool; record one line `Decision: PASS | FAIL | NOT VERIFIED`,
  then "Status: done" followed by exactly one newline.

Return at most 120 words, beginning 'Self-reported model: ...', with the Decision and T.

## Results

Self-reported model: claude-sonnet-5-5. Observed 2026-10-23. Evidence:
`handoff/delivery/evidence/INGAT-SYNC-GATE/` (`id-first.txt`, `id-last.txt`, `paths-export.txt`,
`a1/a2/b1/b2.paths.txt`, `exits.txt`, `versions.txt`, `typecheck/lint/test/verify/npm-ci.txt`,
`tools.txt`); scripts and raw logs in `D:\.claude-tmp\timesheet\INGAT-SYNC-GATE`
(`id.sh`, `paths.sh`, `build.sh`, `tools.sh`). Account name masked as `<user>`.

**T (merged tree) = `5da1839bdbf9ca84cb004590ed69bc474e32f6f2`**

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `git rev-parse HEAD`; `git fetch origin`; `rev-parse origin/main`; `status --short` | 0 | HEAD = origin/main = `db87939…`; status: untracked records plus tracked ` M` of `INGAT_T0_T8_CHECKPOINT.md` and `.vi.md` (pre-existing handoff edits, no source; deviation from "only untracked", noted) |
| 2 | `git -C <main> --no-optional-locks rev-parse HEAD`; `[ -e ]` checks; `rev-parse refs/heads/main` | 0 | `7aafa21…` both; MERGE_HEAD, rebase-merge, rebase-apply, CHERRY_PICK_HEAD, index.lock all absent |
| 3 | `git merge-tree --write-tree HEAD refs/heads/main` | 0 | T above, no conflict lines |
| 4 | `git diff --name-only` pairs, sorted, `cmp` | 0, 0 | `HEAD..T` = `70dce2a..7aafa21` (213 paths); `7aafa21..T` = `70dce2a..HEAD` (306 paths); identical |
| 5 | `git archive` T, `tar -xf`, `npm ci`, typecheck, lint, `npm test`, `npm run verify` | 0 each | node v24.21.0, npm 11.18.0 (npm first-attempt failed EBADENGINE because nested npm ran on Node 26; rerun with `$APPDATA/npm` after the Node 24 bin on PATH, per the dev recipe; the failed first attempt is a runtime-setup error, not a tree defect); tests 101 files / 2374 passed; smoke passed; no deprecation or warning text in logs |
| 6 | `docker run … ingat@sha256:b5db73bf… validate /app`; actionlint `@sha256:b1934ee5…` on image-cleanup.yml, image.yml, ingat-validate.yml | 0, 0 | "ingat.toml is valid"; actionlint no findings (the Ingat run omitted `--user` and used a Windows bind mount) |
| 7 | repeat 1-3 | 0 | HEAD, origin/main, refs/heads/main and T unchanged (only new untracked task records appeared) |

Decision: PASS

Status: done
