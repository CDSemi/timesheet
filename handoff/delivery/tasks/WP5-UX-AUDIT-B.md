# WP5-UX-AUDIT-B dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-B; package WP5; kind audit;
  attempt 1; depends on WP5-UX-GATE (PASS).
- Area B of the independent re-audit of WP5 after the owner-requested UI redesign:
  **UX fidelity to the owner's request, accessibility, test strength, UI standards and
  documentation**. Area A (business integrity, zones, edit paths, sharing, privacy) runs
  in parallel in a separate context; do not coordinate with it. WP5 is re-accepted only
  if both areas PASS.
- `reviewed_commit` = 831f760838950a59f0e5c880f0bbefda15fe0c61 (the WP5-UX-GATE
  `freeze_commit`); digest of record
  3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9. HEAD = origin/main =
  5beae2f668d15fc77a39b91a91e2c8bb6195d65a adds handoff records only. Audit a clean
  export (or a scratch clone) at 831f760; record the digest before and after.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author: WP5-UX-PLAN, T02 and T04 ran on opus). Routing: size L, risk M,
  novelty no.
- Fresh context: you authored none of WP5-UX-PLAN, T01-T06, FIX1 or the gate, and ran no
  earlier audit of this round. Do not rely on the authors' or the verifier's summaries
  as proof: inspect and reproduce.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_B.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk, especially "Unified Frontend & UI/UX Standards" and rules 1, 8 and
  11.
- The owner request and answers in the board `owner_decisions` of 2026-10-08 and in
  docs/10 (EN and VI), and `handoff/delivery/tasks/WP5-UX-PLAN.md` (sections B, C, E, F,
  G) with the mockup `handoff/delivery/design/WP5-UX/mockup.html`.
- docs/04 (EN and VI), docs/12 (EN and VI), docs/06 (UI-related criteria).
- The Results of WP5-UX-T01..T06, WP5-UX-FIX1 and WP5-UX-GATE, with their screenshots.
- The diff `014bd47..831f760` of `src/client/`, `tests/` and `docs/`.

## Scope

1. **Owner request met.** The Timesheet page follows the Excel timesheet layout as the
   plan maps it (header block, two Monday-Sunday week bands, rows Day, Date, Label, Time,
   OT plus Check, "Overtime Total :", signature lines) and the answers E-1..E-7 as
   recommended; the phone layout matches E-1/E-3; the navigation matches E-5. List any
   deviation from the approved direction with its evidence.
2. **Test strength.** For every e2e and unit file changed since 014bd47, list each
   assertion that was removed, loosened or replaced, and judge whether the replacement
   is at least as strong (pay special attention to the review per-day checks, the
   tap-target loops that now filter visible controls, and the day-editor status texts).
   A weakened assertion is a finding.
3. **Accessibility.** Keyboard order Mon..Sun week 1 then week 2; accessible names
   ("Edit {date}", "Day editor", status texts); hidden row names; side panel focus on
   open, Escape, focus return; bottom sheet focus trap; status never by colour alone;
   44px targets on the phone; no horizontal scroll at 390px; contrast (the gate measured
   text pairs at >= 4.65 and the non-text `--sheet-rule-strong` line at 2.86 / 2.97:
   judge whether that line is required to understand the sheet under WCAG 1.4.11).
   Probe at least the focus behaviour yourself.
4. **UI standards.** Tokens only (no hard-coded colour, radius, shadow or duration
   outside the token block), `--radius: 4px`, the shared 300ms ease-out transition,
   layered soft shadows, reduced-motion rules, system fonts only (CSP). No deprecated
   API (lint `no-deprecated` passes; check for runtime deprecation warnings).
5. **Documentation.** docs/04, docs/10 and docs/12 describe the shipped UI accurately,
   with EN/VI parity; the viewing-zone rule (docs/04 line 16) is satisfied; docs/12 has no
   release identity.
6. **Mandatory checks, run yourself:** typecheck, lint, `npm test`, and the FULL e2e
   suite on both projects; record counts.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B` (set TEMP and TMP to it). Ports
  47930-47949 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the task
  folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`. No
  Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.**
  Write scripts with the Write tool and run them by path; python only as the workflow
  Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  Node 24 by its full portable path; first shell call `node --version`; record the digest
  first.
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.

## Output

