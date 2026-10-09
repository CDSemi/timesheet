# WP5-UX-T06 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-T06; package WP5; kind
  documentation; attempt 1; depends on WP5-UX-T05-FREEZE (done, 6cbe5d6).
- Scope: slice 6 (last) of the owner-requested UI redesign: **the canonical documents
  describe the shipped UI**. English is authoritative; each change has its matching
  Vietnamese translation in the `.vi.md` pair.
  1. `docs/04_UX_AND_SETTINGS.md` (+ `.vi.md`): the screens table and the visual standard
     as shipped by T01-T05: the shell (desktop navigation Timesheet, Overtime, History,
     Settings, + Admin; phone bottom tab bar with More; Import reached from Settings and
     More), the Excel-form Timesheet sheet (rows Day, Date, Label, Time, OT, Check;
     "Show details" rows; Overtime Total; signature lines without image; phone 4-column
     week tables), the period bar and clock panel, batch mode, the day editor (side panel
     on desktop, bottom sheet on phones, in-cell label picker through a one-entry batch
     preview, hours + minutes leave input, one-tap break confirmation), the Review
     (read-only sheet plus checklist), the formats (US dates, h:mm, 24-hour, as on the
     PDF), the non-working-day tint, and the token-based visual standard (4px radius,
     shared 300ms ease-out transition, layered soft shadows, 44px touch targets).
     Replace text that described the removed grid/day list, the old header and the modal
     editor; keep every rule that still holds.
  2. `docs/10_DECISIONS_AND_SOURCES.md` (+ `.vi.md`): a new section "Owner decisions —
     2026-10-08 (UI redesign, WP5-UX-PLAN E-1..E-7)" recording the owner's request and
     the answer "OK theo khuyến nghị" (all recommendations, as listed in the board
     `owner_decisions` entry of 2026-10-08), and that the Excel formulas listed in
     WP5-UX-PLAN section B as conflicting with the canonical rules are not reproduced
     (the app shows the server's values, as on the PDF). Follow the style of the existing
     owner-decision sections.
  3. `docs/12_RELEASE_NOTES.md` (+ `.vi.md`): an entry for the UI redesign (what users
     see: the Excel-form Timesheet, new navigation, period bar and clock, day editor,
     Review). Do NOT state a release commit, digest or image identity; the release
     identity is refreshed after the gate and the independent audit.
- Profile/routing: timesheet-worker (effort medium), requested model sonnet, no override.
  Routing: size S, risk L (documentation only), novelty no. Task record in English.
- Base: HEAD = origin/main = 6cbe5d6aa7fc9233b70e8ddcd82412e559c2046b; source digest
  0071a58848ecf62e0eca19c1e94db6a76116c9043d4cb5bcc2859b45a0f4f6d9. Record both before you
  start. Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Read

- AGENTS.md from disk first (rules 1 and 8: English authoritative, matching `.vi.md`;
  flag real contradictions, never silently change business behaviour).
- `handoff/delivery/tasks/WP5-UX-PLAN.md` Results sections B, C, E and G, and the
  Results of `WP5-UX-T01.md` to `WP5-UX-T05.md` (what actually shipped; the code is the
  source of truth where a result is unclear: read the client files, do not edit them).
- The current docs/04, docs/10 and docs/12 in both languages, to match their structure
  and tone.

## Rules

- Describe only what shipped; if the plan and the code differ, follow the code and note
  the difference in Results.
- No business rule changes. If you find a real contradiction between a canonical rule
  and the shipped UI, do not resolve it: record it in Results and stop editing that
  sentence.
- Keep the EN and VI files in parity (same sections, same facts). Vietnamese text is
  natural Vietnamese, with UI labels kept in their English form as they appear in the
  app.
- Do not add links to files that do not exist; do not put example links in link syntax.
- No personal data, real addresses or credentials.

## Owned paths

- `docs/04_UX_AND_SETTINGS.md`, `docs/04_UX_AND_SETTINGS.vi.md`
- `docs/10_DECISIONS_AND_SOURCES.md`, `docs/10_DECISIONS_AND_SOURCES.vi.md`
- `docs/12_RELEASE_NOTES.md`, `docs/12_RELEASE_NOTES.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX-T06/` (masked LF `.txt` only)

Read-only: everything else. If another file must change, stop and report it.

## Checks (verify and digest are the LAST commands)

1. `node --version` (v24.x) as the first shell call.
2. EN/VI parity: list each changed section in both languages in Results.
3. The documentation preflight: `validate_package.py --preflight` by its script path,
   with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`
   (write `<user>` in the evidence). It checks links and translation pairs.
4. A Grep over the changed docs for user-profile paths and email addresses; record the
   counts.
5. `npm run verify` with `SMOKE_PORT` in 47860-47869 and `DATA_DIR` and `DATABASE_PATH`
   set inside the task folder (docs-only change; it must still pass).
6. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
7. Copy masked logs of steps 3, 5 and 6 into the evidence folder.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -` OR `python -`.**
  Nine slips so far in this mission. Use the Write and Edit tools for files.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`
  and run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder `D:\.claude-tmp\timesheet\WP5-UX-T06`: set TEMP and TMP to it. Raw logs stay
  there; copy only masked logs into the evidence folder.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove anything
  recursively. Never write into the repository root.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool and finish with "Status: done". Do not commit or
  push. The next step is a freeze commit, then the gate and the independent audit.

## Return

At most 150 words, beginning with 'Self-reported model: ...': files changed, sections
added or rewritten per file, EN/VI parity, any plan/code difference or contradiction
found, preflight and verify exit codes, the final digest, the evidence files, the
background-task confirmation, and any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5. Base HEAD 6cbe5d6aa7fc9233b70e8ddcd82412e559c2046b, start digest as briefed.
Node v24.21.0 (first shell call gave the system Node v26; Node 24 put first on PATH for every later call).

Files changed (docs only): `docs/04_UX_AND_SETTINGS.md` + `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` + `.vi.md`,
`docs/12_RELEASE_NOTES.md` + `.vi.md`, this Results section, `handoff/delivery/evidence/WP5-UX-T06/`.

EN/VI parity (same sections and facts in both languages):
- docs/04: Screens table (rows added: App shell; rewritten: Timesheet, Day editor, Review; renamed OT ledger/leave to
  Overtime); new sections "Timesheet sheet" / "Bảng Timesheet", "Period bar, clock and batch mode" / "Thanh kỳ, đồng hồ
  và chế độ nhiều ngày", "Day editor" / "Sửa ngày (Day editor)"; "Visual standard" / "Chuẩn hình ảnh" rewritten as
  tokens, radius, shadows, shared transition, buttons, 44px targets, day-state roles. Unchanged: proposed defaults,
  "Editing and review", email/PDF text, the sentence "Display current viewing zone and saved accounting date".
- docs/10: new section "Owner decisions — 2026-10-08 (UI redesign, WP5-UX-PLAN E-1..E-7)" / "Quyết định của chủ —
  2026-10-08 (...)" with E-1..E-7, the not-reproduced Excel formulas and the audit consequence.
- docs/12: new "WP5 change round, UI redesign" bullet under Scope by package (both languages); no release commit,
  digest or image identity.

Plan/code differences followed from the code: manager line shows "Not used yet" with an empty date; row label is
"OT (h:mm)"; the zone facts show only when display and reporting zones differ (the reporting zone is always named in
the due text); Import is a link in Settings on the desktop and a More entry on phones; phone column split and the
picker/one-tap behaviours as in the T04 Results.

Possible contradiction, recorded and NOT resolved: docs/04 "Display current viewing zone and saved accounting date"
versus the shipped period bar, which shows the display zone only when it differs from the reporting zone (session
times are always in the display zone). I left that sentence unedited; the new section states the shipped behaviour.
The owner may confirm that this reading satisfies the rule.

Checks:
| Check | Result |
|---|---|
| `validate_package.py --preflight` (workflow Python `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`, script path) | exit 0, PASS, 92 translation pairs, 2113 local links |
| Grep for profile paths / emails over the six docs | profile paths 0, emails 0 (one pre-existing `/users/` API path in docs/10 line 118, not mine) |
| `npm run verify` (SMOKE_PORT 47861, DATA_DIR and DATABASE_PATH under the task folder) | exit 0, SMOKE PASSED |
| `npm run digest` (last, no file changed after it) | exit 0, 46a3a0c6436eb0cc2d4eb243cbff5956b0886455780444944a3cfce79a3b7abb (789 files, handoff/ excluded) |

Evidence: `handoff/delivery/evidence/WP5-UX-T06/preflight.txt`, `verify.txt`, `digest.txt` (masked, LF).
No heredoc, stdin script, cmd.exe, background task, PID kill or recursive removal was used; no background task of mine
is running. No commit or push.

Status: done
