# WP2-T11-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T11-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T11.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy: images and a CSV export sample), novelty no. Records in
  English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  26fa7c9f5a2dda1c2b9ab73122934ede04cf186f. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze of T11 (the OT screen, own-history screen and
  evidence download). It also carries the T12 brief. Push after the commit.

## Expected working-tree set

New:
- src/client/OtScreen.tsx and src/client/HistoryScreen.tsx.
- Under src/client/components/: LeaveRow.tsx, ReserveForm.tsx, otModel.ts and
  useAttemptKey.ts.
- tests/client/otModel.test.ts and tests/e2e/ot-leave.spec.ts.
- handoff/delivery/tasks/: WP2-T11-FREEZE.md, WP2-T12.md and WP2-T13.md. The T13 brief was
  added after attempt 1.
- Every file under handoff/delivery/evidence/WP2-T10-FREEZE/ and WP2-T11/. The T11
  directory holds:
  - four `*-synthetic.png` screenshots;
  - text logs;
  - `ot-evidence-desktop-synthetic.csv.txt`.

Modified:
- src/client/App.tsx, src/client/components/AppShell.tsx, src/client/api.ts and
  src/client/styles.css.
- tests/e2e/fixtures.ts, and tests/e2e/shell.spec.ts (a one-assertion T11 deviation).
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-T10-FREEZE.md and WP2-T11.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T11-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes any
Playwright output, any `.csv` file, and any server file.

## Checks before committing

Run one command per check with Node 24 (by full path) and record each exit code:
- `node --version`;
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- a read of the staged diff for personal data.

Also:
- view the four screenshots with the Read tool;
- read the CSV sample.
Confirm that they show only synthetic data.

Confirm that the test-only credit seeding in tests/e2e/fixtures.ts uses an explicit
synthetic setup key, and that no production route or flag was added.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in text evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your text evidence LF, free of trailing whitespace and ending in a single final
newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the OT screen, own-history screen and evidence download (WP2-T11)

- feat(ui): OT balances with flags, permission and reserve, record use on or after the
  leave date (idempotent, partial), cancel and reverse with expected_version
- feat(ui): E-5 insufficient-balance message and E-2 mismatch warning; own history with
  before/after and reasons; evidence CSV download
- test: otModel unit tests; e2e reserve 480, use 240, cancel, reverse with balances
  matching the API; test-only credit seeding
- chore(handoff): T10-FREEZE evidence, T11 screenshots and CSV sample, T12 brief, board
  and checkpoint

Task: WP2-T11-FREEZE (intermediate freeze; package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T11-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
