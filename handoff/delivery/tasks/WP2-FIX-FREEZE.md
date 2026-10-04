# WP2-FIX-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP2-FIX-FREEZE; package WP2; kind commit;
  attempt 1; depends on WP2-FIXA and WP2-FIXB.
- This is the new package-final freeze after the audit-fix round. WP2-GATE2 and the
  rechecks review this commit.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (privacy: images and probe sources), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  8fae685949adb525ec137e5972202f58b408ac24. If either differs, stop and report.
- Push after the commit.

## Attempt 2

- Attempt 1 did not commit. It left 152 paths staged.
  - `git diff --cached --check` (exit 2) found one blank line at EOF in
    handoff/delivery/tasks/WP2-AUDIT-B.md:155.
  - The preflight (exit 1) ran on the system Python 3.14, which has no tzdata.
- The coordinator authorizes one record-only edit outside your own files: remove the
  trailing blank line, so that handoff/delivery/tasks/WP2-AUDIT-B.md ends with exactly
  one final newline. Change nothing else in that file. Then re-stage it.
- Run the preflight with the workflow Python that earlier freezes used:
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  Write the account name as `<user>` in the evidence.
- Confirm that the staged set still equals the expected set. Then re-run every check,
  one command per step, and record each exit code with an `a2-` evidence prefix.

## Expected working-tree set

Modified source and tests:
- From WP2-FIXA:
  - src/server/services/holidayImport.ts;
  - src/client/components/HolidayImport.tsx;
  - src/client/api.ts;
  - tests/integration/holiday-import.test.ts.
- From WP2-FIXB:
  - src/client/DayEditor.tsx;
  - src/client/components/SessionForm.tsx, sessionModel.ts and DayFigures.tsx;
  - src/client/styles.css;
  - tests/e2e/day-editor.spec.ts and tests/client/sessionModel.test.ts.

New handoff files:
- handoff/delivery/WP2_REVIEW_A.md and .vi.md; handoff/delivery/WP2_REVIEW_B.md and
  .vi.md.
- handoff/delivery/tasks/:
  - WP2-TMPCLEAN.md, WP2-FIXA.md and WP2-FIXB.md;
  - WP2-GATE2.md, WP2-AUDIT-A2.md and WP2-AUDIT-B2.md;
  - WP2-FIX-FREEZE.md.
- Every file under these handoff/delivery/evidence/ directories, including
  subdirectories:
  - WP2-T13-FREEZE/, WP2-GATE/ and WP2-TMPCLEAN/;
  - WP2-AUDIT-A/ and WP2-AUDIT-B/;
  - WP2-FIXA/ and WP2-FIXB/.

Modified handoff files:
- handoff/delivery/ORCHESTRATION.json.
- handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md.
- handoff/delivery/tasks/: WP2-T13-FREEZE.md, WP2-GATE.md, WP2-AUDIT-A.md and
  WP2-AUDIT-B.md.

Allowed but not staged:
- your own files in handoff/delivery/evidence/WP2-FIX-FREEZE/;
- the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes any
Playwright output, any `.csv` file and any other source file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
- `node --version`;
- `git add` with the explicit paths, as its own command (directories are allowed for the
  listed evidence directories);
- the precommit check;
- `git diff --cached --check`;
- JSON parse of ORCHESTRATION.json;
- the orchestration validator;
- check_recovery.py;
- `validate_package.py --preflight` with the workflow Python, because the bilingual review
  documents are new.

Privacy hygiene: the precommit script is the privacy scan.
- Do not print diffs, test bodies, probe sources, seeding code or CSV content through
  the shell.
- For any extra check, use the Grep tool and report masked values only: at most the first
  four characters followed by "…".
- View at least six representative new screenshots (desktop and mobile) with the Read
  tool, and record how many.

If a check fails, do not commit. Report the file, line and rule. The one exception is a
profile path in text evidence, which you may mask.

If any call is denied by a permission check, stop at once. Do not retry, split or
rephrase it; report the denial.

Keep your text evidence LF, free of trailing whitespace and ending in a single final
newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Fix the WP2 audit findings: holiday-preview privacy and manual-entry zones

- fix(admin): the holiday-import preview carries no employee-derived counts;
  finalized conflicts are date-only (WP2-A-01)
- fix(ui): manual entry defaults to the display zone (R-07); the expected finish is
  shown there and labelled derived; changing a saved session's zone re-reads the typed
  wall times (WP2-B-01)
- style(ui): literal sizes become CSS custom properties with identical computed styles
  (WP2-B-02)
- docs(handoff): WP2-GATE PASS, the area A and B audit reports (+ vi), temp cleanup,
  fix records, gate and recheck briefs

Task: WP2-FIX-FREEZE (package-final freeze after the audit-fix round; WP2-GATE2 and the
rechecks follow)

## Push and report

Push per the profile. Append these results here:
- pre- and post-HEAD;
- commit SHA, whether it was pushed, and the remote SHA;
- staged count;
- check exits;
- blockers.

Evidence goes in handoff/delivery/evidence/WP2-FIX-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

### Committer results (attempt 1, Sonnet 5.5)

- Pre-HEAD 8fae685949adb525ec137e5972202f58b408ac24; post-HEAD unchanged; no commit; not pushed.
- Staged count 152 (left staged).
- Exits: node --version 0 (v24.21.0); git add 0; precommit 0; diff --cached --check 2;
  JSON 0; orchestration validator 0; check_recovery 0; validate_package --preflight 1.
- Blockers: WP2-AUDIT-B.md:155 has a blank line at EOF; preflight fails because the
  Python on this host has no IANA zone data (America/Los_Angeles not found).
- Evidence: handoff/delivery/evidence/WP2-FIX-FREEZE/01-checks.txt

### Committer results (attempt 2, Sonnet 5.5)

- Pre-HEAD 8fae685949adb525ec137e5972202f58b408ac24; post-HEAD f79413b77e7f745e1eff383f1ad748e7667533da.
- Commit f79413b77e7f745e1eff383f1ad748e7667533da; pushed to origin main; remote SHA f79413b77e7f745e1eff383f1ad748e7667533da.
- Staged count 152; no extras.
- Exits (all 0): node --version (v24.21.0); git add; precommit; diff --cached --check; JSON parse;
  orchestration validator; check_recovery; validate_package --preflight (workflow Python).
- Screenshots viewed: 6 (desktop and mobile), synthetic only.
- Blockers: none.
- Evidence: handoff/delivery/evidence/WP2-FIX-FREEZE/02-a2-checks.txt
