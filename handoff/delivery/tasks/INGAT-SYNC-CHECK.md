# INGAT-SYNC-CHECK dispatch brief (independent read-only check of origin/main after the merge)

- **Task.** Side track "Ingat deployability", synchronization check, task INGAT-SYNC-CHECK,
  kind gate (observation), attempt 1. It depends on INGAT-SYNC-MERGE attempt 2 (reported:
  merge M `b8bae505cdd546b29c48389219dd263fd670662b`, record commit R
  `377554e024db1669e47fd19eeadaf9dccc672b3e`, pushed; `origin/main` = R). Not on
  `ORCHESTRATION.json`.
- **Profile and routing.** timesheet-light (effort low), requested model haiku (docs/08:
  "haiku only for pure listing/probes"); routing S/L/no. English record.

## Checks (run from the worktree `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`; record command | exit | output)

1. `git fetch origin`; `git rev-parse origin/main`; `git ls-remote origin refs/heads/main`.
   Both must be R.
2. `git cat-file -p b8bae505cdd546b29c48389219dd263fd670662b`: tree
   `5da1839bdbf9ca84cb004590ed69bc474e32f6f2`; parents
   `db8793967b6967fbe0f62c6e97d9039ffe4f39fe` then
   `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45`.
3. `git cat-file -p 377554e024db1669e47fd19eeadaf9dccc672b3e`: one parent, M.
4. `git diff --name-only b8bae50 377554e`: only paths under `handoff/delivery/` — expected
   the checkpoint pair, `tasks/INGAT-SYNC-GATE.md`, `tasks/INGAT-SYNC-MERGE.md`, and files
   under `evidence/INGAT-SYNC-RECORD/`, `evidence/INGAT-SYNC-GATE/`,
   `evidence/INGAT-SYNC-MERGE/`. List them and count them. Anything else is a FAIL.
5. `git merge-base --is-ancestor 7aafa21 origin/main` and
   `git merge-base --is-ancestor db87939 origin/main`: both exit 0.
6. `git diff --stat 7aafa21 origin/main -- src tests scripts .github package.json package-lock.json tsconfig.json tsconfig.test.json ingat.toml Dockerfile compose.example.yaml`:
   record it (these are this side's changes the main checkout will receive on its
   fast-forward).
7. Main checkout, strictly read-only (`git -C D:/Dropbox/Work.CDSemi/timesheet
   --no-optional-locks rev-parse HEAD`): still `7aafa21`.

Decision: PASS if 1-5 and 7 hold. Write Results below with one line
`Decision: PASS | FAIL | NOT VERIFIED`, then "Status: done" and exactly one newline.
Evidence (masked, `<user>` for the account name): `handoff/delivery/evidence/INGAT-SYNC-CHECK/`.

## Runtime

Git Bash only. **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`,
NO `/dev/null` OR `nul`, NO INTERACTIVE SHELLS.** Use the Write and Edit tools to create
files; redirect output to files in `D:\.claude-tmp\timesheet\INGAT-SYNC-CHECK` and read them.
No commit, merge, push, staging, restore, reset or deletion; nothing written in the main
checkout; no GitHub write; no `gh`. If a permission check denies a call, stop and report.

Return at most 100 words, beginning 'Self-reported model: ...', with the Decision.

## Results

Attempt 1 (agent: claude-haiku-5-5), read-only, all seven checks run from the worktree.

1. `git fetch origin` exit 0; `git rev-parse origin/main` = `377554e024db1669e47fd19eeadaf9dccc672b3e`; `git ls-remote origin refs/heads/main` = `377554e024db1669e47fd19eeadaf9dccc672b3e	refs/heads/main`. Equal to R: pass.
2. `git cat-file -p b8bae505cdd546b29c48389219dd263fd670662b`: tree `5da1839bdbf9ca84cb004590ed69bc474e32f6f2`; parents `db8793967b6967fbe0f62c6e97d9039ffe4f39fe` then `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45`. Pass.
3. `git cat-file -p 377554e024db1669e47fd19eeadaf9dccc672b3e`: tree `3a23e77fff34fbeec1af60db8856b0a54ed65d92`, one parent `b8bae505cdd546b29c48389219dd263fd670662b` (M). Pass.
4. `git diff --name-only b8bae505... 377554e...` (with `--no-renames` for the count): 24 paths, all under `handoff/delivery/`: the checkpoint pair `INGAT_T0_T8_CHECKPOINT.md` and `.vi.md`; `tasks/INGAT-SYNC-GATE.md`; `tasks/INGAT-SYNC-MERGE.md`; 15 files under `evidence/INGAT-SYNC-GATE/`; 3 under `evidence/INGAT-SYNC-MERGE/`; 2 under `evidence/INGAT-SYNC-RECORD/`. No other path. Pass. Full list: `handoff/delivery/evidence/INGAT-SYNC-CHECK/changed-paths-M-to-R.txt`.
5. `git merge-base --is-ancestor 7aafa21 origin/main` exit 0; `git merge-base --is-ancestor db87939 origin/main` exit 0. Pass.
6. `git diff --stat 7aafa21 origin/main -- <listed paths>`: 7 files changed, 1306 insertions(+), 2 deletions(-) (`.github/workflows/image-cleanup.yml`, `scripts/ghcr-cleanup.ts`, `tests/integration/fixtures/ghcr-cleanup/tags.txt`, `.../versions.json`, `tests/integration/ghcr-cleanup.test.ts`, `tsconfig.json`, `tsconfig.test.json`). Recorded.
7. `git -C D:/Dropbox/Work.CDSemi/timesheet --no-optional-locks rev-parse HEAD` = `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45`. Pass.

Evidence: `handoff/delivery/evidence/INGAT-SYNC-CHECK/` (raw outputs 01 to 09 and the changed-path list). No commit, merge, push, staging, restore, reset, deletion, gh, or main-checkout write.

Decision: PASS
Status: done
