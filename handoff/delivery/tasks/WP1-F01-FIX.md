# WP1-F01-FIX dispatch brief

- Mission/task: timesheet-software-readiness / WP1-F01-FIX; package WP1; kind fix;
  attempt 1; depends on WF-ACCEPT (governance accepted and committed).
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size S (one function), risk H (OT input, transaction, audit history), novelty no (the
  pattern exists in `updateSession`).
- Prompt: [FIX_FINDINGS](../../prompts/FIX_FINDINGS.md). Finding: F-01 in
  [WP1_REVIEW](../WP1_REVIEW.md) (decision, F-01A/F-01B reproduction, bounded fix and
  regression list, around lines 64–102). Read AGENTS.md from disk first, then the English
  documents WP1_REVIEW names. Records in English; WP1_HANDOFF stays bilingual.
- Baseline: the WF-ACCEPT commit on main (the board records it); application source
  equals 1a25275 for src/ and tests/.

## Owned (writable) paths

src/server/services/timesheetCommands.ts; tests/integration/ (new or edited regression
tests only); handoff/delivery/WP1_HANDOFF.md and .vi.md (append the fix section; keep the
original handoff content); this report; handoff/delivery/evidence/WP1-F01-FIX/.
Everything else read-only. No commits; the committer freezes your result.

## Required work

1. Reproduce F-01A and F-01B first as failing integration tests on fresh migrated
   synthetic SQLite (record the failing run).
2. Fix F-01 only: Clock out with `breaks_confirmed:true` replaces the stored break set
   with the submitted set (including the explicit empty set). Mirror `updateSession`:
   same IMMEDIATE transaction, before/after audit, rollback on validation failure. Do
   not change the OT engine or any business rule.
3. Regressions: F-01A (200, closed session, one break, values as in WP1_REVIEW), F-01B
   (explicit zero breaks, values as in WP1_REVIEW), the confirmation cases WP1_REVIEW
   lists, and rollback/audit behaviour.
4. Run `npm run verify` (typecheck, lint, tests, builds, smoke) and `npm run digest`
   with the Node 24 runtime; record actual exits and the digest.
5. Update WP1_HANDOFF (EN/VI) with the fix summary, tests, commands, exits and digest.

## Constraints

- Synthetic data only. Do not add literal password-like values in tests: the precommit
  gate blocks quoted or unquoted secrets and spaced app-password layouts. Build any
  synthetic credential at run time. Mask user paths in logs.
- No deprecated APIs (lint `no-deprecated` must pass).
- Node 24: `%LOCALAPPDATA%\timesheet-dev\node-24.21.0\node_modules\node\bin\node.exe`; npm
  via `node.exe "%APPDATA%\npm\node_modules\npm\bin\npm-cli.js"`. Do not run `npm ci` in
  Dropbox (EBUSY).

Return at most 250 words, beginning with your self-reported model: files changed, tests
added, failing-then-passing evidence, verify exits, digest, deviations.

## Results

(Worker appends here.)

### Worker result (attempt 1)

- Reproduced first: new `tests/integration/clock-out-breaks.test.ts` (6 tests) failed 5/6 before the fix (F-01A, F-01B, replace-not-append, audit after-state, rollback-then-clock-out); log `evidence/WP1-F01-FIX/red-before-fix.txt`.
- Fix in `clockOut` only: if `breaks_confirmed`, DELETE the open session's `session_breaks` (owner-scoped) inside the existing IMMEDIATE transaction before the session UPDATE, then insert the submitted set; UPDATE now asserts `changes === 1` (stale version otherwise), as `updateSession`. Audit and rollback unchanged; unconfirmed Clock out leaves saved rows untouched.
- After: new test file 6/6 (exit 0, `green-after-fix.txt`); `npm run verify` exit 0 on Node v24.21.0: 11 files, 180/180 tests, typecheck/lint/build clean, smoke 13/13 (`verify.txt`); `npm run digest` exit 0: `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59` (533 files, includes uncommitted fix and test; `digest.txt`).
- WP1_HANDOFF.md/.vi.md: fix section appended, original kept.
- Deviation/risk: ran in the project folder (not a clean export). Unconfirmed Clock out with non-empty submitted breaks still appends without checking saved rows; outside F-01, noted in the handoff.
- Normalized evidence logs (green-after-fix, red-before-fix) to a single final LF, no trailing whitespace; the other evidence files, brief and WP1_HANDOFF.md/.vi.md checked clean.
