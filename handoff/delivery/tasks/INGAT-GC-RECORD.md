# INGAT-GC-RECORD dispatch brief (handoff-only record commit after the cleanup commit)

- **Task.** Follow-up GHCR cleanup, task INGAT-GC-RECORD, kind commit, attempt 1. It depends
  on INGAT-GC-COMMIT (done, `782cdda`) and INGAT-GC-CI (done, PASS). Not on
  `ORCHESTRATION.json`: do not stage or edit the board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-committer (effort medium), requested model sonnet, no
  override. Routing: size S, risk L (records only, under `handoff/`).
- **Authority.** docs/08 "Commits and pushes" (commit to `main` and push after every commit
  before the first release; "a checkpoint commit before a planned stop when state is
  uncommitted"), and the owner's direct confirmations in this session: "Tôi xác nhận:
  phiên này được commit T0/T8 (9 tệp và hồ sơ handoff/delivery/**/INGAT*) rồi push lên
  main của CDSemi/timesheet. …" and, for the cleanup change, "yes, lên main". Every path
  of this commit matches `handoff/delivery/**/INGAT*`. The coordinator writes no file
  while you run.

## Where and how

The same as `handoff/delivery/tasks/INGAT-T0T8-RECORD.md` ("Where and how"), with expected
HEAD = `origin/main` = `782cddabae6260a87c600936daf0408eebb17f56`. Work only in the worktree;
run no git command in or against the main checkout; push only `HEAD:refs/heads/main` as
a fast-forward (dry-run first); stop if `origin/main` moved.

## Index state at dispatch

Nothing is staged; check with `git diff --cached --name-status`.

## Expected path set (all under handoff/; nothing outside handoff/ may change)

- Modified (2): `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`,
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.vi.md`.
- New: `handoff/delivery/tasks/INGAT-GC-CI.md`, this brief
  (`handoff/delivery/tasks/INGAT-GC-RECORD.md`, before you append results), and the
  evidence folders `handoff/delivery/evidence/INGAT-GC-COMMIT/` and
  `handoff/delivery/evidence/INGAT-GC-CI/`, each as its directory path.
- Your own evidence folder `handoff/delivery/evidence/INGAT-GC-RECORD/` is not staged. Any
  other path stops the commit. `node scripts/source-digest.mjs` before and after must be
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56`.

## Checks before committing

The ten checks of `handoff/delivery/tasks/INGAT-T0T8-RECORD.md`, recorded in
`handoff/delivery/evidence/INGAT-GC-RECORD/checks.txt`; the JSON to parse is
`evidence/INGAT-GC-CI/ci-answers-trimmed.json`. Any finding other than a maskable
`profile-path` in an evidence log stops the commit.

## Commit message (write to `handoff/delivery/evidence/INGAT-GC-RECORD/commit-message.txt`, commit with `git commit -F`)

```
docs(handoff): record the GHCR cleanup commit and its CI runs

Record the cleanup commit task (782cdda, pushed to main as a
fast-forward) and the GitHub runs of 782cdda and 70dce2a: ingat-validate
and image succeeded for both; the image-cleanup workflow is registered
and has not run yet. Update the track checkpoint.

Task: INGAT-GC-COMMIT, INGAT-GC-CI
Gate: INGAT-GC-CI PASS
Audit: INGAT-GC-AUDIT PASS
Digest: e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56
```

Add the attribution exactly as the client instructs.

## Runtime

The Runtime section of `handoff/delivery/tasks/INGAT-T0T8-RECORD.md` applies unchanged,
with the task folder `D:\.claude-tmp\timesheet\INGAT-GC-RECORD`. In capitals again: **NO
HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE
REDIRECTS, NO INTERACTIVE SHELLS; never amend, force, reset, rebase, stash, clean or tag.
If a permission check denies any call, stop at once and report the reason exactly.**

Report in English: pre/post HEAD, commit SHA, pushed, `origin/main` after push, staged
list, check exits, digests, blockers. Return at most 100 words, beginning 'Self-reported
model: ...'.

## Results

(committer appends here)
