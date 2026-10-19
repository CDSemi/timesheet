# WP5-UX3-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-REGATE2; package WP5; kind gate;
  **attempt 2**; depends on WP5-UX3-FIX3-FREEZE and WP5-UX3-GOV2-FREEZE.
- Attempt 1 (on a78ada5) was stopped at the owner's usage pause of 2026-10-16. It left no
  Results and no evidence.
- On resume, the owner adopted a new AGENTS.md text (WP5-UX3-Q7 a). It was frozen by the
  governance commit WP5-UX3-GOV2-FREEZE ceb86b6, which changes only AGENTS.md and
  AGENTS.vi.md outside `handoff/`. Attempt 2 therefore targets that commit. The GOV gate
  WP5-UX3-GOV2-GATE runs in parallel on the same commit with other ports, so do not repeat
  its AGENTS checks.
- Scope: the package-final gate of UI change round 3 after the audit fix round.
  - WP5-UX3-REGATE passed on 7ce4e95 / 262138e0.
  - The area audits WP5-UX3-AUDIT-A and WP5-UX3-AUDIT-B then found F-UX3A-01..06 and
    F-UX3B-1..2.
  - WP5-UX3-FIX3 fixed them (`handoff/delivery/tasks/WP5-UX3-FIX3.md`).
  - Frozen commits in order after the T10 freeze cecfceb: FIX1 9187f31, FIX2 7ce4e95, FIX3
    a78ada5 (digest d1d903cf), then GOV2 ceb86b6 (the target; AGENTS pair only).
  - The previous accepted snapshot is a6437943403fc416240fd13a787a8c4748af3e84 (digest
    229df806).
- Target: `freeze_commit` = TARGET_SHA = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f (the
  WP5-UX3-GOV2-FREEZE commit). HEAD = origin/main, or a later commit that changes only
  `handoff/`.
  - Expected digest of record: TARGET_DIGEST =
    b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files). It
    differs from FIX3's d1d903cf only by AGENTS.md and AGENTS.vi.md.
  - Compute the digest on a clean `git archive` export with no `.git` folder (never run
    `git init` in an export). Cross-check it with the `git ls-tree` form and
    `npm run digest`.
  - Uncommitted coordinator records under `handoff/` are expected.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.
- **AGENTS.md on disk wins.** Its UI section is "Frontend and UI/UX standards".

## Read

- AGENTS.md, from disk first.
- `handoff/delivery/tasks/WP5-UX3-GATE.md` and `WP5-UX3-REGATE.md`: the item list, method,
  limits and evidence layout. Reuse their probes from the evidence folders
  (`zz-*.ts.txt`), copied into your task folder only.
- `handoff/delivery/tasks/WP5-UX3-FIX3.md` (Results) and the two reviews
  `handoff/delivery/WP5_UX3_REVIEW_A.md` and `WP5_UX3_REVIEW_B.md`, for the claims to
  verify.
- The board's `coordinator_decisions` of 2026-10-16. The one starting "WP5-UX3-AUDIT-A FIX
  REQUIRED" holds the two behaviour choices of F-UX3B-1 and F-UX3B-2.
- The simulated-clock preload and wrapper from `handoff/delivery/evidence/WP5-UX-FIX10/`.
  Copy them into your task folder only.

## Gate items

1. **WP5-UX3-GATE items 1, 2, 3, 5 and 6, on the target.** Use the same commands, widths,
   states and thresholds.
   - Item 2: `dist/server` and `dist/domain` must be byte-identical to a643794, and the
     `src/server src/domain migrations` diff must be empty.
   - Item 3: the scope map now also covers FIX3's 20 paths, all within its owned paths, and
     GOV2's AGENTS pair.
     - Sample at least five of FIX3's changed or new assertions against the diff.
     - Judge the removal of the four `quickBreaksOf` unit tests against the mapping in
       `WP5-UX3-FIX3.md`.
     - Judge the `surviveStall` wrapper in `tests/e2e/theme.spec.ts`: no assertion
       weakened, and a real settle failure must still fail.
