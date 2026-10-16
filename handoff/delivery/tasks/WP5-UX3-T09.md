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
- Base: HEAD = origin/main = f89573b89435b651f5d7cdca7811b972a82087bc (the T08B freeze), or
  a later commit that changes only `handoff/`; source digest
  dd620f70e47c55a0b2fb1dcce215d390bb5156bf47da8a470f22a19d8ed21355 (834 files). Record HEAD,
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

## Addendum 1 (coordinator, 2026-10-16)

Your hand-back left two wording points outside your owned paths. The coordinator extends
your owned paths for exactly these:

1. `src/client/components/BatchDialog.tsx`: "Recorded work conflicts with the new label"
   becomes "Recorded work conflicts with the new category" and "I confirm the label change
   for these dates" becomes "I confirm the category change for these dates" (wording only);
   update the matching assertion in `tests/e2e/keyboard-access.spec.ts` (about line 382) and
   any other spec that asserts these two strings (value-only; list each).
2. `src/client/components/BreakRows.tsx`: the hint that says "Saving ..." must name the
   action of its dialog: in the session dialog keep "Saving ...", in the Check out dialog
   say "Checking out ..." (a prop or the dialog's context; no other change); add or adjust
   one e2e assertion in `tests/e2e/day-editor.spec.ts` for the Check out wording.

Then rerun `npm test`, the specs you touched on both projects, a FULL e2e run on both
projects (alone), `npm run verify` and the probe digest LAST (the `BreaksEditor.tsx`
deletion is still unstaged). Same runtime rules as the brief. Append "Addendum 1 results"
(files, the changed assertions with file:line, counts, verify exit code, the new probe digest
and file count) and finish with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker-high, effort high). Status: done, with one scope conflict (item 3
below: two of the three batch-review strings live in a file this brief does not own).

**Start.** HEAD `f89573b89435b651f5d7cdca7811b972a82087bc`; `git status --short` showed only the coordinator's `handoff/`
files (`ORCHESTRATION.json`, the two `WORKFLOW_REVISION_CHECKPOINT` files, the T08B-FREEZE and T09 briefs, the untracked
T08B-FREEZE evidence folder); digest `dd620f70e47c55a0b2fb1dcce215d390bb5156bf47da8a470f22a19d8ed21355` (834 files); Node
v24.21.0. Evidence `01-pre-edit.txt`. At the end `git status` also lists the untracked `handoff/delivery/tasks/WP5-UX3-T10.md`
(not mine, not touched).

**Files.**
- Changed: `src/client/components/ClockOutDialog.tsx` (rewritten), `src/client/TimesheetScreen.tsx` (one string),
  `tests/e2e/day-editor.spec.ts`, `tests/e2e/shell.spec.ts`.
- Deleted (plain `rm` of the one literal path, after a Grep showed no importer in `src`, `tests` or `scripts`):
  `src/client/components/BreaksEditor.tsx`. `npm run digest` therefore exits 1 (git hash-object cannot read the unstaged
  deletion); the probe digest is below.
- Not changed: `styles.css` (the break classes are not scoped to the session dialog, so nothing was needed), the T06 model
  (`breakRowsModel.ts` exports unchanged), `BreakRows.tsx`, `BreakSubDialog.tsx`, any server, API, domain or CSP file.

**ClockOutDialog as implemented.**
- Draft: `sessionDialogDraftFromSession(session)`; rows are `BreakRows` (rows from 42rem, chips below the measured width) with
  the T08B sub-dialog (`BreakSubDialog`, rendered outside the form so Enter in it never checks out), `applyBreakEdit`, the
  `beforeAdd` restore and the chip focus effect, as in `SessionDialog`. Title "Check out", section heading "Breaks".
- Date rule: a running session has no end yet (the server ends it at its own current second), so the break rows always show
  their own date field (`breakDateVisible(start date, '')`, as the T08B record item 2 prescribes for a running session). The
  Q6 b "overnight only" rule cannot be decided at Check out because the end instant is not known to the client; see open point 2.
- Request, built only by `buildCheckOutDialogRequest` (E-1): the ticked box sends `{breaks: [], breaks_confirmed: true,
  expected_version}`; one or more listed rows send `{breaks: [...], breaks_confirmed: true, expected_version}` and replace the
  saved rows; an empty list with the box unticked sends `{breaks_confirmed: false, expected_version}` with no `breaks` key.
  `reason` is added only after the server asked for it (`reason_required`). Same request shapes as before.
