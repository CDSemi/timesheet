# INGAT-T0T8-COMMIT dispatch brief (commit the accepted T0/T8 snapshot and push it to main)

- **Task.** Side track "Ingat deployability" (T0, T8), task INGAT-T0T8-COMMIT, kind
  commit, attempt 1. It depends on INGAT-T0T8-RECHECK1 (PASS) and INGAT-T0T8-REGATE1
  (PASS). Not on `ORCHESTRATION.json` (see `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`):
  do not stage or edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-committer (effort medium), requested model sonnet, no
  override. Routing: size M, risk L.
- **Authority.**
  - AGENTS.md rule 12 and docs/08 "Commits and pushes": before the first release
    (`git.release_declared` is false), commit to `main` and push after every commit, only
    through `timesheet-committer`.
  - The requesting session had asked not to push. It has now lifted that, relaying the
    owner's approval in the owner's words (2026-10-22): "Đồng ý cho phiên timesheet commit
    và đẩy T0, T8 lên main của repo timesheet theo quy tắc của repo đó, rồi theo dõi CI
    build ảnh." ("Agree: the timesheet session commits and pushes T0 and T8 to the
    timesheet repo's main following that repo's rules, then watches CI build the image.")
  - The owner then confirmed directly in this session's chat (2026-10-22, verbatim): "Tôi
    xác nhận: phiên này được commit T0/T8 (9 tệp và hồ sơ handoff/delivery/**/INGAT*) rồi
    push lên main của CDSemi/timesheet. Đây là repo công khai, và lần push này sẽ chạy
    workflow đẩy image lên GHCR." ("I confirm: this session may commit T0/T8 (9 files and
    the handoff/delivery/**/INGAT* records) and push to main of CDSemi/timesheet. This is
    a public repository, and this push will run the workflow that pushes the image to
    GHCR.") The first dispatch of this task was refused by the client's permission check
    before the agent started, because the earlier approval was only relayed; this is
    attempt 1 again, with a fresh agent.
  - Every path you may stage is listed here as dispatched. Nothing will be added while you
    run. The coordinator writes no file while you run.

## Where and how (read carefully: this differs from a plain main commit)

- Work only in the worktree
  `D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`. Its branch
  is `claude/relaxed-lalande-8359f0`, because `main` is checked out in the main checkout
  `D:\Dropbox\Work.CDSemi\timesheet`, where another coordinator works and has uncommitted
  files. **Run no git command in, or against, the main checkout** (no `git -C` there, no
  checkout, merge, fetch, add or status there).
- Expected HEAD of the worktree: `2bce0ab5842b80c710f23496d5173c122319e5c7`.
- Before staging: `git fetch origin`, then `git rev-parse origin/main`. It must equal the
  worktree HEAD, so the new commit is a fast-forward of `main`. If `origin/main` moved,
  stop and report its SHA and `git log --oneline HEAD..origin/main` with
  `git diff --stat HEAD origin/main`; do not merge, rebase or update anything.
- Commit on the worktree branch. Push to `main` only, as a fast-forward:
  `git push --dry-run origin HEAD:refs/heads/main`, then
  `git push origin HEAD:refs/heads/main`. Do not push the worktree branch itself. A
  non-fast-forward or protection rejection stops the task (no merge, rebase or force).
  Authentication or network failure: retry after 5 s and 30 s, then record a push
  blocker.
- After the push: `git fetch origin` and record `git rev-parse origin/main` (must equal the
  new commit). Record that the local `refs/heads/main` stays at the old commit (it belongs
  to the main checkout; do not move it).
- Use the commit identity already configured (do not change git config).

## Index state at dispatch

Nothing is staged. Check with `git diff --cached --name-status` before adding anything. If
anything is staged, stop and report.

## Expected working-tree set outside handoff/ (9 paths)

- New (5): `ingat.toml`, `.github/workflows/ingat-validate.yml`,
  `.github/workflows/image.yml`, `docs/adr/0002-ingat-manifest-and-ghcr-image.md`,
  `docs/adr/0002-ingat-manifest-and-ghcr-image.vi.md`.
