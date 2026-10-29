# WP5-UX5-FIX19 dispatch brief (no silent overwrite of day fields after a session write; the digest script buffer)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX19, package WP5, kind fix,
  attempt 1.
  - It answers the audit WP5-UX5-AUDIT-INT2 (FIX REQUIRED on d96df5d), and depends on
    WP5-UX5-REGATE13 (PASS on d96df5d / 6937d79c).
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size S, risk H (a silent overwrite of day fields changed elsewhere), novelty
    no.
  - The pattern to follow is FIX18's `sameDayFields` guard. docs/08 row "High-risk
    fix/slice with an existing pattern".
  - Reproduce first, then fix.
  - Write the task record in English.
- **The findings.** Read `handoff/delivery/WP5_UX5_REVIEW_INT2.md`, sections "Findings" and
  "Risks", and its evidence in `handoff/delivery/evidence/WP5-UX5-AUDIT-INT2/`:
  - `45-obs-follow-target.txt`;
  - `45-obs-follow-prev-run1.txt`;
  - `31-digest-script-enobufs.txt`;
  - the probes `90-zz-int2-follow.spec.ts.txt` and `90-zz-int2-admin.spec.ts.txt`.
  1. **F-UX5I2-1 (Medium; pre-existing since WP2-T10).** The open Day editor's `saved()`
     (`src/client/DayEditor.tsx:279-288`) runs after:
     - a session save;
     - a "Confirm breaks" (`:563-566`);
     - a delete (`:326-328`).

     It takes the server's whole day, with the newer entry version, without a new
     `generation`. `DayFieldsForm.tsx` seeds its draft once per generation (`:51-53`) and
     sends the current `day.entry.version` (`:85`).

     So when another device changed the day fields after the editor loaded, the next "Save
     day fields" sends the old draft with the newer version. It silently overwrites the
     other change. This is probes G1 (an edited session) and G2 (a deleted session).

     **Expected,** from docs/04:69, docs/03:40 and the rule given to FIX18 ("never send
     stale day fields with a fresh version"): the change made elsewhere is never dropped
     silently.
  2. **F-UX5I2-2 (Low).** `scripts/source-digest.mjs:13-15`: the first `execFileSync`
     (`git ls-files ... -z`) has no `maxBuffer`. Since d96df5d, the tracked list is larger
     than Node's 1 MiB default, so `npm run digest` fails with ENOBUFS in every checkout.
     docs/12:7 names this command for the release identity.
- **The fix, as bounded by the auditor.**
  - **F-UX5I2-1.** A session write's answer may replace the held day fields and the entry
    version only when `sameDayFields(held, next)` holds. Otherwise:
    - **if the day fields form holds an unsaved edit:** keep the held entry and fields for
      the form. Its save then carries the old version, is refused, and "Reload day" reads
      the change. Show the stale notice the editor already has;
    - **if the form holds no unsaved edit:** restart the form from the answer. A new
      `generation` is acceptable here, because nothing typed is lost. The session list
      always shows the answer.

    Do not change how a session write itself is checked. Do not invent a new state or
    message. Use the editor's existing stale notice and "Reload day". If the right
    behaviour is a business or UX decision the docs do not settle, stop and report.
  - **F-UX5I2-2.** Add `maxBuffer: 64 * 1024 * 1024` to the first `execFileSync`; the second
    already has one. Change nothing else in the script.
- **Also in this round** (optional test-strength and wording items from the review):
  - **R-UX5I2-1.** Add the auditor's cases B, N and O to `day-editor.spec.ts`. The sources
    are in `90-zz-int2-follow.spec.ts.txt`. They pin FIX18's WFH and partial-leave
    comparisons, the delete-confirmation hold, and the overtaken-read drop.
  - **R-UX5I2-2.** docs/04:69, EN and VI: one clause saying that the drawer also reads its
    day when the tab comes back into view.
  - **Not in this round:** R-UX5I2-3 (a day without an entry has no version to protect its
    calendar default). It needs a behaviour choice, and stays in the backlog.
- **Tests.** In `tests/e2e/day-editor.spec.ts`, desktop project:
  - G1: another device saves a note and WFH on a past workday with a session; the open
    editor edits that session's end and saves; "Save day fields" without typing then either
    shows the other device's values, or is refused. The other device's change is never
    overwritten.
  - G2: the same, with "Delete session".
  - One case where the form holds a typed note when the session write happens: the note is
    kept, the save is refused, and "Reload day" shows the other device's change.
  - B, N and O as above.

  The tests must work on any calendar day, under the midnight fence, with no sleep and no
  raised timeout.
- **Owned paths:**
  - `src/client/DayEditor.tsx`;
  - `src/client/components/DayFieldsForm.tsx`, only if needed;
  - `tests/e2e/day-editor.spec.ts`;
  - `scripts/source-digest.mjs`;
  - `docs/04_UX_AND_SETTINGS.md` and `.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX19/`.
- **Base.**
  - HEAD = origin/main = d96df5daa25b44b156354bc96605e13e94e44396, or a later commit that
    changes only `handoff/`.
  - The working tree must be clean outside `handoff/` at the start.
  - The digest must be 6937d79ccce4447a30123a52e0cc6c1ede828994186407028acfce74fc2961cb.
    Use the export form or `git ls-tree`, because `npm run digest` fails until you fix it.
  - If either check fails, stop and report.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Steps

1. **Start state.** Record HEAD, `git status --short` outside `handoff/`, the digest, and a
   host census.
2. **Reproduce first** in a scratch export of HEAD (`git archive`, with its own `npm ci`):
   - the auditor's G1 and G2 show the overwrite;
   - `npm run digest` fails with ENOBUFS in a clean clone.

   Then write your new tests, and show that G1 and G2 fail on the unchanged product.
3. **Fix and test** in the repository working tree. Write only the owned paths.
4. **Prove it,** in a fresh scratch export of the working tree:
   - the new tests pass, `--repeat-each=20 --workers=6`;
   - FIX18's tests (T1 to T5) pass, and so do the existing version tests, the U4-05 guard
     and the same-task Escape test, both projects;
   - **mutants**, each restored byte-equal afterwards:
     - `saved()` without the `sameDayFields` guard: G1 or G2 fails;
     - the guard with the unsaved-edit branch removed (always restart the form): the
       typed-note case fails;
     - each of FIX18's guards removed in turn (WFH comparison, partial-leave comparison,
       delete-confirmation hold, overtaken-read drop): B, N or O fails;
     - the digest fix reverted: `npm run digest` fails in a clean clone.
   - **`npm run digest`** in a clean clone of the working tree, and in the repository: both
     work, and both agree with the export form.
   - **In the repository,** one after another:
     - `npm run lint`, `npm run typecheck` and `npm run build`. Record the `dist/`
       comparison against a build of d96df5d: `dist/server` and `dist/domain` identical;
       only `dist/client` may differ. Name the changed files.
     - `npm run verify`, with the smoke port in your range.
     - `git diff --check`.
     - No deprecation warning.
   - **`npm test`** once in the export. Expect 101 files and 2,397 tests.
   - **Real-clock FULL e2e** on both projects. Give the counts and explain each change from
     desktop 473/36 and mobile 408/101.
   - **The midnight seven-file run** at 2026-10-27T06:58:30Z through the clock wrapper: 0
     failed.
   - Take a census before each heavy run and right after any failure.
