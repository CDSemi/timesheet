# WP5-UX-REGATE5 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-REGATE5; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX7-FREEZE (done).
- Scope: rerun the WP5 package-final gate after WP5-UX-FIX7, the one accessibility fix
  round the owner chose (WP5-UX-Q2, option a). It fixes WCAG 2.2 AA issues
  WP5-UX-AX-01..AX-10 from WP5-UX-A11Y-SWEEP (AX-01..AX-03 = WP5-UX-AUDIT-B5 findings
  B5-01..B5-03) and adds B5 risk R-12. The previous gate WP5-UX-REGATE4 passed on 5e104e1
  (digest 07c3ca00). Between them sit the owner's handoff-only commit 5b349f8 and the FIX7
  freeze.
- Target: `freeze_commit` = bf954c0b371ad9a5fe461a603c5d476ea210e66c (HEAD =
  origin/main). Expected digest of record
  b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files): compute it
  on a clean export of bf954c0 and cross-check with the `git ls-tree` form and
  `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-REGATE4.md` (gate items, method, results and
  evidence). You rerun that method on the new freeze.
- The Results of `handoff/delivery/tasks/WP5-UX-FIX7.md`, the issue table in
  `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md` (Results), and the findings in
  `handoff/delivery/WP5_UX_REVIEW_B5.md`.

## Gate items

1. **Rerun WP5-UX-REGATE4 item 1** on a clean export of bf954c0 with the same method and
   limits (npm ci, lint, verify with deprecation tracing, full e2e both projects with
   per-project counts, AC-13 three times and under `Asia/Tokyo` and `America/New_York`
   through a wrapper, drill `--wp3` with image ID and size and forbidden-file scan,
   compose config forms, env keys, `npm audit --omit=dev`, validators incl.
   check_recovery 106 probes, precommit self-test, business boundary since 014bd47, PDF
   unchanged and pdf-visual passing, scope since 014bd47, contrast in both themes
   including the ring pairs and the new light `--ok` on every light surface with and
   without the selection tint, `npm test` three times, synthetic screenshots, 44px and no
   horizontal scroll at 390, 375, 360 and 320px, including batch mode at 320).
2. **Fix scope.** `git diff --stat 5e104e1..bf954c0` outside handoff/: exactly the 29
   paths listed in `WP5-UX-FIX7-FREEZE.md` ("Expected working-tree set outside handoff/"),
   no server, domain, `src/client/api.ts` or `tests/e2e/fixtures.ts` change, and docs/04
   EN and VI change line 48 only. Confirm 5b349f8 changed nothing outside handoff/. Report
   whether any existing e2e assertion was removed or weakened (compare the changed specs;
   renamed day-button names must be replaced, not dropped).
3. **Observed in the built app** (real key presses, both projects, light and dark;
   reduced motion):
   - AX-01: a Shift+Tab and Tab walk on Timesheet, the day editor, the shared view and
     Settings at 1280, 768, 390 and 320: no focused control entirely hidden under the
     shell bar, the share bar or the editor head; the share bar sits below the shell bar.
     You may reuse the probe scripts stored in `evidence/WP5-UX-FIX7/` or
     `evidence/WP5-UX-A11Y-SWEEP/` (`*.ts.txt`, `*.mjs.txt`), copied to your task folder;
     record counts.
   - AX-02, AX-03, AX-04, R-12: visible focus indicator at least 3:1 against the adjacent
     colour for the label list and its active option, a scrolling dialog and the day
     editor dialog, a pressed toggle with focus, and a date and a time field reached by
     Shift+Tab (desktop).
   - AX-05: the day buttons' accessible names contain their visible text and the ISO date
     (sheet and phone; "View …" when view-only); the sharing row button is "End share with
     {name}"; docs/04 line 48 (EN and VI) describes the same name.
   - AX-06: changing the "Shared with me" choice with the keyboard does not navigate;
     Open navigates to the chosen view; owner-only controls stay hidden in a shared view.
   - AX-07: the wrong-password message and the Timesheet error are announced as alerts;
     the listed notices carry `role=status`.
   - AX-08: after Cancel or Escape, focus returns to the opener for the batch review, the
     sharing change/end steps, import "Review and commit" and the opening-balance steps;
     a step change moves focus to the new step heading; dialog outcomes and requests are
     unchanged (no extra POST/PUT).
   - AX-09: rendered "Complete" text in light theme on a normal and a selected row
     (at least 4.5:1).
   - AX-10: at 320 in batch mode the day cell wraps, nothing overflows, targets stay
     44x44.
   - Earlier fixes still hold: B4-01 (ring at least 3:1 on the REGATE4 controls), B4-02
     (zone note format), B3-01 (review on top across 1280↔1024, Escape order, focus never
     on BODY), B2-01 and R-7 (full date in "Open a day" at 390/375/360/320), B-01 at
     390x844, A-01, B-02, tab order.
