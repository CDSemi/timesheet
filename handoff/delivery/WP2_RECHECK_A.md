# Independent review

Translation: [WP2_RECHECK_A.vi.md](WP2_RECHECK_A.vi.md). Previous review (kept unchanged): [WP2_REVIEW_A](WP2_REVIEW_A.md). Evidence: `handoff/delivery/evidence/WP2-AUDIT-A2/` (index `00-commands.txt`; masked, LF).

- **Package/date/reviewer and observable model/effort:** WP2, fresh recheck of area A (ledger and privacy) after the audit-fix round, task WP2-AUDIT-A2 attempt 1, 2026-10-04 (UTC). Profile `timesheet-auditor`. The board records agent ID `a09f7f19da91a5f11` for this task; the ID is not observable inside the session. Self-reported model `claude-opus-5-5`. Effort requested xhigh; actual effort not observable. The strongest author model in WP2 is opus (WP2-T02, WP2-T03), and WP2-FIXA and WP2-FIXB ran on sonnet, so the reviewer model is not weaker.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `f79413b77e7f745e1eff383f1ad748e7667533da`. This is the WP2-GATE2 `freeze_commit` and equals `origin/main`, so there are no unpushed commits. Source digest `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` (611 files, `handoff/` excluded), equal to the gate digest. It was measured before and after, in the project folder and in the scratch clone; `scripts/source-digest.mjs` in the clone gives the same value. The project working tree had changes under `handoff/` only. Source complete: every check ran in a scratch clone of that commit on the C: drive, outside Dropbox (`01-digest-before.txt`, `12-digest-after.txt`).
- **Decision: PASS / FIX REQUIRED / NOT VERIFIED:** **PASS.** WP2-A-01 is resolved. No admin response or screen now changes when employees record data. The probe compared 27 admin responses before and after employee activity, and all were byte-identical. The responses covered every admin-reachable read, seven holiday previews and three refused commits. The attempt-1 probe now infers nothing. The same probes on the old commit 8fae685 still detect the leak, so they are sensitive. `finalized_conflicts` is a date-only, period-level signal with no count. Commit behaviour is unchanged. The fix round caused no area-A regression. R1–R4 remain non-blocking. Two new non-blocking observations are recorded: WP2-A2-01 (Info, stale wording) and WP2-A2-02 (Low, a pre-existing period-level signal outside the fix range).
- **Scope actually inspected/executed:**
  1. Fix range `8fae685..f79413b` (`11-static-scans.txt`):
     - Server: the fix range changes only `src/server/services/holidayImport.ts`. No migration, route, ledger, leave, history, evidence, authentication or user code changed.
     - Area-A client: the `api.ts` preview types and `HolidayImport.tsx`. The tests are `tests/integration/holiday-import.test.ts`.
     - WP2-FIXB client files (`DayEditor.tsx`, `SessionForm.tsx`, `sessionModel.ts`, `DayFigures.tsx`, `styles.css`): scanned for storage, console, network, admin, ledger and user-ID constructs; none were found.
  2. Admin surface at f79413b: `routes/admin.ts` (all eight routes); `services/holidayImport.ts` (whole file); `services/calendars.ts` (payroll exception); `services/periods.ts`; `HolidayImport.tsx`; `adminModel.ts`. The admin screen was checked in Edge on both viewports.
  3. Sources:
     - Canonical: docs/01 "Initial boundary", docs/03 "Records", docs/06 (privacy leaks block progression).
     - Records: WP2_REVIEW_A with R1–R4 and its probes; the WP2-FIXA and WP2-FIXB results; WP2-GATE2; the board coordinator decision of 2026-10-04 (read-only).
  4. Independent checks:
     - `npm ci` and `npm run verify` with deprecation tracing.
     - 13 targeted test files, with the concurrency file three more times.
     - The new regression test run against the old source (red-check).
     - The admin, isolation and OT-leave browser specs on both projects, plus a temporary preview-screen spec.
     - Attempt-1 probes, unchanged: holiday preview, ledger/privacy, supplement, and the multi-process race with 10 rounds per combination.
     - A new differential probe, with an old-commit control.
     - The package preflight with the workflow Python.
- **Evidence table: command | result/exit | evidence:**

