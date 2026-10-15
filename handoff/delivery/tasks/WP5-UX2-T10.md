# WP5-UX2-T10 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-T10; package WP5; kind implement
  (documentation inside the source digest); attempt 1; depends on WP5-UX2-T09-FREEZE
  (done). Last slice of UI change round 2 before the package-final gate.
- Scope: bring the canonical docs (EN and VI, always together) in line with what slices
  T01-T09 built, and record the owner and coordinator decisions of the round.
  - Sources, in this order of authority:
    - the board `owner_decisions` of 2026-10-14 (five owner messages and the answers to
      WP5-UX2-Q1 and WP5-UX2-Q2) and `coordinator_decisions` of 2026-10-14;
    - the implemented behaviour in the slice records
      `handoff/delivery/tasks/WP5-UX2-T01.md` to `WP5-UX2-T09.md` (Results and
      addenda). Where a slice record differs from a plan, the record wins, for
      example the wordmark breakpoint 1440 instead of 1280, the theme radio group, the
      bar heights 60/112, "Sign off" and "Review" short forms;
    - the planned docs deltas: `WP5-UX2-PLAN.md` section D, `WP5-UX2-PLAN2.md` item 5,
      `WP5-UX2-PLAN3.md` items 4-5, `WP5-UX2-PLAN4.md` item 6.
- Profile/routing: timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override. Routing: size M (several docs, two languages), risk L,
  novelty no. Task record in English; the `.vi.md` files are Vietnamese.
- Base: HEAD = origin/main = f70a5c0479b6cc1a0dd10d29f7791157ff29c43d, or a later commit
  that changes only `handoff/`. Source digest
  29ea76dface73cbdece89705c76e34a69c6e56a22e3988c06c9a5a127f3d43f6 (814 files). Record
  both before you edit anything. Uncommitted coordinator files under `handoff/` are
  expected: never touch them.

## What to change (EN and VI, the same lines in both)

1. **`docs/04_UX_AND_SETTINGS.md`**: every rule the round changed, worded as the
   product now behaves:
   - App shell:
     - the logo plus the two-line wordmark from 1440px (logo only below and on
       phones), with the hidden name "C&D Semiconductor Services, Inc.";
     - the brand-to-menu gap;
     - the Light/Dark "Theme" control in the desktop bar and in the phone More panel,
       which follows the device until the first choice and is stored per device;
     - on phones, check in/out in the top bar on the person's own screens (60px, or
       112px with the switcher row) and none in shared views; desktop keeps the card.
   - Timesheet page:
     - the period bar with "Today" (the period that contains today's date in the
       saved reporting zone, from the server; it moves an open Day editor to today; it
       is inactive with `aria-disabled` when already there) and "Current period" (only
       in the five days from the Monday after a period ends to its payroll Friday,
       away from the period the page opens on; it only navigates);
     - the order Previous, Next, Today, Current period, Review & sign off;
     - on phones the Review link stays on one line, with "Sign off" or "Review" as the
       short form and the full label as its accessible name;
     - "Due" in the label style;
     - the period range written with an arrow (read as "to");
     - "Show details" as a switch;
     - the highlighted column (desktop) or framed row (phone) of the day open in the
       Day editor, with `aria-current`;
     - the repaired Today top bar;
     - the label picker look (1px open line, active-option rail, check on the current
       value);
     - no company line on the on-screen sheet (the PDF keeps it).
   - The phone first-screen sentence of line 48 stays true; update its description of
     what the first screen shows.
   - Visual standard:
     - the hover rule (`--hover-fill`, accent boundary, pressed = solid accent, hover
       only on devices that can hover) and its measurable criterion;
     - the editing day-state role;
     - the theme sentence (line 82: device default, manual choice per device);
     - a brand sentence (logo and wordmark are brand artwork in fixed colours, with
       documented lighter tints in the dark theme).
   - Replace "Clock in/out" wording with "Check in/out" where docs/04 names the action
     (lines 54 and 67 and others).
2. **`docs/10_DECISIONS_AND_SOURCES.md`**:
   - Add a section "Owner decisions: 2026-10-14 (UI change round 2)". It lists each
     owner request of that day in English, in order. The verbatim Vietnamese stays on
     the board; cite it. It also lists the answers WP5-UX2-Q1 (Today and Current
     period) and WP5-UX2-Q2 (font use for the wordmark as outlines, lighter dark tints).
   - Add a short "Coordinator decisions" list for the round:
     - per-device theme storage with no server setting;
     - the Today and Current period rules;
     - the app-wide hover token;
     - `aria-current` on the open day;
     - the wordmark as outlines with no font file in the repository;
     - the 1440 breakpoint;
     - the on-screen company line removed, with the PDF unchanged;
     - the phone Review short forms;
     - the arrow separator;
     - no check in/out in shared views;
     - the three server message wordings;
     - terminology: "Check in/out" in the UI, while API paths, event types and codes
       keep "clock".
   - Add the carried owner decisions WP5-UX-Q1 and WP5-UX-Q2 of 2026-10-09 (the board
     records them verbatim; the 2026-10-09 coordinator decision carried them to this
     round).
