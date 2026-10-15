# WP5-UX2-ACCEPT-DOCS dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX2-ACCEPT-DOCS; package WP5; kind
  documentation; attempt 1; depends on WP5-UX2-AUDIT2 (PASS).
- Purpose: bring the pilot packet and the WP5 handoff up to the WP5 snapshot re-accepted
  after the owner-requested UI change round 2 (WP5-UX2). This is a handoff-only change:
  no file outside `handoff/` may change.
- Profile/routing: timesheet-light (effort low, fixed by the profile); requested model
  sonnet; no override. Routing: size S, risk L, novelty no. Task record in English; the
  documents keep their EN/VI pairs.

## Accepted identity (copy exactly)

- Release commit: `a6437943403fc416240fd13a787a8c4748af3e84` (WP5-UX2-FIX2-FREEZE, pushed).
- Source digest: `229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3`, 815
  files, with `handoff/` excluded.
- Gate: WP5-UX2-REGATE2, PASS, NAS NOT VERIFIED
  (`handoff/delivery/tasks/WP5-UX2-REGATE2.md`):
  - real-clock full e2e 448 passed / 42 skipped / 0 failed;
  - simulated-clock runs inside and outside the five-day window, 0 failed;
  - drill `--wp3`: 208 PASS / 0 FAIL;
  - unit tests: 1,882.
- Reference image ID: `sha256:6d1844425345a6e64a962689c01c03143a225abf33df02bcdaa20c8dcc05695a`
  (110,024,344 bytes). This is the REGATE2 drill build on the development workstation;
  the image has been removed.
- Final independent audit: WP5-UX2-AUDIT2, PASS (`handoff/delivery/WP5_UX2_REVIEW2.md`).
  - It follows WP5-UX2-AUDIT, FIX REQUIRED (`handoff/delivery/WP5_UX2_REVIEW.md`),
    whose three Low findings the fix round closed.
  - It supersedes WP5-UX-AUDIT-AB9, the previous acceptance on 90b98ef / 57e2974c.
- Server: `dist/server` differs from 90b98ef only in the wording of three error messages
  in `services/timesheetCommands.js` and one comment (WP5-UX2-GATE, REGATE and REGATE2
  evidence). No business rule, calculation, schema, API or PDF change.

## What to change

1. `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`:
   - Update the release identity in section 0 and the rollback card in section 6 to the
     identity above.
   - Correct the provenance sentences of sections 3 and 5.
     - The packet now says that `dist/server` is byte-identical across 74d5bfe, 014bd47
       and 90b98ef. Keep that history.
     - Add that a643794 differs from them only in three server message texts and one
       comment, so the email and PDF samples still represent the release (no template
       or PDF change).
     - The restore figures come from the REGATE2 drill (the same 208 checks).
   - Add one short paragraph about UI change round 2 in section 10 or section 0:
     - the owner requests of 2026-10-14 and the answers WP5-UX2-Q1 and WP5-UX2-Q2;
     - the client UI and wording changes;
     - the three server message texts;
     - no business change.
     - Link `handoff/delivery/WP5_UX2_REVIEW2.md`.
   - In section 10 or 8, record the optional backlog for the pilot fix round, by ID only:
     - R-UX2A-1..R-UX2A-5 (`WP5_UX2_REVIEW.md`);
     - R-UX2A2-1..R-UX2A2-4 (`WP5_UX2_REVIEW2.md`);
     - the earlier round's backlog already listed;
     - the open optional owner question WP5-UX2-Q3 (the "future" badge on the period
       that Today opens in the five window days; default: keep).
   - Keep section 8 (D-1..D-15 all pending) and section 9 (unsigned) unchanged.
2. `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`: add a section "Re-acceptance after UI
   change round 2 (WP5-UX2)". Use the board (`handoff/delivery/ORCHESTRATION.json`,
   tasks `WP5-UX2-*`, `owner_decisions` and `coordinator_decisions` of 2026-10-14 and
   2026-10-15) as the source. Cover:
   - the owner requests of 2026-10-14, in English summary (the verbatim text stays on
     the board), and the answers WP5-UX2-Q1 and WP5-UX2-Q2;
   - the plan and its addenda PLAN2-PLAN4;
   - the slices T01..T10 and the fix rounds FIX1 and FIX2, one line each, with their
     freeze commits;
   - the gates WP5-UX2-GATE (PASS), REGATE (FAIL, a calendar-dependent test) and
     REGATE2 (PASS), and the audits WP5-UX2-AUDIT (FIX REQUIRED, three Low findings) and
     WP5-UX2-AUDIT2 (PASS), with the accepted identity;
   - the docs/10 entries for WP5-UX-Q1/Q2 that this round recorded (carried from round
     1);
   - the carried optional backlog and the open optional question WP5-UX2-Q3;
   - the NAS still NOT VERIFIED, the pilot not authorized, and no pilot result.

   Keep the older acceptance records unchanged as history.
3. Keep EN/VI parity. Put Vietnamese only in the `.vi.md` files, and keep the same
   facts, IDs and links in both.

## Hard limits

- Change only the four files above, this brief's Results and
  `handoff/delivery/evidence/WP5-UX2-ACCEPT-DOCS/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION or the checkpoint; the coordinator owns
  them.
- Never edit source, tests or docs outside `handoff/`. Do not commit or push. Do not run
  any git command that changes the index or the working tree.
- Use Git Bash only. **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO
  HEREDOCS, NO `| node`, NO `| python`, NO `node -e`. NEVER PIPE OUTPUT INTO `head` OR
  `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Use the Write, Edit, Glob and
  Grep tools (no sed).
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX2-ACCEPT-DOCS` (create it first). Set TEMP
  and TMP to it. Put Node 24 first on PATH before any node call.
- Never write an email address other than the full synthetic `@example.invalid` form,
  and never write a profile path (use `<user>`).
- No markdown link to a file that does not exist.
- If a permission check denies a call, stop and report.

## Checks

1. Run `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   It must exit 0; write `<user>` in the evidence.
2. Do an EN/VI parity check of the four files: section counts, and identical IDs, SHAs
   and links.
3. Run `npm run digest`. It must still be 229df806…, which shows nothing outside
   `handoff/` changed.

## Return

At most 120 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the provenance correction;
- the parity result;
- the preflight exit code;
- the digest.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5.

- Files changed: `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md` (section 0 identity, UI round 2 paragraph, sections 3, 5, 6, 10); `handoff/delivery/WP5_HANDOFF.md` and `.vi.md` (new section "Re-acceptance after UI change round 2 (WP5-UX2)"); evidence `handoff/delivery/evidence/WP5-UX2-ACCEPT-DOCS/checks.txt`.
- Provenance correction: `dist/server` is byte-identical across 74d5bfe, 014bd47 and 90b98ef; a643794 differs only in three server message texts and one comment, so the samples still represent the release. Restore figures cite the REGATE2 drill.
- Parity: pilot packet h2 12/12, SHAs 7/7; handoff h2 5/5, SHAs 16/16; IDs and links identical.
- Preflight exit 0 (PASS).
- Digest 229df806aeaaa886ab11ee83556746ee65eda6c81a596dcd180d80d5d0b04db3, 815 files, unchanged.

Status: done