| Command | Result/exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`; `git ls-tree` digest (project and clone) | f79413b; 4c2bd7ef…3528 in both; exit 0 | `01-digest-before.txt` |
| `npm ci --no-audit --no-fund` (clone, Node v24.21.0 by full path) | 144 packages; exit 0 | `02-npm-ci.txt` |
| `NODE_OPTIONS='--trace-deprecation --pending-deprecation' npm run verify` | typecheck, lint, 31 files / 606 tests, build, SMOKE PASSED; 0 deprecation matches; exit 0 | `03-verify.txt` |
| vitest on 13 files (ledger, ot-leave, ot-leave-concurrency, history, evidence-export, isolation, migrations, ot-api, ledger.fixtures, user-admin, holiday-import, payroll-exceptions, adminModel); concurrency ×3; holiday-import verbose | 13 files / 266 tests; 8/8 three times; holiday-import 29/29; exit 0 | `04-targeted-tests.txt` |
| f79413b `holiday-import.test.ts` against the 8fae685 source (scratch worktree) | red as expected: the three new privacy tests fail, 26 pass; exit 1 | `04b-regression-red-on-base.txt` |
| `playwright test` admin, isolation, ot-leave (Edge, built dist) plus temporary `zz-audit-a2.spec.ts` | authors' specs 24 passed (both projects); the temporary spec failed on a spec bug (year field), then passed 2/2 in run 2; exit 1 then 0 | `05a-…-run1.txt`, `05b-e2e-preview-screen-probe.txt`, two `audit-a2-…-synthetic.png` |
| `node pr-race.mjs <clone> <work> 10` (attempt-1 probe, 4 OS processes, one WAL file) | 22 combinations × 10 = 220 rounds, 0 violations; unsafe control double-booked 10/10; integrity ok; exit 0 | `06-probe-multiprocess-race.txt` |
| `node pa-ledger-privacy.mjs` (attempt-1 probe) | 119 pass / 0 fail; exit 0 | `07-probe-ledger-privacy.txt` |
| `node pf-supplement.mjs` (attempt-1 probe) | 6 / 0; S6 and S7 unchanged; S8 counts now absent; exit 0 | `09-probe-supplement.txt` |
| `node pg-holiday-preview-privacy.mjs` (attempt-1 probe) on f79413b, then on 8fae685 | f79413b: nothing inferable, nothing written; 8fae685: leak reproduced; exit 0 | `10-probe-holiday-preview-privacy.txt` |
| `node pg2-admin-differential.mjs` (new probe), three runs; same probe on 8fae685 | run 1 and run 2 had probe bugs (index); run 3: 25 / 0, exit 0; old-commit control: 15 / 10 as expected, exit 1 | `13-…`, `13a-…-run2`, `13b-…-base-control` |
| `git diff` / `git grep` scans | see file | `11-static-scans.txt` |
| `git rev-parse HEAD`; digest; `node scripts/source-digest.mjs` (clone) | unchanged 4c2bd7ef…3528; exit 0 | `12-digest-after.txt` |
| workflow Python `validate_package.py --preflight`; `validate_orchestration.py` | PASS / PASS; exit 0 | `14-preflight.txt` |

- **Findings: severity | file/function | reproduction | expected/actual | rule/AC | bounded fix:** no blocking finding. Two non-blocking observations:
  - **WP2-A2-01 | Info (documentation drift; non-blocking) | `src/server/routes/admin.ts:48-50`, `tests/integration/isolation.test.ts:280`, `handoff/delivery/WP2_HANDOFF.md:41`.**
    - Reproduction: `11-static-scans.txt` §4 and §7.
    - Expected/actual: the admin-router comment and the isolation-test comment still say that the holiday preview/commit and payroll exceptions return "dates, names and aggregate counts". The WP2 HANDOFF still lists "affected days, preserved overrides". The code now returns no employee-derived counts. There is no behaviour impact.
    - Required change (optional, at the next touch of those files or in the WP2 accept handoff): say "dates, names and calendar-only fields; no employee-derived counts".
  - **WP2-A2-02 | Low (privacy hardening; non-blocking; pre-existing, outside the fix range) | `src/server/routes/admin.ts:169` and `src/server/services/calendars.ts:299,323,343`, with `src/server/services/periods.ts:21-27` and `src/server/services/timesheetCommands.ts:90`.**
    - Reproduction: `13-probe-admin-differential.txt`, OBS W3.
    - Expected/actual: `POST /api/admin/payroll-exceptions` returns `refreshed_pay_period`. The value is true when a `pay_periods` row exists, and the first timesheet edit by anyone on the calendar creates that row. The admin therefore learns, per pay period, whether someone on the calendar has edited a timesheet. In the probe the value was false with no employee data and true after employee edits. Identical behaviour on 8fae685.
    - Why non-blocking: the signal is not per day. It carries no count and no identity, and the admin's own edits also create the row. The call is a write: it leaves an audit event and an exception that every user can see, and it works once per nominal date. The admin screen does not show the value. The coarseness is like R3, which the coordinator accepted (CALFIX).
    - Optional hardening for the coordinator or WP3: drop the field from the admin response and keep it in the audit record.
- **Verified behaviour (no defect found):**
  1. **WP2-A-01 fixed.**
     - Attempt-1 probe: the preview now has only `date`, `label_before` and `label_after` per affected day. Nothing is inferable ("none"); audit events stay 12 → 12 and versions 1 → 1 (`10`).
     - Differential probe (`13` A1–A3): two employees record work. The writes are default-labelled sessions on 10-05, 10-07 and 10-08, explicit Sick, Vacation, Worked and Off labels (on holidays too), a running Clock in, a credit and an OT-leave reservation. All 27 admin responses stay byte-identical. They cover users, me, calendar, periods, own timesheet, days, policies, history, OT and CSV, health, previews A–G (current period, future dates, rename and kind change, removal, retroactive, CSV issues, every day of the current period), refused commits and a guessed data route.
     - No preview contains an employee ID, an email, a personal label or a count key.
     - Screen (`05b`, screenshots): the preview section's text is identical before and after the employee records a session and a Vacation label. Each affected row reads only "date Worked to Holiday", and the screen shows the fixed rule text.
  2. **Regression test.** The test "answers identically whether or not employees have day entries on the affected dates (WP2-A-01)" compares the whole body with `toEqual` and checks for no identities and no count keys. With the date-only finalized test, it fails on the 8fae685 source (`04b`: 3 failed) and passes on f79413b (`04`).
  3. **`finalized_conflicts`** (`13` F1–F5):
     - Entries are `{date}` only. The admin view is identical with one or with two finalized timesheets, so it carries no count.
     - The signal is period-level: with the current period finalized, all 14 changed dates are listed, including days with no entries.
     - `can_commit` is false and `preview_hash` is null.
     - The commit is refused with 409 `finalized_period_affected`, and the details are `{conflicts:[{date}]}`.
     - Previews outside the finalized period are unaffected.
     - The coordinator decision allows a date-only signal.
  4. **Commit behaviour unchanged.**
     - Code: in the fix range, `commitHolidayImport` and `resultHash` are untouched; only the finalized-conflict type lost its count.
     - Probe (`13` C1–C6, W1, W2; identical on 8fae685 in `13b`):
       - `preview_hash` equals an independent sha256 of the canonical result.
       - A commit gives 201 and writes exactly one calendar version and one audit event, with the import summary. `day_entries` and sessions are byte-unchanged.
       - The same request after its own commit is the documented identical re-commit: 200 unchanged, nothing written.
       - A preview made stale by another commit gives 409 `stale_preview`, with nothing written.
       - A fresh no-change preview commits as 200 unchanged.
       - After the commit, explicit labels are preserved (Vacation 12-24, Off 12-31), and a default day follows the calendar (12-31 Shutdown).
       - With and without employee data, the commit and deactivate responses are identical (hash masked).
  5. **No area-A regression.**
     - Ledger/privacy probe 119/0 (`07`): ledger trace, label-independent spend, corrections and R-05 pending, append-only triggers, route inventory, CSV, history, ownership, and no password or hash in any of the 160 responses.
     - Supplement 6/0 (`09`).
     - Multi-process race (`06`): 220 rounds with 0 violations; the control double-booked 10/10.
     - Targeted tests (`04`): 266 passed. The authors' isolation and OT-leave browser specs pass on both projects (`05a`).
     - `npm run verify` exit 0 with no deprecation output (`03`). Preflight PASS (`14`).
- **Risks and optional improvements, separate from proven defects:**
  - R1 (Info, unchanged): `postCorrection` duplicate branch ignores `sourceRef`. S6 still shows correction → `duplicate` versus credit → `source_key_conflict`, and `ledger.ts` is unchanged. Non-blocking.
  - R2 (Info, unchanged): a policy note with a leading space before `=` is exported raw (S7); `otEvidence.ts` is unchanged. Non-blocking.
  - R3 (Info, coordinator decision CALFIX, unchanged): `calendar_in_use` 409 (`users.ts:167`) reveals whether an account has any data. `users.ts` is unchanged. Non-blocking.
  - R4 (carry-forward to WP3, unchanged): WP3 must persist and handle the `pending` correction and debit results. It must also drop provisional minutes at finalization. History wording for system-origin postings is cosmetic. `ledger.ts` and `timesheets.ts` are unchanged. Non-blocking.
  - ADV-A-05 (Info, backlog) unchanged.
  - WP2-A2-01 and WP2-A2-02 above.
  - WP2-FIXB's input-zone and CSS changes are area B and are rechecked by WP2-AUDIT-B2. This recheck only confirmed that they touch no area-A path.
- **Required gates unrun/blocked and why:**
  - None in area A.
  - Not run by design:
    - WP1 → WP2 upgrade probe: the fix range changes no migration or persistence code, and WP2-GATE2 step 4 re-ran the migration upgrade.
    - Full e2e suite: WP2-GATE2 ran 74 passed and 2 skipped; area B covers the other flows.
    - WP3/WP4 paths: finalization, PDF, signatures, email, deployment.
  - Probe bugs: there were four, three in the new probe and one in the temporary spec. Each was fixed in the probe or spec only and rerun. Every run is kept, except pg2 run 1, which was shown only in the session (`00-commands.txt`).
- **Disposition of previous findings:**
  - WP2-A-01: fixed and verified on f79413b, using the coordinator option of 2026-10-04 (remove every employee-derived count; date-only finalized signal).
  - R1–R4 and ADV-A-05: remain non-blocking.
  - Attempt-1 verified behaviour: re-confirmed by the reduced probe set.
- **Software readiness, owner permission and pilot result separately:**
  - Software readiness: area A of WP2 passes on f79413b. Package acceptance also needs WP2-AUDIT-B2.
  - Owner permission for real sending or deployment: none requested or given.
  - Pilot result: none.
- **One next action/prompt:** the coordinator records this PASS on the board. When WP2-AUDIT-B2 also passes, it dispatches the WP2 accept step. That step can update the stale wording of WP2-A2-01 in WP2_HANDOFF. The coordinator also decides whether WP2-A2-02 goes to the WP3 backlog.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:**
  - Review: WP2-AUDIT-A2 attempt 1; reviewer `a09f7f19da91a5f11` (board).
  - Reviewed fix authors (board): WP2-FIXA `aa3af6ddfb57e0a19` and WP2-FIXB `afdfdb7208db48436`.
  - Earlier WP2 authors, as listed in WP2_REVIEW_A: T01–T13, ADVFIX, CALFIX, T09A/B, DEC, INFRA1.
  - Committers (WP2-FIX-FREEZE `a478b6cc23befba3d`), verifiers (WP2-GATE2 `a44cc217fb0ba6b27`) and planners were not treated as authors.
- **Fresh context; confirm reviewer did not author changes:** fresh context. The reviewer authored no change in WP2, did not author WP2_REVIEW_A, and edited no source. Every task report was treated as a claim and re-executed or probed. The temporary e2e spec existed only in the scratch clone and was deleted; the clone's tracked tree and digest were unchanged.
- **Source digest before/after; gate evidence for that snapshot:**
  - Digest `4c2bd7eff1079b4825de8791037aafa00b0c36939902c5121584114a0bee3528` and HEAD `f79413b` before and after (`01`, `12`).
  - Gate: WP2-GATE2 (`handoff/delivery/evidence/WP2-GATE2/`), verifier PASS with evidence note F1, on the same commit and digest.
- **New report path preserving previous review history:** `handoff/delivery/WP2_RECHECK_A.md` and `.vi.md` are new files. WP2_REVIEW_A and its evidence `handoff/delivery/evidence/WP2-AUDIT-A/` are untouched. Evidence: `handoff/delivery/evidence/WP2-AUDIT-A2/`.
- **Finding dispositions and next coordinator fix/recheck task:**
  - WP2-A-01: closed.
  - WP2-A2-01 (Info) and WP2-A2-02 (Low): non-blocking, for the accept handoff or the backlog.
  - R1–R4 and ADV-A-05: non-blocking.
  - No fix task is required from area A.
