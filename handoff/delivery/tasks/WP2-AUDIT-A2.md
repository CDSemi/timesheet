# WP2-AUDIT-A2 dispatch brief

- Mission/task: timesheet-software-readiness / WP2-AUDIT-A2; package WP2; kind audit;
  attempt 1; depends on WP2-GATE2. A fresh recheck of area A (ledger and privacy) after
  the fix round.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size M,
  risk H, novelty no. Fresh context; you authored nothing in WP2. The author agent IDs
  are on the board, and they include the WP2-FIXA and WP2-FIXB workers. The task record
  is in English. WP2_RECHECK_A.md and its .vi.md are bilingual (REVIEW form).
- Target: `reviewed_commit` = f79413b77e7f745e1eff383f1ad748e7667533da, the WP2-GATE2
  `freeze_commit`. The gate digest is
  4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528. Record HEAD and the
  source digest before and after; the digest must equal the gate digest.
- WP2-AUDIT-B2 runs at the same time in its own clone. For the preflight, use the
  workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- Execute only in your own scratch clone outside Dropbox, on a drive with free space.
  Delete it afterwards. Call Node 24 by its full path. Do not edit source. Report masked
  values only.
- Read AGENTS.md from disk first. Then read:
  - [WP2_REVIEW_A](../WP2_REVIEW_A.md) (attempt 1, FIX REQUIRED: WP2-A-01), with its R1–R4
    and its probes in handoff/delivery/evidence/WP2-AUDIT-A/;
  - the WP2-FIXA and WP2-FIXB results;
  - the board coordinator decision dated 2026-10-04.

## Attempt 3 (delta re-audit after the third fix round)

- The attempt-2 PASS at a3d1b65 / 5b370621 is invalidated by a later source change
  (docs/08).
- WP2-FIXB3 changed only src/client/styles.css (CSS tokens) and tests/client/zoneOracle.ts
  plus its unit test, outside handoff/.
- Attempt 3 is a fresh auditor, not an earlier A2 auditor. Target: `reviewed_commit` =
  5fafeaee72509c6110a907458643bf7582dad81a (the WP2-GATE4 `freeze_commit`). The gate
  digest is e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df.
- Scope:
  - confirm that the diff since a3d1b65 is limited to those files and touches no
    server, ledger, privacy or admin code;
  - run `npm run verify` and the targeted ledger, privacy and admin tests;
  - re-run the holiday-preview and payroll differential probes and a short race of at
    least 50 rounds, as a regression smoke;
  - confirm that WP2-A-01 and WP2-A2-02 stay resolved and that R1–R4 and A3-01 stay
    non-blocking.
- Write handoff/delivery/WP2_RECHECK_A4.md and its .vi.md. Keep the earlier reports.
  Append an "Attempt 3" result below, and put the evidence in
  handoff/delivery/evidence/WP2-AUDIT-A2-a3/.
- Execute in your own clone on C:. Never write into the repository root, and on Windows
  never redirect to /dev/null or nul from a POSIX shell. WP2-AUDIT-B4 runs at the same
  time.

## Attempt 2 (re-audit at the new commit)

- The attempt-1 PASS at f79413b / 4c2bd7ef (Results below) is invalidated by a later
  source change (docs/08: "Changed source identity invalidates an old audit pass").
- WP2-FIXB2 changed the following:
  - the season-independent R-07 e2e, with tests/client/zoneOracle.ts;
  - CSS tokens;
  - WP2-A2-02: the payroll-exception 201 now returns `{payroll_exception}` only, with a
    differential test;
  - WP2-A2-01: comments.
- Attempt 2 is a fresh auditor, not the attempt-1 auditor. Target: `reviewed_commit` =
  a3d1b6555c352afa68b3d61ddc67f0c596742698 (the WP2-GATE3 `freeze_commit`). The gate
  digest is 5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581.
- Scope for attempt 2:
  - re-verify area A at the new commit: diff the fix range against f79413b, re-run the
    reduced ledger/privacy probe set and a race of at least 100 rounds, the targeted
    tests and `npm run verify`;
  - confirm that WP2-A-01 stays resolved;
  - confirm that WP2-A2-02 is resolved: the admin payroll-exception responses are
    identical with and without employee timesheets, and the 409 for finalized periods is
    kept;
  - confirm that R1–R4 stay non-blocking.
- Write handoff/delivery/WP2_RECHECK_A3.md and its .vi.md. Keep WP2_RECHECK_A.md
  unchanged as attempt-1 history. Append an "Attempt 2" result below, and put the
  evidence in handoff/delivery/evidence/WP2-AUDIT-A2-a2/.
- Execute in your own clone on C:. Never write into the repository root, and on Windows
  never redirect to /dev/null or nul from a POSIX shell. WP2-AUDIT-B3 runs at the same
  time.

## Scope

