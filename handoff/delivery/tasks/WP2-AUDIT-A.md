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
- Target: `reviewed_commit` = 8fae685949adb525ec137e5972202f58b408ac24, the WP2-GATE
  `freeze_commit`. The gate digest is
  8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2. Record HEAD and the
  source digest before and after; the digest must equal the gate digest.
- WP2-AUDIT-B runs at the same time in its own scratch clone. Do not share files with it.
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

### Auditor result (attempt 1)

Self-reported model: claude-opus-5-5. Fresh context; authored nothing in WP2; no source edited.

- Target: HEAD 8fae685949adb525ec137e5972202f58b408ac24 before and after (project folder and scratch clone);
  digest 8ebce5fe790870e0d52015fde658cfef0ee60929d6dcdafd80f563725f8524a2 before and after (equals the gate digest).
- Environment: scratch clone on C: outside Dropbox, Node v24.21.0 by full path, TEMP on C:. Clone, work databases and
  the WP1 export were deleted afterwards.
- Checks: npm ci exit 0; verify (deprecation tracing) exit 0, 31 files / 599 tests, smoke 28 PASS; 10 targeted test
  files 216/216, concurrency file 8/8 three more times; isolation + OT-leave e2e 14/14 (Edge, both projects).
- Own probes on real SQLite WAL files:
  - multi-process race: 4 OS processes, 22 race/mode combinations x 25 rounds, 0 violations; unsafe control double-booked 25/25;
  - ledger/privacy: 119/119 after probe-bug reruns, all runs kept;
  - WP1 (f32978f) -> WP2 upgrade: 18/18, 13 WP1 tables identical, v2 -> v3 identical;
  - supplement: ADV-A-03, E-3 midnight boundary in the saved zone, idempotent retries;
  - holiday-preview privacy probe.
- Advisory findings: ADV-A-01..04 fixed (rechecked); ADV-A-05 acceptable as backlog (Info).
- Verdict: **FIX REQUIRED**.
  - WP2-A-01 (Medium, privacy): `src/server/services/holidayImport.ts:191-227` (`affectedDays`, fields 217-218, returned
    at 265) and `src/client/components/HolidayImport.tsx:130`. The admin holiday-import preview returns per-date counts of
    employees' unfinalized day entries for any date from the prospective boundary on. The probe reproduced that the admin
    learns which days the only employee recorded work (10-05, 10-07), and the preview writes no audit event. This
    contradicts docs/01 "Initial boundary", docs/03 "Records" and the gate rule "admin is not blanket private-data access".
  - Required change: remove the employee-derived counts from the preview API, types and UI, update
    holiday-import.test.ts:228-247 (no e2e asserts the counts), and add a regression test that the preview is identical with and
    without employee entries. Alternative: an explicit owner decision recorded in docs/03 and docs/10 (+ .vi.md).
  - Non-blocking risks R1-R4 are in the report.
- Outputs: handoff/delivery/WP2_REVIEW_A.md and .vi.md; evidence and probe sources in
  handoff/delivery/evidence/WP2-AUDIT-A/ (masked, LF; staged-set precommit privacy check in a throwaway repo: PASS,
  0 findings).
