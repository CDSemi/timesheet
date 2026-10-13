# WP5-UX-AUDIT-A7 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-AUDIT-A7; package WP5; kind
  audit; attempt 1; depends on WP5-UX-REGATE6 (must be PASS before dispatch).
- Area A recheck of WP5 on the final snapshot, limited to the delta. Area A covers
  **business integrity, zones, edit paths, sharing, isolation and privacy**.
- Area A passed on bf954c0 (WP5-UX-AUDIT-A6, digest b7c011d2). Since then, WP5-UX-FIX8
  changed only `src/client/styles.css` (a one-row compact shell bar below 768px for the
  "Shared with me" switcher) and `tests/e2e/sharing.spec.ts` (two new mobile tests). This
  recheck makes area A current on the new digest.
- Area B is rechecked in parallel (WP5-UX-AUDIT-B7) in a separate context; do not
  coordinate with it. WP5 is re-accepted only if both PASS.
- `reviewed_commit` = 255ba17d6bf891c0ff779d4a4f518e0d2998cee8, the WP5-UX-REGATE6
  `freeze_commit`. HEAD = origin/main, unless only handoff/ changed since. Digest of
  record: b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files).
  Audit a clean export (or a scratch clone) at 255ba17. Record the digest FIRST and again
  at the end.
- This audit will supersede WP5-UX-AUDIT-A6 on the board (`superseded_by`), together
  with the older audits that point to A6. Its PASS is what accepts area A of WP5.
- Profile/routing: timesheet-auditor (xhigh), model opus. It must never be weaker than
  the strongest author of the snapshot (claude-opus-5-5). Routing: size S, risk M,
  novelty no.
- Fresh context: you authored nothing in this round and ran no gate or earlier audit of
  it. Do not treat authors', the verifier's or earlier auditors' summaries as proof.
- Language: the task record is English. `handoff/delivery/WP5_UX_REVIEW_A7.md` and its
  `.vi.md` follow the REVIEW form in `handoff/templates/`.

## Read

- AGENTS.md from disk, and the reading list of `handoff/delivery/tasks/WP5-UX-AUDIT-A.md`.
- `handoff/delivery/WP5_UX_REVIEW_A6.md`, for its probes and method.
- The Results of WP5-UX-FIX8 and WP5-UX-REGATE6, with their evidence.
- The diff `bf954c0..255ba17` outside handoff/.

## Scope

1. **Delta proof.** From the diff, show that FIX8 changes no area-A behaviour:
   - only CSS and one spec changed;
   - no server, domain, API client, request, body, calculation or saved value changed;
   - no area-A assertion was removed or weakened.
   Then check the following in the built app at 390 and 320, by keyboard and by touch:
   - the switcher still reaches exactly the same routes (the person's own timesheet and
     each shared owner);
   - shared views stay read-only where AC-16 requires;
   - owner-only controls stay hidden;
   - no other owner's data is reachable (isolation);
   - no edit, clock, reason or confirmation control is hidden or blocked by the new bar,
     with and without a received share, with and without the zone note.
