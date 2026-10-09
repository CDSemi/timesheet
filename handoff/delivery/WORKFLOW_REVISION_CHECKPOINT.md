# Mission checkpoint (WP3 accepted; GOV-SKILL cycle and WP4 planning)

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Updated 2026-10-05 UTC.

## Update 2026-10-08: owner-requested UI change round (WP5)

- The owner asked for a more beautiful, easier UI, with the Timesheet page laid out like
  the timesheet in the sample Excel workbook. Verbatim request in the board's
  `owner_decisions`.
- Coordinator decision: run it as a WP5 change round before pilot activation (no new
  package). The board moved from `software_ready` to `running`; `next_task_id` is
  WP5-UX-PLAN.
- Done: WP5-UX-PLAN (planner, self-reported claude-opus-5-5, read-only; HEAD fe67f94 and
  digest 150420e7 unchanged at start and end). Plan sections A-G in
  `handoff/delivery/tasks/WP5-UX-PLAN.md`; mockup `handoff/delivery/design/WP5-UX/mockup.html`
  (artboards A1-A7) with eight synthetic screenshots. No server/API change except a
  display-only h:mm formatter in `src/domain/format.ts`; slicing WP5-UX-T01..T06, one
  writer, then WP5-UX-GATE and a fresh opus audit on the new digest.
- This coordinator session has no Artifact (Design) tool; the HTML mockup replaces it.
- Pending owner question: board `pending_owner_question_2` (E-1..E-7). Blocks WP5-UX-T01.
- Checkpoint commit WP5-UX-CKPT (committer) stores the plan, mockup, screenshots, board,
  checkpoints and NEXT_ACTION, plus the leftover GOV-RECOVERY-ACCEPT result record and
  evidence (attempt 2). `handoff/delivery/WP5_PILOT_PACKET.vi.md` has an uncommitted
  change of unknown origin; it stays unstaged until the owner says whether it is his. After it, the board returns to `software_ready` (the
  accepted WP5 snapshot is unchanged); that last flip stays uncommitted.
- Next action: the owner views the mockup and answers E-1..E-7; then the coordinator
  writes the WP5-UX-T01 brief.

- Active package and role: WP3 (fix round 1: regate and rechecks); coordinator. Actual
  model claude-opus-5-5 (owner choice; profile inherit); effort not observable. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: branch main.
  - HEAD = origin/main = fe67f9400e59ae7c10b9ac8871b4dea10b83860d (GOV-RECOVERY-ACCEPT, the closing commit; accepted WP5 source 014bd47, digest 150420e7). The board's final flip to `software_ready` and this line are uncommitted until the next commit.
    WP3 was accepted at b103923, on source 49651c8 with digest c31c300c…. The GOV-SKILL
    freeze is 3bdffbe.
    WP2 accept commit 3ead61e; accepted WP2 source 5fafeaee72509c6110a907458643bf7582dad81a.
  - Gate digest of record eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410
    (WP3-REGATE PASS on 2f2520e). The first WP3 gate digest was 96870f7e… (WP3-GATE on
    a1cd566); the WP2 gate digest was e61fa914… (WP2-GATE4).
  - Uncommitted (handoff only): the board, this checkpoint, the WP4-T01-FREEZE results
    and evidence, and the WP4-T02 brief.

    The gate digest of record is 0d513fca… (WP3-REGATE2 PASS).
  - No unpushed commits.
- Completed scope:
  - Governance: revision v2 accepted (WF-AUDIT3 PASS, `1a25275..6578df8`;
    [handoff](WORKFLOW_HANDOFF.md)); GOV-E8 accepted ([review](GOV_E8_REVIEW.md)).
  - WP1 accepted (recheck PASS at 68bbb31 / c6e24381; accept commit f32978f).
  - WP2 implemented and independently accepted:
    - tasks T01–T13 with CALFIX and the T09A/T09B split, each frozen (396b399 … 8fae685;
      the full list is on the board and in [WP2_HANDOFF](WP2_HANDOFF.md));
    - gate chain WP2-GATE (8fae685), GATE2 (f79413b), GATE3 (a3d1b65), GATE4 PASS on
      5fafeae: 613 tests, concurrency x20, fresh and WP1-upgrade migrations, e2e 74
      passed / 2 skipped with all 12 flows;
    - audit chain: WP2-AUDIT-A and -B FIX REQUIRED; fix rounds WP2-FIXA, WP2-FIXB (with
      addendum), WP2-FIXB2, WP2-FIXB3; WP2-AUDIT-B2 and -B3 FIX REQUIRED (all closed);
      final WP2-AUDIT-A2 attempt 3 PASS ([recheck A4](WP2_RECHECK_A4.md)) and WP2-AUDIT-B4
      PASS with no findings ([recheck B4](WP2_RECHECK_B4.md)), both on 5fafeae / e61fa914.
      A2 attempts 1–2 were invalidated by later source changes and stay in its history.
- Carried, non-blocking (recorded in STATE and WP2_HANDOFF):
  - R1 revision-specific correction keys; R2 policy note with leading space exported raw;
    R3 `calendar_in_use` reveals account data (accepted); R4 WP3 must persist the
    `CorrectionResult`/`DeficitDebitResult` pending variant and drop provisional minutes at
    finalization.
  - A3-01 hide `refreshed_pay_period` in any future admin audit view; A4-01 smoke port
    message; ADV-A-05; F1 (evidence-only); B4 optional items.
  - Owner option: prospective calendar reassignment (currently refused with 409, a
    reversible coordinator decision). Removing employee-derived holiday-preview counts is
    also a reversible coordinator decision.
  - Governance backlog for one later GOV cycle: check_recovery live-status inheritance (fix
    before software_ready), AGENTS.vi item 2, precommit limits, the evidence -whitespace
    note in docs/08.
- Runtime lessons (board `runtime_observations`): call Node 24 by full path; use the
  workflow Python for preflight; never write into the repo root or redirect to `nul`;
  committer briefs use no-print hygiene (no classifier denial since); a manual owner commit
  must use `git add -A` and the chat Commit description must equal the intended message.
- WP2-ACCREC (light) is done: the WP2_HANDOFF acceptance record (EN/VI), the corrected
  FR-13 preview line and updated figures; preflight 0 (author-reported).
- WP2-ACCEPT is done: commit 3ead61e pushed (137 handoff-only paths, all checks 0). WP2
  is accepted; the board's active package is WP3.
- WP3-PLAN (opus planner) is done ([plan](tasks/WP3-PLAN.md)): 16 tasks T00–T15 in three
  checkpoints, each frozen; WP3-GATE; two fresh opus area audits; accept commit. The
  coordinator adopted the plan and its routine defaults (board `coordinator_decisions`).
- Owner question pending (board `pending_owner_question`): F-1 deadline auto-submit of a
  period with no saved entries; F-2 pending deficit-debit lifecycle; F-3 admin operations
  status versus privacy; F-4 scope of `automation_active_from`; F-5 PDF total
  (clarification, proceeds unless the owner objects). Needed before T05 (F-2), T10 (F-1,
  F-4) and T13 (F-3); T00–T04 continue.
- WP3-T00 is done (author-reported): R2 CSV hardening (red 4, green 26/26, mutation
  caught) and the A4-01 smoke-port fix (free port when unset; FAIL line on every non-zero
  exit); verify 619 tests, 0 deprecation lines; digest 81567e53….
- WP3-T00-FREEZE is committed and pushed as db75346 (attempt 2, 23 paths, all checks 0).
  Attempt 1 stopped at the validator because the coordinator's WP2-ACCEPT board record
  lacked `branch`/`pushed`; nothing was committed then.
- WP3-T01 is done (author-reported): migration 0004 with 10 tables and
  `timesheets.imported_unverified`; a real 5fafeae database upgrades cleanly; capture by
  default, SMTP only with an owner-only flag; 69 tests green, 6/6 mutations caught; verify
  674 tests; digest 995e68c9…. The schema follows the F-2/F-4 recommendations; another
  owner choice needs a migration 0005.
- WP3-T01-FREEZE attempt 1 stopped: the precommit check blocked two synthetic
  user-profile path literals in tests/integration/config.test.ts. Nothing was committed.
- WP3-T01 attempt 2 is done (author-reported): a neutral synthetic root replaces the two
  literals; verify 674 tests; digest 3c6a10c1….
- WP3-T01-FREEZE is committed and pushed as ac5d0ba (attempt 2, 29 paths, all checks 0).
- WP3-T02 is done (author-reported): private file store, image check, signature upload
  (raw PNG/JPEG, 256 KiB route limit) and owner-only download; the JSON-only rule holds
  elsewhere; 14/14 mutations caught; verify 711 tests; digest 629e7d9d…. Carry to T08:
  `index.ts` must pass `dataDir` from the delivery config.
- WP3-T02-FREEZE is committed and pushed as b060d33 (28 paths, all checks 0).
- WP3-T03 is done (author-reported): email template engine, validated recipients,
  append-only submission settings with a per-user auto-submit effective instant, audited
  auto-image authorization, write-free preview; 18/18 mutations caught; verify 821 tests;
  digest 22acf6c4…. A mutation-script incident (one file truncated, rewritten, all runs
  repeated) is disclosed.
- WP3-T03-FREEZE is committed and pushed as 79862bb (32 paths, all checks 0).
- WP3-T04 is done (author-reported): canonical JSON and SHA-256, the review snapshot from
  the existing engine, a GET review route that writes nothing; 16/16 mutations caught;
  verify 878 tests; digest 69e790e0….
- Environment: the B: scratch drive had about 448 KB free; about 7.8 GB under
  B:\Temp\claude belongs to Claude sessions. Agents must not touch it; cleaning it is the
  owner's choice.