3. **`docs/12_RELEASE_NOTES.md`**:
   - Add one section or bullet group for UI change round 2: what people see, and that
     no business rule, calculation or PDF changed. The only server change is the
     wording of three error messages.
   - State that the release identity is refreshed after this round's gate and audit.
   - Update lines that name "Clock in/out".
4. **`docs/01_PRODUCT_REQUIREMENTS.md`** (FR-06 wording) and
   **`docs/02_TIME_AND_OT_RULES.md`** ("first check-in"): terminology only. No rule
   changes.
5. **`DEVELOPMENT.md`**: the two "Clock" wording lines. Identifiers in commands stay.

Do not change docs/03, docs/05-docs/09 or docs/11 unless a line there names a UI label
that changed. If one does, list it in Results and change it in both languages. Do not
edit `docs/08` (a governance path).

## Checks (in this order; verify and digest are the LAST commands)

1. Put Node 24 first on PATH (with `cygpath -u`), then run `node --version` (must be
   v24.x).
2. Before any edit, record `git rev-parse HEAD`, `git status --short` and
   `npm run digest`.
3. Edit the docs.
4. EN/VI parity per changed pair: the same headings, table rows, list items and links
   (except the translation-pair link). Save a parity record.
5. Grep the changed docs: no remaining "Clock in", "Clock out" or "clocked" for the UI
   action (identifiers such as `/api/clock/in` may stay when they name the API).
6. Run `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence). It must exit 0.
7. Grep your changed files and evidence for email addresses and user-profile paths:
   - only the full synthetic example.invalid form may remain;
   - mask everything else as `<email>` or `<user>`;
   - never write such a token verbatim.
8. Run `npm run verify` with `SMOKE_PORT` in 48690-48709, and with `DATA_DIR` and
   `DATABASE_PATH` both set inside the task folder.
9. Run `npm run digest` LAST. If any file changes after the digest, rerun verify and the
   digest.
10. Copy the masked logs into the evidence folder.

## Owned paths

- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and
  `.vi.md`, `docs/12_RELEASE_NOTES.md` and `.vi.md`, `docs/01_PRODUCT_REQUIREMENTS.md`
  and `.vi.md`, `docs/02_TIME_AND_OT_RULES.md` and `.vi.md`, `DEVELOPMENT.md` and
  `DEVELOPMENT.vi.md`
- Any other docs pair only under the rule above (list it)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX2-T10/` (masked LF `.txt` only)

## Hard constraints

- No source, test, configuration or server change. No governance path (AGENTS.md,
  CLAUDE.md, docs/08, `handoff/prompts/`, `handoff/templates/`, `.claude/`).
- Describe the product as built. Where the code and a plan differ, follow the code (the
  slice records), and list each such case in Results.
- No markdown link to a file that does not exist (preflight checks links).

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`, NOT EVEN TO WRITE A FILE), NO `| node`, NO `| python`, NO
  `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER
  REDIRECT TO OR FROM `/dev/null` OR `nul` (NOT EVEN `2>/dev/null`). NEVER `rm -r` OR
  `rm -rf` ANYTHING. NEVER CREATE LINKS OR JUNCTIONS.** Redirect to a file in the task
  folder and read it with the Read tool. Use the Write and Edit tools for files (no sed,
  no heredoc).
