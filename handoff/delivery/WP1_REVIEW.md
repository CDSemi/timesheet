# WP1 independent review — Foundation and time calculation

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WP1_REVIEW.vi.md](WP1_REVIEW.vi.md).

- **Package/date/reviewer and observable model/effort:** WP1 only; 2026-10-02, America/Los_Angeles. Codex, local independent reviewer. Exact client model, effort and speed are not observable through this session's tools; no client settings, billing or subscription changes were made. No parallel agents were started, as AGENTS.md requires.
- **Exact reviewed baseline/commit; source completeness:** `70e225711331783452b1cba7e8de7851bc041c4e`, with an initially clean working tree. Complete local application source, manifests/lockfile, migration, tests, reference fixtures, English specifications and implementation handoff were available. WP1 is already in the initial repository commit, so there is no pre-WP1 parent to compare: this review inspects the supplied WP1 snapshot, not a fabricated implementation diff. The independently rerun source digest and separately hashed HEAD tree both equal `63524bd4ee25fb7cf0318a0b0eabc6c46a135f68ecfa1ccc609e6bd91c2a745a` over 521 files, excluding `handoff/`. See [baseline evidence](evidence/WP1-review-codex/baseline.txt).
- **Decision: FIX REQUIRED.** Existing required test commands pass, but F-01 reproduces an implemented API defect that can return incorrect OT and prevent valid Clock out. WP1 is not accepted and WP2 must remain unstarted until the bounded fix and independent recheck pass.

## Scope actually inspected/executed

Authoritative documents read: AGENTS.md; active [WP1_REVIEW prompt](../prompts/WP1_REVIEW.md); [WP1 handoff](WP1_HANDOFF.md); English docs [01](../../docs/01_PRODUCT_REQUIREMENTS.md), [02](../../docs/02_TIME_AND_OT_RULES.md), [03](../../docs/03_ARCHITECTURE_AND_DATA.md), [06](../../docs/06_TEST_AND_ACCEPTANCE.md) and [09](../../docs/09_IMPLEMENTATION_ROADMAP.md). NEXT_ACTION, STATE, DEVELOPMENT, WP1_IMPLEMENT and the REVIEW template establish scope and handoff context. The previous Claude cross-check was consulted after initial source tracing; its claimed passes were not used as new execution evidence.

Critical source inspected: domain calculations, units/date/zone conversion, interval and break validation, attendance/deficit rules, periods, policy/calendar version selection; API routes/schemas/security/auth; SQLite migration and constraints; timesheet read/write, policy/calendar, period, user and audit services; seed/config/entry points; React sign-in and timesheet skeleton; fixture adapters, migration/isolation/history tests and build/test/lint configuration. No production source was changed. Review deliverables and executable evidence were added under `handoff/delivery/` only; generated `dist/` is ignored.

Production path: API day/timesheet reads → `buildDayView` in `src/server/services/timesheets.ts` → `computeWorkDay` → `computeDailyOvertime` → `roundToStepMidpointDown`. The UI formats returned calculations instead of implementing another OT engine. Confirmed breaks are subtracted in the engine; F-01 is a persistence command defect before that engine is called.

## Evidence table

All results below were executed in this review. [Environment](evidence/WP1-review-codex/environment.txt): Windows x64; bundled Node v24.19.0 (within `engines: ^24.11.0`), npm v11.19.1, existing local dependencies. Default Node v26.10.0 is outside the contract and default `npm --version` fails with `MODULE_NOT_FOUND`; neither was used for the gate. `run-gates.ps1` prepends the Node 24 directory to process PATH and invokes the existing npm CLI directly. It sets `NODE_OPTIONS=--trace-deprecation --pending-deprecation`. No deprecation warning was observed in its logs.

Reproduce from the repository root with `& ./handoff/delivery/evidence/WP1-review-codex/run-gates.ps1` and `& ./handoff/delivery/evidence/WP1-review-codex/run-probes.ps1`. The scripts record exact commands and exits. `node npm-cli.js` below means the explicit absolute Node/npm paths in that runner, not the broken default npm command.

