# WP5-UX5-RECORDS1 dispatch brief (commit the REGATE2 records and push main)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-RECORDS1, package WP5, kind
  commit, attempt 1. It depends on WP5-UX5-REGATE2 (done, FAIL).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L.
- **Authority.**
  - AGENTS.md rule 12 and docs/08 "Commits and pushes".
  - The owner's 2026-10-22 message "Từ giờ bạn cứ push lên main thoải mái nhé". It lifts
    the earlier push hold, so the local commit 7aafa21 is pushed now.
- **What this commit carries:** coordinator and task records under `handoff/` only.
  - the FIX2-FREEZE Results and evidence;
  - the REGATE2 target, Results and evidence;
  - the retargeted audit drafts;
  - this brief;
  - the board and the checkpoint pair.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-RECORDS1`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO
    `head` OR `tail`, NO NULL-DEVICE REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO
    INTERACTIVE SHELLS.
  - Use the workflow Python for the validators, and put Node 24 first on PATH.
  - **Staging:** use plain `git add` with literal paths, at most about 20 per call.
    Evidence folders may be staged as directories. Never use `--pathspec-from-file`,
    `xargs`, a list file, a glob, `-A` or `.`.
  - **If a permission check denies any call, stop and report the reason exactly.**
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
  - Keep Results short.
- The coordinator writes no file while you run.

## Steps

1. Run `node --version`. HEAD must be 7aafa21bc1c6efc70c0fa8691c3a1165841aeb45.
2. Run `git fetch origin`. origin/main must be 70dce2a… (one behind HEAD). If origin/main
   has moved, stop and report; do not merge.
3. `git diff --cached --name-status` must be empty.
4. `git status --short --untracked-files=all` must show **no path outside `handoff/`**.
   Anything outside `handoff/` stops the commit.
5. Run `npm run digest`. It must be
   59516a2d0abe1294aa3aebbbc88dd2327dc2980dd139d6f3591054b95c25f0ad: only `handoff/`
   changed.
6. **Stage every changed `handoff/` path that matches one of these patterns,** and list each
   one in `checks.txt`:
   - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
   - the checkpoint pair;
   - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - `handoff/delivery/tasks/WP5-UX5-*.md`;
   - the folders `handoff/delivery/evidence/WP5-UX5-FIX2-FREEZE/` and
     `handoff/delivery/evidence/WP5-UX5-REGATE2/`, as directories.

   Any other changed `handoff/` path stops the commit.
7. **Basenames:** rename with `git mv` any staged basename that contains "signature"
   without "synthetic", and list each rename.
8. Run the key and PEM scan on the new evidence folder (the rule of
   `WP5-UX4-FIX3-FREEZE.md`).
9. Run `node scripts/precommit-check.mjs`.
   - A `profile-path` finding in an evidence log may be masked as `<user>`, then
     re-staged.
   - An evidence file over the size limit may be unstaged (that one file only), and
     listed.
   - Any other finding stops the commit.
10. Run `git diff --cached --check`, a JSON parse of ORCHESTRATION.json and STATE.json,
    `validate_orchestration.py`, `check_recovery.py` (106) and
    `validate_package.py --preflight`.
11. Commit on main. Then run `git push origin main`. This pushes 7aafa21 and the new
    commit. Record the remote SHA, which must equal HEAD.
12. Compute the `git ls-tree` digest of HEAD. It must still be 59516a2d.
13. Write `checks.txt` and `commit-message.txt` in
    `handoff/delivery/evidence/WP5-UX5-RECORDS1/`, and a short Results in this brief. Leave
    all of them unstaged.

## Commit message

Subject: Record the WP5-UX5 regate 2 result and the FIX2 freeze

- docs(handoff):
  - the FIX2-FREEZE results and evidence: the fast-forward to the owner's 70dce2a, and
    7aafa21;
  - the REGATE2 record (FAIL on two load-dependent e2e failures; everything else
    passed) and its evidence;
  - the audit drafts, retargeted to 7aafa21;
  - the board and the checkpoint (+ vi).
- Push: 7aafa21 was held locally under the owner's earlier push hold, now lifted.

Task: WP5-UX5-REGATE2 records
Gate: WP5-UX5-REGATE2 FAIL on 7aafa21; FIX3 next
Audit: pending
Digest: 59516a2d (unchanged; handoff only)

Return at most 60 words, beginning 'Self-reported model: ...', with the full SHA of the new
commit and the remote SHA.

## Results
