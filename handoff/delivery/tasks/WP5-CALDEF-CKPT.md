# WP5-CALDEF-CKPT dispatch brief (handoff-only checkpoint commit before the planned stop, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-CKPT, package WP5, kind
  commit, attempt 1. It depends on WP5-CALDEF-ACCEPT.
- **Why.** Document 08 "Commits and pushes" names a checkpoint commit before a planned stop
  when state is uncommitted.
  - After the accept commit 9aba1e7, the coordinator recorded that commit, the post-check
    lookup and the return to `software_ready`.
  - The mission now stops until the owner acts.
  - The commit holds only records under `handoff/`.
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L (handoff records only; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes"; the owner allows pushes
  to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-CALDEF-FIX2-FREEZE.md` ("Runtime": the rules
  in capitals, staging, no git configuration change, the workflow Python). Task folder:
  `D:\.claude-tmp\timesheet\WP5-CALDEF-CKPT`.
- **The coordinator writes no file while you run.** The board shows this task running. The
  coordinator sets the board back to `software_ready` after you finish.
- **Confirmed at dispatch:**
  - HEAD = origin/main = 9aba1e70e6461fc5d1183ec71270aad9d4df1b25.
  - D_PRE = 52ec1fc748fa1e8eabd63d628abee9c1c77666a24ebf250ef66c26d1dd96dc07 (885 files).
  - No path outside `handoff/` changed.
  - The lookup WP5-CALDEF-POSTCHECK found every validator passing on the board before this
    task was registered.

## Steps

1. **Starting point.**
   - `node --version` must print v24.x.
   - HEAD must be 9aba1e7.
   - After `git fetch origin`, origin/main must be 9aba1e7.

   Otherwise stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. `git status --short --untracked-files=all -- . ':!handoff'` must be empty.
4. `npm run digest` must equal D_PRE.
5. **Stage these:**
   - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
   - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
   - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - `handoff/delivery/tasks/WP5-CALDEF-ACCEPT.md` (its Results);
   - `handoff/delivery/tasks/WP5-CALDEF-POSTCHECK.md`;
   - this brief;
   - the folder `handoff/delivery/evidence/WP5-CALDEF-ACCEPT/`.

   The four known leftovers stay out (see the WP5-CALDEF-ACCEPT brief). Any other changed
   path stops the commit; list it.
6. **Run steps 6 to 9 of the WP5-CALDEF-FIX2-FREEZE brief** over the staged files, with the
   same allowed edits:
   - file types and names;
   - the key and PEM scan, and the email and Message-ID scan;
   - `node scripts/precommit-check.mjs`.
7. **Run these checks:**
   - `git diff --cached --check`;
   - a JSON parse of ORCHESTRATION.json and STATE.json;
   - `validate_orchestration.py`;
   - `validate_orchestration.py --non-product-staged` (no path outside `handoff/` is
     expected; record what it prints);
   - `check_recovery.py` (141 probes);
   - `validate_package.py --preflight`.

   Any failure stops the commit. Do not edit the board; list every error.
8. **Commit on main, then run `git push origin main`.** The push must fast-forward the remote
   from 9aba1e7. Record the remote SHA. It must equal HEAD.
9. **After the push:**
   - `validate_orchestration.py --non-product-range b810ba9..HEAD`: PASS;
   - HEAD's digest, in the `git ls-tree` form, must equal D_PRE.
10. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-CALDEF-CKPT/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

## Commit message (refine with the commit-message skill)

Subject: Record the WP5 re-acceptance commit and return the mission to software ready

- docs(handoff): the board records WP5-CALDEF-ACCEPT (9aba1e7, pushed) and the read-only
  post-check WP5-CALDEF-POSTCHECK (every validator 0, digest 52ec1fc7). The mission status is
  `software_ready` with no next task. The commit also updates STATE, the checkpoint (+ vi)
  and NEXT_ACTION (+ vi), and adds the WP5-CALDEF-ACCEPT evidence.

Task: WP5-CALDEF-CKPT (checkpoint before the planned stop)
Digest: 52ec1fc7 (unchanged; handoff only)

## Report

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA, the
staged count and every check's exit code.

## Results
