# WP5-UX5-FIX9-FREEZE dispatch brief (one commit of FIX7 to FIX9 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX9-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX7, WP5-UX5-FIX8 and WP5-UX5-FIX9 (all
  done).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size M, risk M (27 source paths and a large staged set of records; no rename
  expected; no merge).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Starting point,** from the lookup WP5-UX5-FIX9-PATHS (2026-10-27):
  - HEAD = origin/main = f4049aa7905e22f1467dfcae4208675cb2fc8e80;
  - the staged diff is empty;
  - outside `handoff/`, exactly the 27 modified paths listed in
    `handoff/delivery/evidence/WP5-UX5-FIX9/end-diffstat.txt`;
  - every changed file is LF;
  - no blocker.
- **Runtime.** The same as in `handoff/delivery/tasks/WP5-UX5-FIX6-FREEZE.md` ("Runtime"),
  with the task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX9-FREEZE`. In short:
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON, NO PIPES INTO `head`, `tail` OR `cat`, NO
    NULL-DEVICE OR `/dev/std*` REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO
    INTERACTIVE SHELLS.**
  - Use the workflow Python for the validators, and put Node 24 first on PATH.
  - **Staging:** use plain `git add` with literal paths, at most about 20 per call. Folders
    may be staged as directories. Never use `--pathspec-from-file`, `xargs`, a list file, a
    glob, `-A` or `.`.
  - **Never change any git configuration.**
  - **If a permission check denies any call, stop and report the reason exactly. Do not
    retry it in another form.**
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
  - Keep Results short. Long listings go to `checks.txt`.
- The coordinator writes no file while you run.

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be f4049aa7905e22f1467dfcae4208675cb2fc8e80.
   - Run `git fetch origin`. origin/main must still be f4049aa.

   If either differs, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly the 27
   modified paths of `handoff/delivery/evidence/WP5-UX5-FIX9/end-diffstat.txt`. Read that
   file, and record both lists in `checks.txt`. Anything extra, missing or untracked stops
   the commit.
4. **D_PRE.** Run `npm run digest` in the repository and record the value as D_PRE.
   - It must equal FIX9's digest,
     462a1cd70e533a95354097b928c0479c4db77b00f7215c5ae074453d7807e0a0, over 882 files.
   - If it differs, stop and report.
5. **Stage:**
   - **the 27 source paths from step 3,** each typed as a literal path;
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
     - `handoff/delivery/WP5_UX5_REVIEW_A.md` and `.vi.md`;
     - `handoff/delivery/WP5_UX5_REVIEW_B.md` and `.vi.md`;
     - every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`, this brief
       included. Expected:
       - modified: `WP5-UX5-AUDIT-A.md`, `WP5-UX5-AUDIT-B.md`, `WP5-UX5-FIX6-FREEZE.md`;
       - untracked: `WP5-UX5-REGATE4.md`, `WP5-UX5-PLAN-FIX7.md`, `WP5-UX5-PLAN-FIX7A.md`,
         `WP5-UX5-FIX7.md`, `WP5-UX5-FIX8.md`, `WP5-UX5-FIX9.md`, `WP5-UX5-FIX9-PATHS.md`,
         `WP5-UX5-FIX9-FREEZE.md`;
     - as directories, these evidence folders under `handoff/delivery/evidence/`:
       `WP5-UX5-REGATE4/`, `WP5-UX5-AUDIT-A/`, `WP5-UX5-AUDIT-B/`, `WP5-UX5-PLAN-FIX7/`,
       `WP5-UX5-PLAN-FIX7A/`, `WP5-UX5-FIX6-FREEZE/`, `WP5-UX5-FIX7/`, `WP5-UX5-FIX8/` and
       `WP5-UX5-FIX9/`.

   Use the names exactly as `git status` shows them. If a name differs, or another changed
   path appears under `handoff/`, list it and stop.

   List every staged path in `checks.txt`, with a count per group. The lookup counted 9
   modified and 566 untracked under `handoff/`, before this brief and the board updates.
6. **Basenames.** Any staged basename that contains "signature" (any case) without
   "synthetic" stops the commit; list it. Any staged `.png` whose name does not end in
   `-synthetic.png` also stops the commit.
