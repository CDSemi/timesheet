# WP5-UX-AUDIT-B2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-B2; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE (PASS).
- Area B re-audit of WP5 after the UI redesign fix round: **UX fidelity to the owner's
  request, accessibility, test strength, UI standards and documentation**, on the new
  snapshot. The first area-B audit (WP5-UX-AUDIT-B, FIX REQUIRED on 831f760) found
  B-01..B-04, answered by WP5-UX-FIX3 (with a tab-order addendum). Area A is re-audited
  in parallel (WP5-UX-AUDIT-A2) in a separate context; do not coordinate with it. WP5 is
  re-accepted only if both PASS.
- `reviewed_commit` = 589bcff5541a603abad696a3303dbea11cccb4a7 (the WP5-UX-REGATE
  `freeze_commit`; HEAD = origin/main); digest of record
  8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e. Audit a clean export
  (or a scratch clone) at 589bcff; record the digest FIRST and again at the end.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author). Routing: size L, risk M, novelty no.
- Fresh context: you authored none of WP5-UX-PLAN, T01-T06, FIX1-FIX3, the gates or the
  earlier audits of this round. Do not rely on authors', the verifier's or earlier
  auditors' summaries as proof: inspect and reproduce.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_B2.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-B.md`.
- `handoff/delivery/WP5_UX_REVIEW_B.md` (findings B-01..B-04, risks R-1..R-6) and its
  evidence, which you may reuse as a method but must rerun yourself.
- The Results of WP5-UX-FIX2, WP5-UX-FIX3 and WP5-UX-REGATE, with their evidence.
- The diff `014bd47..589bcff` of `src/client/`, `tests/` and `docs/`, and in particular
  `831f760..589bcff` (the fix round).

## Scope

1. **B-01..B-04 closed.** B-01: at 390x844 the first `[data-day]` row is fully visible
   above the bottom tab bar, and the compact phone layout still matches the approved
   direction (mockup A2: period card, clock card, sheet). B-02: below 1200px no focused
   sheet control is ever entirely hidden by the day editor (the editor is modal there),
   focus trap and focus return work, Escape closes it from anywhere, and from 1200px it
   sits beside the sheet; docs/04 describes this. B-03: the import absence checks run on
   `#/admin` in both projects again. B-04: docs/04 (EN and VI) describes the category
   choice and lists "Missing record". Check the new e2e assertions would fail on the
   831f760 behaviour (for example in a scratch copy).
