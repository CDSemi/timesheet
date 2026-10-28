# WP5-UX5-FIX13-FREEZE dispatch brief (one commit of FIX12, FIX13 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX13-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX12 and WP5-UX5-FIX13 (both done,
  uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (eight source and test paths, and the records since 0f52300; no
  merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with
  the task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX13-FREEZE`.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO NULL-DEVICE OR `/dev/std*` REDIRECTS (ALSO NOT IN `2>`), NO
    `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS, NO `sed -i`.**
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
   - HEAD must be 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955.
   - Run `git fetch origin`. origin/main must still be 0f52300.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these
   eight modified paths, and no untracked file. Anything else stops the commit.
   - `src/client/components/DayFieldsForm.tsx`
   - `tests/e2e/day-editor.spec.ts`
   - `tests/e2e/fixtures.ts`
   - `tests/e2e/keyboard-access.spec.ts`
   - `tests/e2e/logo.spec.ts`
   - `tests/e2e/review.spec.ts`
   - `tests/e2e/timesheet.spec.ts`
   - `tests/integration/restore.test.ts`
4. **D_PRE.** Run `npm run digest`. It must equal
   c1691aed8604a00e6fa33e89f7a1bf8970c7cef44bf2eab64239661cf6a11fba (882 files). Otherwise
   stop and report.
5. **Stage these:**
   - **the eight paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. Expected:
     - modified: `WP5-UX5-FIX11-FREEZE.md`;
     - untracked: `WP5-UX5-REGATE7.md`, `WP5-UX5-DIAG5.md`, `WP5-UX5-FIX12.md`,
       `WP5-UX5-DIAG6.md`, `WP5-UX5-FIX13.md` and `WP5-UX5-FIX13-FREEZE.md`;
   - **these folders under `handoff/delivery/evidence/`,** staged as directories:
     `WP5-UX5-FIX11-FREEZE/`, `WP5-UX5-REGATE7/`, `WP5-UX5-DIAG5/`, `WP5-UX5-FIX12/`,
     `WP5-UX5-DIAG6/` and `WP5-UX5-FIX13/`.

   If another changed path appears under `handoff/`, list it and stop. List every staged
   path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository.
   - `WP5-UX5-DIAG6/new-proc-detail.txt` holds the command lines of the owner's own tools.
     Unstage it with `git restore --staged`.
   - Then read the census files of the six staged evidence folders, including
     `WP5-UX5-DIAG6/own-proc-detail.txt` and `load-quiet.txt`.
   - Unstage any file that shows the command line of a process not started by the mission,
     such as an IDE agent, a browser, a webview or a memory tool. Process names, IDs, counts
     and CPU times are allowed.
   - List each file you unstage, with the reason.
7. **Basenames.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
8. **Scans.**
   - Run the key and PEM scan, the rule in `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`,
     over the six staged evidence folders.
   - Then run the email and Message-ID scan over everything staged.
   - **Allowed:**
     - addresses ending in `@example.invalid`;
     - Message-IDs ending in `@timesheet.invalid`;
     - the public no-reply address of a Co-Authored-By trailer quoted in earlier freeze
       records;
     - truncated fragments of a synthetic `@example.invalid` address in captured logs.
   - **Any other address or Message-ID stops the commit.**
9. **Run `node scripts/precommit-check.mjs`.**
   - A `profile-path` finding in an evidence log may be masked as `<user>`, then the file
     is staged again.
   - A `secret-assignment` finding on a synthetic password literal in an evidence probe
     script may be masked as `'<synthetic-password>'`, then the file is staged again. List
     each one.
   - An evidence file over the size limit may be unstaged, that one file only. List it.
   - Any other finding stops the commit.
10. **Run these checks:**
    - `git diff --cached --check`;
    - a JSON parse of ORCHESTRATION.json and STATE.json;
    - `validate_orchestration.py`;
    - `check_recovery.py` (106);
    - `validate_package.py --preflight`, with the workflow Python.

    Any failure stops the commit.
11. **Commit on main, then run `git push origin main`.** The push must fast-forward the
    remote from 0f52300. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`. It must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-UX5-FIX13-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Keep the Day editor's discard question after a fast Escape, and wait for the applied layout in viewport tests

- fix(day-editor): `DayFieldsForm` reports unsaved changes in a layout effect.
  - An Escape pressed right after typing in Notes now asks "Discard your changes?".
  - Before, it could close the editor and drop the note (U4-05).
- test(e2e):
  - `expectLayoutAt` and `expectSheetAt` wait until React has applied the new width before
    measuring: the top-bar clock below 768 px, and the phone sheet below 480 px. They run
    in the review, timesheet and logo sweeps.
  - The keyboard test waits for the enabled Check in button before it focuses it.
  - A deterministic test dispatches Escape in the same task as a keystroke.
- test(restore): a leased later send of the same period blocks the release
  (`superseded_by_later_send`).
- docs(handoff): REGATE7 (FAIL), DIAG5, FIX12, DIAG6 and FIX13, the board, the checkpoint
  (+ vi), STATE and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX12 and WP5-UX5-FIX13 (after WP5-UX5-REGATE7; diagnoses WP5-UX5-DIAG5 and WP5-UX5-DIAG6)
Gate: WP5-UX5-REGATE7 FAIL on 0f52300; REGATE8 pending
Audit: rechecks pending
Digest: D_PRE

## Addendum 1 (coordinator, 2026-10-28, after the first stop)

- **Why you stopped.** `validate_orchestration.py` failed: "Dependency gate not PASS:
  WP5-UX5-DIAG5". The coordinator had recorded DIAG5 as depending on the FAIL gate REGATE7.
- **Fixed on the board.**
  - DIAG5 now depends on WP5-UX5-FIX11-FREEZE, and still names REGATE7 in
    `addresses_gate`.
  - The unstaged `WP5-UX5-REGATE7/10-census-sample1.txt` is removed from REGATE7's evidence
    list.
  - FIX13-FREEZE gains a `first_stop` note.
- **Your two unstaging decisions under step 6 are accepted:**
  - `WP5-UX5-DIAG6/new-proc-detail.txt`;
  - `WP5-UX5-REGATE7/10-census-sample1.txt`.
- **Continue as the same committer:**
  - Run `git add` on `handoff/delivery/ORCHESTRATION.json` and on this brief again.
  - Confirm that nothing else changed since your staging. `git status --short` outside the
    staged set must show only the two files you left out, plus your own unstaged outputs.
  - Continue at step 10, with every check, then steps 11 to 13. Rerun the precommit check
    once on the re-staged files.

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

- HEAD before 0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955; after bb8d34039b79320e415a0224c0bd02075bd0f76a.
- Pushed to origin main (fast-forward); remote SHA equals HEAD.
- D_PRE = HEAD digest = c1691aed8604a00e6fa33e89f7a1bf8970c7cef44bf2eab64239661cf6a11fba.
- Staged 627 paths. Unstaged: DIAG6/new-proc-detail.txt and REGATE7/10-census-sample1.txt (foreign command lines). No masking.
- All checks exit 0 after the board fix. Details in evidence/WP5-UX5-FIX13-FREEZE/checks.txt.
