# WP5-UX-A11Y-SWEEP dispatch brief

- Status: PENDING the owner's answer to WP5-UX-Q2 (board `pending_owner_question_2`).
  Dispatched only with option (a).
- Mission/task: timesheet-software-readiness / WP5-UX-A11Y-SWEEP; package WP5; kind
  diagnose; attempt 1; depends on WP5-UX-REGATE4 (PASS).
- Purpose: each area-B audit of the UI redesign round found a few new keyboard
  accessibility items (B-02, B3-01, B4-01, B5-01..B5-03). Before the next fix round,
  produce ONE complete, reproducible list of every remaining WCAG 2.2 AA issue in the
  shipped client, so a single fix round can close them all.
- Read-only for source: no edits to `src/`, `tests/`, `docs/`, the board or STATE.
- Profile/routing: timesheet-planner (effort high), requested model opus,
  `model_override_reason` size_risk (a whole-client accessibility diagnosis that decides
  the last fix round; docs/08 rubric). Routing: size L, risk M, novelty no.
- Base: HEAD = origin/main (record it); snapshot 5e104e1 with digest
  07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (record the digest
  before and after).

## Read

- AGENTS.md from disk; docs/04 (EN); `handoff/delivery/WP5_UX_REVIEW_B.md`, `_B2`, `_B3`,
  `_B4`, `_B5` (findings and risks) and `WP5_UX_REVIEW_A5.md`.
- The client: `src/client/` (all screens), `src/client/styles.css`.

## Method

1. Build the app from a clean export of the snapshot and seed synthetic data (both
   `DATA_DIR` and `DATABASE_PATH` inside the task folder).
2. Automated: run axe-core (a dev dependency already in `node_modules` if present;
   otherwise record that it is absent and do not install anything) through Playwright on
   every route (Timesheet, Overtime, History, Settings, Import, Admin, Review, shared
   view, setup) at 1280x800, 1024x800, 768x1024, 390x844 and 320x640, light and dark,
   with the day editor, the label picker, the batch mode, the clock-out dialog and the
   review dialogs open in turn.
3. Manual keyboard walk on the same states: Tab and Shift+Tab through every stop, arrow
   keys in the label picker and lists, Escape in every dialog; for each stop record
   whether the focus indicator is visible with at least 3:1 against the adjacent colours
   (SC 1.4.11, 2.4.7), whether the focused element is at least partly visible and not
   hidden by sticky or fixed content (SC 2.4.11), focus order (SC 2.4.3), dialog focus
   trap and return, target size (SC 2.5.8), reflow at 320px (SC 1.4.10), text contrast
   (SC 1.4.3) and names/roles (SC 4.1.2).
4. Include B5-01, B5-02 and B5-03 as already known; reproduce them.

## Output (append under Results)

- A table of every issue: ID (WP5-UX-AX-nn), WCAG SC, severity (High/Medium/Low), screen
  and viewport/theme, element and file:line, reproduction, and a bounded fix (tokens or
  focused component change), grouped so one worker can fix all in one task.
- Items that are not WCAG 2.2 AA defects go into a separate optional list.
- Raw logs stay in `D:\.claude-tmp\timesheet\WP5-UX-A11Y-SWEEP\`; masked LF `.txt`
  evidence (scripts as `*.mjs.txt` / `*.ts.txt`, screenshots `*-synthetic.png`) in
  `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/`.

## Runtime

- Git Bash only; never cmd.exe; never an interactive shell. Put Node 24 first on PATH
  (with `cygpath -u`) before any node call; first shell call `node --version`.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -e`. NEVER PIPE OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO
  OR FROM `/dev/null` OR `nul`.** Create files only in the task folder and the evidence
  folder. Ports 48240-48259. No install, no Docker.
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively. Stop and report on a permission denial or ENOSPC.

## Owned paths

- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-A11Y-SWEEP/`

## Results

(planner appends here)
