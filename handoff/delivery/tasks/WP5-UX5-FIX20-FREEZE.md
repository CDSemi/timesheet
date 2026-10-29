# WP5-UX5-FIX20-FREEZE dispatch brief (one commit of FIX20 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX20-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX20 (done, uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk L (documentation files outside `handoff/` and the records since
  dc487c6, including synthetic sample renders; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX20-FREEZE`.
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
- **Confirmed at dispatch.** The coordinator fills in these lines from FIX20's Results:
  - D_PRE: 690fd8fd588c902f03cbc9c6efeb63cd58f5c9246579dda0473a190a230c1c4f (882 files).
  - The paths outside `handoff/`, six modified:
    - `DEVELOPMENT.md`
    - `DEVELOPMENT.vi.md`
    - `README.md`
    - `README.vi.md`
    - `docs/12_RELEASE_NOTES.md`
    - `docs/12_RELEASE_NOTES.vi.md`

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be dc487c6114dd488121b1de1444e11cdacf5c237b.
   - Run `git fetch origin`. origin/main must still be dc487c6.

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
   - **the review pair:** `handoff/delivery/WP5_UX5_REVIEW_RN.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. Expected: RELNOTES-FREEZE, REGATE15, AUDIT-RN, FIX20, FIX20-FREEZE, REGATE16
     and RECHECK-RN. List them in `checks.txt`;
   - **every new or changed folder under `handoff/delivery/evidence/` since dc487c6,**
     staged as directories. Expected: `WP5-UX5-RELNOTES-FREEZE/`, `WP5-UX5-REGATE15/`
     (including `samples/` with six `-synthetic.png` renders), `WP5-UX5-AUDIT-RN/`, and
     `WP5-UX5-FIX20/` if FIX20 wrote one.

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
   - **Allowed:**
     - addresses ending in `@example.invalid`;
     - Message-IDs ending in `@timesheet.invalid`;
     - the public no-reply address of a Co-Authored-By trailer quoted in earlier freeze
       records;
     - truncated fragments of a synthetic `@example.invalid` address in captured logs.
   - **Any other address or Message-ID stops the commit.**
   - The sample messages in `WP5-UX5-REGATE15/samples/` are synthetic captures. Check them
     like any other file.
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
    remote from dc487c6. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`, and with `npm run digest`. Both must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-UX5-FIX20-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts from FIX20's Results)

Subject: State the accepted WP4 and WP5 status in DEVELOPMENT and give the release notes one release rule

- docs(development): line 3, in EN and VI, now says WP1 to WP4 are independently accepted and
  WP5 is software ready (re-accepted after UI change rounds 1 to 5), with the pilot pending
  and the NAS NOT VERIFIED. It names the WP5 handoff. This fixes F-UX5RN-1.
- docs(12): the release is the last WP5 freeze commit, gated and audited, after the
  documentation-only refreshes that followed REGATE14 and AUDIT-INT3 on 0b45781
  (R-UX5RN-1). The round-5 drill line keeps the slices' checks (R-UX5RN-2) and names the
  Dockerfile and `vite.config.ts` in the carry-forward (R-UX5RN-3).
- docs(readme): the handoff list in step 3 reads naturally; the VI list gets its missing
  comma (R-UX5RN-5).
- docs(handoff): the RELNOTES-FREEZE evidence, REGATE15 (PASS, with the pilot samples
  regenerated from dc487c6), AUDIT-RN (FIX REQUIRED) with its review pair, FIX20, the board,
  the checkpoint (+ vi), STATE and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX20 (after WP5-UX5-AUDIT-RN)
Gate: WP5-UX5-REGATE15 PASS on dc487c6; REGATE16 pending
Audit: WP5-UX5-AUDIT-RN FIX REQUIRED (F-UX5RN-1); WP5-UX5-RECHECK-RN pending
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
