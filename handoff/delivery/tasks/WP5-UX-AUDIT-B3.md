# WP5-UX-AUDIT-B3 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-B3; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE2 (PASS).
- Area B recheck of WP5 on the final snapshot of the UI redesign round: **UX fidelity,
  accessibility, test strength, UI standards and documentation**. The previous area-B
  audit WP5-UX-AUDIT-B2 (FIX REQUIRED on 589bcff) closed B-01..B-04 and found one Low
  regression, B2-01 (the phone "Open a day" field clipped the date at 360 and 320px),
  answered by WP5-UX-FIX4 together with its optional items O-1..O-3. Area A is
  rechecked in parallel (WP5-UX-AUDIT-A3) in a separate context; do not coordinate with
  it. WP5 is re-accepted only if both PASS.
- `reviewed_commit` = a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb (the WP5-UX-REGATE2
  `freeze_commit`; HEAD = origin/main); digest of record
  0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d. Audit a clean export
  (or a scratch clone) at a2ea7a4; record the digest FIRST and again at the end.
- Because this PASS would accept the package, it must cover area B on the whole
  snapshot, not only the delta: confirm B2-01 closed, then re-verify area B items 1-6 of
  `WP5-UX-AUDIT-B.md` on a2ea7a4. You may reuse earlier evidence as a method but every
  check you rely on must be rerun at a2ea7a4.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author). Routing: size M, risk M, novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_B3.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-B.md`.
- `handoff/delivery/WP5_UX_REVIEW_B2.md` (B2-01, O-1..O-4, R-1..R-6) and its evidence.
- The Results of WP5-UX-FIX4 and WP5-UX-REGATE2, with their evidence.
- The diff `589bcff..a2ea7a4` (the FIX4 change) and `014bd47..a2ea7a4` (the whole round).

## Scope

1. **B2-01 closed.** At 390, 360 and 320px the "Open a day" field shows the full date
   (measure widths and the rendered value); the row wraps where needed; the 390x844
   first-screen B-01 budget still holds (first `[data-day]` bottom at or above the tab
   bar top, with and without the zone note); the new assertion fails on the 589bcff
   behaviour (scratch copy only). O-1..O-3 done (docs/04 line 9 EN and VI, DayEditor
   comment only, merged rule).
2. **Area B on the whole snapshot** (items 1-6 of `WP5-UX-AUDIT-B.md`): owner request
   and E-1..E-7; test strength (no assertion removed or weakened since 014bd47,
   including FIX4); accessibility (keyboard order, names, focus and modal behaviour,
   not colour alone, 44px, no horizontal scroll at 390/360/320, contrast); UI standards
   and no deprecated APIs; docs/04, docs/10, docs/12 accuracy and EN/VI parity;
   mandatory checks (typecheck, lint, `npm test`, the FULL e2e on both projects).
3. **Carried items.** Re-judge R-1..R-6 and O-4 of the B2 review and the Info risks R2
   and R5 of `WP5_UX_REVIEW_A2.md` that touch area B (Escape order under a picker review
   when shrinking below 1200px; grantee bar on the phone pushes the first row below the
   first screen); report any that is a defect under the brief's rules.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B3` (set TEMP and TMP to it).
  Ports 48060-48079 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`.
  No Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head`
  OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Write scripts with the
  Write tool and run them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  put Node 24 first on PATH before any node call; first shell call `node --version`.
- **Create files ONLY inside the task folder or the evidence folder.**
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.

## Output

- `handoff/delivery/WP5_UX_REVIEW_B3.md` and `handoff/delivery/WP5_UX_REVIEW_B3.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-B3/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix), and the disposition of B2-01.

Return at most 180 words, beginning with your self-reported model: the decision, the
B2-01 disposition, any new findings, the weakened-assertion result, the mandatory check
counts, the digests and the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (fresh context; authored nothing in this round and ran no gate or earlier audit of
it). Report: `handoff/delivery/WP5_UX_REVIEW_B3.md` and `.vi.md`. Evidence (masked LF):
`handoff/delivery/evidence/WP5-UX-AUDIT-B3/` (index `00-README.txt`).

Identity. Reviewed commit a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb; digest
0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d (789 files, handoff/ excluded) recorded first (after
`node --version`, 2026-10-09T09:46Z) and after all checks, equal in three forms: `git ls-tree` form, `scripts/source-digest.mjs`
in the working repository, and in a scratch clone at a2ea7a4 (`git status --short` empty). HEAD = origin/main = a2ea7a4; no path
outside handoff/ differs; no unpushed commit.

Runtime. Git Bash; Node v24.21.0 first on PATH; task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B3` with TEMP/TMP,
DATA_DIR and DATABASE_PATH inside it; my servers on 48060-48066; the e2e fixture picks OS-free loopback ports. No Docker, no
stdin scripts, no PID kill, no recursive delete, nothing written to `%LOCALAPPDATA%\timesheet-dev` (portable Node read only).

