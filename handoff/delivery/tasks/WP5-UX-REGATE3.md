# WP5-UX-REGATE3 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-REGATE3; package WP5; kind gate;
  attempt 1; depends on WP5-UX-FIX5-FREEZE (done).
- Scope: rerun the WP5 package-final gate after WP5-UX-FIX5, which answered
  WP5-UX-AUDIT-B3 findings B3-01 (the label-change review lost the top layer, Escape and
  focus when the window crossed 1200px) and B3-02 (docs/04 line 55), with O-5 and R-7.
  The previous gate WP5-UX-REGATE2 passed on a2ea7a4 (digest 0b8428fd).
- Target: `freeze_commit` = edaaa852370128ca9bdf206d730f3849346ba994 (HEAD =
  origin/main). Expected digest of record
  b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873: compute it on a clean
  export of edaaa85 and cross-check with the `git ls-tree` form and `npm run digest`.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (package-final snapshot), novelty no. Records in English.

## Read

- AGENTS.md from disk first.
- `handoff/delivery/tasks/WP5-UX-REGATE2.md` (gate items, method, results and
  evidence). You rerun that method on the new freeze.
- The Results of `WP5-UX-FIX5.md` and the findings in `WP5_UX_REVIEW_B3.md`.

## Gate items

1. **Rerun WP5-UX-REGATE2 item 1** on a clean export of edaaa85 with the same method and
   limits (npm ci, lint, verify with deprecation tracing, full e2e both projects with
   per-project counts, AC-13 three times and under `Asia/Tokyo` and `America/New_York`
   through a wrapper, drill `--wp3` with image ID and size and forbidden-file scan,
   compose config forms, env keys, `npm audit --omit=dev`, validators incl.
   check_recovery 106 probes, precommit self-test, business boundary since 014bd47, PDF
   unchanged and pdf-visual passing, scope since 014bd47, contrast in both themes,
   `npm test` three times, synthetic screenshots, 44px and no horizontal scroll at 390,
   375, 360 and 320px).
2. **Fix scope.** `git diff --stat a2ea7a4..edaaa85` outside handoff/: only
   `src/client/DayEditor.tsx`, `src/client/styles.css`, `tests/e2e/day-editor.spec.ts`,
   `tests/e2e/timesheet.spec.ts` and docs/04 (EN and VI). Record the DayEditor diff.
3. **Observed in the built app:**
   - B3-01: at 1280x800 open a day, pick "Off" in the Label cell of a worked day so the
     review opens, resize to 1024x800: the review stays on top and focused; the first
     Escape closes only the review (nothing saved) with the editor still open and focus
     inside it; the next Escape closes the editor and focus returns to the day's button.
     Also the reverse (1024 to 1280 with the review open) and a resize with only the
     editor open (modal below 1200px, side panel from 1200px).
   - B3-02: docs/04 line 55 (EN and VI) says "Open a day" opens any date.
   - R-7: the "Open a day" field shows the full date at 390, 375, 360 and 320px; record
     the first `[data-day]` bottom at each width with and without the zone note against
     the tab bar top (the rule promises 390x844).
   - Earlier fixes still hold: A-01 refusal with no PUT; B-02 focus never hidden below
     1200px; tab order; B-01 at 390x844.
4. Screenshots: at most ten `*-synthetic.png`, including the review on top at 1024px
   after the resize.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-REGATE3`. Ports 48110-48129, with
  `SMOKE_PORT` in that range. Set TEMP and TMP to the task folder.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Docker: Compose project `ts-wp5-uxregate3`, non-TTY flags only. At the end, remove the
  drill image by exact tag and the project by name; record
  `docker ps --all --filter name=ts-wp5-uxregate3` (must be empty).
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head`
  OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Write scripts with the
  Write tool and run them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
  (write `<user>` in the evidence); put Node 24 first on PATH before any node call; first
  shell call `node --version` (v24.x).
- **Create files only inside the task folder and the evidence folder.**
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Synthetic data and local mail capture only. Never edit source, docs, tests, the board
  or STATE. Leave nothing running.

## Output

Write your results into this file with the Edit tool. Put masked LF `.txt` evidence in
`handoff/delivery/evidence/WP5-UX-REGATE3/`, with scripts saved as `*.mjs.txt`,
`*.py.txt`, `*.ts.txt` or `*.sh.txt`, and screenshots as `*-synthetic.png`. Record the
drill image ID (the pilot packet identity refresh uses it). Decide PASS, FAIL or NOT
VERIFIED from actual results; NAS items stay NOT VERIFIED.

Return at most 200 words, beginning with your self-reported model: the decision, the
digest of record (three forms), each gate item result with counts and exit codes, the
observations, the image ID, and the evidence files.

## Results

