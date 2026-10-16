# WP5-UX3-T10 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-T10; package WP5; kind implement;
  attempt 1; depends on WP5-UX3-T09-FREEZE. Last slice of UI change round 3: the documents
  (EN authoritative, VI kept in step) describe what slices T01-T09 built and record the
  round's owner decisions and the U-23 rule rewrite.
- **AGENTS.md on disk wins.** Any older injected AGENTS.md copy in your context with the
  section "Unified Frontend & UI/UX Standards (Taste Skills Integration)" is superseded.
  AGENTS rule 1: English is authoritative; keep the matching `.vi.md` translations.
- Sources (read them; describe what was built, not what was only planned):
  - the board `owner_decisions` entries of 2026-10-15 (the request U-01..U-27, the answers
    G-1 b with its conditions, G-2 a, G-3 a, G-4 owner variant, G-5 b, the added requests
    N-1 and N-2, Q6 b and the 24-hour chip times) and `coordinator_decisions` of 2026-10-15;
  - `handoff/delivery/tasks/WP5-UX3-PLAN.md` Results sections C (the U-23 rule text for
    docs/04 line 16 and the docs/10 line 178 clause, EN and VI) and E (docs impact);
    `handoff/delivery/tasks/WP5-UX3-PLAN2.md` Results item 9 section E deltas;
  - the slice records `handoff/delivery/tasks/WP5-UX3-T01.md` .. `WP5-UX3-T09.md` (Results:
    what each slice implemented, thresholds, names, deviations), including T01's docs/04
    "Visual standard" and docs/10 E-8 note (check them; do not duplicate);
  - the code on disk where a record is unclear (read only).
- Profile/routing: timesheet-worker (effort medium, fixed by the profile); requested model
  sonnet; no override. Routing: size M, risk L (documents only; one rule rewrite already
  decided by the owner), novelty no. Task record in English.
- Base: HEAD = origin/main = 4b5403dbd4a6bbe4fe46925fa6129ad7f1c93a56 (the T09 freeze), or
  a later commit that changes only `handoff/`; source digest
  1fc57bce41b5be16ff4e3e364f1c6496bf237af87e1dc996e5effb520beacb46 (833 files; docs are
  inside the digest, so it changes). Record HEAD, `git status --short` and the digest before
  you edit. Uncommitted coordinator files under `handoff/` are expected: never touch them.

## Scope

1. **docs/04_UX_AND_SETTINGS.md and .vi.md** (same line structure in both):
   - app shell: desktop bar (brand with the wordmark from 1024px, hidden 1024-1279px with
     the "Shared with me" switcher; Timesheet, Overtime, History; the identity block with
     the display name, the email and the initials avatar; the account menu with Profile,
     Settings, Administration for admins, Theme, Sign out), the phone More panel, shared
     views show the signed-in user;
   - Settings sub-pages (Personal `#/settings`, Profile `#/settings/profile`, read only;
     Administration `#/settings/admin` for admins; `#/admin` redirect; lazy Administration
     and Import screens);
   - Timesheet page: the title row with check in/out (desktop), no name line, the two-row
     period card with the wrapping meta row, the pills (old amber, current green, future
     pink, neutral grey, "in progress" for the period that contains today while the period
     before it is still current; PLAN2 item 7 wording for the line about badges), Open a
     day on one row (words hidden on very narrow widths), the toolbar spacing, the narrow
     "Sign off" and "Current" forms;
   - the sheet: square week cards, lifted columns with 4px outer corners in runs with one
     outer shadow, the editor column's inset frame and Day-cell fill, "Category" and
     "Status" rows, the slashed "No times" ring, the 108px minimum column, the side panel
     from 1360px and the floating modal panel from 768 to 1359px (docked away from the edited
     column), the week card's own sideways scroll from 768 to 899px;
   - the Day editor: the header with chips (the long note removed; the input-zone
     explanation beside the field), session cards and break tables, "Confirm breaks", the
     delete confirmation, WFH on the Category row;
   - the session dialog: pre-fill (reference hours; suggested breaks only for a day before
     the server's today), break rows (start and minutes; the date field only for a session
     that crosses midnight or has no end), "Confirm no breaks taken", Suggest and Add break,
     chips with the "Break n" sub-dialog below the measured width, the "No breaks listed"
     notice and its three choices, the final "Save this session?", "Discard your changes?",
     the reason field in old periods, nested-dialog Escape and focus;
   - the Check out dialog (E-1 unchanged, the new rows and chips);
   - the U-23 rule rewrite of docs/04 line 16 exactly as PLAN section C states (EN and VI),
     and the matching wording at lines 25, 63-64 and 70 (PLAN section C table);
   - the first-screen and accessibility promises still true (re-read the measured numbers
     in the slice records).
