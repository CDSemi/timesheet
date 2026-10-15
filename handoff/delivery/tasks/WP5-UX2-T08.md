# WP5-UX2-T08 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T08; package WP5; kind implement;
  attempt 1; depends on WP5-UX2-T07-FREEZE (done). Eighth slice of UI change round 2.
- Owner request (2026-10-14, verbatim on the board): "Đổi chữ Clock in/out thành Check
  in/out", that is, change the wording "Clock in/out" to "Check in/out".
- Design and inventory: `handoff/delivery/tasks/WP5-UX2-PLAN3.md` Results item 4 (every
  user-visible occurrence with file:line, the recommended scope, what stays unchanged)
  and item 5 (test changes).
- Coordinator decision (board `coordinator_decisions`, 2026-10-14):
  - The rename covers every user-visible client string and its tests, plus the three
    server message literals that reach the screen (`src/server/services/timesheetCommands.ts`
    about lines 539, 573 and 599). That is a wording change only.
  - API paths (`/api/clock/in`, `/api/clock/out`), event types
    (`work_session.clock_in` and `clock_out`), `source: 'clock'`, database names, error
    codes (`open_session_exists`, `no_open_session`), component, file and CSS class
    names (`ClockPanel`, `ClockOutDialog`, `clock-panel`), `data-clock` and integration
    test titles stay UNCHANGED.
  - Docs change in the docs slice (WP5-UX2-T10), not here.
- Profile/routing: timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override. Routing: size M (wide but mechanical), risk M (three server
  literals; `dist/server` changes only in them), novelty no. Task record in English.
