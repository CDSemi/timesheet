# WP2-ADV-REVIEW dispatch brief

- Mission/task: timesheet-software-readiness / WP2-ADV-REVIEW; package WP2; kind diagnose
  (advisory independent review, not package acceptance); attempt 1; depends on
  WP2-ADV-GATE.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty yes. Fresh context. Task record in English; WP2_ADV_LEDGER_REVIEW.md and
  its .vi.md are bilingual (REVIEW template).
- Purpose: catch ledger, privacy and concurrency defects in T02–T04 before UI tasks build
  on them. The package-final audits (AUDIT-A and AUDIT-B) still cover the final freeze;
  AUDIT-A can then focus on changes after this review.
- Author separation: you are not an author of WP2-T01..T04. Their agent IDs are on the
  board. Treat their reports as claims.
- Target: commit e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96 and the WP2-ADV-GATE digest.
  Record HEAD and the digest before and after the review. Use a scratch clone outside
  Dropbox for any execution.

## Scope (area A: ledger and privacy)

1. **T02 ledger core.** Migration 0002 schema and triggers (append-only,
   counters/invariants, version bump), pure balance and correction functions, and
   postCredit, postCorrection and postDeficitDebit against R-05 and R-06 (docs/02 as
   updated by the owner decisions), LG-01, LG-02, LG-08 and LG-09. Includes the WP1
   upgrade path.
2. **T03 leave lifecycle.** Permission plus reserve under BEGIN IMMEDIATE, E-5
   insufficient balance, E-3 record use (on or after the leave date in the saved
   reporting zone, partial use, idempotent), cancel, linked reversal, 1:1 minutes,
   LG-03..LG-07 and LG-10. Check that the worker_threads harness really races and that
   the proofs are meaningful.
3. **T04 API.** Ownership: the session user is both actor and owner on every route, ID
   swaps return 404, and an admin cannot read employee data. Also check: no credit or
   debit route; the evidence CSV (content, formula neutralization, filename, no-store);
   history (own events only, no leakage of another person's ID); `expected_version` on
   mutations; CSRF/origin.
4. **Design notes recorded by the authors**, to judge: a 409 source_key_conflict; a
   pending debit that is not persisted (deferred to WP3); no workflow to clear the
   reconciliation flag; zero-minute credits rejected; no leave_kind on day_entries yet
   (T05); provisional periods only for days with sessions.
5. Run your own targeted negative probes (at least five) on real SQLite: double
   reservation, consume beyond reserved, reversal beyond consumed, an ID swap, and CSV
   injection.

## Output

handoff/delivery/WP2_ADV_LEDGER_REVIEW.md and its .vi.md; results in this file; evidence
in handoff/delivery/evidence/WP2-ADV-REVIEW/ (masked, LF). Give an advisory verdict:
CLEAN, or FINDINGS, with each finding's ID, severity, file:line and required change.
Return at most 300 words, beginning with your self-reported model.

## Results

(Reviewer appends here.)

### Attempt 1 (auditor, claude-opus-5-5) - advisory, kind diagnose

- Fresh context; reviewer authored nothing in the snapshot (authors T02 `ac8dc499fe285f6f8`,
  T03 `aec599e3ea7a8c1ca`, T04 `adfa8a22e3c120a1c`). Strongest author model claude-opus-5-5,
  equal to the reviewer's.
- Target e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96 (= origin/main). Digest before and after
  491312dd38382198bc4fae1fcb3352ab349c25e6ada187a46de819031913d945 (550 files), equal to the
  WP2-ADV-GATE digest; HEAD unchanged. All execution in a scratch clone outside Dropbox
  (per-process safe.directory override), deleted afterwards. Node v24.21.0.
- Checks: `npm run verify` exit 0 (19 files / 335 tests, smoke 13/13, no deprecation warning);
  9 ledger/privacy test files exit 0 (159 tests); authors' concurrency test exit 0 (overlap
  20/20 per race). Reviewer probes on real SQLite WAL files: 48/48 service and HTTP negative
  checks (double reservation, consume beyond reserved, reversal beyond consumed, SQL tamper,
  ID swap by a second employee and by an admin, CSRF/origin, expected_version, CSV injection
  and headers, E-3 local-midnight boundary, LG-10, history); a separate-OS-process race
  (LG-07 30/30 and 20/20 with a lock blocker, 4x80 20/20, double use/reverse and cancel versus
  use 20/20; the unsafe control double-books 10/10); WP1 (f32978f code) to WP2 upgrade with all
  12 WP1 tables byte-identical. Two probes had selector bugs in run 1 (probe-side, fixed and
  rerun; both runs kept).
- Advisory verdict: FINDINGS (no package decision).
  - ADV-A-01 Low, `src/server/services/ledger.ts:344-354`: a correction retried with the same
    key and a different corrected value returns `duplicate` instead of `source_key_conflict`.
    Compare the implied corrected magnitude; add a test.
  - ADV-A-02 Low (decision needed), `ledger.ts:356-391`: a debit-increasing correction posts
    past the available balance (R-05 says pending). Apply `canDebit` to the increase, or record
    a canonical docs/02 decision (+ .vi); add a test.
  - ADV-A-03 Low, `src/server/services/otLeave.ts:607-613`: cancel with a stale
    `expected_version` answers 200 `unchanged` when nothing is reserved (409 after partial use).
    Check the version first or document the no-op; add a test.
  - ADV-A-04 Low (privacy metadata), `src/server/services/history.ts:60-63,82`: `next_before`
    is the global audit rowid, so cursor gaps reveal other users' event counts. Use a per-user
    or opaque cursor; add a test.
  - ADV-A-05 Info, `otLeave.ts:220-237,372-422`: duplicates the ledger append path; optional
    single internal append function.
- Design notes judged acceptable with WP3/T05 carry-overs (pending debit persistence, 0 to
  positive credit as a new credit, reconciliation display, leave_kind LG-10 case).
- Reports: handoff/delivery/WP2_ADV_LEDGER_REVIEW.md and .vi.md. Evidence:
  handoff/delivery/evidence/WP2-ADV-REVIEW/ (00-commands.txt indexes every command and exit).
- Next action: the coordinator decides on a bounded fix task for ADV-A-01..04 (or a canonical
  decision for ADV-A-02); WP2-AUDIT-A rechecks at the package-final freeze.
