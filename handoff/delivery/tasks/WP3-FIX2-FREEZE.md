# WP3-FIX2-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-FIX2-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-FIX2 and WP3-TMPMOVE. This is the WP3 fix-round-2 freeze;
  WP3-REGATE2 and the round-2 rechecks review this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size M, risk M (source, canonical docs, recheck reports, synthetic screenshots and
  renders, probe sources), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  2f2520e1ab80ff55938b70cd469f0bfe888e04a2. If either differs, stop and report.
- Push after the commit.
- Runtime:
  - Call Node 24 by its full portable path for every node/npm step; plain `node` resolves
    v26 here.
  - Make the first shell call a trivial `node --version` with that path. If it fails
    with ENOSPC or "temp filesystem … is full", stop at once and report.
  - Use `D:\.claude-tmp\timesheet\WP3-FIX2-FREEZE` (owner-authorized, outside Dropbox)
    for TEMP/TMP and any raw output. Delete only files you created; never remove folders
    recursively.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File). Never kill processes by PID.

## Expected working-tree set

Changed paths outside handoff/ may only be among these:
- Source:
  - src/server/services/automation.ts, src/server/services/history.ts,
    src/server/services/sharedActs.ts;
  - src/client/api.ts, src/client/HistoryScreen.tsx;
  - src/client/components/sharingModel.ts, src/client/components/settingsModel.ts.
- Tests:
  - tests/integration/: deadline.test.ts, history.test.ts,
    review-grantee-changes.test.ts, delivery.test.ts;
  - tests/client/: sharingModel.test.ts, settingsModel.test.ts;
  - tests/e2e/automation.spec.ts.
- Canonical documents: docs/05_SUBMISSION_AND_NOTIFICATIONS.md and .vi.md;
  docs/10_DECISIONS_AND_SOURCES.md and .vi.md.

No new path outside handoff/. No migration, seed, package.json, lock file or governance
path may change.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add` and
record it. The WP3-FIX2 worker reported
0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92; a different value stops
the commit.

Handoff files:
- New:
  - handoff/delivery/WP3_RECHECK_A.md and .vi.md;
  - handoff/delivery/WP3_RECHECK_BC.md and .vi.md;
  - handoff/delivery/tasks/: WP3-FIX2.md, WP3-FIX2-FREEZE.md, WP3-TMPMOVE.md,
    WP3-REGATE2.md and WP3-RECHECK-BC2.md;
  - every file under these handoff/delivery/evidence/ directories: WP3-FIX-FREEZE/,
    WP3-REGATE/, WP3-RECHECK-A/, WP3-RECHECK-BC/, WP3-TMPMOVE/ and WP3-FIX2/.
- Modified:
  - handoff/delivery/ORCHESTRATION.json;
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  - handoff/delivery/WP3_HANDOFF.md and .vi.md;
  - handoff/delivery/tasks/: WP3-FIX-FREEZE.md, WP3-REGATE.md, WP3-RECHECK-A.md and
    WP3-RECHECK-BC.md.

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-FIX2-FREEZE/ and
the results you append to this brief after the commit. Do not stage them.

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

Run one command per step with Node 24 (by full path), and record each exit code:
1. `node --version`;
2. the digest;
3. `git add` with the explicit paths, as its own command;
4. the precommit check;
5. `git diff --cached --check`;
6. JSON parse of ORCHESTRATION.json;
7. the orchestration validator;
8. check_recovery.py;
9. `validate_package.py --preflight`, run with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   Write `<user>` in the evidence.

With the Read tool, view at least six staged images: at least two from WP3-RECHECK-BC/,
two from WP3-RECHECK-A/ and one from WP3-REGATE/. Record how many you viewed. They must
show synthetic data only.

With the Grep tool, and without printing matches, confirm three things:
- no `.raw` file is staged;
- docs/05 and docs/10 contain no real email address;
- docs/05 and docs/10 contain no Windows user name.

Fixes you may make:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  evidence/, remove exactly that line, re-stage it and record the file name.
- If the precommit check masks a user-profile path in an evidence log, that is allowed.
- If it blocks an email address or the Windows user name in an evidence log under the
  listed directories, replace each such token with `<email>` or `<user>` in that
  evidence file only. Count with the Grep tool and never print the values. Record it,
  re-stage and rerun.

When to stop:
- A block in a source, test, document, review or HANDOFF file stops the commit.
- If any other check fails, do not commit. Report the file, line and rule.
- If any call is denied by a permission check, stop at once. Do not retry, split or
  rephrase it.

Output rules:
- Do not print diffs, test bodies, probe sources, names or addresses through the shell.
- Never write into the repository root. Never redirect to /dev/null or nul, including
  `2>/dev/null`.
- Keep your evidence LF, free of trailing whitespace, with a single final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix WP3 recheck findings and apply the owner's auto-submit setup rule

- fix(history): actor-less events are flagged as system events by the server and
  labelled automatic in the client (WP3-RBC-01)
- fix(review): without an owner finalization the grantee-change hint counts changes made
  before the period start (WP3-RBC-02)
- feat(automation): automatic submission applies only to accounts that saved their
  submission settings; periods due before setup are not submitted by default (owner
  decision H-Q1, 2026-10-05)
- test(delivery): direct test of the send handler's sending branch, with a mutation check
- docs: docs/05 states the account-creation and setup bounds; docs/10 records the owner
  decisions of 2026-10-05 (+ vi)
- docs(handoff): fix-round-1 freeze result, WP3-REGATE PASS, rechecks A (PASS) and BC
  (FIX REQUIRED) with evidence, temp-folder move, fix-round-2 records, regate2 and
  recheck briefs, HANDOFF fix round 2, board and checkpoint (+ vi)

Task: WP3-FIX2-FREEZE

## Push and report

Push per the profile. Append these results:
- pre- and post-HEAD;
- the commit SHA, whether it was pushed, and the remote SHA;
- the digest, the staged count and the number of images viewed;
- the scan results and check exit codes;
- any blockers.

Write evidence to handoff/delivery/evidence/WP3-FIX2-FREEZE/. Return at most 150 words.

## Results



- node --version: v24.21.0 (exit 0)
- pre-HEAD: 2f2520e1ab80ff55938b70cd469f0bfe888e04a2
- post-HEAD: 2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714
- pushed: yes; remote SHA 2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714
- digest: 0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92 (matches)
- staged: 158 files
- images viewed: 6 (2 RECHECK-BC desktop/mobile + 1 RECHECK-BC credit, 2 RECHECK-A, 1 REGATE), synthetic only
- scans: .raw staged 0; email in docs/05, docs/10: 0; Windows user name: 0
- exit codes: precommit 0; diff --check 0; JSON parse 0; validate_orchestration 0; check_recovery 0; preflight 0 (python at C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe)
- masking: none; EOF fixes: none
- blockers: none
- note: the brief file itself was not staged (results appended after commit)
