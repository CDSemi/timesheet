# WP5-CALDEF-FREEZE dispatch brief (one commit of the R-UX5I2-3 round and the records, then push)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-FREEZE, package WP5, kind
  commit, attempt 1. It depends on WP5-CALDEF-SMOKE and WP5-CALDEF-EVID (done; with
  WP5-CALDEF-FIX and WP5-CALDEF-DOCS, all uncommitted).
- **Profile and routing.** timesheet-committer, requested sonnet/medium, no override.
  Routing: size S, risk M (server, client, tests, six document pairs and the smoke script, and
  the records since 5b2f287; no merge expected).
- **Authority.** AGENTS.md rule 12 and docs/08 "Commits and pushes". The owner allows pushes
  to main. Create no tag. Never amend, force-push or rewrite history.
- **Runtime.** As in `handoff/delivery/tasks/WP5-UX5-FIX10-FREEZE.md` ("Runtime"), with the
  task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-FREEZE`.
  - **NO HEREDOCS (WRITE EVERY SCRIPT WITH THE WRITE TOOL, IN THE TASK FOLDER), NO STDIN TO
    NODE OR PYTHON (NO `node -e`, NOT EVEN `node -e 1`, NO `python -c`, NO `python -`), NO
    PIPES INTO `head`, `tail` OR `cat`, NO BARE `cat`, NO NULL-DEVICE OR `/dev/std*`
    REDIRECTS (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO INTERACTIVE OR DETACHED
    SHELLS, NO `sed -i`.**
  - **Staging.** Use plain `git add` with literal paths, at most about 20 per call.
    - Folders may be staged as directories.
    - Never use `--pathspec-from-file`, `xargs`, a list file, a glob, `-A` or `.`.
    - To leave one file of a staged folder out, use `git restore --staged <literal path>`.
  - **Never change any git configuration.**
  - If a permission check denies any call, stop and report the reason exactly.
  - Never touch `.claude/worktrees/` or the branch `claude/relaxed-lalande-8359f0`.
  - **Python for `validate_package.py --preflight`.** The host Python may lack a time-zone
    database (`ZoneInfoNotFoundError`). Use the workflow Python of earlier freezes; if it also
    lacks one, put a scratch `tzdata` package outside the repository on `PYTHONPATH` (as
    WP5-CALDEF-DOCS did) and record which you used.
- **The coordinator writes no file while you run.**
- **Confirmed at dispatch** (from the fix, docs and smoke Results and the lookup
  WP5-CALDEF-PATHS):
  - D_PRE: e24274b98ceaef10d83b3a9538680c6ed703657eb014211fc015ce9eb9d251a7 (885 files).
  - The paths outside `handoff/`, 31 modified and 3 untracked: see "Source paths" below.

## Source paths (outside `handoff/`)

Modified (31):

- `src/server/http/schemas.ts`
- `src/server/http/errors.ts`
- `src/server/services/timesheets.ts`
- `src/server/services/timesheetCommands.ts`
- `src/server/services/dayEntries.ts`
- `src/client/api.ts`
- `src/client/DayEditor.tsx`
- `src/client/TimesheetScreen.tsx`
- `src/client/components/DayFieldsForm.tsx`
- `src/client/components/sessionModel.ts`
- `src/client/components/dayModel.ts`
- `src/client/components/labelPickerModel.ts`
- `src/client/components/errors.ts`
- `src/client/components/BatchDialog.tsx`
- `tests/client/sessionModel.test.ts`
- `tests/client/labelPickerModel.test.ts`
- `tests/client/dayModel.test.ts`
- `tests/e2e/day-editor.spec.ts`
- `docs/02_TIME_AND_OT_RULES.md` and `docs/02_TIME_AND_OT_RULES.vi.md`
- `docs/03_ARCHITECTURE_AND_DATA.md` and `docs/03_ARCHITECTURE_AND_DATA.vi.md`
- `docs/04_UX_AND_SETTINGS.md` and `docs/04_UX_AND_SETTINGS.vi.md`
- `docs/06_TEST_AND_ACCEPTANCE.md` and `docs/06_TEST_AND_ACCEPTANCE.vi.md`
- `docs/10_DECISIONS_AND_SOURCES.md` and `docs/10_DECISIONS_AND_SOURCES.vi.md`
- `docs/12_RELEASE_NOTES.md` and `docs/12_RELEASE_NOTES.vi.md`
- `scripts/smoke-built-server.mjs`

Untracked (3):

- `tests/integration/calendar-default-change.test.ts`
- `tests/client/errors.test.ts`
- `tests/e2e/calendar-default.spec.ts`

## Steps

1. **Check the starting point.**
   - Run `node --version`. It must print v24.x.
   - HEAD must be 5b2f28793e1def408e7a2c57df5054917450a1f2.
   - Run `git fetch origin`. origin/main must still be 5b2f287.

   If either check fails, stop and report. Do not merge.
2. `git diff --cached --name-status` must be empty.
3. **The working tree outside `handoff/`.** `git status --short --untracked-files=all` must
   show exactly the 34 source paths above. Anything else stops the commit.
4. **D_PRE.** Run `npm run digest`. It must equal the D_PRE above. Otherwise stop and report.
5. **Stage these:**
   - **the 34 source paths;**
   - **the mission records:**
     - `handoff/delivery/ORCHESTRATION.json` and `handoff/delivery/STATE.json`;
     - `handoff/delivery/WORKFLOW_REVISION_CHECKPOINT.md` and `.vi.md`;
     - `handoff/NEXT_ACTION.md` and `.vi.md`;
   - **the task briefs:** `handoff/delivery/tasks/WP5-GOV-DOCS-COMMIT.md`,
     `WP5-CALDEF-PLAN.md`, `WP5-CALDEF-PLAN-REVIEW.md`, `WP5-CALDEF-FIX.md`,
     `WP5-CALDEF-DOCS.md`, `WP5-CALDEF-SMOKE.md`, `WP5-CALDEF-EVID.md`,
     `WP5-CALDEF-PATHS.md` and this brief;
   - **the evidence folders, staged as directories:** `handoff/delivery/evidence/`
     `WP5-GOV-DOCS-COMMIT/`, `WP5-CALDEF-PLAN/`, `WP5-CALDEF-PLAN-REVIEW/`,
     `WP5-CALDEF-FIX/`, `WP5-CALDEF-DOCS/`, `WP5-CALDEF-SMOKE/` and `WP5-CALDEF-EVID/`.

   **Expected leftovers.** Four untracked files stay out, and do not stop the commit:
   - `handoff/delivery/evidence/WP5-UX5-DIAG6/new-proc-detail.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE7/10-census-sample1.txt`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-chain1.log`;
   - `handoff/delivery/evidence/WP5-UX5-REGATE8/log-master.log`.

   If any other changed path appears under `handoff/`, list it and stop. List every staged
   path in `checks.txt`, with a count per group.
