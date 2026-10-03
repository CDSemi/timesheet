# WP2-ADVFIX dispatch brief

- Mission/task: timesheet-software-readiness / WP2-ADVFIX; package WP2; kind fix; attempt
  1; addresses the advisory review WP2-ADV-REVIEW (FINDINGS ADV-A-01..04). Advisory
  findings are fixed now, before UI work builds on the ledger.
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size S, risk H (ledger and privacy), novelty no.
- Read AGENTS.md from disk first, then
  [WP2_ADV_LEDGER_REVIEW](../WP2_ADV_LEDGER_REVIEW.md) (findings with file:line), its
  evidence in handoff/delivery/evidence/WP2-ADV-REVIEW/ (the reviewer's probes),
  docs/02 R-05 and R-06, and docs/10. Records in English; docs keep their .vi.md pairs.
- Baseline: main at e92add0b4c26e203dc5b06841f5a3f5a6bf9eb96 plus uncommitted handoff
  records.

## Required fixes (binding)

1. **ADV-A-01** (`src/server/services/ledger.ts:344-354`). A correction retried with the
   same key and a different implied corrected value must return 409
   `source_key_conflict`. Today it returns `duplicate`. An identical retry still returns
   the existing entry. Add a test.
2. **ADV-A-02** (`ledger.ts:356-391`, coordinator decision). Apply R-05 as written. A
   correction that increases a deficit debit must check the increase with `canDebit`.
   When the available balance is insufficient, the increase gets the R-05 pending
   outcome; nothing is overdrawn silently. A correction that reduces a credit after it
   was spent may still produce a negative balance flagged for reconciliation (LG-08).
   Add tests for both. In docs/02 R-05/R-06 and its .vi.md, state this clarification in
   one or two sentences. Record the decision in docs/10 and its .vi.md as a coordinator
   application of the existing R-05, dated 2026-10-03, reversible by the owner.
3. **ADV-A-03** (`src/server/services/otLeave.ts:607-613`). Cancel checks
   `expected_version` before anything else. A stale version returns 409
   `stale_version`, even when nothing is reserved. Add a test.
4. **ADV-A-04** (`src/server/services/history.ts:60-63,82`). The history cursor must not
   expose the global audit rowid. Use a per-user ordinal, or an opaque token that leaks
   no other-user counts. Add a test proving that gaps or values do not reveal other
   users' events.
5. **ADV-A-05** (Info). No change; the coordinator records it in the backlog.

## Owned (writable) paths

src/server/services/ledger.ts; src/server/services/otLeave.ts;
src/server/services/history.ts; src/server/routes/history.ts (only if the cursor
parameter shape changes); tests/integration/ledger.test.ts;
tests/integration/ot-leave.test.ts; tests/integration/history.test.ts;
docs/02_TIME_AND_OT_RULES.md and .vi.md; docs/10_DECISIONS_AND_SOURCES.md and .vi.md;
this report; handoff/delivery/evidence/WP2-ADVFIX/.

## Checks

- Write each regression red-first.
- Rerun the reviewer's relevant probes where practical.
- Run `npm run verify` and `npm run digest` with Node 24 on PATH, and confirm
  `node --version`.
- Run `validate_package.py --preflight` with the workflow Python, because docs change.
- Evidence must be masked and LF. Use no deprecated APIs.

Return at most 200 words, beginning with your self-reported model: each finding's fix and
test, verify exits, digest, deviations.

## Results

(Worker appends here.)

### Step 1 — red-first tests, fixes, docs (worker, attempt 1)

Node v24.21.0 (portable, confirmed). Evidence in handoff/delivery/evidence/WP2-ADVFIX/.

- Red first (`01-red.txt`): 7 new tests failed on the baseline code (A-01 x2, A-02 x3, A-03 x1, A-04 x1).
- ADV-A-01: `postCorrection` duplicate branch computes the value implied at the existing entry (original plus corrections with rowid up to and including it) and throws 409 `source_key_conflict` when it differs from `correctedMinutes`; an identical retry (also after later corrections) still returns `duplicate`. Tests in tests/integration/ledger.test.ts (credit and deficit-debit).
- ADV-A-02: a correction that increases a deficit debit is checked with `canDebit(available, increase)`; short balance returns a new `pending` variant of `CorrectionResult` (`reason: insufficient_balance`, `entry: null`, `deltaMinutes: 0`, `debitIncreaseMinutes`, `availableMinutes`), appends nothing and writes no audit event. A correction lowering a spent credit still posts and is flagged (LG-08). Tests: pending/no entry, only the increase is checked with reservations, retry after more credit posts once, lowering debit/credit not blocked.
- ADV-A-03: `cancelOtLeave` calls `checkVersion` before the no-op branch; stale version is 409 `stale_version` even when nothing is reserved. Test in ot-leave.test.ts (also covers current/omitted version `unchanged` and a stale cancel after cancel).
- ADV-A-04: `getHistory` cursor is now the 1-based ordinal among the caller's own events (`row_number() OVER (ORDER BY rowid)` inside the owner filter; `audit_events` is append-only by trigger, so ordinals are stable). The parameter shape (`before` digits) is unchanged, so routes/history.ts is untouched. Tests in history.test.ts: consecutive ordinals despite 7 admin events, all own events exactly once, a large global-looking cursor selects nothing of others.
- ADV-A-05: no change.
- Docs: docs/02 R-05 and R-06 (and .vi) clarified in one sentence each; docs/10 (and .vi) records the coordinator application of R-05, dated 2026-10-03, reversible by the owner.
- `npm run verify`: exit 0 (19 files / 344 tests, typecheck, lint, build, smoke 13/13, no deprecation warning with --trace-deprecation --pending-deprecation) - `02-verify.txt`.
- `npm run digest`: exit 0, `fac640f1da5457ed1dc41b35579fc824bc746d774fc40b58b7923babdd4db2ec` (550 files, handoff/ excluded) - `03-digest.txt`.
- `validate_package.py --preflight` (workflow Python): exit 0 - `04-preflight.txt`.
- Reviewer probes rerun against the working tree (`05-reviewer-probes-rerun.txt`): pc-stale-cancel now 409 stale_version; pe-history-cursor cursors 5,4,3,2 (no gap leak); pa-negative 48 pass / 0 fail, P5.1 now 409 source_key_conflict, P5.3 now pending.
- Deviations: none beyond owned paths (src/server/routes/history.ts untouched). Note for the coordinator: `CorrectionResult` gained a `pending` variant; WP3 callers must handle it.
