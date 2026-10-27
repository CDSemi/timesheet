# WP5-UX5-FIX6-FREEZE dispatch brief (one commit of FIX4 to FIX6 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX6-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX4, WP5-UX5-FIX5 and WP5-UX5-FIX6 (all
  done).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size M, risk M (one rename and a large staged set of records, no merge).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Starting point,** from the lookup WP5-UX5-FIX6-PATHS (2026-10-26):
  - HEAD = origin/main = 5b8b7184692fff683c4083c9fc5610acd47bece1;
  - the staged diff is empty;
  - no path outside the mission's is dirty.
- **Runtime.**
  - Use the Runtime item (line 22) of `handoff/delivery/tasks/WP5-UX3-FIX4-FREEZE.md`,
    with the task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX6-FREEZE`.
  - The capitalised rules apply:
    - NO HEREDOCS;
    - NO STDIN TO NODE OR PYTHON;
    - NO PIPES INTO `head`, `tail` OR `cat`;
    - NO NULL-DEVICE OR `/dev/std*` REDIRECTS (ALSO NOT IN `2>`);
    - NO `rm -r`;
    - NO PID KILLS;
    - NO INTERACTIVE SHELLS.
  - Use the workflow Python for the validators, and put Node 24 first on PATH.
  - **Staging:** use plain `git add` with literal paths, at most about 20 per call. Folders
    may be staged as directories. Never use `--pathspec-from-file`, `xargs`, a list file, a
    glob, `-A` or `.`.
  - **If a permission check denies any call, stop and report the reason exactly. Do not
    retry it in another form.**
  - **Never change any git configuration.** That covers global, system and repository
    settings, and `safe.directory` too.
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
  - Keep Results short. Long listings go to `checks.txt`.
- The coordinator writes no file while you run.

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be 5b8b7184692fff683c4083c9fc5610acd47bece1.
   - Run `git fetch origin`. origin/main must still be 5b8b718.

   If either differs, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these
   eight modified paths. Anything extra or missing stops the commit.
   - `package.json`
   - `package-lock.json`
   - `tests/e2e/timesheet.spec.ts`
   - `tests/e2e/review.spec.ts`
   - `tests/e2e/fixtures.ts`
   - `vitest.config.ts`
   - `scripts/smoke-built-server.mjs`
   - `scripts/container-drill.mjs`
4. **D_PRE.** Run `npm run digest` in the repository and record the value as D_PRE.
   - It must equal FIX6's digest,
     26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336, over 882 files.
   - If it differs, stop and report.
5. **Stage:**
   - **the eight paths from step 3;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json`, `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
     - every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`, this brief
       included. Expected:
       - modified: `WP5-UX5-AUDIT-A.md`, `WP5-UX5-AUDIT-B.md`, `WP5-UX5-FIX3-FREEZE.md`;
       - untracked: `WP5-UX5-DEPS1.md`, `WP5-UX5-DIAG2.md`, `WP5-UX5-DIAG3.md`,
         `WP5-UX5-FIX4.md`, `WP5-UX5-FIX5.md`, `WP5-UX5-FIX6.md`, `WP5-UX5-FIX6-PATHS.md`,
         `WP5-UX5-REGATE3.md`, `WP5-UX5-FIX6-FREEZE.md`;
     - as directories, these evidence folders under `handoff/delivery/evidence/`:
       `WP5-UX5-DEPS1/`, `WP5-UX5-DIAG2/`, `WP5-UX5-DIAG3/`, `WP5-UX5-FIX3-FREEZE/`,
       `WP5-UX5-FIX4/`, `WP5-UX5-FIX5/`, `WP5-UX5-FIX6/` and `WP5-UX5-REGATE3/`.

   Use the names exactly as `git status` shows them. If a name differs, or another changed
   path appears under `handoff/`, list it and stop.

   List every staged path in `checks.txt`, with a count per group.
