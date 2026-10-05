# WP3-T13D-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13D-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T13D.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (admin privacy boundary code, synthetic screenshots, evidence scripts),
  novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  8e2c2bf288030a48ee4a58fe9a9d86b3df01e818. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T13D-FREEZE` (owner-authorized, outside Dropbox) for
  TEMP/TMP; delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/server/services/operationsStatus.ts, src/client/components/OperationsStatus.tsx,
  tests/integration/operations-status.test.ts and tests/e2e/admin-status.spec.ts;
- modified: src/server/routes/admin.ts, src/client/AdminScreen.tsx, src/client/api.ts,
  src/client/styles.css and tests/integration/isolation.test.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
321cc6a04ec23a92e6aa7e30c153d12db870002bf053cf3fc2b5655d3d0ae862; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T13D.md, WP3-T13D-FREEZE.md and WP3-T13A.md.
- Every file under handoff/delivery/evidence/WP3-T13D/, including the six
  `admin-status-*-synthetic.png` screenshots and the `*.mjs.txt`/`*.py.txt` scripts.

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/WP3-T12-FREEZE.md.
- Every file under handoff/delivery/evidence/WP3-T12-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T13D-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any Playwright output outside the evidence directory, any `.pdf`, `.eml`, a
database, `mail-capture` or `private-data` content, any `.csv` file and any other source
file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- the digest;
- `git add` with the explicit paths, as its own command (the listed evidence directories
  are allowed);
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write `<user>` in the evidence.

View at least four of the new screenshots with the Read tool (desktop and mobile) and
record how many; they must show synthetic data only (synthetic recipient addresses on
`example.invalid`).

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it. Record the file name. Change
nothing else. If the precommit check masks a user-profile path in an evidence log, that
is allowed; a block in a source or test file stops the commit.

Privacy hygiene: the precommit script is the privacy and secret scan.
- Do not print diffs, test bodies, probe sources, names, addresses or CSV content through
  the shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the admin operations and submission status within the privacy boundary

- feat(admin): read-only GET /api/admin/operations and /api/admin/submissions backed by
  an explicit field allowlist: pipeline status and per-person, per-period submission and
  delivery state with recipient addresses (owner F-3, F-Q3 (b)); no timesheet details,
  templates, message content, Message-ID or audit payloads
- feat(ui): operations status panel and submission table on the admin screen, token-only
  CSS
- test: response key-path leak test, isolation route and import inventory, admin e2e on
  desktop and mobile; 8 mutations caught
- docs(handoff): WP3-T12 freeze result, WP3-T13D record, evidence and screenshots,
  WP3-T13A brief, board and checkpoint (+ vi)

Task: WP3-T13D-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count, screenshots viewed;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T13D-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
