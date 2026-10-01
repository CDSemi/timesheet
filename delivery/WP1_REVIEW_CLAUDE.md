# WP1 review by Claude — Foundation and time calculation

Completed from [REVIEW](../templates/REVIEW.md) with actual evidence. Translation: [WP1_REVIEW_CLAUDE.vi.md](WP1_REVIEW_CLAUDE.vi.md).

> **Not the independent review.** [WP1_REVIEW](../prompts/WP1_REVIEW.md) names ChatGPT Work/Codex (GPT-6.1 Sol, High, Standard) as the operator, and [CLAUDE](../CLAUDE.md) with documents [08](../docs/08_AI_WORKFLOW_AND_BUDGET.md) and [09](../docs/09_IMPLEMENTATION_ROADMAP.md) gives independent review to ChatGPT. Huy asked Claude in chat to run this prompt. Claude Opus 5.5 also implemented WP1, so this is a separate-session cross-check by the same model and may share its blind spots. It does not mark WP1 independently reviewed: [STATE](STATE.json) and [NEXT_ACTION](../NEXT_ACTION.md) are unchanged, and `delivery/WP1_REVIEW.md` stays free for the ChatGPT review.

- **Package/date/reviewer and observable model/effort:** WP1 — Foundation and time calculation. 2026-09-30 (America/Los_Angeles); evidence timestamps are UTC (2026-10-01). Reviewer: Claude Code desktop, local session, for Huy. Model `claude-opus-5-5` (Claude Opus 5.5); the session context reported maximum reasoning effort and no fast mode — confirm in the client. No parallel agents, billing or model changes.

- **Exact reviewed baseline/commit; source completeness:** commit `d5de7b6ceb6bb8eb9262faea0da1db91999188f3` on `main` (parent `32cddd9`, the initial WP1 commit), checked out by a fresh `git clone` outside Dropbox. `npm run digest` gives `0dd3bc889ab247289a137ef5ff483b92258826e5a066e7474e90ecc605c62524` over 541 files, equal to the `git ls-tree` pipeline and to the handoff; the `32cddd9` tree gives `9541dd85…` over 538 files, as the handoff says. Complete: source, lockfile, migration, tests, fixtures, documentation, handoff and its evidence. The owner's working tree also holds one uncommitted change outside the application, `.claude/skills/commit-message/SKILL.md` (agent skill text; working-tree digest `d04f6810…`), which was not reviewed.

- **Decision: PASS (cross-check by Claude; not independent).** No observed defect against the WP1 gate; the AC-02 fixtures (81 of 91, all time/OT/deficit cases) pass and agree with an independent oracle. Three risks need owner decisions (RISK-1…RISK-3 below). Under the project rules WP2 still waits for the independent ChatGPT review unless Huy records an explicit exception.

- **Scope actually inspected/executed:**
  - Documents: AGENTS, CLAUDE, NEXT_ACTION, STATE, DEVELOPMENT, the WP1 handoff, prompts WP1_IMPLEMENT/WP1_REVIEW/FIX_FINDINGS, docs 01, 02, 03, 06, 08 and 09, the fixture guide and all three fixture files.
  - Source traced: all of `src/domain/`, `src/server/` (migration 0001 and its runner, database pragmas, auth, HTTP security/validation/errors, routes, services, seed, config, entry points), `src/client/`, the test harness, all 10 test files and both scripts.
  - Production call path: every calculation the API returns goes through `buildDayView` (`src/server/services/timesheets.ts`) → `computeWorkDay` → `computeDailyOvertime` → `roundToStepMidpointDown`. No other OT or rounding code exists, the client only formats values, and `src/domain` performs no I/O and reads no clock.
  - Executed: the full gate on the clean clone plus four probes written for this review from docs 01 and 02 rather than from the code (sources in [probes](evidence/WP1-review-claude/probes/oracle.mjs.txt)): an independent oracle, API scenarios on fresh migrated databases, raw HTTP against the built server, and payroll-exception edge cases.
  - Not inspected: agent-skill folders, the workbook binary, and Vietnamese translations beyond the validator's pair/ID/link check.

