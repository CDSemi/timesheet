# WP5-UX-AUDIT-B5 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-B5; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE4 (PASS).
- Area B recheck of WP5 on the final snapshot: **UX fidelity, accessibility, test
  strength, UI standards and documentation**. The previous area-B audit WP5-UX-AUDIT-B4
  (FIX REQUIRED on edaaa85) closed B3-01, B3-02, O-5 and R-7 and found B4-01 (focus ring
  1.72:1 / 2.46:1, WCAG 1.4.11) and B4-02 (ISO due time in the zone note). The owner chose
  to fix both (WP5-UX-Q1 option a); WP5-UX-FIX6 did so. Area A is rechecked in parallel
  (WP5-UX-AUDIT-A5) in a separate context; do not coordinate with it. WP5 is re-accepted
  only if both PASS.
- `reviewed_commit` = 5e104e14dad71268a9185920c04ed0ee2a4b31c2 (the WP5-UX-REGATE4
  `freeze_commit`; HEAD = origin/main); digest of record
  07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635. Audit a clean export
  (or a scratch clone) at 5e104e1; record the digest FIRST and again at the end.
- Because this PASS would accept the package, it must cover area B on the whole
  snapshot: confirm B4-01 and B4-02, then re-verify area B items 1-6 of
  `WP5-UX-AUDIT-B.md` on 5e104e1. Earlier evidence may be reused as a method, but every
  check you rely on must be rerun at 5e104e1.
- Severity rule (unchanged from B4): a finding blocks only if it is a defect against the
  owner's request, the approved direction, docs/04 as shipped, AGENTS.md rules or WCAG 2.2
  AA. Put polish that meets those rules under "Risks and optional improvements".
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author). Routing: size M, risk M, novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_B5.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-B.md`.
- `handoff/delivery/WP5_UX_REVIEW_B4.md` (B4-01, B4-02, risks) and its evidence.
- The board `owner_decisions` entry for WP5-UX-Q1 (2026-10-09).
- The Results of WP5-UX-FIX6 and WP5-UX-REGATE4, with their evidence.
- The diff `edaaa85..5e104e1` (FIX6; the owner's commit 49a3ff0 is handoff-only) and
  `014bd47..5e104e1` (the whole round).

## Scope

1. **B4-01 and B4-02 closed.** With real Tab presses, measure the composited focus-ring
   colour against the adjacent background for top-bar links, period buttons, Clock in,
   the Review link, sheet "Edit {date}" buttons, phone tabs, the label picker, editor
   fields and dialog buttons, light and dark (at least 3:1 each, WCAG 1.4.11 with 2.4.7;
   the ring must not be clipped by overflow or hidden behind sticky bars). Show that the
   new focus-ring e2e check fails on the edaaa85 tokens (scratch copy only). The zone
   note shows the display-zone due time in the bar's US format; docs/04 matches.
2. **Area B on the whole snapshot** (items 1-6 of `WP5-UX-AUDIT-B.md`): owner request and
   E-1..E-7; test strength (no assertion removed or weakened since 014bd47, including
   FIX6); accessibility (keyboard order, names, focus and modal behaviour, not colour
   alone, 44px, reflow at 320px, contrast); UI standards (tokens only, 4px radius, shared
   transition) and no deprecated APIs; docs/04, docs/10, docs/12 accuracy and EN/VI
   parity; mandatory checks (typecheck, lint, `npm test`, the FULL e2e on both projects).
3. **Carried items.** Re-judge the risks listed in `WP5_UX_REVIEW_B4.md`; report any that
   is a defect under the severity rule.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B5` (set TEMP and TMP to it).
  Ports 48200-48219 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`.
  No Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head`
  OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Write scripts with the
  Write tool and run them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  put Node 24 first on PATH (with `cygpath -u`) before any node call; first shell call
  `node --version`.
- **Create files ONLY inside the task folder or the evidence folder.**
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.

## Output