- `handoff/delivery/WP5_UX_REVIEW_B.md` and `handoff/delivery/WP5_UX_REVIEW_B.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt`, screenshots
  `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-B/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix).

Return at most 180 words, beginning with your self-reported model: the decision, the
findings, the weakened-assertion list result, the mandatory check counts, the digests
and the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (fresh context; authored none of WP5-UX-PLAN, T01-T06, FIX1 or the gate; ran no
earlier audit of this round). Report: `handoff/delivery/WP5_UX_REVIEW_B.md` and `.vi.md`. Evidence (masked LF):
`handoff/delivery/evidence/WP5-UX-AUDIT-B/` (index `00-README.txt`).

Identity. Reviewed commit 831f760838950a59f0e5c880f0bbefda15fe0c61; digest
3d274c9e93c1acfb06ebea8de2df2396192548b881212d799a98e0304a3c7ea9 (789 files, handoff/ excluded) before (first step after
`node --version`, 2026-10-09T06:36Z) and after, in three forms: `git ls-tree` form, `scripts/source-digest.mjs` in a
scratch clone at 831f760 (`git status --short` empty), and in the working repository. HEAD = origin/main = 5beae2f; no path
outside handoff/ differs from 831f760.

Runtime. Git Bash; Node v24.21.0 by its portable path (bare `node` is v26.10.0 and was not used for checks); task folder
`D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B` with TEMP/TMP, DATA_DIR and DATABASE_PATH inside it; my own server on port 47930;
the e2e fixture picks OS-free loopback ports as in every earlier gate. No Docker, no stdin scripts, no PID kill, no
recursive delete, nothing written to `%LOCALAPPDATA%\timesheet-dev` (only the portable Node binary read).

Mandatory checks (run myself in the clean clone):

| Check | Command | Exit | Result |
|---|---|---|---|
| Typecheck | `npm run typecheck` | 0 | clean |
| Lint | `npm run lint` (typescript-eslint `no-deprecated`) | 0 | clean |
| Unit/integration | `npm test` | 0 | 82 files, 1817 tests passed |
| Full e2e, both projects | `npm run test:e2e` | 0 | 160 tests: 155 passed, 5 skipped, 0 failed; desktop 77 passed + 3 skipped, mobile 78 passed + 2 skipped; 6.3 min |
| Deprecation tracing | lint (ignoring my probe folder), `npm test`, build, and the running server + Edge with `--trace-deprecation --pending-deprecation` | 0 | 0 deprecation lines; 0 browser deprecation messages; 0 page errors |

Findings (details, reproduction and bounded fixes in the report):

| ID | Severity | Where | Summary |
|---|---|---|---|
| WP5-UX-B-01 | Medium | `src/client/TimesheetScreen.tsx:352-391`, `PeriodBar.tsx:82-94`, `TimesheetSheet.tsx:249-270`, `styles.css:979-993, 1568-1576` | Phone 390x844: the first day row starts at 836.6px, below the tab bar (788px); no day is on the first screen, contrary to the approved direction (plan C "The first day row appears within the first screen"; mockup A2 caption) |
| WP5-UX-B-02 | Medium | `styles.css:1768-1774, 1776-1794`; `DayEditor.tsx:79-89, 184-189`; docs/04:59 (EN, VI) | 768-1199px: the fixed non-modal side panel covers Thu/Fri..Sun, the tools and the clock; 12 sheet controls take keyboard focus while entirely hidden (768 and 1024px); Escape from the sheet does not close the panel (WCAG 2.2 SC 2.4.11) |
| WP5-UX-B-03 | Low | `tests/e2e/import.spec.ts:382-396` | Weakened assertion: on the desktop project the absence checks for the import UI now run on the Settings page instead of the Admin view |
| WP5-UX-B-04 | Low | `docs/04_UX_AND_SETTINGS.md:55, 41` and `.vi.md:55, 41` | "the label picker" is said to appear only in batch mode (the in-cell picker is the opposite; the batch control is "Category for selected days"); the Check list omits "Missing record" |

Weakened-assertion result: 24 changed or added assertion groups across 20 test files reviewed (table in the report); one
weakened (B-03); every other replacement is equivalent or stronger. `filter({ visible: true })` excludes on the phone only
the five display-none desktop-bar controls (probe P7); my own phone probe found 0 controls under 44px in 8 states.

Passed in area B: Excel layout on the desktop, E-1..E-7, navigation (E-5), keyboard order Mon..Sun week 1 then week 2,
accessible and hidden row names, focus on open/Escape/return at 1280px, the bottom-sheet focus trap, status never by colour
alone, 44px and no sideways scroll at 390 and 360px, text contrast (rendered minimum 5.00 light / 5.74 dark), tokens only,
4px radius, the shared 300ms ease-out transition, layered shadows, reduced motion, system fonts (CSP), docs/10 and docs/12
accuracy, docs/12 without a new release identity, docs/04 line 16, EN/VI parity. WCAG 1.4.11 judgement: `--sheet-rule-strong`
(2.86 / 2.97) and `--sheet-rule` (1.48 / 1.56) are not required to understand the sheet (every rule carries or sits beside
text; days are identified by headers, alignment and names), so not a failure.

Optional (not defects): pre-existing `--focus-ring` about 1.7:1 / 2.4:1; ISO dates in the Review header; no account button
in the phone top bar; the legend always lists "Today"; the read-only editor still prints "none".

No source, test, doc, board or STATE edit; probes ran in the scratch clone outside git tracking. Nothing left running (the
runtime probe stopped its server through its child handle; Playwright stopped the fixture servers; both background runs
finished). Next action: a bounded fix task for WP5-UX-B-01..B-04, its freeze, a gate and a fresh area-B re-audit on the new
digest.

Status: done