Mandatory checks (run myself in the scratch clone at a2ea7a4):

| Check | Command | Exit | Result |
|---|---|---|---|
| Typecheck | `npm run typecheck` | 0 | clean |
| Lint | `npm run lint` (typescript-eslint `no-deprecated`) | 0 | clean |
| Unit/integration | `npm test` | 0 | 82 files, 1820 tests passed |
| Full e2e, both projects | `npm run test:e2e` | 0 | 180 tests: 167 passed, 13 skipped, 0 failed; desktop 82 passed + 8 skipped, mobile 85 passed + 5 skipped (all project-scoped); 6.1 min |
| Deprecation tracing | lint, `npm test`, build with `--trace-deprecation --pending-deprecation`; built server on 48066 | 0 | 0 deprecation lines; browser console only the pre-sign-in 401 |

B2-01 disposition: **closed.** With a date typed, the "Open a day" field is 146.2 / 235 / 220 / 204 / 180 px at 390 / 375 /
360 / 344 / 320 px (button beside it at 390, below it from 375); screenshots show "10/09/2026" whole; no sideways scroll; 0
controls under 44 px. B-01 at 390x844 unchanged: first `[data-day]` bottom 659.0 (zone equal) and 758.0 (zone note) vs tab
bar top 788, scrollY 0. The FIX4 assertion fails on the 589bcff behaviour: V1 (589bcff client) fails at 390/360/320 (390 only
because the token is absent), V2 (a2ea7a4 with only the 589bcff open-day rules) passes at 390 and fails at 360 and 320
(116.2 and 76.2 < 142). O-1 (docs/04 line 9 EN and VI), O-2 (DayEditor comment only) and O-3 (one merged rule) done.

Findings (details, reproduction and bounded fixes in the report):

| ID | Severity | Where | Summary |
|---|---|---|---|
| WP5-UX-B3-01 | Low | `src/client/DayEditor.tsx:83-95` (with `:97-109`); docs/04:59 | Re-judged A2 R2: at 1280px with the label review dialog open over the non-modal editor, shrinking to 1024px re-shows the editor as a modal above the review (review hidden); the first Escape closes the editor, not the nested dialog, and focus lands on BODY while the modal review stays open; nothing saved. Contradicts docs/04 line 59 |
| WP5-UX-B3-02 | Low | `docs/04_UX_AND_SETTINGS.md:55`, `.vi.md:55` | Says "Open a day" takes "any date of the period"; the control opens any date (2026-04-06 opened with the period 09/28-10/11; no min/max; `OpenDay.tsx:3`) |

Weakened-assertion result: every removed test line since 014bd47 (`12-…`) judged against its replacement: none weakened,
including FIX4 (+27 lines, 0 removed). Optional O-5: FIX4's sub-assertion "the date value is not clipped" cannot fail for a
Chromium date input (114/114 and 74/74 on visibly clipped values); the width assertion carries the check.

Re-judged carried items: R-1 focus ring 1.72:1 / 2.46:1 (pre-existing; recommended follow-up, not a finding of this round);
R-2..R-6 and O-4 unchanged, not defects; A2 R5 not a defect (grantee view outside the owner-page B-01 rule; measured 750.7
view-only zone equal, 802.7 to 901.7 otherwise). New optional R-7: the 9.5rem token makes the row wrap below about 388 px,
so at 375x844 with the zone note the first row ends at 827.4 (589bcff 775.4).

Passed in area B: Excel layout and E-1..E-7, navigation, keyboard order, names, modal/focus behaviour at fixed widths, phone
bottom sheet, status not by colour alone, 44 px and no sideways scroll at 390/360/320 (incl. editor and Review), text
contrast (min 5.00 / 5.74), tokens, 4px radius, 300ms ease-out transition, layered shadows, reduced motion, system fonts,
docs/10 and docs/12 accuracy, docs/12 without release identity, docs/04 line 16, EN/VI parity.

No source, test, doc, board or STATE edit. Process slips (no file written outside the task and evidence folders, no result
affected): two read-only listings piped into `head` and one `grep` redirected to `/dev/null`. Nothing left running (servers
stopped through their child handles; Playwright stopped the fixture servers; both background runs finished). Next action: a
bounded fix task for WP5-UX-B3-01 and WP5-UX-B3-02, its freeze, a gate and an area-B recheck on the new digest.

Status: done
