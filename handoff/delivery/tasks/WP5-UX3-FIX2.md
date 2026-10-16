# WP5-UX3-FIX2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX2; package WP5; kind fix;
  attempt 1; depends on WP5-UX3-FIX1-FREEZE. Second fix task of the round-3 fix round: the
  findings of the read-only sweep WP5-UX3-SWEEP (record
  `handoff/delivery/tasks/WP5-UX3-SWEEP.md`, section "Findings", evidence
  `handoff/delivery/evidence/WP5-UX3-SWEEP/`).
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded.
- Coordinator decision (board `coordinator_decisions`, 2026-10-16) fixes the scope below;
  finding 12 is accepted as documented E-1 behaviour and is not changed here.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size M, risk M, novelty no. Task record in English.
- Base: HEAD = origin/main = the WP5-UX3-FIX1-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`; source digest as recorded by that freeze. Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Items (sweep finding numbers; reproduce each first, then fix)

1. **Focus after an account-menu entry** (Medium): choosing Profile, Settings or
   Administration by keyboard closes the panel and leaves focus on `<body>`. On a route
   change move focus to the new page's main heading (`h1`, made focusable with
   `tabindex="-1"` if needed, without a visible change for mouse users); when the route does
   not change, return focus to the identity button. The phone More panel follows the same
   rule. Extend `tests/e2e/shell.spec.ts` (the keyboard test near line 588) for desktop and
   phone.
2. **Device-date mutant M18 survives** (Medium): make the past-day pre-fill test fail for a
   device-clock rule at any hour: choose the device zone (or a fixed browser clock with
   `page.clock`) from the server's `today_local` so the device date differs from the
   reporting-zone date during the test, and assert both branches (a past day gets suggested
   breaks; the server's today gets none). Prove it: apply M18 (`SessionDialog.tsx` using
   `new Date().toLocaleDateString('en-CA')` for the rule) and show the test fails; revert.
3. **Editor chip for an in-progress day** (Low): the Day editor's period chip must say "in
   progress" for every day of the in-progress period during the window days, however the day
   was opened (sheet, Open a day, Today), decided by the day's own period from the server's
   periods; add the Open-a-day path to `tests/e2e/today.spec.ts` under the simulated clock at
   2026-10-26T16:00:00Z.
4. **Wording** (Low): `BatchDialog.tsx` "Only the day label changes." becomes "Only the day's
   category changes."; user-visible "label" wording for the day category in `OtScreen.tsx`
   ("Day label and recorded use differ") and `HolidayImport.tsx` ("Days whose default label
   changes") becomes "category"; `ImportPreview.tsx` "Label as read" stays (it names the
   workbook's own column). Update the assertions that pin these strings (value-only).
5. **docs/12** (Low): `docs/12_RELEASE_NOTES.md:71` and the VI line: a refused Check out is
   resolved in the Check out dialog (its break rows or "Confirm no breaks taken"); "Confirm
   breaks" on a session card applies to ended sessions.
6. **docs/10** (Low): the main chunk figure at `docs/10_DECISIONS_AND_SOURCES.md:240` (VI
   :241) becomes the frozen build's figure after FIX1 and FIX2 (record it) or "under the 500
   kB advisory"; 9. the section reference at docs/10:226 (VI :227): the old sentence was
   docs/04 line 16, the paragraph after the Screens table.
7. **Profile in a different device zone** (Low): run the Profile assertion of
   `tests/e2e/settings-routes.spec.ts` with a device zone that differs from the reporting
   zone (for example Asia/Tokyo) so mutant M21 (device zone shown) fails; prove it; revert.
8. **Discard question at Check out** (Low, U-26): the Check out dialog asks "Discard your
   changes?" (Keep editing first, Discard) on Cancel, the X or Escape when its rows or the
   box changed; it closes at once when nothing changed; still no G-4 notice and no final
   confirmation there (Check out is its own explicit act). Tests in `day-editor.spec.ts`.
10. **Unused helpers** (Info): remove `quickBreaksRequest` and `confirmBreaksDraft` from
    `dayEditorModel.ts` if only tests use them, moving any oracle assertion that still
    proves something into the T06 model tests; or keep them clearly marked test-only and
    correct the comment that says "when nothing fits, for none". Say which.
11. **Ungated hover** (Info): put `.sheet-day[data-lift]:hover` and its pre-existing sibling
    `.sheet-day:hover` under `@media (hover: hover)` (AGENTS UI rule 3; docs/04 hover rule);
    keep the hover checks green.
13. **Hint link** (Info): link the "Calendar default ..." hint to the Category select with
    `aria-describedby` (`DayFieldsForm.tsx`).

## Checks (in this order; verify and the digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Reproduce items 1, 2, 3, 7 and 8 and record them.
4. Implement, then `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` (no
   chunk-size advisory; record the main chunk size).
5. The FULL e2e suite on both projects on the real clock, alone, with its own output folder:
   0 failed; counts per project. Then `today.spec.ts` and `day-editor.spec.ts` under the
   FIX10 simulated clock at 2026-10-26T16:00:00Z and 2026-10-20T17:00:00Z (copy the preload
   into your task folder only).
6. The mutant proofs of items 2 and 7, each applied alone and reverted.
7. EN/VI parity of the two docs pairs; `validate_package.py --preflight` with the workflow
   Python (`<user>` in evidence).
8. Privacy and whitespace: Grep changed files and evidence for email addresses (only the full
   synthetic example.invalid form) and user-profile paths; Grep every new or changed file for
   `[ \t]+$` and read its last lines (exactly one final newline).
9. `npm run verify` with `SMOKE_PORT` in 49000-49019 and `DATA_DIR` and `DATABASE_PATH` inside
   the task folder.
10. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
11. Copy the masked logs into the evidence folder (logs only, no helper scripts).

List every changed assertion with file:line and why it is not a weakening; no assertion
removed or weakened; no `skip`, `fixme` or `.only`. No server, API, domain, schema or CSP
change. Tokens only; WCAG 2.2 AA; keep every earlier behaviour including the FIX1 fixes.

## Owned paths

- `src/client/components/AccountMenu.tsx`, `src/client/components/AppShell.tsx`,
  `src/client/App.tsx` (route focus only), `src/client/SettingsScreen.tsx`,
  `src/client/ProfileScreen.tsx`, `src/client/AdminScreen.tsx` (heading focus only),
  `src/client/TimesheetScreen.tsx`, `src/client/DayEditor.tsx`,
  `src/client/components/dayEditorModel.ts`, `src/client/components/BatchDialog.tsx`,
  `src/client/OtScreen.tsx`, `src/client/components/HolidayImport.tsx`,
  `src/client/components/ClockOutDialog.tsx`, `src/client/components/DayFieldsForm.tsx`,
  `src/client/styles.css`
- `tests/client/dayEditorModel.test.ts`, `tests/client/breakRowsModel.test.ts` (moved oracle
  assertions only), `tests/e2e/shell.spec.ts`, `tests/e2e/day-editor.spec.ts`,
  `tests/e2e/today.spec.ts`, `tests/e2e/settings-routes.spec.ts`, `tests/e2e/timesheet.spec.ts`
  (string assertions only), `tests/e2e/import.spec.ts` and `tests/e2e/ot-leave.spec.ts`
  (string assertions only), `tests/e2e/hover.spec.ts`
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`, `docs/12_RELEASE_NOTES.md` and `.vi.md`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-FIX2/` (masked LF `.txt` only, plus at most six
  screenshots whose basenames end in `-synthetic.png`)

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`.
  NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the task folder and read it
  with the Read tool; list files with the Glob tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-FIX2`. Set TEMP and TMP to it. Ports
  49000-49019. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 200 words, beginning with 'Self-reported model: ...': per item the cause and the fix,
files changed, every changed assertion, unit and full e2e counts per project, the
simulated-clock results, the mutant proofs, parity and preflight, the main chunk size, verify
exit code, the final full 64-hex digest and file count, the evidence files, the
background-task confirmation, any stop, conflict or deviation.

## Results
