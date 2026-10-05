# Independent review

Translation: [WP3_RECHECK_BC3.vi.md](WP3_RECHECK_BC3.vi.md). Task brief and results: [WP3-RECHECK-BC3](tasks/WP3-RECHECK-BC3.md). Earlier B/C rechecks (kept unchanged): [WP3_RECHECK_BC](WP3_RECHECK_BC.md), [WP3_RECHECK_BC2](WP3_RECHECK_BC2.md). The same audit rebinds area A: [WP3_RECHECK_A3](WP3_RECHECK_A3.md). Evidence: `evidence/WP3-RECHECK-BC3/` (masked, LF; addresses `<email>`, account `<user>`, host `<host>`; probes and scripts stored as `*.txt`); start at [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt).

- Package/date/reviewer and observable model/effort: WP3, fresh recheck of finding WP3-RBC2-01 after the test-only fix round 3 (WP3-FIX3), with a regression smoke of areas B and C; 2026-10-05 (UTC); task WP3-RECHECK-BC3 attempt 1 (board kind `audit`, profile timesheet-auditor, agent `a4e5c209ddf7091f5` on the board). Self-reported model `claude-opus-5-5`; effort requested xhigh, not observable. The strongest author model of the reviewed snapshot is opus (`claude-opus-5-5`, earlier WP3 tasks); the round-3 author WP3-FIX3 (`ab4bd2cde876c7ecb`), its committer WP3-FIX3-FREEZE (`aca480339f4624b19`) and the gate WP3-REGATE3 (`a41152818099fb8d5`) ran on sonnet (`claude-sonnet-5-5`). The reviewer is not weaker. It is none of the earlier WP3 auditors (`adc746b3b778914db`, `aca7e1ccf879138f1`, `a891cec229b6d5755`, `a4f9e4253ee83db68`, `a3acc7ac65de1693a`, `a6f4a505bd38d735e`, `a6dd03dfdd2f440e9`).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  - Reviewed commit `49651c8bb91d56bf6c6966405257537ec7ca474b` (the WP3-REGATE3 `freeze_commit`; `origin/main` points to the same commit, so nothing is unpushed).
  - Source digest `c31c300c06ae4c750bf0080f304d3f87eae0a00280110d1a8eb6eb37ecf4ec72` (721 files, handoff/ excluded), equal to the regate digest. Recorded as the first two commands after `node --version` in the project folder (`git rev-parse HEAD`; the `git ls-tree` form on the freeze), then in the clone by `scripts/source-digest.mjs` and by `git ls-tree`; the same values at the end ([00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt), last lines). The project working tree digest differs only because of 3 untracked files under `.claude/skills/readme-md/` that are not in the freeze; they were not touched.
  - Source complete: every command ran in git clones under `D:\.claude-tmp\timesheet\WP3-RECHECK-BC3` (outside Dropbox): `repo` at the freeze, and `mut`, a second clone of the freeze used only for mutations (each restored with `git checkout`, status empty afterwards).
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **PASS.**
  - WP3-RBC2-01 is fixed. Mutations M4, M5 and M5b each fail the whole suite at the freeze; with the 2d72d35 test file they still pass, so the round-3 tests are what restored the coverage.
  - Guard sweep: removing the `inactive_user`, `before_activation` or `not_due` skip now fails a new test each; removing `finalized` still fails two recovery tests.
  - The round-3 tests are meaningful, deterministic (5 repeated runs) and weaken no earlier assertion.
  - No regression in area B or C: verify, e2e, probes H1 and H2 pass.
  - No finding. Four risks are recorded separately; R1 is a pre-existing test gap of the same kind as the sweep gaps (the in-loop activation recheck), with a proven test device.