### Verifier result (attempt 1) - decision: PASS (NAS items NOT VERIFIED)

Self-reported model: claude-sonnet-5-5. Freeze edaaa852370128ca9bdf206d730f3849346ba994; HEAD = origin/main = the same before and
after (no non-handoff path changed since the freeze). Node v24.21.0 portable, Git Bash, workflow Python (user `<user>`) for the
validators. Raw output `D:\.claude-tmp\timesheet\WP5-UX-REGATE3`; masked LF evidence in
`handoff/delivery/evidence/WP5-UX-REGATE3/` (index `00-README.txt`). DATA_DIR/DATABASE_PATH in the task folder; SMOKE_PORT 48111;
e2e servers and the drill use OS-chosen loopback ports as in earlier gates. `%LOCALAPPDATA%\timesheet-dev` not written (portable Node read only).

Digest of record `b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873`, 789 files (handoff/ excluded): equal in three
forms: clean `git archive edaaa85` export hashed with `git hash-object --no-filters` (before and after all checks; scratch specs and
tz probe removed, same file list), the `git ls-tree` form, and `npm run digest` in the repository (run last). Equals the expected value.

| # | Item | Result |
|---|---|---|
| 1 | `npm ci`, `npm run lint`, `npm run verify` | exit 0 x3; verify 82 files, 1820 tests passed, SMOKE PASSED; with `--trace-deprecation --pending-deprecation`: 0 deprecation lines in ci, lint, verify |
| 1 | `npm run test:e2e` | exit 0; 170 passed, 16 skipped (5.4 min). desktop 84 ok + 9 skipped, mobile 86 ok + 7 skipped; 0 deprecation lines |
| 1 | AC-13 alone x3 | exit 0 x3; 1 test passed each; 3.57 s, 3.64 s, 3.68 s |
| 1 | AC-13 under real zones (`run-tz.mjs.txt` plus probe; machine zone America/Los_Angeles) | Asia/Tokyo: probe `zone=Asia/Tokyo`, offset -540, 2 passed, exit 0. America/New_York: probe `zone=America/New_York`, offset 300, 2 passed, exit 0 |
| 1 | drill `--wp3` (`git archive 49651c8` + npm ci + build:server, both exit 0), project `ts-wp5-uxregate3` | exit 0; stages 33/31/57/35/27/23 = 208 PASS, 0 FAIL; image `sha256:1332b6d5ac7bbbc127b0b64f56814373088e989508137f6760640a7d5abc6af2` (110013657 B, linux/amd64); forbidden-file scan PASS |
| 1 | `docker compose config` live, restored, rollback (synthetic scratch project, no container) | exit 0 x3: live `ts-wp5-uxregate3`, `timesheet:aaaaaaa`, `<task>/cfgproj/data`; restored `ts-wp5-uxregate3-restored`, restore dir; rollback `ts-wp5-uxregate3-rollback`, `timesheet:bbbbbbb`, restore dir, `JOB_RUNNER: "off"` |
| 1 | env keys of docs/11 and 12 | 21 keys; only SQLITE_BUSY and WP5_HANDOFF map to none (not env keys, same as earlier gates) |
| 1 | `npm audit --omit=dev` exit 0 (0 vulnerabilities); validate_package --preflight 0 PASS, validate_orchestration 0 PASS, check_recovery 0 PASS (count 106); precommit self-test exit 0 PASS (35 path, 74 line samples, 12 rules) | validators run in the clean export (committed board and docs at edaaa85) |
| 1 | Business boundary `git diff --stat 014bd47..edaaa85 -- src/server src/domain` | only `src/domain/format.ts`, 13 insertions; no server change (`20-bound-stat.txt`) |
| 1 | PDF unchanged (AC-10) | `git diff --stat 014bd47..edaaa85 -- src/server/pdf tests/e2e/pdf-visual.spec.ts` empty (0 bytes); pdf-visual passed in the e2e run (desktop; mobile skips it by design) |
| 1 | Scope since 014bd47 outside handoff/ | 67 paths (`22-scope.txt`), same count as WP5-UX-REGATE2; this fix round adds nothing outside src/client, docs/04 and tests/e2e |
| 1 | Contrast (`contrast.mjs.txt`, `40-contrast.txt`) | output identical to WP5-UX-REGATE2: all text pairs at least 4.5:1; only the two non-text `--sheet-rule-strong` on card pairs (light and dark) are under 3:1 (decorative table rule, informational) |
| 1 | `npm test` x3 | exit 0 x3; each 82 files, 1820 tests passed; native worker crash lines 0 in all three |
| 1 | 44px and overflow at 390/375/360/320 (`obs-targets.txt`, scratch spec, 12 passed in the mobile project) | timesheet 41, batch 46, editor 53, Review 8 controls; 0 below 44x44 and scrollWidth = innerWidth at all four widths (16 states) |
| 2 | Fix scope `git diff --stat a2ea7a4..edaaa85` outside handoff/ (`22a-fixround.txt`) | 6 files, 191 insertions, 13 deletions: docs/04 EN and VI (1 line each), `src/client/DayEditor.tsx` (+27/-6), `src/client/styles.css` (2 lines: `--date-field-min` 9.5rem to 8.5rem, `--open-day-label-min` 15.25rem to 14.25rem), `tests/e2e/day-editor.spec.ts` (+120), `tests/e2e/timesheet.spec.ts` (+43/-). Nothing else. DayEditor diff (`23-fix-src-diff.txt`): new helper `otherModalOpen`; the mode-switch effect defers re-showing the editor while another modal dialog is open, using a MutationObserver on `open` that applies the switch once none is left; cleanup disconnects it |
| 3 | B3-01 (`obs-b3.txt`, desktop project, 800 px high) | Path A (1280 to 1024, review open): at 1024 the review is `:modal`, holds focus (Cancel), is on top at its centre; the editor (x=612) is not on top and has no focus. First Escape: only the review closes, editor stays (now `:modal`, focus on its heading), stored category of the worked day still Worked, only the preview POST ever sent. Second Escape: editor closes, focus on the day's button. Path B (1280 to 1024 to 1280): the review stays modal, focused and on top at both 1024 and 1280. First Escape: only the review closes; the editor stays as the non-modal panel (x=824) and focus is back on the picker that opened the review (`Label for 2026-10-07`), not inside the panel (the fix's own asserted behaviour for the wide layout); stored category Worked, only the preview POST. Second Escape: editor closes, focus on the day's button. Path C (only the editor open): 1280 non-modal at x=824, 1024 modal, 1280 non-modal, 768 modal, 1200 non-modal (x=784), 1199 modal; always one dialog, on top, focus inside it; Escape closes and focus returns to the day's button |
| 3 | B3-02 | docs/04 line 55 EN: `"Open a day" (any date, also outside the displayed period)`; VI: `"Open a day" (mọi ngày, kể cả ngoài kỳ đang hiển thị)` |
| 3 | R-7 (`obs-r7.txt`, mobile project, value 2026-10-09) | Field width and clip (scrollWidth vs clientWidth): 390: 146.2 px, 144/144; 375: 131.2 px, 129/129; 360: 220.0 px, 218/218; 320: 180.0 px, 178/178; none clipped, page scrollWidth equals width at all four, `--date-field-min` 127.5 px; same with and without the zone note. First `[data-day]` bottom against tab bar top 788 at height 844: with note 390: 757.97 (ok), 375: 775.36 (ok), 360: 827.36 (below), 320: 924.92 (below); without note 390: 659.02 (ok), 375: 676.41 (ok), 360: 728.41 (ok), 320: 791.19 (3 px below). Only 390x844 is promised and was asserted (both variants pass); 375, 360 and 320 are informational |
| 3 | Earlier fixes | A-01 (both projects): "2-" with minutes 30 and hours 4 with "3-": visible `role=alert` "Enter leave as whole hours (0 to 24) and minutes (0 to 59), at most 24h 00m.", `aria-invalid` on the offending field only, 0 PUT, stored 0; valid 2 h 30 m: one PUT with `leave_minutes:150`; empty fields: PUT 0. B-02 (desktop): 1024 and 768 `:modal` true, 140 Tab/Shift+Tab presses with focus under the panel 0 and outside 0, Escape returns focus to the day's button; 1280 not modal, focus under panel 0. Tab order previous, next, review in both projects. B-01 at 390x844: bottom 659.02 (no note) and 757.97 (note) at or above the tab bar top 788 |
| 4 | Screenshots | 10 `*-synthetic.png` kept: review on top at 1024 after the resize, review on top at 1280 after the return, "Open a day" row at 390/375/360/320 (no note), first screens (note at 390, no note at 320), editor at 1024, phone timesheet |

Cleanup: drill image `ts-wp5-uxregate3-timesheet:drill` removed by exact tag (untagged and deleted), project `ts-wp5-uxregate3` down -v
(exit 0); final `docker ps --all --filter name=ts-wp5-uxregate3` empty (`15-docker-ps.txt`); no image, volume or network of the project remains.
No process left running. Nothing committed, sent or edited outside this brief and the evidence folder. Slips (no real file touched): one
`git archive --help` with `>/dev/null 2>&1` and one `tail -n 0 /dev/null 2>&1 | true`, both no-ops against the /dev/null rule. NAS target NOT VERIFIED
(owner steps, docs/11 sections 13-16). Failing items: none.

Status: done