2. **Area A checks rerun on 255ba17**, reusing A6's probes as a method:
   - endpoints and bodies versus 014bd47, for the sharing paths and one edit path per
     layout (side panel, modal editor, phone sheet);
   - R-07, using a device-zone probe and the zone-note due time;
   - AC-16 and AC-01;
   - privacy: the signature image appears only on the Review;
   - server and domain unchanged since 014bd47, except `src/domain/format.ts`;
   - `npm test`;
   - the e2e specs sharing, isolation, day-editor, timesheet, review, submission and
     pdf-visual, on both projects;
   - AC-13 once.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A7`. Set TEMP and TMP to it.
- Use ports 48400-48419 for anything you start.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- No Docker.
- Give each Playwright run its own output folder, and give probe actions a short
  timeout.
- Use Git Bash only. Never use cmd.exe, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES), NO `| node`, NO `| python`, NO `node -e`, NO `node -` OR `python -`. NEVER PIPE
  OUTPUT INTO `head` OR `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.**
  - Write scripts with the Write tool and run them by path.
  - Run python only as the workflow Python
    `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
  - Put Node 24 first on PATH (with `cygpath -u`) before any node call. Make the first
    shell call `node --version`.
- **Create files ONLY inside the task folder or the evidence folder.** Never write on
  `D:\` or in the repository root.
- Stop only processes you spawned, through their own handle. Never kill by PID. Never
  remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Never edit source, tests, docs, the board or STATE. Use synthetic data and local
  capture only. Leave nothing running.
- In the review, Results and evidence:
  - write no email address except the full synthetic `@example.invalid` form;
  - write no real profile path (use `<user>`);
  - mask probe-truncated addresses as `<email>`.

## Output

- `handoff/delivery/WP5_UX_REVIEW_A7.md` and `handoff/delivery/WP5_UX_REVIEW_A7.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-UX-AUDIT-A7/`. Save
  scripts as `*.mjs.txt`, `*.py.txt` or `*.ts.txt`, and screenshots as
  `*-synthetic.png`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately, each
  with ID, severity, file:line, evidence and required fix.

Return at most 140 words, beginning with your self-reported model. Include:
- the decision;
- the delta proof result;
- any findings;
- the check counts;
- the digests;
- the evidence files.

## Addendum for attempt 2 (coordinator, 2026-10-13)

Attempt 1 (2026-10-09) stopped early when the subscription's weekly usage limit was
reached. It wrote no record in the repository. Its background processes may still have
held its ports or task folder. For attempt 2:
- use the task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A7-2` and ports 48440-48459,
  instead of the ones named above;
- if a port you need is busy, pick another one in that range and record it; never stop a
  process you did not start;
- ignore anything left in the attempt 1 task folder;
- HEAD may have moved past 255ba17 through handoff-only commits. Record HEAD and
  origin/main, and confirm that nothing outside handoff/ differs from 255ba17.

## Results

(auditor appends here)

### Attempt 2 checkpoint (2026-10-13 19:18Z, self-reported model claude-opus-5-5): in progress, no decision yet

- Digest first: 255ba17 = HEAD = origin/main; b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe, 793 files,
  equal in the ls-tree form, `npm run digest` and a clean `git archive` export; nothing outside `handoff/` differs.
- Done in the clean export (task folder `D:\.claude-tmp\timesheet\WP5-UX-AUDIT-A7-2`): `npm ci`, `npm test` (82 files,
  1823 passed), typecheck, lint, build (all exit 0); AC-13 once (1/1); the seven e2e specs on both projects: 103 passed,
  17 skipped by project conditions, 4 failed: `isolation.spec.ts:94` and `:145` on desktop and mobile. Root cause being
  confirmed: the spec seeds `pastFreeWorkdays()[0]` = 2026-10-12 (the in-progress period) while the Timesheet displays
  the current period 09/28-10/11 until its payroll date 10/16; not a FIX8 change.
- Delta proof so far: one commit, `styles.css` +25 and `sharing.spec.ts` +51, 0 deletions; server and domain builds
  byte-identical; client JS identical except its own source-map name; switcher by keyboard, touch and pointer at 390 and
  320 (zone note shown and not) lands on the same routes with the same requests as bf954c0; computed layout equal at
  768 px and wider. The A6-method area-A probes passed 18/18 on 255ba17 with bodies equal to 014bd47.
- Remaining: sticky/keyboard-walk comparison, the isolation follow-up (bf954c0 now, a seed-date variant), the Settings
  sharing paths vs 014bd47, digest after, evidence copy, the review pair and the decision.

### Attempt 2 result (2026-10-13 19:30Z, self-reported model claude-opus-5-5): FIX REQUIRED

- Decision: **FIX REQUIRED**, one finding, WP5-UX-A7-01 (Low, tests only, older than FIX8). The delta proof passes:
  FIX8 changes no area-A behaviour, and every area-A behaviour checked on 255ba17 passed.
- Model check: the strongest author model of the snapshot is claude-opus-5-5 (WP5-UX-PLAN, T02, T04, FIX5, FIX7; FIX8
  ran on claude-sonnet-5-5); this auditor is claude-opus-5-5, not weaker. Fresh context; authored nothing in this round.
