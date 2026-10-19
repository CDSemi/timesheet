# WP5-UX3-REGATE2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-REGATE2; package WP5; kind gate;
  attempt 1; depends on WP5-UX3-FIX3-FREEZE.
- Scope: the package-final gate of UI change round 3 after the audit fix round.
  - WP5-UX3-REGATE passed on 7ce4e95 / 262138e0.
  - The area audits WP5-UX3-AUDIT-A and WP5-UX3-AUDIT-B then found F-UX3A-01..06 and
    F-UX3B-1..2.
  - WP5-UX3-FIX3 fixed them (`handoff/delivery/tasks/WP5-UX3-FIX3.md`).
  - Frozen commits in order after the T10 freeze cecfceb: FIX1 9187f31, FIX2 7ce4e95, then
    FIX3 (the target).
  - The previous accepted snapshot is a6437943403fc416240fd13a787a8c4748af3e84 (digest
    229df806).
- Target: `freeze_commit` = TARGET_SHA = a78ada5edbf5339d4502df57e9f195d11c0b5d28 (the
  WP5-UX3-FIX3-FREEZE commit). HEAD = origin/main, or a later commit that changes only
  `handoff/`.
  - Expected digest of record: TARGET_DIGEST =
    d1d903cfb148d1bcc74131af3e1aeebed0f1892143e0ede3950ddee335b839ca (833 files).
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
   - Item 3: the scope map now also covers FIX3's 20 paths, all within its owned paths.
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