- WP3-TMPCLEAN is done: 28 unused project temp directories removed (about 14.9 MB); B:
  now has about 22 MB free and stays nearly full. Other large B:\Temp consumers (IDE and
  diagnostics folders) are the owner's choice.
- WP3-T04-FREEZE is committed and pushed as b89f8a8 (32 paths, all checks 0).
- Coordinator decision: WP3-T07 (PDF renderer) runs now, before T05/T06, because it
  depends only on T04 and T05 waits for the owner's F-2 answer.
- WP3-T07 is done (author-reported): deterministic pdf-lib renderer (14 dates, h:mm, OT
  total with both Sundays, Show OT toggle, Unicode font, bounded signature, pending
  banner); dependencies pdf-lib, fontkit, DejaVu fonts, dev pdfjs-dist (none deprecated;
  lockfile +20 packages); 14/14 mutations caught; verify 906 tests; digest 971e7843….
- WP3-T07-FREEZE attempt 1 stopped before staging: the digest was 3f4a016d…, not the
  worker-reported 971e7843…. Nothing was committed.
- WP3-T07-RECON is done: the worker edited a test after its digest; the current tree's
  digest 3f4a016d… is stable, the changed set is exactly T07's, verify passes (906 tests)
  and the precommit check is clean.
- WP3-T07-FREEZE is committed and pushed as c289375 (attempt 2; lockfile +20 packages,
  none removed; all checks 0).
- The owner answered F-1..F-5 on 2026-10-04 (verbatim in board `owner_decisions`): F-2,
  F-4 and F-5 as recommended; F-1 modified (empty periods auto-submit with default labels,
  OT not counted, the "employee review pending" notice off by default with a settings
  option, no deficit); F-3 modified (the admin sees everything except each person's
  timesheet details; individuals may share view-only or edit access to their timesheets).
  F-1 and F-3 change canonical rules; F-3 adds a sharing feature.
- WP3-REQ (opus planner) is done ([report](tasks/WP3-REQ.md)): exact EN/VI canonical
  drafts, a "timesheet details" table, the sharing specification (FR-17/AC-16, grants in
  migration 0006, an allowlisted `/api/shared/:ownerId` mount, an authorization matrix),
  the impact (delta task T07B for the notice setting; T06 posts a first credit for a day
  without an original) and a revised plan (WP3-DOC, T07B, T13D, T13A, T13B, T13C inside
  WP3; gate items 13–16). The coordinator adopted it subject to the owner's answers.
- Owner question pending (board `pending_owner_question`): F-Q1..F-Q6, needed before
  WP3-DOC (after the T06 freeze).
- WP3-T05 is done (author-reported): one IMMEDIATE sign-off transaction (hash/version
  409, input 422, signed revision with real signed_at, ledger posting through ledger.ts,
  every outcome persisted incl. F-2 pending lines, finalized_revision_no, job rows,
  audit; identical retry replays); race 20/20; 13/13 mutations caught; verify 930 tests;
  digest c380f302….
- WP3-T05-FREEZE is committed and pushed as 72f1920 (28 paths, all checks 0).
- WP3-T06 is done (author-reported): correction revisions (differences only,
  revision-specific keys, first credit for a day without an original, pending increases
  per F-2), R1, late review with zero delta and an explicit send choice, resend without
  ledger movement; 19/19 mutations caught; verify 959 tests; digest b47d30da….
- **Blocker:** WP3-T06-FREEZE attempt 1 stopped before any git command. The B: scratch
  drive (Claude Code agent temp, B:\Temp\claude) is full (0 MB), so every subagent shell
  call fails with ENOSPC. Nothing was staged or committed; the T06 source changes are in
  the working tree. Agents must not touch B:\Temp\claude and the coordinator has no
  shell: the owner must free space on B: or move the Claude Code temp directory.
- The owner answered F-Q1..F-Q5 (verbatim in board `owner_decisions`): F-Q1 (a); F-Q2
  overrides the recommendation (no automatic indicator on outgoing submissions, a full
  signature block, system-only tracking, plus user options for an editable note line
  and the signature image); F-Q3 (b) admin sees recipient addresses; F-Q4 (b) with
  per-item toggles; F-Q5 (a). F-Q6 needs a clearer question (WP2-A-01 stays meanwhile).
  The owner authorized a temporary work folder on D: (D:\timesheet-tmp, outside
  Dropbox). The coordinator interpretation is in board `coordinator_decisions`.
- WP3-T06-FREEZE is committed and pushed as 2f8011a (attempt 2, 23 paths, all checks 0;
  B: had space again). A recursive delete of its empty D: temp folder was denied and not
  retried; the folder stays.
- WP3-REQ2 is done ([addendum](tasks/WP3-REQ2.md)): the notice is replaced by an
  optional note line (default off, editable, default text "Automatic submission") and the
  existing auto-image authorization; the PDF origin labels go too; the manual PDF must
  print the stored signer name (a T07 defect fixed in T07B); revised T07B scope (also
  owns the pdfJob input mapping); sharing with three per-grant items; a doc-edit list of
  10 canonical docs in both languages, 4 prompts and the policy example.
- Owner question pending: G-Q1 (signature image default on automatic submissions) and
  G-Q2 ({SignOffStatus} wording); F-Q6 optional.
- WP3-T08 is done (author-reported): atomic claims with leases, retries 1/5/15/60 then
  intervention, runner and CLI, PDF job from the stored snapshot with signature-hash
  check, crash recovery tests, DATA_DIR wiring; 13/13 mutations caught; verify 980
  tests; digest 706c1619…. T09 must own `src/server/jobs/runner.ts` to register the send
  handler.
- WP3-T08-FREEZE is committed and pushed as 3d7a17c (25 paths, all checks 0).
- Coordinator decision: WP3-T09 runs now (it builds mail from the frozen snapshot, so
  G-Q1/G-Q2 do not affect it); WP3-DOC and T07B follow the owner's answers and precede
  T10.
- WP3-T09 is done (author-reported): deterministic message from the frozen snapshot and
  stored PDF; capture default; SMTP only with the owner flag (tested against a loopback
  sink); outcome classification with uncertain never retried; crash recovery; decision
  route; secrets absent everywhere; 4/4 mutations; verify 1005 tests; digest 5e7e6b40….
  Four reported deviations (index.ts/cli.ts one line each, an ot-api route line, the
  jobs-restart assertions for the now-registered send job). Audit notes: a send claimed
  before its PDF consumes a job attempt; a TLS verification failure is temporary.
- WP3-T09-FREEZE is committed and pushed as 0a26afa (32 paths, lockfile +6, all checks
  0).
- Coordinator decision: WP3-T10 runs now (F-1/F-4 decided; G-Q1/G-Q2 only affect T07B's
  presentation). T11/T12 may also precede WP3-DOC; T13 waits for WP3-DOC and T07B.
- WP3-T10 is done (author-reported): eligibility re-checked in the transaction;
  automatic finalization (empty periods with default labels, zero OT, no deficit);
  overdue record when switched off; bounded chronological recovery; races always one
  revision/ledger set/send; audited admin activation route refusing past instants; 12/12
  mutations; verify 1038 tests; digest 5f16dab1…. Finding for T07B: the snapshot
  hardcodes "Signed by employee" for every revision (G-Q2).
- WP3-T10-FREEZE is committed and pushed as 0321be6 (26 paths, all checks 0).
- WP3-T11 is done (author-reported): reminders (24 h/2 h or saved offsets), overdue
  warning, outcome notice to the employee only; dedupe and collapse; DST-safe offsets;
  login-required links; 16/16 mutations; verify 1095 tests; digest e7f00cd0…. Carry
  items: a zero-byte attachment.pdf in reminder captures (fix later); a possible repeated
  reminder after a crash on real SMTP (documented limitation).
- WP3-T11-FREEZE is committed and pushed as c3d32b9 (21 paths, all checks 0).
- WP3-T12 is done (author-reported): review screen, stale handling, deep link, header
  badges; literal scan 0; 8/8 mutations; e2e 93 passed/3 skipped; verify 1135 tests;
  digest 160bb78c…. Carry item for T13: status in the grid (its parent was not owned).
- WP3-T12-FREEZE is committed and pushed as 8e2c2bf (49 paths, 6 screenshots viewed, all
  checks 0).
- WP3-T13D is done (author-reported): allowlisted admin operations/submission status
  with recipient addresses (F-3, F-Q3 (b)), admin UI, key-path leak test, isolation
  inventory; e2e 97 passed; 8/8 mutations; verify 1150 tests; digest 321cc6a0…. Carry
  item (assigned to T13A): pass the delivery config through AppDeps instead of reading
  process.env.
- WP3-T13D-FREEZE is committed and pushed as 19723b6 (34 paths, 4 screenshots viewed, all
  checks 0).
- WP3-T13A is done (author-reported): actor/subject seam, router factories, separate
  audit actor/owner, delivery config through AppDeps; 63-route inventory identical; tests
  1150 → 1164; 6/6 mutations; verify 0; digest 0edefc94…. Its single e2e run had 2
  mobile failures on `net::ERR_NO_BUFFER_SPACE` (environmental; targeted rerun passed).
- WP3-T13A-FREEZE is committed and pushed as c1e4bb2 (34 paths, all checks 0).
- WP3-E2E-RECHECK is done: full e2e on c1e4bb2 exit 0 (97 passed, 3 skipped, 0 failed);
  the T13A failures were environmental.
- WP3-REC1 is committed and pushed as 632092d (8 handoff-only paths, all checks 0).
- The owner answered G-Q1 (b) and G-Q2 (a) (board `owner_decisions`): the signature
  upload asks for the auto-image authorization pre-selected (one explicit, audited act);
  `{SignOffStatus}` is "Submitted" for both origins, or the note text when the note line
  is on. The WP3-DOC and T07B briefs carry the answers.
