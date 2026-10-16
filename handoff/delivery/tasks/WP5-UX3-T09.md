# WP5-UX3-T09 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T09; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T08B-FREEZE. Slice of UI change round 3: the Check out
  dialog uses the new break rows (and chips) with its existing E-1 semantics; the remaining
  batch-review "label" strings become "category".
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded;
  follow the on-disk section "Frontend and UI/UX standards".
- Owner basis (board `owner_decisions`, 2026-10-15): U-24 (a simpler break area: one
  "Confirm no breaks taken" checkbox, one row per break, Suggest and Add break) applies to
  every place breaks are entered, including Check out; Q6 (b) (the break date field only
  for a session that crosses midnight) and the 24-hour chips; G-2 (a) "Category".
- Design sources (the contract): `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results section B8
  bullet "Check out" (E-1: an empty list with the box unticked omits `breaks` and checks out
  with breaks not confirmed; a listed set or the ticked box confirms and replaces the saved
  rows), section C (docs/10 E-1, docs/12 "Unconfirmed breaks": Check out is refused with 422
  while a break row is unconfirmed and future break rows on an open session are refused),
  section H row WP5-UX3-T09; `handoff/delivery/tasks/WP5-UX3-PLAN2.md` item 6 ("Check out
  keeps E-1 and its explicit submit labels; the notice is not used there"); the T06 model
  (`buildCheckOutDialogRequest`) and the T08/T08B records (`BreakRows`, chips, the
  sub-dialog, the date rule).
- Coordinator decisions (board): T09 also owns the three batch-review strings that still say
  "label" ("Review label change for {date}", "Recorded work conflicts with the new label", "I
  confirm the label change for these dates") and their two assertions in
  `timesheet.spec.ts`.
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size S, risk H (Check out writes the session end and
  its breaks; E-1 semantics), novelty no. Task record in English.
- Base: HEAD = origin/main = the WP5-UX3-T08B-FREEZE commit (board `commit_sha`), or a later
  commit that changes only `handoff/`; source digest as recorded by that freeze. Record HEAD,
  `git status --short` and the digest before you edit. Uncommitted coordinator files under
  `handoff/` are expected: never touch them.

## Scope

1. `ClockOutDialog.tsx` uses `BreakRows` (rows, chips below the threshold, the sub-dialog,
   "Confirm no breaks taken", Suggest and Add break, the date rule) and builds its request
   with `buildCheckOutDialogRequest` (E-1 as above). Its explicit submit labels stay (no G-4
   notice and no extra save confirmation; Check out is its own explicit act). The stale
   version and the server's 422 for unconfirmed rows and `future_break` behave as today,
   with `break_index` mapped to the row or chip.
2. When nothing imports `BreaksEditor.tsx` any more, delete it with a plain `rm` of that one
   literal path (no `git rm`); `npm run digest` then exits 1 on the unstaged deletion: record
   a probe digest as T08 did and say so.
3. The three batch-review strings say "category" ("Review category change for {date}",
   "Recorded work conflicts with the new category", "I confirm the category change for these
   dates"), with their assertions updated.

## Tests

- e2e (both projects): Check out with listed rows (confirmed, replace saved rows), with the
  box ticked (`breaks: []`, confirmed), with nothing (the request omits `breaks`; the day
  shows "Breaks not confirmed"), a stale version, a `future_break` refusal marked on its row
  or chip; the phone chip path at the narrow width; the existing Check out flows
  (`day-editor.spec.ts` about 477-559, `shell.spec.ts` check-out step) keep their request-body
  assertions with the new controls; the batch-review strings (`timesheet.spec.ts:403,408`).
- List every changed assertion with file:line and why it is not a weakening; the 390x844
  first-screen budgets still pass; no assertion removed or weakened; no `skip`, `fixme` or
  `.only`; dates only from the server-reported `today_local` and the displayed period.
- One mutation check: Check out with an empty unticked list sends `breaks: []` instead of
  omitting it: an e2e request-body check fails; revert.

## Hard constraints

- No server, API, domain, schema or CSP change; the same request shapes as today; T06 model
  exports unchanged.
- Never compute an accounting date from the device clock or the display zone.
- Tokens only; WCAG 2.2 AA; keep AX-01..AX-10, R-12, B3-01 and every earlier behaviour.

## Owned paths

- `src/client/components/ClockOutDialog.tsx`, `src/client/components/BreaksEditor.tsx`
  (deletion only), `src/client/TimesheetScreen.tsx` (the three strings only),
  `src/client/styles.css` (only if needed)
- `tests/e2e/day-editor.spec.ts`, `tests/e2e/shell.spec.ts` (check-out step only),
  `tests/e2e/timesheet.spec.ts` (the two string assertions only)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T09/` (masked LF `.txt` only, plus at most four
  screenshots whose basenames end in `-synthetic.png`)

## Checks (in this order; verify and digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Implement, then `npm run typecheck`, `npm run lint`, `npm test`.
4. `npm run build`: record the main chunk size; no chunk-size advisory.
5. The FULL e2e suite on both projects on the real clock (`npm run test:e2e`), alone, with
   `E2E_SCREENSHOT_DIR` and the Playwright output folder inside the task folder. 0 failed;
   counts per project. `ERR_NO_BUFFER_SPACE` or an ECONNRESET in `automation.spec.ts`: rerun
   that test three times, then the full suite once. Any other failure in a file you do not
   own: stop and report it.
6. The mutation check.
7. Privacy and whitespace: Grep changed files and evidence for email addresses and
   user-profile paths (only the full synthetic example.invalid form may remain); Grep every
   new or changed file for `[ \t]+$` and read its last lines (exactly one final newline).
8. `npm run verify` with `SMOKE_PORT` in 48780-48799 and `DATA_DIR` and `DATABASE_PATH`
   both inside the task folder.
9. `npm run digest` LAST (or the probe digest after a deletion). If any file changes after
   it, rerun verify and the digest.
10. Copy the masked logs of steps 2-6, 8 and 9 into the evidence folder (logs only).

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN
  FOR A READ-ONLY LISTING. NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`
  (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR `rm -rf` ANYTHING.** Redirect to a file in the
  task folder and read it with the Read tool; list files with the Glob tool. Use the Write
  and Edit tools for files (no sed, no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T09`. Set TEMP and TMP to it. Ports
  48780-48799. Never touch `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never
  kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push; do not install or change dependencies. Write no
  markdown links in Results (paths in backticks only).

## Return

At most 150 words, beginning with 'Self-reported model: ...': files changed and deleted
(every test file with changed assertions), the Check out request rules as implemented, unit
and full e2e counts per project, the mutation result, the budget numbers, the main chunk
size, verify exit code, the final full 64-hex digest (or probe digest) and file count, the
evidence files, the background-task confirmation, any stop, conflict or deviation.

## Results