- Digest b07727b2f95b4e202e9e0dc391512b051b288218ceb3e2ffe93f0f1c14a95abe (793 files) first and at the end, in the
  ls-tree form, `npm run digest` and the clean export (unchanged after all checks). HEAD = origin/main = 255ba17 before
  and after; nothing outside `handoff/` differs.
- Checks run by me (clean export, Node v24.21.0, Git Bash, TEMP/TMP/DATA_DIR/DATABASE_PATH in the task folder):

| Check | Result |
|---|---|
| `npm ci`; `npm test`; typecheck; lint; build | exit 0 each; 82 files, 1823 tests; no deprecation line; `npm audit --omit=dev` 0 |
| e2e sharing, isolation, day-editor, timesheet, review, submission, pdf-visual, both projects | exit 1: 103 passed, 17 skipped, 4 failed (`isolation.spec.ts:94`, `:145`, desktop and mobile); all other per-spec counts equal A6's, plus FIX8's 2 mobile tests |
| AC-13 once | exit 0, 1/1 |
| isolation follow-up | bf954c0's unchanged spec: the same 4 failures; 255ba17's again: the same; `shell.spec.ts:67` fails for the same date; the seed-date variant (assertions unchanged): 6/6 passed |
| A6-method probes on 255ba17 (1280, 1024, 390) | 18/18 passed: bodies equal 014bd47's, A-01 (36 refusals, 0 PUT), AC-04, R-07 + zone-note due, privacy, AC-16/AC-01 |
| Settings sharing paths vs 014bd47 | 3 + 2 passed; 63 steps equal |
| delta probes on 255ba17 and bf954c0 | layout 2+2, switcher 4+4 (keyboard, touch, pointer; 390 and 320; zone note shown and not), sticky 8+8 (936 focus checks, 312 pointer and 312 touch trials, 592 Tab stops on 255ba17; 0 failures beyond 4 explained date-input rows, bf954c0 5) |
| comparisons | missing=0 mismatches=0 (338 SAME) |

- Finding WP5-UX-A7-01 (Low): `tests/e2e/isolation.spec.ts:51-53` seeds `pastFreeWorkdays()[0]`, a day of the in-progress
  period, but asserts it on the displayed period (`:105-108`, `:188-189`). From the second day of a period through the
  previous period's payroll date (`currentPayPeriod`, `src/domain/periods.ts:149-164`), 4 of every 14 days and now until
  2026-10-16 (Los Angeles), the spec fails on every build. Same pattern: `tests/e2e/shell.spec.ts:68`. Required fix
  (tests only): seed from `displayedPeriodFreeWorkdays()`, no assertion weakened, and run both specs on both projects
  inside and outside the window.
- Delta proof: one commit; `styles.css` +25 (a token and four declarations below 768px: column gap, flex basis, label
  block padding, label font size) and `sharing.spec.ts` +51 (two mobile tests), 0 deletions; built server and domain
  byte-identical, client JS the same code; call sites, endpoints and body builders unchanged; layout equal at 768 px and
  wider; the switcher lands on the same routes with the same requests as bf954c0 by keyboard, touch and pointer at 390
  and 320; AC-16 and isolation hold; no edit, clock, reason or confirmation control is hidden or blocked, with and
  without a received share and the zone note; no area-A assertion removed or weakened.
- Review: `handoff/delivery/WP5_UX_REVIEW_A7.md` and `.vi.md`. Evidence: `handoff/delivery/evidence/WP5-UX-AUDIT-A7/`
  (index `00-README.txt`).
- Runtime: no stdin-fed script, no null-device redirect, no server of my own (no port of 48440-48459 bound), nothing
  left running. Slips: one `cat … | tail -c 600` to read a log end (against the rule; no data lost); one probe launch
  with a relative output path wrote nothing and was rerun.
- Next action: the coordinator opens a bounded tests-only fix for WP5-UX-A7-01, then freeze, gate and a fresh area-A
  recheck of that delta (running `isolation.spec.ts` and `shell.spec.ts` before 2026-10-17 00:00 Los Angeles and once
  after).

Status: done
