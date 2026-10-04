# WP3-T01-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T01-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T01.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (schema, configuration with SMTP settings, evidence scripts), novelty no.
  Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  db753466bbb40386ea1e1f178548b88686872cf7. If either differs, stop and report.
- Push after the commit.

## Expected working-tree set

Source and tests (and nothing else outside handoff/):
- new: src/server/db/migrations/0004_submission.ts and
  tests/integration/config.test.ts;
- modified: src/server/db/migrations.ts, src/server/config.ts, src/server/types.ts and
  tests/integration/migrations.test.ts.

Compute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`) and
record it. The worker reported
995e68c9e03d0dfca22e8a16192af811adf9c48e5ca78aa79723066f2485e499; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T01-FREEZE.md and WP3-T02.md.
- Every file under handoff/delivery/evidence/WP3-T01/ (including the `*.mjs.txt` and
  `*.py.txt` scripts).

Modified handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T00-FREEZE.md and WP3-T01.md.
- Every file under handoff/delivery/evidence/WP3-T00-FREEZE/ (modified or new).

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T01-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any database file, any `.csv` file and any other source file.

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

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it. Record the file name. Change
nothing else.

Privacy hygiene: the precommit script is the privacy and secret scan.
- Do not print diffs, test bodies, configuration values, probe sources, seeding code or
  CSV content through the shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add migration 0004 for submission and delivery, with capture-first configuration

- feat(db): migration 0004 adds attachments, submission settings, timesheet revisions,
  sign-offs, revision ledger lines (with the R4 pending outcomes), revision files, jobs,
  delivery attempts, reminder occurrences, operations state and
  timesheets.imported_unverified; immutable tables refuse UPDATE/DELETE; 0001-0003
  checksums stay pinned
- feat(config): private data directory, public base URL, outbound mode capture by
  default; SMTP needs an explicit owner-only flag; no secret in errors or logs
- test: fresh migrate, upgrade of a real 5fafeae database, triggers, unique keys,
  config defaults; 6 mutations caught
- docs(handoff): WP3-T00 freeze result, WP3-T01 record and evidence, WP3-T02 brief, board
  and checkpoint (+ vi)

Task: WP3-T01-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T01-FREEZE/. Return at most 150 words.

## Attempt 2 (coordinator note)

Attempt 1 stopped at the precommit check (two synthetic user-profile path literals in
tests/integration/config.test.ts). The WP3-T01 author replaced them (WP3-T01 attempt 2).

- The expected digest is now
  3c6a10c19bc863eb5a38ffeb54f109ae9dda38a2c1cf22177e24e96a15901f38; a different value
  stops the commit.
- The index still holds the attempt-1 staging. Re-stage the whole expected set with
  explicit paths (one command) so the corrected test file, the board, this brief, the
  WP3-T01 record and the checkpoint are current.
- The expected set additionally includes handoff/delivery/evidence/WP3-T01-FREEZE/stop.txt
  (your attempt-1 note); stage it.
- Rerun every check from the digest on, in the listed order. Everything else in this brief
  is unchanged.

## Results

(Committer appends here.)