- Base: HEAD = origin/main = 9864400243ee0da55ff6241cca7a6ddf720e765d, or a later commit
  that changes only `handoff/`. Source digest
  3416cf04012f3da4a44b3968d384200e108301741ee599f37fdfe61b388975e8 (812 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## Read

- AGENTS.md from disk first.
- PLAN3 Results items 4 and 5.
- The files of the inventory, then search again yourself, case-insensitively, for
  "clock in", "clock out", "clocked in", "clocked out", "clock-in", "Checking the clock"
  and a bare "Clock" label across `src/client/` and `src/server/` user-facing strings
  (error messages, labels, notices, `aria-label`s, headings, History and OT operation
  labels). Email templates and PDF text were found free of the phrase; confirm it.

## Implement

1. **Wording, user-visible only.**
   - "Clock in" becomes "Check in"; "Clock out" becomes "Check out".
   - "Clocked in since HH:MM" becomes "Checked in since HH:MM"; "Clocked out" becomes
     "Checked out".
   - The dialog heading "Clock out" becomes "Check out". The buttons become "Check out,
     breaks unconfirmed", "Check out, no breaks taken" and "Check out with these
     breaks".
   - The notices "Clocked out." and "... Clock out again ..." follow the same pattern.
   - The History and OT labels "Clocked in" / "Clocked out" become "Checked in" /
     "Checked out".
   - Settings "Clock in/out" becomes "Check in/out", and the legend "first clock-in"
     becomes "first check-in".
   - The region name "Clock" becomes "Check in and out", or a clearer short name of your
     choice (record it).
   - The loading text "Checking the clock" becomes a wording without "clock" (for
     example "Checking your status"; record it).
2. **Server.** Change only the three message literals in `timesheetCommands.ts`, for
   example "Check out of the running session first", "There is no running session to
   check out of" and "A saved break ends after this Check out...". Keep their error
   codes and HTTP statuses. Also update the comment at about line 589 if it names the UI
   action. Nothing else on the server.
3. **Comments.** Update client comments that quote the UI wording. Leave identifiers.

## Tests

- Update every assertion that reads a renamed visible string, accessible name, region
  name, notice or server message:
  - e2e specs: day-editor, shell, isolation, review, sharing, focus-ring, timesheet;
  - client unit tests;
  - integration tests that assert the three messages.
- Forbidden-name lists (for example in `isolation.spec.ts` and `sharing.spec.ts`, which
  assert that the clock controls are absent for a grantee) must contain BOTH the new
  names and the old names, so the absence stays proven.
- Show in Results, for each changed assertion, that it keeps its fact.
- Add one unit or integration check that each of the three server messages contains
  "Check" and its error code is unchanged.
- Integration test titles, API paths and identifiers stay as they are.
- No assertion removed or weakened. No new `skip`, `fixme` or `.only`.

## Server delta proof

After `npm run build`, compare `dist/server` with a build of 9864400:
- build the base in a scratch export or worktree inside the task folder, never in the
  repository;
- diff the two `dist/server` trees file by file.

The only differences must be the three message literals (and a changed comment line
only if the build keeps comments). Save the diff summary as evidence. Any other
`dist/server` difference: stop and report.

## Hard constraints

- No API, request-body, domain, calculation, schema, PDF, email-template or CSP change.
- Not owned: `src/client/api.ts`, every docs file, `DEVELOPMENT.md`, `README.md`, and every
  file not listed under "Owned paths".
- Keep every behaviour that earlier audits and slices verified:
  - AX-01..AX-10 and R-12 (accessible names contain the visible text);
  - the phone budgets: landing 659/758/667/766; away on the first window day
    777.5/785.5; all against 788. If longer labels move layout, measure them;
  - 44px targets;
  - AC-16: a grantee never gets check in/out controls;
  - the T01 to T07 behaviour and tests.

## Owned paths

- Client: `src/client/components/ClockPanel.tsx`, `src/client/components/ClockOutDialog.tsx`,
  `src/client/TimesheetScreen.tsx` (notices), `src/client/components/otModel.ts`,
  `src/client/components/SharingSettings.tsx`, `src/client/components/PolicyFields.tsx`,
  `src/client/DayEditor.tsx` (comments), `src/client/components/SharingItemsFields.tsx`
  (comment), `src/client/components/sharingModel.ts` (comment),
  `src/client/components/sessionModel.ts` (comments),
  `src/client/components/periodBarModel.ts` (comments). Any other client file with a
  user-visible "Clock" string: list it in Results.
- Server: `src/server/services/timesheetCommands.ts` (the three literals and the comment
  only).
- Tests (only assertions on the renamed strings, comments, and the new message check):
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/isolation.spec.ts`,
  `tests/e2e/review.spec.ts`, `tests/e2e/sharing.spec.ts`, `tests/e2e/focus-ring.spec.ts`,
  `tests/e2e/timesheet.spec.ts`, `tests/e2e/fixtures.ts` (comment only),
  `tests/client/sessionModel.test.ts`, `tests/client/dayModel.test.ts`,
  `tests/client/sharingModel.test.ts`, `tests/client/periodBarModel.test.ts`, and the
  integration tests under `tests/integration/` that assert the three messages (list
  each).
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T08/` (masked LF `.txt` only)

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Implement. Then grep the client and server user-facing strings again: no visible
   "Clock in", "Clock out", "Clocked" or "clock-in" may remain. Save the grep result.
   Identifiers are allowed.
4. Run `npm run typecheck`, `npm run lint` and `npm test`.
5. Run the FULL e2e suite on both projects (`npm run test:e2e`):
   - set `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder;
   - run it alone, never in parallel with another Playwright run;
   - record the counts per project; the run must end with 0 failed.

   If `automation.spec.ts:118` fails with ECONNRESET, or a run fails with
   `ERR_NO_BUFFER_SPACE`, rerun only that test three times and record it. Then rerun the
   full suite once.
6. Run the server delta proof above.
7. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim in Results.
8. Run `npm run verify` with `SMOKE_PORT` in 48650-48669, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
9. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it with the Read
  tool. Use the Write and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Never write into the repository root or a drive root. Create the task folder first.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T08`. Set TEMP and TMP to it. Use ports
  48650-48669 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write
  no markdown links in Results (paths in backticks only).

## Return

At most 150 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the new wording choices (region name, loading text);
- the grep result;
- the server delta summary;
- the forbidden-list handling;
- the unit and full e2e counts per project;
- the verify exit code;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Status: stopped (blocked on a file not owned).

- Base: HEAD 9864400243ee0da55ff6241cca7a6ddf720e765d; digest 3416cf04...975e8 (812 files); Node v24.21.0. Log: `D:\.claude-tmp\timesheet\WP5-UX2-T08\base.txt`.
- Wording: region name "Check in and out"; loading text "Checking your status"; dialog hint "check-out time"; stale text "then check out again".
- Client files changed: ClockPanel.tsx, ClockOutDialog.tsx, TimesheetScreen.tsx, otModel.ts, PolicyFields.tsx, SharingSettings.tsx, DayEditor.tsx, SharingItemsFields.tsx, sharingModel.ts, sessionModel.ts. Server: timesheetCommands.ts (three literals plus one comment).
- Tests changed: e2e day-editor, shell, isolation, review, sharing, focus-ring, fixtures (comment); client sessionModel, sharingModel (titles); integration clock-out-breaks (message contains "Check out" on the legacy-break 422) and timesheet-api (open_session_exists 409 message; new test: no_open_session 409 message contains "check out"). Forbidden lists in isolation and sharing hold new and old names.
- Grep of `src/client` and `src/server`: only identifiers, ids, a CSS comment and two comments in `src/server/routes/shares.ts` (not owned) remain; log `grep-src.txt`.
- typecheck 0, lint 0, npm test 88 files / 1878 tests passed.
- Full e2e (one run): 410 passed, 32 skipped, 4 failed. All 4 are `keyboard-access.spec.ts` AX-01 (desktop 1280/768, mobile 390/320): line 177 of that file, which is NOT owned, still asserts button name /^Clock (in|out)$/. Stopped per the brief. Needed: change that regex to /^Check (in|out)$/ (or allow both).
- Not done: server delta proof (base export prepared in the task folder `base/`, not built), verify, final digest.
- Note: a mis-escaped junction was briefly created inside the repository root; the link and the empty folder were removed (node_modules intact).

## Addendum 1 (coordinator, 2026-10-14)

- Owned paths grow by exactly one test line: `tests/e2e/keyboard-access.spec.ts`, the
  button-name pattern at about line 177. Change `/^Clock (in|out)$/` to
  `/^Check (in|out)$/`.
  - This is the same AX-01 fact with the renamed label, not a weakening.
  - Do not accept both names: the old name must no longer exist.
- Leave the two comments in `src/server/routes/shares.ts` unchanged. They are comments in
  a file outside the slice, and leaving them keeps the server delta to
  `timesheetCommands.ts` only.
- Record the junction incident in Results:
  - the exact path that was created and the command that created it;
  - how it was removed (command);
  - proof that nothing is left: `git status --short` showing no untracked path in the
    repository root, and a listing of the repository root saved to the task folder;
  - that `node_modules` still resolves, which `npm run verify` proves.
  - Never create links or junctions inside the repository.
- Then finish the remaining checks, in this order:
  - the FULL e2e suite on both projects, alone (0 failed);
  - the server delta proof (build the base export in the task folder `base/`; diff
    `dist/server`; only the three literals, plus the comment only if the build keeps
    comments);
  - the privacy grep;
  - `npm run verify`;
  - `npm run digest` LAST.
- Copy the masked logs into `handoff/delivery/evidence/WP5-UX2-T08/` (masked LF `.txt`
  only). Append "Addendum 1 results" with the Edit tool.
- All runtime rules still apply: no stdin scripts, no pipes into head or tail, no
  `/dev/null`, no `rm -r`, no cmd.exe.

## Addendum 1 results

Status: done.

- `tests/e2e/keyboard-access.spec.ts` line 177 now `/^Check (in|out)$/` (old name no longer accepted). `src/server/routes/shares.ts` untouched.
- Junction incident: command run from Git Bash was `powershell.exe -NoProfile -Command "New-Item -ItemType Junction -Path '$T\base\node_modules' -Target '<repo>\node_modules'"`; the escaped backslashes were lost, so a link (symlink/junction) was created at `<repo>/.claude-tmptimesheetWP5-UX2-T08/base/node_modules`. Removed with `rm .claude-tmptimesheetWP5-UX2-T08/base/node_modules` (link only, no -r), then `rmdir` of the two empty folders (the second succeeded on retry after a transient Dropbox busy error). Proof: `status-root.txt` shows no untracked path in the root; `root-listing.txt` shows no such entry; `node_modules` resolves (typecheck, verify pass). The later correct junction `base/node_modules` lives in the task folder outside the repository.
- Full e2e, run alone: 414 passed, 32 skipped, 0 failed. Per project: desktop 204 passed / 19 skipped; mobile 210 passed / 13 skipped.
- Server delta (base 9864400 built with `tsc -p tsconfig.server.json` in the task folder vs `npm run build` of the working tree): only `dist/server/services/timesheetCommands.js` differs, 4 lines: the 3 literals plus 1 comment kept by the build. `dist/domain` identical.
- Privacy grep over changed src/tests: only `@example.invalid` synthetic addresses. Evidence root listing masked.
- typecheck 0, lint 0, npm test 88 files / 1878 tests, verify exit 0 (SMOKE_PORT 48655, DATA_DIR and DATABASE_PATH in the task folder).
- Final digest (last command): d3c1f7cac3ddf8f7da5c64ab1a9387c8664b955bcc1bbe246cd57e202c78d4ab (812 files).
- Evidence: `handoff/delivery/evidence/WP5-UX2-T08/` (base, grep-src, typecheck, lint, test, e2e2, build, dist-server.diff, dist-server-files, privacy, status-root, root-listing, verify, digest .txt).
- Evidence rename: `dist-server.diff` was rewritten as `dist-server-diff.txt` (same content, base path shortened) and the old file removed, to meet the .txt naming rule.
- No background task running.
