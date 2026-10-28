# WP5-UX5-FIX16-FREEZE dispatch brief (one commit of FIX16 and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX16-FREEZE, package WP5,
  kind commit, attempt 1. It depends on WP5-UX5-FIX16 (done, uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (one server file, two integration test files, a docs clause in EN
  and VI, and the records since be2afa2; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows
  pushes to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with the
  task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX16-FREEZE`.
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

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be be2afa2e3c43514581ed62fd145c15eeef13b534.
   - Run `git fetch origin`. origin/main must still be be2afa2.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short` must show exactly these five
   modified paths, and no untracked file. Anything else stops the commit.
   - `docs/05_SUBMISSION_AND_NOTIFICATIONS.md`
   - `docs/05_SUBMISSION_AND_NOTIFICATIONS.vi.md`
   - `src/server/ops/restore.ts`
   - `tests/integration/restore.test.ts`
   - `tests/integration/timesheet-api.test.ts`
4. **D_PRE.** Run `npm run digest`. It must equal
   18aa0ad0f99fbab18ae535d8b36375b756469a717e08b675a1e5d93d7459267c (882 files). Otherwise
   stop and report.
5. **Stage these:**
   - **the five paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **the review pairs:** `handoff/delivery/WP5_UX5_RECHECK_A2.md` and `.vi.md`, and
     `handoff/delivery/WP5_UX5_RECHECK_B2.md` and `.vi.md`;
   - **every changed or untracked `handoff/delivery/tasks/WP5-UX5-*.md`,** this brief
     included. Expected:
     - modified: `WP5-UX5-FIX15-FREEZE.md`;
     - untracked: `WP5-UX5-REGATE10.md`, `WP5-UX5-RECHECK-A2.md`, `WP5-UX5-RECHECK-B2.md`,
       `WP5-UX5-FIX16.md` and `WP5-UX5-FIX16-FREEZE.md`;
   - **these folders under `handoff/delivery/evidence/`,** staged as directories:
     `WP5-UX5-FIX15-FREEZE/`, `WP5-UX5-REGATE10/`, `WP5-UX5-RECHECK-A2/`,
     `WP5-UX5-RECHECK-B2/` and `WP5-UX5-FIX16/`.

   **Expected leftovers.** Four untracked files were left out of earlier freezes and stay
   out. They do not stop the commit:
   - `handoff/delivery/evidence/WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-chain1.log`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears under `handoff/`, list it and stop.

   List every staged path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository.
   - Read every census or process file of the five staged evidence folders. Their names
     contain `census`, `proc`, `leftover` or `load`.
   - Unstage any file that shows the command line of a process the mission did not start,
     such as an IDE agent, a browser, a webview, Docker or a memory tool. Process names, IDs,
     counts and CPU times are allowed.
   - List each file you unstage, with the reason.
7. **File types and names.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
   - Evidence is LF `.txt` or `-synthetic.png`. Unstage any staged evidence file with
     another extension, and list it.
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

    Any failure stops the commit. If a file you unstaged is named in a board evidence list,
    stop and report it; do not edit the board.
11. **Commit on main, then run `git push origin main`.** The push must fast-forward the
    remote from be2afa2. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`. It must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-UX5-FIX16-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Keep a held superseded send held for every later send of the period except a cancelled one

- fix(restore): `blockerOf` counts every later send job of the period, whatever state it is
  in or ended in, except a cancelled one.
  - Before, a held superseded send could be released and delivered after a correction
    whose own send had failed, ended uncertain (also once marked delivered), or was held by
    a second restore.
  - An owner's repeat of the same revision is refused as `superseded_by_later_send`.
  - The later order is kept, so an older revision's send never blocks the newest one.
- test(restore): one case for each of those end states, the same-revision repeat, a
  cancelled later send, and the later order (E1).
- test(timesheet-api): a check-in at exactly the reporting-zone midnight second is filed on
  the new date.
- docs(05): the release rule names the end states and the cancelled exception, in EN and VI.
- docs(handoff): REGATE10 (PASS), RECHECK-A2 (PASS), RECHECK-B2 (FIX REQUIRED) with their
  review pairs, FIX16, the FIX15-FREEZE outputs, the board, the checkpoint (+ vi), STATE
  and NEXT_ACTION (+ vi).

Task: WP5-UX5-FIX16 (after WP5-UX5-RECHECK-B2)
Gate: WP5-UX5-REGATE10 PASS on be2afa2; REGATE11 pending
Audit: WP5-UX5-RECHECK-A2 PASS; WP5-UX5-RECHECK-B2 FIX REQUIRED; area-B recheck pending
Digest: D_PRE

## Addendum 1 (coordinator, 2026-10-28, after the first stop)

- **Why you stopped.** `validate_orchestration.py` and `check_recovery.py` exited 1 with
  "Stale PASS: WP5-UX5-RECHECK-A2".
  - A PASS audit of the active package must review the board's `current_source_digest`,
    which is still 507de97c, the last accepted snapshot. The other way to pass is to name
    the later audit that supersedes it.
  - You were right to stop: the board is outside your allowed edits.
- **Fixed by the coordinator, on the board only:**
  - RECHECK-A2 now has `superseded_by: "WP5-UX5-AUDIT-INT"` and a note. Area A's PASS on
    ff73565b stays as history; the integration audit on the final digest becomes the
    current acceptance.
  - The pending tasks WP5-UX5-REGATE11, WP5-UX5-RECHECK-B3 and WP5-UX5-AUDIT-INT are
    registered.
  - FIX16-FREEZE has a `first_stop` note and its `agent_id`.
- **Continue as the same committer:**
  - Run `git add` again on `handoff/delivery/ORCHESTRATION.json` and this brief.
  - Confirm that nothing else changed since your staging. Outside the staged set, only the
    four known leftovers and your own unstaged `checks.txt` may show.
  - Rerun the precommit check once on the re-staged files.
  - Continue at step 10 with every check, then do steps 11 to 13.

## Addendum 2 (coordinator, 2026-10-28, after the second stop)

- **Why you stopped.** The validators exited 1 with "Prompt missing: WP5-UX5-REGATE11". The
  pending tasks that Addendum 1 registered had no brief files yet. You were right to stop.
- **Fixed by the coordinator.** Three briefs now exist:
  - `handoff/delivery/tasks/WP5-UX5-REGATE11.md`;
  - `handoff/delivery/tasks/WP5-UX5-RECHECK-B3.md`;
  - `handoff/delivery/tasks/WP5-UX5-AUDIT-INT.md`.

  Nothing else changed.
- **Continue as the same committer:**
  - Run `git add` on those three new briefs and on this brief.
  - Confirm that nothing else changed since your staging. Outside the staged set, only the
    four known leftovers and your own unstaged `checks.txt` may show.
  - Rerun the precommit check once on the newly staged files.
  - Continue at step 10 with every check, then do steps 11 to 13.
  - If a validator stops on another board or brief issue, list every error message you
    can see, then stop.

## Addendum 3 (coordinator, 2026-10-28, after the third stop)

- **Why you stopped.** The validators exited 1 with "Audit needs a gate dependency or
  gate_included: WP5-UX5-AUDIT-INT".
- **Fixed by the coordinator.**
  - The board's WP5-UX5-AUDIT-INT now depends on WP5-UX5-REGATE11 and on
    WP5-UX5-RECHECK-B3.
  - Its brief says the same.
  - Your task's `first_stop` note records this stop.
  - The coordinator read the remaining audit, `superseded_by` and `addresses_audit` rules,
    and they are met.
- **Continue as the same committer:**
  - Run `git add` on `handoff/delivery/ORCHESTRATION.json`,
    `handoff/delivery/tasks/WP5-UX5-AUDIT-INT.md` and this brief.
  - Confirm that nothing else changed.
  - Rerun the precommit check on those files.
  - Continue at step 10 with every check, then do steps 11 to 13.
  - If a validator stops again, list every error you can see, then stop.

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