- Scope actually inspected/executed:
  1. Read: AGENTS.md (from disk), the brief, WP3_RECHECK_BC2 with its evidence (mutation scripts, probe H2), the WP3-FIX3 brief and results, the WP3-REGATE3 results, WP3_RECHECK_A and WP3_RECHECK_A2, the WP3_REVIEW prompt, the WP3_HANDOFF fix-round-3 section, the board records of both tasks.
  2. The diff `2d72d35..49651c8` outside handoff/: one path, `tests/integration/deadline.test.ts` (+65 −12). No change under `src/`, `docs/`, `scripts/` or configuration.
  3. `src/server/services/automation.ts` read in full, with the guards at `:189` (`inactive_user`), `:191` (`not_active`), `:192` (`before_activation`), `:194` (`before_account`), `:195` (`not_due`), `:203` (`finalized`), `:204` (`imported`), `:208` (`overdue_recorded`), the candidate clamp `:257` and the scan-level return `:343-344`.
  4. Mutations M4, M5, M5b and the sweep over the whole suite (`vitest run tests/integration tests/client tests/domain`) in `mut`; the same three mutations against the old and the new test file; supplementary splits (M4a, M4b, M6a, M6b, `before_account`, `overdue_recorded`).
  5. Regression smoke for B and C: verify, e2e on the installed Edge, probes H1 (setup bound) and H2 (guards), plus my probe H3 (activation cleared during a running scan).

## Evidence table

| Command | Result/exit | Evidence |
|---|---|---|
| `node --version` (portable, full path); `git rev-parse HEAD`; ls-tree digest (project, then clone); `scripts/source-digest.mjs` (clone) | v24.21.0; 49651c8; c31c300c…ec72 (721 files) in every form | [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt) |
| `git diff --stat/--name-status 2d72d35 49651c8` outside handoff/, and over src, docs, scripts and configuration | one path, M `tests/integration/deadline.test.ts` (+65 −12); the second diff is empty | [17-delta.txt](evidence/WP3-RECHECK-BC3/17-delta.txt), [17b-test-diff.txt](evidence/WP3-RECHECK-BC3/17b-test-diff.txt) |
| `npm ci` (repo; mut) | exit 0; exit 0 | [01-npm-ci.txt](evidence/WP3-RECHECK-BC3/01-npm-ci.txt) |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 62 files / 1420 tests; SMOKE PASSED, 40 `PASS` lines; 0 deprecation lines | [02-verify.txt](evidence/WP3-RECHECK-BC3/02-verify.txt) |
| Clean suite, then M4, M5, M5b (mut, whole suite) | clean exit 0 (1420 passed); M4 exit 1 (1 failed); M5 exit 1 (1 failed); M5b exit 1 (2 failed) | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt) |
| Guard sweep (one skip line deleted per run, whole suite) | `inactive_user`, `before_activation`, `not_due`: exit 1, 1 failed each (the new sweep tests); `finalized`: exit 1, 2 failed; `overdue_recorded`: exit 1, 3 failed; `before_account`: exit 0 | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt) |
| M4, M5, M5b against `deadline.test.ts` of 2d72d35 and of the freeze | old file: exit 0, 40 passed each; freeze file: exit 1, 1 / 1 / 2 failed | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt) |
| Supplementary: M4a (scan-level return only), M4b (in-loop `not_active` only), M6a (candidate clamp only), M6b (both creation guards) | M4a exit 0; M4b exit 0; M6a exit 0; M6b exit 1 (3 failed) | [04-mutations.txt](evidence/WP3-RECHECK-BC3/04-mutations.txt), [04b-mutations2.txt](evidence/WP3-RECHECK-BC3/04b-mutations2.txt) |
| Probe H3 (activation cleared by a TEMP trigger after the first automatic revision of a running scan): repo; mut; mut + M4b | exit 0, 4 PASS; exit 0, 4 PASS; exit 1, 1 FAIL (the later period is finalized after the clear) | [18b-h3-midscan.txt](evidence/WP3-RECHECK-BC3/18b-h3-midscan.txt), [04b-mutations2.txt](evidence/WP3-RECHECK-BC3/04b-mutations2.txt) |
| `vitest run tests/integration/deadline.test.ts --reporter=verbose` × 5 | exit 0 each; 44 passed each; the six round-3 tests pass every time | [05b-deadline-repeat.txt](evidence/WP3-RECHECK-BC3/05b-deadline-repeat.txt) |
| `npm run test:e2e` (build, then Playwright on the installed Edge, desktop and mobile) | exit 0; 127 passed, 5 skipped, 0 failed (5.9 min); 0 deprecation lines | [05-e2e.txt](evidence/WP3-RECHECK-BC3/05-e2e.txt) |
| Probe H1, setup bound (H-Q1 (a)), creation bound, switch-off, device zones, admin status | exit 0, 50 PASS | [06-h1-setup-bound.txt](evidence/WP3-RECHECK-BC3/06-h1-setup-bound.txt) |
| Probe H2, the F-4 and imported guards with auto-on accounts, through the runner | exit 0, 10 PASS | [18-h2-guards.txt](evidence/WP3-RECHECK-BC3/18-h2-guards.txt) |
| `validate_package.py --preflight` (workflow Python, project folder) | see file | [20-preflight.txt](evidence/WP3-RECHECK-BC3/20-preflight.txt) |
| Privacy check on a temporary index; identity at the end | see files | [21-privacy.txt](evidence/WP3-RECHECK-BC3/21-privacy.txt), [00-commands.txt](evidence/WP3-RECHECK-BC3/00-commands.txt) |

