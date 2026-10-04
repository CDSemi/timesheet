# WP2-AUDIT-A dispatch brief

- Mission/task: timesheet-software-readiness / WP2-AUDIT-A; package WP2; kind audit;
  attempt 1; depends on WP2-GATE. This is a package-final independent audit of area A,
  ledger and privacy.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk H, novelty no. Fresh context. The task record is in English. WP2_REVIEW_A.md and
  its .vi.md are bilingual and follow handoff/templates/REVIEW.md.
- Author separation:
  - You authored nothing in WP2. The author agent IDs are on the board (WP2 tasks other
    than gates, audits and commits). Treat every report as a claim.
  - The strongest author model in WP2 is opus (T03), so the audit runs at opus.
- Target: `reviewed_commit` = the WP2-GATE `freeze_commit`, given at dispatch. Record HEAD
  and the source digest before and after; the digest must equal the gate digest.
- Execute only in your own scratch clone outside Dropbox, and delete it afterwards. Call
  Node 24 by its full path. Do not edit source.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/WP2_REVIEW.md;
  - docs/01, docs/02 (R-05, R-06, R-07, including the ADV-A-02 clarification), docs/03,
    docs/06 (AC-01, AC-03) and docs/10;
  - handoff/delivery/WP2_HANDOFF.md;
  - the advisory review [WP2_ADV_LEDGER_REVIEW](../WP2_ADV_LEDGER_REVIEW.md) and the
    WP2-ADVFIX record;
  - the board `owner_decisions` (E-2, E-3) and `coordinator_decisions`.

## Scope

1. **Ledger trace.** Follow raw → provisional → posted → reserved → available, and the
   480-minute conversion. There is no label-triggered spend; check LG-10 including
   `leave_kind` ot.
2. **Concurrency.** Run your own multi-process probe for double reservation and double
   consumption on a real SQLite file. Do not rely only on the authors' tests.
3. **Corrections**, including the ADV-A-02 R-05 application:
   - a correction that raises a debit, with insufficient balance, gives the pending
     variant;
   - a correction that lowers a spent credit is retained as a negative balance and
     flagged;
   - LG-08 and LG-09.
4. **Append-only triggers**, and the WP1 → WP2 upgrade preserving rows.
5. **Route inventory.** There is no public credit or debit endpoint. The test-only credit
   seeding in tests/e2e/fixtures.ts must be unreachable from production code and from
   any route or flag.
6. **Evidence CSV**: formula injection, ownership, headers and no-store.
7. **History**: own events only, and the per-user cursor (ADV-A-04).
8. **Privacy across the package**:
   - no other user's data through any route or UI;
   - admin is not blanket access;
   - no password or hash in any response, log, audit payload or evidence;
   - screenshots and committed evidence are synthetic only. Report only masked values.
9. **Recheck the advisory findings** ADV-A-01..04: are they fixed? Is ADV-A-05 (Info)
   acceptable as backlog?
10. **Changes since the advisory review that touch the ledger**:
    - T05 (`leave_kind`, OT mismatch data);
    - T11 (UI record use per E-3; idempotency through the UI);
    - CorrectionResult `pending`, which WP3 callers must handle;
    - any server change after e92add0.
11. AC-01 for the ledger, leave, export and history; AC-03.

## Output

- handoff/delivery/WP2_REVIEW_A.md and .vi.md.
- Results in this file.
- Evidence and probes in handoff/delivery/evidence/WP2-AUDIT-A/ (masked, LF).
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP2-A-nn), a
  severity, file:line and the required change.

Return at most 300 words, beginning with your self-reported model.

## Results

(Auditor appends here.)