6. **Owner process details.** This is a public repository. Read every census or process file
   of the staged evidence folders. Their names contain `census`, `proc`, `priority`,
   `leftover`, `process` or `load`. Unstage any file that shows the command line of a process
   the mission did not start. Process names, IDs, counts and CPU times are allowed. List each
   file you unstage, with the reason.
7. **File types and names.**
   - Any staged basename that contains "signature" (any case) without "synthetic" stops the
     commit.
   - So does any staged `.png` whose name does not end in `-synthetic.png`.
   - Evidence is LF `.txt` or `-synthetic.png`. Unstage any staged evidence file with another
     extension, and list it; if that file is named in a board evidence list, stop and report.
8. **Scans.**
   - Run the key and PEM scan, the rule in `handoff/delivery/tasks/WP5-UX4-FIX3-FREEZE.md`,
     over the staged evidence folders.
   - Then run the email and Message-ID scan over everything staged.
   - **Allowed:** addresses ending in `@example.invalid`; Message-IDs ending in
     `@timesheet.invalid`; the public no-reply address of a Co-Authored-By trailer quoted in
     earlier freeze records; truncated fragments of a synthetic `@example.invalid` address in
     captured logs.
   - **Any other address or Message-ID stops the commit.**
9. **Run `node scripts/precommit-check.mjs`.**
   - A `profile-path` finding in an evidence file may be masked as `<user>`, then the file is
     staged again.
   - A `secret-assignment` finding on a synthetic password literal in an evidence probe script
     may be masked as `'<synthetic-password>'`, then the file is staged again.
   - An evidence file over the size limit may be unstaged, that one file only, if no board
     evidence list names it.
   - A trailing blank line at the end of a staged evidence `.txt` file may be removed, and CRLF
     line endings of a staged evidence `.txt` file may be converted to LF (expected:
     `evidence/WP5-CALDEF-DOCS/03-preflight.txt`), whitespace only, then the file is staged
     again.
   - List each one. Any other finding stops the commit.
