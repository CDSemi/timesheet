# Mission checkpoint (WP2 accepted, WP3 planning)

Based on [CHECKPOINT](../templates/CHECKPOINT.md). Updated 2026-10-04 UTC.

- Active package and role: WP3 (planning); coordinator. Actual model claude-opus-5-5
  (owner choice; profile inherit); effort not observable. Session
  44e3451e-da20-4a12-94bb-6b94fc5f531e.
- Repository: branch main.
  - HEAD = origin/main = b060d330960bddaa2b98a80444775e67c55eac01 (WP3-T02-FREEZE).
    WP2 accept commit 3ead61e; accepted WP2 source 5fafeaee72509c6110a907458643bf7582dad81a.
  - Gate digest of record e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df
    (WP2-GATE4). Current WP3 working digest 629e7d9d… (T02, committer-checked; no WP3
    gate yet).
  - Uncommitted (handoff only): the board, this checkpoint, the T02-FREEZE results and
    evidence. They go into the next freeze.
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
- Running: WP3-T03-FREEZE (committer).
- Next action:
  1. Record the T03 freeze; then WP3-T04 (canonical snapshot, review payload and hash;
     brief ready). T05 needs the owner's F-2 answer.
  2. Then WP3 tasks with freezes, the package-final gate and fresh audits; WP4; WP5
     (starts with independent acceptance); a concrete pilot packet. The real pilot stays
     owner-controlled.
- Blocker: none. Risk: the classifier may deny a committer `git add`; the coordinator does
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
- Live processes: WP3-T03-FREEZE only.
- Usage/reset: not observable.
