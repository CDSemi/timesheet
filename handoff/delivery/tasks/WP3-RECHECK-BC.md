# WP3-RECHECK-BC dispatch brief

- Mission/task: timesheet-software-readiness / WP3-RECHECK-BC; package WP3; kind audit;
  attempt 1; depends on WP3-REGATE (PASS). This is a fresh recheck of the WP3-AUDIT-B
  and WP3-AUDIT-C findings after fix round 1, with regression checks for areas B and C.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no. Fresh context. The task record is in English.
  `WP3_RECHECK_BC.md` and its `.vi.md` are bilingual and follow
  handoff/templates/REVIEW.md.
- Author separation:
  - You authored nothing in WP3, including WP3-FIXB and WP3-FIXC. The author agent IDs
    are on the board.
  - Treat every fix report, HANDOFF line and gate result as a claim.
  - You may reuse the probe sources published in handoff/delivery/evidence/WP3-AUDIT-B/
    and WP3-AUDIT-C/ as a starting point, but run everything yourself.
- Target: `reviewed_commit` = the WP3-REGATE `freeze_commit`. The coordinator gives the
  SHA and the regate digest in the dispatch prompt.
  - Record HEAD and the source digest as your first two commands after
    `node --version`, and again at the end.
  - The digest must equal the regate digest.
- WP3-RECHECK-A runs at the same time in its own clone. Do not share files or processes
  with it. Use distinct ports.
- Environment:
  - Execute only in your own scratch clone under `D:\timesheet-tmp\WP3-RECHECK-BC`,
    outside Dropbox; use it for TEMP/TMP.
  - Delete only files you created; never remove folders recursively.
  - Use Node 24 by full path; plain `node` resolves v26.
  - Never open an interactive shell; never kill processes by PID.
  - Do not edit source. Use capture mode only. Use the installed Edge channel.
  - Never write into the repository root. Never redirect to /dev/null or nul, including
    `2>/dev/null`.
- If a permission check denies a call, stop that line of work and report it; do not
  retry or rephrase it.
- Read AGENTS.md from disk first. Then read:
  - [WP3-AUDIT-B](WP3-AUDIT-B.md) and [WP3-AUDIT-C](WP3-AUDIT-C.md), scopes and results;
  - the reviews WP3_REVIEW_B.md and WP3_REVIEW_C.md;
  - [WP3-FIXB](WP3-FIXB.md) and [WP3-FIXC](WP3-FIXC.md), including their binding
    coordinator decisions;
  - handoff/prompts/WP3_REVIEW.md;
  - the fix-round section of handoff/delivery/WP3_HANDOFF.md;
  - the WP3-REGATE results.

## Scope

1. For each finding (WP3-B-01..03, WP3-C-01..03):
   - reproduce the original scenario with your own probe;
   - confirm the fix matches the coordinator decision;
   - judge whether the regression test is meaningful (it fails on a1cd566 and passes
     on the freeze);
   - report fixed, partly fixed or not fixed.
2. **Regressions in area B:**
   - jobs, retries and uncertain sends;
   - the activation bound and the empty-period F-1 behaviour for accounts created
     before activation;
   - the note and image matrix;
   - GET safety, including any new review-hint GET;
   - UI tokens on desktop and mobile.
3. **Regressions in area C:**
   - rerun the route-inventory and authorization matrix probes, the revocation race and
     attribution;
   - the hint never appears on shared views, never in admin responses, and never leaks
     another owner's grantee names.
4. New code from the fix round: deprecated APIs, hard-coded CSS values, unbounded
   queries.
5. **Changed existing assertions.** WP3-FIXB changed one existing assertion in
   tests/integration/delivery-crash.test.ts to "claimed 0". Judge whether this
   weakens coverage or correctly reflects recovery in every pass. Also judge two
   points:
   - the residual edge "a lease expiring mid-pass is recovered on the next pass";
   - the creation bound clamping saved settings.
