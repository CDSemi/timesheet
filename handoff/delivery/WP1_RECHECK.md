# WP1 independent recheck — F-01 fix and WP1 gate

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WP1_RECHECK.vi.md](WP1_RECHECK.vi.md). Prompt: [WP1_REVIEW](../prompts/WP1_REVIEW.md). Original review with F-01: [WP1_REVIEW](WP1_REVIEW.md), preserved unchanged.

- **Package/date/reviewer and observable model/effort:** WP1 only, recheck task WP1-F01-AUDIT, attempt 1; 2026-10-02 America/Los_Angeles (evidence timestamps 2026-10-03 UTC). Fresh independent auditor subagent under the coordinator. Self-reported model `claude-opus-5-5`. Requested effort xhigh; the actual effort and speed are not observable from inside the session. No client, billing or subscription setting was changed.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** `68bbb31435543329b6c51f29703d9e2e7a4290bf` (WP1-F01-FREEZE), equal to `origin/main`, so no unpushed commit. `npm run digest` gives `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59` over 533 files with `handoff/` excluded. The git ls-tree check and a clean `git archive` export give the same value, which matches the WP1-F01-GATE digest. Before and after the audit the working tree had changes only under `handoff/`. Source was complete: application, migrations, tests, lockfile, reference fixtures and English specifications.
- **Decision: PASS.** F-01 is resolved on this snapshot. The mandatory WP1 gate passes in a clean export, and no new contract violation was found. The worker's residual note does not violate a contract (judgement and rule citations below). Three related behaviours are recorded as risks for WP2, not as defects. This PASS accepts WP1 at this commit and digest.

## Scope actually inspected/executed

Read from disk: AGENTS.md, the task brief, the WP1_REVIEW prompt, the original WP1 review (F-01), English documents [01](../../docs/01_PRODUCT_REQUIREMENTS.md), [02](../../docs/02_TIME_AND_OT_RULES.md), [03](../../docs/03_ARCHITECTURE_AND_DATA.md), [04](../../docs/04_UX_AND_SETTINGS.md), [06](../../docs/06_TEST_AND_ACCEPTANCE.md), [09](../../docs/09_IMPLEMENTATION_ROADMAP.md), and document 08 for audit rules. The fix report and the WP1_HANDOFF fix section were treated as claims, not evidence.

Source traced: [timesheetCommands.ts](../../src/server/services/timesheetCommands.ts) (all session and break write paths), `timesheets.ts` (reads, `toSessionInterval`, day/timesheet views), `domain/workday.ts` and `intervals.ts`, `http/errors.ts`, `http/schemas.ts`, the session/break triggers in migration 0001, the WP1 client Clock out call, and the new regression file. The diff `bfdc1a8..68bbb31` outside `handoff/` changes only `clockOut` (+10/−1) and adds `tests/integration/clock-out-breaks.test.ts`. Since the original WP1 review baseline `70e2257`, `src/`, `tests/`, `reference/`, rule documents 01/02/03, the lockfile and the build/test configuration change only by this fix. The other changes are governance documents, the `precommit-check` script and its package.json entry.

## Evidence table

All commands ran in this audit with the portable Node v24.21.0 and npm 11.18.0, Node 24 first on PATH. Verify and probes used `NODE_OPTIONS=--trace-deprecation --pending-deprecation`. Paths in logs are masked.

