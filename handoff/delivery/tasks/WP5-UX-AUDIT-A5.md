# WP5-UX-AUDIT-A5 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-A5; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE4 (PASS).
- Area A recheck of WP5 on the final snapshot: **business integrity, zones, edit paths,
  sharing, isolation and privacy**. Area A passed on edaaa85 (WP5-UX-AUDIT-A4, digest
  b7bbcbc0). Since then WP5-UX-FIX6 changed the shared focus-ring tokens in
  `styles.css`, the zone-note due-time text (`PeriodBar.tsx`, `periodBarModel.ts`
  `dueInZoneText`), tests and docs/04; the owner's commit 49a3ff0 is handoff-only. This
  recheck makes area A current on the new digest. Area B is rechecked in parallel
  (WP5-UX-AUDIT-B5) in a separate context; do not coordinate with it. WP5 is re-accepted
  only if both PASS.
- `reviewed_commit` = 5e104e14dad71268a9185920c04ed0ee2a4b31c2 (the WP5-UX-REGATE4
  `freeze_commit`; HEAD = origin/main); digest of record
  07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635. Audit a clean export
  (or a scratch clone) at 5e104e1; record the digest FIRST and again at the end.
- This audit will supersede WP5-UX-AUDIT-A2, -A3, -A4 and WP5-RECHECK on the board
  (`superseded_by`); its PASS is what accepts area A of WP5.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author). Routing: size M, risk H, novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_A5.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-A.md`.
- `handoff/delivery/WP5_UX_REVIEW_A4.md` (probes and method) and its evidence.
- The Results of WP5-UX-FIX6 and WP5-UX-REGATE4, with their evidence.
- The diff `edaaa85..5e104e1` and the whole round `014bd47..5e104e1`.

## Scope

1. **Delta proof.** From the diff `edaaa85..5e104e1`, show that FIX6 changes no area-A
   behaviour: the zone-note text change uses the same instant (`due_at_utc`) and the same
   zone as before and only changes its format; R-07 still holds (the due instant is
   correct in the display zone, including around a DST change); no request, body,
   calculation or saved value changes; the CSS token change cannot hide or block any
   edit, clock, reason or confirmation control; no area-A assertion removed or weakened.
2. **Area A mandatory checks rerun on 5e104e1** (items 1-7 of `WP5-UX-AUDIT-A.md`,
   reusing A4's probes as a method): endpoints and bodies versus 014bd47 for every edit
   path (side panel, modal editor below 1200px, phone sheet, in-cell picker with its
   review, batch, clock, review, sign-off); the client computes no business minutes;
   A-01 still closed; R-07 with a device-zone probe and the zone-note due time; AC-04;
   AC-16 and AC-01; privacy (signature image only on the Review); PDF/AC-06/07/10
   unchanged; `npm test`; e2e specs day-editor, sharing, isolation, review, submission,
   timesheet, pdf-visual and the new focus-ring spec on both projects; AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A5` (set TEMP and TMP to it).
  Ports 48220-48239 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
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