6. **The one required rename.** The precommit private-media rule blocks this name:
   - Run `git mv handoff/delivery/evidence/WP5-UX5-DIAG2/20-B-signature-image.txt
     handoff/delivery/evidence/WP5-UX5-DIAG2/20-B-signature-image-synthetic.txt`. The file
     is staged, so `git mv` works.
   - In `handoff/delivery/evidence/WP5-UX5-DIAG2/00-README.txt`, line 11, change the listed
     name to the new name with the Edit tool. Re-stage that file.
   - The board already lists the new name.

   Then check every staged basename. Any other basename that contains "signature" (any
   case) without "synthetic" stops the commit; list it.
7. **Scans.** Run the key and PEM scan (the rule in
   `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`, "Key and PEM scan on the new evidence
   folders") over the eight staged evidence folders. These also stop the commit:
   - an email address other than `@example.invalid`;
   - a Message-ID other than `@timesheet.invalid`.
8. Run `node scripts/precommit-check.mjs`.
   - A `profile-path` finding in an evidence log may be masked as `<user>`, then re-staged.
   - An evidence file over the size limit may be unstaged (that one file only), and listed.
   - Any other finding stops the commit. That includes the board being over the size limit.
9. **Run these checks:**
   - `git diff --cached --check`;
   - a JSON parse of ORCHESTRATION.json and STATE.json;
   - `validate_orchestration.py`;
   - `check_recovery.py` (106);
   - `validate_package.py --preflight`.

   Any failure stops the commit.
10. **Commit on main, then `git push origin main`.** The push must fast-forward the remote
    from 5b8b718. Record the remote SHA, which must equal HEAD.
11. **Compare digests.** Compute the digest of HEAD's tree with the `git ls-tree` form
    documented at the top of `scripts/source-digest.mjs`, as in earlier freezes. It must
    equal D_PRE.
12. **Write the outputs.** Write `checks.txt` and `commit-message.txt` in
    `handoff/delivery/evidence/WP5-UX5-FIX6-FREEZE/`, and a short Results here. Leave them
    unstaged.

**Allowed edits:** only those in steps 6 and 8. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Pin patched dependencies and harden tests against host load

- fix(deps): pin nodemailer 10.1.4 (moderate advisory) and zod 4.6.6 (high advisory);
  `npm audit --omit=dev` is clean again.
- test(e2e):
  - Today waits for the page's date to match a fresh server read across midnight;
  - the review alignment check waits for the saved signature images to load;
  - the seed client and the health poll close each connection, so a pooled socket that
    the server dropped during a blocking job run is not reused.
- test: vitest runs at most half the logical CPUs as workers, so its spawn-heavy
  integration files do not time out when the host is busy.
- chore(scripts): the smoke check and the container drill close each connection. The
  smoke check now closes its monitor before cleanup, so a failure keeps its
  "SMOKE FAILED" line and leaves no temporary folder.
- docs(handoff): records of the REGATE3 failure, the DIAG2, DEPS1 and DIAG3 diagnoses,
  FIX4 to FIX6, the path lookup and the board; the checkpoint (+ vi), STATE and
  NEXT_ACTION (+ vi). One evidence file is renamed with `-synthetic`.

Task: WP5-UX5-FIX4, WP5-UX5-FIX5, WP5-UX5-FIX6 (WP5-UX5-REGATE3 findings)
Gate: WP5-UX5-REGATE3 FAIL on 5b8b718; REGATE4 pending
Audit: pending
Digest: D_PRE

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- any rename, masking or unstaged file;
- every check with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results

- HEAD 5b8b718 -> f4049aa7905e22f1467dfcae4208675cb2fc8e80; pushed (fast-forward), remote SHA = HEAD.
- D_PRE = HEAD digest = 26b163a62b7d85dbf6b6146c73f98593ad6bcae7eeb8fb1dc7fd9d4dc8305336.
- Staged 164 (8 source, 6 records, 12 tasks, 138 evidence). One rename (-synthetic), no masking, nothing unstaged.
- All checks exit 0 (precommit, diff --check, JSON, validate_orchestration, check_recovery 106, preflight).
- Note: the email/Message-ID scan matched only the attribution trailer address in FIX3-FREEZE records.
- Details: handoff/delivery/evidence/WP5-UX5-FIX6-FREEZE/checks.txt.
