# Independent review

Translation: [WP2_RECHECK_A4.vi.md](WP2_RECHECK_A4.vi.md). Previous reviews (kept unchanged): [WP2_REVIEW_A](WP2_REVIEW_A.md), [WP2_RECHECK_A](WP2_RECHECK_A.md) and [WP2_RECHECK_A3](WP2_RECHECK_A3.md). Evidence: `handoff/delivery/evidence/WP2-AUDIT-A2-a3/` (index `00-commands.txt`; masked, LF).

- **Package/date/reviewer and observable model/effort:** WP2, fresh delta re-audit of area A (ledger and privacy) at the new package-final commit, task WP2-AUDIT-A2 attempt 3, 2026-10-04 (UTC). Profile `timesheet-auditor`. The board records agent ID `afb3d9a9fc9587b29` for this attempt; the ID is not observable inside the session. Self-reported model `claude-opus-5-5`. Effort requested xhigh; actual effort not observable. The strongest author model of the reviewed snapshot is opus (WP2-T02, WP2-T03). The fix rounds ran on sonnet: WP2-FIXA, WP2-FIXB, WP2-FIXB2 and WP2-FIXB3. The reviewer model is therefore not weaker.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:**
  - Commit `5fafeaee72509c6110a907458643bf7582dad81a`. This is the WP2-GATE4 `freeze_commit` and equals `origin/main`, so there are no unpushed commits.
  - Source digest `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` (613 files, `handoff/` excluded). It equals the gate digest.
  - The digest was measured before and after, in the project folder and in the scratch clone, with `git ls-tree` and with `scripts/source-digest.mjs`. The project working tree had changes under `handoff/` only.
  - Source complete: every check ran in a scratch clone of that commit on the C: drive, outside Dropbox (`01-digest-before.txt`, `12-digest-after.txt`).
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.**
  - The range `a3d1b65..5fafeae` changes only `src/client/styles.css`, `tests/client/zoneOracle.ts` and `tests/client/zoneOracle.test.ts` outside `handoff/`. It touches no server, ledger, privacy or admin code.
  - WP2-A-01 and WP2-A2-02 stay resolved. The regression smoke reproduces the attempt-2 results.
  - R1–R4 and WP2-A3-01 stay non-blocking.
  - One new optional observation: WP2-A4-01 (Info, tooling). It is not an area-A defect.
- **Scope actually inspected/executed:**
  1. Delta range `a3d1b65..5fafeae`, one commit (`11-static-scans.txt`):
     - Outside `handoff/`, the name-status lists exactly three files. `styles.css` has 81 lines added and 60 removed. `zoneOracle.ts` has 16 added and 5 removed. `zoneOracle.test.ts` has 33 added.
     - These existing paths have no change: `src/server` (including `db/migrations`), `src/domain`, `scripts`, `docs`, `tests/integration`, `tests/domain`, `tests/e2e` and `tests/support`. In `src/client` only `styles.css` changed, so `api.ts`, the screens and the components are unchanged. `package.json` and `package-lock.json` are unchanged too.
     - `zoneOracle.ts` imports nothing. Only `zoneOracle.test.ts` and `tests/e2e/day-editor.spec.ts` import it. The change makes `instantOfWallTime` throw on a DST fold as well as a gap. That is area B (WP2-B3-02).
     - In `styles.css` the removed and added lines are token substitutions. The new tokens hold the same values, for example `opacity: 0.6` became `var(--opacity-disabled)` with `--opacity-disabled: 0.6`. The change adds no `url()`, `@import` or `content:` construct. No `display` or `visibility` rule changed. Whether the computed values are identical is for WP2-AUDIT-B4 to verify.
     - The cited lines of the earlier findings are unchanged: `admin.ts:169-171`, `calendars.ts:335-344`, `holidayImport.ts:232`, `users.ts:167`, `history.ts:66`, and the files of `ledger.ts`, `otEvidence.ts` and `timesheets.ts`.
  2. Sources: AGENTS.md (read from disk), the brief "Attempt 3" section, WP2_RECHECK_A3 with its evidence, the WP2-FIXB3 result and evidence list, the WP2-GATE4 record, and the board entries (read-only, for the author models and IDs).
  3. Independent checks:
     - `npm ci` and `npm run verify` with deprecation tracing.
     - The 13 targeted area-A test files, with the concurrency file three more times.
     - The admin, isolation and OT-leave browser specs on both projects.
     - Probes reused unchanged as a regression smoke: holiday preview (attempt 1), A2 admin differential, payroll-exception differential (attempt 2), ledger/privacy, supplement, and the multi-process race with 220 production rounds.
     - The package preflight with the workflow Python.
