# WP5-UX5-FIX15-FREEZE dispatch brief (one commit of FIX15 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX15-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX15 (done, uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (four test paths, and the records since bd9c275; no merge
  expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX15-FREEZE`.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NOT EVEN `node -e 1`, NO
    `python -c`), NO PIPES INTO `head`, `tail` OR `cat`, NO NULL-DEVICE OR `/dev/std*`
    REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO INTERACTIVE OR DETACHED
    SHELLS, NO `sed -i`.**
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
   - HEAD must be bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23.
   - Run `git fetch origin`. origin/main must still be bd9c275.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these four
   modified paths, and no untracked file. Anything else stops the commit.
   - `tests/e2e/day-editor.spec.ts`
   - `tests/e2e/fixtures.ts`
   - `tests/e2e/today.spec.ts`
   - `tests/integration/timesheet-api.test.ts`
4. **D_PRE.** Run `npm run digest`. It must equal
   ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f (882 files). Otherwise
   stop and report.
5. **Stage these:**
   - **the four paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. Expected:
     - modified: `WP5-UX5-FIX14-FREEZE.md`;
     - untracked: `WP5-UX5-REGATE9.md`, `WP5-UX5-DIAG9.md`, `WP5-UX5-FIX15.md` and
       `WP5-UX5-FIX15-FREEZE.md`;
   - **these folders under `handoff/delivery/evidence/`,** staged as directories:
     `WP5-UX5-FIX14-FREEZE/`, `WP5-UX5-REGATE9/`, `WP5-UX5-DIAG9/` and `WP5-UX5-FIX15/`.

   **Expected leftovers.** Four untracked files were left out of earlier freezes and stay
   out. They do not stop the commit:
   - `handoff/delivery/evidence/WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-chain1.log`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears under `handoff/`, list it and stop.

   List every staged path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository.
   - Read every census or process file of the four staged evidence folders. Their names
     contain `census`, `proc` or `load`; examples are `WP5-UX5-REGATE9/10-census-*.txt` and
     `WP5-UX5-FIX15/*census*.txt`.
   - Unstage any file that shows the command line of a process the mission did not start,
     such as an IDE agent, a browser, a webview, Docker or a memory tool. Process names, IDs,
     counts and CPU times are allowed.
   - List each file you unstage, with the reason.
7. **File types and names.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
   - Evidence is LF `.txt`. Unstage any staged evidence file with another extension, and
     list it.
8. **Scans.**
   - Run the key and PEM scan, the rule in `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`,
     over the four staged evidence folders.
   - Then run the email and Message-ID scan over everything staged.
   - **Allowed:**
     - addresses ending in `@example.invalid`;
     - Message-IDs ending in `@timesheet.invalid`;
     - the public no-reply address of a Co-Authored-By trailer quoted in earlier freeze
       records;
     - truncated fragments of a synthetic `@example.invalid` address in captured logs.
   - **Any other address or Message-ID stops the commit.**
9. **Run `node scripts/precommit-check.mjs`.**
   - A `profile-path` finding in an evidence file may be masked as `<user>`, then the file is
     staged again.
   - A `secret-assignment` finding on a synthetic password literal in an evidence probe
     script may be masked as `'<synthetic-password>'`, then the file is staged again.
   - An evidence file over the size limit may be unstaged, that one file only.
   - List each one. Any other finding stops the commit.
10. **Run these checks:**
    - `git diff --cached --check`;
    - a JSON parse of ORCHESTRATION.json and STATE.json;
    - `validate_orchestration.py`;
    - `check_recovery.py` (106);
    - `validate_package.py --preflight`, with the workflow Python.

    Any failure stops the commit. If a file you unstaged is named in a board evidence list,
    stop and report it; do not edit the board.
11. **Commit on main, then run `git push origin main`.** The push must fast-forward the
    remote from bd9c275. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`. It must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-UX5-FIX15-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Keep e2e tests off the reporting-zone midnight and file a check-in under the date it started

- test(e2e):
  - `clockIn` looks for the open session on the day it read and on the next day. It asserts
    the found day against the session's own start instant. Before, a check-in answered just
    after local midnight was looked for on the previous day.
  - An automatic fixture holds a test before it starts, when the reporting-zone midnight is
    less than 45 s away. It reads only the runner's clock and the seed's saved zone. It makes
    no sign-in, request or database access, skips no test and changes no assertion.
  - The deliberate midnight-crossing test in `today.spec.ts` is exempt.
- test(integration): a check-in at the reporting-zone midnight boundary is filed under the
  date of its own start (docs/02, D-05). Read the test for the exact instants.
- docs(handoff): REGATE9 (FAIL), DIAG9 and FIX15, the FIX14-FREEZE outputs, the board, the
  checkpoint (+ vi), STATE and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX15 (after WP5-UX5-REGATE9; diagnosis WP5-UX5-DIAG9)
Gate: WP5-UX5-REGATE9 FAIL on bd9c275; REGATE10 pending
Audit: rechecks pending
Digest: D_PRE

## Addendum 1 (coordinator, 2026-10-28, after the first stop)

- **Why you stopped.** `git diff --cached --check` exited 2. The cause was a new blank line
  at the end of `handoff/delivery/tasks/WP5-UX5-DIAG9.md`. You were right to stop: the brief
  allowed no such fix.
- **Fixed by the coordinator.** The trailing blank line is removed. The file now ends with
  "Status: done" and one newline. The board's `first_stop` note for this task records it.
- **Your heredoc** for the JSON-parse script is recorded as a slip. Do not use one again:
  write scripts with the Write tool.
- **Continue as the same committer:**
  - Run `git add` again on `handoff/delivery/tasks/WP5-UX5-DIAG9.md`,
    `handoff/delivery/ORCHESTRATION.json` and this brief.
  - Confirm that nothing else changed since your staging. `git status --short` outside the
    staged set must show only the four known leftovers.
  - Continue at step 10 with every check: `git diff --cached --check`, the JSON parse,
    `validate_orchestration.py`, `check_recovery.py` and `validate_package.py --preflight`.
    Then do steps 11 to 13.
  - Rerun the precommit check once on the re-staged files.

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

- HEAD before bd9c2757; after be2afa2e3c43514581ed62fd145c15eeef13b534. Pushed (fast-forward); remote SHA equals HEAD.
- D_PRE = HEAD digest = ff73565b48f1101cd8038d08eb24270970e58b0ef1c02378be431cc7134c686f.
- Staged 433 paths; no unstaged or masked file. All checks exit 0 after the Addendum 1 fix. See evidence/WP5-UX5-FIX15-FREEZE/checks.txt.
