# WP5-UX-ACCEPT-DOCS dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX-ACCEPT-DOCS; package WP5; kind
  documentation; attempt 1; depends on WP5-UX-AUDIT-AB9 (PASS).
- Purpose: bring the pilot packet and the WP5 handoff up to the re-accepted WP5
  snapshot after the owner-requested UI change round (WP5-UX). This is a handoff-only
  change: no file outside `handoff/` may change.
- Profile/routing: timesheet-light (sonnet), no override. Routing: size S, risk L,
  novelty no. Task record in English; the documents keep their EN/VI pairs.

## Accepted identity (copy exactly)

- Release commit: `90b98efc395c3894a21a909b6d361eadc6fc2bd9` (WP5-UX-FIX10-FREEZE, pushed).
- Source digest: `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d`, 795
  files, with `handoff/` excluded.
- Gate: WP5-UX-REGATE8, PASS, NAS NOT VERIFIED (`handoff/delivery/tasks/WP5-UX-REGATE8.md`):
  - real-clock full e2e 210 passed / 26 skipped / 0 failed;
  - a simulated-clock sweep of 7 instants with 0 failed;
  - drill `--wp3`: 208 PASS / 0 FAIL;
  - unit tests: 1,831.
- Reference image ID: `sha256:dec7b4856a8220743c513a955a840d399e4be0d74970a89801ea39b6d7898327`
  (110,014,793 bytes, `linux/amd64`). This is the REGATE8 drill build on the development
  workstation; the image has been removed.
- Final independent audit: WP5-UX-AUDIT-AB9, PASS, combined areas A and B
  (`handoff/delivery/WP5_UX_REVIEW_AB9.md`).
  - It supersedes WP5-UX-AUDIT-A6 and the audits before it (A5, A4, A3, A2 and
    WP5-RECHECK).
  - Earlier area reviews of the round: `WP5_UX_REVIEW_A.md` to `_A7.md`,
    `WP5_UX_REVIEW_B.md` to `_B7.md`, and `WP5_UX_REVIEW_AB8.md`.

## What to change

1. `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`:
   - Update the release identity in section 0 and the rollback card in section 6 to the
     identity above.
   - Sections 3 and 5 say that the samples and restore figures were produced at 74d5bfe
     and that `dist/` is byte-identical. The UI round changed the client bundle, so that
     statement is no longer true for the whole of `dist/`. Establish the facts first:
     - Is `dist/server` byte-identical between 74d5bfe (or 014bd47) and 90b98ef? Use the
       existing evidence (WP5-UX-AUDIT-A5, A6, AB8, AB9 and the REGATE gates), or build
       both from clean `git archive` exports in your task folder and compare.
     - Then write accurate provenance:
       - the email and PDF samples come from the server;
       - the restore figures come from the REGATE8 drill (same 208 checks);
       - the client changed in the UI round.
   - Add one short paragraph saying that the UI change round (owner request
     2026-10-08; E-1..E-7, WP5-UX-Q1 and Q2 answered "a") changed the client UI and the
     tests only, with no server or business change. Section 10 or section 0 is the place.
     Link `handoff/delivery/WP5_UX_REVIEW_AB9.md`.
   - In section 10 or 8, record the optional backlog for the pilot fix round, by ID only:
     - R-B7-1..R-B7-4 (`WP5_UX_REVIEW_B7.md`);
     - R-AB8-1..R-AB8-4 (`WP5_UX_REVIEW_AB8.md`);
     - R-AB9-1..R-AB9-6 (`WP5_UX_REVIEW_AB9.md`);
     - the B6 and A7 risks.
   - Keep section 8 (D-1..D-15 all pending) and section 9 (unsigned) unchanged.
2. `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`: add a section "Re-acceptance after the
   UI change round (WP5-UX)". Use the board (`handoff/delivery/ORCHESTRATION.json`,
   tasks `WP5-UX-*`, `owner_decisions`, `coordinator_decisions`) as the source. Cover:
   - the owner request (2026-10-08) and the answers E-1..E-7, WP5-UX-Q1 (a) and
     WP5-UX-Q2 (a);
   - the slices T01..T06 and the fix rounds FIX1..FIX10, one line each;
   - the final gate REGATE8 and the final audit AB9, with the accepted identity;
   - the coordinator decision to keep docs/10 unchanged for this re-accept, with its
     reason (docs/ is inside the digest; Q1/Q2 are recorded on the board), and the
     carry-forward to the next source-changing round;
   - the carried optional backlog;
   - the NAS still NOT VERIFIED, the pilot not authorized, and no pilot result.
   Keep the older acceptance record unchanged as history.
3. Keep EN/VI parity. Put Vietnamese only in the `.vi.md` files, and keep the same
   facts, IDs and links in both.

## Hard limits

- Change only the four files above, this brief's Results and
  `handoff/delivery/evidence/WP5-UX-ACCEPT-DOCS/` (masked LF `.txt`).
- Do not change the board, STATE, NEXT_ACTION or the checkpoint; the coordinator owns
  them.
- Never edit source, tests or docs outside `handoff/`. Do not commit or push. Do not run
  any git command that changes the index or the working tree.
- Use Git Bash only. **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO
  HEREDOCS, NO `| node`, NO `| python`, NO `node -e`. NEVER PIPE OUTPUT INTO `head` OR
  `tail`. NEVER REDIRECT TO OR FROM `/dev/null` OR `nul`.** Use the Write, Edit, Glob and
  Grep tools (no sed).
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX-ACCEPT-DOCS`. Set TEMP and TMP to it.
  Put Node 24 first on PATH before any node call.
- Never write an email address other than the full synthetic `@example.invalid` form,
  and never write a profile path (use `<user>`).
- If a permission check denies a call, stop and report.

## Checks

1. Run `validate_package.py --preflight` by its script path with the workflow Python
   `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
   It must exit 0; write `<user>` in the evidence.
2. Do an EN/VI parity check of the four files: section counts, and identical IDs, SHAs
   and links.
3. Run `npm run digest`. It must still be 57e2974c…, which shows nothing outside
   `handoff/` changed.

## Return

At most 120 words, beginning with 'Self-reported model: ...'. Include:
- the files changed;
- the `dist/server` provenance finding and its source;
- the parity result;
- the preflight exit code;
- the digest.

Append the same to Results, ending with "Status: done".

## Results

Self-reported model: claude-sonnet-5-5.

- Files changed: `WP5_PILOT_PACKET.md` and `.vi.md` (sections 0, 3, 5, 6, 10), `WP5_HANDOFF.md` and `.vi.md` (new section "Re-acceptance after the UI change round (WP5-UX)"), this Results, and `evidence/WP5-UX-ACCEPT-DOCS/` (01..06).
- `dist/server` provenance: byte-identical between 74d5bfe, 014bd47 and 90b98ef (180 files), from existing evidence (WP5-RECHECK, AUDIT-A5/A6/A7, AUDIT-AB9 clean exports); no new build. Only the client bundle changed (dist/domain: display formatter only). Samples therefore still represent the release.
- Parity: headings 21/21 and 5/5, table rows 129/129, checkboxes 35/35; SHA and ID sets equal; links equal except the translation-pair link.
- Preflight exit code: 0. Digest: `57e2974c35cc104f3c2cb5d930c24d9bb15b89661be395d16a827e64ee4b761d`, 795 files, before and after.
- Deviation: one stray `/dev/null` redirect in a no-op grep during a link check (no effect).

Status: done