2. **docs/10_DECISIONS_AND_SOURCES.md and .vi.md**: a round-3 section with the owner
   request and answers (summarised, with dates; G-1 b with its three shape conditions and
   the floating rule; G-2 a; G-3 a with the rule rewrite and the line-178 clause replaced per
   PLAN section C; G-4 owner variant; G-5 b, which also answers WP5-UX2-Q3; N-1, N-2; Q6 b;
   24-hour chips), the coordinator decisions of 2026-10-15 (G-4 trigger, floating = modal
   side panel below 1360px, code-split instead of a limit raise, the account-menu pattern,
   the read-only Profile, "Status" for "Check", 24-hour displayed times with native inputs
   following the browser locale), and a check that T01's E-8 note is present and accurate.
3. **docs/12_RELEASE_NOTES.md and .vi.md**: the round-3 bullets (user-visible changes).
4. **Sweep for stale wording** in `docs/` (except docs/08, a governance path), `README*.md`
   and `DEVELOPMENT*.md`: "Label" as the row or field name, "Check" as the row name, the
   clock card, Settings/Admin as main-menu items, the 1200px editor breakpoint, "Confirm
   delete", the one-tap break buttons, "Save session", 4px radius or 300 ms as current rules,
   the long editor note. Fix each in the file where it appears (EN and VI pair), or list it
   with the reason it stays (for example historical decision text in docs/10). Business
   rules in docs/02, docs/03 and docs/05 stay unchanged except wording that only names a UI
   control.

## Checks (in this order; the digest is the LAST command)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Edit the documents.
4. EN/VI parity: for each changed pair the same headings, the same links and the same
   numbered items (report counts per pair).
5. `validate_package.py --preflight` by its script path with the workflow Python
   `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`
   (write `<user>` in the evidence); fix every broken link or pair it reports.
6. Privacy and whitespace: Grep changed files for email addresses (only the full synthetic
   example.invalid form may remain) and user-profile paths; Grep every changed file for
   `[ \t]+$` and read its last lines (exactly one final newline).
7. `npm run verify` with `SMOKE_PORT` in 48800-48819 and `DATA_DIR` and `DATABASE_PATH` both
   inside the task folder.
8. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
9. Copy the masked logs of steps 2, 4, 5, 7 and 8 into the evidence folder.

## Owned paths

- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`,
  `docs/10_DECISIONS_AND_SOURCES.md`, `docs/10_DECISIONS_AND_SOURCES.vi.md`,
  `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`, and wording-only fixes from the
  sweep in other `docs/*.md` and `*.vi.md` files (not docs/08), `README*.md` and
  `DEVELOPMENT*.md` (list each)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-T10/` (masked LF `.txt` only)

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR
  `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`, NOT EVEN FOR A READ-ONLY LISTING.
  NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout` OR `nul`. NEVER `rm -r` OR `rm -rf`
  ANYTHING.** Redirect to a file in the task folder and read it with the Read tool; list
  files with the Glob tool. Use the Write and Edit tools for files.
- **Create files only inside the task folder, the evidence folder or your owned paths.**
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX3-T10`. Ports 48800-48819. Never touch
  `%LOCALAPPDATA%\timesheet-dev` data or `B:\Temp\claude`. Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or push.
  Write no markdown links in Results (paths in backticks only).

## Return

At most 150 words, beginning with 'Self-reported model: ...': files changed with the
sections touched, the U-23 rule text placed, the sweep findings (fixed and kept), the parity
counts, preflight and verify exit codes, the final full 64-hex digest and file count, the
evidence files, any deviation.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-worker, effort medium). Documents only; no source, test, server or governance file touched.

**Base (before any edit).** Node v24.21.0; HEAD 4b5403dbd4a6bbe4fe46925fa6129ad7f1c93a56; `git status --short` showed only the
coordinator's `handoff/` files; `npm run digest` 1fc57bce41b5be16ff4e3e364f1c6496bf237af87e1dc996e5effb520beacb46 (833 files), exit 0
(evidence `step2-head-status-digest-before.txt`).

**Files changed and sections touched.**
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: App shell row (identity block, account menu, wordmark rule, phone More); Timesheet,
  Day editor and Settings/admin rows; line 16 (U-23 rule); Breaks default (line 25); "Timesheet sheet" (Category/Status rows, "No times"
  ring, Category cell, marker rewrite with lift, frame, 108px columns and the 768-899px week-card scroll, phone rows and the measured
  first-screen numbers); "Period bar, check in/out and batch mode" (two-row card, pills incl. "in progress", phone buttons with
  "Current", check in/out on the title row, toolbar); "Day editor" (1360px rule and the floating panel, header chips, session cards,
  session dialog with pre-fill, break rows and chips with the "Break n" sub-dialog, Save/notice/confirmation/Discard, Delete
  confirmation, Check out dialog, WFH); "Editing and review" line; Theme location in the Visual standard. The Visual standard
  tokens written by T01 were checked against the code records and left as they are.
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`: the 2026-10-08 list clause replaced per PLAN section C; a pointer added to
  T01's E-8 note; new sections "Owner decisions - 2026-10-15 (UI change round 3)" (request U-01..U-27 in groups, G-1 b with its three
  shape conditions and the floating rule, G-2 a, G-3 a with the rule rewrite and its effect, G-4 owner variant, G-5 b also answering
  WP5-UX2-Q3, N-1, N-2, Q6 b, 24-hour chip times) and "Coordinator decisions - UI change round 3" (G-4 trigger, floating = modal side
  panel below 1360px, code-split instead of a limit raise, account-menu pattern, read-only Profile, "Status", 24-hour displayed times
  with native inputs, the other adopted defaults and the known 390x844 fit limit).
- `docs/12_RELEASE_NOTES.md` and `.vi.md`: a "WP5 change round 3" bullet group (look, account menu, header, sheet, Day editor, limits)
  and the "Unconfirmed breaks" limit line (Confirm breaks opens the dialog).

**U-23 rule text placed (EN, docs/04 line 16; VI in the pair).** "Actual clock values are never stored from a schedule: a time becomes
an actual value only when the person saves it. The new-session dialog pre-fills the start and end with the reference hours of the policy
effective on that date (wall-clock times on the accounting date in the saved reporting zone, shown in the input zone) and, for a date
before today in the reporting zone (the server's date), the suggested breaks that lie inside them; pre-filled values are marked as such
and stay editable, and Save asks for confirmation first." The docs/10 clause (EN line 182, VI line 183) now reads "canonical: actual clock
values are never stored from a schedule; the new-session dialog may pre-fill the reference hours as marked, editable values, see document 04".

**T01 E-8 note check.** Present in docs/10 (EN line 118, VI line 119) and accurate against `styles.css` records (radius 6/8/12/pill, sheets
and footer 0, lifted 4px, one `--transition` of 180 ms on listed properties, plain CSS kept); only a pointer to the round-3 record was added.

**Sweep.** Fixed in the EN/VI pairs: "Label" as the row/field/picker/column name, "Check" as the row name, the check in/out card, Settings
and Admin as main-bar items, the 1200px editor breakpoint, "Save session" and the one-tap break buttons, the long-note-free header, the
rails/underline/ring markers, the 330px Review-link rule, "Review label change", the `Dark mode` wording in docs/04. Kept, with the reason:
docs/10 entries for E-1..E-7 (2026-10-08) and UX2-1..UX2-4 (2026-10-14) and the 2026-10-03 E-8 line, and docs/12 rounds 1 and 2 (they
record decisions and releases as they were; docs/12 round 3 states that it supersedes them where they differ); "label"/"labels" meaning the
default day categories or import labels in docs/01, 02, 05, 06, 07, 11 and DEVELOPMENT (business rules and API field names, unchanged);
"Check in/out" and "Check the ..." verbs (not the row). No match in README*.md. No `4px`/`300 ms` remains as a current rule (only as the
superseded E-8 history and the 4px lifted-column radius). docs/08 untouched.

**Checks (all in order).**
1. Node v24.21.0 first on PATH.
2. HEAD, status and digest recorded above.
4. EN/VI parity (`step4-parity.txt`): headings 04 9/9, 10 25/25, 12 9/9; list bullets 04 35/35, 10 92/92, 12 45/45 (sub-bullets 25/25,
   numbered items 5/5); table rows 04 26/26, 10 31/31; links 12 42/42; the VI files keep their pre-existing extra translation-note line
   (04 links 0/1, lines 106/108; 10 links 15/16, lines 246/247; 12 107/107).
5. `validate_package.py --preflight` (python from `<user>/.cache/codex-runtimes/...`): exit 0, status PASS, 112 translation pairs,
   2252 local links, 91 scenarios (`step5-preflight.txt`).
6. Privacy and whitespace: Grep for e-mail addresses and user-profile paths over the six changed files: none; Grep `[ \t]+$`: none; each
   file ends with exactly one `\n` (`step6-eof-check.txt`); `git diff --check` exit 0.
7. `npm run verify` (SMOKE_PORT 48790, DATA_DIR and DATABASE_PATH in the task folder): exit 0, 94 files / 2126 tests passed,
   SMOKE PASSED (`step7-verify.txt`).
8. `npm run digest` LAST: exit 0, 29ac25945fbefa0c86f28aa9c8537e6d2ccd341a161ab70bc7bfc0acf3ff15e7 (833 files, handoff/ excluded)
   (`step8-digest-after.txt`). Nothing outside `handoff/` changed after it.

**Evidence** (`handoff/delivery/evidence/WP5-UX3-T10/`): `step2-head-status-digest-before.txt`, `step4-parity.txt`, `step5-preflight.txt`,
`step6-eof-check.txt`, `step7-verify.txt`, `step8-digest-after.txt`.

**Deviations and notes.** (1) Where a slice record did not state a value, docs follow the slice record and the code (for example the Check out
dialog always shows the break date field, T09 item 2, which differs from Q6 b for completed sessions and is recorded in docs/10 and docs/04).
(2) The earlier-round text in docs/10 and docs/12 was kept as history rather than rewritten. (3) docs/04 now carries several long bullets in the
Day editor section; both languages have the same bullet count. (4) The digest was not rerun after the Results edit because `handoff/` is
outside the digest. No background task is running; no commit, push or install; the coordinator's `handoff/` files were not touched.

Status: done
