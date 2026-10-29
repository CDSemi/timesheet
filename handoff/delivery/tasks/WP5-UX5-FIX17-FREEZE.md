# WP5-UX5-FIX17-FREEZE dispatch brief (one commit of FIX17 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX17-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX17 (done, uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L (two e2e files and the records since 1fe5ad3; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX17-FREEZE`.
  - **NO HEREDOCS (WRITE EVERY SCRIPT WITH THE WRITE TOOL), NO STDIN TO NODE OR PYTHON (NO
    `node -e`, NOT EVEN `node -e 1`, NO `python -c`), NO PIPES INTO `head`, `tail` OR
    `cat`, NO NULL-DEVICE OR `/dev/std*` REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO PID
    KILLS, NO INTERACTIVE OR DETACHED SHELLS, NO `sed -i`.**
  - **Staging.** Use plain `git add` with literal paths, at most about 20 per call.
    - Folders may be staged as directories.
    - Never use `--pathspec-from-file`, `xargs`, a list file, a glob, `-A` or `.`.
    - To leave one file of a staged folder out, use `git restore --staged <literal path>`.
  - **Never change any git configuration.**
  - If a permission check denies any call, stop and report the reason exactly.
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
- **The coordinator writes no file while you run.**

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2.
   - Run `git fetch origin`. origin/main must still be 1fe5ad3.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these two
   modified paths, and no untracked file. Anything else stops the commit.
   - `tests/e2e/import.spec.ts`
   - `tests/e2e/today.spec.ts`
4. **D_PRE.** Run `npm run digest`. It must equal
   69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf (882 files). Otherwise
   stop and report.
5. **Stage these:**
   - **the two paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. Expected:
     - modified: `WP5-UX5-FIX16-FREEZE.md`, `WP5-UX5-REGATE11.md`,
       `WP5-UX5-RECHECK-B3.md` and `WP5-UX5-AUDIT-INT.md`;
     - untracked: `WP5-UX5-DIAG10.md`, `WP5-UX5-FIX17.md`, `WP5-UX5-FIX17-FREEZE.md` and
       `WP5-UX5-REGATE12.md`;
   - **these folders under `handoff/delivery/evidence/`,** staged as directories:
     `WP5-UX5-FIX16-FREEZE/`, `WP5-UX5-REGATE11/`, `WP5-UX5-DIAG10/` and `WP5-UX5-FIX17/`.

   **Expected leftovers.** Four untracked files stay out, and do not stop the commit:
   - `handoff/delivery/evidence/WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-chain1.log`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears under `handoff/`, list it and stop. List every staged
   path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository.
   - Read every census or process file of the four staged evidence folders. Their names
     contain `census`, `proc`, `priority`, `leftover` or `load`.
   - Unstage any file that shows the command line of a process the mission did not start.
     Process names, IDs, counts and CPU times are allowed. List each file you unstage, with
     the reason.
7. **File types and names.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
   - Evidence is LF `.txt` or `-synthetic.png`. Unstage any staged evidence file with
     another extension, and list it.
8. **Scans.**
   - Run the key and PEM scan, the rule in `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`,
     over the four staged evidence folders.
   - Then run the email and Message-ID scan over everything staged.
   - **Allowed:** addresses ending in `@example.invalid`; Message-IDs ending in
     `@timesheet.invalid`; the public no-reply address of a Co-Authored-By trailer quoted in
     earlier freeze records; truncated fragments of a synthetic `@example.invalid` address
     in captured logs.
   - **Any other address or Message-ID stops the commit.**
9. **Run `node scripts/precommit-check.mjs`.**
   - A `profile-path` finding in an evidence file may be masked as `<user>`, then the file is
     staged again.
   - A `secret-assignment` finding on a synthetic password literal in an evidence probe
     script may be masked as `'<synthetic-password>'`, then the file is staged again.
   - An evidence file over the size limit may be unstaged, that one file only.
   - A trailing blank line at the end of a staged evidence `.txt` file may be removed, that
     whitespace only, then the file is staged again.
   - List each one. Any other finding stops the commit.
10. **Run these checks:**
    - `git diff --cached --check`;
    - a JSON parse of ORCHESTRATION.json and STATE.json;
    - `validate_orchestration.py`;
    - `check_recovery.py` (106);
    - `validate_package.py --preflight`, with the workflow Python.

    Any failure stops the commit. If a validator stops on a board or brief issue, list every
    error you can see. If a file you unstaged is named in a board evidence list, stop and
    report it. Do not edit the board.
11. **Commit on main, then run `git push origin main`.** The push must fast-forward the
    remote from 1fe5ad3. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`. It must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-UX5-FIX17-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Keep e2e steps off browser tabs that are behind, so a busy host cannot starve them

- test(e2e):
  - `import.spec.ts`: `bringToFront` before each step on a tab that may be behind, in its
    two two-tab tests. On a saturated host, Chromium ran the tab behind at idle priority.
    The Confirm click then never completed, and the test timed out, although the server
    answered in milliseconds.
  - `today.spec.ts`: the midnight-crossing test opens its second page in a browser context
    of its own. Before, a second tab put the first page behind. A context of its own also
    leaves the focus and visibility events, which the test is about, unchanged.
- docs(handoff): REGATE11 (FAIL), DIAG10 and FIX17, the FIX16-FREEZE outputs, the REGATE12
  brief, the RECHECK-B3 and AUDIT-INT briefs moved to REGATE12, the board, the checkpoint
  (+ vi), STATE and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX17 (after WP5-UX5-REGATE11; diagnosis WP5-UX5-DIAG10)
Gate: WP5-UX5-REGATE11 FAIL on 1fe5ad3; REGATE12 pending
Audit: WP5-UX5-RECHECK-B3 and WP5-UX5-AUDIT-INT pending
Digest: D_PRE

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- any unstaged or masked file, with its reason;
- every check, with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results

- HEAD before 1fe5ad3075fd4d1b94abe5b8be04ed05729b05c2; after a5cbc91e6965633a0f9d1dd7e912577321cc71e3.
- Pushed to origin main (fast-forward); remote SHA a5cbc91e6965633a0f9d1dd7e912577321cc71e3.
- D_PRE = HEAD digest = 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf.
- Staged 404 paths; no masking, no unstaging; four known leftovers left out.
- All checks exit 0. Details in evidence/WP5-UX5-FIX17-FREEZE/checks.txt.
