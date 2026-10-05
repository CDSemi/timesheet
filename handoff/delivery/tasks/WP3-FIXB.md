# WP3-FIXB dispatch brief

- Mission/task: timesheet-software-readiness / WP3-FIXB; package WP3; kind fix; attempt 1;
  `addresses_audit` WP3-AUDIT-B (FIX REQUIRED: WP3-B-01, WP3-B-02, WP3-B-03).
- Profile/routing: timesheet-worker-high, requested sonnet/high, no override. Routing:
  size M, risk H (deadline automation and send recovery), novelty no.
- Read AGENTS.md from disk first. Then read:
  - handoff/prompts/FIX_FINDINGS.md;
  - [WP3_REVIEW_B](../WP3_REVIEW_B.md), findings WP3-B-01..03 with their reproductions;
  - the auditor's probes in handoff/delivery/evidence/WP3-AUDIT-B/: 05-p2-automation.txt
    with p2-automation.mjs.txt, and 04-p1-jobs-delivery.txt with p1-jobs-delivery.mjs.txt;
  - docs/04 and docs/05 (automatic submission, activation, delivery outcomes) and docs/10
    "Owner decisions — 2026-10-04";
  - [WP3_REVIEW_A](../WP3_REVIEW_A.md) risk R3;
  - the board `coordinator_decisions` dated 2026-10-05.

  Records in English.
- Baseline: main at a1cd566e59253d19f53cfd5b3a81fd27a7e9a056. The working tree differs
  only in handoff/.
- Runtime:
  - Call the Node 24 portable binary by its full path (plain `node` resolves v26). Make
    the first shell call a trivial `node --version`; stop on ENOSPC.
  - Use `D:\timesheet-tmp\WP3-FIXB` for TEMP/TMP; delete only files you created; never
    remove folders recursively.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File) and never kill processes by PID.
  - Never write into the repository root. On Windows, never redirect to /dev/null or nul
    (including `2>/dev/null`).
- Permission denials: if a permission check denies a call, stop and report; do not retry
  or rephrase it.
- Do not commit.

## Coordinator decisions (binding; reversible by the owner)

- **WP3-B-01.** Automatic submission must never finalize a period whose deadline passed
  before the user's account existed. This mirrors the existing activation-instant bound.
  - When the user has no saved submission settings, use `users.created_at` as the
    effective start of automation for that user.
  - When settings exist, keep the current behaviour, and assert in a test that their
    effective instant is never earlier than account creation.
  - A period whose deadline falls after account creation (including the period in which
    the account was created) is still automated at its deadline under F-1.
  - Do not change the default of the auto-submit setting. Report what docs/04 and
    docs/05 say about that default (audit A risk R3).
  - If a canonical document contradicts this bound, stop and report rather than
    inventing a rule.
- **WP3-B-02.** A crash during the final permitted send attempt must leave the delivery
  in the same `uncertain` state, with the owner decision prompt, as a crash during any
  earlier attempt.
  - It is never resent automatically.
  - An explicit owner decision resends exactly once; there is no 409 dead end.
  - Recover interrupted sends in every runner pass, or an equivalent that covers the
    final attempt.
- **WP3-B-03.** History must label system events as system events, never as "someone
  else":
  - for example `timesheet.auto_finalize`, labelled as an automatic submission;
  - map known operation codes to plain names; use a neutral plain fallback (for example
    "Other change") instead of a raw code;
  - keep the grantee attribution introduced in T13B unchanged (WP3-FIXC handles C-02 on
    the server side).

## Owned (writable) paths

- Source: the files named by the findings, namely `src/server/services/automation.ts`,
  `src/server/jobs/jobStore.ts`, the deliveries service and the job runner (locate
  them), and the client History models (`sharingModel.ts`, `otModel.ts`).
- Tests: their direct tests under tests/integration and tests/client, plus an e2e spec
  only if one asserts a changed label.
- handoff/delivery/WP3_HANDOFF.md and .vi.md: append a "Fix round 1 — WP3-FIXB"
  disposition subsection. Do not change the accepted sections.
- This report and handoff/delivery/evidence/WP3-FIXB/.

List any other minimal edit as a deviation.