- **Create files only inside the task folder, the evidence folder or your owned paths.**
  Create the task folder first.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX2-T10`. Set TEMP and TMP to it. Use ports
  48690-48709 for anything you start. Never touch `%LOCALAPPDATA%\timesheet-dev` data or
  `B:\Temp\claude`.
- Never kill processes by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit or push. Write no markdown links in Results (paths in
  backticks only).

## Return

At most 150 words, beginning with 'Self-reported model: ...'. Include:
- the files changed, with the line ranges per doc;
- the code-versus-plan differences you followed;
- the parity result;
- the grep result;
- the preflight and verify exit codes;
- the final full 64-hex digest;
- the evidence files;
- the background-task confirmation;
- any deviation.

## Results

Self-reported model: claude-sonnet-5-5.

Base (before any edit): Node v24.21.0; HEAD f70a5c0479b6cc1a0dd10d29f7791157ff29c43d; `git status --short` showed only coordinator files under `handoff/`
(untouched); digest 29ea76dface73cbdece89705c76e34a69c6e56a22e3988c06c9a5a127f3d43f6 (814 files). Log `handoff/delivery/evidence/WP5-UX2-T10/base.txt`.

Files changed (EN and VI always together, same hunks; line ranges are of the new files):
- `docs/04_UX_AND_SETTINGS.md` and `.vi.md`: 7-9 (App shell, Timesheet, Day editor rows), 41, 46, 48, 51, 53-58 (period bar, Today, Current period, phone
  buttons, Check in/out, toolbar), 62 (day editor), 66 (picker look), 70 (Check out/save), 83-87 (hover rule with criterion, editing role, brand, theme).
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`: EN 101 and 132, new sections EN 180-213 / VI 181-214: owner decisions 2026-10-14 (UX2-1..UX2-4 and the answers
  WP5-UX2-Q1, WP5-UX2-Q2, in order), coordinator decisions of the round, carried WP5-UX-Q1 and WP5-UX-Q2 of 2026-10-09 (VI 102 and 133 for the two rewordings).
- `docs/12_RELEASE_NOTES.md` and `.vi.md`: 23 (Check in/out wording), 28-34 (new round-2 bullet group, release identity refreshed only after the gate and audit),
  64 (Check out refusal line).
- `docs/01_PRODUCT_REQUIREMENTS.md` and `.vi.md`: line 14 (FR-06 wording). `docs/02_TIME_AND_OT_RULES.md` and `.vi.md`: line 15 ("first check-in", "Check out").
- `DEVELOPMENT.md` and `.vi.md`: lines 68 and 118 (identifiers `POST /clock/in`, `POST /clock/out` kept).
- No other docs pair changed: docs/03, 05-09 and 11 name no changed UI label (grep for the old labels found only quoted history and unrelated "clock" uses such as NAS clock).

Code (slice records) versus plan, followed as built:
- Wordmark shown from 1440px (plan 1280), the brand-to-menu gap 24px below and 32px from 1440px.
- Theme control is a two-option "Theme" radio group (Light with sun, Dark with moon), not a pressed "Dark mode" button.
- Phone bar heights 60px (112px with the switcher row), not 52/60; check in/out absent in every shared view.
- Review link short forms "Sign off" and "Review" (one line, accessible name the full label); period range arrow with a hidden " to ".
- Wordmark is a capital S plus small capitals as outlines (no font file); Today bar repaired over the head; the Today inactive state uses `aria-disabled`.
- Three server literals recorded as built; the `dist/server` delta also contains one kept comment.
- docs/10 entries E-1 and F-Q5 (older history) were reworded to "Check in/out" for terminology only, instead of being left as the plan suggested, so the wording grep is clean.

Checks:
- Parity (`parity.txt`): headings, table rows, list items and numbered items equal in all six pairs; link targets equal for docs/12 and DEVELOPMENT; for docs/01, 02, 04 and
  10 the only difference is the translation-pair link in the `.vi.md` footer (expected).
- Wording grep (`grep-wording.txt`) for Clock in, Clock out, clocked, clock-in, clock-out (case-insensitive) over the changed docs: only the two quoted old wordings
  "Clock in/out" in the owner request UX2-2 (EN line 187, VI line 188), which is a verbatim-meaning record of the owner's request; no UI-action use remains.
- `validate_package.py --preflight` with the workflow Python (`C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`): exit 0, status PASS,
  109 translation pairs, 2213 local links (`preflight.txt`).
- Privacy grep over the changed files: only the existing full `example.invalid` addresses in DEVELOPMENT; no user-profile path.
- `npm run verify` (SMOKE_PORT 48691, DATA_DIR and DATABASE_PATH inside the task folder): exit 0 (`verify.txt`), no deprecation line.
- `npm run digest` last: 20e7a7c8cd19b811aedfd814b35ead3b9a8d2eab7c9dbdd0b23626a609773fa5 (814 files, handoff/ excluded). Nothing changed under the digest paths after it.

Evidence: `handoff/delivery/evidence/WP5-UX2-T10/` (`base.txt`, `parity.txt`, `grep-wording.txt`, `preflight.txt`, `verify.txt`, `digest.txt`, `status-final.txt`).

Deviations: one grep command used `| head -0` and one `> /dev/null` by mistake (no data involved, nothing read from them); no heredoc, no stdin to an interpreter, no link or
junction, no recursive removal. No background task is running.

Status: done
