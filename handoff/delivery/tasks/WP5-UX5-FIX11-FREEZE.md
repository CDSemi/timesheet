# WP5-UX5-FIX11-FREEZE dispatch brief (one commit of FIX11 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX11-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX11 (done).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (15 source and doc paths and the records since a5533b5; no merge
  expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** The same as in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md`
  ("Runtime"), with the task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX11-FREEZE`.
  - **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
    `head`, `tail` OR `cat`, NO NULL-DEVICE OR `/dev/std*` REDIRECTS (ALSO NOT IN `2>`), NO
    `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
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
   - HEAD must be a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5.
   - Run `git fetch origin`. origin/main must still be a5533b5.

   If either differs, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these
   15 modified paths, with no untracked file. Anything else stops the commit.
   - `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
   - `docs/05_SUBMISSION_AND_NOTIFICATIONS.md`,
     `docs/05_SUBMISSION_AND_NOTIFICATIONS.vi.md`
   - `docs/11_OPERATIONS_RUNBOOK.md`, `docs/11_OPERATIONS_RUNBOOK.vi.md`
   - `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`
   - `src/client/components/TimesheetSheet.tsx`
   - `src/client/styles.css`
   - `src/server/ops/restore.ts`
   - `tests/e2e/review.spec.ts`
   - `tests/integration/pdf-render.test.ts`
   - `tests/integration/restore.test.ts`
   - `tests/integration/sends.test.ts`
4. **D_PRE.** Run `npm run digest`. It must equal
   20709d60c814111294bc2386ca5be15fe4b9f1e17f2d24d2f269747a966d9516 (882 files). Otherwise
   stop and report.
5. **Stage:**
   - **the 15 paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
     - `handoff/delivery/WP5_UX5_RECHECK_A.md` and `.vi.md`;
     - `handoff/delivery/WP5_UX5_RECHECK_B.md` and `.vi.md`;
     - every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`, this brief
       included. Expected:
       - modified: `WP5-UX5-FIX10-FREEZE.md`;
       - untracked: `WP5-UX5-REGATE6.md`, `WP5-UX5-RECHECK-A.md`, `WP5-UX5-RECHECK-B.md`,
         `WP5-UX5-FIX11.md`, `WP5-UX5-FIX11-FREEZE.md`;
     - as directories, under `handoff/delivery/evidence/`: `WP5-UX5-FIX10-FREEZE/`,
       `WP5-UX5-REGATE6/`, `WP5-UX5-RECHECK-A/`, `WP5-UX5-RECHECK-B/` and
       `WP5-UX5-FIX11/`.

   If another changed path appears under `handoff/`, list it and stop. List every staged
   path in `checks.txt`, with a count per group.
6. **Basenames.** Any staged basename that contains "signature" (any case) without
   "synthetic" stops the commit. So does any staged `.png` not ending in `-synthetic.png`.
7. **Scans.** Run the key and PEM scan (the rule in
   `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`) over the five staged evidence folders.
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
    from a5533b5. Record the remote SHA, which must equal HEAD.
11. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`. It must equal D_PRE.
12. **Write the outputs.** Write `checks.txt` and `commit-message.txt` in
    `handoff/delivery/evidence/WP5-UX5-FIX11-FREEZE/`, and a short Results here. Leave them
    unstaged.

**Allowed edits:** only those in step 8. Anything else that fails stops the commit; report
it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Keep a held superseded send held after restore, and paint the week card focus ring on all edges

- fix(restore): `outbound release` refuses a held send once any later revision of the
  same period has a send (`superseded_by_later_send`). An older copy can no longer reach
  payroll after the correction once the data has been restored.
- fix(review): the focus ring of a read-only week card is painted above the day columns,
  on all four edges, in both themes.
- test:
  - a restore case for the release blocker;
  - a leased send job of another revision blocks a new send;
  - the PDF leave line stays inside the 37 pt band;
  - the unsigned signature line height below 768 px;
  - the week card ring on all four edges;
  - focus on a scrolled card keeps its scroll position.
- docs: documents 04, 05, 11 and 12 (EN and VI) match the build. docs/12 states that a
  correction's send can wait up to about 81 minutes behind an older send while the mail
  server is down.
- docs(handoff): REGATE6 PASS, the area A and B rechecks (FIX REQUIRED, one Low each) with
  their review pairs, the FIX11 record, the board, the checkpoint (+ vi), STATE and
  NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX11 (WP5-UX5-RECHECK-A and WP5-UX5-RECHECK-B findings)
Gate: WP5-UX5-REGATE6 PASS on a5533b5; REGATE7 pending
Audit: WP5-UX5-RECHECK-A and WP5-UX5-RECHECK-B FIX REQUIRED on a5533b5; rechecks pending
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

- HEAD before a5533b57daa81a340c0ad9dfe5f5feac4e6ce1f5; after and commit
  0f52300ca1ab7d458c30e7dbe1fb098d9c6dd955; pushed to origin main (fast-forward); remote SHA equal.
- D_PRE = HEAD digest = 20709d60c814111294bc2386ca5be15fe4b9f1e17f2d24d2f269747a966d9516.
- Staged 425: 15 source/test/doc, 10 records, 6 tasks, 394 evidence. No masking or unstaged file.
- All checks exit 0 (precommit, diff --check, JSON, validate_orchestration, check_recovery 106,
  validate_package). Details in evidence/WP5-UX5-FIX11-FREEZE/checks.txt (unstaged).