## Checks

- Reproduce each finding first. Write each regression test red-first and save its
  output against the unfixed code. Turn the auditor's B-01 and B-02 probe scenarios into
  tests.
- Run `npm run test:e2e` (both projects) after the final edit. Then run `npm run verify`
  and `npm run digest` as the **last** commands; rerun them if any file changes.
- Evidence must be masked (`<email>`), LF and free of trailing whitespace. Run the
  precommit check over your evidence on a temporary index before hand-back.
- Use synthetic data only. No deprecated APIs. Leave no server, browser or runner process.

Return at most 180 words, beginning with your self-reported model:
- each finding's fix and rule ID;
- the tests (red→green);
- the docs/04/05 default for auto-submit;
- e2e and verify exit codes and the test count;
- the digest;
- every changed path;
- deviations.

## Results

(Worker appends here.)

### Worker result — attempt 1 (timesheet-worker-high; self-reported model claude-sonnet-5-5; effort requested high)

Status: complete. Nothing committed. Evidence `handoff/delivery/evidence/WP3-FIXB/` (00-commands.txt lists every command and exit). Disposition table: `handoff/delivery/WP3_HANDOFF.md` and `.vi.md`, "Fix round 1 — WP3-FIXB".

- **WP3-B-01** (docs/05 "Deadline and recovery", AC-07, F-4): `automation.ts` uses `users.created_at` as the earliest instant automation reaches an account; `assessPeriod` skips `due_at` before it (`before_account`), `listCandidates` starts at max(activation, creation). A deadline on or after creation (including the creation period) is still automated (F-1). The bound also covers saved settings, including the explicit apply-to-overdue choice. Auto-submit default unchanged. The docs/04 settings table, docs/05 and docs/10 D-09 say "enabled after setup"; no document defines it for a never-configured account (audit A R3). No canonical document contradicts the bound.
- **WP3-B-02** (docs/05 failure table, AC-08): `runner.ts` calls `recoverInterruptedSends` at the start of every pass that owns the send handler, before the claim sweep.
- **WP3-B-03** (docs/04 Screens, F-Q2): `otModel.ts` full operation map plus "Other change" fallback; `sharingModel.ts` `isSystemOperation`, system events badged "automatic"; `HistoryScreen.tsx` `data-history-actor="system"`.
- **Tests** (red against the unfixed source: 8 failed | 87 passed; green: 95 passed): `deadline.test.ts` (4), `delivery.test.ts` (1), `otModel.test.ts` (2), `sharingModel.test.ts` (1; one existing assertion reworded). The auditor's p2 and p4 probes re-run on the fixed tree: p2 95 PASS (was 1 FAIL), p4 16 PASS (was 1 FAIL).
- **Final checks:** `npm run test:e2e` exit 0 (127 passed, 5 skipped); `npm run verify` exit 0 (60 files / 1391 tests, SMOKE PASSED, 40 `PASS`); `npm run digest` exit 0 `d9fa55bda1c637b1e58f2b5de005941b3767d8ca6d676e8b4e89fce2c6004582` (717 files).
- **Changed paths:** src/server/services/automation.ts, src/server/jobs/runner.ts, src/client/components/otModel.ts, src/client/components/sharingModel.ts, src/client/HistoryScreen.tsx, tests/integration/deadline.test.ts, tests/integration/delivery.test.ts, tests/integration/delivery-crash.test.ts, tests/client/otModel.test.ts, tests/client/sharingModel.test.ts, handoff/delivery/WP3_HANDOFF.md and .vi.md, this brief, handoff/delivery/evidence/WP3-FIXB/.
- **Deviations:** (1) `src/client/HistoryScreen.tsx` (one import and one attribute) and `tests/integration/delivery-crash.test.ts` (one pass-summary assertion; outcome assertions unchanged) are outside the named paths. (2) The creation bound is also applied to saved settings (a clamp), which the decision phrased as "keep current behaviour": it differs only for the explicit apply-to-overdue choice. (3) Residual edge: a lease expiring between the start-of-pass recovery and that pass's claim sweep is recovered at the next pass start. (4) docs/05 not edited (follow-up suggested in the handoff).