- WP3-DOC is done (author-reported): 30 edits per language in docs 01–07, 09, 10; the WP3
  prompt gate lines; the policy example; parity table; preflight 0; verify 1164 tests;
  digest 4d4c4863….
- Governance split (coordinator decision): `handoff/prompts/` is a governance path, so
  WP3-DOC-FREEZE commits only the docs and the policy example; the four WP3 prompt files
  go through GOV-WP3P-FREEZE, GOV-WP3P-GATE and a fresh GOV-WP3P-AUDIT before T07B.
- WP3-DOC-FREEZE is committed and pushed as cb9800e (32 paths; the four prompt files
  stayed unstaged; all checks 0).
- GOV-WP3P-FREEZE is committed and pushed as da6d0cd (13 paths incl. the four WP3 prompt
  files; all checks 0).
- GOV-WP3P-GATE PASS on da6d0cd (diff limited to the four prompt files; mirror of docs/09
  confirmed EN and VI; validators, verify and digest unchanged).
- GOV-WP3P-AUDIT PASS (fresh opus, no findings; [review](GOV_WP3P_REVIEW.md)); accepted
  range cb9800e..da6d0cd. Optional notes R1–R3 added to the governance backlog.
- WP3-T07B is done (author-reported): migration 0005 note fields, audited note settings,
  upload-time consent (`authorize_auto_image`, one transaction; 422 without saved
  settings — carried to T13), snapshot v2, "Submitted"/note status, no automatic
  indicator, stored signer name on manual PDFs; 19/19 mutations; verify 1232 tests;
  digest 5e37ab98….
- WP3-T07B-FREEZE is committed and pushed as 943027b (56 paths incl. the GOV-WP3P
  records; all checks 0).
- WP3-T13 is done (author-reported): owner-only PDF download, history and delivery UI,
  settings with note line and image authorization, signature upload with pre-selected
  consent (422 handled), grid status; 16/16 mutations; e2e 111 passed; verify 1292 tests;
  digest 7b04f0b1…. Carry items: a revision-list route (added to the T13B brief); a
  capture sender in the e2e harness and the deadline-automation e2e (T14); the 404 of
  `GET /api/signatures/current` without a signature (later fix).
- WP3-T13-FREEZE is committed and pushed as 5b90d30 (57 paths, 6 screenshots viewed, all
  checks 0).
- WP3-T13B is done (author-reported): migration 0006 shares with per-item columns,
  `/api/shares` (audited, rate-limited unknown-grantee 422), admin list/revoke, the
  allowlisted `/api/shared/:ownerId` mount (17 routes, live check and in-transaction
  re-check), `GET /api/revisions`, grantee attribution in history; matrix 11 × 17 plus 31
  never-shared paths; 10/10 mutations; e2e 111 passed; verify 1356 tests; digest
  f3df3b86….
- WP3-T13B-FREEZE is committed and pushed as c3c35de (attempt 2; attempt 1 was blocked by
  email addresses in an evidence log, 7 masked as `<email>`; all checks 0).
- WP3-T13C is done (author-reported): sharing settings with per-item switches and the PDF
  note, shared-with-me switcher and owner bar, shared views with absent disallowed
  actions, history from the revision list with grantee names, signatures/current 200
  null; e2e 119 passed; 11/11 mutations; verify 1383 tests; digest 9b8d6b26…. Carry item:
  raw operation names in the history for unknown operations.
- WP3-T13C-FREEZE is committed and pushed as 8ad2e4f (attempt 2; attempt 1 stopped on
  TimesheetScreen.tsx missing from the worker's list, included once the digest matched;
  72 paths; all checks 0).
- WP3-T14 is done (author-reported): capture sender and synthetic signature in the seed
  and e2e fixture, capture fix for attachment-less messages, smoke additions, e2e 127
  passed (submission, automation, pdf-visual), five PDF renders viewed, gate mapping;
  verify 1384 tests; digest 677b9142….
- WP3-T14-FREEZE is committed and pushed as b083739 (attempt 2; attempt 1 stopped at
  preflight on a broken link in the WP3-GATE brief, fixed by the coordinator; 42 paths;
  all checks 0; 8 synthetic images viewed).
- WP3-T15 is done (author-reported): WP3_HANDOFF (EN/VI), README and DEVELOPMENT (EN/VI)
  for jobs, capture, the production flag, activation, sharing and MAIL_FROM;
  package.json description; parity ok; preflight 0; verify 0 with 1384 tests; digest
  96870f7e…. Observation for the gate: the T14 record says 46 smoke checks, its log
  shows 40.
- WP3-T15-FREEZE is committed and pushed as a1cd566, the WP3 package-final freeze
  (attempt 1; 25 planned paths plus the committer's two own evidence files, a harmless
  deviation outside the digest; all checks 0; no secret or real address in the docs).
