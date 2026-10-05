# WP3-T15-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T15-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T15. This is the WP3 package-final freeze: WP3-GATE and the
  area audits review this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (package-final freeze; developer docs and package.json in the digest),
  novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  b083739bb8f1d7e8b932c8d5463bfb271ac5b1e5. If either differs, stop and report.
- Push after the commit.
- Runtime: call Node 24 by its full portable path for every node/npm step; plain `node`
  on PATH resolves v26 here. Make the first shell call a trivial `node --version` with
  that path; if it fails with ENOSPC or "temp filesystem … is full", stop at once and
  report. Use `D:\timesheet-tmp\WP3-T15-FREEZE` (owner-authorized, outside Dropbox) for
  TEMP/TMP; delete only files you created; never remove folders recursively.

## Expected working-tree set

Outside handoff/, changed paths may only be: README.md, README.vi.md, DEVELOPMENT.md,
DEVELOPMENT.vi.md and package.json (the `description` field only; check that the
package.json diff touches no other key, without printing the file). No new path outside
handoff/.

Recompute the digest with Node 24 (`npm run digest`) immediately before `git add` and
record it. The worker reported
96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729; a different value stops
the commit.

Handoff files:
- new:
  - handoff/delivery/WP3_HANDOFF.md and WP3_HANDOFF.vi.md;
  - handoff/delivery/tasks/: WP3-T15-FREEZE.md, WP3-AUDIT-A.md, WP3-AUDIT-B.md and
    WP3-AUDIT-C.md;
  - every file under handoff/delivery/evidence/WP3-T15/ (five files);
  - every file under handoff/delivery/evidence/WP3-T14-FREEZE/ (01-checks.txt,
    02-checks.txt, commit-message.txt).
- modified:
  - handoff/delivery/ORCHESTRATION.json;
  - handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  - handoff/delivery/tasks/: WP3-T14-FREEZE.md, WP3-T15.md and WP3-GATE.md.

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-T15-FREEZE/ and
the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes:
- a file named `nul`;
- Playwright or test output;
- any `.pdf`, `.eml`, `.png` or `.csv` file;
- a database;
- `mail-capture` or `private-data` content;
- any source, test or governance file.

## Checks before committing

Run one command per step and record each exit code:
1. `node --version`.
2. The digest.
3. `git add` with the explicit paths (its own command).
4. The precommit check.
5. `git diff --cached --check`.
6. JSON parse of ORCHESTRATION.json.
7. The orchestration validator.
8. check_recovery.py.
9. `validate_package.py --preflight` with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence).

Check with the Grep tool, without printing matches, that the docs contain no secret value:
- README, DEVELOPMENT and WP3_HANDOFF (EN/VI) contain no password, token or SMTP
  credential value (variable names are fine);
- they contain no real email address (`example.invalid` addresses are fine).

Allowed fixes and stops:
- If `git diff --cached --check` flags only a blank line at EOF in a task record outside
  evidence/, you may remove exactly that line and re-stage it; record the file name.
- If the precommit check masks a user-profile path in an evidence log, that is allowed.
- If it blocks an email address in a WP3-T15 or WP3-T14-FREEZE evidence log, you may
  replace each such token with `<email>` in that evidence file only (count with the Grep
  tool, never print addresses), record it, re-stage and rerun.
- A block in README, DEVELOPMENT, package.json or the HANDOFF stops the commit.
- If any other check fails, do not commit; report the file, line and rule.
- If any call is denied by a permission check, stop at once; do not retry, split or
  rephrase it.

Output hygiene:
- Do not print diffs, names, addresses or document bodies through the shell.
- Never write into the repository root. On Windows, never redirect to /dev/null or nul
  from a POSIX shell.
- Keep your evidence LF, free of trailing whitespace, with a single final newline.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Document the WP3 package and freeze it for the gate

- docs(handoff): WP3 HANDOFF (+ vi) with scope by task and freeze SHAs, owner decisions
  (F-Q6 open), migrations 0004-0006, commands, evidence index, carry items and deferrals;
  the acceptance record is left empty
- docs: README and DEVELOPMENT (+ vi) cover run-jobs, the capture outbox, the owner-only
  production sending flag (names only), the activation instant, sharing and the new
  environment variables including MAIL_FROM
- chore(package): description names the WP3 scope
- docs(handoff): WP3-T14 freeze result, WP3-T15 record and evidence, WP3-GATE smoke-count
  note, WP3-AUDIT-A/B/C briefs, board and checkpoint (+ vi)

Task: WP3-T15-FREEZE

## Push and report

Push per the profile. Append to this brief:
- pre- and post-HEAD;
- commit SHA, pushed, remote SHA;
- digest and staged count;
- the secret and address scan results;
- check exit codes;
- blockers.

Put your evidence in handoff/delivery/evidence/WP3-T15-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

Attempt 1 (timesheet-committer, sonnet):
- Pre-HEAD b083739bb8f1d7e8b932c8d5463bfb271ac5b1e5; post-HEAD a1cd566e59253d19f53cfd5b3a81fd27a7e9a056.
- Commit a1cd566e59253d19f53cfd5b3a81fd27a7e9a056; pushed yes; remote SHA a1cd566e59253d19f53cfd5b3a81fd27a7e9a056.
- Digest 96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729 (matches); staged 25 planned paths.
- Deviation: my own two evidence files (01-checks.txt, commit-message.txt) were also staged and
  committed (27 files in the commit); the brief called them allowed but not staged. No content issue.
- Scans: real email addresses 0; secret values 0.
- Checks: node v24.21.0, digest, add, precommit, diff --check, JSON parse, orchestration
  validator, check_recovery, preflight all exit 0.
- Blockers: none.
