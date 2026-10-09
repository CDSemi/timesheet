# WP5-UX-AUDIT-A3 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-A3; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE2 (PASS).
- Area A recheck of WP5 on the final snapshot: **business integrity, zones, edit paths,
  sharing, isolation and privacy**. Area A passed on 589bcff (WP5-UX-AUDIT-A2, PASS,
  digest 8c07aac5). Since then only WP5-UX-FIX4 changed files outside handoff/ (CSS for
  one phone row, a comment in DayEditor.tsx, one e2e spec and docs/04 line 9), so the
  digest moved to 0b8428fd and the A2 PASS is no longer current. This recheck makes
  area A current on the new digest. Area B is rechecked in parallel
  (WP5-UX-AUDIT-B3) in a separate context; do not coordinate with it. WP5 is
  re-accepted only if both PASS.
- `reviewed_commit` = a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb (the WP5-UX-REGATE2
  `freeze_commit`; HEAD = origin/main); digest of record
  0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d. Audit a clean export
  (or a scratch clone) at a2ea7a4; record the digest FIRST and again at the end.
- This audit will supersede WP5-UX-AUDIT-A2 and WP5-RECHECK on the board
  (`superseded_by`); its PASS is what accepts area A of WP5.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author). Routing: size M, risk H, novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_A3.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-A.md`.
- `handoff/delivery/WP5_UX_REVIEW_A2.md` (PASS on 589bcff, its probes and Info risks) and
  its evidence, which you may reuse as a method.
- The Results of WP5-UX-FIX4 and WP5-UX-REGATE2, with their evidence.
- The diff `589bcff..a2ea7a4` and the whole round `014bd47..a2ea7a4`.

## Scope

1. **Delta proof.** Show from the diff `589bcff..a2ea7a4` that FIX4 changes no
   behaviour in area A: no TS/TSX logic change (DayEditor.tsx comment only), no server,
   API, request body or calculation change, no test assertion of area A removed or
   weakened; CSS changes cannot hide or remove an edit, clock, reason or confirmation
   control (check the "Open a day" row and anything the new rules select).
2. **Area A mandatory checks rerun on a2ea7a4** (items 1-7 of `WP5-UX-AUDIT-A.md`,
   reusing A2's probes as a method): endpoints and bodies versus 014bd47 for every
   edit path (side panel, modal editor below 1200px, phone sheet, in-cell picker,
   batch, clock, review, sign-off); the client computes no business minutes; A-01 still
   closed (the earlier malformed leave inputs refused, no PUT; valid bodies equal to
   014bd47); R-07 with a device-zone probe; AC-04 reason, conflict and stale version;
   AC-16 and AC-01; privacy (signature image only on the Review); PDF/AC-06/07/10
   unchanged; `npm test`; e2e specs day-editor, sharing, isolation, review, submission,
   timesheet, pdf-visual on both projects; AC-13 once.
3. **Info risks of A2.** Re-judge R2 (Escape order under a picker review when the window
   shrinks below 1200px) and R5 (grantee bar on the phone) for area A impact (nothing
   written or bypassed).

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A3` (set TEMP and TMP to it).
  Ports 48080-48099 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
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

