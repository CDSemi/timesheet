# INGAT-T0T8-RECORD dispatch brief (handoff-only record commit after the first CI runs)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-RECORD, kind commit,
  attempt 1. It depends on INGAT-T0T8-COMMIT (done, `6173f07`) and INGAT-T0T8-CI (done,
  PASS). Not on `ORCHESTRATION.json`: do not stage or edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-committer (effort medium), requested model sonnet, no
  override. Routing: size S, risk L (records only, under `handoff/`).
- **Authority.**
  - docs/08 "Commits and pushes": before the first release, commit to `main` and push
    after every commit, only through `timesheet-committer`; "a checkpoint commit before a
    planned stop when state is uncommitted".
  - The owner's direct confirmation in this session (2026-10-22, verbatim): "Tôi xác
    nhận: phiên này được commit T0/T8 (9 tệp và hồ sơ handoff/delivery/**/INGAT*) rồi
    push lên main của CDSemi/timesheet. Đây là repo công khai, và lần push này sẽ chạy
    workflow đẩy image lên GHCR." Every path of this commit matches
    `handoff/delivery/**/INGAT*`.
  - Every path you may stage is listed here as dispatched. The coordinator writes no file
    while you run.

## Where and how

- Work only in the worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. **Run no git command in, or against, the main checkout
  `D:\Dropbox\Work.CDSemi\timesheet`.**
- Expected worktree HEAD: `6173f07777d3a972db77208390df86a5f7de1a11`. After
  `git fetch origin`, `origin/main` must equal it; if it moved, stop and report (no merge,
  no rebase).
- Commit on the worktree branch; push only `HEAD:refs/heads/main` as a fast-forward
  (`git push --dry-run origin HEAD:refs/heads/main`, then the push). Do not push the
  worktree branch; do not move local `refs/heads/main`; change no git config or GitHub
  setting. Non-fast-forward or protection rejection: stop. Network or authentication
  failure: retry after 5 s and 30 s, then record a push blocker.

## Index state at dispatch

Nothing is staged. Check with `git diff --cached --name-status`; if anything is staged,
stop and report.

## Expected path set (all under handoff/; nothing outside handoff/ may change)

- Modified (3): `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`,
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.vi.md`,
  `handoff/delivery/tasks/INGAT-T0T8-COMMIT.md` (its Results).
- New: `handoff/delivery/tasks/INGAT-T0T8-CI.md`, this brief
  (`handoff/delivery/tasks/INGAT-T0T8-RECORD.md`, as it stands before you append
  results), and the evidence folders `handoff/delivery/evidence/INGAT-T0T8-COMMIT/` and
  `handoff/delivery/evidence/INGAT-T0T8-CI/`, each as its directory path.
- Your own evidence folder `handoff/delivery/evidence/INGAT-T0T8-RECORD/` is not staged.
- Any other path stops the commit. Record `node scripts/source-digest.mjs` before and after;
  it must not change (only `handoff/` changes).

## Checks before committing (record each exit in `handoff/delivery/evidence/INGAT-T0T8-RECORD/checks.txt`)

1. `node --version` (Node 24 by full path, as docs/08 says).
2. HEAD, `origin/main` after fetch, branch, no merge or rebase in progress.
3. `git status --porcelain=v1 -uall` equals the expected set plus your own evidence
   folder.
4. Staging with plain `git add -- <paths>` (the two evidence folders as directories); never
   `--pathspec-from-file`, `xargs`, a list file, a glob, `-A`, `.` or `-u`.
5. `node scripts/precommit-check.mjs`. A `profile-path` finding in a staged evidence log may
   be masked (account segment to `<user>`, re-stage, rerun every check). An e-mail address
   or any other finding stops the commit (report file and line, not the value).
6. `git diff --cached --check`.
7. Parse each staged `.json` file (the three under `evidence/INGAT-T0T8-CI/`) with the
   workflow Python and a script file in the task folder.
8. `validate_package.py --preflight` with the workflow Python, from the worktree root.
9. Grep the staged files for secret shapes (`BEGIN .*PRIVATE KEY`, `ghp_`, `github_pat_`,
   `gho_`, `Authorization:`, `Bearer `, a registry token value). A hit stops the commit.
10. Read the staged diff for personal data (for example a person's name or e-mail inside
    the GitHub API responses). A hit stops the commit.

## Commit message (write to `handoff/delivery/evidence/INGAT-T0T8-RECORD/commit-message.txt`, commit with `git commit -F`)

```
docs(handoff): record the INGAT-T0T8 commit and its first CI runs

Record the commit task (6173f07, pushed to main as a fast-forward) and
the first GitHub runs of that commit: ingat-validate and image both
succeeded; the GHCR package is still private (anonymous token 401).
Update the track checkpoint with the owner steps that remain.

Task: INGAT-T0T8-COMMIT, INGAT-T0T8-CI
Gate: INGAT-T0T8-CI PASS
Audit: INGAT-T0T8-RECHECK1 PASS
Digest: 47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033
```

Add the attribution exactly as the client instructs.

## Runtime

- Use Git Bash only. Task folder `D:\.claude-tmp\timesheet\INGAT-T0T8-RECORD`. Node 24 first
  on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero`, `nul`, ALSO NOT IN `2>`), NO `rm -r`, NO PID
  KILLS, NO INTERACTIVE SHELLS.**
- Never: `--amend`, `--force`/`-f`/`--force-with-lease`, `--no-verify`, reset, rebase,
  clean, stash, tag, release creation, branch deletion, history rewrite, `commit -a`, git
  config changes; never ask for credentials in chat.
- **If a permission check denies any call, stop at once and report the denial reason
  exactly. Do not retry it in another form.**
- Write Results with the Edit tool (below), finish with "Status: done".

Report in English: pre/post HEAD, commit SHA, pushed, `origin/main` after push, staged
list, check exits, digests, blockers. Return at most 100 words, beginning 'Self-reported
model: ...'.

## Results

(committer appends here)
