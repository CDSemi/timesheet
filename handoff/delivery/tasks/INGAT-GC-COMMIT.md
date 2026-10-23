# INGAT-GC-COMMIT dispatch brief (commit the accepted GHCR cleanup and push it to main)

- **Task.** Follow-up GHCR cleanup, task INGAT-GC-COMMIT, kind commit, attempt 1. It depends
  on INGAT-GC-REGATE1 (PASS) and INGAT-GC-AUDIT (PASS). Not on `ORCHESTRATION.json`: do
  not stage or edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-committer (effort medium), requested model sonnet, no
  override. Routing: size M, risk L.
- **Authority.**
  - docs/08 "Commits and pushes": before the first release, commit to `main` and push
    after every commit, only through `timesheet-committer`.
  - The owner asked for this change in this session (verbatim): "Thêm 1 job dọn định kỳ
    xóa các phiên bản cũ, nhưng chỉ xóa các bản ko phải bản release. các bản release nếu
    muốn xóa thì cần phải xóa bằng tay", and answered the commit question directly:
    "yes, lên main" (yes, to main), for when the independent audit passes. It passed
    (INGAT-GC-AUDIT, `handoff/delivery/INGAT_GC_REVIEW.md`).
  - Every path you may stage is listed here as dispatched. The coordinator writes no file
    while you run.

## Where and how (same as INGAT-T0T8-COMMIT)

- Work only in the worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`, branch
  `claude/relaxed-lalande-8359f0`. **Run no git command in, or against, the main checkout
  `D:\Dropbox\Work.CDSemi\timesheet`.**
- Expected HEAD: `70dce2ac5fbb054db6dd4a874b9b8b15f26ddce5`. After `git fetch origin`,
  `origin/main` must equal it; if it moved, stop and report `git log --oneline
  HEAD..origin/main` and `git diff --stat HEAD origin/main` (no merge, no rebase).
- Commit on the worktree branch; push only `HEAD:refs/heads/main` as a fast-forward
  (dry-run first). Do not push the worktree branch; do not move local `refs/heads/main`;
  change no git config or GitHub setting. Non-fast-forward or protection rejection: stop.
  Network or authentication failure: retry after 5 s and 30 s, then record a push blocker.

## Index state at dispatch

Nothing is staged. Check with `git diff --cached --name-status`; if anything is staged,
stop and report.

## Expected working-tree set outside handoff/ (15 paths)

- New (7): `scripts/ghcr-cleanup.ts`, `tests/integration/ghcr-cleanup.test.ts`,
  `tests/integration/fixtures/ghcr-cleanup/versions.json`,
  `tests/integration/fixtures/ghcr-cleanup/tags.txt`, `.github/workflows/image-cleanup.yml`,
  `docs/adr/0003-ghcr-image-cleanup.md`, `docs/adr/0003-ghcr-image-cleanup.vi.md`.
- Modified (8): `tsconfig.json`, `tsconfig.test.json`,
  `docs/adr/0002-ingat-manifest-and-ghcr-image.md`,
  `docs/adr/0002-ingat-manifest-and-ghcr-image.vi.md`,
  `docs/07_DEPLOYMENT_AND_OPERATIONS.md`, `docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md`,
  `docs/11_OPERATIONS_RUNBOOK.md`, `docs/11_OPERATIONS_RUNBOOK.vi.md`.

If `git status` shows a path outside `handoff/` that is not in this list, or one of these
in a different state (new versus modified), stop and report the difference.

**Identity.** Immediately before `git add`, `sha256sum -c
handoff/delivery/evidence/INGAT-GC-FIX1/snapshot-sha256.txt` from the worktree root must be
all OK. After the commit, `git show HEAD:<path>` of each of the 15 must hash to the same
values (write each to a file in the task folder, then `sha256sum`). Record
`node scripts/source-digest.mjs` before `git add` (expected
`e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56`) and after the commit;
report both. A hash mismatch stops the task.

## Handoff files to stage

- Modified (3): `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`,
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.vi.md`,
  `handoff/delivery/tasks/INGAT-T0T8-RECORD.md` (its Results).
