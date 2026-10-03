# WP2-T05-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T05-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-ADVFIX and WP2-T05.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze that covers both tasks. WP2-ADVFIX fixes the
  advisory ledger findings ADV-A-01..04. WP2-T05 adds the day-entry workspace service.
  Push after the commit.

## Attempt 2

- Attempt 1 did not commit. The auto-mode permission classifier denied its first combined
  command with reason "Credential Leakage". A denied call does not execute.
- WP2-T05-PRIVSCAN then scanned the set read-only and found it clean
  ([report](WP2-T05-PRIVSCAN.md)).
- Owner confirmation, typed directly by the owner in chat on 2026-10-03 (verbatim):
  "ác nhận: cho phép timesheet-committer commit và push bộ file WP2-T05-FREEZE."
  The board `owner_decisions` records it.
- Before staging, confirm that the index is empty and that HEAD = origin/main is still
  e92add0.
- Run one command per check and record its exit code.
- Name your evidence files with an `a2-` prefix.
- If any call is denied again, stop at once. Do not retry, split or rephrase the call;
  report the denial.

## Expected working-tree set

New:
- src/server/db/migrations/0003_day_entry_source.ts.
- src/server/services/dayEntries.ts.
- tests/domain/attendance.test.ts and tests/integration/day-entries-batch.test.ts.
- handoff/delivery/WP2_ADV_LEDGER_REVIEW.md and .vi.md.
- handoff/delivery/tasks/: WP2-ADV-GATE.md, WP2-ADV-REVIEW.md, WP2-ADVFIX.md, WP2-T05.md,
  WP2-T05-FREEZE.md, WP2-T05-PRIVSCAN.md (added for attempt 2) and WP2-T06.md.
- Every file under these handoff/delivery/evidence/ directories:
  - WP2-T04-FREEZE/, including a1/;
  - WP2-ADV-GATE/;
  - WP2-ADV-REVIEW/, including probes/;
  - WP2-ADVFIX/;
  - WP2-T05/;
  - WP2-T05-PRIVSCAN/ (added for attempt 2).

Modified:
- From WP2-ADVFIX, under src/server/services/: ledger.ts, otLeave.ts and history.ts.
- From WP2-T05, under src/:
  - server/db/migrations.ts;
  - domain/attendance.ts;
  - server/http/schemas.ts;
  - server/routes/api.ts;
  - server/services/timesheetCommands.ts, timesheets.ts and otEvidence.ts.
- Under tests/integration/:
  - ledger.test.ts, ot-leave.test.ts and history.test.ts;
  - migrations.test.ts;
  - ot-api.test.ts (one line, a recorded WP2-T05 deviation).
- docs/02_TIME_AND_OT_RULES.md and .vi.md; docs/10_DECISIONS_AND_SOURCES.md and .vi.md.
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/WP2-T04-FREEZE.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T05-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path: stop without committing and report it.

## Checks before committing

Run the profile checks with Node 24 and record `node --version`:
- precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- orchestration validator;
- check_recovery.py;
- a read of the staged diff for personal data. Look closely at the new tests, the
  reviewer's probe sources and the docs edits.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in evidence, which you may mask.

Keep your evidence LF, free of trailing whitespace and ending in a single final newline.
Before the commit, stop any background process you started.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix advisory ledger findings and add the day-entry workspace (WP2-ADVFIX, WP2-T05)

- fix(ledger): differing correction retry returns 409 source_key_conflict
- fix(ledger): R-05 pending outcome for corrections that raise a deficit debit
- fix(ot-leave): cancel checks expected_version first
- fix(history): cursor is the caller's own ordinal
- feat(days): category_source with read-time default labels; leave_kind (vacation, sick
  or ot); partial leave and WFH
- feat(api): POST /api/days/batch preview/commit; one transaction, reasons for old dates,
  conflict confirmation, sessions untouched
- docs: R-05/R-06 correction clarification and the decision record (02, 10 + vi)
- chore(handoff): advisory gate and review records, T04-FREEZE evidence, T06 brief

Task: WP2-T05-FREEZE (intermediate freeze; the package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T05-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

### Attempt 2 result

- Pre-HEAD = origin/main = e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96; branch main; index empty; no merge, rebase or lock.
- Working tree matched the expected set (35 non-evidence paths plus 58 evidence files).
- The staging command (`git add --` with explicit paths) was denied by the auto-mode classifier, reason "Credential Leakage". Not retried, split or rephrased.
- No commit, no push. Post-HEAD = e92add0. Staged count 0. No checks run.
- Blocker: classifier denial of staging.