- **Evidence table** (Node 24.21.0, npm 11.18.0, Windows 11 x64, SQLite 3.53.4, ICU 78.3 / tzdata 2026c; logs in [evidence/WP1-review-claude](evidence/WP1-review-claude/environment.txt)):

  | Command | Environment | Exit | Observed result | Evidence |
  |---|---|---:|---|---|
  | `git clone --no-hardlinks`, `git log -1`, `git status` | scratch drive outside Dropbox | 0 | `d5de7b6`, clean tree. The first `git log` exited 128 (the drive records no ownership); git then ran with a per-process `safe.directory` override, no global config change | `environment.txt` |
  | `npm ci --no-audit --no-fund` | clean clone | 0 | 141 packages from the lockfile; no warning or deprecation line | `npm-ci.txt` |
  | `npm run typecheck` | clean clone | 0 | no errors | `typecheck.txt` |
  | `npm run lint` | clean clone | 0 | no findings (`no-deprecated` is an error) | `lint.txt` |
  | `npm test -- --reporter=verbose` with `NODE_OPTIONS="--trace-deprecation --pending-deprecation"` | clean clone | 0 | 10 files, **174/174**: 34 OT-fixture, 33 time-fixture, 17 deficit-fixture, 31 engine, 10 migration, 14 auth, 8 isolation, 14 API, 9 edit-rule, 4 static; no deprecation warning | `test.txt` |
  | `npm run build` (same options) | clean clone | 0 | `dist/domain`, `dist/server`; client JS 228.53 kB | `build.txt` |
  | `npm run smoke` with `SMOKE_PORT=3197` (same options) | built server, 127.0.0.1 | 0 | 13/13 PASS: fresh and repeated migration, seed, 09:00–18:00 on 2026-09-28 = R 480 / credit 0, admin 404, 403 without Origin, logout revokes | `smoke.txt` |
  | `npm run digest`; `git ls-tree … \| sha256sum` | clean clone; owner working tree | 0 | both `0dd3bc88…` (541 files) for `d5de7b6`; working tree `d04f6810…` | `digest.txt` |
  | `node probe-domain.mjs <clone>` | built engine `dist/domain` | 0 | **5,054,727 checks, 0 failures** (details below) | `probe-domain.txt` |
  | `node probe-api.mjs <clone>` | in-process app, fresh migrated SQLite per scenario | 0 | **51 checks, 0 failures**, 3 notes (RISK-1, RISK-2, OPT-1) | `probe-api.txt` |
  | `node probe-http.mjs <clone> <work>` | built server over a real socket, 127.0.0.1:3198 | 0 | **37 checks, 0 failures** | `probe-http.txt` |
  | `node probe-exceptions.mjs <clone>` | built engine | 0 | RISK-3 observation | `probe-exceptions.txt` |
  | `python delivery/validate_package.py --preflight` | clean clone, Python 3.14.6 | 1 | stops in `times()`: no IANA zone data (`tzdata` module absent) — **blocked, not a pass** | `package-validator.txt` |
  | validator `files(True)`, `overtime()`, `ledger()` called directly | clean clone | 0 | 35 English/Vietnamese pairs with equal IDs, 345 local links, 33 OT scenarios, 16 + 10 ledger accounting cases | `package-validator-direct.txt` |

