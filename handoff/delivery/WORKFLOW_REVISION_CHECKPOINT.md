# Mission checkpoint (WP3 accepted; GOV-SKILL cycle and WP4 planning)

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Updated 2026-10-05 UTC.

- Active package and role: WP3 (fix round 1: regate and rechecks); coordinator. Actual
  model claude-opus-5-5 (owner choice; profile inherit); effort not observable. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: branch main.
  - HEAD = origin/main = a1dc01b98f3c8be7478384adf73d9c194bf9a105 (WP4-T01-FREEZE).
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
     - Running: WP4-T02-FREEZE attempt 2 (same committer). It commits the original set;
       `WP4-T03.md` stays untracked until the next freeze.
     - Drafted for use after both PASS: the WP3-ACCREC brief (HANDOFF acceptance record)
       and the WP4-PLAN brief. The WP3-ACCEPT committer brief, STATE and NEXT_ACTION
       follow once WP3-ACCREC is done.
  4. One freeze, a full regate.
  5. Two fresh rechecks in parallel: A with digest binding, and B+C.

  Briefs are ready: WP3-FIXC, WP3-REGATE, WP3-RECHECK-A and WP3-RECHECK-BC. The
  WP3-FIX-FREEZE brief will be written after WP3-FIXC.
- Next action:
  1. Record WP3-FIX2. It covers:
     - WP3-RBC-01 and WP3-RBC-02;
     - the sending-branch test;
     - the docs/05 creation and setup bounds;
     - the docs/10 H-Q1 decision;
     - the WP4 carry item.
  2. Then WP3-FIX2-FREEZE (its brief is written after FIX2) and WP3-REGATE2. The
     briefs for WP3-REGATE2, WP3-RECHECK-BC2 and the WP3-RECHECK-A attempt 2 note are
     ready.
  3. Then two parallel rechecks: WP3-RECHECK-BC2, plus WP3-RECHECK-A attempt 2 as an
     area-A delta.
  4. Then the WP3 acceptance.
  2. Then the WP3 acceptance record and the accept commit after the rechecks pass.
  2. Then WP3 tasks with freezes, the package-final gate and fresh audits; WP4; WP5
     (starts with independent acceptance); a concrete pilot packet. The real pilot stays
     owner-controlled.
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
- Live processes: WP4-T02-FREEZE only.
- Temporary work folder (owner, 2026-10-05): `D:\.claude-tmp\timesheet\<task>`, outside
  Dropbox. Records before that date name `D:\timesheet-tmp\<task>`.
- Usage/reset: not observable.
