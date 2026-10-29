# WP5-UX5-FIX19-FREEZE dispatch brief (one commit of FIX19 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX19-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX19 (done, uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (a client file, one e2e file, the digest script, and possibly
  `DayFieldsForm.tsx` and a docs/04 clause; also the records since d96df5d; no merge
  expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX19-FREEZE`.
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
- **Confirmed at dispatch.** The coordinator fills in the next two lines before dispatch,
  from FIX19's Results:
  - D_PRE: 67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b (882 files).
  - The paths outside `handoff/`, five modified:
    - `docs/04_UX_AND_SETTINGS.md`
    - `docs/04_UX_AND_SETTINGS.vi.md`
    - `scripts/source-digest.mjs`
    - `src/client/DayEditor.tsx`
    - `tests/e2e/day-editor.spec.ts`

    `DayFieldsForm.tsx` is unchanged.
- **Digest tooling.** FIX19 adds the missing `maxBuffer` to `scripts/source-digest.mjs`. With
  the working tree's fixed script, `npm run digest` should run. If it still fails, stage
  first (step 5) and compute D_PRE with the `git ls-tree` form on the staged tree. Record
  the order you used in `checks.txt`.

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be d96df5daa25b44b156354bc96605e13e94e44396.
   - Run `git fetch origin`. origin/main must still be d96df5d.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly the paths
   confirmed above, and no untracked file. Anything else stops the commit.
4. **D_PRE.** Run `npm run digest`. It must equal the D_PRE confirmed above. Otherwise stop
   and report.
5. **Stage these:**
   - **the confirmed paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **the review pair:** `handoff/delivery/WP5_UX5_REVIEW_INT2.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. List them in `checks.txt`;
   - **every new or changed folder under `handoff/delivery/evidence/` since d96df5d,**
     staged as directories. Expected: `WP5-UX5-FIX18-FREEZE/`, `WP5-UX5-REGATE13/`,
     `WP5-UX5-AUDIT-INT2/` and `WP5-UX5-FIX19/`.

   **Expected leftovers.** Four untracked files stay out, and do not stop the commit:
   - `handoff/delivery/evidence/WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-chain1.log`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears under `handoff/`, list it and stop. List every staged
   path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository. Read every census or process file
   of the staged evidence folders. Their names contain `census`, `proc`, `priority`,
   `leftover`, `process` or `load`. Unstage any file that shows the command line of a
   process the mission did not start. Process names, IDs, counts and CPU times are allowed.
   List each file you unstage, with the reason.
7. **File types and names.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
   - Evidence is LF `.txt` or `-synthetic.png`. Unstage any staged evidence file with
     another extension, and list it.
8. **Scans.**
   - Run the key and PEM scan, the rule in `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`,
     over the staged evidence folders.
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
    remote from d96df5d. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`, and with `npm run digest`. Both must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-UX5-FIX19-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts from FIX19's Results)

Subject: Never let a session write in the open Day editor overwrite day fields changed elsewhere, and let npm run digest run again

- fix(day-editor): a session save, "Confirm breaks" or delete answer replaces the held day
  fields and entry version only when they match what the form was seeded with.
  - Otherwise, with no unsaved edit, the form restarts from the server's day.
  - Otherwise, with an unsaved edit, the save is refused and "Reload day" reads the change.
  - Before, the next "Save day fields" could silently overwrite another device's change.
    This was pre-existing since WP2-T10.
- fix(scripts): `source-digest.mjs` lists files with a 64 MiB buffer. Since the tracked
  list passed 1 MiB, `npm run digest` failed with ENOBUFS in every checkout.
- test(e2e): the session write and delete cases, the typed-note case, and pins for FIX18's
  guards (WFH, partial leave, the delete confirmation, the overtaken read).
- docs(04): only if FIX19 changed it (the tab-return clause).
- docs(handoff): REGATE13 (PASS), AUDIT-INT2 (FIX REQUIRED) with its review pair, FIX19,
  the board, the checkpoint (+ vi), STATE and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX19 (after WP5-UX5-AUDIT-INT2)
Gate: WP5-UX5-REGATE13 PASS on d96df5d; REGATE14 pending
Audit: WP5-UX5-AUDIT-INT2 FIX REQUIRED (F-UX5I2-1, F-UX5I2-2); WP5-UX5-AUDIT-INT3 pending
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