- Modified (4): `docs/07_DEPLOYMENT_AND_OPERATIONS.md`,
  `docs/07_DEPLOYMENT_AND_OPERATIONS.vi.md`, `docs/11_OPERATIONS_RUNBOOK.md`,
  `docs/11_OPERATIONS_RUNBOOK.vi.md`.

Any other path outside `handoff/` stops the commit (report the exact difference).

**Identity.** Immediately before `git add`, the SHA-256 of each of the nine paths must equal
`handoff/delivery/evidence/INGAT-T0T8-FIX1/snapshot-sha256.txt` (`sha256sum -c` with that
file from the worktree root). After the commit, `git show HEAD:<path>` of each of the nine
must hash to the same values (write each to a file in the task folder, then
`sha256sum`). Record `node scripts/source-digest.mjs` before `git add` (expected
`47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033`, 875 files; the script
may count only tracked paths, so the five new files may not be in it) and again after the
commit; report both values and file counts. A digest change explained by the five new
files is not a stop; a hash mismatch of the nine is.

## Handoff files to stage (all new)

- `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` and `.vi.md`
- `handoff/delivery/INGAT_T0_T8_REVIEW.md` and `.vi.md`
- `handoff/delivery/INGAT_T0_T8_RECHECK1.md` and `.vi.md`
- `handoff/delivery/tasks/INGAT-T0T8-PLAN.md`, `INGAT-T0T8-IMPL.md`, `INGAT-T0T8-GATE.md`,
  `INGAT-T0T8-AUDIT.md`, `INGAT-T0T8-FIX1.md`, `INGAT-T0T8-REGATE1.md`,
  `INGAT-T0T8-RECHECK1.md`
- this brief, as it stands before you append results
- the evidence folders, each as its directory path:
  `handoff/delivery/evidence/INGAT-T0T8-PLAN/`, `…/INGAT-T0T8-IMPL/`, `…/INGAT-T0T8-GATE/`,
  `…/INGAT-T0T8-AUDIT/`, `…/INGAT-T0T8-FIX1/`, `…/INGAT-T0T8-REGATE1/`,
  `…/INGAT-T0T8-RECHECK1/`

Your own evidence folder `handoff/delivery/evidence/INGAT-T0T8-COMMIT/` is NOT staged in
this commit (the next track commit carries it). Any other path under `handoff/` stops the
commit.

## Checks before committing (record each exit in `handoff/delivery/evidence/INGAT-T0T8-COMMIT/checks.txt`)

1. `node --version` (Node 24 by full path, as docs/08 says).
2. HEAD, `origin/main` after fetch, branch, no merge or rebase in progress.
3. `git status --porcelain=v1 -uall` equals the expected set (both lists above plus your
   own evidence folder and this brief).
4. Identity of the nine paths (above) and the digest.
5. Staging: plain `git add -- <paths>` calls, at most about 20 literal paths each; the
   seven evidence folders may be given as directory paths. Never `--pathspec-from-file`,
   `xargs`, a list file, a glob, `-A`, `.` or `-u`.
6. `node scripts/precommit-check.mjs`. A `profile-path` finding in a staged evidence log
   may be masked (account segment to `<user>`, re-stage, rerun every check, list each
   masked file). Any other finding stops the commit.
7. `git diff --cached --check`.
8. Parse every staged `.json` file, if any (workflow Python, script file in the task
   folder).
9. `validate_package.py --preflight` with the workflow Python (it lives under
   `handoff/delivery/`), from the worktree root.
10. A Grep scan of the staged evidence folders for secret shapes: `BEGIN .*PRIVATE KEY`,
    `ghp_`, `github_pat_`, `gho_`, `Authorization:`, `Bearer `, and setup-token output of
    the app's `bootstrap` command (the gate recorded it as redacted; confirm no token
    value is present). Record hits and their classification. An unredacted secret-shaped
    value stops the commit (report the file and line, not the value).
11. Read the staged diff of the nine source paths for personal data, host values and
    credentials.

