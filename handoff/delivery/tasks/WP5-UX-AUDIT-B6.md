# WP5-UX-AUDIT-B6 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-B6; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE5 (must be PASS before dispatch).
- Area B recheck of WP5 on the final snapshot: **UX fidelity, accessibility, test
  strength, UI standards and documentation**. The previous area-B audit WP5-UX-AUDIT-B5
  (FIX REQUIRED on 5e104e1) found B5-01..B5-03. The owner then chose one complete
  accessibility sweep and one fix round (WP5-UX-Q2, option a): WP5-UX-A11Y-SWEEP listed
  ten WCAG 2.2 AA issues WP5-UX-AX-01..AX-10 (AX-01..AX-03 = B5-01..B5-03), and
  WP5-UX-FIX7 fixed them and added B5 risk R-12. Area A is rechecked in parallel
  (WP5-UX-AUDIT-A6) in a separate context; do not coordinate with it. WP5 is re-accepted
  only if both PASS.
- `reviewed_commit` = bf954c0b371ad9a5fe461a603c5d476ea210e66c (the WP5-UX-REGATE5
  `freeze_commit`; HEAD = origin/main unless only handoff/ changed since); digest of
  record b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files).
  Audit a clean export (or a scratch clone) at bf954c0; record the digest FIRST and again
  at the end.
- Because this PASS would accept the package, it must cover area B on the whole
  snapshot: confirm the dispositions of B5-01..B5-03 and AX-04..AX-10 and R-12, then
  re-verify area B items 1-6 of `WP5-UX-AUDIT-B.md` on bf954c0. Earlier evidence may be
  reused as a method, but every check you rely on must be rerun at bf954c0.
- Severity rule (unchanged from B5): a finding blocks only if it is a defect against the
  owner's request, the approved direction, docs/04 as shipped, AGENTS.md rules or WCAG 2.2
  AA. Put polish that meets those rules under "Risks and optional improvements". The
  owner asked for one closing round: report every blocking defect you find in this pass,
  not only the first.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author; FIX7 ran on opus). Routing: size M, risk M, novelty no.
- Fresh context: you authored nothing in this round and ran no gate, sweep or earlier
  audit of it. Do not rely on authors', the sweep's, the verifier's or earlier auditors'
  summaries as proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_B6.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-B.md`.
- `handoff/delivery/WP5_UX_REVIEW_B5.md` (B5-01..B5-03, risks) and its evidence.
- The board `owner_decisions` entry for WP5-UX-Q2 and the coordinator decision on AX-05
  and docs/04 line 48 (2026-10-09).
- `handoff/delivery/tasks/WP5-UX-A11Y-SWEEP.md` Results (the issue table) and the
  Results of WP5-UX-FIX7 and WP5-UX-REGATE5, with their evidence.
- The diff `5e104e1..bf954c0` (FIX7; the owner's commit 5b349f8 is handoff-only) and
  `014bd47..bf954c0` (the whole round).

## Scope

1. **Dispositions.** With real key presses on both projects, light and dark, at 1280,
   768, 390 and 320:
   - AX-01 (B5-01, SC 2.4.11): no focused control entirely hidden under the shell bar,
     the share bar or the editor head on Shift+Tab or Tab.
   - AX-02, AX-03, AX-04 (B5-02, B5-03, SC 1.4.11 / 2.4.7) and R-12: a visible indicator
     at least 3:1 for the label list and its active option, scrolling dialogs and the day
     editor, pressed toggles with focus, and date/time fields reached by Shift+Tab. FIX7
     says its probe could not measure date/time fields because `blur()` does not blur
     them; check that claim with your own method.
   - AX-05 (SC 2.5.3): accessible names of day buttons and "End share with {name}" contain
     the visible text; docs/04 line 48 (EN and VI) matches the shipped names.
   - AX-06 (SC 3.2.2): changing the "Shared with me" choice does not change context; Open
     does.
   - AX-07 (SC 4.1.3), AX-08 (SC 2.4.3), AX-09 (SC 1.4.3, light `--ok` #136a42 on every
     light surface with and without the selection tint), AX-10 (SC 1.4.10 at 320 in batch
     mode, 44px targets kept).
   Show that the new e2e checks (`tests/e2e/keyboard-access.spec.ts`, the changed
   `focus-ring.spec.ts`) fail on 5e104e1 (scratch copy only).
2. **Area B on the whole snapshot** (items 1-6 of `WP5-UX-AUDIT-B.md`): owner request and
   E-1..E-7; test strength (no assertion removed or weakened since 014bd47, including
   FIX7's renamed day-button names, which must be replaced, not dropped); accessibility
   (keyboard order, names, focus and modal behaviour, focus not obscured, not colour
   alone, 44px, reflow at 320px, contrast, status messages); UI standards (tokens only,
   4px radius, shared transition; the new `useBlockSize` hook uses no deprecated API) and
   no deprecated APIs; docs/04, docs/10, docs/12 accuracy and EN/VI parity; mandatory
   checks (typecheck, lint, `npm test`, the FULL e2e on both projects).
3. **Carried items.** Re-judge the risks listed in `WP5_UX_REVIEW_B5.md` and the items
   FIX7 left by design (R-10 hover over focus, the "<"/">" names, the WFH "Note" name,
   phone batch crowding beyond AX-10); report any that is a defect under the severity
   rule.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B6` (set TEMP and TMP to it).
  Ports 48300-48319 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
  task folder for every CLI or server run; never touch `%LOCALAPPDATA%\timesheet-dev`.
  No Docker. Give each Playwright run its own output folder; give probe actions a short
  timeout.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Write
  scripts with the Write tool and run them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  put Node 24 first on PATH (with `cygpath -u`) before any node call; first shell call
  `node --version`.
