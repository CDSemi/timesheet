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
  the WP2-GATE3 `freeze_commit`, given at dispatch, and the gate digest.
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