1. **WP2-A-01.**
   - The admin holiday-import preview, and every admin response and screen, reveals no
     employee-derived data: no per-date counts and no signal of which days an employee
     recorded.
   - Re-run the attempt-1 privacy probe against the new commit.
   - Check the regression test.
   - Check `finalized_conflicts` handling.
   - Commit behaviour is unchanged.
2. **No regression in area A** from the fix round (WP2-FIXA server and client; WP2-FIXB
   client).
   - Diff the fix range against 8fae685. Re-run the ledger/privacy probe set and the
     multi-process race in a reduced form; at least 100 rounds are enough.
   - Run the targeted ledger and privacy tests, and `npm run verify`.
3. Confirm that R1–R4 remain non-blocking.

## Output

- handoff/delivery/WP2_RECHECK_A.md and .vi.md.
- Results in this file.
- Evidence in handoff/delivery/evidence/WP2-AUDIT-A2/ (masked, LF).
- Verdict: PASS, FIX REQUIRED or NOT VERIFIED. Give each finding an ID (WP2-A2-nn), a
  severity, file:line and the required change.

Return at most 220 words, beginning with your self-reported model.

## Results

(Auditor appends here.)

### Auditor result (attempt 1)

Self-reported model: claude-opus-5-5 (not weaker than the strongest WP2 author model, opus). Report:
[WP2_RECHECK_A](../WP2_RECHECK_A.md) and its .vi.md. Evidence: handoff/delivery/evidence/WP2-AUDIT-A2/ (index
00-commands.txt; masked, LF).

- Target: HEAD f79413b77e7f745e1eff383f1ad748e7667533da = origin/main before and after. Source digest
  4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528 (611 files) before and after, in the project folder
  and in the scratch clone; it equals the gate digest. All checks ran in a scratch clone on C: outside Dropbox, with
  Node v24.21.0 by full path. The clone, worktree, base export and work databases were deleted afterwards.
- Verdict: **PASS**. No blocking finding.
- WP2-A-01: resolved.
  - The attempt-1 probe now infers nothing; the same probe on 8fae685 still reproduces the leak.
  - New differential probe: 27/27 admin responses are byte-identical before and after two employees record sessions,
    explicit labels, leave, a Clock in, a credit and a reservation. The responses cover all reads, seven previews and
    three refused commits.
  - Screen: the preview text is identical before and after employee data (Edge, desktop and mobile; screenshots).
  - Regression test: red on the 8fae685 source (3 failed), green on f79413b (29/29).
  - `finalized_conflicts`: `{date}` only and period-level. One versus two finalized timesheets give an identical view.
    The commit gets 409 with date-only details.
  - Commit behaviour: unchanged. Hash, one version and one audit event, no employee row written, explicit labels kept,
    identical re-commit 200, stale 409. The results are identical on 8fae685.
- No area-A regression:
  - The fix range changes only holidayImport.ts on the server.
  - `npm run verify` exit 0: 31 files / 606 tests, smoke passed, no deprecation output.
  - 13 targeted files / 266 tests. Concurrency file 8/8, three more times.
  - Ledger/privacy probe 119/0 and supplement probe 6/0.
  - Multi-process race: 220 rounds, 0 violations; the control double-booked 10/10.
  - Admin, isolation and OT-leave e2e: 24 passed. Preflight PASS.
- R1–R4 and ADV-A-05: remain non-blocking (code unchanged; S6 and S7 unchanged).
- New non-blocking observations:
  - WP2-A2-01 (Info): stale "aggregate counts" wording at src/server/routes/admin.ts:48-50 and
    tests/integration/isolation.test.ts:280, and stale wording in WP2_HANDOFF.md:41.
  - WP2-A2-02 (Low, pre-existing, outside the fix range): the payroll-exception response field
    `refreshed_pay_period` (admin.ts:169) reveals per pay period whether anyone on the calendar has edited a
    timesheet. Optional WP3 hardening, for the coordinator to decide.
- Probe bugs: four, each fixed in the probe or spec only and rerun. Every run is kept, except pg2 run 1, which was
  shown in the session only.
- Writes: only WP2_RECHECK_A.md/.vi.md, this Results section and the evidence folder. No source edit, no commit, and
  no ORCHESTRATION.json, STATE.json or NEXT_ACTION edit.

### Auditor result (attempt 2)

Self-reported model: claude-opus-5-5 (not weaker than the strongest author model of the reviewed snapshot, opus;
WP2-FIXB2 ran on sonnet). Fresh context; not the attempt-1 auditor. Report: [WP2_RECHECK_A3](../WP2_RECHECK_A3.md)
and its .vi.md. Evidence: handoff/delivery/evidence/WP2-AUDIT-A2-a2/ (index 00-commands.txt; masked, LF).

- Target: HEAD a3d1b6555c352afa68b3d61ddc67f0c596742698 = origin/main before and after. Source digest
  5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581 (613 files) before and after, in the project folder
  and in the scratch clone; it equals the gate digest. All checks ran in a scratch clone on C: outside Dropbox, with
  Node v24.21.0 by full path.