- `handoff/delivery/WP5_UX_REVIEW_A5.md` and `handoff/delivery/WP5_UX_REVIEW_A5.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-A5/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix).

Return at most 160 words, beginning with your self-reported model: the decision, the
delta proof result, any findings, the mandatory check counts, the digests and the
evidence files.

## Results

(auditor appends here)

### Attempt 1 (2026-10-09, self-reported model claude-opus-5-5): PASS

- Decision: **PASS**; no finding. Review `handoff/delivery/WP5_UX_REVIEW_A5.md` (+ `.vi.md`); evidence
  `handoff/delivery/evidence/WP5-UX-AUDIT-A5/` (107 masked LF files, index `00-README.txt`).
- Model check: strongest author of the snapshot claude-opus-5-5 (WP5-UX-PLAN, T02, T04, FIX5); FIX6 ran on
  claude-sonnet-5-5; this auditor is claude-opus-5-5, so not weaker. Fresh context; authored nothing in this round.
- Digest of record 07c3ca00b3408af0c6337e5159635675cead86fbdc1c63f2454c2346a27ce635 (790 files) recorded first and at
  the end: ls-tree of 5e104e1 and HEAD, `npm run digest`, a clean `git archive` export hashed with
  `git hash-object --no-filters` (equal to ls-tree; unchanged after all checks). HEAD = origin/main = 5e104e1.
  Evidence `00-digest.txt`.
- Delta proof (scope 1), result: FIX6 changes no area-A behaviour.
  - Zone note: `PeriodBar.tsx:73` `instantText(period.due_at_utc, zone)` -> `dueInZoneText(period.due_at_utc, zone)`;
    both use the same `formatInZone(zone, parseUtcInstant(...))` date and time; format only. Unit sweep 20316
    checks (59 DST transitions in 17 zones, 1095 due days) x 7 device zones, 0 failures (`12b-…`); browser 8 zones x
    7 periods x 3 layouts on 5e104e1 and edaaa85 builds: 168/168 rows same due_at_utc and local date/time, 42 across
    a DST change (`34-…`, `35-…`, `36-compare.txt`).
  - No request/body/calculation/saved-value change: 0 write call texts and 12/12 body builders unchanged since
    edaaa85; `dist/server` byte-identical at 014bd47, edaaa85, 5e104e1 (`11b-…`, `13-…`, `14-…`).
  - CSS: only `--focus-ring`, `--focus-ring-inset` and one `box-shadow` (`12a-…`); focus probe 1280/1024/390 light and
    dark: 25-29 controls focus-visible, visible, hit-testable; 170/218 neighbour hit-tests identical with and without
    the ring; flows completed by keyboard; same facts and writes on edaaa85 (`33-…`, `33b-…`, `36b-…`).
  - Tests: two lines replaced (import, response type), assertions added only (`12c-…`).
- Mandatory checks on a clean export of 5e104e1 (Node v24.21.0):

| Command | Result | Evidence |
|---|---|---|
| `npm ci` | exit 0 (1 dev-only high advisory; `npm audit --omit=dev` 0) | `01-…`, `06-…` |
| `npm test` | exit 0, 82 files, 1821 passed | `02-npm-test.txt` |
| typecheck, lint, build | exit 0, 0, 0 | `07-…`, `03-…` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual, focus-ring (desktop + mobile) | exit 0: 124 tests, 109 passed, 15 skipped by spec conditions, 0 failed | `04-e2e.txt`, `04b-…` |
| AC-13 once | exit 0, 1/1 | `05-ac13.txt` |
| own probes 5e104e1 | 27 passed (bodies 3, A-01/AC-04/AC-16/AC-01/R-07/privacy 15, zone note 3, focus 6) | `30-…`, `31-…`, `33-…`, `34-…` |
| comparison builds | 014bd47 4 passed; edaaa85 9 passed; comparisons mismatches=0 | `32-…`, `32b-…`, `33b-…`, `35-…`, `36-…`, `36b-…` |

- Area A on 5e104e1: bodies of every edit path (1280 side panel, 1024 modal editor, 390 sheet, picker with review,
  batch, clock, review sign-off) equal 014bd47; client computes no business minutes; A-01 closed (36 refusals, 0 PUT);
  R-07 device-zone probe incl. the zone-note due time; AC-04; AC-16/AC-01; privacy (signature image only on the
  Review); PDF/AC-06/07/10 unchanged.
- Risks (Info): R1 dev-only advisory; R5 unchanged; N3 (area B, not FIX6) hover paint replaces the focus ring on a
  hovered focused button or label trigger (`styles.css:496-500`/`:506-508`, `:2216-2220`/`:2222-2225`); N4 missing
  space in `tests/client/periodBarModel.test.ts:3`.
- Runtime: Git Bash; TEMP/TMP/DATA_DIR/DATABASE_PATH in the task folder; harness-chosen loopback ports, no own
  server; nothing left running. Slip: one `2>/dev/null` on a grep in a wait loop (no file written). Two early
  focus-probe runs failed on probe design and were corrected before the recorded run.
- Next action: the coordinator records this PASS (with WP5-UX-AUDIT-B5) and, if both pass, re-accepts WP5 at 5e104e1
  through the committer.

Status: done