- `handoff/delivery/WP5_UX_REVIEW_A3.md` and `handoff/delivery/WP5_UX_REVIEW_A3.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-A3/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix).

Return at most 160 words, beginning with your self-reported model: the decision, the
delta proof result, any findings, the mandatory check counts, the digests and the
evidence files.

## Results

(auditor appends here)

### Attempt 1 (2026-10-09, self-reported model claude-opus-5-5): decision PASS

- Decision: **PASS** for area A at a2ea7a48ca7dbb275f5d1f7c3a3003b1658080cb. No finding.
- Model check: strongest author model of the reviewed snapshot is claude-opus-5-5 (WP5-UX-PLAN, T02,
  T04); FIX2-FIX4 ran on claude-sonnet-5-5; this auditor is claude-opus-5-5, so not weaker. Fresh
  context; authored nothing in this round; ran no gate or earlier audit of it.
- Digest of record 0b8428fdbfc40598ba0c468486b4aa62367434727709ce62461a8984f130b77d (789 files) first
  (ls-tree of a2ea7a4 and of HEAD = origin/main = a2ea7a4, 09:46:54Z) and at the end (clean export hashed
  with `git hash-object --no-filters`, path and blob lists equal to ls-tree; ls-tree again;
  `scripts/source-digest.mjs` in the repository; repository status outside `handoff/` empty).
  Evidence `00-digest.txt`.
- Delta proof (589bcff..a2ea7a4): 5 files (+39/-12): `styles.css`, `DayEditor.tsx`,
  `tests/e2e/timesheet.spec.ts`, docs/04 EN and VI line 9. `DayEditor.tsx:84` comment only (TypeScript
  emits identical JavaScript without comments; 1033 non-comment tokens identical). CSS: two `:root`
  tokens and three `@media (max-width: 767px)` rules on `.tools .open-day` / `label` / `input` (wrap,
  flex and min-width from the tokens); no display/visibility/opacity/position/overflow/clip/height/
  z-index/pointer-events/order/transform change; the selectors match only the `OpenDay` form, rendered
  only when `canEdit` (`TimesheetScreen.tsx:378`). Spec: pure insertion (361/361 lines kept, `expect(`
  107 -> 114). No server, domain, API, package or config change. Same phone probe on builds of 589bcff
  and a2ea7a4 at 390x844, 360x844, 320x844, 360x740 and 320x640: 0 regressions (every needed control
  present, visible, inside, not covered; Open day opens the modal editor and writes nothing).

Checks run by me (clean `git archive` export of a2ea7a4; Node v24.21.0; Git Bash; TEMP/TMP/DATA_DIR/
DATABASE_PATH in the task folder)

| Command | Result | Evidence |
|---|---|---|
| `npm ci` | exit 0; "1 high" = dev-only `source-map-js` | `01-npm-ci.txt`, `06-npm-audit.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `02-npm-test.txt` |
| `npm run typecheck`, `npm run lint`, `npm run build` | exit 0 each | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual, both projects | exit 0; 114 tests: 102 passed, 12 skipped by the specs, 0 failed (desktop 50 + 7 skipped; mobile 52 + 5 skipped) | `04-e2e.txt` |
| AC-13 once | exit 0; 1/1 | `05-ac13.txt` |
| `npm audit --omit=dev` / `npm audit` | 0 (exit 0) / 1 high dev-only (exit 1); package files unchanged since 014bd47 | `06-npm-audit.txt` |
| boundary, call sites, body builders vs 014bd47 | server and PDF unchanged; domain only `formatHoursMinutes`; `api.ts` unchanged; 65 endpoints both; 2 new call sites on existing endpoints; builders identical except the leave parse | `11-boundary.txt`, `13-callsites.txt`, `14-*.txt` |
| client-arithmetic scan (25 changed client files) | leave input conversion, break count, OT-leave difference present at 014bd47 only | `16-client-arith.txt` |
| own probes a2ea7a4 (1280/1024/390): A-01, AC-04, R2, bodies, R-07, privacy, AC-16/AC-01, phone | 19 passed, 4 skipped by design, 1 failed on a measurement artefact (sticky app bar over a top-aligned scroll, equal at 589bcff); phone rerun with a centred measurement: 1 passed | `30-*.txt`, `32-*.txt`, `35-*.txt`, `*.json.txt` |
| same flows on a 014bd47 build; comparison | leave bodies 12/12 SAME; clock in/out, batch with reason, sign-off SAME; mismatches 0 | `31-*.txt`, `37-*.txt`, `38-*.txt`, `36-compare-014bd47.txt` |

Area-A results: A-01 closed (36 refusals, 0 PUT, valid bodies equal to 014bd47); no client business
minutes; R-07 five device zones x three layouts, no regrouping, Review in the reporting zone; AC-04 reason,
stale (picker, day fields via Open a day, one-tap breaks), conflict and delete-Escape in three layouts;
AC-16/AC-01 view-only (no write control, no write, only `/api/shared/<owner>/`), edit grantee (4 writes
through `/api/shared/<owner>/`, one via the wrapped Open a day row at 320 px), third user 404 x4; privacy
(0 images on the Timesheet page, 1 on the Review outside the sheet); PDF unchanged, pdf-visual passed,
sign-off bound to the reviewed hash (201).

Info risks re-judged: R2 reproduced; nothing written but the preview, the review's reason field is inert
under the editor, Commit stays disabled, the commit with a reason carries it; no area-A impact (the
unsaved editor note is discarded: area-B nuance). R5 reproduced (first day row bottom 849.7 > tab bar top
788 at 390x844 for a view-only grantee); the owner bar and the sticky "Shared with me" bar keep the owner
visible and nothing is writable; no area-A impact. New R6 (Info, area B, pre-existing): the sticky app bar
covers a control scrolled in with top alignment.

Runtime slips (`90-slips.txt`): one listing piped into `head`; one redirect in a shell without the task
environment created `D:\canedit.txt` (30 lines of public source, no personal data) outside the task
folder; per the coordinator's earlier instruction for the same slip I did not try to delete it; the owner
may delete it. The e2e fixtures chose free loopback ports themselves; I started no other server. All my
background commands completed; nothing left running. Nothing committed; no source, test, doc, board or
STATE edited.

Outputs: `handoff/delivery/WP5_UX_REVIEW_A3.md`, `handoff/delivery/WP5_UX_REVIEW_A3.vi.md`,
`handoff/delivery/evidence/WP5-UX-AUDIT-A3/` (index `00-README.txt`; masked LF text, 2 synthetic PNGs).

Next action: the coordinator records this PASS with WP5-UX-AUDIT-B3 and, if both pass, re-accepts WP5 at
a2ea7a4 through the committer.

Status: done
