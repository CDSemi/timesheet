# WP5-UX-FIX2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-FIX2; package WP5; kind fix;
  attempt 1; addresses audit WP5-UX-AUDIT-A (FIX REQUIRED); depends on WP5-UX-GATE
  (PASS).
- Finding WP5-UX-A-01 (Medium), from `handoff/delivery/WP5_UX_REVIEW_A.md` and its
  evidence in `handoff/delivery/evidence/WP5-UX-AUDIT-A/` (`40-leave-probe-runs.txt`,
  `43-novalidate-014.txt`, `43-novalidate-831.txt`, the `leave-*.json.txt` files and the
  probe specs `probe-leave-*.spec.ts.txt`):
  `src/client/components/DayFieldsForm.tsx:60-61` sets `noValidate`, and
  `src/client/components/leaveInputModel.ts:29-33` turns a malformed number field into a
  value. With the same keystrokes, at 831f760 hours "2-" with 30 minutes was stored as
  30 minutes (meant 150), and hours 4 with minutes "3-" as 240; at 014bd47 the same input
  made the form invalid, no `PUT /api/days/:date` was sent and nothing was stored. Empty
  fields save 0 on both commits (unchanged behaviour; keep it).
- Required fix: a malformed hours or minutes part (`validity.badInput`, a non-numeric or
  non-integer value, a negative value, minutes outside today's limits) makes the leave
  input invalid; nothing is sent; the user sees an accessible error message next to the
  field (associated with it, announced, not colour alone); valid input still converts
  to the same integer `leave_minutes` as before. Reproduce first with the auditor's
  input, then fix.
- Profile/routing: timesheet-worker-high (effort high), requested model sonnet, no
  override. Routing: size S, risk H (leave minutes feed the OT/credit ledger), novelty no.
  Task record in English.
- Base: HEAD = origin/main (the coordinator's latest commit; record it) with source digest
  3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9 (frozen at 831f760).
  Record both before you start. Uncommitted coordinator files under `handoff/` are
  expected; never touch them.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/WP5_UX_REVIEW_A.md` (finding A-01) and the evidence named above.
- `handoff/delivery/tasks/WP5-UX-T04.md` (how the hours + minutes input was built).
- docs/02 (leave minutes rules), docs/04 (editing and validation wording).
- `src/client/components/DayFieldsForm.tsx`, `leaveInputModel.ts`,
  `tests/client/leaveInputModel.test.ts`, `tests/e2e/day-editor.spec.ts`,
  `tests/e2e/ot-leave.spec.ts`.

## Hard constraints

- No server, API or request-body change. Valid input sends exactly what it sends today.
- Keep the empty-fields-save-0 behaviour.
- Do not remove `noValidate` blindly if it is needed for the custom messages; the result
  must be that no malformed value is ever sent. Explain your choice in Results.
- No e2e assertion is removed or weakened.

## Owned paths

- `src/client/components/DayFieldsForm.tsx`, `src/client/components/leaveInputModel.ts`
- `src/client/styles.css` (tokens only, only if the error message needs it)
- `tests/client/leaveInputModel.test.ts`
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/ot-leave.spec.ts`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-FIX2/` (masked LF `.txt` only)

If another file must change, stop and report it instead of editing it.

## Checks (in this order; verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. Reproduce A-01 at the base (a failing unit or e2e test that sends the malformed input
   and expects no PUT); record the failing run.
3. Fix; then `npm run typecheck`, `npm run lint`, `npm test` (new unit cases: "2-",
   "3-", "1.5", "-1", "e", "", out-of-range minutes, and valid cases unchanged).
4. The e2e specs `day-editor` and `ot-leave` on both projects (with a new e2e case for
   the auditor's input showing no PUT and an accessible error), then the FULL e2e suite
   on both projects. Record counts.
5. A Grep over your changed files and evidence for user-profile paths and email
   addresses; record the counts.
6. `npm run verify` with `SMOKE_PORT` in 47950-47959 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder.
7. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
8. Copy masked logs of steps 2-4, 6 and 7 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -` OR `python -`.
  NEVER PIPE OUTPUT INTO `head` OR `tail`** (redirect to a file in the task folder and
  read it with the Read tool). Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.
  Never redirect output to any other path** (an earlier agent left a stray file at the
  D: drive root).
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-FIX2`: set TEMP and TMP to it. Never touch
  `%LOCALAPPDATA%\timesheet-dev` data.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or
  push.

## Return

At most 130 words, beginning with 'Self-reported model: ...': the reproduction, the fix
and why, files changed, unit and full e2e counts per project, verify exit code, the final
digest, the evidence files, the background-task confirmation, and any stop or deviation.

## Results

Model: claude-sonnet-5-5. Base: HEAD = origin/main = 5beae2f668d15fc77a39b91a91e2c8bb6195d65a;
frozen source digest 3d274c9e...ea9 (831f760) as given in the brief.

Root cause: a number input reports unreadable text ("2-", "e") as value "" with
`validity.badInput`, so the draft held "" and `wholeNumber("")` read it as 0 (hours "2-" +
30 minutes = 30). The model never saw the bad text.

Reproduction (before the fix, evidence `20-repro-unit.txt`, `22-repro-e2e.txt`):
- Unit: `parseLeaveInput({hours:'', minutes:'30', hoursBad:true})` returned
  `{ok:true, minutes:30}`; `invalidLeaveParts` did not exist (2 of 9 failed).
- E2E (new test, desktop): after typing "2-" in hours and 30 in minutes and saving, no alert
  appeared (`getByRole('alert')` count 0, expected 1): the day was saved.

Fix (no server/API/request-body change):
- `leaveInputModel.ts`: `LeaveInput` gains optional `hoursBad`/`minutesBad`; new
  `invalidLeaveParts()` (which part is wrong; both when each is fine but the total passes
  24h 00m); `parseLeaveInput` refuses any flagged part. Valid input returns the same integer
  `leave_minutes`; empty fields still give 0.
- `DayFieldsForm.tsx`: at submit it reads `validity.badInput` from the two inputs through
  refs (authoritative: a lone "e" raises no change event, which my first attempt using
  onChange alone missed and the e2e caught). onChange also keeps flags for the live hint.
  A refusal sends nothing and shows a `role="alert"` message inside the Partial leave
  fieldset, with `aria-invalid` and `aria-describedby` on the offending field(s); it clears
  on the next edit or save. Message text, not colour alone.
- `noValidate` is kept: it only suppresses the browser's own popups; the model now sees the
  browser's bad-input flag, so no malformed value can be sent and the app's own message is
  the single announced error.

Tests: unit `tests/client/leaveInputModel.test.ts` (+3 cases: "2-", "3-", "e", "1.5", "-1",
empty, out-of-range, bad-input flags, `invalidLeaveParts`, valid unchanged); e2e
`tests/e2e/day-editor.spec.ts` new test "malformed leave hours or minutes are never saved ...":
"2-", "3-", "e", "1.5", "-1", 60 minutes, 24h 01m each give one alert, aria-invalid and
aria-describedby on the right field(s), no PUT, nothing stored; then 2h 30m sends 150 and
empty fields send 0.

Unrelated, pre-existing flake fixed in an owned file (no assertion removed or weakened):
`day-editor.spec.ts` "future days show as upcoming ..." failed on desktop and mobile on
2026-10-09 at the unchanged base client too (`45-day-editor-base.txt`): after "Next period"
it waited for 14 `[data-day]` rows, but the previous sheet also has 14, so `row.count()`
raced the render and the loop clicked past the period holding the future day. Each click
now waits for the Pay period region text to change before counting.

Results: `npm run typecheck` 0; `npm run lint` 0; `npm test` 82 files, 1820 tests passed;
e2e `day-editor` + `ot-leave`: 53 passed, 1 skipped (exit 0); FULL e2e both projects: 157
passed, 5 skipped (desktop 78 ok + 3 skipped, mobile 79 ok + 2 skipped; the skips are the
suite's existing project-specific ones), exit 0. Grep of changed files and evidence for
user-profile paths and email addresses: 0 and 0 (evidence masked). `npm run verify`
(SMOKE_PORT 47951, DATA_DIR and DATABASE_PATH in the task folder) exit 0. Final
`npm run digest`:
574bbc022ba2a8391e914e351979c60909d76ff6099d249ce23730f2a2c525d8 (789 files, handoff/
excluded); no file outside handoff/ changed after it.

Evidence (`handoff/delivery/evidence/WP5-UX-FIX2/`): 20-repro-unit, 22-repro-e2e,
30-typecheck, 31-lint, 32-test, 34-e2e-targeted, 40-e2e-full, 45-day-editor-base (the
flake at the base client), 46-counts, 50-verify, 51-digest (all `.txt`).

Deviations: one shell call redirected to /dev/null by mistake (a no-op `python3 --version`;
it wrote nothing). To check the flake at the base I temporarily restored the two base
component files from `git show HEAD:` and put my versions back from the task folder
(`git status` confirmed). No background task of mine is running.

Status: done