10. **Run these checks:**
    - `git diff --cached --check`;
    - a JSON parse of ORCHESTRATION.json and STATE.json;
    - `python handoff/delivery/validate_orchestration.py`;
    - `python handoff/delivery/check_recovery.py` (141 probes);
    - `python handoff/delivery/validate_package.py --preflight` (see "Python" above).

    Any failure stops the commit. If a validator stops on a board or brief issue, list every
    error you can see. Do not edit the board.
11. **Commit on main, then run `git push origin main`.** The push must fast-forward the remote
    from 5b2f287. Record the remote SHA. It must equal HEAD.
12. **Compare digests.** Compute HEAD's digest with the `git ls-tree` form at the top of
    `scripts/source-digest.mjs`, and with `npm run digest`. Both must equal D_PRE.
13. **Write the outputs.**
    - Write `checks.txt` and `commit-message.txt` in
      `handoff/delivery/evidence/WP5-CALDEF-FREEZE/`.
    - Write a short Results section here.
    - Leave all of these unstaged.

**Allowed edits:** only those in steps 6, 7 and 9. Anything else that fails stops the commit;
report it.

## Commit message (refine with the commit-message skill; keep the facts from the Results)

Subject: Ask before a day save overwrites a changed calendar default (R-UX5I2-3)

- feat(server): the day PUT and each batch entry accept an optional `default_category`, the
  calendar default the caller showed. Inside the write transaction, a day with no entry or a
  default-sourced entry answers 409 `default_changed` when that default changed and the saved
  category also differs from the new one. Explicit entries and an omitted field are not
  checked. The batch preview marks such entries; the commit stays all or nothing.
- feat(day-editor): on that answer the Day editor (drawer, phone sheet, shared edit view)
  shows a notice with "Use {new default}" (takes the new default, keeps other typed fields,
  sends nothing) and "Save {category} anyway" (saves over it). The form sends the default it
  was loaded with.
- fix(timesheet): closing a label-picker or "Change several days" review that holds changed
  or stale entries offers "Reload period".
- fix(scripts): the smoke script steps calendar dates, so `npm run verify` no longer fails near
  midnight in a daylight-saving week.
- test: integration, client unit and e2e tests for both choices on every path; two label-pick
  body assertions in `day-editor.spec.ts` carry the new field.
- docs: docs/02, 03, 04, 06, 10 and 12 (+ vi): the rule, the API contract, the notice, the
  owner decision and a release-notes entry.
- docs(handoff): the plan, its review, the fix, docs, smoke, evidence-rename and path-lookup
  records, the GOV-DOCS commit results, the board, STATE, the checkpoint (+ vi) and
  NEXT_ACTION (+ vi).

Task: WP5-CALDEF-FIX, WP5-CALDEF-DOCS, WP5-CALDEF-SMOKE (owner decision R-UX5I2-3, 2026-11-02)
Gate: WP5-CALDEF-GATE pending
Audit: WP5-CALDEF-AUDIT pending
Digest: D_PRE

## Report

Append briefly:
- HEAD before and after the commit;
- the commit SHA, the push result and the remote SHA;
- D_PRE and the HEAD digest;
- the staged counts per group;
- any unstaged, masked or converted file, with its reason;
- every check, with its exit code.

Return at most 80 words, beginning 'Self-reported model: ...', with the full commit SHA.

## Results

Self-reported model: claude-sonnet-5-5.

- HEAD before 5b2f28793e1def408e7a2c57df5054917450a1f2; after and remote
  300d61f055a859857aa8eb3845ed21f4560e82fa (pushed, fast-forward).
- D_PRE = HEAD digest (ls-tree) = npm run digest after: e24274b9...51a7 (885 files).
- Staged 162: source 34, records 6, briefs 9, evidence 113. Converted CRLF to LF:
  evidence/WP5-CALDEF-DOCS/03-preflight.txt. No masking, no unstaging.
- Checks (Node v24.21.0): precommit 0, diff --cached --check 0, JSON parse 0,
  validate_orchestration 0, check_recovery 0, validate_package --preflight 0, push 0.
- Details: evidence/WP5-CALDEF-FREEZE/checks.txt.