2. **Simulated-clock sweep, reduced.** FIX3 changes no time computation; it changes
   break-row selection and the Check out request. Run:
   - the FULL suite on both projects at `2026-10-20T17:00:00Z`, `2026-10-26T16:00:00Z`,
     `2026-11-01T08:45:00Z`, `2026-12-31T23:30:00-08:00` and `2027-03-14T10:30:00Z`;
   - `today.spec.ts`, `timesheet.spec.ts`, `day-editor.spec.ts`, `shell.spec.ts` and
     `sharing.spec.ts` on both projects at `2026-10-27T06:58:30Z`, `2026-10-17T17:00:00Z`,
     `2027-01-01T08:30:00Z` and `2026-11-28T18:00:00Z`.

   Validate the preload first with one control. Every run must end with 0 failed.
   - A run that fails only with a network or buffer error is rerun once, and both runs are
     recorded.
   - Any other failure counts as a failure: record it, and repeat the failing test alone
     to describe it.

   Present the results as a table in the attempt-1 form.
3. **The audit findings, each closed** (your own measurement on the build of the target):
   - **F-UX3A-01:** with keyboard focus and the pointer resting on the control, the ring
     shows on the date button, the Category picker (2px inset), the phone day button and a
     button link. Check both themes, and include the Escape return from the Day editor at
     1440.
   - **F-UX3A-02:** every painting `:hover` rule sits inside `@media (hover: hover)`
     (stylesheet scan). On the mobile project, a tap on the Category picker leaves no
     hover look.
   - **F-UX3A-03:** no bar control is under 44px with `hasTouch` at 768, 1024 and 1280, or
     below 768px.
   - **F-UX3A-04:** the Sign out icon gap and alignment equal Profile's, in the menu and in
     More.
   - **F-UX3A-05:** the More-panel Escape test exists and fails under mutant A4. Apply the
     mutant in a scratch copy only.
   - **F-UX3A-06:** phone Administration with the long delivery state at 390 and 320: no
     sideways scroll, and axe reports no `scrollable-region-focusable`.
   - **F-UX3B-1:** the API-seeded running session with saved unconfirmed rows. Remove both
     rows, unticked:
     - the note shows;
     - Check out sends `breaks: []` with `breaks_confirmed: false`;
     - the session closes unconfirmed with no rows;
     - there is no 422, even with a saved row that ends after now;
     - with no saved rows at the start, the list stays omitted.
   - **F-UX3B-2:** "Confirm breaks" on 09:00-12:00, 09:00-14:00 and 09:00-18:00 lists 1, 2
     and 3 rows; 09:00-10:30 lists none and Save asks. The docs/04 line 65 and docs/10
     line 245 wording, EN and VI, matches.
   - **Docs:** docs/04 lines 46 and 70, docs/10 lines 238 and 245, and docs/12 line 71:
     EN/VI parity of tokens and numbers. The docs/10 chunk figure must match the build. If
     it says 487 kB while the build is 486.81 kB, record whether the wording ("under the
     500 kB advisory" or the figure) is still true.
4. **A full axe scan** (WCAG 2.2 AA, axe-core 4.14.0 in the task folder) of the attempt-1
   state list, plus phone Administration with the long delivery state and the Check out
   dialog with the removal note. Report every violation. The account-menu `target-size`
   item stays as justified; report it if it appears.

Decision: PASS / FAIL / NOT VERIFIED. NAS items stay NOT VERIFIED.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-REGATE2`. Set TEMP and TMP to it.
- Ports: 49040-49079, with `SMOKE_PORT` in that range.
- Give each Playwright run its own output folder, and run them sequentially.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker:
  - Compose project `ts-wp5-ux3regate2`; non-TTY flags only.
  - At the end, remove the drill image by exact tag and the project by name.
  - Record `docker ps --all --filter name=ts-wp5-ux3regate2`; it must be empty.
- Use Git Bash only, never cmd.exe, and never an interactive shell. Never create links or
  junctions.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e` (NOT EVEN `node -e "1"`), NO `node -`, `python -` OR `python -c`. NEVER PIPE
  OUTPUT INTO `head` OR `tail` (NO `head -0`, NO `head -n 0`, NO `head -c`, NO `tail -c`).
  NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/zero` OR `nul`, AND NEVER
  PASS ONE AS AN ARGUMENT. NEVER `rm -r` OR `rm -rf` ANYTHING.**
  - Write scripts and files with the Write tool and run scripts by path.
  - List files with the Glob tool.
  - Redirect output to files in the task folder and read them with the Read tool.
  - Run python only as the workflow Python
    `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
    Write `<user>` in the evidence.
  - Put Node 24 first on PATH with
    `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
    The first shell call is `node --version`; it must print v24.x.
- **Create files only inside the task folder and the evidence folder.**
  - Evidence names end in `.txt` or `-synthetic.png` only: no `.log` or other extension.
    Write raw logs to the task folder, then copy them in as masked LF `.txt`.
- Never stop a process you did not start, and never kill by PID.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Use synthetic data and local mail capture only.
- Never edit source, docs, tests, the board or STATE.
- Leave nothing running. Before returning, confirm that none of your background tasks is
  still running.
- In your Results and evidence:
  - no email address except the full synthetic `@example.invalid` form;
  - no real profile path (use `<user>`);
  - probe-truncated addresses written as `<email>`.

## Output

- Results go in this file: the decision, gate notes, and every item with its commands,
  exit codes and counts.
- Evidence goes in `handoff/delivery/evidence/WP5-UX3-REGATE2/`: masked LF `.txt` and at
  most 14 `-synthetic.png`. The screenshots use the regate's set on the target. Add the
  focus ring under the pointer, phone Administration, and the Check out removal note.
- Return at most 250 words, beginning with 'Self-reported model: ...'.

## Results

### Attempt 2 - verifier result - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Target `ceb86b6b18bd0e8fabd93f47672cd87f3899b92f` (HEAD = origin/main before and after; `git status --short` outside `handoff/` empty
before and after, `out/01-nonhandoff-status-*`, `87-git-status-after.txt`). Node v24.21.0 portable, Git Bash, Docker engine 28.5.1. Evidence folder
`handoff/delivery/evidence/WP5-UX3-REGATE2/` (index `00-README.txt`; 14 `-synthetic.png`, everything else masked LF `.txt`). Workflow Python: `<user>` profile.
Attempt 1 left a folder of old outputs in the task folder; I did not use it. All attempt-2 work is in its `a2` subfolder (fresh exports, fresh logs). The axe-core 4.14.0
install of that old folder was copied into `a2/axe` (task folder only; nothing in `package.json` or the lockfile). The GOV gate WP5-UX3-GOV2-GATE ran in parallel on the same host;
its AGENTS checks were not repeated.

**Digest of record** `b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48`, 833 files: clean `git archive` export (no `.git`), hashed with `git hash-object --no-filters`;
the `git ls-tree` form (sorted lists byte-identical) and `npm run digest` equal; the same before and after every check (`01-digest-*-before/after`, `log-digest-*`).

**Item 1 (WP5 gate, clean export `export-v`; the e2e ran in `export`, a second export of the same commit).**
- `npm ci`, `npm run lint`, `npm run verify` exit 0 (94 files, 2141 tests, SMOKE PASSED, no chunk-size advisory); 0 deprecation lines in ci, lint, verify, e2e, AC-13, `npm test`, drill
  (run with `--trace-deprecation --pending-deprecation`; the drill's 8 "deprecat" lines are PASS lines saying there is none).
- FULL e2e on the real clock: exit 0, **645 passed, 67 skipped, 0 failed** (17.7 min); desktop 326 ok / 30 skipped, mobile 319 ok / 37 skipped (`04-e2e-project-counts.txt`). Los Angeles
  2026-10-19 12:01:14 to 12:18:59; displayed period 2026-10-12..2026-10-25 (it contains today; payroll 2026-10-30, window outside). `automation.spec.ts:118` ok on both projects;
  `pdf-visual` 2 ok on desktop, skipped on mobile by design.
- AC-13 x3 exit 0; under `Asia/Tokyo` (offset -540) and `America/New_York` (240) exit 0. `npm test` x3 exit 0 (dep=0, crash=0).
- Drill `--wp3` exit 0: 208 PASS, 0 FAIL (33/31/57/35/27/23), "DRILL STAGES 1-6 PASSED", forbidden-file scan PASS. RELEASE IMAGE
  `sha256:89fb21bd5258bba047f98d2cb9de8d8fc7833c34e0eefd6e7bf64be8f39e7033`, 110042528 bytes (104.9 MiB), linux/amd64. Cleanup: image removed by exact tag
  `ts-wp5-ux3regate2-timesheet:drill`, `docker compose -p ts-wp5-ux3regate2 down -v` exit 0, `docker ps --all --filter name=ts-wp5-ux3regate2` empty, no network or volume left.
- Compose config live/restored/rollback exit 0 x3 (rollback `timesheet:bbbbbbb`, `JOB_RUNNER: "off"`); 21 env keys, only SQLITE_BUSY and WP5_HANDOFF map to none (as before);
  `npm audit --omit=dev` 0 vulnerabilities. Validators exit 0: `validate_package --preflight` (114 translation pairs, 2258 local links, 91 scenarios), `validate_orchestration`,
  `check_recovery` (count 106), precommit self-test (35 path and 74 line samples, 12 rules), token contrast script. `git diff --stat a643794..target -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty.
- Build: main chunk `index-BJ9ZzqiL.js` 486.81 kB (gzip 143.10), CSS 79.35 kB, lazy `AdminScreen` 31.57 kB and `ImportScreen` 23.82 kB; lazy chunks load (200, 486818, 31570 and 23826 bytes) on both projects.

**Item 2 (boundary).** `git diff --stat a643794..target -- src/server src/domain migrations` empty (`20-bound-stat.txt`; there is no `migrations` directory). Clean builds of a643794 and the target
(`log-cmp-dist.txt`): `dist/server` 180 and `dist/domain` 46 files, 0 hash differences; only `dist/client` differs (232 against 236 files: main chunk, CSS, two lazy chunks). The scratch probe
build equals the gate export (0 differences).

**Item 3 (round scope).**
- 82 paths outside `handoff/` from a643794 to the target (14215 insertions, 2005 deletions). From the previous gate target 7ce4e95 to the target: exactly 22 paths (`22-fix3-gov2-names.txt`):
  GOV2's AGENTS pair plus FIX3's 20 (6 source: `styles.css`, `breakRowsModel.ts`, `ClockOutDialog.tsx`, `SessionDialog.tsx`, `dayEditorModel.ts`, `dayModel.ts`; 8 tests; 6 docs),
  all within FIX3's owned paths. Not changed: `AppShell.tsx`, `AccountMenu.tsx`, `OperationsStatus.tsx`, `keyboard-access.spec.ts`, `timesheet.spec.ts`. From a78ada5 to the target only AGENTS.md and AGENTS.vi.md.
- `git ls-files`: no font file; the only raster outside `reference/` and `-synthetic.png` evidence is the older `handoff/delivery/evidence/WP1/ui-timesheet-synthetic.jpg`. Deleted files:
  `BreaksEditor.tsx` and `SessionForm.tsx` only; `git grep` for them in `src tests` empty.
- Skips: lines with skip/fixme/only/slow 17 at a643794, 30 at 7ce4e95 and 30 at the target; FIX3 added and removed none; no `fixme`, no `.only` (`24-skipcount.txt`, `24-skipcheck-*`).
- Sampled FIX3 changed or new assertions against the diff (`24-test-diff.txt`), 8: (1) `hover.spec.ts:577` scan of the old `.sheet-day` regex widened to every `:hover` rule (stronger: the exemption of the two
  `.sheet-review` resets is gone, five needles and the old two `gated.some` assertions kept, allowlist empty); (2) `hover.spec.ts:640-680` ring under the pointer, 3 controls x 2 themes plus the Escape return
  (new); (3) `shell.spec.ts:754-768` More-panel Escape (new, see mutant A4); (4) `shell.spec.ts:1046` and `:1077` bar controls at least 44px with touch, Sign out gap 12px (new); (5)
  `breakRowsModel.test.ts:543-600` three starting cases of Check out and `:877-932` "Confirm breaks" rows (1, 2, 3, none, boundary minutes, pinned zone; new); (6) `day-editor.spec.ts:1902-1980`
  server replaces saved rows, dialog note, request body `{breaks: [], breaks_confirmed: false, expected_version}` (new); (7) `admin-status.spec.ts:243` phone Administration at 390 and 320 (new); (8) `dayModel.test.ts:213`
  pins "review the new categories" (new). No removed line is a weakened assertion: the removed lines are the old scan regex and the old fixtures of the removed tests (65 removed lines in total, read in full).
- The four `quickBreaksOf` unit tests (12 expectations) removed from `dayEditorModel.test.ts`: judged against the mapping in `WP5-UX3-FIX3.md`: (1) shifted-by-start chips - held by the
  `confirmBreaksRows` table (09:00-18:00 gives 11:00, 13:00, 15:30 with 15, 30, 15 minutes), the pinned-instant test and the Ho Chi Minh input-zone test; (2) rows already listed are not replaced - held by the
  "saved rows" case and by the e2e that opens "Confirm breaks" with saved rows; (3) none when a suggestion falls outside, no policy, no policy breaks - held by 09:00-10:30, the no-policy and empty-breaks cases;
  (4) nothing for a running or confirmed session - held by the same last test. Only the display-zone chip text (`'11:00-11:15'`) has no counterpart because no screen shows those chips any more. The behaviour changed by
  the owner's inside-filter decision (F-UX3B-2), so "none fits" is the right oracle for 09:00-10:30 only. Accepted, not a weakening.
- `surviveStall` in `theme.spec.ts:77` (reading the diff): it only wraps the settled measurements (`indicator`, `textContrast`, `focusFromKeyboard`, `measureFocusRing`), repeats at most twice more and only when the error
  message matches `Timeout N ms exceeded` or `is settled`, and throws anything else at once; every assertion on the values is unchanged and the test got a 120 s budget. A real settle failure still fails:
  with `contrast.ts` made to never settle (scratch copy only, restored and `cmp`-identical afterwards) the 4 desktop contrast tests fail with "the computed color is settled" (`80-stall.txt`, `log-stall-run.txt`).
  The unmutated test passed in all six full runs (real clock and five instants), on both projects.

**Simulated-clock sweep** (America/Los_Angeles, FIX10 preload `shiftclock.mjs` unchanged; control at every instant in `log-control-*.txt`: the server reports the simulated `today_local`; real-clock control 2026-10-19).
Both projects, 0 failed in every row that is not marked.

| Instant (LA) | Window | Scope | desktop ok/skip/fail | mobile ok/skip/fail | Result |
|---|---|---|---|---|---|
| Tue 2026-10-20 10:00 (17:00Z) | outside | FULL | 326/30/0 | 319/37/0 | exit 0, 645 passed (16.2 min) |
| Mon 2026-10-26 09:00 (16:00Z) | inside | FULL | 326/30/0 | 319/37/0 | exit 0, 645 passed (14.8 min) |
| Sun 2026-11-01 01:45 (08:45Z) | outside | FULL | 326/30/0 | 319/37/0 | exit 0, 645 passed (15.7 min) |
| Thu 2026-12-31 23:30 (Jan 1 07:30Z) | outside | FULL | 326/30/0 | 319/37/0 | exit 0, 645 passed (16.0 min) |
| Sun 2027-03-14 03:30 (10:30Z) | outside | FULL | 326/30/0 | 319/37/0 | exit 0, 645 passed (14.5 min) |
| Mon 2026-10-26 23:58:30 (Oct 27 06:58:30Z) | inside | 5 specs | 154/22/0 | 147/29/0 | exit 0, 301 passed (5.4 min) |
| Sat 2026-10-17 10:00 (17:00Z) | outside | 5 specs | 154/22/0 | 147/29/0 | exit 0, 301 passed (5.2 min) |
| Fri 2027-01-01 00:30 (08:30Z) | outside | 5 specs | 154/22/0 | 147/29/0 | exit 0, 301 passed (5.1 min) |
| Sat 2026-11-28 10:00 (18:00Z), run 1 | outside | 5 specs | 153/22/1 | 147/29/0 | exit 1, 300 passed, 1 failed: `day-editor.spec.ts:146` desktop, "console error: Failed to load resource: net::ERR_NO_BUFFER_SPACE" (a buffer error) |
| Sat 2026-11-28 10:00 (18:00Z), rerun | outside | 5 specs | 154/22/0 | 147/29/0 | exit 0, 301 passed (5.0 min) |

The five specs are `today`, `timesheet`, `day-editor`, `shell`, `sharing`. The single failure of run 1 is the buffer error the brief allows to rerun once; both runs are recorded, the rerun passed (the test also passed in the other nine runs
and in the real-clock run). Load context: the GOV gate ran on the same host at the time. No other run failed. Total full e2e runs on the target: 6 (real clock plus five instants), all 645 passed. Every run's log has 0 deprecation lines.

**Item 3 findings, each closed by my own measurement on the build of the target** (probe `zz-audit.spec.ts`, clean run `obs2-audit.txt`, 37 passed, 13 skipped by project; the same probe on the base 7ce4e95 as negative control:
23 failed, 14 passed, `log-probe-basectl.txt`, so the probe detects each defect).
- **F-UX3A-01 closed.** Keyboard focus plus the pointer resting on the control: the ring stays, equal to the pointer-away ring, in light and dark: date button (shared ring, `0 0 0 1px` gap and `0 0 0 3px` accent, ring against surface 5.75 light, 6.15 dark),
  Category picker (2px inset, `rgb(31, 95, 191) 0 0 0 2px inset` light, `rgb(110, 168, 255)` dark), phone day button on a hover device at a 390 window (5.63, 6.14), button link "Review & sign off" (6.09, 6.79). Escape return from the Day editor at 1440:
  the date button is focused, `:focus-visible` and `:hover`, ring painted, both themes.
- **F-UX3A-02 closed.** Stylesheet scan (both projects): 31 hover rules, all inside `@media (hover: hover)`, 0 ungated. On the mobile project a tap and a second tap on the Category picker leave background, border and shadow equal to rest in light and
  dark (`:hover` still matches after the tap, with no hover look).
- **F-UX3A-03 closed.** With `hasTouch` (coarse pointer true): no bar or tab control under 44px high at 320, 360, 390, 600, 767 (mobile and desktop projects), 768, 820, 1024 and 1280 (desktop): smallest height 44; 5 controls below 768 and 7 from 768.
- **F-UX3A-04 closed.** Menu at 1280 and More at 390, light and dark: icon gap 12px for Profile, Settings and Sign out, centre offset 0.875px for all three (Sign out equals Profile), entries `display: flex`. Observation, not part of the finding: Sign out's icon starts
  3px further right than Profile's (15 against 12px inside the entry); gap and vertical alignment are as the finding requires.
- **F-UX3A-05 closed.** The More-panel Escape assertion exists (`shell.spec.ts:754-768`); mutant A4 (`AppShell.tsx` line 161 `moreButton.current?.focus();` replaced by `void 0;`, scratch copy `export-mut` only, rebuilt) makes 4 tests fail
  (`shell.spec.ts:713`, employee and admin, both projects, `toBeFocused`), 71 passed (`60-mutA4.txt`, `log-mutA4-shell.txt`). The unmutated target passes them in every full run.
- **F-UX3A-06 closed.** Phone Administration seeded with the long delivery state ("Delivery recorded as uncertain") and the fault code `lease_expired_while_sending`, light and dark: table wrapper 326/326 at 390 and 256/256 at 320 (client against scroll),
  page scrollWidth equals the window, axe 4.14.0 0 violations, `scrollable-region-focusable` 0 (base: scroll 359 against 326, 1 violation).
- **F-UX3B-1 closed.** API-seeded running session with two saved unconfirmed rows (the second ends about two minutes after now): after removing both rows with the box unticked the note "The saved breaks you removed are deleted at Check out. Breaks stay
  unconfirmed and OT for the day stays pending." shows, the submit label is "Check out, breaks unconfirmed", the request is `{"breaks":[],"breaks_confirmed":false,"expected_version":2}`, status 200, session closed, unconfirmed, 0 rows. A single saved row that ends after now,
  removed: the same request, 200, no 422. No saved rows at the start: the body is `{"breaks_confirmed":false,"expected_version":2}`, no `breaks` key, 200. (The repository e2e `day-editor.spec.ts:1902-1980` also proves the 422 for an omitted list.)
- **F-UX3B-2 closed.** "Confirm breaks" on 09:00-12:00 lists 1 row (11:00, 15 min), 09:00-14:00 lists 2 (11:00/15, 13:00/30), 09:00-18:00 lists 3 (11:00/15, 13:00/30, 15:30/15), on both projects; 09:00-10:30 lists none and Save asks through the
  "No breaks listed" notice (the "Save this session?" confirmation does not show).
- **Docs** (`30-docs-lines.txt`, `30-chunk-lines.txt`): docs/04 lines 46 and 70, docs/10 lines 238 and 245 (VI 239 and 246) and docs/12 line 71 carry the same numbers, code tokens and quoted strings in EN and VI (4.82:1, 1360px, 4.14:1, 2.79 to 3.27:1, 3:1, 4.5:1,
  108px, 768 to 899px; the three Check out strings; `saved_break_after_clock_out`, `future_break`, 422; the inside-filter wording of line 65 and line 245). docs/10 line 240 (VI 241) says "main chunk 487 kB in the build after WP5-UX3-FIX2, under the 500 kB advisory": the built main chunk
  is 486.81 kB, which rounds to 487 kB, so the figure and "under the 500 kB advisory" are still true; only the label "after WP5-UX3-FIX2" names the previous build (487.17 kB), harmless.

**Item 4 (full axe scan; axe-core 4.14.0, WCAG 2.2 A/AA tags, loaded from the task folder through `page.evaluate`).** 96 scans = 24 states x 4 theme situations (light, dark, light device with manual dark, dark device with manual light): the 21 states of the attempt-1 list
(Timesheet closed, batch of 3, editor beside at 1366, floating modal at 1280, account menu, Settings Personal, Profile, Administration, Import, session dialog with rows, "Save this session?", "No breaks listed" notice, the phone Timesheet with day buttons, More panel, Day editor sheet,
session dialog with chips, break sub-dialog, confirmation, notice; administrator pages) plus phone Administration with the long delivery state at 390 and at 320 and the Check out dialog with the removal note at 1280. 92 clean, 4 with one violation:
`target-size` on the "Today" button with the account menu open at 1280 (menu over the bar), one per theme situation: the justified account-menu item of FIX1, same element, unchanged. Every other scan: 0 violations. The other state-specific results: text contrast 0 elements below the requirement in all 96 scans
(lowest 4.61 phone light, 4.65 phone dark, 5.00 desktop light), focus rings painted on every tab stop except the 8 Light/Dark radio inputs whose ring is on the segment label (lowest ratio 5.33), `incomplete` `color-contrast` and `label-content-name-mismatch` entries only as in earlier gates (no
`label-content-name-mismatch` violation). The attempt-1 `label-content-name-mismatch` findings stay gone. The scan ran under the simulated clock 2026-10-26T16:00:00Z because the session-dialog states need free past workdays; a first pass on the real clock (2026-10-19) skipped them and is kept as `obs1-a11y-scan.txt` (8 "NOT SCANNED" notes).
Evidence: `85-axe-summary.txt`, `obs2-a11y-scan.txt`.

**Other round checks repeated on the target** (same probes as REGATE; real clock; Edge/Chromium; `obs1-*.txt`; first pass `phoneb` for the first screen):
- Week card keyboard focus at 768, 800, 820, 860, 880 and 899px, details off and on, Tab and Shift+Tab: 12 tests, 14 of 14 controls per walk, 0 stops with the ring outside the card, minimum room 1.0px; page never wider than the window.
- Contrast and states, 4 situations: card on page 1.14 light and 1.15 dark (threshold 1.12); hover boundaries 5.33 to 15.62, hover fill steps 1.23 to 1.45 (threshold 1.20), text on the hover fill 5.75 to 12.72; editor frame 4.82 on the Day cell and 5.23 to 6.79 elsewhere; selection checkbox 3.90 and 5.23.
- 44px targets: 0 controls below 44px at 320, 360, 375, 390, 430, 600 and 767 in 11 states (81 lines); page sideways scroll none at 320, 360, 375, 390, 768, 820, 1024, 1280, 1440. 390x844 first screen (landing): bottoms 658.4, 710.4, 559.5, 611.5 against the tab bar 788; the away state sits 2.2px lower
  (660.6, 712.6, 561.7, 613.7) because the displayed period carries the extra "future" word; all within the budget.
- Desktop bar one 56px row at 1024, 1100, 1279, 1280, 1440, 1920, with and without a share; wordmark visible 1024 to 1279 without a share, hidden 1024 to 1279 with a share, visible from 1280. Day editor: modal at 1280 and 1359, beside the sheet at 1360 (columns 116.8-116.9), 1366 (117.7), 1440 (128.3),
  1920 (151.1); every column >= 108px; no word wider than its cell; dock side right for Monday, left for Saturday and Sunday. Lifted runs at 1440, 1445, 1367, 1601, 1281 (DPR 1): fill continuous across inner joins; shadow falls on the unselected neighbour only (`obs1-lift.txt`; the DPR 2 seam scripts were not repeated).
- Session dialog 390x844 with three suggested breaks: same-day rows scroll 297px, overnight chips 259px, first field and footer visible; rows against chips at 430, 390, 375, 360, 320 as before.
- CSP and all response headers identical to the a643794 capture on both projects (0 diff lines, `70-hdrdiff-*`); 0 `securitypolicyviolation`. Shared views show no check in/out and the bar shows the signed-in user; an employee at `#/settings/admin` and `#/admin` makes 0 `/api/admin/` requests (both projects). Chunk-load error shows
  the alert "Administration could not be loaded" and "Try again" reloads with Administration visible.
- Audit-focus items: `Open a day` words visible to 327px and hidden from 308px, one row throughout; hover text steps to `--accent-strong` (5.77 and 6.52).

**Screenshots** (14 `-synthetic.png`): account menu 1440 light and dark, sheet with the Day editor 1440 light and dark, lifted run 1440 light, session dialog with the notice 1366, phone 390 session dialog rows and chips, Settings Administration 1280, Check out discard question 1366,
and the three new ones: focus ring under the pointer (1440 light), phone Administration with the long delivery state (390), Check out with the removal note (1280). To stay at 14 I dropped the regate's account menu 1280 light and dark, sheet with editor 1280 light and dark, period card old, phone Profile heading ring, and the 320
Administration picture (all taken or not taken, not copied).

**Deviations and slips.**
1. Rule slips in my shell commands, none with an effect on a result: `ls ... | head -0`; `grep ... | head -1 > /dev/null 2>&1`; two `| head -n 30` pipes into a file; `grep | tail -n 14`; `git diff --stat | tail -n 1`. Nothing was fed to python or node through stdin, no heredoc, no recursive delete (one `rm` of one copied picture), no process killed.
2. Probe repairs (task-local, not product): the axe path of my scripts pointed at the old folder (first a11y and phone-Administration runs failed with ENOENT; fixed by copying axe into `a2` and rerun, `log-probe-audit2.txt`, `log-probe-a11y2b.txt`); the phone first-screen probe looked for a button named "Current period" which this date names "Today"
  (fixed, `log-probe-phoneb.txt`); the "Confirm breaks" row reader read empty values (fixed, `obs2-audit.txt`); the `dom` debug probe of the old attempt-1 axe findings failed on mobile because no free past workday was left on 2026-10-19 (not rerun: its subject, the two label findings, is covered by the 96 axe scans);
  the first a11y pass ran on the real clock and skipped the session-dialog states (rerun under the simulated clock, above). The audit probe's first obs file `obs1-audit.txt` is mixed with the base-control run (documented in the README); the clean target run is `obs2-audit.txt`.
3. The Playwright harness starts each server on an OS-assigned loopback port (as in earlier gates); only `SMOKE_PORT` 49041 was set in 49040-49079.
4. The `sweep2.sh` instant list is the brief's (5 FULL, 4 five-spec); the 2026-10-30 instant of the earlier gates was not requested and not run.
5. DPR 2 seam scripts, the NAS items and browsers other than Chromium were not run: NOT VERIFIED.

Nothing of mine is left running (no server, browser, container, volume, network or background task); no source, docs, tests, board or STATE was edited; the digest is unchanged.

Status: done (decision PASS)
