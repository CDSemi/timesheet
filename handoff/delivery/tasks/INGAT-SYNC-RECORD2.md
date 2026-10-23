# INGAT-SYNC-RECORD2 dispatch brief (the last record commit of this side, built with a temporary index)

- **Task.** Side track "Ingat deployability", synchronization, task INGAT-SYNC-RECORD2,
  kind commit, attempt 1. It depends on INGAT-SYNC-MERGE (done: M `b8bae50`, R `377554e`
  pushed) and INGAT-SYNC-CHECK (PASS). Not on `ORCHESTRATION.json`: do not stage or edit
  the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-committer (effort medium), requested model sonnet, no
  override. Routing: size S, risk L (records only).
- **Authority.** docs/08 "Commits and pushes" (commit to `main` and push after every
  commit before the first release; a checkpoint commit before a planned stop), the owner's
  direct confirmation that the `handoff/delivery/**/INGAT*` records may be committed and
  pushed to `main` ("Tôi xác nhận: phiên này được commit T0/T8 (9 tệp và hồ sơ
  handoff/delivery/**/INGAT*) rồi push lên main của CDSemi/timesheet. …"), and the owner's
  request of 2026-10-23 to synchronize and push everything before work continues. The
  other coordinator is paused. The coordinator writes no file while you run.

## Why a temporary index

This worktree's branch and index are stale on purpose: HEAD `db8793967b6967fbe0f62c6e97d9039ffe4f39fe`,
and the working tree still holds the unstaged files of the failed first merge attempt
(they equal the content of R). Its real index could not be written then. So, exactly as
in `handoff/delivery/tasks/INGAT-SYNC-MERGE.md` Addendum 1 step 4: build the commit from R
with a temporary index in the task folder, push it, and leave the worktree's real index,
branch ref and working tree untouched.

## Steps

1. `git fetch origin`; `origin/main` = `377554e024db1669e47fd19eeadaf9dccc672b3e` (R). If it
   moved, stop and report.
2. `git diff --name-only 377554e` (working tree against R, ignoring the stale index):
   the result must be exactly these paths, all under `handoff/delivery/`:
   `INGAT_T0_T8_CHECKPOINT.md`, `INGAT_T0_T8_CHECKPOINT.vi.md` (modified), and, as
   untracked files, `tasks/INGAT-SYNC-CHECK.md`, this brief `tasks/INGAT-SYNC-RECORD2.md`
   and the files under `evidence/INGAT-SYNC-CHECK/` (check untracked ones with
   `git ls-files --others --exclude-standard -- handoff/delivery`, which must list only
   those plus your own `evidence/INGAT-SYNC-RECORD2/`). Any other difference stops the task.
3. `export GIT_INDEX_FILE="$(cygpath -w <task>/record2.index)"`; `git read-tree 377554e`;
   `git add --` the listed paths (literal; the evidence folder as its directory path);
   `git diff --cached --name-only 377554e` lists only them; `git diff --cached --check
   377554e` exit 0; `node scripts/precommit-check.mjs` (Node 24) exit 0; `git write-tree` →
   tree; `unset GIT_INDEX_FILE`.
4. `git commit-tree <tree> -p 377554e024db1669e47fd19eeadaf9dccc672b3e -F <message file>` →
   R2 (message below plus the attribution). `git cat-file -p R2`: one parent, R.
5. `git push --dry-run origin R2:refs/heads/main`, then `git push origin
   R2:refs/heads/main` (fast-forward; never force; retry after 5 s and 30 s on a network
   error). After: `git fetch origin`; `origin/main` = `git ls-remote origin
   refs/heads/main` = R2.
6. Leave the worktree as it is. Record `git status --short` counts at the end.

## Commit message

```
docs(handoff): record the check of the synchronized main

Record the independent read-only check after the synchronization merge:
origin/main carries the merge b8bae50 (tree 5da1839, parents db87939 and
7aafa21) and the record commit 377554e; the main checkout can now
fast-forward. Update the track checkpoint with the last step for the
main checkout's coordinator.

Task: INGAT-SYNC-CHECK
Gate: INGAT-SYNC-CHECK PASS
Audit: none (records only)
Digest: tree 5da1839bdbf9ca84cb004590ed69bc474e32f6f2 (merge)
```

## Evidence

`handoff/delivery/evidence/INGAT-SYNC-RECORD2/checks.txt` (masked: `<user>` for the account
name). Not staged.

## Runtime

- Use Git Bash only. Task folder `D:\.claude-tmp\timesheet\INGAT-SYNC-RECORD2`. Node 24 first
  on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE
  REDIRECTS, NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
- Never: reset, rebase, merge, cherry-pick, stash, clean, restore, file deletion, amend,
  force, tag, branch moves, config changes; no git write in or against the main checkout.
  `git read-tree`, `git write-tree` and `git commit-tree` with the temporary
  `GIT_INDEX_FILE` are allowed for this task.
- **If a permission check denies any call, stop at once and report the reason exactly.**

Report in English: R2 SHA, its tree and parent, push result, `origin/main`, staged path
count, check exits, blockers. Return at most 100 words, beginning 'Self-reported model: ...'.

## Addendum 1 (coordinator, 2026-10-23): attempt 2 after the e-mail stop

- Attempt 1 stopped at the precommit check (exit 1): four "email address" findings in
  `evidence/INGAT-SYNC-CHECK/02-M.txt` and `03-R.txt` (the `author`/`committer` lines of
  `git cat-file -p`). Nothing committed or pushed; only a temporary index in the task
  folder was written.
- Task INGAT-SYNC-MASK replaced those lines in the two files with one line each saying
  they are omitted; nothing else in them changed.
- Attempt 2: the expected path set gains exactly one new file,
  `handoff/delivery/tasks/INGAT-SYNC-MASK.md`. Start again from step 1 with a fresh
  temporary index (`<task>/record2b.index`), re-add every listed path (the two masked
  files are inside `evidence/INGAT-SYNC-CHECK/`), and rerun every check. Any new finding
  stops the task again.

## Addendum 2 (coordinator, 2026-10-23): attempt 3, fresh committer

- Attempt 2 passed every check (19 paths, `git diff --cached --check` exit 0, precommit
  PASS, tree `6ac74e7c48751539d5514687f883f6964af19131`) and was then refused by the
  client's permission check at the `git commit-tree` and push call, reason "[PII Data
  Handling]". Nothing was created or pushed. That agent is not resumed.
- The owner then confirmed directly in this session (2026-10-23, verbatim): "Tôi xác nhận
  cho commit và push các tệp hồ sơ handoff/delivery/**/INGAT-SYNC* và cặp
  INGAT_T0_T8_CHECKPOINT lên main; các dòng email đã được che." (I confirm the commit and
  push of the record files handoff/delivery/**/INGAT-SYNC* and the INGAT_T0_T8_CHECKPOINT
  pair to main; the e-mail lines have been masked.) Every path of this commit is one of
  those.
- Attempt 3: start again from step 1 with a fresh temporary index
  (`<task>/record2c.index`), the same expected path set as Addendum 1 (this brief and the
  checkpoint pair now carry this addendum), every check rerun, then `commit-tree` on
  `377554e` and the fast-forward push. Do not print file contents into your messages;
  report paths, counts, exits and SHAs only.
