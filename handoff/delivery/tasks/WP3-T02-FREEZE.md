# WP3-T02-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T02-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T02.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy: signature handling code, tests that generate images, evidence
  scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  ac5d0babf4e10d823f54a74db9248ddb84994958. If either differs, stop and report.
- Push after the commit.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- new: src/server/files/fileStore.ts, src/server/files/imageCheck.ts,
  src/server/services/signatures.ts, src/server/routes/signatures.ts,
  tests/integration/file-store.test.ts and tests/integration/signatures.test.ts;
- modified: src/server/app.ts, src/server/http/security.ts (if changed) and
  tests/integration/ot-api.test.ts (a reported deviation: the route allowlist).

Compute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`) and
record it. The worker reported
629e7d9d12f4a38b3c9389a16cba15a331284417c0b1cc1566514bd29d6ceafe; a different value stops
the commit.

New handoff files:
- handoff/delivery/tasks/: WP3-T02-FREEZE.md and WP3-T03.md.
- Every file under handoff/delivery/evidence/WP3-T02/ (including the `*.py.txt`
  scripts).

Modified or new handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP3-T01-FREEZE.md and WP3-T02.md.
- Every file under handoff/delivery/evidence/WP3-T01-FREEZE/.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP3-T02-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any image file (`.png`, `.jpg`, `.jpeg`), any database or `private-data`
content, any `.csv` file and any other source file.

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
nothing else. If the precommit check masks a user-profile path in an evidence log, that
is allowed; a block in a source or test file stops the commit.

Privacy hygiene: the precommit script is the privacy and secret scan.
- Do not print diffs, test bodies, probe sources, image bytes or CSV content through the
  shell.
- For any extra check, use the Grep tool and report masked values only.

If any other check fails, do not commit. Report the file, line and rule.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Never write into the repository root. On Windows, never redirect to /dev/null or nul from
a POSIX shell. Keep your text evidence LF, free of trailing whitespace and ending in a
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the private file store and owner-only signature upload and download

- feat(files): private file store with temp-file plus atomic rename, SHA-256, opaque keys
  and an orphan sweep that keeps referenced files; PNG/JPEG check by magic bytes and
  bounded dimensions
- feat(api): POST /api/signatures takes a raw PNG/JPEG under a 256 KiB route limit with
  the origin/CSRF check; owner-only no-store download; the 64 KiB JSON-only rule stays on
  every other /api route
- test: ID swap 404, anonymous 401, 413, 415, 422, static-root isolation, immutable
  replacement; 14 mutations caught
- docs(handoff): WP3-T01 freeze result, WP3-T02 record and evidence, WP3-T03 brief, board
  and checkpoint (+ vi)

Task: WP3-T02-FREEZE

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- digest, staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP3-T02-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)