- **Evidence table: command | result/exit | evidence:**

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `git ls-tree` digest; `scripts/source-digest.mjs` (project folder) | 5fafeae = origin/main; e61fa914…14df (613 files); exit 0 | `01-digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, Node v24.21.0 by full path) | 144 packages; exit 0 | `02-npm-ci.txt` |
| `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify`, run 1 | typecheck, lint, 32 files / 613 tests and build passed. The smoke stopped at "built server starts" with an unsettled top-level await; exit 13. Another process held the default smoke port 3100 (see WP2-A4-01). | `03a-verify-run1-smoke-port-collision.txt` |
| Reproduction: a plain HTTP listener on port 3198, then `SMOKE_PORT=3198 node scripts/smoke-built-server.mjs` | the same signature, exit 13. The cause of run 1 is environmental. | `03b-smoke-port-collision-repro.txt`, `probes/occupy-port.mjs.txt` |
| `SMOKE_PORT=3197 NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify`, run 2 | typecheck, lint, 32 files / 613 tests, build, SMOKE PASSED; no deprecation output (the only match is the echoed command); exit 0 | `03-verify.txt` |
| vitest on 13 area-A files; concurrency ×3; payroll-exceptions, holiday-import and zoneOracle verbose | 13 files / 267 tests; 8/8 three times; payroll-exceptions 13/13; holiday-import 29/29; zoneOracle 6/6; exit 0 | `04-targeted-tests.txt` |
| `playwright test` admin, isolation, ot-leave (Edge, built dist) | 24 passed on both projects; exit 0 | `05-e2e-admin-isolation-ot-leave.txt` |
| `node pr-race.mjs <clone> <work> 10` (attempt-1 probe, 4 OS processes, one WAL file) | 220 production rounds, 0 violations; the unsafe control double-booked 10/10; integrity ok; exit 0 | `06-probe-multiprocess-race.txt` |
| `node pa-ledger-privacy.mjs` (attempt-1 probe) | 119 pass / 0 fail; exit 0 | `07-probe-ledger-privacy.txt` |
| `node pf-supplement.mjs` (attempt-1 probe) | 6 / 0; S6 and S7 unchanged; exit 0 | `09-probe-supplement.txt` |
| `node pg-holiday-preview-privacy.mjs` (attempt-1 probe) | nothing inferable, nothing written; identical to attempt 2; exit 0 | `10-probe-holiday-preview-privacy.txt` |
| `node pg2-admin-differential.mjs` (A2 probe) | 25 / 0; 27/27 identical; exit 0 | `13-probe-admin-differential.txt` |
| `node pe-payroll-differential.mjs` (attempt-2 probe) | 20 / 0; 30/30 identical; exit 0 | `16-probe-payroll-differential.txt` |
| `git diff` / `git grep` scans | see file | `11-static-scans.txt` |
| `git rev-parse HEAD`; digest (clone and project) | unchanged 5fafeae / e61fa914…14df; exit 0 | `12-digest-after.txt` |
| workflow Python `validate_package.py --preflight`; `validate_orchestration.py` | PASS / PASS; exit 0 | `14-preflight.txt` |
| the same validators after writing this report, the brief result and the evidence; precommit gate on the clone index with only this task's outputs staged | see file | `14b-preflight-after-writes.txt`, `15-precommit-check.txt` |

- **Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:** no blocking finding and no area-A defect. One optional observation:
  - **WP2-A4-01 | Info (tooling robustness; optional improvement; non-blocking; pre-existing, outside the range and outside area A) | `scripts/smoke-built-server.mjs:11,102-112`.**
    - Reproduction: `03a` (in the real run) and `03b` (reproduced with a listener on the smoke port).
    - Expected/actual: when another process already listens on the smoke port (default 3100), the health loop at lines 105-107 accepts the foreign listener's answer. The spawned server cannot bind and writes nothing to stdout. The `await firstLine` at line 112 then never settles, and Node ends with exit 13 ("unsettled top-level await") and no FAIL line naming the cause. Running two audits at once on one host makes this likely.
    - Rule: AGENTS.md rule 5 (recorded results must be real). The gate does not pass falsely, because the exit code is non-zero, but the failure reads like a product defect.
    - Required change: none for WP2. Optional for a later tooling task: pick a free port, as `tests/e2e/fixtures.ts` already does, or fail fast on the child's `exit` or `error` with its stderr. Until then, a concurrent run can set `SMOKE_PORT`.
- **Verified behaviour (no defect found):**
  1. **The delta touches no area-A path** (`11` §1-3, 8-11). The only server-visible artefacts are unchanged. The client change is the stylesheet alone. The oracle is a test-only helper that imports no product code.
  2. **WP2-A2-02 stays resolved** (`16`, `04`, `05`):
     - `admin.ts:169-171` still answers 201 with `{payroll_exception}` only.
     - Differential: the 10 payroll-exception requests and the 20 admin reads after them are byte-identical in the world without employee timesheets and in the world with them (30/30, P1). Every 201 has exactly the key `payroll_exception` (P3) and calendar-only fields (P4). No admin response contains "refreshed", `pay_period_id` or an employee ID (P5).
     - The stored rows really are refreshed in W1 (S1). W0 gets no stored row (S2).
     - The finalized 409 `period_finalized` is kept (F1). It writes nothing (F2), carries period dates only (F3), and is identical for one or two finalized timesheets (F4).
     - The regression test "answers the same success body whether or not employees have timesheets in the period (WP2-A2-02)" passes (13/13), and so does the payroll-exception browser test on both projects.
  3. **WP2-A-01 stays resolved** (`10`, `13`, `04`):
     - The attempt-1 holiday-preview probe infers no date and writes nothing (audit 12 → 12, versions 1 → 1). Its output is identical to attempt 2.
     - The A2 differential: S0 and S1 give 27/27 identical admin responses before and after two employees record data. `finalized_conflicts` is `{date}` only and period-level (F2, F3), and one versus two finalized timesheets give 27/27 identical responses (F1). The commit is refused with 409 `finalized_period_affected` and date-only details (F5), and commit behaviour C1-C6 is unchanged.
     - Regression tests pass (holiday-import 29/29), including "answers identically whether or not employees have day entries on the affected dates (WP2-A-01)". The browser test "an admin cannot open employee data through any admin screen" also passes on both projects.
  4. **No area-A regression:**
     - Ledger/privacy probe 119/0 (`07`) and supplement 6/0 (`09`).
     - Race: 220 production rounds with 0 violations, and the control double-booked 10/10 (`06`). This covers AC-03, R-05 and R-06.
     - Targeted tests: 267 passed (`04`). Browser specs: 24 passed (`05`).
     - `npm run verify` exit 0 with no deprecation output (`03`). Preflight PASS (`14`).
- **Risks and optional improvements, separate from proven defects:**
  - R1 (Info, unchanged): the `postCorrection` duplicate branch ignores `sourceRef`. S6 still shows correction → `duplicate` versus credit → `source_key_conflict`, and `ledger.ts` is unchanged. Non-blocking.
  - R2 (Info, unchanged): a policy note with a leading space before `=` is exported raw (S7). `otEvidence.ts` is unchanged. Non-blocking.
  - R3 (Info, coordinator decision CALFIX, unchanged): the `calendar_in_use` 409 (`users.ts:167`) reveals whether an account has any data. `users.ts` is unchanged. Non-blocking.
  - R4 (carry-forward to WP3, unchanged):
    - WP3 must persist and handle the `pending` correction and debit results (the race still shows `pending` in R10-R12).
    - WP3 must also drop provisional minutes at finalization.
    - History wording for system-origin postings is cosmetic.
    - `ledger.ts` and `timesheets.ts` are unchanged. Non-blocking.
  - WP2-A3-01 (Info, forward-looking, unchanged): the `payroll_exception.create` audit payload (`calendars.ts:335-344`) keeps `refreshed_pay_period` and the stored row. The event is ownerless. The admin and employee histories do not list it (S4, S5 in `16`), and `history.ts:66` still filters on `owner_user_id = ?`. Any future administrator-visible audit view must redact it. Non-blocking.
  - ADV-A-05 (Info, backlog): unchanged.
  - Accepted coarse signals, unchanged and not defects: the finalized 409 `period_finalized` and the period-level `finalized_conflicts`.
  - WP2-A4-01 above (tooling, optional).
  - The CSS tokens and the oracle's fold behaviour are area B; WP2-AUDIT-B4 rechecks them.
- **Required gates unrun/blocked and why:**
  - None in area A.
  - Not run by design:
    - WP1 → WP2 upgrade probe: the range changes no migration or persistence code, and WP2-GATE4 re-ran the migration upgrade.
    - Full e2e suite: WP2-GATE4 ran 74 passed and 2 skipped. Area B covers the other flows.
    - Controls on older commits: the probes are unchanged and their sensitivity controls were shown in attempts 1 and 2. This delta changes no server code, so a control adds no information.
    - WP3/WP4 paths: finalization, PDF, signatures, email, deployment.
  - Verify run 1 failed on the smoke port only. Run 2 on a free port passed, and both runs are kept.
- **Disposition of previous findings:**
  - WP2-A-01: stays fixed on 5fafeae.
  - WP2-A2-02: stays fixed. The answer is identical with and without employee timesheets, and the finalized 409 is kept.
  - WP2-A2-01: fixed in code at a3d1b65 and unchanged since. `WP2_HANDOFF.md:41` is still left for the acceptance step.
  - WP2-A3-01, R1–R4 and ADV-A-05: remain non-blocking.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness: area A of WP2 passes on 5fafeae / e61fa914. Package acceptance also needs WP2-AUDIT-B4.
  - Owner permission for real sending or deployment: none requested or given.
  - Pilot result: none.
- **One next action/prompt:** the coordinator records this PASS on the board. When WP2-AUDIT-B4 also passes, it dispatches the WP2 accept step. That step corrects `WP2_HANDOFF.md:41` and can carry WP2-A3-01 and WP2-A4-01 into the backlog.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - Review: WP2-AUDIT-A2 attempt 3; reviewer `afb3d9a9fc9587b29` (board). The attempt-1 reviewer was `a09f7f19da91a5f11` and the attempt-2 reviewer was `a4b3acc53273ed5e2`, both different agents.
  - Reviewed fix author (board): WP2-FIXB3 `a33c20fa0f60a68da`. Earlier fix authors were WP2-FIXA `aa3af6ddfb57e0a19`, WP2-FIXB `afdfdb7208db48436` and WP2-FIXB2 `a908ddae97aaffe5a`.
  - Earlier WP2 authors, as listed in WP2_REVIEW_A: T01–T13, ADVFIX, CALFIX, T09A/B, DEC, INFRA1.
  - Committers (WP2-FIXB3-FREEZE `aadc0ad71deea6050`), verifiers (WP2-GATE4 `a99b6f7545d1ec005`) and planners were not treated as authors.
- **Fresh context; confirm reviewer did not author changes:** fresh context. The reviewer authored no change in WP2 and no earlier WP2 review, and edited no source. Every task report was treated as a claim and re-executed or probed. The clone's tracked tree stayed clean.
- **Source digest before/after; gate evidence for that snapshot:**
  - Digest `e61fa9145dd5786495bba80435e6e27ecec02bf102e1c2e0582330e9000114df` and HEAD `5fafeae` before and after (`01`, `12`).
  - Gate: WP2-GATE4 (`handoff/delivery/evidence/WP2-GATE4/`), verifier PASS on the same commit and digest.
- **New report path preserving previous review history:** `handoff/delivery/WP2_RECHECK_A4.md` and `.vi.md` are new files. WP2_REVIEW_A, WP2_RECHECK_A, WP2_RECHECK_A3 and their evidence folders (`WP2-AUDIT-A/`, `WP2-AUDIT-A2/`, `WP2-AUDIT-A2-a2/`) are untouched. Evidence: `handoff/delivery/evidence/WP2-AUDIT-A2-a3/`.
- **Finding dispositions and next coordinator fix/recheck task:**
  - WP2-A-01, WP2-A2-01 (code) and WP2-A2-02: closed.
  - WP2-A3-01 (Info): non-blocking, a backlog note for any future admin audit view.
  - WP2-A4-01 (Info): non-blocking, an optional tooling improvement for the smoke script.
  - R1–R4 and ADV-A-05: non-blocking.
  - No fix task is required from area A.