## Finding disposition: WP3-RBC2-01

**Fixed.** Each mutation that passed the whole suite at 2d72d35 now fails it, and it fails the test written for the guard.

| Mutation | At the freeze (whole suite) | Failing test | With the 2d72d35 test file |
|---|---|---|---|
| M4: the scan and `assessPeriod` treat a NULL activation as 1970 (`:191`, `:343-344`) | exit 1, 1 failed | `deadline.test.ts:271` "finalizes nothing while the activation instant is null, even for an account whose auto-submit is on" | exit 0, 40 passed |
| M5: the `imported` skip moved after the switch-on decision (`:204`) | exit 1, 1 failed | `:796` "never auto-submits an imported_unverified timesheet of an account whose auto-submit is on, and records no overdue state" | exit 0, 40 passed |
| M5b: the `imported` skip deleted | exit 1, 2 failed | `:796` and `:809` "does not mark an imported_unverified timesheet overdue when auto-submit was saved off before the deadline" | exit 0, 40 passed |

- Test 271 now creates its account with `configuredUser()`, which saves auto-submit on, and asserts that a settings row exists. So with H-Q1 only the activation guard can hold the account back. Under M4 the scan finalizes both due periods.
- Test 796 uses an auto-on account; under M5 or M5b the imported period is finalized.
- Test 809 is the "off" half. Auto-submit is saved on at creation, then off at 2026-09-21T12:00Z, before the 2026-09-30T00:00Z deadline. It asserts no revision, no job and no overdue record. It catches M5b (an overdue record appears) and rightly not M5, which only reorders the switch-on case.
- Production behaviour is unchanged and correct: probe H2 passes 10 of 10 through the production runner. This includes a scan job queued while automation was active that runs after the activation was cleared.

## Guard sweep

| Skip in `assessPeriod` | At 2d72d35 (WP3_RECHECK_BC2) | At the freeze | Covering test |
|---|---|---|---|
| `inactive_user` (`:189`) | uncovered | **covered** (1 failed) | `:855`, TEMP trigger deactivates the account after the first revision |
| `before_activation` (`:192`) | uncovered | **covered** (1 failed) | `:865`, TEMP trigger moves the activation instant forward |
| `not_due` (`:195`) | uncovered | **covered** (1 failed) | `:875`, a clock that reads 2026-10-01 once a revision exists |
| `finalized` (`:203`) | covered | covered (2 failed) | the two "recovery after downtime" tests |
| `imported` (`:204`) | uncovered | **covered** (M5b: 2 failed) | `:796`, `:809` |
| `overdue_recorded` (`:208`), extra | — | covered (3 failed) | switch-off and setup-bound tests |
| `before_account` (`:194`), extra | — | line alone uncovered (exit 0) | as a pair with the candidate clamp `:257`: M6b fails 3 tests (B-01, H-Q1 clamp); see R2 |
| `not_active` (`:191`) alone, extra | — | line alone uncovered (M4b exit 0) | as a pair with `:343-344`: M4 fails the F-4 test; see R1 |

