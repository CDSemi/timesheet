# WP3-FIX3-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-FIX3-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-FIX3. This is the WP3 fix-round-3 freeze. WP3-REGATE3 and
  the final WP3 rechecks review this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (one test file; recheck reports, synthetic renders and screenshots,
  probe sources), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path for every node/npm step; plain `node`
    resolves v26 here.
  - Make the first shell call a trivial `node --version` with that path. If it fails
    with ENOSPC or "temp filesystem … is full", stop at once and report.
  - Use `D:\.claude-tmp\timesheet\WP3-FIX3-FREEZE` for TEMP/TMP and any raw output.
  - Delete only files you created; never remove folders recursively.
  - Never open an interactive shell. Never kill processes by PID.

## Expected working-tree set

Outside handoff/, the only changed path may be `tests/integration/deadline.test.ts`.
There must be no new path outside handoff/, and no change under src/, docs/, scripts/,
configuration or governance paths.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add` and
record it. The WP3-FIX3 worker reported
c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72; a different value stops
the commit.

Handoff files to **stage**:
- New:
  - handoff/delivery/WP3_RECHECK_A2.md and .vi.md;
  - handoff/delivery/WP3_RECHECK_BC2.md and .vi.md;
  - handoff/delivery/tasks/: WP3-FIX2-FREEZE.md (left out of the previous commit),
    WP3-FIX3.md, **WP3-FIX3-FREEZE.md (this brief, as it stands before you append
    results)**, WP3-REGATE3.md, WP3-RECHECK-BC3.md, WP3-ACCREC.md and WP4-PLAN.md;
  - every file under these handoff/delivery/evidence/ directories: WP3-FIX2-FREEZE/,
    WP3-REGATE2/, WP3-RECHECK-A2/, WP3-RECHECK-BC2/ and WP3-FIX3/.
- Modified:
  - handoff/delivery/ORCHESTRATION.json;
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  - handoff/delivery/WP3_HANDOFF.md and .vi.md;
  - handoff/delivery/tasks/: WP3-REGATE2.md, WP3-RECHECK-A.md and WP3-RECHECK-BC2.md.

Stage this brief **before** you append your results. Your appended results and your own
files in handoff/delivery/evidence/WP3-FIX3-FREEZE/ stay unstaged.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- any `.raw` file;
- Playwright or test output outside the evidence directories;
- any `.pdf`, `.eml` or `.csv` file;
- a database;
- `mail-capture` or `private-data` content;
- any other source, test, configuration, document or governance file.

PNG files are allowed only under the evidence directories listed above, and only when
named `*-synthetic.png`.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
1. `node --version`;
2. the digest;
3. `git add` with the explicit paths (its own command);
4. the precommit check;
5. `git diff --cached --check`;
6. a JSON parse of ORCHESTRATION.json;
7. the orchestration validator;
8. check_recovery.py;
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).

View at least six staged images with the Read tool: at least two from WP3-RECHECK-BC2/,
two from WP3-RECHECK-A2/ and one from WP3-REGATE2/. Record how many you viewed. They
must show synthetic data only.

Use the Grep tool, without printing matches, to confirm:
- no `.raw` file is staged;
- this brief is staged.

Fixes you may make:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  evidence/, remove exactly that line, re-stage it and record the file name.
- If the precommit check masks a user-profile path in an evidence log, that is allowed.
- If it blocks an email address or the Windows user name in an evidence log under the
  listed directories, replace each such token with `<email>` or `<user>` in that
  evidence file only. Count with the Grep tool and never print the values. Record it,
  re-stage and rerun.

When to stop:
- A block in the test file, a review or the HANDOFF stops the commit.
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Hygiene:
- Do not print diffs, test bodies, probe sources, names or addresses through the shell.
- Never write into the repository root. Never redirect to /dev/null or nul, including
  `2>/dev/null`.
- Keep your evidence LF, free of trailing whitespace, with a single final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Restore WP3 deadline guard tests and record the fix-round-2 rechecks

- test(deadline): the F-4 activation and imported-period guard tests use configured
  accounts again; the "off" switch is saved before the deadline; a guard sweep covers
  the inactive_user, before_activation and not_due skips (WP3-RBC2-01). The auditor's
  M4, M5 and M5b mutations now fail the suite.
- docs(handoff): fix-round-2 freeze brief and result, WP3-REGATE2 PASS, rechecks A
  attempt 2 (PASS) and BC2 (FIX REQUIRED) with evidence, fix-round-3 records, regate3,
  final recheck, acceptance-record and WP4 planning briefs, HANDOFF fix round 3, board
  and checkpoint (+ vi)

Task: WP3-FIX3-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest, the staged count and the number of images viewed;
- the scan results and check exit codes;
- any blockers.

Write evidence to handoff/delivery/evidence/WP3-FIX3-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

Attempt 1 (timesheet-committer): commit 49651c8bb91d56bf6c6966405257537ec7ca474b, pushed to
origin main (remote SHA identical). Pre-HEAD 2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714.
Digest c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72 (match). Staged 142
files; 6 images viewed, synthetic. Checks: precommit 0, diff --check 0 after removing one EOF
blank line in tasks/WP3-FIX3.md, JSON 0, validator 0, check_recovery 0, preflight 0. Scans
clean. No masking. No blockers. Evidence: evidence/WP3-FIX3-FREEZE/result.md.
