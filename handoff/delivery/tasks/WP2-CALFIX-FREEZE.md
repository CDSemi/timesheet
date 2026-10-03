# WP2-CALFIX-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-CALFIX-FREEZE; package WP2; kind
  commit; attempt 1; depends on WP2-CALFIX.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  869bc8e5786e827144ef1d2d806725576351c720. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze of the calendar-reassignment fix. It also carries
  the T09 pre-flight records and the T09A brief. Push after the commit.

## Expected working-tree set

New:
- handoff/delivery/tasks/: WP2-CALFIX-FREEZE.md, WP2-T09-PREP.md and WP2-T09A.md. The
  CALFIX brief was committed in 869bc8e and is now only modified.
- Every file under these handoff/delivery/evidence/ directories: WP2-T08-FREEZE/,
  WP2-CALFIX/ and WP2-T09-PREP/.

Modified:
- src/server/services/users.ts. The WP2-CALFIX report says admin.ts is untouched.
- tests/integration/user-admin.test.ts.
- docs/10_DECISIONS_AND_SOURCES.md and .vi.md.
- docs/03_ARCHITECTURE_AND_DATA.md and .vi.md: one sentence in the Records paragraph.
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/:
  - WP2-T08-FREEZE.md and WP2-CALFIX.md;
  - WP2-T08.md, where the coordinator replaced a directory link with plain text so the
    package preflight passes.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-CALFIX-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path: stop without committing and report it.

## Checks before committing

Run one command per check with Node 24 and record each exit code:
- `node --version`;
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- a read of the staged diff for personal data.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your evidence LF, free of trailing whitespace and ending in a single final newline.
Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Refuse calendar reassignment for users with data (WP2-CALFIX)

- fix(admin): PATCH calendar_id returns 409 calendar_in_use while the user has
  timesheets, day entries, sessions, ledger entries or leave requests; nothing written
- test(admin): one regression per data kind, the combined PATCH, the no-data case, and
  the T08 probe scenario
- docs: decision record (10 + vi) and one sentence in the docs/03 Records paragraph (+ vi)
- chore(handoff): T08-FREEZE evidence, T09 pre-flight, T09A brief, WP2-T08 record link
  fix, board and checkpoint

Task: WP2-CALFIX-FREEZE (intermediate freeze; package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-CALFIX-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

- Pre-HEAD: 869bc8e5786e827144ef1d2d806725576351c720; post-HEAD: 24f192dddbe658246dab020c5bc87c74a02a4310.
- Commit 24f192dddbe658246dab020c5bc87c74a02a4310; pushed: yes; remote SHA 24f192dddbe658246dab020c5bc87c74a02a4310.
- Staged count: 25.
- Check exits: node v24.21.0 0; precommit 0; diff --check 0; JSON parse 0; validator 0; check_recovery 0; personal-data read clean.
- Blockers: none. Evidence: handoff/delivery/evidence/WP2-CALFIX-FREEZE/.