5. **Digest last.** Make a clean export of the working tree, then compute the digest with the
   fixed `npm run digest`. Record the digest and the file count. The repository and the
   export form must agree.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX19`. Set TEMP and TMP to it. Ports
  51730-51769, with `SMOKE_PORT` in that range. Set `DATA_DIR` and `DATABASE_PATH` inside the
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
- **Git.** Never change any git configuration. For git in a scratch export or clone, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH, also for evidence copies:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/WP5-UX5-FIX19/` as `*.ts.txt`,
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

- the reproductions;
- the fix for each finding, and the changed paths, including any docs change;
- the new tests;
- the mutants;
- the repository checks, with the `dist/` comparison and `npm run digest` in a clean clone;
- `npm test`, the FULL counts and the midnight run;
- the digest;
- any slip.

## Results

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX19/` (index `00-README.txt`). Two passes: the first version of the new
tests saved day entries on the shared employee's newest free workday and collided with the calendar-default test "partial leave 240" (1 failed in the whole Day
editor spec and in the FULL desktop run); the tests were moved to a person of their own each and every proof was run again. Both passes are kept; the second is the proof.

- **Start state** (`00-start-state.txt`): HEAD = origin/main = d96df5d; no status line outside `handoff/`; digest 6937d79c...61cb (ls-tree form), 882 files;
  `git ls-files -z` is 1,063,240 bytes in a clean clone and about 1.09 MB in the repository, over Node's 1,048,576-byte default.
- **Reproduction on the unchanged d96df5d** (`export-base`, its own `npm ci` and build):
  - F-UX5I2-2: `npm run digest` in a clean clone exits 1, `spawnSync git ENOBUFS` (`20-repro-digest-clean-clone.txt`).
  - F-UX5I2-1: the auditor's probes `int2-G1` and `int2-G2` run unchanged: both end with the other device's note and WFH OVERWRITTEN and nothing said
    (`21-repro-probe-base-obs.txt`). The new tests on the same product: G1, G2 and G3 fail (the form keeps the old note after the session write; G3 shows no
    refusal and so overwrites), G4, B, N and O pass because FIX18's guards hold there (`22-*` first version: 3 failed, 7 passed; `23-*` final tests: 3 failed,
    8 passed).
- **Fix, F-UX5I2-1** (`src/client/DayEditor.tsx` only; `DayFieldsForm.tsx` unchanged): a session write's answer (Session save, "Confirm breaks", Delete) now goes
  through `sessionWritten()` instead of `saved()`, judged against the day held and whether the day fields form holds an unsaved edit (two refs, no new state):
  - the answer's day fields equal the held ones (`sameDayFields`): take the answer as before, the forms keep what was typed;
  - they differ and nothing is typed in the day fields: take the answer and restart the form (new `generation`); nothing is lost;
  - they differ and a field holds an unsaved edit: `withHeldDayFields()` takes the answer's sessions and figures but keeps the held day fields and entry, so the
    form's save carries the old version, is refused with the existing stale notice, and "Reload day" reads the change. Nothing is proactively announced: the
    notice's text says "Nothing was saved", which would be false next to "Session saved.", and docs/04:69 already says the save is refused and "Reload day" reads it.
  - The session write itself, its version check and `sameDayFields` are unchanged. No new message, no new visible state.
- **Fix, F-UX5I2-2** (`scripts/source-digest.mjs`): `maxBuffer: 64 * 1024 * 1024` added to the first `execFileSync`; nothing else changed.
- **Docs** (`docs/04_UX_AND_SETTINGS.md` and `.vi.md`, line 69, one change each): the open editor also reads its day when the tab comes back into view (R-UX5I2-2), and
  the same rule for the answer of a session save, "Confirm breaks" or a delete.
- **New tests** (`tests/e2e/day-editor.spec.ts`, desktop project, describe "WP5-UX5-FIX19", 11 tests, each on a person of its own, no sleep, no raised timeout,
  deterministic gates for the held route in O):
  - G1 session save and G2 delete: nothing typed; the form shows the other device's note and WFH; "Save day fields" keeps them.
  - G3 a typed note: kept after the session save; "Save day fields" refused with the stale notice; the other device's values kept; "Reload day" shows them.
  - G4 no change elsewhere: the typed note stays and saves (pins the "take the answer" branch).
  - B x5 (notes, WFH, partial-leave minutes, partial-leave kind, category) after a tab return: refused, the value kept, "Reload day" reads it. The leave case was
    split in two after the first mutation round showed that removing either leave comparison alone survived a case that changed both.
  - N a delete confirmation open while the session changes elsewhere and the tab returns: the delete is refused (409). O a follow read held at the route until the
    editor's own save has been answered: dropped, and the second save succeeds.
- **Mutants** (client rebuilt per mutant, desktop `-g "FIX18|FIX19"`, each restored byte-equal; `50-mut-*`; the final tests, 16 tests of which 15 run on desktop, were used for the N* and P* rounds):
  - PA a session write's answer taken without the `sameDayFields` judgement (always take it, never restart the form): G1, G2 and G3 fail;
  - PB the unsaved-edit branch removed (always restart the form when the fields differ): G3 fails (the typed note is lost);
  - NC FIX18's WFH comparison removed: B (WFH) fails; ND the leave-minutes comparison removed: B (leave minutes) fails; ND2 the leave-kind comparison removed:
    B (leave kind) fails; NG the notes comparison removed: FIX18's T3 and B (notes) fail; NH the category comparison removed: B (category) fails;
  - PE the open delete confirmation no longer holds the follow read off: N fails (the delete is accepted); PF an overtaken follow read no longer dropped: O fails;
    PS `saved()` no longer marks a newer day: O fails;
  - the digest fix reverted in a clean clone: `npm run digest` exits 1 with `spawnSync git ENOBUFS` (`01-digest-final.txt`);
  - every mutant restored byte-equal (`cmp` in each log), and the unmutated build passes 15 of 15 (`50-mut-clean-log.txt`). The first round (`50-mut-M*`, the first
    version of the tests) gave the same outcomes except MD and MD2 (either leave comparison removed alone), which survived because the single leave case changed
    both values; the case was split into minutes and kind and the round repeated (ND, ND2).
- **Repository checks** (`60-*` to `65-*`, one after another, `--pending-deprecation`, no deprecation line): `npm run lint` 0, `npm run typecheck` 0, `npm run build` 0;
  `npm run verify` 0 (typecheck, lint, 101 files / 2,397 tests, build, smoke PASS on SMOKE_PORT 51735); `git diff --check` 0. `dist/` against a build of d96df5d:
  `dist/server` and `dist/domain` identical; `dist/client` differs only in `index.html` and the entry chunk `index-D6YCEv6o.js(.map)` -> `index-PcdqNPHg.js(.map)`
  (the changed `DayEditor`) and the five lazy chunks `AdminScreen`, `ImportScreen`, `ReviewScreen`, `SettingsTransfer`, `SettingsTransferFile` (new names only; their
  content equals the base once the chunk names are normalised, `61-dist-client-normcmp.txt`); the CSS file is the same. The repository's `dist/` equals the export's.
- **Proof runs on the final tests** (fresh export `export-proof`, own `npm ci`, lint 0, typecheck 0, build 0; a census before and after each run, load 0 to 19 percent of the
  logical processors; no run of this pass failed, so no failure census was needed; the first pass' failure was followed by its post-run census, `10-census-post-dayeditor.txt`):
  - the eleven new tests `--repeat-each=20 --workers=6`, desktop: 220 passed (2.0 min), `43-*`;
  - FIX18's tests (T1 to T5) and the new tests, both projects: 16 passed, 16 skipped (desktop 15 + 1, phone 1 + 15), `44-*`;
  - the whole Day editor spec, both projects (it holds the existing stale-version tests, the U4-05 guard tests and the same-task Escape test): 219 passed,
    71 skipped, 0 failed (4.4 min), `45-*`;
  - the eleven new tests under the clock wrapper at a Monday (2026-11-02T20:00Z), a Saturday (2026-10-31T19:00Z) and a Sunday (2026-11-01T20:00Z) midday, desktop:
    11 passed each, `46-*`;
  - `npm test` once in the export: 101 files, 2,397 tests passed, `75-npmtest.txt`;
  - real-clock FULL e2e: desktop 484 passed / 36 skipped / 0 failed (10.8 min), mobile 408 passed / 112 skipped / 0 failed (6.9 min), `77-*`, `78-*`, `80-counts.txt`.
    From REGATE13's 473 / 36 and 408 / 101: desktop +11 passed, skipped unchanged (the eleven new tests run on desktop); mobile passed unchanged, skipped +11
    (the same eleven are skipped on the phone project);
  - midnight seven-file run at 2026-10-27T06:58:30Z through the FIX10 clock wrapper (`--workers=6`, both projects): 400 passed / 100 skipped / 0 failed (desktop 234 / 16,
    mobile 166 / 84; from 389 / 89 the same +11 passed on desktop and +11 skipped on the phone); the desktop crossing test took 1.1 min, mobile 2.7 s; `79-*`.
- **Digest, last** (`01-digest-final.txt`, 2026-10-29T14:32Z, after the last run and after the last change to any file outside `handoff/`; the five owned files equal their
  copies in `export-proof`): `67aa715c4cf600624b835a27c568f9225e471e43d819894fbeb8b4da6a89c42b`, 882 files, `handoff/` excluded. Three forms agree: the export form (a
  clean export of the working tree, blob hashes of its files outside `handoff/`, sorted, SHA-256), the fixed `npm run digest` in a clean clone of d96df5d with the five
  owned files copied over it (exit 0), and `npm run digest` in the repository (exit 0, the same 882 files). Changed paths outside `handoff/`:
  `src/client/DayEditor.tsx`, `tests/e2e/day-editor.spec.ts`, `scripts/source-digest.mjs`, `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`.
- **Slips** (none changed a result; `99-slips.txt`): one `sleep 1; echo` no-op, one `ls | head -3`, one `cat | wc -l`, one `> /dev/null 2>&1` appended to a progress read;
  the shortened first heavy run and the two steps appended to a running chain script were done by editing the unread tail of the script in place; the first pass of the
  proof (above) was superseded; the first mutation round's survivors were fixed by splitting the leave case. No heredoc, no stdin to node or python, no PID kill, no
  `rm -r`, no `sed -i`, no git configuration change, nothing staged or committed, nothing left running.
- **Commit description:** Stop a session save or delete in the open Day editor from letting Save day fields overwrite a day field changed elsewhere, and let npm run digest read a large file list.

Status: done