| Command | Result / exit | Evidence |
|---|---|---|
| `git rev-parse HEAD`, `origin/main`, `git status`, `npm run digest`, ls-tree hash | 0; HEAD = origin/main = 68bbb31; changes only under `handoff/`; digest c6e24381… (533 files) twice | [before.txt](evidence/WP1-F01-AUDIT/before.txt) |
| `git archive 68bbb31` to scratch outside Dropbox; temporary git index; `node scripts/source-digest.mjs` | 0; 533 source files; digest c6e24381… | [export.txt](evidence/WP1-F01-AUDIT/export.txt) |
| `npm ci` (clean export) | 0; 141 packages, 0 vulnerabilities | [npm-ci.txt](evidence/WP1-F01-AUDIT/npm-ci.txt) |
| `npm run verify` (clean export) | 0; strict typecheck, lint (`no-deprecated`), **11 files / 180 tests**, server and client build, **smoke 13/13**; no deprecation warning | [verify.txt](evidence/WP1-F01-AUDIT/verify.txt) |
| `npm test -- --reporter=verbose` | 0; 180/180: time 33, OT 34, deficit 17, engine 31, migrations 10, isolation 8, edit rules 9, API 14, auth 14, static 4, clock-out 6 | [test-verbose.txt](evidence/WP1-F01-AUDIT/test-verbose.txt) |
| Own probe, freeze build: `node probe.mjs <export> freeze` | 0; **68/68 expectations pass**; 7 observations recorded | [probe-freeze.txt](evidence/WP1-F01-AUDIT/probe-freeze.txt), [source](evidence/WP1-F01-AUDIT/probe-f01-audit.mjs.txt) |
| Same probe, pre-fix baseline `bfdc1a8` (export, `npm ci`, `build:server`) | 0 (record mode); **48 pass / 20 fail**: F-01A 422, F-01B R 541/credit 60 and the related edit, scoping and zero-row checks fail. The probe discriminates F-01 | [probe-baseline.txt](evidence/WP1-F01-AUDIT/probe-baseline.txt) |
| Freeze regression file run against baseline source, then freeze | 1 then 0; baseline 5 failed / 1 passed, freeze 6/6 | [regression-red-green.txt](evidence/WP1-F01-AUDIT/regression-red-green.txt) |
| `git diff` reviews, write-path and client greps | 0; scope as stated above | [diff-review.txt](evidence/WP1-F01-AUDIT/diff-review.txt) |
| Bundled Python 3.12 `validate_package.py --preflight`; fixture arithmetic run separately | 1 on a pre-existing broken directory link in a workflow record (risk 5); the 33 + 32 + 16 + 10 = 91 reference scenarios pass | [validator.txt](evidence/WP1-F01-AUDIT/validator.txt) |
| HEAD, status and digest after the audit | see the provenance section | [after.txt](evidence/WP1-F01-AUDIT/after.txt) |

### Independent recomputation (freeze, fresh migrated synthetic SQLite)

The probe builds its own database, migration, synthetic seed, deterministic clock and in-process app from the built `dist/`. It does not use `tests/support`. Expected values come from elapsed UTC time and an independent nearest-multiple oracle that keeps the lower multiple on a tie.

| Scenario | Expected = observed |
|---|---|
| **F-01A**: open 09:00 LA session with a saved 11:00–11:15 break; Clock out 18:16 LA confirming that break | 200; closed, version 2, one stored break 18:00Z–18:15Z; gross 33,360 s, excluded 900 s, **R 541, E 61, T 61, credit 60**; the GET day agrees; one `work_session.clock_out` audit event (actor = owner = employee, reason null) with before {open, unconfirmed, v1, 1 break} and after {closed, confirmed, v2, 1 break}; timesheet version +1 |
| **F-01B**: the same state, confirming `breaks: []` | 200; no stored break; excluded 0; **R 556, E 76, T 76, credit 90**; the GET day and timesheet reads agree; audit `after.breaks = []` |
| Edit actual at Clock out (11:00–11:20 confirmed) | one break 18:00Z–18:20Z; R 536, T 56, credit 60 |
| Same user, closed 07:00–08:00 session (10-minute break) plus the open session | only the open session's breaks are replaced; morning break kept; one daily B: R 606, T 126, credit 120 |
| Two users, both with open sessions and saved breaks | employee Clock out leaves the admin session, break row IDs and audit unchanged; cross-user GET is 404 both ways; the admin's own Clock out gives R 511, credit 30; a second employee Clock out returns 409 |
| Failure injected after the DELETE (TEMP trigger on the clock_out audit insert) | 500; session still open, v1; **deleted break restored with its original row ID**; no audit; timesheet version unchanged; a retry gives credit 90 |
| Zero-row UPDATE (TEMP trigger `RAISE(IGNORE)`) | **409 `stale_version`**; full rollback as above. The baseline returned 200 and wrote audit and version bumps for an update that did not happen |
| Invalid submitted set (break after the clock-out instant) | 422 `break_outside_session`; session open; saved break kept |
| Unknown Clock out with `breaks: []` | 200; `incomplete_breaks`, all minutes null; saved break kept |
| Engine: 240,300 oracle combinations; weekday 30/31/45/46/75/76 → 0/30/30/60/60/90; off-day 15/16/120 → 0/30/120; 09:00–18:00 with shifted breaks R 480/credit 0; two 4h15m40s sessions → R 511 (not 510)/credit 30; Friday day plus overnight R 360, O 120, credit 120; Monday overnight R 480; spring/fall DST 300/360; DST gap and fold rejection; fold 0/1 → 08:30Z/09:30Z | all match |