| Executed command | Result / exit | Evidence |
|---|---|---|
| `node npm-cli.js ls --depth=0` | 0; all 16 direct dependency versions match the manifest; no missing/invalid direct dependency reported | [dependencies.txt](evidence/WP1-review-codex/dependencies.txt) |
| `node npm-cli.js run typecheck` | 0; strict server, client and test type checks pass | [typecheck.txt](evidence/WP1-review-codex/typecheck.txt) |
| `node npm-cli.js run lint` | 0; configured `@typescript-eslint/no-deprecated` gate passes | [lint.txt](evidence/WP1-review-codex/lint.txt) |
| `node npm-cli.js test -- --reporter=verbose` | 0; 10 test files, **174/174 pass**, including fresh SQLite migration/schema tests, time/OT/deficit fixtures, auth, two-user isolation, API and edit/history tests | [test.txt](evidence/WP1-review-codex/test.txt) |
| `node npm-cli.js run build:server` | 0; TypeScript server/domain build passes | [build-server.txt](evidence/WP1-review-codex/build-server.txt) |
| `node npm-cli.js run build:client` | 0; Vite build passes; client JS 228.53 kB | [build-client.txt](evidence/WP1-review-codex/build-client.txt) |
| `node npm-cli.js run smoke` | 0; **13/13 checks pass**, built server on loopback, fresh/repeated migration, synthetic seed, 480-minute day, admin isolation, Origin rejection, logout revocation | [smoke.txt](evidence/WP1-review-codex/smoke.txt) |
| `node npm-cli.js run digest`; separate HEAD-tree SHA-256 calculation | 0; both digests match the reviewed baseline | [digest.txt](evidence/WP1-review-codex/digest.txt), [baseline.txt](evidence/WP1-review-codex/baseline.txt) |
| `& ./handoff/delivery/evidence/WP1-review-codex/run-probes.ps1` | **1**; 144,180 independent distance-oracle comparisons and 17 explicit engine checks pass; **two manifestations of F-01 reproduce** on fresh migrated SQLite. Exit 1 denotes the reproduced contract failures, not an environment failure | [probe.txt](evidence/WP1-review-codex/probe.txt), [source](evidence/WP1-review-codex/probe.mjs.txt) |
| Bundled Python `handoff/delivery/validate_package.py --preflight` | 0; 36 translation pairs, 379 local links and all 91 reference scenarios pass. This validates documentation/reference arithmetic; `application_tests_executed` is false | [package-validator.txt](evidence/WP1-review-codex/package-validator.txt) |
| Same Python preflight after completing this bilingual review and evidence links | 0; 37 translation pairs, 433 local links, all 91 reference scenarios pass | [package-validator-final.txt](evidence/WP1-review-codex/package-validator-final.txt) |

The final HEAD-tree check is reproducible with [run-baseline.ps1](evidence/WP1-review-codex/run-baseline.ps1). An earlier PowerShell pipeline hashing attempt produced a different serialization digest, `608f3dfa…`; that unsuccessful comparison is retained in [baseline-powershell-attempt.txt](evidence/WP1-review-codex/baseline-powershell-attempt.txt). The independent Node check of the documented sorted LF serialization confirms the source digest; the earlier attempt is not cited as a match.

The build gate was executed as its two actual component scripts; the aggregate `npm run build` and `npm run verify` wrappers were not invoked. This does not omit their constituent WP1 checks. `npm ci` was not rerun: clean dependency installation/reproducibility is unverified in this review. No acceptance result is borrowed from the implementation logs.

## Independent calculation checks and gate coverage

The additional oracle searches candidate multiples by distance, retaining the lower candidate on ties. It shares no production rounding implementation. Explicit interval expectations use fixed UTC instants and manually computed elapsed seconds; the script calls the freshly built production domain code. The API defect probes use the existing harness only for fresh DB/seed, deterministic time and HTTP requests; assertions include actual persisted rows.

