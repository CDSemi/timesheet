# WP2-T12-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T12-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T12.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy, images), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  55d3bb808836a0217de45470f5b743f9e5b9a667. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze of T12 (settings and admin UI). It also carries the
  WP2-T11-RECON records. Push after the commit.

## Expected working-tree set

New:
- src/client/SettingsScreen.tsx and src/client/AdminScreen.tsx.
- Under src/client/components/:
  - PolicyFields.tsx and PolicyPreview.tsx;
  - AdminUsers.tsx, HolidayImport.tsx and PayrollExceptions.tsx;
  - policyModel.ts and adminModel.ts.
- tests/client/policyModel.test.ts and tests/client/adminModel.test.ts.
- tests/e2e/admin.spec.ts and tests/e2e/isolation.spec.ts.
- handoff/delivery/tasks/: WP2-T11-RECON.md and WP2-T12-FREEZE.md.
- Every file under handoff/delivery/evidence/WP2-T11-RECON/ and WP2-T12/. The T12
  directory holds three text logs and 14 `*-synthetic.png` screenshots.

Modified:
- src/client/App.tsx, src/client/components/AppShell.tsx, src/client/api.ts and
  src/client/styles.css.
- tests/e2e/fixtures.ts, and tests/e2e/shell.spec.ts (a recorded one-assertion T12
  deviation).
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/WP2-T12.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T12-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes any
Playwright output, any `.csv` file, and any server file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- `git add` with the explicit path list, as its own command;
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py.

Privacy hygiene: the precommit script is the privacy scan.
- Do not print diffs, test bodies, fixture or seeding code, or CSV content through the
  shell.
- For an extra personal-data check, use the Grep tool on the new files. Report only
  file:line and masked values: at most the first four characters followed by "…".
- Do view the screenshots with the Read tool; at least a representative sample of six,
  desktop and mobile. Record how many you viewed.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in text evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your text evidence LF, free of trailing whitespace and ending in a single final
newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the settings and admin screens with isolation e2e (WP2-T12)

- feat(ui): personal policy form with a server preview before creation
- feat(ui): admin-only user administration with server refusals shown (self, last
  admin, calendar_in_use); temporary password never shown again
- feat(ui): holiday CSV preview/commit, payroll exceptions with a reason, next-year
  calendar warning
- test: admin and isolation e2e on desktop and 390x844; font-family fallback cleanup
- chore(handoff): T11 reconciliation records, T12 screenshots, board and checkpoint

Task: WP2-T12-FREEZE (intermediate freeze; package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T12-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