- `handoff/delivery/WP5_UX_REVIEW_B5.md` and `handoff/delivery/WP5_UX_REVIEW_B5.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-B5/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix), and the dispositions of B4-01 and
  B4-02.

Return at most 180 words, beginning with your self-reported model: the decision, the
dispositions, any new findings, the weakened-assertion result, the mandatory check
counts, the digests and the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (fresh context; authored none of the round and ran no earlier gate or audit of it; the
strongest recorded author model is opus `claude-opus-5-5`, FIX6/REGATE4 ran on sonnet, so no model blocker). Report:
`handoff/delivery/WP5_UX_REVIEW_B5.md` and `.vi.md`. Evidence (masked LF, index `00-README.txt`):
`handoff/delivery/evidence/WP5-UX-AUDIT-B5/`.

Identity. Reviewed commit 5e104e14dad71268a9185920c04ed0ee2a4b31c2 (HEAD = origin/main); digest
07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (790 files, handoff/ excluded) recorded first (22:35:57Z,
after `node --version` = v24.21.0) and again at 23:11:32Z, equal in three forms (`git ls-tree` form and `scripts/source-digest.mjs`
in the working repository, `scripts/source-digest.mjs` in a scratch clone at 5e104e1 with `git status --short` empty). No path
outside handoff/ differs from 5e104e1.

Runtime. Git Bash; Node 24 first on PATH; TEMP/TMP, DATA_DIR and DATABASE_PATH in `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B5`;
my probe servers on 48200-48205, each stopped through its child handle (SIGTERM); the e2e fixture uses OS-free loopback ports.
No Docker, no stdin scripts, no PID kill, no recursive delete, nothing written to `%LOCALAPPDATA%\timesheet-dev`.

Mandatory checks (scratch clone at 5e104e1):

| Check | Command | Exit | Result |
|---|---|---|---|
| Typecheck | `npm run typecheck` | 0 | clean |
| Lint | `npm run lint` (`no-deprecated`) | 0 | clean |
| Unit/integration | `npm test` | 0 | 82 files, 1821 tests passed |
| Full e2e, both projects | `npm run test:e2e` | 0 | 190 tests: 174 passed, 16 skipped, 0 failed; desktop 86 + 9 skipped, mobile 88 + 7 skipped; 5.0 min |
| Deprecation tracing | lint, `npm test`, build, probe servers with `--trace-deprecation --pending-deprecation` | 0 | 0 deprecation lines; browser console only the pre-sign-in 401 |

Dispositions. WP5-UX-B4-01 **closed** for what it named: real Tab presses, rendered ring against the adjacent pixel at least
3:1 on top-bar links, period buttons, Clock in, the Review link, sheet "Edit {date}", phone tabs, the label picker trigger,
editor fields and dialog buttons, light and dark (lowest 4.11 / 4.36, the label trigger against the cell rules); the new
`focus-ring.spec.ts` fails on the edaaa85 tokens (4 of 4, 1.72 / 2.46) and on a one-rule sheet-date regression (scratch
copies only). WP5-UX-B4-02 **closed**: the zone note reads "Wed 10/14/2026, 07:00" (= the runtime Intl value), docs/04 line 45
EN/VI matches, unit and e2e assertions.

New findings (block under the brief's severity rule, WCAG 2.2 AA):

| ID | Severity | Where | Summary |
|---|---|---|---|
| WP5-UX-B5-01 | Medium | `src/client/styles.css:238-250, 382-386, 1909-1920, 1975-1983` | Shift+Tab leaves focused controls entirely under the sticky top bar (desktop: 7 week-1 "Edit {date}"; phone: 5 incl. the period buttons) and under the sticky editor head in the bottom sheet (2); no `scroll-padding-top` (SC 2.4.11, F110) |
| WP5-UX-B5-02 | Medium | `src/client/styles.css:2243-2259, 2275-2277, 103, 192`; `SheetWeekTable.tsx:137-160` | Open label picker: the focused listbox has no ring (overlay shadow replaces it) and the active option is shown only by a 1.14:1 / 1.28:1 tint (SC 1.4.11 with 2.4.7) |
| WP5-UX-B5-03 | Low | `src/client/DayEditor.tsx:238-247`; `styles.css:1909-1920` | The editor `<dialog>` is a keyboard stop (scrollable) reached by Shift+Tab from Close, with no visible indicator (SC 2.4.7) |

Area B otherwise: E-1..E-7, navigation and the phone layout met; Tab order Mon..Sun week 1 then week 2; names; focus on open,
Escape and return; status words and shapes; 0 small controls, 0 sideways scroll at 390/375/360/320 (24 states); text contrast
5.00 / 5.74; tokens only, 4px radius, shared 300ms transition; docs/04, docs/10, docs/12 accurate with EN/VI parity.
Weakened-assertion result: none removed or weakened since 014bd47, including FIX6 (`13-test-strength.txt`). B4 risks R-2..R-9,
O-4, A2 R5 re-judged: none is a defect; new optional R-10..R-15.

No source, test, doc, board or STATE edit; probes in the scratch clone (excluded from git), mutations only in a second scratch
copy. Slips: one read-only `grep … | head -n 40`; one refused `sleep 60`. Nothing left running (both background runs finished,
all probe servers stopped). Next action: a bounded fix task for WP5-UX-B5-01..B5-03 with e2e checks, its freeze, a gate and a
fresh area-B recheck on the new digest.

Status: done
