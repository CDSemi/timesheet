# WP5-UX5-FIX18 dispatch brief (the open Day editor follows the page's Check in and Check out)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX18, package WP5, kind fix,
  attempt 1.
  - It answers the audit WP5-UX5-AUDIT-INT (FIX REQUIRED on a5cbc91), and depends on
    WP5-UX5-REGATE12 (PASS on a5cbc91 / 69c6daff).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size S, risk H (an unsaved-changes form against the day's version check),
    novelty no. docs/08 row "High-risk fix/slice with an existing pattern".
  - Reproduce first, then fix.
  - Write the task record in English.
- **The finding.** Read `handoff/delivery/WP5_UX5_REVIEW_INT.md`, section "Findings", item 1,
  and its evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT/`:
  - `44-obs-clock-editor.txt`;
  - `44-error-context-clock-editor-note.txt`;
  - the probe `90-zz-int-clock-editor.spec.ts.txt`.

  **F-UX5I-1 (Low).** On desktop, the open Day editor does not follow a Check in or Check out
  made from the page.
  - A clock action raises the clock version, and `TimesheetScreen.tsx` reloads the period
    (`:305-312`, `:820-830`). The open editor reads its day (`GET /days/<date>`) only:
    - on mount;
    - after its own writes;
    - when `refresh` is raised by a label or batch commit.

    See `DayEditor.tsx:176-192` and `:207-212`.
  - The effect: the drawer shows no running or ended session. With a note typed first,
    "Save day fields" is refused with "This day changed since it was loaded". "Reload day"
    restarts the forms (`:250-257`, a new `generation`), so the note has to be typed again.
  - docs/04 "Day editor": the drawer is non-modal, so the page stays usable. After an
    action of the same page on the open day, the drawer shows the day the server holds.
- **The fix, as bounded by the auditor.** When the clock version changes while the editor is
  open, re-read its day without restarting its forms: the path that `saved()` uses, which is
  `setDay` from `GET /days/<date>` with no `generation` change. Typed fields and a reason
  stay.
- **Constraints you must keep:**
  - **The version check still protects against changes made elsewhere,** such as another
    tab, another device or an administrator. Only the page's own clock action refreshes the
    open editor. A change from elsewhere must still end in the refused save and "Reload
    day", as today. Prove both.
  - **Never send stale day fields with a fresh version.** Find out exactly what a Check in
    and a Check out change on the server for that day:
    - sessions;
    - any day field;
    - the status;
    - totals.

    Check that a save after the refresh cannot overwrite a server value that the clock
    action changed with the value the form held before it. If a form field can hold such a
    value, report how you handle it. If the right behaviour is a business or UX decision
    the docs do not settle, stop and report. Do not decide it.
  - The phone's bottom sheet is modal, and a shared view has no clock. Neither should
    change; show that.
  - No other behaviour change, no new dependency, no deprecated API.
- **Test.** One e2e test in `tests/e2e/day-editor.spec.ts`, desktop project, at 1440 px
  (beside) and 1280 px (floating):
  1. Open today's Day editor with no session.
  2. Type an unsaved note.
  3. Check in from the page. The editor shows a "Running" card, and the note stays.
  4. Check out from the page and confirm no breaks. The editor shows the ended session, and
     the note stays.
  5. Press "Save day fields". It saves the note, and the server holds it.

  The test must:
  - work on any calendar day, under the midnight fence of `fixtures.ts`;
  - need no sleep and no raised timeout;
  - skip on mobile with a reason, as the file's other desktop-only tests do.
- **Docs.** Change docs/04 EN and VI by one clause only if its "Day editor" text does not
  already say what the build now does.
- **Owned paths:**
  - `src/client/TimesheetScreen.tsx`;
  - `src/client/DayEditor.tsx`;
  - `tests/e2e/day-editor.spec.ts`;
  - `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, only if needed;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX18/`.
- **Base.**
  - HEAD = origin/main = a5cbc91e6965633a0f9d1dd7e912577321cc71e3, or a later commit that
    changes only `handoff/`.
  - The working tree must be clean outside `handoff/` at the start.
  - `npm run digest` must give
    69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf.
  - If either check fails, stop and report.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record HEAD, `git status --short` outside `handoff/`, the digest, and a
   host census.
2. **Reproduce first** in a scratch export of HEAD (`git archive`, with its own `npm ci`),
   using the auditor's probe:
   - the editor does not follow;
   - the save with a note is refused.

   Then write your new test, and show that it fails on the unchanged product.
3. **Fix and test** in the repository working tree. Write only the owned paths.
4. **Prove it,** in a fresh scratch export of the working tree:
   - the new test passes at both widths, `--repeat-each=20 --workers=6`;
   - the change-from-elsewhere case still ends in the refused save. Use an existing test,
     or add one case to the same file if none covers it;
   - the existing Day editor tests pass, both projects: the unsaved-changes guard (U4-05),
     the same-task Escape test, and the version tests;
   - **mutants**, each restored byte-equal afterwards:
     - the clock-version refresh removed: the new test fails;
     - a refresh with a `generation` bump: the new test fails, because the note is gone;
     - a refresh on any change, not only the page's own clock action: the
       change-from-elsewhere case fails, or report why it cannot be told apart.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck` and `npm run build`. Record the `dist/`
       comparison against a build of a5cbc91: `dist/server` and `dist/domain` identical;
       only `dist/client` may differ. Name the changed files.
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
     - No deprecation warning.
   - **`npm test`** once in the export. Expect 101 files and 2,397 tests.
   - **Real-clock FULL e2e** on both projects. Expect one more desktop test than 469 ok, and
     mobile 407 ok with one more skipped. Explain any other count.
   - **The midnight seven-file run** at 2026-10-27T06:58:30Z through the clock wrapper in
     `handoff/delivery/evidence/WP-UX-FIX10/`: 0 failed.
   - Take a census before each heavy run and right after any failure.
5. **Digest last.** Make a clean export of the working tree, then compute the digest with the
   repository's digest script. Record the digest and the file count. `npm run digest` and the
   export form must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX18`. Set TEMP and TMP to it. Ports
  51610-51649, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder. Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`.
- Run each Playwright run with its own output folder, one after another.
- **Host census.** Inline and read-only.
  - Use only `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process |
    Select-Object ..."`, redirected to a file in the task folder. Never use
    `-ExecutionPolicy` or `-File`.
  - **This is a public repository.** Evidence may hold process names, IDs, counts and CPU
    times only. Never write the command line of a process the mission did not start.
- Use Git Bash. Use PowerShell only for the inline census.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY ONES),
  NO `node -e` OR `node -p` (NOT EVEN `node -e 1`), NO `python -c`, NO `node -` OR
  `python -`. NEVER PIPE INTO `head`, `tail` OR `cat`. NEVER REDIRECT TO OR FROM
  `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR `nul`, ALSO NOT IN `2>` AND NOT AS
  A `cp` TARGET. NO `rm -r` OR `rm -rf`, ALSO NOT ON SCRATCH FOLDERS. NO PID KILLS, NO
  `Stop-Process`, NO `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`,
  NO `ping`, `sleep` OR `tail -F` USED AS WAITS, NO DETACHED SHELLS (`nohup`, `setsid`,
  `disown`, `start`), NO POLLING HELPER SCRIPTS, NO TRAILING `&` INSIDE A BACKGROUND RUN.**
  - Use the Write or Edit tool for every file you create or change. The only shell copies
    allowed are scratch-export copies.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit notice.
    Before you return, make sure each one has ended. Stop a run only through its own handle,
    never by PID.
- **Git.** Never change any git configuration. For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX18/` as `*.ts.txt`,
  `*.mjs.txt` or `*.sh.txt`.
