# WP3-T13-FREEZE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-T13-FREEZE; package WP3; kind commit;
  attempt 1; depends on WP3-T13.
- Profile/routing: timesheet-committer, requested sonnet/medium, no override. Routing:
  size S, risk M (UI with signature consent, PDF download route, synthetic screenshots,
  evidence scripts), novelty no. Records in English.
- Authority: AGENTS.md rule 12, the docs/08 section "Commits and pushes" and the board
  `owner_decisions`.
- Branch: main (`git.release_declared` is false). Expected HEAD = origin/main =
  943027b3a328f174ef3de5c45ee4677906af3189. If either differs, stop and report.
- Push after the commit.
- Scratch space: make the first shell call a trivial `node --version` (Node 24 by full
  path); if it fails with ENOSPC or "temp filesystem … is full", stop at once and report.
  Use `D:\timesheet-tmp\WP3-T13-FREEZE` (owner-authorized, outside Dropbox) for TEMP/TMP;
  delete only files you created; never remove folders recursively.

## Expected working-tree set

Source and tests: changed or new paths outside handoff/ may only be among these:
- modified: src/server/routes/submission.ts, src/server/app.ts (reported one-line
  deviation), src/client/HistoryScreen.tsx, src/client/SettingsScreen.tsx,
  src/client/TimesheetScreen.tsx, src/client/components/TimesheetGrid.tsx,
  src/client/api.ts, src/client/App.tsx, src/client/styles.css;
- new or modified: src/client/components/Delivery*.tsx, src/client/components/
  Submission*.tsx, src/client/components/SignatureUpload.tsx,
  src/client/components/deliveryModel.ts and settingsModel.ts (reported deviation),
  tests/integration/pdf-download.test.ts, tests/client/deliveryModel.test.ts,
  tests/client/settingsModel.test.ts and tests/e2e/history-settings.spec.ts.

Recompute the digest with Node 24 (`scripts/source-digest.mjs` or `npm run digest`)
immediately before `git add` and record it. The worker reported
7b04f0b13b2fe7915121c78f2d82515df199e2628350aea404205fbe526f7301; a different value stops
the commit.

Handoff files:
- new: handoff/delivery/tasks/WP3-T13-FREEZE.md and WP3-T13B.md; every file under
  handoff/delivery/evidence/WP3-T13/, including the 12 synthetic screenshots and the
  `*.mjs.txt`/`*.py.txt` scripts;
- modified or new: handoff/delivery/ORCHESTRATION.json;
  handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md and .vi.md;
  handoff/delivery/tasks/: WP3-T07B-FREEZE.md and WP3-T13.md; every file under
  handoff/delivery/evidence/WP3-T07B-FREEZE/.

Allowed but not staged: your own files in handoff/delivery/evidence/WP3-T13-FREEZE/ and
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
tool (desktop and mobile, history and settings) and record how many; they must show
synthetic data only.

If `git diff --cached --check` flags only a blank line at EOF in a task record outside
evidence/, you may remove exactly that line and re-stage it; record the file name. If the
precommit check masks a user-profile path in an evidence log, that is allowed; a block in
a source or test file stops the commit. Do not print diffs, test bodies, probe sources,
names, addresses or CSV content through the shell; use the Grep tool with masked output
for any extra check. If any other check fails, do not commit; report the file, line and
rule. If any call is denied by a permission check, stop at once; do not retry, split or
rephrase it. Never write into the repository root; on Windows never redirect to
/dev/null or nul from a POSIX shell. Keep your evidence LF, free of trailing whitespace,
single final newline. Stop any background process you started before you finish.

## Commit message (refine with the commit-message skill; keep the facts)

Subject: Add history, delivery decisions, submission settings, signature consent and the
owner-only PDF download

- feat(api): GET /api/revisions/:id/pdf, owner-only, hash re-checked, no-store,
  attachment
- feat(ui): history with revisions, PDF download, delivery attempts, resend and the
  uncertain-delivery decision behind confirmations; automatic submissions show "review
  pending" on the employee's own screens
- feat(ui): submission settings with the note line and the image option as the audited
  authorization; signature upload with the consent pre-selected (owner G-Q1 b) and a step
  order when settings are missing; grid status caption
- test: 50 new unit tests, 10 route tests, history/settings e2e on desktop and mobile;
  16 mutations caught
- docs(handoff): WP3-T07B freeze result, WP3-T13 record, evidence and screenshots,
  WP3-T13B brief, board and checkpoint (+ vi)

Task: WP3-T13-FREEZE

## Push and report

Push per the profile. Append: pre- and post-HEAD; commit SHA, pushed, remote SHA;
digest, staged count, screenshots viewed; check exits; blockers. Evidence in
handoff/delivery/evidence/WP3-T13-FREEZE/. Return at most 150 words.

## Results

(Committer appends here.)

Attempt 1: pre-HEAD 943027b; commit 5b90d30d7e4b5410770b01d04bd9ff8ee2663149; pushed to
origin/main, remote SHA equal. Digest 7b04f0b1...f7301 (match). Staged 57. Screenshots
viewed 6 (synthetic only). Checks: node 24.21.0, precommit, diff --check, JSON,
validate_orchestration, check_recovery, preflight all exit 0. No masking, no EOF fix,
no blockers. Evidence: handoff/delivery/evidence/WP3-T13-FREEZE/.
