# WP5-UX-AUDIT-B4 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-B4; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE3 (PASS).
- Area B recheck of WP5 on the final snapshot: **UX fidelity, accessibility, test
  strength, UI standards and documentation**. The previous area-B audit WP5-UX-AUDIT-B3
  (FIX REQUIRED on a2ea7a4) found B3-01 (the label-change review lost the top layer,
  Escape and focus when the window crossed 1200px) and B3-02 (docs/04 line 55), answered
  by WP5-UX-FIX5 together with O-5 (a sub-assertion that could not fail) and R-7 (token
  tuning). Area A is rechecked in parallel (WP5-UX-AUDIT-A4) in a separate context; do
  not coordinate with it. WP5 is re-accepted only if both PASS.
- `reviewed_commit` = edaaa852370128ca9bdf206d730f3849346ba994 (the WP5-UX-REGATE3
  `freeze_commit`; HEAD = origin/main); digest of record
  b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873. Audit a clean export
  (or a scratch clone) at edaaa85; record the digest FIRST and again at the end.
- Because this PASS would accept the package, it must cover area B on the whole
  snapshot: confirm B3-01, B3-02, O-5 and R-7, then re-verify area B items 1-6 of
  `WP5-UX-AUDIT-B.md` on edaaa85. Earlier evidence may be reused as a method, but every
  check you rely on must be rerun at edaaa85.
- Severity rule for this recheck: classify each issue as in the earlier reviews (High,
  Medium, Low, or Info/optional). A finding blocks only if it is a defect against the
  owner's request, the approved direction, docs/04 as shipped, AGENTS.md rules or WCAG 2.2
  AA. Put polish that meets those rules under "Risks and optional improvements".
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author). Routing: size M, risk M, novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_B4.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-B.md`.
- `handoff/delivery/WP5_UX_REVIEW_B3.md` (B3-01, B3-02, O-5, R-7, R-1..R-6, O-4, A2 R5)
  and its evidence.
- The Results of WP5-UX-FIX5 and WP5-UX-REGATE3, with their evidence.
- The diff `a2ea7a4..edaaa85` (FIX5) and `014bd47..edaaa85` (the whole round).

## Scope

1. **B3-01, B3-02, O-5, R-7 closed.** Reproduce B3-01's scenario at edaaa85 (1280 to 1024
   and 1024 to 1280 with the review open; also a resize with only the editor open, and a
   resize while the leave validation alert shows): the review keeps the top layer, focus
   and Escape; nothing is saved; focus never falls to BODY; the editor keeps its modal
   behaviour below 1200px and its side-panel behaviour from 1200px. Show that the new
   tests fail on the a2ea7a4 behaviour (scratch copy only). Check docs/04 line 55 (EN and
   VI); the O-5 assertion can fail; the R-7 widths and first-row bottoms at 390, 375, 360
   and 320 (with and without the zone note).
2. **Area B on the whole snapshot** (items 1-6 of `WP5-UX-AUDIT-B.md`): owner request and
   E-1..E-7; test strength (no assertion removed or weakened since 014bd47, including
   FIX5); accessibility (keyboard order, names, focus and modal behaviour, not colour
   alone, 44px, reflow at 320px, contrast); UI standards and no deprecated APIs;
   docs/04, docs/10, docs/12 accuracy and EN/VI parity; mandatory checks (typecheck,
   lint, `npm test`, the FULL e2e on both projects).
3. **Carried items.** Re-judge R-1..R-6, O-4 and A2 R5; report any that is a defect under
   the severity rule above.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B4` (set TEMP and TMP to it).
  Ports 48130-48149 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`.
  No Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head`
  OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Write scripts with the
  Write tool and run them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  put Node 24 first on PATH before any node call; first shell call `node --version`.
- **Create files ONLY inside the task folder or the evidence folder** (two stray files
  were left at the D: drive root this round).
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.

## Output