- **Create files ONLY inside the task folder or the evidence folder** (never on `D:\`
  or in the repository root).
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.
- In the review, Results and evidence never write an email address other than the full
  synthetic `@example.invalid` form, and never a real profile path (use `<user>`); mask
  probe-truncated addresses as `<email>`.

## Output

- `handoff/delivery/WP5_UX_REVIEW_B6.md` and `handoff/delivery/WP5_UX_REVIEW_B6.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-B6/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix), and the dispositions of B5-01..B5-03,
  AX-04..AX-10 and R-12.

Return at most 180 words, beginning with your self-reported model: the decision, the
dispositions, any new findings, the weakened-assertion result, the mandatory check
counts, the digests and the evidence files.

## Results

(auditor appends here)

### Auditor result (attempt 1) - decision: FIX REQUIRED

Self-reported model: claude-opus-5-5 (fresh context; I authored none of WP5-UX-A11Y-SWEEP, WP5-UX-FIX7, its freeze or
WP5-UX-REGATE5, and ran no earlier gate, sweep or audit of this round; FIX7 ran on opus, so my model is not weaker). Report:
`handoff/delivery/WP5_UX_REVIEW_B6.md` and `.vi.md`. Evidence (masked LF): `handoff/delivery/evidence/WP5-UX-AUDIT-B6/`
(index `00-README.txt`).

Identity:
- Reviewed commit bf954c0b371ad9a5fe461a603c5d476ea210e66c; HEAD = origin/main = bf954c0. No path outside handoff/ differs.
  5b349f8 is handoff-only.
- Digest b7c011d2f47b6cf45ec085064f6c8e5da1847f8ffdd3ba54ac77dc995a02d563 (793 files). It was recorded first (03:05:43Z, after
  `node --version` v24.21.0) and again after all checks (03:58Z). It is equal in three forms: `git ls-tree` form, scratch clone
  at bf954c0, and the working repository (`00-…`, `90-…`).

Runtime:
- Git Bash and portable Node 24. TEMP/TMP, DATA_DIR and DATABASE_PATH were in `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-B6`.
- My probe servers used ports 48300-48319; the e2e fixture picks OS-free loopback ports as in every gate. No Docker.
- No stdin-fed script, no pipe into head or tail, no /dev/null, no PID kill, no recursive delete.
- Nothing is left running: every run ended by itself, and the fixtures stopped their servers.

Mandatory checks (scratch clone at bf954c0):

