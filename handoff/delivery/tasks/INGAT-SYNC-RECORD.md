# INGAT-SYNC-RECORD dispatch brief (step 1 of the synchronization: push this side's last records)

- **Task.** Side track "Ingat deployability", synchronization step 1, task
  INGAT-SYNC-RECORD, kind commit, attempt 1. It depends on INGAT-SYNC-RECON (done) and
  INGAT-GC-RECORD (done, `01c4cdc`). Not on `ORCHESTRATION.json`: do not stage or edit the
  board, STATE or NEXT_ACTION.
- **Profile and routing.** timesheet-committer (effort medium), requested model sonnet, no
  override. Routing: size S, risk L (records only, under `handoff/`).
- **Authority.** docs/08 "Commits and pushes" (commit to `main` and push after every commit
  before the first release; a checkpoint commit before a planned stop), and the owner's
  direct confirmation in this session that the `handoff/delivery/**/INGAT*` records may be
  committed and pushed to `main` ("Tôi xác nhận: phiên này được commit T0/T8 (9 tệp và hồ sơ
  handoff/delivery/**/INGAT*) rồi push lên main của CDSemi/timesheet. …"). On 2026-10-23 the
  owner asked for everything to be synchronized and pushed before work continues, and
  reported that the other coordinator is paused ("Bên kia hiện đang tạm dừng, ko chạy gì
  cả"). This step is an ordinary fast-forward; it is not the merge commit (that is a later
  task and needs its own approval). The coordinator writes no file while you run.

## Where and how

The same as `handoff/delivery/tasks/INGAT-T0T8-RECORD.md` ("Where and how"), with expected
HEAD = `origin/main` = `01c4cdcb5abefad41ec9f8431752eab76f4d2c4a`. Work only in the worktree
`D:\Dropbox\Work.CDSemi\timesheet\.claude\worktrees\relaxed-lalande-8359f0`; run no git
command in or against the main checkout; push only `HEAD:refs/heads/main` as a
fast-forward (dry-run first); stop if `origin/main` moved. Do not merge anything.

## Index state at dispatch

Nothing is staged; check with `git diff --cached --name-status`.

## Expected path set (all under handoff/; nothing outside handoff/ may change)

- Modified (2): `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md`,
  `handoff/delivery/INGAT_T0_T8_CHECKPOINT.vi.md`.
- New files (2): `handoff/delivery/tasks/INGAT-SYNC-RECON.md` and this brief
  (`handoff/delivery/tasks/INGAT-SYNC-RECORD.md`, before you append results).
- New evidence folders (2), each as its directory path:
  `handoff/delivery/evidence/INGAT-GC-RECORD/` and `handoff/delivery/evidence/INGAT-SYNC-RECON/`.
- Your own evidence folder `handoff/delivery/evidence/INGAT-SYNC-RECORD/` is not staged. Any
  other path stops the commit. `node scripts/source-digest.mjs` before and after must be
  `e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56`.
- `evidence/INGAT-SYNC-RECON/main-uncommitted-raw.txt` lists path names of the main
  checkout; read it during check 10 and stop if it holds anything but repository paths and
  git status codes.

## Checks before committing

The ten checks of `handoff/delivery/tasks/INGAT-T0T8-RECORD.md`, recorded in
`handoff/delivery/evidence/INGAT-SYNC-RECORD/checks.txt` (there is no `.json` file to
parse; record that). Any finding other than a maskable `profile-path` in an evidence log
stops the commit.

## Commit message (write to `handoff/delivery/evidence/INGAT-SYNC-RECORD/commit-message.txt`, commit with `git commit -F`)

```
docs(handoff): record the synchronization plan with the main checkout

Record the read-only reconciliation (local main 7aafa21 and origin/main
01c4cdc diverged from 70dce2a with no shared path and a clean merge
preview), the record-commit evidence of 01c4cdc, and the agreed steps of
the synchronization in the track checkpoint.

Task: INGAT-SYNC-RECON, INGAT-GC-RECORD
Gate: INGAT-GC-CI PASS
Audit: INGAT-GC-AUDIT PASS
Digest: e47e634433fd2613985d976f2fd1bccd240b617eb4a96e1ee097912da184ee56
```

Add the attribution exactly as the client instructs.

## Runtime

The Runtime section of `handoff/delivery/tasks/INGAT-T0T8-RECORD.md` applies unchanged,
with the task folder `D:\.claude-tmp\timesheet\INGAT-SYNC-RECORD`. In capitals again: **NO
HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head` OR `tail`, NO NULL-DEVICE
REDIRECTS, NO INTERACTIVE SHELLS; never amend, force, reset, rebase, merge, stash, clean or
tag. If a permission check denies any call, stop at once and report the reason exactly.**

Report in English: pre/post HEAD, commit SHA, pushed, `origin/main` after push, staged
list, check exits, digests, blockers. Return at most 100 words, beginning 'Self-reported
model: ...'.

## Results

(committer appends here)
