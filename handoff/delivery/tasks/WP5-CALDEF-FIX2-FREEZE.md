# WP5-CALDEF-FIX2-FREEZE dispatch brief (commit the tests-only fix and the records since 300d61f, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-FIX2-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-CALDEF-FIX2 (done, uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (one test file and the records since 300d61f, including about 327
  gate evidence files; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows pushes
  to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with the
  task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-FIX2-FREEZE`.
  - **NO HEREDOCS (WRITE EVERY SCRIPT WITH THE WRITE TOOL, IN THE TASK FOLDER), NO STDIN TO
    NODE OR PYTHON (NO `node -e`, NOT EVEN `node -e 1`, NO `python -c`, NO `python -`), NO
    PIPES INTO `head`, `tail` OR `cat`, NO BARE `cat`, NO NULL-DEVICE OR `/dev/std*`
    REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO INTERACTIVE OR DETACHED
    SHELLS, NO `sed -i`.**
  - **Staging.** Use plain `git add` with literal paths, at most about 20 per call.
    - Folders may be staged as directories.
    - Never use `--pathspec-from-file`, `xargs`, a list file, a glob, `-A` or `.`.
    - To leave one file of a staged folder out, use `git restore --staged <literal path>`.
  - **Never change any git configuration.**
  - If a permission check denies any call, stop and report the reason exactly.
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
  - **Python for `validate_package.py --preflight`.** Use the workflow Python of earlier
    freezes; if it lacks a time-zone database, put a scratch `tzdata` package outside the
    repository on `PYTHONPATH` and record which you used.
- **The coordinator writes no file while you run.**
- **Confirmed at dispatch** (from the FIX2 Results and the lookup WP5-CALDEF-PATHS2):
  - D_PRE: 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a (885 files).
  - The one path outside `handoff/`, modified: `tests/e2e/classic-scrollbar.spec.ts`.
  - Under `handoff/`: 3 mission records modified (ORCHESTRATION.json and the checkpoint
    pair; STATE and NEXT_ACTION unchanged); 8 briefs (`WP5-CALDEF-FREEZE.md` modified, the
    other seven untracked); evidence DIAG1 34, FIX2 29, FREEZE 2, GATE 327 files; the 4 known
    leftovers.
  - Expected whitespace edits (step 9): `evidence/WP5-CALDEF-FIX2/out-lint.txt` and
    `out-typecheck.txt` end in a blank line (captured npm output); remove that trailing blank
    line only.
  - 48 process files to read in step 6 (DIAG1 4, GATE 44).

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be 300d61f055a859857aa8eb3845ed21f4560e82fa.
   - Run `git fetch origin`. origin/main must still be 300d61f.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short --untracked-files=all` must
   show exactly `tests/e2e/classic-scrollbar.spec.ts` (modified). Anything else stops the
   commit.
4. **D_PRE.** Run `npm run digest`. It must equal the D_PRE above. Otherwise stop and report.
5. **Stage these:**
   - **the source path:** `tests/e2e/classic-scrollbar.spec.ts`;
   - **the mission records** (those that are modified):
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **the task briefs** in `handoff/delivery/tasks/`: `WP5-CALDEF-FREEZE.md`,
     `WP5-CALDEF-GATE.md`, `WP5-CALDEF-AUDIT.md`, `WP5-CALDEF-DIAG1.md`,
     `WP5-CALDEF-FIX2.md`, `WP5-CALDEF-PATHS2.md`, `WP5-CALDEF-REGATE.md` and this brief;
   - **the evidence folders, staged as directories:** `handoff/delivery/evidence/`
     `WP5-CALDEF-FREEZE/`, `WP5-CALDEF-GATE/`, `WP5-CALDEF-DIAG1/` and `WP5-CALDEF-FIX2/`.

   **Expected leftovers.** Four untracked files stay out, and do not stop the commit:
   - `handoff/delivery/evidence/WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-chain1.log`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears under `handoff/`, list it and stop. List every staged
   path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository. Read every census or process file
   of the staged evidence folders. Their names contain `census`, `cens`, `proc`, `priority`,
   `leftover`, `process` or `load`. Unstage any file that shows the command line of a process
   the mission did not start. Process names, IDs, counts and CPU times are allowed. List each
   file you unstage, with the reason; if a board evidence list names it, stop and report.
