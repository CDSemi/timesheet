# Mission checkpoint (WP2 accepted, WP3 planning)

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Updated 2026-10-04 UTC.

- Active package and role: WP3 (planning); coordinator. Actual model claude-opus-5-5
  (owner choice; profile inherit); effort not observable. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: branch main.
  - HEAD = origin/main = 8ad2e4f42ab6f5ec25f66cf3069c2178de536bd2 (WP3-T13C-FREEZE).
    WP2 accept commit 3ead61e; accepted WP2 source 5fafeaee72509c6110a907458643bf7582dad81a.
  - Gate digest of record e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df
    (WP2-GATE4). Current WP3 working digest 9b8d6b26… (T13C, committer-checked; no WP3
    gate yet).
  - Uncommitted (handoff only): the board, this checkpoint and the T13C-FREEZE results
    and evidence.
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
- Running: WP3-T14-FREEZE attempt 2 (same committer). Attempt 1 stopped at preflight
  because of a broken link in the WP3-GATE brief, which the coordinator has fixed.
- Next action:
  1. Record the T14 freeze; then T15 (brief ready; the package-final freeze), WP3-GATE
     (brief ready) and the two fresh area audits.
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
- Live processes: WP3-T14-FREEZE only.
- Usage/reset: not observable.