- Submit labels stay explicit: "Check out, no breaks taken" (box ticked), "Check out with these breaks" (rows listed),
  "Check out, breaks unconfirmed" (empty list, box unticked). No "No breaks listed" notice and no extra confirmation.
- Errors: a client check that fails (T06 `rowErrors`) marks the row or chip and moves focus to the first marked chip; a
  server refusal that names a break (`break_index`, `serverBreakRowError`) marks that row or chip the same way; a refusal
  without an index (`break_outside_session` at Check out) stays the dialog alert; 409 stale_version keeps its message, its
  Reload button and the disabled submit button; `reason_required` shows the reason field.
- "Suggest breaks" uses `suggestionRows(policy, session start, null, input zone)`: the suggestions of a running session are
  all kept (no end to fit inside), and the server's refusal for those that end after now is the existing behaviour.
- The form is `noValidate` (as the session dialog): the reason field is enforced by the disabled submit button.

**Changed assertions (none removed or weakened; no skip, fixme or .only added; dates only from `today_local` through
`seed.today()` and from instants of the seeded session).**
- `tests/e2e/day-editor.spec.ts:1997` (was the old test at `:1622`, "Check in then Check out asks for break confirmation..."):
  kept the Check in through the UI, the one-button assertions, the clocked-in screenshot, "Running since", the Suggest breaks
  count of 3, the refusal `inside their work session` with the session still running, and the final closed session with
  confirmed empty breaks. Changed controls: the radio "Breaks not confirmed yet" checked became the checkbox "Confirm no
  breaks taken" not checked (`:2017`, the old three-way mode is gone by design U-24); "Confirm suggested breaks" is gone
  (listing rows is the confirmation), so the old click was dropped and the button "Check out with these breaks" is asserted
  visible instead (`:2023`); the radio `.check()` became the checkbox `.check()` (`:2032`). Added request-body assertions
  (`:2027-2029`, `:2036-2037`).
- `tests/e2e/day-editor.spec.ts:2047` (the stale test, was `:1667`): the radio `.check()` became the checkbox `.check()`
  (`:2056`, `:2083`); every earlier assertion kept; added: the refused body equals the loaded version (`:2074-2075`), the
  submit button stays disabled after the stale answer (`:2076`), and the second request carries the reloaded version
  (`:2087-2088`).
- New tests: `:1719` listed rows (a saved break stays Break 1, a typed Break 2, body keys `breaks`, `breaks_confirmed`,
  `expected_version`, stored 2 breaks confirmed), `:1778` box ticked (rows hidden, Add and Suggest disabled, body
  `{breaks: [], breaks_confirmed: true, expected_version}`, the saved break replaced), `:1811` nothing (body
  `{breaks_confirmed: false, expected_version}` with no `breaks` key, stored unconfirmed, the day editor says "Breaks not
  confirmed", no alertdialog), `:1846` refusals (suggested rows, a mocked `future_break` with `break_index` 1 marks Break 2
  row or chip and its description, focus on the chip on the phone, then the real server refusal, then success after removing
  Break 3 and 2), `:1922` the phone chip path at 390px on both projects (sub-dialog, Cancel removes a new row and focus returns to
  Add break, chip name, Escape closes only the sub-dialog, Enter is Done and sends nothing, then Check out).
  The refused-then-removed flow uses a mocked 422 only for `future_break`, which the real server cannot answer at Check out
  (the break would be outside the session first).
- `tests/e2e/day-editor.spec.ts:3544`, `:3654`, `:3662`: "Review label change for ..." became "Review category change for ..."
  with the title string of `TimesheetScreen.tsx`; the matching assertion on "I confirm the label change for these dates"
  at `:3555` is unchanged (see the conflict). Not a weakening: the same dialog is found by its new name.
- `tests/e2e/shell.spec.ts:301` and `:454` (the check-out step): the radio `.check()` became the checkbox `.check()`; the
  `Check out, no breaks taken` click and every later assertion are unchanged.
- 390x844 first-screen budgets (`theme.spec.ts:547/554`, `timesheet.spec.ts`, `today.spec.ts`, `sharing.spec.ts`) passed
  unchanged on the mobile project; measured: first day row bottom 658.4 (no share, zone note), 710.4 (received share, zone
  note), 559.5 and 611.5 (without the zone note) of tab bar top 788; shell bar 60px and 112px.