All four skips named in the brief (`inactive_user`, `before_activation`, `not_due`, `finalized`) are now covered.

## Test quality

- **Meaningful, not mirrors.** Every round-3 test asserts persisted outcomes: revisions with their payroll dates, timesheet rows, finalized rows, jobs, overdue records and the scan summary. None asserts a skip reason or an internal call. Each one is killed by the mutation of its own guard, and each of those mutations fails no other round-3 test (04-mutations). The sweep tests use test-only devices to change state after the candidate list is built: connection-local TEMP triggers and a clock that goes back. These are the only ways to reach these guards, because `listCandidates` already filters the same cases (`:235`, `:257-260`). A deactivation or an activation change during a scan is a real event, and so is a wall-clock step back. The TEMP triggers die with the per-test connection, so nothing leaks to other tests.
- **Deterministic.** Five repeated runs of the file: 44 passed each time. The whole suite and e2e pass too.
- **No earlier assertion weakened.** The diff removes no `expect` line: 235 calls become 250 and 40 tests become 44 in the file, and 1416 tests become 1420 in the suite. The F-4 test keeps all its assertions and adds one. The old imported test is split. Its first half now also asserts the scan summary and that no timesheet is finalized. Its "off" half moved the switch before the deadline: the old half saved the switch after the deadline, so it proved nothing. It now also asserts no revision and no job. The never-configured imported case that the old test exercised by accident is covered by the H-Q1 `not_configured` tests.
- Minor observations, not defects: the `before_activation` test moves the activation to 2026-10-14T00:00:01Z, an instant before the scan clock that the production route would refuse as past (`activation_in_past`). A future instant would kill the mutant the same way (R4).

## Regressions (areas B and C)

None.
- Verify: 1420 tests, smoke 40 `PASS`.
- e2e: 127 passed, 5 skipped. The same numbers as WP3-REGATE3 and WP3_RECHECK_BC2.
- H1: 50 PASS, as in WP3_RECHECK_BC2.
  - Never-configured accounts get nothing over eight deadlines.
  - Mid-period save, the explicit overdue choice with the creation clamp, switch-off and manual sign-off behave as decided.
  - Four device zones give identical results.
  - No automatic fault in the admin status.
- H2: 10 PASS.
- The source of areas B and C is byte-identical to 2d72d35 (diff above), so the area-C probes of WP3_RECHECK_BC2 (authorization, revocation race, hint) were not rerun here. The area-A hint and HTTP probes of [WP3_RECHECK_A3](WP3_RECHECK_A3.md) cover the shared-route and hint boundaries again on this freeze (84 and 12 PASS).

## Findings

None. No observed defect in the round-3 change, in areas B and C, or in production behaviour.

## Risks and optional improvements (not proven defects)

- **R1 (Low, pre-existing test gap).** The in-loop activation recheck `automation.ts:191` alone is covered by no test.
  - M4b (only that line removed, with a 1970 fallback) passes the whole suite.
  - The F-4 test returns at `:343-344` before reaching `:191`, and so did the 2f2520e version. So this is not a round-2 or round-3 weakening, and no guard named in the brief is uncovered.
  - The guard is reachable in production: an administrator clears the activation while a scan is running. Probe H3 shows that the code behaves correctly (4 PASS) and that the probe catches M4b, which finalizes the 2026-10-16 period after the clear.
  - Optional: a fourth sweep test with a TEMP trigger that sets `automation_active_from = NULL` after the first revision (the H3 device), expecting `finalized: 1`.
