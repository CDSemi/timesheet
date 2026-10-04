# Independent review

Translation: [WP2_RECHECK_A3.vi.md](WP2_RECHECK_A3.vi.md). Previous reviews (kept unchanged): [WP2_REVIEW_A](WP2_REVIEW_A.md) and [WP2_RECHECK_A](WP2_RECHECK_A.md). Evidence: `handoff/delivery/evidence/WP2-AUDIT-A2-a2/` (index `00-commands.txt`; masked, LF).

- **Package/date/reviewer and observable model/effort:** WP2, fresh re-audit of area A (ledger and privacy) at the new package-final commit, task WP2-AUDIT-A2 attempt 2, 2026-10-04 (UTC). Profile `timesheet-auditor`. The board records agent ID `a4b3acc53273ed5e2` for this attempt; the ID is not observable inside the session. Self-reported model `claude-opus-5-5`. Effort requested xhigh; actual effort not observable. The strongest author model of the reviewed snapshot is opus (WP2-T02, WP2-T03). WP2-FIXA, WP2-FIXB and WP2-FIXB2 ran on sonnet. The reviewer model is therefore not weaker.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Commit `a3d1b6555c352afa68b3d61ddc67f0c596742698`. This is the WP2-GATE3 `freeze_commit` and equals `origin/main`, so there are no unpushed commits.
  - Source digest `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` (613 files, `handoff/` excluded). It equals the gate digest.
  - The digest was measured before and after, in the project folder and in the scratch clone, with `git ls-tree` and with `scripts/source-digest.mjs`. The project working tree had changes under `handoff/` only.
  - Source complete: every check ran in a scratch clone of that commit on the C: drive, outside Dropbox (`01-digest-before.txt`, `12-digest-after.txt`).
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - WP2-A2-02 is resolved. The payroll-exception answer and every admin read after it are byte-identical with and without employee timesheets: 30 of 30 responses matched. The stored rows are still refreshed, and the 409 for finalized periods is kept. The same probe on f79413b detects the old field, so the probe is sensitive.
  - WP2-A-01 stays resolved. The fix round touched no area-A path except the payroll-exception answer.
  - R1–R4 remain non-blocking.
  - One new non-blocking observation: WP2-A3-01 (Info, forward-looking).
- **Scope actually inspected/executed:**
  1. Fix range `f79413b..a3d1b65`, one commit (`11-static-scans.txt`):
     - Server: only `routes/admin.ts` (the payroll-exception answer and a comment) and `services/calendars.ts` (`createPayrollException` returns `{exception}` only, plus a comment).
     - Client: only `styles.css`, which got four tokens with identical values. The diff has no construct relevant to area A.
     - Tests: `payroll-exceptions.test.ts` (new differential test), `isolation.test.ts` (comment only), `day-editor.spec.ts`, and the new test-only `tests/client/zoneOracle.ts` with its unit test.
     - 22 area-A paths are unchanged: ledger, OT leave, evidence, history, users, holiday import, timesheets, periods, audit, migrations, `http/`, the `api`/`ot`/`history`/`auth` routes, `api.ts` and client components.
  2. Admin surface at a3d1b65: `routes/admin.ts` (all eight routes); `createPayrollException` and its helpers in `periods.ts`; the owner scope of `history.ts`; how `PayrollExceptions.tsx` and `api.ts` use the answer (they never read the removed field).
  3. Sources:
     - Canonical: docs/01 "Initial boundary", docs/03 "Records", docs/06 (privacy leaks block progression), docs/10 E-10.
     - Records: WP2_REVIEW_A and WP2_RECHECK_A with their probes; the WP2-FIXB2 result and evidence; the WP2-GATE3 record; the board entries (read-only).
  4. Independent checks:
     - `npm ci` and `npm run verify` with deprecation tracing.
     - 13 targeted test files, with the concurrency file three more times.
     - The new payroll test run against the f79413b source (red-check).
     - The admin, isolation and OT-leave browser specs on both projects.
     - Attempt-1 probes, unchanged: holiday preview, with an 8fae685 control; ledger/privacy; supplement; the A2 admin differential; the multi-process race, 220 + 550 rounds.
     - A new payroll-exception differential probe, with an f79413b control.
     - The package preflight with the workflow Python.