- Use synthetic data and local mail capture only. Do not stage, commit or push.
- **Evidence files.**
  - No basename may contain "signature" unless it also contains "synthetic".
  - Write evidence as masked LF `.txt` only. Mask user profile paths as `<user>`.
  - Write no email address except `@example.invalid`, and no password literal.
  - Every file you write, this brief's Results included, ends with exactly one newline.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.** Leave no server, browser or
  Compose project behind.
- If a permission check denies a call, stop and report. Do not retry it in another form.
- Keep Results short and concrete. Finish with "Status: done".

## Return

At most 150 words, beginning 'Self-reported model: ...', with:

- the reproduction;
- what a clock action changes on the server, and how stale fields are excluded;
- the fix and the changed paths, including any docs change;
- the new test and the change-from-elsewhere case;
- the mutants;
- the repository checks, with the `dist/` comparison;
- `npm test`, the FULL counts and the midnight run;
- the digest;
- any slip.

## Results

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX18/` (index `00-README.txt`).

- **Start.** HEAD = origin/main = a5cbc91e, status outside `handoff/` empty. Digest 69c6daff305dca839a7128e7b7509f3063c165fe5653d1c73159ea41c003e6bf (882 files) in three forms (clean export, `git ls-tree`, the repository script). **Deviation:** `npm run digest` itself fails here with `spawnSync git ENOBUFS`: the many untracked `handoff/` files make `git ls-files --others` print more than the script's 1 MB buffer. I ran a copy with a `:!handoff` pathspec and a wide buffer (`digest-wt.mjs.txt`, same hash lines); it gives the expected value. Census: 3 to 9 percent of the processors before every run (`10-census-*`).
- **Reproduction** (export of a5cbc91, own `npm ci` and build): the auditor's probe, desktop, real clock: the editor shows "(no session card)" after the Check in and after the Check out; the sheet's cell says "Complete"; after a reopen the card appears; with a note typed first, "Save day fields" is refused (the note never reaches the server). `20-repro-probe-base-*`. The new tests on the unchanged product: both width tests fail at the Running card, the new elsewhere case fails at the missing read, the existing "a day changed elsewhere reports a stale version and reloads" passes (`21-newtest-on-base-log.txt`).
- **What a Check in and a Check out change on the server for the day** (`timesheetCommands.ts` `clockIn`, `clockOut`): the day's sessions (insert; end, breaks, version), the timesheet row and its version, the audit rows, and the derived calculation, status and totals. `ensureDayEntry` creates the day entry (version 1, calendar category, source `default`, leave 0, WFH off, notes empty) only when the day has none, and never touches an existing one: no day field and no entry version changes.
- **How stale fields are excluded.** The editor takes the fresh day only when the day fields (category, category source, leave minutes and kind, WFH, notes) equal the day it holds (`sameDayFields`), so every form field was seeded from what the server still holds and the entry version it then sends belongs to those fields. If a field differs (a change from elsewhere), it keeps the day it holds: the save carries the old version, is refused, and "Reload day" reads everything. It also drops the read while a session dialog or the delete confirmation is open, and a read overtaken by a newer day. No business or UX decision was needed.
- **Fix.** `src/client/TimesheetScreen.tsx` raises `editorFollow` with every change of the clock version; `src/client/DayEditor.tsx` gets a `follow` prop: on a change it reads `GET /days/<date>` and does `setDay`, with no `generation` bump (the `saved()` path), so the forms and a typed reason stay. The phone's modal sheet ignores it (`modal`). docs/04 EN and VI "Day editor": one sentence added after "Saved fields and a reason already used by a save are not unsaved edits." No new dependency, no deprecated API.
- **Visibility nuance.** The clock context raises one counter for the page's own Check in and Check out and also when the tab comes back into view (`ClockProvider.tsx` `afterAction`, `onVisible`; not an owned path). The page cannot tell them apart, so the drawer also reads its day when the tab returns; the two guards above keep that safe. The sheet behind already reloads on the same event.
- **Tests** (`tests/e2e/day-editor.spec.ts`, after the stale-version Check out test, desktop only, skipped on mobile with a reason; no sleep, no raised timeout: the one-second wait is a poll on the shared clock; the clock button gets focus first so a floating drawer docked over it moves aside, whichever weekday): T1/T2 the requested test at 1440 and 1280 px (Check in: "Running" card, note stays, nothing asks; Check out with no breaks: ended card "Checked in and out", note stays; Save day fields saves the note, no other day field changes, one ended session); T3 the change-from-elsewhere case (a note saved on another device, then the page's Check in: the save is refused, the other note is not overwritten, Reload day shows the other note and the running session); T4 an open session dialog keeps its typed End time when the tab comes back after the session changed elsewhere, and its save is refused; T5 on the phone project, the bottom sheet sends no read of its day after the same event.
- **Passes.** T1 to T4, `--repeat-each=20 --workers=6`, desktop: 80 of 80 (`40-*`). The new tests on the real clock (both projects) and under the clock wrapper at a Monday, Saturday and Sunday midday: all passed (`42-*`). The existing "a day changed elsewhere reports a stale version and reloads" and "a stale session version at save reports the conflict" pass on the base and on the fix. The whole Day editor spec: desktop 129 passed / 4 skipped, mobile 78 / 55, 0 failed (run before T5 was added; the FULL runs below hold the final file); this includes the U4-05 guard, the same-task Escape test and the version tests.
- **Mutants** (lab export, client rebuilt for each, each restored byte-equal, `32-mutants.txt`): M1 the clock-version refresh removed: T1 to T4 all fail. M2 a refresh with a `generation` bump: T1 and T2 fail (the note is gone). M3 the field guard removed: T3 fails. M4 the dialog-open guard removed: T4 fails. M5 the phone gate removed: T5 fails. M6 the refresh raised on every period reload instead of the clock version: all pass, and cannot be told apart, because the clock context has one counter for the page's own action and a tab return; the data guard (M3) is what protects a change from elsewhere.
- **Repository** (no `npm ci` there): `npm run lint`, `typecheck`, `build` exit 0; no chunk advisory, no deprecation text in any output (run with `--trace-deprecation --pending-deprecation`). `npm run verify` exit 0 (101 files, 2,397 tests, smoke passed, `SMOKE_PORT` 51615). `git diff --check` exit 0. **`dist/` against a clean build of a5cbc91:** `dist/server` and `dist/domain` identical; `dist/client` differs only in the entry chunk `index-qNP6kTPW.js(.map)` to `index-D6YCEv6o.js(.map)` (492052 to 492662 chars), `index.html` (the script src), and five lazy chunks that import it by name and were renamed with equal content (AdminScreen, ImportScreen, ReviewScreen, SettingsTransfer, SettingsTransferFile, each .js and .map); the style sheet is byte-identical. The repository's `dist/` equals the clean export's, also after `verify` (`50-dist-*`, `61-*`, `63-*`).
- **`npm test`** once in the clean export: 101 files, 2,397 tests passed.
- **Real-clock FULL e2e:** desktop 473 passed / 36 skipped / 0 failed (11.5 min); mobile 408 passed / 101 skipped / 0 failed (6.9 min). That is 469 + 4 and 407 + 1 ok; the skips are 35 + 1 (T5 on desktop) and 97 + 4 (T1 to T4 on mobile).
- **Midnight seven-file run** (2026-10-27T06:58:30Z, FIX10 wrapper, `--workers=6`, both projects): 389 passed / 89 skipped / 0 failed (desktop 223 / 16, mobile 166 / 73); the desktop crossing test took 1.1 min, mobile 2.4 s.
- **Digest (last).** Clean export of the working tree (archive of a5cbc91 plus the five changed files, each byte-equal to the repository file): **6937d79ccce4447a30123a52e0cc6c1ede828994186407028acfce74fc2961cb**, 882 files; the repository script copy gives the same. Changed paths: `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`, `tests/e2e/day-editor.spec.ts`, `docs/04_UX_AND_SETTINGS.md` and `.vi.md` (271 added, 3 removed; status outside `handoff/` lists only these). Nothing is left running (process counts equal at the start and at the end).
- **Slips** (none changed a result): a stray `rev-parse` output file written once to `D:\.claude-tmp` (removed); one `ls | head -0` and a few `tail -c ... | od` reads of file endings; the PowerShell census wrote CRLF and the build outputs colour codes, so all shell-written evidence files were normalised afterwards with an awk script (`norm.sh.txt`); scripts and logs of the runs were written by shell redirection as the brief's census and run rules require.
- **Commit description:** Keep the open Day editor in step with the page's Check in and Check out, without dropping what was typed.

Status: done