4. Screenshots: at most ten `*-synthetic.png`, including the Shift+Tab stop clear of the
   bar, the label picker active option, the switcher with Open, and batch mode at 320.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-REGATE5`. Ports 48280-48299, with
  `SMOKE_PORT` in that range. Set TEMP and TMP to the task folder. Give each parallel
  Playwright run its own output folder (a shared one deleted a trace in FIX7); prefer
  sequential runs.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Give Playwright actions in your probes a short timeout.
- Docker: Compose project `ts-wp5-uxregate5`, non-TTY flags only. At the end, remove the
  drill image by exact tag and the project by name; record
  `docker ps --all --filter name=ts-wp5-uxregate5` (must be empty).
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`, AND NEVER
  USE `< /dev/null` ON A COMMAND.** Write scripts with the Write tool and run them by
  path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence); put Node 24 first on PATH with `cygpath -u` before
  any node call; first shell call `node --version` (v24.x).
- **Create files only inside the task folder and the evidence folder.**
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local mail capture only. Never edit source, docs, tests, the board
  or STATE. Leave nothing running.
- In your Results and evidence never write an email address other than the synthetic
  `@example.invalid` form in full, and never a real profile path (use `<user>`); mask
  probe-truncated addresses as `<email>` (the precommit check blocks them).

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-UX-REGATE5/`, with scripts saved as `*.mjs.txt`,
`*.py.txt`, `*.ts.txt` or `*.sh.txt`, and screenshots as `*-synthetic.png`. Record the
drill image ID (the pilot packet identity refresh uses it). Decide PASS, FAIL or NOT
VERIFIED from actual results; NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model: the decision, the
digest of record (three forms), each gate item result with counts and exit codes, the
observations, the image ID, and the evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze bf954c0b371ad9a5fe461a603c5d476ea210e66c; HEAD = origin/main = the same before and after;
no non-handoff path changed (`nonhandoff-status.txt` empty). Node v24.21.0 portable, Git Bash, workflow Python (user `<user>`) for the
validators. Raw output in the task folder; masked LF evidence in `handoff/delivery/evidence/WP5-UX-REGATE5/` (index `00-README.txt`).
DATA_DIR/DATABASE_PATH in the task folder, SMOKE_PORT 48281; e2e servers and the drill use OS-chosen loopback ports as in earlier gates.

Digest of record `b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563`, 793 files (handoff/ excluded), equal in three forms: clean
`git archive bf954c0` export hashed with `git hash-object --no-filters` (before and after all checks; scratch specs removed), the `git ls-tree`
form, and `npm run digest` in the repository (before and last). Equals the expected value.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci`, `npm run lint`, `npm run verify` | exit 0 x3; verify: 82 files, 1823 tests passed, build, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 1 | `npm run test:e2e` | exit 0; 208 passed, 24 skipped, 0 failed (6.0 min). desktop 103 ok + 13 skipped, mobile 105 ok + 11 skipped; pdf-visual passed (desktop; mobile skips it by design); includes keyboard-access (26 lines) and focus-ring |
| 1 | AC-13 alone x3 | exit 0 x3; 1 test passed each, 0 deprecation lines |
| 1 | AC-13 under real zones (`run-tz.mjs.txt` plus tz probe; machine zone America/Los_Angeles) | Asia/Tokyo: probe `zone=Asia/Tokyo` offset -540, 2 passed, exit 0. America/New_York: probe `zone=America/New_York` offset 300, 2 passed, exit 0 |
| 1 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server, both exit 0, 0 deprecation lines), project `ts-wp5-uxregate5` | exit 0; stages 33/31/57/35/27/23, 208 PASS lines, 0 FAIL; image `sha256:1b7b561e3d6ca29cedd4fc7bb5bc3b2cecd1c8c88a6b86370e9b267c0765caf4` (110014745 B, linux/amd64); forbidden-file scan PASS; no deprecation line in build or container logs |
| 1 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3: live `ts-wp5-uxregate5`, `timesheet:aaaaaaa`, data dir; restored `ts-wp5-uxregate5-restored`, restore dir; rollback `ts-wp5-uxregate5-rollback`, `timesheet:bbbbbbb`, restore dir, `JOB_RUNNER: "off"` |
| 1 | env keys of docs/11 and 12 | 21 keys; only SQLITE_BUSY and WP5_HANDOFF map to none (not env keys, as in earlier gates) |
| 1 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight 0 PASS, validate_orchestration 0 PASS, check_recovery 0 PASS (count 106); precommit self-test exit 0 PASS (35 path, 74 line samples, 12 rules) | validators run in the clean export (committed board and docs at bf954c0) |
| 1 | Business boundary `git diff --stat 014bd47..bf954c0 -- src/server src/domain` | only `src/domain/format.ts`, 13 insertions (unchanged since REGATE4); no server change |
| 1 | PDF unchanged (AC-10) | `git diff --stat 014bd47..bf954c0 -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty (0 bytes) |
| 1 | Scope since 014bd47 outside handoff/ | 80 paths: the 68 of REGATE4 plus 12 new (`22-scope-new.txt`: App.tsx, AdminUsers, ImportCommit, OpeningBalanceForm, OpeningBalancePanel, SharingBar, SharingGrantForm, SharingRows, SharingSwitcher, useBlockSize.ts, tests/e2e/dayButton.ts, tests/e2e/keyboard-access.spec.ts) |
| 1 | Contrast, both themes (`contrast5.mjs.txt`, `40-contrast.txt`) | all text pairs at least 4.5:1; ring pairs light/dark 6.09/6.79 (card), all ring pairs at least 3:1; new light `--ok` #136a42 on card/bg/off/sheet-head/sheet-head-off/non-working/attention-bg plain 6.63/6.18/5.85/5.69/5.29/5.91/6.07 and with the selection tint 5.82/5.45/5.17/5.03/4.69/5.22/5.34 (lowest 4.69, all at least 4.5); dark `--ok` unchanged. Only the two non-text `--sheet-rule-strong` on card pairs (2.86, 2.97) stay under 3:1 (decorative table rule, informational, unchanged since earlier gates) |
| 1 | `npm test` x3 | exit 0 x3; each 82 files, 1823 tests passed; worker/crash lines 0 |
| 1 | 44px and no horizontal scroll at 390/375/360/320 (`obs-targets.txt`, the REGATE4 probe on the new build, 16 checks passed) | timesheet 41, batch 46, editor 53, Review 8 controls at every width; 0 below 44x44 and scrollWidth = innerWidth at all four widths, batch mode at 320 included (also `obs-ax10.txt`: 14 rows, 0 problems at 390 and 320; the only small elements are the 18.75px checkboxes inside their 44x44 `label.pick` targets) |
| 2 | Fix scope `git diff --stat 5e104e1..bf954c0` outside handoff/ (`22a-fixround.txt`, `22a-names.txt`) | exactly the 29 paths of the FIX7-FREEZE list (26 modified, 3 new: `useBlockSize.ts`, `dayButton.ts`, `keyboard-access.spec.ts`); `22e-forbidden.txt` empty (no `src/server`, `src/domain`, `src/client/api.ts` or `tests/e2e/fixtures.ts` change); docs/04 EN and VI: one hunk each, line 48 only (`22d-docs04.txt`) |
| 2 | Commit 5b349f8 (`22b-5b349f8.txt`) | author huysrc; 6 files, all under handoff/ (ORCHESTRATION.json, checkpoint pair, CKPT3 task and its two evidence files); 0 paths outside handoff/ |
| 2 | Existing e2e assertions removed or weakened? (`24-removed.txt`, `25-spec-assertions.txt`) | No. 15 removed lines (5 with expect), each a renamed day-button assertion replaced by the same assertion on the same row element through `namedDayButton` (row `data-day` + `data-day-button` + name regex; stricter), or an import line; 105 added expect lines; 4 added `test.skip` are project-specific skips inside new tests |
| 3 | AX-01 (`obs-ax01.txt`; real Tab and Shift+Tab walks, light and dark, reduced motion; desktop project at 1280 and 768, mobile project at 390 and 320; Timesheet, Settings, shared view, day editor) | 4 widths x 2 themes x 4 screens x 2 directions = 64 walks; stops per width 259 (desktop) and 253 (phone) summed over 8 walks; hidden stops 0 in all; minimum visible sample points of a stop 20 of 25 (never 0). Share bar: desktop sticky, top 56.0 = shell bottom 56.0 at 1280 and 100.0 = 100.0 at 768 when scrolled; at the top 72 vs 56 and 116 vs 100; phone share bar is static, 122.8 below the shell bottom 106.8 at the top and scrolls away |
| 3 | AX-02, AX-03, AX-04, R-12 (`obs-rings.txt`, `obs-rings-c.txt`; ring against the adjacent colour from the computed shadow) | light / dark: label list outset 3 px 6.09 / 6.79; active option inset 2 px 5.35 / 5.29 (on its tint); day editor dialog as the keyboard stop (scrolls, Shift+Tab from Close), inset 2 px 6.09 / 6.79 (both projects); pressed toggles "Show details" and "Change several days": pressed+focus differs from pressed only, outer ring 6.09 / 6.79; date field "Open a day" after Shift+Tab 6.09 / 6.79; time field of the new-session form after Shift+Tab (`:focus-within`) 6.09 / 6.79. All at least 3:1 |
| 3 | AX-05 (`obs-ax05.txt`) | sheet 14/14 and phone 14/14 buttons named "{verb} {visible text} (ISO date)", e.g. "Edit 09/28 (2026-09-28)" and "Edit Mon 09/28 (2026-09-28)"; shared view-only "View ..." 14/14 on both; sharing row button visible "End share", name "End share with {name}". docs/04 line 48 EN and VI both give "Edit {MM/DD} ({date})" and "Edit {weekday} {MM/DD} ({date})", "View" when read-only; the "End share with" name is not in docs/04 (not required by line 48) |
| 3 | AX-06 (`obs-ax06.txt`) | ArrowDown on "Shared with me" sets the choice, URL stays `#/timesheet`, no share bar, 0 non-GET requests; Tab to Open, Enter navigates to `#/shared/{owner}` with the share bar and "{name}'s timesheet"; owner-only controls (Clock in/out, Change several days, Open day, Preview, Select all, Clear, checkboxes, label pickers) all 0 in the shared view; both projects |
| 3 | AX-07 (`obs-ax07.txt`) | wrong password: one `role=alert` "Email or password is incorrect"; Timesheet action failure (clock-in answered 500 by a route mock): `role=alert` with the error text; share form "None": `role=status` "Turn on at least one shared item."; sharing change step with every item off: `role=status` (count 1). The administrator new-user notice and the Settings policy notice were not reached (`#/admin` form not found by my selector): source and built-bundle only for those two (`role="status"` in AdminUsers.tsx:103 and SettingsScreen.tsx:180), not observed |
| 3 | AX-08 (`obs-ax08.txt`, `6-final-b2.txt`; real keys, both projects) | batch review: Escape and Cancel return focus to "Preview changes"; Review conflicts moves focus to the step heading, Back to the review heading; only `POST /api/days/batch mode=preview` requests (one per opening), stored day unchanged. Sharing: End share and Leave confirmation takes focus; Escape and Cancel return to the opener; Change step takes focus, Cancel returns to Change (Escape in the change step does nothing; not specified, informational); 0 non-GET requests. Import: "Back to the preview" returns to "Review and commit", 0 requests after the upload. Opening balance: "Back to edit" and Escape return to "Review before posting" (values kept), correction Cancel returns to "Correct the opening balance", 0 requests |
| 3 | AX-09 (`obs-ax09.txt`) | rendered "Complete" in light: normal row 6.63:1 on #ffffff; selected row 5.82:1 (desktop, #ebf1f9) and 5.17:1 (phone, #dbe4f0) |
| 3 | AX-10 (`obs-ax10.txt`, screenshot) | at 320 and 390 in batch mode: 14 rows, day button inside its cell and clear of the label cell, selection targets 44x44, scrollWidth = innerWidth, no overflow |
| 3 | Earlier fixes still hold (`obs-b4.txt`, `obs-b3.txt`, `obs-r7.txt`, `obs-desktop.txt`, `obs-phone.txt`) | B4-01: ring 6.09 (light) / 6.79 (dark) on top-bar link, period button, Clock in, Review link, sheet day button, phone tab (inset form); label picker trigger inset 2 px. B4-02: zone note "Wed 10/14/2026, 07:00" (viewing zone Asia/Saigon, bar "Due Tue 10/13/2026, 17:00 (America/Los_Angeles)"). B3-01: review modal, focused and on top across 1280 to 1024 and back, first Escape closes only the review (only the preview POST, stored category Worked), second Escape closes the editor with focus on the day's button; path B first Escape leaves focus on the label picker (as asserted by the fix); editor-only path modal exactly below 1200. B2-01/R-7: full date unclipped at 390 (146.2 px), 375 (131.2), 360 (220.0), 320 (180.0), with and without the note, no horizontal scroll. B-01 at 390x844: first row bottom 757.97 (note) and 659.02 (no note) against tab bar top 788 (same as REGATE4; 375/360/320 informational). A-01 (both projects): "2-"/30 and 4/"3-" show a visible `role=alert`, `aria-invalid` on the offending field only, 0 PUT; 2 h 30 m one PUT (150); empty fields one PUT (0) as before. B-02 (desktop): 1024 and 768 `:modal`, 140 Tab/Shift+Tab presses with focus under the panel 0; 1280 not modal. Tab order previous, next, review in both projects |
| 4 | Screenshots | 10 `regate5-*-synthetic.png`: Shift+Tab stop clear of the bar (390, light), label picker active option (light, dark), switcher with Open (320), batch rows (320), editor dialog ring (desktop, light), pressed toggle with focus, time field ring, AX-08 step heading and sharing focus |

Cleanup: drill image `ts-wp5-uxregate5-timesheet:drill` removed by exact tag (untagged and deleted), `docker compose -p ts-wp5-uxregate5 down -v` exit 0 (nothing left to remove);
final `docker ps --all --filter name=ts-wp5-uxregate5` empty (`15-docker-ps.txt`), no image of the project left (`15-docker-images-after.txt`). No process left running. Nothing committed, sent or
edited outside this brief and the evidence folder; no source, docs, tests, board or STATE edited.

Process notes: the first probe runs had probe-side defects (listed in `00-README.txt`), fixed in the scratch probes only; two Playwright runs overlapped briefly in separate output folders; two
slips against the runtime rules (one `head -c 0 /dev/null 2>/dev/null` and one `| head -n 0`; no real file touched). NAS target NOT VERIFIED (owner steps, docs/11 sections 13-16). The
administrator new-user and Settings policy `role=status` notices were not observed in the built app (source only). Failing items: none.

Status: done