## Commit message (write it to `handoff/delivery/evidence/INGAT-T0T8-COMMIT/commit-message.txt`, commit with `git commit -F`)

```
ci(deploy): add the Ingat manifest and the GHCR image workflow

Add ingat.toml (Ingat 0.1.x form, image pulled by commit tag and bound
by the revision label), a CI job that validates it with the Ingat image
pinned by digest, and a workflow that builds linux/amd64 and publishes
ghcr.io/cdsemi/timesheet:<commit> with OCI version, revision and source
labels. Record the decision and the Node.js kernel 4.4 finding in ADR
0002; update docs/07 and docs/11 with their translations; add the
track's task records, reviews and evidence.

Task: INGAT-T0T8-IMPL, INGAT-T0T8-FIX1
Gate: INGAT-T0T8-GATE PASS, INGAT-T0T8-REGATE1 PASS
Audit: INGAT-T0T8-AUDIT FIX REQUIRED, INGAT-T0T8-RECHECK1 PASS
Digest: 47e8036bdcfd6527e52bb91abe9139b801017cb66c92aa21bca604356721a033
```

Add the attribution exactly as the client instructs.

## Runtime

- Use Git Bash only. Task folder `D:\.claude-tmp\timesheet\INGAT-T0T8-COMMIT` (TEMP, TMP,
  scratch files). Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  The workflow Python:
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`, NO
  `python -`), NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE REDIRECTS (`/dev/null`,
  `/dev/stdout`, `/dev/stdin`, `/dev/zero`, `nul`, ALSO NOT IN `2>`), NO `rm -r`, NO PID
  KILLS, NO INTERACTIVE SHELLS.**
- Never: `--amend`, `--force`/`-f`/`--force-with-lease`, `--no-verify`, reset, rebase,
  clean, stash, tag, release creation, branch deletion, history rewrite, `commit -a`, git
  config changes; never ask for credentials in chat. Change no GitHub setting.
- **If a permission check denies any call, stop at once and report the denial reason
  exactly. Do not retry it in another form.**
- Write Results with the Edit tool (below), finish with "Status: done".

Report in English: pre/post HEAD, commit SHA, pushed (yes/no), `origin/main` after push,
branch, staged list (counts per folder), check exit codes, digests, masked files,
blockers. Return at most 120 words, beginning 'Self-reported model: ...'.

## Addendum 1 (coordinator, 2026-10-22): attempt 2 after the whitespace stop

- Attempt 1 staged the 198 listed paths and stopped at check 7: `git diff --cached
  --check` exit 2, "handoff/delivery/tasks/INGAT-T0T8-PLAN.md:984: new blank line at EOF".
  Nothing was committed or pushed. Checks 1-6 and 9 passed (see
  `evidence/INGAT-T0T8-COMMIT/checks.txt`).
- The coordinator removed the two trailing blank lines at the end of
  `handoff/delivery/tasks/INGAT-T0T8-PLAN.md` (a task record; no other byte changed) and
  wrote this addendum.
- Attempt 2, same agent: re-stage exactly these two already-listed paths with one plain
  `git add -- handoff/delivery/tasks/INGAT-T0T8-PLAN.md handoff/delivery/tasks/INGAT-T0T8-COMMIT.md`,
  then rerun every check from check 2 (fetch and `origin/main` again, the status set, the
  nine hashes, the precommit, `git diff --cached --check`, and the rest), write the
  message file, commit and push as the brief says. Any other new finding stops the task
  again. No other path is added.

## Results

Attempt 2: pre-HEAD 2bce0ab, commit 6173f07777d3a972db77208390df86a5f7de1a11, pushed to main
as a fast-forward (dry-run first), origin/main = 6173f07 after fetch; local refs/heads/main
stays 2bce0ab. 198 paths staged. Checks: precommit 0, diff --check 0, preflight 0, no JSON,
nine hashes OK before and after, digest 47e8036b... (875 files) unchanged, secret scan: only
redacted setup tokens, no masking needed. Blockers: none.

Status: done
