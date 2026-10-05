# WP3-T13C-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13C-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T13C.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (sharing UI, a signature route change, synthetic screenshots, evidence
  scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  c3c35de41ee5c1afff0e602601bdb27bb0a19bc1. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T13C-FREEZE` (owner-authorized, outside Dropbox) for
  TEMP/TMP; delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- under src/client/: SettingsScreen.tsx, HistoryScreen.tsx, App.tsx, api.ts, styles.css,
  SharedTimesheetScreen.tsx (new), components/AppShell.tsx, components/Sharing*.tsx
  (new), components/sharingModel.ts (new), components/deliveryModel.ts, and the reported
  shared-mode deviations components/DeliveryHistory.tsx, DeliveryRevision.tsx,
  SubmissionSettings.tsx, ReviewStatus.tsx, PeriodHeader.tsx, TimesheetGrid.tsx,
  DayList.tsx, DayEditor.tsx, SessionForm.tsx and DayFieldsForm.tsx;
- src/server/routes/signatures.ts;
- tests/integration/signatures.test.ts, tests/client/sharingModel.test.ts (new),
  tests/client/deliveryModel.test.ts, tests/e2e/sharing.spec.ts (new) and the reported
  one-line deviation tests/e2e/history-settings.spec.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
9b8d6b26dd05436f3aca8546520087e4af095950efc6741cddb54fa2a187240a; a different value stops
the commit.

Handoff files:
- new: handoff/delivery/tasks/WP3-T13C-FREEZE.md and WP3-T15.md; every file under
  handoff/delivery/evidence/WP3-T13C/, including the 18 synthetic screenshots and the
  `*.mjs.txt`/`*.py.txt` scripts;
- modified or new: handoff/delivery/ORCHESTRATION.json;
  handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  handoff/delivery/tasks/: WP3-T13B-FREEZE.md and WP3-T13C.md; every file under
  handoff/delivery/evidence/WP3-T13B-FREEZE/.

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-T13C-FREEZE/ and
the results you append to this brief after the commit.

Any other changed or untracked path stops the commit; report it. That includes a file
named `nul`, any Playwright output outside the evidence directory, any `.pdf`, `.eml`, a
database, `mail-capture` or `private-data` content, any `.csv` file and any other source
file.

## Checks before committing

Run one command per step with Node 24 (by full path) and record each exit code:
`node --version`; the digest; `git add` with the explicit paths (its own command); the
precommit check; `git diff --cached --check`; JSON parse of ORCHESTRATION.json; the
orchestration validator; check_recovery.py; `validate_package.py --preflight` with the
workflow Python
`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
(write `<user>` in the evidence). View at least six of the new screenshots with the Read
tool (desktop and mobile) and record how many; they must show synthetic data only.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it; record the file name. If the
precommit check masks a user-profile path in an evidence log, that is allowed. If it
blocks an email address in a WP3-T13C evidence log, you may replace each such token with
`<email>` in that evidence file only (count with the Grep tool, never print addresses),
record it, re-stage and rerun; a block in a source or test file stops the commit. Do not
print diffs, test bodies, probe sources, names, addresses or CSV content through the
shell. If any other check fails, do not commit; report the file, line and rule. If any
call is denied by a permission check, stop at once; do not retry, split or rephrase it.
Never write into the repository root; on Windows never redirect to /dev/null or nul from
a POSIX shell. Keep your evidence LF, free of trailing whitespace, single final newline.
Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add the timesheet sharing interface and a complete revision history

- feat(ui): Settings > Sharing with per-item switches (timesheets, OT read-only, PDF with
  a signature-image note), change, end and leave; a "Shared with me" switcher and owner
  bar; shared views through /api/shared with disallowed actions absent; a revoked share
  returns the user to their own view
- feat(ui): the history lists every revision from GET /api/revisions and names the
  grantee for edits under a share
- fix(api): GET /api/signatures/current answers 200 with null when no signature exists
- test: 23 new unit tests, sharing e2e on desktop and mobile; 11 mutations caught
- docs(handoff): WP3-T13B freeze result, WP3-T13C record, evidence and screenshots,
  WP3-T15 brief, board and checkpoint (+ vi)

Task: WP3-T13C-FREEZE

## Attempt 2 (coordinator note)

Attempt 1 stopped because src/client/TimesheetScreen.tsx is modified but was not in the
expected set. The T13C brief owned "the existing timesheet view components only where a
shared mode is needed", and TimesheetScreen.tsx is such a component; the worker omitted
it from its deviation list.

- Add src/client/TimesheetScreen.tsx to the expected set **only if** the digest you
  compute before `git add` equals the worker's
  9b8d6b26dd05436f3aca8546520087e4af095950efc6741cddb54fa2a187240a (which proves the
  change was part of the tree the worker verified). If the digest differs, stop and
  report.
- Everything else in this brief is unchanged; run every check from the digest on.

## Push and report

Push per the profile. Append: pre- and post-HEAD; commit SHA, pushed, remote SHA;
digest, staged count, screenshots viewed; check exits; blockers. Evidence in
handoff/delivery/evidence/WP3-T13C-FREEZE/. Return at most 150 words.

## Results

Attempt 1 (committer, claude-sonnet-5-5): STOPPED before staging; no commit, no push.

- Node 24.21.0 by full path: `node --version` exit 0. (A PATH-prepended call resolved the
  system Node 26.10.0, so full paths are used.)
- HEAD = origin/main = c3c35de41ee5c1afff0e602601bdb27bb0a19bc1; branch main; no merge or
  rebase; nothing staged.
- Blocker: `src/client/TimesheetScreen.tsx` is modified (` M`) but is not in the expected
  working-tree set (the reported shared-mode deviations list omits it). Every other path
  matches the expected set. Awaiting the coordinator: either add the path to the brief or
  revert it.