| Scenario | Independently expected = observed |
|---|---|
| Weekday excess 30 / 31 / 45 / 46 / 75 / 76, B=480 N=30 M=30 | Credit **0 / 30 / 30 / 60 / 60 / 90** |
| Off-day 15 / 16 / 120 | Credit **0 / 30 / 120** |
| 09:00–18:00, shifted breaks totaling 60 minutes | R=480, O=0, eligible=0, credit=0 |
| Two sessions of 4h15m40s | 30,680 regular seconds → R=511 once; eligible=31, credit=30 |
| Friday 08:00–12:00 plus Friday 22:00–Saturday 02:00 | R=360, O=120, eligible=120, credit=120; one daily B |
| Spring DST Saturday 22:00–Sunday 04:00 | 5 elapsed hours, O=300, credit=300 |
| Fall DST Saturday 22:00–Sunday 03:00 | 6 elapsed hours, O=360, credit=360 |
| LA 2026-03-08 02:30; LA 2026-11-01 01:30 | Gap rejected; ambiguous time rejected without fold; folds resolve to 08:30Z / 09:30Z |

AC-02: all 33 OT, 32 time and 16 deficit reference scenarios ran against production functions in Vitest (81 scenarios; test counts also include suite metadata and extra edges). Flexible arrival, multiple sessions, unknown versus confirmed breaks, invalid intervals, holiday/overnight boundaries and calendar versions are exercised. Pure reference ledger arithmetic in the Python validator is not proof of future ledger services.

AC-01, WP1 endpoints: executed isolation tests reject another user's session GET/PUT/DELETE in both directions, including admin access; confirm separate day/timesheet/policy data; reject supplied owner fields; scope overlap checks and live Clock out to the authenticated owner; inspect audit actor/owner. Auth tests cover private endpoint authentication, token hashing, revocation, expiry and deactivation. PDFs/signatures/ledger are outside WP1.

R-07 / WP1 history: executed tests verify current/future drafts without reason, old unsent and simulated finalized timesheets requiring reason, audit before/after, stale writes, timesheet version changes and immutable policy/calendar history. Policy uses work date; calendar versions use segment date. Saved reporting zone drives grouping and current-period logic. Immutable finalization/PDF snapshots are WP3 and are not certified here.

## Findings

**Standards axis:** no additional proven violation of documented implementation standards found in the inspected scope; strict type/lint checks pass. **Spec axis:** one proven finding, F-01. Findings are not padded with optional code-smell judgments.

| ID / severity | File / function | Expected / actual | Rule / AC | Bounded fix |
|---|---|---|---|---|
| **F-01 / P2, acceptance blocking because it changes OT** | `src/server/services/timesheetCommands.ts`, `clockOut`, lines 425–450, especially line 450 | Submitted actual breaks must become the session's actual break set. Existing rows are retained and new rows appended. Confirming a saved break fails with 422 `overlapping_breaks`; confirming none succeeds but still deducts the old break, reducing credit from **90 to 60 minutes** in the reproduction | R-01 confirmed excluded breaks; R-02 edit actuals / explicitly confirm none at Clock out; R-04 daily OT; FR-06; AC-02 and WP1 interval validation | Within the existing owner-scoped IMMEDIATE transaction, replace the old session break rows with the validated submitted set, as `updateSession` already does. Remove existing rows before updating interval bounds, then insert submitted breaks; preserve before/after audit and rollback on failure. Add integration regressions for both reproductions, empty/unknown confirmation and failure rollback; rerun the WP1 gate |

**Exact reproduction (synthetic data, no UI/editor prerequisite):**

1. Fresh migration/seed, employee login, server clock `2026-09-29T20:00:00Z` (13:00 LA).
2. `POST /api/days/2026-09-29/sessions` with start `{local:"2026-09-29T09:00",zone:"America/Los_Angeles"}`, `end:null`, `input_zone:"America/Los_Angeles"`, `breaks_confirmed:false`, and one excluded break 11:00–11:15 in that zone. The implemented endpoint accepts this (201) and persists the break.
3. Advance server clock to `2026-09-30T01:16:00Z` (18:16 LA). Separately, from identical fresh state:
   - **F-01A:** `POST /api/clock/out` with that same 11:00–11:15 break and `breaks_confirmed:true`. Expected 200, closed session, one break, R=541 and credit=60. Actual 422 `overlapping_breaks`; the transaction rolls back and the session stays open.
   - **F-01B:** `POST /api/clock/out` with `breaks:[]`, `breaks_confirmed:true`. Expected explicit confirmed zero breaks, R=556, E=76 and credit=90. Actual 200 with the old break still stored: R=541, E=61 and credit=60. Audit reflects this unintended retained break set.