- **R2 (Info).** The `before_account` line `:194` and the candidate clamp `:257` are mutually redundant. Each alone passes the suite (sweep; M6a); both together fail 3 tests (M6b). `users.created_at` is never updated in `src/server`, so `:194` cannot be reached for a listed candidate. No action.
- **R3 (Info).** M4a removes only the scan-level return and keeps `activated: false`. It passes the suite, because the in-loop `not_active` skip then holds every candidate: nothing is written, but the candidate list is read. The ScanSummary comment "nothing was read or written" is not tested for "read". No action.
- **R4 (Info).** The `before_activation` test uses an activation instant that the production route would refuse as past. Optional: use a future instant (for example 2026-10-20T00:00:00Z), which kills the same mutant.
- Carried risks R1–R6 of WP3_RECHECK_BC2 are unchanged: no source or document changed in round 3.

## Required gates unrun/blocked and why

- Real SMTP, NAS deployment and production activation are forbidden before the owner's pilot authorization.
- No mandatory recheck line was left unrun. The UI screenshot probe (U2) was not rerun because no client file changed; e2e covers the screens on Edge.

## Disposition of previous findings

- WP3-RBC2-01: fixed (above).
- The WP3-FIX3 claims reproduce:
  - verify gives 1420 tests;
  - M4, M5 and M5b fail 1, 1 and 2 tests;
  - each of the three new skip tests fails under its deletion;
  - `finalized` fails 2.
- Two differences, both stricter: I ran the whole suite instead of one file, and I also ran the old test file to show that the old tests do not catch the mutations.
- The WP3-REGATE3 PASS (verify 1420, e2e 127/5) reproduces.
- The WP3_HANDOFF fix-round-3 lines match what I observed.

## Software readiness, owner permission and pilot result

- Software readiness of WP3 areas B and C at `49651c8` / `c31c300c…ec72`: PASS from this recheck.
- Owner permission for real sending, activation or deployment: none requested or given. Capture mode only; `PRODUCTION_SENDING_ENABLED` never set. Pilot result: none.

## One next action

The coordinator records WP3-RECHECK-BC3 PASS and WP3-RECHECK-A attempt 3 PASS ([WP3_RECHECK_A3](WP3_RECHECK_A3.md)) at digest `c31c300c…ec72`, then runs the WP3 accept step. R1 can go to the HANDOFF carry list as an optional test.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Process notes

- One accidental interactive shell. `cmd.exe /c where npm` from Git Bash had its `/c` turned into a path, so `cmd.exe` started interactively. The call timed out and became background task `b16y9jy1f`, waiting on stdin. It was not killed (the brief forbids PID kills); the coordinator can stop that task. It ran no command and wrote nothing.
- HTTP probe (area A): run 1 stopped on a transport error (`fetch failed`, ECONNRESET) in the probe client while the mutation suite loaded the machine. Run 2 did not start because of a syntax error in my added log line. Run 3 is the run of record (84 PASS). All runs are kept in the evidence.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP3-RECHECK-BC3 attempt 1, agent `a4e5c209ddf7091f5`. Reviewed fix author: WP3-FIX3 `ab4bd2cde876c7ecb` (sonnet); committer WP3-FIX3-FREEZE `aca480339f4624b19`; gate WP3-REGATE3 `a41152818099fb8d5`; plus the earlier WP3 authors on the board.
- Fresh context; confirm reviewer did not author changes: fresh context. This reviewer authored nothing in WP3, including all fix rounds, and edited no source. It wrote only this report pair, the WP3_RECHECK_A3 pair, the Results of both briefs and `evidence/WP3-RECHECK-BC3/`. Scratch-only edits were the mutations in `mut`, each restored.
- Source digest before/after; gate evidence for that snapshot: `c31c300c…ec72` before and after; the WP3-REGATE3 evidence is for the same commit and digest.
- New report path preserving previous review history: `handoff/delivery/WP3_RECHECK_BC3.md` and `.vi.md` are new. WP3_RECHECK_BC, WP3_RECHECK_BC2 and WP3_REVIEW_B/C are untouched.
- Finding dispositions and next coordinator fix/recheck task: WP3-RBC2-01 fixed; no fix task; next is the WP3 accept step.
