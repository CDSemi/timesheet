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
