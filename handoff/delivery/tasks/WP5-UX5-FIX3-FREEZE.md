# WP5-UX5-FIX3-FREEZE dispatch brief (fast-forward to the synchronized origin, commit, push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX3-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX3 (done).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size M, risk M (a fast-forward, edits to two owner records, a large staged set).
- **Authority.**
  - AGENTS.md rule 12 and docs/08 "Commits and pushes".
  - The owner's chat of 2026-10-23, which relays the Ingat-track coordinator's message
    verbatim (board `owner_decisions` and `answered_owner_question_ux5_ff`):
    - the synchronization is done. origin/main =
      9f186b264f8d9fac671e58ab63de54fa38f75977 contains the merge b8bae50, whose parents
      are db87939 and the mission's 7aafa21;
    - save, restore and re-add the two sections of the INGAT checkpoint pair;
    - `git merge --ff-only origin/main`;
    - commit the listed INGAT files with the mission's files;
    - push.
  - The owner allows pushes to main again.
- **Runtime.** The same as the "Runtime" item (line 22) of
  `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`, with the task folder
  `D:\.claude-tmp\timesheet\WP5-UX5-FIX3-FREEZE`.
  - The capitalised rules apply: NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO
    `head` OR `tail`, NO NULL-DEVICE REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO
    INTERACTIVE SHELLS.
  - Use the workflow Python for the validators, and put Node 24 first on PATH.
  - **Staging:** use plain `git add` with literal paths, at most about 20 per call. Folders
    may be staged as directories. Never use `--pathspec-from-file`, `xargs`, a list file, a
    glob, `-A` or `.`.
  - **If a permission check denies any call, stop and report the reason exactly. Do not
    retry it in another form.**
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
  - Keep Results short; long listings go to `checks.txt`.
- The coordinator writes no file while you run.

## Steps

1. **Check the starting point.**
   - Run `node --version`. HEAD must be 7aafa21bc1c6efc70c0fa8691c3a1165841aeb45.
   - Run `git fetch origin`. origin/main must be
     9f186b264f8d9fac671e58ab63de54fa38f75977.
   - `git merge-base --is-ancestor HEAD origin/main` must exit 0.
   - `git show -s --format=%P b8bae50` must list 7aafa21.

   If any of these differs, stop and report.
2. `git diff --cached --name-status` must be empty.
3. **Save the owner's two sections.** For each file of the pair
   `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` and `.vi.md`:
   - save its full current content and `git diff -- <file>` into the task folder;
   - from the uncommitted additions, extract the two sections "Structural audit of
     ingat.toml" and "Design review of the manifest format" (the VI file has the matching
     Vietnamese headings) into `section-en.md` and `section-vi.md` in the task folder,
     using Read and Write.

   If the uncommitted diff holds anything other than those two sections, save it all, list
   it, and stop.
4. Run `git restore -- handoff/delivery/INGAT_T0_T8_CHECKPOINT.md
   handoff/delivery/INGAT_T0_T8_CHECKPOINT.vi.md`. Restore no other path.
5. **Fast-forward.** Run `git merge --ff-only origin/main`. HEAD must become 9f186b2. If
   git refuses, list the files it names and stop. Never merge any other way.
6. **Re-add the sections** at the end of each file of the pair, after the existing
   sections, using the Edit tool (EN to `.md`, VI to `.vi.md`). Copy the text exactly.
   If the fast-forwarded file already contains a section with the same heading, do not
   duplicate it: report it and stop.
7. **The working tree.**
   - Outside `handoff/`, `git status --short` must show exactly
     `tests/e2e/controls.spec.ts` and `tests/e2e/fixtures.ts` (FIX3). Anything else stops
     the commit.
   - Run `npm run digest` and record it as **D_PRE**.