- Verdict: **PASS**. No blocking finding.
- WP2-A2-02: resolved.
  - The 201 is `{payroll_exception}` only.
  - New differential probe: 10 payroll-exception requests and 20 admin reads afterwards. All 30 are byte-identical
    with and without employee timesheets, even though the stored rows really are refreshed in the second world.
  - The f79413b control detects the old field (17/3).
  - Regression test: red on f79413b (4 failed), green on a3d1b65 (13/13).
  - The finalized 409 `period_finalized` is kept. It writes nothing, carries period dates only, and is identical for
    one or two finalized timesheets.
- WP2-A-01: stays resolved.
  - holidayImport.ts is unchanged.
  - The attempt-1 probe infers nothing, and the 8fae685 control still leaks.
  - A2 differential: 27/27 identical.
  - Regression test: 29/29.
- No area-A regression:
  - `npm run verify` exit 0: 32 files / 611 tests, no deprecation output.
  - 13 targeted files / 267 tests; concurrency 8/8 three times.
  - Ledger probe 119/0 and supplement 6/0.
  - Race: 220 + 550 production rounds, 0 violations; the controls double-booked.
  - Admin, isolation and OT-leave e2e: 24 passed. Preflight PASS, also after the writes. A later re-run failed only on
    WP2_RECHECK_B3.md, the concurrent B3 auditor's report, whose .vi.md was missing at that moment; not this task's file. The final re-run passed (56 pairs).
- WP2-A2-01: comments fixed in code; WP2_HANDOFF.md:41 is left for the acceptance step.
- R1–R4 and ADV-A-05: remain non-blocking.
- New observation WP2-A3-01 (Info, forward-looking): the payroll_exception.create audit payload
  (src/server/services/calendars.ts:335-344) keeps refreshed_pay_period and the stored row. It is ownerless and
  unreadable today; any future admin audit view must redact it.
- Writes: only WP2_RECHECK_A3.md/.vi.md, this Results section and the evidence folder. No source edit, no commit, and
  no ORCHESTRATION.json, STATE.json or NEXT_ACTION edit. WP2_RECHECK_A.md is unchanged.

### Auditor result (attempt 3)

Self-reported model: claude-opus-5-5 (not weaker than the strongest author model of the reviewed snapshot, opus;
WP2-FIXB3 ran on sonnet). Fresh context; not an earlier A2 auditor. Report: [WP2_RECHECK_A4](../WP2_RECHECK_A4.md)
and its .vi.md. Evidence: handoff/delivery/evidence/WP2-AUDIT-A2-a3/ (index 00-commands.txt; masked, LF).

- Target: HEAD 5fafeaee72509c6110a907458643bf7582dad81a = origin/main before and after. Source digest
  e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df (613 files) before and after, in the project folder
  and in the scratch clone; it equals the gate digest. All checks ran in a scratch clone on C: outside Dropbox, with
  Node v24.21.0 by full path.
- Verdict: **PASS**. No blocking finding and no area-A defect.
- Delta scope: a3d1b65..5fafeae is one commit. Outside handoff/ it changes only src/client/styles.css (token
  substitutions with the same values), tests/client/zoneOracle.ts and tests/client/zoneOracle.test.ts. No server, ledger,
  privacy or admin code changed; zoneOracle is imported only by tests and imports nothing.
- Checks:
  - `npm run verify`: run 1 exit 13, because the smoke's default port 3100 was held by another process (reproduced in
    03b). Run 2 with SMOKE_PORT=3197: exit 0, 32 files / 613 tests, SMOKE PASSED, no deprecation output.
  - 13 targeted files / 267 tests; concurrency 8/8 three more times.
  - Admin, isolation and OT-leave e2e: 24 passed.
- Regression smoke, all with unchanged probes:
  - Holiday preview: nothing inferable.
  - A2 differential: 27/27 identical.
  - Payroll differential: 20/0, 30/30 identical.
  - Ledger/privacy 119/0 and supplement 6/0.
  - Race: 220 production rounds, 0 violations; the control double-booked 10/10.
  - Preflight PASS.
- WP2-A-01 and WP2-A2-02: stay resolved. R1–R4, WP2-A3-01 and ADV-A-05: remain non-blocking (code unchanged).
- New observation WP2-A4-01 (Info, optional tooling): scripts/smoke-built-server.mjs:11,102-112. When the smoke port is
  taken, the script accepts the foreign health answer and then ends with exit 13 and no FAIL line. It could pick a free
  port or fail fast on the child's exit. Required change: none for WP2.
- Writes: only WP2_RECHECK_A4.md/.vi.md, this Results section and the evidence folder. No source edit, no commit, and
  no ORCHESTRATION.json, STATE.json or NEXT_ACTION edit. Earlier reports are unchanged.
