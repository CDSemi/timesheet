# WP2-T13-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-T13-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-T13.
- This is the **package-final freeze**: WP2-GATE and both audits review this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy; bilingual docs), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  da0ffc492b608f1108e3c455e55aa01cca118b45. If either differs, stop and report.
- Push after the commit.

## Expected working-tree set

New:
- handoff/delivery/WP2_HANDOFF.md and .vi.md.
- handoff/delivery/tasks/: WP2-T13-FREEZE.md, WP2-GATE.md, WP2-AUDIT-A.md and
  WP2-AUDIT-B.md.
- Every file under handoff/delivery/evidence/WP2-T12-FREEZE/ and WP2-T13/.

Modified:
- src/server/seed.ts, and src/server/cli.ts (a recorded T13 deviation).
- scripts/smoke-built-server.mjs.
- DEVELOPMENT.md and .vi.md; README.md and .vi.md.
- package.json (description only).
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-T12-FREEZE.md and WP2-T13.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-T13-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes any
Playwright output, any `.csv` file and any other source file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- `git add` with the explicit path list, as its own command;
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python, because docs changed;
- confirm that package.json changed only in the `description` field. Use
  `git diff --cached --stat`, and the Grep tool on the file if needed.

Privacy hygiene: the precommit script is the privacy scan.
- Do not print diffs, test bodies, seed or seeding code, or CSV content through the
  shell.
- For any extra check, use the Grep tool and report masked values only: at most the first
  four characters followed by "…".

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in text evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your text evidence LF, free of trailing whitespace and ending in a single final
newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the synthetic employee2 dataset, extend the smoke and write the WP2 handoff
(WP2-T13)

- feat(seed): employee2 with sample sessions, a reserved leave request and a keyed
  synthetic setup credit (CLI development dataset only)
- test(smoke): 28 checks, including cross-area 403/404, OT summary and evidence CSV
  headers
- docs: DEVELOPMENT and README status (+ vi); WP2_HANDOFF (+ vi) with the evidence index
  and decisions
- chore(handoff): T12-FREEZE evidence; gate and audit briefs; board and checkpoint

Task: WP2-T13-FREEZE (package-final freeze; WP2-GATE and the two audits review this
commit)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-T13-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