- New files (9): the two review files `handoff/delivery/INGAT_GC_REVIEW.md` and
  `handoff/delivery/INGAT_GC_REVIEW.vi.md`, and seven task files under
  `handoff/delivery/tasks/`: `INGAT-GC-PLAN.md`, `INGAT-GC-IMPL.md`, `INGAT-GC-GATE.md`,
  `INGAT-GC-FIX1.md`, `INGAT-GC-REGATE1.md`, `INGAT-GC-AUDIT.md`, and this brief
  (`INGAT-GC-COMMIT.md`, as it stands before you append results).
- New evidence folders (7), each as its directory path:
  `handoff/delivery/evidence/INGAT-T0T8-RECORD/`, `…/INGAT-GC-PLAN/`, `…/INGAT-GC-IMPL/`,
  `…/INGAT-GC-GATE/`, `…/INGAT-GC-FIX1/`, `…/INGAT-GC-REGATE1/`, `…/INGAT-GC-AUDIT/`.
- Your own evidence folder `handoff/delivery/evidence/INGAT-GC-COMMIT/` is not staged.
  Any other path under `handoff/` stops the commit.

## Checks before committing (record each exit in `handoff/delivery/evidence/INGAT-GC-COMMIT/checks.txt`)

1. `node --version` (Node 24 by full path, as docs/08 says).
2. HEAD, `origin/main` after fetch, branch, no merge or rebase in progress.
3. `git status --porcelain=v1 -uall` equals the expected sets plus your own evidence folder.
4. Identity of the 15 paths and the digest.
5. Staging: plain `git add -- <paths>` calls, at most about 20 literal paths each; the
   seven evidence folders as directory paths. Never `--pathspec-from-file`, `xargs`, a
   list file, a glob, `-A`, `.` or `-u`.
6. `node scripts/precommit-check.mjs`. A `profile-path` finding in a staged evidence log may
   be masked (account segment to `<user>`, re-stage, rerun every check, list each masked
   file). Any other finding stops the commit.
7. `git diff --cached --check`. A finding stops the commit (report the file and line).
8. Parse every staged `.json` file (workflow Python, script file in the task folder).
9. `validate_package.py --preflight` with the workflow Python, from the worktree root.
10. A Grep scan of the staged evidence for secret shapes (`BEGIN .*PRIVATE KEY`, `ghp_`,
    `github_pat_`, `gho_`, `Authorization:`, `Bearer `, a token value). A hit stops the
    commit (report file and line, not the value).
11. Read the staged diff of the 15 source paths for personal data, host values and
    credentials.

## Commit message (write to `handoff/delivery/evidence/INGAT-GC-COMMIT/commit-message.txt`, commit with `git commit -F`)

```
feat(ci): add a scheduled GHCR cleanup that keeps release images

Add .github/workflows/image-cleanup.yml and scripts/ghcr-cleanup.ts. A
daily job deletes a ghcr.io/cdsemi/timesheet version only when every tag
is a commit SHA, none of them is a commit with a git tag (a release), and
the version is outside the newest 20 and older than 30 days. Untagged
and non-SHA-tagged versions are never deleted; the floors are 10
versions and 7 days; a manual run is a dry run by default. Release
versions are deleted only by hand. Record the decision in ADR 0003,
point ADR 0002 to it, update docs/07 and docs/11 with their
translations, add the tests, fixtures and tsconfig includes, and the
track's records.

Task: INGAT-GC-IMPL, INGAT-GC-FIX1
Gate: INGAT-GC-GATE FAIL, INGAT-GC-REGATE1 PASS
Audit: INGAT-GC-AUDIT PASS
Digest: e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56
```

Add the attribution exactly as the client instructs.

## Runtime

- Use Git Bash only. Task folder `D:\.claude-tmp\timesheet\INGAT-GC-COMMIT`. Node 24 first on
  PATH:
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
- Write Results with the Edit tool (below), finish with "Status: done" and exactly one
  newline.

Report in English: pre/post HEAD, commit SHA, pushed, `origin/main` after push, staged
list (counts), check exits, digests, masked files, blockers. Return at most 120 words,
beginning 'Self-reported model: ...'.

## Results

(committer appends here)