- **Independent recomputation.** The oracle (`probes/oracle.mjs.txt`) uses Hinnant civil-day arithmetic, the statutory US DST rule for America/Los_Angeles, per-UTC-minute date attribution and distance-based rounding; none of it is shared with `src/`.
  - R-04: every R 0…1440 × 17 O values × 180 B/N/M combinations (4,409,471 cases with the named ones) equals `computeDailyOvertime`. Review boundaries with B 480 / N 30 / M 30:

    | Weekday excess E | 30 | 31 | 45 | 46 | 75 | 76 |
    |---|---:|---:|---:|---:|---:|---:|
    | Credit (oracle = engine = API) | 0 | 30 | 30 | 60 | 60 | 90 |

    | Off-calendar O | 15 | 16 | 120 |
    |---|---:|---:|---:|
    | Credit (oracle = engine = API) | 0 | 30 | 120 |

  - R-01/R-03: 12,000 random work dates in eight zone/oracle configurations (Los Angeles with both the statutory rule and ICU, Ho Chi Minh, Santiago with midnight DST, Lord Howe with a 30-minute shift, London, Kolkata, St John's): 1–3 sessions with second-level ends, breaks (some paid, some across midnight), open sessions, unknown breaks and a second calendar version effective mid-shift. Regular/off-calendar seconds and minutes, excess, eligible, credit and per-segment classification all matched. Coverage: 6,026 multi-date days, 136 Los Angeles DST crossings, 6,714 multi-session days, 367 breaks across midnight, 2,957 days with a segment classified by the later calendar version. The probe would have caught per-session flooring in 2,270 trials and `Math.round` ties in 127.
  - R-07 local times: every minute of eight days (the 2026 and 2027 transition days plus controls). Gaps are rejected (`nonexistent_local_time`), repeated times need a fold or offset (`ambiguous_local_time`), fold 0/1 and offsets −07:00/−08:00 give the statutory instants, and wrong offsets return `offset_mismatch`.
  - FR-02/R-07 periods: every date 2024–2029 — period P−18…P−5, Friday payroll, Tuesday due at 17:00 Los Angeles resolved across DST, current = earliest payroll on or after today, old/current/future relation and reason requirement (30,688 checks).
  - R-02 flexible arrival: 07:00/08:00/09:00 starts give suggested breaks 09:00/11:00/13:30, 10:00/12:00/14:30 and 11:00/13:00/15:30 and finishes 16:00/17:00/18:00. Unconfirmed suggestions keep the day `incomplete_breaks`, a 1-hour shift keeps 60 minutes, and inconsistent reference schedules are rejected.
  - R-05: a 6,480-case deficit grid (attendance only for Worked on a normal date, leave capped at B, unknown stays null).
  - The oracle reproduced 61 fixture expectations: all 28 OT cases, the 17 interval/incomplete time cases and the 16 deficit cases.
  - Explicit gate items through the API (fresh database, seed calendar and policy, expectations from the oracle; TM-01 09:00–18:00 is covered by tests and smoke):

    | Scenario (America/Los_Angeles) | R | O | Eligible | Credit |
    |---|---:|---:|---:|---:|
    | Fri 09:00–17:30 (45 min breaks) + Fri 22:00–Sat 02:30, one work date | 585 | 150 | 255 | 240 (midpoint down) |
    | Wed 20:00–Thu 04:00 into Thanksgiving, break 23:45–00:15 | 225 | 225 | 225 | 210 (midpoint down) |
    | Sat 22:00 PST–Sun 06:00 PDT (spring forward, 7 h elapsed) | 0 | 420 | 420 | 420 |
    | Sun 23:00–Mon 07:00 after spring forward | 420 | 60 | 60 | 60 |
    | Sat 22:00 PDT–Sun 06:00 PST (fall back, 9 h elapsed) | 0 | 540 | 540 | 540 |
    | Sun 20:00–Mon 05:00 after fall back | 300 | 240 | 240 | 240 |
    | Three sessions 180 + 240 + 136 on one weekday | 556 | 0 | 76 | 90 |
    | Two UTC sessions of 4h15m40s each (TM-10 shape) | 511 | 0 | 31 | 30 |
    | 07:00–16:00 with breaks shifted one hour earlier | 480 | 0 | 0 | 0 (deficit 0) |
    | Saturday 15 min / Sunday 16 min / Labor Day 120 min | 0 | 15 / 16 / 120 | 15 / 16 / 120 | 0 / 30 / 120 |

  - AC-01 (`probe-api` section B plus existing tests): GET/PUT/DELETE of another user's session returns a 404 byte-identical to a random missing ID, and the row stays unchanged. The admin's timesheet, day view and totals hold nothing of the employee, and nobody can clock out another user's running session. Eight attempts across all seven write endpoints that add `user_id`, `owner_user_id`, `work_date` or `session_id` are rejected (422). Overlap errors name only the caller's own session, and policy lists and audit actor/owner are per user. Raw SQL cannot move a session owner or a timesheet with day entries to another user.
  - AC-04, WP1 part (`probe-api` sections C and D plus tests): old periods need a reason for day, session, delete and clock-out edits, including a running session whose period became old before clock-out. Current/future drafts need none and finalized timesheets always need one. Audit keeps actor, UTC time, operation, reason and exact before/after including breaks. Stale versions return 409. Policy and calendar versions are append-only and immutable, and results carry the policy and calendar version IDs used.
  - HTTP (`probe-http`): 15 raw traversal paths (encoded dots, backslashes, drive letters, NUL) return only the SPA page. The cookie is `HttpOnly; SameSite=Strict; Path=/`, and API responses carry no-store and CSP. A missing, `null`, wrong-port or trailing-slash Origin and `Sec-Fetch-Site: cross-site` give 403; text/plain and form bodies 415; a 70 kB body 413. Five failed sign-ins give 429 even with the right password (`Retry-After` 900) while another account is unaffected. Production refuses to start without `APP_ORIGINS` and defaults to Secure cookies.

- **Findings (observed defects):** none. Nothing below is a proven violation of a documented rule, and no finding was added to fill the template.

- **Risks for owner decision (not defects):**

  | ID | Severity / when | Where | Reproduction | Observed vs. rule | Bounded fix |
  |---|---|---|---|---|---|
  | RISK-1 | Medium; decide now (WP1 reason semantics) | `resolveSession` (±1-day work-date tolerance, handoff choice 1) with `prepareEdit`, `src/server/services/timesheetCommands.ts` | Clock 2026-10-03T20:00Z (current period 2026-09-28…2026-10-11). `POST /api/days/2026-09-28/sessions` with 2026-09-27 22:00–23:30 Los Angeles, no reason | 201: work lying wholly on old-period date 2026-09-27 is saved on current date 2026-09-28 and credits 90 there without a reason; the same session on work date 2026-09-27 needs one (422 `reason_required`). R-03 says a session *normally* belongs to its starting work date and R-07 requires reasons for old and finalized periods; the docs do not define this exception. After WP3 the same path could move work off a finalized period's last day | Allow only start date = work date or work date + 1 (after-midnight continuation), or also require a reason when the session's reporting-zone start date lies in an old or finalized period; add an API regression test |
  | RISK-2 | Medium; before WP3 | `prospectiveBoundary`/`assertProspective`, `src/server/services/calendars.ts` (policies and calendars) | Clock 2026-09-30T20:00Z, after the 2026-09-29 17:00 deadline. `POST /api/policies` effective 2026-09-14 (N 0, M 15) | 201 without a reason; day 2026-09-15 (08:00–17:40, no breaks) changes from credit 90 to 105. "Current" lasts until payroll, three days after the deadline, so a version created then can change a period WP3 will already have submitted. R-07 wants prospective changes, finalized snapshots never silently rewritten and old corrections on historical rules. Not a WP1 defect: nothing is finalized yet | In WP3, make the earliest effective date the later of the current-period start and the day after the last finalized period (or today); otherwise use the documented retroactive procedure. Test with a finalized period |
  | RISK-3 | Low; with the WP2 settings API | `validatePayrollExceptions`, `src/domain/periods.ts` | Engine: exception moving payroll 2026-10-02 to 2026-09-26 | Accepted; only "within half a cycle" is checked. On 2026-09-27 the current payroll becomes 2026-10-16, so the running period 2026-09-14…2026-09-27 counts as old and today's edits need a reason, and the due date 2026-09-29 stays after payroll (FR-02, R-07). No API or seed creates exceptions in WP1 | Reject a payroll date on or before its period end and a due date after payroll, or record an owner rule; add tests |

- **Observations and optional improvements:**
  - OBS-1: flexible arrival exists only in the engine (`suggestBreaks`, `expectedFinishUtc`); no API or UI uses it yet. WP2 should call these functions instead of re-implementing them.
  - OBS-2: a calendar version is a complete rule set. A later version must repeat every later holiday, or those dates become ordinary weekdays from its effective date (`edit-rules.test.ts` builds one such version). WP2's holiday import should create complete versions and preview the difference.
  - OBS-3: limitations already listed in the handoff and not re-raised: per-process login limiter keyed by socket address (proxy setting in WP4), 7-day absolute sessions without idle timeout, user administration in WP2, databases exercised on Windows only.
  - OPT-1: `session_breaks` has INSERT-only triggers; raw SQL UPDATEs that move a break outside its session or onto another break were accepted. The API never updates break rows (it deletes and inserts), so BEFORE UPDATE triggers would be defense in depth only.
  - OPT-2: `clockOut` ignores `changes` of its version-guarded UPDATE, unlike the other writers. It is safe today because the read and the write share one IMMEDIATE transaction.
  - OPT-3: a JSON body without `Content-Type` is accepted, since `requireJsonContentType` rejects only a present non-JSON type. CSRF stays blocked by the exact Origin check and SameSite=Strict; requiring `application/json` whenever a body is present would match the rule's comment.
  - OPT-4: `validate_package.py --preflight` needs the Python `tzdata` package on this host (`pip install tzdata`). It was not installed here because a download needs the owner's approval.

- **Required gates unrun/blocked and why:** the Python validator's `times()` (blocked: no IANA data; the same fixtures ran in Vitest and in the oracle, which is not a validator pass); Linux x64/arm64, Docker and NAS (WP4); ledger scenarios LG-01…LG-10 and AC-03 concurrency (WP2 by design); browser flows (outside the WP1 gate; the built client was only served and checked for CSP and fallback); **the independent ChatGPT review itself**.

- **Disposition of previous findings:** no earlier review exists. Handoff self-fixes rechecked: absent audit before/after states are SQL NULL; the limiter prunes expired windows (test); the Dropbox warning matches a whole path segment (`src/server/index.ts`); no deprecated React `FormEvent` remains (lint clean); the digest is platform-independent (reproduced); the validator skips tooling folders (35 pairs).

- **Software readiness, owner permission and pilot result separately:** software — the WP1 foundation meets its gate in this cross-check, with no editor UI, ledger, PDF, email or Docker yet, as scoped; owner permission — none needed or used (no deployment, sending, real data or billing change); pilot — not applicable before WP5.

- **One next action/prompt:** give ChatGPT Work/Codex commit `d5de7b6` for the independent [WP1_REVIEW](../prompts/WP1_REVIEW.md), as in [NEXT_ACTION](../NEXT_ACTION.md) section 5, without this report so its conclusions stay independent. Then send every accepted item — its findings and any of RISK-1…RISK-3 Huy accepts — to Claude in one [FIX_FINDINGS](../prompts/FIX_FINDINGS.md) round.

To rerun the probes: copy `evidence/WP1-review-claude/probes/` outside the repository and drop the `.txt` suffix (it keeps the files out of the lint gate). In a clone of the reviewed commit run `npm ci && npm run build`, then with Node 24: `node probe-domain.mjs <clone>`, `node probe-api.mjs <clone>`, `node probe-http.mjs <clone> <empty-dir>` and `node probe-exceptions.mjs <clone>`. `probe-api` imports the repository's TypeScript test harness directly through Node 24 type stripping.
