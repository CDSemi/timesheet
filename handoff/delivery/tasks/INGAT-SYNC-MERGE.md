# INGAT-SYNC-MERGE dispatch brief (step 3: the approved merge commit, pushed as a fast-forward)

- **Task.** Side track "Ingat deployability", synchronization step 3, task
  INGAT-SYNC-MERGE, kind commit (merge), attempt 1. It depends on INGAT-SYNC-GATE (PASS
  required; the coordinator fills in "Gate at dispatch"). Not on `ORCHESTRATION.json`: do
  not stage or edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-committer (effort medium), requested model sonnet, no
  override. Routing: size S, risk M (joins two coordinators' lines), novelty no.
- **Authority.**
  - docs/08 "Commits and pushes" (commit to `main` and push after every commit before the
    first release; only `timesheet-committer`; never rebase, reset, force, amend or
    rewrite history). A merge commit is not on the docs/08 "Never" list; the committer
    profile forbids a merge only as a reaction to a rejected push, which this is not.
  - The other coordinator's board records an owner decision of 2026-10-23 to use only
    `git merge --ff-only origin/main` ("no merge commit or rebase"). The two lines have
    diverged, so that cannot work. The owner then approved this merge directly in this
    session (2026-10-23, verbatim): "nếu ko có gì xung đột thì merge đi, nếu có xung đột
    thì bạn tự giải quyết nếu đc, nếu ko đc thì chỉ rõ để tôi hiểu mà biết đường quyết định"
    (if nothing conflicts, merge; if something conflicts, resolve it yourself if possible;
    if not, explain it clearly so I can decide). You do NOT resolve conflicts: on any
    conflict you abort and report; the coordinator decides.
  - The other coordinator is paused (owner, 2026-10-23: "Bên kia hiện đang tạm dừng, ko
    chạy gì cả"). The coordinator writes no file while you run.

## Where and what

- Work only in the worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. Run no git command that writes in or against the main
  checkout `D:\Dropbox\Work.CDSemi\timesheet`; read it only with
  `git -C <main> --no-optional-locks rev-parse HEAD` and `[ -e ]` checks of its git dir.
- Expected before: HEAD = `origin/main` (after `git fetch origin`) =
  `db8793967b6967fbe0f62c6e97d9039ffe4f39fe`; `refs/heads/main` = main checkout HEAD =
  `7aafa21bc1c6efc70c0fa8691c3a1165841aeb45`; no `MERGE_HEAD`, `rebase-merge/`,
  `rebase-apply/` or `index.lock` in either git dir. If anything differs, stop and report.
- Nothing is staged (`git diff --cached --name-status` empty). The working tree may hold
  only these unstaged or untracked coordinator records, which the merge does not touch and
  which you must NOT stage: `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` and `.vi.md`
  (modified), `handoff/delivery/tasks/INGAT-SYNC-GATE.md`, this brief,
  `handoff/delivery/evidence/INGAT-SYNC-RECORD/`, `handoff/delivery/evidence/INGAT-SYNC-GATE/`
  (untracked). Any other change stops the task.

## Steps

1. `git merge-tree --write-tree HEAD refs/heads/main`: exit 0 and the tree id equals T
   under "Gate at dispatch". Otherwise stop.
2. `git merge --no-ff --no-commit refs/heads/main`. If git reports any conflict or refuses
   because of a local change: `git merge --abort`, confirm HEAD and the working tree are as
   before, stop and report the exact message and paths. Do not resolve anything.
3. With the merge result staged: `git diff --cached --name-only` equals the paths of
   `70dce2a..7aafa21` (compare with `git diff --name-only 70dce2a 7aafa21`, saved to files);
   none of the coordinator records listed above is staged; `node scripts/precommit-check.mjs`
   (Node 24) exit 0; `git diff --cached --check` exit 0. A failure: `git merge --abort`,
   stop, report. (A `profile-path` finding in an evidence log of the other side is NOT
   masked here: abort and report it.)
4. Write the message file `handoff/delivery/evidence/INGAT-SYNC-MERGE/commit-message.txt`
   (below) and `git commit -F` it. After: `git rev-parse HEAD^{tree}` = T;
   `git rev-parse HEAD^1` = `db87939…`; `git rev-parse HEAD^2` = `7aafa21…`.
5. Push: `git push --dry-run origin HEAD:refs/heads/main`, then `git push origin
   HEAD:refs/heads/main` (a fast-forward of `origin/main`; never force). Network or
   authentication failure: retry after 5 s and 30 s, then record a push blocker (the merge
   commit stays local; report it). After: `git fetch origin`; `git rev-parse origin/main` =
   the merge commit; `git ls-remote origin refs/heads/main` the same.
6. Do not push the worktree branch; do not move local `refs/heads/main` (the other
   coordinator fast-forwards it in step 4 of the plan).

## Commit message

```
Merge local main (WP5-UX5-FIX2, 7aafa21) into main

Join the main checkout's unpushed commit 7aafa21 with origin/main
(db87939). The two lines diverged from 70dce2a and share no path; the
merged tree was gated before this commit (INGAT-SYNC-GATE). Both audited
histories are kept; the owner approved this merge on 2026-10-23.

Task: INGAT-SYNC-MERGE
Gate: INGAT-SYNC-GATE PASS
Audit: none (a merge of two separately accepted lines)
Digest: tree <T>
```

Replace `<T>` with the gated tree id. Add the attribution exactly as the client
instructs.

## Evidence

`handoff/delivery/evidence/INGAT-SYNC-MERGE/checks.txt`: every command above with its exit
and output (masked: `<user>` for the account name in any path). This folder is not staged
in this commit.

## Runtime

- Use Git Bash only. Task folder `D:\.claude-tmp\timesheet\INGAT-SYNC-MERGE`. Node 24 first on
  PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE
  REDIRECTS (`/dev/null`, `nul`, ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO
  INTERACTIVE SHELLS.**
- Never: `--amend`, `--force`/`-f`/`--force-with-lease`, `--no-verify`, reset, rebase,
  cherry-pick, stash, clean, tag, branch deletion, history rewrite, `commit -a`,
  `add -A`, git config changes; never ask for credentials in chat. `git merge --abort` is
  the only allowed undo.
- **If a permission check denies any call, stop at once and report the denial reason
  exactly. Do not retry it in another form.**

Report in English: pre/post HEAD, merge commit SHA, its parents and tree, pushed,
`origin/main` after push, staged path count, check exits, blockers. Return at most 120
words, beginning 'Self-reported model: ...'.

## Gate at dispatch

- INGAT-SYNC-GATE attempt 1: Decision PASS (self-reported claude-sonnet-5-5). **T =
  `5da1839bdbf9ca84cb004590ed69bc474e32f6f2`.** HEAD = `origin/main` = `db87939` and
  `refs/heads/main` = `7aafa21` first and last; `git merge-tree` exit 0, no conflict; path
  lists match (213 and 306 paths); in the export of T under Node 24.21.0: `npm ci`,
  typecheck, lint, `npm test` (2374/2374), `npm run verify` (smoke passed), pinned
  `ingat validate` and actionlint all exit 0, no deprecation text. Results:
  `handoff/delivery/tasks/INGAT-SYNC-GATE.md`.
- Since that gate, only coordinator files under `handoff/` changed (this brief and the
  checkpoint pair).

## Addendum 1 (coordinator, 2026-10-23): attempt 2 without the worktree index

- **Attempt 1 result.** All preconditions held and `git merge-tree` gave T. `git merge
  --no-ff --no-commit refs/heads/main` then failed with `fatal: unable to write
  .git/worktrees/relaxed-lalande-8359f0/index` (exit 128): git had already written the
  merged files into the working tree (15 tracked files modified, the new WP5-UX5 files
  untracked) but could not replace the index (most likely a file lock from Dropbox or
  another process). No `MERGE_HEAD`; HEAD still `db87939`; nothing staged, committed or
  pushed. A retry was refused ("local changes would be overwritten"). Nothing was cleaned
  or reset.
- **Attempt 2 (same task, fresh committer).** Build the merge commit from the gated tree
  without the worktree's index, and do not touch the working tree:
  1. Preconditions as in "Where and what" (HEAD = `origin/main` = `db87939`,
     `refs/heads/main` = main checkout HEAD = `7aafa21`, no merge/rebase/lock state in
     either git dir); `git merge-tree --write-tree HEAD refs/heads/main` = T.
  2. A temporary index in the task folder (outside Dropbox):
     `export GIT_INDEX_FILE="$(cygpath -w <task>/merge.index)"` for these commands only;
     `git read-tree 5da1839bdbf9ca84cb004590ed69bc474e32f6f2`; then
     `git diff --cached --name-only db87939` equals the `70dce2a..7aafa21` path list;
     `git diff --cached --check db87939` exit 0; `node scripts/precommit-check.mjs` exit 0
     (it reads the staged set through the same `GIT_INDEX_FILE`); `git write-tree` = T.
     Then `unset GIT_INDEX_FILE`. Any failure stops the task.
  3. `git commit-tree 5da1839bdbf9ca84cb004590ed69bc474e32f6f2 -p db8793967b6967fbe0f62c6e97d9039ffe4f39fe
     -p 7aafa21bc1c6efc70c0fa8691c3a1165841aeb45 -F <message file>` (the message below,
     with T filled in, and the attribution) → M. `git cat-file -p M` shows tree T and the
     two parents in that order. The repository has no active git hook (only `.sample`
     files), so no hook is skipped.
  4. **Record commit R on top of M**, with a second temporary index
     (`<task>/record.index`): `git read-tree M`; `git add --` these paths only (literal,
     from the working tree): `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`,
     `handoff/delivery/INGAT_T0_T8_CHECKPOINT.vi.md`,
     `handoff/delivery/tasks/INGAT-SYNC-GATE.md`, `handoff/delivery/tasks/INGAT-SYNC-MERGE.md`
     (this brief, as it stands), and the folders `handoff/delivery/evidence/INGAT-SYNC-RECORD/`,
     `handoff/delivery/evidence/INGAT-SYNC-GATE/`, `handoff/delivery/evidence/INGAT-SYNC-MERGE/`
     (as they stand at this step). Then `git diff --cached --name-only M` lists only those
     paths; `git diff --cached --check M` exit 0; `node scripts/precommit-check.mjs` exit 0;
     `git write-tree` → R's tree; `git commit-tree <tree> -p M -F <record message file>` →
     R. Record message:
     ```
     docs(handoff): record the synchronization merge

     Record the gate of the merged tree (INGAT-SYNC-GATE) and the merge task,
     whose first attempt could not write the worktree index and whose second
     attempt built the merge from the gated tree with commit-tree.

     Task: INGAT-SYNC-GATE, INGAT-SYNC-MERGE
     Gate: INGAT-SYNC-GATE PASS
     Audit: none (records only)
     Digest: tree 5da1839bdbf9ca84cb004590ed69bc474e32f6f2 (merge)
     ```
     plus the attribution.
  5. Push R (which carries M): `git push --dry-run origin R:refs/heads/main`, then
     `git push origin R:refs/heads/main` (a fast-forward from `db87939`; never force).
     After: `git fetch origin`; `origin/main` = R; `git ls-remote origin refs/heads/main` =
     R; `git merge-base --is-ancestor 7aafa21 R` exit 0.
  6. Leave the worktree as it is: do not move `refs/heads/claude/relaxed-lalande-8359f0`,
     do not touch the real index, do not restore or delete any working-tree file. Record
     `git status --short` (counts only) at the end.
- Everything else in this brief (authority, forbidden actions, runtime, report) applies.
  `git commit-tree`, `git read-tree` and `git write-tree` with a temporary
  `GIT_INDEX_FILE` are allowed for this attempt only; they create objects and change no
  ref except through the push.