6. **WP3-FIXC deviations.**
   - C-02 attributes an act to a grantee when the actor is not the owner and the
     operation is one that a shared route writes (`SHARED_ACT_OPERATIONS`), rather than
     from a recorded path or flag. Judge whether this meets the decision. Judge whether
     the drift-guard test is enough, or whether a recorded marker is required now.
   - A grantee leaving a share is no longer named in the owner's History; it shows
     "Share ended" by someone else. Judge this against WP3-REQ:455-457.
   - The old time-window test was replaced. Judge whether coverage was lost.

## Output

- handoff/delivery/WP3_RECHECK_BC.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP3-RECHECK-BC/:
  - masked (`<email>`, `<user>`), LF;
  - probes stored as `*.mjs.txt` / `*.py.txt`;
  - screenshots named `*-synthetic.png`.
- Write markdown links only to files, never to directories.
- Run the precommit privacy check over your outputs on a temporary index before
  hand-back.
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED, with each finding's disposition.
- Give each new finding an ID (WP3-RBC-nn), a severity, file:line, a reproduction and
  the required change.
- Leave no server, browser or runner process.

Return at most 300 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1, 2026-10-05)

- Self-reported model: claude-opus-5-5 (profile timesheet-auditor, agent `a4f9e4253ee83db68`; effort not observable).
  Fresh context; authored nothing in WP3, including WP3-FIXB/FIXC (sonnet). Review:
  [WP3_RECHECK_BC](../WP3_RECHECK_BC.md) and [WP3_RECHECK_BC.vi](../WP3_RECHECK_BC.vi.md). Evidence:
  `handoff/delivery/evidence/WP3-RECHECK-BC/` (start at [00-commands.txt](../evidence/WP3-RECHECK-BC/00-commands.txt)).
- HEAD before and after: 2f2520e1ab80ff55938b70cd469f0bfe888e04a2. Digest before and after:
  eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410 (721 files), in the project and the scratch clone,
  equal to the regate digest.
- **Verdict: FIX REQUIRED** (two Low findings).
- Checks:
  - `npm ci` 0. `verify` with deprecation tracing 0: 62 files / 1407 tests, 40 smoke `PASS` lines, 0 deprecation lines.
  - `test:e2e` 0: 127 passed, 5 skipped.
  - Race and regression files, 5 rounds: 0 each.
  - The freeze's regression tests on a1cd566: 23 fail.
  - Own probes on both commits: B1 27/0 (a1cd566 8 FAIL), B2 25/0 (4 FAIL), B3 8/1 (4 FAIL), C1 84/1 (11 FAIL),
    C2 race 23/0, B4 GET 204 requests with 1 audited write, B5 tokens 0 literals, B6 matrix 30/0, U1 Edge 25/2.
- Dispositions: B-01, B-02, C-01, C-02 and C-03 are fixed. B-03 is partly fixed.
- New findings:
  - WP3-RBC-01 Low, `src/client/components/sharingModel.ts:177`. The actor-less automatic OT credit
    (`finalization.ts:627`, `:650`) still reads "by someone else". Required change: mark system events from the event
    itself (actor null → server flag), not from a list; add a test.
  - WP3-RBC-02 Low, `src/server/services/sharedActs.ts:91-94`. With no owner finalization, the hint drops grantee
    changes made before the period start (for example planned leave). Required change: no time lower bound (the work
    dates bound the rows), or a decision that accepts the gap; add a test.
- Judgements:
  - "claimed 0": a correct reflection of the new order. The handler's `sending` branch lost its direct test (R3).
  - Residual edge: acceptable (≤ one runner interval, never resent).
  - Creation clamp: correct and necessary (on a1cd566 the overdue choice fabricated 5 pre-account submissions).
  - `SHARED_ACT_OPERATIONS`: meets the outcome now. A marker is not required yet; it is needed before any non-shared
    day/session write for another person (WP4).
  - Grantee leave: consistent with WP3-REQ:455-457.
  - Replaced test: no material coverage lost.
- Regressions B/C: none.
- No server, browser or runner process left. Privacy check: see `17-privacy.txt`.
