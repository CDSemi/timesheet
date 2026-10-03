# WP2-T09A-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T09A-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T09A.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy, images), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  24f192dddbe658246dab020c5bc87c74a02a4310. If either differs, stop and report.
- Purpose: an intermediate WP2 freeze of T09A (browser harness, E-8 tokens, app shell and
  API types). It also carries the T09B brief. Push after the commit.

## Expected working-tree set

New:
- src/client/components/AppShell.tsx.
- playwright.config.ts.
- tests/e2e/fixtures.ts and tests/e2e/shell.spec.ts.
- handoff/delivery/tasks/: WP2-T09A-FREEZE.md and WP2-T09B.md.
- Every file under handoff/delivery/evidence/WP2-CALFIX-FREEZE/ and WP2-T09A/. The T09A
  directory holds commands.txt and four `*-synthetic.png` screenshots.

Modified:
- src/client/App.tsx, TimesheetScreen.tsx, api.ts and styles.css.
- package.json and package-lock.json.
- tsconfig.test.json, and tsconfig.json (a recorded T09A deviation).
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-CALFIX-FREEZE.md and WP2-T09A.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T09A-FREEZE/;
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

Also:
- View the four screenshots with the Read tool. Confirm that they show only synthetic
  data, such as `example.invalid` accounts, and no real name, email or path.
- Confirm that package-lock.json changes only for `@playwright/test` and its own
  dependencies.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in text evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your text evidence LF, free of trailing whitespace and ending in a single final
newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the Playwright harness, E-8 tokens and the app shell (WP2-T09A)

- test(e2e): @playwright/test 1.63.0 on the installed Edge; built-server fixture on a
  temp database; desktop and 390x844 projects
- feat(ui): 4px radius, 300 ms ease-out transition, shadow, focus-ring and on-accent
  tokens; reduced-motion guard
- feat(ui): hash-route app shell; api.ts types; error.details kept
- chore(handoff): CALFIX-FREEZE evidence, T09A screenshots, T09B brief, board and
  checkpoint

Task: WP2-T09A-FREEZE (intermediate freeze; package-final gate and audits follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T09A-FREEZE/. Return at most 150 words.

## Results

- Pre-HEAD 24f192dddbe658246dab020c5bc87c74a02a4310; commit
  717db3ee30057089298a8852438f16d46aa4dc89 on main; pushed; remote SHA equal.
- Staged count 26. All checks exit 0 (Node v24.21.0, precommit, diff --check, JSON,
  validator, check_recovery). Screenshots synthetic; lockfile limited to Playwright.
- Blockers: none. Evidence: handoff/delivery/evidence/WP2-T09A-FREEZE/.
