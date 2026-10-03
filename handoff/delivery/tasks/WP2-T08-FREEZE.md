# WP2-T08-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T08-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T08.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  a0f06f5a3c9c6639bcd1ec79519d9bfc139bf8a6. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze of T08 (calendar administration). It also carries
  the WP2-CALFIX brief. Push after the commit.

## Expected working-tree set

New:
- src/domain/holidayCsv.ts and src/server/services/holidayImport.ts.
- tests/domain/holiday-csv.test.ts.
- tests/integration/holiday-import.test.ts and tests/integration/payroll-exceptions.test.ts.
- handoff/delivery/tasks/: WP2-T08-FREEZE.md and WP2-CALFIX.md.
- Every file under handoff/delivery/evidence/WP2-T07-FREEZE/ and WP2-T08/, including the
  two calendar-reassignment probe `.txt` files.

Modified:
- src/server/services/calendars.ts and src/server/services/periods.ts.
- src/server/routes/admin.ts and src/server/routes/api.ts.
- src/server/http/schemas.ts.
- tests/integration/ot-api.test.ts and tests/integration/isolation.test.ts (the latter is a
  recorded T08 deviation).
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-T07-FREEZE.md and WP2-T08.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T08-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path, including any `.csv` file: stop without committing
and report it.

## Checks before committing

Run one command per check with Node 24 and record each exit code:
- `node --version`;
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- a read of the staged diff for personal data. The holiday names and test users must be
  synthetic.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your evidence LF, free of trailing whitespace and ending in a single final newline.
Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add holiday CSV import, payroll exceptions and the next-year calendar warning
(WP2-T08)

- feat(admin): holiday CSV preview/commit as a merge with a preview hash; immutable
  version and one audit event; identical re-commit is a no-op
- feat(admin): payroll exceptions with a reason refresh unfinalized pay_periods rows and
  refuse finalized ones
- feat(api): calendar warnings field (missing next-year calendar from 1 October)
- test: AC-05 cases, past classification unchanged, 11 mutations caught
- chore(handoff): T07-FREEZE evidence, calendar-reassignment probe, CALFIX brief, board
  and checkpoint

Task: WP2-T08-FREEZE (intermediate freeze; package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T08-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

- Pre-HEAD a0f06f5a3c9c6639bcd1ec79519d9bfc139bf8a6; post-HEAD and commit
  869bc8e5786e827144ef1d2d806725576351c720.
- Pushed: yes; remote SHA 869bc8e5786e827144ef1d2d806725576351c720.
- Staged count: 29 (expected set including this brief).
- Check exits (Node v24.21.0): precommit, diff --check, JSON parse, validator and
  check_recovery all 0; staged diff read found only synthetic data.
- Blockers: none. Results appended after the commit are left uncommitted.