## Diff review (standards and specification)

- **Transaction:** the DELETE, UPDATE, break INSERT, day entry, timesheet bump and audit all run inside the existing `writeTransaction` (`better-sqlite3` `.immediate()`). Rollback after the DELETE is proven by fault injection.
- **Ownership:** the DELETE is scoped `session_id = ? AND user_id = ?`, and the session comes from `findOpenSession(ctx.user.id)` ([timesheetCommands.ts:442-444](../../src/server/services/timesheetCommands.ts)). The two-user probe shows no cross-user effect (AC-01).
- **Audit:** the before snapshot is the open session loaded before deletion and the after snapshot is reloaded. Both are verified, with actor and owner (R-07).
- **Version:** the session UPDATE keeps `WHERE version = ?` and now checks `changes === 1` (line 458), consistent with `updateSession`. The branch is exercised by the probe.
- **Ordering:** submitted breaks are validated first (`resolveSession`). Saved rows are deleted only when `breaks_confirmed` is true, before the end-time UPDATE, so the stay-inside trigger cannot fire on rows that are being replaced.
- **No business-rule or engine change:** `src/domain/`, rule documents and fixtures are untouched. Only the persistence command changed. The style matches `updateSession`, the comments are English and cite R-01/R-02, and lint and typecheck pass.

## Residual note judgement (unconfirmed Clock out with non-empty breaks)

Observed (identical on the pre-fix baseline, so not introduced by the fix): with `breaks_confirmed:false`, submitted breaks are added to the saved rows. If one overlaps a saved row, the `session_breaks_no_overlap` trigger returns 422 `overlapping_breaks` with full rollback and the session stays open; an unknown Clock out with `[]`, or a confirmed one, then succeeds. A non-overlapping break is stored next to the saved one. The day stays `incomplete_breaks` and every calculated minute is null.

**Judgement: acceptable, not a contract violation and not a new finding.** Reasons:
- R-01: breaks stay inside and non-overlapping (trigger enforced), and unknown break information remains incomplete with no credit or debit (`workday.ts:91-93`).
- R-02 and document 04 (Editing): every confirming action at Clock out (confirm suggested or actual breaks, or none) now replaces the stored set exactly, as F-01A, F-01B and the edit probe show. Unknown stays different from confirmed zero, and OT stays pending.
- Every path that sets `breaks_confirmed = 1` writes the complete submitted set: `createSession` on a new session, `updateSession` and confirmed `clockOut` by DELETE then INSERT. An unconfirmed union can therefore never reach OT; the follow-up probe confirms via session edit and gets exactly the confirmed set (R 526, credit 60).
- No canonical rule defines how a partial unknown list merges with saved rows. Keeping recorded evidence while unknown changes no OT and deletes nothing. The WP1 client sends only `breaks: []` at Clock out (`TimesheetScreen.tsx:93`).

## Findings

**None.** No observed defect in standards or specification. F-01 is closed (see disposition).

## Risks and optional improvements, separate from proven defects