7. **File types and names.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
   - Evidence is LF `.txt` or `-synthetic.png`. Unstage any staged evidence file with another
     extension, and list it; if that file is named in a board evidence list, stop and report.
8. **Scans.**
   - Run the key and PEM scan, the rule in `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`,
     over the staged evidence folders.
   - Then run the email and Message-ID scan over everything staged.
   - **Allowed:** addresses ending in `@example.invalid`; Message-IDs ending in
     `@timesheet.invalid`; the public no-reply address of a Co-Authored-By trailer quoted in
     earlier freeze records; truncated fragments of a synthetic `@example.invalid` address in
     captured logs.
   - **Any other address or Message-ID stops the commit.**
9. **Run `node scripts/precommit-check.mjs`.**
   - A `profile-path` finding in an evidence file may be masked as `<user>`, then the file is
     staged again.
   - A `secret-assignment` finding on a synthetic password literal in an evidence probe script
     may be masked as `'<synthetic-password>'`, then the file is staged again.
   - An evidence file over the size limit may be unstaged, that one file only, if no board
     evidence list names it.
   - A trailing blank line at the end of a staged evidence `.txt` file may be removed, and CRLF
     line endings of a staged evidence `.txt` file may be converted to LF, whitespace only,
     then the file is staged again.
   - List each one. Any other finding stops the commit.
10. **Run these checks:**
    - `git diff --cached --check`;
    - a JSON parse of ORCHESTRATION.json and STATE.json;
    - `python handoff/delivery/validate_orchestration.py`;
    - `python handoff/delivery/check_recovery.py` (141 probes);
    - `python handoff/delivery/validate_package.py --preflight` (see "Python" above).

    Any failure stops the commit. If a validator stops on a board or brief issue, list every
    error you can see. Do not edit the board.
11. **Commit on main, then run `git push origin main`.** The push must fast-forward the remote
    from 300d61f. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`, and with `npm run digest`. Both must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-CALDEF-FIX2-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts from the Results)

Subject: Press the week card's scrollbar beside the floating Day editor (test)

- test(e2e): `classic-scrollbar.spec.ts:143` pressed the week card's scrollbar 60 px from its
  right end without looking at the floating Day editor. The drawer docks away from the edited
  column (docs/04); when the opened day is a Monday to Wednesday it docks right and covers that
  point, so the press landed on its note field and nothing scrolled (the gate's real-clock run
  of 2026-11-03; the accepted a54061f fails the same). The test now presses near the end the
  drawer does not cover, from its `data-side`, and first asserts that the point lies on the
  week card. Nothing is loosened; the product is unchanged.
- docs(handoff): the WP5-CALDEF-FREEZE results, the WP5-CALDEF-GATE records (FAIL on that one
  item), the diagnosis WP5-CALDEF-DIAG1, the fix WP5-CALDEF-FIX2, the path lookup, the regate
  and audit briefs, the board, the checkpoint (+ vi) and the other mission records.

Task: WP5-CALDEF-FIX2 (diagnosis WP5-CALDEF-DIAG1; failed gate WP5-CALDEF-GATE)
Gate: WP5-CALDEF-REGATE pending
Audit: WP5-CALDEF-AUDIT pending
Digest: D_PRE

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- any unstaged, masked or converted file, with its reason;
- every check, with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results

- HEAD before 300d61f055a859857aa8eb3845ed21f4560e82fa; after b810ba942c608e058bd8c146de6f076734c48bf2.
- Pushed to origin main (fast-forward); remote SHA b810ba942c608e058bd8c146de6f076734c48bf2.
- D_PRE = HEAD digest = 59e2ec3f22d951366d4a54d0564ed2731d3b4f8c1fa90bc1cfbea10ebf0d770a.
- Staged 404 paths; nothing masked, converted or unstaged. All checks exit 0.
  Details in evidence/WP5-CALDEF-FIX2-FREEZE/checks.txt.
