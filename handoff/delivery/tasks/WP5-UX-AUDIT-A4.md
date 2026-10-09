# WP5-UX-AUDIT-A4 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-A4; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE3 (PASS).
- Area A recheck of WP5 on the final snapshot: **business integrity, zones, edit paths,
  sharing, isolation and privacy**. Area A passed on a2ea7a4 (WP5-UX-AUDIT-A3, digest
  0b8428fd). Since then WP5-UX-FIX5 changed `src/client/DayEditor.tsx` logic (the
  editor defers its modal/non-modal switch until no other modal dialog is open, using a
  MutationObserver), two token values in `styles.css`, two e2e specs and docs/04 line 55.
  This recheck makes area A current on the new digest. Area B is rechecked in parallel
  (WP5-UX-AUDIT-B4) in a separate context; do not coordinate with it. WP5 is re-accepted
  only if both PASS.
- `reviewed_commit` = edaaa852370128ca9bdf206d730f3849346ba994 (the WP5-UX-REGATE3
  `freeze_commit`; HEAD = origin/main); digest of record
  b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873. Audit a clean export
  (or a scratch clone) at edaaa85; record the digest FIRST and again at the end.
- This audit will supersede WP5-UX-AUDIT-A2, WP5-UX-AUDIT-A3 and WP5-RECHECK on the board
  (`superseded_by`); its PASS is what accepts area A of WP5.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author; FIX5 ran on opus). Routing: size M, risk H, novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not rely on authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_A4.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-A.md`.
- `handoff/delivery/WP5_UX_REVIEW_A3.md` and `WP5_UX_REVIEW_A2.md` (probes, Info risks)
  and their evidence, which you may reuse as a method.
- The Results of WP5-UX-FIX5 and WP5-UX-REGATE3, with their evidence.
- The diff `a2ea7a4..edaaa85` and the whole round `014bd47..edaaa85`.

## Scope

1. **Delta proof.** From the diff `a2ea7a4..edaaa85`, show that the DayEditor change
   alters only when the editor switches between modal and non-modal presentation, never
   what is saved: no request is sent, skipped, duplicated or reordered by the new
   deferral; unsaved input is not lost or submitted by a deferred switch; the reason
   prompt, conflict confirmation and stale-version handling are unchanged; the
   MutationObserver is disconnected on unmount (no leak that could act on a later day).
   The CSS change cannot hide or remove an edit, clock, reason or confirmation control.
   No server, API, request body or calculation change; no area-A assertion removed or
   weakened.
2. **Area A mandatory checks rerun on edaaa85** (items 1-7 of `WP5-UX-AUDIT-A.md`,
   reusing A2/A3 probes as a method): endpoints and bodies versus 014bd47 for every edit
   path (side panel, modal editor below 1200px, phone sheet, in-cell picker with its
   review, batch, clock, review, sign-off), including a save made after a deferred mode
   switch; the client computes no business minutes; A-01 still closed; R-07 with a
   device-zone probe; AC-04; AC-16 and AC-01; privacy (signature image only on the
   Review); PDF/AC-06/07/10 unchanged; `npm test`; e2e specs day-editor, sharing,
   isolation, review, submission, timesheet, pdf-visual on both projects; AC-13 once.
3. **Info risks.** Re-judge A2 R2 (now fixed by FIX5) and R5 for area-A impact.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A4` (set TEMP and TMP to it).
  Ports 48150-48169 for anything you start. Set `DATA_DIR` and `DATABASE_PATH` inside the
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