- WP3-GATE PASS on a1cd566 (all 16 items; verifier-reported):
  - verify 0 with 1384 tests; smoke 40 PASS (the T14 record's 46 was wrong);
  - e2e 127 passed, 5 skipped, 0 failed;
  - races 20/20 each; fault injection passes;
  - migrations fresh and upgraded from 5fafeae; validators 0;
  - diff scope clean.

  The coordinator stopped the agent after hand-back (leftover background work).
- WP3-AUDIT-B: FIX REQUIRED (fresh opus auditor):
  - WP3-B-01 (Medium): an account created after activation, with no saved settings,
    gets every already-overdue period auto-finalized; bound by `users.created_at`.
  - WP3-B-02 (Low): a crash during the final send attempt leaves it `sending` with no
    owner decision; recover interrupted sends in every runner pass.
  - WP3-B-03 (Low): History labels system auto-finalize as "someone else" and shows raw
    operation codes.
  - The other carry items are acceptable backlog.
- WP3-AUDIT-A: NOT VERIFIED, procedural only, with no finding. Every functional check
  passed (races, crash, HTTP, PDF, migrations, privacy). The classifier refused its
  digest command after it tried to stop an interactive cmd.exe it had opened by mistake.
  The coordinator does not rerun the refused command through another agent. A fresh
  area-A recheck binds its own digest on the fix-round freeze.
- WP3-AUDIT-C: FIX REQUIRED (fresh opus auditor). Sharing authorization held under every
  probe: 88 inventory entries, 17 shared routes, 11 item sets, the race window proven,
  disallowed UI actions absent.
  - WP3-C-01 (Medium): the planned owner review hint "changed by <grantee>" is missing.
  - WP3-C-02 (Low): History attributes admin-route or same-second acts to a grantee.
  - WP3-C-03 (Info): a stale comment.
  - The full preflight fails on directory links in WP3_REVIEW_A/B.
- Fix round 1 (coordinator decision 2026-10-05), in sequence:
  1. WP3-LINKFIX (light): done at attempt 2, preflight 0. Attempt 1 failed on the
     coordinator's own example links in the brief.
  2. WP3-FIXB (B-01..03): done (author-reported). Fixes:
     - B-01: automation starts at account creation;
     - B-02: recover interrupted sends in every pass;
     - B-03: plain operation names and a system badge.

     Results: red 8 → green; verify 1391 tests; e2e 127 passed; digest d9fa55bd….
     Deviations: HistoryScreen.tsx, and one changed assertion in delivery-crash.test.ts
     (to be judged by the recheck).
  3. WP3-FIXC (C-01..03): done (author-reported).
     - C-01: the owner-only hint, derived from the audit and kept outside the hash and
       the PDF.
     - C-02: an act is attributed to a grantee only when the actor is not the owner and
       the operation is a shared-route operation. No migration was added.
     - C-03: the comment is fixed.
     - Checks: verify 1407 tests; e2e 127 passed; digest eeb417d3….
     - Deviations for the recheck: the operation-based rule; a grantee leaving a share
       is now unattributed; a replaced test.
     - WP3-FIX-FREEZE is committed and pushed as 2f2520e (attempt 3; 177 paths; all
       checks 0; 6 synthetic images viewed). Attempts 1 and 2 stopped on validator rules
       that the coordinator's records broke: prose in the audit decisions, and
       WP3-LINKFIX depending on non-PASS audits.
     - WP3-REGATE: PASS on 2f2520e, items 1–18 (verifier-reported):
       - 1407 tests; smoke 40; e2e 127 passed;
       - races 20/20 each; fault injection; migrations to v6;
       - regression tests named per finding;
       - fix scope exactly the FIXB/FIXC paths.
     - WP3-RECHECK-BC: FIX REQUIRED (fresh opus auditor).
       - B-01, B-02, C-01, C-02 and C-03 are fixed (regression tests fail on a1cd566);
         B-03 is partly fixed.
       - New findings, both Low: WP3-RBC-01 (the actor-less automatic OT credit shows
         "by someone else") and WP3-RBC-02 (with no owner finalization, the hint misses
         grantee changes made before the period start).
       - The FIXB/FIXC deviations are accepted. A recorded share marker is needed
         before WP4.
       - Risks: never-configured accounts are auto-finalized and fail with
         recipient_missing; docs/05 lacks the creation bound.
     - Owner question H-Q1 is pending: automatic submission for never-configured
       accounts.
     - WP3-RECHECK-A: PASS on 2f2520e with no finding (fresh opus auditor). The digest
       was bound at the first and last commands.
       - Area A probes: race twice, crash twice, HTTP 70, hint 7, PDF 34, migrations 26.
       - The fix round has no effect on area A.
       - Risks R1–R7 remain risks.
       - Because the validator requires every WP3 PASS to match the current digest, a
         digest-bound area-A delta recheck (attempt 2) follows fix round 2.
     - The owner answered H-Q1 with (a) on 2026-10-05. Automatic submission applies only
       after the account saved its submission settings with auto-submit on. By default,
       periods due before setup are not submitted; the explicit apply-to-overdue choice
       stays.
     - WP3-FIX2 is blocked: attempt 1 is PARTIAL. The work itself is reported done:
       - RBC-01, RBC-02, the sending-branch test and H-Q1 (a);
       - docs/05 and docs/10 EN/VI; the HANDOFF;
       - preflight 0; e2e 127 passed; verify 1416 tests; digest 0d513fca….

       The permission check denied the Bash loop that masked the evidence and removed
       six `.raw` logs. Those six logs remain unmasked in evidence/WP3-FIX2/ and must
       not be committed.
     - The owner answered H-Q2 with (a): mask the six logs, then delete exactly those
       six `.raw` files, one literal path at a time. The owner also moved the temporary
       folder to `D:\.claude-tmp\timesheet\<task>`.
     - WP3-TMPMOVE is done: `D:\timesheet-tmp` was moved to `D:\.claude-tmp\timesheet`
       with one literal rename. All 46 directories are present; nothing was deleted.
     - WP3-FIX2 is done at attempt 2. It masked the six logs, deleted the six named
       `.raw` files one literal path at a time, and the evidence precommit found 0
       findings. Verify passed with 1416 tests; the digest is still 0d513fca….
     - WP3-FIX2-FREEZE is committed and pushed as 2d72d35 (158 paths; all checks 0; 6
       synthetic images; no `.raw` file). The freeze brief itself was left unstaged; it
       goes into the next handoff commit.
     - WP3-REGATE2: PASS on 2d72d35, items 1–19 (verifier-reported).
       - Tests: 1416; smoke 40; e2e 127 passed.
       - Robustness: races 20/20 each; fault injection; migrations to v6.
       - Round-2 and H-Q1 tests named.
       - Fix scope limited to the FIX2 paths and docs 05/10.
       - Docs: parity ok; D-09 unchanged.
       - Validators: 0 in the project folder.
       - Gate digest of record: 0d513fca….
     - WP3-RECHECK-A attempt 2: PASS on 2d72d35 with no finding (fresh opus auditor;
       digest 0d513fca… bound first and last).
       - Delta of 18 paths; the area-A core and the database layer are unchanged.
       - Reruns: race twice and a new first-save race; crash; HTTP 84; hint 12; PDF 34;
         migrations 30.
       - The H-Q1 differential leaves configured accounts byte-identical.
       - R3 is closed. New Info risks: R8 (before-due reminders reach never-configured
         accounts) and R9 (seed events show as automatic).
     - WP3-RECHECK-BC2: FIX REQUIRED (fresh opus auditor).
       - RBC-01, RBC-02, the sending-branch test and H-Q1 (a) are correct; docs are in
         parity; no regression in areas B or C.
       - WP3-RBC2-01 (Low, test-only): two deadline tests now use never-configured
         accounts. As a result, the F-4 scan guard and the imported-period exclusion are
         untested: mutations M4, M5 and M5b pass the whole suite. Production behaviour
         is correct.
     - Fix round 3 (coordinator decision 2026-10-05):
       1. WP3-FIX3, a test-only change: restore those guards' coverage, prove it by
          mutation in a scratch clone, and cover the other untested skips.
       2. WP3-FIX3-FREEZE.
       3. WP3-REGATE3.
       4. One fresh auditor for WP3-RECHECK-BC3 and WP3-RECHECK-A attempt 3 (rebinding
          area A).
       5. WP3-ACCREC and WP3-ACCEPT.
     - WP3-FIX3 is done (author-reported), test-only.
       - The guard tests use configured accounts again; the off switch is saved before
         the deadline.
       - A guard sweep adds 3 tests.
       - Mutations M4, M5, M5b and the three skips each fail; the clean run passes.
       - verify: 1420 tests; digest c31c300c….
     - WP3-FIX3-FREEZE is committed and pushed as 49651c8. It holds 142 paths, including
       its own brief and the WP3-FIX2-FREEZE brief. All checks returned 0; one EOF
       blank line was fixed, which the brief allows.
     - WP3-REGATE3 attempt 1 (verifier) on 49651c8.
       - Every source item passed: 1420 tests; smoke 40; e2e 127 passed; races 20/20;
         migrations clean.
       - The round-3 guard tests are named; mutations M4, M5 and M5b each fail.
       - The round-3 scope is the test file only.
       - Item 12 failed on the live tree only. The cause is a record gap: the
         committer's untracked evidence `WP3-FIX3-FREEZE/result.md` lacks a `.vi.md`
         pair. The committed export passes.
       - The gate is blocked until the record gap is fixed.
     - WP3-RECFIX is done. It renamed that file to `.txt` with one literal-path move
       and deleted nothing; the live preflight now exits 0.
     - WP3-REGATE3: PASS. Attempt 2 reran item 12; all three validators exit 0 on the
       live board. HEAD is 49651c8 and the gate digest of record is c31c300c….
     - The owner answered H-Q3 with (a): keep the `readme-md` skill in the repository,
       through a GOV cycle. Order:
       1. WP3 acceptance on digest c31c300c… first. WP3-ACCEPT leaves the three skill
          files unstaged and checks the ls-tree digest.
       2. Then GOV-SKILL-FREEZE, GOV-SKILL-GATE and a fresh GOV-SKILL-AUDIT. Their
          briefs are ready.
       3. WP4-PLAN may run beside the GOV gate or audit, never beside the freeze.
     - WP3-RECHECK-BC3 and WP3-RECHECK-A attempt 3: both PASS on 49651c8, with no
       finding (one fresh opus auditor).
       - Mutations M4, M5 and M5b now fail the suite. The guard sweep is covered except
         for two single-guard edges, recorded as risks.
       - The test quality is meaningful.
       - No B/C regression; the area-A delta is test-only.
       - The coordinator stopped the auditor's idle shell and the agent after hand-back.
     - **WP3 review chain closed with PASS at 49651c8, digest c31c300c….**
     - WP3-ACCREC is done.
       - The WP3_HANDOFF acceptance record is filled in, EN and VI in parity.
       - Corrected figures: smoke 40, 1420 tests, e2e 127, and the freeze list.
       - Carry items R1–R9 and the WP4 carry-forward are listed.
       - Preflight 0.
     - STATE now marks WP3 passed with its carried risks. The active package stays WP3
       until after the accept commit, because the validator allows running tasks only
       in the active package or GOV. NEXT_ACTION (EN/VI) points to GOV-SKILL and WP4.
     - **WP3-ACCEPT is committed and pushed as b103923.** It holds 92 handoff paths;
       the ls-tree digest c31c300c… matched, and all checks returned 0. The three owner
       skill files were left untracked. **WP3 is accepted.**
     - The board and STATE now name WP4 as the active package (phase
       wp4-planning-gov-skill). WP4-PLAN is pending.
     - GOV-SKILL-FREEZE is committed and pushed as 3bdffbe: 19 paths, including the
       three owner skill files. The new digest, which includes the skill, is
       aab8b32c…; all checks returned 0.
     - GOV-SKILL-GATE: PASS, 7/7.
       - The scope is only the three skill files, and the frontmatter is valid.
       - Hygiene is clean, and verify passes 1420 tests.
       - Validators exit 0.
       - The digest of record is aab8b32c…; compared with c31c300c… it adds only the
         three skill files.
     - WP4-PLAN is done (opus) and adopted by coordinator decision:
       - 14 tasks: T01–T07, WP4-DEC, T08–T13;
       - then WP4-GATE and two area audits;
       - about 33 dispatches, or 37–41 with fix rounds.

       Docker 28.5.1 is present on this machine; Podman is absent.
     - Owner questions WP4-F-1..F-6 are pending; F-7 is for awareness and belongs to
       WP5. T01–T06 do not need the answers.
     - GOV-SKILL-AUDIT: FIX REQUIRED (fresh opus auditor, 3bdffbe).
       - GOV-SKILL-01 (Medium): the write path at SKILL.md:267 points outside the
         repository.
       - GOV-SKILL-02 (Low): markdown.md:142 gives a wrong location rule.
       - GOV-SKILL-03 (Medium): the source and licence are not recorded (likely
         LisaHQ/lisa-skills); skills-lock.json has no entry.
       - GOV-SKILL-04 (Low): it suggests an obsolete `align` attribute.
       - N1 suggests one AGENTS.md line.

       These are put to the owner as questions Q1–Q4, because the skill is the owner's
       content. A GOV fix cycle follows the answers.
     - WP4-T01 is done (author-reported):
       - changes: trusted-proxy resolver, absolute-path production config, `/api/ready`
         returning allowlisted keys, `.env.example`, smoke;
       - tests: red 23 → green 83; the mutation fails 2 tests;
       - e2e 127 passed; verify 1449 tests; digest 1c57dbae…;
       - deviation: one line in the sharing-matrix inventory.
     - WP4-T01-FREEZE is committed and pushed as a1dc01b (50 paths; digest 1c57dbae…;
       all checks 0).
     - WP4-T02 is done (author-reported):
       - migration 0007 adds `via_share_id` with an owner-to-actor trigger;
       - the marker is recorded on every shared write and on the PDF audit;
       - a HEAD request writes no audit, and legacy rows keep the inference;
       - tests: red 23 → green 136; 4 mutations are killed;
       - verify: 1469 tests; digest d6f223a7….

       Deviations: `http/auth.ts` and `routes/api.ts` were also edited. docs/03 should
       mention the marker; this is carried to WP4-DEC.
     - WP4-T02-FREEZE attempt 1 made no commit. The coordinator wrote the WP4-T03 brief
       during the run and asked for it to be staged; a permission check denied that
       bundled `git add`. The call is not retried.
     - WP4-T02-FREEZE is committed and pushed as 37f1be2 (attempt 2; 33 paths; all checks
       0; `WP4-T03.md` left untracked for the next freeze).
     - WP4-T03 is done (author-reported):
       - changes: migration 0008, the bootstrap service, CLI `bootstrap` plus
         `--new-token`, setup GET and POST (a generic 403 for every refusal), Setup
         screen;
       - tests: 24 tests, red then green; the mutation is killed; migrations to v8;
       - e2e 129 passed; verify 1494 tests; digest 8a316cc0….

       Follow-ups: docs/07, docs/03 and DEVELOPMENT.md, carried to WP4-DEC and T13.
     - WP4-T03-FREEZE is committed and pushed as 199e792 (35 paths; all checks 0; the
       screenshots and the token scan are clean).
     - WP4-T04 is done (author-reported).
       - Image: node:24.21.0-trixie-slim pinned by digest; 105 MiB; UID 10001.
       - Drill stage 1: healthy in 5.4 s, schema 8/8, read-only root; the data survived
         a restart.
       - Checks: 0 forbidden files; 0 deprecation lines; verify 1494 tests.
       - Digest: 6ec6549d….
       - Two local images (`:drill`, `:arm64-emulated`) are left in place. The arm64 build
         was under emulation only.
     - WP4-T04-FREEZE is committed and pushed as 3b2ddf2 (21 paths; all checks 0).
     - WP4-T05 is done (author-reported, opus).
       - Design: one online-backup step, no pause; every file is hashed and checked
         against its recorded hash.
       - Tests: red 9 → green 9; both mutations are killed.
       - Migrations: through v9.
       - Drill stage 2: backup in 348 ms while writes continued; all hashes match.
       - verify: 1503 tests. Digest: 724d5cd8….
       - Backup status is not yet in the admin status response; this moves to T07.
     - WP4-T05-FREEZE is committed and pushed as 0c58130 (27 paths; all checks 0).
     - WP4-T06 attempt 1 is done (opus).
       - The pause, restore and resume work.
       - Tests went red 17 → green 29; the mutation fails 4 tests; AC-08 passes 47/47.
       - Drill stages 1–3 pass 90/0; verify passes 1523 tests.
       - The worker flagged one problem: queued sends from the backup go out after
         resume, which breaks docs/07:30 and :32.
     - Coordinator decision: hold those sends at restore until an explicit, audited
       release or drop.
     - WP4-T06 attempt 2 is done.
       - Restore now holds queued and leased sends from the backup. `outbound release`
         and `outbound drop` (reminders only) are audited, and `--confirm` must be passed
         to act; without it they only preview.
       - Tests: red 5 → green 31; the mutation fails 4 tests.
       - Drill: 105/0, including a second-generation restore.
       - verify: 1525 tests; digest 15b7422e….
       - Risk for the audit: a send that the source already delivered stays held. It can
         only be released or left held.
     - WP4-T06-FREEZE is committed and pushed as 72ab2ed (39 paths; all checks 0).
     - The coordinator split WP4-T07 because F-3 and F-4 are still unanswered.
       - The F-3 flag and F-4 retention go to WP4-T07B, after the owner answers.
       - WP4-T07 is done (author-reported):
         - status fields for backup, disk and outbound, with an exact allowlist;
         - a daily orphan sweep keyed by day that removes only unreferenced files older
           than 24 h;
         - the status UI on E-8 tokens;
         - tests: red 13 → green; the mutation fails 2 tests;
         - e2e: 131 passed; verify: 1545 tests; digest cc86af8a….

         Job-claim expectations in three tests changed to include the sweep; the audit
         will judge whether that weakens them.
     - WP4-T07-FREEZE is committed and pushed as e1d97bd (31 paths; all checks 0).
     - Coordinator decision: T08 does not depend on F-1..F-3, so it runs before WP4-DEC.
     - WP4-T08 is done (author-reported).
       - Dependencies: two new ones, with no deprecation.
       - The reader enforces limits on real inflated output and rejects
         DOCTYPE/ENTITY and macros.
       - The README defects are detected.
       - Tests: 28, red-first; 6 mutations are killed.
       - The template hash is unchanged.
       - Verify: 1573 tests. Digest: 6fcd692d….
     - WP4-T08-FREEZE attempt 1 made no commit. `git diff --cached --check` flagged a
       blank line at EOF in `src/server/import/xlsxReader.ts`, a source file the
       committer may not fix.
     - WP4-T08 attempt 2 removed the one EOF blank line; verify passes 1573 tests and
       the new digest is d70a03c2….
     - WP4-T08-FREEZE attempt 2 committed and pushed dd1422f (25 paths; all checks 0).
     - Coordinator decision: split WP4-T12.
       - WP4-T12A runs now: drill stages 4–5 (upgrade of a WP3 v6 DB, old-binary
         refusal, paired rollback restore with no automatic resend) and the upgrade test.
       - Stage 6 (import no-op) and a full drill rerun stay in WP4-T12 after T09–T11.
     - WP4-T12A is done (author-reported).
       - Stage 4 upgrades a WP3 schema-6 DB to the latest schema once.
       - Stage 5: the old binary refuses the upgraded DB. A new
         `restore --keep-schema --confirm` restores the paired backup and holds the sends
         it contains. The old server then makes 0 send attempts; a control copy without
         the hold does send.
       - Tests: 10 + 6, red-first; 3 mutations killed.
       - Drill stages 1–5: 165 PASS. Verify: 1589 tests. Digest: e6bb47fd….
       - Residual limit, carried to the T13 runbook and the audit: after a rollback the
         old schema cannot hold jobs created later, so the old build must run with
         `JOB_RUNNER=off` until reconciliation.
     - WP4-T12A-FREEZE committed and pushed 0f989e4 (25 paths; all checks 0).
     - Every WP4 task that does not depend on F-1..F-6 is now done and committed.
     - The owner answered F-1..F-6, all as recommended, on 2026-10-05; the answers are in
       the board's `owner_decisions`.
     - The owner asked why the readme-md skill fix appears here. The coordinator
       explained where it comes from (H-Q3 (a) and GOV-SKILL-AUDIT). The owner then
       chose B: remove the skill from the repository, which reverses H-Q3 (a). The
       GOV-SKILL-REMOVE cycle follows WP4-DEC-FREEZE.
     - WP4-DEC is done (author-reported).
       - docs/03 has a new section for F-1..F-4.
       - docs/07 lines 9, 26, 32 and 46 cover F-6, F-5, the held sends and
         `JOB_RUNNER=off`, and F-1..F-3.
       - docs/10 records the owner and coordinator decisions.
       - No contradiction; parity holds; preflight 0. Digest: 65247d70….
       - Deviation: the worker launched `npm run digest` through cmd.exe. It hung, and
         the coordinator stopped it.
     - WP4-DEC-FREEZE committed and pushed e5576de (18 paths; all checks 0).
     - GOV-SKILL-REMOVE is done (author-reported).
       - The three skill files and their two empty folders are deleted.
       - No reference remains outside handoff/; preflight 0.
       - The digest could not be computed while the index still lists the deleted
         files. The committer stages the deletions first, then computes it.
     - GOV-SKILL-REMOVE-FREEZE committed and pushed a923351 (13 paths; three deletions;
       digest fcd8fe1e…, 750 files; all checks 0).
     - GOV-SKILL-REMOVE-GATE: PASS (7/7).
       - Exactly three deletions; no residual reference outside handoff/.
       - Clean-export verify: 1589 tests, 0 deprecation lines.
       - Validators 0.
       - Digest of record fcd8fe1e… (750 files), equal to the committer's figure.
     - GOV-SKILL-REMOVE-AUDIT: PASS with no findings (fresh opus auditor; review
       GOV_SKILL_REMOVE_REVIEW.md).
       - GOV-SKILL-01..04 and N1 are closed.
       - Note R1 for the owner: the removed files stay in public history. Removing them
         would need a history rewrite, which docs/08 forbids.
       - The board's current source digest is now fcd8fe1e… (R3).
     - GOV-SKILL-REMOVE-ACCEPT committed and pushed c398cab (27 handoff paths; all checks
       0). The GOV readme-md removal is closed.
     - WP4-T07B is done (author-reported).
       - F-3: `not_set_up` reuses the H-Q1 (a) `hasSavedSettings` condition; the UI
         shows a badge.
       - F-4: migration 0011 adds a narrow trigger exception, opened only through a
         single-row retention window, and a daily `job_retention` job.
       - Tests: 18 new; the mutation fails 2. e2e: 133 passed. Verify: 1613 tests.
         Digest: 7fe65713….
       - Deviations: mechanical count and key pins. The automation.spec job caps were
         raised (1 to 2, 2 to 4); the audit should judge this.
     - WP4-T07B-FREEZE committed and pushed 641ca10 (41 paths; all checks 0). The
       board's current source digest is 7fe65713….
     - WP4-T05B is done (author-reported).
       - Rule: 7 UTC days, 4 ISO weeks and 6 UTC months, plus the newest backup.
       - Only tool folders with a matching manifest are candidates.
       - Prune runs only after a verified backup; a dry run exists; any target escape
         refuses the whole run.
       - Tests: 21; the mutation fails 1. Verify: 1625 tests. Digest: 57be8442….
       - The prune status is not recorded, because that would need a migration.
     - WP4-T05B-FREEZE committed and pushed 6fecd88 (20 paths; all checks 0). The
       board's current source digest is 57be8442….
     - WP4-T09 is done (author-reported, opus).
       - Migration 0012 adds `imports`.
       - Import is owner only, with an idempotent preview and commit.
       - Only new, ended, in-calendar periods are importable. Every listed day needs a
         decision.
       - Imported periods answer 409 for sign-off, correction and edits, and are never
         automated.
       - Tests: 21; 5 mutations caught. Verify: 1646 tests. Digest: 65f38459….
       - Open owner choices I-1..I-3 are asked; the safe defaults stand.
       - Follow-ups:
         - WP4-T09B: backups do not include import sources yet;
         - WP4-T10: refuse OT leave use in imported periods;
         - WP4-T11: expose `imported_unverified` to the client.
     - WP4-T09-FREEZE committed and pushed a679787 (32 paths; all checks 0). The board's
       current source digest is 65f38459….
     - WP4-T09B is done (author-reported).
       - Backup and restore now include import sources, with hash and size checks,
         when the `imports` table exists.
       - An old manifest without imports rows restores. With imports rows it is
         refused, and a tampered source is refused.
       - Tests: 6 red, 57 green; the mutation fails 4. Verify: 1655 tests. Digest:
         b8db09bd….
     - WP4-T09B-FREEZE committed and pushed 1b4d817 (21 paths; all checks 0). The
       board's current source digest is b8db09bd….
     - WP4-T10 is done (author-reported, opus).
       - Migration 0013 rebuilds `ot_ledger` with the `opening_balance` type, by the
         12-step procedure.
       - `migrate()` now turns foreign keys off around the transaction and runs
         `foreign_key_check` before COMMIT, because `defer_foreign_keys` alone failed.
         The audit must judge this change.
       - The owner-only routes GET, POST and PUT are idempotent; a correction needs a
         reason.
       - OT leave use in an imported period answers 409.
       - Tests: 26 red-first; the mutation fails 4. Verify: 1673 tests. Digest:
         260ca363….
       - Open owner question I-4: a correction to 0 is refused.
     - WP4-T10-FREEZE committed and pushed aff904a (34 paths; all checks 0). The board's
       current source digest is 260ca363….
     - WP4-T11 is done (author-reported).
       - The Import screen has upload, preview, per-day decisions, confirmation and
         replay.
       - Imported periods show "Imported, unverified" with their controls disabled.
       - The opening-balance form has a confirmation step and a correction.
       - The read model gains `imported_unverified`.
       - e2e: 145 passed. Verify: 1707 tests. Digest: 70561b0d….
       - Deviations: several client components outside the owned list, and the
         `.shell-nav` wrap.
     - WP4-T11-FREEZE committed and pushed 61bf524 (53 paths; all checks 0). The
       board's current source digest is 70561b0d….
     - WP4-T12 is done (author-reported).
       - The drill with `--wp3` passed stages 1–6: 205 PASS, 0 FAIL.
       - Stage 6 checks the import no-op across eight tables, a single opening balance,
         409 on an imported period, and 404 for others.
       - Stages 2–4 now check import sources in backups, a prune dry run, the restored
         pause, and the upgrade from schema 6 to 13.
       - Verify: 1710 tests. Digest: de0e215b….
       - A stray background probe was stopped with TaskStop.
     - WP4-T12-FREEZE committed and pushed 0f6abdf (17 paths; all checks 0). The board's
       current source digest is de0e215b….
     - WP4-T13 is done (author-reported).
       - New: docs/11 runbook (EN/VI) and WP4_HANDOFF (EN/VI).
       - Updated: DEVELOPMENT, README and one docs/03 sentence.
       - Command map: 13 rows map to drill stages; 5 are owner NAS steps, unverified.
       - Parity holds; preflight 0. Digest: 1ed67f55….
     - The WP4-GATE, WP4-AUDIT-A and WP4-AUDIT-B briefs are ready.
     - WP4-T13-FREEZE committed and pushed 13a258d (26 paths; all checks 0). This is the
       WP4 package freeze; the board's current source digest is 1ed67f55….
     - WP4-GATE: PASS (13/13, verifier-reported).
       - The digest of record is 1ed67f55… (774 files).
       - Verify: 1710 tests. e2e: 145 passed.
       - Drill stages 1–6: 205 PASS.
       - Migrations pass, and races ran 60 of 60.
       - NAS: NOT VERIFIED.
       - Incident: one migrate probe without `DATABASE_PATH` migrated the owner's local
         development database from schema 1 to 13. It holds dev data only and is outside
         the repository. The owner was told.
     - WP4-AUDIT-B (data): **FIX REQUIRED.**
       - WP4-B-01 (Medium): an XML parse-cost bomb inside the limits blocks the server
         for about 9 s and adds about 730 MiB, and the stored report grows without bound.
       - WP4-B-02 (Low): 150,000 Holiday Dates cells cause a stack overflow and HTTP 500.
       - Everything else in area B held.
       - Risk notes R1–R4: R3 says an ended but not-yet-due period is importable, which
         is relevant to I-3. R4 says previews are kept forever with no quota.
       - Incident: the auditor's runaway python REPL (background task b9vel2ldq) wrote a
         multi-GB output file. The coordinator stopped it; the owner deletes the file.
     - WP4-AUDIT-A (operations): **FIX REQUIRED.**
       - WP4-A-01 (Low, must fix): the image ships 114 source maps, and production
         serves the client map.
       - WP4-A-02 (Low): `.env.example` contradicts the `JOB_RUNNER=off` rollback rule.
       - WP4-A-03 (Low): two runbook statements are inaccurate.
       - WP4-A-04 (Info): the smoke test inherits `DATA_DIR`.
       - Risks R-A1 to R-A9. The rest of area A held: backup under writes and restore,
         the migration runner, prune junction escapes, bootstrap, proxy, retention,
         privacy and the outbound CLI.
     - Fix round:
       - WP4-FIXB is done (author-reported).
         - XML limits refuse with 422 before parsing; findings are capped.
         - The 65 KB bomb now takes 4 ms (422) instead of 8.4 s and +740 MiB.
         - B-02 is fixed; R3 adds `not_due` as skip-only; R1 answers 409.
         - Verify: 1730 tests. Digest: b119e1b5….
       - WP4-FIXA is done (author-reported).
         - The image has no maps, and `/assets/*.map` answers 404; `app.ts` now
           returns 404 for a missing asset.
         - `.env.example`, the runbook and the smoke test are fixed.
         - Prune refuses when the clock is backward, and the drill releases two jobs.
         - The docs sync is done.
         - Drill: 208 PASS. Verify: 1734 tests. Digest: dfe4541d….
       - WP4-FIX-FREEZE committed and pushed 0f7fba2 (149 paths; all checks 0). The
         board's current source digest is dfe4541d….
       - WP4-REGATE: PASS, with 13/13 items and every finding check.
         - Digest of record: dfe4541d… (775 files).
         - Verify: 1734 tests. e2e: 145 passed. Drill: 208 PASS.
         - The 65 KB bomb is refused in 5 ms while health stays at 2 ms.
         - The image has no maps; races passed 60/60.
         - Diff: FIXA and FIXB paths only.
         - Observation: two backups in the same second break the tie by name; the
           recheck will judge it.
       - WP4-RECHECK-B: **FIX REQUIRED**, finding WP4-RB-01 (Medium). It reopens B-01:
         - tags led by a digit or a space, and attributes, slip past the element count:
           four 26 KB-class parts take about 3 s and about 1.4 GiB;
         - cell values in findings are not capped: a 99.8 MiB report is stored, and
           a larger one gives 500.
         - B-02, R3 and R1 are closed, and regression holds.
       - WP4-RECHECK-A: **PASS**, with no findings.
         - A-01 to A-04 are closed; R-A1, R-A5 and R-A7 are correct; there is no
           regression.
         - Risks R-RA1 to R-RA4 are non-blocking.
         - If the source changes, an area-A delta recheck (attempt 2) must bind to the
           new digest.
       - WP4-FIXB2 is done (expert, opus; author-reported).
         - A bounded streaming scanner replaces fast-xml-parser. It counts every `<`
           and bounds attributes, the tag length and names.
         - Text is cut at 200 characters, and the report is at most 2 MiB. A report
           failure gives 422.
         - All probes are refused in at most 57 ms. The worst accepted package takes
           180 ms and adds 107 MiB.
         - Tests: 15 red-first plus a sweep of 35 shapes; 10 mutations killed.
           Verify: 1,750 tests. Digest: 9848e8d7….
       - WP4-DEPCLEAN is done: fast-xml-parser and its 7 transitive packages were
         removed, and no other dependency changed. `npm ci` is clean; audit --omit=dev
         shows 0 vulnerabilities; verify passes 1,750 tests. Digest: 96445de4….
       - The board is ready for the new digest:
         - WP4-RECHECK-A moves to attempt 2 (pending; attempt 1 PASS is kept in its
           history);
         - WP4-REGATE2 and WP4-RECHECK-B2 are pending.
       - WP4-FIXB2-FREEZE committed and pushed cc34e7f (127 paths; checks 0, after one
         EOF-blank-line fix the brief allows). The board's current source digest is
         96445de4….
       - WP4-REGATE2: PASS.
         - Digest: 96445de4….
         - Verify: 1,750 tests. e2e: 145 passed. Drill: 208 PASS.
         - The RB-01 probes are all refused fast or stay within the budget: worst
           62 ms and +73 MiB. Health answers in 1–3 ms, no request returns 500, and
           the largest report is 0.57 MiB.
         - The benign-workbook differential is byte-identical against the old reader.
       - WP4-RECHECK-A attempt 2: **PASS** on cc34e7f (digest 96445de4), with no
         findings.
         - The delta touches only FIXB2 and DEPCLEAN files.
         - The lock change removes only fast-xml-parser.
         - Verify: 1,750 tests. Drill: 208 PASS. No maps.
         - The attempt-1 conclusions hold. New: R-RA5 (Info).
       - WP4-RECHECK-B2: **FIX REQUIRED**, finding WP4-RB2-01 (Low).
         - Two shapes break the stated budget: about 610 ms (a `t` attribute is decoded
           twice) and +158 MiB (slices pin two-byte parts).
         - Cost stays linear, with no 500.
         - Everything else held:
           - the scanner passes 49/49 spec cases and refuses DOCTYPE;
           - the differential is identical;
           - 72 new shapes stay bounded;
           - the report is at most 1.61 MiB.
       - Coordinator decision: fix the code instead of restating the budget.
       - WP4-FIXB3 is done (expert; author-reported).
         - Kept values are decoded once and stored as copies; attributes are capped at
           255; `decodeXml` is linear.
         - Limits tightened: 8 MiB of XML and 150k openings.
         - Worst case: 289 ms / +89 MiB, about 60% of the budget. E7 and Y7 are
           refused.
         - R-B2-1 and R-B2-2 are fixed.
         - Tests: 89/89; the differential is identical. Verify: 1,755 tests. Digest:
           635f909d….
       - The board moves WP4-RECHECK-A to attempt 3 (pending) and adds WP4-REGATE3 and
         WP4-RECHECK-B3 (pending).
       - WP4-FIXB3-FREEZE committed and pushed 972ccda (148 paths; all checks 0). The
         board's current source digest is 635f909d….
       - WP4-REGATE3: **PASS** (digest 635f909d…).
         - Verify: 1,755 tests. e2e: 145 passed. Drill: 208 PASS.
         - Whole-gate worst case: 160 ms and +86 MiB.
         - E7 and Y7 are refused or within the budget.
         - R-B2-1 and R-B2-2 pass.
         - The differential has 0 differences beyond the accepted additive
           `sourceCount` field.
         - The verifier left two stdin-blocked python tasks running; the coordinator
           stopped them.
       - WP4-RECHECK-A attempt 3: **PASS** on 972ccda (digest 635f909d), with no
         findings.
         - The delta is FIXB3 only.
         - Verify: 1,755 tests. The image has no maps.
         - Attempts 1 and 2 still hold.
       - WP4-RECHECK-B3: **FIX REQUIRED**, finding WP4-RB3-01 (Low).
         - Incompressible content (4–5 MB uploads, inside every limit) takes 508–611 ms
           and stalls health 640 ms, because of the 4 KiB-step inflate.
         - So the stated worst case of about 290 ms is false. Memory stays at most
           +123 MiB, with no 5xx.
         - Correctness (75/75), R-B2-1, R-B2-2, the differential and regression all
           hold.
       - Coordinator decision: close the class by derivation, not search. That means a
         linear inflate, a cost formula over the enforced limits, and realistic
         ceilings (for example 2 MiB) if needed.
       - WP4-FIXB4 is done (expert; author-reported).
         - Native zlib inflate: 251 ms becomes 16 ms. Parts over 512 KiB are decoded
           in steps.
         - Derived bound: t ≤ 40 ms + 14.8 ns·X + 339 ns·O and
           m ≤ 15 MiB + 13.3 B·X + 428 B·O.
         - New ceilings: 2 MiB upload, 1 MiB per part, 3 MiB per package and
           100k openings. That gives about 121 ms and +95 MiB. Measured worst:
           114 ms and +72 MiB.
         - Verify: 1,758 tests. Digest: b0611629….
       - WP4-DEPCLEAN2 is done: fflate 0.8.3 is a dev dependency now, with no other
         lock change; the runtime image omits it; audit --omit=dev finds 0. Verify:
         1,758 tests. Digest: 26fcc969….
       - WP4-FIXB4-FREEZE attempt 1 stopped correctly, with no commit. The validator
         rejected the board because the coordinator had left WP4-RECHECK-A as `done`
         while moving it to attempt 4. The coordinator fixed the board.
       - WP4-FIXB4-FREEZE attempt 2 committed and pushed 546cddaf (215 paths; digest
         26fcc969, 775 files; all checks 0).
       - WP4-REGATE4: **PASS** on 546cdda (digest 26fcc969, 775 files). verify 1,758,
         e2e 145/5 skipped, drill 208/0, races 10/10 x6. RB3 worst at the ceilings
         107 ms / +70 MiB against a derived ~120 ms / +96 MiB; no 5xx. 2 MiB ceiling
         enforced (413 above it); the differential is identical. Incident: one stray
         Node server child may remain from its task folder; the agent was TaskStopped.
       - WP4-RECHECK-B4 (fresh opus): **PASS** on 546cdda, digest 26fcc969 before and
         after, no findings. RB3-01 is closed. An independent LP recomputation of the
         bound gives 105.5 ms / +90.8 MiB (stated 121 ms / +95 MiB). Worst at the
         ceilings: 89–90 ms. Risks R-B4-1..4 are recorded.
       - WP4-RECHECK-A attempt 4 (fresh opus, delta): **PASS** on 546cdda, digest
         26fcc969 before and after, no findings. The 14 delta paths are FIXB4 and
         DEPCLEAN2 only; the other route limits are unchanged; fflate is absent from
         production with no area-A effect. New risks R-RA8 (Info) and R-RA9 (Low) are in
         old code. Its process listing shows the stray probe server is gone.
       - WP4-ACCREC is done (light, sonnet): the WP4_HANDOFF acceptance record (EN and
         VI) for 546cdda. Preflight 0; precommit 0.
       - STATE marks WP4 passed with its carried risks; NEXT_ACTION (EN and VI) points
         to WP5.
       - WP4-ACCEPT attempt 1 stopped correctly, with no commit. The validator found
         WP4-REGATE4 and WP4-RECHECK-B4 still at `running`. The coordinator had
         recorded their results without changing the status, and has now fixed it.
       - WP4-ACCEPT attempt 2 committed and pushed e7fe514 (163 handoff paths; all
         checks 0). **WP4 accepted.**
       - The board and STATE now have WP5 active.
       - WP5-PLAN is done (planner, opus; read-only).
         - No new gate before the assessment: WP4-REGATE4 passed on the same freeze.
         - Two parallel fresh opus audits on 546cdda: A (integrated workflow,
           submission and privacy) and B (reproducible release, verified restore and
           operations).
         - It outlines the pilot packet, sets owner decisions D-1..D-15, and lists the
           provisional tasks: fixes, REL, GATE, PILOT, FINAL-AUDIT, ACCREC, ACCEPT and
           GOV-RECOVERY.
       - The owner was asked D-1..D-15 (board `pending_owner_question`; it supersedes
         WP4-I-1..I-5).
       - WP5-ASSESS-A: **PASS** on 546cdda (digest 26fcc969 before and after), no
         findings.
         - The AC-13 integrated run passed 77/77 and the fault run 12/12.
         - verify 1,758, e2e 145/5 skipped, targeted suites 747.
         - Risks R-WA1..R-WA8; R-WA1..R-WA3 and R-WA8 go to the owner and the packet.
       - WP5-ASSESS-B: **FIX REQUIRED** on 546cdda (digest 26fcc969).
         - The release reproduces: dist byte-identical, and the image dist equals the
           local build. The image is non-root, with 0 forbidden files.
         - Drill: 208 PASS. The extra restore (finalized period, correction, OT
           reservation and partial use) matched.
         - Findings: WP5-B-01 (Medium), the runbook's Compose variables and `<image>`
           are undefined, so the restored and rollback instances have no binding;
           WP5-B-02 (Low), no protected env-file copy and no release identity are kept
           with the off-device backup.
         - Risks R-B5-1..R-B5-7.
       - WP5-FIXB is done (worker, sonnet; author-reported).
         - It changed docs/11 EN and VI, the `.env.example` header and one
           `compose.example.yaml` comment.
         - `docker compose config` exits 0 for the live, restored and rollback
           forms. verify 1,758; precommit 0; preflight 0.
         - Digest ed604d0c (775 files); the board's current digest is updated.
       - WP5-ASSESS-A moved to attempt 2, pending: a digest-bound area-A delta recheck
         on a later WP5 freeze. Attempt 1 is kept in its history.
       - WP5-FIXB-FREEZE committed and pushed 85838b5 on attempt 3 (105 paths; all
         checks 0). Attempts 1 and 2 stopped on board errors that the coordinator
         made: a stale override reason, and a pending audit that named no gate.
       - WP5-AC13 is done (worker-high, sonnet; author-reported).
         - New `tests/integration/ac13-two-week.test.ts` plus its helper. One
           deterministic scenario: 14 dates, sign-off (8:30, ledger posted once), a
           crash and restart around the send, a correction, an OT double-spend race,
           isolation and an overdue run.
         - It passes under 3 time zones, and the 3 solo runs pass. 2 mutations are
           caught. No product defect was found.
         - lint 0; verify 77 files / 1,759 tests. Digest 1e59ad31 (777 files).
       - WP5-AC13-FREEZE committed and pushed 8e99d2c (23 paths; all checks 0).
       - WP5-REL is done (worker, sonnet; author-reported).
         - New: docs/12 release notes and the WP5_HANDOFF pre-gate snapshot (EN and
           VI).
         - docs/11 sections 13–16: pilot activation, deactivation, rollback card and
           operator notes.
         - A README link to docs/12.
         - D-1..D-15 are marked as recommended and pending. The activation instant is
           set through an admin API call, because no screen exists for it.
         - All 14 env keys found; verify 1,759. Digest 0a64a75f (779 files).
       - WP5-REL-FREEZE committed and pushed 74d5bfe, the package-final freeze: 28
         paths, digest 0a64a75f, all checks 0, and no email or host found in the
         staged docs.
       - WP5-GATE: **PASS** on 74d5bfe (digest 0a64a75f, 779 files; NAS NOT
         VERIFIED).
         - verify 1,759 with 0 deprecation lines; e2e 145/5 skipped.
         - AC-13 passed 3 times (about 4.1 s each).
         - Drill: 208 PASS.
         - `docker compose config` exits 0 for the live, restored and rollback forms.
         - Env keys present; audit 0; validators PASS; scope clean; Docker clean.
       - Running, in parallel:
         - WP5-PILOT (worker, sonnet; handoff only, ports 47780–47789);
         - WP5-ASSESS-A attempt 2 (fresh opus; area-A delta on 74d5bfe; ports
           47700–47719).
       - WP5-PILOT is done (worker, sonnet; author-reported).
         - `WP5_PILOT_PACKET` EN and VI: 8 synthetic captured messages, 4 PDFs and 4
           `*-synthetic.png` renders, all viewed.
         - D-1..D-15 are pending. Digest unchanged; precommit and preflight 0.
         - Incident: a `python -` heredoc runaway, about 1 GB of output. The
           coordinator stopped the task and the agent. The owner is asked to delete
           the output file.
       - WP5-ASSESS-A attempt 2: **FIX REQUIRED** on 74d5bfe (digest 0a64a75f).
         - The software passes every area-A check. No application source changed.
         - The AC-13 test is sound and deterministic, and mutations fail it.
         - verify 1,759; e2e 145/5 on the rerun, after one `ERR_NO_BUFFER_SPACE` on
           run 1; probe 26/26.
         - Findings, both Low and docs/11 only:
           - WP5-A2-01: the status screen shows no "flag" field;
           - WP5-A2-02: the deep-link check cannot be done in the capture self-test.
         - Risks R-A2-1..5. Among them, the WP5-AC13 TZ runs did not actually change
           the zone.
       - WP5-FINAL-AUDIT: **FIX REQUIRED** on 74d5bfe (digest 0a64a75f).
         - B-01 and B-02 are resolved; the restored instance was started for real,
           bound correctly and came up paused.
         - Area B: PASS. The console activation step was tried in Edge and is safe.
         - Findings, both Low:
           - WP5-F-01: the same status "flag" issue, plus the CLI-refusal wording
             (runbook and packet);
           - WP5-F-02: packet section 8 names a freeze that has already happened.
         - Risks R-F1..R-F7. O-1 (the B-01 severity in WP5_HANDOFF) goes into
           ACCREC.
       - WP5-FIXD is done (worker, sonnet; author-reported).
         - F-01, F-02, A2-01 and A2-02 are fixed, and so are R-A2-1, R-A2-2/R-F1,
           R-F4, R-F5 and R-F6.
         - Only docs/11 EN and VI changed outside handoff/, plus the packet.
         - Parity and Grep are clean; verify 0. Digest 1b8ceae4 (779 files).
       - WP5-FIXD-FREEZE committed and pushed 9bcdd88 (197 paths; secrets Grep 0;
         all checks 0).
       - WP5-REGATE: **PASS** on 9bcdd88 (digest 1b8ceae4).
         - verify 1,759; e2e 145/5 skipped; drill 208.
         - AC-13 passed under real Asia/Tokyo and America/New_York zones, as the
           process itself reported.
         - Image `bd17d061…`.
         - The fixed lines hold.
         - Observation (Low): docs/11 section 11, line 274, still says the screen
           shows a sending "flag".
       - WP5-FIXD2 is done. The only hit was that sentence (EN and VI), and it is
         fixed. The sweep of docs/05, 07, 12, README and the packet is clean. Digest
         150420e7.
       - WP5-FIXD2-FREEZE committed and pushed 014bd47 (46 paths; all checks 0).
       - WP5-REGATE2: **PASS** on 014bd47 (digest 150420e7, 779 files).
         - Since 9bcdd88, only docs/11 changed outside handoff/: one line each in EN
           and VI.
         - All 230 dist files are identical; verify 1,759; AC-13 passed.
         - Status-flag claims: 0.
       - WP5-PKTID is done (attempt 2).
         - Packet sections 0 and 6 now name 014bd47, 150420e7 and the development
           image bd17d061 of 9bcdd88.
         - Sections 3 and 5 are labelled with their 74d5bfe/WP5-GATE source and the
           documentation-only delta.
       - WP5-RECHECK: **PASS** on 014bd47 (digest 150420e7), with no findings.
         - F-01, F-02, A2-01 and A2-02 were each checked against the live app and are
           resolved.
         - The small-risk fixes are accurate, and the packet identity is correct.
         - Risks R-RC-1..6 are optional Info items.
         - **WP5 software readiness is accepted, and the pilot is pending.**
       - WP5-ACCREC is done.
         - The WP5_HANDOFF acceptance record (EN and VI) is filled: 014bd47,
           150420e7.
         - O-1 is corrected: B-01 is recorded as Medium.
         - Parity and preflight pass.
       - STATE marks WP5 passed. NEXT_ACTION (EN and VI) points to GOV-RECOVERY and
         the owner's pilot review.
       - WP5-ACCEPT committed and pushed dd0c7d1 (74 handoff paths; secrets Grep 0;
         all checks 0; no tag). **WP5 accepted. WP1–WP5 software readiness is
         complete.**
       - GOV-RECOVERY-FIX is done (attempt 2).
         - The synthetic boards set their own status.
         - New `software_ready` probes: 1 accepted and 4 rejected.
         - Environment overrides default to the real files.
         - Probes went from 82 to 87, and the suite passes on a `software_ready` copy.
         - The source digest is unchanged.
       - GOV-RECOVERY-FREEZE committed and pushed 7f750e9 (12 paths; 87 probes; all
         checks 0).
       - GOV-RECOVERY-GATE: **PASS** on 7f750e9.
         - Scope: check_recovery.py only.
         - 87 probes pass on the real board and on a `software_ready` copy.
         - validate() accepts the copy. Validators, preflight and the digest are
           unchanged.
       - GOV-RECOVERY-AUDIT: **PASS** on 7f750e9, with no findings. GOV-E8-AUDIT R1 is
         closed.
         - The old suite fails on a `software_ready` copy; the new one passes.
         - All 82 old probes are kept, and 5 new ones are added.
         - Validator mutants V1–V6 are killed.
         - Optional risks R1–R4 go to the governance backlog.
       - GOV-RECOVERY-ACCEPT committed and pushed fe67f94, the closing commit: 39
         paths, 87 probes, secrets Grep 0, all checks 0, no tag.
       - The board is now `software_ready`.
         - `next_task_id` is null, and the phase is `complete-pilot-pending`.
         - No task is running or pending.
         - This last board change is uncommitted.
       - **Mission state: WP1–WP5 software readiness is complete. The concrete pilot
         packet waits for the owner.**
       - Then: a freeze, a docs-delta regate, WP5-PKTID, WP5-RECHECK (fresh opus),
         ACCREC and ACCEPT.
       - Then:
         - a freeze;
         - a regate, which applies TZ inside the process (R-A2-3);
         - a packet identity refresh;
         - one fresh recheck;
         - ACCREC and ACCEPT.
       - Then:
         - WP5-AC13, a committed integrated test (worker-high, sonnet), and its
           freeze;
         - WP5-REL, the release and setup notes plus the runbook activation,
           deactivation and rollback card; its freeze is the package-final freeze;
         - WP5-GATE;
         - WP5-PILOT;
         - the final audit, which covers the area-B recheck and the area-A delta.
     - Backlog: R-A2, R-A6, R-A8, B-R2.
     - Owner questions still open: WP4-I-1..I-5 (safe defaults in force), and R-A3
       (rollback approach) before the WP5 pilot.
     - Answered by the owner: F-1..F-6 (recommendations) and GOV-SKILL option B
       (readme-md skill removed).
     - Drafted for use after both PASS: the WP3-ACCREC brief (HANDOFF acceptance record)
       and the WP4-PLAN brief. The WP3-ACCEPT committer brief, STATE and NEXT_ACTION
       follow once WP3-ACCREC is done.
  4. One freeze, a full regate.
  5. Two fresh rechecks in parallel: A with digest binding, and B+C.

  Briefs are ready: WP3-FIXC, WP3-REGATE, WP3-RECHECK-A and WP3-RECHECK-BC. The
  WP3-FIX-FREEZE brief will be written after WP3-FIXC.
- Next action:
  1. Owner: review `handoff/delivery/WP5_PILOT_PACKET.md` and answer D-1..D-15. D-1,
     D-7, D-8 and D-13 are needed before activation. Run the owner NAS steps.
  2. A coordinator session resumes only for a fix round that the answers require, or
     for the authorized pilot. Real sending and activation stay owner-controlled.
- Blocker: none now (B: had space again for T06-FREEZE attempt 2; it may fill up again).
  Risk: the classifier may deny a committer `git add`; the coordinator does
  not route around a denial and asks the owner (approval message naming the action and its
  danger, or a manual commit with `git add -A`).
- Unchanged constraints: synthetic data and dry-run mail only; no real sending or
  deployment; no billing, global-settings or permission changes; commits only through
  timesheet-committer, on main until the first release; no amend, force-push or tags.
- Matching prompt: handoff/prompts/ORCHESTRATE.md (WP3 per WP3_IMPLEMENT.md after the
  accept commit).

## Orchestration recovery

- Board: [ORCHESTRATION.json](ORCHESTRATION.json). The last committed board is the
  recovery copy; the full WP2 history (tasks, attempts, decisions) is there and in git.
- Live processes: WP4-FIXB4-FREEZE (attempt 1) only.
- Temporary work folder (owner, 2026-10-05): `D:\.claude-tmp\timesheet\<task>`, outside
  Dropbox. Records before that date name `D:\timesheet-tmp\<task>`.
- Usage/reset: not observable.
