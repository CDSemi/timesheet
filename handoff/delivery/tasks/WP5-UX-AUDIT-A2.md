# WP5-UX-AUDIT-A2 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-A2; package WP5; kind audit;
  attempt 1; depends on WP5-UX-REGATE (PASS).
- Area A re-audit of WP5 after the UI redesign fix round: **business integrity, zones,
  edit paths, sharing, isolation and privacy**, on the new snapshot. The first area-A
  audit (WP5-UX-AUDIT-A, FIX REQUIRED on 831f760) found A-01 (malformed leave input
  saved as a different leave), answered by WP5-UX-FIX2. Area B is re-audited in
  parallel (WP5-UX-AUDIT-B2) in a separate context; do not coordinate with it. WP5 is
  re-accepted only if both PASS.
- `reviewed_commit` = 589bcff5541a603abad696a3303dbea11cccb4a7 (the WP5-UX-REGATE
  `freeze_commit`; HEAD = origin/main); digest of record
  8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e. Audit a clean export
  (or a scratch clone) at 589bcff; record the digest FIRST and again at the end.
- This audit supersedes WP5-RECHECK (the accepted WP5 PASS on 014bd47 / 150420e7) on the
  board through `superseded_by`.
- Profile/routing: timesheet-auditor (xhigh), model opus (never weaker than the
  strongest author). Routing: size L, risk H, novelty no.
- Fresh context: you authored none of WP5-UX-PLAN, T01-T06, FIX1-FIX3, the gates or the
  earlier audits of this round. Do not rely on authors', the verifier's or earlier
  auditors' summaries as proof: trace production code and reproduce.
- Language: the task record is English; `handoff/delivery/WP5_UX_REVIEW_A2.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk; the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-A.md`.
- `handoff/delivery/WP5_UX_REVIEW_A.md` (the earlier findings and probes) and its
  evidence, which you may reuse as a method but must rerun yourself.
- The Results of WP5-UX-FIX2, WP5-UX-FIX3 and WP5-UX-REGATE, with their evidence.
- The diff `014bd47..589bcff` of `src/` and `tests/` (the whole round), and in particular
  `831f760..589bcff` (the fix round).

## Scope

1. **A-01 closed.** Reproduce the first audit's leave-input cases at 589bcff (hours "2-"
   with 30 minutes; hours 4 with minutes "3-"; also "e", "1.5", "-1", empty): malformed
   input is refused with an accessible error and no `PUT /api/days/:date`; valid input
   sends the same `leave_minutes` as at 014bd47; empty saves 0 as before. Check the
   FIX2 unit and e2e tests would fail without the fix (for example by reverting the fix
   in a scratch copy, never in the repository).
2. **The whole area A scope again on the new snapshot**, items 1-7 of
   `WP5-UX-AUDIT-A.md`: no business behaviour change (endpoints and bodies versus
   014bd47); the client computes no business minutes; R-07 zones with a device-zone
   probe; AC-04 edit paths (now including the modal editor below 1200px from FIX3:
   reason, conflict, stale version, DST, overnight); AC-16 and AC-01 sharing and
   isolation (including the modal editor and the compact phone layout); privacy
   (signature image only on the Review) and PDF/AC-06/AC-07/AC-10; mandatory checks
   (`npm test`; e2e specs day-editor, sharing, isolation, review, submission, timesheet,
   pdf-visual on both projects; AC-13 once).
3. **No new risk from the fix round.** The modal editor below 1200px must not lose
   unsaved-input protections or bypass any confirmation; the compact phone layout must
   not hide or drop any control an employee needs (Clock in/out, Open a day, review
   entry), and a grantee view must still hide owner-only controls.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A2` (set TEMP and TMP to it).
  Ports 47990-47999 and 48020-48029 for anything you start. Set `DATA_DIR` and
  `DATABASE_PATH` inside the task folder for every CLI or server run; never touch
  `%LOCALAPPDATA%\timesheet-dev`. No Docker.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS, NO `| node`,
  NO `| python`, NO `node -` OR `python -`. NEVER PIPE OUTPUT INTO `head` OR `tail`.
  NEVER REDIRECT TO `/dev/null` OR `nul`.** Write scripts with the Write tool and run
  them by path; python only as the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`;
  put Node 24 first on PATH before any node call; first shell call `node --version`.