7. **Scans.** Run the key and PEM scan (the rule in
   `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`, "Key and PEM scan on the new evidence
   folders") over the nine staged evidence folders. Then the email and Message-ID scan
   over everything staged.
   - **Allowed:**
     - addresses ending in `@example.invalid`;
     - Message-IDs ending in `@timesheet.invalid`;
     - the public no-reply address of a Co-Authored-By trailer quoted in earlier freeze
       records;
     - truncated fragments of a synthetic `@example.invalid` address in captured logs
       (for example `employee@examp`), which REGATE4 recorded.
   - **Any other address or Message-ID stops the commit.** Record each hit and its class in
     `checks.txt`, without the content.
8. Run `node scripts/precommit-check.mjs`.
   - A `profile-path` finding in an evidence log may be masked as `<user>`, then re-staged.
   - An evidence file over the size limit may be unstaged (that one file only), and listed.
   - Any other finding stops the commit.
9. **Run these checks:**
   - `git diff --cached --check`;
   - a JSON parse of ORCHESTRATION.json and STATE.json;
   - `validate_orchestration.py`;
   - `check_recovery.py` (106);
   - `validate_package.py --preflight`.

   Any failure stops the commit.
10. **Commit on main, then `git push origin main`.** The push must fast-forward the remote
    from f4049aa. Record the remote SHA, which must equal HEAD.
11. **Compare digests.** Compute the digest of HEAD's tree with the `git ls-tree` form at
    the top of `scripts/source-digest.mjs`, as in earlier freezes. It must equal D_PRE.
12. **Write the outputs.** Write `checks.txt` and `commit-message.txt` in
    `handoff/delivery/evidence/WP5-UX5-FIX9-FREEZE/`, and a short Results here. Leave them
    unstaged.

**Allowed edits:** only those in step 8. Anything else that fails stops the commit; report
it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix round-5 audit findings: signed footer, keyboard and touch access, PDF leave line, in-flight sends

- fix(review): on a signed period opened again, "Sign correction" drops under the signed
  content on narrower windows. The name, image and "Signed" stay readable, and the four
  signature lines stay aligned.
- fix(a11y):
  - the "Change days" button is named by the words it shows (SC 2.5.3);
  - read-only week cards that scroll sideways take keyboard focus while they overflow
    (SC 2.1.1);
  - an `aria-label` on a generic element was removed.
- fix(day-editor): a touch swipe or a press on a week card's scrollbar no longer closes
  the Day editor. Mouse and pen behaviour is unchanged.
- fix(pdf): on a day with both a holiday label and leave, "Leave h:mm" keeps its own line,
  and the holiday label is cut first.
- fix(sends): a send job still waiting for any revision of the period blocks a new send
  (409), so an older copy cannot arrive after the correction.
- test:
  - the sign-off PDF ignores the Settings time switch;
  - the reason never appears in the email, now checked on the decoded body;
  - new e2e tests for the signed footer, touch, scrollbars, names, the ladder forms and the
    week cards.
- chore(scripts): the container drill closes each connection.
- docs: documents 03, 04, 05, 10 and 12, EN and VI, match the build. docs/10 records the
  owner decision H-1 a.
- docs(handoff): REGATE4 PASS, the area A and B audits (FIX REQUIRED) with their review
  pairs, the fix plans, FIX7 to FIX9, the lookup, the board, the checkpoint (+ vi), STATE
  and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX7 (AUDIT-B findings), WP5-UX5-FIX8 (AUDIT-A findings), WP5-UX5-FIX9 (axe)
Gate: WP5-UX5-REGATE4 PASS on f4049aa; REGATE5 pending
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

## Addendum 1 (coordinator, after the precommit stop)

- **What happened.** The first run stopped correctly, before any commit.
  `scripts/precommit-check.mjs` blocked two `secret-assignment` findings in
  `handoff/delivery/evidence/WP5-UX5-AUDIT-B/94-http-areab.mjs.txt`, lines 380 and 381.
  They are synthetic password literals in an auditor's probe script, stored as evidence
  text. The 603 paths are still staged, and HEAD is still f4049aa.
- **Coordinator decision: one more allowed edit.** In that file, and on those two lines
  only, replace each quoted password literal with the placeholder `'<synthetic-password>'`.
  Use the Edit tool, and keep everything else on the line. Record it in `checks.txt` as
  "masked at freeze: synthetic password literals, lines 380-381". The probe text stays as
  evidence of the method. It no longer runs as is, and that is accepted. Change no other
  line, and no other file.
- **Then continue from step 8:**
  1. Re-stage that file.
  2. The coordinator updated six records after your staging: the board, STATE, the
     checkpoint pair and the NEXT_ACTION pair. This brief changed too. Re-stage those
     seven files with plain `git add`.
  3. Confirm that the staged set is still the step-5 set: the same paths, and the same
     counts per group.
  4. Rerun step 7's scans on the re-staged files.
  5. Run `node scripts/precommit-check.mjs`. Any other finding stops the commit.
  6. Continue with steps 9 to 12.
- Report the masking under "any masking or unstaged file".

## Results

Committed 94accda904240fda1cf500063d8b30d3a3603fd2 on main (603 paths) and pushed
(f4049aa..94accda); remote = HEAD. Masked at freeze: synthetic password literals, lines
380-381 of evidence/WP5-UX5-AUDIT-B/94-http-areab.mjs.txt. HEAD digest = D_PRE. All checks
exit 0. See evidence/WP5-UX5-FIX9-FREEZE/checks.txt.