Both requests are valid against the exposed WP1 schemas. Existing tests start Clock out from sessions without saved break rows, so their passes do not cover this combination. No fix was applied during review.

## Risks and optional improvements, separate from proven defects

- **Historical boundary semantics:** the ±1-day manual work-date tolerance and the current-period-start boundary for new policy/calendar versions are explicit handoff choices. Source inspection confirms these branches remain. Clarify their treatment of finalized boundaries before WP3, and test immutable snapshots/corrections then. The earlier Claude RISK-1/RISK-2 reproductions were not independently rerun here; they are not additional verified findings.
- **Payroll exceptions and stored periods:** settings must validate exception ordering and reconcile previously materialized period rows. These are prior cross-check/handoff risks for WP2, where the exception API will be implemented; no exception API exists in WP1. Not independently exercised beyond the existing engine tests.
- **Operational limitations:** single-process/socket-keyed login rate limiting and absolute session lifetime need review when deploying behind a proxy in WP4. Windows execution does not verify Linux/NAS behavior. No speculative production permission or secret request is needed now.
- **Optional DB defense:** raw SQL break UPDATE invariants are weaker than INSERT invariants, but the implemented editing API uses delete/insert. This is not a second demonstrated API defect.

## Required gates unrun/blocked and why

No mandatory WP1 command was blocked: type checks, lint, both builds, fresh migrations, every required time/OT fixture and implemented endpoint isolation were executed. Acceptance is blocked by **F-01**, not by lack of execution access. The Python timezone blocker recorded in previous handoffs did not recur with the bundled Python runtime; its full preflight passed here.

Not run: fresh `npm ci`; live browser interactions/visual audit (WP2 browser gate); production ledger posting/concurrency/reservations (WP2/WP3); finalization, sign-off, PDFs, files and delivery (WP3); Docker/Linux/NAS/backup/import (WP4); real deployment/sending/pilot (WP5). Existing HTML/static smoke is not browser-flow evidence. These omissions do not claim readiness for those packages.

## Disposition of previous findings

The implementation handoff says no known remaining defect. Its self-fixes for SQL NULL audit snapshots, expired limiter windows and deprecated React types are covered by the newly executed tests/lint. Source digest and reference-layout paths were independently reproduced. The previous Claude review was a cross-check, not the independent gate; its PASS does not resolve newly reproduced F-01. Its three risk items retain their risk status and are not silently promoted to defects or marked fixed.

## Readiness, permission and next action

- **Software readiness:** WP1 FIX REQUIRED; application source preserved, F-01 unresolved, WP2 not started.
- **Owner permission:** no real deployment/sending authorized or performed; only synthetic local tests and loopback smoke were used. No credentials, billing or Git commit/push changes.
- **Pilot result:** none; WP5 pilot remains pending and no provider/recipient outcome is claimed.
- **One next action/prompt:** give Claude this review with [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), fix **F-01 only** with bounded regressions, save the bilingual updated WP1 handoff, then return for independent WP1 recheck before WP2. The original implementation handoff is preserved; this review is the current gate decision.

The initial review deliverables were subsequently recorded in commit `c9eb8b9e055a25893fb3c80e3cdde5c2d8271bf4`. No production code, canonical business rule or future package was implemented.

**Coordination follow-up, 2026-10-02:** the initial review omitted the status updates. NEXT_ACTION (both languages), STATE, README and DEVELOPMENT now record FIX REQUIRED, unresolved F-01 and the bounded fix → independent recheck sequence. The active prompt is FIX_FINDINGS; WP2 remains unstarted. This follow-up changes documentation only; it does not change the reviewed application or mark F-01 fixed. See [status checkpoint](WP1_STATUS_CHECKPOINT.md) and its recorded validation evidence. Follow-up changes remain uncommitted.
