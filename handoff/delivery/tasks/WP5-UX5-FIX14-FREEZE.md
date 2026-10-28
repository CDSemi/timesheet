# WP5-UX5-FIX14-FREEZE dispatch brief (one commit of FIX14 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX14-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX14 (done, uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (five source and test paths, and the records since bb8d340; no
  merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with
  the task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX14-FREEZE`.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO NULL-DEVICE OR `/dev/std*` REDIRECTS (ALSO NOT IN `2>`), NO
    `rm -r`, NO PID KILLS, NO INTERACTIVE OR DETACHED SHELLS, NO `sed -i`.**
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
   - HEAD must be bb8d34039b79320e415a0224c0bd02075bd0f76a.
   - Run `git fetch origin`. origin/main must still be bb8d340.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these five
   modified paths, and no untracked file. Anything else stops the commit.
   - `src/client/App.tsx`
   - `src/client/components/ThemeToggle.tsx`
   - `tests/e2e/controls.spec.ts`
   - `tests/e2e/theme.spec.ts`
   - `tests/e2e/timesheet.spec.ts`
4. **D_PRE.** Run `npm run digest`. It must equal
   419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708 (882 files). Otherwise
   stop and report.
5. **Stage these:**
   - **the five paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. Expected:
     - modified: `WP5-UX5-FIX13-FREEZE.md`;
     - untracked: `WP5-UX5-REGATE8.md`, `WP5-UX5-DIAG7.md`, `WP5-UX5-DIAG8.md`,
       `WP5-UX5-FIX14.md` and `WP5-UX5-FIX14-FREEZE.md`;
   - **these folders under `handoff/delivery/evidence/`,** staged as directories:
     `WP5-UX5-FIX13-FREEZE/`, `WP5-UX5-REGATE8/`, `WP5-UX5-DIAG7/`, `WP5-UX5-DIAG8/` and
     `WP5-UX5-FIX14/`.

   **Expected leftovers.** Two untracked files were left out of the last freeze for privacy,
   and stay out: `handoff/delivery/evidence/WP5-UX5-DIAG6/new-proc-detail.txt` and
   `handoff/delivery/evidence/WP5-UX5-REGATE7/10-census-sample1.txt`. They do not stop the
   commit. If any other changed path appears under `handoff/`, list it and stop.

   List every staged path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository.
   - Read every census or process file of the five staged evidence folders. Their names
     contain `census`, `proc` or `load`; examples are `WP5-UX5-REGATE8/10-census-*.txt`,
     `WP5-UX5-DIAG7/census-summary.txt`, `WP5-UX5-DIAG8/census-*.txt`,
     `WP5-UX5-DIAG8/end-census.txt` and `WP5-UX5-FIX14/census-*.txt`.
   - Unstage any file that shows the command line of a process the mission did not start,
     such as an IDE agent, a browser, a webview, Docker or a memory tool. Process names, IDs,
     counts and CPU times are allowed.
   - List each file you unstage, with the reason.
7. **File types and names.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
   - Evidence is LF `.txt`. Unstage any staged evidence file with another extension, for
     example `WP5-UX5-REGATE8/log-chain1.log` and `log-master.log`. List each one.
8. **Scans.**
   - Run the key and PEM scan, the rule in `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`,
     over the five staged evidence folders.
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
    remote from bb8d340. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`. It must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-UX5-FIX14-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Let every tab follow a theme chosen in another tab, and wait for the applied period and layout in three e2e specs

- fix(theme): `followThemeOfOtherTabs` keeps `data-theme` in step with the choice another
  tab stores. `App` mounts it once, so a tab whose account menu or More panel is closed
  follows too.
  - The accepted UX2 rule is "a storage event keeps other tabs in step".
  - WP5-UX3-T02 had moved the only listener into the menu, so the rule held only while the
    menu was open.
- test(e2e):
  - `controls.spec.ts`: `expectLayoutAt` after each width change in the title-row gap tests.
    Before, the card was read in the stale phone layout and the title row after React's
    commit.
  - `timesheet.spec.ts`: `stepPeriod` waits for `data-period-due` to change after Next or
    Previous. Before, the range ladder could read the old period, or measure the wrong one.
  - `theme.spec.ts`: `bringToFront` before each step a tab drives or reads, so a busy host
    no longer starves the tab behind. A new test covers the cross-tab case with the menu
    closed.
- docs(handoff): REGATE8 (FAIL), DIAG7, DIAG8 and FIX14, the FIX13-FREEZE outputs, the
  board, the checkpoint (+ vi), STATE and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX14 (after WP5-UX5-REGATE8; diagnoses WP5-UX5-DIAG7 and WP5-UX5-DIAG8)
Gate: WP5-UX5-REGATE8 FAIL on bb8d340; REGATE9 pending
Audit: rechecks pending
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

- HEAD before bb8d34039b79320e415a0224c0bd02075bd0f76a; after bd9c2757d51d4efa8fe99ad2cd548217e2dd7d23.
- Pushed to origin main (fast-forward); remote SHA equals HEAD.
- D_PRE = HEAD digest = 419ede40b259e649a685241214a8d11f791a76d537f918964ad46ac97af76708.
- Staged 549 paths. Unstaged REGATE8 log-chain1.log and log-master.log (not .txt). Masked `nobody` in 3 mask.mjs.txt files.
- All checks exit 0 (precommit after masking). Details in evidence/WP5-UX5-FIX14-FREEZE/checks.txt.