**Conflict and open points.**
1. Scope conflict: the brief names `TimesheetScreen.tsx` for "the three strings" and `timesheet.spec.ts:403,408`, but two of
   the three strings ("Recorded work conflicts with the new label" at `BatchDialog.tsx:131`, and "I confirm the label change
   for these dates" at `BatchDialog.tsx:153`) are in `src/client/components/BatchDialog.tsx`, not an owned path, and they are
   also asserted in `tests/e2e/keyboard-access.spec.ts:382` and `tests/e2e/day-editor.spec.ts:3555`. I changed only the one
   string in an owned file (`TimesheetScreen.tsx:607`, "Review category change for {date}") and its assertions in the owned
   `day-editor.spec.ts`; I did not touch `BatchDialog.tsx`, `keyboard-access.spec.ts` or `timesheet.spec.ts:403,408`. The
   remaining work is two literals in `BatchDialog.tsx` (also `:133` "Only the day label changes.") and four assertions
   (`timesheet.spec.ts:403` and `:408`, `keyboard-access.spec.ts:382`, `day-editor.spec.ts:3555`); a follow-up needs
   `BatchDialog.tsx` and `keyboard-access.spec.ts` owned (the two `timesheet.spec.ts` assertions are already owned).
2. The date field is always shown at Check out (no end known). If the owner wants the field hidden for a same-day session, the
   client needs a server-reported "now" or the session's end; that is a larger change (an API field) and was not made.
3. `BreakRows.tsx` (T08, not owned) ends with the hint "Saving confirms the breaks listed here. Leave the list empty and the
   box unticked if you do not know yet: OT for the day then stays pending." It appears in the Check out dialog too, where the
   button says "Check out ..." not "Save"; accurate in meaning, not in the verb. A `confirmWord` prop would fix it in a later task.
4. Now-unused exports of `sessionModel.ts` and the CSS of the old editor (`.breaks`, `.mode-list`, `.break-row`, `.break-list`)
   may be dead; not removed (not owned; lint and the unit tests are unaffected).

**Checks (in order, real clock; evidence `handoff/delivery/evidence/WP5-UX3-T09/`).**
- `npm run typecheck` exit 0; `npm run lint` exit 0 (`02`, `03`).
- `npm test`: 94 files, 2126 tests, 0 failed (`04`). The first run found one failure in `userWording.test.ts` (my `clock-out-breaks`
  element id matched the old-wording scan); fixed by `useId`, then the run above.
- `npm run build` exit 0; main chunk `index-pp9jykN9.js` 484.21 kB (gzip 142.14 kB); no chunk-size advisory (`05`).
- Full e2e `npm run test:e2e` (build first, alone, `E2E_SCREENSHOT_DIR` and TEMP in the task folder): 680 tests, 614 passed,
  66 skipped, 0 failed, 15.2 min, exit 0 (`06`). Per project: desktop 310 passed + 30 skipped, mobile 304 passed + 36 skipped
  (the skips are the existing project-conditional `test.skip` lines; none was added). The five Check out tests and the two
  rewritten ones passed on both projects. Before the full run a focused run of the same tests: 14 passed.
- Mutation check (`07`): in `ClockOutDialog.tsx` the request was changed to send `breaks: []` when the list is omitted; the
  e2e test at `:1811` failed on both projects ("the list is omitted, not sent empty": received an extra `"breaks": []`);
  reverted exactly (the rebuilt main chunk hash is the same `index-pp9jykN9.js`), and `verify` later rebuilt and passed.
- Privacy and whitespace (`08`): 0 trailing-whitespace matches, one final newline in each changed file, no e-mail or
  user-profile path in the changes.
- `npm run verify` with `SMOKE_PORT=48781`, `DATA_DIR` and `DATABASE_PATH` in the task folder: exit 0, "SMOKE PASSED" (`09`).
- `npm run digest` last: exit 1 (unstaged deletion of `BreaksEditor.tsx`, `10`). Probe digest (the algorithm of
  `scripts/source-digest.mjs` over the files present, run with a script file in the task folder):
  `2038dfc7b1308a0db0372c7ff8bbaf78e24194e7fb61a1a50f8fa54b3e3d143c` (833 files, handoff/ excluded); nothing under `src`
  or `tests` changed after verify. The freeze recomputes it after the deletion is staged.

**Runtime.** Git Bash only; no stdin feed to node or python, no heredoc, no pipe into head or tail (two reads used
`tail -c 2 file | od -c`, a pipe out of tail, not into it), no `/dev/null`, no `rm -r`, no process kill. Helper scripts in the
task folder (`wait-log.mjs`, `probe-digest.mjs`, `mask-copy.mjs`) are not copied to the evidence. The one background run (the
full e2e suite) completed (exit 0) before this record; no background task is left running.

Status: done

## Addendum 1 results

Self-reported model: claude-sonnet-5-5. The two points of the addendum are done; the earlier conflict (item 1 of "Conflict
and open points" above) and open point 3 (the "Saving" hint) are now resolved.

**Files.**
- `src/client/components/BatchDialog.tsx`: "Recorded work conflicts with the new label" became "... the new category" (`:131`)
  and "I confirm the label change for these dates" became "I confirm the category change for these dates" (`:153`). Wording
  only. The line `:133` "Only the day label changes." was not in the addendum and is unchanged.
- `src/client/components/BreakRows.tsx`: a new optional prop `action` (`'Saving'` default, or `'Checking out'`) fills the
  closing hint "{action} confirms the breaks listed here. ..."; nothing else changed. `SessionDialog.tsx` passes nothing, so it
  keeps "Saving confirms ..."; `ClockOutDialog.tsx` passes `action="Checking out"`.
- Tests: `tests/e2e/keyboard-access.spec.ts`, `tests/e2e/timesheet.spec.ts`, `tests/e2e/day-editor.spec.ts`.

**Changed assertions (value-only strings; none removed or weakened; no skip, fixme or .only).**
- `tests/e2e/keyboard-access.spec.ts:382`: heading name "Recorded work conflicts with the new label" became "... new category".
- `tests/e2e/timesheet.spec.ts:403`: the same heading string; `:408`: the checkbox label "I confirm the label change for these
  dates" became "I confirm the category change for these dates".
- `tests/e2e/day-editor.spec.ts:3558`: the same checkbox label (the batch-review conflict step).
- Added (new assertion): `tests/e2e/day-editor.spec.ts:1741-1742` in the listed-breaks Check out test: the text "Checking out
  confirms the breaks listed here." is visible and "Saving confirms" has count 0 inside the Check out dialog. The session
  dialog's "Saving confirms" wording has no assertion in the repository, and was left as it is.
- A Grep of `src` and `tests` for "label change for these", "conflicts with the new label" and "Review label" finds none left,
  except two code comments in `src/server/http/schemas.ts:114` and `src/client/api.ts:211` ("...conflicts with the new
  label"), which are not user-visible text and were not touched (not in the owned paths).

**Checks.**
- `npm run typecheck` exit 0, `npm run lint` exit 0; `npm test`: 94 files, 2126 tests passed (`11-a1-unit.txt`).
- Touched specs (`day-editor`, `keyboard-access`, `timesheet`) on both projects: 193 passed, 37 skipped (project-conditional,
  existing), 0 failed, exit 0 (`12-a1-touched-specs.txt`).
- Full e2e (`npm run test:e2e`, alone, `E2E_SCREENSHOT_DIR` and TEMP in the task folder): 680 tests, 614 passed, 66 skipped, 0
  failed, 14.3 min, exit 0 (`13-a1-e2e-full.txt`). Desktop 310 passed + 30 skipped, mobile 304 passed + 36 skipped. Main chunk
  `index-B_GPJsM_.js` 484.26 kB (gzip 142.15 kB), no advisory.
- Whitespace: 0 trailing-whitespace matches over the six changed files and the evidence `.txt` files; each source file ends with
  one final newline.
- `npm run verify` (`SMOKE_PORT=48782`, `DATA_DIR` and `DATABASE_PATH` in the task folder): exit 0, "SMOKE PASSED"
  (`14-a1-verify.txt`).
- Probe digest last (the `BreaksEditor.tsx` deletion is still unstaged, so `npm run digest` would exit 1 again):
  `1fc57bce41b5be16ff4e3e364f1c6496bf237af87e1dc996e5effb520beacb46` (833 files, handoff/ excluded)
  (`15-a1-probe-digest.txt`). Nothing under `src` or `tests` changed after verify.
- No background task is left running; the full e2e background run completed with exit 0 before this record.

Status: done