1. **Unknown partial break lists (residual):** the additive behaviour above is undocumented and differs from the replace semantics of session edit. When WP2 builds break editing and Clock out confirmation, define the contract (additive or replace) and test it, including an echo of saved breaks.
2. **Break rows after "now" on an open session:** the future-time check covers only session start and end ([timesheetCommands.ts:196-199](../../src/server/services/timesheetCommands.ts)), so an open session accepts a break later than now. An unknown Clock out before that break returns 422 `break_outside_session` (trigger `work_sessions_breaks_stay_inside`, migration 0001 lines 227–233). A confirmed Clock out now succeeds. This existed before the fix; it never deducts a future break (R-02) and is reachable only through the API in WP1. WP2: reject such rows or define how Clock out handles them.
3. **Clock out has no `expected_version`:** a confirmed set replaces rows that another client saved after the caller loaded the session; the audit `before` retains them. Before the fix, the same stale view deducted the unseen breaks. Consider `expected_version` on confirmed Clock out when WP2 adds multi-device editing (document 03 "validate version").
4. **Regression strength (optional):** the worker's rollback test fails validation before the DELETE runs; its rollback assertions also pass on pre-fix code, which failed only at the final step. No test exercises the `changes !== 1` branch. The probe proves both behaviours. Optional: add an injected-failure regression and a zero-row regression.
5. **Records outside WP1 source:** `validate_package.py --preflight` stops on a directory link in `handoff/delivery/WORKFLOW_HANDOFF.md` line 65 (`evidence/WF-AUDIT3/`), committed in bfdc1a8. The coordinator should correct this record; it is outside the source digest.
6. Earlier WP1 review risks (historical boundary semantics, payroll exceptions and stored periods, single-process limits, optional DB UPDATE invariants) carry forward unchanged; their source is unchanged.

## Required gates unrun/blocked and why

None of the mandatory WP1 gates was blocked: type check, build, fresh SQLite migration tests, all time/OT fixtures, two-user isolation (including Clock out) and the explicit gate values all ran. Not run, by package scope: browser flows (WP2 gate), ledger and concurrency (WP2/WP3), finalization/PDF/delivery (WP3), Docker/NAS/backup/import (WP4), real deployment and pilot (WP5). Linux execution is not verified. The repository-wide package validator stops on risk 5; only its fixture arithmetic was executed.

## Disposition of previous findings

- **F-01 (P2, R-01/R-02/R-04, FR-06, AC-02): RESOLVED and verified** on 68bbb31 / c6e24381. F-01A returns 200 with one break, R 541 and credit 60. F-01B returns 200 with no break, R 556, E 76 and credit 90. The bounded-fix conditions (replace inside the owner-scoped transaction, audit before/after, rollback, regressions) are met. Confirmed-only replacement is consistent with the rules, as the judgement above explains.
- Original review risks: unchanged status (risk 6).

## Software readiness, owner permission and pilot result

- **Software readiness:** WP1 accepted by independent recheck at 68bbb31 / c6e24381. WP2 may start after the coordinator's accept commit.
- **Owner permission:** none requested or used. Only synthetic local data and in-process requests were used: no sending, deployment, credentials, billing or commits.
- **Pilot result:** none; WP5 pending.

## One next action/prompt

Coordinator: record WP1-F01-AUDIT PASS, run WP1-F01-ACCEPT (accept commit and push), update STATE, NEXT_ACTION and HANDOFF, then dispatch WP2 with risks 1–3 in its brief.

No invented findings or unobserved passes.

## Independent subagent provenance

- **Review task/attempt, reviewer ID and reviewed author IDs:** WP1-F01-AUDIT attempt 1. Reviewer agent ID on the board: `aab85eb01ecc75c80` (assigned by the coordinator; not observable from inside the session). Reviewed authors: WP1-F01-FIX `aaa3e81ab96efd11e` (`claude-sonnet-5-5`, self-reported) and the original WP1 implementation (Claude Code, `claude-opus-5-5`, per WP1_HANDOFF). Audit strength: `claude-opus-5-5` equals the strongest author model.
- **Fresh context; confirm reviewer did not author changes:** fresh context, not forked from the implementer. I authored no change in the reviewed snapshot and changed no source; I wrote only the files listed below.
- **Source digest before/after; gate evidence for that snapshot:** before `c6e24381253c02ac74d1690b7b15aa7e6ac5b31bcd7ee8b8b8d19ca7d7d29c59`, HEAD 68bbb31. After: the same digest and HEAD ([after.txt](evidence/WP1-F01-AUDIT/after.txt)). Gate evidence: WP1-F01-GATE PASS at the same commit and digest, independently rerun here.
- **New report path preserving previous review history:** `handoff/delivery/WP1_RECHECK.md` and `.vi.md`, evidence in `handoff/delivery/evidence/WP1-F01-AUDIT/`, results appended to [the task brief](tasks/WP1-F01-AUDIT.md). WP1_REVIEW and earlier evidence are unchanged.
- **Finding dispositions and next coordinator fix/recheck task:** F-01 resolved; no new finding; no fix task. Next: WP1-F01-ACCEPT.