- `handoff/delivery/WP5_UX_REVIEW_B4.md` and `handoff/delivery/WP5_UX_REVIEW_B4.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-B4/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix), and the dispositions of B3-01,
  B3-02, O-5 and R-7.

Return at most 180 words, beginning with your self-reported model: the decision, the
dispositions, any new findings, the weakened-assertion result, the mandatory check
counts, the digests and the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (fresh context; authored nothing in this round; ran no gate or earlier audit of it).
Report: `handoff/delivery/WP5_UX_REVIEW_B4.md` and `.vi.md`. Evidence (masked LF): `handoff/delivery/evidence/WP5-UX-AUDIT-B4/`
(index `00-README.txt`).

Identity. Reviewed commit edaaa852370128ca9bdf206d730f3849346ba994 (HEAD = origin/main); digest
b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873 (789 files, handoff/ excluded) recorded first (11:07:42Z,
after `node --version` = v24.21.0) and after all checks (11:39:17Z), equal in three forms (`git ls-tree` form, repository
`scripts/source-digest.mjs`, scratch clone at edaaa85 with `git status --short` empty). No path outside handoff/ differs.

Runtime. Git Bash; Node v24.21.0 portable; task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B4` with TEMP/TMP, DATA_DIR and
DATABASE_PATH inside it; own servers on 48130-48134; the e2e fixture picks OS-free loopback ports as in every earlier gate.
No Docker, no stdin scripts, no PID kill, no recursive delete; nothing written to `%LOCALAPPDATA%\timesheet-dev`.

Mandatory checks (scratch clone at edaaa85):

| Check | Command | Exit | Result |
|---|---|---|---|
| Typecheck | `npm run typecheck` | 0 | clean |
| Lint | `npm run lint` (typescript-eslint `no-deprecated`) | 0 | clean |
| Unit/integration | `npm test` | 0 | 82 files, 1820 tests passed |
| Full e2e, both projects | `npm run test:e2e` | 0 | 186 tests: 170 passed, 16 skipped, 0 failed; desktop 84 + 9 skipped, mobile 86 + 7 skipped (all skips project-scoped); 5.8 min |
| Deprecation tracing | lint, `npm test`, build and the built server with `--trace-deprecation --pending-deprecation` | 0 | 0 deprecation lines; browser console only the pre-sign-in 401 |

Dispositions: WP5-UX-B3-01 closed (7 probe paths incl. 1280->1024, 1024->1280, 1024->768->1280->1024, 1199<->1200, Cancel
click, batch review and Clock out dialogs; editor alone; leave alert: the open dialog keeps top layer, focus and Escape, nothing
saved, focus never on BODY, modal below 1200px and side panel from 1200px; the two new e2e tests fail 2 of 2 on the a2ea7a4
DayEditor and my probe fails 7 of 7 there). WP5-UX-B3-02 closed (docs/04 line 55 EN and VI). O-5 done (the replacement fails on
the 589bcff rules at 360 and 320: 116.23 and 76.23 < 117.89). R-7 done (full date at 390/375/360/320; first row bottom zone equal
659.02/676.41/728.41/791.19, zone note 757.97/775.36/827.36/924.92 vs 788; 390x844 unchanged).

Weakened-assertion result: none removed or weakened since 014bd47 (20 test files, all removed lines judged), including FIX5
(the fixed `>= 135` proxy replaced by the measured need, which still fails on clipped dates).

New findings (block under the brief's severity rule):

| ID | Severity | Where | Summary |
|---|---|---|---|
| WP5-UX-B4-01 | Medium | `src/client/styles.css:37, 178` (`--focus-ring`), used at `:215-219, 328-330, 501-503, 1331-1333` | Re-judged R-1: the focus ring is 1.72:1 (light) / 2.46:1 (dark) against the adjacent background on buttons, links, tabs and the sheet's "Edit {date}"; the outline is transparent, so it is the only focus cue. WCAG 2.2 SC 1.4.11 with 2.4.7 (W3C Understanding 1.4.11, Figure 43) needs 3:1 |
| WP5-UX-B4-02 | Low | `src/client/components/PeriodBar.tsx:71-74`; docs/04 line 45 EN and VI | The zone note prints the display-zone due time as ISO ("2026-10-14 07:00"); docs/04 line 45 promises MM/DD/YYYY in the period bar |

Carried items: R-2..R-6, O-4 and A2 R5 re-judged, not defects (measured again: O-4 after clock out 805.11 with the zone note and a
23+ character name; grantee 750.73/802.73/849.69/901.69); new optional R-8 (focus moves to the heading on a mode switch) and R-9
(input borders). Information outside area B: `npm audit` 1 high in a dev dependency, `--omit=dev` 0.

Process slips (read-only, no effect on results or files): one `grep … | head -n 20` and one `grep … | tail -n 3`, against the
shell rules. No source, test, doc, board or STATE edit; probes and mutations only in scratch clones in the task folder. Nothing
left running (probe servers stopped through their child handles, SIGTERM recorded; Playwright stopped the fixture servers; all
background runs finished). Next action: a bounded fix task for WP5-UX-B4-01 and WP5-UX-B4-02, its freeze, a gate and a fresh
area-B recheck on the new digest.

Status: done