| Check | Exit | Result |
|---|---|---|
| `npm ci` / `npm run typecheck` / `npm run lint` | 0 / 0 / 0 | clean (lint includes `no-deprecated`) |
| `npm test` with deprecation tracing | 0 | 82 files, 1823 tests passed; 0 deprecation lines |
| `npm run test:e2e` run 1 | 1 | 207 passed, 24 skipped, 1 failed: desktop `automation.spec.ts:118`, ECONNRESET on a fetch to its private server after a 9.4 s job drain (area A). Alone `--repeat-each=3`: 3 passed |
| `npm run test:e2e` run 2 (nothing else running) | 0 | 232 tests: 208 passed, 24 skipped, 0 failed, 0 flaky; desktop 103 + 13 skipped, mobile 105 + 11 skipped; 0 deprecation lines |

Dispositions (real key presses, both projects, light and dark, 1280/768/390/320). All are closed: B5-01/AX-01, B5-02/AX-02,
B5-03/AX-03, AX-04, AX-05, AX-06, AX-07, AX-08, AX-09, AX-10 and R-12.
- AX-01: 200 walks, 7320 stops, 0 entirely hidden.
- Rings: 0 stops without a ring, lowest 4.32:1. The picker list ring is 4.54-7.01 and the active-option inset ring 5.86-6.79
  on 4 sides. The editor and scrolling Clock out dialog stops show the inset ring at 6.09/6.79. Pressed toggles show 6.09/6.79.
- Date/time fields after Shift+Tab: 6.09/6.79. FIX7's "blur() does not blur them" is confirmed; I measured against the
  pre-keypress screenshot.
- AX-05: 112 day buttons named "{verb} {visible} ({ISO})", plus "End share with {name}". docs/04 line 48 EN/VI match.
- AX-06: no key on the select navigates; Open does.
- AX-07: alert/status roles, including the two notices the gate could not reach.
- AX-08: focus returns with only preview requests sent.
- AX-09: light --ok is at least 5.29 plain and 4.69 tinted; rendered values are 6.63/5.82/5.17.
- AX-10: 0 problems at 390/375/360/320.

New checks on 5e104e1 (base copy only): exit 1, 36 failed, 8 skipped, 2 passed (AX-09 dark, unchanged token). Each test fails
on its own defect (`30a-…`).

Weakened-assertion result: no assertion removed or weakened since 014bd47. All 15 FIX7 removals are renamed day-button
assertions replaced by stronger `namedDayButton`/`dayButtonName` ones; the 88 earlier removals were re-judged, equal or
stronger (`13-…`).

Finding:

| ID | Severity | Where | Summary |
|---|---|---|---|
| WP5-UX-B6-01 | Low | `SharingSwitcher.tsx:26-45` in the compact bar (`AppShell.tsx:165`; `styles.css:250-262`, `:578-597`) with the zone note (`PeriodBar.tsx:61`) | Phone 390x844, a person with a received share and the zone note (viewing zone ≠ reporting zone): the first day row bottom is at 830.2px, below the tab bar top at 788px. This is against docs/04 line 48 ("fully visible above the tab bar at 390x844") and plan C / B-01. Without a share: 775.4; a share without the zone note: 731.2. Identical at 5e104e1 (pre-existing, not from FIX7) |

Optional, not defects: R-10, R-11 (narrower), R-13, R-14 and R-16..R-20. R-16 is the label-picker extras and "Note", judged
not a 2.5.3/1.3.1 failure; I recommend adding them to the name. R-15 is closed.

Next action (coordinator): either a small fix task for B6-01 (phone switcher placement or a one-row bar, plus a 390x844 e2e
with a received share and the zone note), then freeze, gate and a focused area-B recheck; or ask the owner whether docs/04
line 48 should be narrowed.

Commit description (proposal for timesheet-committer): `Record WP5-UX-AUDIT-B6: area-B recheck of bf954c0 - FIX REQUIRED
(B6-01 Low: phone first screen with a received share and the zone note); AX-01..AX-10, B5-01..B5-03 and R-12 closed`.

Status: done
