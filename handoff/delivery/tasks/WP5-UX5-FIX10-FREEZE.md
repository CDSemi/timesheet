# WP5-UX5-FIX10-FREEZE dispatch brief (one commit of FIX10 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX10-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX10 (done).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (five test files and the records since 94accda; no merge
  expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** The same as in `handoff/delivery/tasks/WP5-UX5-FIX9-FREEZE.md` ("Runtime"),
  with the task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX10-FREEZE`.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head`, `tail` OR `cat`, NO
    NULL-DEVICE OR `/dev/std*` REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO
    INTERACTIVE SHELLS.**
  - **Staging:** use plain `git add` with literal paths, at most about 20 per call. Folders
    may be staged as directories. Never use `--pathspec-from-file`, `xargs`, a list file, a
    glob, `-A` or `.`.
  - **Never change any git configuration.**
  - If a permission check denies any call, stop and report the reason exactly.
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
- The coordinator writes no file while you run.

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be 94accda904240fda1cf500063d8b30d3a3603fd2.
   - Run `git fetch origin`. origin/main must still be 94accda.

   If either differs, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these
   five modified paths, with no untracked file. Anything else stops the commit.
   - `tests/e2e/logo.spec.ts`
   - `tests/e2e/admin-status.spec.ts`
   - `tests/e2e/timesheet.spec.ts`
   - `tests/e2e/contrast.ts`
   - `tests/e2e/day-editor.spec.ts`
4. **D_PRE.** Run `npm run digest`. It must equal
   4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f (882 files). Otherwise
   stop and report.
5. **Stage:**
   - **the five test files;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
     - every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`, this brief
       included. Expected:
       - modified: `WP5-UX5-FIX9-FREEZE.md`;
       - untracked: `WP5-UX5-REGATE5.md`, `WP5-UX5-DIAG4.md`, `WP5-UX5-FIX10.md`,
         `WP5-UX5-FIX10-FREEZE.md`;
     - as directories, under `handoff/delivery/evidence/`: `WP5-UX5-FIX9-FREEZE/`,
       `WP5-UX5-REGATE5/`, `WP5-UX5-DIAG4/` and `WP5-UX5-FIX10/`.

   If another changed path appears under `handoff/`, list it and stop. List every staged
   path in `checks.txt`, with a count per group.
6. **Basenames.** Any staged basename that contains "signature" (any case) without
   "synthetic" stops the commit. So does any staged `.png` not ending in `-synthetic.png`.
7. **Scans.** Run the key and PEM scan (the rule in
   `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`) over the four staged evidence folders.
   Then run the email and Message-ID scan over everything staged.
   - **Allowed:**
     - addresses ending in `@example.invalid`;
     - Message-IDs ending in `@timesheet.invalid`;
     - the public no-reply address of a Co-Authored-By trailer quoted in earlier freeze
       records;
     - truncated fragments of a synthetic `@example.invalid` address in captured logs.
   - **Any other address or Message-ID stops the commit.**
8. **Run `node scripts/precommit-check.mjs`.**
   - A `profile-path` finding in an evidence log may be masked as `<user>`, then re-staged.
   - A `secret-assignment` finding on a synthetic password literal in an evidence probe
     script may be masked as `'<synthetic-password>'`, then re-staged. List each one.
   - An evidence file over the size limit may be unstaged (that one file only), and listed.
   - Any other finding stops the commit.
9. **Run these checks:**
   - `git diff --cached --check`;
   - a JSON parse of ORCHESTRATION.json and STATE.json;
   - `validate_orchestration.py`;
   - `check_recovery.py` (106);
   - `validate_package.py --preflight`, with the workflow Python.

   Any failure stops the commit.
10. **Commit on main, then `git push origin main`.** The push must fast-forward the remote
    from 94accda. Record the remote SHA, which must equal HEAD.
11. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`. It must equal D_PRE.
12. **Write the outputs.** Write `checks.txt` and `commit-message.txt` in
    `handoff/delivery/evidence/WP5-UX5-FIX10-FREEZE/`, and a short Results here. Leave them
    unstaged.

**Allowed edits:** only those in step 8. Anything else that fails stops the commit; report
it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Make the slowest e2e tests cheaper without changing what they prove

- test(e2e):
  - the wordmark width sweeps measure in four browser contexts at once, and the
    shared-view sweep is its own test. The rows are identical, and each test now takes
    about 30 s instead of 2 min.
  - admin-status waits for the PDF before it sends, which removes a one-minute retry.
  - the Day editor frame test reads one decoded screenshot instead of 360 one-pixel ones.
  - the contrast check of the Day editor reads every leaf in one evaluate, with the same
    ratios.
- docs(handoff): the REGATE5 record (FAIL on one load timeout of the unchanged logo test),
  the DIAG4 diagnosis, the FIX10 record, the board, the checkpoint (+ vi), STATE and
  NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX10 (WP5-UX5-REGATE5 finding, WP5-UX5-DIAG4 plan)
Gate: WP5-UX5-REGATE5 FAIL on 94accda; REGATE6 pending
Audit: WP5-UX5-AUDIT-A and WP5-UX5-AUDIT-B FIX REQUIRED on f4049aa; rechecks pending
Digest: D_PRE

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- any masking or unstaged file;
- every check with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results

- HEAD before 94accda904240fda1cf500063d8b30d3a3603fd2; after a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5.
- Pushed to origin main (fast-forward); remote SHA a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5.
- D_PRE = HEAD digest = 4147751090b5511ea56225bb7bf9a33225602cc705eb906a13477cec9101869f.
- Staged 307 paths. Masked 3 profile-path lines in DIAG4/census-end.txt; no file unstaged.
- All checks exit 0 (precommit after masking). Details in evidence/WP5-UX5-FIX10-FREEZE/checks.txt.