- `handoff/delivery/WP5_UX_REVIEW_A4.md` and `handoff/delivery/WP5_UX_REVIEW_A4.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-A4/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix).

Return at most 160 words, beginning with your self-reported model: the decision, the
delta proof result, any findings, the mandatory check counts, the digests and the
evidence files.

## Results

(auditor appends here)

### Attempt 1 (2026-10-09, self-reported model claude-opus-5-5): PASS

- Decision: **PASS** (no finding). Review: `handoff/delivery/WP5_UX_REVIEW_A4.md` (+ `.vi.md`); evidence:
  `handoff/delivery/evidence/WP5-UX-AUDIT-A4/` (index `00-README.txt`, 85 LF files, 0 CR bytes, no
  user-profile path, user name or non-example.invalid address; `38-evidence-check.txt`).
- Model check: the strongest author of edaaa85 is claude-opus-5-5 (WP5-UX-PLAN, T02, T04, FIX5); this
  auditor is claude-opus-5-5, so not weaker. Fresh context; authored nothing in this round; ran no gate
  or earlier audit of it.
- Digest of record b7bbcbc0a5bbb097a5547b441d1228f20963445e86b0429169cb7ab47980a873 (789 files),
  recorded first (ls-tree of edaaa85, `npm run digest`, clean `git archive` export hashed with
  `git hash-object --no-filters`, path/blob list equal to ls-tree) and at the end (export re-hashed and
  unchanged, ls-tree of HEAD, `scripts/source-digest.mjs`; nothing changed outside `handoff/`). HEAD =
  origin/main = edaaa85. Evidence `00-digest.txt`.

Mandatory checks (clean export of edaaa85; Node v24.21.0 portable; Git Bash; TEMP/TMP/DATA_DIR/DATABASE_PATH
in the task folder)

| Command | Result | Evidence |
|---|---|---|
| `npm ci` | exit 0 ("1 high" = dev-only `source-map-js`; `npm audit --omit=dev` 0, exit 0) | `01-npm-ci.txt`, `06-npm-audit.txt` |
| `npm test` | exit 0, 82 files, 1820 tests passed | `02-npm-test.txt` |
| typecheck, lint, build | exit 0 each | `07-typecheck-lint.txt`, `03-build.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual (both projects) | exit 0: 120 tests, 105 passed, 15 skipped by the specs, 0 failed (desktop 52 + 8, mobile 53 + 7) | `04-e2e.txt`, `04b-e2e-per-spec.txt` |
| AC-13 once | exit 0, 1/1 | `05-ac13.txt` |

Delta proof (FIX5, a2ea7a4..edaaa85): PASS
- Static (`12-delta-proof.txt`, problems=0): `DayEditor.tsx` is identical outside the mode-switch effect and the
  new `otherModalOpen` helper; `apply()` runs exactly the old effect statements; immediate when the editor is
  not open or no other `dialog:modal` exists; the added code calls no request, setter, callback prop, submit,
  click, load, reason or timer; the observer disconnects before `apply()` and in the effect cleanup. CSS: two
  token values used only as `flex-basis`/`min-width` of the phone `.tools .open-day` label and input (the
  `OpenDay` form, edit rights only); no hide/move/clip/block property. Tests: day-editor spec pure insertion;
  timesheet spec 3 lines changed in the phone date-width test (area B); no area-A assertion removed or weakened.
- Run time (`probe-a4-deferred`, desktop, MutationObserver instrumented, 13 passed twice; `36-compare.txt`
  mismatches=0): saves after a deferred switch (day fields, reason review committed, stale refusal, conflict
  commit and a new session, clock-out dialog, 1280->1024->1280, one-tap confirmation and delete) send the same
  paths and bodies as controls without the switch and as 014bd47; every `/api` request sequence equals the
  control (17 = 17, 17 = 17, 22 = 22, same order); typed input kept, never submitted by the switch; one observer
  per deferral, always disconnected (also on unmount by a route change, after which nothing acted on a later
  day); 0 uncaught page errors. Phone controls with the FIX5 tokens at 390/375/360/320: 15 per width present,
  visible, inside and not covered (`33-probe-phone.txt`).

Area-A checks on edaaa85 (own probes at 1280, 1024 and 390: 31 passed, 26 skipped by design; 014bd47 build: 4
passed): bodies vs 014bd47 SAME for leave (18 pairs), clock, sign-off (bound to `payload_hash`), batch with a
reason, editor day fields and new session; client computes no business minutes; A-01 36 refusals, 0 PUT; R-07
five device zones, no regrouping; AC-04 reason, stale, conflict, Delete-Escape; AC-16/AC-01 view-only, edit
grantee via `/api/shared/<owner>/`, third user 404; privacy (signature image on the Review only); PDF code and
`pdf-visual.spec.ts` unchanged since 014bd47, pdf-visual passed.

Info risks: R1 unchanged (dev-only advisory). R2 re-judged: closed by FIX5 (review keeps top layer, focus and the
first Escape; unsaved note kept; nothing written). R5 unchanged, no area-A impact (view-only first row 849.7 px vs
tab bar 788 px). New, outside area A: N1 focus on BODY after a save in the modal editor at 1024 px (save path
unchanged since a2ea7a4); N2 the O-5 width check strength is for area B.

Runtime: no permission denial; no pipe into head/tail, no stdin-fed script, no `/dev/null`; files only in the task
folder and the evidence folder; the e2e harness chose its own loopback ports; I started no server; nothing left
running. Nothing committed; source, tests, docs, board and STATE untouched.

Next action: the coordinator records this PASS with WP5-UX-AUDIT-B4 and, if both pass, re-accepts WP5 at
edaaa85 through the committer.

Status: done
