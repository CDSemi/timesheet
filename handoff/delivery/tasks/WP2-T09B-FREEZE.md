# WP2-T09B-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T09B-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T09B.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy, images), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  717db3ee30057089298a8852438f16d46aa4dc89. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze of T09B (two-week grid, mobile day list and batch
  edit). It also carries the T10 brief. Push after the commit.

## Expected working-tree set

New:
- Under src/client/components/:
  - PeriodHeader.tsx, ClockBar.tsx and TimesheetGrid.tsx;
  - DayList.tsx and DayStatus.tsx;
  - BatchBar.tsx and BatchDialog.tsx;
  - format.ts and dayModel.ts.
- tests/client/dayModel.test.ts and tests/e2e/timesheet.spec.ts.
- handoff/delivery/tasks/: WP2-T09B-FREEZE.md and WP2-T10.md.
- Every file under handoff/delivery/evidence/WP2-T09A-FREEZE/ and WP2-T09B/. The T09B
  directory holds commands.txt and six `*-synthetic.png` screenshots.

Modified:
- src/client/TimesheetScreen.tsx and src/client/styles.css.
- tests/e2e/fixtures.ts, and tests/e2e/shell.spec.ts (a recorded two-line T09B
  deviation).
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-T09A-FREEZE.md and WP2-T09B.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T09B-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes any
Playwright output, trace or `test-results` directory inside the repository.

## Checks before committing

Run one command per check with Node 24 (by full path) and record each exit code:
- `node --version`;
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- a read of the staged diff for personal data.

Also view the six screenshots with the Read tool. Confirm that they show only synthetic
data.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in text evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your text evidence LF, free of trailing whitespace and ending in a single final
newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the two-week grid, mobile day list and batch category edit (WP2-T09B)

- feat(ui): desktop grid and mobile list (one renders); due date in both zones;
  text-plus-shape status from server fields
- feat(ui): batch edit with preview, conflict dialog, reason prompt and stale reload
- test: dayModel unit tests; e2e on desktop and 390x844 (sessions unchanged after a
  confirmed conflict)
- chore(handoff): T09A-FREEZE evidence, T09B screenshots, T10 brief, board and
  checkpoint

Task: WP2-T09B-FREEZE (intermediate freeze; package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T09B-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