2. **The whole area B scope again on the new snapshot**, items 1-6 of
   `WP5-UX-AUDIT-B.md`: owner request and E-1..E-7; test strength (every assertion
   removed, loosened or replaced since 014bd47, including the fix round's changes to
   the day-editor, import and timesheet specs and FIX2's change to a racy wait);
   accessibility (keyboard order including the new phone tab order, names, focus,
   modal behaviour, not colour alone, 44px, no horizontal scroll, contrast); UI
   standards and no deprecated APIs; docs/04, docs/10 and docs/12 accuracy and EN/VI
   parity; mandatory checks (typecheck, lint, `npm test`, the FULL e2e on both projects).
3. **Earlier risks.** Re-judge R-1..R-6 of the first review (not defects then); report any
   that became a defect.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B2` (set TEMP and TMP to it).
  Ports 48000-48019 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`.
  No Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.
  NEVER REDIRECT TO `/dev/null` OR `nul`.** Write scripts with the Write tool and run
  them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  put Node 24 first on PATH before any node call; first shell call `node --version`.
- **Create files ONLY inside the task folder or the evidence folder; never redirect
  output to any other path.**
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.

## Output

- `handoff/delivery/WP5_UX_REVIEW_B2.md` and `handoff/delivery/WP5_UX_REVIEW_B2.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-B2/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix), and the disposition of B-01..B-04.

Return at most 180 words, beginning with your self-reported model: the decision, the
B-01..B-04 dispositions, any new findings, the weakened-assertion result, the mandatory
check counts, the digests and the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (fresh context; authored none of WP5-UX-PLAN, T01-T06, FIX1-FIX3, the gates or the
earlier audits; the strongest recorded author model is opus, not stronger than mine). Report:
`handoff/delivery/WP5_UX_REVIEW_B2.md` and `.vi.md`. Evidence (masked LF): `handoff/delivery/evidence/WP5-UX-AUDIT-B2/`
(index `00-README.txt`).

Identity. Reviewed commit 589bcff5541a603abad696a3303dbea11cccb4a7 (HEAD = origin/main); digest
8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e (789 files, handoff/ excluded), recorded first (right after
`node --version`, 2026-10-09T08:30:57Z) and after all checks (08:54Z), equal in three forms: `git ls-tree` form, the digest
script in the working repository, and in a scratch clone at 589bcff (`git status --short` empty). 0 paths outside handoff/
differ from 589bcff.

Runtime. Git Bash; Node v24.21.0 first on PATH; task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B2` with TEMP/TMP,
DATA_DIR and DATABASE_PATH inside it; scratch clones at 589bcff and 831f760 in the task folder; my own servers on 48001,
48002 (probes) and 48003 (runtime deprecation check), each stopped through its child handle; the e2e fixture picks OS-free
loopback ports. No Docker, no PID kill, no recursive delete, nothing written to `%LOCALAPPDATA%\timesheet-dev` (only the
portable Node binary read).

Mandatory checks (scratch clone at 589bcff):

| Check | Command | Exit | Result |
|---|---|---|---|
| Typecheck | `npm run typecheck` | 0 | clean |
| Lint | `npm run lint` (typescript-eslint `no-deprecated`) | 0 | clean |
| Unit/integration | `npm test` | 0 | 82 files, 1820 tests passed |
| Full e2e, both projects | `npm run test:e2e` | 0 | 174 tests: 164 passed, 10 skipped, 0 failed; desktop 82 passed + 5 skipped, mobile 82 passed + 5 skipped (all skips project-specific); 5.6 min |
| Deprecation tracing | lint, `npm test`, build with `--trace-deprecation --pending-deprecation`; built server on 48003 | 0 | 0 deprecation lines; browser console only the pre-sign-in 401 |

B-01..B-04 dispositions (all closed, verified directly):

- WP5-UX-B-01 closed: at 390x844 the first day row bottom is 659.0 (zone equal) / 758.0 (zone note) against the tab bar top
  788, also clocked in; order period card, clock card, sheet in all measured states (831f760: 910.2 / 1046.6).
- WP5-UX-B-02 closed: 768/1024/1199 modal with the page inert, 0 focus outside or hidden in 160 presses, Escape/Close close it
  and focus returns; from 1200 non-modal beside the sheet, Escape from anywhere, nested picker and review dialog take Escape
  first; resize switches the mode; docs/04 line 59 EN/VI accurate.
- WP5-UX-B-03 closed: the Admin absence checks run on `#/admin` in both projects (`import.spec.ts:388-390`); an Admin-view
  mutation makes the 589bcff test fail on desktop and mobile, while the 831f760 test passed on desktop.
- WP5-UX-B-04 closed: docs/04 lines 41 and 55 (EN, VI) list "Missing record" and name "Category for selected days".
- Addendum 1 (phone tab order) closed: Previous, Next, Review on both layouts.

New assertions on the 831f760 behaviour: 7 of 7 behaviour assertions of the fix round fail there (B-01 x2, B-02 x3,
period-card tab order x2); the B-03 test passes there by design and bites under the mutation (`30-…`, `31-…`).

Weakened-assertion result: 31 changed or added assertion groups reviewed since 014bd47 (including FIX2's racy-wait change,
which only adds a wait); 0 weakened at 589bcff (B-03 restored).

Finding (details, reproduction and bounded fix in the report):

| ID | Severity | Where | Summary |
|---|---|---|---|
| WP5-UX-B2-01 | Low | `src/client/styles.css:1081-1103` (phone block added by FIX3) | The "Open a day" date field shrinks with the one-row layout: 116.2px at 360 and 76.2px at 320, so a typed date shows as "10/09/202" and "10/0" (831f760: 153px, full date). Regression of the fix round; WCAG 2.2 SC 1.4.10 at 320 CSS px |

Passed in area B: E-1..E-7, desktop sheet, phone first screen and order, keyboard order (phone and desktop), names, modal
behaviour below 1200px, Escape rules, not colour alone, 44px and no sideways scroll at 390/360/320, compact-text contrast
(min 5.00 light / 5.80 dark), tokens only, 4px radius, shared 300ms ease-out transition, layered shadows, reduced motion,
system fonts, no deprecated API, docs/04, docs/10, docs/12 accuracy and EN/VI parity, docs/12 without a new release
identity. R-1..R-6 re-judged: unchanged, none became a defect. Optional: O-1 docs/04 line 9 wording, O-2 stale comment
`DayEditor.tsx:83-84`, O-3 duplicate `.tools .open-day` rule, O-4 tight first-screen margin after a notice (787.7 vs 788).

Process slips (none wrote a file outside the task and evidence folders): one read-only `node -e` print ran with the system
Node v26 because the environment was not sourced (failed on a syntax error); one command ended with a `| head -c 0` pipe (no
output); one redirect with an unset variable tried `/docs-grep.txt` at the drive root and was refused (Permission denied;
verified absent).

No source, test, doc, board or STATE edit; the B-03 mutation was made only in the 831f760 scratch clone and restored.
Nothing left running (all background runs finished; every server stopped through its handle). Next action: a bounded fix
task for WP5-UX-B2-01, its freeze, a gate and an area-B recheck on the new digest.

Status: done