8. **Stage:**
   - the two FIX3 test files;
   - the owner's INGAT files named in the relayed message:
     - `handoff/delivery/INGAT_T0_T8_CHECKPOINT.md` and `.vi.md`;
     - `handoff/delivery/INGAT_TOML_REVIEW.md` and `.vi.md`;
     - `handoff/delivery/INGAT_MANIFEST_DESIGN_REVIEW.md` and `.vi.md`;
     - `handoff/delivery/tasks/INGAT-TOML-AUDIT.md`,
       `handoff/delivery/tasks/INGAT-MANIFEST-DESIGN.md`;
     - `handoff/delivery/evidence/INGAT-TOML-AUDIT/` and
       `handoff/delivery/evidence/INGAT-MANIFEST-DESIGN/`, as directories.

     Use the names exactly as `git status` shows them. If a name differs, list it.
   - the mission's records, every changed path that matches one of these patterns:
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
     - `handoff/delivery/tasks/WP5-UX5-*.md`;
     - folders under `handoff/delivery/evidence/WP5-UX5-*/`, as directories.

   List every staged path in `checks.txt`. Any other changed path under `handoff/` stops
   the commit.
9. **Basenames.** Any staged basename that contains "signature" without "synthetic" is
   renamed with `git mv`. List every rename.
10. **Scans.** Run the key and PEM scan (the rule of `WP5-UX4-FIX3-FREEZE.md`) on the new
    evidence folders, the INGAT ones included. An email other than `@example.invalid`,
    or a Message-ID other than `@timesheet.invalid`, stops the commit.
11. Run `node scripts/precommit-check.mjs`.
    - A `profile-path` finding in an evidence log may be masked as `<user>`, then
      re-staged.
    - An evidence file over the size limit may be unstaged (that one file only), and
      listed.
    - Any other finding stops the commit.
12. Run these checks:
    - `git diff --cached --check`;
    - a JSON parse of ORCHESTRATION.json and STATE.json;
    - `validate_orchestration.py`;
    - `check_recovery.py` (106);
    - `validate_package.py --preflight`.

    **One allowed fix:** if the preflight fails only on a local link in an INGAT review
    file (`INGAT_MANIFEST_DESIGN_REVIEW.md` or `INGAT_TOML_REVIEW.md`, EN or VI) that
    points to a directory, point that link to one file inside that directory instead. Use
    the folder's README, or its first file in name order. Change it the same way in both
    languages, re-stage, rerun, and list the change. Any other failure stops the commit.
13. **Commit on main, then `git push origin main`.** The push must fast-forward the remote
    from 9f186b2. Record the remote SHA, which must equal HEAD.
14. Compute the `git ls-tree` digest of HEAD. It must equal D_PRE.
15. Write `checks.txt` and `commit-message.txt` in
    `handoff/delivery/evidence/WP5-UX5-FIX3-FREEZE/`, and a short Results here. Leave
    them unstaged.

**Allowed edits:** only the ones in steps 3, 4, 6, 9, 11 and 12. Anything else that fails
stops the commit; report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix two load-dependent e2e flakes and record the Ingat synchronization

- test(e2e): `signInPageAs` (`fixtures.ts`) waits for the Sign in button before filling,
  so the email no longer lands in the Administration screen's own Email field during
  sign-out.
- test(e2e): the chevron test waits for no "Loading..." placeholder and six still frames
  before it measures and screenshots (`controls.spec.ts`).
- docs(handoff):
  - Ingat: the T0-T8 checkpoint with the two re-added sections; the manifest design and
    TOML reviews (+ vi), with their tasks and evidence (owner's track);
  - WP5: the REGATE2 record (FAIL on two flakes) and evidence; the FIX3 record; the
    lookups; the board with the INGAT tasks registered under `external_tracks`; the
    checkpoint (+ vi).
- On top of origin/main 9f186b2, which holds the owner's merge b8bae50 of the mission's
  7aafa21 (fast-forward).

Task: WP5-UX5-FIX3 (WP5-UX5-REGATE2 findings); Ingat synchronization records (owner relay)
Gate: WP5-UX5-REGATE2 FAIL on 7aafa21; REGATE3 pending
Audit: pending
Digest: D_PRE

## Report

Append briefly:
- HEAD before, after the fast-forward, and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- the sections re-added (lines);
- any rename, masking or link fix;
- every check with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results

- Done. HEAD 7aafa21 -> ff 9f186b2 -> commit 5b8b7184692fff683c4083c9fc5610acd47bece1; pushed;
  remote SHA = HEAD. D_PRE = HEAD digest = edcca194...041ce.
- 177 files staged; sections re-added (+92/+91 lines); one link fix (MANIFEST_DESIGN review, EN+VI);
  no rename or masking. All checks exit 0 (preflight 0 after the fix). Details: evidence/WP5-UX5-FIX3-FREEZE/checks.txt.