- **Create files ONLY inside the task folder or the evidence folder; never redirect
  output to any other path** (the first area-A audit left a stray file at the D: drive
  root and had to stop).
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Synthetic data and local capture
  only. Leave nothing running.

## Output

- `handoff/delivery/WP5_UX_REVIEW_A2.md` and `handoff/delivery/WP5_UX_REVIEW_A2.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence (scripts as `*.mjs.txt` / `*.py.txt` / `*.ts.txt`,
  screenshots `*-synthetic.png`) in `handoff/delivery/evidence/WP5-UX-AUDIT-A2/`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED, with findings listed separately
  (ID, severity, file:line, evidence, required fix), and the disposition of A-01.

Return at most 180 words, beginning with your self-reported model: the decision, the
A-01 disposition, any new findings, the mandatory check counts, the digests and the
evidence files.

## Results

(auditor appends here)

### Attempt 1 (2026-10-09, self-reported model claude-opus-5-5): PASS

- Decision: **PASS** for area A at 589bcff. No finding. **WP5-UX-A-01 closed.**
- Model check: the strongest author model of the reviewed snapshot on the board is claude-opus-5-5
  (WP5-UX-PLAN, T02, T04; FIX2/FIX3 claude-sonnet-5-5); this auditor is claude-opus-5-5, so not weaker.
  Fresh context; I authored nothing in this round and ran no gate or earlier audit of it.
- Digest of record 8c07aac5fbd539b2f43ae8a21fb456f2be950d628f7eb9ca647430c7469f0a2e (789 files,
  `handoff/` excluded): recorded first (ls-tree of 589bcff and of HEAD, 2026-10-09T08:31:05Z) and at the
  end (clean `git archive` export hashed with `git hash-object --no-filters`, path and blob lists equal to
  the tree; ls-tree of 589bcff and HEAD; `scripts/source-digest.mjs` run read-only in the repository);
  HEAD = origin/main = 589bcff throughout; `git status` outside `handoff/` empty. Evidence `00-digest.txt`.
- Runtime: Node v24.21.0 portable first on PATH (first shell call `node --version`); Git Bash only;
  TEMP/TMP, npm cache, DATA_DIR, DATABASE_PATH and screenshots inside
  `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A2`; no Docker; no stdin-fed script, no pipe into head or tail,
  no redirect to /dev/null or nul; files written only in the task folder, the evidence folder and my
  three owned handoff files. I started no server of my own; the export's e2e fixtures (its own harness,
  which I may not change) bound OS-chosen loopback ports and stopped and removed their servers and temp
  data at the end of every run, as in the earlier gates. Nothing left running; no permission denial; no
  ENOSPC.

Mandatory checks (clean export of 589bcff)

| Command | Result | Evidence |
|---|---|---|
| `npm ci` | exit 0 ("1 high severity vulnerability": dev-only `source-map-js`; `npm audit --omit=dev` 0) | `01-npm-ci.txt`, `06-npm-audit.txt` |
| `npm test` | exit 0; 82 files, 1820 tests passed | `02-npm-test.txt` |
| `npm run build`; typecheck; lint | exit 0; 0; 0 | `03-build.txt`, `07-typecheck-lint.txt` |
| e2e day-editor, sharing, isolation, review, submission, timesheet, pdf-visual, both projects | exit 0; 108 tests: 99 passed, 9 skipped by the specs, 0 failed (desktop 50 + 4 skipped; mobile 49 + 5 skipped) | `04-e2e-mandatory-both-projects.txt` |
| AC-13 once | exit 0; 1/1 | `05-ac13.txt` |

Scope results

1. A-01 closed. Own probe at 589bcff on 1280, 1024 (modal side panel) and the phone: hours "2-" + 30 min,
   hours 4 + minutes "3-", hours "2-" + 0 min, "e", "1.5", "-1" in either field, 0 h 60 m, 25 h, 24 h 01 m:
   each refused with the `role="alert"` message inside the Partial leave fieldset, `aria-invalid` and
   `aria-describedby` on the offending field only, no `PUT /api/days/:date`, nothing stored. Valid
   entries (empty, 2 h 30 m, 4 h 00 m typed, 0 h 45 m, 8 h 00 m, 24 h 00 m refused by the server rule
   `leave_exceeds_required` as at 014bd47) send a body equal to the 014bd47 body for the same leave
   (clean 014bd47 build, desktop and phone; mismatches=0); empty saves 0; a refused entry corrected in
   place sends 150. Revert proofs in a scratch copy: R1 (both FIX2 files at 831f760) unit 2 failed + e2e
   failed on both projects; R2 (form only) e2e failed; R3 (submit-time `validity.badInput` read removed)
   e2e failed at "e"; R0 control passed. Evidence `21`-`24`, `30`-`33`, `leave-*.json.txt`.
2. Whole area A: server and PDF unchanged since 014bd47; domain only `formatHoursMinutes` (equal to the
   PDF's); `api.ts` unchanged; same 65 endpoints, the fix round changes no call site; write bodies
   unchanged (`10`, `11`, `14`, `15`). Client computes no business minutes (`12`). R-07 device-zone probe
   (five zones, three layouts) passed (`r07-*`). AC-04 through the picker, the 1280 panel, the 1024 modal
   panel and the phone sheet: reason, stale (picker, day fields, one-tap), conflict, delete confirmation
   (`ac04-*`); the whole e2e suite at 1024 passed 80, skipped 5, and failed only the two tests written
   for the 1280 non-modal panel (expected at 1024 by docs/04 line 59) (`41`). AC-16/AC-01 in three
   layouts including the modal editor and the compact phone layout (`sharing-*`). Privacy: no signature
   image or request on the Timesheet page, one image on the Review (`privacy-*`); PDF unchanged and
   pdf-visual passed.
3. No new risk: unsaved input kept across 1280/1024/700/1280 with no write; Escape never writes; the
   page behind the modal editor is inert; nested review keeps its reason rule; all needed phone controls
   present, visible, inside 390/360/320px and working; grantee view hides owner-only controls
   (`risk-desktop.json.txt`, `phone-controls-mobile.json.txt`, `sharing-*`).

Risks (Info, not findings): R1 dev-only advisory; R2 resize below 1200px with a picker review open puts
the re-shown modal editor above the review, so the first Escape closes the editor (nothing written);
R3 exponent text ("1e2") now refused where 014bd47 accepted it; R4 FIX2 unit tests alone miss a form
regression, the FIX2 e2e catches it; R5 (outside area A) the grantee's owner bar pushes the first day
row below the phone's first screen. Probe-side corrections, kept as history: the first leave run expected
24 h 00 m to save (the server's 480-minute rule refuses it; `20-leave-589-run-first.txt`), the first
1024 run used a project name the specs treat as a phone (`40-e2e-1024-first-run.txt`), and the first
phone run compared innerText with textContent (`45-phone-run-first.txt`); each was rerun after fixing
the probe, not the source.

Outputs: `handoff/delivery/WP5_UX_REVIEW_A2.md` and `.vi.md`; masked LF evidence (71 text files, 2
synthetic screenshots) in `handoff/delivery/evidence/WP5-UX-AUDIT-A2/`; privacy scan of the evidence:
0 user-profile paths or non-example emails, 0 password values, 0 CR bytes (`mask.mjs.txt` holds only the
masking patterns).

Next action: the coordinator records this PASS with WP5-UX-AUDIT-B2 and, if both pass, re-accepts WP5 at
589bcff through the committer.

Status: done