- **Evidence table: command | result/exit | evidence:**

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `git ls-tree` digest; `scripts/source-digest.mjs` (project folder) | a3d1b65 = origin/main; 5b370621…8581 (613 files); exit 0 | `01-digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, Node v24.21.0 by full path) | 144 packages; exit 0 | `02-npm-ci.txt` |
| `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify` | typecheck, lint, 32 files / 611 tests, build, SMOKE PASSED; no deprecation output (the only match is the echoed command); exit 0 | `03-verify.txt` |
| vitest on 13 area-A files; concurrency ×3; payroll-exceptions and holiday-import verbose | 13 files / 267 tests; 8/8 three times; payroll-exceptions 13/13; holiday-import 29/29; exit 0 | `04-targeted-tests.txt` |
| a3d1b65 `payroll-exceptions.test.ts` against the f79413b source (scratch worktree) | red as expected: 4 failed, 9 passed, all failures on the extra `refreshed_pay_period` key; exit 1 | `04b-red-payroll-on-f79413b.txt` |
| `playwright test` admin, isolation, ot-leave (Edge, built dist) | 24 passed on both projects, including the payroll-exception screen test; exit 0 | `05-e2e-admin-isolation-ot-leave.txt` |
| `node pr-race.mjs <clone> <work> 10`, then `… 25` (attempt-1 probe, 4 OS processes, one WAL file) | 220 and 550 production rounds, 0 violations; the unsafe control double-booked 10/10 and 25/25; integrity ok; exit 0 | `06-…`, `06b-…` |
| `node pa-ledger-privacy.mjs` (attempt-1 probe) | 119 pass / 0 fail; exit 0 | `07-probe-ledger-privacy.txt` |
| `node pf-supplement.mjs` (attempt-1 probe) | 6 / 0; S6 and S7 unchanged; exit 0 | `09-probe-supplement.txt` |
| `node pg-holiday-preview-privacy.mjs` on a3d1b65, then on 8fae685 | a3d1b65: nothing inferable, nothing written; 8fae685: leak reproduced; exit 0 | `10-…`, `10b-…` |
| `node pg2-admin-differential.mjs` (attempt-1 A2 probe, unchanged) | 25 / 0; 27/27 identical; the payroll exception is now "same" across worlds (attempt 1: differed); exit 0 | `13-probe-admin-differential.txt` |
| `node pe-payroll-differential.mjs` (new probe) on a3d1b65, then on f79413b | a3d1b65: 20 / 0, 30/30 identical, exit 0; f79413b control: 17 / 3 as expected, exit 1 | `16-…`, `16b-…` |
| `git diff` / `git grep` scans | see file | `11-static-scans.txt` |
| `git rev-parse HEAD`; digest (clone and project) | unchanged a3d1b65 / 5b370621…8581; exit 0 | `12-digest-after.txt` |
| workflow Python `validate_package.py --preflight`; `validate_orchestration.py` | PASS / PASS; exit 0 | `14-preflight.txt` |
| the same validators after writing this report, the brief result and the evidence | PASS / PASS; exit 0. A later re-run gave exit 1 only on `WP2_RECHECK_B3.md`, the concurrent WP2-AUDIT-B3 report, whose translation did not exist yet. The final re-run, after that translation appeared, passed (56 pairs, 930 links). | `14b-preflight-after-writes.txt` |
| `node scripts/precommit-check.mjs` (clone index with only this task's outputs staged), two runs | PASS, 0 blocking, 0 warnings; exit 0 | `15-precommit-check.txt` |
| worktree and scratch removal; HEAD and digest re-checked (project folder) | removed; a3d1b65 / 5b370621…8581 unchanged; exit 0 | `17-cleanup.txt` (written after the clone was gone, so it was scanned with grep instead of the precommit gate) |

- **Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:** no blocking finding. One non-blocking observation:
  - **WP2-A3-01 | Info (forward-looking privacy note; non-blocking) | `src/server/services/calendars.ts:335-344` (`createPayrollException` audit payload: owner null at 337, `before` at 342, `after` at 343).**
    - Reproduction: `16-probe-payroll-differential.txt`, lines "audit W0" and "audit W1".
    - Expected/actual: as the fix intends, the `payroll_exception.create` audit event keeps `refreshed_pay_period`. It also keeps the stored row: the whole row as `before` and the refreshed row as `after.pay_period`. The flag is false in the world without timesheets and true where employees have them. The event has `owner_user_id` null, and no route reads ownerless events. `history.ts:66` filters on `owner_user_id = ?`, and the admin and employee histories do not list the event (S4, S5). So nothing is exposed today.
    - Why it is recorded: a later package might add an admin audit-log view, an export or a support tool. Shown raw to an administrator, this payload would reopen the WP2-A2-02 signal per pay period.
    - Required change: none now. When WP3 or WP4 adds any administrator-visible audit view, it must redact `refreshed_pay_period`, `before` and `after.pay_period` of `payroll_exception.create`, or apply the docs/03 "separate explicit permission".
- **Verified behaviour (no defect found):**
  1. **WP2-A2-02 resolved.**
     - Code: `POST /api/admin/payroll-exceptions` answers 201 with `{payroll_exception}` only (`admin.ts:169-171`). The service returns `{exception}`. The exception object holds only calendar fields: calendar ID, nominal payroll date, payroll date, due date and time, reason and `created_at`.
     - Differential (`16`), with two worlds that have the same seed and clock. In W0 no employee is active. In W1 two employees edit days in four pay periods, so stored rows exist for 10-02, 10-16, 10-30 and 11-13; the administrator does nothing personal. The administrator sends the same 10 requests in both worlds. They cover the current period with a new due date, the next period with only the deadline moved, a past period, a period with a row created by an explicit label, a period without a row, a duplicate (409), a blank reason (422), a non-payroll date (422), a move beyond half a cycle (422) and an unknown calendar (404). The 20 admin reads afterwards are calendar, periods, current period, five own timesheets, three days, policies, history, OT and health. All 30 responses are byte-identical after UUID masking (P1).
     - Every 201 has exactly the key `payroll_exception` (P3). No admin response contains "refreshed", `pay_period_id` or an employee ID outside the account list (P5).
     - The fix keeps the E-10 behaviour. In W1 the stored rows really are refreshed: 10-16 → 10-15 with due 10-13, 10-30 due 10-27 09:00, 10-02 → 10-01, 11-13 → 11-12 (S1). W0 gets no stored row (S2). Integrity is ok.
     - Sensitivity: the same probe on f79413b shows `refreshed_pay_period` false → true for X1–X4 (`16b`). Even there, all reads after the exception were identical, so the leak was in the 201 field alone.
     - Regression test: the new differential test, together with the three key-set assertions, fails on the f79413b source (4 failed, `04b`) and passes on a3d1b65 (`04`). Its fixture B also lets the admin edit. The probe's W1 world, where only employees edit, closes that gap.
     - The attempt-1 A2 probe now reports the exception as "same" across worlds. In attempt 1 it differed on `refreshed_pay_period` false → true (`13`, W section).
     - Rule-8 guard re-checked: no canonical text requires showing the refresh. Docs/10 E-10 only says unfinalized rows are refreshed and finalized rows refused (`11` §5). The client never used the field (`11` §3), and the browser test for the payroll-exception screen passes on both projects (`05`).
  2. **The finalized 409 is kept (E-10)** (`16` F0–F6, on a copy of W1 taken before the administrator acted):
     - With the employee's timesheet for payroll 10-16 finalized (a direct UPDATE, as WP3 will set it), the request answers 409 `period_finalized`.
     - It writes nothing: no exception, no audit event, and stored rows unchanged.
     - Its details are `{period_start, period_end}` only (2026-09-28, 2026-10-11), with no count and no identity.
     - One versus two finalized timesheets give a byte-identical refusal.
     - An exception for another, unfinalized period still answers 201 with the same body as in W1.
  3. **WP2-A-01 stays resolved.**
     - Code: `holidayImport.ts` and `holiday-import.test.ts` are unchanged in the fix range.
     - The attempt-1 probe infers nothing and writes nothing (`10`). The same probe on 8fae685 still reproduces the leak (`10b`).
     - The A2 differential probe (`13`):
       - 27/27 admin responses are byte-identical before and after two employees record sessions, explicit labels, leave, a Clock in, a credit and a reservation.
       - Previews carry no identity, personal label or count key.
       - `finalized_conflicts` is `{date}` only and period-level, and is identical for one or two finalized timesheets.
       - The commit is refused with 409 `finalized_period_affected` and date-only details.
       - Commit behaviour (C1–C6, W1, W2) is unchanged.
     - The regression test passes (29/29, `04`).
  4. **No area-A regression.**
     - Ledger/privacy probe 119/0 (`07`): ledger trace, label-independent spend, corrections and R-05 pending, append-only triggers, route inventory, CSV, history, ownership, and no password or hash in any response.
     - Supplement 6/0 (`09`).
     - Multi-process race (`06`, `06b`): 770 production rounds with 0 violations, with the control always double-booking.
     - Targeted tests: 267 passed (`04`). The browser specs: 24 passed (`05`).
     - `npm run verify` exit 0 with no deprecation output (`03`). Preflight PASS (`14`).
  5. **WP2-A2-01 (attempt-1 Info) resolved in code.** `admin.ts:48-50` and `isolation.test.ts:280` now say "calendar-only fields" and "no employee-derived count". No "aggregate count" remains in `src/`, `tests/` or `docs/` (`11` §4). As briefed, `WP2_HANDOFF.md:41` still lists "affected days, preserved overrides"; the acceptance step corrects it.
- **Risks and optional improvements, separate from proven defects:**
  - R1 (Info, unchanged): `postCorrection` duplicate branch ignores `sourceRef`. S6 still shows correction → `duplicate` versus credit → `source_key_conflict`, and `ledger.ts` is unchanged. Non-blocking.
  - R2 (Info, unchanged): a policy note with a leading space before `=` is exported raw (S7); `otEvidence.ts` is unchanged. Non-blocking.
  - R3 (Info, coordinator decision CALFIX, unchanged): `calendar_in_use` 409 (`users.ts:167`) reveals whether an account has any data. `users.ts` is unchanged. Non-blocking.
  - R4 (carry-forward to WP3, unchanged):
    - WP3 must persist and handle the `pending` correction and debit results (`ledger.ts:114,128,408,460`).
    - WP3 must also drop provisional minutes at finalization.
    - History wording for system-origin postings is cosmetic.
    - `ledger.ts` and `timesheets.ts` are unchanged. Non-blocking.
  - ADV-A-05 (Info, backlog) unchanged.
  - Accepted coarse signals, not defects:
    - The finalized 409 `period_finalized` tells the administrator, per pay period, that some finalized timesheet exists. E-10 requires the refusal, and the brief keeps it. It carries no count and no identity.
    - `finalized_conflicts` is the same kind of period-level signal, allowed by the coordinator decision of 2026-10-04.
  - WP2-A3-01 above.
  - WP2-FIXB2's season-independent R-07 e2e and the CSS tokens are area B; WP2-AUDIT-B3 rechecks them. This audit only confirmed that they touch no area-A path and that `zoneOracle.ts` is imported only by tests.
- **Required gates unrun/blocked and why:**
  - None in area A.
  - Not run by design:
    - WP1 → WP2 upgrade probe: the fix range changes no migration or persistence code, and WP2-GATE3 re-ran the migration upgrade.
    - Full e2e suite: WP2-GATE3 ran 74 passed and 2 skipped; area B covers the other flows.
    - WP3/WP4 paths: finalization, PDF, signatures, email, deployment.
  - No probe failed on a probe bug in this attempt, and every run is kept.
- **Disposition of previous findings:**
  - WP2-A-01: stays fixed on a3d1b65.
  - WP2-A2-02: fixed and verified. The answer is identical with and without employee timesheets, and the finalized 409 is kept.
  - WP2-A2-01: fixed in code; the handoff wording is deferred to the acceptance step as briefed.
  - R1–R4 and ADV-A-05: remain non-blocking.
  - Attempt-1 verified behaviour: re-confirmed by the reduced probe set.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness: area A of WP2 passes on a3d1b65 / 5b370621. Package acceptance also needs WP2-AUDIT-B3.
  - Owner permission for real sending or deployment: none requested or given.
  - Pilot result: none.
- **One next action/prompt:** the coordinator records this PASS on the board. When WP2-AUDIT-B3 also passes, it dispatches the WP2 accept step. That step corrects `WP2_HANDOFF.md:41` and can carry WP2-A3-01 into the WP3 backlog.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - Review: WP2-AUDIT-A2 attempt 2; reviewer `a4b3acc53273ed5e2` (board). The attempt-1 reviewer was `a09f7f19da91a5f11`, a different agent.
  - Reviewed fix author (board): WP2-FIXB2 `a908ddae97aaffe5a`. Earlier fix authors were WP2-FIXA `aa3af6ddfb57e0a19` and WP2-FIXB `afdfdb7208db48436`.
  - Earlier WP2 authors, as listed in WP2_REVIEW_A: T01–T13, ADVFIX, CALFIX, T09A/B, DEC, INFRA1.
  - Committers (WP2-FIXB2-FREEZE `ab84d5b84b7b03680`), verifiers (WP2-GATE3 `a412e4ac65755cb7c`) and planners were not treated as authors.
- **Fresh context; confirm reviewer did not author changes:** fresh context. The reviewer authored no change in WP2 and no earlier WP2 review, and edited no source. Every task report was treated as a claim and re-executed or probed. The red-check copied one test file into a scratch worktree only and restored it. The clone's tracked tree stayed clean.
- **Source digest before/after; gate evidence for that snapshot:**
  - Digest `5b370621e7d3b9f292e8facebb1f0f6e9307a40cbda3a9f87b7dd61924298581` and HEAD `a3d1b65` before and after (`01`, `12`).
  - Gate: WP2-GATE3 (`handoff/delivery/evidence/WP2-GATE3/`), verifier PASS on the same commit and digest.
- **New report path preserving previous review history:** `handoff/delivery/WP2_RECHECK_A3.md` and `.vi.md` are new files. WP2_REVIEW_A, WP2_RECHECK_A and their evidence folders (`WP2-AUDIT-A/`, `WP2-AUDIT-A2/`) are untouched. Evidence: `handoff/delivery/evidence/WP2-AUDIT-A2-a2/`.
- **Finding dispositions and next coordinator fix/recheck task:**
  - WP2-A-01, WP2-A2-01 (code) and WP2-A2-02: closed.
  - WP2-A3-01 (Info): non-blocking, a backlog note for any future admin audit view.
  - R1–R4 and ADV-A-05: non-blocking.
  - No fix task is required from area A.
